/**
 * Fakta- og FAQ-teksterne på `/dage-til/*` og `/dagar-till/*` er skrevet med
 * `**fed**` i datalaget, men `DageTilPage` og `FAQ` rendrede dem som ren tekst —
 * så læseren så «mensen **slutdatoen** er kommunal» på live, med stjernerne, og
 * FAQPage-JSON-LD'en (som Google citerer) bar samme markup.
 *
 * Denne port rendrer den rigtige side med de rigtige komponenter for *alle*
 * datoer på begge sprog og afviser markup i outputtet, og den rendrer de tre
 * sider hvor stjernerne stod live for at se, at de bliver fed tekst.
 */
import { describe, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getDageTilEvents } from "@/lib/dage-til";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { LocaleProvider } from "@/components/LocaleProvider";
import DageTilPage from "./dage-til/[dato]/page";
import DagarTillPage from "./dagar-till/[dato]/page";

vi.mock("@/components/Breadcrumbs", () => ({ default: () => null }));
vi.mock("@/lib/get-locale", () => ({ getCurrentDomainConfig: vi.fn() }));

const ROUTE_FOR = { da: DageTilPage, se: DagarTillPage } as const;

async function renderRoute(sprog: "da" | "se", slug: string) {
  vi.mocked(getCurrentDomainConfig).mockResolvedValue(
    getDomainConfigByLocale(sprog)
  );
  return renderToStaticMarkup(
    <LocaleProvider locale={sprog} domainConfig={getDomainConfigByLocale(sprog)}>
      {await ROUTE_FOR[sprog]({ params: Promise.resolve({ dato: slug }) })}
    </LocaleProvider>
  );
}

function readFaqJsonLd(html: string): { question: string; answer: string }[] {
  const scripts = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ].map((match) => match[1]);
  const raw = scripts.find((script) => script.includes('"FAQPage"'));
  if (!raw) throw new Error("no FAQPage JSON-LD in output");
  const json = JSON.parse(
    raw
      .replaceAll("&quot;", '"')
      .replaceAll("&#x27;", "'")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&amp;", "&")
  ) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
  return json.mainEntity.map((entry) => ({
    question: entry.name,
    answer: entry.acceptedAnswer.text,
  }));
}

describe("dage-til: fakta og FAQ uden markdownrester", () => {
  test("ingen dato rendrer markdownstjerner i teksten", async () => {
    for (const sprog of ["da", "se"] as const) {
      for (const event of getDageTilEvents(sprog)) {
        const slug = event[sprog]!.slug;
        const html = await renderRoute(sprog, slug);
        expect(html, `${sprog}/${slug}`).toContain("<h1");
        expect(html, `${sprog}/${slug}`).not.toContain("**");
      }
    }
  });

  test("FAQPage-JSON-LD har svarene som ren tekst", async () => {
    for (const sprog of ["da", "se"] as const) {
      for (const event of getDageTilEvents(sprog)) {
        const slug = event[sprog]!.slug;
        const html = await renderRoute(sprog, slug);
        expect(readFaqJsonLd(html), `${sprog}/${slug}`).toEqual(
          event[sprog]!.copy.faq.map((item) => ({
            question: item.question,
            answer: item.answer.replaceAll(/\*\*([^*]+)\*\*/g, "$1"),
          }))
        );
      }
    }
  });

  test("de fedede ord i fakta bliver rigtig fremhævning", async () => {
    // Sætningen der stod live med stjerner: at det er slutdatoen, der er kommunal.
    const sommerferie = await renderRoute("da", "sommerferien");
    expect(sommerferie).toContain("<strong>slutdatoen</strong>");
    // Efterårsferien: «i **uge 42**» og «den **første skoledag**».
    const efteraar = await renderRoute("da", "efteraarsferien");
    expect(efteraar).toContain("<strong>uge 42</strong>");
    expect(efteraar).toContain("<strong>første skoledag</strong>");
  });

  test("skolestart peger på den første skoledag med fed tekst", async () => {
    const html = await renderRoute("da", "skolestart");
    expect(html).toContain("<strong>1. august</strong>");
    expect(html).toContain(
      "<strong>nedtællingen følger den første skoledag</strong>"
    );
  });
});
