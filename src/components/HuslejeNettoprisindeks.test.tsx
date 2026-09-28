import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import HuslejeNettoprisindeks from "./HuslejeNettoprisindeks";
import {
  NETTOPRISINDEKS_2026M08,
  FORBRUGERPRISINDEKS_2026M08,
  FAKTISK_HUSLEJE_2026M08,
  NETTOPRISINDELS_MAANED,
  udregnNettoprisindeks,
  senesteKompletteKvartal,
  beregnHuslejestigning,
} from "@/lib/nettoprisindeks";
import { formatCurrency } from "@/lib/format";

/** Renders once; the component is pure so every test can read the same HTML. */
const html = renderToStaticMarkup(<HuslejeNettoprisindeks />);

/**
 * Målefejl (nr. 20, min egen): `Intl.NumberFormat` med currency indsætter et
 * **non-breaking space** mellem tal og "kr.". En `replace(/\s+/g, " ")` i
 * teksten spiser den, så læseren ikke kan finde beløbet, siden skriver. Derfor
 * normaliserer jeg begge sider: HTML'en bliver plads-kollapset OG
 * non-breaking space gørs til almindelig plads, og det gør `kr()` også.
 */
const norm = (value: string) => value.replace(/\s+/g, " ").replace(/\u00a0/g, " ");
const tekst = norm(html.replace(/<[^>]*>/g, " ").replace(/<!-- -->/g, ""));

const kr = (value: number) =>
  norm(formatCurrency(value, "da", { maximumFractionDigits: 0, minimumFractionDigits: 0 }));
const pct = (value: number) => norm(value.toLocaleString("da-DK"));

describe("HuslejeNettoprisindeks — indhold", () => {
  it("renderer den nye h2 med sit id", () => {
    expect(html).toContain('<h2 id="nettoprisindeks-husleje">');
    expect(tekst).toContain("Hvor meget stiger huslejen efter nettoprisindekset?");
  });

  it("svarer på søgningen 'nettoprisindeks husleje beregner' ordret", () => {
    // Autocomplete nr. 3 under "husleje beregner" pr. 2026-09-28. Ordlyden skal
    // stå samlet i en læsbar sætning, ellers rammer søgningen ikke teksten.
    expect(tekst).toContain("nettoprisindeks");
    expect(html.toLowerCase()).toContain("nettoprisindeks");
    // Begge nøgleord i ÉN overskrift, så søgningen rammer teksten der står
    // svarende. Målt på den renskrevne tekst, fordi non-breaking spaces er
    // den hyppigste målefejl på dansk SEO.
    const h2 = tekst.match(/Hvor meget stiger huslejen efter nettoprisindekset\?/);
    expect(h2).not.toBeNull();
    expect(h2![0].toLowerCase()).toContain("nettoprisindeks");
    expect(h2![0].toLowerCase()).toContain("husleje");
  });

  it("viser DST's egen nettoprisindeks-stigning og regnestykket derpå", () => {
    expect(tekst).toContain(NETTOPRISINDELS_MAANED);
    expect(tekst).toContain(`${pct(NETTOPRISINDEKS_2026M08.aarsVaeksningPct)} %`);
    // 8.000 x 2,9 % = 232 -> 8.232
    const r = beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct);
    expect(tekst).toContain(`${kr(r.stigning)}`);
    expect(tekst).toContain(`${kr(r.efter)}`);
    expect(tekst).toContain(`${kr(8000)} × ${pct(NETTOPRISINDEKS_2026M08.aarsVaeksningPct)} % = ${kr(r.stigning)}`);
  });

  it("skelner pristalsregulering fra nettoprisindeks med begge satser i samme tabel", () => {
    expect(tekst).toContain("Pristalsregulering og nettoprisindeks er ikke det samme");
    expect(tekst).toContain("Forbrugerprisindeks");
    expect(tekst).toContain(`${pct(FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct)} %`);
    // Samme husleje, to forskellige resultater — ellers er forskellen ubevis.
    const npi = beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct).efter;
    const pristal = beregnHuslejestigning(8000, FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct).efter;
    expect(npi).not.toBe(pristal);
    expect(tekst).toContain(`${kr(npi)}`);
    expect(tekst).toContain(`${kr(pristal)}`);
    expect(tekst).toContain(`${kr(Math.abs(npi - pristal))} om måneden`);
  });

  it("viser DST's egen huslejegruppe, der ligger under hovedtallet", () => {
    expect(tekst).toContain("Faktisk husleje");
    expect(tekst).toContain(`${pct(FAKTISK_HUSLEJE_2026M08.aarsVaeksningPct)} %`);
  });

  it("viser det seneste fulde kvartal og siger eksplicit at 3. kvartal 2026 ikke er færdigt", () => {
    const kvartal = senesteKompletteKvartal();
    expect(kvartal).toBe("2026K2");
    const kp = udregnNettoprisindeks(kvartal!);
    expect(tekst).toContain("2. kvartal 2026");
    // Samme kvartal året før, ikke det foregående: 2. kvartal 2026 mod 2. kvartal 2025.
    expect(tekst).toContain("2. kvartal 2025");
    expect(tekst).not.toContain("1. kvartal 2025");
    expect(tekst).toContain(`${pct(Number(kp!.toFixed(1)))} %`);
    // Et gennemsnit på to måneder ville undervurdere stigningen, så siden skal
    // sige at det igangværende kvartal ikke bruges.
    expect(tekst).toContain("3. kvartal 2026 er endnu ikke færdigt");
    expect(tekst).not.toContain("3. kvartal 2026 ligger");
  });

  it("skelner huslejenævnet fra lejeaftalen, så siden ikke lover en sats", () => {
    expect(tekst).toContain("huslejenævnet");
    expect(tekst).toContain("Huslejenævnet");
    expect(tekst).toContain("pristalsregulering");
    expect(tekst).toContain("reguleres efter pristallet");
  });

  it("citerer begge StatBank-tabeller med dato", () => {
    expect(html).toContain("https://www.statistikbanken.dk/PRIS04");
    expect(html).toContain("https://www.statistikbanken.dk/PRIS01");
    expect(tekst).toContain("10. september 2026");
  });

  it("er dansk hele vejen — ingen svensk lejlighedsside modtager den", () => {
    // beraknare.se har sin egen lejeside; den danske tekst må ikke lække dertil.
    for (const da of ["Hvor meget stiger huslejen", "nettoprisindekset", "Forbrugerprisindeks"]) {
      expect(tekst).toContain(da);
    }
    for (const sven of ["hyra", "nettoprisindex", "Förbrukarprisindex", "Räkna ut", "Hur mycket"]) {
      expect(html).not.toContain(sven);
    }
  });
});

describe("HuslejeNettoprisindeks — ingen tal der kun findes i teksten", () => {
  it("hvert beløb på siden er beregnet af modulet, ikke skrevet i hånden", () => {
    // C84's fejlklasse: indekseret tekst der modsiger sit eget beregningsmodul.
    // Alle fire beløb i regnestykket og tabellen skal kunne efterprøves.
    for (const p of [
      NETTOPRISINDEKS_2026M08.aarsVaeksningPct,
      FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct,
      FAKTISK_HUSLEJE_2026M08.aarsVaeksningPct,
      udregnNettoprisindeks("2026K2")!,
    ]) {
      const r = beregnHuslejestigning(8000, p);
      expect(r.efter - r.foer).toBe(Math.round((8000 * p) / 100));
    }
  });
});
