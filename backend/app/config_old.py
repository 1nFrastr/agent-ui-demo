"""Configuration management for the Agent UI backend."""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = {"extra": "ignore"}  # Allow extra fields from .env
    
    # Application Configuration
    app_name: str = "Agent UI Backend"
    version: str = "0.1.0"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"
    
    # OpenAI Configuration
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    
    # Search Configuration
    google_api_key: Optional[str] = None
    google_cse_id: Optional[str] = None
    serpapi_api_key: Optional[str] = None
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]
    
    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    
    # Cache Configuration
    redis_url: str = "redis://localhost:6379/0"
    cache_ttl: int = 3600
    
    # Session Configuration
    session_timeout: int = 1800
    
    # Tool Configuration
    web_search_max_results: int = 10
    web_content_max_length: int = 50000
    request_timeout: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        
        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str) -> any:
            if field_name == 'cors_origins':
                return [x.strip() for x in raw_val.split(',')]
            return cls.json_loads(raw_val) if hasattr(cls, 'json_loads') else raw_val


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


# Global settings instance
settings = get_settings()