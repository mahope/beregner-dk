import { describe, expect, it } from "vitest";
import { beregnere } from "./categories";
import { getFooterBlogLinks, getFooterCategories } from "./footer-data";
import { getDageTilKort, getHomeCalculators } from "./home-data";
import { getNavigation } from "./navigation";
import type { Locale } from "@/lib/i18n";

/**
 * Every internal href the site's central catalogs hand to a <Link> must be a
 * well-formed site path.
 *
 * This is the class C115 found: the homepage built
 * `href={`/${prefix}/${slug}`}` from a prefix that already carries both
 * slashes, so all 14 countdown cards rendered `//dage-til//juledagen`. A
 * leading `//` is a *protocol-relative URL* — the browser resolved every card
 * to a host named "dage-til" and sent the visitor off-site.
 *
 * Two earlier gates missed it. C108's test built its expectation from the same
 * expression as the code, so it was green precisely because it repeated the
 * bug (C44's lesson in a new form: hit the code that renders, but do not
 * rebuild the expression you are measuring). And a source-level grep for
 * `href="//` would not have seen it either, because the broken href was
 * *computed*, not written out. Only a measurement of the values that actually
 * reach the markup can catch it — which is what this is.
 *
 * The catalogs are the right level on purpose: they are the single place every
 * page draws its internal links from, so one assertion here covers the
 * homepage, the header, the footer and the category pages at once.
 */
const LOCALE: Locale[] = ["da", "se", "no"];

/** Internal site paths: one leading slash, no empties, no query or fragment. */
const STI = /^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;

function hrefs(): { kilde: string; href: string }[] {
  const ud: { kilde: string; href: string }[] = [];

  for (const b of beregnere) {
    ud.push({ kilde: "categories.beregnere", href: b.href });
  }

  for (const locale of LOCALE) {
    for (const c of getHomeCalculators(locale)) {
      ud.push({ kilde: `home-data.getHomeCalculators(${locale}) ${c.title}`, href: c.href });
    }
    for (const k of getDageTilKort(locale, new Date())) {
      ud.push({ kilde: `home-data.getDageTilKort(${locale}) ${k.title}`, href: k.href });
    }
    for (const kategori of getFooterCategories(locale)) {
      for (const link of kategori.links) {
        ud.push({ kilde: `footer.getFooterCategories(${locale}) ${kategori.name} > ${link.name}`, href: link.href });
      }
    }
    for (const link of getFooterBlogLinks(locale)) {
      ud.push({ kilde: `footer.getFooterBlogLinks(${locale}) ${link.name}`, href: link.href });
    }
    for (const item of getNavigation(locale)) {
      if (item.href) {
        ud.push({ kilde: `navigation.getNavigation(${locale}) ${item.name}`, href: item.href });
      }
      for (const barn of item.children ?? []) {
        ud.push({ kilde: `navigation.getNavigation(${locale}) ${item.name} > ${barn.name}`, href: barn.href });
      }
    }
  }

  return ud;
}

const ALLE = hrefs();

describe("alle interne href i katalogerne er gyldige stier", () => {
  it("der er href at måle — ellers ville resten af filen være grøn uden at se noget", () => {
    // The failure mode of a gate like this is silence: if a catalog changes
    // shape, the loop yields nothing and every rule below passes vacuously.
    expect(ALLE.length).toBeGreaterThan(200);
  });

  it.each(ALLE)("$kilde → $href er en gyldig sti", ({ href }) => {
    expect(href, href).toMatch(STI);
  });

  it("intet href starter med to skråstreg — det er en protocol-relative URL", () => {
    // The exact C115 bug. A href starting with "//" makes the browser resolve
    // the first segment as a hostname, so the link leaves the site entirely.
    const boeve = ALLE.filter((r) => r.href.startsWith("//"));
    expect(boeve.map((r) => `${r.kilde} → ${r.href}`)).toEqual([]);
  });

  it("intet href indeholder en dobbelt skråstreg i stien", () => {
    // "/dage-til//juledagen" is not a 404 the server needs to answer: it is a
    // link no internal link graph should carry.
    const boeve = ALLE.filter((r) => r.href.includes("//"));
    expect(boeve.map((r) => `${r.kilde} → ${r.href}`)).toEqual([]);
  });

  it("intet href har en afsluttende skråstreg", () => {
    // "/moms/" og "/moms" er to URL'er for Google. Katalogerne skal vælge én.
    const boeve = ALLE.filter((r) => r.href !== "/" && r.href.endsWith("/"));
    expect(boeve.map((r) => `${r.kilde} → ${r.href}`)).toEqual([]);
  });

  it("intet href er tomt eller kun en skråstreg", () => {
    const boeve = ALLE.filter((r) => r.href.trim() === "" || r.href === "/");
    expect(boeve.map((r) => `${r.kilde} → "${r.href}"`)).toEqual([]);
  });
});
