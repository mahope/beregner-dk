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
import DatoBeregner from "./DatoBeregner";
import PromilleBeregner from "./PromilleBeregner";
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
    expect(screen.getByLabelText(new RegExp(escapeRegExp(label?.textContent?.trim() ?? "")))).toBe(felt);
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
    });
  }

  test("Kønsvalget i /promille er en navngiven gruppe, ikke et navnløst felt", () => {
    renderIn("da", PromilleBeregner);
    expect(screen.getByRole("group", { name: "Køn" })).toBeInTheDocument();
  });
});
