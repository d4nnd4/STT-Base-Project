"""
This module servers for structured logging configuration with request tracing across the codebase.

This module sets up JSON-formatted logging messages with request IDs for tracing
requests through the entire transformation pipeline.
"""

import logging
import sys
import json
from typing import Optional
from contextvars import ContextVar
from datetime import datetime


request_id_ctx: ContextVar[Optional[str]] = ContextVar('request_id', default=None)


class StructuredFormatter(logging.Formatter):
    """
    This class is a JSON formatter for structured logging.
    
    It includes request_id from context and standardized field names.
    """
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Formats log records as JSON.
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "request_id": request_id_ctx.get(),
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        if hasattr(record, 'extra_fields'):
            log_data.update(record.extra_fields)
        
        return json.dumps(log_data)


def setup_logging(debug: bool = False):
    """
    This configures application logging.
    
    Args:
        debug: Enable debug-level logging within the pipeline
        
    Example:
        setup_logging(debug=True)
        logger = logging.getLogger(__name__)
        logger.info("Application started")
    """
    level = logging.DEBUG if debug else logging.INFO
    
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.addHandler(handler)
    
    # This reduces noise from third-party libraries when accessing the streaming websocket
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    This gets a logger instance with structured formatting.
    
    Args:
        name: Any logger name (typically __name__)
        
    Returns:
        A configured logger instance
    """
    return logging.getLogger(name)


def log_with_timing(logger: logging.Logger, message: str, duration_ms: int, **extra):
    """
    This logs a message with timing information.
    
    Args:
        logger: Logger instance
        message: Log message
        duration_ms: Duration in milliseconds
        **extra: Additional fields to include
        
    Example:
        log_with_timing(logger, "STT completed", duration_ms=1234, confidence=0.95)
    """
    extra_fields = {"duration_ms": duration_ms, **extra}
    logger.info(message, extra={"extra_fields": extra_fields})
