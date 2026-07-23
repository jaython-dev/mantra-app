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
          // Premium Hindu Mantra & Audiobook App UI Theme Colors
          cream: '#FAF7F2',
          maroon: '#7A1E1E',
          goldSacred: '#D4AF37',
          brown: '#3A2E2B',
          clayBorder: '#E6DFD3',
          goldGlow: 'rgba(212, 175, 55, 0.15)',
          maroonLight: 'rgba(122, 30, 30, 0.08)',
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
