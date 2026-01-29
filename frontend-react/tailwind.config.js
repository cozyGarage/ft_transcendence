/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00FFFC',
          50: '#E5FFFF',
          100: '#CCFFFE',
          200: '#99FFFD',
          300: '#66FFFC',
          400: '#33FFFB',
          500: '#00FFFC',
          600: '#00CCC9',
          700: '#009996',
          800: '#006663',
          900: '#003330',
          cyan: '#00FFFC',
          secondary: '#00b9be',
        },
        secondary: {
          DEFAULT: '#FF00FF',
          500: '#FF00FF',
        },
        dark: {
          DEFAULT: '#00142b', // Legacy dark-blue
          50: '#001a33',
          100: '#00264d',
          200: '#003347', // Legacy medium-blue
          300: '#004060',
          400: '#005580',
          blue: '#00142b',
          medium: '#003347',
        },
        accent: {
          cyan: '#00FFFC',
          pink: '#FF00FF',
          yellow: '#FFD700',
        },
        league: {
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          gold: '#FFD700',
          platinum: '#E5E4E2',
          diamond: '#B9F2FF',
          master: '#FF4500',
        }
      },
      fontFamily: {
        'sansation': ['Sansation', 'sans-serif'],
        'cyber': ['Cyber', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00FFFC, 0 0 10px #00FFFC, 0 0 15px #00FFFC' },
          '100%': { boxShadow: '0 0 10px #00FFFC, 0 0 20px #00FFFC, 0 0 30px #00FFFC' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(0, 255, 252, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 252, 0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
