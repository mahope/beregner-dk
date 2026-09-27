/**
 * AlderBeregner-hæftet læser den tekst, brugeren kopierer og deler — ikke bare
 * tallene på skærmen. Tidszonen låses til Danmark, fordi to af fundene kun
 * kan fejle dér: mellem to lokale midnat er der 23 timer det døgn Danmark går
 * frem (29. marts 2026) og 25 timer det døgn Danmark går tilbage (25. oktober
 * 2026). På en maskine med UTC-tid er hvert døgn 24 timer, så fejlen kunne
 * aldrig fejle der.
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import AlderBeregner from "./AlderBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

/** Datofelterne står som søskende til deres label, uden htmlFor, så de findes på typen. */
function datoFelt(container: HTMLElement, nr: number): HTMLInputElement {
  return container.querySelectorAll<HTMLInputElement>('input[type="date"]')[nr];
}

function renderAlder(locale: "da" | "se", foedselsdato = "1990-03-15", beregningsdato = "2026-09-25") {
  const domainConfig = locale === "se" ? seDomain : daDomain;
  const rendered = render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <AlderBeregner />
    </LocaleProvider>,
  );
  fireEvent.change(datoFelt(rendered.container, 0), { target: { value: foedselsdato } });
  fireEvent.change(datoFelt(rendered.container, 1), { target: { value: beregningsdato } });
  return rendered;
}

describe("AlderBeregner", () => {
  let clipboardWrite: ReturnType<typeof vi.fn>;

  function kopier(locale: "da" | "se" = "da") {
    renderAlder(locale);
    fireEvent.click(
      screen.getByRole("button", {
        name: locale === "se" ? "Kopiera resultat" : "Kopiér resultat",
      }),
    );
    return String(clipboardWrite.mock.calls[0]?.[0] ?? "");
  }

  beforeEach(() => {
    window.history.replaceState({}, "", "/alder");
    clipboardWrite = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("den delte tekst har begge datoer, så svaret kan bruges", () => {
    // Før C59 var den kopierede tekst "36 år, 6 mdr, 10 dage" — altså et tal uden
    // fødselsdag og beregningsdag, i et værktøj der netop handler om "alder pr.
    // dato", og i en streng der bliver ligegyldig den dag et delt link læses.
    expect(kopier("da")).toBe(
      "Født 15. marts 1990 — 36 år, 6 måneder og 10 dage pr. 25. september 2026.",
    );
  });

  test("den delte tekst bruger samme ental og flertal som skærmen", () => {
    // Skærmens store tal kom fra `formatAlder` ("1 måned og 1 dag"), mens den
    // delte tekst skrev sin egen "1 mdr, 1 dage". Den samme streng skal ikke have
    // to grammatikker.
    const { container } = renderAlder("da", "2015-07-15", "2026-08-15");
    expect(screen.getByText("11 år, 1 måned og 0 dage")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));
    expect(String(clipboardWrite.mock.calls[0]?.[0] ?? "")).toBe(
      "Født 15. juli 2015 — 11 år, 1 måned og 0 dage pr. 15. august 2026.",
    );
    expect(container).toBeTruthy();
  });

  test("svensk delt tekst er oversat hele vejen", () => {
    expect(kopier("se")).toBe(
      "Född 15 mars 1990 — 36 år, 6 månader och 10 dagar per 25 september 2026.",
    );
  });

  test("Dage levet er kalenderdage, også når uret stilles om", () => {
    // 15. marts 1990 → 25. september 2026 krydser 37 gange op og 36 gange ned i
    // uret, altså én time mere end 13.343 hele dage. Millisekunderne sagde
    // 13342 — og det er samme tal der stod i eksempeltabellen på siden.
    renderAlder("da");
    // Talet står både i statistikflisen og i den detaljerede tabel.
    expect(screen.getAllByText("13.343").length).toBeGreaterThan(0);
  });
});
