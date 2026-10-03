/**
 * `/timer-i-aret` og `/timmar-i-aret` er to route-filer over én komponent, og det
 * er *stien* der vælger sproget — samme regel som `/dage-til`, `/klokken-i`,
 * `/dage-mellem-datoer` og `/dage-i-aaret`. En test der kun importerer den
 * danske kan derfor ikke se den svenske side, så begge ruter testes.
 *
 * Porten dømmer det siden *lover* — titel, `<h1>`, de tre målte søgninger som
 * `FAQPage`, canonical/hreflang, 301 mellem domænerne, sitemap og tovejslinket
 * fra `/tidsberegner` — og **alle tal i tabellerne og i brødteksten mod de
 * funktioner der har regnet dem**. Punkt 11: en påstand i tekst er kode.
 *
 * Den dømmer desuden, at døgnet og ugen kommer fra `timer-periode.ts` og ikke fra
 * en ny konstant her. Det er den fejlklasses centrale regel: to sider må ikke
 * have hver sin forfatter til «et døgn har 24 timer».
 */
import { readFileSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getRouteDecision } from "@/lib/routing";
import { timerIPeriode } from "@/lib/timer-periode";
import {
  isTimerLocale,
  periode,
  TIMER_I_ARET_PATH,
  timerAfsnit,
  timerCopy,
  timerFaq,
  timerMaaneder,
  timerOversigt,
  timerTal,
  type TimerLocale,
} from "@/lib/timer-i-aret";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { buildDageIAaretMetadata } from "@/components/DageIAaret";
import { buildTimerIAaretMetadata } from "@/components/TimerIAaret";
import { buildSitemap } from "./sitemap";
import TimerIAaretPage from "./timer-i-aret/page";
import TimmarIAaretPage from "./timmar-i-aret/page";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
type Spg = { question: string; answer: string }[];
// `FAQ` og `FAQSchema` erstattes af de simpleste komponenter, der viser *hele*
// spørgsmålsteksten: de to er de steder, siden lover sit svar på to gange.
vi.mock("@/components/FAQ", () => ({
  default: ({ items }: { items: Spg }) => (
    <div data-testid="faq">
      {items.map((i) => (
        <p key={i.question}>
          {i.question} {i.answer}
        </p>
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
  da: TimerIAaretPage,
  se: TimmarIAaretPage,
} as const;

/** 2026-10-03. Fast klokkeslæt, så tabellen kan måles mod kalenderen. */
const I_DAG = new Date("2026-10-03T12:00:00.000Z");

async function render(sprog: TimerLocale) {
  host.locale = sprog;
  return renderToStaticMarkup(await ROUTE_FOR[sprog]());
}

const SPOERGSMAAL: Record<TimerLocale, string> = {
  da: "hvor mange timer er der på et år",
  se: "hur många timmar är det på ett år",
};

describe("timer i et år: siden peger på sit eget spørgsmål", () => {
  test("begge sprog har egen sti, egen titel og egen h1", async () => {
    for (const sprog of ["da", "se"] as const) {
      const c = timerCopy[sprog];
      expect(TIMER_I_ARET_PATH[sprog], sprog).toBe(
        sprog === "da" ? "/timer-i-aret" : "/timmar-i-aret"
      );
      // Titlen og h1 skal ramme søgningen ordret: målingen 3/10 fandt «hvor mange
      // timer er der på et år» som dansk autocomplete **nr. 1** under «hvor mange
      // timer er der» og «hur många timmar är det på ett år» som svensk nr. 1.
      expect(c.title.toLowerCase(), sprog).toContain(SPOERGSMAAL[sprog]);
      expect(c.h1.toLowerCase(), sprog).toBe(`${SPOERGSMAAL[sprog]}?`);
      const html = await render(sprog);
      expect(html.match(/<h1[ >]/g)?.length, sprog).toBe(1);
      expect(c.description.length, sprog).toBeLessThanOrEqual(160);
      // Copy uden årstal: et frosset «2026» i titlen eller beskrivelsen ville være
      // et tal der bliver forkært næste år.
      expect(`${c.title}${c.description}${c.lead}`, sprog).not.toMatch(/20\d\d/);
    }
  });

  test("de tre målte spørgsmål står som FAQPage i begge sprog", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      const faq = timerFaq(sprog, I_DAG);
      expect(faq, sprog).toHaveLength(3);
      for (const spg of faq) {
        expect(html, `${sprog}/${spg.question}`).toContain(spg.question);
        // Svaret skal også ligge i JSON-LD, altså i det Google kan vise.
        expect(html, `${sprog}/${spg.question}`).toContain(spg.answer);
      }
      expect(
        html.includes(`"${faq[0].question}"`),
        `${sprog}: spørgsmålet skal være i JSON-LD`
      ).toBe(true);
      expect(html, sprog).not.toContain("NaN");
    }
  });
});

describe("alle timer er regnet, ikke skrevet", () => {
  test("hver periode og hver måned er dage × 24", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = timerOversigt(sprog, I_DAG);
      expect(o.timer, sprog).toBe(o.dage * 24);
      expect(o.minutter, sprog).toBe(o.timer * 60);
      for (const raekke of o.perioder) {
        expect(raekke.timer, `${sprog}/${raekke.id}/${raekke.dage}`).toBe(
          raekke.dage * 24
        );
        expect(raekke.minutter, `${sprog}/${raekke.id}/${raekke.dage}`).toBe(
          raekke.timer * 60
        );
      }
      for (const { maaned, timer, minutter } of timerMaaneder(o)) {
        expect(timer, `${sprog}/${maaned.name}`).toBe(maaned.dage * 24);
        expect(minutter, `${sprog}/${maaned.name}`).toBe(timer * 60);
      }
      // De tolv måneders timer skal summere til årets timer — ellers er
      // månedstabellen og summeringsrækken to forfattere af samme år.
      const sum = timerMaaneder(o).reduce((acc, m) => acc + m.timer, 0);
      expect(sum, sprog).toBe(o.timer);
    }
  });

  test("FAQ-svarene bruger de samme tal som tabellen", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = timerOversigt(sprog, I_DAG);
      const svar = timerFaq(sprog, I_DAG).map((s) => s.answer).join(" ");
      for (const raekke of [periode(o, "aar"), periode(o, "uge")]) {
        expect(svar, `${sprog}/${raekke.id}`).toContain(
          timerTal(raekke.timer, sprog)
        );
      }
      const korteste = Math.min(...o.maaneder.map((m) => m.dage));
      expect(svar, sprog).toContain(timerTal(korteste * 24, sprog));
      // Kun årets afsnit handler om året; uge- og månedsafsnittenes tal er
      // dømt ovenfor gennem `timerFaq`.
      const [aarAfsnit] = timerAfsnit(sprog, I_DAG);
      expect(aarAfsnit.overskrift.toLowerCase(), sprog).toContain(
        SPOERGSMAAL[sprog]
      );
      expect(aarAfsnit.brødtekst, sprog).toContain(timerTal(o.timer, sprog));
    }
  });

  test("døgnet og ugen læses fra timer-periode.ts, ikke fra en ny konstant", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = timerOversigt(sprog, I_DAG);
      for (const id of ["doegn", "uge"] as const) {
        const raekke = periode(o, id);
        expect(raekke.timer, `${sprog}/${id}`).toBe(timerIPeriode(id).timer);
        expect(raekke.dage, `${sprog}/${id}`).toBe(timerIPeriode(id).dage);
      }
    }
  });
});

describe("én forfatter pr. periode", () => {
  test("kvartal og halvtår står ikke i tabellen", () => {
    for (const sprog of ["da", "se"] as const) {
      const o = timerOversigt(sprog, I_DAG);
      const ids = o.perioder.map((p) => p.id);
      // `TIMER_PERIODER`s kvartal er et snit på 91,25 dage. En kalendermåned ved
      // siden af et sådant kvartal ville give to tal for «et kvartal».
      expect(ids, sprog).not.toContain("kvartal");
      expect(ids, sprog).not.toContain("halvt-aar");
      // De tre kalendermåneder skal stå pr. længde, kortest først.
      const maaneder = o.perioder.filter((p) => p.id === "maaned");
      expect(maaneder.length, sprog).toBe(3);
      expect(maaneder.map((m) => m.dage), sprog).toEqual([28, 30, 31]);
      for (const maaned of maaneder) {
        expect(maaned.navn, sprog).toContain(
          o.maaneder.find((m) => m.dage === maaned.dage)?.name ?? "!"
        );
      }
    }
  });
});

describe("tabellens tal i den renderede side", () => {
  test("dansk: 8.760 timer for 2026, og 8.760 findes ikke med svensk skrivemåde", async () => {
    const html = await render("da");
    expect(html).toContain("8.760");
    expect(html).toContain("10.080");
    expect(html).toContain("525.600");
    // Tusindtalsseparatoren: «8.760» i dansk, aldrig «8.760» med et andet tegn.
    expect(html).not.toContain("8760");
    expect(html).not.toContain("8 760");
  });

  test("svensk: mellemrum i separatoren og ingen dansk variant", async () => {
    const html = await render("se");
    expect(html).toContain("8 760");
    expect(html).not.toContain("8.760");
    expect(html).not.toContain("8760");
  });

  test("begge sprog: tabellerne har de forventede rækker", async () => {
    for (const sprog of ["da", "se"] as const) {
      const o = timerOversigt(sprog, I_DAG);
      const html = await render(sprog);
      for (const raekke of o.perioder) {
        expect(html, `${sprog}/${raekke.id}`).toContain(raekke.navn);
      }
      for (const { maaned } of timerMaaneder(o)) {
        expect(html, `${sprog}/${maaned.name}`).toContain(maaned.name);
      }
      // Summeringsrækken: 12 måneder + «hele året».
      expect(html.split("<tr").length - 1, sprog).toBeGreaterThanOrEqual(
        o.perioder.length + 13
      );
    }
  });
});

describe("stien *er* sprogvalget", () => {
  test("begge domæner sender den anden sprogs sti med 301", async () => {
    for (const [locale, sti, fremmed] of [
      ["da", "/timer-i-aret", "/timmar-i-aret"],
      ["se", "/timmar-i-aret", "/timer-i-aret"],
    ] as const) {
      const config = getDomainConfigByLocale(locale);
      const egen = getRouteDecision(config, fremmed);
      expect(egen, `${locale}: ${fremmed}`).toEqual({
        type: "redirect",
        destination: sti,
        status: 301,
      });
      expect(
        getRouteDecision(config, sti),
        `${locale}: ${sti}`
      ).toEqual({ type: "allow" });
    }
  });

  test("norsk domæne får ingen tredje kopi", () => {
    expect(isTimerLocale("no")).toBe(false);
    for (const sti of ["/timer-i-aret", "/timmar-i-aret"]) {
      const afgør = getRouteDecision(getDomainConfigByLocale("no"), sti);
      expect(["not-found", "redirect"], sti).toContain(afgør.type);
      if (afgør.type === "redirect") {
        expect(afgør.destination, sti).not.toBe(sti);
      }
    }
  });

  test("canonical og hreflang peker på hvert sit eget domæne", async () => {
    for (const sprog of ["da", "se"] as const) {
      host.locale = sprog;
      const meta = await buildTimerIAaretMetadata(TIMER_I_ARET_PATH[sprog], I_DAG);
      const canonical = `${getDomainConfigByLocale(sprog).baseUrl}${TIMER_I_ARET_PATH[sprog]}`;
      expect(meta.alternates?.canonical, sprog).toBe(canonical);
      const languages = meta.alternates?.languages as Record<string, string>;
      expect(languages[getDomainConfigByLocale("da").hreflangCode]).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/timer-i-aret`
      );
      expect(languages[getDomainConfigByLocale("se").hreflangCode]).toBe(
        `${getDomainConfigByLocale("se").baseUrl}/timmar-i-aret`
      );
      expect(languages["x-default"]).toBe(
        `${getDomainConfigByLocale("da").baseUrl}/timer-i-aret`
      );
      expect(meta.robots, sprog).toBeUndefined();
    }
  });

  test("den anden sprogs sti på sit eget domæne giver noindex", async () => {
    host.locale = "da";
    const meta = await buildTimerIAaretMetadata("/timmar-i-aret", I_DAG);
    expect(meta.robots).toEqual({ index: false, follow: false });
    // Samme regel som på `/dage-i-aaret`: et kald med den forkerte sti er en
    // programmeringsfejl, ikke en ny side.
    host.locale = "da";
    const dageMeta = await buildDageIAaretMetadata("/dagar-i-aret", I_DAG);
    expect(dageMeta.robots).toEqual({ index: false, follow: false });
  });

  test("begge URL'er ligger i hvert sit eget sitemap med daily", async () => {
    for (const sprog of ["da", "se"] as const) {
      const sitemap = await buildSitemap(getDomainConfigByLocale(sprog));
      const sti = TIMER_I_ARET_PATH[sprog];
      const entry = sitemap.find((e) => e.url === `${getDomainConfigByLocale(sprog).baseUrl}${sti}`);
      expect(entry, `${sprog}: ${sti}`).toBeDefined();
      expect(entry?.changeFrequency, sti).toBe("daily");
      // Den anden sprogs sti må ikke ligge på dette domænes sitemap.
      const fremmed = TIMER_I_ARET_PATH[sprog === "da" ? "se" : "da"];
      expect(
        sitemap.some((e) => e.url.endsWith(fremmed)),
        `${sprog}: ${fremmed}`
      ).toBe(false);
    }
  });
});

describe("tovejslink", () => {
  test("/tidsberegner linker til begge siders time-periode", () => {
    const kilde = readFileSync(
      "src/app/tidsberegner/page.tsx",
      "utf-8"
    );
    expect(kilde).toContain('href="/timer-i-aret"');
    expect(kilde).toContain('href="/timmar-i-aret"');
  });

  test("siden linker videre til værktøjet og til dage-i-aaret", async () => {
    for (const sprog of ["da", "se"] as const) {
      const html = await render(sprog);
      expect(html, sprog).toContain('href="/tidsberegner"');
      // Siden skal ikke linke til sig selv: dage-i-aaret er dens søsterside,
      // og det er den der skal have tovejslinket.
      // Søstersiden hedder `/dage-i-aaret` på dansk og `/dagar-i-aret` på
      // svensk, så forventningen læses af den funktion der ejer stien.
      expect(html, sprog).toContain(`href="${getDageIAaretPath(sprog)}"`);
      expect(html, sprog).not.toContain(`href="${TIMER_I_ARET_PATH[sprog]}"`);
    }
  });
});