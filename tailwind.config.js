/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#030213',
        'primary-dark': '#2c2c2c',
        'primary-light': '#4a4a4a',
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
