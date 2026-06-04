// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A843',
          light: '#F0C060',
          dark: '#A07820',
          muted: 'rgba(212,168,67,0.15)',
        },
        dark: {
          DEFAULT: '#08090D',
          2: '#0E1018',
          3: '#141620',
        },
        surface: {
          DEFAULT: '#12141E',
          2: '#1A1D2E',
          3: '#1F2235',
        },
        // Flat semantic tokens — required for @apply text-text, text-muted, border-subtle etc.
        text:   '#E8EAF0',
        muted:  '#7A7F96',
        subtle: '#3A3F5C',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        ticker: 'ticker 30s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        ticker: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
      backgroundImage: {
        'hex-pattern':   "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='70'%3E%3Cpolygon points='30,5 55,20 55,50 30,65 5,50 5,20' fill='none' stroke='%23D4A843' stroke-width='1'/%3E%3C/svg%3E\")",
        'gold-gradient': 'linear-gradient(135deg, #D4A843, #A07820)',
        'dark-gradient': 'linear-gradient(135deg, #12141E, #1A1D2E)',
      },
    },
  },
  plugins: [],
};