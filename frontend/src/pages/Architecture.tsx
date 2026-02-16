export default function Architecture() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold pip-text pip-glow tracking-wider">
          SYSTEM ARCHITECTURE
        </h1>
        <div className="text-sm pip-text opacity-70">
          TECHNICAL DESIGN DOCUMENTATION
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Flow Diagram */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ DATA FLOW DIAGRAM ]
          </div>
          <div className="py-8 space-y-6">
            {/* Step 1 */}
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 pip-border flex items-center justify-center font-bold pip-glow">
                USER
              </div>
              <div className="flex-1 border-t-2 border-pip-border border-dashed relative">
                <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs pip-text opacity-70">
                  AUDIO INPUT
                </div>
              </div>
              <div className="w-24 h-24 pip-border flex items-center justify-center text-sm text-center pip-text">
                WEB<br/>AUDIO<br/>API
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-end">
              <div className="border-l-2 border-pip-border h-12 ml-12"></div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center space-x-4">
              <div className="w-96"></div>
              <div className="flex-1">
                <div className="pip-border p-4 bg-pip-bg">
                  <div className="font-bold pip-text mb-2">SPEECH-TO-TEXT PROVIDER</div>
                  <div className="text-xs pip-text opacity-70">
                    • Faster Whisper Engine<br/>
                    • Base Model (150MB)<br/>
                    • CPU Inference<br/>
                    • Returns: Transcription + Confidence
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-end">
              <div className="border-l-2 border-pip-border h-12 ml-12"></div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center space-x-4">
              <div className="w-96"></div>
              <div className="flex-1">
                <div className="pip-border p-4 bg-pip-bg">
                  <div className="font-bold pip-text mb-2">INTENT ROUTER</div>
                  <div className="text-xs pip-text opacity-70">
                    • Rule-Based Classification<br/>
                    • Entity Extraction<br/>
                    • Confidence Scoring<br/>
                    • Returns: Intent + Entities + Response
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="flex justify-end">
              <div className="border-l-2 border-pip-border h-12 ml-12"></div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center space-x-4">
              <div className="w-96"></div>
              <div className="flex-1">
                <div className="pip-border p-4 bg-pip-bg">
                  <div className="font-bold pip-text mb-2">TEXT-TO-SPEECH PROVIDER</div>
                  <div className="text-xs pip-text opacity-70">
                    • Piper Neural TTS<br/>
                    • Lessac Voice Model (61MB)<br/>
                    • CPU Synthesis<br/>
                    • Returns: WAV Audio @ 22kHz
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow Back */}
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 pip-border flex items-center justify-center font-bold pip-glow">
                USER
              </div>
              <div className="flex-1 border-t-2 border-pip-border border-dashed relative">
                <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs pip-text opacity-70">
                  AUDIO OUTPUT
                </div>
              </div>
              <div className="w-24 h-24 pip-border flex items-center justify-center text-sm text-center pip-text">
                AUDIO<br/>PLAYER
              </div>
            </div>
          </div>
        </div>

        {/* Provider Abstraction */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ PROVIDER ABSTRACTION LAYER ]
          </div>
          <p className="pip-text text-sm leading-relaxed">
            THE SYSTEM EMPLOYS ABSTRACT BASE CLASSES FOR ALL VOICE PROVIDERS, ENABLING SEAMLESS 
            MIGRATION BETWEEN LOCAL AND CLOUD SERVICES WITHOUT CODE CHANGES.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="pip-border p-4 space-y-2">
              <div className="font-bold pip-text">STT PROVIDERS</div>
              <div className="text-xs pip-text opacity-70">
                • Faster Whisper (Current)<br/>
                • AWS Transcribe<br/>
                • Google Speech-to-Text<br/>
                • Azure Speech
              </div>
            </div>
            <div className="pip-border p-4 space-y-2">
              <div className="font-bold pip-text">TTS PROVIDERS</div>
              <div className="text-xs pip-text opacity-70">
                • Piper TTS (Current)<br/>
                • AWS Polly<br/>
                • Google Text-to-Speech<br/>
                • Azure Speech
              </div>
            </div>
            <div className="pip-border p-4 space-y-2">
              <div className="font-bold pip-text">INTENT ROUTERS</div>
              <div className="text-xs pip-text opacity-70">
                • Rule-Based (Current)<br/>
                • AWS Lex<br/>
                • Google Dialogflow<br/>
                • Azure LUIS
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Features */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ PRIVACY & SECURITY ]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="font-bold pip-text">PII REDACTION</div>
              <ul className="text-sm pip-text opacity-70 space-y-1">
                <li>• Phone Numbers (XXX-XXX-XXXX)</li>
                <li>• Email Addresses (***@***.***)</li>
                <li>• Social Security Numbers (***-**-****)</li>
                <li>• Personal Names (Common patterns)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="font-bold pip-text">DATA HANDLING</div>
              <ul className="text-sm pip-text opacity-70 space-y-1">
                <li>• No Persistent Storage (Default)</li>
                <li>• In-Memory Processing Only</li>
                <li>• Configurable Retention Policies</li>
                <li>• HIPAA-Minded Design</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="pip-panel p-6 space-y-4">
          <div className="text-xl font-bold pip-text border-b border-pip-border pb-2">
            [ TECHNOLOGY STACK ]
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="font-bold pip-text">BACKEND</div>
              <div className="pip-border p-3 text-xs pip-text opacity-70 font-mono space-y-1">
                <div>Python 3.11</div>
                <div>FastAPI 0.109.0</div>
                <div>Pydantic 2.5.3</div>
                <div>Uvicorn (ASGI Server)</div>
                <div>Faster-Whisper 1.0.3</div>
                <div>Piper-TTS 1.2.0</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="font-bold pip-text">FRONTEND</div>
              <div className="pip-border p-3 text-xs pip-text opacity-70 font-mono space-y-1">
                <div>React 18</div>
                <div>TypeScript 5.2</div>
                <div>Vite 5.0</div>
                <div>TailwindCSS 3.4</div>
                <div>TanStack Query 5.0</div>
                <div>Axios 1.6</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
