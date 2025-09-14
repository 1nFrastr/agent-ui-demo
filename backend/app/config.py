"""Configuration management for the Agent UI backend."""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = {
        "extra": "ignore",
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }
    
    # Application Configuration
    app_name: str = "Agent UI Backend"
    version: str = "0.1.0"
    debug: bool = True
    log_level: str = "INFO"
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS Configuration
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # OpenAI Configuration
    openai_api_key: Optional[str] = None
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    
    # Google Search Configuration
    google_api_key: Optional[str] = None
    google_cse_id: Optional[str] = None
    
    # SerpAPI Configuration (Alternative to Google)
    serpapi_api_key: Optional[str] = None
    
    # Tavily Search Configuration (AI-optimized search)
    tavily_api_key: Optional[str] = None
    
    # Web Search Configuration
    web_search_max_results: int = 10
    web_search_timeout: int = 30
    request_timeout: int = 30  # Add this for web_search.py
    
    # Web Content Configuration
    web_content_timeout: int = 30
    web_content_max_content_length: int = 1000000  # 1MB
    web_content_max_images: int = 10
    web_content_max_length: int = 1000000  # Add this for web_content.py
    
    # Session Configuration
    session_timeout: int = 3600  # 1 hour
    session_cleanup_interval: int = 300  # 5 minutes
    
    # Database Configuration (Optional)
    database_url: Optional[str] = None


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()


# Global settings instance
settings = get_settings()