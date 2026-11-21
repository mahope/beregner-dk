/**
 * De fire regneeksempler, /kvadratmeter viser i "metoden med tal".
 *
 * Kun tal og id'er — ingen sprogstrenge (C73's R4: et dansk fragment i et
 * delt modul lækker til beraknare.se). Rækkefølgen er den samme i begge
 * sproggrene, så en svensk læser og en dansk læser regner efter præcis de
 * samme tal.
 */

/** π med to decimaler — det tal de trykte regnestykker bruger, så læseren kan efterprøve dem. */
export const PI_TO_DECIMALER = 3.14;

export type ArealEksempelId = "rektangel" | "cirkel" | "trekant" | "trapez";

export interface ArealEksempel {
  id: ArealEksempelId;
  /** Arealet i m², udregnet herfra — ikke skrevet i hånden. */
  areal: number;
  /** Antal decimaler, arealet vises med. */
  decimaler: number;
  /**
   * De tal regnestykket ganger og dividerer, i den rækkefølge sætningen
   * skriver dem: `5, 4` → «5 × 4 = 20 m²», `[3.14, 3, 3]` → «3,14 × 3 × 3»,
   * `[4, 6, 3]` → «((4 + 6) / 2) × 3». Uden dem kunne brødteksten og
   * FAQ'en få hver sit eget eksempel på den samme figur.
   */
  tal: number[];
}

export const AREAL_EKSEEMPLER: ArealEksempel[] = [
  // Et rum på 5 m × 4 m.
  { id: "rektangel", areal: 5 * 4, decimaler: 0, tal: [5, 4] },
  // En cirkel med radius 3 m (diameter 6 m).
  { id: "cirkel", areal: PI_TO_DECIMALER * 3 * 3, decimaler: 1, tal: [PI_TO_DECIMALER, 3, 3] },
  // Grundlinje 6 m, højde 4 m.
  { id: "trekant", areal: (6 * 4) / 2, decimaler: 0, tal: [6, 4] },
  // To parallelle sider på 4 m og 6 m, højde 3 m.
  { id: "trapez", areal: ((4 + 6) / 2) * 3, decimaler: 0, tal: [4, 6, 3] },
];

export function arealEksempel(id: ArealEksempelId): ArealEksempel {
  const fundet = AREAL_EKSEEMPLER.find((eksempel) => eksempel.id === id);
  if (!fundet) {
    throw new Error(`Ukendt arealeksempel: ${id}`);
  }
  return fundet;
}

/** Priseksemplet: 20 m² gulv til 150 kr./m². */
export const PRIS_EKSEMPEL = {
  areal: 20,
  prisPrM2: 150,
  pris: 20 * 150,
};

/** 1 m² i cm². */
export const CM2_PR_M2 = 10_000;

/** 1 hektar i m². */
export const M2_PR_HAKTAR = 10_000;

/** 1 m² i kvadratfod. Oprindeligt 10,7639 — de to decimaler er sidens facit. */
export const SQ_FT_PR_M2 = 10.76;

/**
 * «Et værelse på 3 x 4 meter» og den lidt mere urealistiske 3,5 x 4,2 m, som
 * FAQ'en bruger til at vise at arealet ikke er et pænt tal. Begge arealer
 * regnes herfra, så sætningen ikke kan sige 14,7 m² for en kombination, der
 * ikke giver 14,7.
 */
export const VAERELSE_EKSEMPLER = [
  { laengde: 3, bredde: 4 },
  { laengde: 3.5, bredde: 4.2 },
] as const;
