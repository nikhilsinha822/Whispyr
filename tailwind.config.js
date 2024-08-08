/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "dotted-pattern": "url('/subtle_dots.png')"
      }
    },
  },
  plugins: [],
}