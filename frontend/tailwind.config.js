/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif"],
      },
      colors: {
        border: "hsl(240 6% 18%)",
        input: "hsl(240 6% 18%)",
        ring: "hsl(238 84% 67%)",
        background: "hsl(240 10% 4%)",
        foreground: "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(238 84% 67%)",
          foreground: "hsl(0 0% 100%)",
        },
        secondary: {
          DEFAULT: "hsl(240 5% 12%)",
          foreground: "hsl(0 0% 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0 72% 51%)",
          foreground: "hsl(0 0% 100%)",
        },
        success: {
          DEFAULT: "hsl(160 84% 39%)",
          foreground: "hsl(0 0% 100%)",
        },
        warning: {
          DEFAULT: "hsl(38 92% 50%)",
          foreground: "hsl(0 0% 10%)",
        },
        muted: {
          DEFAULT: "hsl(240 5% 12%)",
          foreground: "hsl(240 5% 65%)",
        },
        accent: {
          DEFAULT: "hsl(240 5% 14%)",
          foreground: "hsl(0 0% 98%)",
        },
        popover: {
          DEFAULT: "hsl(240 8% 6%)",
          foreground: "hsl(0 0% 98%)",
        },
        card: {
          DEFAULT: "hsl(240 8% 6%)",
          foreground: "hsl(0 0% 98%)",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        bounce1: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-shift": "gradient-shift 12s ease infinite",
        bounce1: "bounce1 1.4s infinite ease-in-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
