import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/admin/", "/settings/", "/profile/", "/exam/", "/practice/", "/results/", "/upgrade/", "/onboarding/", "/partners/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
