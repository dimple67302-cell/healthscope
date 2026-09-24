import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf6",
          100: "#d6fbe9",
          400: "#2fd08a",
          500: "#12b571",
          600: "#0a9a5e",
          700: "#087a4b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
