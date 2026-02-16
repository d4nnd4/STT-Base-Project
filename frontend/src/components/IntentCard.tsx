interface IntentCardProps {
  intent: string
  confidence: number
  entities: Record<string, any>
  responseText: string
  handoffRecommended: boolean
  reasoning?: string
}

export default function IntentCard({
  intent,
  confidence,
  entities,
  responseText,
  handoffRecommended,
  reasoning
}: IntentCardProps) {
  const getIntentLabel = (intent: string): string => {
    const labels: Record<string, string> = {
      'APPOINTMENT_SCHEDULING': 'APPOINTMENT',
      'FINANCIAL_CLEARANCE': 'FINANCIAL',
      'GENERAL_INQUIRY': 'INQUIRY',
      'UNKNOWN': 'UNKNOWN'
    }
    return labels[intent] || intent
  }

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 0.8) return 'pip-text'
    if (conf >= 0.5) return 'opacity-70'
    return 'opacity-40'
  }

  return (
    <div className="pip-panel p-6 space-y-4">
      {/* Header */}
      <div className="border-b border-pip-border pb-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold pip-text pip-glow">
            INTENT ANALYSIS
          </span>
          {handoffRecommended && (
            <span className="text-xs pip-text animate-pulse border border-pip-border px-2 py-1">
              HANDOFF RECOMMENDED
            </span>
          )}
        </div>
      </div>

      {/* Intent Type */}
      <div className="space-y-2">
        <div className="text-sm pip-text opacity-70">CLASSIFIED AS:</div>
        <div className="text-2xl font-bold pip-text tracking-wider">
          [ {getIntentLabel(intent)} ]
        </div>
      </div>

      {/* Confidence */}
      <div className="space-y-2">
        <div className="text-sm pip-text opacity-70">CONFIDENCE LEVEL:</div>
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-4 pip-border bg-pip-bg overflow-hidden">
            <div
              className={`h-full bg-pip-green transition-all duration-500 ${getConfidenceColor(confidence)}`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <div className="text-lg font-mono pip-text min-w-[4rem] text-right">
            {(confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Entities */}
      {Object.keys(entities).length > 0 && (
        <div className="space-y-2">
          <div className="text-sm pip-text opacity-70">EXTRACTED ENTITIES:</div>
          <div className="pip-border bg-pip-bg p-3 space-y-1">
            {Object.entries(entities).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm font-mono">
                <span className="pip-text opacity-70">{key.toUpperCase()}:</span>
                <span className="pip-text">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response */}
      <div className="space-y-2">
        <div className="text-sm pip-text opacity-70">SYSTEM RESPONSE:</div>
        <div className="pip-border bg-pip-bg p-4">
          <p className="pip-text text-sm leading-relaxed font-mono">
            {responseText}
          </p>
        </div>
      </div>

      {/* Reasoning (Debug) */}
      {reasoning && (
        <details className="text-xs opacity-50">
          <summary className="cursor-pointer pip-text hover:opacity-100 transition">
            [DEBUG: Show Reasoning]
          </summary>
          <div className="mt-2 pip-border bg-pip-bg p-2 font-mono pip-text">
            {reasoning}
          </div>
        </details>
      )}
    </div>
  )
}
