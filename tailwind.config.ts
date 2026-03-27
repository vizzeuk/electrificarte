import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#111113",
        surface: "#17171A",
        card: "#1E1E23",
        "card-hover": "#25252B",
        border: "#2A2A32",
        "border-light": "#333340",
        // Pastel / muted accent palette
        accent: {
          DEFAULT: "#7B9FD4",   // soft pastel blue
          hover: "#8FAFD9",
          muted: "#4A6A9A",
          subtle: "#7B9FD420",
        },
        soft: {
          blue: "#7B9FD4",
          green: "#6EBF8B",
          amber: "#C9A96E",
          red: "#C47B7B",
          purple: "#9B8EC4",
          slate: "#8A9BB5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.4)",
        subtle: "0 2px 8px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
