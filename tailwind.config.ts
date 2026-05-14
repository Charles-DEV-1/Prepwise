import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1180px",
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
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
        },
        accent: "#3B82F6",
        softblue: "#EFF6FF",
        navy: "#0F172A",
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#475569",
        },
        success: "#16A34A",
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        amber: "#D97706",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
      boxShadow: {
        soft: "0 14px 40px rgba(15, 23, 42, 0.07)",
        glow: "0 14px 34px rgba(37, 99, 235, 0.18)",
      },
      borderRadius: {
        xl: "0.75rem",
      },
      gridTemplateColumns: {
        14: "repeat(14, minmax(0, 1fr))",
      },
    },
  },
  plugins: [animate],
};

export default config;
