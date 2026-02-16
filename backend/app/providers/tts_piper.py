"""
Piper TTS provider implementation module.

This module implements the TTSProvider interface using Piper TTS,
a fast, local text-to-speech system with high-quality voices.

Note: So far, only one type of voice has been implemented to the solution.
"""

import subprocess
import time
import tempfile
import os
from typing import Optional

from ..providers.base import TTSProvider, ProviderException
from ..telemetry.logging_config import get_logger

logger = get_logger(__name__)


class PiperTTSProvider(TTSProvider):
    """
    TTS provider class using Piper for local speech synthesis.
    
    Piper is a fast, local neural text-to-speech system that produces
    high-quality speech. It's designed to run efficiently on CPU.
    
    Voice models available:
    - en_US-lessac-medium: American English, clear male voice
    - en_US-amy-medium: American English, female voice
    - en_GB-alan-medium: British English, male voice
    
    Example:
        provider = PiperTTSProvider(voice="en_US-lessac-medium")
        audio_bytes = await provider.synthesize("Hello, how can I help you?")
    """
    
    def __init__(
        self,
        piper_executable: str = "piper",
        model_path: str = "/app/models/piper",
        voice: str = "en_US-lessac-medium"
    ):
        """
        Initialize Piper TTS provider.
        
        Args:
            piper_executable: Path to piper binary (defaults to 'piper' in PATH)
            model_path: Directory containing voice models
            voice: Voice model name
        """
        self.piper_executable = piper_executable
        self.model_path = model_path
        self.voice = voice
        self.model_file = os.path.join(model_path, f"{voice}.onnx")
        self.is_available = False
        self._check_availability()
    
    def _check_availability(self):
        """
        Checks if Piper is available and models exist.
        """
        try:
            result = subprocess.run(
                [self.piper_executable, "--help"], 
                capture_output=True, 
                timeout=5
            )

            if result.stdout or result.stderr:
                logger.info(f"Piper executable found at: {self.piper_executable}")
                
                if os.path.exists(self.model_file):
                    logger.info(f"Model found: {self.model_file}")
                    self.is_available = True
                else:
                    logger.warning(f"Model not found: {self.model_file}, will use fallback")
            else:
                logger.warning("Piper executable check failed, will use fallback")
                
        except (FileNotFoundError, subprocess.TimeoutExpired) as e:
            logger.warning(f"Piper not available: {e}, will use fallback")
    
    async def synthesize(
        self,
        text: str,
        voice: Optional[str] = None,
        speed: float = 1.0
    ) -> bytes:
        """
        This method converts text to speech using Piper.
        
        Args:
            text: Text to synthesize
            voice: Optional voice override
            speed: Speech rate (not implemented in basic Piper)
            
        Returns:
            WAV audio bytes
            
        Raises:
            ProviderException: If synthesis fails
        """
        start_time = time.time()
        
        if not self.is_available:
            logger.warning("Piper not available, using fallback audio")
            return self._generate_fallback_audio(text)
        
        try:
            voice_model = voice or self.voice
            model_file = os.path.join(self.model_path, f"{voice_model}.onnx")
            
            if not os.path.exists(model_file):
                logger.warning(f"Model file not found: {model_file}, using fallback")
                return self._generate_fallback_audio(text)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_output:
                output_path = tmp_output.name
            
            try:
                process = subprocess.Popen(
                    [
                        self.piper_executable,
                        "--model", model_file,
                        "--output_file", output_path
                    ],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                
                stdout, stderr = process.communicate(input=text, timeout=15)
                
                if process.returncode != 0:
                    logger.error(f"Piper failed: {stderr}")
                    raise ProviderException(f"Piper synthesis failed: {stderr}")
                
                with open(output_path, "rb") as f:
                    audio_bytes = f.read()
                
                duration_ms = int((time.time() - start_time) * 1000)
                logger.info(f"TTS synthesis completed in {duration_ms}ms")
                
                return audio_bytes
            
            finally:
                if os.path.exists(output_path):
                    os.unlink(output_path)
        
        except subprocess.TimeoutExpired:
            logger.error("Piper synthesis timed out")
            raise ProviderException("TTS synthesis timeout")
        except FileNotFoundError:
            logger.error("Piper executable or model not found")
            return self._generate_fallback_audio(text)
        except Exception as e:
            logger.error(f"TTS synthesis failed: {e}")
            raise ProviderException(f"TTS error: {e}")
    
    def _generate_fallback_audio(self, text: str) -> bytes:
        """
        This method generates simple fallback audio when Piper is unavailable.
        
        This creates a minimal WAV file with silence for demo purposes.
        In production, you might return an error or use a cloud TTS fallback.
        
        Args:
            text: Text that was supposed to be synthesized
            
        Returns:
            Silent WAV audio bytes
        """
        logger.warning("Using fallback silent audio (Piper unavailable)")
        
        sample_rate = 16000
        duration = 2
        num_samples = sample_rate * duration
        
        # This is based in data chunks for monostereo WAV files
        wav_header = bytes([
            0x52, 0x49, 0x46, 0x46,  # "RIFF"
            0x00, 0x00, 0x00, 0x00,  # File size (placeholder)
            0x57, 0x41, 0x56, 0x45,  # "WAVE"
            0x66, 0x6D, 0x74, 0x20,  # "fmt "
            0x10, 0x00, 0x00, 0x00,  # Chunk size (16)
            0x01, 0x00,              # Audio format (PCM)
            0x01, 0x00,              # Channels (mono)
            0x80, 0x3E, 0x00, 0x00,  # Sample rate (16000)
            0x00, 0x7D, 0x00, 0x00,  # Byte rate
            0x02, 0x00,              # Block align
            0x10, 0x00,              # Bits per sample (16)
            0x64, 0x61, 0x74, 0x61,  # "data"
            0x00, 0x00, 0x00, 0x00,  # Data size (placeholder)
        ])
        
        audio_data = bytes(num_samples * 2)  # 2 bytes per 16-bit sample
        file_size = len(wav_header) + len(audio_data) - 8
        data_size = len(audio_data)
        
        wav_header = bytearray(wav_header)
        wav_header[4:8] = file_size.to_bytes(4, 'little')
        wav_header[40:44] = data_size.to_bytes(4, 'little')
        
        return bytes(wav_header) + audio_data
    
    async def health_check(self) -> bool:
        """
        This method checks whether Piper TTS is operational or not.
        
        Returns:
            True if Piper is available, False otherwise
        """
        try:
            result = subprocess.run(
                [self.piper_executable, "--version"],
                capture_output=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
