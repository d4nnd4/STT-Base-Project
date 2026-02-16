"""
Pytest configuration and fixtures for backend tests.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def sample_audio_data():
    """Provide sample audio data in bytes (simulated WAV file with tone)."""
    import struct
    import math
    
    # WAV parameters
    sample_rate = 16000
    duration = 1.0  # 1 second
    frequency = 440  # 440 Hz tone (A note)
    num_samples = int(sample_rate * duration)
    
    # Generate a simple sine wave tone (simulates speech-like audio)
    samples = []
    for i in range(num_samples):
        # Sine wave with amplitude variation to simulate speech
        value = int(16000 * math.sin(2 * math.pi * frequency * i / sample_rate))
        # Add some amplitude modulation
        envelope = 0.5 + 0.5 * math.sin(2 * math.pi * 2 * i / sample_rate)
        value = int(value * envelope)
        samples.append(value)
    
    # Pack samples as 16-bit PCM
    audio_samples = b''.join(struct.pack('<h', s) for s in samples)
    
    # Calculate sizes
    data_size = len(audio_samples)
    chunk_size = 36 + data_size
    
    # WAV header (mono, 16kHz, 16-bit PCM)
    wav_header = struct.pack('<4sI4s4sIHHIIHH4sI',
        b'RIFF',
        chunk_size,
        b'WAVE',
        b'fmt ',
        16,          # Subchunk1Size (16 for PCM)
        1,           # AudioFormat (1 for PCM)
        1,           # NumChannels (1 = mono)
        sample_rate, # SampleRate
        sample_rate * 2,  # ByteRate
        2,           # BlockAlign
        16,          # BitsPerSample
        b'data',
        data_size
    )
    
    return wav_header + audio_samples


@pytest.fixture
def sample_text_with_pii():
    """Sample text containing PII for redaction testing."""
    return "My phone is 555-123-4567 and email is john@example.com"


@pytest.fixture
def sample_text_no_pii():
    """Sample text without PII."""
    return "I would like to schedule an appointment for next Tuesday at 2 PM"


@pytest.fixture
def sample_intent_texts():
    """Sample texts for various intent classifications."""
    return {
        "appointment": "I need to schedule a doctor appointment for next week",
        "financial": "What are my insurance copay amounts",
        "inquiry": "What are your office hours",
        "unknown": "The weather is nice today"
    }
