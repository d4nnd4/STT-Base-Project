# STT-Base-Project

This project serves as a demonstration of works I've done in the past when it comes to TTS and STT implementations with a frontend. This is a demonstration project, so security issues are expected and documented.

---

# FrontOffice Voice Console

This project shows a production-grade voice AI application for medical front office workflows, featuring real-time speech-to-text (STT), intent recognition, and text-to-speech (TTS) with HIPAA-minded design principles. The NLP models used are applied with Piper and Whisper, but its structure allows for migration and expandability as well. A template simulating early versions of Fallout's Robco interfaces was used from another projects I used to show as portfolio projects.

## Quick Start

```bash
docker compose up --build
```

After containers are running, please refer to the following to kickstart the application:

* **Frontend UI:** [http://localhost:5173](http://localhost:5173)
* **Backend API:** [http://localhost:8000](http://localhost:8000)
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

## Demo Flow

1. Open `http://localhost:5173`
2. Click **Record** and speak a request (or upload a sample audio file if using the API directly)
3. Confirm transcript appears in the transcript area
4. Confirm intent + entities populate in the Intent Card
5. Click **Speak Response** and hear the TTS audio
6. Click export and select a format with the conversation records
7. Open backend docs at `http://localhost:8000/docs`
8. Check health endpoints: `/api/healthz`, `/api/readyz`

## Features

### Core Features

* **Speech-to-Text:** Local transcription using a stable version for Faster Whisper
* **Intent Recognition:** Rule-based classification with entity extraction, meaning keywords and timestamps for appointments

  * Appointment Scheduling
  * Financial Clearance (insurance, billing)
  * General Inquiries (hours, location, contact)
* **Text-to-Speech:** Local synthesis using one of the Piper TTS available models
* **Privacy Mode:** PII redaction for HIPAA-minded compliance. This feature is currently turned off for demonstration of the STT model.
* **Observability:** Structured logging with request tracing and latency metrics; you can check this out within the Docker container context.

### Technical Highlights

* **Provider Abstraction:** Easy swapping between local and cloud providers (AWS, Azure, GCP)
* **Type Safety:** Full TypeScript frontend + Pydantic/FastAPI backend
* **Containerized:** Single-command deployment via Docker Compose
* **Health Endpoints:** Liveness (`/healthz`) and readiness (`/readyz`) checks, accessible from the API endpoints
* **RESTful API:** OpenAPI/Swagger documentation at `/docs` with the backend port
* **Real-time Updates:** WebSocket support for streaming transcription (this is optional, but works with the current demonstration)

## Architecture

### Backend (Python + FastAPI)

```perl
backend/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── core/
│   │   └── config.py        # Configuration management
│   ├── api/
│   │   ├── routes.py        # API endpoint handlers
│   │   └── schemas.py       # Pydantic models
│   ├── providers/
│   │   ├── base.py          # Provider interfaces
│   │   ├── stt_whisper.py   # Faster Whisper STT
│   │   └── tts_piper.py     # Piper TTS
│   ├── nlu/
│   │   └── intent_router.py # Intent classification
│   ├── telemetry/
│   │   └── logging_config.py # Structured logging
│   └── utils/
│       └── redaction.py     # PII redaction
├── tests/                   # Pytest test suite
├── Dockerfile
└── requirements.txt
```

### Frontend (React + TypeScript + Vite)

```perl
frontend/
├── src/
│   ├── main.tsx            # Application entry point
│   ├── App.tsx             # Main app component
│   ├── pages/
│   │   ├── Demo.tsx        # Voice console interface
│   │   ├── Architecture.tsx # Architecture documentation
│   │   ├── Reliability.tsx  # Reliability information
│   │   └── About.tsx       # About page
│   ├── components/
│   │   ├── AudioRecorder.tsx   # Microphone recording
│   │   ├── AudioPlayer.tsx     # TTS playback
│   │   ├── TranscriptEditor.tsx
│   │   ├── IntentCard.tsx
│   │   └── DebugDrawer.tsx
│   └── lib/
│       └── api.ts          # API client
├── Dockerfile
└── package.json
```

## API Endpoints

### STT

```
POST /api/stt/transcribe
Content-Type: multipart/form-data

Returns: { text, confidence, language, duration_ms }
```

### Intent Recognition

```
POST /api/intent/route
Content-Type: application/json
Body: { text: "I need an appointment next Tuesday" }

Returns: { intent, confidence, entities, response_text }
```

### TTS

```
POST /api/tts/speak
Content-Type: application/json
Body: { text: "Hello, how can I help you?", voice: "en_US-lessac-medium" }

Returns: audio/wav binary
```

### Health Checks

```
GET /api/healthz      # Basic liveness
GET /api/readyz       # Readiness (checks all providers)
```

### Local Development

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Testing

**Backend:**

```bash
cd backend
pytest tests/ -q # for faster recollection
```

**Frontend:**

```bash
cd frontend
npm run test
```

---

## Security

### What This Project Implements

#### 1. Privacy-First Design

* **No Default Persistence:** Audio files and transcripts are not stored by default, scripts are hardcoded and are expected to be migrated when an MCP is active
* **PII Redaction:** Automatic redaction of:

  * Phone numbers (XXX-XXX-XXXX patterns)
  * Email addresses
  * Social Security Numbers
  * Common first names (with NER placeholder)
* **Privacy Mode Toggle:** Users can enable/disable server-side processing controls
* **Audit Logging:** All API requests tracked with unique request IDs
* This feature has been turned off for demonstration purposes

#### 2. Data Minimization

* Audio is processed in-memory and discarded immediately after transcription
* Only aggregate metrics are logged (duration, confidence scores)
* No raw audio bytes in logs
* Transcripts can be redacted before logging in privacy mode

#### 3. Observability Without Exposure

* **Structured Logging:** JSON logs with request tracing
* **No Sensitive Data in Logs:** PII redacted when privacy mode enabled
* **Request Correlation:** Unique request IDs for debugging without exposing user data
* **Health Checks:** Separate liveness and readiness endpoints

#### 4. Defense in Depth (Basic)

* **CORS Protection:** Configurable allowed origins
* **Input Validation:** Pydantic schemas for all API inputs
* **Error Handling:** Generic error messages to clients (no stack traces in production)
* **Timeouts:** All provider operations have configurable timeouts

### What This Project Does NOT Implement

This portfolio project intentionally **omits** these production requirements to keep it demo-friendly:

#### No Authentication & Authorization

* No user authentication (OAuth2, OIDC, SAML)
* No role-based access control (RBAC)
* No API key management
* No session management

#### No Encryption

* No encryption at rest
* No TLS/HTTPS (assumes reverse proxy handles this)
* No encrypted backups
* No key rotation

#### Neither Audit & Compliance

* No tamper-proof audit logs
* No log retention policies enforced
* No compliance reports
* No data deletion workflows

#### No Infrastructure Security

* No network segmentation
* No secrets management (HashiCorp Vault, AWS Secrets Manager)
* No container scanning
* No vulnerability management

#### No Business Continuity

* No backup and recovery procedures
* No disaster recovery plan
* Little control damage
* No high availability configuration
* No failover mechanisms

---

## Production HIPAA Compliance Roadmap

If this project were to be used in a real healthcare setting, here's what would be required:

### 1. Access Controls

**Technical Controls:**

* Implement OAuth2/OIDC authentication with MFA
* Role-based access control (RBAC) with least privilege
* Automated session timeouts (15 minutes idle)
* Unique user IDs for all access
* Terminate sessions on logout

**Administrative Controls:**

* User access reviews (quarterly)
* Workforce training on security policies
* Documented authorization procedures
* Access termination procedures

### 2. Encryption

**Data in Transit:**

* TLS 1.3 for all HTTP traffic
* Mutual TLS (mTLS) for service-to-service communication
* VPN for remote access

**Data at Rest:**

* AES-256 encryption for all stored data (if any)
* Encrypted database volumes
* Encrypted backups
* Hardware security modules (HSMs) for key management

**Key Management:**

* Automated key rotation (90 days)
* Separate keys per environment (dev/staging/prod)
* Key access logging
* Key escrow procedures

### 3. Audit Logging

**Requirements:**

* Log all PHI access (who, what, when, where, why)
* Immutable audit logs (write-once-read-many storage)
* Log retention: 6 years minimum (HIPAA requirement)
* Real-time alerting on suspicious activities
* Centralized log aggregation (SIEM)

**Logged Events:**

* Authentication attempts (success/failure)
* PHI access and modifications
* Configuration changes
* Failed authorization attempts
* System errors affecting PHI

### 4. Business Associate Agreements (BAAs)

**Required BAAs:**

* Cloud provider (AWS/Azure/GCP)
* STT/TTS service providers (if cloud-based)
* Database hosting provider
* Logging/monitoring services
* Backup/DR services

**BAA Requirements:**

* Vendor HIPAA compliance attestation
* Data processing limitations
* Breach notification obligations
* Subcontractor disclosure
* Right to audit

### 5. Data Retention & Disposal

**Retention Policies:**

* Define retention periods per data type
* Automated purging of expired data
* Patient right to request deletion
* Legal hold procedures

**Secure Disposal:**

* Cryptographic erasure (destroy keys)
* Physical media destruction (if applicable)
* Disposal certificates
* Vendor disposal verification

### 6. Risk Management

**Risk Assessment (Annual):**

* Threat modeling
* Vulnerability scanning
* Penetration testing
* Third-party security assessments

**Incident Response:**

* Documented incident response plan
* Breach notification procedures (60 days)
* Forensic investigation capabilities
* Communication templates

### 7. Infrastructure Hardening

**Network Security:**

* DMZ architecture
* Firewall rules (least privilege)
* Intrusion detection/prevention (IDS/IPS)
* DDoS protection

**Container Security:**

* Image scanning for vulnerabilities
* Signed images only
* Runtime security monitoring
* Resource limits (CPU, memory)

**Database Security:**

* Encrypted connections
* Database activity monitoring
* Parameterized queries (SQL injection prevention)
* Least privilege database roles

### 8. Monitoring & Alerting

**Metrics:**

* Failed authentication attempts (threshold: 5/minute)
* Unusual API access patterns
* High-volume data exports
* Provider health status
* Resource utilization

**Alerting:**

* PagerDuty/Opsgenie integration
* Escalation procedures
* On-call rotation
* Incident runbooks
