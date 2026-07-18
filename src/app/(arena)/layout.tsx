import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

// Second root layout (route group): /admin and /mulakatmicro1 live outside
// the [[...locale]] single-page tree — separate tabs, not homepage sections.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Same reason as the main layout: the nonce CSP from src/proxy.ts requires
// per-request rendering — and these pages read the session cookie anyway.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://maksutcakmaktas.com"),
  robots: { index: false, follow: false },
};

export default function ArenaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
