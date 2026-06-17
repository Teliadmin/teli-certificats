/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: { DEFAULT: "#F0502E", deep: "#D63E1E", soft: "#FDEAE3" },
        teal: { DEFAULT: "#0E9F8E", soft: "#DCF3EF" },
        gold: "#E0A100", ink: "#1A1714", sub: "#8A8178",
        line: "#ECE8E2", cream: "#F6F4F0",
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(26,23,20,.04), 0 8px 24px rgba(26,23,20,.05)",
        lift: "0 12px 34px rgba(26,23,20,.12)",
        glow: "0 10px 30px rgba(240,80,46,.30)",
      },
      borderRadius: { "4xl": "1.75rem" },
    },
  },
  plugins: [],
};
