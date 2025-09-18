"""Base agent class for all agents."""

import logging
from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, List, Optional
import uuid

from app.models.chat import Message
from app.config import settings


logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Base class for all agents."""
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"app.agents.{name}")
        self.session_id: Optional[str] = None
    
    @abstractmethod
    async def process_message(
        self, 
        message: str, 
        session_id: str,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Process a message and yield streaming events."""
        pass
    
    def generate_message_id(self) -> str:
        """Generate a unique message ID."""
        return str(uuid.uuid4())
    
    def create_tool_start_event(self, tool_name: str, message: str, tool_id: str) -> Dict[str, Any]:
        """Create tool start event."""
        return {
            "type": "tool_call_start",
            "data": {
                "toolName": tool_name,
                "toolId": tool_id,
                "message": message
            }
        }
    
    def create_tool_end_event(
        self, 
        tool_id: str, 
        status: str, 
        result: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create tool end event."""
        return {
            "type": "tool_call_end",
            "data": {
                "toolId": tool_id,
                "status": status,
                "result": result,
                "metadata": metadata or {}
            }
        }
    
    def create_text_chunk_event(self, content: str, message_id: str) -> Dict[str, Any]:
        """Create text chunk event."""
        return {
            "type": "text_chunk",
            "data": {
                "content": content,
                "messageId": message_id
            }
        }
    
    def create_message_complete_event(self, message_id: str, content: str) -> Dict[str, Any]:
        """Create message complete event."""
        return {
            "type": "message_complete",
            "data": {
                "messageId": message_id,
                "content": content
            }
        }