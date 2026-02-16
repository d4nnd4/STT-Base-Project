import { useEffect, useRef } from 'react'

interface SpectrumAnalyzerProps {
  stream?: MediaStream | null
  isActive?: boolean
  height?: number
  bars?: number
}

export default function SpectrumAnalyzer({ 
  stream, 
  isActive = false, 
  height = 100,
  bars = 32 
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const analyzerRef = useRef<AnalyserNode>()

  useEffect(() => {
    if (!stream || !isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const audioContext = new AudioContext()
    const analyzer = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)
    
    // fftSize must be a power of 2 between 32 and 32768
    // Find the nearest power of 2 that's >= bars * 2 for good resolution
    const minFftSize = Math.max(32, bars * 2)
    const fftSize = Math.pow(2, Math.ceil(Math.log2(minFftSize)))
    analyzer.fftSize = Math.min(fftSize, 2048) // Cap at 2048 for performance
    
    const bufferLength = analyzer.frequencyBinCount
    const dataArr = new Uint8Array(bufferLength)
    
    source.connect(analyzer)
    analyzerRef.current = analyzer

    const draw = () => {
      if (!canvasRef.current || !analyzerRef.current) return

      analyzer.getByteFrequencyData(dataArr)
      
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      const barWidth = width / bars
      let x = 0

      for (let i = 0; i < bars; i++) {
        // Average multiple frequency bins for smoother visualization
        const start = Math.floor((i * bufferLength) / bars)
        const end = Math.floor(((i + 1) * bufferLength) / bars)
        let sum = 0
        for (let j = start; j < end; j++) {
          sum += dataArr[j]
        }
        const average = sum / (end - start)
        
        const barHeight = (average / 255) * height * 0.8

        // Draw bar with gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
        gradient.addColorStop(0, '#1aff1a')
        gradient.addColorStop(0.5, '#0d7f0d')
        gradient.addColorStop(1, '#063d06')

        ctx.fillStyle = gradient
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight)

        // Add glow effect
        ctx.shadowColor = 'rgba(26, 255, 26, 0.5)'
        ctx.shadowBlur = 10
        ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight)
        ctx.shadowBlur = 0

        x += barWidth
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      audioContext.close()
    }
  }, [stream, isActive, bars, height])

  return (
    <div className="pip-border bg-pip-bg relative overflow-hidden" style={{ height }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full"
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center pip-text opacity-30 text-xs">
          [SPECTRUM ANALYZER OFFLINE]
        </div>
      )}
      
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(26, 255, 26, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26, 255, 26, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>
    </div>
  )
}
