/**
 * Retvinklet trekant (Pythagoras) — som *formel og regnestykke*, ikke tal i
 * brødtekst.
 *
 * Hvorfor en side til det: dansk autocomplete (målt 7/10 på
 * `suggestqueries.google.com`, `hl=da&gl=dk`) er entydig om spørgsmålet:
 *
 * - «pythagoras» → «pythagoras beregner» og «pythagoras beregner vinkel».
 * - «retvinklet trekant» → «retvinklet trekant beregner», «… formler»,
 *   «… areal» og «… vinkler».
 * - «trekant beregner» → «trekant beregner retvinklet», «… formel», «… areal»,
 *   «… grader» og «ligebenet trekant beregner».
 *
 * Siden er den naturlige søster til `/areal` (arealet af de samme figurer) og
 * `/omkreds`: retvinklet trekant er den ene figur, hvor læseren kan have to
 * sider og mangle den tredje. Formlen er Pythagoras' læresætning, a² + b² = c²,
 * og den er skolematematikkens, så den er prøvet mod kendte tripler i
 * `retvinklet-trekant.test.ts` (3-4-5, 5-12-13, 8-15-17 og den ligebenede
 * 1-1-√2).
 *
 * To ting står frem over resten: **vinklen** (autocomplete spørger direkte om
 * «beregner vinkel») og **hypotenusen** (den lange side, modsat den rette
 * vinkel — den side folk blander sammen med en katete).
 */
import { MAX_MAAL_M, MIN_MAAL_M } from "./areal";

/** Grænserne for en side, i meter — de samme som `/areal` bruger. */
export { MAX_MAAL_M, MIN_MAAL_M } from "./areal";

/** De tre sider i en retvinklet trekant. `a` og `b` er kateter, `c` hypotenusen. */
export type RetvinkletSide = "a" | "b" | "c";

/**
 * Input til løseren. Skriv **to** af de tre sider; den tredje regnes ud.
 * `undefined` betyder «feltet er ikke udfyldt».
 */
export interface RetvinkletInput {
  a?: number;
  b?: number;
  c?: number;
}

export interface RetvinkletSvar {
  /** Katete a, i meter. */
  a: number;
  /** Katete b, i meter. */
  b: number;
  /** Hypotenusen c, i meter. */
  c: number;
  /** Arealet, i m² — (a × b) ÷ 2. */
  areal: number;
  /** Omkredsen, i meter — a + b + c. */
  omkreds: number;
  /** Vinklen modsat katete a, i grader. */
  vinkelA: number;
  /** Vinklen modsat katete b, i grader. */
  vinkelB: number;
  /** Den rette vinkel. Altid 90. */
  vinkelC: 90;
  /** Hvilken side der blev regnet ud, så værktøjet kan fremhæve den. */
  udregnet: RetvinkletSide;
  /** Regnestykket som brødtekst, fx «3² + 4² = 25, √25 = 5». */
  regnestykke: string;
}

function assertSide(vaerdi: number | undefined, navn: string): number {
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
  return vaerdi;
}

/** Et tal som brødtekst uden unødige decimaler — til regnestykket. */
function pæntTal(vaerdi: number): string {
  return Number.isInteger(vaerdi) ? String(vaerdi) : vaerdi.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Løser en retvinklet trekant ud fra to kendte sider.
 *
 * - To kateter (a, b): hypotenusen er √(a² + b²).
 * - Katete og hypotenuse (a, c) eller (b, c): den anden katete er
 *   √(c² − katete²). Hypotenusen skal være den længste side.
 *
 * Returnerer `undefined`, hvis færre end to sider er udfyldt. Kaster, hvis en
 * side er uden for grænserne, eller hvis hypotenusen ikke er længst — det er
 * en umulig trekant, og værktøjet skal vise «skriv et tal» og ikke et svar.
 */
export function loesRetvinklet(input: RetvinkletInput): RetvinkletSvar | undefined {
  const udfyldt = (["a", "b", "c"] as RetvinkletSide[]).filter(
    (side) => typeof input[side] === "number"
  );
  if (udfyldt.length < 2) return undefined;

  if (input.a !== undefined) assertSide(input.a, "Katete a");
  if (input.b !== undefined) assertSide(input.b, "Katete b");
  if (input.c !== undefined) assertSide(input.c, "Hypotenusen c");

  let a: number;
  let b: number;
  let c: number;
  let udregnet: RetvinkletSide;
  let regnestykke: string;

  if (udfyldt.length === 3) {
    // Alle tre sider er udfyldt. De skal passe med Pythagoras, ellers er det
    // ikke en retvinklet trekant, og et svar ville være forkert.
    a = input.a!;
    b = input.b!;
    c = input.c!;
    if (Math.abs(a * a + b * b - c * c) > 1e-6 * Math.max(1, c * c)) {
      throw new Error("De tre sider passer ikke med Pythagoras: a² + b² skal give c²");
    }
    udregnet = "c";
    regnestykke = `${pæntTal(a)}² + ${pæntTal(b)}² = ${pæntTal(c)}²`;
  } else if (input.a !== undefined && input.b !== undefined) {
    a = input.a;
    b = input.b;
    c = Math.hypot(a, b);
    udregnet = "c";
    regnestykke = `${pæntTal(a)}² + ${pæntTal(b)}² = ${pæntTal(a * a + b * b)}, √${pæntTal(a * a + b * b)} = ${pæntTal(c)}`;
  } else if (input.a !== undefined && input.c !== undefined) {
    c = input.c;
    a = input.a;
    if (c <= a) {
      throw new Error(`Hypotenusen (${c}) skal være længere end katete a (${a})`);
    }
    b = Math.sqrt(c * c - a * a);
    udregnet = "b";
    regnestykke = `${pæntTal(c)}² − ${pæntTal(a)}² = ${pæntTal(c * c - a * a)}, √${pæntTal(c * c - a * a)} = ${pæntTal(b)}`;
  } else if (input.b !== undefined && input.c !== undefined) {
    c = input.c;
    b = input.b;
    if (c <= b) {
      throw new Error(`Hypotenusen (${c}) skal være længere end katete b (${b})`);
    }
    a = Math.sqrt(c * c - b * b);
    udregnet = "a";
    regnestykke = `${pæntTal(c)}² − ${pæntTal(b)}² = ${pæntTal(c * c - b * b)}, √${pæntTal(c * c - b * b)} = ${pæntTal(a)}`;
  } else {
    // Kan ikke ske: færre end to sider er allerede afvist ovenfor, og med
    // præcis to udfyldte rammer mindst ét af parrene ovenfor. Kaster, så en
    // fremtidig ændring ikke kan efterlade a, b eller c udefineret.
    throw new Error("Udfyld to af de tre sider");
  }

  const vinkelA = (Math.atan2(a, b) * 180) / Math.PI;
  const vinkelB = 90 - vinkelA;

  return {
    a,
    b,
    c,
    areal: (a * b) / 2,
    omkreds: a + b + c,
    vinkelA,
    vinkelB,
    vinkelC: 90,
    udregnet,
    regnestykke,
  };
}

/** Hypotenusen ud fra de to kateter — selve Pythagoras. */
export function pythagoras(a: number, b: number): number {
  return Math.hypot(a, b);
}

/** Formlerne som brødtekst, med ² og √ som tegn — ikke som `Math`. */
export const RETVINKLET_FORMEL = {
  hypotenuse: "c = √(a² + b²)",
  katete: "a = √(c² − b²)",
  areal: "areal = (a × b) ÷ 2",
  omkreds: "omkreds = a + b + c",
  vinkel: "A = tan⁻¹(a ÷ b), B = 90° − A",
} as const;

export interface RetvinkletFelt {
  /** Feltets navn — også nøglen i `RetvinkletInput`. */
  nogle: RetvinkletSide;
  da: string;
  se: string;
  /** Hjælpeteksten under feltet. */
  hjaelpDa: string;
  hjaelpSe: string;
}

/**
 * Felterne i den rækkefølge de vises. Sammenstillingen er data, fordi samme
 * felt skal hedde «Katete a» på dansk og «Katet a» på svensk, og fordi porten
 * kan dømme på at hypotenusen er mærket som den lange side.
 */
export const RETVINKLET_FELT: readonly RetvinkletFelt[] = [
  {
    nogle: "a",
    da: "Katete a",
    se: "Katet a",
    hjaelpDa: "Den ene af de to korte sider",
    hjaelpSe: "En av de två korta sidorna",
  },
  {
    nogle: "b",
    da: "Katete b",
    se: "Katet b",
    hjaelpDa: "Den anden korte side",
    hjaelpSe: "Den andra korta sidan",
  },
  {
    nogle: "c",
    da: "Hypotenuse c",
    se: "Hypotenusa c",
    hjaelpDa: "Den længste side — modsat den rette vinkel",
    hjaelpSe: "Den längsta sidan — mittemot den räta vinkeln",
  },
] as const;

/**
 * Et gennemregnet eksempel — det samme tal i titel, FAQ og løsning. Det er den
 * klassiske 3-4-5-trekant, som enhver kan efterprøve i hovedet.
 */
export const RETVINKLET_EKSEMPEL = {
  input: { a: 3, b: 4 } satisfies RetvinkletInput,
  svar: loesRetvinklet({ a: 3, b: 4 })!,
};
