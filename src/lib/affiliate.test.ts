import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { adtractionLink, TRACKING_URLS } from "./adtraction";
import { buildSubid, detectNetwork, NETWORKS, pageSlug, withSubid } from "./affiliate";

const partnerAds = (extra = "") =>
  `https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=60068${extra}`;

describe("pageSlug", () => {
  it.each([
    ["/", "forside"],
    ["/dagpenge", "dagpenge"],
    ["/dagpenge/", "dagpenge"],
    ["/blog/Løn og Åbning", "blog-loen-og-aabning"],
  ])("%s -> %s", (path, slug) => {
    expect(pageSlug(path)).toBe(slug);
  });
});

describe("buildSubid", () => {
  it("uses <site>.<page>.<placement> with only [a-z0-9._-]", () => {
    expect(buildSubid("partner-ads", "dagpenge", "akasse")).toBe("mb.dagpenge.akasse");
    expect(buildSubid("adtraction", "Æble Å", "Top!")).toMatch(/^[a-z0-9._-]+$/);
  });

  it("omits the placement when none is given", () => {
    expect(buildSubid("adtraction", "bmi")).toBe("mb.bmi");
  });

  it.each(["adtraction", "partner-ads"] as const)("never exceeds the %s length limit", (network) => {
    const id = buildSubid(network, "x".repeat(500), "akasse");
    expect(id.length).toBeLessThanOrEqual(NETWORKS[network].maxLength);
    expect(id.endsWith(".akasse")).toBe(true);
  });
});

describe("withSubid, Partner-ads", () => {
  it("adds uid and keeps existing parameters", () => {
    expect(withSubid(partnerAds(), "/bmi", "sundhed")).toBe(partnerAds("&uid=mb.bmi.sundhed"));
  });

  it("puts uid before htmlurl and keeps the encoded deeplink untouched", () => {
    const deep = partnerAds("&htmlurl=https%3A%2F%2Fwww.example.dk%2Fbil%3Fx%3D1%26y%3D2");
    const out = withSubid(deep, "/leasing", "bilforsikring");
    expect(out).toBe(
      partnerAds("&uid=mb.leasing.bilforsikring&htmlurl=https%3A%2F%2Fwww.example.dk%2Fbil%3Fx%3D1%26y%3D2"),
    );
    expect(new URL(out).searchParams.get("htmlurl")).toBe("https://www.example.dk/bil?x=1&y=2");
    expect(new URL(out).searchParams.get("partnerid")).toBe("42553");
  });

  it("does not add the sub-id twice", () => {
    const once = withSubid(partnerAds(), "/bmi", "sundhed");
    expect(withSubid(once, "/bmi", "sundhed")).toBe(once);
    expect(withSubid(partnerAds("&uid=custom"), "/bmi", "x")).toBe(partnerAds("&uid=custom"));
  });
});

describe("withSubid, Adtraction", () => {
  const deeplink = "https://www.ase.dk/a-kasse?fra=beregner&valg=1";

  it.each(Object.keys(TRACKING_URLS))("program %s: valid URL, epi before url, params kept", (id) => {
    const plain = adtractionLink(id, deeplink);
    const out = withSubid(plain, "/dagpenge", "akasse");
    const parsed = new URL(out);
    expect(parsed.searchParams.get("epi")).toBe("mb.dagpenge.akasse");
    expect(parsed.searchParams.get("url")).toBe(deeplink);
    expect(parsed.searchParams.get("as")).toBe("2056156501");
    expect(parsed.searchParams.get("tk")).toBe("1");
    // Adtraction: with a deeplink the url parameter must come last.
    expect(out.indexOf("epi=")).toBeLessThan(out.indexOf("&url="));
    expect(out.endsWith(`&url=${encodeURIComponent(deeplink)}`)).toBe(true);
  });

  it("does not add the sub-id twice", () => {
    const once = withSubid(adtractionLink("1666137874", deeplink), "/dagpenge", "akasse");
    expect(withSubid(once, "/dagpenge", "akasse")).toBe(once);
  });

  it("works without a deeplink", () => {
    expect(withSubid(TRACKING_URLS["1666137874"], "/bmi")).toBe(`${TRACKING_URLS["1666137874"]}&epi=mb.bmi`);
  });
});

describe("withSubid, other URLs", () => {
  it.each(["https://www.ase.dk/", "https://timetrack.dk/?utm_source=minberegner", "not a url"])(
    "leaves %s unchanged",
    (url) => {
      expect(detectNetwork(url)).toBeNull();
      expect(withSubid(url, "/bmi", "x")).toBe(url);
    },
  );
});

// Guard: every affiliate link must go through withSubid (via AffiliateBox).
describe("affiliate links in the code", () => {
  const src = join(__dirname, "..");
  const allowed = new Set([
    "lib/affiliate.ts",
    "lib/adtraction.ts",
    "components/AffiliateBox.tsx",
  ]);
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(tsx?|mdx?|json)$/.test(name) && !/\.test\./.test(name)) files.push(full);
    }
  };
  walk(src);

  const hosts = [
    "partner-ads.com",
    "adtraction.",
    "adt212.net",
    "adtr.co",
    "awin1.com",
    "tradedoubler.com",
    "daisycon.io",
    ...Object.values(TRACKING_URLS).map((u) => new URL(u).hostname),
  ];

  it("hard-codes no network link outside the helper files", () => {
    const offenders = files
      .filter((f) => !allowed.has(relative(src, f)))
      .filter((f) => {
        const text = readFileSync(f, "utf-8");
        return hosts.some((h) => text.includes(h)) || /\/t\/t\?a=\d+/.test(text);
      })
      .map((f) => relative(src, f));
    expect(offenders).toEqual([]);
  });

  it("uses the link helpers only inside AffiliateBox links, never as a bare href", () => {
    const users = files
      .filter((f) => !allowed.has(relative(src, f)))
      .filter((f) => /\b(partnerAdsLink|adtractionLink)\(/.test(readFileSync(f, "utf-8")));
    const bare = users.filter((f) =>
      /href=\{\s*(partnerAdsLink|adtractionLink)\(/.test(readFileSync(f, "utf-8")),
    );
    const withoutBox = users.filter((f) => !readFileSync(f, "utf-8").includes("<AffiliateBox"));
    expect(bare.map((f) => relative(src, f))).toEqual([]);
    expect(withoutBox.map((f) => relative(src, f))).toEqual([]);
  });

  it("renders every AffiliateBox link through withSubid", () => {
    const box = readFileSync(join(src, "components/AffiliateBox.tsx"), "utf-8");
    expect(box).toContain("withSubid(link.url");
    expect(box).not.toMatch(/href=\{link\.url\}/);
  });
});
