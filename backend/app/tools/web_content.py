"""Web content extraction tool implementation."""

import logging
from typing import Any, Dict, List, Optional
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

from app.config import settings
from app.models.chat import WebContentData, ImageInfo, ContentMetadata
from app.models.tool import ToolParameter
from app.tools.base import BaseTool
from app.core.exceptions import ToolExecutionError


logger = logging.getLogger(__name__)


class WebContentTool(BaseTool):
    """Web content extraction tool."""
    
    @property
    def name(self) -> str:
        return "web_content"
    
    @property
    def description(self) -> str:
        return "Extract and read content from web pages"
    
    @property
    def parameters(self) -> List[ToolParameter]:
        return [
            ToolParameter(
                name="url",
                type="string",
                description="URL of the web page to extract content from",
                required=True
            ),
            ToolParameter(
                name="extract_images",
                type="boolean",
                description="Whether to extract image information",
                required=False,
                default=True
            ),
            ToolParameter(
                name="max_content_length",
                type="integer",
                description="Maximum length of content to extract",
                required=False,
                default=settings.web_content_max_length
            )
        ]
    
    @property
    def category(self) -> str:
        return "content"
    
    async def execute(self, parameters: Dict[str, Any]) -> WebContentData:
        """Execute web content extraction."""
        url = parameters["url"]
        extract_images = parameters.get("extract_images", True)
        max_content_length = parameters.get("max_content_length", settings.web_content_max_length)
        
        try:
            # Fetch web page
            async with httpx.AsyncClient(
                timeout=settings.request_timeout,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                content = response.text
            
            # Parse with BeautifulSoup
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract title
            title_tag = soup.find('title')
            title = title_tag.get_text().strip() if title_tag else ""
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            # Extract main content
            main_content = self._extract_main_content(soup)
            
            # Limit content length
            if len(main_content) > max_content_length:
                main_content = main_content[:max_content_length] + "..."
            
            # Extract images
            images = []
            if extract_images:
                images = self._extract_images(soup, url)
            
            # Extract metadata
            metadata = self._extract_metadata(soup)
            
            # Generate summary
            summary = self._generate_summary(main_content)
            
            return WebContentData(
                url=url,
                title=title,
                content=main_content,
                images=images,
                summary=summary,
                metadata=metadata,
                status="success"
            )
            
        except httpx.HTTPStatusError as e:
            return WebContentData(
                url=url,
                title="",
                content="",
                status="failed",
                error=f"HTTP error: {e.response.status_code}"
            )
        except Exception as e:
            self.logger.error(f"Content extraction failed for {url}: {e}", exc_info=True)
            return WebContentData(
                url=url,
                title="",
                content="",
                status="failed",
                error=str(e)
            )
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main text content from soup."""
        # Try to find main content areas
        main_selectors = [
            'main',
            'article', 
            '.content',
            '.main-content',
            '.post-content',
            '.entry-content',
            '#content',
            '.container'
        ]
        
        main_content = ""
        for selector in main_selectors:
            elements = soup.select(selector)
            if elements:
                main_content = elements[0].get_text(separator='\n', strip=True)
                break
        
        # Fallback to body if no main content found
        if not main_content:
            body = soup.find('body')
            if body:
                main_content = body.get_text(separator='\n', strip=True)
        
        # Clean up the text
        lines = main_content.split('\n')
        cleaned_lines = []
        for line in lines:
            line = line.strip()
            if line and len(line) > 10:  # Filter out very short lines
                cleaned_lines.append(line)
        
        return '\n\n'.join(cleaned_lines)
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str) -> List[ImageInfo]:
        """Extract image information."""
        images = []
        img_tags = soup.find_all('img')
        
        for img in img_tags[:10]:  # Limit to first 10 images
            src = img.get('src')
            if src:
                # Convert relative URLs to absolute
                full_url = urljoin(base_url, src)
                
                # Extract alt text and dimensions
                alt = img.get('alt', '')
                width = self._safe_int(img.get('width'))
                height = self._safe_int(img.get('height'))
                
                images.append(ImageInfo(
                    url=full_url,
                    alt=alt,
                    width=width,
                    height=height
                ))
        
        return images
    
    def _extract_metadata(self, soup: BeautifulSoup) -> ContentMetadata:
        """Extract page metadata."""
        metadata = ContentMetadata()
        
        # Extract author
        author_selectors = [
            'meta[name="author"]',
            'meta[property="article:author"]',
            '.author',
            '.by-author'
        ]
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    metadata.author = element.get('content')
                else:
                    metadata.author = element.get_text().strip()
                break
        
        # Extract description
        desc_selectors = [
            'meta[name="description"]',
            'meta[property="og:description"]'
        ]
        for selector in desc_selectors:
            element = soup.select_one(selector)
            if element:
                metadata.description = element.get('content')
                break
        
        # Extract keywords
        keywords_tag = soup.select_one('meta[name="keywords"]')
        if keywords_tag:
            keywords_content = keywords_tag.get('content', '')
            metadata.keywords = [k.strip() for k in keywords_content.split(',') if k.strip()]
        
        # Extract publish date
        date_selectors = [
            'meta[property="article:published_time"]',
            'meta[name="date"]',
            'time[datetime]',
            '.date',
            '.publish-date'
        ]
        for selector in date_selectors:
            element = soup.select_one(selector)
            if element:
                if element.name == 'meta':
                    metadata.publish_date = element.get('content')
                elif element.name == 'time':
                    metadata.publish_date = element.get('datetime')
                else:
                    metadata.publish_date = element.get_text().strip()
                break
        
        return metadata
    
    def _generate_summary(self, content: str) -> str:
        """Generate a simple summary of the content."""
        if len(content) <= 200:
            return content
        
        # Take first few sentences up to ~200 characters
        sentences = content.split('。')  # Chinese period
        if len(sentences) == 1:
            sentences = content.split('.')  # English period
        
        summary = ""
        for sentence in sentences:
            if len(summary) + len(sentence) > 200:
                break
            summary += sentence + "。" if content.find('。') != -1 else sentence + "."
        
        return summary.strip()
    
    def _safe_int(self, value: Optional[str]) -> Optional[int]:
        """Safely convert string to int."""
        if value:
            try:
                return int(value)
            except ValueError:
                pass
        return None