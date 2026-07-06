/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./features/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        spiritual: {
          saffron: '#FF9933',
          saffronDark: '#FF8000',
          sand: '#FFF8F0',
          amber: '#D97706',
          charcoal: '#222222',
          gold: '#F59E0B',
          cosmic: '#121212',
          surfaceDark: '#1E1E1E',
          saffronLight: '#FFB74D',
        }
      },
      fontFamily: {
        inter: ['Inter'],
        devanagari: ['NotoSansDevanagari'],
      }
    },
  },
  plugins: [],
}
