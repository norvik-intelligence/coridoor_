import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  return [
    "",
    "/buyer-objection-report",
    "/sample-report",
    "/security",
    "/nda",
    "/privacy",
    "/imprint"
  ].map((path, index) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7
  }));
}
