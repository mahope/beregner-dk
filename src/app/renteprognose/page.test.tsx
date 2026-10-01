/**
 * Porten dømmer på de **tal, der står i brødteksten** — ikke på et kodestykke.
 * Eksemplet i `page.tsx` skal altid kunne genberegnes af `beregnRenteprognose`,
 * så en ændring i modulet uden ændring i siden (eller omvendt) får den her til
 * at falde. To mutationer er målt røde: renteudviklingen i eksemplet sat til 0
 * uanset hvad modulet siger, og månedlige ydelse læst som et hardkodet tal.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getPageData } from "@/lib/page-data";
import { beregnRenteprognose } from "@/lib/renteprognose";

vi.mock("@/lib/get-locale", () => ({
  getLocale: async () => "da" as const,
  getCurrentDomainConfig: async () => getDomainConfigByLocale("da"),
}));
vi.mock("@/components/RelatedCalculators", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/RenteprognoseBeregner", () => ({ default: () => <div>Værktøj</div> }));

import RenteprognosePage, { generateMetadata } from "./page";

const FORUDSETNING = {
  laanebeloeb: 2_000_000,
  rente: 0.035,
  loebetidAar: 30,
  renteomlaegning: "aar5" as const,
  afdragsform: "afdrag" as const,
};

const kr = (v: number) => `${Math.round(v).toLocaleString("da-DK")} kr.`;

describe("/renteprognose", () => {
  test("har en description under 160 tegn", async () => {
    const meta = await generateMetadata();
    expect((meta.description ?? "").length).toBeLessThanOrEqual(160);
  });

  test("titlen nævner renteprognose", async () => {
    const meta = await generateMetadata();
    const titel = getPageData("renteprognose", "da")!.metaTitle;
    expect(titel.toLowerCase()).toContain("renteprognose");
    expect(titel.length).toBeLessThanOrEqual(70);
  });

  test("brødteksten viser det samme rentebeløb som modulet regner", async () => {
    const kilde = readFileSync(join(process.cwd(), "src", "app", "renteprognose", "page.tsx"), "utf-8");
    // 5-årig fastrente, 0 procentpoint udvikling: ydelsen i år 1.
    const r = beregnRenteprognose({ ...FORUDSETNING, renteudvikling: 0 });
    expect(kilde).toContain("renteudvikling: 0");
    expect(r.aar[0].maanedYdelse).toBeGreaterThan(0);

    const html = renderToStaticMarkup(await RenteprognosePage());
    expect(html).toContain(kr(r.aar[0].maanedYdelse));
    expect(html).toContain(kr(r.renterIAlt));
  });

  test("de to eksempler er forskellige, så sammenligningen viser noget", () => {
    const flad = beregnRenteprognose({ ...FORUDSETNING, renteudvikling: 0 });
    const stigende = beregnRenteprognose({ ...FORUDSETNING, renteudvikling: 0.01 });
    expect(stigende.renterIAlt).toBeGreaterThan(flad.renterIAlt);
    expect(kr(flad.renterIAlt)).not.toBe(kr(stigende.renterIAlt));
  });

  test("siden siger at renteudviklingen er brugerens valg, ikke en forudsigelse", async () => {
    const tekst = renderToStaticMarkup(await RenteprognosePage());
    expect(tekst).toContain("følsomhedsberegning");
    expect(tekst).toContain("0 procentpoint");
  });

  test("siden har spørgsmål-svar om de tre valg brugeren skal træffe", () => {
    const faq = getPageData("renteprognose", "da")!.faqItems;
    const spgsmaal = faq.map((f) => f.question);
    for (const spg of [
      "Hvad er en renteprognose?",
      "Hvad er forskellen på en variabel og en 5-årig fastrente i prognosen?",
      "Hvad er forskellen på et lån med afdrag og et afdragsfrit lån?",
    ]) {
      expect(spgsmaal).toContain(spg);
    }
    // Svarene må ikke love en forudsigelse — det er hele pointen med siden.
    expect(faq.find((f) => f.question === "Kan man forudse, hvad renterne bliver om 10 år?")?.answer)
      .toMatch(/^Nej\./);
  });
});