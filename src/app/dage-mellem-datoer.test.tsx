/**
 * `/dage-mellem-datoer` og `/dagar-mellan-datum` er to route-filer over én
 * komponent, og det er *stien* der vælger sproget — samme regel som
 * `/dage-til` og `/klokken-i`. En test der kun importerer den danske kan derfor
 * ikke se den svenske side, og det er præcis sådan «dagar mellan datum» kun
 * blev fundet på den danske: alle eksisterende tests renderede `dage-til`.
 * Derfor testes begge ruter, og deres `getCurrentDomainConfig`-mock skifter
 * sprog.
 *
 * Porten dømmer de ting siden *lover* — titel, `<h1>`, de tre spørgsmål som
 * `FAQPage`, canonical/hreflang og 301 mellem domænerne — og alle tal i
 * brødtekten mod de funktioner der har regnet dem, så en ny kalender eller et
 * nyt sprog ikke kan få løfte-sætninger uden at porten ser det.
 */
import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import {
  DAGE_MELLEM_PATH,
  aarsLængde,
  dageMellemAfsnit,
  dageMellemCopy,
  dageMellemEksempel,
  erSkudAar,
  getDageMellemPath,
  isDageMellemLocale,
} from "@/lib/dage-mellem-datoer";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { heleDageMellem, parseIsoDato } from "@/lib/lokal-dato";
import { buildSitemap } from "./sitemap";
import DageMellemDatoerPage from "./dage-mellem-datoer/page";
import DagarMellanDatumPage from "./dagar-mellan-datum/page";
import { buildDageMellemMetadata } from "@/components/DageMellemDatoer";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
type Spg = { question: string; answer: string }[];
// `FAQ` og `FAQSchema` erstattes af de simpleste komponenter, der viser *hele*
// spørgsmålsteksten: de to er de steder, siden lover sit svar på to gange, og
// en mock der renderer `null` ville skjule præcis den fejl, porten skal finde.
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
// Værktøjet er ikke præmien her: det er en fire-funktioners kalkulator, der
// kræver `LocaleProvider` og deler state med `/dato`. Siden dømmer *hvor* den
// står, og `DatoBeregner`-porten dømmer selve regnestykkerne.
vi.mock("@/components/DatoBeregner", () => ({
  default: () => <div data-testid="dato-beregner" />,
}));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const host = vi.hoisted(() => ({ locale: "da" as "da" | "se" }));

vi.mocked(getCurrentDomainConfig).mockImplementation(async () =>
  getDomainConfigByLocale(host.locale)
);

const ROUTE_FOR = {
  da: DageMellemDatoerPage,
  se: DagarMellanDatumPage,
} as const;

/** 2026-10-02. Fast klokkeslæt, så eksemplet kan måles mod en kalender. */
const I_DAG = new Date("2026-10-02T12:00:00.000Z");

async function render(sprog: "da" | "se") {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

describe("dage mellem datoer: den peger på sit eget spørgsmål", () => {
  test("begge sprog har egen sti, egen titel og egen h1", async () => {
    for (const sprog of ["da", "se"] as const) {
      const c = dageMellemCopy[sprog];
      expect(DAGE_MELLEM_PATH[sprog], sprog).toBe(
        sprog === "da" ? "/dage-mellem-datoer" : "/dagar-mellan-datum"
      );
      // Titlen skal ramme søgningen ordret: GSC's fire søgninger er
      // «dage mellem datoer» og de tre svenske varianter. Ordene fra
      // spørgsmålet skal stå i titlen, ellers er siden en anden sides kopi.
      const spoergsmaal = sprog === "da" ? "dage mellem datoer" : "dagar mellan datum";
      expect(c.title.toLowerCase(), sprog).toContain(spoergsmaal);
      expect(c.h1.toLowerCase(), sprog).toContain(
        sprog === "da" ? "mellem to datoer" : "mellan två datum"
      );
      const html = await render(sprog);
      expect(html, sprog).toContain('data-testid="dato-beregner"');
      expect(html, sprog).toContain(`<h1`);
      // Ét h1 pr. side: dublet-overskrift-porten dømmer de svenske, men kun
      // fordi de findes i kilde.
      expect(html.match(/<h1[ >]/g)?.length, sprog).toBe(1);
      expect(c.description.length, sprog).toBeLessThanOrEqual(160);
    }
  });

  test("de tre spørgsmål står i den synlige tekst og i FAQPage-JSON-LD", async () => {
    for (const sprog of ["da", "se"] as const) {
      const faq = dageMellemCopy[sprog].faq;
      expect(faq.length, sprog).toBe(3);
      const html = await render(sprog);
      for (const spg of faq) {
        expect(html, `${sprog}/${spg.question}`).toContain(spg.question);
        expect(html, `${sprog}/${spg.question}`).toContain(spg.answer);
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
      const meta = await buildDageMellemMetadata(DAGE_MELLEM_PATH[sprog], I_DAG);
      const canonical = meta.alternates?.canonical;
      expect(canonical, sprog).toBe(
        `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_MELLEM_PATH[sprog]}`
      );
      const languages = meta.alternates?.languages as Record<string, string>;
      const DA = getDomainConfigByLocale("da").hreflangCode;
      const SE = getDomainConfigByLocale("se").hreflangCode;
      expect(Object.keys(languages).sort(), sprog).toEqual(
        [DA, SE, "x-default"].sort()
      );
      expect(languages[DA], sprog).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/dage-mellem-datoer`
      );
      expect(languages[SE], sprog).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/dagar-mellan-datum`
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
      expect(afprøv(DAGE_MELLEM_PATH[anden]), `${sprog}/${anden}`).toEqual({
        type: "redirect",
        destination: DAGE_MELLEM_PATH[sprog],
        status: 301,
      });
      expect(afprøv(DAGE_MELLEM_PATH[sprog]), sprog).toEqual({ type: "allow" });
    }
    // `beregner.no` er ikke i drift (❓ i planen), så den skal ikke servere
    // siden i norsk — ellers ville den få dansk brødtekst på et norsk domæne.
    expect(
      getRouteDecision(getDomainConfigByLocale("no"), DAGE_MELLEM_PATH.da)
    ).toEqual({ type: "not-found" });
  });

  test("siden ligger i begge sitemapme som daily", () => {
    for (const sprog of ["da", "se"] as const) {
      const sitemap = buildSitemap(getDomainConfigByLocale(sprog), I_DAG);
      const entry = sitemap.find(
        (e) => e.url === `${getDomainConfigByLocale(sprog).baseUrl}${DAGE_MELLEM_PATH[sprog]}`
      );
      expect(entry, sprog).toBeDefined();
      expect(entry?.changeFrequency, sprog).toBe("daily");
      // Den anden sprogs URL må ikke stå i sit sitemap: den er en 301.
      expect(
        sitemap.some(
          (e) => e.url.endsWith(DAGE_MELLEM_PATH[sprog === "da" ? "se" : "da"])
        ),
        sprog
      ).toBe(false);
    }
  });

  test("den danske side linker til /dato og /ugenummer, den svenske til /dato", async () => {
    const da = await render("da");
    expect(da).toContain('href="/dato"');
    expect(da).toContain('href="/ugenummer"');
    expect(da).toContain('href="/dage-til"');
    const se = await render("se");
    expect(se).toContain('href="/dato"');
    expect(se).toContain('href="/dagar-till"');
    // `/ugenummer` er `daOnly`, så et svensk link ville være en 404.
    expect(se).not.toContain('href="/ugenummer"');
  });

  test("/dato og /ugenummer linker tilbage i begge sprog", () => {
    // Kilden læses, fordi `/dato`s og `/ugenummer`s egen testport ikke kan se
    // en ny sides indhold — og en død indgang er den nye sides eneste interne
    // vej fra sitets to største dato-sider.
    const dato = readFileSync("src/app/dato/page.tsx", "utf8");
    expect(dato).toContain('href="/dage-mellem-datoer"');
    expect(dato).toContain('href="/dagar-mellan-datum"');
    expect(readFileSync("src/app/ugenummer/page.tsx", "utf8")).toContain(
      'href="/dage-mellem-datoer"'
    );
  });
});

describe("dage mellem datoer: tallene i teksten er regnet", () => {
  test("årets længde er 365 i 2026 og 366 i skudåret 2028", () => {
    const a = aarsLængde("da", I_DAG);
    expect(a.aar).toBe(2026);
    expect(a.dage).toBe(365);
    expect(a.skudAar).toBe(2028);
    expect(a.skudDage).toBe(366);
    // Mod kalenderen, ikke mod portens egen formel: 2026 har 365 dage, og 2028
    // er skudår med 29. februar.
    expect(
      heleDageMellem(
        parseIsoDato("2026-01-01") as Date,
        parseIsoDato("2027-01-01") as Date
      )
    ).toBe(365);
    expect(erSkudAar(2028)).toBe(true);
    expect(erSkudAar(2026)).toBe(false);
    // Hundårreglen: 1900 var ikke skudår, 2000 var det.
    expect(erSkudAar(1900)).toBe(false);
    expect(erSkudAar(2000)).toBe(true);
  });

  test("brødtekstens dagetal er præcis dem, kalenderen har — ikke håndskrevne", () => {
    for (const sprog of ["da", "se"] as const) {
      const a = aarsLængde(sprog, I_DAG);
      // Andet afsnit er kalenderdage/arbetsdage i begge sprog — valgt efter
      // stilling, fordi overskriften hedder «Kalenderdage» og «Kalenderdagar».
      const kalenderAfsnit = dageMellemAfsnit(sprog, I_DAG)[1];
      expect(kalenderAfsnit, sprog).toBeDefined();
      expect(dageMellemAfsnit(sprog, I_DAG).length, sprog).toBe(3);
      const dage = sprog === "se" ? "dagar" : "dage";
      const under = sprog === "se" ? "under" : "i";
      // Heltall, ikke formateret med Intl: et håndskrevet «366 dage under 2028»
      // skal ramme af denne prøve, så hele sætningen med årstallet dømmes.
      expect(kalenderAfsnit?.brødtekst, sprog).toContain(
        `${a.dage} ${dage} ${under} ${a.aar}`
      );
      expect(kalenderAfsnit?.brødtekst, sprog).toContain(
        `${a.skudDage} ${dage} ${under} ${a.skudAar}`
      );
    }
  });

  test("FAQ'ens skudårsår er skudår, og de andre er ikke", () => {
    for (const sprog of ["da", "se"] as const) {
      const svar = dageMellemCopy[sprog].faq.find((f) =>
        f.answer.includes("skud") || f.answer.includes("skottår")
      );
      expect(svar, sprog).toBeDefined();
      // Hvert fireårstal i svaret skal være *ikke* skudår, når teksten siger
      // «ikke skudår» — ellers er porten kun en kopi af min egen antagelse.
      for (const aar of [2024, 2028]) expect(erSkudAar(aar), `${sprog}/${aar}`).toBe(true);
      for (const aar of [2026, 2027]) expect(erSkudAar(aar), `${sprog}/${aar}`).toBe(false);
    }
  });

  test("eksemplet er den periode, dageMellemEksempel regner", async () => {
    for (const sprog of ["da", "se"] as const) {
      const e = dageMellemEksempel(sprog, I_DAG);
      expect(e.fraIso, sprog).toBe("2026-01-01");
      expect(e.tilIso, sprog).toBe("2027-01-01");
      expect(e.dage, sprog).toBe(365);
      expect(e.uger, sprog).toBe(52);
      expect(e.restDage, sprog).toBe(1);
      const html = await render(sprog);
      expect(html, sprog).toContain(e.fraTekst);
      expect(html, sprog).toContain(e.tilTekst);
    }
  });

  test("sproghjælpen kender kun de to sprog, og norsk ikke har nogen side", () => {
    expect(isDageMellemLocale("da")).toBe(true);
    expect(isDageMellemLocale("se")).toBe(true);
    expect(isDageMellemLocale("no")).toBe(false);
    expect(getDageMellemPath("no")).toBeNull();
    expect(getDageMellemPath("da")).toBe("/dage-mellem-datoer");
  });
});
