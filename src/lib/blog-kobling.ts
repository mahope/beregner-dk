/**
 * Central kobling mellem blogindlæg og beregnere.
 *
 * Alle 26 indlæg linker allerede til deres beregner, så den retning er dækket.
 * Retningen *tilbage* — fra beregneren til indlægget — var spredt i ni siders
 * brødtekst og manglede på resten. Her står koblingen ét sted, så
 * `RelateredeArtikler` og testen i `blog-kobling.test.ts` læser samme sandhed.
 *
 * Kun beregnere med dokumenteret trafik er koblet. Ifølge Search Console
 * 2026-08-27→09-24 har de valgte sider 23.426, 16.580, 13.623, 4.556 og 6.013
 * visninger pr. 28 dage, altså nok indgangslinks til at måle effekten på indlæggene.
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
        "Alle amerikanske tidszoner med klokkeslæt ved 12, 14, 16 og 21 dansk tid, tidsforskelen til 16 byer og de præcise sommertidsdatoer i 2026.",
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
