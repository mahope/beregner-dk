/**
 * Rumfang (volumen) i meter — som *formler med kilde*, ikke tal i brødtekst.
 *
 * Hvorfor en side til det: `/kvadratmeter` regner **areal** (m²) og har 21.403
 * GSC-visninger på 1,5 % CTR og position 4,9 (målt 5/10) — altså beviset på
 * at matematik-siderne her konverterer. Rumfang er det andet spørgsmål, og
 * dansk autocomplete (målt 6/10 00:2x på `suggestqueries.google.com`,
 * `hl=da&gl=dk`) er entydig om det:
 *
 * - «hvordan beregner man rumfang» → **10 af 10** træffere er en figur:
 *   kasse, cylinder, kugle, pyramide, prism(e), kegle, cirkel.
 * - «beregn rumfang» → 10 af 10: cylinder, kasse, kugle, cirkel, trekant,
 *   prisme, kegle, keglestub, m³, liter.
 * - «rumfang cylinder» → «cylinder formel», «cylinder beregner»,
 *   «cylinder liter», «med diameter».
 *
 * To ting står frem over resten af træffene: **diameter** (ikke radius) og
 * **liter** (ikke kun m³). Derfor tager værktøjet diameter og viser begge
 * enheder — en cylinder opgivet med diameter er den hyppigste fejlkilde.
 *
 * Formlerne er skolematematikkens, så de er prøvet mod kendte tal i
 * `rumfang.test.ts` (terning, kugle med r = 1 m, kegle = 1/3 cylinder).
 */

/** De figurer værktøjet regner på. */
export type Rummelig = "kasse" | "cylinder" | "kugle" | "kegle" | "pyramide";

/** Ét input pr. figur, i meter. Uden brug er værdien `undefined`. */
export interface RumfangInput {
  kasse?: { laengde: number; bredde: number; hoejde: number };
  cylinder?: { diameter: number; hoejde: number };
  kugle?: { diameter: number };
  kegle?: { diameter: number; hoejde: number };
  pyramide?: { grundside: number; hoejde: number };
}

/** 1 m³ = 1.000 liter. Skrevet som konstant, så ingen side kan regne det forkert. */
export const LITER_PR_KUBIKMETER = 1000;

/**
 * Mindste mål værktøjet accepterer, i meter.
 *
 * Uden en bund er et felt på 0,0001 m et kuglerumfang på 5 × 10⁻¹³ m³, som
 * formatteres til «0 m³» — et tal der ser rigtigt ud og er værdiløst. En læser
 * der skriver 0,2 cm i stedet for 20 cm får derfor en fejl, ikke et svar.
 */
export const MIN_MAAL_M = 0.01;

/** Største mål, i meter. Sætter en rampe på `Number.MAX_SAFE_INTEGER`-tabeller. */
export const MAX_MAAL_M = 1000;

function assertMaal(vaerdi: number | undefined, navn: string): void {
  if (typeof vaerdi !== "number" || !Number.isFinite(vaerdi) || vaerdi < MIN_MAAL_M || vaerdi > MAX_MAAL_M) {
    throw new Error(`${navn} skal være et tal mellem ${MIN_MAAL_M} og ${MAX_MAAL_M} meter: ${String(vaerdi)}`);
  }
}

/** Arealet af en cirkel med den angivne diameter, i m². */
function cirkelAreal(diameterM: number): number {
  const r = diameterM / 2;
  return Math.PI * r * r;
}

/** Rumfang i m³ for én figur, eller `undefined` hvis inputtet mangler. */
export function rumfang(figur: Rummelig, input: RumfangInput): number | undefined {
  switch (figur) {
    case "kasse": {
      const k = input.kasse;
      if (!k) return undefined;
      assertMaal(k.laengde, "Længden");
      assertMaal(k.bredde, "Bredden");
      assertMaal(k.hoejde, "Højden");
      return k.laengde * k.bredde * k.hoejde;
    }
    case "cylinder": {
      const c = input.cylinder;
      if (!c) return undefined;
      assertMaal(c.diameter, "Diameteren");
      assertMaal(c.hoejde, "Højden");
      return cirkelAreal(c.diameter) * c.hoejde;
    }
    case "kugle": {
      const k = input.kugle;
      if (!k) return undefined;
      assertMaal(k.diameter, "Diameteren");
      return (4 / 3) * Math.PI * (k.diameter / 2) ** 3;
    }
    case "kegle": {
      const k = input.kegle;
      if (!k) return undefined;
      assertMaal(k.diameter, "Diameteren");
      assertMaal(k.hoejde, "Højden");
      return (1 / 3) * cirkelAreal(k.diameter) * k.hoejde;
    }
    case "pyramide": {
      const p = input.pyramide;
      if (!p) return undefined;
      assertMaal(p.grundside, "Grundsiden");
      assertMaal(p.hoejde, "Højden");
      // Kvadratisk pyramide: grundarealet er s², og højden er mindre end sidelængden.
      return (1 / 3) * p.grundside * p.grundside * p.hoejde;
    }
  }
}

/** Formlen som brødtekst, med π og ⅓ som tegn — ikke som `Math.PI`. */
export const RUMFANG_FORMEL: Record<Rummelig, string> = {
  kasse: "L × B × H",
  cylinder: "π × (d ÷ 2)² × H",
  kugle: "(4 ÷ 3) × π × (d ÷ 2)³",
  kegle: "(1 ÷ 3) × π × (d ÷ 2)² × H",
  pyramide: "(1 ÷ 3) × grundside² × H",
};

/** Hvilke felter den valgte figur har, i den rækkefølge de vises. */
export interface RumfangFelt {
  /** Feltets navn — også nøglen i `RumfangInput`. */
  nogle: "laengde" | "bredde" | "hoejde" | "diameter" | "grundside";
  da: string;
  se: string;
}

/**
 * Felterne pr. figur. Sammenstillingen er data, fordi samme figur skal kunne
 * hedde «Diameter» på dansk og «Diameter» på svensk uden at komponenten kender
 * figurerne — og fordi porten kan dømme på at kuglen *ikke* har et højdefelt.
 */
export const RUMFANG_FELT: Record<Rummelig, readonly RumfangFelt[]> = {
  kasse: [
    { nogle: "laengde", da: "Længde", se: "Längd" },
    { nogle: "bredde", da: "Bredde", se: "Bredd" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
  cylinder: [
    { nogle: "diameter", da: "Diameter", se: "Diameter" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
  kugle: [{ nogle: "diameter", da: "Diameter", se: "Diameter" }],
  kegle: [
    { nogle: "diameter", da: "Diameter", se: "Diameter" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
  pyramide: [
    { nogle: "grundside", da: "Grundside", se: "Grundside" },
    { nogle: "hoejde", da: "Højde", se: "Höjd" },
  ],
};

export interface RumfangSvar {
  figur: Rummelig;
  /** Rumfanget i m³. */
  kubikmeter: number;
  /** Det samme rumfang i liter. */
  liter: number;
}

/** Rumfanget i begge enheder, så ingen side skal regne literen selv. */
export function rumfangSvar(figur: Rummelig, input: RumfangInput): RumfangSvar | undefined {
  const kubikmeter = rumfang(figur, input);
  if (kubikmeter === undefined) return undefined;
  return { figur, kubikmeter, liter: kubikmeter * LITER_PR_KUBIKMETER };
}

/**
 * Et gennemregnet eksempel pr. figur — det samme tal i titel, FAQ og løsning.
 *
 * Uden ét fælles eksempel kan brødteksten, FAQ'en og `metaTitle` komme til at
 * vise hver sit tal, og de tre skrives i tre filer. Derfor regnes de her og
 * læses alle steder.
 */
export const RUMFANG_EKSEMPEL: Record<Rummelig, { beskrivelseDa: string; beskrivelseSe: string; svar: RumfangSvar }> = {
  kasse: {
    beskrivelseDa: "En kasse på 2 × 1 × 0,5 m",
    beskrivelseSe: "En låda på 2 × 1 × 0,5 m",
    svar: { figur: "kasse", kubikmeter: 1, liter: 1000 },
  },
  cylinder: {
    beskrivelseDa: "En cylinder med diameter 1 m og højde 2 m",
    beskrivelseSe: "En cylinder med diameter 1 m och höjd 2 m",
    svar: { figur: "cylinder", kubikmeter: Math.PI / 2, liter: (Math.PI / 2) * LITER_PR_KUBIKMETER },
  },
  kugle: {
    beskrivelseDa: "En kugle med diameter 1 m",
    beskrivelseSe: "En sfär med diameter 1 m",
    svar: { figur: "kugle", kubikmeter: (4 / 3) * Math.PI * 0.125, liter: ((4 / 3) * Math.PI * 0.125) * LITER_PR_KUBIKMETER },
  },
  kegle: {
    beskrivelseDa: "En kegle med diameter 1 m og højde 2 m",
    beskrivelseSe: "En kon med diameter 1 m och höjd 2 m",
    svar: { figur: "kegle", kubikmeter: Math.PI / 6, liter: (Math.PI / 6) * LITER_PR_KUBIKMETER },
  },
  pyramide: {
    beskrivelseDa: "En pyramide med grundside 2 m og højde 3 m",
    beskrivelseSe: "En pyramid med grundside 2 m och höjd 3 m",
    svar: { figur: "pyramide", kubikmeter: 4, liter: 4000 },
  },
};