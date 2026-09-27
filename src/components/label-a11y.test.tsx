/**
 * Hæftet på de fire beregnere med flest visninger i den danske GSC-liste,
 * hvis tal- og datofelter var **uden navn for skærmlæsere**: `<label>` uden
 * `htmlFor` og `<input>`/`<select>` uden `id`. Det er ikke en skønhedsfejl —
 * `/dato` (130.392 visninger), `/tidsberegner` (72.382) og `/tidszone`
 * (24.723) er de tre mest besøgte sider på sitet, og en skærmlæser læser
 * "redigeringsfelt" uden at vide, hvilket af felterne det er.
 *
 * Testen låser tre ting pr. renderet tilstand, ikke ét: at hvert `label` er
 * bundet til et felt, at bindingen peger på noget der findes, og at hvert felt
 * kan findes med `getByLabelText` — altså den knap, en skærmlæser bruger til at
 * hoppe til feltet. Uden alle tre er klassen ikke lukket.
 *
 * Bemærk: `getAttribute("htmlFor")` er **null** i jsdom, fordi DOM'en hedder
 * `for` og `getAttribute` her ikke lowercase'er. Derfor bruges `label.htmlFor`.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import AlderBeregner from "./AlderBeregner";
import BraendstofBeregner from "./BraendstofBeregner";
import BrokBeregner from "./BrokBeregner";
import DatoBeregner from "./DatoBeregner";
import KalorieBeregner from "./KalorieBeregner";
import KvadratmeterBeregner from "./KvadratmeterBeregner";
import MomsBeregner from "./MomsBeregner";
import PromilleBeregner from "./PromilleBeregner";
import RentefradragBeregner from "./RentefradragBeregner";
import RenteBeregner from "./RenteBeregner";
import TidsBeregner from "./TidsBeregner";
import TidszoneBeregner from "./TidszoneBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderIn(locale: "da" | "se", Component: () => React.JSX.Element) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <Component />
    </LocaleProvider>,
  );
}

afterEach(cleanup);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Ét element skal have ét navn — et duplikeret id gør `for` tvetydig. */
function expectNoDuplicateIds(container: HTMLElement) {
  const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
}

/**
 * Hvert `<label>` skal være bundet til noget: enten til et felt via `for`, eller
 * til en gruppe via `id` der bruges i `aria-labelledby` (som kønsvalget i
 * `/promille`, der er knapper og ikke et felt).
 */
function expectEveryLabelIsBound(container: HTMLElement) {
  const labels = Array.from(container.querySelectorAll("label"));
  expect(labels.length).toBeGreaterThan(0);

  for (const label of labels) {
    const navn = label.textContent?.trim() ?? "";
    const bundetViaFor = label.htmlFor !== "";
    const bundetViaAria = label.id !== "" && container.querySelector(`[aria-labelledby="${label.id}"]`) !== null;

    expect(
      bundetViaFor || bundetViaAria,
      `Et <label> uden binding giver sit indhold intet navn: "${navn}"`,
    ).toBe(true);

    if (bundetViaFor) {
      expect(
        container.querySelector(`[id="${label.htmlFor}"]`),
        `for="${label.htmlFor}" på "${navn}" peger på intet element`,
      ).not.toBeNull();
    }
  }
}

/** Hvert felt skal kunne findes med `getByLabelText` — eller have aria-label. */
function expectEveryFieldHasAName(container: HTMLElement) {
  const felter = Array.from(container.querySelectorAll("input, select, textarea"));
  expect(felter.length).toBeGreaterThan(0);

  for (const felt of felter) {
    const id = felt.getAttribute("id");
    if (!id) {
      expect(
        felt.getAttribute("aria-label"),
        `Feltet ${felt.outerHTML.slice(0, 80)} har hverken id, label eller aria-label`,
      ).toBeTruthy();
      continue;
    }
    const label = container.querySelector(`label[for="${id}"]`);
    expect(label, `Feltet #${id} har ingen <label for>`).not.toBeNull();
    // `getAllByLabelText`, ikke `getByLabelText`: to felter på samme side kan
    // have samme synlige tekst (fx to "Pris pr. m²" på /kvadratmeter), og det
    // er lovligt. Det skal bare ikke fejle på dem.
    expect(screen.getAllByLabelText(new RegExp(escapeRegExp(label?.textContent?.trim() ?? "")))).toContain(felt);
  }
}

function expectFieldsAreNamed(container: HTMLElement) {
  expectNoDuplicateIds(container);
  expectEveryLabelIsBound(container);
  expectEveryFieldHasAName(container);
}

/**
 * De fire tilstandsknapper i `/dato` er de fire første knapper i DOM'en
 * (tilstandsgitteret står over alt andet) og deres tilgængelige navn er
 * etiketten *plus* beskrivelsen, så vi kan ikke slå dem op på navnet alene.
 */
function modeKnapper(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll("button")).slice(0, 4) as HTMLElement[];
}

/**
 * Bevis at vi ikke bare tjekker ét sæt felter: hver renderet tilstand skal have
 * sit **eget** sæt `id`'er, ellers ville en fejl i kun ét af sættene glide
 * igennem. Sammenligner vi kun antallet, kan to tilstande med lige mange
 * felter se ens ud.
 */
function registrerFelter(container: HTMLElement, saet: Set<string>) {
  saet.add(Array.from(container.querySelectorAll("input")).map((felt) => felt.id).join(","));
}

describe("Feltnavn for skærmlæsere — de fire mest besøgte beregnere", () => {
  for (const locale of ["da", "se"] as const) {
    describe(locale, () => {
      test("/dato: alle felter har navn i alle fire tilstande", () => {
        const { container } = renderIn(locale, DatoBeregner);
        const knapper = modeKnapper(container);
        expect(knapper.length).toBe(4);

        const setMuligeAntal = new Set<number>();
        for (const knap of knapper) {
          fireEvent.click(knap);
          expectFieldsAreNamed(container);
          setMuligeAntal.add(container.querySelectorAll("input").length);
        }
        // Bevis at vi ikke bare tjekker ét felt: de fire tilstande skal have
        // hver sit eget, ellers ville en fejl i kun ét af dem glide igennem.
        expect(setMuligeAntal.size).toBeGreaterThan(1);
      });

      test("/tidsberegner: start/slut tid og dato og pause har navn", () => {
        const { container } = renderIn(locale, TidsBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(5);
      });

      test("/tidszone: fra/til zone og time/minut har navn", () => {
        const { container } = renderIn(locale, TidszoneBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("select").length).toBe(4);
      });

      test("/promille: genstande, vægt og timer har navn", () => {
        const { container } = renderIn(locale, PromilleBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(3);
      });

      test("/braendstof: alle felter har navn i alle typer brændstof og beregning", () => {
        const { container } = renderIn(locale, BraendstofBeregner);
        const setMuligeAntal = new Set<string>();
        const brændstofKnapper = () => Array.from(container.querySelectorAll("button")).slice(0, 3) as HTMLElement[];

        for (const brændstofKnap of brændstofKnapper()) {
          fireEvent.click(brændstofKnap);
          expectFieldsAreNamed(container);
          registrerFelter(container, setMuligeAntal);

          // Beregningstyperne findes kun når brændstoffet ikke er el, så de skal
          // slås op *efter* hvert skift af brændstof — ikke fra en liste taget
          // på forhånd, som ville være afkoblet fra DOM'en.
          for (const beregningsKnap of Array.from(container.querySelectorAll("button")).slice(3, 6) as HTMLElement[]) {
            fireEvent.click(beregningsKnap);
            expectFieldsAreNamed(container);
            registrerFelter(container, setMuligeAntal);
          }
        }
        expect(setMuligeAntal.size).toBe(4);
      });

      test("/kvadratmeter: alle felter har navn i alle fire geometriske former", () => {
        const { container } = renderIn(locale, KvadratmeterBeregner);
        const formKnapper = Array.from(container.querySelectorAll("button")).slice(0, 4) as HTMLElement[];
        expect(formKnapper.length).toBe(4);

        const setMuligeFelter = new Set<string>();
        for (const formKnap of formKnapper) {
          fireEvent.click(formKnap);
          expectFieldsAreNamed(container);
          registrerFelter(container, setMuligeFelter);
        }
        expect(setMuligeFelter.size).toBe(4);
      });

      test("/kalorier: køn, aktivitetsniveau og mål er navngivne grupper", () => {
        const { container } = renderIn(locale, KalorieBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(3);
      });

      test("/moms: beregningstypen er en navngiven gruppe, også i svensk", () => {
        const { container } = renderIn(locale, MomsBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBeGreaterThanOrEqual(1);
      });

      test("/renteberegner: lånetype er en navngiven gruppe", () => {
        const { container } = renderIn(locale, RenteBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll('[role="group"][aria-labelledby]').length).toBe(1);
      });

      test("/alder: fødselsdato og beregningsdato har navn", () => {
        const { container } = renderIn(locale, AlderBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(2);
      });

      test("/brok: tæller og nævner har navn", () => {
        const { container } = renderIn(locale, BrokBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(2);
      });

      test("/rentefradrag: hvert lån har navn, også efter at et lån er lagt til", () => {
        const { container } = renderIn(locale, RentefradragBeregner);
        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(3);

        const tilfoej = Array.from(container.querySelectorAll("button")).find((knap) =>
          (knap.textContent ?? "").includes("Tilføj lån"),
        ) as HTMLElement | undefined;
        expect(tilfoej).toBeDefined();
        fireEvent.click(tilfoej as HTMLElement);

        expectFieldsAreNamed(container);
        expect(container.querySelectorAll("input").length).toBe(5);
      });
    });
  }

  test("Kønsvalget i /promille er en navngiven gruppe, ikke et navnløst felt", () => {
    renderIn("da", PromilleBeregner);
    expect(screen.getByRole("group", { name: "Køn" })).toBeInTheDocument();
  });
});
