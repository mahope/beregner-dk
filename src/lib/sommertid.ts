/**
 * Sommertid (DST) for de zoner, tidszoneberegneren understøtter.
 *
 * Uden dette regnes tidsforskellen ud fra vinteroffsetten alene, så
 * tidszoneberegneren ville svare en time forkeret i den periode, hvor
 * Danmark har sommertid. Overgangsdatoerne er verificeret mod IANA-tzbasen
 * (systemets `zoneinfo`) for 2026 og 2027:
 *
 * - EU (Danmark, Sverige, Tyskland, Frankrig, Grækenland, Storbritannien):
 *   sidste søndag i marts kl. 01:00 UTC til sidste søndag i oktober.
 * - USA (øst- og vestkyst): anden søndag i marts kl. 02:00 lokal til
 *   første søndag i november kl. 02:00 lokal.
 * - Australien (Sydney): første søndag i oktober til første søndag i april.
 * - Grønland (America/Nuuk): følger EU's datoer siden 2023, med WGT = UTC-3 og
 *   WGST = UTC-2.
 *
 * Uden for overgangsugen bruges datoens afvigelse i minutter fra UTC. Dagen for
 * skiftet regnes som sommer- resp. vintertid efter skiftet, hvilket svarer til
 * overgangstidspunktet for de fleste timer i døgnet. Tidszoneberegnerens egen
 * note om de korte overgangsperioder dækker resten.
 */

export type DstRegel = "eu" | "us" | "au" | "ingen";

const MS_PER_DAG = 86400000;

function toUtcDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function fromUtcDayNumber(dayNumber: number): Date {
  const d = new Date(dayNumber);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Datoen for den `n`'te søndag i måneden (n = 1..5), som et lokalt kalenderdato. */
export function soendagIMaaned(year: number, month: number, n: number): Date {
  const foerste = new Date(year, month, 1);
  const ugedag = foerste.getDay();
  const tilFoersteSoendag = (7 - ugedag) % 7;
  return new Date(year, month, 1 + tilFoersteSoendag + (n - 1) * 7);
}

/**
 * Sidste søndag i måneden. Kan ikke bygges som "femte søndag", fordi en måned
 * altid har mellem fire og fem søndage: den 5. søndag i oktober 2026 ligger i
 * november. Gå derfor fra månedens sidste dag baglæns til søndag.
 */
export function sidsteSoendagIMaaned(year: number, month: number): Date {
  const sidste = new Date(year, month + 1, 0);
  return new Date(year, month, sidste.getDate() - sidste.getDay());
}

/** Sand hvis `dato` ligger på eller efter `start` og før `slut`. */
function mellemDatoer(dato: Date, start: Date, slut: Date): boolean {
  const d = toUtcDayNumber(dato);
  return d >= toUtcDayNumber(start) && d < toUtcDayNumber(slut);
}

/**
 * Sand hvis zonen bruger sommertid på `dato`. Zoner uden sommertid
 * (`"ingen"`) returnerer altid false, så de kan gå gennem samme kodebane som
 * zoner med.
 */
export function erSommertid(dato: Date, regel: DstRegel): boolean {
  const year = dato.getFullYear();
  switch (regel) {
    case "eu":
      return mellemDatoer(
        dato,
        sidsteSoendagIMaaned(year, 2),
        sidsteSoendagIMaaned(year, 9)
      );
    case "us":
      return mellemDatoer(
        dato,
        soendagIMaaned(year, 2, 2),
        soendagIMaaned(year, 10, 1)
      );
    case "au":
      // Sommeretiden i Australien løber fra første søndag i oktober til første
      // søndag i april, altså over årsskiftet, så intervallet dækkes i to bidder.
      return (
        mellemDatoer(dato, soendagIMaaned(year, 9, 1), new Date(year, 11, 31)) ||
        mellemDatoer(dato, new Date(year, 0, 1), soendagIMaaned(year, 3, 1))
      );
    default:
      return false;
  }
}

/** UTC-forskellen i minutter, når `dato` er gældende for zonen med `regel`. */
export function utcOffsetMinutter(
  vinter: number,
  sommer: number | undefined,
  regel: DstRegel,
  dato: Date
): number {
  if (sommer === undefined || sommer === vinter) return vinter;
  return erSommertid(dato, regel) ? sommer : vinter;
}

/** Dagen efter `dato`, brugt når et klokkeslæt skal flyttes over dagsgrænsen. */
export function addDays(dato: Date, antal: number): Date {
  const dayNumber = toUtcDayNumber(dato) + antal * MS_PER_DAG;
  return fromUtcDayNumber(dayNumber);
}
