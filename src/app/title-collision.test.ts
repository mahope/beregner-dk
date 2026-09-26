import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getPageData, getAvailableSlugs } from "@/lib/page-data";
import { getDageTilEvents, getDageTilPrefix } from "@/lib/dage-til";
import type { Locale } from "@/lib/i18n";

const BLOG_DIR = join(process.cwd(), "src", "app", "blog");
const LOCALES: Locale[] = ["da", "no", "se"];

function headline(title: string): string {
  return title.split("|")[0].trim().toLowerCase();
}

function blogTitles(): { slug: string; title: string }[] {
  return readdirSync(BLOG_DIR)
    .filter((entry) => {
      try {
        return readdirSync(join(BLOG_DIR, entry)).includes("page.tsx");
      } catch {
        return false;
      }
    })
    .map((slug) => {
      const source = readFileSync(join(BLOG_DIR, slug, "page.tsx"), "utf-8");
      const match = source.match(/(?:metaTitle|title):\s*"([^"]+)"/);
      return { slug, title: match ? match[1] : "" };
    })
    .filter((entry) => entry.title.length > 0);
}

describe("title-collision", () => {
  const posts = blogTitles();

  it("finds the blog articles on disk", () => {
    expect(posts.length).toBeGreaterThan(20);
  });

  for (const locale of LOCALES) {
    it(`har ingen delte headlines på ${locale}`, () => {
      const seen = new Map<string, string[]>();

      const claim = (key: string, path: string) => {
        seen.set(key, [...(seen.get(key) ?? []), path]);
      };

      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;
        claim(headline(data.metaTitle), `/${slug}`);
      }

      for (const post of posts) {
        claim(headline(post.title), `/blog/${post.slug}`);
      }

      // The dage-til landing pages are generated from `dage-til.ts` and have
      // no entry in `page-data.ts`, so they used to be invisible to this
      // check. Their H1 and `<title>` are both the event question, and they
      // compete for the same "hvor mange dage er der til X" queries as
      // `/dato` and `/nedtaelling`.
      const dageTilPrefix = getDageTilPrefix(locale);
      if (dageTilPrefix) {
        for (const event of getDageTilEvents(locale)) {
          claim(
            headline(event[locale].copy.question),
            `${dageTilPrefix}${event[locale].slug}`
          );
        }
      }

      const collisions = [...seen.entries()]
        .filter(([, paths]) => paths.length > 1)
        .map(([key, paths]) => `${key} -> ${paths.join(", ")}`);

      expect(collisions).toEqual([]);
    });
  }

  it("dækker de genererede dage-til-sider", () => {
    // Without this the check above would still pass if `getDageTilEvents`
    // ever returned nothing, which is exactly the silent failure C44 fixed.
    for (const locale of ["da", "se"] as const) {
      expect(getDageTilEvents(locale).length).toBeGreaterThan(5);
    }
  });
});
