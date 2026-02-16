import { useRef, useState, useEffect } from 'react'

interface AudioPlayerProps {
  audioUrl: string | null
  autoPlay?: boolean
  onPlaybackEnd?: () => void
}

export default function AudioPlayer({ audioUrl, autoPlay = false, onPlaybackEnd }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load()
      if (autoPlay) {
        audioRef.current.play().catch(err => console.error('Auto-play failed:', err))
      }
    }
  }, [audioUrl, autoPlay])

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handlePlay = () => setIsPlaying(true)
  const handlePause = () => setIsPlaying(false)
  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    onPlaybackEnd?.()
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!audioUrl) {
    return (
      <div className="pip-panel p-6 text-center opacity-50">
        <div className="pip-text text-sm">NO AUDIO DATA AVAILABLE</div>
      </div>
    )
  }

  return (
    <div className="pip-panel p-6">
      <audio
        ref={audioRef}
        src={audioUrl}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="text-center pip-text font-bold text-lg">
          AUDIO PLAYBACK SYSTEM
        </div>

        {/* Waveform Visualization */}
        <div className="relative h-16 pip-border bg-pip-bg flex items-center justify-center overflow-hidden">
          {isPlaying ? (
            <div className="flex items-center justify-center space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-pip-green animate-pulse"
                  style={{
                    height: `${Math.random() * 60 + 10}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '0.5s'
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="pip-text opacity-50 text-sm">
              [WAVEFORM VISUALIZATION]
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="relative h-3 pip-border bg-pip-bg overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-pip-green transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs pip-text opacity-70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={togglePlayback}
            className="pip-button flex-1 max-w-xs"
          >
            {isPlaying ? '[ ▐▐ PAUSE ]' : '[ ▶ PLAY ]'}
          </button>
        </div>

        {/* Status */}
        <div className="text-center text-xs pip-text opacity-50">
          {isPlaying ? 'PLAYING...' : 'READY'}
        </div>
      </div>
    </div>
  )
}
