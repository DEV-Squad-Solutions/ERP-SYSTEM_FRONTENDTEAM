/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E8F3F0",
          100: "#C5E1D9",
          400: "#1A7A5E",
          500: "#0C4A3E",
          600: "#093A31",
          700: "#072D26",
        },
        ink: {
          400: "#3D4E63",
          600: "#1B2A40",
          900: "#0A2540",
        },
        gold: {
          50: "#FBF3E1",
          400: "#D9AA4E",
          500: "#C9962C",
          600: "#A87A1E",
        },
        paper: "#FAF8F3",
        positive: "#059669",
        negative: "#C0392B",
      },
      fontFamily: {
        display: ["Cairo", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,37,64,0.04), 0 1px 8px rgba(10,37,64,0.06)",
        stamp: "0 0 0 3px rgba(201,150,44,0.15)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        stampIn: {
          "0%": { opacity: 0, transform: "scale(0.8) rotate(-6deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(0)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both",
        stampIn: "stampIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
        slideInRight: "slideInRight 0.3s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-rtl")],
};
