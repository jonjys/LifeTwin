import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050508",
        surface: "#101014",
        "surface-2": "#16161C",
        border: "#1F1F29",
        primary: {
          DEFAULT: "#00E8FF",
          foreground: "#031317",
        },
        success: "#00FF88",
        warning: "#FFB020",
        danger: "#FF4D5A",
        ink: {
          DEFAULT: "#F4F4F8",
          secondary: "#A7A7B8",
          muted: "#6E6E80",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(0, 232, 255, 0.45)",
        "glow-sm": "0 0 24px -6px rgba(0, 232, 255, 0.35)",
        "glow-success": "0 0 40px -8px rgba(0, 255, 136, 0.4)",
        card: "0 8px 40px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
