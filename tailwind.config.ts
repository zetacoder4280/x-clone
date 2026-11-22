/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        x: {
          bg: "#000000",
          panel: "#16181c",
          border: "#2f3336",
          text: "#e7e9ea",
          muted: "#71767b",
          blue: "#1d9bf0",
          blueHover: "#1a8cd8",
          pink: "#f91880",
          green: "#00ba7c",
          hover: "rgba(255,255,255,0.03)",
        },
        light: {
          bg: "#ffffff",
          panel: "#f7f9f9",
          border: "#eff3f4",
          text: "#0f1419",
          muted: "#536471",
          blue: "#1d9bf0",
        },
      },
      fontFamily: {
        sans: [
          "TwitterChirp",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        feed: "600px",
        shell: "1265px",
      },
    },
  },
  plugins: [],
};

export default config;
