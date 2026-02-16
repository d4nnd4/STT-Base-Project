import { useState } from 'react'
import axios from 'axios'
import AudioRecorder from '../components/AudioRecorder'
import AudioPlayer from '../components/AudioPlayer'
import IntentCard from '../components/IntentCard'
import SpectrumAnalyzer from '../components/SpectrumAnalyzer'
import { DoctorBagIcon, ExportIcon, SearchIcon, SettingsIcon, MicrophoneIcon, SpeakerIcon } from '../components/icons/MedicalIcons'
import { exportToJSON, exportToCSV, exportToPlainText, filterConversation } from '../utils/exportUtils'

interface TranscriptionResult {
  request_id: string
  text: string
  text_redacted?: string
  confidence: number
  language?: string
  duration_ms: number
}

interface IntentResult {
  request_id: string
  intent: string
  confidence: number
  entities: Record<string, any>
  handoff_recommended: boolean
  reasoning?: string
  response_text: string
  duration_ms: number
}

interface ConversationEntry {
  id: string
  timestamp: Date
  type: 'user' | 'system'
  transcription?: TranscriptionResult
  intent?: IntentResult
  audioUrl?: string
}

export default function Demo() {
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [privacyMode, setPrivacyMode] = useState(true)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [ttsSpeed, setTtsSpeed] = useState(1.0)

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError(null)
    setAudioStream(null)

    try {
      const startTime = performance.now()
      
      // Validate audio before upload
      if (audioBlob.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Audio file too large (max 10MB)')
      }
      
      // Step 1: Transcribe audio
      const formData = new FormData()
      formData.append('file', audioBlob, 'recording.webm')

      const sttStart = performance.now()
      const transcribeResponse = await axios.post<TranscriptionResult>(
        '/api/stt/transcribe',
        formData,
        {
          params: {
            privacy_mode: privacyMode
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      const sttTime = performance.now() - sttStart
      console.log(`[Performance] STT took ${sttTime.toFixed(0)}ms`)

      const transcription = transcribeResponse.data
      const displayText = privacyMode && transcription.text_redacted 
        ? transcription.text_redacted 
        : transcription.text

      // Add user entry to conversation
      const userEntry: ConversationEntry = {
        id: transcription.request_id,
        timestamp: new Date(),
        type: 'user',
        transcription,
      }
      setConversation(prev => [...prev, userEntry])

      // Step 2: Get intent and response
      const intentStart = performance.now()
      const intentResponse = await axios.post<IntentResult>(
        '/api/intent/route',
        { text: displayText }
      )
      const intentTime = performance.now() - intentStart
      console.log(`[Performance] Intent classification took ${intentTime.toFixed(0)}ms`)

      const intent = intentResponse.data

      // Step 3: Synthesize response speech
      const ttsStart = performance.now()
      const ttsResponse = await axios.post(
        '/api/tts/speak',
        {
          text: intent.response_text,
          speed: ttsSpeed,
        },
        {
          responseType: 'blob',
        }
      )
      const ttsTime = performance.now() - ttsStart
      console.log(`[Performance] TTS synthesis took ${ttsTime.toFixed(0)}ms`)
      
      const totalTime = performance.now() - startTime
      console.log(`[Performance] Total pipeline took ${totalTime.toFixed(0)}ms`)

      const audioUrl = URL.createObjectURL(ttsResponse.data)
      setCurrentAudioUrl(audioUrl)

      // Add system entry to conversation
      const systemEntry: ConversationEntry = {
        id: intent.request_id,
        timestamp: new Date(),
        type: 'system',
        intent,
        audioUrl,
      }
      setConversation(prev => [...prev, systemEntry])

    } catch (err: any) {
      console.error('Processing error:', err)
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error occurred'
      setError(`ERROR: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearConversation = () => {
    setConversation([])
    setCurrentAudioUrl(null)
    setError(null)
    setSearchTerm('')
  }

  const handleRecordingStart = async () => {
    setIsRecording(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
    } catch (err) {
      console.error('Failed to get audio stream:', err)
    }
  }

  const handleRecordingStop = () => {
    setIsRecording(false)
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
      setAudioStream(null)
    }
  }

  const filteredConversation = filterConversation(conversation, searchTerm)

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header with Medical Icon */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <DoctorBagIcon className="w-24 h-24 pip-text pip-glow" />
        </div>
        <h1 className="text-4xl font-bold pip-text pip-glow tracking-wider">
          ROBCO INDUSTRIES (TM) TERMLINK
        </h1>
        <div className="text-sm pip-text opacity-70">
          MEDICAL VOICE INTERFACE SYSTEM v1.0.0-demo
        </div>
        <div className="flex justify-center space-x-4 text-xs pip-text opacity-50">
          <div className="flex items-center space-x-2">
            <MicrophoneIcon className="w-6 h-6" active={isRecording} />
            <span>{isRecording ? 'RECORDING' : 'STANDBY'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <SpeakerIcon className="w-6 h-6" active={!!currentAudioUrl} />
            <span>{currentAudioUrl ? 'PLAYING' : 'SILENT'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recording & Playback */}
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="pip-panel p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-pip-border pb-2">
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-6 h-6 pip-text" />
                <span className="font-bold pip-text">SYSTEM CONTROLS</span>
              </div>
            </div>
            
            {/* Privacy Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm pip-text">PRIVACY MODE:</span>
              <button
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`pip-button text-xs ${privacyMode ? 'bg-pip-green-darker' : ''}`}
              >
                {privacyMode ? '[ ENABLED ]' : '[ DISABLED ]'}
              </button>
            </div>

            {/* TTS Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm pip-text">SPEECH RATE:</span>
                <span className="text-sm pip-text font-mono">{ttsSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={ttsSpeed}
                onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                className="w-full h-2 pip-border bg-pip-bg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--pip-green) 0%, var(--pip-green) ${((ttsSpeed - 0.5) / 1.5) * 100}%, var(--pip-bg) ${((ttsSpeed - 0.5) / 1.5) * 100}%, var(--pip-bg) 100%)`
                }}
              />
            </div>

            {/* Export & Clear Buttons */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="pip-button w-full text-sm flex items-center justify-center space-x-2"
                  disabled={conversation.length === 0}
                >
                  <ExportIcon className="w-4 h-4" />
                  <span>EXPORT</span>
                </button>
                
                {showExportMenu && conversation.length > 0 && (
                  <div className="absolute top-full mt-2 w-full pip-panel p-2 space-y-1 z-10">
                    <button
                      onClick={() => {
                        exportToJSON(conversation)
                        setShowExportMenu(false)
                      }}
                      className="w-full text-left text-xs pip-text hover:bg-pip-green-darker p-2 border border-pip-border"
                    >
                      [ JSON FORMAT ]
                    </button>
                    <button
                      onClick={() => {
                        exportToCSV(conversation)
                        setShowExportMenu(false)
                      }}
                      className="w-full text-left text-xs pip-text hover:bg-pip-green-darker p-2 border border-pip-border"
                    >
                      [ CSV FORMAT ]
                    </button>
                    <button
                      onClick={() => {
                        exportToPlainText(conversation)
                        setShowExportMenu(false)
                      }}
                      className="w-full text-left text-xs pip-text hover:bg-pip-green-darker p-2 border border-pip-border"
                    >
                      [ TEXT FORMAT ]
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={clearConversation}
                className="pip-button flex-1 text-sm"
                disabled={conversation.length === 0}
              >
                CLEAR
              </button>
            </div>
          </div>

          {/* Spectrum Analyzer */}
          <div>
            <div className="text-sm pip-text mb-2 opacity-70 flex items-center justify-between">
              <span>AUDIO SPECTRUM:</span>
              <span className="text-xs">{isRecording ? 'ACTIVE' : 'INACTIVE'}</span>
            </div>
            <SpectrumAnalyzer 
              stream={audioStream} 
              isActive={isRecording} 
              height={120}
              bars={48}
            />
          </div>

          {/* Audio Recorder */}
          <div>
            <div className="text-sm pip-text mb-2 opacity-70">
              VOICE INPUT MODULE:
            </div>
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onRecordingStart={handleRecordingStart}
              onRecordingStop={handleRecordingStop}
            />
          </div>

          {/* Audio Player */}
          {currentAudioUrl && (
            <div>
              <div className="text-sm pip-text mb-2 opacity-70">
                SYSTEM AUDIO OUTPUT:
              </div>
              <AudioPlayer audioUrl={currentAudioUrl} autoPlay />
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="pip-panel p-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-4 h-4 border-2 border-pip-green border-t-transparent rounded-full animate-spin" />
                <span className="pip-text animate-pulse">PROCESSING REQUEST...</span>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="pip-panel p-4 border-2 border-pip-green animate-pulse">
              <div className="text-center text-sm pip-text">{error}</div>
            </div>
          )}
        </div>

        {/* Right Column: Conversation History */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="pip-panel p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm pip-text opacity-70">
              <SearchIcon className="w-5 h-5" />
              <span>SEARCH CONVERSATION:</span>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ENTER SEARCH TERM..."
              className="pip-input text-sm"
            />
            {searchTerm && (
              <div className="text-xs pip-text opacity-50">
                SHOWING {filteredConversation.length} OF {conversation.length} ENTRIES
              </div>
            )}
          </div>

          <div className="text-sm pip-text mb-2 opacity-70">
            CONVERSATION LOG:
          </div>
          
          <div className="pip-panel p-4 h-[700px] overflow-y-auto space-y-4">
            {filteredConversation.length === 0 ? (
              <div className="text-center pip-text opacity-50 py-12">
                {searchTerm ? (
                  <>
                    <div className="text-lg mb-2">[NO MATCHING ENTRIES]</div>
                    <div className="text-xs">
                      TRY A DIFFERENT SEARCH TERM
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg mb-2">[NO ENTRIES]</div>
                    <div className="text-xs">
                      PRESS RECORD TO BEGIN VOICE INTERACTION
                    </div>
                  </>
                )}
              </div>
            ) : (
              filteredConversation.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  {/* Timestamp & Type */}
                  <div className="text-xs pip-text opacity-50 font-mono">
                    [{entry.timestamp.toLocaleTimeString()}] {entry.type.toUpperCase()}
                  </div>

                  {/* User Transcription */}
                  {entry.type === 'user' && entry.transcription && (
                    <div className="pip-border bg-pip-bg p-3 space-y-2">
                      <div className="text-sm pip-text opacity-70">TRANSCRIPTION:</div>
                      <div className="pip-text font-mono">
                        {privacyMode && entry.transcription.text_redacted
                          ? entry.transcription.text_redacted
                          : entry.transcription.text}
                      </div>
                      <div className="text-xs pip-text opacity-50">
                        Confidence: {(entry.transcription.confidence * 100).toFixed(0)}% | 
                        Time: {entry.transcription.duration_ms}ms
                      </div>
                    </div>
                  )}

                  {/* System Intent */}
                  {entry.type === 'system' && entry.intent && (
                    <IntentCard
                      intent={entry.intent.intent}
                      confidence={entry.intent.confidence}
                      entities={entry.intent.entities}
                      responseText={entry.intent.response_text}
                      handoffRecommended={entry.intent.handoff_recommended}
                    />
                  )}

                  <div className="border-t border-pip-border opacity-30 my-2" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs pip-text opacity-30 pt-6">
        © 2077 ROBCO INDUSTRIES • MEDICAL DIVISION • ALL RIGHTS RESERVED
      </div>
    </div>
  )
}
