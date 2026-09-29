import { beregnAlder } from "./alder";
import type { Locale } from "./i18n";

/**
 * "Hvor mange dage har du levet?" — den søgning, der står som nummer tre på
 * beraknare.se's /dato (385 visninger, pos. 10) og nummer syv under "hvor gammel
 * er jeg" i dansk autocomplete. Den er *ikke* et datoberegner-spørgsmål: den
 * spørger om ens egen levetid, så det er /alder der kan svare, fordi det er
 * eneste af de to værktøjer der kender fødselsdatoen.
 *
 * Hvert tal her kommer fra `beregnAlder` — samme modul som værktøjet bruger —
 * så brødteksten ikke kan love et tal, logikken modsiger. Reference-datoen
 * er et argument og ikke "i dag", så en test kan låse tallene på en bestemt
 * dag.
 */

export interface AlderLevet {
  /** Fødselsdatoen i eksemplet, som "YYYY-MM-DD". */
  foedselsdato: string;
  /** Alder i hele år, måneder og dage, formateret til siden. */
  aar: number;
  maaneder: number;
  dage: number;
  /** Hele dage siden fødslen. */
  totalDage: number;
  /** Hele uger siden fødslen. */
  totalUger: number;
  /** Hele måneder siden fødslen. */
  totalMaaneder: number;
  /** Hele timer siden fødslen — 24 timer pr. døgn, aldrig 23 eller 25. */
  totalTimer: number;
  /** Hele minutter siden fødslen. */
  totalMinutter: number;
}

/**
 * Den fødselsdato, eksemplerne på siden allerede bruger: 15. marts 1990. Den er
 * valgt, fordi den står i sidens egen beskrivelse, så læseren kan tjekke
 * hele rækken mod det, han læser to centimeter over.
 */
export const LEVET_FOEDSELSDATO = "1990-03-15";

export function alderLevet(referenceIso: string): AlderLevet {
  const r = beregnAlder({
    foedselsdato: LEVET_FOEDSELSDATO,
    beregningsdato: referenceIso,
  });
  if (!r) {
    throw new Error(
      `Levetids-eksemplet ${LEVET_FOEDSELSDATO} mod ${referenceIso} kan ikke beregnes af beregnAlder`
    );
  }
  return {
    foedselsdato: LEVET_FOEDSELSDATO,
    aar: r.aar,
    maaneder: r.maaneder,
    dage: r.dage,
    totalDage: r.totalDage,
    totalUger: r.totalUger,
    totalMaaneder: r.totalMaaneder,
    totalTimer: r.totalTimer,
    totalMinutter: r.totalMinutter,
  };
}

/**
 * "13.343 dage" — med den locale's tusindtalsseparator. Dansk og svensk
 * bruger begge et tegn, der ikke er et almindeligt mellemrum i den
 * server-renderede HTML, så formatteres tallet her og ikke i teksten.
 */
export function formatDageLived(l: AlderLevet, locale: Locale): string {
  const intlLocale = locale === "se" ? "sv-SE" : "da-DK";
  const dage = new Intl.NumberFormat(intlLocale).format(l.totalDage);
  return locale === "se" ? `${dage} dagar` : `${dage} dage`;
}

/** "13.343" alene — til de steder hvor "dage"/"dagar" står i kolonneoverskriften. */
export function formatDageTal(tal: number, locale: Locale): string {
  const intlLocale = locale === "se" ? "sv-SE" : "da-DK";
  return new Intl.NumberFormat(intlLocale).format(tal);
}
