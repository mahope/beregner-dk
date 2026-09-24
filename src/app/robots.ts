import type { MetadataRoute } from "next";
import type { DomainConfig } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export function buildRobots(domainConfig: DomainConfig): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/embed/", "/design-system"],
      },
    ],
    sitemap: `${domainConfig.baseUrl}/sitemap.xml`,
  };
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  return buildRobots(await getCurrentDomainConfig());
}
