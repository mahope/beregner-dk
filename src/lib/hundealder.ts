/**
 * Hundeår til menneskeår — som *regler med kilde*, ikke tal i brødtekst.
 *
 * Hvorfor en side til det: dansk autocomplete (målt 7/10 på
 * `suggestqueries.google.com`, `hl=da&gl=dk`) svarer «hvor gammel er hunden i
 * menneskeår», «hund alder i menneskeår» og «hvor gammel er min hund i
 * menneskeår», og det svenske forslag er «hund alder i menneskeår» og
 * «kalkulator alder hund». Sitet havde `/alder` (menneskets alder), men intet
 * sted der omregnede en hunds alder.
 *
 * Metoden er den, AVMA og AKC bruger, og som de fleste veterinære kilder
 * gentager: det første hundår er ca. 15 menneskeår, det andet lægger 9 til
 * (altså 24 efter to år), og hvert år derefter lægger 4-7 menneskeår til
 * afhængigt af hundens størrelse. Den gamle «×7»-regel er forkert, fordi hunde
 * ældes hurtigst i de første to år, og fordi store hunde ældes hurtigere end
 * små. Kilde: AVMA via akc.org/expert-advice/health/how-to-calculate-dog-years-to-human-years
 * (læst 7/10 2026) og den størrelsesopdelte tabel (4/5/6/7) samme sted.
 *
 * Tallene er skolematematik og prøvet mod den offentliggjorte tabel i
 * `hundealder.test.ts` (fx 10 år stor = 72, 10 år kæmpe = 80).
 */

/** De fire størrelsesklasser værktøjet regner på. */
export type HundeStorrelse = "lille" | "mellem" | "stor" | "kaempe";

export interface HundeStorrelseInfo {
  da: string;
  se: string;
  /** Vægtbåndet som brødtekst, dansk. */
  vaegtDa: string;
  /** Vægtbåndet som brødtekst, svensk. */
  vaegtSe: string;
  /** Menneskeår pr. hundår efter det andet år. */
  aarEfterTo: number;
  /** Alder i hundår, hvor hunden regnes som senior. */
  seniorAar: number;
}

/**
 * Vægtbåndene er AKC's (under 20 lb / 21-50 lb / 51-90 lb / over 90 lb) skrevet
 * om til hele kilo, så grænsen er til at huske. `aarEfterTo` og `seniorAar` er
 * de tal, AVMA og AKC angiver: store hunde ældes hurtigere efter to år og
 * regnes som seniorer tidligere (5-6 år mod 7 for små).
 */
export const HUNDE_STORRELSER: Record<HundeStorrelse, HundeStorrelseInfo> = {
  lille: {
    da: "Lille",
    se: "Liten",
    vaegtDa: "under 10 kg",
    vaegtSe: "under 10 kg",
    aarEfterTo: 4,
    seniorAar: 7,
  },
  mellem: {
    da: "Mellem",
    se: "Mellan",
    vaegtDa: "10-25 kg",
    vaegtSe: "10-25 kg",
    aarEfterTo: 5,
    seniorAar: 7,
  },
  stor: {
    da: "Stor",
    se: "Stor",
    vaegtDa: "25-45 kg",
    vaegtSe: "25-45 kg",
    aarEfterTo: 6,
    seniorAar: 6,
  },
  kaempe: {
    da: "Kæmpe",
    se: "Jätte",
    vaegtDa: "over 45 kg",
    vaegtSe: "över 45 kg",
    aarEfterTo: 7,
    seniorAar: 5,
  },
};

/** Rækkefølgen knapperne og tabellen vises i — fra mindst til størst. */
export const HUNDE_STORRELSE_ORDER: readonly HundeStorrelse[] = [
  "lille",
  "mellem",
  "stor",
  "kaempe",
];

/** Den størrelse værktøjet starter på. Ligger her, så komponenten ikke gentager ordet. */
export const HUNDE_STANDARD_STORRELSE: HundeStorrelse = "mellem";

/** Det første hundår i menneskeår. Fast for alle størrelser. */
export const AAR_1_I_MENNESKEAAR = 15;

/** Hundens alder efter to år, i menneskeår (15 + 9). */
export const AAR_2_I_MENNESKEAAR = 24;

/** Hvad det andet hundår lægger til det første. */
export const AAR_2_TILLAEG = AAR_2_I_MENNESKEAAR - AAR_1_I_MENNESKEAAR;

/** Mindste og største hundealder værktøjet tager imod, i år. */
export const MIN_HUNDE_AAR = 0;
export const MAX_HUNDE_AAR = 30;

function assertHundAar(hundAar: number): void {
  if (
    typeof hundAar !== "number" ||
    !Number.isFinite(hundAar) ||
    hundAar < MIN_HUNDE_AAR ||
    hundAar > MAX_HUNDE_AAR
  ) {
    throw new Error(
      `Hundealderen skal være et tal mellem ${MIN_HUNDE_AAR} og ${MAX_HUNDE_AAR} år: ${String(hundAar)}`
    );
  }
}

function assertStorrelse(storrelse: HundeStorrelse): HundeStorrelseInfo {
  const info = HUNDE_STORRELSER[storrelse];
  if (!info) {
    throw new Error(`Ukendt hundestørrelse: ${String(storrelse)}`);
  }
  return info;
}

/**
 * Hundens alder i menneskeår.
 *
 * Stykket sammen af de tre led, AVMA angiver: `15 × alder` i det første år,
 * derefter `15 + 9 × (alder − 1)` frem til to år, og til sidst
 * `24 + aarEfterTo × (alder − 2)`. De to første led er lineære, så en hund på
 * et halvt år giver 7,5 — den samme interpolation de offentliggjorte tabeller
 * bruger mellem hele år.
 */
export function menneskeAar(hundAar: number, storrelse: HundeStorrelse): number {
  assertHundAar(hundAar);
  const info = assertStorrelse(storrelse);
  if (hundAar <= 1) return hundAar * AAR_1_I_MENNESKEAAR;
  if (hundAar <= 2) return AAR_1_I_MENNESKEAAR + (hundAar - 1) * AAR_2_TILLAEG;
  return AAR_2_I_MENNESKEAAR + (hundAar - 2) * info.aarEfterTo;
}

/** De fire livsfaser, værktøjet navngiver. */
export type HundeLivsfase = "hvalp" | "unghund" | "voksen" | "senior";

export const LIVSFASE_NAVN: Record<HundeLivsfase, { da: string; se: string }> = {
  hvalp: { da: "Hvalp", se: "Valp" },
  unghund: { da: "Unghund", se: "Ung hund" },
  voksen: { da: "Voksen", se: "Vuxen" },
  senior: { da: "Senior", se: "Senior" },
};

/**
 * Livsfasen ud fra alderen. Grænsen mellem voksen og senior følger AVMA's
 * tommelfingerregel: små hunde er seniorer ved 7 år, store allerede ved 5-6.
 */
export function livsfase(hundAar: number, storrelse: HundeStorrelse): HundeLivsfase {
  assertHundAar(hundAar);
  const info = assertStorrelse(storrelse);
  if (hundAar < 1) return "hvalp";
  if (hundAar < 2) return "unghund";
  if (hundAar < info.seniorAar) return "voksen";
  return "senior";
}

export interface HundealderSvar {
  hundAar: number;
  storrelse: HundeStorrelse;
  menneskeAar: number;
  livsfase: HundeLivsfase;
}

/** Hele svaret i ét kald, så værktøjet ikke skal kalde tre funktioner. */
export function hundealderSvar(
  hundAar: number,
  storrelse: HundeStorrelse
): HundealderSvar {
  return {
    hundAar,
    storrelse,
    menneskeAar: menneskeAar(hundAar, storrelse),
    livsfase: livsfase(hundAar, storrelse),
  };
}

/** Aldrene i tabellen på siden. Stopper ved 15, hvor de fleste store hunde er væk. */
export const HUNDE_TABEL_AAR: readonly number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
];

/**
 * Et gennemregnet eksempel — det samme tal i titel, FAQ og løsning.
 *
 * Uden ét fælles eksempel kan `metaTitle`, brødteksten og FAQ'en vise hver sit
 * tal, og de skrives i tre filer. Derfor regnes det her og læses alle steder.
 */
export const HUNDEALDER_EKSEMPEL = {
  hundAar: 7,
  storrelse: "mellem" as HundeStorrelse,
  menneskeAar: menneskeAar(7, "mellem"),
  livsfase: livsfase(7, "mellem"),
};

/**
 * Regnestykket bag svaret, som brødtekst, fx «15 + 9 + 5 × 5 = 49».
 *
 * Så læseren kan se, hvor tallet kommer fra, i stedet for at skulle tro på det.
 */
export function regnestykke(hundAar: number, storrelse: HundeStorrelse): string {
  assertHundAar(hundAar);
  const info = assertStorrelse(storrelse);
  if (hundAar <= 1) {
    return `15 × ${rund(hundAar)} = ${rund(menneskeAar(hundAar, storrelse))}`;
  }
  if (hundAar <= 2) {
    return `15 + 9 × ${rund(hundAar - 1)} = ${rund(menneskeAar(hundAar, storrelse))}`;
  }
  return `15 + 9 + ${info.aarEfterTo} × ${rund(hundAar - 2)} = ${rund(menneskeAar(hundAar, storrelse))}`;
}

function rund(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
}

/**
 * FAQ-svaret på «hvor gammel er en hund på N år i menneskeår?».
 *
 * Tallet læses fra `menneskeAar`, så svaret ikke kan komme til at vise noget
 * andet end værktøjet og tabellen oven over det.
 */
export function hundealderFaqSvar(hundAar: number, storrelse: HundeStorrelse): string {
  const info = HUNDE_STORRELSER[storrelse];
  const aar = rund(menneskeAar(hundAar, storrelse));
  const navn = info?.da ?? "mellem";
  const vaegt = info?.vaegtDa ?? "10-25 kg";
  return (
    `En ${navn.toLowerCase()} hund (${vaegt}) på ${rund(hundAar)} år er ca. ${aar} menneskeår. ` +
    `Regnestykket er ${regnestykke(hundAar, storrelse)}.`
  );
}
