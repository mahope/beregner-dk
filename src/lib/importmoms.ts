/**
 * Moms og told paa varer, der koebes uden for EU — Temu, Shein, AliExpress og
 * alle de andre netbutikker, der sender uden for EU's toldunion.
 *
 * KALDET kommer fra dansk autocomplete 6/10 21:5x: under «moms kalkulator»
 * staar **«import moms kalkulator»** og **«told og moms kalkulator»**, under
 * «moms beregner» staar **«told moms beregner»**, og under «moms paa» staar
 * **«moms paa temu»** — sammen med «moms paa boger» og «moms paa fodevarer»,
 * som siden for allerede svarer. /moms har 24.464 visninger i GSC (6/10) paa
 * pos. 5-8 med 0,2 % CTR, saa det er den fjerdestoeerede side i sitet og den
 * eneste af de fire, der ikke havde et vaerktoj til denne slags koeb.
 *
 * KILDER (laest 6/10 2026, alle med et citat i dokumentationen):
 * - **Momsloven (ML) § 32 stk. 1**: «Momsgrundlaget er ... toldvaerdien
 *   tillagt eventuel told og andre afgaifter, der er foranlediget af
 *   indfoerslen.» — saa tolden og fragten **med** i momsgrundlaget
 *   (info.skat.dk, D.A.8.3.2 og D.A.3.3). Samme regel staar i
 *   momsdirektivets artikel 74, saa den gelder i hele EU.
 * - **ML § 33**: «Afgiften udgoer 25 pct. af afgiftsgrundlaget.»
 * - **Raadets forordning (EU) 2026/382** artikel 1 og 2: kapitel V i
 *   forordning (EF) nr. 1186/2009 er slettet, og **fra 1. juli 2026** er der
 *   i stedet **3 EUR pr. varepost** i en forsendelse under 150 EUR — indtil
 *   1. juli 2028. (eur-lex.europa.eu/eli/reg/2026/382)
 * - **Toldstyrelsen**: «For varer i pakker med en samlet vaerdi paa 150 euro
 *   eller derunder bliver der fra 1. juli 2026 lagt en told paa 3 euro pr.
 *   varepost overi prisen.» (toldst.dk/borger/internethandel/internethandel-
 *   uden-for-eu, laest 6/10 2026)
 *
 * **To ting er bevidst ikke sande her**, og det er derfor de staar som
 * «ca.»-vaerdier og ikke som belob:
 * - Grensen er **150 EUR**. skat.dk og toldst.dk giver den ved siden af som
 *   «ca. 1.150 kr.», og ingen dansk officiel side giver et fast, bindende
 *   kr.-belob. Vaerktojet bruger alligevel de 1.150 kr. i sammenligningen, fordi
 *   det er myndighedernes egen omregning — men tallet vises altid ved siden af
 *   «150 EUR», saa ingen kan laese det som et dansk lovbelob.
 * - Toldbelobet er **3 EUR**, der paa de samme sider staar som «ca. 22 kr.».
 *
 * Over 150 EUR er der **ingen generel toldsats** — skat.dk skriver, at toldsatsen
 * «er forskellig, afhaengig af hvilke varer du koeber, og nogle varer er der
 * slet ikke told paa». Derfor tager vaerktojet **toldsatsen som et input** i
 * stedet for at giske en sats for toj eller elektronik; feltsummen paa siden
 * siger, hvilken kode i EU's toldtarif lederen skal slaa op.
 *
 * Kun tal og id'er heri — ingen sprogstroenge (samme regel som
 * `fart-omregner.ts`), saa en dansk streng ikke kan laekke til beraknare.se.
 */

/** ML § 33: dansk moms udgoer 25 pct. af afgiftsgrundlaget. */
export const MOMS_UDEN_FOR_EU = 25;

/** Artikel 2 i forordning (EU) 2026/382: 3 EUR pr. varepost fra 1. juli 2026. */
export const TOLD_FLAT_EUR_PR_VARELINJE = 3;

/**
 * Toldstyrelsens egen ca.-omregning af de 3 EUR, «ca. 22 kr.». Den **er** det
 * beloeb, der gaelder i praksis, fordi tolden opkræves i EUR — men den kaldes
 * «ca.» paa den officielle side, saa den og `TOLD_FLAT_EUR_PR_VARELINJE`
 * udskrives begge, og ingen af dem er et dansk lovbeloeb.
 */
export const TOLD_FLAT_KR_PR_VARELINJE_OMRUND = 22;

/**
 * Skattekortet, der adskiller de to toldregler. Varer under eller paa 150 EUR
 * egenvaerdi har 3 EUR pr. varepost; derover har de den tarifmaessige sats,
 * som lederen skal finde i EU's toldtarif.
 */
export const EGENVAERDI_GRENSE_EUR = 150;

/**
 * «ca. 1.150 kr.» — saadan giver skat.dk og toldst.dk 150 EUR, og saadan
 * skriver laeseren det. **Den vaerdi bruges i sammenligningen**, fordi det er
 * den eneste danske omregning de to myndigheder selv har offentliggjort, og
 * fordi det er den laeserne kender. Den er derfor vist ved siden af
 * «150 EUR» hver gang den dukker op, og den er ikke noget belob, nogen
 * myndighed har fastsat i kroner.
 */
export const EGENVAERDI_GRENSE_KR_OMRUND = 1150;

/** Da tolden fra 1. juli 2026 gaelder, og til den 1. juli 2028. */
export const TOLD_FLAT_GAELDER_FRA = "2026-07-01";

export interface ImportmomsInput {
  /**
   * Varens egenvaerdi i kroner **uden fragt**. Skaet er egenvaerdien, der
   * avgor om 3 EUR-reglen gaelder, ikke belobet inkl. fragt — skat.dk skriver
   * direkte: «Naar du beregner, hvor meget du har koebt for, skal du ikke
   * regne fragten med.»
   */
  egenvaerdi: number;
  /** Fragt og forsikring frem til EU i kroner. Gaar med i momsgrundlaget. */
  fragt: number;
  /** Antal vareposter i pakken — en varepost er en tariflinje, ikke et antal. */
  vareposter: number;
  /**
   * Told i procent af vaerdi + fragt. Bruges kun over 150 EUR, fordi der under
   * er den faste 3 EUR pr. varepost i stedet.
   */
  toldsats?: number;
}

export interface ImportmomsResultat {
  egenvaerdi: number;
  fragt: number;
  /** Vaerdi + fragt: det, tolden regnes af, naar toldsatsen er valgt. */
  toldgrundlag: number;
  told: number;
  /** Toldvaerdien + told + fragt, altsa ML § 32 stk. 1's afgiftsgrundlag. */
  momsgrundlag: number;
  moms: number;
  /** Hvad varen kommer til at koste i alt, naar told og moms er lagt paa. */
  iAlt: number;
  /** Sandt naar egenvaerdien er under eller paa 150 EUR (3 EUR pr. varepost). */
  laevVaerdi: boolean;
  vareposter: number;
}

/**
 * Kun endelige tal, og ingen negative belob eller vareposter. Vareposter skal
 * vaere et helt tal, fordi tolden opkraeves pr. **varepost** — 2,5 varepost
 * findes ikke, og 0 vareposter ville give en pakke uden told.
 */
export function erGyldigImportmoms(input: ImportmomsInput): boolean {
  const { egenvaerdi, fragt, vareposter, toldsats } = input;
  if (!Number.isFinite(egenvaerdi) || !Number.isFinite(fragt) || !Number.isFinite(vareposter)) {
    return false;
  }
  if (egenvaerdi < 0 || fragt < 0 || vareposter < 1) return false;
  if (!Number.isInteger(vareposter)) return false;
  if (toldsats !== undefined && (!Number.isFinite(toldsats) || toldsats < 0)) return false;
  return true;
}

/**
 * Regnestykket for en vare uden for EU. Ingen mellemrunde: tolden er et helt
 * belob pr. varepost, og momsgrundlaget er summen — saa en laeser kan
 * efterprove præcis de tal, vaerktojet viser.
 *
 * Ugyldig indtastning giver `null`, saa vaerktojet kan vise en tom tilstand i
 * stedet for at regne videre paa `NaN`.
 */
export function beregnImportmoms(input: ImportmomsInput): ImportmomsResultat | null {
  if (!erGyldigImportmoms(input)) return null;
  const { egenvaerdi, fragt, vareposter } = input;
  const toldgrundlag = egenvaerdi + fragt;
  const laevVaerdi = egenvaerdi <= EGENVAERDI_GRENSE_KR_OMRUND;
  // Under eller paa grænsen er der 3 EUR pr. varepost; derover den sats
  // lederen selv har fundet i EU's toldtarif.
  const told = laevVaerdi
    ? vareposter * TOLD_FLAT_KR_PR_VARELINJE_OMRUND
    : toldgrundlag * ((input.toldsats ?? 0) / 100);
  const momsgrundlag = toldgrundlag + told;
  const moms = momsgrundlag * (MOMS_UDEN_FOR_EU / 100);
  return {
    egenvaerdi,
    fragt,
    toldgrundlag,
    told,
    momsgrundlag,
    moms,
    iAlt: momsgrundlag + moms,
    laevVaerdi,
    vareposter,
  };
}

/**
 * Det eksempel vaerktojet og sidens brødtekst fortæller: en Temu-pakke med tre
 * vareposter til 800 kr. og 100 kr. fragt. Det er 3 × 22 = 66 kr. i told, saa
 * momsgrundlaget er 966 kr. og momsen 241,50 kr.
 */
export const IMPORTMOMS_EKEMPEL: ImportmomsInput = {
  egenvaerdi: 800,
  fragt: 100,
  vareposter: 3,
};