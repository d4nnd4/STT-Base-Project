"""
Application configuration management module.

This module defines configuration settings for the FrontOffice Voice Console,
including provider selection, model paths, and runtime options based on the project's
settings.

Note: Whisper is prone to fail if installed with this codebase, please only proceed with Piper
at the moment with the Websocket made for basic streaming.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal


class Settings(BaseSettings):
    """
    App settings loaded from environment variables.
    
    All settings can be overridden via environment variables with the same name.
    
    Example:
        export STT_PROVIDER=aws_transcribe
        export PRIVACY_MODE=true
    """
    
    # Application
    app_name: str = "FrontOffice Voice Console"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Provider Selection
    # TODO: When another TTS model/service is included, please use the .env file settings.
    stt_provider: Literal["faster_whisper", "vosk", "aws_transcribe"] = "faster_whisper"
    tts_provider: Literal["piper", "coqui", "aws_polly"] = "piper"

    whisper_model_size: str = "base"  # tiny, base, small, medium, large
    whisper_model_path: str = "/app/models/whisper"
    
    piper_model_path: str = "/app/models/piper"
    piper_voice: str = "en_US-lessac-medium"
    
    # Privacy & Security
    privacy_mode: bool = True
    enable_audio_retention: bool = False
    audio_retention_days: int = 0
    
    # Intent Recognition
    intent_confidence_threshold: float = 0.6
    
    # Timeouts (in milliseconds)
    stt_timeout_ms: int = 30000
    tts_timeout_ms: int = 15000
    intent_timeout_ms: int = 5000
    
    # CORS
    # TODO: This must be changed to a .env file when whisper is implemented
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
