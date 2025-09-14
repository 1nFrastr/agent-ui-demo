"""Development server startup script."""

import sys
import os
import uvicorn

# Add the app directory to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings

if __name__ == "__main__":
    print(f"Starting {settings.app_name} v{settings.version}")
    print(f"Debug mode: {settings.debug}")
    print(f"Server: http://{settings.host}:{settings.port}")
    print(f"API Docs: http://{settings.host}:{settings.port}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )