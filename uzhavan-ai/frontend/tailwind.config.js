/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep greens
        forest: {
          50: '#f0faf1', 100: '#d9f2dc', 200: '#b3e5bb', 300: '#7dcf8a',
          400: '#4ab85c', 500: '#279a3d', 600: '#1a7d2e', 700: '#166326',
          800: '#144f21', 900: '#11411c', 950: '#082410',
        },
        // Warm soil-browns
        soil: {
          50: '#faf7f2', 100: '#f2ebe0', 200: '#e4d4bf', 300: '#d2b694',
          400: '#bf9368', 500: '#b07843', 600: '#9a6337', 700: '#7f4f2e',
          800: '#68412a', 900: '#573626', 950: '#2f1b12',
        },
        // Golden wheat
        wheat: {
          50: '#fdfae8', 100: '#faf3c4', 200: '#f5e58d', 300: '#eece4e',
          400: '#e6b824', 500: '#d49b0c', 600: '#b87b07', 700: '#93590a',
          800: '#794610', 900: '#663b11', 950: '#3b1f05',
        },
        // Leaf accent
        leaf: {
          50: '#f2fbf4', 100: '#e0f6e6', 200: '#c2eccc', 300: '#93dba6',
          400: '#5dc27b', 500: '#37a85a', 600: '#278a46', 700: '#206e39',
          800: '#1e582f', 900: '#1a4829', 950: '#0a2716',
        },
        // Sky/water
        sky: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Mukta', 'Noto Sans Tamil', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Baloo 2', 'Noto Sans Tamil', 'system-ui', 'sans-serif'],
        tamil: ['Noto Sans Tamil', 'Mukta', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(26,92,42,0.08)',
        'card-hover': '0 6px 32px 0 rgba(26,92,42,0.16)',
        float: '0 8px 32px 0 rgba(26,92,42,0.24)',
      },
      animation: {
        'wave': 'wave 1.5s ease-in-out infinite',
        'pulse-green': 'pulse-green 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'sprout': 'sprout 0.5s ease-out',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(2)' },
        },
        'pulse-green': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(39,154,61,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(39,154,61,0)' },
        },
        'slide-up': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        sprout: {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
