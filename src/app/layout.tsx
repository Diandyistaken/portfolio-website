import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const siteUrl = "https://muhammedmaksut.dev";
const title = "Muhammed Maksut Çakmaktaş | Bilgisayar Mühendisi & Cybersecurity Enthusiast";
const description =
  "Siber güvenlik ve yazılım geliştirme süreçlerinde proaktif çözümler üreten Bilgisayar Mühendisi Muhammed Maksut Çakmaktaş'ın kişisel portfolyo sitesi.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "Muhammed Maksut Çakmaktaş",
    "Cybersecurity",
    "Bilgisayar Mühendisi",
    "Penetration Tester",
    "Python",
    "Unity",
    "Portfolyo",
  ],
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Muhammed Maksut Çakmaktaş",
    locale: "tr_TR",
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
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
