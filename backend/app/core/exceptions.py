"""Core exceptions for the Agent UI backend."""

from typing import Any, Dict, Optional


class AgentUIException(Exception):
    """Base exception for Agent UI backend."""
    
    def __init__(
        self,
        message: str,
        error_code: str = "AGENT_UI_ERROR",
        status_code: int = 500,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}


class ValidationError(AgentUIException):
    """Validation error."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            status_code=400,
            details=details,
        )


class ConfigurationError(AgentUIException):
    """Configuration error."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="CONFIGURATION_ERROR",
            status_code=500,
            details=details,
        )


class ToolExecutionError(AgentUIException):
    """Tool execution error."""
    
    def __init__(self, message: str, tool_name: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="TOOL_EXECUTION_ERROR",
            status_code=500,
            details={**(details or {}), "tool_name": tool_name},
        )


class AgentExecutionError(AgentUIException):
    """Agent execution error."""
    
    def __init__(self, message: str, agent_name: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="AGENT_EXECUTION_ERROR",
            status_code=500,
            details={**(details or {}), "agent_name": agent_name},
        )


class RateLimitError(AgentUIException):
    """Rate limit error."""
    
    def __init__(self, message: str = "Rate limit exceeded", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="RATE_LIMIT_ERROR",
            status_code=429,
            details=details,
        )


class AuthenticationError(AgentUIException):
    """Authentication error."""
    
    def __init__(self, message: str = "Authentication failed", details: Optional[Dict[str, Any]] = None):
        super().__init__(
            message=message,
            error_code="AUTHENTICATION_ERROR",
            status_code=401,
            details=details,
        )