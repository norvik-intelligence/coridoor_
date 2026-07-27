import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/buyer-objection-report", "/sample-report", "/security"],
        disallow: ["/dealroom/", "/admin/", "/api/", "/auth/"]
      }
    ],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl()
  };
}
