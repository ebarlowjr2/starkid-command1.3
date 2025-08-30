/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: { mono: ['ui-monospace','SFMono-Regular','Menlo','Monaco','Consolas','monospace'] },
      boxShadow: { 'neon': '0 0 10px rgba(0,255,255,0.6), 0 0 20px rgba(0,255,255,0.4)' }
    },
  },
  plugins: [],
}