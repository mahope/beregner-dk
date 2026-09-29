/**
 * The Excel rows for the Swedish section on /renteberegner.
 *
 * Same rule as `rente-eksempler`: **no number is written into the file.**
 * Every cost is computed by `annuitetsEksempel()` — the very function
 * `RenteBeregner` uses — so a figure in the table cannot drift from the tool.
 * That rule is the one C84's `metaDescription` finding and C94's
 * `literPr100km()` coupling established.
 *
 * The formulas are written for Swedish Excel: the argument separator is a
 * **semicolon** and the decimal sign is a comma. The function is BETALNING in
 * Swedish Excel (PMT in the English one); Microsoft's own Swedish function
 * list is the source for the name. The loan amount goes in as a negative
 * number so the payment comes out positive, exactly as on the Danish side.
 */

import { annuitetsEksempel } from "./rente-eksempler";

export interface ExcelRaekke {
  /** What the row answers, as written in the table's first column. */
  spoergsmaal: string;
  /** The formula, exactly as it is typed into Excel. */
  formel: string;
  /** The answer, formatted with the Swedish thousands separator. */
  svar: string;
}

/** A whole amount in Swedish format: 200 000. */
function krHelt(tal: number): string {
  return tal.toLocaleString("sv-SE", { maximumFractionDigits: 0 });
}

/** An amount with two decimals in Swedish format: 1 211,96. */
function kr(tal: number): string {
  return tal.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * The three questions the table answers — the same three the Danish table
 * asks, so the two languages answer the same thing. Only the formulas are
 * translated, into Swedish Excel.
 */
export function excelRaekkerSe(): ExcelRaekke[] {
  const e = annuitetsEksempel();
  const n = Math.round(e.antalMaaneder);
  const r = `${e.aarsrente}/12`;
  const belob = e.hovedstol;

  return [
    {
      spoergsmaal: `Vad blir månadsbetalningen på ${krHelt(belob)} kr över ${n} månader?`,
      formel: `=BETALNING(${r};${n};${-belob})`,
      svar: `${kr(e.maanedligBetalning)} kr`,
    },
    {
      spoergsmaal: "Vad blir den sammanlagda räntan på hela lånet?",
      formel: `=BETALNING(${r};${n};${-belob})*${n}-${belob}`,
      svar: `${kr(e.samletRante)} kr`,
    },
    {
      spoergsmaal: "Hur mycket ränta kostar lånet det första året?",
      formel: `=${belob}*${e.aarsrente}/100`,
      svar: `${krHelt((belob * e.aarsrente) / 100)} kr`,
    },
  ];
}

/**
 * The three traps in Swedish Excel, kept as data so the page and the test read
 * the same words. Without them the formulas do not work: a comma between the
 * arguments is a syntax error, and a positive loan amount gives a negative
 * payment.
 */
export const EXCEL_FAELLOR_SE: string[] = [
  "Argumenten skiljs åt med semikolon i svensk Excel. Med komma får du ett syntaxfel.",
  "Lånebelöpet skrivs som ett negativt tal, annars blir månadsbetalningen negativ.",
  "Använd det svenska decimaltecknet (komma) i räntan: 0,04/12, inte 0.04/12.",
];
