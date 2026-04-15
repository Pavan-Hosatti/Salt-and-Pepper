/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'storeos-bg': '#FFFFFF',
        'storeos-surface': '#F9FAFB',
        'storeos-border': '#E5E7EB',
        'storeos-amber': '#F59E0B',
        'storeos-cold': '#3B82F6',
        'storeos-red': '#EF4444',
        'storeos-green': '#10B981',
        'storeos-muted': '#6B7280',
        'storeos-text': '#111827',
      },
      fontFamily: {
        'syne': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 1s ease-in-out infinite alternate',
      },
      keyframes: {
        ticker: {
          '0%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
