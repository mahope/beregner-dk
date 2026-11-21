import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Gate on the coupling between `globals.css` and `<html>` in the root layout.
 *
 * `globals.css` sets `html { scroll-behavior: smooth }`. Up to Next 15, Next
 * overrode that property while a client-side route transition ran, so a new
 * page jumped instantly to the top. Next 16 stopped overriding it, which makes
 * the attribute on `<html>` the only thing keeping navigation snappy.
 *
 * Nothing user-visible reports a regression here: the site simply scrolls
 * slowly through every page it visits, one route change at a time. So both
 * halves are locked from source — the rendered layout pulls in an async client
 * Footer that a jsdom render cannot await cleanly, and the attribute itself is
 * plain markup either way.
 */
const ROOT = resolve(__dirname, "..", "..");

describe("root layout scroll behaviour", () => {
  test("<html> opts back into Next's instant scroll-to-top", () => {
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    const htmlTag = layout.match(/<html\b[^>]*>/)?.[0];

    expect(htmlTag).toBeDefined();
    expect(htmlTag).toMatch(/\bdata-scroll-behavior="smooth"/);
  });

  test("the attribute is only load-bearing while globals.css scrolls smoothly", () => {
    const css = readFileSync(join(ROOT, "src/app/globals.css"), "utf8");

    expect(css).toMatch(/html\s*\{[^}]*scroll-behavior:\s*smooth/);
  });
});