interface ConversationEntry {
  id: string
  timestamp: Date
  type: 'user' | 'system'
  transcription?: {
    text: string
    text_redacted?: string
    confidence: number
    duration_ms: number
  }
  intent?: {
    intent: string
    confidence: number
    entities: Record<string, any>
    response_text: string
    handoff_recommended: boolean
  }
}

export const exportToJSON = (conversation: ConversationEntry[], filename: string = 'conversation.json') => {
  const dataStr = JSON.stringify(conversation, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export const exportToCSV = (conversation: ConversationEntry[], filename: string = 'conversation.csv') => {
  const headers = [
    'Timestamp',
    'Type',
    'Transcribed Text',
    'Transcription Confidence',
    'Intent',
    'Intent Confidence',
    'Response',
    'Handoff Recommended'
  ]

  const rows = conversation.map(entry => {
    const timestamp = entry.timestamp.toLocaleString()
    const type = entry.type.toUpperCase()
    
    if (entry.type === 'user' && entry.transcription) {
      return [
        timestamp,
        type,
        `"${entry.transcription.text.replace(/"/g, '""')}"`,
        entry.transcription.confidence.toFixed(2),
        '',
        '',
        '',
        ''
      ]
    } else if (entry.type === 'system' && entry.intent) {
      return [
        timestamp,
        type,
        '',
        '',
        entry.intent.intent,
        entry.intent.confidence.toFixed(2),
        `"${entry.intent.response_text.replace(/"/g, '""')}"`,
        entry.intent.handoff_recommended ? 'YES' : 'NO'
      ]
    }
    return []
  })

  const csvContent = [
    headers.join(','),
    ...rows.filter(row => row.length > 0).map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  downloadBlob(blob, filename)
}

export const exportToPlainText = (conversation: ConversationEntry[], filename: string = 'conversation.txt') => {
  const lines = conversation.map(entry => {
    const timestamp = entry.timestamp.toLocaleString()
    const separator = '─'.repeat(60)
    
    if (entry.type === 'user' && entry.transcription) {
      return `
${separator}
[${timestamp}] USER INPUT
${separator}
Transcription: ${entry.transcription.text}
Confidence: ${(entry.transcription.confidence * 100).toFixed(0)}%
Duration: ${entry.transcription.duration_ms}ms
`
    } else if (entry.type === 'system' && entry.intent) {
      const entities = Object.entries(entry.intent.entities)
        .map(([key, value]) => `  - ${key}: ${value}`)
        .join('\n')
      
      return `
${separator}
[${timestamp}] SYSTEM RESPONSE
${separator}
Intent: ${entry.intent.intent}
Confidence: ${(entry.intent.confidence * 100).toFixed(0)}%
Entities:
${entities || '  (none)'}
Response: ${entry.intent.response_text}
Handoff Recommended: ${entry.intent.handoff_recommended ? 'YES' : 'NO'}
`
    }
    return ''
  }).join('\n')

  const content = `
FRONTOFFICE VOICE CONSOLE - CONVERSATION TRANSCRIPT
Generated: ${new Date().toLocaleString()}
Total Entries: ${conversation.length}

${lines}

END OF TRANSCRIPT
`

  const blob = new Blob([content], { type: 'text/plain' })
  downloadBlob(blob, filename)
}

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const filterConversation = (
  conversation: ConversationEntry[],
  searchTerm: string
): ConversationEntry[] => {
  if (!searchTerm.trim()) return conversation

  const term = searchTerm.toLowerCase()
  
  return conversation.filter(entry => {
    // Search in transcription
    if (entry.transcription?.text.toLowerCase().includes(term)) {
      return true
    }
    
    // Search in intent
    if (entry.intent?.intent.toLowerCase().includes(term)) {
      return true
    }
    
    // Search in response
    if (entry.intent?.response_text.toLowerCase().includes(term)) {
      return true
    }
    
    // Search in entities
    if (entry.intent?.entities) {
      const entityValues = Object.values(entry.intent.entities)
        .map(v => String(v).toLowerCase())
        .join(' ')
      if (entityValues.includes(term)) {
        return true
      }
    }
    
    return false
  })
}
