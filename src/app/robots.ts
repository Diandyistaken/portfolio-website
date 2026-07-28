import type { MetadataRoute } from "next";

const siteUrl = "https://www.maksutcakmaktas.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/mulakatmicro1"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
