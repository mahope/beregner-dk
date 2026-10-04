import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import BraendstofBeregner from "./BraendstofBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { braendstofEksempelRækker, heleKroner, prisPrKm } from "@/lib/braendstof";
import { formatCurrency } from "@/lib/format";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

/** Intl sætter et kernende mellemrum i beløb — samme normalisering som LaanebeloebTabel.test.tsx. */
function rene(tekst: string): string {
  return tekst.replace(/ /g, " ");
}

function renderBraendstof(locale: "da" | "se") {
  const domainConfig = locale === "se" ? getDomainConfig("beraknare.se") : getDomainConfig("localhost");
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <BraendstofBeregner />
    </LocaleProvider>,
  );
}

/**
 * Sammenligningstabellen, fundet på sin egen caption — den har ingen overskrift
 * inde i sig. Captionen sammenlignes efter `rene`, fordi `Intl` skriver den
 * svenske tusindtalsseparator som U+00A0, mens den danske er et punktum.
 */
function sammenligning(locale: "da" | "se"): HTMLElement {
  const forventet =
    locale === "se"
      ? "Pris för bensin, diesel och el för sträckor från 50 till 2 000 km"
      : "Pris på benzin, diesel og el for afstande fra 50 til 2.000 km";
  const tbl = screen
    .getAllByRole("table")
    .find((t) => rene(t.querySelector("caption")?.textContent ?? "") === forventet);
  if (!tbl) throw new Error(`ingen tabel med captionen «${forventet}»`);
  return tbl;
}

/** Rækken for én afstand, fundet på afstanden i første celle. */
function raekke(tbl: HTMLElement, km: string): HTMLElement {
  const celle = within(tbl)
    .getAllByRole("rowheader")
    .find((th) => rene(th.textContent ?? "") === km);
  if (!celle) throw new Error(`ingen række for ${km}`);
  const raekke = celle.closest("tr");
  if (!raekke) throw new Error("rækken mangler i DOM");
  return raekke as HTMLElement;
}

function celler(tbl: HTMLElement, km: string): string[] {
  return within(raekke(tbl, km))
    .getAllByRole("cell")
    .map((c) => rene(c.textContent ?? ""));
}

/** "1.234,50 kr." -> 1234,5. Samme separator som `rene`, kun med decimaltegn. */
function tal(tekst: string): number {
  const renset = rene(tekst).replace(/kr\.?$/, "").trim();
  const da = renset.includes(",");
  const normaliseret = da ? renset.replace(/\./g, "").replace(",", ".") : renset.replace(/ /g, "");
  return Number(normaliseret);
}

afterEach(cleanup);

describe("Brændstof — sammenligningstabel for afstand", () => {
  test("dækker 50 til 2.000 km i begge sprog", () => {
    for (const locale of ["da", "se"] as const) {
      renderBraendstof(locale);
      const tbl = sammenligning(locale);
      const afstande = within(tbl)
        .getAllByRole("rowheader")
        .map((th) => rene(th.textContent ?? ""));
      // 2.000 km er ikke en tilfældig sidste række: sidens egen årstal er
      // 15.000 km, så både en ferietur og et års kørsel skal kunne slås op.
      expect(afstande).toEqual(
        locale === "da"
          ? ["50 km", "100 km", "200 km", "500 km", "1.000 km", "1.500 km", "2.000 km"]
          : ["50 km", "100 km", "200 km", "500 km", "1 000 km", "1 500 km", "2 000 km"],
      );
      cleanup();
    }
  });

  test("hver celle er prisPrKm × afstand i hele kroner, så tabellen og værktøjet ikke kan sige hver sit", () => {
    for (const locale of ["da", "se"] as const) {
      renderBraendstof(locale);
      const tbl = sammenligning(locale);
      // Hele kroner, ikke to decimaler: ellers viser 500 km diesel 355,56 i
      // denne tabel og 356,00 i «Sådan regner du» lige ovenfor.
      const forventet = (km: number, type: "benzin" | "diesel" | "el") =>
        rene(formatCurrency(heleKroner(prisPrKm(type, locale) * km), locale));

      expect(celler(tbl, locale === "da" ? "2.000 km" : "2 000 km")).toEqual([
        forventet(2000, "benzin"),
        forventet(2000, "diesel"),
        forventet(2000, "el"),
      ]);
      expect(celler(tbl, "50 km")).toEqual([
        forventet(50, "benzin"),
        forventet(50, "diesel"),
        forventet(50, "el"),
      ]);
      cleanup();
    }
  });

  test("500 km rækken er «Sådan regner du»-tabellen, som de to tabeller skal kunne læses mod", () => {
    // Punkt 11: de to tabeller må ikke sige hver sit. De er ikke altid præcis
    // ens, fordi eksempeltabellen med vilje runder liter til én decimal *før*
    // prisen ganges (33,3 liter × 17,57 kr.) — så dens pris kan ligge 1 kr.
    // under prisPrKm × 500. 500 km er BRAENDSTOF_EKSEMPEL_KM, altså netop den
    // afstand eksempeltabellen regner.
    for (const locale of ["da", "se"] as const) {
      renderBraendstof(locale);
      const tbl = sammenligning(locale);
      const eksempel = braendstofEksempelRækker(500, locale).map((r) => r.pris);
      const celle = celler(tbl, "500 km").map(tal);
      for (const [i, type] of ["benzin", "diesel", "el"].entries()) {
        expect(
          Math.abs(celle[i] - eksempel[i]),
          `${locale} ${type}: tabel ${celle[i]} mod eksempel ${eksempel[i]}`,
        ).toBeLessThanOrEqual(1);
      }
      cleanup();
    }
  });

  test("da 500 km benzin er de 450 kr. titlen og beskrivelsen lover", () => {
    // Kæden titel → værktøjet → sammenligningstabel skal kunne læses som én
    // regning. 500 / 15 km/l × 13,5 kr. = 450 kr., og det er præcis det tal
    // metadataen bruger.
    renderBraendstof("da");
    const tbl = sammenligning("da");
    expect(tal(celler(tbl, "500 km")[0])).toBe(450);
    expect(braendstofEksempelRækker(500, "da")[0].pris).toBe(450);
  });

  test("hver th har scope, så en skærmlæser ved hvilken celle der er tale om", () => {
    for (const locale of ["da", "se"] as const) {
      renderBraendstof(locale);
      const tbl = sammenligning(locale);
      const th = tbl.querySelectorAll("th");
      // 4 kolonneoverskrifter + 7 afstands-celler.
      expect(th).toHaveLength(11);
      for (const celle of Array.from(th)) {
        expect(celle.getAttribute("scope")).toMatch(/^(col|row)$/);
      }
      cleanup();
    }
  });

  test("caption er kun for skærmlæsere og dømmer afstandsrækken", () => {
    for (const locale of ["da", "se"] as const) {
      renderBraendstof(locale);
      const caption = sammenligning(locale).querySelector("caption");
      expect(caption).not.toBeNull();
      expect(caption?.className).toContain("sr-only");
      expect(rene(caption?.textContent ?? "")).toMatch(/2[ .]?000 km$/);
      cleanup();
    }
  });
});