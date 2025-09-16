"""Response models for API endpoints."""

from typing import Any, Dict, List, Literal, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from .chat import Message


class ChatResponse(BaseModel):
    """Chat response model."""
    messageId: str = Field(..., description="Message ID")
    sessionId: str = Field(..., description="Session ID")
    content: str = Field(..., description="Response content")
    toolCalls: List[Dict[str, Any]] = Field(default=[], description="Tool calls made")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")


class StreamEvent(BaseModel):
    """Stream event model."""
    type: Literal[
        "tool_call_start",
        "tool_call_end", 
        "text_chunk",
        "message_complete",
        "session_end",
        "error"
    ]
    data: Dict[str, Any]


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    

class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: str
    version: str
    environment: str


class DetailedHealthResponse(HealthResponse):
    """Detailed health check response."""
    system: Dict[str, Any]
    config: Dict[str, Any]


class SessionResponse(BaseModel):
    """Session response model."""
    session_id: str
    created_at: str
    updated_at: str
    message_count: int
    status: str


class SessionDeleteResponse(BaseModel):
    """Session delete response."""
    session_id: str
    deleted: bool
    timestamp: str