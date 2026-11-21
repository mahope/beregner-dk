/**
 * `/elberegner` har hardkodede danske apparatnavne i `STANDARD_APPARATER` —
 * fundet i C65 som den ENeste bekræftede locale-leak i de 55 komponenter, der
 * monteres på beraknare.se. Listen lå uden for `labels`-objektet, så dropdown'en
 * skrev "Køleskab (40W)", "Støvsuger (1400W)" og "Glødepære (60W)" på et svensk
 * og et norsk domæne.
 *
 * Målingen i C65 viste, at resten af klassen næsten udelukkende er *døde*
 * strenge: `TidszoneBeregner`, `VaegttabBeregner`, `EnhederBeregner` og
 * `SolcelleBeregner` har danske data, men displayen går gennem
 * `l.navn`/`l.by`/`l.activity`, som er oversat; `AffiliateBox` og
 * `BoligOpslag` er gået til `null` på ikke-da. Derfor låser denne test de tre
 * steder, hvor listen faktisk bliver vist: `<option>`-teksten, den valgte
 * enheds navn efter et valg, og at ingen dansk streng overlever i `se`/`no`.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import Elberegner from "./Elberegner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

// Se C63/C64: jsdom mangler `document.execCommand`, som `CopyResultButton`s
// fallback bruger. Uden stubben giver den to uhandlede rejections, og filen
// exited 1 selv om alle tests var grønne.
Object.defineProperty(document, "execCommand", {
  value: () => true,
  configurable: true,
  writable: true,
});

const domainConfig = getDomainConfig("localhost");

function renderIn(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <Elberegner />
    </LocaleProvider>,
  );
}

/** Alle `<option>`-tekster i apparatets standardvælger. */
function standardValger(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("select option")).map((o) =>
    (o.textContent ?? "").trim(),
  );
}

afterEach(cleanup);

const DANSKE_APPARATNAVN = [
  "Køleskab",
  "Vaskemaskine (per vask)",
  "Opvaskemaskine",
  "Elkedel",
  "Støvsuger",
  "Hårtørrer",
  "Tørretumbler",
  "Glødepære",
  "Mikroovn",
];

// "Støvsuger" og "Ovn" er dansk **og** norsk, så de er ikke danske lækager på
// beregner.no. De må derfor ikke stå i norsk-negativlisten — ellers låser
// testen en fejl ind, fordi den egentlige fejl (Kjøleskap, Hårtørker,
// Glødelampe) så mangler.
const DANSKE_IKKE_NO: string[] = DANSKE_APPARATNAVN.filter(
  (n) => n !== "Støvsuger" && n !== "Ovn",
);

describe("Elberegner — apparatnavne pr. domæne", () => {
  test("da-domænet beholder de danske navne", () => {
    const { container } = renderIn("da");
    const valger = standardValger(container);
    for (const navn of DANSKE_APPARATNAVN) {
      expect(valger.some((v) => v.startsWith(navn))).toBe(true);
    }
  });

  test("se-domænet viser svenske navne i dropdown'en", () => {
    const { container } = renderIn("se");
    const valger = standardValger(container);
    expect(valger.some((v) => v.startsWith("Kylskåp"))).toBe(true);
    expect(valger.some((v) => v.startsWith("Dammsugare"))).toBe(true);
    expect(valger.some((v) => v.startsWith("Torktumlare"))).toBe(true);
    expect(valger.some((v) => v.startsWith("Diskmaskin"))).toBe(true);
  });

  test("no-domænet viser norske navne i dropdown'en", () => {
    const { container } = renderIn("no");
    const valger = standardValger(container);
    expect(valger.some((v) => v.startsWith("Kjøleskap"))).toBe(true);
    expect(valger.some((v) => v.startsWith("Oppvaskmaskin"))).toBe(true);
    expect(valger.some((v) => v.startsWith("Hårtørker"))).toBe(true);
  });

  test("ingen dansk streng overlever i se", () => {
    const { container } = renderIn("se");
    const alt = standardValger(container).join(" ");
    for (const navn of DANSKE_APPARATNAVN) {
      expect(alt).not.toContain(navn);
    }
  });

  test("kun de fælles dansk-norske ord står på no", () => {
    const { container } = renderIn("no");
    const alt = standardValger(container).join(" ");
    for (const navn of DANSKE_IKKE_NO) {
      expect(alt).not.toContain(navn);
    }
    // De to ord, der er ens på begge sprog, skal stadig være der — ellers
    // ville listen bare være tømt i stedet for oversat.
    expect(alt).toContain("Støvsuger");
    expect(alt).toContain("Ovn");
  });

  test.each(["se", "no"] as const)(
    "valg af en standardenhed sætter det oversatte navn i feltet (%s)",
    (locale) => {
      const { container } = renderIn(locale);
      // Vælgeren findes på den egenskab, der adskiller den fra navnefeltet:
      // den har en `option` pr. standardapparat.
      const valg = Array.from(container.querySelectorAll("select")).find((s) =>
        Array.from(s.options).some((o) => o.value === "koeleskab"),
      ) as HTMLSelectElement;
      expect(valg).toBeDefined();
      fireEvent.change(valg, { target: { value: "koeleskab" } });
      const navnefelt = container.querySelector(
        'input[type="text"]',
      ) as HTMLInputElement;
      expect(navnefelt).toBeTruthy();
      const forventet = locale === "se" ? "Kylskåp" : "Kjøleskap";
      expect(navnefelt.value).toBe(forventet);
    },
  );
});
