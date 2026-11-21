/**
 * Overskriftsniveauet i de beregnerværktøjer, der renderes direkte under sidens
 * `<h1>`.
 *
 * **Hvad fejlen var.** 50 af sitets 207 sider (24 %) havde en brudt
 * overskriftsstruktur: `<h1>` → `<h3>`, altså et spring på to niveauer. En
 * skærmlæser læser ikke titlen og springer videre til næste afsnit — den
 * navigerer *efter niveau*, og springet skjuler både værktøjets egne
 * afsnitsoverskrifter og hele sidens brødtekst under ét uventet niveau.
 *
 * **Årsagen var ikke 50 sider.** Den var 31 komponenter: værktøjerne skrev deres
 * interne struktur som `h3`/`h4`, fordi de var skrevet til at sidde *inde i* et
 * `h2`-afsnit. Men `<XxxBeregner />` er monteret som sidens første element efter
 * `h1` og *før* sidens første `h2` — altså som søskende til afsnittene, ikke
 * som et barn af et. Det er samme fejltype som C94's negative SE-lås: en
 * regel, der blev skrevet for den gruppe den var skrevet for, og som aldrig blev
 * målt mod den markup den faktisk producerer.
 *
 * **Hvorfor denne test renderer frem for at grepe kilden.** Et grep i `src/`
 * kan ikke se, *hvor i siden* komponenten monteres — det er præcis det
 * blind spot, der lod klassen ligge i 24 % af sitet. Testen læser derfor den
 * server-renderede HTML og kræver to ting hver for sig:
 *
 * 1. **Ingen spring i brødteksten** — et `<hN>` må aldrig følge mere end ét
 *    niveau ned. Det er den fejl, der var.
 * 2. **Præcis ét `<h1>`** — et værktøj der selv renderer en `h1` giver siden
 *    to. Det er samme regel, fordi det er samme fejl: et dokument med to
 *    rodniveauer.
 *
 * Testen dækker *kun* de værktøjer, der er monteret som sidenes første
 * element. Komponenter der renderes *inde i* et `h2`-afsnit har lov til at
 * begynde på `h3` — det er korrekt, ikke en fejl, og en test der låser
 * "minimumsniveau 2" på hele `src/components/` ville flagge dem.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import { LocaleProvider } from "./LocaleProvider";
import AktieskatBeregner from "./AktieskatBeregner";
import BarselBeregner from "./BarselBeregner";
import BilBeregner from "./BilBeregner";
import BillaanBeregner from "./BillaanBeregner";
import BoliglaanBeregner from "./BoliglaanBeregner";
import BoligstoetteBeregner from "./BoligstoetteBeregner";
import BraendstofBeregner from "./BraendstofBeregner";
import BruttoNettoBeregner from "./BruttoNettoBeregner";
import DagpengeBeregner from "./DagpengeBeregner";
import EjendomsvaerdiskatBeregner from "./EjendomsvaerdiskatBeregner";
import EfterloensBeregner from "./EfterloensBeregner";
import ElbilBenzinBeregner from "./ElbilBenzinBeregner";
import ForbrugslaanBeregner from "./ForbrugslaanBeregner";
import GaeldsfriBeregner from "./GaeldsfriBeregner";
import HuslejeBudgetBeregner from "./HuslejeBudgetBeregner";
import KalorieBeregner from "./KalorieBeregner";
import KvadratmeterBeregner from "./KvadratmeterBeregner";
import LaaneBeregner from "./LaaneBeregner";
import LeasingBeregner from "./LeasingBeregner";
import MomsBeregner from "./MomsBeregner";
import OpsparingsBeregner from "./OpsparingsBeregner";
import PensionBeregner from "./PensionBeregner";
import ProcentBeregner from "./ProcentBeregner";
import RentefradragBeregner from "./RentefradragBeregner";
import RenteBeregner from "./RenteBeregner";
import TerminBeregner from "./TerminBeregner";
import TimeprisBeregner from "./TimeprisBeregner";
import TopskatBeregner from "./TopskatBeregner";
import ValutaBeregner from "./ValutaBeregner";

// Værktøjerne læser deres copy gennem `useLocale`, så de skal renderes inden
// for en `LocaleProvider` — ellers kaster de, og testen ville måle en fejl
// uden at sige noget om overskrifter.
vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("minberegner.dk");

/**
 * Finder springene i den renderede markup.
 *
 * Spring *ned* (h2 → h4) er den fejl, der var. Spring *op* (h4 → h2) er ikke
 * en fejl — en komponent kan have et kort på tre niveauer og det næste på to,
 * og læseren skal stadig kunne finde dem begge. Derfor tjekkes kun `næste -
 * nuværende > 1`.
 */
function findeSpring(html: string): string[] {
  const spring: string[] = [];
  // React skriver `<!-- -->` mellem to tekstnoder i samme celle. Det skal
  // fjernes, ellers tæller en tom tekstnode som et element med indhold.
  const renset = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const niveauer = [...renset.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < niveauer.length; i++) {
    const forrige = niveauer[i - 1];
    const nu = niveauer[i];
    if (nu - forrige > 1) spring.push(`h${forrige} → h${nu} (spring ${nu - forrige})`);
  }
  return spring;
}

function h1Antal(html: string): number {
  return (html.replace(/<script[\s\S]*?<\/script>/g, "").match(/<h1[\s>]/g) ?? []).length;
}

/**
 * Værktøjerne er klientkomponenter med `useState`, så de skal renderes i en
 * `<h1>`-kontekst for at efterligne siden. `<h1>`-taggen er med for at give
 * målingen det den måler på live: spring *fra* h1.
 */
function renderSomSide(Comp: React.ElementType): string {
  return renderToStaticMarkup(
    <LocaleProvider locale="da" domainConfig={daDomain}>
      <h1>Side</h1>
      <Comp />
    </LocaleProvider>,
  );
}

const VAERKTØJER = [
  ["AktieskatBeregner", AktieskatBeregner],
  ["BarselBeregner", BarselBeregner],
  ["BilBeregner", BilBeregner],
  ["BillaanBeregner", BillaanBeregner],
  ["BoliglaanBeregner", BoliglaanBeregner],
  ["BoligstoetteBeregner", BoligstoetteBeregner],
  ["BraendstofBeregner", BraendstofBeregner],
  ["BruttoNettoBeregner", BruttoNettoBeregner],
  ["DagpengeBeregner", DagpengeBeregner],
  ["EjendomsvaerdiskatBeregner", EjendomsvaerdiskatBeregner],
  ["EfterloensBeregner", EfterloensBeregner],
  ["ElbilBenzinBeregner", ElbilBenzinBeregner],
  ["ForbrugslaanBeregner", ForbrugslaanBeregner],
  ["GaeldsfriBeregner", GaeldsfriBeregner],
  ["HuslejeBudgetBeregner", HuslejeBudgetBeregner],
  ["KalorieBeregner", KalorieBeregner],
  ["KvadratmeterBeregner", KvadratmeterBeregner],
  ["LaaneBeregner", LaaneBeregner],
  ["LeasingBeregner", LeasingBeregner],
  ["MomsBeregner", MomsBeregner],
  ["OpsparingsBeregner", OpsparingsBeregner],
  ["PensionBeregner", PensionBeregner],
  ["ProcentBeregner", ProcentBeregner],
  ["RentefradragBeregner", RentefradragBeregner],
  ["RenteBeregner", RenteBeregner],
  ["TerminBeregner", TerminBeregner],
  ["TimeprisBeregner", TimeprisBeregner],
  ["TopskatBeregner", TopskatBeregner],
  ["ValutaBeregner", ValutaBeregner],
] as const;

describe("beregnerværktøjernes overskriftsniveau", () => {
  test.each(VAERKTØJER)("%s springer ikke i overskriftsniveauet", (_navn, Comp) => {
    const spring = findeSpring(renderSomSide(Comp));

    expect(spring).toEqual([]);
  });

  test.each(VAERKTØJER)("%s renderer ikke sin egen h1", (_navn, Comp) => {
    // Siden har sin egen. To h1 i ét dokument er samme rod som springet:
    // skærmlæseren får ingen entydig rod at navigerer fra.
    expect(h1Antal(renderSomSide(Comp))).toBe(1);
  });

  // Låsen på den anden side: retten må ikke være en sletning. Et værktøj
  // hvis eneste indhold er én `<h3>` ville "opfylde" spring-reglen ved at miste
  // sin overskrift helt — og læseren taber det afsnit, den skulle navigere til.
  test("KvadratmeterBeregner bevarer sin indlejrede tredjegradsoverskrift", () => {
    const html = renderSomSide(KvadratmeterBeregner);

    // De fire formeloverskrifter ligger under et h2 og skal fortsat være h3.
    expect(html).toContain("<h3");
    expect(findeSpring(html)).toEqual([]);
  });

  // Bevis for at reglen kan fange en ny fejl, og at den ikke er vakuum-grøn:
  // TopskatBeregner skrev sine to infobokse som `h4` med intet over dem, altså
  // et spring på tre niveauer fra `h1`. Det er den værste fejl i klassen.
  test("et værktøj der springer tre niveauer ville blive fanget", () => {
    const spring = findeSpring("<h1>Side</h1><h4>Ny skattemodel 2026</h4><h4>Skatteloft</h4>");

    expect(spring).toEqual(["h1 → h4 (spring 3)"]);
  });

  // Og den anden retning: et spring *op* er ikke en fejl. En komponent må gerne
  // have et afsnit på tre niveauer og det næste på to, fordi læseren skal kunne
  // finde begge. Uden denne lås ville "ingen spring" blive læst som "alle
  // overskrifter skal have samme niveau", og rettelsen ville bare have flyttet
  // problemet. Bemærk at h2 → h3 stadig *er* et spring ned, så strengen skal
  // starte på h2 — det er springet *ned* der er fejlen, ikke niveauet.
  test("et spring opad er ikke en fejl", () => {
    const spring = findeSpring("<h1>Side</h1><h2>Forste</h2><h3>Under</h3><h2>Senere</h2>");

    expect(spring).toEqual([]);
  });
});
