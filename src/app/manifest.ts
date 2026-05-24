import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getDomainConfig } from "@/lib/domain-config";
import { getTranslations } from "@/lib/i18n";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers();
  const hostname = headersList.get("x-hostname") || "localhost";
  const domainConfig = getDomainConfig(hostname);
  const t = getTranslations(domainConfig.locale);

  return {
    name: `${domainConfig.siteName} - ${t.site.tagline}`,
    short_name: domainConfig.siteName,
    description: t.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
