import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201d",
        mint: "#16a085",
        coral: "#e86f51",
        saffron: "#f4b942",
        paper: "#f7f5ef"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 29, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
