import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeInitScript } from "@/lib/theme-init-script";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { en } from "@/lib/i18n/en";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const siteUrl = "https://muhammedmaksut.dev";
const title = en.meta.title;
const description = en.meta.description;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "Muhammed Maksut Çakmaktaş",
    "Cybersecurity",
    "Computer Engineer",
    "Bilgisayar Mühendisi",
    "Penetration Tester",
    "Python",
    "Unity",
    "Portfolio",
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Muhammed Maksut Çakmaktaş",
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE"],
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <MotionProvider>
          <ThemeProvider>
            <LanguageProvider>{children}</LanguageProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
