"""
Base provider module with interfaces for STT, TTS, and Intent Recognition.

This module allows the codebase to expand and to migrate to other NLP models.

This module defines abstract base classes that all provider implementations
must follow. This allows for easy swapping between local and cloud providers
without changing application logic.
"""

from abc import ABC, abstractmethod
from typing import BinaryIO, Optional, Any, Dict
from pydantic import BaseModel


class TranscriptionResult(BaseModel):
    """
    Result from speech-to-text transcription.
    """
    text: str
    confidence: float
    language: Optional[str] = None
    duration_ms: int
    
    
class PartialTranscription(BaseModel):
    """
    Partial transcription for streaming STT.
    """
    text: str
    is_final: bool
    confidence: Optional[float] = None


class STTProvider(ABC):
    """
    Abstract interface for Speech-to-Text providers.
    
    Implementations can be local (Faster Whisper, Vosk) or cloud-based
    (AWS Transcribe, Google Speech-to-Text, Azure Speech).
    
    Example:
        provider = FasterWhisperProvider()
        result = await provider.transcribe(audio_data)
        print(result.text)
    """
    
    @abstractmethod
    async def transcribe(self, audio: BinaryIO, language: Optional[str] = None) -> TranscriptionResult:
        """
        Transcribe audio to text.
        
        Args:
            audio: Audio file-like object (WAV, MP3, etc.)
            language: Optional language code (e.g., 'en', 'es')
            
        Returns:
            TranscriptionResult with text and metadata
            
        Raises:
            ProviderException: If transcription fails
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the STT provider is operational.
        
        Returns:
            True if provider is healthy, False otherwise
        """
        pass


class TTSProvider(ABC):
    """
    Abstract interface for Text-to-Speech providers.
    
    Implementations can be local (Piper, Coqui TTS) or cloud-based
    (AWS Polly, Google Text-to-Speech, Azure Speech).
    
    Example:
        provider = PiperTTSProvider()
        audio_bytes = await provider.synthesize("Hello, how can I help you?")
    """
    
    @abstractmethod
    async def synthesize(
        self, 
        text: str, 
        voice: Optional[str] = None,
        speed: float = 1.0
    ) -> bytes:
        """
        Convert text to speech audio.
        
        Args:
            text: Text to synthesize
            voice: Optional voice identifier
            speed: Speech rate (0.5 = half speed, 2.0 = double speed)
            
        Returns:
            Audio bytes (WAV format)
            
        Raises:
            ProviderException: If synthesis fails
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the TTS provider is operational.
        
        Returns:
            True if provider is healthy, False otherwise
        """
        pass


class IntentResult(BaseModel):
    """
    Results from the intent recognition process.
    """
    intent: str
    confidence: float
    entities: Dict[str, Any]
    handoff_recommended: bool
    reasoning: Optional[str] = None


class IntentRouter(ABC):
    """
    Abstract interface for intent recognition and routing.
    
    This can be implemented as:
    - Rule-based pattern matching
    - ML-based classification
    - Cloud NLU services (AWS Lex, Dialogflow, LUIS)
    
    Example:
        router = RuleBasedIntentRouter()
        result = await router.route("I need an appointment next Tuesday")
        print(result.intent)  # APPOINTMENT_SCHEDULING
    """
    
    @abstractmethod
    async def route(self, text: str) -> IntentResult:
        """
        Classify user intent from transcribed text.
        
        Args:
            text: Transcribed user input
            
        Returns:
            IntentResult with intent, confidence, and extracted entities
        """
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """
        Check if the intent router is operational.
        
        Returns:
            True if router is healthy, False otherwise
        """
        pass


class ProviderException(Exception):
    """
    Base exception for provider errors.
    """
    pass
