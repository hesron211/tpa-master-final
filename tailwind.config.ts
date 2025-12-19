import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"], 
        heading: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#2563EB", 
          dark: "#1E40AF", 
          accent: "#F59E0B", 
        }
      }
    },
  },
  // BAGIAN INI YANG PENTING:
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
export default config;