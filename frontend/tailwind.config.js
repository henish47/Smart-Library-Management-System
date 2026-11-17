/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        library: {
          green: '#243B2F',
          'green-dark': '#183329',
          'green-light': '#314e3f',
          'green-subtle': '#E9EFEA',
          ivory: '#F7F3E9',
          'ivory-light': '#FAF7F0',
          cream: '#EEE6D5',
          'cream-dark': '#E2D8C3',
          walnut: '#75543B',
          'walnut-dark': '#5D422E',
          'walnut-light': '#936E52',
          gold: '#B08D57',
          'gold-light': '#C8A870',
          'gold-subtle': '#F8F4EA',
          charcoal: '#292A26',
          'charcoal-light': '#4A4B45',
          'charcoal-muted': '#6B6C65',
          border: '#DED5C4',
          'border-dark': '#C9BFAC',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'library': '0 4px 20px -2px rgba(24, 51, 41, 0.08)',
        'library-lg': '0 10px 30px -4px rgba(24, 51, 41, 0.12), 0 4px 6px -2px rgba(24, 51, 41, 0.04)',
        'library-card': '0 2px 8px 0 rgba(41, 42, 38, 0.05)',
      }
    },
  },
  plugins: [],
}
