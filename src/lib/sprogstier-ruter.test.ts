import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { DAGE_I_AARET_PATH } from "@/lib/dage-i-aaret";
import { DAGE_MELLEM_PATH } from "@/lib/dage-mellem-datoer";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { TIMER_I_ARET_PATH, timerCopy } from "@/lib/timer-i-aret";
import { ARBEJDSDAGE_PATH } from "@/lib/arbejdsdage";
import { buildSitemap } from "@/app/sitemap";

/**
 * Sidens egen sti i hvert sprog skal være en mappe med en `page.tsx` under
 * `src/app`, og den skal være den sti, der står i sitemap.
 *
 * Det er ikke en kosmetisk regel. Den danske `/timer-i-aret` har været live
 * hele tiden med rigtig titel og canonical — men en deploy-note, et par
 * commit-beskeder og en fejl-måling skrev den som `/timer-i-aaret`, med et `a`
 * for meget. Den URL har aldrig eksisteret og svarer 404, og fordi porten
 * `meta-description.test.ts` finder ruterne med `import.meta.glob`, er en
 * sti, der *kun* findes i en note, usynlig for den: noter og commit-beskeder
 * er ikke dømt af noget som hele vejen kan se.
 *
 * Derfor dømmer denne fil de to ting, der kan stemme overens: at mappen
 * findes, og at sitemap peger på præcis den sti koden bruger.
 *
 * Målt 3/10 18:2x, så det er ikke overdrevet: mutationen
 * `da: "/timer-i-aaret"` i stikortet giver **1 rød**, og det er
 * **mappe-kontrollen** — `sitemap`-kontrollen bliver grøn, fordi
 * `buildSitemap` læser samme konstant og derfor følger med i fejlen. De to
 * kontroller er altså ikke ens; mappe-kontrollen er den, der fanger
 * håndskrevne stier, og sitemap-kontrollen fanger en side, der er holdt
 * ude af sitemap.
 */
const PARREDE_STIER: { navn: string; sti: string; locale: "da" | "se" }[] = [
  ...(["da", "se"] as const).map((locale) => ({
    navn: `DAGE_I_AARET_PATH.${locale}`,
    sti: DAGE_I_AARET_PATH[locale],
    locale,
  })),
  ...(["da", "se"] as const).map((locale) => ({
    navn: `DAGE_MELLEM_PATH.${locale}`,
    sti: DAGE_MELLEM_PATH[locale],
    locale,
  })),
  ...(["da", "se"] as const).map((locale) => ({
    navn: `TIMER_I_ARET_PATH.${locale}`,
    sti: TIMER_I_ARET_PATH[locale],
    locale,
  })),
  ...(["da", "se"] as const).map((locale) => ({
    navn: `ARBEJDSDAGE_PATH.${locale}`,
    sti: ARBEJDSDAGE_PATH[locale],
    locale,
  })),
];

function ruteFindes(sti: string): boolean {
  return existsSync(join(process.cwd(), "src", "app", sti, "page.tsx"));
}

describe("sprogslagte stier er rigtige ruter", () => {
  it("dømmer alle otte stier, ikke to", () => {
    // Nøglen i stikortene er sproget, så de fire kort må ikke spredes sammen:
    // da ville de seneste overskrive `da`/`se` fra de tidligere, og porten
    // ville dømme to stier i stedet for otte.
    expect(PARREDE_STIER).toHaveLength(8);
  });

  for (const { navn, sti } of PARREDE_STIER) {
    it(`${sti} (${navn}) har en page.tsx under src/app`, () => {
      expect(
        ruteFindes(sti),
        `${sti} mangler som mappe under src/app — siden ville svare 404, selv om stien står i sitemap og hreflang`,
      ).toBe(true);
    });
  }

  for (const { sti, locale } of PARREDE_STIER) {
    it(`${sti} står i sitemap for ${locale}`, () => {
      const { baseUrl } = getDomainConfigByLocale(locale);
      const urls = buildSitemap(getDomainConfigByLocale(locale)).map((e) => e.url);
      expect(
        urls,
        `sitemap for ${locale} skal pege på ${baseUrl}${sti}`,
      ).toContain(`${baseUrl}${sti}`);
    });
  }
});

/**
 * Samme årsag, anden manifestation: `meta-description.test.ts` kan ikke dømme
 * `/timer-i-aret`, fordi dens `vi.mock` på `@/lib/get-locale` ikke når ned i
 * `TimerIAaret.tsx`, så den holdt den danske sti ude af sin egen
 * undtagelsesliste. Copy'en, der skriver `<head>`, er derfor dømt her i stedet
 * for i den port, der ikke kan se den.
 */
describe("timer-i-aaret skriver en gyldig description", () => {
  for (const locale of ["da", "se"] as const) {
    it(`${locale}: title og description er ikke tomme og er under 160 tegn`, () => {
      const c = timerCopy[locale];
      expect(c.title.length, `${locale} title`).toBeGreaterThan(0);
      expect(c.title.length, `${locale} title`).toBeLessThanOrEqual(160);
      expect(c.description.length, `${locale} description`).toBeGreaterThan(0);
      expect(c.description.length, `${locale} description`).toBeLessThanOrEqual(160);
    });
  }
});