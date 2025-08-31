import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Brand Colors
        "overlord-red": "#FF4757",
        "authority-red": "#FF3742",
        "deep-black": "#0C0C0C",
        "surface-dark": "#1A1A1A",
        "steel-dark": "#2A2A2A",

        // Text Colors
        "light-text": "#E8E8E8",
        "muted-light": "#D1D5DB",
        "muted-dark": "#6B7280",

        // Status Colors
        "approved-green": "#4ECDC4",
        "warning-amber": "#FFD93D",
        "rejected-red": "#FF6B6B",
        "processing-blue": "#74B9FF",

        // Theme Variables
        background: "#0C0C0C",
        foreground: "#E8E8E8",
        surface: "#1A1A1A",
        border: "#D1D5DB",
        primary: "#FF4757",
        card: "#1A1A1A",
        muted: "#6B7280",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Consolas",
          "Liberation Mono",
          "Menlo",
          "monospace",
        ],
        display: ["Impact", "Arial Black", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-in-from-right": "slideInFromRight 0.3s ease-in-out",
        "slide-in-from-left": "slideInFromLeft 0.3s ease-in-out",
        "zoom-in": "zoomIn 0.2s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInFromRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideInFromLeft: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
