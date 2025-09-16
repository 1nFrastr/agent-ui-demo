"""Chat service for handling conversation logic."""

import logging
from typing import Any, AsyncGenerator, Dict, Optional
import uuid
from datetime import datetime

from app.agents.deepresearch import DeepResearchAgent
from app.agents.ai_developer import AIDeveloperAgent
from app.config import Settings
from app.core.exceptions import AgentExecutionError


logger = logging.getLogger(__name__)


class ChatService:
    """Service for handling chat conversations."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self.deepresearch_agent = DeepResearchAgent()
        self.ai_developer_agent = AIDeveloperAgent()
        self.logger = logging.getLogger("app.services.ChatService")
    
    async def process_message(
        self, 
        message: str, 
        session_id: str,
        config: Dict[str, Any]
    ) -> str:
        """Process a message and return complete response."""
        
        try:
            self.logger.info(f"Processing message for session {session_id}: {message[:100]}...")
            
            # For non-streaming mode, collect all events and return final response
            final_response = ""
            
            async for event in self.deepresearch_agent.process_message(
                message=message,
                session_id=session_id
            ):
                if event["type"] == "text_chunk":
                    final_response += event["data"]["content"]
                elif event["type"] == "message_complete":
                    final_response = event["data"]["content"]
                    break
            
            return final_response
            
        except Exception as e:
            self.logger.error(f"Message processing failed: {e}", exc_info=True)
            raise AgentExecutionError(
                f"Failed to process message: {str(e)}",
                agent_name="ChatService",
                details={"message": message, "session_id": session_id}
            )
    
    async def stream_response(
        self,
        message: str,
        session_id: str, 
        config: Dict[str, Any]
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Stream chat response with real-time updates."""
        
        try:
            self.logger.info(f"Starting stream for session {session_id}: {message[:100]}...")
            
            # Determine which agent to use based on config or message content
            agent = self._select_agent(message, config)
            
            # Stream events from the agent
            async for event in agent.process_message(
                message=message,
                session_id=session_id,
                **config
            ):
                yield event
                
        except Exception as e:
            self.logger.error(f"Stream processing failed: {e}", exc_info=True)
            
            # Yield error event
            yield {
                "type": "error",
                "data": {
                    "error": "PROCESSING_ERROR",
                    "message": f"处理消息时发生错误: {str(e)}",
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
    
    def _select_agent(self, message: str, config: Dict[str, Any] = None):
        """Select appropriate agent based on config or message content."""
        
        # First check if agent type is specified in config
        if config and config.get("agent_type"):
            agent_type = config["agent_type"].lower()
            if agent_type == "ai_developer" or agent_type == "aideveloper":
                self.logger.info(f"Using AIDeveloperAgent (specified in config)")
                return self.ai_developer_agent
            elif agent_type == "deepresearch":
                self.logger.info(f"Using DeepResearchAgent (specified in config)")
                return self.deepresearch_agent
        
        # If no agent type specified, try to infer from message content
        message_lower = message.lower()
        
        # Check for AI developer keywords
        developer_keywords = [
            "生成", "创建", "开发", "网页", "html", "css", "javascript", "js",
            "前端", "页面", "项目", "代码", "编程",
            "generate", "create", "develop", "webpage", "frontend", "project", "code"
        ]
        
        if any(keyword in message_lower for keyword in developer_keywords):
            self.logger.info(f"Using AIDeveloperAgent (inferred from content)")
            return self.ai_developer_agent
        
        # Check for research keywords
        research_keywords = [
            "搜索", "查找", "了解", "研究", "信息", "资料", 
            "search", "find", "research", "information"
        ]
        
        if any(keyword in message_lower for keyword in research_keywords):
            self.logger.info(f"Using DeepResearchAgent (inferred from content)")
            return self.deepresearch_agent
        
        # Default to research agent
        self.logger.info(f"Using DeepResearchAgent (default)")
        return self.deepresearch_agent
    
    async def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get session information."""
        
        # TODO: Implement session storage and retrieval
        # For now, return basic info
        
        return {
            "session_id": session_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "message_count": 0,
            "status": "active",
            "agent": "DeepResearchAgent",
            "capabilities": await self.deepresearch_agent.get_capabilities()
        }
    
    async def delete_session(self, session_id: str) -> Dict[str, Any]:
        """Delete a session."""
        
        # TODO: Implement session deletion
        # For now, just return success
        
        self.logger.info(f"Deleting session: {session_id}")
        
        return {
            "session_id": session_id,
            "deleted": True,
            "timestamp": datetime.utcnow().isoformat()
        }