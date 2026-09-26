import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import TidszoneBeregner, { TIDSZONER_BEREGNER } from "./TidszoneBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { TIDSZONER } from "@/lib/tidszone-reference";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderTidszone(locale: "da" | "se") {
  const domainConfig = locale === "se" ? seDomain : daDomain;

  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <TidszoneBeregner />
    </LocaleProvider>,
  );
}

function selectOptions(container: HTMLElement) {
  return Array.from(container.querySelectorAll("select"))
    .flatMap((select) => Array.from(select.querySelectorAll("option")).map((option) => option.textContent ?? ""));
}

describe("TidszoneBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/tidszone");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("forankrer hjemtidszonen i Danmark på dansk", () => {
    const { container } = renderTidszone("da");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("København");
    expect(screen.getByRole("heading", { name: "Tidsforskel fra Danmark" })).toBeVisible();
    expect(tekst).not.toContain("Sverige");
    expect(selectOptions(container)).toContain("København - Danmark (CET/CEST)");
  });

  test("forankrer hjemtidszonen i Sverige på svensk", () => {
    const { container } = renderTidszone("se");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("Stockholm");
    expect(screen.getByRole("heading", { name: "Tidsskillnad från Sverige" })).toBeVisible();
    expect(tekst).toContain("Sverige byter till sommartid");
    expect(tekst).not.toContain("Köpenhamn");
    expect(tekst).not.toContain("från Danmark");
    expect(selectOptions(container)).toContain("Stockholm - Sverige (CET/CEST)");
  });

  test("beholder delte links med fraTidszone=dk gyldige i begge locales", () => {
    const dansk = renderTidszone("da");
    const svensk = renderTidszone("se");

    for (const { container } of [dansk, svensk]) {
      const fraZone = container.querySelector("select") as HTMLSelectElement;
      expect(fraZone.value).toBe("dk");
      expect(fraZone.options[0].textContent).toMatch(/Danmark \(CET\/CEST\)|Sverige \(CET\/CEST\)/);
    }
  });

  test("regner tidsforskellen fra hjemtidszonen, uanset locale", () => {
    for (const [locale, forventet] of [
      ["da", "New York er 6 timer bagud København"],
      ["se", "New York är 6 timmar efter Stockholm"],
    ] as const) {
      const { unmount } = renderTidszone(locale);

      // Danmark og USA skifter sommertid nogenlunde samtidig, så forskellen til
      // New York er 6 timer både sommer og vinter. Det er gjort til en test, fordi
      // det før var den vinterværdi alene, der holdt.
      expect(screen.getByText(forventet)).toBeVisible();
      unmount();
    }
  });

  test("offsettene er de samme som i reference-modulet, brødteksten læser", () => {
    // `tidszone-reference.ts` driver tabellen på /tidszone, `TidszoneBeregner`
    // driver værktøjet. De lå tidligere hver med deres egne offsettal, så et
    // brud på den ene siden ville ikke blive fanget af den anden.
    const by = (navn: string) =>
      TIDSZONER.find((zone) => zone.by === navn || zone.bySe === navn);

    for (const zone of TIDSZONER_BEREGNER) {
      const reference = by(zone.id === "australia" ? "Sydney" : zone.by.replace("København", "Danmark").replace("Stockholm", "Sverige"));
      if (!reference) continue;
      expect(zone.offset / 60, `${zone.id} har forkert vinteroffset`).toBe(reference.utcVinter);
      expect((zone.offsetSommer ?? zone.offset) / 60, `${zone.id} har forkert sommeroffset`).toBe(
        reference.utcSommer ?? reference.utcVinter
      );
    }
  });

  test("sommer- og vinterværdien af forskellen til hjemtidszonen vises begge", () => {
    const { container } = renderTidszone("da");
    const tekst = container.textContent ?? "";

    // Sydney står på AEST om sommeren og AEDT om vinteren, så tallet bevæger sig
    // to gange om året. Kun det aktuelle tal uden vinterværdien ville være en
    // vildledende halvdel.
    expect(tekst).toMatch(/Sydney\+8t \(\+10t om vinteren\)/);
    expect(tekst).toMatch(/Tokyo\+7t \(\+8t om vinteren\)/);

    // London skifter sommertid sammen med Danmark, så forskelsen er den hele
    // året og viser ingen vinterværdi.
    expect(tekst).toMatch(/London-1t(?! \()/);
    expect(tekst).toMatch(/New York-6t(?! \()/);
  });

  test("sommertidsnoten fortæller, at beregneren følger sommertiden", () => {
    const dansk = renderTidszone("da");
    expect(dansk.container.textContent).toContain("følger sommertiden for dagens dato");
    dansk.unmount();

    const svensk = renderTidszone("se");
    expect(svensk.container.textContent).toContain("följer sommartiden för dagens datum");
    svensk.unmount();
  });
});

