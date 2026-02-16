import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Demo from './pages/Demo'
import Architecture from './pages/Architecture'
import Reliability from './pages/Reliability'
import About from './pages/About'

function App() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-pip-bg text-pip-green">
      {/* Navigation */}
      <nav className="pip-border border-b-2 bg-pip-bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 pip-border flex items-center justify-center pip-glow">
                <span className="text-xl font-bold">V</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wider">
                  VAULT-TEC VOICE CONSOLE
                </h1>
                <div className="text-xs opacity-50">
                  SECURE COMMUNICATION SYSTEM
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/"
                className={`px-4 py-2 border-2 border-pip-border text-sm font-bold transition-all ${
                  isActive('/') 
                    ? 'bg-pip-green-darker pip-glow' 
                    : 'hover:bg-pip-green-darker hover:text-shadow'
                }`}
              >
                [ DEMO ]
              </Link>
              <Link
                to="/architecture"
                className={`px-4 py-2 border-2 border-pip-border text-sm font-bold transition-all ${
                  isActive('/architecture') 
                    ? 'bg-pip-green-darker pip-glow' 
                    : 'hover:bg-pip-green-darker hover:text-shadow'
                }`}
              >
                [ ARCHITECTURE ]
              </Link>
              <Link
                to="/reliability"
                className={`px-4 py-2 border-2 border-pip-border text-sm font-bold transition-all ${
                  isActive('/reliability') 
                    ? 'bg-pip-green-darker pip-glow' 
                    : 'hover:bg-pip-green-darker hover:text-shadow'
                }`}
              >
                [ STATUS ]
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 border-2 border-pip-border text-sm font-bold transition-all ${
                  isActive('/about') 
                    ? 'bg-pip-green-darker pip-glow' 
                    : 'hover:bg-pip-green-darker hover:text-shadow'
                }`}
              >
                [ ABOUT ]
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Demo />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/reliability" element={<Reliability />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
