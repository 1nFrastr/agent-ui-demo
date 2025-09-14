"""Tool registry for managing all available tools."""

from typing import Dict, List, Optional
import logging

from app.models.tool import ToolDefinition, ToolRegistry as ToolRegistryModel
from app.tools.base import BaseTool
from app.tools.web_search import WebSearchTool
from app.tools.web_content import WebContentTool


logger = logging.getLogger(__name__)


class ToolRegistry:
    """Registry for all available tools."""
    
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._setup_tools()
    
    def _setup_tools(self) -> None:
        """Setup and register all tools."""
        tools = [
            WebSearchTool(),
            WebContentTool(),
        ]
        
        for tool in tools:
            self.register_tool(tool)
            logger.info(f"Registered tool: {tool.name}")
    
    def register_tool(self, tool: BaseTool) -> None:
        """Register a tool."""
        self._tools[tool.name] = tool
        logger.debug(f"Tool registered: {tool.name}")
    
    def get_tool(self, name: str) -> Optional[BaseTool]:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def list_tools(self) -> List[BaseTool]:
        """List all registered tools."""
        return list(self._tools.values())
    
    def list_tool_names(self) -> List[str]:
        """List all tool names."""
        return list(self._tools.keys())
    
    def get_tool_definitions(self) -> List[ToolDefinition]:
        """Get all tool definitions."""
        return [tool.get_definition() for tool in self._tools.values()]
    
    def get_registry_model(self) -> ToolRegistryModel:
        """Get tool registry as pydantic model."""
        tools_dict = {name: tool.get_definition() for name, tool in self._tools.items()}
        categories = list(set(tool.category for tool in self._tools.values()))
        
        return ToolRegistryModel(
            tools=tools_dict,
            categories=categories
        )
    
    def tools_by_category(self, category: str) -> List[BaseTool]:
        """Get tools by category."""
        return [tool for tool in self._tools.values() if tool.category == category]


# Global tool registry instance
tool_registry = ToolRegistry()