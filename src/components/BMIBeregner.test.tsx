/**
 * BMI-værktøjet skal spørge om **alder**.
 *
 * Hvorfor denne port findes: komponenten læste allerede `inputs.alder` fra
 * delelinken og satte `harBarnestate`, men ingen sted i UI'et producerede en
 * alder — så grenen var død kode, og brugeren blev aldrig spurgt. Det er også
 * den målte efterspørgsel: «bmi beregner med alder», «bmi beregner med alder og
 * køn», «bmi skala ældre» og «beregn bmi formel» er danske autocomplete-træffere
 * (målt 4/10), og `/bmi` er sitets næststørste side (938 besøgende/28d).
 *
 * Porten renderer den rigtige komponent og dømmer den **synlige** markup i begge
 * sprog, så den kan ikke være grøn på den gamle kode, hvor feltet ikke fandtes.
 */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import BMIBeregner from "./BMIBeregner";
import { LocaleProvider } from "@/components/LocaleProvider";
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
      <BMIBeregner />
    </LocaleProvider>,
  ).container;
}

/** Id'en på aldersfeltet, fundet via den synlige etiket. */
function aldersFelt(container: HTMLElement, etiket: string): HTMLInputElement | null {
  const label = Array.from(container.querySelectorAll("label")).find(
    (l) => l.textContent?.trim().startsWith(etiket),
  );
  return label?.htmlFor
    ? (container.querySelector(`#${CSS.escape(label.htmlFor)}`) as HTMLInputElement | null)
    : null;
}

afterEach(cleanup);

describe.each([
  { locale: "da" as Locale, etiket: "Alder", barn: "Delelinken indeholder en alder under 18" },
  { locale: "se" as Locale, etiket: "Ålder", barn: "Delningslänken innehåller en ålder under 18" },
])("BMI-alderen ($locale)", ({ locale, etiket, barn }) => {
  test("værktøjet spørger om alder, og feltet har en synlig etiket med enhed", () => {
    const container = renderIn(locale);
    const felt = aldersFelt(container, etiket);
    expect(felt).not.toBeNull();
    expect(felt).toHaveAttribute("type", "number");
    expect(felt?.value).toBe("40");
    // Enheden er med i etiketten, så «Alder» alene ikke er et tomt felt.
    expect(container.textContent).toContain("år");
  });

  test("alder under 18 siger at voksenbåndene ikke gælder", () => {
    const container = renderIn(locale);
    const felt = aldersFelt(container, etiket)!;
    fireEvent.change(felt, { target: { value: "12" } });
    expect(felt.value).toBe("12");
    expect(container.textContent).toContain(barn);
  });

  test("alder 18 og over viser ikke børnevarslet", () => {
    const container = renderIn(locale);
    const felt = aldersFelt(container, etiket)!;
    fireEvent.change(felt, { target: { value: "18" } });
    expect(container.textContent).not.toContain(barn);
  });
});