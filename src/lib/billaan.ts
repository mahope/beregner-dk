/**
 * Billån: annuitetsberegningen på et billån, og de eksempeltabeller der står
 * under brødteksten på `/billaan`.
 *
 * Formlerne er ren aritmetik, så intet her har brug for en ekstern kilde. Det
 * er den **samme** funktion, `BillaanBeregner.tsx` bruger til sit resultat, og
 * den **samme** funktion der danner eksemplerne — så et tal i tabellen kan ikke
 * længere glide fra den månedlige ydelse, som står i kolonnen ved siden af.
 *
 * ## Begreberne, fordi de før var tre forskellige
 *
 * - **Lånebeløb** = bilens pris minus udbetalingen. Det er det beløb banken
 *   udbetaler, og det er det `BillaanBeregner.tsx` har anvendt hele tiden.
 * - **Samlet omkostning** = alle månedlige ydelser *plus* udbetalingen, altså
 *   hvad bilen koster i alt.
 *
 * Før denne samling var de to eksempeltabeller håndskrevne og de mente tre
 * ting: den danske laante på hele prisen og satte samlet omkostning til
 * ydelserne alene, den svenske laante på prisen minus udbetalingen og satte
 * samlet omkostning til ydelserne plus udbetalingen. Og to af de tre danske
 * rækker bar «6 %» i rentekolonnen, mens månedlig ydelse var den for 7 %.
 *
 * Den tredje fejl lå i selve beregnerens ÅOP: formlen manglede faktor 2, så
 * den viste 3,46 % for et 6,5 %-lån. Se `beregnBillaan`.
 */

export interface BillaanInput {
  /** Bilens samlede pris inkl. moms. */
  bilpris: number;
  /** Udbetaling ved købet. */
  udbetaling: number;
  /** Løbetid i måneder. */
  loebetid: number;
  /** Nominal rentesats i procent pr. år. */
  rentesats: number;
}

export interface BillaanResultat {
  /** Bilens pris minus udbetalingen. */
  laanebelob: number;
  /** Månedlig ydelse på annuitetsformlen, uden afrunding. */
  maanedligYdelse: number;
  /** Alle månedlige ydelser tilsammen, uden afrunding. */
  samletBelob: number;
  /** `samletBelob` minus lånebeløbet. */
  samletRente: number;
  /**
   * Tilnærmet årlig omkostning i procent (den såkaldte APR-metode).
   *
   * Den lå ved `TERMINER_PR_AAR × renteudgift`, altså det halve af den
   * årlige omkostning. Se `beregnBillaan`.
   */
  apr: number;
}

/** Antal terminer pr. år i ydelsesformlen. */
const TERMINER_PR_AAR = 12;

/**
 * Den månedlige ydelse på et annuitetslån:
 *
 *   ydelse = lån × r × (1 + r)^n / ((1 + r)^n − 1)
 *
 * hvor `r` er den månedlige rente. En rente på 0 % er ikke et annuitetslån,
 * men den simple fordeling lånet over månedernes antal, så den har sit eget
 * fald — ellers ville `(1 + 0)^n − 1` være 0.
 */
function ydelsePaaAnnuitaet(laanebelob: number, maanedligRente: number, antalBetalinger: number): number {
  if (maanedligRente === 0) return laanebelob / antalBetalinger;
  const faktor = Math.pow(1 + maanedligRente, antalBetalinger);
  return (laanebelob * maanedligRente * faktor) / (faktor - 1);
}

/**
 * Billånet for én bil. Resultatet er **uaf rundet** — det er UI'et, der
 * afrunder til hele kroner med sin egen tusindtalsseparator.
 */
export function beregnBillaan(input: BillaanInput): BillaanResultat {
  const { bilpris, udbetaling, loebetid, rentesats } = input;
  const laanebelob = bilpris - udbetaling;
  const maanedligRente = rentesats / 100 / TERMINER_PR_AAR;
  const maanedligYdelse = ydelsePaaAnnuitaet(laanebelob, maanedligRente, loebetid);
  const samletBelob = maanedligYdelse * loebetid;
  const samletRente = samletBelob - laanebelob;

  // APR-metoden: den del af renteudgiften der falder på den gennemsnitlige
  // restgæld, og resten af året — altså 2 × terminer pr. år × renteudgift delt
  // med lånebeløb × (n + 1). Faktoren 2 er ikke valgfri: uden den bliver
  // resultatet *lavere end den nominelle rente* (3,46 % for et 6,5 %-lån), og en
  // årlig omkostning i procent kan ikke ligge under den rente den er værd af.
  // Gebyrerne holdes på 0 — de er ikke en del af lånets annuitet, og en sats
  // der ikke står i modellen må ikke gættes.
  const samletGebyr = 0;
  const apr =
    ((TERMINER_PR_AAR * 2 * samletRente) / (laanebelob * (loebetid + 1))) * 100 +
    (samletGebyr / (laanebelob / 2)) * 100;

  return { laanebelob, maanedligYdelse, samletBelob, samletRente, apr };
}

/** De to sprog, `/billaan` har en brødtekst til. */
export type BillaanSprog = "da" | "se";

/**
 * Eksemplerne under brødteksten. Kun **fire** tal pr. række er input, resten
 * er beregnet, så en række ikke kan have sin egen fortælling.
 *
 * Dansk: 10 % udbetaling på priserne 100.000/200.000/300.000 kr til 6 %,
 * løbetider 5 og 7 år — samme forhold som før, nu med den rigtige ydelse.
 *
 * Svensk: 20 % udbetaling på 150.000/250.000/350.000 kr til 7 %, 5 og 7 år.
 */
export const BILLAAN_EKSEMPLER: Record<BillaanSprog, BillaanInput[]> = {
  da: [
    { bilpris: 100000, udbetaling: 10000, loebetid: 60, rentesats: 6 },
    { bilpris: 200000, udbetaling: 20000, loebetid: 84, rentesats: 6 },
    { bilpris: 300000, udbetaling: 30000, loebetid: 84, rentesats: 6 },
  ],
  se: [
    { bilpris: 150000, udbetaling: 30000, loebetid: 60, rentesats: 7 },
    { bilpris: 250000, udbetaling: 50000, loebetid: 84, rentesats: 7 },
    { bilpris: 350000, udbetaling: 70000, loebetid: 84, rentesats: 7 },
  ],
};

/** Én række i eksempeltabellen: input plus alt, hvad tabellen viser. */
export interface BillaanEksempelRaekke extends BillaanInput, BillaanResultat {
  /** Alle ydelserne plus udbetalingen, altså bilens samlede pris. */
  samletOmkostning: number;
}

/**
 * Eksempeltabellen for et sprog. Hver række gennemgår den samme
 * `beregnBillaan` som selve beregneren, så tabellen og kalkulatoren ikke kan
 * komme ud af trit.
 */
export function billaanEksempler(sprog: BillaanSprog): BillaanEksempelRaekke[] {
  return BILLAAN_EKSEMPLER[sprog].map((input) => {
    const resultat = beregnBillaan(input);
    return { ...input, ...resultat, samletOmkostning: resultat.samletBelob + input.udbetaling };
  });
}