// Official daily exchange rates from Danmarks Nationalbank (DKK per 100 units, published on
// banking days around 16:00). Used as the DKK source on the Danish site; frankfurter.dev (ECB)
// remains the fallback and the source for other locales.

export const NATIONALBANKEN_URL = "https://www.nationalbanken.dk/api/currencyratesxml?lang=da";
const TIMEOUT_MS = 3000;

export interface NationalbankKurser {
  /** Rate date, YYYY-MM-DD. */
  dato: string;
  /** DKK per 1 unit of the currency. */
  kurser: Record<string, number>;
}

const attr = (tag: string, navn: string): string | null => {
  const m = new RegExp(`\\b${navn}="([^"]*)"`).exec(tag);
  return m ? m[1] : null;
};

/** Parses the XML feed. Danish decimal commas; rates are per 100 units. */
export function parseNationalbankXml(xml: string): NationalbankKurser | null {
  if (typeof xml !== "string") return null;
  const tekst = xml.replace(/^﻿/, "");
  if (!/<exchangerates\b[^>]*refcur="DKK"/.test(tekst)) return null;
  const dagTag = /<dailyrates\b[^>]*>/.exec(tekst)?.[0];
  const dato = dagTag ? attr(dagTag, "id") : null;
  if (!dato || !/^\d{4}-\d{2}-\d{2}$/.test(dato)) return null;

  const kurser: Record<string, number> = {};
  for (const [tag] of tekst.matchAll(/<currency\b[^>]*\/?>/g)) {
    const kode = attr(tag, "code");
    const rate = attr(tag, "rate");
    if (!kode || !/^[A-Z]{3}$/.test(kode) || !rate) continue;
    const vaerdi = Number(rate.replace(/\./g, "").replace(",", "."));
    if (Number.isFinite(vaerdi) && vaerdi > 0) kurser[kode] = vaerdi / 100;
  }
  return Object.keys(kurser).length > 0 ? { dato, kurser } : null;
}

/** Fetches today's rates server-side (cached for an hour). Returns null on any failure. */
export async function hentNationalbankKurser(): Promise<NationalbankKurser | null> {
  try {
    const res = await fetch(NATIONALBANKEN_URL, {
      headers: { Accept: "application/xml", "User-Agent": "MinBeregner.dk/1.0 (+https://minberegner.dk/valuta)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return parseNationalbankXml(await res.text());
  } catch {
    return null;
  }
}
