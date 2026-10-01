import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HuslejeNettoprisindeks from "./HuslejeNettoprisindeks";
import {
  NETTOPRISINDEKS_2026M08,
  FORBRUGERPRISINDEKS_2026M08,
  NETTOPRISINDELS_MAANED,
  senesteKompletteKvartal,
  udregnNettoprisindeks,
  beregnHuslejestigning,
} from "@/lib/nettoprisindeks";

/**
 * Pristalsreguleringen på /husleje som et værktøj.
 *
 * Før dette var hele blokken statisk tekst med 8.000 kr håndskrevet ind i
 * regnestykket, i tabellens sidste kolonne og i kvartalsafsnittet. Læseren
 * skulle så selv regne sin egen husleje igennem tre afgange. Porten dømmer på
 * det modsatte: **hvert beløb i blokken skal følge det felt, læseren har
 * indtastet** — også de steder, der ikke ligner et resultat.
 *
 * Samme målefejl som `HuslejeNettoprisindeks.test.tsx`: `Intl.NumberFormat`
 * med currency skriver non-breaking space mellem tal og "kr.", så begge sider
 * normaliseres før de sammenlignes.
 */

const MAANED = NETTOPRISINDELS_MAANED;
const NPI_PCT = NETTOPRISINDEKS_2026M08.aarsVaeksningPct;
const CPI_PCT = FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct;

const norm = (value: string) => value.replace(/\s+/g, " ").replace(/ /g, " ");
const kr = (value: number) =>
  norm(
    new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(value),
  );
const pct = (value: number) => norm(value.toLocaleString("da-DK"));

/** The visible text of the rendered block, whitespace- and nbsp-normalised. */
function laesTekst(): string {
  return norm(document.body.textContent ?? "");
}

/** Types into the rent field the way a reader would. */
function skrivHusleje(værdi: string) {
  const felt = screen.getByLabelText("Din husleje pr. måned");
  fireEvent.change(felt, { target: { value: værdi } });
}

describe("Pristalsregulering på /husleje", () => {
  it("har et huslejefelt med label, så det kan bruges uden at gætte", () => {
    render(<HuslejeNettoprisindeks />);
    const felt = screen.getByLabelText("Din husleje pr. måned") as HTMLInputElement;
    // Label før input, ikke en pladsholder: skærmlæseren skal kunne læse
    // feltet, og etiketten skal være det synlige navn.
    expect(felt.tagName).toBe("INPUT");
    expect(felt.getAttribute("placeholder")).toBe("Fx 8.000");
    // Tastatur på mobil: numerisk tastatur, og feltet må ikke være readonly.
    expect(felt.getAttribute("inputmode")).toBe("numeric");
    expect(felt.readOnly).toBe(false);
  });

  it("regner svaret på læserens husleje, ikke på eksemplet", () => {
    render(<HuslejeNettoprisindeks />);
    // Starttilstanden er 8.000 kr, så serverens HTML er uændret og
    // eksisterende porte stadig passerer.
    expect(laesTekst()).toContain(
      `Din husleje stiger ${kr(232)} til ${kr(8232)} pr. måned ved ${pct(NPI_PCT)} % i ${MAANED}.`,
    );

    skrivHusleje("12000");
    const r = beregnHuslejestigning(12000, NPI_PCT);
    expect(r.stigning).toBe(348);
    const tekst = laesTekst();
    expect(tekst).toContain(
      `Din husleje stiger ${kr(r.stigning)} til ${kr(r.efter)} pr. måned ved ${pct(NPI_PCT)} % i ${MAANED}.`,
    );
    // Eksemplet må ikke stå tilbage som svaret på læserens eget spørgsmål.
    expect(tekst).not.toContain(`Din husleje stiger ${kr(232)} til ${kr(8232)}`);
  });

  it("følger feltet i regnestykket, der ligner mest en fast illustration", () => {
    render(<HuslejeNettoprisindeks />);
    skrivHusleje("9500");
    const r = beregnHuslejestigning(9500, NPI_PCT);
    // "9.500 × 2,9 % = 276 → 9.500 + 276 = 9.776"
    expect(laesTekst()).toContain(
      `${kr(9500)} × ${pct(NPI_PCT)} % = ${kr(r.stigning)} → ${kr(9500)} + ${kr(r.stigning)} = ${kr(r.efter)}`,
    );
  });

  it("følger feltet i tabellens sidste kolonne for alle tre indekser", () => {
    render(<HuslejeNettoprisindeks />);
    skrivHusleje("12000");
    const tekst = laesTekst();
    // De to indekser i tabellen står med den nye husleje som total.
    for (const p of [NPI_PCT, CPI_PCT]) {
      expect(tekst).toContain(kr(beregnHuslejestigning(12000, p).efter));
    }
    // Kvartalsafsnittet skriver stigningen, ikke totalen — også den følger feltet.
    const kvartal = udregnNettoprisindeks(senesteKompletteKvartal()!)!;
    expect(tekst).toContain(
      `På ${kr(12000)} bliver det ${kr(beregnHuslejestigning(12000, kvartal).stigning)} mere om måneden.`,
    );
    // Og den eksplicitte forskel mellem de to indekser på læserens husleje.
    const npi = beregnHuslejestigning(12000, NPI_PCT).efter;
    const cpi = beregnHuslejestigning(12000, CPI_PCT).efter;
    expect(tekst).toContain(`${kr(Math.abs(npi - cpi))} om måneden på en husleje på ${kr(12000)}`);
  });

  it("accepterer dansk skrivemåde med tusindtalspunktum", () => {
    render(<HuslejeNettoprisindeks />);
    // "12.500" er dansk for 12500 — ellers får læseren 12 kr i husleje.
    skrivHusleje("12.500");
    const r = beregnHuslejestigning(12500, NPI_PCT);
    expect(laesTekst()).toContain(`Din husleje stiger ${kr(r.stigning)} til ${kr(r.efter)}`);
  });

  it("beholder eksemplet og beder om et tal, når feltet er tomt eller ugyldigt", () => {
    render(<HuslejeNettoprisindeks />);
    for (const ugyldig of ["", "abc", "0", "-500"]) {
      skrivHusleje(ugyldig);
      const tekst = laesTekst();
      // Aldrig et tal bygget på NaN eller 0, og aldrig en tom side.
      expect(tekst).toContain("Skriv din husleje ovenfor");
      expect(tekst).not.toContain("NaN");
      expect(tekst).not.toContain("undefined");
      // Blokkens egen substans overlever et ugyldigt felt.
      expect(tekst).toContain(MAANED);
      expect(tekst).toContain("Lejeloven § 5");
      expect(tekst).toContain(`${kr(232)}`); // eksemplet fra teksten
    }
  });
});
