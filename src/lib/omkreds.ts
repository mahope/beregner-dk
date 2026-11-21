/**
 * Omkreds (kanten rundt om en flad figur) — som *formler*, ikke tal i brødtekst.
 *
 * Hvorfor en side til det: dansk autocomplete (målt 7/10 på
 * `suggestqueries.google.com`, `hl=da&gl=dk`) er entydig:
 *
 * - «omkreds af» → **10 af 10** træffere er en figur: cirkel, firkant, trekant,
 *   cirkel formel, jorden, rombe, kvadrat, cirkel til diameter, oval, kasse.
 * - «hvordan regner man omkreds» → 10 af 10: cirkel, firkant, trekant,
 *   rektangel, kvadrat, kasse, oval og «omkredsen ud på en cirkel».
 *
 * Svensk spørger det samme: «omkrets av cirkel», «omkrets av triangel»,
 * «omkrets av en rektangel», «omkrets av kvadrat». Siden er den naturlige
 * søster til `/areal` (arealet af de samme figurer) og `/rumfang` (rumfang).
 *
 * To ting står frem over resten: **formel** (folk vil have formlen) og
 * **cirkel med diameter** (samme fejlkilde som på `/areal` og `/rumfang`:
 * diameter skrives som radius).
 *
 * Formlerne er skolematematikkens, så de er prøvet mod kendte tal i
 * `omkreds.test.ts` (kvadrat = 4 sider, rektangel = 2 × (l + b), cirkel = πd,
 * trekant = a + b + c, rombe = 4 sider, parallelogram = 2 × (a + b)).
 */
import { MAX_MAAL_M, MIN_MAAL_M } from "./areal";

/** Grænserne for et mål, i meter — de samme som `/areal` bruger. */
export { MAX_MAAL_M, MIN_MAAL_M } from "./areal";

/** De figurer værktøjet regner på. */
export type OmkredsFigur =
  | "cirkel"
  | "kvadrat"
  | "rektangel"
  | "trekant"
  | "trapez"
  | "parallelogram"
  | "rombe";

/** Ét input pr. figur, i meter. Uden brug er værdien `undefined`. */
export interface OmkredsInput {
  cirkel?: { diameter: number };
  kvadrat?: { side: number };
  rektangel?: { laengde: number; bredde: number };
  trekant?: { sideA: number; sideB: number; sideC: number };
  trapez?: { sideA: number; sideB: number; sideC: number; sideD: number };
  parallelogram?: { sideA: number; sideB: number };
  rombe?: { side: number };
}

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

/** Omkredsen i meter for én figur, eller `undefined` hvis inputtet mangler. */
export function omkreds(
  figur: OmkredsFigur,
  input: OmkredsInput
): number | undefined {
  switch (figur) {
    case "cirkel": {
      const c = input.cirkel;
      if (!c) return undefined;
      assertMaal(c.diameter, "Diameteren");
      return Math.PI * c.diameter;
    }
    case "kvadrat": {
      const k = input.kvadrat;
      if (!k) return undefined;
      assertMaal(k.side, "Siden");
      return 4 * k.side;
    }
    case "rektangel": {
      const r = input.rektangel;
      if (!r) return undefined;
      assertMaal(r.laengde, "Længden");
      assertMaal(r.bredde, "Bredden");
      return 2 * (r.laengde + r.bredde);
    }
    case "trekant": {
      const t = input.trekant;
      if (!t) return undefined;
      assertMaal(t.sideA, "Side a");
      assertMaal(t.sideB, "Side b");
      assertMaal(t.sideC, "Side c");
      return t.sideA + t.sideB + t.sideC;
    }
    case "trapez": {
      const t = input.trapez;
      if (!t) return undefined;
      assertMaal(t.sideA, "Side a");
      assertMaal(t.sideB, "Side b");
      assertMaal(t.sideC, "Side c");
      assertMaal(t.sideD, "Side d");
      return t.sideA + t.sideB + t.sideC + t.sideD;
    }
    case "parallelogram": {
      const p = input.parallelogram;
      if (!p) return undefined;
      assertMaal(p.sideA, "Side a");
      assertMaal(p.sideB, "Side b");
      return 2 * (p.sideA + p.sideB);
    }
    case "rombe": {
      const r = input.rombe;
      if (!r) return undefined;
      assertMaal(r.side, "Siden");
      return 4 * r.side;
    }
  }
}

/** Formlen som brødtekst, med π og brøker som tegn — ikke som `Math.PI`. */
export const OMKREDS_FORMEL: Record<OmkredsFigur, string> = {
  cirkel: "π × diameter",
  kvadrat: "4 × side",
  rektangel: "2 × (længde + bredde)",
  trekant: "a + b + c",
  trapez: "a + b + c + d",
  parallelogram: "2 × (a + b)",
  rombe: "4 × side",
};

/** Hvilke felter den valgte figur har, i den rækkefølge de vises. */
export interface OmkredsFelt {
  /** Feltets navn — også nøglen i `OmkredsInput`. */
  nogle: "diameter" | "side" | "laengde" | "bredde" | "sideA" | "sideB" | "sideC" | "sideD";
  da: string;
  se: string;
}

/**
 * Felterne pr. figur. Sammenstillingen er data, fordi samme figur skal kunne
 * hedde «Side a» på dansk og «Sida a» på svensk uden at komponenten kender
 * figurerne — og fordi porten kan dømme på at kvadratet *ikke* har et
 * bredde-felt.
 */
export const OMKREDS_FELT: Record<OmkredsFigur, readonly OmkredsFelt[]> = {
  cirkel: [{ nogle: "diameter", da: "Diameter", se: "Diameter" }],
  kvadrat: [{ nogle: "side", da: "Side", se: "Sida" }],
  rektangel: [
    { nogle: "laengde", da: "Længde", se: "Längd" },
    { nogle: "bredde", da: "Bredde", se: "Bredd" },
  ],
  trekant: [
    { nogle: "sideA", da: "Side a", se: "Sida a" },
    { nogle: "sideB", da: "Side b", se: "Sida b" },
    { nogle: "sideC", da: "Side c", se: "Sida c" },
  ],
  trapez: [
    { nogle: "sideA", da: "Side a", se: "Sida a" },
    { nogle: "sideB", da: "Side b", se: "Sida b" },
    { nogle: "sideC", da: "Side c", se: "Sida c" },
    { nogle: "sideD", da: "Side d", se: "Sida d" },
  ],
  parallelogram: [
    { nogle: "sideA", da: "Side a", se: "Sida a" },
    { nogle: "sideB", da: "Side b", se: "Sida b" },
  ],
  rombe: [{ nogle: "side", da: "Side", se: "Sida" }],
};

export interface OmkredsSvar {
  figur: OmkredsFigur;
  /** Omkredsen i meter. */
  meter: number;
  /** Den samme omkreds i centimeter. */
  centimeter: number;
}

/** 1 m = 100 cm. Skrevet som konstant, så ingen side kan regne det forkert. */
export const CENTIMETER_PR_METER = 100;

/** Omkredsen i begge enheder, så ingen side skal regne cm selv. */
export function omkredsSvar(
  figur: OmkredsFigur,
  input: OmkredsInput
): OmkredsSvar | undefined {
  const meter = omkreds(figur, input);
  if (meter === undefined) return undefined;
  return { figur, meter, centimeter: meter * CENTIMETER_PR_METER };
}

/**
 * Et gennemregnet eksempel pr. figur — det samme tal i titel, FAQ og løsning.
 *
 * Uden ét fælles eksempel kan brødteksten, FAQ'en og `metaTitle` komme til at
 * vise hver sit tal, og de tre skrives i tre filer. Derfor regnes de her og
 * læses alle steder.
 */
export const OMKREDS_EKSEMPEL: Record<
  OmkredsFigur,
  { beskrivelseDa: string; beskrivelseSe: string; svar: OmkredsSvar }
> = {
  cirkel: {
    beskrivelseDa: "En cirkel med diameter 1 m",
    beskrivelseSe: "En cirkel med diameter 1 m",
    svar: { figur: "cirkel", meter: Math.PI, centimeter: Math.PI * CENTIMETER_PR_METER },
  },
  kvadrat: {
    beskrivelseDa: "Et kvadrat med side 2 m",
    beskrivelseSe: "En kvadrat med sida 2 m",
    svar: { figur: "kvadrat", meter: 8, centimeter: 800 },
  },
  rektangel: {
    beskrivelseDa: "Et rektangel på 2 × 3 m",
    beskrivelseSe: "En rektangel på 2 × 3 m",
    svar: { figur: "rektangel", meter: 10, centimeter: 1000 },
  },
  trekant: {
    beskrivelseDa: "En trekant med siderne 3, 4 og 5 m",
    beskrivelseSe: "En triangel med sidorna 3, 4 och 5 m",
    svar: { figur: "trekant", meter: 12, centimeter: 1200 },
  },
  trapez: {
    beskrivelseDa: "Et trapez med siderne 2, 4, 3 og 3 m",
    beskrivelseSe: "En trapets med sidorna 2, 4, 3 och 3 m",
    svar: { figur: "trapez", meter: 12, centimeter: 1200 },
  },
  parallelogram: {
    beskrivelseDa: "Et parallelogram med siderne 3 og 2 m",
    beskrivelseSe: "En parallellogram med sidorna 3 och 2 m",
    svar: { figur: "parallelogram", meter: 10, centimeter: 1000 },
  },
  rombe: {
    beskrivelseDa: "En rombe med side 2 m",
    beskrivelseSe: "En romb med sida 2 m",
    svar: { figur: "rombe", meter: 8, centimeter: 800 },
  },
};
