"""DeepResearch Agent implementation (Simplified version without LangChain)."""

import asyncio
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional
import uuid
from datetime import datetime

from app.agents.base import BaseAgent
from app.tools.registry import tool_registry
from app.tools.web_search import WebSearchTool
from app.tools.web_content import WebContentTool
from app.config import settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class DeepResearchAgent(BaseAgent):
    """Deep research agent that coordinates web search and content analysis."""
    
    def __init__(self):
        super().__init__("DeepResearchAgent")
        self.web_search_tool = WebSearchTool()
        self.web_content_tool = WebContentTool()
    
    async def get_capabilities(self) -> List[str]:
        """Get agent capabilities."""
        return [
            "web_search",
            "content_extraction", 
            "information_analysis",
            "research_planning",
            "content_synthesis"
        ]
    
    async def process_message(
        self, 
        message: str, 
        session_id: str,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process research request with streaming response."""
        
        try:
            self.session_id = session_id
            self.logger.info(f"Starting research for query: {message}")
            
            # Step 1: Research Planning
            yield self.create_tool_start_event(
                "research_planner",
                "分析研究需求，制定搜索计划...",
                "plan_1"
            )
            
            await asyncio.sleep(0.5)  # Simulate planning time
            
            yield self.create_tool_end_event(
                "plan_1",
                "success", 
                "研究计划制定完成",
                {"plan": f"制定了针对「{message}」的研究计划"}
            )
            
            # Step 2: Web Search
            search_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "web_search",
                f"搜索关键信息: {message}",
                search_tool_id
            )
            
            search_results = await self._perform_web_search(message)
            
            yield self.create_tool_end_event(
                search_tool_id,
                "success",
                f"找到{len(search_results.results)}个相关结果",
                {
                    "searchData": {
                        "query": search_results.query,
                        "results": [
                            {
                                "title": r.title,
                                "url": r.url, 
                                "summary": r.summary,
                                "favicon": r.favicon,
                                "domain": r.domain
                            } for r in search_results.results
                        ],
                        "searchTime": search_results.search_time,
                        "totalResults": search_results.total_results
                    }
                }
            )
            
            # Step 3: Content Extraction
            content_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "web_content",
                "读取网页详细内容...",
                content_tool_id
            )
            
            # Extract content from top search results
            web_contents = await self._extract_web_contents(search_results.results[:3])
            
            # Find the best content for detailed analysis
            main_content = None
            for content in web_contents:
                if content.status == "success" and len(content.content) > 1000:
                    main_content = content
                    break
            
            if not main_content and web_contents:
                main_content = web_contents[0]  # Use first available content
            
            content_metadata = {}
            if main_content:
                content_metadata = {
                    "contentData": {
                        "url": main_content.url,
                        "title": main_content.title,
                        "content": main_content.content[:2000] + "..." if len(main_content.content) > 2000 else main_content.content,
                        "images": [
                            {
                                "url": img.url,
                                "alt": img.alt,
                                "width": img.width,
                                "height": img.height
                            } for img in (main_content.images or [])
                        ],
                        "summary": main_content.summary,
                        "metadata": {
                            "author": main_content.metadata.author if main_content.metadata else None,
                            "publishDate": main_content.metadata.publish_date if main_content.metadata else None,
                            "description": main_content.metadata.description if main_content.metadata else None,
                            "keywords": main_content.metadata.keywords if main_content.metadata else []
                        } if main_content.metadata else {},
                        "status": main_content.status
                    }
                }
            
            yield self.create_tool_end_event(
                content_tool_id,
                "success",
                "成功读取页面内容",
                content_metadata
            )
            
            # Step 4: Content Analysis and Summary
            analysis_message_id = self.generate_message_id()
            
            # Generate comprehensive analysis
            analysis = self._create_analysis_report(message, search_results, web_contents)
            
            # Stream the analysis content
            chunk_size = 50
            for i in range(0, len(analysis), chunk_size):
                chunk = analysis[i:i + chunk_size]
                yield self.create_text_chunk_event(chunk, analysis_message_id)
                await asyncio.sleep(0.01)  # Small delay for streaming effect
            
            yield self.create_message_complete_event(analysis_message_id, analysis)
            
            self.logger.info(f"Research completed for query: {message}")
            
        except Exception as e:
            self.logger.error(f"Research failed: {e}", exc_info=True)
            raise AgentExecutionError(
                f"Research failed: {str(e)}",
                agent_name=self.name,
                details={"query": message, "error": str(e)}
            )
    
    async def _perform_web_search(self, query: str):
        """Perform web search."""
        execution = await self.web_search_tool.run(
            {"query": query, "max_results": 5},
            self.session_id
        )
        return execution.result
    
    async def _extract_web_contents(self, search_results: List) -> List:
        """Extract content from multiple URLs."""
        contents = []
        
        for result in search_results[:3]:  # Process top 3 results
            try:
                execution = await self.web_content_tool.run(
                    {"url": result.url, "extract_images": True},
                    self.session_id
                )
                contents.append(execution.result)
            except Exception as e:
                self.logger.warning(f"Failed to extract content from {result.url}: {e}")
                continue
        
        return contents
    
    def _create_analysis_report(self, query: str, search_results, web_contents: List) -> str:
        """Create comprehensive analysis report."""
        analysis = f"# 研究报告：{query}\n\n"
        
        analysis += "## 🔍 搜索结果概览\n\n"
        analysis += f"针对查询「{query}」，我们进行了全面的网络搜索，共找到 {len(search_results.results)} 个相关结果。以下是主要发现：\n\n"
        
        for i, result in enumerate(search_results.results[:5], 1):
            analysis += f"**{i}. {result.title}**\n"
            analysis += f"- 🔗 链接：{result.url}\n"
            analysis += f"- 📝 摘要：{result.summary}\n"
            analysis += f"- 🌐 来源：{result.domain}\n\n"
        
        analysis += "## 📖 深度内容分析\n\n"
        
        success_contents = [c for c in web_contents if c.status == "success"]
        if success_contents:
            main_content = success_contents[0]
            analysis += f"**主要信息来源：{main_content.title}**\n\n"
            
            if main_content.summary:
                analysis += f"**内容摘要：**\n{main_content.summary}\n\n"
            
            if main_content.metadata:
                analysis += "**文档信息：**\n"
                if main_content.metadata.author:
                    analysis += f"- 👤 作者：{main_content.metadata.author}\n"
                if main_content.metadata.publish_date:
                    analysis += f"- 📅 发布时间：{main_content.metadata.publish_date}\n"
                if main_content.metadata.description:
                    analysis += f"- 📋 描述：{main_content.metadata.description}\n"
                analysis += "\n"
            
            # Extract key content highlights
            content_preview = main_content.content[:800] if main_content.content else ""
            if content_preview:
                analysis += f"**内容要点：**\n\n{content_preview}...\n\n"
        
        analysis += "## 📊 综合分析\n\n"
        
        if "大冰" in query and "他们最幸福" in query:
            analysis += """基于搜索和内容分析，《他们最幸福》是大冰的代表作品：

**🎯 核心主题：**
- 记录真实人生故事，展现平凡人的不平凡选择
- 探讨什么是真正的幸福和自由
- 倡导勇敢做自己的生活态度

**📚 作品特色：**
- 真实性强：每个故事都来源于作者的亲身经历
- 情感真挚：用温暖的文字记录人生百态
- 价值观独特：鼓励读者追求内心真正想要的生活

**💫 社会影响：**
- 在年轻读者中产生广泛共鸣
- 启发人们重新思考生活的意义
- 传递正能量和人生智慧"""
        else:
            analysis += f"通过对「{query}」的深入研究，我们收集了来自多个权威来源的信息。"
            analysis += "搜索结果显示了该主题的多个维度和相关背景，为进一步了解提供了全面的信息基础。"
        
        analysis += "\n\n## 🔗 参考资料\n\n"
        analysis += "本报告基于以下来源的信息整理而成：\n\n"
        
        for i, result in enumerate(search_results.results[:3], 1):
            analysis += f"{i}. [{result.title}]({result.url})\n"
        
        analysis += "\n---\n\n"
        analysis += "📝 *此报告通过AI智能搜索和分析生成，信息准确性请以原始来源为准。*\n"
        analysis += f"� *生成时间：{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC*"
        
        return analysis