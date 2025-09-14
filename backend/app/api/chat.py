"""Chat API endpoints."""

import json
import logging
from typing import Dict, Any, Optional
import uuid

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.services.chat_service import ChatService
from app.core.exceptions import AgentUIException, ValidationError

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str
    session_id: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    message_id: str
    session_id: str
    response: str
    metadata: Optional[Dict[str, Any]] = None


@router.post("/message")
async def send_message(
    request: ChatRequest,
    settings: Settings = Depends(get_settings)
) -> ChatResponse:
    """Send a message and get a complete response."""
    
    try:
        # Validate request
        if not request.message.strip():
            raise ValidationError("Message cannot be empty")
        
        # Generate IDs
        message_id = str(uuid.uuid4())
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize chat service
        chat_service = ChatService(settings)
        
        # Process message
        response = await chat_service.process_message(
            message=request.message,
            session_id=session_id,
            config=request.config or {}
        )
        
        return ChatResponse(
            message_id=message_id,
            session_id=session_id,
            response=response,
            metadata={
                "timestamp": "2024-01-01T00:00:00Z",
                "model": settings.openai_model,
                "tools_used": ["web_search", "web_content"],
            }
        )
        
    except AgentUIException:
        raise
    except Exception as e:
        logger.error(f"Error processing message: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing message: {str(e)}"
        )


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    settings: Settings = Depends(get_settings)
):
    """Stream chat response with real-time tool execution."""
    
    try:
        # Validate request
        if not request.message.strip():
            raise ValidationError("Message cannot be empty")
        
        # Generate IDs
        session_id = request.session_id or str(uuid.uuid4())
        
        # Initialize chat service
        chat_service = ChatService(settings)
        
        # Create event stream generator
        async def event_stream():
            """Generate server-sent events for streaming response."""
            
            try:
                async for event in chat_service.stream_response(
                    message=request.message,
                    session_id=session_id,
                    config=request.config or {}
                ):
                    # Format as server-sent event
                    event_data = json.dumps(event, ensure_ascii=False)
                    yield f"data: {event_data}\n\n"
                
                # Send final event
                yield f"data: {json.dumps({'type': 'session_end', 'data': {'session_id': session_id}})}\n\n"
                
            except Exception as e:
                logger.error(f"Error in event stream: {e}", exc_info=True)
                error_event = {
                    "type": "error",
                    "data": {
                        "error": "STREAM_ERROR",
                        "message": str(e),
                        "session_id": session_id
                    }
                }
                yield f"data: {json.dumps(error_event)}\n\n"
        
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except AgentUIException:
        raise
    except Exception as e:
        logger.error(f"Error setting up stream: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error setting up stream: {str(e)}"
        )


@router.get("/sessions/{session_id}")
async def get_session(session_id: str) -> Dict[str, Any]:
    """Get session information."""
    
    # TODO: Implement session storage and retrieval
    return {
        "session_id": session_id,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "message_count": 0,
        "status": "active"
    }


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str) -> Dict[str, Any]:
    """Delete a session."""
    
    # TODO: Implement session deletion
    return {
        "session_id": session_id,
        "deleted": True,
        "timestamp": "2024-01-01T00:00:00Z"
    }