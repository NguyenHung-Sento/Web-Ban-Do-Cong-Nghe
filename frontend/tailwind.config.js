/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: "#D70018",
          secondary: "#2F80ED",
          dark: "#1A1A1A",
          light: "#F5F5F7",
          "gray-light": "#F8F9FA",
          "gray-medium": "#E5E5E5",
          "gray-dark": "#6C757D",
        },
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        },
      },
    },
    plugins: [],
  }