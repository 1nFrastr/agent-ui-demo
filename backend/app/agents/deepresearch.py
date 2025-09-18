"""DeepResearch Agent implementation (Simplified version without LangChain)."""

import asyncio
import logging
from typing import Any, AsyncGenerator, Dict, List, Optional
import uuid
from datetime import datetime
import httpx

# LangSmith 追踪
from langsmith import traceable

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
        # 使用同步方式初始化，在应用启动时调用
        self.llm_service = get_llm_service()
        # 创建共享的HTTP客户端用于真正的并行处理
        self._shared_client = None
    
    async def _get_shared_client(self) -> httpx.AsyncClient:
        """获取或创建共享的HTTP客户端"""
        if self._shared_client is None or self._shared_client.is_closed:
            self._shared_client = httpx.AsyncClient(
                timeout=settings.request_timeout,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
            )
        return self._shared_client
    
    async def __aenter__(self):
        """异步上下文管理器入口"""
        await self._get_shared_client()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器出口，清理资源"""
        if self._shared_client and not self._shared_client.is_closed:
            await self._shared_client.aclose()
    
    async def get_capabilities(self) -> List[str]:
        """Get agent capabilities."""
        return [
            "web_search",
            "content_extraction", 
            "information_analysis",
            "research_planning",
            "content_synthesis"
        ]
    
    @traceable(name="deep_research_agent")
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
            
            # 承上启下的说明文字
            planning_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"✅ 我已完成对「{message}」的研究计划制定。现在让我开始进行网络搜索，寻找相关信息...\n\n",
                planning_message_id
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
                        "searchTime": search_results.searchTime,
                        "totalResults": search_results.totalResults
                    }
                }
            )
            
            # 承上启下的说明文字
            search_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"🔍 我已完成网络搜索，找到了 {len(search_results.results)} 个相关结果。现在让我读取这些网页的详细内容，以获取更深入的信息...\n\n",
                search_message_id
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
                            "publishDate": main_content.metadata.publishDate if main_content.metadata else None,
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
            
            # 承上启下的说明文字
            content_message_id = self.generate_message_id()
            yield self.create_text_chunk_event(
                f"📄 我已成功读取网页内容，获得了丰富的详细信息。现在让我基于这些搜索结果和网页内容进行AI智能分析，为您提供深度洞察...\n\n",
                content_message_id
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
            
            # 发送流结束事件
            yield {
                "type": "session_end",
                "data": {
                    "sessionId": session_id,
                    "message": "对话流处理完成"
                }
            }
            
            self.logger.info(f"Research completed for query: {message}")
            
        except Exception as e:
            self.logger.error(f"Research failed: {e}", exc_info=True)
            raise AgentExecutionError(
                f"Research failed: {str(e)}",
                agent_name=self.name,
                details={"query": message, "error": str(e)}
            )
    
    @traceable(name="web_search")
    async def _perform_web_search(self, query: str):
        """Perform web search."""
        execution = await self.web_search_tool.run(
            {"query": query, "max_results": 5},
            self.session_id
        )
        return execution.result
    
    @traceable(name="content_extraction")
    async def _extract_web_contents(self, search_results: List) -> List:
        """Extract content from multiple URLs with true parallelization."""
        contents = []
        
        # 获取共享客户端
        client = await self._get_shared_client()
        
        # Create tasks for true parallel execution using create_task
        tasks = []
        for i, result in enumerate(search_results[:3]):  # Process top 3 results
            task = asyncio.create_task(self._extract_single_content_parallel(result, client, i+1))
            tasks.append(task)
        
        self.logger.info(f"📋 创建了{len(tasks)}个并行任务，开始同时执行...")
        
        # Execute all tasks concurrently with true parallelization
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results and filter out exceptions
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    self.logger.warning(f"Failed to extract content from {search_results[i].url}: {result}")
                elif result is not None:
                    contents.append(result)
        
        return contents
    
    @traceable(name="extract_single_url")
    async def _extract_single_content_parallel(self, search_result, client: httpx.AsyncClient, index: int):
        """使用共享客户端进行真正的并行内容提取"""
        start_time = asyncio.get_event_loop().time()
        self.logger.info(f"[真并行] 立即开始处理URL {index}: {search_result.url} (启动时间: {start_time:.3f})")
        
        try:
            # 直接使用共享客户端进行HTTP请求
            response = await client.get(search_result.url)
            response.raise_for_status()
            content = response.text
            
            # 简化的内容处理（避免额外的BeautifulSoup开销）
            from bs4 import BeautifulSoup
            
            # 快速解析
            try:
                soup = BeautifulSoup(content, 'lxml')
            except:
                soup = BeautifulSoup(content, 'html.parser')
            
            # 提取标题
            title_tag = soup.find('title')
            title = title_tag.get_text().strip() if title_tag else ""
            
            # 提取主要内容
            main_content = self._quick_extract_content(soup)
            
            # 限制内容长度
            max_length = settings.web_content_max_length
            if len(main_content) > max_length:
                main_content = main_content[:max_length] + "..."
            
            end_time = asyncio.get_event_loop().time()
            duration = end_time - start_time
            
            self.logger.info(f"[真并行] 完成URL {index}: {search_result.url} (耗时: {duration:.2f}s)")
            
            # 构造返回结果（简化版WebContentData）
            from app.models.chat import WebContentData
            return WebContentData(
                url=search_result.url,
                title=title,
                content=main_content,
                status="success"
            )
            
        except Exception as e:
            end_time = asyncio.get_event_loop().time()
            duration = end_time - start_time
            self.logger.error(f"[真并行] 失败URL {index}: {search_result.url} (耗时: {duration:.2f}s) - {e}")
            return None
    
    def _quick_extract_content(self, soup):
        """快速提取页面主要内容"""
        # 移除不需要的元素
        for element in soup(["script", "style", "nav", "footer", "header", "aside", "iframe", "noscript"]):
            element.decompose()
        
        # 尝试找到主要内容区域
        main_selectors = ['main', 'article', '.content', '.main-content']
        main_element = None
        
        for selector in main_selectors:
            elements = soup.select(selector, limit=1)
            if elements:
                main_element = elements[0]
                break
        
        if not main_element:
            main_element = soup.find('body')
        
        if not main_element:
            return ""
        
        # 提取文本
        text_content = main_element.get_text(separator='\n', strip=True)
        
        # 简单清理
        lines = text_content.split('\n')
        cleaned_lines = [line.strip() for line in lines if line.strip() and len(line.strip()) > 10]
        return '\n\n'.join(cleaned_lines[:50])  # 限制行数