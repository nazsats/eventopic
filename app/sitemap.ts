import type { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

const BASE = "https://eventopic.com";

// Regenerated at most once an hour so newly posted jobs get indexed.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Add live job detail pages (public-read). Fails safe to static-only.
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const snap = await getDocs(collection(db, "jobs"));
    jobRoutes = snap.docs.map((d) => ({
      url: `${BASE}/jobs/${d.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    /* offline / rules — ship static routes only */
  }

  return [...staticRoutes, ...jobRoutes];
}
