/**
 * C178 (2026-10-09) målte på live, at indlægget om kaloriebehav viste
 * aktivitetsfaktorerne som hele tal: `da()` i siden runder som standard til 0
 * decimaler, så 1,2 / 1,375 / 1,55 / 1,725 / 1,9 blev til "1 / 1 / 2 / 2 / 2"
 * — altså en kolonne, tabellen er til for. Samme gennemgang fandt to FAQ-svar
 * der skrev "BeregnTallene" (to ord skrevet sammen, synligt for læseren og i
 * JSON-LD'en Google læser).
 *
 * Testen rendrer artiklerne og låser tallene mod modulet og formuleringerne
 * mod den rettede tekst. Punkt 11: en påstand i tekst er kode — faktoren i
 * tabellen skal være den faktor, `beregnTdee` ganger med.
 */
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { formatNumber } from "@/lib/format";
import { AKTIVITETS_FAKTORER, type AktivitetsNiveau } from "@/lib/makroer";
import BoernebidragBlogPage from "./blog/boernebidrag-2026-satser-og-regler/page";
import KaloriebehovBlogPage from "./blog/hvor-mange-kalorier-skal-jeg-have/page";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

const kalorieHtml = renderToStaticMarkup(<KaloriebehovBlogPage />);
const boernebidragHtml = renderToStaticMarkup(<BoernebidragBlogPage />);

/** Faktoren præcis som modulet har den — ingen afrunding. */
const faktor = (niveau: AktivitetsNiveau) =>
  formatNumber(AKTIVITETS_FAKTORER[niveau], "da", { maximumFractionDigits: 3 });

describe("aktivitetsfaktorerne i indlægget om kaloriebehov", () => {
  test("tabellen viser alle fem faktorer med decimaler, ikke afrundet", () => {
    for (const niveau of Object.keys(AKTIVITETS_FAKTORER) as AktivitetsNiveau[]) {
      expect(kalorieHtml, `${niveau}: ${faktor(niveau)}`).toContain(faktor(niveau));
    }
  });

  test("de faktorer der kræver tre decimaler holder dem", () => {
    // Netop de to, som 0-decimal-rundingen ødelagde: 1,375 og 1,725.
    expect(kalorieHtml).toContain(faktor("let"));
    expect(kalorieHtml).toContain(faktor("aktiv"));
  });

  test("eksemplets faktor står i brødteksten, ikke kun i tabellen", () => {
    expect(kalorieHtml).toContain(`aktivitetsfaktoren ${faktor("moderat")}`);
    expect(kalorieHtml).toContain(`${faktor("moderat")} er en gennemsnitsfaktor`);
  });

  test("FAQ'en om gulvtællingerne taler om beregneren", () => {
    expect(kalorieHtml).toContain("Beregneren sætter aldrig et mål under dit stofskifte");
    // "BeregnTallene" stod live i FAQ'en og i JSON-LD'en.
    expect(kalorieHtml).not.toContain("BeregnTallene");
  });
});

describe("børnebidrag-indlæggets FAQ", () => {
  test("svarer på spørgsmålet om tallene er bindende uden sammenlimede ord", () => {
    expect(boernebidragHtml).toContain("Tallene giver dig et solidt udgangspunkt");
    expect(boernebidragHtml).not.toContain("BeregnTallene");
  });
});
