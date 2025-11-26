/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk gaming palette
        'cyber-blue': {
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#00ffff', // Neon cyan
        },
        'cyber-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#ff00ff', // Neon magenta
        },
        'cyber-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#00ff00', // Neon green
        },
        'cyber-pink': '#ff006e',
        'cyber-orange': '#ff9e00',
        'dark-bg': '#0a0e27',
        'dark-surface': '#151934',
        'dark-border': '#1e2449',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 5px theme("colors.cyber-blue.500"), 0 0 20px theme("colors.cyber-blue.500")',
        'neon-purple': '0 0 5px theme("colors.cyber-purple.500"), 0 0 20px theme("colors.cyber-purple.500")',
        'neon-green': '0 0 5px theme("colors.cyber-green.500"), 0 0 20px theme("colors.cyber-green.500")',
        'neon-pink': '0 0 5px theme("colors.cyber-pink"), 0 0 20px theme("colors.cyber-pink")',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px theme("colors.cyber-blue.500"), 0 0 10px theme("colors.cyber-blue.500")' },
          '100%': { boxShadow: '0 0 10px theme("colors.cyber-blue.500"), 0 0 20px theme("colors.cyber-blue.500"), 0 0 30px theme("colors.cyber-blue.500")' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
