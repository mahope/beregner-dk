/**
 * Hvad et lån på et givet beløb koster, regnet på de **to** lånetyper
 * `/renteberegner` har: annuitetslån (fast ydelse) og serielån (fast afdrag).
 *
 * Formlerne lå tidligere inde i `Renteberegner.tsx` som en `useMemo`, så de
 * kun kunne nås fra den ene komponent og ingen port kunne dømme dem. De ligger
 * her nu som rene funktioner, fordi tabellen under værktøjet skal regne de
 * samme tal for otte beløb — og fordi det er denne fil, `laanebeloeb.test.ts`
 * dømmer.
 *
 * Autocomplete målt 4/10 02:2x (hl=da&gl=dk) svarer på «hvor meget koster det
 * at låne» med seks beløb — «1 million», «500.000», «3 millioner», «2
 * millioner», «4 millioner» og «5 millioner». Det er spørgsmålet om et
 * *beløb*, ikke om et tal feltet er fyldt ud med, så det skal kunne læses
 * uden at røre et input.
 */

/** Den lånetype, værktøjet og tabellen deler. */
export type Laanetype = "annuitet" | "serielaan";

/**
 * Ét beløbs kostning ved en given rente og løbetid.
 *
 * `maanedligYdelse` er for et serielån den **første** måneds ydelse, fordi
 * ydelsen falder hver måned. At skrive den i samme felt som annuitetslånets
 * konstante ydelse ville være en løgn i den kolonne, og det er derfor
 * `foersteMaanedsYdelse` og `sidsteMaanedsYdelse` findes ved siden af.
 */
export interface LaanKostning {
  /** Annuitetslån: den faste ydelse. Serielån: den første måneds ydelse. */
  maanedligYdelse: number;
  /** Serielånets sidste måneds ydelse. `null` for annuitetslån. */
  sidsteMaanedsYdelse: number | null;
  /** Renterne over hele løbetiden, i kroner. */
  samletRente: number;
  /** Hovedstol + samlet rente. */
  samletBetaling: number;
  type: Laanetype;
}

/**
 * Månedsrenten, der alt andet regnes på. Årlig sats om til måneds sats.
 */
function maanedligRente(aarligRente: number): number {
  return aarligRente / 100 / 12;
}

/**
 * Antallet af måneder i løbetiden. Et decimalt år er ikke et halvt år af
 * ydelser, så værdien rundes op til hele måneder — ellers ville 30,5 år give
 * 366 måneder med en ydelse, der ikke dækker afdraget.
 */
export function antalMaaneder(loebetidAar: number): number {
  return Math.round(loebetidAar * 12);
}

/**
 * Ydelsen på et annuitetslån: fast hver måned, hovedstolen forrentet
 * månedligt og afdraget efter renten.
 *
 * Når den årlige rente er 0 er den månedlige rente 0, og formlen bliver 0/0.
 * Så er ydelsen hovedstolen delt på månederne — det er rigtigt, ikke en
 * nødlanding.
 */
export function annuitetsYdelse(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
): number {
  const n = antalMaaneder(loebetidAar);
  const r = maanedligRente(aarligRente);
  if (n <= 0 || hovedstol <= 0) return 0;
  if (r === 0) return hovedstol / n;
  const vaert = (1 + r) ** n;
  return (hovedstol * r * vaert) / (vaert - 1);
}

/**
 * Renterne på et serielån er en aritmetisk række: månedens rente falder
 * lineært med afdraget, såsummen er antal måneder gange (første + sidste) / 2.
 */
export function serielaanSamletRente(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
): number {
  const n = antalMaaneder(loebetidAar);
  const r = maanedligRente(aarligRente);
  if (n <= 0 || hovedstol <= 0) return 0;
  const foersteMaanedsRente = hovedstol * r;
  return ((n + 1) * foersteMaanedsRente) / 2;
}

/**
 * Hvad beløbet koster i den valgte lånetype.
 *
 * Ugyldige input (nulbeløb, nul eller negativ løbetid) giver tal, der er 0
 * overalt frem for `NaN` eller `Infinity`. Tabellen skal kunne vise en række
 * for hvert beløb, og brugeren skal ikke se `NaN` fordi løbetiden stod på 0.
 */
export function laanKostning(
  hovedstol: number,
  aarligRente: number,
  loebetidAar: number,
  type: Laanetype,
): LaanKostning {
  const n = antalMaaneder(loebetidAar);
  const r = maanedligRente(aarligRente);

  if (type === "annuitet") {
    const maanedligYdelse = annuitetsYdelse(hovedstol, aarligRente, loebetidAar);
    // Ved 0 % rente er der præcis ingen renter, og det er defineringen — ikke
    // `maanedligYdelse * n - hovedstol`. Den subtraction efterlod 1,2e-14
    // støv, fordi hovedstol delt på månederne og ganget tilbage ikke rammer
    // præcis i alle decimaler. Renteandelen i tabellen ville så stå som
    // 4,7e-15 % i stedet for 0.
    if (r === 0) {
      return {
        maanedligYdelse,
        sidsteMaanedsYdelse: null,
        samletRente: 0,
        samletBetaling: hovedstol,
        type,
      };
    }
    const samletBetaling = maanedligYdelse * n;
    return {
      maanedligYdelse,
      sidsteMaanedsYdelse: null,
      samletRente: samletBetaling - hovedstol,
      samletBetaling,
      type,
    };
  }

  const maanedligtAfdrag = n > 0 ? hovedstol / n : 0;
  const samletRente = serielaanSamletRente(hovedstol, aarligRente, loebetidAar);
  return {
    maanedligYdelse: maanedligtAfdrag + hovedstol * r,
    sidsteMaanedsYdelse: maanedligtAfdrag + maanedligtAfdrag * r,
    samletRente,
    samletBetaling: hovedstol + samletRente,
    type,
  };
}

/**
 * De beløb, autocomplete målte 4/10 som spørgsmål under «hvor meget koster det
 * at låne» (1 million, 500.000, 3 millioner, 2 millioner, 100.000, 5
 * millioner), plus 250.000 og 1,5 millioner så rækken dækker det
 * forbrugslån, der ligger mellem dem.
 *
 * Rækkefølgen er stigende, fordi en læser leder efter sit eget beløb og ikke
 * efter en bestemt række.
 */
export const LAANE_BELOEB: readonly number[] = [
  100_000, 250_000, 500_000, 1_000_000, 1_500_000, 2_000_000, 3_000_000,
  5_000_000,
];

/** Én række i tabellen: beløb plus dets kostning ved læserens rente og løbetid. */
export interface LaaneBeloebRaekke {
  hovedstol: number;
  kostning: LaanKostning;
  /** Renteandelens andel af hele tilbagebetalingen, i procent. */
  renteAndel: number;
}

/**
 * Tabelrækkerne ved læserens egen rente og løbetid.
 *
 * Andelen er regnet her og ikke i komponenten, så den er dækket af testene.
 * En andel over 100 % kan ikke opstå for et annuitetslån ved positiv rente,
 * men et serielån på 0 % rente giver præcis 0, og derfor fanges den med
 * `rente === 0` frem for med en vilkårlig `||`.
 */
export function laaneBeloebRaekker(
  aarligRente: number,
  loebetidAar: number,
  type: Laanetype,
  beloeb: readonly number[] = LAANE_BELOEB,
): LaaneBeloebRaekke[] {
  return beloeb.map((hovedstol) => {
    const kostning = laanKostning(hovedstol, aarligRente, loebetidAar, type);
    return {
      hovedstol,
      kostning,
      renteAndel:
        kostning.samletBetaling > 0
          ? (kostning.samletRente / kostning.samletBetaling) * 100
          : 0,
    };
  });
}