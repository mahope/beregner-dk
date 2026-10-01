import { describe, expect, test, vi } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import { getHomeCalculatorCount } from "@/lib/home-data";
import { getSiteTranslations } from "@/lib/i18n";

/**
 * The web manifest is generated per hostname, so a defect in it is invisible
 * on whichever domain you happen to test. Measured 2026-09-29: on
 * `beregner.no` the route 404'd and the homepage carried no
 * `<link rel="manifest">` at all, while the two other domains were green.
 * The route had no test, so nothing in the repo could see it — the same
 * vakuum-green failure the og:image class had.
 *
 * These tests call the real route function with a controlled hostname, so a
 * locale mix-up or a stale count fails here instead of in production.
 */
const hostnameRef = { current: "minberegner.dk" };

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) =>
      name === "x-hostname" ? hostnameRef.current : null,
  }),
}));

const { default: manifest } = await import("./manifest");

const HOSTS = ["minberegner.dk", "beraknare.se", "beregner.no"] as const;

async function manifestFor(hostname: string) {
  hostnameRef.current = hostname;
  return manifest();
}

describe("web manifest", () => {
  test("every domain serves a manifest", async () => {
    // Not one domain: this route reads the hostname at request time, so a
    // test that only covers the Danish one is green on a broken Swedish or
    // Norwegian deployment.
    for (const host of HOSTS) {
      const result = await manifestFor(host);
      expect(result, host).toBeTruthy();
      expect(result.name, host).toBeTruthy();
      expect(result.description, host).toBeTruthy();
    }
  });

  test("each domain gets the name, locale and description of its own domain", async () => {
    for (const host of HOSTS) {
      const result = await manifestFor(host);
      const config = getDomainConfig(host);
      const expected = getSiteTranslations(config.locale);

      expect(result.short_name, host).toBe(config.siteName);
      expect(result.description, host).toBe(expected.site.description);
    }
  });

  test("no domain undercounts its own catalog", async () => {
    // The exact regression of C176 in a second place: a number below the
    // real catalog is a false claim shipped in a fetched document.
    for (const host of HOSTS) {
      const locale = getDomainConfig(host).locale;
      const beskrivelse = String((await manifestFor(host)).description ?? "");
      const stated = Number(beskrivelse.match(/(\d+)\+/)?.[1]);
      expect(stated, host).toBeGreaterThanOrEqual(
        getHomeCalculatorCount(locale),
      );
    }
  });

  test("an unknown hostname falls back to Danish instead of serving nothing", async () => {
    const result = await manifestFor("example.com");
    expect(result.short_name).toBe(getDomainConfig("localhost").siteName);
    expect(result.description).toBe(getSiteTranslations("da").site.description);
  });

  test("every domain points at a start URL it can actually serve", async () => {
    for (const host of HOSTS) {
      const result = await manifestFor(host);
      expect(result.start_url, host).toBe("/");
      expect(result.display, host).toBe("standalone");
      expect(result.icons?.length, host).toBeGreaterThan(0);
    }
  });
});
