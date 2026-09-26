import {
  beregnPromille,
  GRAM_PR_GENSTAND,
  PROMILLEGRANSE,
  type Koen,
} from "./promille";

export interface PromilleEksempel {
  genstande: number;
  vaegtKg: number;
  koen: Koen;
  timerSiden: number;
  promille: number;
  timerTilGraenseDa: number;
  timerTilGraenseSe: number;
  timerTilNul: number;
  bemaerkning: { da: string; se: string };
}

interface PromilleEksempelRaat {
  genstande: number;
  vaegtKg: number;
  koen: Koen;
  timerSiden: number;
  bemaerkning: { da: string; se: string };
}

/**
 * De gennemgående eksempler på /promille. Hvert tal er beregnet af
 * `beregnPromille` — det samme modul som værktøjet bruger — og hver række
 * bærer begge lovgrænser, så tabellen kan vise dansk 0,5 ‰ og svensk 0,2 ‰
 * uden at nogen tekst kan love et tal, logikken modsiger.
 */
const raat: PromilleEksempelRaat[] = [
  {
    genstande: 4,
    vaegtKg: 80,
    koen: "mand",
    timerSiden: 0,
    bemaerkning: {
      da: "Det eksempel, der står i sidens beskrivelse. Helt samme tal som værktøjet viser, når du bare skriver 4, 80 og mand ind.",
      se: "Exemplet som står i sidans beskrivning. Exakt samma siffror som kalkylatorn visar när du bara fyller i 4, 80 och man.",
    },
  },
  {
    genstande: 4,
    vaegtKg: 80,
    koen: "mand",
    timerSiden: 2,
    bemaerkning: {
      da: "Samme aften, to timer senere. Du kan ligge under grænsen længe, før du er helt ædru — her er det kun 0,6 time tilbage.",
      se: "Samma kväll, två timmar senare. Du kan ligga under gränsen länge innan du är helt nykter — här är det bara 0,6 timme kvar.",
    },
  },
  {
    genstande: 2,
    vaegtKg: 60,
    koen: "kvinde",
    timerSiden: 0,
    bemaerkning: {
      da: "To genstande lyder overfladisk, men fordelingsfaktoren er lavere for kvinder, så promillen bliver hoejere end for en mand med samme vaegt.",
      se: "Två standardglas låter overfladiska, men fördelningsfaktorn är lägre för kvinnor, så promillen blir högre än för en man med samma vikt.",
    },
  },
  {
    genstande: 6,
    vaegtKg: 70,
    koen: "mand",
    timerSiden: 0,
    bemaerkning: {
      da: "Seks genstande er over 2,0 promillegrænsen, hvor man som udgangspunkt mister kørekortet ubetinget. Det er her opgøret med at være helt ædru bliver langt.",
      se: "Sex standardglas är över 2,0 promillegränsen, där man som utgångspunkt förlorar körkortet ovillkorligt. Det är här väntan på att bli helt nykter blir lång.",
    },
  },
];

export const PROMILLE_EKSEAMPLER: PromilleEksempel[] = raat.map((r) => {
  const da = beregnPromille(r.genstande, r.vaegtKg, r.koen, r.timerSiden, PROMILLEGRANSE.da);
  const se = beregnPromille(r.genstande, r.vaegtKg, r.koen, r.timerSiden, PROMILLEGRANSE.se);
  if (!da || !se) {
    throw new Error(
      `Promille-eksemplet ${r.genstande} genstande / ${r.vaegtKg} kg kan ikke beregnes af beregnPromille`
    );
  }
  return {
    ...r,
    promille: da.promille,
    timerTilGraenseDa: da.timerTilGraense,
    timerTilGraenseSe: se.timerTilGraense,
    timerTilNul: da.timerTilNul,
  };
});

/** "0,88" — dansk og svensk bruger komma, og det samme tal skal skrives ens. */
export function formatPromille(promille: number): string {
  return promille.toFixed(2).replace(".", ",");
}

/** "2,6 timer" / "2,6 timmar" — ental ved 1, som alder-eksemplerne gør. */
export function formatTimer(timer: number, locale: "da" | "se"): string {
  const enhed = locale === "se" ? (timer === 1 ? "timme" : "timmar") : timer === 1 ? "time" : "timer";
  return `${timer.toFixed(1).replace(".", ",")} ${enhed}`;
}

/** "4 øl" / "4 öl" — antallet og enheden i den tekst, der bruges i tabellen. */
export function formatGenstande(
  genstande: number,
  locale: "da" | "se"
): { antal: string; enhed: string } {
  const antal =
    locale === "se"
      ? new Intl.NumberFormat("sv-SE").format(genstande)
      : new Intl.NumberFormat("da-DK").format(genstande);
  return { antal, enhed: locale === "se" ? "standardglas" : "genstande" };
}

/** Gram ren alkohol, så en læser kan se hvor den samme promille regnes frem. */
export function formatGram(genstande: number): string {
  return `${genstande * GRAM_PR_GENSTAND} g`;
}
