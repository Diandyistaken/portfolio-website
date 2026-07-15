import type { MetadataRoute } from "next";

const siteUrl = "https://maksutcakmaktas.com";

const languages = {
  tr: siteUrl,
  en: `${siteUrl}/en`,
  de: `${siteUrl}/de`,
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${siteUrl}/en`,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages },
    },
    {
      url: `${siteUrl}/de`,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages },
    },
  ];
}
