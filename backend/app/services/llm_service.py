"""LLM service with LangChain integration and streaming support."""

import logging
import os
from typing import AsyncGenerator, Dict, Any, Optional
import asyncio

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langsmith import Client
from langsmith.evaluation import evaluate, LangChainStringEvaluator

from app.config import settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class LLMService:
    """LLM service with streaming support using LangChain."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # 记录初始化开始时间
        init_start = asyncio.get_event_loop().time() if asyncio.get_event_loop().is_running() else 0
        
        # Configure LangSmith tracing if enabled
        self.logger.info("🔧 Configuring LangSmith tracing...")
        self._configure_langsmith_tracing()
        
        if not settings.openai_api_key:
            raise AgentExecutionError(
                "OpenAI API key is not configured",
                details={"config_error": "Missing OPENAI_API_KEY"}
            )
        
        # Initialize LangChain ChatOpenAI
        self.logger.info("🤖 Initializing ChatOpenAI client...")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            streaming=True,
            temperature=0.7,
            max_tokens=4000,
        )
        
        # Initialize LangSmith client for additional monitoring
        self.logger.info("📊 Initializing LangSmith client...")
        self.langsmith_client = self._init_langsmith_client()
        
        # 记录初始化完成时间
        if init_start > 0:
            duration = asyncio.get_event_loop().time() - init_start
            self.logger.info(f"✅ LLMService initialization completed in {duration:.2f}s")
        else:
            self.logger.info("✅ LLMService initialization completed")
    
    def _configure_langsmith_tracing(self):
        """Configure LangSmith environment variables for tracing."""
        if settings.langsmith_tracing and settings.langsmith_api_key:
            # Set environment variables for LangSmith
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
            os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
            os.environ["LANGCHAIN_ENDPOINT"] = settings.langsmith_endpoint
            
            self.logger.info(f"LangSmith tracing enabled for project: {settings.langsmith_project}")
        else:
            # Disable tracing if not configured
            os.environ["LANGCHAIN_TRACING_V2"] = "false"
            self.logger.info("LangSmith tracing disabled")
    
    def _init_langsmith_client(self) -> Optional[Client]:
        """Initialize LangSmith client for additional operations."""
        if settings.langsmith_tracing and settings.langsmith_api_key:
            try:
                client = Client(
                    api_key=settings.langsmith_api_key,
                    api_url=settings.langsmith_endpoint
                )
                self.logger.info("LangSmith client initialized successfully")
                return client
            except Exception as e:
                self.logger.warning(f"Failed to initialize LangSmith client: {e}")
                return None
        return None
    
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
            
            # Add metadata for LangSmith tracing
            metadata = {
                "session_id": session_id,
                "query": query,
                "search_results_count": len(search_results.results) if hasattr(search_results, 'results') else 0,
                "web_contents_count": len(web_contents),
                "model": settings.openai_model,
                "operation": "analysis_generation"
            }
            
            # Set run name for better tracing
            run_name = f"analysis_generation_{session_id[:8]}"
            
            # 直接使用LangChain的streaming支持，更简洁的方式
            try:
                async for chunk in self.llm.astream([system_message, user_message]):
                    if chunk.content:  # 只yield非空内容
                        yield chunk.content
            except asyncio.TimeoutError:
                self.logger.error("LLM streaming timeout")
                yield "\n\n⚠️ **响应超时**: 请稍后重试。"
            except Exception as stream_error:
                self.logger.error(f"LLM streaming error: {stream_error}")
                yield f"\n\n⚠️ **流式响应错误**: {str(stream_error)}"
            
        except Exception as e:
            self.logger.error(f"LLM analysis failed: {e}", exc_info=True)
            # Yield error message to client
            yield f"\n\n⚠️ **分析生成失败**: {str(e)}\n\n请稍后重试或联系管理员。"
    
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
                if content.metadata.publishDate:
                    context += f"- **发布时间**: {content.metadata.publishDate}\n"
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
    
    async def generate_completion(
        self,
        prompt: str,
        max_tokens: int = 2000,
        temperature: float = 0.7,
        session_id: str = None
    ) -> str:
        """Generate a single completion response."""
        try:
            # Create messages
            user_message = HumanMessage(content=prompt)
            
            # Add metadata for tracing
            metadata = {
                "session_id": session_id or "unknown",
                "model": settings.openai_model,
                "operation": "code_generation",
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            
            # Configure LLM parameters
            llm_with_params = self.llm.bind(
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Generate response
            # TODO: 改成流式传输
            response = await llm_with_params.ainvoke([user_message])
            
            return response.content
            
        except Exception as e:
            self.logger.error(f"LLM completion failed: {e}", exc_info=True)
            raise
    
    def log_analysis_completion(self, session_id: str, query: str, success: bool, error_msg: str = None):
        """Log analysis completion to LangSmith for monitoring."""
        if self.langsmith_client:
            try:
                # Create a run record for the analysis task
                run_data = {
                    "name": f"analysis_task_{session_id[:8]}",
                    "inputs": {"query": query},
                    "run_type": "llm",
                    "session_id": session_id,
                }
                
                if success:
                    run_data["outputs"] = {"status": "success"}
                else:
                    run_data["outputs"] = {"status": "failed", "error": error_msg}
                
                # Note: This is a simplified logging approach
                # In production, you might want to use more sophisticated tracking
                self.logger.info(f"Analysis task logged to LangSmith: {run_data}")
                
            except Exception as e:
                self.logger.warning(f"Failed to log to LangSmith: {e}")


# Global LLM service instance  
_llm_service: Optional[LLMService] = None
_initialization_lock = asyncio.Lock()


def get_llm_service() -> LLMService:
    """Get or create LLM service instance with improved initialization."""
    global _llm_service
    
    if _llm_service is None:
        logger.info("🔄 Creating new LLM service instance...")
        start_time = asyncio.get_event_loop().time() if asyncio.get_event_loop().is_running() else 0
        
        _llm_service = LLMService()
        
        if start_time > 0:
            duration = asyncio.get_event_loop().time() - start_time
            logger.info(f"⚡ LLM service created in {duration:.2f}s")
        else:
            logger.info("⚡ LLM service created successfully")
    
    return _llm_service


async def get_llm_service_async() -> LLMService:
    """Get or create LLM service instance with async initialization and locking."""
    global _llm_service
    
    if _llm_service is None:
        async with _initialization_lock:
            if _llm_service is None:  # Double-check pattern
                logger.info("🔄 Async creating new LLM service instance...")
                start_time = asyncio.get_event_loop().time()
                
                # Run the sync initialization in a thread pool
                loop = asyncio.get_event_loop()
                _llm_service = await loop.run_in_executor(None, LLMService)
                
                duration = asyncio.get_event_loop().time() - start_time
                logger.info(f"⚡ LLM service async created in {duration:.2f}s")
    
    return _llm_service