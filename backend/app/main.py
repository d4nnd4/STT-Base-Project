"""
This module servers as the FrontOffice Voice Console - FastAPI Application.

This is the main entry point for the whole backend API server, providing
STT, TTS, and intent recognition services for medical front office workflows.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from .core.config import settings
from .api.routes import router as api_router
from .telemetry.logging_config import setup_logging, get_logger

setup_logging(debug=settings.debug)
logger = get_logger(__name__)

app = FastAPI(
    title=settings.app_name,
    description=(
        "Production-grade Voice AI API for medical front office workflows. "
        "Provides speech-to-text transcription, intent recognition, and "
        "text-to-speech synthesis with privacy-focused design."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Adds request processing time to response headers.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Handles unexpected exceptions gracefully.
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred",
            "detail": str(exc) if settings.debug else None
        }
    )


# Include API routes
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """
    Application startups tasks.
    """
    logger.info(f"Starting {settings.app_name}")
    logger.info(f"STT Provider: {settings.stt_provider}")
    logger.info(f"TTS Provider: {settings.tts_provider}")
    logger.info(f"Privacy Mode: {settings.privacy_mode}")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Application shutdowns tasks.
    """
    logger.info(f"Shutting down {settings.app_name}")


@app.get("/")
async def root():
    """
    Root endpoint - provides API information.
    """
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
        "health": "/api/healthz",
        "readiness": "/api/readyz"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
