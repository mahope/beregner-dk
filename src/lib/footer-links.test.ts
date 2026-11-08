import { describe, test, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getFooterCategories, getFooterBlogLinks } from "./footer-data";
import { internalPathAnyLocale } from "./locale-slugs";

const appDir = path.join(process.cwd(), "src/app");

function routeExists(href: string): boolean {
  const segments = internalPathAnyLocale(href).split(/[?#]/)[0].split("/").filter(Boolean);
  const dir = path.join(appDir, ...segments);
  return ["page.tsx", "page.ts", "route.ts"].some((f) => existsSync(path.join(dir, f)));
}

const footerSource = readFileSync(
  path.join(process.cwd(), "src/components/Footer.tsx"),
  "utf8"
);

describe("footer links", () => {
  test("every data-driven footer link points to an existing route", () => {
    const hrefs = [
      ...(["da", "no", "se"] as const).flatMap((locale) =>
        getFooterCategories(locale).flatMap((c) => c.links.map((l) => l.href))
      ),
      ...getFooterBlogLinks("da").map((l) => l.href),
    ];
    const missing = [...new Set(hrefs)].filter((h) => !routeExists(h));
    expect(missing).toEqual([]);
  });

  test("every hardcoded internal href in Footer.tsx points to an existing route", () => {
    const hrefs = [...footerSource.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);
    expect(hrefs.length).toBeGreaterThan(0);
    const missing = [...new Set(hrefs)].filter((h) => !routeExists(h));
    expect(missing).toEqual([]);
  });

  test("footer has no hardcoded external links to retired tool domains", () => {
    for (const domain of ["gratisfaktura.dk", "kodeord.dk", "countdowntimer.dk"]) {
      expect(footerSource).not.toContain(domain);
    }
  });

  test("footer credits Mahoje with a followed, noopener link", () => {
    expect(footerSource).toMatch(/href="https:\/\/mahoje\.dk"\s+rel="noopener"/);
    expect(footerSource).not.toContain("nofollow");
  });
});
