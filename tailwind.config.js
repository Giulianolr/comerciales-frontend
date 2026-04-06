/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-mode="dark"]'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0F1117',
        'surface': '#1A1D27',
        'surface-2': '#22263A',
        'border': '#2E3348',
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        }
      },
      backgroundColor: {
        primary: '#0F1117',
        secondary: '#1A1D27'
      },
      textColor: {
        primary: '#F1F5F9',
        secondary: '#94A3B8',
        muted: '#475569'
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: [
    require('tailwindcss/plugin')(({ addUtilities }) => {
      addUtilities({
        '.text-primary': { color: '#F1F5F9' },
        '.text-secondary': { color: '#94A3B8' },
        '.text-muted': { color: '#475569' },
        '.bg-canvas': { backgroundColor: '#0F1117' },
        '.bg-surface': { backgroundColor: '#1A1D27' },
        '.bg-surface-2': { backgroundColor: '#22263A' },
        '.border-surface': { borderColor: '#2E3348' }
      })
    })
  ]
}
