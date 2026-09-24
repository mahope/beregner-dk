import type { DomainConfig } from "./domain-config";
import { isCalculatorAvailable, isCalculatorPath } from "./calculator-list";

export type RouteDecision =
  | { type: "allow" }
  | { type: "not-found" }
  | { type: "redirect"; destination: string; status: 301 | 308 };

const swedishAliases: Record<string, string> = {
  "/loen-efter-skat": "/lon-efter-skatt",
  "/tidskalkylator": "/tidsberegner",
  "/datumkalkylator": "/dato",
  "/nedrakning": "/nedtaelling",
  "/leasingkalkylator": "/leasing",
};

const danishOnlySections = ["/blog", "/kategori"] as const;

function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

function isInSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`);
}

export function getRouteDecision(
  domainConfig: DomainConfig | null,
  pathname: string
): RouteDecision {
  const normalizedPath = normalizePathname(pathname);
  const hasTrailingSlash = pathname !== "/" && normalizedPath !== pathname;

  if (!domainConfig || domainConfig.baseUrl.includes("localhost")) {
    return hasTrailingSlash
      ? { type: "redirect", destination: normalizedPath, status: 308 }
      : { type: "allow" };
  }

  if (domainConfig.locale === "se") {
    const alias = swedishAliases[normalizedPath];
    if (alias) return { type: "redirect", destination: alias, status: 301 };
  }

  if (
    (domainConfig.locale === "se" || domainConfig.locale === "no") &&
    danishOnlySections.some((section) => isInSection(normalizedPath, section))
  ) {
    return { type: "not-found" };
  }

  if (
    isCalculatorPath(normalizedPath) &&
    !isCalculatorAvailable(normalizedPath, domainConfig.locale)
  ) {
    return { type: "not-found" };
  }

  return hasTrailingSlash
    ? { type: "redirect", destination: normalizedPath, status: 308 }
    : { type: "allow" };
}
