export default function About() {
  const technologies = [
    {
      name: 'FastAPI',
      url: 'https://github.com/tiangolo/fastapi',
      category: 'Backend Framework',
    },
    {
      name: 'Faster Whisper',
      url: 'https://github.com/guillaumekln/faster-whisper',
      category: 'Speech-to-Text',
    },
    {
      name: 'Piper TTS',
      url: 'https://github.com/rhasspy/piper',
      category: 'Text-to-Speech',
    },
    {
      name: 'React',
      url: 'https://github.com/facebook/react',
      category: 'Frontend Framework',
    },
    {
      name: 'Vite',
      url: 'https://github.com/vitejs/vite',
      category: 'Build Tool',
    },
    {
      name: 'Docker',
      url: 'https://github.com/docker',
      category: 'Containerization',
    },
    {
      name: 'Pydantic',
      url: 'https://github.com/pydantic/pydantic',
      category: 'Validation',
    },
    {
      name: 'Uvicorn',
      url: 'https://github.com/encode/uvicorn',
      category: 'ASGI Server',
    },
  ]

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold pip-text pip-glow tracking-wider">
          PROJECT DOCUMENTATION
        </h1>
        <div className="text-sm pip-text opacity-70">
          FRONTOFFICE VOICE CONSOLE v1.0.0-demo
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Mission Statement */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ MISSION STATEMENT ]
          </div>
          <p className="pip-text leading-relaxed">
            THIS SYSTEM REPRESENTS A PRODUCTION-GRADE DEMONSTRATION OF REAL-TIME VOICE AI 
            ENGINEERING APPLIED TO MEDICAL FRONT-OFFICE WORKFLOWS. THE APPLICATION SHOWCASES 
            SPEECH-TO-TEXT TRANSCRIPTION, NATURAL LANGUAGE INTENT RECOGNITION, AND 
            TEXT-TO-SPEECH SYNTHESIS WITH A PRIVACY-FIRST DESIGN PHILOSOPHY.
          </p>
        </div>

        {/* Key Features */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ KEY CAPABILITIES ]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'LOCAL SPEECH-TO-TEXT PROCESSING',
              'INTENT CLASSIFICATION SYSTEM',
              'NEURAL TEXT-TO-SPEECH ENGINE',
              'PII REDACTION & PRIVACY MODE',
              'REAL-TIME AUDIO PROCESSING',
              'CONTAINERIZED DEPLOYMENT',
              'STRUCTURED JSON LOGGING',
              'PROVIDER ABSTRACTION LAYER',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pip-green pip-glow" />
                <span className="pip-text text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ TECHNOLOGY REPOSITORIES ]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {technologies.map((tech, idx) => (
              <a
                key={idx}
                href={tech.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pip-border p-4 hover:bg-pip-green-darker transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="font-bold pip-text group-hover:pip-glow">
                      {tech.name}
                    </div>
                    <div className="text-xs pip-text opacity-50">
                      {tech.category}
                    </div>
                  </div>
                  <div className="text-xs pip-text opacity-50 group-hover:opacity-100">
                    →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Architecture Highlights */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ ARCHITECTURAL HIGHLIGHTS ]
          </div>
          <div className="space-y-3 pip-text text-sm">
            <div className="flex">
              <span className="w-48 opacity-70">DEPLOYMENT:</span>
              <span>DOCKER COMPOSE ORCHESTRATION</span>
            </div>
            <div className="flex">
              <span className="w-48 opacity-70">BACKEND:</span>
              <span>PYTHON 3.11 + FASTAPI</span>
            </div>
            <div className="flex">
              <span className="w-48 opacity-70">FRONTEND:</span>
              <span>REACT 18 + TYPESCRIPT + VITE</span>
            </div>
            <div className="flex">
              <span className="w-48 opacity-70">STT ENGINE:</span>
              <span>FASTER-WHISPER (BASE MODEL)</span>
            </div>
            <div className="flex">
              <span className="w-48 opacity-70">TTS ENGINE:</span>
              <span>PIPER (LESSAC VOICE)</span>
            </div>
            <div className="flex">
              <span className="w-48 opacity-70">API STYLE:</span>
              <span>REST + OPENAPI 3.1</span>
            </div>
            <div className="flex">
              <span className="w-48 opacity-70">OBSERVABILITY:</span>
              <span>STRUCTURED JSON LOGS + REQUEST TRACING</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pip-text opacity-30 text-xs py-6">
          BUILT WITH PRECISION • DESIGNED FOR RELIABILITY • ENGINEERED FOR SCALE
        </div>
      </div>
    </div>
  )
}
