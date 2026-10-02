/**
 * De svenske strenge på `/leasing`, der citerer kalkylatorens standardeksempel.
 *
 * Før 2/10 stod «300.000 kr», «150.000 kr», «4,5 %», «30.000 kr», «36», «4.121 kr»,
 * «178.350 kr» og «28.350 kr» som rå tekst i titel, description, metaDescription,
 * ogDescription og schemaDescription samt i tre af FAQ-svar — og `FAQSchema`
 * læser præcis `faqItems`, så de var ikke bare brødtekst men tal i Googles rich
 * resultat. Samme fejlklasse som `/procent`, `/vaegttab` og `/renteberegner`.
 *
 * De læses nu fra `LEASING_EKSEMPEL` + `beregnLeasing` — de samme to ting
 * `LeasingBeregner` bruger til at starte med — så et eksempel der ændrer sig,
 * ændrer sig ét sted, og brugeren ikke kan få en titel der lover 4 121 kr og en
 * beregner der viser noget andet.
 *
 * Tusindtalsseparatoren skriver sproget selv: `formatBelob(…, "se")` giver
 * «300 000» med mellemrum, som er svensk bokmål og som de andre svenske sider
 * allerede bruger. Før stod der «300.000» med dansk punktum.
 *
 * Kun `se` har denne brødtekst. Dansk og norsk har generiske FAQ'er uden
 * beløb, så de får tekster, når de oversættes.
 */

import { LEASING_EKSEMPEL, beregnLeasing } from "./leasing";
import { formatBelob } from "./format";

export interface LeasingEksempelTekster {
  title: string;
  description: string;
  metaDescription: string;
  ogDescription: string;
  schemaDescription: string;
  faqKostnadQuestion: string;
  faqKostnadAnswer: string;
  faqVaerdetabAnswer: string;
  faqFaretagAnswer: string;
}

/**
 * De svenske metadata- og FAQ-strenge, regnet på `LEASING_EKSEMPEL`.
 *
 * Kaster ikke: `beregnLeasing` svarer `null` kun på ikke-positive beløb, og
 * `LEASING_EKSEMPEL` er et konstant objekt med positive tal. Uden et `null`
 * ville hver streng få `!`, og det er præcis den slags fejl der slipper igennem
 * en gate.
 */
export function leasingSeEksempelTekster(): LeasingEksempelTekster {
  const resultat = beregnLeasing(LEASING_EKSEMPEL);
  if (!resultat) {
    throw new Error("LEASING_EKSEMPEL kan ikke give et negativt resultat");
  }

  const pris = formatBelob(LEASING_EKSEMPEL.bilpris, "se");
  const rest = formatBelob(LEASING_EKSEMPEL.restvaerdi, "se");
  const rente = formatBelob(LEASING_EKSEMPEL.rentesats, "se", 1);
  const indskud = formatBelob(LEASING_EKSEMPEL.udbetaling, "se");
  const maaneder = formatBelob(LEASING_EKSEMPEL.loebetid, "se");
  const perMaanad = formatBelob(resultat.maanedligYdelse, "se");
  const totalt = formatBelob(resultat.totalLeasing, "se");
  const renteBelob = formatBelob(resultat.totalRente, "se");
  const vaerdtab = formatBelob(resultat.vaerdtab, "se");

  // To hållformer af forudsætningerne: beskrivelsen siger «löptid» (det er et
  // løbende lejemål), metadataen «mån» (Google klipper titlen ved ~60 tegn).
  // Skrevet ud fra talene to steder, ikke ved at `.replace()`e i en færdig
  // sætning — en sådan substring-udskiftning er præcis den slags kode der
  // går i stykker, når et tal ændrer sig.
  const forudsætninger =
    `${pris} kr med ${rest} kr i restvärde, ${rente} % ränta, ` +
    `${indskud} kr i kontantinsats och ${maaneder} månaders löptid`;
  const forudsætningerKort =
    `${pris} kr med ${rest} kr i restvärde, ${rente} % ränta, ` +
    `${indskud} kr i kontantinsats och ${maaneder} mån`;
  const meta =
    `Bil på ${forudsætningerKort}: ${perMaanad} kr i leasingkostnad per månad.`;

  return {
    title: `Leasingkalkylator: bil på ${pris} kr = ${perMaanad} kr/mån`,
    description:
      `En bil på ${forudsætninger} ger ${perMaanad} kr i leasingkostnad per månad ` +
      `och ${totalt} kr totalt inklusive ${renteBelob} kr i ränta.`,
    metaDescription: meta,
    ogDescription: meta,
    schemaDescription:
      `Beräkna leasingkostnad per månad och jämför leasing med billån. ` +
      `En bil på ${pris} kr med ${rest} kr i restvärde kostar ${perMaanad} kr per månad ` +
      `över ${maaneder} månader.`,
    faqKostnadQuestion: `Vad kostar leasing av en bil på ${pris} kr?`,
    faqKostnadAnswer:
      `Med ${rest} kr i restvärde, ${rente} % ränta, ${indskud} kr i kontantinsats ` +
      `och ${maaneder} månaders löptid blir månadskostnaden ${perMaanad} kr, ` +
      `vilket är ${totalt} kr totalt inklusive ${renteBelob} kr i ränta.`,
    faqVaerdetabAnswer:
      `Värdetabet är bilpriset minus restvärdet. Med ${pris} kr i bilpris och ` +
      `${rest} kr i restvärde är det ${vaerdtab} kr. Det är det belopp du betalar ` +
      `för att bilen tappar värde under löptiden.`,
    faqFaretagAnswer:
      `Fåretagsleasing är det vanliga namnet på leasing av bil i Sverige. ` +
      `Kalkylatorn räknar ut månadskostnaden av bilpris, kontantinsats, ränta, ` +
      `restvärde och löptid: en bil på ${pris} kr med ${rest} kr i restvärde, ` +
      `${rente} % ränta, ${indskud} kr i kontantinsats och ${maaneder} månader ger ` +
      `${perMaanad} kr i leasingkostnad per månad. Den räknar inte ut skatten, ` +
      `eftersom det beror på om leasingen drivs i näringsverksamhet eller privat.`,
  };
}