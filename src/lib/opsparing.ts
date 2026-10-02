/**
 * Opsparing: simuleringen af en opsparing og de to eksempler, der står under
 * brødteksten på `/opsparing`.
 *
 * Formlerne er ren aritmetik, så intet her har brug for en ekstern kilde. Det
 * er den **samme** `simulerOpsparing`, `OpsparingsBeregner.tsx` bruger til sit
 * resultat, og den **samme** funktion der danner eksemplerne — så et tal i
 * brødteksten ikke kan glide fra det, værktøjet viser for de samme indgange.
 *
 * Før denne samling lå alle ti beløb i eksemplerne håndskrevet i `page.tsx` —
 * fem i hvert sprog, med forskellige tusindtalsseparatorer (dansk `43.219`,
 * svensk `432 194`). De var ikke forkerte i sig selv, men de hang ved ingen:
 * «Person A … 1,5 mio kr» var ikke et resultat af nogen beregning, så ingen
 * kunne finde ud af, hvilke indgange der gav det, eller om de passede med
 * beregnerens standardindstilling. Eksemplerne bruger derfor den forrentning,
 * `OpsparingsBeregner` står med, og viser det præcise beløb frem for «1,5 mio».
 */

/** Hvor ofte renten tilskrives. `aarlig` er beregnerens standard. */
export type RenteFrekvens = "maanedlig" | "kvartal" | "aarlig";

export interface AarData {
  aar: number;
  saldo: number;
  indskud: number;
  rente: number;
}

export interface OpsparingResultat {
  slutSaldo: number;
  samletIndskud: number;
  samletRente: number;
  aarligData: AarData[];
}

/**
 * Simulerer en opsparing måned for måned: indbetalingen lægges til, og renten
 * tilskrives når perioden er slut. Indskuddet tæller altså med i den måned,
 * renten tilskrives, hvilket er en almindelig ydelse-før-rente.
 */
export function simulerOpsparing(
  startBeloeb: number,
  maanedligIndbetaling: number,
  aarligRentePct: number,
  periodeAar: number,
  renteFrekvens: RenteFrekvens
): OpsparingResultat {
  let perioderPerAar: number;
  let maanederPerPeriode: number;

  switch (renteFrekvens) {
    case "maanedlig":
      perioderPerAar = 12;
      maanederPerPeriode = 1;
      break;
    case "kvartal":
      perioderPerAar = 4;
      maanederPerPeriode = 3;
      break;
    case "aarlig":
    default:
      perioderPerAar = 1;
      maanederPerPeriode = 12;
  }

  const periodiskRente = aarligRentePct / 100 / perioderPerAar;
  const antalMaaneder = periodeAar * 12;

  let saldo = startBeloeb;
  let samletIndskud = startBeloeb;
  let samletRente = 0;
  const aarligData: AarData[] = [];

  for (let maaned = 1; maaned <= antalMaaneder; maaned++) {
    saldo += maanedligIndbetaling;
    samletIndskud += maanedligIndbetaling;

    if (maaned % maanederPerPeriode === 0) {
      const renteBeloeb = saldo * periodiskRente;
      saldo += renteBeloeb;
      samletRente += renteBeloeb;
    }

    if (maaned % 12 === 0) {
      aarligData.push({
        aar: maaned / 12,
        saldo,
        indskud: samletIndskud,
        rente: samletRente,
      });
    }
  }

  return { slutSaldo: saldo, samletIndskud, samletRente, aarligData };
}

/**
 * Enkel rente: hovedstolen vokser med sin egen årlige rente hvert år og
 * intet mere. Det er modsætningen til renters rente i eksemplet under
 * brødteksten, ikke en funktion beregneren bruger.
 */
export function enkelRente(startBeloeb: number, aarligRentePct: number, aar: number): number {
  return startBeloeb * (1 + (aarligRentePct / 100) * aar);
}

/** Sprog, `/opsparing` har brødtekst for. `no` faller tilbage på dansk. */
export type OpsparingSprog = "da" | "se";

/** Rentesats og løbetid er de samme i begge sprog, så de er konstanter. */
export const RENTERS_RENTE_PCT = 5;
export const RENTERS_RENTE_AAR = 30;

/**
 * Startbeløbet i «Kraften i renters rente». Det er det eneste, der adskiller
 * sprogene: dansk bruger 10.000 kr, svensk 100.000 kr, så resultatet bliver
 * henholdsvis 43.219 kr og 432.194 kr — tusindtalsseparatoren kommer fra
 * sidens egen formattering, ikke fra en håndskrevet streng.
 */
export const RENTERS_RENTE_START: Record<OpsparingSprog, number> = { da: 10000, se: 100000 };

export interface RentersRenteEksempel {
  startBeloeb: number;
  aarligRentePct: number;
  aar: number;
  /** Slutsaldo med enkel rente. */
  uden: number;
  /** Slutsaldo med renters rente, som `simulerOpsparing` regner den. */
  med: number;
}

/**
 * «Uden renters rente» mod «med renters rente» for ét sprog, begge dele regnet
 * med den forrentning `OpsparingsBeregner` har som standard.
 */
export function rentersRenteEksempel(sprog: OpsparingSprog): RentersRenteEksempel {
  const startBeloeb = RENTERS_RENTE_START[sprog];
  return {
    startBeloeb,
    aarligRentePct: RENTERS_RENTE_PCT,
    aar: RENTERS_RENTE_AAR,
    uden: enkelRente(startBeloeb, RENTERS_RENTE_PCT, RENTERS_RENTE_AAR),
    med: simulerOpsparing(startBeloeb, 0, RENTERS_RENTE_PCT, RENTERS_RENTE_AAR, "aarlig").slutSaldo,
  };
}

/**
 * «Eksempel: Tid vs. beløb». Kun de fire input er håndskrevne — alder,
 * månedligt beløb, år og rente — alt andet er beregnet, så en række ikke kan
 * have sin egen fortælling.
 */
export const TID_VS_BELOEB: {
  alder: number;
  maanedlig: number;
  aar: number;
  aarligRentePct: number;
}[] = [
  { alder: 25, maanedlig: 1000, aar: 40, aarligRentePct: 5 },
  { alder: 35, maanedlig: 2000, aar: 30, aarligRentePct: 5 },
];

export interface TidVsBeloebRaekke {
  alder: number;
  maanedlig: number;
  aar: number;
  aarligRentePct: number;
  /** Hvad der er sat ind i alt, altså alle månedlige beløb. */
  indskud: number;
  /** Hvad der står til sidst. */
  slutSaldo: number;
}

export interface TidVsBeloeb {
  a: TidVsBeloebRaekke;
  b: TidVsBeloebRaekke;
  /** Hvad B har indbetalt mere end A. */
  forskelIndbetalet: number;
  /** Hvad B har mere til sidst end A. */
  forskelSlutSaldo: number;
}

/**
 * De to rækker med deres resultater, regnet med den samme `simulerOpsparing`
 * som værktøjet. `forskelIndbetalet` og `forskelSlutSaldo` er pointen med
 * eksemplet: B betaler 240.000 kr mere ind og har 152.182 kr mere til sidst.
 */
export function tidVsBeloeb(): TidVsBeloeb {
  const raekker = TID_VS_BELOEB.map((input) => {
    const sim = simulerOpsparing(
      0,
      input.maanedlig,
      input.aarligRentePct,
      input.aar,
      "aarlig",
    );
    return { ...input, indskud: sim.samletIndskud, slutSaldo: sim.slutSaldo };
  });
  const [a, b] = raekker;
  return {
    a,
    b,
    forskelIndbetalet: b.indskud - a.indskud,
    forskelSlutSaldo: b.slutSaldo - a.slutSaldo,
  };
}