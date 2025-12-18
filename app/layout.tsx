import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

// 1. Font untuk Teks Bacaan (Soal/Penjelasan)
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

// 2. Font untuk Judul & Tombol (Kesan Modern)
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kelas Fokus | Platform Belajar TPA",
  description: "Latihan soal TPA Online terbaik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${poppins.variable} font-sans bg-slate-50 text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}