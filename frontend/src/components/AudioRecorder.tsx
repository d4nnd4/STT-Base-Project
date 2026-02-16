import { useState, useRef, useEffect } from 'react'

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
  onRecordingStart?: () => void
  onRecordingStop?: () => void
}

export default function AudioRecorder({ 
  onRecordingComplete, 
  onRecordingStart, 
  onRecordingStop 
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Use opus codec for better compression (smaller file size, faster upload)
      const options: MediaRecorderOptions = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000, // 128kbps sufficient for speech
      }
      
      const mediaRecorder = new MediaRecorder(stream, options)
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onRecordingComplete(audioBlob)
        stream.getTracks().forEach(track => track.stop())
        
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        
        setRecordingTime(0)
      }

      mediaRecorder.start()
      setIsRecording(true)
      onRecordingStart?.()

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Error accessing microphone:', err)
      setError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      onRecordingStop?.()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="pip-panel p-6">
      <div className="flex flex-col items-center space-y-4">
        {/* Recording Status */}
        <div className="text-center">
          <div className="text-lg font-bold pip-text mb-2">
            {isRecording ? 'RECORDING IN PROGRESS' : 'READY TO RECORD'}
          </div>
          {isRecording && (
            <div className="text-3xl font-mono pip-glow">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {/* Visual Indicator */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className={`absolute inset-0 border-4 border-pip-border rounded-full ${isRecording ? 'animate-pulse' : ''}`} />
          <div className={`w-16 h-16 rounded-full ${isRecording ? 'bg-pip-green animate-ping' : 'bg-pip-green-dark'}`} />
        </div>

        {/* Control Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="pip-button w-full max-w-xs"
          disabled={!!error}
        >
          {isRecording ? '[ STOP RECORDING ]' : '[ START RECORDING ]'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="text-center text-sm pip-text opacity-70 border border-pip-border p-2">
            ERROR: {error}
          </div>
        )}

        {/* Help Text */}
        {!isRecording && !error && (
          <div className="text-center text-xs pip-text opacity-50">
            PRESS BUTTON TO BEGIN AUDIO CAPTURE
          </div>
        )}
      </div>
    </div>
  )
}
