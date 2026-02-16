import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface HealthResponse {
  status: string
  timestamp: string
  providers?: {
    stt: boolean
    tts: boolean
    intent: boolean
  }
}

export default function Reliability() {
  const { data: health, isLoading, error, refetch } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await axios.get('/api/healthz')
      return response.data
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const { data: readiness } = useQuery<HealthResponse>({
    queryKey: ['readiness'],
    queryFn: async () => {
      const response = await axios.get('/api/readyz')
      return response.data
    },
    refetchInterval: 10000,
  })

  const getStatusColor = (status?: boolean) => {
    if (status === undefined) return 'opacity-30'
    return status ? 'pip-glow' : 'animate-pulse opacity-50'
  }

  const getStatusText = (status?: boolean) => {
    if (status === undefined) return 'UNKNOWN'
    return status ? 'OPERATIONAL' : 'OFFLINE'
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold pip-text pip-glow tracking-wider">
          SYSTEM STATUS MONITOR
        </h1>
        <div className="text-sm pip-text opacity-70">
          REAL-TIME HEALTH DIAGNOSTICS
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Overall Status */}
        <div className="pip-panel p-8 text-center space-y-4">
          <div className="text-2xl font-bold pip-text tracking-wider">
            OVERALL SYSTEM STATUS
          </div>
          {isLoading ? (
            <div className="text-4xl pip-text animate-pulse">CHECKING...</div>
          ) : error ? (
            <div className="text-4xl pip-text animate-pulse">CONNECTION LOST</div>
          ) : (
            <div className={`text-6xl font-bold pip-text ${health?.status === 'healthy' ? 'pip-glow' : 'animate-pulse'}`}>
              {health?.status === 'healthy' ? '[ OPERATIONAL ]' : '[ DEGRADED ]'}
            </div>
          )}
          <div className="text-xs pip-text opacity-50">
            LAST CHECK: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
          </div>
          <button onClick={() => refetch()} className="pip-button mt-4">
            [ REFRESH STATUS ]
          </button>
        </div>

        {/* Provider Status */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ PROVIDER HEALTH STATUS ]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* STT Status */}
            <div className="pip-border p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl pip-text mb-2">🎤</div>
                <div className="font-bold pip-text text-lg">SPEECH-TO-TEXT</div>
              </div>
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold pip-text ${getStatusColor(readiness?.providers?.stt)}`}>
                  {getStatusText(readiness?.providers?.stt)}
                </div>
                <div className="text-xs pip-text opacity-50">
                  Faster Whisper Engine
                </div>
              </div>
            </div>

            {/* TTS Status */}
            <div className="pip-border p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl pip-text mb-2">🔊</div>
                <div className="font-bold pip-text text-lg">TEXT-TO-SPEECH</div>
              </div>
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold pip-text ${getStatusColor(readiness?.providers?.tts)}`}>
                  {getStatusText(readiness?.providers?.tts)}
                </div>
                <div className="text-xs pip-text opacity-50">
                  Piper TTS Engine
                </div>
              </div>
            </div>

            {/* Intent Status */}
            <div className="pip-border p-6 space-y-4">
              <div className="text-center">
                <div className="text-4xl pip-text mb-2">🧠</div>
                <div className="font-bold pip-text text-lg">INTENT ROUTER</div>
              </div>
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold pip-text ${getStatusColor(readiness?.providers?.intent)}`}>
                  {getStatusText(readiness?.providers?.intent)}
                </div>
                <div className="text-xs pip-text opacity-50">
                  Rule-Based Classifier
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring Features */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ RELIABILITY FEATURES ]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="font-bold pip-text">OBSERVABILITY</div>
              <ul className="text-sm pip-text opacity-70 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Structured JSON logging with request tracing</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Health check endpoints (/healthz, /readyz)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Performance metrics (duration_ms)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Request correlation via request_id</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <div className="font-bold pip-text">FAILURE HANDLING</div>
              <ul className="text-sm pip-text opacity-70 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>TTS fallback to silent audio on provider failure</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Graceful error responses with detailed messages</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provider abstraction for service migration</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Docker health checks with retry logic</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ API ENDPOINTS ]
          </div>
          <div className="space-y-2">
            {[
              { method: 'POST', path: '/api/stt/transcribe', desc: 'Speech-to-text transcription' },
              { method: 'POST', path: '/api/intent/route', desc: 'Intent classification' },
              { method: 'POST', path: '/api/tts/speak', desc: 'Text-to-speech synthesis' },
              { method: 'GET', path: '/api/healthz', desc: 'Basic liveness check' },
              { method: 'GET', path: '/api/readyz', desc: 'Provider readiness check' },
              { method: 'GET', path: '/docs', desc: 'OpenAPI documentation' },
            ].map((endpoint, idx) => (
              <div key={idx} className="pip-border p-3 flex items-center justify-between hover:bg-pip-green-darker transition">
                <div className="flex items-center space-x-4">
                  <span className="font-bold pip-text text-xs w-16">{endpoint.method}</span>
                  <span className="font-mono text-sm pip-text">{endpoint.path}</span>
                </div>
                <span className="text-xs pip-text opacity-50">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
