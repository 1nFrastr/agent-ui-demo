"""Health check API endpoints."""

import sys
from datetime import datetime, timezone
from typing import Dict, Any

from fastapi import APIRouter, Depends
import psutil

from app.config import Settings, get_settings

router = APIRouter()


@router.get("/")
async def health_check(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.version,
        "environment": "development" if settings.debug else "production",
    }


@router.get("/detailed")
async def detailed_health_check(settings: Settings = Depends(get_settings)) -> Dict[str, Any]:
    """Detailed health check with system information."""
    
    # System information
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": settings.version,
        "environment": "development" if settings.debug else "production",
        "system": {
            "python_version": sys.version,
            "platform": sys.platform,
            "cpu_count": psutil.cpu_count(),
            "cpu_percent": psutil.cpu_percent(interval=1),
            "memory": {
                "total": memory.total,
                "available": memory.available,
                "percent": memory.percent,
            },
            "disk": {
                "total": disk.total,
                "free": disk.free,
                "percent": (disk.used / disk.total) * 100,
            },
        },
        "config": {
            "openai_configured": bool(settings.openai_api_key),
            "search_configured": bool(settings.google_api_key or settings.serpapi_api_key),
            "debug": settings.debug,
            "log_level": settings.log_level,
        },
    }