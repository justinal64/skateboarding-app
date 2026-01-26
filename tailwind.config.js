/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#0D0D25',
        card: '#1A1A3A',
        primary: '#FF00FF',
        secondary: '#00FFFF',
        text: '#FFFFFF',
        textDim: '#E0E0FF',
        border: '#2A2A4A',
        success: '#00FF00',
      },
    },
  },
  plugins: [],
}
