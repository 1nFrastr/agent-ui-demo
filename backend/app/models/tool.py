"""Tool-related data models."""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel


class ToolParameter(BaseModel):
    """Tool parameter definition."""
    name: str
    type: str
    description: str
    required: bool = False
    default: Optional[Any] = None


class ToolDefinition(BaseModel):
    """Tool definition model."""
    name: str
    description: str
    parameters: List[ToolParameter]
    category: Literal[
        "search",
        "content",
        "analysis", 
        "generation",
        "communication",
        "utility",
        "other"
    ]
    version: str = "1.0.0"
    
    
class ToolExecution(BaseModel):
    """Tool execution record."""
    tool_name: str
    parameters: Dict[str, Any]
    start_time: datetime
    end_time: Optional[datetime] = None
    status: Literal["running", "success", "error", "cancelled"]
    result: Optional[Any] = None
    error_message: Optional[str] = None
    execution_id: str
    session_id: str


class ToolRegistry(BaseModel):
    """Tool registry model."""
    tools: Dict[str, ToolDefinition]
    categories: List[str]
    
    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        """Get tool by name."""
        return self.tools.get(name)
    
    def list_tools_by_category(self, category: str) -> List[ToolDefinition]:
        """List tools by category."""
        return [tool for tool in self.tools.values() if tool.category == category]