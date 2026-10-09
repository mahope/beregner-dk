/**
 * Central kobling mellem blogindlæg og beregnere.
 *
 * Alle 27 indlæg linker allerede til deres beregner, så den retning er dækket.
 * Retningen *tilbage* — fra beregneren til indlægget — var spredt i ni siders
 * brødtekst og manglede på resten. Her står koblingen ét sted, så
 * `RelateredeArtikler` og testen i `blog-kobling.test.ts` læser samme sandhed.
 *
 * Kun beregnere med dokumenteret trafik er koblet. Ifølge Search Console
 * 2026-08-27→09-24 har de valgte sider 23.426, 16.580, 13.623, 4.556 og 6.013
 * visninger pr. 28 dage, altså nok indgangslinks til at måle effekten på indlæggene.
 * `/dato` (131.920) og `/brok` (4.913) er koblet efter GSC 2026-08-29→09-26.
 *
 * De to sidste blev koblet 1/10 efter Plausible 2026-09-30: `/boligstoette`
 * 529 besøgende/28d (+78 %) og `/pension` 142. Begge havde indlægget, og
 * indlægget linkede tilbage, men kun som et skjult link i brødteksten —
 * `/pension` manglede det helt. `/su` og `/barselsdagpenge` blev målt samme
 * dag og **ikke** koblet: der står indlægget allerede i en blå boks lige under
 * værktøjet, så en "Guides om emnet"-blok ville give læseren det samme link
 * to gange på én skærm.
 *
 * Koblingen skal være gensidig: indlægget skal selv linke tilbage til den
 * beregner, det er koblet til. Det låser `blog-kobling.test.ts`, fordi en
 * kobling uden returlink er halv sand — beregneren peger på indlægget, men
 * indlægget giver ikke videre til værktøjet.
 */
export interface ArtikelKobling {
  /** Slug under `src/app/blog/`. */
  slug: string;
  /** Linktekst på beregnersiden. */
  titel: string;
  /** Én linje om, hvad læseren får. */
  beskrivelse: string;
}

/** Beregner-sti → de indlæg, der svarer til spørgsmålet på siden. */
export const BEREGNER_ARTIKLER: Record<string, ArtikelKobling[]> = {
  "/moms": [
    {
      slug: "hvordan-beregner-man-moms",
      titel: "Sådan beregner du moms",
      beskrivelse:
        "Hvilken sats der gælder, hvordan du lægger til og trækker fra, og de danske og svenske regler.",
    },
  ],
  "/braendstof": [
    {
      slug: "spar-penge-paa-braendstof",
      titel: "Spar penge på brændstof",
      beskrivelse:
        "Forbrug, benzinpriser, diesel mod benzin, og hvornår et elbilskift kan regnes hjem.",
    },
  ],
  "/renteberegner": [
    {
      slug: "guide-til-laan-og-renter",
      titel: "Guide til lån og renter",
      beskrivelse:
        "Sammenlign fastforrentede og variable lån, og hvad en renteændring gør ved din ydelse.",
    },
  ],
  "/rentefradrag": [
    {
      slug: "rentefradrag-2026-satser-og-regler",
      titel: "Rentefradrag 2026: sats og regler",
      beskrivelse:
        "33,6 % af de første 50.000 kr., eksempel på 80.000 kr., og hvilke lån der giver fradrag.",
    },
    {
      slug: "fradrag-2026-komplet-guide",
      titel: "Fradrag 2026: komplet guide",
      beskrivelse:
        "Sådan beregner du dit samlede fradrag ud fra de enkelte fradrag, med satser for 2026.",
    },
    {
      slug: "koeb-af-bolig-2026-omkostninger",
      titel: "Køb af bolig 2026: omkostninger",
      beskrivelse:
        "Hvilke omkostninger der er fradragsberettigede ved et boligkøb, og hvad de beløber sig til.",
    },
    {
      slug: "boliglaan-2026-renter-og-afdrag",
      titel: "Boliglån 2026: renter og afdrag",
      beskrivelse:
        "Renteudgifter, afdragsformer og hvad rentefradraget betyder for dit afdrag.",
    },
  ],
  "/alder": [
    {
      slug: "bmi-for-boern-saadan-tjekker-du",
      titel: "BMI for børn: sådan tjekker du",
      beskrivelse:
        "Hvornår BMI kan bruges for børn, hvad grænserne er, og hvornår du skal bruge vægt og højde.",
    },
  ],
  "/boernebidrag": [
    {
      slug: "boernebidrag-2026-satser-og-regler",
      titel: "Børnebidrag 2026: satser og regler",
      beskrivelse:
        "Normalbidraget, regnestykket bag et forhøjet bidrag, de vejledende indkomstgrænser og skattefradraget.",
    },
  ],
  /**
   * `/alder` og `/bmi` deler emne, men ikke læser: en forælder slår barnets
   * alder op for at finde den rigtige percentil, en voksen slår BMI op for
   * sin egen kategori. Derfor to artikler og to koblinger — `/bmi` har sit
   * eget indlæg om voksne, så den voksne læser ikke sendes videre til en
   * børneguide.
   */
  "/bmi": [
    {
      slug: "bmi-voksen-saadan-tolk-er-du-tallet",
      titel: "BMI for voksne: sådan tolker du dit BMI-tal",
      beskrivelse:
        "WHO's grænser for voksne, hvornår BMI ikke kan bruges, og hvad taljemål fortælder ud over tallet.",
    },
  ],
  "/kalorier": [
    {
      slug: "hvor-mange-kalorier-skal-jeg-have",
      titel: "Hvor mange kalorier skal jeg have om dagen?",
      beskrivelse:
        "Regnestykket bag tallet: stofskifte i hvile, aktivitetsfaktorer, kalorieunderskud og hvor meget protein du skal have, når du taber dig.",
    },
  ],
  "/kvadratmeter": [
    {
      slug: "kvadratmeter-saadan-regner-du-ud",
      titel: "Hvordan regner man kvadratmeter ud?",
      beskrivelse:
        "De fire arealformler med tal, maling og spild på materialer, og forskellen på dit mål og BBR-arealet.",
    },
  ],
  "/tidszone": [
    {
      slug: "hvad-er-klokken-i-usa-naar-den-er-12-i-danmark",
      titel: "Hvad er klokken i USA, når den er 12 i Danmark?",
      beskrivelse:
        "Alle amerikanske tidszoner med klokkeslæt ved 12, 14, 16 og 21 dansk tid, tidsforskelen til 25 byer og de præcise sommertidsdatoer i 2026.",
    },
  ],
  "/dato": [
    {
      slug: "guide-feriepenge-hvornaar-og-hvor-meget",
      titel: "Hvornår får man feriepenge?",
      beskrivelse:
        "De fire datoer der styrer ferieåret — 1. september, 31. august og 31. december — og hvornår ferietillægget udbetales.",
    },
  ],
  "/brok": [
    {
      slug: "saadan-beregner-du-din-reelle-timeloen",
      titel: "Sådan beregner du din reelle timeløn",
      beskrivelse:
        "Løn delt i timer er et brøk: hvad pension, frokost og skjulte timer gør ved det tal, du faktisk tjener pr. time.",
    },
  ],
  "/boligstoette": [
    {
      slug: "boligstoette-2026-nye-regler",
      titel: "Boligstøtte 2026: de nye regler",
      beskrivelse:
        "Sammenhængen mellem husleje, indkomst, formue og areal, og hvilke kilder der står bag standardmaksima.",
    },
  ],
  "/pension": [
    {
      slug: "pension-hvor-meget-skal-du-spare-op",
      titel: "Pension: hvor meget skal du spare op?",
      beskrivelse:
        "Folkepension, ATP og det private spareri — hvor meget du selv bør lægge til side, og hvornår.",
    },
  ],
};

/**
 * Indlæg → den beregner, der er koblet tilbage. Kun artikler med en faktisk
 * returlink i beregnerens side indgår, så `RelateredeArtikler` og testen er
 * enige om, hvad "koblet" betyder.
 */
export function beregnerForArtikler(artikelSlug: string): string | undefined {
  for (const [href, artikler] of Object.entries(BEREGNER_ARTIKLER)) {
    if (artikler.some((artikel) => artikel.slug === artikelSlug)) return href;
  }
  return undefined;
}

/** De koblede beregnere, så kandidatlister og testens dækning kan læses herfra. */
export function kobledeBeregnere(): string[] {
  return Object.keys(BEREGNER_ARTIKLER);
}
