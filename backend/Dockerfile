# This image solves import issues with transitive deps
FROM python:3.11-slim-bookworm as base

# Install deps:
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    wget \
    curl \
    pkg-config \
    libavformat-dev \
    libavcodec-dev \
    libavdevice-dev \
    libavutil-dev \
    libavfilter-dev \
    libswscale-dev \
    libswresample-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# Upgraded pip in case the existing instance is outdated:
RUN python -m pip install --upgrade pip

# Install project deps
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create model dirs
RUN mkdir -p /app/models/whisper /app/models/piper

# Download Whisper base model on build (caching in layer): Whisper is still unstable
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('base', device='cpu', compute_type='int8', download_root='/app/models/whisper')"

# Download Piper (en_US-lessac-medium is clear male voice)
# You can check Piper's models at: https://github.com/rhasspy/piper/releases
RUN wget -q https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx -O /app/models/piper/en_US-lessac-medium.onnx && \
    wget -q https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json -O /app/models/piper/en_US-lessac-medium.onnx.json

# Backend port within the orchestrator 
EXPOSE 8000

# Health check, this should be done on server side when deployed
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8000/api/healthz || exit 1

# Run backend app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
