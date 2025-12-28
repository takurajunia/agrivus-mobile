/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Agrivus Brand Colors (extracted from HTML)
        primary: {
          green: "#1a5c2a",
          DEFAULT: "#1a5c2a",
        },
        secondary: {
          green: "#2d7d3d",
          DEFAULT: "#2d7d3d",
        },
        accent: {
          gold: "#d4a017",
          DEFAULT: "#d4a017",
        },
        light: {
          green: "#e8f5e9",
          DEFAULT: "#e8f5e9",
        },
        dark: {
          green: "#0d3e1a",
          DEFAULT: "#0d3e1a",
        },
        medium: {
          green: "#4a8c5a",
          DEFAULT: "#4a8c5a",
        },
        bright: {
          green: "#3aab5a",
          DEFAULT: "#3aab5a",
        },
        vibrant: {
          green: "#2ecc71",
          DEFAULT: "#2ecc71",
        },
        success: "#27ae60",
        warning: "#e74c3c",
        info: "#3498db",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      boxShadow: {
        card: "0 5px 15px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 15px 30px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
