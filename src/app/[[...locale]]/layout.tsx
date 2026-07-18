import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { AdminProvider } from "@/components/AdminProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { isAdminRequest } from "@/lib/auth/admin";
import { getDictionary, resolveLocale, localePath, supportedLocales } from "@/lib/i18n/route";
import type { Content, Locale } from "@/lib/i18n/types";

// Quiet Machine direction: one thin, wide-tracking sans for both display and
// body copy (no serif/geometric-sans pairing) — restraint is the point.
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

const siteUrl = "https://maksutcakmaktas.com";
const ogLocaleMap: Record<Locale, string> = { tr: "tr_TR", en: "en_US", de: "de_DE" };

type Params = { locale?: string[] };

// Nonce-based CSP (src/proxy.ts) requires per-request rendering: Next stamps
// the request's nonce onto its inline scripts only during dynamic SSR —
// statically prerendered HTML would ship nonce-less scripts the CSP blocks.
export const dynamic = "force-dynamic";

function buildPersonJsonLd(locale: Locale, content: Content) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.personalInfo.name,
    alternateName: ["Maksut Çakmaktaş", "Muhammed Maksut", "Maksut", "Çakmaktaş"],
    url: `${siteUrl}${localePath(locale)}`,
    image: `${siteUrl}/profil-fotografi.jpg`,
    jobTitle: content.personalInfo.title,
    description: content.meta.description,
    email: `mailto:${content.personalInfo.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "İstanbul",
      addressCountry: "TR",
    },
    knowsAbout: content.meta.knowsAbout,
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: content.education.school,
    },
    sameAs: [content.personalInfo.linkedin, content.personalInfo.github, content.personalInfo.instagram],
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale: segments } = await params;
  const locale = resolveLocale(segments);
  const content = getDictionary(locale);
  const url = `${siteUrl}${localePath(locale)}`;

  return {
    metadataBase: new URL(siteUrl),
    title: content.meta.title,
    description: content.meta.description,
    keywords: [
      "Muhammed Maksut Çakmaktaş",
      "Maksut Çakmaktaş",
      "Muhammed Maksut",
      "Maksut",
      "Çakmaktaş",
      "Bilgisayar Mühendisi",
      "Siber Güvenlik Meraklısı",
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
    authors: [{ name: content.personalInfo.name, url: siteUrl }],
    creator: content.personalInfo.name,
    alternates: {
      canonical: url,
      languages: {
        tr: siteUrl,
        en: `${siteUrl}/en`,
        de: `${siteUrl}/de`,
        "x-default": siteUrl,
      },
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
      title: content.meta.title,
      description: content.meta.description,
      url,
      siteName: content.personalInfo.name,
      locale: ogLocaleMap[locale],
      alternateLocale: supportedLocales.filter((l) => l !== locale).map((l) => ogLocaleMap[l]),
      type: "profile",
      firstName: "Muhammed Maksut",
      lastName: "Çakmaktaş",
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<Params>;
}>) {
  const { locale: segments } = await params;
  const locale = resolveLocale(segments);
  const content = getDictionary(locale);
  const personJsonLd = buildPersonJsonLd(locale, content);
  const isAdmin = await isAdminRequest();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geist.variable} ${geistMono.variable} h-full antialiased`}
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
          <LanguageProvider initialLocale={locale} initialDict={content}>
            <AdminProvider isAdmin={isAdmin}>{children}</AdminProvider>
          </LanguageProvider>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
