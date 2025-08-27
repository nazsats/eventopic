import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#283e56",
        secondary: "#fef4e8",
        accent: "#385779",
        dark: "#182533",
        light: "#fcddb7",
        white: "#ffffff",
      },
    },
  },
  plugins: [],
};
export default config;