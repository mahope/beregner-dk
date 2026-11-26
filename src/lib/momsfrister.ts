// Danish VAT periods and payment deadlines, plus an .ics export of them.
//
// Rules (skat.dk, "Frister for moms"):
// - Period from annual taxable turnover: over 50 mio. kr. = month, 5-50 mio. kr. = quarter,
//   under 5 mio. kr. = half year. New companies start on half year.
// - Month: the 25th of the following month, but 17 August for June.
// - Quarter: Q1 -> 1 June, Q2 -> 1 September, Q3 -> 1 December, Q4 -> 1 March.
// - Half year: H1 -> 1 September, H2 -> 1 March.
// - A deadline on a weekend or bank holiday moves to the next bank day.

import { erArbejdsdag, erHelligdag } from "@/lib/helligdage";

export type Momsperiode = "maaned" | "kvartal" | "halvaar";

export const MOMS_GRAENSE_KVARTAL = 5_000_000;
export const MOMS_GRAENSE_MAANED = 50_000_000;

export const MOMSPERIODE_NAVN: Record<Momsperiode, string> = {
  maaned: "Månedlig",
  kvartal: "Kvartalsvis",
  halvaar: "Halvårlig",
};

/** The VAT period for an annual turnover in DKK. Unknown turnover gives half year (the start rule). */
export function momsperiodeForOmsaetning(omsaetning: number | null | undefined): Momsperiode {
  if (omsaetning == null || !Number.isFinite(omsaetning)) return "halvaar";
  if (omsaetning > MOMS_GRAENSE_MAANED) return "maaned";
  if (omsaetning >= MOMS_GRAENSE_KVARTAL) return "kvartal";
  return "halvaar";
}

/**
 * True on a Danish bank day. Besides weekends, public holidays and New Year's Eve,
 * banks close on Constitution Day (5 June), Christmas Eve and the Friday after Ascension.
 */
export function erBankdag(d: Date): boolean {
  if (!erArbejdsdag(d, "da")) return false;
  const m = d.getMonth();
  const dag = d.getDate();
  if ((m === 5 && dag === 5) || (m === 11 && dag === 24)) return false;
  if (d.getDay() === 5) {
    // A Friday after a Thursday holiday is the day after Ascension (the other
    // Thursday holiday, Maundy Thursday, is followed by Good Friday anyway).
    const torsdag = new Date(d.getFullYear(), m, dag - 1);
    if (erHelligdag(torsdag, "da")) return false;
  }
  return true;
}

function naesteBankdag(d: Date): Date {
  let x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  while (!erBankdag(x)) x = new Date(x.getFullYear(), x.getMonth(), x.getDate() + 1);
  return x;
}

export interface Momsfrist {
  /** e.g. "2. kvartal 2026" */
  periodeNavn: string;
  /** First and last day of the period. */
  periodeStart: Date;
  periodeSlut: Date;
  /** Payment and reporting deadline, moved to a bank day. */
  frist: Date;
}

const MAANEDER = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];

/** All periods that end in `aar`, with their (unadjusted) deadline. */
function perioderIAar(periode: Momsperiode, aar: number): Array<Omit<Momsfrist, "frist"> & { raaFrist: Date }> {
  const slutAf = (m: number) => new Date(aar, m + 1, 0);
  if (periode === "maaned") {
    return MAANEDER.map((navn, m) => ({
      periodeNavn: `${navn[0].toUpperCase()}${navn.slice(1)} ${aar}`,
      periodeStart: new Date(aar, m, 1),
      periodeSlut: slutAf(m),
      raaFrist: m === 5 ? new Date(aar, 7, 17) : new Date(aar, m + 1, 25),
    }));
  }
  if (periode === "kvartal") {
    const frister = [new Date(aar, 5, 1), new Date(aar, 8, 1), new Date(aar, 11, 1), new Date(aar + 1, 2, 1)];
    return frister.map((raaFrist, k) => ({
      periodeNavn: `${k + 1}. kvartal ${aar}`,
      periodeStart: new Date(aar, k * 3, 1),
      periodeSlut: slutAf(k * 3 + 2),
      raaFrist,
    }));
  }
  return [
    { periodeNavn: `1. halvår ${aar}`, periodeStart: new Date(aar, 0, 1), periodeSlut: slutAf(5), raaFrist: new Date(aar, 8, 1) },
    { periodeNavn: `2. halvår ${aar}`, periodeStart: new Date(aar, 6, 1), periodeSlut: slutAf(11), raaFrist: new Date(aar + 1, 2, 1) },
  ];
}

/** The next `antal` deadlines on or after `fra` (date only), in order. */
export function naesteMomsfrister(periode: Momsperiode, fra: Date, antal = 3): Momsfrist[] {
  const idag = new Date(fra.getFullYear(), fra.getMonth(), fra.getDate()).getTime();
  const ud: Momsfrist[] = [];
  for (let aar = fra.getFullYear() - 1; ud.length < antal && aar <= fra.getFullYear() + 3; aar++) {
    for (const p of perioderIAar(periode, aar)) {
      const frist = naesteBankdag(p.raaFrist);
      if (frist.getTime() < idag) continue;
      ud.push({ periodeNavn: p.periodeNavn, periodeStart: p.periodeStart, periodeSlut: p.periodeSlut, frist });
      if (ud.length === antal) break;
    }
  }
  return ud;
}

const pad = (n: number) => String(n).padStart(2, "0");
const icsDato = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;

/** Escapes text for an iCalendar TEXT value (RFC 5545 3.3.11). */
function icsTekst(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds a content line at 75 octets (RFC 5545 3.1) without splitting a UTF-8 character. */
function fold(linje: string): string {
  const enc = new TextEncoder();
  const dele: string[] = [];
  let aktuel = "";
  let bytes = 0;
  for (const tegn of linje) {
    const n = enc.encode(tegn).length;
    const max = dele.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + n > max) {
      dele.push(aktuel);
      aktuel = "";
      bytes = 0;
    }
    aktuel += tegn;
    bytes += n;
  }
  dele.push(aktuel);
  return dele.join("\r\n ");
}

/**
 * An iCalendar file with one all-day event per deadline. `nu` sets DTSTAMP (for tests).
 * Lines end in CRLF as RFC 5545 requires.
 */
export function momsfristerIcs(
  frister: Momsfrist[],
  opts: { cvr: string; navn?: string | null; nu?: Date },
): string {
  const nu = opts.nu ?? new Date();
  const stamp = nu.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const hvem = opts.navn ? `${opts.navn} (CVR ${opts.cvr})` : `CVR ${opts.cvr}`;
  const linjer = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MinBeregner.dk//Momsfrister//DA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];
  for (const f of frister) {
    const slut = new Date(f.frist.getFullYear(), f.frist.getMonth(), f.frist.getDate() + 1);
    linjer.push(
      "BEGIN:VEVENT",
      `UID:moms-${opts.cvr}-${icsDato(f.periodeSlut)}@minberegner.dk`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDato(f.frist)}`,
      `DTEND;VALUE=DATE:${icsDato(slut)}`,
      `SUMMARY:${icsTekst(`Momsfrist: ${f.periodeNavn}`)}`,
      `DESCRIPTION:${icsTekst(`Sidste frist for at indberette og betale moms for ${f.periodeNavn} for ${hvem}. Beregnet af minberegner.dk/moms. Tjek altid fristen i TastSelv Erhverv.`)}`,
      "TRANSP:TRANSPARENT",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${icsTekst(`Momsfrist om en uge: ${f.periodeNavn}`)}`,
      "TRIGGER:-P7D",
      "END:VALARM",
      "END:VEVENT",
    );
  }
  linjer.push("END:VCALENDAR");
  return linjer.map(fold).join("\r\n") + "\r\n";
}
