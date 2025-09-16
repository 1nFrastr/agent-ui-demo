"""Web search tool implementation."""

import json
import logging
from typing import Any, Dict, List, Optional
import httpx
from datetime import datetime
from tavily import TavilyClient

from app.config import settings
from app.models.chat import WebSearchData, WebSearchResultItem
from app.models.tool import ToolParameter
from app.tools.base import BaseTool
from app.core.exceptions import ToolExecutionError, ConfigurationError


logger = logging.getLogger(__name__)


class WebSearchTool(BaseTool):
    """Web search tool using Tavily AI-optimized search."""
    
    @property
    def name(self) -> str:
        return "web_search"
    
    @property
    def description(self) -> str:
        return "Search the web for information using Tavily AI-optimized search engine"
    
    @property
    def parameters(self) -> List[ToolParameter]:
        return [
            ToolParameter(
                name="query",
                type="string",
                description="Search query string",
                required=True
            ),
            ToolParameter(
                name="max_results",
                type="integer", 
                description="Maximum number of results to return",
                required=False,
                default=settings.web_search_max_results
            ),
            ToolParameter(
                name="language",
                type="string",
                description="Search language (e.g., 'zh-CN', 'en')",
                required=False,
                default="zh-CN"
            )
        ]
    
    @property
    def category(self) -> str:
        return "search"
    
    def __init__(self):
        super().__init__()
        self._validate_config()
    
    def _validate_config(self) -> None:
        """Validate Tavily search configuration."""
        if not settings.tavily_api_key:
            raise ConfigurationError("Tavily API key not configured")
    
    async def _search_with_tavily(self, query: str, max_results: int, language: str) -> List[WebSearchResultItem]:
        """Search using Tavily AI-optimized search."""
        if not settings.tavily_api_key:
            raise ConfigurationError("Tavily API key not configured")
        
        try:
            client = TavilyClient(api_key=settings.tavily_api_key)
            
            # Tavily search parameters
            search_params = {
                "query": query,
                "search_depth": "basic",  # or "advanced" for more comprehensive search
                "max_results": max_results,
                "include_answer": True,
                "include_raw_content": False,
            }
            
            # Add language preference if not English
            if language.startswith("zh"):
                search_params["search_depth"] = "advanced"  # Better for non-English queries
            
            response = client.search(**search_params)
            
            results = []
            for item in response.get("results", []):
                results.append(WebSearchResultItem(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    summary=item.get("content", ""),
                    domain=self._extract_domain(item.get("url", "")),
                    score=item.get("score", 0.0)  # Tavily provides relevance scores
                ))
            
            return results
            
        except Exception as e:
            self.logger.error(f"Tavily search failed: {e}")
            raise ToolExecutionError(f"Tavily search failed: {str(e)}")
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL."""
        try:
            from urllib.parse import urlparse
            return urlparse(url).netloc
        except:
            return ""
    
    async def execute(self, parameters: Dict[str, Any]) -> WebSearchData:
        """Execute web search using Tavily."""
        query = parameters["query"]
        max_results = parameters.get("max_results", settings.web_search_max_results)
        language = parameters.get("language", "zh-CN")
        
        start_time = datetime.utcnow()
        
        try:
            # Use Tavily AI-optimized search
            results = await self._search_with_tavily(query, max_results, language)
            
            search_time = (datetime.utcnow() - start_time).total_seconds() * 1000  # ms
            
            return WebSearchData(
                query=query,
                results=results,
                searchTime=search_time,
                totalResults=len(results) * 1000,  # Estimate based on Tavily's corpus
            )
            
        except Exception as e:
            raise ToolExecutionError(
                f"Tavily web search failed: {str(e)}",
                tool_name=self.name,
                details={"query": query, "error": str(e)}
            )