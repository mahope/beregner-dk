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
}

export const AREAL_EKSEEMPLER: ArealEksempel[] = [
  // Et rum på 5 m × 4 m.
  { id: "rektangel", areal: 5 * 4, decimaler: 0 },
  // En cirkel med radius 3 m (diameter 6 m).
  { id: "cirkel", areal: PI_TO_DECIMALER * 3 * 3, decimaler: 1 },
  // Grundlinje 6 m, højde 4 m.
  { id: "trekant", areal: (6 * 4) / 2, decimaler: 0 },
  // To parallelle sider på 4 m og 6 m, højde 3 m.
  { id: "trapez", areal: ((4 + 6) / 2) * 3, decimaler: 0 },
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
