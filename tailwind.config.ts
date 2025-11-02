import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "500px",
        sm: "640px",
        mm: "750px",
        md: "900px",
        lg: "1200px",
        xl: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;

