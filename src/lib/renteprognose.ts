/**
 * Renteprognose — hvad koster et boliglån om 5, 10 eller 30 år?
 *
 * En renteprognose er en **følsomhedsberegning**, ikke en forudsigelse. Den
 * spørger: hvis renten stiger eller falder X procentpoint om året, hvad så?
 * Derfor tager værktøjet renteudviklingen som et *valg* og har 0 % som
 * forudindstilling — vi gætter aldrig, hvad renten bliver (punkt 11 i
 * `_kvalitet.md`: en påstand skal kunne verificeres, og ingen offentlig kilde
 * forudsiger danske realkreditrenter).
 *
 * Renten fastsættes på ny, når lånet omlægges: en 5-årig fastrente får én
 * ny rente hvert 5. år, en variabel rente hvert år. Derfor springer rækken i
 * `RENTEOMLAEGNING_AAR`.
 *
 * Gælden udvikles måned for måned, så tallene for et år med afdrag kan ikke
 * glide fra den ydelse, der står i rækken over.
 */

export type Renteomlaegning = "variabel" | "aar1" | "aar3" | "aar5";

export type Afdragsform = "afdrag" | "afdragsfrit";

export interface RenteprognoseInput {
  /** Lånebeløb i kroner. */
  laanebeloeb: number;
  /** Nuværende årlig rente som brøkdel, fx 0,035 for 3,5 %. */
  rente: number;
  /** Løbetid i år. */
  loebetidAar: number;
  renteomlaegning: Renteomlaegning;
  /** Årlig ændring i renten som brøkdel, fx 0,01 for +1 procentpoint. */
  renteudvikling: number;
  afdragsform: Afdragsform;
}

export interface RenteprognoseAar {
  /** Året i løbetiden, 1-baseret. */
  aar: number;
  /** Den rente, der gælder hele året. */
  rente: number;
  /** Månedlig ydelse i dette år (afdragsfrit: kun rentebeløbet). */
  maanedYdelse: number;
  /** Renter betalt i året. */
  renterAaret: number;
  /** Renter betalt fra lånets start til og med udgangen af året. */
  renterAngaaende: number;
  /** Restgæld efter årets 12 måneder. */
  gaeldSlut: number;
}

export interface RenteprognoseResultat {
  aar: RenteprognoseAar[];
  /** Renter over hele løbetiden. */
  renterIAlt: number;
  /** Månedlig ydelse i det sidste år. */
  maanedSlut: number;
  /** Restgæld ved løbetidens udløb. */
  gaeldSlut: number;
  /** Antal måneder i alt. */
  maanederIAlt: number;
}

export interface ProcentScenario {
  id: "lavere" | "uaendret" | "hoeiere";
  renteudvikling: number;
  renterIAlt: number;
  maanedSlut: number;
  gaeldSlut: number;
}

/**
 * Hvor titelt lånets rente fastsættes på ny. Variabel rente og 1-årig
 * fastrente er begge 1 år i den forstand, at der er en ny rente hvert år.
 */
export const RENTEOMLAEGNING_AAR: Record<Renteomlaegning, number> = {
  variabel: 1,
  aar1: 1,
  aar3: 3,
  aar5: 5,
};

export const RENTEOMLAEGNINGER: readonly { value: Renteomlaegning; label: string }[] = [
  { value: "variabel", label: "Variabel rente" },
  { value: "aar1", label: "1-årig fastrente" },
  { value: "aar3", label: "3-årig fastrente" },
  { value: "aar5", label: "5-årig fastrente" },
];

/**
 * Renteudviklingen vælges i spring — ikke i procent med decimaler. Der findes
 * ingen kilde til "renten stiger 0,37 % om året", så værktøjet skal heller ikke
 * lade som om den gør.
 */
export const RENTEUDVIKLINGER: readonly { værdi: number; label: string }[] = [
  { værdi: -0.02, label: "2 procentpoint lavere" },
  { værdi: -0.01, label: "1 procentpoint lavere" },
  { værdi: 0, label: "Uændret" },
  { værdi: 0.01, label: "1 procentpoint højere" },
  { værdi: 0.02, label: "2 procentpoint højere" },
  { værdi: 0.03, label: "3 procentpoint højere" },
];

/** Månedlig ydelse på et annuitetslån (afdrag). */
export function maanedYdelse(gaeld: number, aarligRente: number, maaneder: number): number {
  if (gaeld <= 0 || maaneder <= 0) return 0;
  const i = aarligRente / 12;
  if (i <= 0) return gaeld / maaneder;
  return (gaeld * i) / (1 - Math.pow(1 + i, -maaneder));
}

/**
 * Den rente der gælder i år `aar` — konstant indtil næste omlægning.
 * En 5-årig fastrente med 3,5 % og +1 procentpoint om året har 3,5 % i år 1-5,
 * 4,5 % i år 6-10 og 5,5 % i år 11-15.
 */
export function renteIAaret(
  startRente: number,
  renteudvikling: number,
  aar: number,
  omlaegning: Renteomlaegning
): number {
  const interval = RENTEOMLAEGNING_AAR[omlaegning];
  const omlaegninger = Math.floor((aar - 1) / interval);
  return Math.max(0, startRente + renteudvikling * omlaegninger);
}

export function beregnRenteprognose(input: RenteprognoseInput): RenteprognoseResultat {
  const { laanebeloeb, rente, loebetidAar, renteomlaegning, renteudvikling, afdragsform } = input;
  const heleAar = Math.max(0, Math.floor(loebetidAar));
  const maanederIAlt = heleAar * 12;
  const aar: RenteprognoseAar[] = [];
  let gaeld = Math.max(0, laanebeloeb);
  let renterAngaaende = 0;

  for (let n = 1; n <= heleAar; n++) {
    const aarligRente = renteIAaret(rente, renteudvikling, n, renteomlaegning);
    const maanederIAaret = Math.min(12, maanederIAlt - (n - 1) * 12);
    const ydelse =
      afdragsform === "afdragsfrit"
        ? (gaeld * aarligRente) / 12
        : maanedYdelse(gaeld, aarligRente, maanederIAlt - (n - 1) * 12);

    let renterAaret = 0;
    for (let m = 0; m < maanederIAaret; m++) {
      const maanedsrente = gaeld * (aarligRente / 12);
      renterAaret += maanedsrente;
      if (afdragsform === "afdrag") gaeld = Math.max(0, gaeld + maanedsrente - ydelse);
    }
    renterAngaaende += renterAaret;
    aar.push({
      aar: n,
      rente: aarligRente,
      maanedYdelse: ydelse,
      renterAaret,
      renterAngaaende,
      gaeldSlut: gaeld,
    });
  }

  return {
    aar,
    renterIAlt: renterAngaaende,
    maanedSlut: aar.length > 0 ? aar[aar.length - 1].maanedYdelse : 0,
    gaeldSlut: gaeld,
    maanederIAlt,
  };
}

/** Rækken for ét år — bruges når brugeren vælger et år at se på. */
export function aarVed(r: RenteprognoseResultat, aar: number): RenteprognoseAar | undefined {
  return r.aar.find((række) => række.aar === aar);
}

/**
 * Samme lån, tre rentebaner: `afvigelse` procentpoint under og over den valgte
 * udvikling. Er den valgte udvikling 0, sammenlignes renten som den er med ±1
 * procentpoint — så er sammenligningen aldrig tre ens tal.
 */
export function procentScenarier(
  input: RenteprognoseInput,
  afvigelse = 0.01
): ProcentScenario[] {
  const byg = (id: ProcentScenario["id"], udvikling: number): ProcentScenario => {
    const res = beregnRenteprognose({ ...input, renteudvikling: udvikling });
    return {
      id,
      renteudvikling: udvikling,
      renterIAlt: res.renterIAlt,
      maanedSlut: res.maanedSlut,
      gaeldSlut: res.gaeldSlut,
    };
  };
  return [
    byg("lavere", input.renteudvikling - afvigelse),
    byg("uaendret", input.renteudvikling),
    byg("hoeiere", input.renteudvikling + afvigelse),
  ];
}