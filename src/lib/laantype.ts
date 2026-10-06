/**
 * Sammenligning af de **tre** danske lånetyper: annuitetslån, serielån og
 * stående lån — regnet på ét beløb, én rente og én løbetid.
 *
 * Hvorfor en side til det: `/renteberegner` har 13.204 GSC-visninger og
 * svarer på «annuitetslån beregner» (348 v, pos. 8), men siden regner **én**
 * lånetype ad gangen og læser intet om de to andre. Dansk autocomplete målt
 * 6/10 04:5x (`suggestqueries.google.com`, `hl=da&gl=dk`) siger, at spørgsmålet
 * ikke er selve ydelsen, men **valget**:
 *
 * - «annuitetslån» → 10 af 10 træffere, hvoraf 4 handler om forskellen:
 *   «annuitetslån serielån og stående lån», «annuitetslån vs serielån»,
 *   «annuitetslån serielån og stående lån», «annuitetslån vs serielån».
 * - «serielån» → 10 af 10: «serielån vs annuitetslån», «serielån beregner»,
 *   «serielån eller annuitetslån», «serielån annuitetslån».
 * - «stående lån» → 10 af 10: «stående lån hvad er det», «stående lån
 *   fordele og ulemper», «stående lån vs annuitetslån».
 *
 * Svensk autocomplete (`hl=sv&gl=se`) er den samme klynge: «serielån vs
 * annuitetslån kalkulator», «serielån vs annuitetslån», «annuitetslån vs rak
 * amortering». Så det er ikke et dansk niche-emne, men et spørgsmål, to
 * domæner får trafik på og ingen af dem besvarer samlet.
 *
 * **Ingen tal står håndskrevet her.** Annuitetslån og serielån går gennem
 * `laanebeloeb.ts` — de samme funktioner `/renteberegner` og `/laaneberegner`
 * bruger — så denne side kan ikke komme til at vise en anden ydelse end
 * værktøjet. Stående lån er rente på hele hovedstolen hver måned, hvilket er
 * definitionen af et afdragsfrit lån, så den har ingen egen formel: den er
 * blot `hovedstol × månedsrente`.
 *
 * Faglig grund: Nationalbanken definerer et annuitetslån som et lån med
 * **konstant ydelse** pr. termin, hvor afdragsandelen stiger og renteandelen
 * falder; et serielån har **konstant afdrag** pr. termin, så ydelsen falder.
 * Realkreditlovens **§ 4** bestemmer, at lån til ejerboliger til helårsbrug og
 * fritidshuse ikke må ydes, så de «amortiseres langsommere end et 30-årigt lån,
 * der amortiseres over løbetiden med en ydelse, som udgør en fast procentdel af
 * hovedstolen (annuitetslån)», og at kravet efter stk. 2 «kan inden for lånets
 * løbetid fraviges for en periode på op til 10 år». Det er grundlaget for
 * afdragsfrihed og dermed for stående lån som selvstændig løbetid.
 *
 * Ordlyden er læst i lovens egen tekst (retsinformation.dk/eli/lta/2025/1541,
 * § 4) 6/10 2026 — ikke i en bank eller et magasin. En forkert påstand om loven
 * er dyrere for brugeren end en manglende side, så påstanden skal kunne slås
 * op, og en port låser den streng.
 */

import { antalMaaneder, laanKostning, type Laanetype as Laaneprofil } from "@/lib/laanebeloeb";

/**
 * De tre lånetyper værktøjet sammenligner.
 *
 * `annuitet` og `serielaan` er navnene fra `laanebeloeb.ts`, så værktøjet og
 * `/renteberegner` ikke kan være uenige om hvad et serielån er. `staende` er
 * kun her, fordi `laanebeloeb` bevidst kun rummer de to typer, der *afdrager* —
 * et afdragsfrit lån har ingen afdrag at regne på.
 */
export type Laanetype = Laaneprofil | "staende";

/** Alle tre typer, i den rækkefølge siden og tabellen viser dem. */
export const LAANETYPER: readonly Laanetype[] = ["annuitet", "serielaan", "staende"];

/**
 * Mindste hovedstol, i kroner.
 *
 * Uden en bund er et beløb på 100 kr over 30 år en ydelse på 0,38 kr. — et tal
 * der er rigtigt regnet, men ubrugeligt. Værktøjet skal sige «skriv et beløb»
 * og ikke vise en ydelse på under én krone pr. måned.
 */
export const MIN_HOVEDSTOL = 10_000;

/** Største hovedstol, i kroner. Sætter en rampe på antal-måneder-løkker. */
export const MAX_HOVEDSTOL = 10_000_000;

/** Længste løbetid i år. 50 år er længere end de fleste realkreditlån. */
export const MAX_LOEBETID_AAR = 50;

/** Største årlige rente i procent, som værktøjet accepterer. */
export const MAX_AARSRENTE = 30;

function assertBelob(hovedstol: number): void {
  if (
    !Number.isFinite(hovedstol) ||
    hovedstol < MIN_HOVEDSTOL ||
    hovedstol > MAX_HOVEDSTOL
  ) {
    throw new Error(
      `Lånebeløbet skal være mellem ${MIN_HOVEDSTOL} og ${MAX_HOVEDSTOL} kr.: ${String(hovedstol)}`,
    );
  }
}

function assertRenteOgLoebetid(aarligRente: number, loebetidAar: number): void {
  if (!Number.isFinite(aarligRente) || aarligRente < 0 || aarligRente > MAX_AARSRENTE) {
    throw new Error(`Renten skal være mellem 0 og ${MAX_AARSRENTE} %: ${String(aarligRente)}`);
  }
  if (!Number.isFinite(loebetidAar) || loebetidAar <= 0 || loebetidAar > MAX_LOEBETID_AAR) {
    throw new Error(`Løbetiden skal være mellem 0 og ${MAX_LOEBETID_AAR} år: ${String(loebetidAar)}`);
  }
}

/**
 * Ét tal om én lånetype på ét beløb.
 *
 * Hvert felt har den **samme** betydning for alle tre typer, så tabellen kan
 * have én kolonne pr. egenskab og ikke en kolonne pr. lånetype. Det er derfor
 * `maanedligYdelse` for et serielån er den *første* måneds ydelse: det er den
 * ydelse, banken vurderer dit rådighedsbeløb på.
 */
export interface LaanetypeResultat {
  type: Laanetype;
  /** Den månedlige ydelse i måned 1. For et serielån den højeste. */
  foersteYdelse: number;
  /**
   * Den månedlige ydelse i den **sidste** måned.
   *
   * For et annuitetslån og et stående lån er den lig den første, fordi ydelsen
   * er konstant. Skrives derfor eksplicit i stedet for at være `null`: en
   * læser skal kunne læse tre tal i hver række.
   */
  sidsteYdelse: number;
  /** Maanedligt afdrag på hovedstolen i måned 1. 0 for et stående lån. */
  foersteAfdrag: number;
  /** Hovedstolen ved lånets udløb. 0 for alle — også et stående lån indfrier. */
  restgaeldVedUdlob: number;
  /** Renterne over hele løbetiden, i kroner. */
  samletRente: number;
  /** Hovedstol + samlet rente. */
  samletBetaling: number;
  /** Renteandelens andel af hele tilbagebetalingen, i procent. */
  renteAndel: number;
  /** Antal måneder i løbetiden. */
  antalMaaneder: number;
}

/**
 * Et stående (afdragsfrit) lån på ét beløb.
 *
 * Ved hver af de `n` terminer betales kun renten på hele hovedstolen, så
 * ydelsen er konstant og hovedstolen står uændret hele vejen. Renterne er derfor
 * simpelthen månedens rente gang antal måneder — modsat et serielån, hvor de
 * falder måned for måned.
 */
function staendeLaan(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
): LaanetypeResultat {
  const n = antalMaaneder(loebetidAar);
  const maanedligRente = aarligRente / 100 / 12;
  const ydelse = hovedstol * maanedligRente;
  const samletRente = ydelse * n;
  const samletBetaling = hovedstol + samletRente;
  return {
    type: "staende",
    foersteYdelse: ydelse,
    sidsteYdelse: ydelse,
    foersteAfdrag: 0,
    restgaeldVedUdlob: 0,
    samletRente,
    samletBetaling,
    renteAndel: samletBetaling > 0 ? (samletRente / samletBetaling) * 100 : 0,
    antalMaaneder: n,
  };
}

/** Én lånetype regnet på ét beløb. Kaster på input uden for grænserne. */
export function laanetypeResultat(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
  type: Laanetype,
): LaanetypeResultat {
  assertBelob(hovedstol);
  assertRenteOgLoebetid(aarligRente, loebetidAar);

  if (type === "staende") {
    return staendeLaan(hovedstol, aarligRente, loebetidAar);
  }

  const kostning = laanKostning(hovedstol, aarligRente, loebetidAar, type);
  const n = antalMaaneder(loebetidAar);
  const maanedligRente = aarligRente / 100 / 12;
  // Måned 1's afdrag er enten det faste serielånsafdrag eller annuitetslånets
  // ydelse minus månedens rente på hele hovedstolen. Det er de to veje, der
  // giver hver deres type sit afdrag — alt andet ville kræve at `laanebeloeb`
  // også vidste om stående lån, hvilket den bevidst ikke gør.
  const foersteAfdrag =
    type === "serielaan" && n > 0
      ? hovedstol / n
      : kostning.maanedligYdelse - hovedstol * maanedligRente;

  return {
    type,
    foersteYdelse: kostning.maanedligYdelse,
    // Annuitetslånets ydelse er konstant, så måned `n` er den samme som måned 1.
    sidsteYdelse: kostning.sidsteMaanedsYdelse ?? kostning.maanedligYdelse,
    foersteAfdrag,
    restgaeldVedUdlob: 0,
    samletRente: kostning.samletRente,
    samletBetaling: kostning.samletBetaling,
    renteAndel:
      kostning.samletBetaling > 0 ? (kostning.samletRente / kostning.samletBetaling) * 100 : 0,
    antalMaaneder: n,
  };
}

/** Alle tre typer på samme beløb, i den rækkefølge siden viser dem. */
export function laanetyperSammenlign(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
): LaanetypeResultat[] {
  return LAANETYPER.map((type) => laanetypeResultat(hovedstol, aarligRente, loebetidAar, type));
}

/**
 * Den måned, hvor serielånets ydelse bliver **lavere** end annuitetslånets.
 *
 * Det er det spørgsmål, «annuitetslån vs serielån» egentlig handler om: et
 * serielån er dyrere i starten og billigere i slutningen, så de to kurver
 * krydser et sted. Kortest mulige kryds er måned 1 — hvis løbetiden er så
 * kort at serielånets ydelse allerede måned 1 ligger under annuitetslånets.
 *
 * Returnerer `null` ved 0 % rente, fordi ydelserne da er ens hele vejen
 * (hovedstol delt på månederne) og der ikke **er** et kryds at finde. Uden den
 * undtagelse ville løkken finde måned 1 og læse et kryds, der ikke er der.
 */
export function krydsMaaned(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
): number | null {
  assertBelob(hovedstol);
  assertRenteOgLoebetid(aarligRente, loebetidAar);
  if (aarligRente === 0) return null;

  const n = antalMaaneder(loebetidAar);
  if (n <= 0) return null;
  const r = aarligRente / 100 / 12;
  const annuitetsYdelse = laanetypeResultat(hovedstol, aarligRente, loebetidAar, "annuitet")
    .foersteYdelse;
  const afdrag = hovedstol / n;

  // Serielånets ydelse i måned k er det faste afdrag plus renten på den
  // restgæld, der står tilbage efter de k-1 foregående afdrag. Den falder
  // lineært, så løkken finder det første k, hvor den er under annuitetslånets.
  for (let k = 1; k <= n; k += 1) {
    const restgaeld = hovedstol - afdrag * (k - 1);
    const ydelse = afdrag + restgaeld * r;
    if (ydelse <= annuitetsYdelse) return k;
  }
  return null;
}

/** Hovedstolen i et boliglån efter Realkreditlovens 80 %-grænse. */
export function belaasningsgradBelob(belob: number, gradProcent = 80): number {
  return belob * (gradProcent / 100);
}

/** Antallet af måneder i løbetiden, genudelt så siden og porten læser samme kilde. */
export function loebetidMaaneder(loebetidAar: number): number {
  return antalMaaneder(loebetidAar);
}

/**
 * Eksemplet **titlen, metadataen og FAQ'en** regner på: 2.000.000 kr over 30
 * år til 4 %.
 *
 * Beløbet er valgt efter autocomplete 4/10, der under «hvor meget koster det
 * at låne» svarer med 1 million, 2 millioner, 3 millioner, 4 millioner og 5
 * millioner — så 2 millioner er en af de beløb læseren faktisk leder efter.
 * Renten på 4 % er et regneeksempel, ikke et markedstal, og det siges også på
 * siden, så ingen læser tror den er dagens niveau.
 */
export const LAANETYPE_EKSEMPEL_HOVEDSTOL = 2_000_000;
/** Den årlige rente i eksemplet, i procent. */
export const LAANETYPE_EKSEMPEL_AARSRENTE = 4;
/** Løbetiden i eksemplet, i år. */
export const LAANETYPE_EKSEMPEL_LOEBETID = 30;

/**
 * De tre typer på eksemplets beløb, rente og løbetid.
 *
 * Titlen, metadataen, FAQ'en og løsningens brødtekst læser **alle** denne
 * samme funktion. Skriver brødteksten dem i hånden, kan de tre steder komme til
 * at sige hver sit tal — og de tal står i Googles svar, ikke kun på siden.
 */
export function laanetypeEksempel(): LaanetypeResultat[] {
  return laanetyperSammenlign(
    LAANETYPE_EKSEMPEL_HOVEDSTOL,
    LAANETYPE_EKSEMPEL_AARSRENTE,
    LAANETYPE_EKSEMPEL_LOEBETID,
  );
}

/** Måneden de to afdragslån krydser i eksemplet. */
export function laanetypeEksempelKryds(): number | null {
  return krydsMaaned(
    LAANETYPE_EKSEMPEL_HOVEDSTOL,
    LAANETYPE_EKSEMPEL_AARSRENTE,
    LAANETYPE_EKSEMPEL_LOEBETID,
  );
}

/** Resultatet for én bestemt type i eksemplet. */
export function laanetypeEksempelFor(type: Laanetype): LaanetypeResultat {
  const fundet = laanetypeEksempel().find((r) => r.type === type);
  if (!fundet) throw new Error(`Ukendt lånetype i eksemplet: ${type}`);
  return fundet;
}
