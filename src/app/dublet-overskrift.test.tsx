/**
 * Dublerede `<h2>`-overskrifter på ni danske sider.
 *
 * **Hvad fejlen var.** `<FAQ>` og `<RelatedCalculators>` er begge komponenter,
 * der *selve* renderer en `<h2>` (henholdsvis `t.ui.faq` og
 * `t.ui.relatedCalculators`). Ni `page.tsx` skrev deres *egen* `<h2>` med næsten
 * samme ordlyd lige oven over komponenten, så den server-renderede HTML havde
 * to ens overskrifter i træk — målt på live: `/efterloen`,
 * `/rentefradrag` og `/barselsdagpenge` rendrede **"Ofte stillede spørgsmål"**
 * to gange i træk og **"Relaterede beregnere"** to gange i træk,
 * `/barselsplanlaegger` gjorde det for "Relaterede beregnere", og
 * `/dagpenge`, `/pension`, `/arveafgift`, `/boligstoette` og
 * `/ejendomsvaerdiskat` satte en side-specifik variant ("… om dagpenge")
 * umiddelbart før komponentens generiske.
 *
 * Der er tre grunde til at det er en reel fejl og ikke kosmetik:
 *
 * 1. **Det er indekseret tekst, der modsiger sig selv.** Google læser
 *    dokumentets afsnit efter overskrifterne. To ens `<h2>` i træk er et
 *    dokument, der siger "næste afsnit hedder Ofte stillede spørgsmål" to
 *    gange — samme fejlklasse som C84's (`metaDescription` der løj om sit eget
 *    indhold), kun i overskriftsformen.
 * 2. **En skærmlæser-liste indeholder nu det samme link to gange.** Brugeren
 *    hører "Ofte stillede spørgsmål", springer til det, og hører det igen.
 * 3. **Det er usynligt i kilde-greb.** `/rentefradrag` (331 besøgende/28d,
 *    +145 %) og `/barselsdagpenge` (212) er blandt sitets mest besøgte sider,
 *    og ingen af dem så det.
 *
 * **Hvorfor denne test renderer frem for at grepe kilden.** Et grep i `src/`
 * kan ikke se, at `<FAQ>` selv renderer en `<h2>` — det er præcis det blind
 * spot, der lod klassen ligge. Derfor har testen to dele:
 *
 * 1. **En klasse-scan over alle 136+71 `page.tsx`** der læser *kilden* og
 *    kræver, at ingen side skriver sin egen `<h2>` umiddelbart før
 *    `<FAQ>` eller `<RelatedCalculators>`. Det er den, der fanger en *ny* side,
 *    der gentager fejlen, og den er skrevet mod den kode der faktisk renderer.
 * 2. **To renderede sider** — `/rentefradrag` og `/barselsdagpenge`, de to med
 *    flest besøgende — hvor `FAQ` og `RelatedCalculators` *ikke* mockes, så
 *    markupken kan aflæses. Det er den, der beviser at kilde-scanet og
 *    markupken er det samme.
 *
 * Scannet kræver kun, at der *ikke* står en `<h2>` lige før komponenten — det
 * låser ikke hvilken ordlyd, en side må bruge, fordi komponentens `title`-prop
 * er den rigtige vej at give en side sin egen overskrift på.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { LocaleProvider } from "@/components/LocaleProvider";

vi.mock("@/lib/get-locale", () => ({
  getLocale: vi.fn(),
  getCurrentDomainConfig: vi.fn(),
}));

vi.mock("@/components/RentefradragBeregner", () => ({
  default: () => <div>Rentefradragsværktøj</div>,
}));
vi.mock("@/components/BarselBeregner", () => ({
  default: () => <div>Barselsværktøj</div>,
}));
vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({
  CalculatorSchema: () => null,
  FAQSchema: () => null,
}));
// `FAQ` og `RelatedCalculators` er bevidst *ikke* mocket: de er selve
// årsagen, så en mock ville skjule fejlen og gøre testen vakuum-grøn.

const { default: FAQ } = await import("@/components/FAQ");

/** De ni sider hvis overskrift var dobbelt. */
const RETTEDE_SLUGS = [
  "dagpenge",
  "pension",
  "arveafgift",
  "boligstoette",
  "ejendomsvaerdiskat",
  "efterloen",
  "barselsdagpenge",
  "barselsplanlaegger",
  "rentefradrag",
];

function renderFaq(title: string | undefined) {
  return renderToStaticMarkup(
    <LocaleProvider locale="da" domainConfig={getDomainConfigByLocale("da")}>
      <FAQ
        items={[
          { question: "Spørgsmål 1", answer: "Svar 1" },
          { question: "Spørgsmål 2", answer: "Svar 2" },
        ]}
        title={title}
      />
    </LocaleProvider>,
  );
}

function allePageFiler(): string[] {
  const ud: string[] = [];
  const gaa = (dir: string) => {
    for (const navn of readdirSync(dir)) {
      const st = join(dir, navn);
      if (statSync(st).isDirectory()) gaa(st);
      else if (navn === "page.tsx") ud.push(st);
    }
  };
  gaa(join(__dirname));
  return ud;
}

/** En `<h2>` der umiddelbart efterfølges af komponenten, der selv har en. */
const EGEN_H2_FAER_FAQ = /<h2[^>]*>[\s\S]{0,120}?<\/h2>\s*<FAQ\b/;
const EGEN_H2_FAER_REL = /<h2[^>]*>[\s\S]{0,120}?<\/h2>\s*<RelatedCalculators\b/;

function h2Tekster(html: string): string[] {
  return [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) =>
    m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  );
}

describe("ingen side må skrive sin egen overskrift over en komponent, der selv har en", () => {
  const filer = allePageFiler();

  test("scanen rammer hele sitet, ikke et udvalg", () => {
    // 0 fund ville være et grønt resultat for en måler der ikke læser noget
    // (C176's og målefejl 33's lære), så antallet låses. 121 `page.tsx` dækker
    // de 207 URL'er i begge sitemapmer, fordi `/blog/[slug]`, `/kategori/[slug]`
    // og `/dage-til/[slug]` er én fil hver.
    expect(filer.length).toBeGreaterThanOrEqual(121);
  });

  test("ingen page.tsx har en egen <h2> lige før <FAQ> eller <RelatedCalculators>", () => {
    const fejl = filer
      .filter(
        (f) => EGEN_H2_FAER_FAQ.test(readFileSync(f, "utf8")) || EGEN_H2_FAER_REL.test(readFileSync(f, "utf8")),
      )
      .map((f) => f.replace(`${__dirname}/`, ""));
    expect(fejl).toEqual([]);
  });

  test("<FAQ> renderer præcis én <h2>, med eller uden egen titel", () => {
    // Beviset for at komponenten *er* overskriften: en `<h2>` i sig selv, og
    // stadig præcis én når siden vil have sin egen ordlyd. Uden denne test
    // kunne kilde-scanet være grønt fordi komponenten holdt op med at have en.
    const generisk = h2Tekster(renderFaq(undefined));
    expect(generisk).toEqual(["Ofte stillede spørgsmål"]);

    const egen = h2Tekster(renderFaq("Ofte stillede spørgsmål om dagpenge"));
    expect(egen).toEqual(["Ofte stillede spørgsmål om dagpenge"]);
  });

  test("de ni rettede sider har hver præcis én FAQ-kald og ingen egen <h2> foran", () => {
    for (const slug of RETTEDE_SLUGS) {
      const src = readFileSync(join(__dirname, slug, "page.tsx"), "utf8");
      expect(src, slug).not.toMatch(EGEN_H2_FAER_FAQ);
      // Og de skal stadig have et FAQ — ellers ville klassescannet være grønt
      // fordi indholdet forsvandt i stedet for at blive dobbelt (C94's lære).
      expect(src, slug).toMatch(/<FAQ\b/);
    }
  });

  test("de fem side-specifikke overskrifter ligger i FAQ's title-prop", () => {
    // `/dagpenge` og de fire øvrige havde en side-specifik overskrift; de er
    // statiske attributter, så de læses fra kilden. Uden dem ville siden have
    // mistet sin egen ordlyd, og det er den, rettelsen skal give videre.
    for (const [slug, titel] of [
      ["dagpenge", "Ofte stillede spørgsmål om dagpenge"],
      ["pension", "Ofte stillede spørgsmål om pension"],
      ["arveafgift", "Ofte stillede spørgsmål om arveafgift"],
      ["boligstoette", "Ofte stillede spørgsmål om boligstøtte"],
      ["ejendomsvaerdiskat", "Ofte stillede spørgsmål om ejendomsskat"],
    ] as const) {
      const src = readFileSync(join(__dirname, slug, "page.tsx"), "utf8");
      expect(src, slug).toContain(`title="${titel}"`);
    }
  });

  test("de fire sider med dobbelt 'Relaterede beregnere' kalder komponenten stadig", () => {
    for (const slug of ["barselsdagpenge", "barselsplanlaegger", "efterloen", "rentefradrag"]) {
      const src = readFileSync(join(__dirname, slug, "page.tsx"), "utf8");
      expect(src, slug).not.toMatch(EGEN_H2_FAER_REL);
      expect(src, slug).toMatch(new RegExp(`<RelatedCalculators\\b[^>]*current="/${slug}"`));
    }
  });
});
