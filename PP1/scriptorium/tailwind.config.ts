import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Pages directory
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // All files in src
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Components in src/app/components
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};

export default config;
