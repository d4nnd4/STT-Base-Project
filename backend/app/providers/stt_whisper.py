"""
Faster Whisper STT provider module implementation.

This module implements the STTProvider interface using the faster-whisper
library, which provides efficient CPU/GPU inference for OpenAI's Whisper models.

Note: This module is yet to be completed, as whisper has to be resolved before use.
Currently it supports its use via API, but streaming support has to be added with Trio.
"""

import io
import time
from typing import BinaryIO, Optional
import tempfile
import os

from ..providers.base import STTProvider, TranscriptionResult, ProviderException
from ..telemetry.logging_config import get_logger

logger = get_logger(__name__)


class FasterWhisperProvider(STTProvider):
    """
    STT provider class using Faster Whisper for local transcription.
    
    Faster Whisper is a reimplementation of OpenAI's Whisper model using
    CTranslate2, which is significantly faster than the original implementation.
    
    Models available: tiny, base, small, medium, large
    - tiny: Fastest, least accurate (~75MB)
    - base: Good balance (~145MB) - recommended for demos
    - small: Better accuracy (~475MB)
    
    Example:
        provider = FasterWhisperProvider(model_size="base")
        with open("audio.wav", "rb") as f:
            result = await provider.transcribe(f)
            print(result.text)
    """
    
    def __init__(self, model_size: str = "base", device: str = "cpu", compute_type: str = "int8"):
        """
        Initialize Faster Whisper provider.
        
        Args:
            model_size: Model size (tiny, base, small, medium, large)
            device: Device to use ("cpu" or "cuda")
            compute_type: Computation type ("int8", "float16", "float32")
        """
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """
        Loads the Whisper model.
        """
        try:
            from faster_whisper import WhisperModel
            
            logger.info(f"Loading Faster Whisper model: {self.model_size}")
            self.model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )
            logger.info("Faster Whisper model loaded successfully")
        except ImportError:
            logger.error("faster-whisper not installed")
            raise ProviderException("faster-whisper library not available")
        except Exception as e:
            logger.error(f"Failed to load Whisper model: {e}")
            raise ProviderException(f"Model initialization failed: {e}")
    
    async def transcribe(self, audio: BinaryIO, language: Optional[str] = None) -> TranscriptionResult:
        """
        Transcribe audio using Faster Whisper.
        
        Args:
            audio: Audio file (WAV, MP3, etc.)
            language: Optional language code (e.g., 'en', 'es')
            
        Returns:
            TranscriptionResult with transcribed text
            
        Raises:
            ProviderException: If transcription fails
        """
        if not self.model:
            raise ProviderException("Model not initialized")
        
        start_time = time.time()
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                audio_bytes = audio.read()
                tmp_file.write(audio_bytes)
                tmp_path = tmp_file.name
            
            try:
                segments, info = self.model.transcribe(
                    tmp_path,
                    language=language,
                    beam_size=5,
                    vad_filter=True,
                )
                
                full_text = " ".join(segment.text.strip() for segment in segments)
                
                duration_ms = int((time.time() - start_time) * 1000)
                
                confidence = 0.95  
                
                logger.info(f"Transcription completed in {duration_ms}ms")
                
                return TranscriptionResult(
                    text=full_text.strip(),
                    confidence=confidence,
                    language=info.language if hasattr(info, 'language') else language,
                    duration_ms=duration_ms
                )
            
            # Clean up temp files after operation succeeds
            finally:
                os.unlink(tmp_path)
        
        except Exception as e:
            logger.error(f"Transcription failed: {e}")
            raise ProviderException(f"Transcription error: {e}")
    
    async def health_check(self) -> bool:
        """
        Check if Faster Whisper is operational.
        
        Returns:
            True if model is loaded, False otherwise
        """
        return self.model is not None


class VoskProvider(STTProvider):
    """
    Alternative lightweight STT provider using Vosk.
    
    Vosk is lighter than Whisper but less accurate. Good for resource-constrained
    environments or when speed is more critical than accuracy.
    
    Note: This is a placeholder implementation. Vosk would need to be
    installed and configured separately.
    """
    
    def __init__(self, model_path: str = "/app/models/vosk"):
        """
        Initialize Vosk provider.
        
        Args:
            model_path: Path to Vosk model directory
        """
        self.model_path = model_path
        logger.warning("VoskProvider is not yet implemented")
    
    async def transcribe(self, audio: BinaryIO, language: Optional[str] = None) -> TranscriptionResult:
        """
        Transcribes audio using Vosk.
        """
        raise NotImplementedError("VoskProvider not yet implemented. Use FasterWhisperProvider.")
    
    async def health_check(self) -> bool:
        """
        Checks Vosk health.
        """
        return False
