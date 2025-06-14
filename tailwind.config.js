/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- MAKE SURE THIS LINE EXISTS
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./**/*.{js,ts,jsx,tsx}", // A broader pattern to catch all files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}