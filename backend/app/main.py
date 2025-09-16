"""FastAPI application main entry point."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import chat, health
from app.config import settings
from app.core.exceptions import AgentUIException
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with service pre-warming."""
    # Startup
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info(f"Starting {settings.app_name} v{settings.version}")
    logger.info(f"Debug mode: {settings.debug}")
    
    # 🔥 预初始化关键服务以避免第一次请求的冷启动延迟
    try:
        logger.info("🚀 Pre-warming critical services...")
        
        # 预初始化LLM服务
        logger.info("Initializing LLM service...")
        from app.services.llm_service import get_llm_service
        llm_service = get_llm_service()
        logger.info("✅ LLM service pre-warmed successfully")
        
        # 预初始化DeepResearch Agent
        logger.info("Initializing DeepResearch agent...")
        from app.agents.deepresearch import DeepResearchAgent
        agent = DeepResearchAgent()
        logger.info("✅ DeepResearch agent pre-warmed successfully")
        
        # 预初始化工具注册表
        logger.info("Initializing tool registry...")
        from app.tools.registry import tool_registry
        logger.info("✅ Tool registry pre-warmed successfully")
        
        logger.info("🎉 All critical services pre-warmed, ready for requests!")
        
    except Exception as e:
        logger.error(f"❌ Service pre-warming failed: {e}", exc_info=True)
        # 不要因为预热失败而阻止应用启动
        logger.warning("⚠️  Application will continue without pre-warming")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="Agent UI Backend with FastAPI and LangChain",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AgentUIException)
async def agent_ui_exception_handler(request, exc: AgentUIException):
    """Handle custom AgentUI exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "details": exc.details,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions."""
    logger = logging.getLogger(__name__)
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An internal server error occurred",
            "details": str(exc) if settings.debug else None,
        },
    )


# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# Mount static files for testing
import os
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)))
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": settings.version,
        "status": "running",
        "docs": "/docs" if settings.debug else None,
        "test_pages": {
            "deepresearch_agent": "/static/test_stream.html",
            "ai_developer_agent": "/static/test_ai_developer.html"
        } if settings.debug else None,
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )