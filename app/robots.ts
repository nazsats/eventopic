import type { MetadataRoute } from "next";

const BASE = "https://eventopic.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep private / authenticated areas out of search results.
        disallow: ["/admin", "/dashboard", "/profile", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
