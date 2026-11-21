/**
 * Aldersopsparing 2026 — hvor meget må du indbetale, og hvad får du ud?
 *
 * Hvert tal i modulet er læst direkte af kilden under `ALDERSOPSPARING_KILDER`
 * den 11. oktober 2026. Der er ingen regel, der er beregnet eller gættet:
 * beløbsgrænserne er fastsatte beløb, PAL-satsen er den sats pensionsselskabet
 * selv beregner og indbetaler, og afgifterne på overindbetaling er skat.dk's
 * egne procentsatser.
 *
 * Den vigtigste regel at have med er den, folk søger sig til og ikke finder:
 * **der er intet fradrag ved indbetaling.** «aldersopsparing skattefradrag» er
 * en selvstændig søgeforespørgsel, hvis svar er nej — pengene indbetales
 * allerede beskattet, og skattefordelen kommer først ved udbetalingen, der er
 * skatte- og afgiftsfri. Modulet siger det i brysttone, og siden citerer det.
 *
 * Projektionen (`beregnAldersopsparing`) er ren aritmetik på de satser, der
 * står ovenfor. Den viser afkastet både før og efter PAL-skat, så
 * «aldersopsparing skat af afkast» får et tal i stedet for et flueøje, og
 * sidste linje er beløbet, der faktisk kommer ud — udbetalt skattefrit.
 */

export const ALDERSOPSPARING_KILDER = {
  beloebsgraenser:
    "https://skat.dk/borger/pension-og-efterloen/aldersopsparing-og-aldersforsikring — «Alle kan indbetale grundbeløbet på 9.900 kr. i 2026 (9.400 kr. i 2025)» og «Når du har maks. 7 år til din folkepensionsalder, kan du indbetale 64.200 kr. i 2026 (61.200 kr. i 2025)»",
  beloebsgraenserDrift:
    "https://info.skat.dk/data.aspx?oid=2090384 (C.A.10.2.6.3.3.1) — «Beløbsgrænsen på 9.900 kr.» (PBL § 16, stk. 1) og «Beløbsgrænsen på 64.200 kr. (2025: 61.200 kr.)» (PBL § 16, stk. 2)",
  afgift:
    "https://skat.dk/borger/pension-og-efterloen/aldersopsparing-og-aldersforsikring — «Afgiften er på 20 %, når du har mere end 7 år til folkepensionsalderen. Afgiften er på 40 %, når du har mindre end 7 år til folkepensionsalderen eller modtager udbetalinger fra visse pensionsordninger (10 års-reglen)»",
  afkast:
    "https://info.skat.dk/data.aspx?oid=2090375 (C.A.10.2.6.1.1) — «Afkastet af aldersforsikring og -opsparing beskattes efter PAL med 15,3 pct.», og skat.dk: «Du betaler hvert år 15,3 % i skat af renterne (afkastet) af din aldersopsparing»",
  udbetaling:
    "https://info.skat.dk/data.aspx?oid=2090377 (C.A.10.2.6.1.3) — aldersopsparing kan aftales udbetalt som engangsydelse, delvise udbetalinger eller rater; udbetalingen skal være påbegyndt senest første policedag 20 år efter pensionsudbetalingsalderen",
  pensionsudbetalingsalder:
    "https://skat.dk/borger/pension-og-efterloen/aldersopsparing-og-aldersforsikring — pensionsudbetalingsalderen stiger fra 60 år ved fødsel før 1. januar 1959 til 65 år ved fødsel fra 1. januar 1967",
} as const;

export const ALDERSOPSPARING_2026 = {
  verifiedAt: "2026-10-11",

  /** Grundbeløbet alle kan indbetale afgiftsfrit. */
  grundbeloeb: 9900,
  /** Det forhøjede beløb fra det syvende indkomstår før folkepensionsalderen. */
  hoejtBeloeb: 64200,
  /** Antal år til folkepensionsalderen, hvor det høje beløb slår til. */
  hoejtBeloebAar: 7,

  /** PAL-skat på afkastet. Pensionsselskabet beregner og indbetaler den. */
  palSats: 0.153,
  /** Afgift af indbetaling over den grænse, du er omfattet af. */
  afgiftOverGrundbeloeb: 0.2,
  afgiftOverHoejtBeloeb: 0.4,

  /** År efter pensionsudbetalingsalderen, hvor udbetaling senest skal begynde. */
  senesteUdbetalingEfterAlderAar: 20,
  /** Skattekoden SKAT registrerer ordningen med. */
  skattekode: "33",
} as const;

/**
 * Aldersopsparingen giver intet fradrag ved indbetaling. Konstanten er med, for
 * at undgå at nogen senere skriver en formel, der indfører et.
 */
export const ALDERSOPSPARING_FRADRAG = 0;

/**
 * Pensionsudbetalingsalderen for en ordning oprettet 1. januar 2018 eller
 * senere. Alderen stiger i halve år i de tidligste årgange, fordi
 * folkepensionsalderen ikke flyttede sig med hele år dengang.
 */
export interface PensionsudbetalingsalderKohort {
  fra: string;
  til: string | null;
  alderTekst: string;
}

export const PENSIONSUDBETALINGSALDER: readonly PensionsudbetalingsalderKohort[] = [
  { fra: "Før 1. januar 1959", til: null, alderTekst: "60 år" },
  { fra: "1. januar 1959", til: "30. juni 1959", alderTekst: "60 ½ år" },
  { fra: "1. juli 1959", til: "31. december 1959", alderTekst: "61 år" },
  { fra: "1. januar 1960", til: "30. juni 1960", alderTekst: "61 ½ år" },
  { fra: "1. juli 1960", til: "31. december 1962", alderTekst: "64 år" },
  { fra: "1. januar 1963", til: "31. december 1966", alderTekst: "65 år" },
  { fra: "1. januar 1967", til: null, alderTekst: "65 år (kan ændres)" },
] as const;

export interface AldersopsparingInput {
  /** Hele indkomstår til din folkepensionsalder, beregnet af `aarTilFolkepension`. */
  aarTilFolkepension: number;
  /** Hvad du har planlagt at indbetale om året. */
  aarligIndbetaling: number;
  /** Antal år du vil indbetale — højst antal år til folkepensionsalderen. */
  antalAar: number;
  /** Forventet årligt afkast før skat, i procent. */
  afkastPct: number;
}

export interface AldersopsparingResultat {
  /** Beløbsgrænsen du er omfattet af i år: 9.900 eller 64.200 kr. */
  beloebsGraense: number;
  /** Om du er kommet ind i det syvende år før folkepensionsalderen. */
  hoejtBeloeb: boolean;
  /** År til det høje beløb slår til. 0 når det allerede er slået til. */
  aarTilHoejtBeloeb: number;
  /** Den del af indbetalingen, der passer inden for grænsen. */
  indenforGraense: number;
  /** Den del af indbetalingen, der er over grænsen. */
  overGraense: number;
  /** Afgiften SKAT opkræver af indbetalingen over grænsen. */
  afgift: number;
  /** Den indbetaling, der faktisk ender på kontoen efter afgiften. */
  indbetalingEfterAfgift: number;
  /** Alt der er indbetalt over perioden. */
  samletIndbetaling: number;
  /** Afkastet før PAL-skat over hele perioden. */
  samletAfkastFoerSkat: number;
  /** PAL-skatten af afkastet, trukket år for år. */
  samletPalSkat: number;
  /** Afkastet efter PAL-skat. */
  samletAfkastEfterSkat: number;
  /** Hvad der står på kontoen, når indbetalingen stopper. */
  saldo: number;
  /** Hvad SKAT udbetaler skatte- og afgiftsfrit. */
  udbetalingSkattefri: number;
}

/**
 * Hvor meget der må indbetales afgiftsfrit i år, afhængigt af år til
 * folkepensionsalderen: grundbeløbet op til det syvende år før, derefter det
 * forhøjede beløb.
 */
export function beloebsGraenseFor(aarTilFolkepension: number): {
  beloeb: number;
  hoejt: boolean;
} {
  if (aarTilFolkepension <= ALDERSOPSPARING_2026.hoejtBeloebAar) {
    return { beloeb: ALDERSOPSPARING_2026.hoejtBeloeb, hoejt: true };
  }
  return { beloeb: ALDERSOPSPARING_2026.grundbeloeb, hoejt: false };
}

/**
 * År til din folkepensionsalder, målt i indkomstår.
 *
 * Reglen er opgivet i kalenderår, ikke på din fødselsdag: skat.dk skriver at du
 * kan indbetale 64.200 kr. i 2026, «hvis du når folkepensionsalderen i 2033» —
 * altså 2026 + 7. Den danske regel kender ikke fødselsdage, kun indkomstår, så
 * forskellen skal regnes på årstal.
 */
export function aarTilFolkepension(folkepensionsalderDato: Date, iDag: Date): number {
  return Math.max(0, folkepensionsalderDato.getFullYear() - iDag.getFullYear());
}

/**
 * Simulerer indbetalingen år for år: indskuddet lægges til ved årets start, og
 * PAL-skatten trækkes af årets afkast ved årets slut — det forløb
 * pensionsselskabet selv bruger, når det beregner og indbetaler skatten for
 * kunden.
 *
 * Afgiftssatsen vælges ud fra den grænse, du er omfattet af i år. Det er med
 * vilje én sats pr. beregning og ikke én pr. år i perioden: at grænsen skifter
 * midt i en opsparing kræver en fødselsdatoberegning for hvert enkelt år, og
 * skat.dk fastsætter beløbsgrænserne pr. indkomstår.
 */
export function beregnAldersopsparing(
  input: AldersopsparingInput
): AldersopsparingResultat {
  const aarTilFolkepension = Math.max(0, Math.round(input.aarTilFolkepension));
  const antalAar = Math.max(0, Math.round(input.antalAar));
  const aarligIndbetaling = Math.max(0, input.aarligIndbetaling);
  const afkastPct = Math.max(0, input.afkastPct);

  const { beloeb, hoejt } = beloebsGraenseFor(aarTilFolkepension);
  const afgiftSats = hoejt
    ? ALDERSOPSPARING_2026.afgiftOverHoejtBeloeb
    : ALDERSOPSPARING_2026.afgiftOverGrundbeloeb;

  const indenforGraense = Math.min(aarligIndbetaling, beloeb);
  const overGraense = Math.max(0, aarligIndbetaling - beloeb);
  const afgift = overGraense * afgiftSats;
  const indbetalingEfterAfgift = aarligIndbetaling - afgift;

  let saldo = 0;
  let samletIndbetaling = 0;
  let samletAfkastFoerSkat = 0;
  let samletPalSkat = 0;

  for (let aar = 0; aar < antalAar; aar++) {
    saldo += indbetalingEfterAfgift;
    samletIndbetaling += indbetalingEfterAfgift;

    const afkastFoerSkat = saldo * (afkastPct / 100);
    const palSkat = afkastFoerSkat * ALDERSOPSPARING_2026.palSats;

    saldo += afkastFoerSkat - palSkat;
    samletAfkastFoerSkat += afkastFoerSkat;
    samletPalSkat += palSkat;
  }

  return {
    beloebsGraense: beloeb,
    hoejtBeloeb: hoejt,
    aarTilHoejtBeloeb: hoejt ? 0 : aarTilFolkepension - ALDERSOPSPARING_2026.hoejtBeloebAar,
    indenforGraense,
    overGraense,
    afgift,
    indbetalingEfterAfgift,
    samletIndbetaling,
    samletAfkastFoerSkat,
    samletPalSkat,
    samletAfkastEfterSkat: samletAfkastFoerSkat - samletPalSkat,
    saldo,
    udbetalingSkattefri: saldo,
  };
}

/**
 * Hvad det samme afkast ville have givet i fri opsparing, efter skat med den
 * marginalskat brugeren angiver. Det er den sammenligning, der afgør om
 * aldersopsparing er noget værd, og den er med fordi folk søger på
 * «aldersopsparing skat af afkast» og forventer et tal, ikke en passus.
 *
 * Fri opsparing beskattes af afkastet med marginalskatten, aldersopsparing med
 * 15,3 % — derfor er resultatet ikke et løfte om et beløb, men et gentaget
 * mønster: jo højere marginalskat du har, jo større er forskellen.
 */
export function sammenlignFriOpsparing(
  saldoAldersopsparing: number,
  aarligIndbetaling: number,
  afkastPct: number,
  antalAar: number,
  marginalskatPct: number
): { saldoFri: number; forskel: number } {
  const marginalskat = Math.max(0, marginalskatPct) / 100;
  const aarlig = Math.max(0, aarligIndbetaling);

  let saldo = 0;
  for (let aar = 0; aar < Math.max(0, Math.round(antalAar)); aar++) {
    saldo += aarlig;
    saldo += saldo * (afkastPct / 100) * (1 - marginalskat);
  }

  return {
    saldoFri: saldo,
    forskel: saldoAldersopsparing - saldo,
  };
}
