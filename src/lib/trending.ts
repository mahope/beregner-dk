import type { Locale } from "./i18n";
import { iDagPaSiden } from "./lokal-dato";

/**
 * Returns 3 trending calculator hrefs for the calendar month the visitor is in.
 * Seasonal relevance drives which calculators are highlighted.
 *
 * The month is read in the site's own timezone via `iDagPaSiden`, never with
 * `Date.getMonth()`. The server runs in UTC, so between 00:00 and 02:00 local
 * time — the first two hours of 1 January, 1 April, 1 August and 1 October —
 * UTC still stands in the previous month, and the badge named last season's
 * calculators on the very day the season turned.
 *
 * `today` and `locale` are parameters instead of being read from the ambient
 * clock, so the mapping can be judged on a fixed instant. That also makes the
 * gate meaningful: a test that moves the clock with `vi.setSystemTime` cannot
 * tell the site's timezone from the machine's, because on a Danish developer
 * machine they are the same and the old bug hides.
 */
export function getTrendingHrefs(today: Date, locale: Locale): string[] {
  const isoDato = iDagPaSiden(today, locale);
  const month = Number(isoDato.slice(5, 7)) - 1; // 0-indexed

  if (month <= 2) {
    // Jan–Mar: årsopgørelse season
    return ["/loen-efter-skat", "/rentefradrag", "/pension"];
  }
  if (month <= 6) {
    // Apr–Jul: summer/vacation
    return ["/feriepenge", "/valuta", "/bmi"];
  }
  if (month <= 8) {
    // Aug–Sep: studiestart
    return ["/su", "/boligstoette", "/husleje"];
  }
  // Oct–Dec: year-end planning
  return ["/pension", "/opsparing", "/arveafgift"];
}
