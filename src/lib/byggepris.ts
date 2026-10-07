/**
 * Byggeprisberegner — hvad koster det at bygge et hus?
 *
 * Kvadratmeterprisen er et **interval**, ikke et fast tal: ingen myndighed
 * fører et officielt register over aktuelle m²-priser på nybyggeri, og
 * byggefirmaernes "fra-priser" forudsætter den mindste model og en perfekt
 * grund. Intervallerne er derfor triangulerede overslag fra branchen, krydset
 * mod byggetjek.dk (standard typehus ca. 13.500-16.000 kr./m²), nybyggethus.dk
 * (typehus 14.000-25.000, arkitekttegnet 22.000-40.000 kr./m²) og
 * byggeportal.dk (nøglefærdigt typehus 17.000-23.000 kr./m²). De dækker selve
 * huset — ikke grund, byggemodning, tilslutning eller fundament.
 *
 * Jo større huset er, jo lavere bliver prisen pr. m², fordi køkken, bad og
 * teknik fylder relativt mindre. Værktøjets intervaller er derfor et gennemsnit
 * for et parcelhus på 120-180 m²; et 250 m²-hus ligger typisk i den lave ende
 * af intervallet, et 90 m²-hus i den høje.
 *
 * Kilde og verificeringsdato: se `BYGGEPRIS_KILDE` nederst.
 */

export const BYGGEPRIS_KILDE = {
  beskrivelse:
    "Intervallerne er triangulerede brancheoverslag, krydset mod byggetjek.dk (standard typehus ca. 13.500-16.000 kr./m²), nybyggethus.dk (typehus 14.000-25.000, arkitekttegnet 22.000-40.000 kr./m²) og byggeportal.dk (nøglefærdigt typehus 17.000-23.000 kr./m²). Ingen myndighed fører et officielt register over m²-priser.",
  verifiedAt: "2026-10-07",
} as const;

export type ByggeprisNiveau = "typehus" | "totalentreprise" | "arkitekttegnet";

export interface ByggeprisNiveauInfo {
  /** Laveste vejledende pris pr. m² inkl. moms. */
  min: number;
  /** Højeste vejledende pris pr. m² inkl. moms. */
  max: number;
}

/**
 * Vejledende kvadratmeterpriser pr. niveau, i kr./m² inkl. moms.
 * Gennemsnit for et parcelhus på 120-180 m².
 */
export const BYGGEPRIS_NIVEAUER: Record<ByggeprisNiveau, ByggeprisNiveauInfo> = {
  typehus: { min: 15000, max: 20000 },
  totalentreprise: { min: 18000, max: 24000 },
  arkitekttegnet: { min: 20000, max: 30000 },
} as const;

export interface ByggeprisResultat {
  /** Laveste vejledende pris pr. m² inkl. moms. */
  kvadratmeterprisMin: number;
  /** Højeste vejledende pris pr. m² inkl. moms. */
  kvadratmeterprisMax: number;
  /** Laveste vejledende samlet byggepris ekskl. grund. */
  byggeprisMin: number;
  /** Højeste vejledende samlet byggepris ekskl. grund. */
  byggeprisMax: number;
}

/**
 * Beregn byggeprisen for et hus ud fra boligareal og standard.
 * Arealet skal være positivt; nul og negative tal behandles som 0.
 */
export function beregnByggepris(
  arealM2: number,
  niveau: ByggeprisNiveau
): ByggeprisResultat {
  const n = BYGGEPRIS_NIVEAUER[niveau];
  const areal = Number.isFinite(arealM2) && arealM2 > 0 ? arealM2 : 0;
  return {
    kvadratmeterprisMin: n.min,
    kvadratmeterprisMax: n.max,
    byggeprisMin: areal * n.min,
    byggeprisMax: areal * n.max,
  };
}

/** Værktøjets eksempel: et 150 m² typehus — den mest almindelige størrelse. */
export const BYGGEPRIS_EKSEMPEL = {
  arealM2: 150,
  niveau: "typehus" as ByggeprisNiveau,
};

/** Værktøjet starter på eksemplet: 150 m² typehus. */
export const BYGGEPRIS_STANDARD_AREAL = BYGGEPRIS_EKSEMPEL.arealM2;
export const BYGGEPRIS_STANDARD_NIVEAU = BYGGEPRIS_EKSEMPEL.niveau;
