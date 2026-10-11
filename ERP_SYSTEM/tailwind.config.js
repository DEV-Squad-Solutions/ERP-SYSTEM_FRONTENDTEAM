/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        /* =====================================================
           BRAND — deep green (primary), full scale 50–950
           Anchors kept from the original design system:
           50 #E8F3F0 · 100 #C5E1D9 · 400 #1A7A5E ·
           500 #0C4A3E · 600 #093A31 · 700 #072D26
        ===================================================== */
        primary: {
          DEFAULT: "#0C4A3E",
          50: "#E8F3F0",
          100: "#C5E1D9",
          200: "#A6CFC2",
          300: "#7FB5A4",
          400: "#1A7A5E",
          500: "#0C4A3E",
          600: "#093A31",
          700: "#072D26",
          800: "#052019",
          900: "#041613",
          950: "#020C0A",
        },

        /* =====================================================
           BRAND — navy ink (text / borders / surfaces)
           Anchors: 400 #3D4E63 · 600 #1B2A40 · 900 #0A2540
        ===================================================== */
        ink: {
          DEFAULT: "#1B2A40",
          50: "#F2F5F9",
          100: "#E5EAF1",
          200: "#C8D3E0",
          300: "#9FB1C7",
          400: "#3D4E63",
          500: "#2E3F54",
          600: "#1B2A40",
          700: "#152236",
          800: "#0E1827",
          900: "#0A2540",
          950: "#06111F",
        },

        /* =====================================================
           BRAND — gold accent
           Anchors: 50 #FBF3E1 · 400 #D9AA4E ·
           500 #C9962C · 600 #A87A1E
        ===================================================== */
        gold: {
          DEFAULT: "#C9962C",
          50: "#FBF3E1",
          100: "#F6E7C2",
          200: "#EED397",
          300: "#E3BC62",
          400: "#D9AA4E",
          500: "#C9962C",
          600: "#A87A1E",
          700: "#8A6114",
          800: "#6B4A0F",
          900: "#4C340B",
          950: "#332209",
        },

        /* Warm paper surface — the light-mode canvas */
        paper: "#FAF8F3",

        /* Success / positivity */
        positive: {
          DEFAULT: "#059669",
          50: "#ECF8F3",
          100: "#D1F0E2",
          200: "#A5E2C7",
          300: "#6FCBA6",
          400: "#34B083",
          500: "#059669",
          600: "#047A54",
          700: "#035F42",
          800: "#024431",
          900: "#022E21",
        },

        /* Destructive / errors (brand anchored) */
        negative: {
          DEFAULT: "#C0392B",
          50: "#FDF0EE",
          100: "#FADCD8",
          200: "#F4BDB5",
          300: "#EB9487",
          400: "#D9685A",
          500: "#CC4A3B",
          600: "#C0392B",
          700: "#A13027",
          800: "#852820",
          900: "#6B211B",
          950: "#4A1712",
        },

        /* Dark-mode semantic surfaces (used via dark: variants) */
        dark: {
          bg: "#0F1720",
          surface: "#16212B",
          elevated: "#1C2A35",
          border: "#263642",
          text: "#F1F5F3",
          muted: "#94A3B8",
        },

        /* =====================================================
           BUILT-INS REMAPPED ONTO THE BRAND SYSTEM
           Slate/Gray  → warm neutrals that pair with paper+ink
           Emerald/Green/Teal → brand green
           Amber/Orange → brand gold
           Red/Rose   → brand negative
           Sky/Indigo/Violet → navy ink
        ===================================================== */
        slate: {
          50: "#F7F9F8",
          100: "#EFF2F0",
          200: "#E2E7E4",
          300: "#C9D2CD",
          400: "#9AA6A0",
          500: "#6F7C75",
          600: "#55635C",
          700: "#42504A",
          800: "#2E3B36",
          900: "#1C2A25",
          950: "#111A16",
        },

        gray: {
          50: "#F7F9F8",
          100: "#EFF2F0",
          200: "#E2E7E4",
          300: "#C9D2CD",
          400: "#9AA6A0",
          500: "#6F7C75",
          600: "#55635C",
          700: "#42504A",
          800: "#2E3B36",
          900: "#1C2A25",
          950: "#111A16",
        },

        emerald: {
          50: "#E8F3F0",
          100: "#C5E1D9",
          200: "#A6CFC2",
          300: "#7FB5A4",
          400: "#1A7A5E",
          500: "#0C4A3E",
          600: "#093A31",
          700: "#072D26",
          800: "#052019",
          900: "#041613",
          950: "#020C0A",
        },

        green: {
          50: "#E8F3F0",
          100: "#C5E1D9",
          200: "#A6CFC2",
          300: "#7FB5A4",
          400: "#1A7A5E",
          500: "#0C4A3E",
          600: "#093A31",
          700: "#072D26",
          800: "#052019",
          900: "#041613",
          950: "#020C0A",
        },

        teal: {
          50: "#E8F3F0",
          100: "#C5E1D9",
          200: "#A6CFC2",
          300: "#7FB5A4",
          400: "#1A7A5E",
          500: "#0C4A3E",
          600: "#093A31",
          700: "#072D26",
          800: "#052019",
          900: "#041613",
          950: "#020C0A",
        },

        amber: {
          50: "#FBF3E1",
          100: "#F6E7C2",
          200: "#EED397",
          300: "#E3BC62",
          400: "#D9AA4E",
          500: "#C9962C",
          600: "#A87A1E",
          700: "#8A6114",
          800: "#6B4A0F",
          900: "#4C340B",
          950: "#332209",
        },

        orange: {
          50: "#FBF3E1",
          100: "#F6E7C2",
          200: "#EED397",
          300: "#E3BC62",
          400: "#D9AA4E",
          500: "#C9962C",
          600: "#A87A1E",
          700: "#8A6114",
          800: "#6B4A0F",
          900: "#4C340B",
          950: "#332209",
        },

        red: {
          50: "#FDF0EE",
          100: "#FADCD8",
          200: "#F4BDB5",
          300: "#EB9487",
          400: "#D9685A",
          500: "#CC4A3B",
          600: "#C0392B",
          700: "#A13027",
          800: "#852820",
          900: "#6B211B",
          950: "#4A1712",
        },

        rose: {
          50: "#FDF0EE",
          100: "#FADCD8",
          200: "#F4BDB5",
          300: "#EB9487",
          400: "#D9685A",
          500: "#CC4A3B",
          600: "#C0392B",
          700: "#A13027",
          800: "#852820",
          900: "#6B211B",
          950: "#4A1712",
        },

        sky: {
          50: "#F2F5F9",
          100: "#E5EAF1",
          200: "#C8D3E0",
          300: "#9FB1C7",
          400: "#3D4E63",
          500: "#2E3F54",
          600: "#1B2A40",
          700: "#152236",
          800: "#0E1827",
          900: "#0A2540",
          950: "#06111F",
        },

        indigo: {
          50: "#F2F5F9",
          100: "#E5EAF1",
          200: "#C8D3E0",
          300: "#9FB1C7",
          400: "#3D4E63",
          500: "#2E3F54",
          600: "#1B2A40",
          700: "#152236",
          800: "#0E1827",
          900: "#0A2540",
          950: "#06111F",
        },

        violet: {
          50: "#F2F5F9",
          100: "#E5EAF1",
          200: "#C8D3E0",
          300: "#9FB1C7",
          400: "#3D4E63",
          500: "#2E3F54",
          600: "#1B2A40",
          700: "#152236",
          800: "#0E1827",
          900: "#0A2540",
          950: "#06111F",
        },
      },

      fontFamily: {
        display: ["Cairo", "sans-serif"],
        body: ["Tajawal", "sans-serif"],
      },

      boxShadow: {
        card: "0 1px 2px rgba(10,37,64,0.04), 0 1px 8px rgba(10,37,64,0.06)",

        stamp: "0 0 0 3px rgba(201,150,44,0.15)",

        "dark-card": "0 1px 2px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.12)",
      },

      keyframes: {
        fadeUp: {
          "0%": {
            opacity: 0,
            transform: "translateY(8px)",
          },
          "100%": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },

        stampIn: {
          "0%": {
            opacity: 0,
            transform: "scale(0.8) rotate(-6deg)",
          },
          "100%": {
            opacity: 1,
            transform: "scale(1) rotate(0)",
          },
        },

        slideInRight: {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
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