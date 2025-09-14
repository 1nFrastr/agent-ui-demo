"""Base tool class for all tools."""

import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid

from app.models.tool import ToolDefinition, ToolExecution, ToolParameter
from app.core.exceptions import ToolExecutionError


logger = logging.getLogger(__name__)


class BaseTool(ABC):
    """Base class for all tools."""
    
    def __init__(self):
        self.logger = logging.getLogger(f"app.tools.{self.__class__.__name__}")
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Tool name."""
        pass
    
    @property
    @abstractmethod
    def description(self) -> str:
        """Tool description."""
        pass
    
    @property
    @abstractmethod
    def parameters(self) -> List[ToolParameter]:
        """Tool parameters definition."""
        pass
    
    @property
    def category(self) -> str:
        """Tool category."""
        return "other"
    
    @property
    def version(self) -> str:
        """Tool version."""
        return "1.0.0"
    
    def get_definition(self) -> ToolDefinition:
        """Get tool definition."""
        return ToolDefinition(
            name=self.name,
            description=self.description,
            parameters=self.parameters,
            category=self.category,
            version=self.version,
        )
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Any:
        """Execute the tool with given parameters."""
        pass
    
    def validate_parameters(self, parameters: Dict[str, Any]) -> None:
        """Validate tool parameters."""
        for param in self.parameters:
            if param.required and param.name not in parameters:
                raise ToolExecutionError(
                    f"Required parameter '{param.name}' is missing",
                    tool_name=self.name,
                    details={"missing_parameter": param.name}
                )
    
    async def run(self, parameters: Dict[str, Any], session_id: str) -> ToolExecution:
        """Run the tool and return execution record."""
        execution_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        execution = ToolExecution(
            tool_name=self.name,
            parameters=parameters,
            start_time=start_time,
            status="running",
            execution_id=execution_id,
            session_id=session_id,
        )
        
        try:
            self.logger.info(f"Starting tool execution: {self.name} with parameters: {parameters}")
            
            # Validate parameters
            self.validate_parameters(parameters)
            
            # Execute tool
            result = await self.execute(parameters)
            
            # Update execution record
            execution.end_time = datetime.utcnow()
            execution.status = "success"
            execution.result = result
            
            self.logger.info(f"Tool execution completed successfully: {self.name}")
            
        except Exception as e:
            execution.end_time = datetime.utcnow()
            execution.status = "error"
            execution.error_message = str(e)
            
            self.logger.error(f"Tool execution failed: {self.name} - {e}", exc_info=True)
            raise ToolExecutionError(
                f"Tool execution failed: {str(e)}",
                tool_name=self.name,
                details={"error": str(e), "execution_id": execution_id}
            )
        
        return execution