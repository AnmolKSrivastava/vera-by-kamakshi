/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b7355',
        'primary-dark': '#6d5a43',
        'primary-light': '#a0826d',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
      },
      letterSpacing: {
        widest: '0.2em',
      },
    },
  },
  plugins: [],
}
