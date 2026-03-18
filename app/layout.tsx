import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calorie Tracker",
  description: "AI-assisted daily calorie and macro tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overscroll-none">
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased `}>
        <div className="aurora-bg" aria-hidden="true">
          <div className="aurora-blob aurora-blob-violet" />
          <div className="aurora-blob aurora-blob-teal" />
          <div className="aurora-blob aurora-blob-indigo" />
        </div>
        {children}
      </body>
    </html>
  );
}
