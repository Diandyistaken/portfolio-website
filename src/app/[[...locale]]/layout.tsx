import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { MotionProvider } from "@/components/MotionProvider";
import { getDictionary, resolveLocale, localePath, supportedLocales } from "@/lib/i18n/route";
import type { Content, Locale } from "@/lib/i18n/types";

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
const ogLocaleMap: Record<Locale, string> = { tr: "tr_TR", en: "en_US", de: "de_DE" };

type Params = { locale?: string[] };

// Generates the three crawlable locale routes at build time: "/" (tr,
// unprefixed default), "/en", "/de" — each with its own server-rendered
// HTML, title/description, and hreflang alternates.
export function generateStaticParams() {
  return [{ locale: [] }, { locale: ["en"] }, { locale: ["de"] }];
}

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

  return (
    <html
      lang={locale}
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
          <LanguageProvider initialLocale={locale} initialDict={content}>
            {children}
          </LanguageProvider>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
