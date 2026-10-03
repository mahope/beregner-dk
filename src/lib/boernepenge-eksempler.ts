/**
 * De tal `/boernepenge` gentager i sin egen tekst — i `description` og
 * `metaDescription`, i to af sine otte FAQ-svar og i brødtekstens aftrappings-
 * eksempel — plus den korte og den lange satsliste, som de to metadatafelter
 * bruger hver især.
 *
 * Svarene var skrevet i hånden, og de håndskrevne tal var ikke bare den normale
 * drift. `BoernepengBeregner` læser allerede `BOERNE_SATSER_2026`, så
 * **søgeresultatet og værktøjet var to uafhængige tal**: ændrede man en sats i
 * `borneungeydelse.ts`, ville værktøjet vise den nye, mens `description`,
 * `metaDescription` og `FAQPage`-JSON-LD stod med den gamle. Sidens egen port
 * (`regnestykker.test.ts`) kan ikke se det: en streng med et tal er gyldig JSX.
 *
 * **Ingen reel fejl fundet i denne slice** — det skal siges rent, fordi det er
 * den slags der bliver pævet: alle ni beløb var rigtige. 5.370 × 4 = 21.480,
 * 4.248 × 4 = 16.992, 3.342 × 4 = 13.368 og 1.114 × 12 = 13.368, og de to
 * aftrappingseksempler er 2 % af 38.900 = 778 og 2 % af 138.900 = 2.778.
 * Slicen er derfor et **lås mod 2027-drift**, ikke en rettelse.
 *
 * Den eneste ændring i dansk tekst er notationsforskellene mellem de tre steder,
 * der alle skriver den samme sats:
 * - «2%» i brødteksten mod «2 %» i FAQ-svaret. Mellemrummet før
 *   procenttegnet er husets skrivemåde (`aktieskat-eksempler`,
 *   `efterloen-eksempler`, `loen-efter-skat-eksempler`, `topskat-eksempler`),
 *   så de to skal ikke modsige hinanden på samme side.
 * - `metaDescription` skrev «3-6 år 4.248 kr» og «7-14 år 3.342 kr` **uden
 *   udbetalingsinterval**, mens `description` lige over den skrev
 *   «4.248 kr/kvartal». Begge staver er kvartalsbeløb, så den korte satsliste
 *   får nu sit interval med — skrevet én gang for den gruppe, det gælder for,
 *   fordi huset har en grænse på 160 tegn i metabeskrivelsen.
 * - Satslisten skriver «1.114 kr/md» i metadata (kort form) og «1.114 kr/måned»
 *   i FAQ-svaret (lang form). Begge former findes i huset, så de er navngivet
 *   `kort` og `lang` frem for at være tilfældige.
 *
 * {@link BOERNEUNGEYDELSE_2026.aftrapning} læses fra sit eget modul, og de to
 * eksempelindkomster er konstanter — de er valgt, fordi de er runde tal, en
 * lige over og en lige under det beløb hvor nedsættelsen sætter ind. Begge
 * regnes med `beregnAftrapning`, altså sidens egen formel, så et eksempel ikke
 * kan få et andet tal end værktøjet.
 */

import {
  BOERNE_SATSER_2026,
  BOERNEUNGEYDELSE_2026,
  aarligBelob,
  beregnAftrapning,
  type BoernSats,
} from "./borneungeydelse";
import { formatBelob } from "./format";

const DA = "da" as const;

/**
 * «5.370 kr.» — beløb med den danske valutaenhed.
 *
 * `getCurrencySuffix("da")` er «kr.» med punktum, fordi det er en
 * forkortelse, så den bruges her *midt* i en sætning og derfor ikke efter et
 * komma. Samme deling som `topskatBelob`/`topskatBelobI` 3/10.
 */
export const boerneBelob = (belob: number) => `${formatBelob(belob, DA)} kr.`;

/** «5.370 kr» — til brug midt i en sætning, hvor «kr.,» ellers ville give dobbelt punktum. */
export const boerneBelobI = (belob: number) => `${formatBelob(belob, DA)} kr`;

/** «5.370 kr/år» */
const boerneAar = (belob: number) => `${formatBelob(belob, DA)} kr/år`;

/**
 * «kr/kvartal» og «kr/md» i den korte form, «kr/kvartal» og «kr/måned» i den
 * lange. `intervalNavn` i modulet er «kvartal»/«måned», så kun månedsformen
 * skal kortes.
 */
const intervalEnhed = (sats: BoernSats, lang: boolean) =>
  sats.intervalNavn === "måned" && !lang ? "md" : sats.intervalNavn;

/**
 * «5.370 kr/kvartal» (kort) eller «5.370 kr/måned» (lang).
 *
 * Enheden skrives *inde* i den, så her bruges det rå tal — `boerneBelobI`
 * ville give «5.370 kr kr/kvartal», den dobbelte enhed fra
 * `pension-dobbelt-valuta` 2/10.
 */
export const boerneInterval = (sats: BoernSats, lang = false) =>
  `${formatBelob(sats.hel, DA)} kr/${intervalEnhed(sats, lang)}`;

/**
 * Den korte satsliste, som `description` bruger:
 * «0-2 år: 5.370 kr/kvartal, 3-6 år: 4.248 kr/kvartal, …»
 *
 * Med kolon efter aldersgruppen, som `description` altid har skrevet.
 */
export function boerneSatslisteKort(): string {
  return BOERNE_SATSER_2026.map(
    (sats) => `${sats.alder}: ${boerneInterval(sats)}`,
  ).join(", ");
}

/**
 * Den korte satsliste uden kolon, som `metaDescription` bruger:
 * «0-2 år 5.370, 3-6 år 4.248 og 7-14 år 3.342 kr/kvartal, 15-17 år 1.114 kr/md»
 *
 * Den skrev før «3-6 år 4.248 kr» og «7-14 år 3.342 kr» **uden
 * udbetalingsinterval**, mens `description` lige over den skrev
 * «4.248 kr/kvartal». Nu står intervallet på den gruppe, det gælder for, i stedet
 * for at gentages tre gange — det er kortere *og* dækker alle fire grupper.
 *
 * Gruppen er delt efter `interval`, altså efter modulets egen nøgle, så en ny
 * aldersgruppe med et andet interval ikke kan havne i den forkerte gruppe.
 */
export function boerneSatslisteMeta(): string {
  const grupper = new Map<BoernSats["interval"], BoernSats[]>();
  for (const sats of BOERNE_SATSER_2026) {
    const liste = grupper.get(sats.interval) ?? [];
    liste.push(sats);
    grupper.set(sats.interval, liste);
  }
  return [...grupper.values()]
    .map((gruppe) => {
      const belob = gruppe.map((sats) => `${sats.alder} ${formatBelob(sats.hel, DA)}`);
      const sidste = belob.at(-1) as string;
      const forrige = belob.slice(0, -1);
      const liste =
        forrige.length > 0 ? `${forrige.join(", ")} og ${sidste}` : sidste;
      return `${liste} kr/${intervalEnhed(gruppe[0], false)}`;
    })
    .join(", ");
}

/**
 * Den lange satsliste med årstal, som FAQ-svaret bruger:
 * «0-2 år: 5.370 kr/kvartal (21.480 kr/år), …»
 *
 * Årsbeløbet er `aarligBelob`, altså intervalbeløbet ganget med antal
 * udbetalinger — ikke et håndskrevet tal ved siden af.
 */
export function boerneSatslisteLang(): string {
  return BOERNE_SATSER_2026.map(
    (sats) =>
      `${sats.alder}: ${boerneInterval(sats, true)} ` +
      `(${boerneAar(aarligBelob(sats))})`,
  ).join(", ");
}

/** Indtægtsgrundlaget, hvor nedsættelsen begynder. */
export const AFTRAPNING_GRAENSE = BOERNEUNGEYDELSE_2026.aftrapning.graense;

/** Nedsættelsens sats, «2 %» med husets mellemrum før procenttegnet. */
export const AFTRAPNING_PCT = `${formatBelob(
  BOERNEUNGEYDELSE_2026.aftrapning.pct * 100,
  DA,
)} %`;

/** Beløbet over grænsen for en given indkomst, aldrig negativt. */
export const belobOverGraensen = (indtægtsgrundlag: number) =>
  Math.max(0, indtægtsgrundlag - AFTRAPNING_GRAENSE);

/**
 * Den årlige nedsættelse for en indkomst, som brødtekstens eksempel skriver.
 * Læser `beregnAftrapning` — altså modulets egen formel — så satsen ikke
 * gentages som et nøgental ved siden af.
 */
export const boerneNedaettelse = (indtægtsgrundlag: number) =>
  beregnAftrapning(indtægtsgrundlag);

/**
 * De to eksempelindkomster. Den lave er det runde beløb lige over grænsen, den
 * høje det næste runde milliontal — begge valgt, fordi en læger kan efterregne dem
 * på papir, og fordi de dækker begge sider af grænsen.
 */
export const AFTRAPNING_EKSEMPEL_LAV = 1_000_000;
export const AFTRAPNING_EKSEMPEL_HOEJ = 1_100_000;

/** «2 % af 38.900 kr. = 778 kr. årligt» — regnet med sidens egen `beregnAftrapning`. */
function aftrapningEksempel(indtægtsgrundlag: number): string {
  const over = belobOverGraensen(indtægtsgrundlag);
  return (
    `${AFTRAPNING_PCT} af ${boerneBelob(over)} = ` +
    `${boerneBelob(boerneNedaettelse(indtægtsgrundlag))} årligt`
  );
}

/** Det korte eksempel, som FAQ-svaret bruger. */
export const AFTRAPNING_EKSEMPEL_KORT = aftrapningEksempel(
  AFTRAPNING_EKSEMPEL_LAV,
);

/** Det lange eksempel med indkomsten, som brødteksten bruger. */
export const AFTRAPNING_EKSEMPEL_LANG = aftrapningEksempel(
  AFTRAPNING_EKSEMPEL_HOEJ,
);

/** Beskrivelsen til søgeresultatet. */
export function boerneBeskrivelse(): string {
  return (
    `Beregn børnepenge 2026. Officielle satser: ${boerneSatslisteKort()}. ` +
    `Beregn ud fra antal børn og indkomst.`
  );
}

/** Den kortere beskrivelse til metadaten. */
export function boerneMetaBeskrivelse(): string {
  return (
    `Beregn børnepenge 2026. Satser: ${boerneSatslisteMeta()}. ` +
    `Beregn ud fra antal børn og indkomst.`
  );
}

/**
 * De otte FAQ-svar. De seks uden tal er flyttet uændret, så hele listen dømmes ét
 * sted; kun det andet og det fjerde læser tal fra modulet.
 */
export function boernepengeFaqItems(): { question: string; answer: string }[] {
  return [
    {
      question: "Hvem kan få børne- og ungeydelse?",
      answer:
        "Forældre med børn under 18 år, hvor barnet bor i Danmark, og mindst " +
        "én forælder er dansk statsborger eller har haft bopæl i DK i min. 2 år. " +
        "Siden 2022 deles ydelsen som standard mellem forældre med fælles " +
        "forældremyndighed.",
    },
    {
      question: "Hvor meget får jeg i børnepenge 2026?",
      answer: `De officielle 2026-satser er: ${boerneSatslisteLang()}. ` +
        `Ved fælles forældremyndighed modtager hver forælder halvdelen.`,
    },
    {
      question: "Hvornår udbetales børnepenge?",
      answer:
        "Børneydelsen (0-14 år) udbetales kvartalsvis forud den 20. i januar, " +
        "april, juli og oktober. Ungeydelsen (15-17 år) udbetales månedligt " +
        "den 20. i hver måned direkte til den unge.",
    },
    {
      question: "Bliver børnepenge modregnet ved høj indkomst?",
      answer:
        `Ja, hvis dit indtægtsgrundlag overstiger ` +
        `${boerneBelob(AFTRAPNING_GRAENSE)} i 2026, nedsættes ydelsen med ` +
        `${AFTRAPNING_PCT} af beløbet over grænsen. Eksempel: ` +
        `${boerneBelob(AFTRAPNING_EKSEMPEL_LAV)} giver ` +
        `${AFTRAPNING_EKSEMPEL_KORT}. Siden 2022 regnes kun med din egen ` +
        `indkomst, også hvis I bor sammen.`,
    },
    {
      question: "Hvordan deles børnepenge mellem forældre?",
      answer:
        "Siden januar 2022 deles børne- og ungeydelsen som standard ligeligt " +
        "mellem forældre med fælles forældremyndighed. Hver forælder modtager " +
        "halvdelen af ydelsen. Bor barnet kun hos den ene forælder, kan man " +
        "søge om at få hele ydelsen.",
    },
    {
      question: "Hvad får enlige forsørgere ekstra?",
      answer:
        "Enlige forsørgere kan udover børne- og ungeydelsen få: ordinært " +
        "børnetilskud (pr. barn), ekstra børnetilskud (kun én gang uanset antal " +
        "børn) og evt. særligt børnetilskud. Børnetilskuddene udbetales " +
        "særskilt — beløbene står på borger.dk under Børnetilskud.",
    },
    {
      question: "Er børnepenge skattefrie?",
      answer:
        "Ja, børne- og ungeydelsen er skattefri. Du skal ikke betale skat af " +
        "beløbet, og det påvirker ikke din skattepligtige indkomst eller " +
        "offentlige ydelser som boligstøtte.",
    },
    {
      question: "Hvordan søger jeg om børnepenge?",
      answer:
        "Børneydelsen udbetales automatisk når dit barn får et CPR-nummer. Du " +
        "behøver ikke søge. Ved særlige forhold som eneforældremyndighed, " +
        "delt bopæl eller høj indkomst kan du administrere ydelsen via " +
        "borger.dk eller Digital Post til Udbetaling Danmark.",
    },
  ];
}
