/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        lavender: "#f4f0ff",
        softBlue: "#c7d2fe",
        mint: "#bce9da",
        deepIndigo: "#312e81",
        primaryPink: "#ffc5d9",
        primaryMint: "#9ee5d0",
      },
    },
  },
  plugins: [],
};



