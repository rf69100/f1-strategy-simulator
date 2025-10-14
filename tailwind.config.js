/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'f1-red': '#e10600',
        'f1-dark': '#15151e',
        'f1-gray': '#38383f',
        'mercedes': '#00d2be',
        'redbull': '#0600ef',
        'ferrari': '#dc0000',
        'mclaren': '#ff8700',
        'alpine': '#0090ff',
        'alphatauri': '#2b4562',
        'aston-martin': '#006f62',
        'haas': '#ffffff',
        'alfa-romeo': '#900000',
        'williams': '#005aff'
      },
      fontFamily: {
        'f1': ['"Titillium Web"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'speed-line': 'speed-line 0.5s linear infinite',
      },
      backgroundImage: {
        'f1-gradient': 'linear-gradient(135deg, #15151e 0%, #1a1a2e 50%, #15151e 100%)',
        'race-track': 'linear-gradient(90deg, #2d2d3a 0%, #38383f 50%, #2d2d3a 100%)',
      },
      boxShadow: {
        'f1-glow': '0 0 20px rgba(225, 6, 0, 0.1), 0 0 40px rgba(225, 6, 0, 0.05)',
        'f1-card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
}