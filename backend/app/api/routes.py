"""
Route handlers for STT, TTS, Intent endpoints, and websocket's requests
module.

This module defines all API endpoints with proper documentation,
error handling, and request tracking.
"""

import io
import time
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from fastapi.responses import StreamingResponse

from ..api.schemas import (
    TranscribeRequest, TranscribeResponse,
    IntentRequest, IntentResponse,
    TTSRequest, ErrorResponse,
    HealthResponse
)
from ..providers.base import ProviderException
from ..telemetry.logging_config import get_logger, request_id_ctx, log_with_timing
from ..utils.redaction import redact_transcript
from ..core.config import settings

logger = get_logger(__name__)

router = APIRouter()

def generate_request_id() -> str:
    return f"req_{uuid.uuid4().hex[:12]}"


@router.post(
    "/stt/transcribe",
    response_model=TranscribeResponse,
    summary="Transcribe audio to text",
    description="Upload audio file and receive transcribed text with confidence score and timing information."
)
async def transcribe_audio(
    file: UploadFile = File(..., description="Audio file (WAV, MP3, etc.)"),
    language: str = None,
    privacy_mode: bool = True
) -> TranscribeResponse:
    """
    Transcribe uploaded audio file to text. This endpoint should be the main point of
    the application at the moment until Whisper is implemented.
    
    Args:
        file: Audio file to transcribe
        language: Optional language code
        privacy_mode: Enable PII redaction
        
    Returns:
        TranscribeResponse with transcribed text and metadata
        
    Raises:
        HTTPException: If transcription fails
    """
    request_id = generate_request_id()
    request_id_ctx.set(request_id)
    
    start_time = time.time()
    logger.info(f"Transcription request started", extra={"extra_fields": {"file_name": file.filename}})
    
    try:
        from ..providers.stt_whisper import FasterWhisperProvider
        
        stt_provider = FasterWhisperProvider(
            model_size=settings.whisper_model_size
        )
        
        audio_bytes = await file.read()
        audio_io = io.BytesIO(audio_bytes)
        result = await stt_provider.transcribe(audio_io, language=language)
        
        text_redacted = None
        if privacy_mode:
            text_redacted = redact_transcript(result.text, aggressive=True)

        duration_ms = int((time.time() - start_time) * 1000)
        
        log_with_timing(
            logger,
            "Transcription completed",
            duration_ms=duration_ms,
            confidence=result.confidence
        )
        
        return TranscribeResponse(
            request_id=request_id,
            text=result.text,
            text_redacted=text_redacted,
            confidence=result.confidence,
            language=result.language,
            duration_ms=duration_ms
        )
    
    except ProviderException as e:
        logger.error(f"Provider error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post(
    "/intent/route",
    response_model=IntentResponse,
    summary="Classify intent from text",
    description="Classify user intent and extract entities from transcribed text."
)
async def route_intent(request: IntentRequest) -> IntentResponse:
    """
    Classify intent from user input text endpoint.
    
    Args:
        request: IntentRequest with text to classify
        
    Returns:
        IntentResponse with classified intent, entities, and generated response
        
    Raises:
        HTTPException: If classification fails
    """
    request_id = generate_request_id()
    request_id_ctx.set(request_id)
    
    start_time = time.time()
    logger.info("Intent classification started")
    
    try:
        from ..nlu.intent_router import RuleBasedIntentRouter, generate_response
        
        intent_router = RuleBasedIntentRouter(
            confidence_threshold=settings.intent_confidence_threshold
        )
        
        result = await intent_router.route(request.text)
        
        response_text = generate_response(result)
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_with_timing(
            logger,
            "Intent classification completed",
            duration_ms=duration_ms,
            intent=result.intent,
            confidence=result.confidence
        )
        
        return IntentResponse(
            request_id=request_id,
            intent=result.intent,
            confidence=result.confidence,
            entities=result.entities,
            handoff_recommended=result.handoff_recommended,
            reasoning=result.reasoning,
            response_text=response_text,
            duration_ms=duration_ms
        )
    
    except Exception as e:
        logger.error(f"Intent classification error: {e}")
        raise HTTPException(status_code=500, detail="Intent classification failed")


@router.post(
    "/tts/speak",
    summary="Convert text to speech",
    description="Generate speech audio from text using TTS provider.",
    responses={
        200: {
            "content": {"audio/wav": {}},
            "description": "WAV audio file"
        }
    }
)
async def speak_text(request: TTSRequest) -> Response:
    """
    Convert text to speech audio endpoint.
    
    Args:
        request: TTSRequest with text and voice options
        
    Returns:
        Audio file as streaming response
        
    Raises:
        HTTPException: If synthesis fails
    """
    request_id = generate_request_id()
    request_id_ctx.set(request_id)
    
    start_time = time.time()
    logger.info("TTS synthesis started", extra={"extra_fields": {"text_length": len(request.text)}})
    
    try:
        from ..providers.tts_piper import PiperTTSProvider
        
        tts_provider = PiperTTSProvider(
            model_path=settings.piper_model_path,
            voice=settings.piper_voice
        )
        
        audio_bytes = await tts_provider.synthesize(
            text=request.text,
            voice=request.voice,
            speed=request.speed
        )
        
        duration_ms = int((time.time() - start_time) * 1000)
        
        log_with_timing(
            logger,
            "TTS synthesis completed",
            duration_ms=duration_ms,
            audio_size=len(audio_bytes)
        )
        
        return Response(
            content=audio_bytes,
            media_type="audio/wav",
            headers={
                "X-Request-ID": request_id,
                "X-Duration-MS": str(duration_ms),
                "Content-Disposition": "inline; filename=speech.wav"
            }
        )
    
    except ProviderException as e:
        logger.error(f"Provider error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get(
    "/healthz",
    response_model=HealthResponse,
    summary="Basic health check",
    description="Returns basic liveness status (does not check providers)."
)
async def health_check() -> HealthResponse:
    """
    Basic health check endpoint to check whether the service is active.
    
    Returns:
        HealthResponse indicating service is alive
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )


@router.get(
    "/readyz",
    response_model=HealthResponse,
    summary="Readiness check",
    description="Checks if all providers are operational and ready to serve requests."
)
async def readiness_check() -> HealthResponse:
    """
    Readiness check endpoint - verifies if all providers are operational.
    
    Returns:
        HealthResponse with provider status details
        
    Raises:
        HTTPException: If any critical provider is unhealthy
    """
    try:
        from ..providers.stt_whisper import FasterWhisperProvider
        from ..providers.tts_piper import PiperTTSProvider
        from ..nlu.intent_router import RuleBasedIntentRouter
        
        # Check each provider
        stt_provider = FasterWhisperProvider(model_size=settings.whisper_model_size)
        tts_provider = PiperTTSProvider(model_path=settings.piper_model_path)
        intent_router = RuleBasedIntentRouter()
        
        stt_healthy = await stt_provider.health_check()
        tts_healthy = await tts_provider.health_check()
        intent_healthy = await intent_router.health_check()
        
        providers_status = {
            "stt": stt_healthy,
            "tts": tts_healthy,
            "intent": intent_healthy
        }
        
        all_healthy = all(providers_status.values())
        
        if not all_healthy:
            logger.warning(f"Some providers unhealthy: {providers_status}")
            return HealthResponse(
                status="degraded",
                timestamp=datetime.utcnow().isoformat() + "Z",
                providers=providers_status
            )
        
        return HealthResponse(
            status="ready",
            timestamp=datetime.utcnow().isoformat() + "Z",
            providers=providers_status
        )
    
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        raise HTTPException(status_code=503, detail="Service not ready")
