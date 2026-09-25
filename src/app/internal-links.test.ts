import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, test } from "vitest";
import { getCalculatorsByLocale, getRelatedCalculators } from "@/lib/calculator-list";

const root = join(__dirname, "..", "..");
const srcDir = join(root, "src");
const appDir = join(srcDir, "app");

function walk(dir: string, matcher: RegExp, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, matcher, out);
    else if (matcher.test(entry)) out.push(path);
  }
  return out;
}

function toRoute(file: string): string {
  const route = relative(appDir, file)
    .split(sep)
    .join("/")
    .replace(/\/(page|route)\.(tsx|ts|jsx|js)$/, "");
  return route === "page" || route === "route" ? "" : route;
}

const routes = new Set(walk(appDir, /^(page|route)\.(tsx|ts|jsx|js)$/).map(toRoute));

/** App Router metadata-filer som selv serverer en sti, fx `src/app/icon.svg`. */
const metadataAssets = new Set(
  walk(appDir, /^(icon|apple-icon|opengraph-image|favicon)\.[a-z0-9]+$/i).map((file) =>
    `/${relative(appDir, file).split(sep).join("/")}`
  )
);

/** A static internal path matches a route when every literal segment is equal. */
function resolvesToRoute(href: string): boolean {
  const path = href.replace(/^\//, "").replace(/\/$/, "");
  if (path === "") return true;
  if (existsSync(join(root, "public", path))) return true;
  if (metadataAssets.has(`/${path}`)) return true;

  const segments = path.split("/");
  return [...routes].some((route) => {
    const routeSegments = route === "" ? [] : route.split("/");
    if (routeSegments.length !== segments.length) return false;
    return routeSegments.every((segment, i) => segment.startsWith("[") || segment === segments[i]);
  });
}

/**
 * Only quoted, fully static paths are checked. Template literals and computed
 * hrefs are skipped because they cannot be resolved without rendering.
 */
const STATIC_HREF = /(?:href|src)\s*[:=]\s*\{?\s*["'`](\/[^"'`#$?]*?)["'`]/g;

const brokenLinks: string[] = [];
for (const file of walk(srcDir, /\.(tsx|ts|jsx|js)$/)) {
  if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(STATIC_HREF)) {
    const href = match[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    if (resolvesToRoute(href)) continue;
    brokenLinks.push(`${relative(root, file).split(sep).join("/")} -> ${href}`);
  }
}

describe("interne links", () => {
  test("peger kun på sider, der findes", () => {
    expect(brokenLinks).toEqual([]);
  });
});

describe("relaterede beregnere", () => {
  const known = new Set(getCalculatorsByLocale("da").map((calculator) => calculator.href));

  test("alle nøgler i relatedMap er beregnere, der findes", () => {
    for (const href of known) {
      for (const related of getRelatedCalculators(href, "da")) {
        expect(known.has(related.href), `${href} -> ${related.href}`).toBe(true);
      }
    }
  });

  test("alle relaterede beregnere findes som ruter", () => {
    for (const href of known) {
      for (const related of getRelatedCalculators(href, "da")) {
        expect(resolvesToRoute(related.href), `${href} -> ${related.href}`).toBe(true);
      }
    }
  });
});
