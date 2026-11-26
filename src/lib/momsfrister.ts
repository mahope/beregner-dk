// Danish VAT period names and an .ics export of the VAT deadlines.
//
// The period and the deadlines themselves come from cvrradar (POST /v1/intern/beregner,
// `moms.periode` and `moms.frister`, already moved to bank days). minberegner keeps no
// second copy of the deadline rules, so the page and the .ics file always show the same
// dates as cvrradar.

export type Momsperiode = "maaned" | "kvartal" | "halvaar";

export const MOMS_GRAENSE_KVARTAL = 5_000_000;
export const MOMS_GRAENSE_MAANED = 50_000_000;
/** Registration duty: taxable turnover above this over 12 months. */
export const MOMS_REGISTRERINGSGRAENSE = 50_000;

export const MOMSPERIODE_NAVN: Record<Momsperiode, string> = {
  maaned: "Månedlig",
  kvartal: "Kvartalsvis",
  halvaar: "Halvårlig",
};

export interface Momsfrist {
  /** e.g. "2. kvartal 2026" */
  periodeNavn: string;
  /** First and last day of the period. */
  periodeStart: Date;
  periodeSlut: Date;
  /** Payment and reporting deadline, moved to a bank day. */
  frist: Date;
}

/** A deadline as cvrradar sends it: ISO dates (YYYY-MM-DD), both period days included. */
export interface CvrradarFrist {
  fra: string;
  til: string;
  frist: string;
}

const MAANEDER = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];

const ISO_DATO = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A local calendar date from YYYY-MM-DD, or null if it is not a real date. */
export function isoDato(s: unknown): Date | null {
  if (typeof s !== "string") return null;
  const m = ISO_DATO.exec(s);
  if (!m) return null;
  const [aar, maaned, dag] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(aar, maaned - 1, dag);
  return d.getFullYear() === aar && d.getMonth() === maaned - 1 && d.getDate() === dag ? d : null;
}

function periodeNavn(periode: Momsperiode, start: Date): string {
  const aar = start.getFullYear();
  const m = start.getMonth();
  if (periode === "maaned") return `${MAANEDER[m][0].toUpperCase()}${MAANEDER[m].slice(1)} ${aar}`;
  if (periode === "kvartal") return `${Math.floor(m / 3) + 1}. kvartal ${aar}`;
  return `${m < 6 ? 1 : 2}. halvår ${aar}`;
}

/** Turns cvrradar's deadlines into named deadlines. Entries with bad dates are dropped. */
export function fristerFraCvrradar(periode: Momsperiode, frister: readonly CvrradarFrist[]): Momsfrist[] {
  const ud: Momsfrist[] = [];
  for (const f of frister) {
    const periodeStart = isoDato(f.fra);
    const periodeSlut = isoDato(f.til);
    const frist = isoDato(f.frist);
    if (!periodeStart || !periodeSlut || !frist) continue;
    ud.push({ periodeNavn: periodeNavn(periode, periodeStart), periodeStart, periodeSlut, frist });
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
      `DESCRIPTION:${icsTekst(`Sidste frist for at indberette og betale moms for ${f.periodeNavn} for ${hvem}. Vejledende frist fra cvrradar.dk via minberegner.dk/moms. Tjek altid fristen i TastSelv Erhverv.`)}`,
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
