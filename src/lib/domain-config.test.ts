import { describe, test, expect } from "vitest";
import { getDomainConfig, getAllDomainConfigs, getDomainConfigByLocale } from "./domain-config";

describe("getDomainConfig", () => {
  test("returns DA config for minberegner.dk", () => {
    const config = getDomainConfig("minberegner.dk");
    expect(config.locale).toBe("da");
    expect(config.currency).toBe("DKK");
    expect(config.hreflangCode).toBe("da");
  });

  test("returns DA config for www.minberegner.dk", () => {
    const config = getDomainConfig("www.minberegner.dk");
    expect(config.locale).toBe("da");
  });

  test("returns NO config for beregner.no", () => {
    const config = getDomainConfig("beregner.no");
    expect(config.locale).toBe("no");
    expect(config.currency).toBe("NOK");
    expect(config.hreflangCode).toBe("nb");
  });

  test("returns SE config for beraknare.se", () => {
    const config = getDomainConfig("beraknare.se");
    expect(config.locale).toBe("se");
    expect(config.currency).toBe("SEK");
    expect(config.hreflangCode).toBe("sv");
  });

  test("strips port from hostname", () => {
    const config = getDomainConfig("minberegner.dk:3000");
    expect(config.locale).toBe("da");
  });

  test("falls back to localhost config for unknown domains", () => {
    const config = getDomainConfig("unknown.example.com");
    expect(config.locale).toBe("da");
  });
});

describe("getAllDomainConfigs", () => {
  test("excludes hidden domains", () => {
    const configs = getAllDomainConfigs();
    const locales = configs.map((c) => c.locale);
    expect(locales).not.toContain("localhost");
    expect(locales).toContain("da");
    expect(locales).toContain("se");
  });

  test("returns valid baseUrls", () => {
    const configs = getAllDomainConfigs();
    for (const config of configs) {
      expect(config.baseUrl).toMatch(/^https:\/\//);
    }
  });
});

describe("getDomainConfigByLocale", () => {
  test("returns correct config for each locale", () => {
    expect(getDomainConfigByLocale("da").siteName).toBe("MinBeregner.dk");
    expect(getDomainConfigByLocale("se").siteName).toBe("Beräknare.se");
    expect(getDomainConfigByLocale("no").siteName).toBe("Beregner.no");
  });
});
