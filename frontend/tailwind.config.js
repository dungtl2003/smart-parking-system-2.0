/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  separator: "_",
  theme: {
    textShadow: {
      default: "0 2px 0 #000",
      h1: "2px 8px 44px rgba(200, 200, 100, 1)",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          softer: "hsl(var(--primary-softer))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        third: {
          DEFAULT: "hsl(var(--third))",
          foreground: "hsl(var(--third-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      textShadow: {
        normal: "2px 2px 0px #c9c9c9, -2px -2px 0px #c9c9c9",
        red: "2px 2px 0px #ff0000, -2px -2px 0px #ff0000, 0px 0px 8px #cc0000",
        blue: "2px 2px 0px #0957ff, -2px -2px 0px #0957ff, 0px 0px 8px #1150d6",
      },
      keyframes: {
        fadeInScale: {
          "0%": { opacity: 0, transform: "scale(0.2)" },
          "50%": { opacity: 0.5, transform: "scale(0.6)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        fadeInSlide: {
          "0%": { opacity: 0, transform: "scale(0.8)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        fadeInScale: "fadeInScale 4s ease-out forwards",
        fadeInSlide: "fadeInSlide 2s ease-out forwards",
      },
      max: {
        sm: "50rem",
        md: "56rem",
        lg: "64rem",
        xl: "72rem",
        "2xl": "84rem",
        "3xl": "110rem",
      },
      minWidth: {
        sm: "50rem",
        md: "56rem",
        lg: "64rem",
        xl: "72rem",
        "2xl": "84rem",
        "3xl": "110rem",
      },
      width: {
        sm: "50rem",
        md: "56rem",
        lg: "64rem",
        xl: "72rem",
        "2xl": "84rem",
        "3xl": "98rem",
      },
      screens: {
        xs: "480px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1452px",
        "3xl": "1622px",
        "4xl": "1800px",
      },
      boxShadow: {
        general:
          "1px 2px 10px 3px rgba(0, 0, 0, 0.3), 0 -2px 4px -2px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwindcss-textshadow")],
};
