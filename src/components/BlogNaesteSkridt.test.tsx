import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NaesteSkridt } from "./BlogNaesteSkridt";
import BarselGuidePage from "@/app/blog/barsel-2026-regler-og-satser/page";
import Boernepenge2026Page from "@/app/blog/boernepenge-2026-satser-og-regler/page";
import FradragGuidePage from "@/app/blog/fradrag-2026-komplet-guide/page";
import SU2026GuidePage from "@/app/blog/su-2026-satser-og-regler/page";
import Boligstoette2026Page from "@/app/blog/boligstoette-2026-nye-regler/page";
import KvadratmeterGuidePage from "@/app/blog/kvadratmeter-saadan-regner-du-ud/page";
import BraendstofGuidePage from "@/app/blog/spar-penge-paa-braendstof/page";
import DagpengeGuidePage from "@/app/blog/dagpenge-saadan-finder-du-din-sats/page";

/**
 * Plausible 28 dage (2026-09-29): /blog/barsel-2026-regler-og-satser havde 184
 * besøgende og 85 % bounce. Artiklerne linkede alle til deres beregnere i
 * løbende tekst, men de sluttede på "Relaterede artikler" — det sidste klik
 * var endnu en artikel, så læseren aldrig nåede værktøjet.
 *
 * Den anden bølge (2026-09-30) tager de artikler, hvis beregner er blandt
 * sitets mest besøgte: /boligstoette 535, /kvadratmeter 388, /braendstof 265
 * og /barselsdagpenge 212 besøgende pr. 28 dage. Dagpenge-artiklen linkede
 * slet ikke til /barselsdagpenge, så der var ingen vej til værktøjet overhovedet.
 */
const artikler = [
  { navn: "barsel", href: "/barselsdagpenge", handling: "Beregn din barselsdagpenge", side: BarselGuidePage },
  { navn: "boernepenge", href: "/boernepenge", handling: "Beregn børnepengen", side: Boernepenge2026Page },
  { navn: "fradrag", href: "/rentefradrag", handling: "Beregn dit rentefradrag", side: FradragGuidePage },
  { navn: "su", href: "/su", handling: "Beregn din SU", side: SU2026GuidePage },
  { navn: "boligstoette", href: "/boligstoette", handling: "Beregn din boligstøtte", side: Boligstoette2026Page },
  { navn: "kvadratmeter", href: "/kvadratmeter", handling: "Beregn dit areal", side: KvadratmeterGuidePage },
  { navn: "braendstof", href: "/braendstof", handling: "Beregn din brændstofpris", side: BraendstofGuidePage },
  { navn: "dagpenge", href: "/barselsdagpenge", handling: "Beregn din dagpenge", side: DagpengeGuidePage },
] as const;

describe("NaesteSkridt", () => {
  test("er et link med synligt navn, ikke et knap-element uden handling", () => {
    const html = renderToStaticMarkup(
      <NaesteSkridt href="/su" handling="Beregn din SU" beskrivelse="Regn på din indkomst." />,
    );

    expect(html).toContain('href="/su"');
    expect(html).toContain("Beregn din SU");
    expect(html).toContain("Regn på din indkomst.");
    // Semantik: en navigation er et <a>, ikke en <button>.
    expect(html).not.toContain("<button");
  });

  test("har en trykflade på mindst 44 px", () => {
    const html = renderToStaticMarkup(
      <NaesteSkridt href="/su" handling="Beregn din SU" beskrivelse="Regn på din indkomst." />,
    );

    expect(html).toContain("min-h-11");
  });
});

describe("blogartikler slutter med en næste handling", () => {
  for (const { navn, href, handling, side } of artikler) {
    test(`${navn} linker til ${href} efter artiklen, ikke kun i løbende tekst`, async () => {
      const html = renderToStaticMarkup(await side());
      const slut = html.indexOf("</article>");
      const overskrift = html.indexOf("Regn det ud", slut);
      const cta = html.indexOf(`href="${href}"`, slut);

      expect(slut).toBeGreaterThan(-1);
      expect(overskrift).toBeGreaterThan(slut);
      expect(cta).toBeGreaterThan(overskrift);
      expect(html.slice(cta, cta + 200)).toContain(handling);
    });
  }

  test("den næste handling ligger før de relaterede artikler", async () => {
    const html = renderToStaticMarkup(await BarselGuidePage());
    const cta = html.indexOf("Regn det ud");
    const relaterede = html.indexOf("Relaterede artikler");

    expect(cta).toBeGreaterThan(-1);
    expect(relaterede).toBeGreaterThan(-1);
    expect(cta).toBeLessThan(relaterede);
  });
});
