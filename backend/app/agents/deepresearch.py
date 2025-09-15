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
from app.services.llm_service import get_llm_service
from app.config import settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class DeepResearchAgent(BaseAgent):
    """Deep research agent that coordinates web search and content analysis."""
    
    def __init__(self):
        super().__init__("DeepResearchAgent")
        self.web_search_tool = WebSearchTool()
        self.web_content_tool = WebContentTool()
        self.llm_service = get_llm_service()
    
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
            
            # Step 4: LLM-Powered Analysis with Streaming
            analysis_message_id = self.generate_message_id()
            
            # Start LLM analysis tool
            llm_tool_id = str(uuid.uuid4())
            yield self.create_tool_start_event(
                "llm_analysis",
                "基于搜索结果进行AI智能分析...",
                llm_tool_id
            )
            
            # Stream LLM analysis in real-time
            analysis_chunks = []
            async for chunk in self.llm_service.generate_analysis_stream(
                message, search_results, web_contents, session_id
            ):
                analysis_chunks.append(chunk)
                yield self.create_text_chunk_event(chunk, analysis_message_id)
            
            # Complete the analysis
            full_analysis = "".join(analysis_chunks)
            
            yield self.create_tool_end_event(
                llm_tool_id,
                "success",
                "AI分析完成",
                {
                    "analysis_length": len(full_analysis),
                    "model_used": settings.openai_model,
                    "tokens_estimated": len(full_analysis) // 4  # Rough estimate
                }
            )
            
            yield self.create_message_complete_event(analysis_message_id, full_analysis)
            
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
                    {"url": result.url, "extract_images": False},
                    self.session_id
                )
                contents.append(execution.result)
            except Exception as e:
                self.logger.warning(f"Failed to extract content from {result.url}: {e}")
                continue
        
        return contents