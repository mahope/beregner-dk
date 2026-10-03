/**
 * `/dage-i-aaret` og `/dagar-i-aret` er to route-filer over én komponent, og det
 * er *stien* der vælger sproget — samme regel som `/dage-til`, `/klokken-i` og
 * `/dage-mellem-datoer`. En test der kun importerer den danske kan derfor ikke
 * se den svenske side. Derfor testes begge ruter, og deres
 * `getCurrentDomainConfig`-mock skifter sprog.
 *
 * Porten dømmer de ting siden *lover* — titel, `<h1>`, de tre målte søgninger
 * som `FAQPage`, canonical/hreflang, 301 mellem domænerne og sitemap — og
 * **alle tal i brødteksten og i tabellen mod de funktioner der har regnet
 * dem**, så en ny kalender eller et nyt sprog ikke kan få løfte-sætninger uden
 * at porten ser det. Punkt 11: en påstand i tekst er kode.
 */
import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  DAGE_I_AARET_PATH,
  aarsoversigt,
  dageIAaretAfsnit,
  dageIAaretCopy,
  dageIAaretFaq,
  getDageIAaretPath,
  isDageIAaretLocale,
} from "@/lib/dage-i-aaret";
import { aarstal, erSkudaar, maanederITaar } from "@/lib/dato-eksempler";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { buildSitemap } from "./sitemap";
import DageIAaretPage from "./dage-i-aaret/page";
import DagarIAaretPage from "./dagar-i-aret/page";
import { buildDageIAaretMetadata } from "@/components/DageIAaret";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
type Spg = { question: string; answer: string }[];
// `FAQ` og `FAQSchema` erstattes af de simpleste komponenter, der viser *hele*
// spørgsmålsteksten: de to er de steder, siden lover sit svar på to gange, og en
// mock der renderer `null` ville skjule præcis den fejl, porten skal finde.
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: Spg }) => (
    <div data-testid="faq">
      {items.map((i) => (
        <p key={i.question}>{i.question} {i.answer}</p>
      ))}
    </div>
  ),
}));
vi.mock("@/components/StructuredData", () => ({
  FAQSchema: ({ items }: { items: Spg }) => (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ items }) }}
    />
  ),
}));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const host = vi.hoisted(() => ({ locale: "da" as "da" | "se" }));

vi.mocked(getCurrentDomainConfig).mockImplementation(async () =>
  getDomainConfigByLocale(host.locale)
);

const ROUTE_FOR = {
  da: DageIAaretPage,
  se: DagarIAaretPage,
} as const;

/** 2026-10-02. Fast klokkeslæt, så tabellen kan måles mod en kalender. */
const I_DAG = new Date("2026-10-02T12:00:00.000Z");

async function render(sprog: "da" | "se") {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("dage i året: siden peger på sit eget spørgsmål", () => {
  test("begge sprog har egen sti, egen titel og egen h1", async () => {
    for (const sprog of ["da", "se"] as const) {
      const c = dageIAaretCopy[sprog];
      expect(DAGE_I_AARET_PATH[sprog], sprog).toBe(
        sprog === "da" ? "/dage-i-aaret" : "/dagar-i-aret"
      );
      // Titlen og h1 skal ramme søgningen ordret: målingen 3/10 fandt «hvor
      // mange dage er der på et år» som dansk autocomplete **nr. 1** under «hvor
      // mange dage er der», og «hur många dagar är det på ett år» som svensk
      // nr. 3. Ordene fra spørgsmålet skal stå i begge, ellers er siden en
      // anden sides kopi.
      const spoergsmaal =
        sprog === "da" ? "hvor mange dage er der på et år" : "hur många dagar är det på ett år";
      expect(c.title.toLowerCase(), sprog).toContain(spoergsmaal);
      expect(c.h1.toLowerCase(), sprog).toBe(`${spoergsmaal}?`);
      const html = await render(sprog);
      expect(html, sprog).toContain(`<h1`);
      // Ét h1 pr. side: dublet-overskrift-porten dømmer de svenske, men kun
      // fordi de findes i kilde.
      expect(html.match(/<h1[ >]/g)?.length, sprog).toBe(1);
      expect(c.description.length, sprog).toBeLessThanOrEqual(160);
      // Copy uden årstal: et frosset «2026» i titeln eller beskrivelsen ville være
      // en påstand, der holder op med at være sand 1. januar.
      expect(c.title, sprog).not.toMatch(/\b20\d{2}\b/);
      expect(c.description, sprog).not.toMatch(/\b20\d{2}\b/);
    }
  });

  test("de tre målte søgninger står i den synlige tekst og i FAQPage-JSON-LD", async () => {
    for (const sprog of ["da", "se"] as const) {
      const faq = dageIAaretFaq(sprog, I_DAG);
      expect(faq.length, sprog).toBe(3);
      // Spørgsmålene er de tre autocomplete-træffere fra målingen, ikke tre
      // spørgsmål jeg har fundet på: «på et år», «i augusti» og «i juli».
      const forventet =
        sprog === "da"
          ? [
              "Hvor mange dage er der på et år?",
              "Hvor mange dage er der i augusti?",
              "Hvor mange dage er der i juli?",
            ]
          : [
              "Hur många dagar är det på ett år?",
              "Hur många dagar är det i augusti?",
              "Hur många dagar är det i juli?",
            ];
      expect(faq.map((f) => f.question), sprog).toEqual(forventet);
      const html = await render(sprog);
      for (const f of faq) {
        expect(html, `${sprog}/${f.question}`).toContain(f.question);
        expect(html, `${sprog}/${f.question}`).toContain(f.answer);
      }
      // JSON-LD'en skal være *samme* tre svar — dens tegn er escaped i
      // markupken, så den læses tilbage og sammenlignes med kopien.
      const rå = /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)?.[1];
      expect(rå, sprog).toBeDefined();
      const json = JSON.parse(
        (rå as string)
          .replaceAll("&quot;", '"')
          .replaceAll("&#x27;", "'")
          .replaceAll("&lt;", "<")
          .replaceAll("&gt;", ">")
          .replaceAll("&amp;", "&")
      ) as { items: Spg };
      expect(json.items, sprog).toEqual(faq);
    }
  });

  test("canonical, hreflang og x-default peger på den anden sprogside", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildDageIAaretMetadata(DAGE_I_AARET_PATH[sprog], I_DAG);
      const canonical = meta.alternates?.canonical;
      expect(canonical, sprog).toBe(
        `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_I_AARET_PATH[sprog]}`
      );
      const languages = meta.alternates?.languages as Record<string, string>;
      const DA = getDomainConfigByLocale("da").hreflangCode;
      const SE = getDomainConfigByLocale("se").hreflangCode;
      expect(Object.keys(languages).sort(), sprog).toEqual(
        [DA, SE, "x-default"].sort()
      );
      expect(languages[DA], sprog).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/dage-i-aaret`
      );
      expect(languages[SE], sprog).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/dagar-i-aret`
      );
      expect(languages["x-default"], sprog).toBe(languages[DA]);
    }
  });

  test("den anden sprogs sti er 301 på dette domæne, og 404 i norsk", () => {
    for (const sprog of ["da", "se"] as const) {
      const anden = sprog === "da" ? "se" : "da";
      const domæne = getDomainConfigByLocale(sprog);
      const afprøv = (path: string) =>
        getRouteDecision(domæne, path) as
          | { type: "allow" }
          | { type: "not-found" }
          | { type: "redirect"; destination: string; status: 301 | 308 };
      expect(afprøv(DAGE_I_AARET_PATH[anden]), `${sprog}/${anden}`).toEqual({
        type: "redirect",
        destination: DAGE_I_AARET_PATH[sprog],
        status: 301,
      });
      expect(afprøv(DAGE_I_AARET_PATH[sprog]), sprog).toEqual({ type: "allow" });
    }
    // `beregner.no` er ikke i drift (❓ i planen), så den skal ikke servere
    // siden i norsk — ellers ville den få danske månedsnavne på et norsk domæne.
    expect(
      getRouteDecision(getDomainConfigByLocale("no"), DAGE_I_AARET_PATH.da)
    ).toEqual({ type: "not-found" });
  });

  test("siden ligger i begge sitemapme som daily", () => {
    for (const sprog of ["da", "se"] as const) {
      const sitemap = buildSitemap(getDomainConfigByLocale(sprog), I_DAG);
      const entry = sitemap.find(
        (e) => e.url === `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_I_AARET_PATH[sprog]}`
      );
      expect(entry, sprog).toBeDefined();
      expect(entry?.changeFrequency, sprog).toBe("daily");
      // Den anden sprogs URL må ikke stå i sit sitemap: den er en 301.
      expect(
        sitemap.some(
          (e) => e.url.endsWith(DAGE_I_AARET_PATH[sprog === "da" ? "se" : "da"])
        ),
        sprog
      ).toBe(false);
    }
  });

  test("siden linker til /dato, /ugenummer, /dage-til og dage-mellem i sit eget sprog", async () => {
    const da = await render("da");
    expect(da).toContain('href="/dato"');
    expect(da).toContain('href="/ugenummer"');
    expect(da).toContain('href="/dage-til"');
    expect(da).toContain('href="/dage-mellem-datoer"');
    const se = await render("se");
    expect(se).toContain('href="/dato"');
    expect(se).toContain('href="/dagar-till"');
    // De svenske slugs, ikke de danske: et dansk link på beraknare.se er en 301
    // pr. klik, altså en indgang brugeren ikke får.
    expect(se).toContain('href="/dagar-mellan-datum"');
    expect(se).not.toContain('href="/dage-mellem-datoer"');
    expect(se).not.toContain('href="/dage-til"');
    // `/ugenummer` er `daOnly`, så et svensk link ville være en 404.
    expect(se).not.toContain('href="/ugenummer"');
  });

  test("/dato og /ugenummer linker tilbage i begge sprog", () => {
    // Kilden læses, fordi `/dato`s og `/ugenummer`s egen testport ikke kan se
    // en ny sides indhold — og en død indgang er den nye sides eneste interne
    // vej fra sitets største dato-side (136.071 GSC-visninger).
    const dato = readFileSync("src/app/dato/page.tsx", "utf8");
    expect(dato).toContain('href="/dage-i-aaret"');
    expect(dato).toContain('href="/dagar-i-aret"');
    expect(readFileSync("src/app/ugenummer/page.tsx", "utf8")).toContain(
      'href="/dage-i-aaret"'
    );
  });
});

describe("dage i året: tallene i teksten og i tabellen er regnet", () => {
  test("årets længde er 365 i 2026, og næste skudår er 2028 med 366", () => {
    const o = aarsoversigt("da", I_DAG);
    expect(o.aar).toBe(2026);
    expect(o.dage).toBe(365);
    expect(o.skudaar).toBe(false);
    expect(o.naesteSkudaar).toBe(2028);
    expect(o.naesteSkudaarDage).toBe(366);
    // Mod kalenderen og mod den eksisterende tæller, ikke mod portens egen
    // formel: 2026 har 365 dage, 2028 er skudår med 29. februar.
    expect(aarstal(2026, "da").dage).toBe(365);
    expect(aarstal(2028, "da").dage).toBe(366);
    expect(erSkudaar(2028)).toBe(true);
    expect(erSkudaar(2026)).toBe(false);
  });

  test("tabellen er de tolv måneder fra maanederITaar, og summeringen er dem", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = aarsoversigt(sprog, I_DAG);
      const raekker = maanederITaar(2026, sprog);
      expect(o.maaneder.length, sprog).toBe(12);
      // Summerne skal være de måneders tal, der står i rækkerne — ellers er
      // «Hele året»-rækken en påstand, der ikke kan følge tabellen over den.
      expect(
        o.maaneder.reduce((sum, m) => sum + m.dage, 0),
        sprog
      ).toBe(o.dage);
      expect(
        o.maaneder.reduce((sum, m) => sum + m.arbejdsdage, 0),
        sprog
      ).toBe(o.arbejdsdage);
      expect(
        o.maaneder.reduce((sum, m) => sum + m.weekenddage, 0),
        sprog
      ).toBe(o.weekenddage);
      // De danske hverdage i 2026 er 251, målt uafhængigt mod kalenderen: 261
      // hverdage minus de 10 helligdage der faldt på en hverdag.
      if (sprog === "da") {
        expect(o.arbejdsdage, sprog).toBe(251);
        expect(o.weekenddage, sprog).toBe(104);
        // 251 hverdage + 104 weekenddage + 10 helligdage på hverdag = 365.
        expect(o.arbejdsdage + o.weekenddage + 10, sprog).toBe(365);
      }
      // Begge sprog skal have danske månedsnavne på den danske side og svenske
      // på den svenske — en dansk «augusti» på beraknare.se er den fejl
      // opgave F9 netop har dømt 13 steder af.
      for (const m of o.maaneder) {
        expect(m.name, `${sprog}/${m.month}`).toBe(raekker[m.month - 1]?.name);
      }
      const augusti = o.maaneder[7]?.name;
      const juli = o.maaneder[6]?.name;
      if (sprog === "da") {
        expect(augusti, sprog).toBe("august");
        expect(juli, sprog).toBe("juli");
      } else {
        expect(augusti, sprog).toBe("augusti");
        expect(juli, sprog).toBe("juli");
      }
    }
  });

  test("juli og augusti har hver 31 dage, og hverdage og weekenddage er hver sit tal", () => {
    // Augusti 2026 begynder en lørdag, så den har 10 weekenddage; juli 2026
    // begynder en onsdag, så den har 8. Begge har 31 dage — det er præcis
    // derfor «hvor mange dage er der i augusti» ikke kan besvares af «august har
    // 31 dage» alene, og derfor står hverdage og weekenddage i svaret.
    for (const sprog of ["da", "se"] as const) {
      const o = aarsoversigt(sprog, I_DAG);
      const juli = o.maaneder[6];
      const august = o.maaneder[7];
      expect(juli?.dage, sprog).toBe(31);
      expect(august?.dage, sprog).toBe(31);
      expect(juli?.arbejdsdage, sprog).toBe(23);
      expect(august?.arbejdsdage, sprog).toBe(21);
      expect(juli?.weekenddage, sprog).toBe(8);
      expect(august?.weekenddage, sprog).toBe(10);
      // FAQ'ens augusti- og juli-svar skal indeholde præcis disse tal, så en
      // ny kalender ikke kan få en løfte-sætning uden at porten ser det.
      const svarAugusti = dageIAaretFaq(sprog, I_DAG)[1]?.answer ?? "";
      const svarJuli = dageIAaretFaq(sprog, I_DAG)[2]?.answer ?? "";
      expect(svarAugusti, sprog).toContain(`31`);
      expect(svarAugusti, sprog).toContain(`21`);
      expect(svarAugusti, sprog).toContain(`10`);
      expect(svarJuli, sprog).toContain(`31`);
      expect(svarJuli, sprog).toContain(`23`);
      expect(svarJuli, sprog).toContain(`8`);
    }
  });

  test("dage tilbage er 90 den 2. oktober 2026, og 0 nytårsaften", () => {
    // 3.-31. oktober (29) + november (30) + december (31) = 90 dage efter i dag,
    // altså ikke «91» — det sidste døgn *er* 31. december, samme konvention som
    // `dageTilbageIAaret` i `dage-til.ts`, så de to sider ikke kan svare
    // forskelligt på «hvor mange dage er der tilbage».
    for (const sprog of ["da", "se"] as const) {
      const o = aarsoversigt(sprog, new Date("2026-10-02T12:00:00.000Z"));
      expect(o.tilbage, sprog).toBe(90);
      expect(o.tilbageUger, sprog).toBe(12);
      expect(o.tilbageRest, sprog).toBe(6);
      const nytarsaften = aarsoversigt(
        sprog,
        new Date("2026-12-31T12:00:00.000Z")
      );
      expect(nytarsaften.tilbage, sprog).toBe(0);
      const nytarsdag = aarsoversigt(sprog, new Date("2027-01-01T12:00:00.000Z"));
      expect(nytarsdag.aar, sprog).toBe(2027);
      expect(nytarsdag.dage, sprog).toBe(365);
      expect(nytarsdag.naesteSkudaar, sprog).toBe(2028);
      // Første dag af et skudår: 366 dage, og spørgsmålet «er 2028 et skudår»
      // skal kunne aflæses mod kalenderen.
      const skud = aarsoversigt(sprog, new Date("2028-01-01T12:00:00.000Z"));
      expect(skud.dage, sprog).toBe(366);
      expect(skud.skudaar, sprog).toBe(true);
    }
  });

  test("brødtekstens årstal og dagetal er præcis dem, oversigten regner", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = aarsoversigt(sprog, I_DAG);
      const afsnit = dageIAaretAfsnit(sprog, I_DAG);
      expect(afsnit.length, sprog).toBe(3);
      const foerste = afsnit[0]?.brødtekst ?? "";
      // Heltall, ikke formateret med Intl: et håndskrevet «365 dage» skal ramme
      // af denne prøve, så hele sætningen med årstallet dømmes.
      expect(foerste, sprog).toContain(`${o.aar}`);
      expect(foerste, sprog).toContain(`${o.dage}`);
      expect(foerste, sprog).toContain(`${o.arbejdsdage}`);
      expect(foerste, sprog).toContain(`${o.naesteSkudaar}`);
      expect(foerste, sprog).toContain(`${o.naesteSkudaarDage}`);
      expect(foerste, sprog).toContain(`${o.tilbage}`);
      // Skudårs-grenen i FAQ'en skal følge `skudaar`, så «2026 er ikke et
      // skudår» og «2028 er et skudår med 366 dage» er to sande sætninger.
      const svarAar = dageIAaretFaq(sprog, I_DAG)[0]?.answer ?? "";
      expect(svarAar, sprog).toContain(`${o.dage}`);
      expect(svarAar, sprog).toContain(`${o.naesteSkudaar}`);
      expect(svarAar, sprog).toContain(`${o.naesteSkudaarDage}`);
      if (o.skudaar) {
        expect(svarAar, sprog).toMatch(/skudår med|skottår med/);
      } else {
        expect(svarAar, sprog).toMatch(/ikke et skudår|inte ett skottår/);
      }
    }
  });

  test("sproghjælpen kender kun de to sprog, og norsk ikke har nogen side", () => {
    expect(isDageIAaretLocale("da")).toBe(true);
    expect(isDageIAaretLocale("se")).toBe(true);
    expect(isDageIAaretLocale("no")).toBe(false);
    expect(getDageIAaretPath("no")).toBeNull();
    expect(getDageIAaretPath("da")).toBe("/dage-i-aaret");
  });
});
