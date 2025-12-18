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
        // Menggabungkan font Google dengan font bawaan
        sans: ["var(--font-inter)", "sans-serif"], 
        heading: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        // Warna Brand Baru
        brand: {
          blue: "#2563EB", // Biru Utama (Royal Blue)
          dark: "#1E40AF", // Biru Gelap
          accent: "#F59E0B", // Orange/Emas
        }
      }
    },
  },
  plugins: [],
};
export default config;