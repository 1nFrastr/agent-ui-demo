"""Chat-related data models."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str = Field(..., description="User message")
    sessionId: str = Field(..., description="Session ID") 
    agentType: str = Field(default="deepresearch", description="Agent type")


class WebSearchResultItem(BaseModel):
    """Web search result item."""
    title: str
    url: str
    summary: str
    favicon: Optional[str] = None
    domain: Optional[str] = None


class WebSearchData(BaseModel):
    """Web search parameters and results."""
    query: str
    results: List[WebSearchResultItem]
    search_time: Optional[float] = None
    total_results: Optional[int] = None


class ImageInfo(BaseModel):
    """Image information."""
    url: str
    alt: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class ContentMetadata(BaseModel):
    """Content metadata."""
    author: Optional[str] = None
    publish_date: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[List[str]] = None


class WebContentData(BaseModel):
    """Web content data."""
    url: str
    title: str
    content: str
    images: Optional[List[ImageInfo]] = None
    summary: Optional[str] = None
    metadata: Optional[ContentMetadata] = None
    status: Literal["success", "partial", "failed"]
    error: Optional[str] = None


class ToolCallDetails(BaseModel):
    """Tool call detailed information."""
    id: str
    name: str
    type: Literal[
        "file_operation",
        "terminal_command", 
        "code_generation",
        "api_request",
        "search",
        "analysis",
        "web_search",
        "web_content",
        "other"
    ]
    status: Literal["running", "success", "error"]
    parameters: Optional[Dict[str, Any]] = None
    result: Optional[str] = None
    error: Optional[str] = None
    duration: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class TextContent(BaseModel):
    """Text message content."""
    text: str


class CodeContent(BaseModel):
    """Code message content."""
    content: str
    language: str


class ImageContent(BaseModel):
    """Image message content."""
    url: str
    alt: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None


class FileContent(BaseModel):
    """File message content."""
    name: str
    url: str
    size: int
    type: str


class ToolCallContent(BaseModel):
    """Tool call message content."""
    tool_call: ToolCallDetails


class MessageContent(BaseModel):
    """Message content union."""
    text: Optional[str] = None
    code: Optional[CodeContent] = None
    image: Optional[ImageContent] = None
    file: Optional[FileContent] = None
    tool_call: Optional[ToolCallDetails] = None


class Message(BaseModel):
    """Chat message model."""
    id: str
    sender: Literal["user", "assistant", "system"]
    type: Literal["text", "code", "image", "file", "system", "tool_call"]
    content: MessageContent
    timestamp: datetime
    status: Literal["pending", "sent", "delivered", "failed"]
    editable: Optional[bool] = None
    deletable: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class ChatConfig(BaseModel):
    """Chat configuration."""
    show_timestamp: Optional[bool] = True
    show_avatar: Optional[bool] = True
    enable_code_highlight: Optional[bool] = True
    auto_scroll_to_bottom: Optional[bool] = True
    max_messages: Optional[int] = 1000
    theme: Optional[Literal["light", "dark", "auto"]] = "auto"


class ChatSession(BaseModel):
    """Chat session model."""
    id: str
    title: str
    messages: List[Message]
    created_at: datetime
    updated_at: datetime
    config: Optional[ChatConfig] = None


class TypingStatus(BaseModel):
    """Typing status."""
    is_typing: bool
    sender: Literal["user", "assistant", "system"]
    preview: Optional[str] = None