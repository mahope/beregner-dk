import { headers } from "next/headers";
import type { Locale } from "./i18n";
import { getDomainConfig, type DomainConfig } from "./domain-config";

/**
 * Get the current locale from request headers (set by middleware).
 * Use this in server components and generateMetadata functions.
 */
export async function getLocale(): Promise<Locale> {
  const headersList = await headers();
  return (headersList.get("x-locale") as Locale) || "da";
}

/**
 * Get the full domain config for the current request.
 * Use this in server components for baseUrl, siteName, etc.
 */
export async function getCurrentDomainConfig(): Promise<DomainConfig> {
  const headersList = await headers();
  const hostname = headersList.get("x-hostname") || "localhost";
  return getDomainConfig(hostname);
}
