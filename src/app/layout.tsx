import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { tr } from "@/lib/i18n/tr";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://maksutcakmaktas.com";
const title = tr.meta.title;
const description = tr.meta.description;

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: tr.personalInfo.name,
  alternateName: ["Maksut Çakmaktaş", "Muhammed Maksut", "Maksut", "Çakmaktaş"],
  url: siteUrl,
  image: `${siteUrl}/profil-fotografi.jpg`,
  jobTitle: "Bilgisayar Mühendisi | Siber Güvenlik Uzmanı",
  description,
  email: `mailto:${tr.personalInfo.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "İstanbul",
    addressCountry: "TR",
  },
  knowsAbout: [
    "Siber Güvenlik",
    "Penetrasyon Testi",
    "DevSecOps",
    "Kali Linux",
    "Metasploit",
    "Nmap",
    "Wireshark",
    "Python",
    "Unity",
    "Next.js",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: tr.education.school,
  },
  sameAs: [tr.personalInfo.linkedin, tr.personalInfo.github, tr.personalInfo.instagram],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "Muhammed Maksut Çakmaktaş",
    "Maksut Çakmaktaş",
    "Muhammed Maksut",
    "Maksut",
    "Çakmaktaş",
    "Bilgisayar Mühendisi",
    "Siber Güvenlik Uzmanı",
    "Penetrasyon Testi",
    "Pentester",
    "DevSecOps",
    "Cybersecurity Engineer",
    "Computer Engineer",
    "Kali Linux",
    "Metasploit",
    "Nmap",
    "Portfolyo",
  ],
  authors: [{ name: tr.personalInfo.name, url: siteUrl }],
  creator: tr.personalInfo.name,
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: tr.personalInfo.name,
    locale: "tr_TR",
    alternateLocale: ["en_US", "de_DE"],
    type: "profile",
    firstName: "Muhammed Maksut",
    lastName: "Çakmaktaş",
  },
  twitter: {
    card: "summary_large_image",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* first video frame: paints the background before the JS bundle lands */}
        <link
          rel="preload"
          as="image"
          href="/scrub/000.webp"
          fetchPriority="high"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <MotionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
