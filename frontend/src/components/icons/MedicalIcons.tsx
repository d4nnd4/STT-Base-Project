// Fallout-style medical and UI icons

export const DoctorBagIcon = ({ className = "w-16 h-16" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2" fill="none">
      {/* Bag body */}
      <rect x="15" y="35" width="70" height="50" rx="3" />
      <path d="M 15 50 L 85 50" />
      
      {/* Handle */}
      <path d="M 35 35 L 35 25 Q 35 20 40 20 L 60 20 Q 65 20 65 25 L 65 35" />
      
      {/* Cross */}
      <path d="M 50 55 L 50 75" strokeWidth="3" />
      <path d="M 40 65 L 60 65" strokeWidth="3" />
      
      {/* Lock/clasp */}
      <circle cx="50" cy="42" r="3" fill="currentColor" />
      
      {/* Side details */}
      <path d="M 20 40 L 20 80" strokeWidth="1.5" />
      <path d="M 80 40 L 80 80" strokeWidth="1.5" />
    </g>
  </svg>
)

export const StimpackIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      {/* Syringe body */}
      <rect x="35" y="40" width="30" height="45" rx="2" />
      
      {/* Plunger */}
      <rect x="45" y="25" width="10" height="20" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="20" r="6" fill="none" />
      
      {/* Needle */}
      <path d="M 45 85 L 48 95 L 52 95 L 55 85" fill="currentColor" opacity="0.5" />
      
      {/* Measurement lines */}
      <path d="M 40 50 L 45 50" strokeWidth="1" />
      <path d="M 40 60 L 45 60" strokeWidth="1" />
      <path d="M 40 70 L 45 70" strokeWidth="1" />
    </g>
  </svg>
)

export const RadiationIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      <circle cx="50" cy="50" r="35" />
      <circle cx="50" cy="50" r="8" fill="currentColor" />
      
      {/* Radiation symbol blades */}
      <path d="M 50 50 L 50 20 Q 40 30 45 42 Z" fill="currentColor" opacity="0.7" />
      <path d="M 50 50 L 73 70 Q 67 58 55 55 Z" fill="currentColor" opacity="0.7" />
      <path d="M 50 50 L 27 70 Q 33 58 45 55 Z" fill="currentColor" opacity="0.7" />
    </g>
  </svg>
)

export const HealthIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      {/* Heart monitor style */}
      <path d="M 10 50 L 30 50 L 40 30 L 50 70 L 60 50 L 90 50" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      
      {/* Grid lines */}
      <path d="M 10 30 L 90 30" strokeWidth="0.5" opacity="0.3" />
      <path d="M 10 70 L 90 70" strokeWidth="0.5" opacity="0.3" />
      <path d="M 30 20 L 30 80" strokeWidth="0.5" opacity="0.3" />
      <path d="M 50 20 L 50 80" strokeWidth="0.5" opacity="0.3" />
      <path d="M 70 20 L 70 80" strokeWidth="0.5" opacity="0.3" />
    </g>
  </svg>
)

export const MicrophoneIcon = ({ className = "w-12 h-12", active = false }: { className?: string, active?: boolean }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      {/* Microphone body */}
      <rect x="40" y="20" width="20" height="35" rx="10" fill={active ? "currentColor" : "none"} opacity={active ? "0.3" : "1"} />
      
      {/* Stand */}
      <path d="M 50 55 L 50 75" />
      <path d="M 35 75 L 65 75" strokeWidth="3" />
      
      {/* Sound waves (if active) */}
      {active && (
        <>
          <path d="M 65 37 Q 75 37 75 37" strokeWidth="1.5" opacity="0.7" className="animate-pulse" />
          <path d="M 35 37 Q 25 37 25 37" strokeWidth="1.5" opacity="0.7" className="animate-pulse" />
        </>
      )}
      
      {/* Grill lines */}
      <path d="M 43 30 L 57 30" strokeWidth="1" opacity="0.5" />
      <path d="M 43 37 L 57 37" strokeWidth="1" opacity="0.5" />
      <path d="M 43 44 L 57 44" strokeWidth="1" opacity="0.5" />
    </g>
  </svg>
)

export const SpeakerIcon = ({ className = "w-12 h-12", active = false }: { className?: string, active?: boolean }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      {/* Speaker cone */}
      <path d="M 30 35 L 50 25 L 50 75 L 30 65 Z" fill="currentColor" opacity="0.3" />
      <rect x="15" y="35" width="15" height="30" fill="currentColor" opacity="0.3" />
      
      {/* Sound waves */}
      <path d="M 55 40 Q 65 50 55 60" fill="none" opacity={active ? "1" : "0.5"} className={active ? "animate-pulse" : ""} />
      <path d="M 60 35 Q 75 50 60 65" fill="none" opacity={active ? "0.8" : "0.3"} className={active ? "animate-pulse" : ""} />
      <path d="M 65 30 Q 85 50 65 70" fill="none" opacity={active ? "0.6" : "0.2"} className={active ? "animate-pulse" : ""} />
    </g>
  </svg>
)

export const ExportIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      {/* Document */}
      <path d="M 25 15 L 65 15 L 75 25 L 75 85 L 25 85 Z" />
      <path d="M 65 15 L 65 25 L 75 25" />
      
      {/* Arrow down */}
      <path d="M 50 35 L 50 65" strokeWidth="3" />
      <path d="M 40 55 L 50 65 L 60 55" strokeWidth="3" fill="none" />
      
      {/* Base line */}
      <path d="M 35 75 L 65 75" strokeWidth="3" />
    </g>
  </svg>
)

export const SettingsIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="2">
      <circle cx="50" cy="50" r="15" />
      
      {/* Gear teeth */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 50 + Math.cos(rad) * 20
        const y1 = 50 + Math.sin(rad) * 20
        const x2 = 50 + Math.cos(rad) * 30
        const y2 = 50 + Math.sin(rad) * 30
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="6" strokeLinecap="round" />
        )
      })}
      
      <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.3" />
    </g>
  </svg>
)

export const SearchIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" strokeWidth="3">
      <circle cx="40" cy="40" r="25" />
      <path d="M 58 58 L 80 80" strokeLinecap="round" />
    </g>
  </svg>
)
