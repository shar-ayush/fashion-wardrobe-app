/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ivory: "#faf7f2",   // page background
        cream: "#f0ebe3",   // card backgrounds, chips
        sand: "#e8ddd0",   // borders, dividers
        taupe: "#a89880",   // muted text, placeholders
        mocha: "#7a6050",   // secondary text
        espresso: "#3d2f20",   // primary text, primary buttons
        terracotta: "#c4956a",   // accent, score highlights, CTAs
      },
    },
  },
  plugins: [],
}