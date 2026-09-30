import { describe, expect, test } from "vitest";
import { alderSideTekst, ALDER_TOKENS, alderPaDato, erstatAlderTokens } from "./alder-side-tekst";
import { alderLevet } from "./alder-levet";
import { foedselsaarRaekker } from "./alder-eksempler";
import { iDagISidensTidszone } from "./lokal-dato";
import type { Locale } from "./i18n";

/**
 * Porten til /alders levende tal.
 *
 * Før denne rettelse stod "36 år, 6 måneder og 10 dage pr. 25. september
 * 2026" i `page-data.ts` — en frossen byggeværdi i Googles snippet, der blev
 * dagsvis mere forkert. Testene her låser den nye kilde *på to dage*, så
 * en fejl der kun rammer ét tidspunkt (fx et årsskifte, hvor måneden og
 * dage-tallet begge stiger) ikke kan slippe igennem.
 *
 * Datoerne er valgt, fordi de dækker hver sin slags spring:
 *   - 29. september: samme måned som den gamle frosne værdi, så en
 *     uændret tekst ville set ud til at virke.
 *   - 1. januar: nyt år, nye måneder, og dage-tallet med fire tal.
 */
const SEPTEMBER = "2026-09-29";
const JANUAR = "2027-01-01";

describe("alderSideTekst", () => {
  test.each(["da", "se", "no"] as const)(
    "%s: hvert tal er præcis det alderLevet og foedselsaarRaekker giver",
    (locale) => {
      for (const iso of [SEPTEMBER, JANUAR]) {
        const t = alderSideTekst(iso, locale);
        const levet = alderLevet(iso);

        expect(t.ALDER).toContain(String(levet.aar));
        expect(t.ALDER).toContain(String(levet.maaneder));
        expect(t.ALDER).toContain(String(levet.dage));
        expect(t.AAR).toBe(new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(levet.aar));
        expect(t.DAGE_TAL).toBe(new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(levet.totalDage));
        expect(t.UGER).toBe(new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(levet.totalUger));
        expect(t.TIMER).toBe(new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(levet.totalTimer));
        expect(t.MINUTTER).toBe(new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(levet.totalMinutter));
        // Månederne i Excel-eksemplet er *alle* måneder siden fødslen, ikke
        // resten af de seneste år. De to er let at blande sammen.
        expect(t.MAANEDER_IALT).toBe(
          new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(
            levet.aar * 12 + levet.maaneder
          )
        );
        // Og timer = dage × 24, aldrig 23 eller 25 på en skiftedag.
        expect(levet.totalTimer).toBe(levet.totalDage * 24);

        const raekke = foedselsaarRaekker(iso).find((r) => r.aar === 2007)!;
        expect(t.DAGE2007).toContain(
          new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(raekke.minDage)
        );
        expect(t.DAGE2007).toContain(
          new Intl.NumberFormat(locale === "se" ? "sv-SE" : "da-DK").format(raekke.maxDage)
        );
      }
    }
  );

  test("to forskellige dage giver to forskellige tal — ellers står der et frosset tal", () => {
    const sept = alderSideTekst(SEPTEMBER, "da");
    const jan = alderSideTekst(JANUAR, "da");

    expect(sept.ALDER).not.toBe(jan.ALDER);
    expect(sept.DAGE_TAL).not.toBe(jan.DAGE_TAL);
    expect(sept.TIMER).not.toBe(jan.TIMER);
    expect(sept.DATO).not.toBe(jan.DATO);
  });

  test("alders-tallet stiger præcis en dag ad gangen mellem de to datoer", () => {
    // 29/9 → 1/1 er 94 dage. Går dage-tallet ned, bruger vi en forkert
    // reference-dato et sted.
    const sept = alderLevet(SEPTEMBER);
    const jan = alderLevet(JANUAR);
    expect(jan.totalDage - sept.totalDage).toBe(94);
    expect(jan.aar).toBe(sept.aar);
  });

  test("datoen skrives i sidens eget sprog, med sidens egne dato-regler", () => {
    expect(alderSideTekst(SEPTEMBER, "da").DATO).toBe("29. september 2026");
    // Svensk dato skriver ikke punktum efter dagen.
    expect(alderSideTekst(SEPTEMBER, "se").DATO).toBe("29 september 2026");
    expect(alderSideTekst(SEPTEMBER, "no").DATO).toBe("29. september 2026");
    expect(alderSideTekst(JANUAR, "da").DATO).toBe("1. januar 2027");
  });

  test("en ugyldig reference-dato kaster, frem for at vise en forkert dato", () => {
    expect(() => alderSideTekst("2026-13-45", "da")).toThrow();
  });
});

describe("erstatAlderTokens", () => {
  test("erstatter hver pladsholder og efterlader ingen", () => {
    const vaerdier = alderSideTekst(SEPTEMBER, "da");
    const tekst = ALDER_TOKENS.map((t) => `{${t}}`).join(" ");
    const udfyldt = erstatAlderTokens(tekst, vaerdier);

    for (const token of ALDER_TOKENS) {
      expect(udfyldt).not.toContain(`{${token}}`);
    }
    for (const vaerdi of Object.values(vaerdier)) {
      expect(udfyldt).toContain(vaerdi);
    }
  });

  test("gør ikke andet ved en tekst uden pladsholdere", () => {
    const vaerdier = alderSideTekst(SEPTEMBER, "da");
    expect(erstatAlderTokens("Skudår? Ja.", vaerdier)).toBe("Skudår? Ja.");
  });
});

describe("alderPaDato", () => {
  test("giver alderen på den dag, og kun den", () => {
    expect(alderPaDato(SEPTEMBER, "da")).toBe("36 år, 6 måneder og 14 dage");
    expect(alderPaDato(SEPTEMBER, "se")).toBe("36 år, 6 månader och 14 dagar");
    expect(alderPaDato(JANUAR, "da")).toBe("36 år, 9 måneder og 17 dage");
  });
});

describe("iDagISidensTidszone", () => {
  // En UTC-server kl. 00:30 dansk tid er stadig i går. Uden tidszonen ville
  // alle /alders tal være en dag gamle netop i det vindue, hvor en læser
  // åbner "hvor gammel er jeg i dag" — og alderen ville stå med gårsdags
  // dato i Googles snippet.
  test("læser dagen i sitets tidszone, ikke i serverens", () => {
    const senNat = new Date("2026-09-29T22:30:00Z"); // 00:30 dansk tid 30/9
    expect(iDagISidensTidszone(senNat, "da")).toBe("2026-09-30");
    expect(iDagISidensTidszone(senNat, "se")).toBe("2026-09-30");
    expect(iDagISidensTidszone(senNat, "no")).toBe("2026-09-30");
  });

  test("går ikke i bag tid, når serveren står foran læseren", () => {
    const tidlig = new Date("2026-09-29T20:00:00Z"); // 22:00 dansk tid 29/9
    expect(iDagISidensTidszone(tidlig, "da")).toBe("2026-09-29");
  });

  test("skriver måned og dag med to cifre", () => {
    expect(iDagISidensTidszone(new Date("2027-01-05T12:00:00Z"), "da")).toBe("2027-01-05");
  });
});
