import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/seo/public";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/ar-DZ", "/fr-DZ", "/tzm-DZ", "/ar-DZ/aid-points/", "/fr-DZ/aid-points/", "/tzm-DZ/aid-points/"],
        disallow: ["/admin", "/organiser", "/portal", "/api/"]
      }
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
    host: getBaseUrl()
  };
}
