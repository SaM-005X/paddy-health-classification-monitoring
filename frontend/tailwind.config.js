/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paddy: {
          50: '#f2fbf4',
          100: '#e1f7e7',
          200: '#c3efd0',
          300: '#95e1ad',
          400: '#5fcb83',
          500: '#38af64',
          600: '#288e4e',
          700: '#227040',
          800: '#1e5936',
          900: '#1b492e',
          950: '#0a2818',
        }
      }
    },
  },
  plugins: [],
}
