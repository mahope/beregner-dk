/**
 * Idealvægt (IBW) for voksne, som *data med kilde* — ikke som tal skrevet i
 * brødteksten.
 *
 * Hvorfor idealvægt og ikke BMI: `/bmi` regner forholdet mellem vægt og højde
 * og siger intet om, hvor tungt du *burde* være. Idealvægt er det andet spørgsmål,
 * og dansk autocomplete har 10 af 10 træffere under «idealvægt» derom — de er
 * næsten alle «idealvægt kvinde 175 cm» og «idealvægt mænd alder», altså et
 * højde- og kønsspecifikt tal. Der var ingen beregner på sitet.
 *
 * **Kilderne er hentet, ikke husket.** Begge formler er publicerede og kan slås
 * op og efterprøves; det er derfor de står her som data og ikke som magiske tal
 * i en komponent:
 *
 * - **Devine (1974)** — Pai M Jr & Paloucek FR, "The Origin of the 'Ideal' Body
 *   Weight Equations", Annals of Pharmacotherapy 34(9):1066-1069.
 *   Wikipedia, "Human body weight", afsnittet "Devine formula" (hentet 4/10 2026),
 *   gengiver præcis: mænd 50 kg + 0,9 kg × (højde i cm − 152),
 *   kvinder 45,5 kg + 0,9 kg × (højde i cm − 152).
 * - **Hamwi (1964)** — Bartlett RM, Marian M, Taren D & Muramoto J, "Geriatric
 *   Nutrition Handbook", Jones & Bartlett, s. 15. Gengivet samme sted:
 *   mænd 48 kg + 1,1 kg × (højde i cm − 152),
 *   kvinder 45,4 kg + 0,9 kg × (højde i cm − 152).
 *
 * Formlerne er lineære og blev lavet til *medicinsk dosering*, ikke til
 * slankeguide — derfor viser siden dem begge og lægger BMI-båndet ved siden af
 * i stedet for at udpege én "rigtig" idealvægt. Uden den note ville et tal fra
 * denne side kunne bruges som en slankemål-fordomsel.
 *
 * BMI-grænserne kommer fra `bmi-voksen-grænser.ts`, som allerede er sitets
 * kildeførte WHO-tabel — de to kan derfor ikke sige hver sit om, hvad
 * normalvægt er.
 */

/** Hvilken kilde hver formel stammer fra, så en efterfølger kan genhente den. */
export const IDEALVAEGT_KILDE = {
  devine: {
    formel: "Devine (1974)",
    dokument: "Pai & Paloucek, The Origin of the \"Ideal\" Body Weight Equations, Annals of Pharmacotherapy 34(9):1066-1069",
    hentet: "4. oktober 2026",
  },
  hamwi: {
    formel: "Hamwi (1964)",
    dokument: "Bartlett, Marian, Taren & Muramoto, Geriatric Nutrition Handbook, Jones & Bartlett, s. 15",
    hentet: "4. oktober 2026",
  },
} as const;

export type Koen = "mand" | "kvinde";

/**
 * Højden kommer fra et felt, så den kan ikke være 0 eller negativ. Grænsen er
 * sat, fordi formlerne er beregnet på voksne og derfor skal ekstrapoleres under
 * dem: en mand på 104 cm regner ud på **6,8 kg** i Devines formel og **-4,8 kg**
 * i Hamwis, og de fire formler krydser nul mellem 96,5 og 108,4 cm. Værktøjet
 * og siden bruger samme grænser, så et felt aldrig kan vise en værdi, formlen
 * ikke kan regne på.
 */
export const MIN_HOEJDE_CM = 130;
export const MAX_HOEJDE_CM = 220;

/** Formlernes referencehøjde i cm. Under den extrapolerer begge formler. */
const REFERENCE_HOEJDE_CM = 152;

function assertHoejde(hoejdeCm: number): void {
  if (!Number.isFinite(hoejdeCm) || hoejdeCm <= 0) {
    throw new Error(`Højden skal være et tal i cm: ${hoejdeCm}`);
  }
}

function vaegt(grundKg: number, prCm: number, hoejdeCm: number, koen: Koen): number {
  assertHoejde(hoejdeCm);
  return grundKg + prCm * (hoejdeCm - REFERENCE_HOEJDE_CM);
}

/**
 * Devines idealvægt i kilo: mænd 50 + 0,9 pr. cm over 152,
 * kvinder 45,5 + 0,9 pr. cm over 152.
 *
 * Pr. centimeter er ikke en konstant pr. køn (kvindernes er 0,9, mændenes er
 * 0,9 i Devine men 1,1 i Hamwi), så grundværdien afhænger af køn.
 */
export function devineIdealvaegt(hoejdeCm: number, koen: Koen): number {
  const grund = koen === "mand" ? 50 : 45.5;
  const prCm = 0.9;
  return vaegt(grund, prCm, hoejdeCm, koen);
}

/**
 * Hamwis idealvægt i kilo: mænd 48 + 1,1 pr. cm over 152,
 * kvinder 45,4 + 0,9 pr. cm over 152.
 */
export function hamwiIdealvaegt(hoejdeCm: number, koen: Koen): number {
  const grund = koen === "mand" ? 48 : 45.4;
  const prCm = koen === "mand" ? 1.1 : 0.9;
  return vaegt(grund, prCm, hoejdeCm, koen);
}

export interface IdealvaegtResultat {
  hoejdeCm: number;
  koen: Koen;
  /** Devines formel, i kilo. */
  devine: number;
  /** Hamwis formel, i kilo. */
  hamwi: number;
  /** Gennemsnitet af de to, i kilo — det tal, der står som svaret. */
  gennemsnit: number;
  /** Spredningen mellem formlerne, i kilo. */
  spredning: number;
}

/**
 * Begge formler plus deres gennemsnit. `spredning` er ikke pynt: når de to er
 * 6 kilo fra hinanden, er det ikke en præcis idealvægt, og det skal kunne ses.
 */
export function idealvaegtResultat(hoejdeCm: number, koen: Koen): IdealvaegtResultat {
  const devine = devineIdealvaegt(hoejdeCm, koen);
  const hamwi = hamwiIdealvaegt(hoejdeCm, koen);
  return {
    hoejdeCm,
    koen,
    devine,
    hamwi,
    gennemsnit: (devine + hamwi) / 2,
    spredning: Math.abs(devine - hamwi),
  };
}

/** Runder kilo til én decimal — samme præcision som BMI-intervallet. */
export function rundIdealvaegt(kg: number): number {
  return Math.round(kg * 10) / 10;
}