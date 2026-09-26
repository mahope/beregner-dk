import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getPageData, getAvailableSlugs } from "@/lib/page-data";
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

      for (const slug of getAvailableSlugs(locale)) {
        const data = getPageData(slug, locale);
        if (!data) continue;
        const key = headline(data.metaTitle);
        seen.set(key, [...(seen.get(key) ?? []), `/${slug}`]);
      }

      for (const post of posts) {
        const key = headline(post.title);
        seen.set(key, [...(seen.get(key) ?? []), `/blog/${post.slug}`]);
      }

      const collisions = [...seen.entries()]
        .filter(([, paths]) => paths.length > 1)
        .map(([key, paths]) => `${key} -> ${paths.join(", ")}`);

      expect(collisions).toEqual([]);
    });
  }
});
