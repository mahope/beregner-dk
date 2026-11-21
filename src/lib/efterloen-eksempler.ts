/**
 * De tal `/efterloen` gentager i sin egen metadata og i tre af sidens otte
 * FAQ-svar.
 *
 * `efterloen.ts` er kilde til begge dele: `EFTERLOEN_MAX_SATS` til satsen
 * (dagpengelovens 91 % / 100 % af `DAGPENGE_2026.fuldtid`) og
 * `SKATTEFRI_PRAEMIE_2026` til timer, portioner og portionsbeløb. Svarene i
 * `page-data.ts` havde alle tal skrevet i hånden, hvilket er den drift,
 * kvalitetsregel 11 beskriver: i 2027 flytter dagpengesatsen og
 * præmiebeløbet sig i modulerne, beregneren flytter med, og søgeresultatet
 * lover stadig sidste års tal. Svarerne er ikke kun brødtekst —
 * `FAQSchema` publicerer dem som JSON-LD, så Google citerer dem.
 *
 * Dansk er byte-uændret, med to undtagelser der begge er rettelser:
 *
 * - **«91%» blev «91 %».** `metaDescription` på den samme side skrev «91 %»,
 *   så den ene af de to beskrivelser modsagde den anden, og resten af sitet
 *   (og `pension-eksempler`) skriver procenttal med mellemrum.
 * - **Satsen er regnet, ikke gentaget.** «20.057 kr.» er
 *   `Math.round(22.041 × 0,91)`, så den kan ikke overleve en dagpengesats,
 *   modulet ikke kender.
 *
 * Intervallet i «Hvad er efterlønspræmien?» er de to portionsbeløb fra
 * modulet, og timerne i «Kan jeg arbejde mens jeg er på efterløn?» er
 * `timerPerPortion`, `maxPortioner` og deres produkt `MAX_TIMER_TIL_PRAEMIE` —
 * altså de tal `praemiePortioner()` selv regner på. De fire spørgsmål uden
 * tal bliver stående i `page-data.ts`, så denne liste kun har dem der kan
 * glide.
 *
 * Alderafsnittet i «Hvornår kan jeg gå på efterløn?» nævner ingen beløb, så
 * porten dømmer det ikke. Det er i stedet **verificeret** i
 * `efterloen-eksempler.test.ts` mod `EFTERLOEN_ALDER_2026`, så påstanden kan
 * ikke blive en anden sandhed end tabellen borger.dk giver.
 */

import {
  EFTERLOEN_ALDER_2026,
  EFTERLOEN_MAX_SATS,
  EFTERLOEN_SATS_PROCENT,
  MAX_TIMER_TIL_PRAEMIE,
  SKATTEFRI_PRAEMIE_2026,
} from "./efterloen";
import { formatBelob } from "./format";

/** Den danske læser, så modulet har én separator, og siden har én til. */
const DA = "da" as const;

const kr = (vaerdi: number) => formatBelob(vaerdi, DA);
/** «91 %» — procenttal i løbende tekst, med komma på dansk. */
const pct = (vaerdi: number) => `${formatBelob(vaerdi * 100, DA)} %`;
/** «20.057 kr.» — enheden med punktum, som de to beskrivelser skriver. */
const krDot = (vaerdi: number) => `${kr(vaerdi)} kr.`;
/** «481 timer», «12 portioner» — heltal uden separator. */
const heltal = (vaerdi: number) => formatBelob(vaerdi, DA);

export function efterloenDescription(): string {
  return `Beregn efterløn 2026. Max sats: ca. ${kr(EFTERLOEN_MAX_SATS.udenUdskydelse)} kr/md (${pct(EFTERLOEN_SATS_PROCENT.udenUdskydelse)} af dagpenge). Se hvornår du kan gå på efterløn, betingelser og præcis sats ud fra din indkomst. Gratis beregner.`;
}

export function efterloenMetaDescription(): string {
  return `Beregn efterløn 2026. Max sats: ca. ${kr(EFTERLOEN_MAX_SATS.udenUdskydelse)} kr/md (${pct(EFTERLOEN_SATS_PROCENT.udenUdskydelse)} af dagpenge). Se hvornår du kan gå på efterløn, betingelser og præcis sats for din indkomst.`;
}

/**
 * De tre svar der indeholder et tal, med nøglen som det spørgsmål, de hører
 * til. Kaldet for hvert spørgsmål i `page-data.ts` og i `EfterloensBeregner`-
 * siden, så en ny sats slår alle steder på én gang.
 */
export const efterloenFaqSvar: Record<string, string> = {
  "Hvad er efterlønssatsen i 2026?": `I 2026 er den maksimale efterlønssats ca. ${kr(EFTERLOEN_MAX_SATS.udenUdskydelse)} kr. om måneden (${pct(EFTERLOEN_SATS_PROCENT.udenUdskydelse)} af dagpengesatsen) ved fuldtidsforsikring. Satsen afhænger af din tidligere indkomst og forsikringsstatus.`,
  "Kan jeg arbejde mens jeg er på efterløn?": `Ja, du kan arbejde ved siden af efterlønnen, men din efterløn reduceres time for time. Som udgangspunkt udløser ${heltal(SKATTEFRI_PRAEMIE_2026.timerPerPortion)} arbejdstimer én skattefri præmieportion, og du kan optjene op til ${heltal(SKATTEFRI_PRAEMIE_2026.maxPortioner)} portioner (${kr(MAX_TIMER_TIL_PRAEMIE)} timer).`,
  "Hvad er efterlønspræmien?": `Én skattefri præmieportion er ${krDot(SKATTEFRI_PRAEMIE_2026.portion.full)} (2026) for fuldtidsforsikrede og ${krDot(SKATTEFRI_PRAEMIE_2026.portion.part)} for deltidsforsikrede. For at optjene præmie fra efterløn skal du have ventet ${heltal(SKATTEFRI_PRAEMIE_2026.udskydelseAar)} år med at gå på efterløn. Du kan også optjene præmie via et efterlønsbevis, inden du går på efterløn.`,
};

/**
 * Den aldersperiode hver række i `EFTERLOEN_ALDER_2026` dækker, skrevet som
 * siden skriver den: hele fødselsår bliver «1963-1966», en del af ét år
 * bliver «i 1959», og en række der starter midt i et år bliver de fulde datoer.
 *
 * Det er en skriveform, ikke en ny sandhed: rækkerne, dagene og alderne
 * læses alle i tabellen, og `efterloen-eksempler.test.ts` dømmer hver linje
 * mod den.
 */
export function efterloenAldersperioder(): { alder: string; foedselsperiode: string }[] {
  return EFTERLOEN_ALDER_2026.map((raekke) => ({
    alder:
      raekke.efterloensalder.lav === raekke.efterloensalder.hoej
        ? `${heltal(raekke.efterloensalder.lav)} år`
        : `${formatBelob(raekke.efterloensalder.lav, DA, 1).replace(/,5$/, "½")}-${heltal(raekke.efterloensalder.hoej)} år`,
    foedselsperiode:
      raekke.fraAar === raekke.tilAar
        ? `født i ${raekke.fraAar}`
        : raekke.fraDato.startsWith("1. januar") && raekke.tilDato === `31. december ${raekke.tilAar}`
          ? `født ${raekke.fraAar}-${raekke.tilAar}`
          : `født ${raekke.fraDato}-${raekke.tilDato}`,
  }));
}

/**
 * Svaret på «Hvornår kan jeg gå på efterløn?», bygget række for række af
 * `EFTERLOEN_ALDER_2026`. Det var den eneste af de otte svar, der nævnte
 * fødselsår og aldre uden at læse dem i tabellen — og den er den, der skal
 * være rigtig, fordi den er hele sidens løfte om *hvornår* man kan gå på.
 * Dansk er byte-uændret; `efterloen-eksempler.test.ts` låser hele sætningen.
 */
export function efterloenAldersSvar(): string {
  const perioder = efterloenAldersperioder();
  const sidste = EFTERLOEN_ALDER_2026[EFTERLOEN_ALDER_2026.length - 1];
  const dele = perioder.map(
    (p) => `${p.alder} for ${p.foedselsperiode}`,
  );
  const liste =
    dele.length < 2
      ? dele.join("")
      : `${dele.slice(0, -1).join(", ")} og ${dele[dele.length - 1]}`;

  return `Efterlønsalderen afhænger af din fødselsdato: ${liste}. Født efter ${sidste.tilAar} stiger alderen løbende med middellevetiden, så spørg din a-kasse.`;
}
