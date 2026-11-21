import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { NaesteSkridt } from "./BlogNaesteSkridt";
import { isCalculatorAvailable } from "@/lib/calculator-list";
import BarselGuidePage from "@/app/blog/barsel-2026-regler-og-satser/page";
import Boernepenge2026Page from "@/app/blog/boernepenge-2026-satser-og-regler/page";
import FradragGuidePage from "@/app/blog/fradrag-2026-komplet-guide/page";
import SU2026GuidePage from "@/app/blog/su-2026-satser-og-regler/page";
import Boligstoette2026Page from "@/app/blog/boligstoette-2026-nye-regler/page";
import KvadratmeterGuidePage from "@/app/blog/kvadratmeter-saadan-regner-du-ud/page";
import BraendstofGuidePage from "@/app/blog/spar-penge-paa-braendstof/page";
import DagpengeGuidePage from "@/app/blog/dagpenge-saadan-finder-du-din-sats/page";
import ArveafgiftGuidePage from "@/app/blog/arveafgift-regler-og-satser/page";
import MomsGuidePage from "@/app/blog/hvordan-beregner-man-moms/page";
import TidszoneGuidePage from "@/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark/page";
import ProcentReglenGuidePage from "@/app/blog/30-procent-reglen-husleje/page";
import BmiBorneGuidePage from "@/app/blog/bmi-for-boern-saadan-tjekker-du/page";
import FeriepengeGuidePage from "@/app/blog/guide-feriepenge-hvornaar-og-hvor-meget/page";
import PensionGuidePage from "@/app/blog/pension-hvor-meget-skal-du-spare-op/page";

/**
 * Plausible 28 dage (2026-09-29): /blog/barsel-2026-regler-og-satser havde 184
 * besøgende og 85 % bounce. Artiklerne linkede alle til deres beregnere i
 * løbende tekst, men de sluttede på "Relaterede artikler" — det sidste klik
 * var endnu en artikel, så læseren aldrig nåede værktøjet.
 *
 * Den anden bølge (2026-09-30) tager de artikler, hvis beregner er blandt
 * sitets mest besøgte: /boligstoette 535, /kvadratmeter 388, /braendstof 265
 * og /barselsdagpenge 212 besøgende pr. 28 dage.
 *
 * Dagpenge-artiklen havde i den bølge en CTA til /barselsdagpenge under
 * knappen "Beregn din dagpenge". Det var en fejl: artiklen handler om at
 * finde sin *egen* dagpengesats, og den er skrevet om /dagpenge, som den også
 * linkede til i løbende tekst. Rettet 30/9 — se `blog/naeste-skridt.test.ts`,
 * der fanger den slags fremover.
 */
const artikler = [
  { navn: "barsel", href: "/barselsdagpenge", handling: "Beregn din barselsdagpenge", side: BarselGuidePage },
  { navn: "boernepenge", href: "/boernepenge", handling: "Beregn børnepengen", side: Boernepenge2026Page },
  { navn: "fradrag", href: "/rentefradrag", handling: "Beregn dit rentefradrag", side: FradragGuidePage },
  { navn: "su", href: "/su", handling: "Beregn din SU", side: SU2026GuidePage },
  { navn: "boligstoette", href: "/boligstoette", handling: "Beregn din boligstøtte", side: Boligstoette2026Page },
  { navn: "kvadratmeter", href: "/kvadratmeter", handling: "Beregn dit areal", side: KvadratmeterGuidePage },
  { navn: "braendstof", href: "/braendstof", handling: "Beregn din brændstofpris", side: BraendstofGuidePage },
  { navn: "dagpenge", href: "/dagpenge", handling: "Beregn din dagpenge", side: DagpengeGuidePage },
] as const;

/**
 * Tredje bølge (2026-09-30): de otte mest besøgte artikler, der stadig sluttede
 * på "Relaterede artikler". /blog/arveafgift-regler-og-satser faldt 100 → 84
 * besøgende pr. 28 dage, og artiklen linkede til /arveafgift i løbende tekst
 * uden at næste handling pegede derhen. De øvrige er valgt efter den samme
 * regel: beregneren er blandt sitets mest besøgte (/moms 22.464 GSC-visninger,
 * /tidszone 24.324, /bmi 934 Plausible-besøgende, /dato 1.133, /husleje 165,
 * /pension 142), så et afgående klik er målbart.
 */
const naesteBaelge = [
  { navn: "arveafgift", href: "/arveafgift", handling: "Beregn arveafgiften", side: ArveafgiftGuidePage },
  { navn: "moms", href: "/moms", handling: "Beregn din moms", side: MomsGuidePage },
  { navn: "tidszone", href: "/tidszone", handling: "Se klokken i din by", side: TidszoneGuidePage },
  { navn: "30-procent", href: "/husleje", handling: "Se hvor meget du har til husleje", side: ProcentReglenGuidePage },
  { navn: "bmi-boern", href: "/bmi", handling: "Beregn dit barns BMI", side: BmiBorneGuidePage },
  { navn: "feriepenge", href: "/dato", handling: "Tæll dagene til din ferie", side: FeriepengeGuidePage },
  { navn: "pension", href: "/pension", handling: "Beregn din pension", side: PensionGuidePage },
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

describe("de otte mest besøgte artikler uden næste handling har nu én", () => {
  for (const { navn, href, handling, side } of naesteBaelge) {
    test(`${navn} slutter med ${href} og ikke med en artikel til`, async () => {
      const html = renderToStaticMarkup(await side());
      const slut = html.indexOf("</article>");
      const overskrift = html.indexOf("Regn det ud", slut);
      const cta = html.indexOf(`href="${href}"`, overskrift);

      expect(slut).toBeGreaterThan(-1);
      expect(overskrift).toBeGreaterThan(slut);
      expect(cta).toBeGreaterThan(overskrift);
      expect(html.slice(cta, cta + 200)).toContain(handling);

      // Det afgående klik skal være værktøjet, ikke det næste blogindlæg.
      const relaterede = html.indexOf("Relaterede artikler", slut);
      if (relaterede > -1) expect(overskrift).toBeLessThan(relaterede);
    });
  }

  test("hver beregner findes, så linket ikke er en død CTA", () => {
    for (const { href } of naesteBaelge) {
      expect(isCalculatorAvailable(href, "da")).toBe(true);
    }
  });
});
