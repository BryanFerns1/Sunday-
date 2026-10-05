/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Neutral ink surfaces (existing class names retained, refined values)
        defense: {
          950: '#0a0a0c', 900: '#111114', 850: '#16161a',
          800: '#1f1f25', 700: '#2e2e36', 600: '#4a4a55',
        },
        // Sunday accent: warm sunrise amber. Remaps every cyan-* / sky-* utility app-wide.
        cyan: {
          50: '#fff8eb', 100: '#ffeccb', 200: '#ffd999', 300: '#ffc15c',
          400: '#ffa62b', 500: '#f58a07', 600: '#d96a02', 700: '#b44d06',
          800: '#923c0c', 900: '#78320d', 950: '#451a03',
        },
        sky: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
          800: '#9a3412', 900: '#7c2d12', 950: '#431407',
        },
        cyber: { cyan: '#ffa62b', sky: '#fb923c', emerald: '#34d399', amber: '#fbbf24', red: '#f87171', purple: '#a78bfa' },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 24px -6px rgba(255,166,43,0.35)',
        'glow-emerald': '0 0 20px -5px rgba(52,211,153,0.35)',
        'glow-red': '0 0 20px -5px rgba(248,113,113,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: { fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } } },
      animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite', 'fade-up': 'fadeUp .35s ease both' },
    },
  },
  plugins: [],
}
