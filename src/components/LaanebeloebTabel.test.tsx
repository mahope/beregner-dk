import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import RenteBeregner from "./RenteBeregner";
import LaanebeloebTabel from "./LaanebeloebTabel";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

/** Intl sætter et kernende mellemrum i beløb — samme normalisering som RenteBeregner.test.tsx. */
function rene(tekst: string): string {
  return tekst.replace(/\u00a0/g, " ");
}

function renderRente(locale: "da" | "se") {
  const domainConfig = locale === "se" ? getDomainConfig("beraknare.se") : getDomainConfig("localhost");
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <RenteBeregner />
    </LocaleProvider>,
  );
}

/** Tabellen er den eneste med overskriften «Hvor meget koster det at låne?» / «Vad kostar det att låna?». */
function tabel(locale: "da" | "se"): HTMLElement {
  const overskrift =
    screen.getByRole("heading", {
      name: locale === "se" ? "Vad kostar det att låna?" : "Hvor meget koster det at låne?",
    });
  const tabel = overskrift.parentElement?.querySelector("table");
  if (!tabel) throw new Error("tabellen mangler i DOM");
  return tabel as HTMLElement;
}

/** Rækken for ét beløb, fundet på beløbet i første celle. */
function raekke(tbl: HTMLElement, belobTekst: string): HTMLElement {
  // Ikke på `name:` i `getByRole` — Intl sætter et kernende mellemrum (U+00A0)
  // før «kr.», og så matcher den navneformatering kun det ene af de to tegn.
  const celle = within(tbl)
    .getAllByRole("rowheader")
    .find((th) => rene(th.textContent ?? "") === belobTekst);
  if (!celle) throw new Error(`ingen række for ${belobTekst}`);
  const raekke = celle.closest("tr");
  if (!raekke) throw new Error("rækken mangler i DOM");
  return raekke as HTMLElement;
}

function celler(tbl: HTMLElement, belobTekst: string): string[] {
  return within(raekke(tbl, belobTekst))
    .getAllByRole("cell")
    .map((c) => rene(c.textContent ?? ""));
}

afterEach(cleanup);

describe("LaanebeloebTabel", () => {
  test("viser de otte beløb, autocomplete spørger om", () => {
    renderRente("da");
    const tbl = tabel("da");
    const belob = within(tbl)
      .getAllByRole("rowheader")
      .map((th) => rene(th.textContent ?? ""));
    // Målt 4/10 under «hvor meget koster det at låne»: 100.000, 500.000,
    // 1 million, 2 millioner, 3 millioner, 5 millioner.
    expect(belob).toEqual([
      "100.000 kr.",
      "250.000 kr.",
      "500.000 kr.",
      "1.000.000 kr.",
      "1.500.000 kr.",
      "2.000.000 kr.",
      "3.000.000 kr.",
      "5.000.000 kr.",
    ]);
  });

  test("1 mio. kr. til 5 % i 30 år står som 5.368 kr. pr. måned", () => {
    renderRente("da");
    // Standardværdierne i værktøjet er netop 1.000.000 / 5 / 30.
    const [ydelse, rente, iAlt, andel] = celler(tabel("da"), "1.000.000 kr.");
    expect(ydelse).toBe("5.368 kr.");
    expect(rente).toBe("932.558 kr.");
    expect(iAlt).toBe("1.932.558 kr.");
    expect(andel).toBe("48 %");
  });

  test("ydelsen i tabellen er den samme som ydelsen i værktøjet", () => {
    // Ellers står der to tal for det samme lån på én side, og læseren ved ikke
    // hvilken af dem der hører til det han har tastet ind. Værktøjets
    // standardværder er netop 1.000.000 kr., så rækken og kortet skal sige
    // præcis det samme.
    renderRente("da");
    const [ydelse] = celler(tabel("da"), "1.000.000 kr.");
    const kort = screen.getAllByText("Månedlig ydelse")[0].parentElement;
    expect(rene(kort?.textContent ?? "")).toContain(ydelse);
  });

  test("tabellen følger en ændret rente", () => {
    renderRente("da");
    const foer = celler(tabel("da"), "1.000.000 kr.");
    fireEvent.change(screen.getByLabelText(/Årlig rente/), {
      target: { value: "9" },
    });
    const efter = celler(tabel("da"), "1.000.000 kr.");
    expect(efter[0]).not.toBe(foer[0]);
    // 1 mio. til 9 % i 30 år er 8.046 kr. pr. måned.
    expect(efter[0]).toBe("8.046 kr.");
  });

  test("tabellen følger en ændret løbetid", () => {
    renderRente("da");
    const foer = celler(tabel("da"), "500.000 kr.");
    fireEvent.change(screen.getByLabelText(/Løbetid/), { target: { value: "10" } });
    const efter = celler(tabel("da"), "500.000 kr.");
    expect(efter[1]).not.toBe(foer[1]);
    // 500.000 til 5 % i 10 år er 5.303 kr. pr. måned, som er 636.393 kr. i alt,
    // så renterne er 136.393 kr. Mod regnet med python, ikke med formlen.
    expect(efter[0]).toBe("5.303 kr.");
    expect(efter[1]).toBe("136.393 kr.");
  });

  test("serielån får en lavere rente end annuitetslån på samme lån", () => {
    renderRente("da");
    const annuitet = celler(tabel("da"), "1.000.000 kr.")[1];
    fireEvent.click(screen.getByRole("button", { name: "Serielån" }));
    const serielaan = celler(tabel("da"), "1.000.000 kr.");
    expect(serielaan[1]).toBe("752.083 kr.");
    expect(serielaan[1]).not.toBe(annuitet);
  });

  test("serielån forklarer, at ydelsen er den første måneds", () => {
    renderRente("da");
    expect(
      screen.queryByText(/Månedsydelsen er ved et serielån/),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Serielån" }));
    expect(
      screen.getByText(/Månedsydelsen er ved et serielån den første måneds/),
    ).toBeTruthy();
  });

  test("et negativt beløb i løbetiden viser en vejledning frem for otte nuller", () => {
    // `min="1"` på feltet er en UI-hint, ikke en tvang: tallet kan skrives som
    // -5. Uden egenskabens tjek ville hver række stå med 0 i alle felter,
    // fordi `antalMaaneder(-5)` er -60 og en ydelse på 0 måneder er 0.
    renderRente("da");
    fireEvent.change(screen.getByLabelText(/Løbetid/), { target: { value: "-5" } });
    expect(screen.getByText(/Indtast en rente og en løbetid/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });

  test("en løbetid på 0 skjuler hele resultatet, som værktøjet gør", () => {
    renderRente("da");
    fireEvent.change(screen.getByLabelText(/Løbetid/), { target: { value: "0" } });
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("heading", { name: /Hvor meget koster/ })).toBeNull();
  });

  test("den svenske udgave har sin egen tekst og samme tal", () => {
    renderRente("se");
    const tbl = tabel("se");
    expect(within(tbl).getByRole("columnheader", { name: "Lånebelopp" })).toBeTruthy();
    expect(within(tbl).getByRole("columnheader", { name: "Månatlig betalning" })).toBeTruthy();
    const [ydelse, rente] = celler(tbl, "1 000 000 kr");
    expect(ydelse).toBe("5 368 kr");
    expect(rente).toBe("932 558 kr");
  });

  test("renteandelen skrives med mellemrum for procenttegnet", () => {
    // F5c/F5g: «48 %», ikke «48%».
    renderRente("da");
    const [,, , andel] = celler(tabel("da"), "1.000.000 kr.");
    expect(andel).toBe("48 %");
    expect(andel).not.toContain("48%");
  });

  test("ved 0 % rente er renteandelen 0, ikke NaN", () => {
    // Renderes tabellen frit, fordi `RenteBeregner` skjuler **alle** resultater
    // når feltet står på 0 (`!rente` giver `null`). Det er værktøjets
    // adfærd og ikke noget tabellen styrer, så prøven her skal finde en
    // fejltype — 1,2e-14 som renteandel — som kun kan ses ved 0 %.
    render(
      <LocaleProvider locale="da" domainConfig={getDomainConfig("localhost")}>
        <LaanebeloebTabel aarligRente={0} loebetid={10} type="annuitet" />
      </LocaleProvider>,
    );
    const [ydelse, rente, iAlt, andel] = celler(tabel("da"), "500.000 kr.");
    expect(ydelse).toBe("4.167 kr.");
    expect(rente).toBe("0 kr.");
    expect(iAlt).toBe("500.000 kr.");
    expect(andel).toBe("0 %");
  });

  test("ved 0 % rente er serielånets renteandel også 0", () => {
    render(
      <LocaleProvider locale="da" domainConfig={getDomainConfig("localhost")}>
        <LaanebeloebTabel aarligRente={0} loebetid={10} type="serielaan" />
      </LocaleProvider>,
    );
    expect(celler(tabel("da"), "500.000 kr.")[3]).toBe("0 %");
  });

  test("en løbetid på 0 viser en vejledning frem for otte nuller", () => {
    render(
      <LocaleProvider locale="da" domainConfig={getDomainConfig("localhost")}>
        <LaanebeloebTabel aarligRente={5} loebetid={0} type="annuitet" />
      </LocaleProvider>,
    );
    expect(screen.getByText(/Indtast en rente og en løbetid/)).toBeTruthy();
    expect(screen.queryByRole("table")).toBeNull();
  });
});