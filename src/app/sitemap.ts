import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const publicPages = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
  {
    path: "/privacy-policy",
    changeFrequency: "yearly" as const,
    priority: 0.4,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}
