"""LLM service with LangChain integration and streaming support."""

import logging
from typing import AsyncGenerator, Dict, Any, Optional
import asyncio

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.callbacks.base import AsyncCallbackHandler

from app.config import settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class StreamingCallbackHandler(AsyncCallbackHandler):
    """Custom callback handler for streaming LLM responses."""
    
    def __init__(self):
        self.content_queue = asyncio.Queue()
        self.finished = False
    
    async def on_llm_new_token(self, token: str, **kwargs) -> None:
        """Handle new token from LLM."""
        await self.content_queue.put(token)
    
    async def on_llm_end(self, response, **kwargs) -> None:
        """Handle LLM completion."""
        self.finished = True
        await self.content_queue.put(None)  # Signal completion


class LLMService:
    """LLM service with streaming support using LangChain."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        if not settings.openai_api_key:
            raise AgentExecutionError(
                "OpenAI API key is not configured",
                details={"config_error": "Missing OPENAI_API_KEY"}
            )
        
        # Initialize LangChain ChatOpenAI
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            streaming=True,
            temperature=0.7,
            max_tokens=4000,
        )
    
    async def generate_analysis_stream(
        self,
        query: str,
        search_results: Any,
        web_contents: list,
        session_id: str
    ) -> AsyncGenerator[str, None]:
        """Generate streaming analysis report using LLM."""
        
        try:
            # Prepare context for LLM
            context = self._prepare_analysis_context(query, search_results, web_contents)
            
            # Create system and user messages
            system_message = SystemMessage(content=self._get_analysis_system_prompt())
            user_message = HumanMessage(content=context)
            
            # Create callback handler for streaming
            callback_handler = StreamingCallbackHandler()
            
            # Start LLM generation in background
            llm_task = asyncio.create_task(
                self._generate_with_callback(
                    [system_message, user_message], 
                    callback_handler
                )
            )
            
            # Stream tokens as they arrive
            while True:
                try:
                    # Wait for next token with timeout
                    token = await asyncio.wait_for(
                        callback_handler.content_queue.get(), 
                        timeout=30.0
                    )
                    
                    if token is None:  # Completion signal
                        break
                    
                    yield token
                    
                except asyncio.TimeoutError:
                    self.logger.error("LLM streaming timeout")
                    break
            
            # Ensure the LLM task completes
            await llm_task
            
        except Exception as e:
            self.logger.error(f"LLM analysis failed: {e}", exc_info=True)
            # Yield error message to client
            yield f"\n\n⚠️ **分析生成失败**: {str(e)}\n\n请稍后重试或联系管理员。"
    
    async def _generate_with_callback(self, messages, callback_handler):
        """Generate LLM response with callback handler."""
        try:
            await self.llm.agenerate([messages], callbacks=[callback_handler])
        except Exception as e:
            self.logger.error(f"LLM generation error: {e}")
            await callback_handler.content_queue.put(None)
    
    def _prepare_analysis_context(self, query: str, search_results: Any, web_contents: list) -> str:
        """Prepare context information for LLM analysis."""
        context = f"""请基于以下信息为用户查询生成详细的研究分析报告。

## 用户查询
{query}

## 搜索结果 ({len(search_results.results)} 个结果)
"""
        
        # Add search results
        for i, result in enumerate(search_results.results[:5], 1):
            context += f"""
### 结果 {i}: {result.title}
- **URL**: {result.url}
- **摘要**: {result.summary}
- **来源**: {result.domain}
"""
        
        # Add web content details
        context += f"\n## 详细内容分析 ({len(web_contents)} 个页面)\n"
        
        success_contents = [c for c in web_contents if c.status == "success"]
        for i, content in enumerate(success_contents[:3], 1):
            context += f"""
### 内容源 {i}: {content.title}
- **URL**: {content.url}
- **状态**: {content.status}
"""
            
            if content.summary:
                context += f"- **摘要**: {content.summary}\n"
            
            if content.metadata:
                if content.metadata.author:
                    context += f"- **作者**: {content.metadata.author}\n"
                if content.metadata.publish_date:
                    context += f"- **发布时间**: {content.metadata.publish_date}\n"
                if content.metadata.description:
                    context += f"- **描述**: {content.metadata.description}\n"
            
            # Add content excerpt (limit to avoid token overflow)
            if content.content:
                excerpt = content.content[:1500] if len(content.content) > 1500 else content.content
                context += f"- **内容节选**: {excerpt}...\n"
        
        return context
    
    def _get_analysis_system_prompt(self) -> str:
        """Get system prompt for analysis generation."""
        return """你是一个专业的研究分析师，擅长从多个信息源中提取关键信息并生成综合性分析报告。

请基于提供的搜索结果和网页内容，生成一份结构化的研究报告。报告应该包括：

1. **📋 执行摘要** - 简洁概括主要发现
2. **🔍 信息源分析** - 评估各信息源的可靠性和相关性  
3. **📊 核心发现** - 基于证据的关键发现，引用具体来源
4. **🔗 交叉验证** - 不同来源间信息的一致性和差异
5. **💡 深度洞察** - 基于数据的分析和推论
6. **📖 结论与建议** - 综合性结论和进一步研究建议
7. **📚 参考资料** - 列出所有信息来源

要求：
- 使用Markdown格式，结构清晰
- 基于事实，避免主观推测
- 引用具体来源支持论点
- 语言专业但易于理解
- 如果信息不足或有矛盾，要明确指出
- 保持客观中立的分析态度

请确保分析的深度和广度都能满足专业研究的标准。"""


# Global LLM service instance  
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create LLM service instance."""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service