/**
 * De fire regneregler på `/brok` skal være **navngivet rigtigt** og regne på
 * **det tal der står i feltet**. Begge dele er reelle fejl fundet ved review af
 * `b35c79c`, og ingen af dem var dømt af en port:
 *
 * - `label-a11y.test.tsx` tæller `input` og `label`, og et `legend`-element er
 *   hverken eller, så porten var grøn uanset hvad der stod i det. `legend` på
 *   regelknapperne sagde «Den anden brøk» om en gruppe med Plus, Minus, Gange og
 *   Dele, mens den anden brøks to felter lå uden for gruppen og uden navn.
 * - `brok.test.ts` kalder `regnMedBroker` med heltal, så den så aldrig
 *   komponentens `Math.trunc`. Skrev en elev `1,5` i «Første tæller», stod der
 *   `1.5`, og resultatet var præcis svaret for `1` — tavst, fordi tallene var
 *   rigtige for inputtet.
 *
 * Derfor renderer denne port den rigtige komponent i **begge** sprog og dømmer
 * den **synlige** markup, ikke kildefilen.
 */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import BrokBeregner from "./BrokBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

Object.defineProperty(document, "execCommand", {
  value: () => true,
  configurable: true,
  writable: true,
});

function renderIn(locale: Locale) {
  const domainConfig = getDomainConfig(locale === "se" ? "beraknare.se" : "localhost");
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <BrokBeregner />
    </LocaleProvider>,
  ).container;
}

/** Teksten i hvert `legend`, i den rækkefølge de står i markupken. */
function legender(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("legend")).map(
    (el) => el.textContent?.trim() ?? "",
  );
}

/** Id'erne på de felter der ligger inden for det `fieldset`, der har denne legend. */
function felterUnderLegend(container: HTMLElement, legend: string): string[] {
  const fs = Array.from(container.querySelectorAll("fieldset")).find(
    (f) => f.querySelector("legend")?.textContent?.trim() === legend,
  );
  if (!fs) return [];
  return Array.from(fs.querySelectorAll("input")).map((i) => i.id);
}

afterEach(cleanup);

describe.each([
  { locale: "da" as Locale, vaelg: "Vælg regel", foerste: "Den første brøk", anden: "Den anden brøk" },
  { locale: "se" as Locale, vaelg: "Välj regel", foerste: "Det första bråket", anden: "Det andra bråket" },
])("/brok grupperne ($locale)", ({ locale, vaelg, foerste, anden }) => {
  test("regelknapperne har egen legend, og hver brøk har sin egen", () => {
    const c = renderIn(locale);
    // Præcis tre grupper, hver med sit navn: regelknapperne og de to brøker.
    expect(legender(c)).toEqual([vaelg, foerste, anden]);
    // Beviset på at legend ikke længere sidder på den forkerte gruppe: de fire
    // regelknapper ligger i «Vælg regel», og de to brøker har hver sit navn med
    // de to felter under sig.
    expect(felterUnderLegend(c, vaelg)).toEqual([]);
    expect(felterUnderLegend(c, foerste)).toEqual(["brok-t1", "brok-n1"]);
    expect(felterUnderLegend(c, anden)).toEqual(["brok-t2", "brok-n2"]);
  });

  test("den overflødige role=group på knapperne er væk", () => {
    const c = renderIn(locale);
    // `fieldset` + `legend` giver gruppen sit navn i markupken; en ekstra
    // `role="group"` med samme aria-label ville læst den to gange.
    expect(c.querySelectorAll('[role="group"]').length).toBe(0);
  });
});

describe("/brok regner på det tal der står i feltet", () => {
  test("et decimal i et felt rundes ind i feltet, så visning og regning er ens", () => {
    const c = renderIn("da");
    const taeller1 = c.querySelector<HTMLInputElement>("#brok-t1");
    const naevner1 = c.querySelector<HTMLInputElement>("#brok-n1");
    const naevner2 = c.querySelector<HTMLInputElement>("#brok-n2");
    expect(taeller1 && naevner1 && naevner2).toBeTruthy();

    // 1/2 + 1/3 = 5/6. Med `Math.trunc` i onChange viste feltet `1.5`, mens
    // resultatet var 5/6 for `1`.
    fireEvent.change(taeller1 as HTMLInputElement, { target: { value: "1.5" } });
    expect((taeller1 as HTMLInputElement).value).toBe("2");

    const synlig = (c.textContent ?? "").replace(/\s+/g, " ");
    // 2/2 + 1/3 = 4/3, altså tælleren i resultatet er 4 — ikke 5 fra 1/2.
    expect(synlig).toContain("4/3");
    expect(synlig).not.toContain("5/6");
  });

  test("et decimal i en nævner vises også som det hele tal der regnes på", () => {
    const c = renderIn("da");
    const naevner1 = c.querySelector<HTMLInputElement>("#brok-n1");
    expect(naevner1).toBeTruthy();
    fireEvent.change(naevner1 as HTMLInputElement, { target: { value: "4.4" } });
    expect((naevner1 as HTMLInputElement).value).toBe("4");
  });
});

describe("/brok skriver «fællesnævner» i ét ord", () => {
  test("dansk", () => {
    const c = renderIn("da");
    const synlig = (c.textContent ?? "").replace(/\s+/g, " ");
    expect(synlig).toContain("Fællesnævner");
    // Sammensætningen er ét ord, jf. «fællesforældre» og «fællesrepræsentant».
    expect(synlig).not.toContain("fælles nævner");
  });

  test("svensk", () => {
    const c = renderIn("se");
    const synlig = (c.textContent ?? "").replace(/\s+/g, " ");
    expect(synlig).toContain("Gemensam nämnare");
    expect(synlig).toContain("minsta gemensamma nämnare");
  });
});