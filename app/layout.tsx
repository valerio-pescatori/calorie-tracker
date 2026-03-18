import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { isLocale, baseLocale } from "@/lib/i18n/i18n-util";
import en from "@/lib/i18n/en";
import it from "@/lib/i18n/it";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

async function getLocale() {
  const cookieStore = await cookies();
  const value = cookieStore.get("locale")?.value;
  return value && isLocale(value) ? value : baseLocale;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = locale === "it" ? it : en;
  return {
    title: String(t.meta.title),
    description: String(t.meta.description),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="overscroll-none">
      <body className={`${spaceGrotesk.variable} ${inter.variable} antialiased `}>
        <div className="aurora-bg" aria-hidden="true">
          <div className="aurora-blob aurora-blob-violet" />
          <div className="aurora-blob aurora-blob-teal" />
          <div className="aurora-blob aurora-blob-indigo" />
        </div>
        <AppShell locale={locale}>{children}</AppShell>
      </body>
    </html>
  );
}
