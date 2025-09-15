from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator
import json
import asyncio
from datetime import datetime, timezone

from app.models.chat import ChatRequest
from app.models.response import ChatResponse
from app.services.chat_service import ChatService
from app.core.exceptions import AgentExecutionError
from app.config import Settings, get_settings

router = APIRouter()

def get_chat_service(settings: Settings = Depends(get_settings)) -> ChatService:
    """Dependency to get chat service instance."""
    return ChatService(settings)

@router.post("/stream", response_class=StreamingResponse)
async def stream_chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Stream chat response using Server-Sent Events."""
    
    async def generate_events() -> AsyncGenerator[str, None]:
        try:
            # Process the message and stream events
            async for event in chat_service.stream_response(
                message=request.message,
                session_id=request.sessionId,
                config={"agent_type": request.agentType}
            ):
                # Format as Server-Sent Event
                event_data = json.dumps(event, ensure_ascii=False)
                yield f"data: {event_data}\n\n"
                
                # Add small delay to prevent overwhelming the client
                await asyncio.sleep(0.01)
            
            # Send completion signal
            yield "data: [DONE]\n\n"
            
        except AgentExecutionError as e:
            # Send error event
            error_event = {
                "type": "error",
                "timestamp": e.timestamp.isoformat(),
                "error": {
                    "message": str(e),
                    "agent": e.agent_name,
                    "details": e.details
                }
            }
            error_data = json.dumps(error_event, ensure_ascii=False)
            yield f"data: {error_data}\n\n"
            
        except Exception as e:
            # Send generic error event
            error_event = {
                "type": "error",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error": {
                    "message": f"Internal server error: {str(e)}",
                    "agent": "system",
                    "details": {}
                }
            }
            error_data = json.dumps(error_event, ensure_ascii=False)
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        generate_events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        }
    )

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Standard chat endpoint (non-streaming)."""
    
    try:
        response_content = await chat_service.process_message(
            message=request.message,
            session_id=request.sessionId,
            config={"agent_type": request.agentType}
        )
        
        # Create response model
        response = ChatResponse(
            message=response_content,
            sessionId=request.sessionId,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
        return response
        
    except AgentExecutionError as e:
        raise HTTPException(
            status_code=500,
            detail={
                "message": str(e),
                "agent": e.agent_name,
                "details": e.details
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={"message": f"Internal server error: {str(e)}"}
        )