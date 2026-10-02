import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { byensNavn, findKlokkenLand, getKlokkenSlugs } from "@/lib/klokken-i";
import KlokkenIPage from "./KlokkenIPage";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));

// `FAQ` kræver en `LocaleProvider`, som en ruteside ikke har med. Den mockes
// væk — men **ikke** til `null` som i `tidszone/page.test.tsx`: den skal stadig
// skrive spørgsmål og svar ud, fordi den synlige FAQ er den anden halvdel af
// den samme påstand. Uden den ville testen kun dømme JSON-LD'en.
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: { question: string; answer: string }[] }) => (
    <dl>
      {items.map((i) => (
        <div key={i.question}>
          <dt>{i.question}</dt>
          <dd>{i.answer}</dd>
        </div>
      ))}
    </dl>
  ),
}));

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

type Sprog = "da" | "se";

async function html(sprog: Sprog, slug: string) {
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(
    getDomainConfigByLocale(sprog)
  );
  return renderToStaticMarkup(await KlokkenIPage({ sprog, slug }));
}

/** Det JSON-LD Google kan vise i søgeresultatet, som rent JSON. */
function jsonLd(markup: string) {
  const script = markup.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/
  );
  expect(script).not.toBeNull();
  return JSON.parse(script![1]) as {
    mainEntity: { name: string; acceptedAnswer: { text: string } }[];
  };
}

/**
 * Fund 2/10 (`ceo/klokken-tidszone-paastand`): FAQ-svaret på «Hvad er
 * klokken i <by> lige nu?» skrev, at tallet «følger din tidszone». Det er
 * **målt falsk**: `beregnKlokkenNu` tager kun `(by, sprog, tidspunkt)` og
 * læser `by.zone`, så tallet er byens egen vægur — uafhængigt af læseren.
 * Målt 2/10 06:05 med repoets egen funktion på samme øjeblik under to
 * processer, identisk i begge:
 *
 *   TZ=Europe/Copenhagen  New York 00:02 · Tokyo 13:02
 *   TZ=America/New_York   New York 00:02 · Tokyo 13:02
 *
 * Halvdelen lå i den strukturerede data, altså præcis den tekst Google kan
 * citere, og den modsagde sidens egen brødtekst otte linjer længere nede
 * («Tallet er læst i <landet>s egen tidszone»).
 *
 * Testen dømmer på **ejendaben**, ikke på en fast sætning: svaret skal
 * navngive byens egen tidszone. `not.toContain("din tidszone")` alene ville
 * være grøn for en side der slettede hele sætningen, så påstanden på det
 * positive krav bærer den.
 */
const KRAV = [
  {
    sprog: "da" as const,
    spg: (by: string) => `Hvad er klokken i ${by} lige nu?`,
    egen: "egen tidszone",
    laeserens: "din tidszone",
  },
  {
    sprog: "se" as const,
    spg: (by: string) => `Vad är klockan i ${by} just nu?`,
    egen: "egen tidszon",
    laeserens: "din tidszon",
  },
];

describe("FAQ'en på /klokken-i fortæller, hvilken tidszone tallet følger", () => {
  beforeEach(() => {
    vi.mocked(getCurrentDomainConfig).mockResolvedValue(
      getDomainConfigByLocale("da")
    );
  });

  test.each(KRAV)(
    "$sprog: svaret i JSON-LD'en følger byens egen tidszone, ikke læserens",
    async ({ sprog, spg, egen, laeserens }) => {
      const markup = await html(sprog, "usa");
      const faq = jsonLd(markup);
      // Byen læses fra modulet, ikke skrevet som "New York" her — USA's første
      // by er netop den, `KlokkenIPage` bruger til spørgsmålet, så et bynavn i
      // testen ville være en ny målefejl (C182's lære).
      const foersteBy = byensNavn(findKlokkenLand("usa", sprog)!.byer[0], sprog);
      const svar = faq.mainEntity.find((q) => q.name === spg(foersteBy));

      expect(svar).toBeDefined();
      expect(svar!.acceptedAnswer.text).toContain(egen);
      expect(svar!.acceptedAnswer.text).not.toContain(laeserens);
    }
  );

  test("begge sprog: hele siden hverken i JSON-LD'en eller i den synlige FAQ", async () => {
    // Samme krav på hele markupken, så påstanden ikke kan flytte sig til en
    // anden udgave af svaret (f.eks. et extra afsnit med den gamle sætning).
    for (const krav of KRAV) {
      const markup = await html(krav.sprog, "usa");
      expect(markup).not.toContain(krav.laeserens);
      expect(markup).toContain(krav.egen);
    }
  });

  test("alle tolv lande i begge sprog gør præcis det samme", async () => {
    // Slugs er **sprogspecifikke** (`tyrkiet`/`turkiet`, `canada`/`kanada`), så
    // rækken læses fra modulet i stedet for at blive skrevet her — en ny
    // landeside kan så ikke falde uden om porten.
    for (const krav of KRAV) {
      const slugs = getKlokkenSlugs(krav.sprog);
      expect(slugs.length).toBeGreaterThan(0);
      for (const slug of slugs) {
        const markup = await html(krav.sprog, slug);
        expect(markup, slug).not.toContain(krav.laeserens);
        expect(markup, slug).toContain(krav.egen);
      }
    }
  });

  test("brødteksten og FAQ-svaret siger det samme om tidszonen", async () => {
    // Ellers kunne den ene rettes og den anden blive stående — det er
    // præcis hvad der skete: brødteksten sagde «<landet>s egen tidszone»,
    // mens svaret sagde «din tidszone», otte linjer længere nede.
    for (const krav of KRAV) {
      const markup = await html(krav.sprog, "usa");
      const egenForekomster = markup.split(krav.egen).length - 1;
      // Mindst to: afsnittet «Sådan er tallet fundet» og FAQ-svaret.
      expect(egenForekomster).toBeGreaterThanOrEqual(2);
    }
  });
});
