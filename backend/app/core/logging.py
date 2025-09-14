"""Logging configuration for the Agent UI backend."""

import logging
import logging.config
import sys
from pathlib import Path
from typing import Dict, Any

from pythonjsonlogger import jsonlogger

from app.config import settings


def setup_logging() -> None:
    """Setup application logging configuration."""
    
    # Create logs directory
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Configure logging
    logging_config = get_logging_config()
    logging.config.dictConfig(logging_config)
    
    # Set root logger level
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level.upper()))


def get_logging_config() -> Dict[str, Any]:
    """Get logging configuration dictionary."""
    
    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "detailed": {
                "format": "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d: %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "()": jsonlogger.JsonFormatter,
                "format": "%(asctime)s %(name)s %(levelname)s %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "level": "INFO",
                "class": "logging.StreamHandler",
                "formatter": "standard",
                "stream": sys.stdout,
            },
            "file": {
                "level": "DEBUG",
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "detailed",
                "filename": "logs/app.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
            "error_file": {
                "level": "ERROR",
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "json",
                "filename": "logs/error.log",
                "maxBytes": 10485760,  # 10MB
                "backupCount": 5,
                "encoding": "utf8",
            },
        },
        "loggers": {
            "app": {
                "level": "DEBUG",
                "handlers": ["console", "file", "error_file"],
                "propagate": False,
            },
            "uvicorn": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "uvicorn.error": {
                "level": "INFO",
                "handlers": ["console", "error_file"],
                "propagate": False,
            },
            "uvicorn.access": {
                "level": "INFO",
                "handlers": ["console"],
                "propagate": False,
            },
            "langchain": {
                "level": "WARNING",
                "handlers": ["console", "file"],
                "propagate": False,
            },
            "httpx": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
            "httpcore": {
                "level": "WARNING",
                "handlers": ["console"],
                "propagate": False,
            },
        },
        "root": {
            "level": "INFO",
            "handlers": ["console", "file"],
        },
    }


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(f"app.{name}")


# Create a default logger instance
logger = get_logger("default")