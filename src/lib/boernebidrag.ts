/**
 * Børnebidrag — hvor meget skal du betale, og hvad får du i skat tilbage?
 *
 * Regnestykket er Familieretshusets eget. Normalbidraget består af et
 * grundbeløb og et tillæg, og et forhøjet bidrag er altid normalbidraget plus
 * en procentandel af **grundbeløbet** — aldrig af hele normalbidraget. Det er
 * den detalje, der gør forskellen mellem 3.158 kr. og 3.350 kr. ved 100 %.
 *
 * Indkomstniveauerne er de *vejledende* beløb fra indkomstoversigten for 2026.
 * De er angivet som «ca.», fordi de faktiske tal fastsættes af
 * Familieretshuset eller af forældrene i fællesskab — derfor hedder kolonnen
 * «vejledende» på siden, og derfor må beregneren ikke sige, at den *fastsætter*
 * noget.
 *
 * Kilde og verificeringsdato: se `BOERNEBIDRAG_KILDE`.
 */

/** Det år alle satser og indkomstniveauer i modulet er for. */
export const BOERNEBIDRAG_AAR = 2026;

export const BOERNEBIDRAG_KILDE = {
  indkomstoversigt:
    "https://www.retsinformation.dk/api/pdf/254319 — Børnebidrag: vejledende indkomstbeløb for 2026 (Social- og Boligministeriet, 1. januar 2026)",
  beregning:
    "https://familieretshuset.dk/emner/foraeldreansvar/boernebidrag/beregning-af-boernebidragets-stoerrelse/ — «Når vi fastsætter et bidrag større end normalbidraget, vil bidraget altid udgøre normalbidraget + en procentsats af normalbidragets grundbeløb»",
  skat:
    "https://skat.dk/borger/fradrag/boernebidrag-og-aegtefaellebidrag/fradrag-for-boernebidrag — fradrag for normalbidraget (1.483 kr. pr. måned i 2026) og for et aftalt bidrag fratrukket tillægget (192 kr. pr. måned)",
  beskrivelse:
    "Normalbidraget er 1.675 kr. pr. måned i 2026: grundbeløb 1.483 kr. + tillæg 192 kr. Procenttillægget ved forhøjet bidrag regnes kun af grundbeløbet på 1.483 kr., så 100 % giver 1.483 + 1.483 + 192 = 3.158 kr. pr. måned.",
  verifiedAt: "2026-10-09",
} as const;

/**
 * Normalbidraget for 2026, i kroner.
 *
 * Grundbeløbet og tillægget er fastsat af Styrelsen for Arbejdsmarked og
 * Rekruttering og reguleres hvert år den 1. januar. Års- og halvårstallene er
 * med, fordi de står i kilden og fordi de summerer til det samme som måneds-
 * tallene gange 12 — en læser skal kunne tjekke, at de hænger sammen.
 */
export const BOERNEBIDRAG_2026 = {
  /** Normalbidraget pr. måned. */
  normalbidragMaaned: 1675,
  /** Grundbeløbet pr. måned — procenttillægget regnes kun af dette. */
  grundbeloebMaaned: 1483,
  /** Tillægget pr. måned. */
  tillaegMaaned: 192,
  /** Grundbeløbet pr. år. */
  grundbeloebAar: 17796,
  /** Tillægget pr. år. */
  tillaegAar: 2304,
} as const;

/** Hvilket procenttillæg, en indkomst udløser. */
export type Bindaagsniveau = 0 | 100 | 200 | 300;

/**
 * De vejledende årlige indkomstgrænser for 2026.
 *
 * Rækkerne er indekseret efter antal børn minus én: `indkomst[0]` er ét barn.
 * Indkomstoversigten har kolonner for 1-5 børn, og beregneren holder sig til
 * dem — en sjættende kolonne ville være opdigtet.
 */
export const INDKOMSTNIVEUER_2026: Readonly<Record<Exclude<Bindaagsniveau, 0>, readonly number[]>> = {
  100: [600_000, 690_000, 790_000, 910_000, 1_100_000],
  200: [900_000, 1_000_000, 1_200_000, 1_400_000, 1_500_000],
  300: [1_600_000, 1_900_000, 2_200_000, 2_400_000, 2_700_000],
} as const;

/** Det højste antal børn indkomstoversigten har en kolonne for. */
export const MAX_ANTAL_BOERN = 5;

/** Den laveste indkomst, der overhovedet kan udløse forhøjet bidrag (ét barn). */
export const MIN_INDKOMST_FOR_FORHOEJET = INDKOMSTNIVEUER_2026[100][0];

/** Skattefradraget pr. måned ved betaling af normalbidraget. */
export const SKATTEFRADRAG_NORMALBIDRAG_MAANED = 1483;

/** Skattefradraget pr. måned ved et aftalt bidrag: beløbet minus tillægget. */
export const SKATTEFRADRAG_TILLAEGSFRADRAG_MAANED = 192;

/**
 * Fradragets værdi i procent — altså hvor stor en del af fradraget der bliver
 * tilbage, når den betalende er topskattepligtig. SKAT skriver «ca. 27 %», så
 * tallet bruges som en tommelfingerregel og mærkes vejledende på siden.
 */
export const FRADRAGSVAERDI_PCT = 27;

export interface BoernebidragValg {
  /** Antal børn under 18, som bidragsbetaleren har forsørgelsespligt for. */
  antalBorn: number;
  /** Bidragsbetalerens årlige indkomst i kroner. */
  aarligIndomst: number;
}

export interface BoernebidragResultat {
  /** Antallet af børn, der blev regnet på. */
  antalBorn: number;
  /** Bidragsbetalerens årlige indkomst. */
  aarligIndomst: number;
  /** Hvilket procenttillæg indkomsten udløser. */
  niveauPct: Bindaagsniveau;
  /** Den vejledende indkomstgrænse for det niveau, i kroner om året. */
  indkomstGrae: number;
  /** Hvor mange procent den næste højere niveau kræver, 0 når der ikke er flere. */
  naesteNiveauPct: Exclude<Bindaagsniveau, 0> | 0;
  /** Indkomsten, der kræves til det næste niveau, 0 når der ikke er flere. */
  naesteGrae: number;
  /** Hvor mange kroner indkomsten er under det næste niveau. */
  manglerTilNaeste: number;
  /** Procenttillægget pr. barn pr. måned. */
  procentsTillaegMaaned: number;
  /** Bidraget pr. barn pr. måned. */
  bidragPrBarnMaaned: number;
  /** Alle børnene samlet pr. måned. */
  bidragSamletMaaned: number;
  /** Alle børnene samlet pr. år. */
  bidragSamletAar: number;
  /** Skattefradraget pr. måned, for alle børnene samlet. */
  skattefradragMaaned: number;
  /** Skattefradraget pr. år. */
  skattefradragAar: number;
  /** Fradraget omregnet til kroner pr. måned, ved 27 % fradragsværdi. */
  skatteBesparelseMaaned: number;
  /** Fradraget omregnet til kroner pr. år. */
  skatteBesparelseAar: number;
}

/** Rækkerne i niveauet, i rækkefølge — så koden kan finde den næste grænse. */
const NIVEAUER: readonly Exclude<Bindaagsniveau, 0>[] = [100, 200, 300];

/** Antal børn holdes mellem 1 og de kolonner, indkomstoversigten faktisk har. */
function normaliserAntalBorn(antalBorn: number): number {
  if (!Number.isFinite(antalBorn)) return 1;
  return Math.min(MAX_ANTAL_BOERN, Math.max(1, Math.round(antalBorn)));
}

/** Indkomsten holdes et helt antal kroner og aldrig under nul. */
function normaliserIndomst(aarligIndomst: number): number {
  if (!Number.isFinite(aarligIndomst) || aarligIndomst <= 0) return 0;
  return Math.round(aarligIndomst);
}

/**
 * Hvilket procenttillæg en indkomst udløser for et givent antal børn.
 *
 * Grænserne er angivet som «ca.», så beregneren bruger dem som de står og
 * fortæller på siden, at det er en vejledende regel og ikke en afgørelse.
 */
export function niveauForIndomst(aarligIndomst: number, antalBorn: number): Bindaagsniveau {
  const antal = normaliserAntalBorn(antalBorn);
  const indkomst = normaliserIndomst(aarligIndomst);
  const kolonne = Math.min(antal, MAX_ANTAL_BOERN) - 1;
  // Grænserne er kumulative: 900.000 over både 100 %-grænsen på 600.000 og
  // 200 %-grænsen, så det højeste niveau indkomsten når er det, der gælder.
  let niveau: Bindaagsniveau = 0;
  for (const kandidat of NIVEAUER) {
    if (indkomst >= INDKOMSTNIVEUER_2026[kandidat][kolonne]) niveau = kandidat;
  }
  return niveau;
}

/**
 * Skattefradraget for ét barn pr. måned.
 *
 * SKAT har to regler: betaler man normalbidraget, er fradraget grundbeløbet på
 * 1.483 kr.; er bidraget aftalt i stedet, er fradraget beløbet minus tillægget
 * på 192 kr. Begge regler er dækket af én formel, fordi normalbidraget minus
 * tillægget netop er grundbeløbet.
 */
export function skattefradragFor(bidragMaaned: number): number {
  const fradrag = Math.min(bidragMaaned - SKATTEFRADRAG_TILLAEGSFRADRAG_MAANED, SKATTEFRADRAG_NORMALBIDRAG_MAANED);
  return Math.max(0, fradrag);
}

/**
 * Regner børnebidraget og skatteværdien af det.
 *
 * Sammensætningen er Familieretshusets: grundbeløb + tillæg + procenttillæg
 * af grundbeløbet. Alt andet — samvær, hjemmetilskud, en aftale mellem
 * forældrene — ligger uden for denne beregning, og siden siger det.
 */
export function beregnBoernebidrag(valg: BoernebidragValg): BoernebidragResultat {
  const antalBorn = normaliserAntalBorn(valg.antalBorn);
  const aarligIndomst = normaliserIndomst(valg.aarligIndomst);
  const niveauPct = niveauForIndomst(aarligIndomst, antalBorn);

  const kolonne = antalBorn - 1;
  const indkomstGrae = niveauPct === 0 ? 0 : INDKOMSTNIVEUER_2026[niveauPct][kolonne];

  // Den næste højere niveau og hvor mange kroner der mangler til den.
  let naesteNiveauPct: Exclude<Bindaagsniveau, 0> | 0 = 0;
  let naesteGrae = 0;
  for (const niveau of NIVEAUER) {
    if (niveau > niveauPct) {
      naesteNiveauPct = niveau;
      naesteGrae = INDKOMSTNIVEUER_2026[niveau][kolonne];
      break;
    }
  }
  const manglerTilNaeste = naesteGrae > 0 ? Math.max(0, naesteGrae - aarligIndomst) : 0;

  const procentsTillaegMaaned =
    (BOERNEBIDRAG_2026.grundbeloebMaaned * niveauPct) / 100;
  const bidragPrBarnMaaned =
    BOERNEBIDRAG_2026.grundbeloebMaaned +
    BOERNEBIDRAG_2026.tillaegMaaned +
    procentsTillaegMaaned;
  const bidragSamletMaaned = bidragPrBarnMaaned * antalBorn;

  const skattefradragMaaned = skattefradragFor(bidragPrBarnMaaned) * antalBorn;
  const skatteBesparelseMaaned = (skattefradragMaaned * FRADRAGSVAERDI_PCT) / 100;

  return {
    antalBorn,
    aarligIndomst,
    niveauPct,
    indkomstGrae,
    naesteNiveauPct,
    naesteGrae,
    manglerTilNaeste,
    procentsTillaegMaaned,
    bidragPrBarnMaaned,
    bidragSamletMaaned,
    bidragSamletAar: bidragSamletMaaned * 12,
    skattefradragMaaned,
    skattefradragAar: skattefradragMaaned * 12,
    skatteBesparelseMaaned,
    skatteBesparelseAar: skatteBesparelseMaaned * 12,
  };
}

/**
 * Formaterer en indkomstgrænse til den skrivemåde, kilden bruger: korte beløb
 * som hele tusinder, lange som «1,1 mio. kr.» — så tallene i tabellen på siden
 * ser ud som dem i indkomstoversigten.
 */
export function formaterGrae(belob: number): string {
  if (belob >= 1_000_000) {
    const mio = belob / 1_000_000;
    return `ca. ${mio.toLocaleString("da-DK", { maximumFractionDigits: 1 })} mio. kr.`;
  }
  return `ca. ${belob.toLocaleString("da-DK")} kr.`;
}

/**
 * De tre niveauer som en række, så tabellen på siden ikke kan glide fra det,
 * beregneren bruger.
 */
export function indkomstNiveauRækker(): ReadonlyArray<{
  niveauPct: Exclude<Bindaagsniveau, 0>;
  grae: readonly number[];
}> {
  return NIVEAUER.map((niveauPct) => ({
    niveauPct,
    grae: INDKOMSTNIVEUER_2026[niveauPct],
  }));
}

/**
 * Eksemplet værktøjet og titlen regner på: én bidragsbetaler på 610.000 kr.
 * med ét barn. Det er Familieretshusets eget regneeksempel på 2026-siden, så
 * formlen kan efterprøves mod kilden.
 */
export const BOERNEBIDRAG_EKSEMPEL: BoernebidragValg = {
  antalBorn: 1,
  aarligIndomst: 610_000,
};

/** Eksemplets resultat, så brødteksten og porten læser samme tal. */
export function boernebidragEksempel(): BoernebidragResultat {
  return beregnBoernebidrag(BOERNEBIDRAG_EKSEMPEL);
}
