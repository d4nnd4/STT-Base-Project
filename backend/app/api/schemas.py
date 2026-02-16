"""
Pydantic schemas for API request/response validation module.

This module defines all data models for the API, ensuring type safety
and automatic validation/documentation.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum


class IntentType(str, Enum):
    """
    Valid intent types for all front office workflows.
    """
    APPOINTMENT_SCHEDULING = "APPOINTMENT_SCHEDULING"
    FINANCIAL_CLEARANCE = "FINANCIAL_CLEARANCE"
    GENERAL_INQUIRY = "GENERAL_INQUIRY"
    UNKNOWN = "UNKNOWN"


class TranscribeRequest(BaseModel):
    """
    Request schema for STT transcription.
    """
    language: Optional[str] = Field(None, description="Language code (e.g., 'en', 'es')")
    privacy_mode: bool = Field(True, description="Enable PII redaction")


class TranscribeResponse(BaseModel):
    """
    Response schema for STT transcription.
    """
    request_id: str = Field(..., description="Unique request identifier")
    text: str = Field(..., description="Transcribed text")
    text_redacted: Optional[str] = Field(None, description="Redacted text (if privacy mode enabled)")
    confidence: float = Field(..., description="Transcription confidence (0-1)")
    language: Optional[str] = Field(None, description="Detected language")
    duration_ms: int = Field(..., description="Transcription duration in milliseconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": "req_abc123",
                "text": "I need an appointment next Tuesday at 2 PM",
                "text_redacted": "I need an appointment next Tuesday at 2 PM",
                "confidence": 0.95,
                "language": "en",
                "duration_ms": 1234
            }
        }


class IntentRequest(BaseModel):
    """
    Request schema for intent classification.
    """
    text: str = Field(..., description="Text to classify", min_length=1)
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I need an appointment next Tuesday at 2 PM"
            }
        }


class IntentResponse(BaseModel):
    """
    Response schema for intent classification.
    """
    request_id: str = Field(..., description="Unique request identifier")
    intent: IntentType = Field(..., description="Classified intent")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Classification confidence")
    entities: Dict[str, Any] = Field(default_factory=dict, description="Extracted entities")
    handoff_recommended: bool = Field(..., description="Whether human handoff is recommended")
    reasoning: Optional[str] = Field(None, description="Classification reasoning")
    response_text: str = Field(..., description="Generated natural language response")
    duration_ms: int = Field(..., description="Processing duration in milliseconds")
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": "req_abc123",
                "intent": "APPOINTMENT_SCHEDULING",
                "confidence": 0.85,
                "entities": {
                    "date": "tuesday",
                    "time": "2 pm"
                },
                "handoff_recommended": False,
                "reasoning": "Matched 2 keywords for APPOINTMENT_SCHEDULING",
                "response_text": "I can help you schedule an appointment for tuesday at 2 pm...",
                "duration_ms": 42
            }
        }


class TTSRequest(BaseModel):
    """
    Request schema for text-to-speech synthesis.
    """
    text: str = Field(..., description="Text to synthesize", min_length=1, max_length=5000)
    voice: Optional[str] = Field(None, description="Voice identifier")
    speed: float = Field(1.0, ge=0.5, le=2.0, description="Speech rate (0.5-2.0)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I can help you schedule an appointment. What day works best for you?",
                "voice": "en_US-lessac-medium",
                "speed": 1.0
            }
        }


class TTSResponse(BaseModel):
    """
    Response schema for TTS synthesis (metadata only, audio in response body).
    """
    request_id: str = Field(..., description="Unique request identifier")
    duration_ms: int = Field(..., description="Synthesis duration in milliseconds")
    text_length: int = Field(..., description="Length of synthesized text")
    audio_format: str = Field(..., description="Audio format (e.g., 'wav', 'mp3')")
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": "req_abc123",
                "duration_ms": 856,
                "text_length": 67,
                "audio_format": "wav"
            }
        }


class HealthResponse(BaseModel):
    """
    Response schema for health check endpoints.
    """
    status: str = Field(..., description="Health status")
    timestamp: str = Field(..., description="Check timestamp (ISO format)")
    providers: Optional[Dict[str, bool]] = Field(None, description="Provider health status")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "timestamp": "2024-02-14T10:30:00Z",
                "providers": {
                    "stt": True,
                    "tts": True,
                    "intent": True
                }
            }
        }


class ErrorResponse(BaseModel):
    """
    Standard error response schema.
    """
    request_id: Optional[str] = Field(None, description="Request identifier (if available)")
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    detail: Optional[str] = Field(None, description="Additional error details")
    
    class Config:
        json_schema_extra = {
            "example": {
                "request_id": "req_abc123",
                "error": "TranscriptionError",
                "message": "Failed to transcribe audio",
                "detail": "Audio format not supported"
            }
        }


class PartialTranscriptMessage(BaseModel):
    """
    WebSocket message for partial transcriptions.
    """
    type: str = Field("partial_transcript", description="Message type")
    text: str = Field(..., description="Partial transcript text")
    is_final: bool = Field(..., description="Whether this is the final transcript")
    confidence: Optional[float] = Field(None, description="Confidence score")


class WebSocketError(BaseModel):
    """
    This is for the WebSocket's error message.
    """
    type: str = Field("error", description="Message type")
    error: str = Field(..., description="Error message")
