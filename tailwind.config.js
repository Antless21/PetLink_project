/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        coral: {
          50: '#FDF4F1',
          100: '#FBE8E2',
          200: '#F8D1C5',
          300: '#F5B9A8',
          400: '#F5A89E',
          500: '#EC8878',
          600: '#D96B5A',
          700: '#B85344',
        },
        cream: {
          50: '#FDFBF7',
          100: '#FAF6F0',
          200: '#F5EFE6',
        },
        accent: {
          orange: '#f97316',
          'orange-soft': '#fed7aa',
          green: '#22c55e',
          'green-soft': '#bbf7d0',
          red: '#ef4444',
          'red-soft': '#fecaca',
        },
      },
      fontFamily: {
        display: ['"Manrope"', 'system-ui', 'sans-serif'],
        sans: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(15, 23, 42, 0.15), 0 4px 12px -6px rgba(15, 23, 42, 0.08)',
        'card-hover': '0 20px 40px -12px rgba(15, 23, 42, 0.25), 0 8px 16px -8px rgba(15, 23, 42, 0.12)',
        soft: '0 2px 8px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'paw-burst': 'pawBurst 0.9s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
        pawBurst: {
          '0%': { opacity: '0', transform: 'translate(-50%, -50%) scale(0.3) rotate(-15deg)' },
          '20%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.3) rotate(5deg)' },
          '60%': { opacity: '1', transform: 'translate(-50%, -50%) scale(1.1) rotate(-3deg)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -80%) scale(0.9) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
};
