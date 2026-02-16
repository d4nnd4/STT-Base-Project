/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pip: {
          green: '#1aff1a',
          'green-dark': '#0d7f0d',
          'green-darker': '#063d06',
          bg: '#0a0e0a',
          'bg-light': '#0f140f',
          border: '#1aff1a',
        }
      },
      fontFamily: {
        terminal: ['Courier New', 'Courier', 'monospace'],
      },
      boxShadow: {
        'pip': '0 0 10px rgba(26, 255, 26, 0.3)',
        'pip-inset': 'inset 0 0 10px rgba(26, 255, 26, 0.1)',
        'pip-glow': '0 0 15px rgba(26, 255, 26, 0.3)',
        'pip-strong': 'inset 0 0 10px rgba(26, 255, 26, 0.1), 0 0 15px rgba(26, 255, 26, 0.3)',
      },
      textShadow: {
        'pip': '0 0 5px rgba(26, 255, 26, 0.3)',
        'pip-glow': '0 0 10px rgba(26, 255, 26, 0.3)',
        'pip-strong': '0 0 20px rgba(26, 255, 26, 0.3), 0 0 30px rgba(26, 255, 26, 0.3)',
      },
      animation: {
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        flicker: {
          '0%': { opacity: '0.27861' },
          '5%': { opacity: '0.34769' },
          '10%': { opacity: '0.23604' },
          '15%': { opacity: '0.90626' },
          '20%': { opacity: '0.18128' },
          '25%': { opacity: '0.83891' },
          '30%': { opacity: '0.65583' },
          '35%': { opacity: '0.67807' },
          '40%': { opacity: '0.26559' },
          '45%': { opacity: '0.84693' },
          '50%': { opacity: '0.96019' },
          '55%': { opacity: '0.08594' },
          '60%': { opacity: '0.20313' },
          '65%': { opacity: '0.71988' },
          '70%': { opacity: '0.53455' },
          '75%': { opacity: '0.37288' },
          '80%': { opacity: '0.71428' },
          '85%': { opacity: '0.70419' },
          '90%': { opacity: '0.7003' },
          '95%': { opacity: '0.36108' },
          '100%': { opacity: '0.24387' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glow: {
          '0%, 100%': { 
            textShadow: '0 0 10px rgba(26, 255, 26, 0.3), 0 0 20px rgba(26, 255, 26, 0.3)' 
          },
          '50%': { 
            textShadow: '0 0 20px rgba(26, 255, 26, 0.3), 0 0 30px rgba(26, 255, 26, 0.3)' 
          },
        },
      },
    },
  },
  plugins: [],
}
