import { describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";

vi.mock("next/font/google", () => ({ Inter: () => ({ variable: "", className: "" }) }));

vi.mock("@/lib/get-locale", () => ({
  getCurrentDomainConfig: async () => getDomainConfigByLocale("da"),
  getLocale: async () => "da",
}));

import { generateMetadata } from "./layout";
import { buildPageMetadata } from "@/lib/page-helpers";

/**
 * The 404 page inherits the root layout's metadata. Next adds its own
 * `<meta name="robots" content="noindex">` for not-found, so the layout must
 * not contribute a robots `index`/`follow` or a canonical (to the front page).
 * Otherwise a 404 ships two contradicting robots tags and a canonical to "/".
 */
describe("root layout metadata (inherited by the 404 page)", () => {
  test("declares no canonical, so error pages cannot point at the front page", async () => {
    const meta = await generateMetadata();
    expect(meta.alternates?.canonical).toBeUndefined();
  });

  test("declares no robots index/follow that would sit next to Next's 404 noindex", async () => {
    const meta = await generateMetadata();
    const robots = meta.robots as Record<string, unknown>;
    expect(robots?.index).toBeUndefined();
    expect(robots?.follow).toBeUndefined();
    const bot = (robots?.googleBot ?? {}) as Record<string, unknown>;
    expect(bot.index).toBeUndefined();
    expect(bot.follow).toBeUndefined();
  });
});

describe("ordinary pages keep their own canonical and stay indexable", () => {
  test.each(["brutto-netto", "bmi", "boliglaan"])("%s", (slug) => {
    const da = getDomainConfigByLocale("da");
    const meta = buildPageMetadata(slug, da);
    expect(meta.alternates?.canonical).toBe(`${da.baseUrl}/${slug}`);
    const robots = meta.robots as { index?: boolean } | undefined;
    expect(robots?.index).not.toBe(false);
  });
});
