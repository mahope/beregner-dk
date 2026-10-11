/**
 * Boligsikring 2026 — lov om individuel boligstøtte (LBK 995 af 1. juli 2025), § 22.
 *
 * Boligsikring er den del af boligstøtteordningen, der gives til lejere, der
 * ikke er pensionister, samt til førtidspensionister, der er tilkendt efter
 * 1. januar 2003 (STAR, "Boligsikring"). Beregningen er forskellen mellem
 * 60 pct. af den årlige boligudgift og 18 pct. af husstandsindkomsten over
 * indkomstgrænsen.
 *
 * Alle beløb er de pr. 1. januar 2026 regulerede satser fra
 * Beskæftigelsesministeriets vejledning om regulering af satser
 * (retsinformation.dk, VEJ nr 9336 af 24/03/2026, TABEL 2), suppleret med
 * bm.dk/satser/satser-for-2026/boligstoette. Lovens egne § 22, stk. 2, § 22,
 * stk. 3 og § 23, stk. 1 giver reglerne for egenbetaling, 15 pct.-loftet og
 * maksimumsbeløbet.
 *
 * Udbetaling Danmark foretager den endelige beregning. Tallet her er vejledende.
 */

export const BOLIGSIKRING_2026 = {
  /** § 22, stk. 1, 1. pkt. — indkomstgrænsen, før den forhøjes for børn. */
  indkomstGraense: 170_300,
  /** § 22, stk. 1, 2. pkt. — forøgelse pr. barn fra det 2. til det 4. */
  indkomstGraensePrBarn: 44_900,
  /** § 22, stk. 2 — beløbet husstanden altid selv skal betale af boligudgiften. */
  mindstEgenbetaling: 28_700,
  /** § 23, stk. 1 — maksimal årlig boligsikring. */
  maksBoligsikring: 50_412,
  /** § 23, stk. 1, 2. pkt. — forhøjelse af maksimummet ved 4 eller flere børn. */
  maksForhoejelseFireEllerFlereBoern: 0.25,
  /** § 14, stk. 1 — maksimum for den årlige husleje, der indgår i beregningen. */
  maksHusleje: 95_500,
  /** § 14, stk. 1 — forhøjelse af huslejemaksimummet pr. barn, op til 4 børn. */
  maksHuslejeForhoejelsePrBarn: 0.05,
  /** § 22, stk. 3 — loft, når der ikke er børn under 18 i husstanden. */
  loftUdenBoernPct: 0.15,
  /** § 8 a, stk. 1 — formuegrænserne for formuetillægget til indkomsten. */
  formueGraenseLav: 896_400,
  formueGraenseHoej: 1_793_000,
  /** §§ 33 og 34 — mindstebeløb, før boligsikringen udbetales. */
  minimumsBeloeb: 3_696,
  /** Huslejeandelen af boligudgiften (§ 22, stk. 1). */
  huslejeandelPct: 0.6,
  /** Indkomstandelen af husstandsindkomsten over grænsen (§ 22, stk. 1). */
  indkomstandelPct: 0.18,
  /**
   * Arealgrænsen: 65 m² for den første person i husstanden og 20 m² for hver
   * af de følgende (STAR, "Boligens størrelse"). Er boligen større, indgår kun
   * en tilsvarende del af huslejen i beregningen.
   */
  arealFoerstePerson: 65,
  arealEkstraPerson: 20,
  /** Antal børn, der giver forhøjelse af både indkomstgrænse og maksimummer. */
  maksBoernMedForhoejelse: 4,
} as const;

export const BOLIGSIKRING_KILDER = {
  satser:
    "Beskæftigelsesministeriets vejledning om regulering pr. 1. januar 2026 af satser, VEJ nr 9336 af 24/03/2026, Tabel 2 (boligsikring).",
  lov: "Lov om individuel boligstøtte, LBK nr 995 af 1. juli 2025 med senere ændringer, §§ 8 a, 14, 22 og 23.",
  regler: "Styrelsen for Arbejdsmarked og Rekruttering, star.dk: Boligsikring — hvem der kan få den, arealgrænsen og de særlige regler.",
  maksimummer: "bm.dk, Satser for 2026 — boligstøtte: boligsikring.",
} as const;

export interface BoligsikringInput {
  /** Huslejen pr. måned i kr. */
  huslejeMaanedlig: number;
  /** Antal voksne i husstanden. */
  antalVoksne: number;
  /** Antal børn under 18 år i husstanden. */
  antalBoernUnder18: number;
  /** Husstandens samlede årlige indkomst i kr. — ikke børns indkomst (§ 8, stk. 4). */
  husstandsindkomst: number;
  /** Husstandens formue i kr. 0 hvis den er under den laveste grænse. */
  formue: number;
  /** Boligens bruttoetageareal i m². */
  arealKvm: number;
  /**
   * Undtager § 22, stk. 3: husstanden har et medlem med førtidpension eller
   * seniorpension, et stærkt bevægelseshæmmet medlem i en egnet bolig, eller et
   * medlem med døgnhjælp efter § 96 i serviceloven.
   */
  undtagetFraLoftUdenBoern: boolean;
}

export interface BoligsikringResultat {
  /** Årlig boligsikring i kr. — 0 når husstanden ikke får noget. */
  aarlig: number;
  /** Månedlig boligsikring i kr. */
  maanedlig: number;
  /** Andelen af huslejen, der indgår i beregningen efter arealgrænsen. */
  arealFaktor: number;
  /** Det tilladte areal for husstanden i m². */
  tilladtAreal: number;
  /** Den husleje, der rent faktisk indgår i beregningen, i kr. pr. år. */
  boligudgift: number;
  /** Om huslejen er ramt af maksimumsbeløbet. */
  huslejeErBegraenset: boolean;
  /** Indkomstgrænsen efter forhøjelse for børn. */
  indkomstGraense: number;
  /** Formuetillægget, der er lagt til husstandsindkomsten i kr. */
  formueTillaeg: number;
  /** Husstandsindkomsten med formuetillægget. */
  indkomstMedFormue: number;
  /** 60 pct. af boligudgiften. */
  huslejeandel: number;
  /** 18 pct. af indkomsten over indkomstgrænsen. */
  indkomstandel: number;
  /** Formlen uden loftene: huslejeandelen minus indkomstandelen. */
  grundlinje: number;
  /** Hvor meget husstanden selv skal betale af boligudgiften. */
  egenbetaling: number;
  /** Om egenbetalingen eller et loft har stukket hul i beløbet. */
  begraensetAf: "ingen" | "egenbetaling" | "loft-uden-boern" | "maksimum";
}

/**
 * Indkomstgrænsen forhøjes med 44.900 kr. for hvert barn fra det 2. til det 4.
 * Ét barn giver ingen forhøjelse, og børn ud over det fjerde giver heller ikke.
 */
export function boligsikringIndkomstGraense(antalBoernUnder18: number): number {
  const boern = normaliserBoern(antalBoernUnder18);
  if (boern < 2) return BOLIGSIKRING_2026.indkomstGraense;
  const boernMedForhoejelse = Math.min(boern, BOLIGSIKRING_2026.maksBoernMedForhoejelse);
  return BOLIGSIKRING_2026.indkomstGraense
    + BOLIGSIKRING_2026.indkomstGraensePrBarn * (boernMedForhoejelse - 1);
}

/** Maksimumsbeløbet for den årlige husleje, der indgår i beregningen. */
export function boligsikringMaksHusleje(antalBoernUnder18: number): number {
  const boern = normaliserBoern(antalBoernUnder18);
  return Math.round(
    BOLIGSIKRING_2026.maksHusleje
      * (1 + BOLIGSIKRING_2026.maksHuslejeForhoejelsePrBarn * Math.min(boern, BOLIGSIKRING_2026.maksBoernMedForhoejelse))
  );
}

/** Det tilladte areal: 65 m² for den første person og 20 m² for hver yderligere. */
export function boligsikringTilladtAreal(antalPersoner: number): number {
  const personer = Math.max(1, Math.floor(antalPersoner));
  if (personer <= 1) return BOLIGSIKRING_2026.arealFoerstePerson;
  return BOLIGSIKRING_2026.arealFoerstePerson
    + BOLIGSIKRING_2026.arealEkstraPerson * (personer - 1);
}

/**
 * Formuetillægget: 10 pct. af formuen over den laveste grænse og 20 pct. over
 * den højeste. Procenten gælder hele formuen, ikke kun det beløb, der ligger
 * over grænsen.
 */
export function boligsikringFormueTillaeg(formue: number): number {
  const vaerdi = Math.max(0, formue);
  if (vaerdi > BOLIGSIKRING_2026.formueGraenseHoej) return vaerdi * 0.2;
  if (vaerdi > BOLIGSIKRING_2026.formueGraenseLav) return vaerdi * 0.1;
  return 0;
}

/** Beregner boligsikring for en husstand. */
export function beregnBoligsikring(input: BoligsikringInput): BoligsikringResultat {
  const sats = BOLIGSIKRING_2026;
  const antalVoksne = Math.max(1, Math.floor(tal(input.antalVoksne)));
  const boern = normaliserBoern(input.antalBoernUnder18);
  const personer = antalVoksne + boern;

  const tilladtAreal = boligsikringTilladtAreal(personer);
  const arealKvm = tal(input.arealKvm);
  const arealFaktor = arealKvm > 0 ? Math.min(1, tilladtAreal / arealKvm) : 1;

  const maksHusleje = boligsikringMaksHusleje(boern);
  const huslejeAarlig = Math.max(0, tal(input.huslejeMaanedlig)) * 12;
  const huslejeErBegraenset = huslejeAarlig > maksHusleje;
  const boligudgift = Math.min(huslejeAarlig, maksHusleje) * arealFaktor;

  const indkomstGraense = boligsikringIndkomstGraense(boern);
  const formueTillaeg = boligsikringFormueTillaeg(input.formue);
  const indkomstMedFormue = Math.max(0, tal(input.husstandsindkomst)) + formueTillaeg;

  const huslejeandel = boligudgift * sats.huslejeandelPct;
  const indkomstandel = Math.max(0, indkomstMedFormue - indkomstGraense) * sats.indkomstandelPct;
  const grundlinje = huslejeandel - indkomstandel;

  // § 22, stk. 2: husstanden skal mindst selv betale mindstEgenbetaling af
  // boligudgiften, så boligsikring aldrig kan være større end boligudgiften
  // minus det beløb.
  const egenbetalingLoft = boligudgift - sats.mindstEgenbetaling;
  // § 22, stk. 3: uden børn under 18 kan boligsikring højst udgøre 15 pct. af
  // huslejen, medmindre husstanden er undtaget.
  const loftUdenBoern = boern === 0 && !input.undtagetFraLoftUdenBoern
    ? boligudgift * sats.loftUdenBoernPct
    : Number.POSITIVE_INFINITY;
  const maksimum = sats.maksBoligsikring
    * (boern >= 4 ? 1 + sats.maksForhoejelseFireEllerFlereBoern : 1);

  const aarligFoerBegraensning = Math.max(0, grundlinje);
  const aarlig = Math.max(
    0,
    Math.min(aarligFoerBegraensning, egenbetalingLoft, loftUdenBoern, maksimum)
  );

  let begraensetAf: BoligsikringResultat["begraensetAf"] = "ingen";
  if (aarligFoerBegraensning <= 0) begraensetAf = "egenbetaling";
  else if (loftUdenBoern < aarligFoerBegraensning && loftUdenBoern < maksimum) begraensetAf = "loft-uden-boern";
  else if (maksimum < aarligFoerBegraensning) begraensetAf = "maksimum";

  return {
    aarlig,
    maanedlig: aarlig / 12,
    arealFaktor,
    tilladtAreal,
    boligudgift,
    huslejeErBegraenset,
    indkomstGraense,
    formueTillaeg,
    indkomstMedFormue,
    huslejeandel,
    indkomstandel,
    grundlinje,
    egenbetaling: Math.max(0, boligudgift - aarlig),
    begraensetAf,
  };
}

function normaliserBoern(antalBoernUnder18: number): number {
  if (!Number.isFinite(antalBoernUnder18)) return 0;
  return Math.max(0, Math.min(9, Math.floor(antalBoernUnder18)));
}

/** Ugyldige indtastninger behandles som 0, så beregningen aldrig giver NaN. */
function tal(vaerdi: number): number {
  return Number.isFinite(vaerdi) ? vaerdi : 0;
}
