import type { Metadata } from "next";
import { Libre_Franklin, Courier_Prime } from "next/font/google";
import "./globals.css";
import "./table.css";
import "./projection.css";

const franklin = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sans",
});

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Inspo — Slide Library",
  description: "Saved design turned into named, luminous, copyable vocabulary.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${franklin.variable} ${courier.variable}`}>
      <body>{children}</body>
    </html>
  );
}
