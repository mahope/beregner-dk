import type { DomainConfig } from "@/lib/domain-config";

/**
 * Generates hreflang <link> tags for cross-domain SEO.
 * Tells Google which version of the page to show for each language.
 */
export function HreflangTags({ domains }: { domains: DomainConfig[] }) {
  return (
    <>
      {domains.map((dc) => (
        <link
          key={dc.hreflangCode}
          rel="alternate"
          hrefLang={dc.hreflangCode}
          href={dc.baseUrl}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={domains.find((d) => d.locale === "da")?.baseUrl || domains[0].baseUrl}
      />
    </>
  );
}
