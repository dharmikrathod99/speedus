/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          blue: '#00f0ff',
          pink: '#ff007f',
          yellow: '#ffe600',
          dark: '#080a10',
          darker: '#040508',
          card: 'rgba(13, 18, 30, 0.75)',
          border: 'rgba(0, 240, 255, 0.25)'
        }
      },
      fontFamily: {
        racing: ['Rajdhani', 'sans-serif'],
        display: ['Orbitron', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 240, 255, 0.4)' },
          '100%': { boxShadow: '0 0 25px rgba(0, 240, 255, 0.9)' },
        }
      }
    },
  },
  plugins: [],
}

