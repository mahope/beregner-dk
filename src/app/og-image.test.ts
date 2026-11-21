import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { buildPageMetadata, OG_IMAGE, OG_IMAGE_URL } from "@/lib/page-helpers";
import { buildDageTilMetadata } from "@/components/DageTilPage";

// `Inter()` is a build-time font loader that has no jsdom implementation; the
// layout imports it at module scope, so it has to be stubbed before the import.
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter", className: "font-inter" }),
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(async () => "da"),
  getCurrentDomainConfig: vi.fn(async () => getDomainConfigByLocale("da")),
}));

const { generateMetadata } = await import("./layout");

/**
 * Every page that shares its own `openGraph` object overrides the root
 * layout's entirely, so the social preview image has to be named in both
 * places. Measured on production before the fix: 0 of 206 pages emitted an
 * `og:image` tag, even though `/opengraph-image` returned 200 with a 93 KB
 * PNG — the file convention generated the image but never linked it.
 */
describe("social preview image", () => {
  test("the root layout names the preview image on openGraph and twitter", async () => {
    const metadata = await generateMetadata();
    const ogImages = metadata.openGraph?.images;
    const twitterImages = metadata.twitter?.images;

    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe("summary_large_image");
    expect(ogImages).toEqual([
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: "MinBeregner.dk / Beräknare.se",
      },
    ]);
    // Twitter/X silently falls back to a text-only card when the image is
    // missing, so the two have to agree rather than one carrying it.
    expect(twitterImages).toEqual(ogImages);
  });

  test("page-level metadata names the same image, not a second URL", () => {
    for (const locale of ["da", "se"] as const) {
      const metadata = buildPageMetadata("procent", getDomainConfigByLocale(locale));
      expect(metadata.openGraph?.images).toEqual(
        buildPageMetadata("dato", getDomainConfigByLocale(locale)).openGraph?.images
      );
      expect(metadata.twitter?.images).toEqual(metadata.openGraph?.images);
    }
  });

  test("the image route the metadata points at is the one that exists", () => {
    // The URL is a string, not an import, so nothing else would catch a typo
    // or a route rename — the generated image would 404 for every share.
    expect(OG_IMAGE_URL).toBe("/opengraph-image");
  });

  test("every page that declares its own openGraph names the image", () => {
    // A page-level `openGraph` replaces the layout's object wholesale, so it
    // silently drops the image unless it names it too. 33 pages were measured
    // losing their preview this way; this is the rule that keeps the next one
    // from reintroducing it.
    const appDir = join(__dirname);
    const offenders: string[] = [];
    let inspected = 0;

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);
        if (statSync(path).isDirectory()) {
          walk(path);
        } else if (entry === "page.tsx") {
          const source = readFileSync(path, "utf8");
          if (!source.includes("openGraph: {")) continue;
          inspected++;
          if (!source.includes("images: OG_IMAGE")) {
            offenders.push(path.replace(appDir, "src/app"));
          }
        }
      }
    };
    walk(appDir);

    expect(inspected).toBeGreaterThan(30);
    expect(offenders).toEqual([]);
  });

  test("the dage-til metadata builder names the image", async () => {
    // Third blind spot, same shape as C166's `buildDageTilMetadata`: these 28
    // pages have no `page.tsx` openGraph literal at all, so the scan above
    // cannot see them — the metadata is assembled in a shared component.
    const metadata = await buildDageTilMetadata(
      "/dage-til/",
      "juledagen",
      new Date("2026-09-29T12:00:00Z")
    );

    expect(metadata.openGraph?.images).toEqual(OG_IMAGE);
    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe("summary_large_image");
    expect(metadata.twitter?.images).toEqual(OG_IMAGE);
  });
});
