/**
 * Areal (fladens størrelse) i meter — som *formler med kilde*, ikke tal i
 * brødtekst.
 *
 * Hvorfor en side til det: `/rumfang` regner rumfang (m³) og er den naturlige
 * søster, og dansk autocomplete (målt 7/10 på `suggestqueries.google.com`,
 * `hl=da&gl=dk`) er entydig om spørgsmålet:
 *
 * - «areal af» → **10 af 10** træffere er en figur: cirkel, trekant, firkant,
 *   trapez, rektangel, cirkel formel, cylinder, retvinklet trekant,
 *   parallelogram, cirkel med diameter.
 * - «arealet af en» → 10 af 10: cirkel, trekant, firkant, rektangel,
 *   cirkel formel, trapez, retvinklet trekant, trekant formel, cylinder, rombe.
 *
 * To ting står frem over resten: **formel** (folk vil have formlen, ikke bare
 * tallet) og **cirkel med diameter** (samme fejlkilde som på `/rumfang`:
 * diameter skrives som radius, og arealet bliver fire gange for stort).
 *
 * Formlerne er skolematematikkens, så de er prøvet mod kendte tal i
 * `areal.test.ts` (kvadrat, trekant = halv rektangel, cirkel = πr², rombe =
 * halv rektangel over diagonalerne).
 */

/** De figurer værktøjet regner på. */
export type ArealFigur =
  | "cirkel"
  | "trekant"
  | "rektangel"
  | "kvadrat"
  | "trapez"
  | "parallelogram"
  | "rombe";

/** Ét input pr. figur, i meter. Uden brug er værdien `undefined`. */
export interface ArealInput {
  cirkel?: { diameter: number };
  trekant?: { grundlinje: number; hoejde: number };
  rektangel?: { laengde: number; bredde: number };
  kvadrat?: { side: number };
  trapez?: { sideA: number; sideB: number; hoejde: number };
  parallelogram?: { grundlinje: number; hoejde: number };
  rombe?: { diagonal1: number; diagonal2: number };
}

/** 1 m² = 10.000 cm². Skrevet som konstant, så ingen side kan regne det forkert. */
export const KVADRATCENTIMETER_PR_KVADRATMETER = 10000;

/**
 * Mindste mål værktøjet accepterer, i meter.
 *
 * Uden en bund er et felt på 0,0001 m et areal på 1 × 10⁻⁸ m², som formatteres
 * til «0 m²» — et tal der ser rigtigt ud og er værdiløst. En læser der skriver
 * 0,2 cm i stedet for 20 cm får derfor en fejl, ikke et svar.
 */
export const MIN_MAAL_M = 0.01;

/** Største mål, i meter. Sætter en rampe på `Number.MAX_SAFE_INTEGER`-tabeller. */
export const MAX_MAAL_M = 1000;

function assertMaal(vaerdi: number | undefined, navn: string): void {
  if (
    typeof vaerdi !== "number" ||
    !Number.isFinite(vaerdi) ||
    vaerdi < MIN_MAAL_M ||
    vaerdi > MAX_MAAL_M
  ) {
    throw new Error(
      `${navn} skal være et tal mellem ${MIN_MAAL_M} og ${MAX_MAAL_M} meter: ${String(vaerdi)}`
    );
  }
}

/** Arealet af en cirkel med den angivne diameter, i m². */
function cirkelAreal(diameterM: number): number {
  const r = diameterM / 2;
  return Math.PI * r * r;
}

/** Areal i m² for én figur, eller `undefined` hvis inputtet mangler. */
export function areal(figur: ArealFigur, input: ArealInput): number | undefined {
  switch (figur) {
    case "cirkel": {
      const c = input.cirkel;
      if (!c) return undefined;
      assertMaal(c.diameter, "Diameteren");
      return cirkelAreal(c.diameter);
    }
    case "trekant": {
      const t = input.trekant;
      if (!t) return undefined;
      assertMaal(t.grundlinje, "Grundlinjen");
      assertMaal(t.hoejde, "Højden");
      return (t.grundlinje * t.hoejde) / 2;
    }
    case "rektangel": {
      const r = input.rektangel;
      if (!r) return undefined;
      assertMaal(r.laengde, "Længden");
      assertMaal(r.bredde, "Bredden");
      return r.laengde * r.bredde;
    }
    case "kvadrat": {
      const k = input.kvadrat;
      if (!k) return undefined;
      assertMaal(k.side, "Siden");
      return k.side * k.side;
    }
    case "trapez": {
      const t = input.trapez;
      if (!t) return undefined;
      assertMaal(t.sideA, "Side a");
      assertMaal(t.sideB, "Side b");
      assertMaal(t.hoejde, "Højden");
      return ((t.sideA + t.sideB) / 2) * t.hoejde;
    }
    case "parallelogram": {
      const p = input.parallelogram;
      if (!p) return undefined;
      assertMaal(p.grundlinje, "Grundlinjen");
      assertMaal(p.hoejde, "Højden");
      return p.grundlinje * p.hoejde;
    }
    case "rombe": {
      const r = input.rombe;
      if (!r) return undefined;
      assertMaal(r.diagonal1, "Diagonal 1");
      assertMaal(r.diagonal2, "Diagonal 2");
      return (r.diagonal1 * r.diagonal2) / 2;
    }
  }
}

/** Formlen som brødtekst, med π og brøker som tegn — ikke som `Math.PI`. */
export const AREAL_FORMEL: Record<ArealFigur, string> = {
  cirkel: "π × (d ÷ 2)²",
  trekant: "(grundlinje × højde) ÷ 2",
  rektangel: "længde × bredde",
  kvadrat: "side × side",
  trapez: "((a + b) ÷ 2) × højde",
  parallelogram: "grundlinje × højde",
  rombe: "(d₁ × d₂) ÷ 2",
};

/** Hvilke felter den valgte figur har, i den rækkefølge de vises. */
export interface ArealFelt {
  /** Feltets navn — også nøglen i `ArealInput`. */
  nogle:
    | "diameter"
    | "grundlinje"
    | "hoejde"
    | "laengde"
    | "bredde"
    | "side"
    | "sideA"
    | "sideB"
    | "diagonal1"
    | "diagonal2";
  da: string;
  se: string;
}

/**
 * Felterne pr. figur. Sammenstillingen er data, fordi samme figur skal kunne
 * hedde «Diameter» på dansk og «Diameter» på svensk uden at komponenten kender
 * figurerne — og fordi porten kan dømme på at kvadratet *ikke* har et
 * højdefelt.
 */
export const AREAL_FELT: Record<ArealFigur, readonly ArealFelt[]> = {
  cirkel: [{ nogle: "diameter", da: "Diameter", se: "Diameter" }],
  trekant: [
    { nogle: "grundlinje", da: "Grundlinje", se: "Baslinje" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
  rektangel: [
    { nogle: "laengde", da: "Længde", se: "Längd" },
    { nogle: "bredde", da: "Bredde", se: "Bredd" },
  ],
  kvadrat: [{ nogle: "side", da: "Side", se: "Sida" }],
  trapez: [
    { nogle: "sideA", da: "Side a", se: "Sida a" },
    { nogle: "sideB", da: "Side b", se: "Sida b" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
  parallelogram: [
    { nogle: "grundlinje", da: "Grundlinje", se: "Baslinje" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
  rombe: [
    { nogle: "diagonal1", da: "Diagonal 1", se: "Diagonal 1" },
    { nogle: "diagonal2", da: "Diagonal 2", se: "Diagonal 2" },
  ],
};

export interface ArealSvar {
  figur: ArealFigur;
  /** Arealet i m². */
  kvadratmeter: number;
  /** Det samme areal i cm². */
  kvadratcentimeter: number;
}

/** Arealet i begge enheder, så ingen side skal regne cm² selv. */
export function arealSvar(
  figur: ArealFigur,
  input: ArealInput
): ArealSvar | undefined {
  const kvadratmeter = areal(figur, input);
  if (kvadratmeter === undefined) return undefined;
  return {
    figur,
    kvadratmeter,
    kvadratcentimeter: kvadratmeter * KVADRATCENTIMETER_PR_KVADRATMETER,
  };
}

/**
 * Et gennemregnet eksempel pr. figur — det samme tal i titel, FAQ og løsning.
 *
 * Uden ét fælles eksempel kan brødteksten, FAQ'en og `metaTitle` komme til at
 * vise hver sit tal, og de tre skrives i tre filer. Derfor regnes de her og
 * læses alle steder.
 */
export const AREAL_EKSEMPEL: Record<
  ArealFigur,
  { beskrivelseDa: string; beskrivelseSe: string; svar: ArealSvar }
> = {
  cirkel: {
    beskrivelseDa: "En cirkel med diameter 1 m",
    beskrivelseSe: "En cirkel med diameter 1 m",
    svar: { figur: "cirkel", kvadratmeter: Math.PI / 4, kvadratcentimeter: (Math.PI / 4) * KVADRATCENTIMETER_PR_KVADRATMETER },
  },
  trekant: {
    beskrivelseDa: "En trekant med grundlinje 2 m og højde 3 m",
    beskrivelseSe: "En triangel med baslinje 2 m och höjd 3 m",
    svar: { figur: "trekant", kvadratmeter: 3, kvadratcentimeter: 30000 },
  },
  rektangel: {
    beskrivelseDa: "Et rektangel på 2 × 3 m",
    beskrivelseSe: "En rektangel på 2 × 3 m",
    svar: { figur: "rektangel", kvadratmeter: 6, kvadratcentimeter: 60000 },
  },
  kvadrat: {
    beskrivelseDa: "Et kvadrat med side 2 m",
    beskrivelseSe: "En kvadrat med sida 2 m",
    svar: { figur: "kvadrat", kvadratmeter: 4, kvadratcentimeter: 40000 },
  },
  trapez: {
    beskrivelseDa: "Et trapez med parallelle sider 2 m og 4 m og højde 3 m",
    beskrivelseSe: "En trapets med parallella sidor 2 m och 4 m och höjd 3 m",
    svar: { figur: "trapez", kvadratmeter: 9, kvadratcentimeter: 90000 },
  },
  parallelogram: {
    beskrivelseDa: "Et parallelogram med grundlinje 2 m og højde 3 m",
    beskrivelseSe: "En parallellogram med baslinje 2 m och höjd 3 m",
    svar: { figur: "parallelogram", kvadratmeter: 6, kvadratcentimeter: 60000 },
  },
  rombe: {
    beskrivelseDa: "En rombe med diagonaler 2 m og 3 m",
    beskrivelseSe: "En romb med diagonaler 2 m och 3 m",
    svar: { figur: "rombe", kvadratmeter: 3, kvadratcentimeter: 30000 },
  },
};
