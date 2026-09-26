/**
 * `/tidszone` er den fjerdestørste side i Search Console (24.723 visninger) og
 * GSC's søgning "hvad er klokken i usa når den er 12 i danmark" (183 visninger,
 * pos. 6) er præcis den konvertering, Kopier og Del skriver ud. Tidszonen er
 * låst til Danmark, fordi både sommertidsreglen og datoen i den delte tekst er
 * læst i læserens egen tid — på en maskine med UTC-tid ville fejlen ellers kun
 * kunne fejle halvdelen af året.
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("tidsforskellen og den delte tekst i TidszoneBeregner", () => {
  let clipboardWrite: ReturnType<typeof vi.fn>;

  /** Sommer i Danmark: Indien (UTC+5.30) ligger 210 minutter foran, altså 3,5 t. */
  const SOMMER = "2026-07-01T12:00:00";
  /** Vinter i Danmark: samme par ligger 270 minutter foran, altså 4,5 t. */
  const VINTER = "2026-12-01T12:00:00";

  function sidsteKopieredeTekst(): string {
    return String(clipboardWrite.mock.calls[0]?.[0] ?? "").replace(/\u00a0/g, " ");
  }

  function vælgTilTidszone(container: HTMLElement, id: string) {
    const felter = container.querySelectorAll<HTMLSelectElement>("select");
    fireEvent.change(felter[1], { target: { value: id } });
  }

  function kopierResultat() {
    fireEvent.click(screen.getByRole("button", { name: /Kopiér resultat|Kopiera resultat/ }));
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(SOMMER));
    window.history.replaceState({}, "", "/tidszone");
    clipboardWrite = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("et brudtal skrives med komma på alle tre steder, ikke med punktum", () => {
    // Indien er den eneste zone med et brudtal (UTC+5.30). `String(3.5)` skrev
    // "3.5" med punktum i dansk tekst — i det store tal, i sætningen under det og
    // i huskelisten, som alle tre viste det samme brud på forskellige stier.
    const { container } = renderTidszone("da");
    vælgTilTidszone(container, "india");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("Mumbai er 3,5 timer foran København");
    expect(tekst).toContain("+3,5 timer");
    expect(tekst).toContain("+3,5t");
    expect(tekst).toMatch(/\+3,5t \(\+4,5t om vinteren\)/);
    expect(tekst).not.toMatch(/3\.5/);
  });

  test("det brudtal følger sæsonen: 3,5 timer sommer, 4,5 timer vinter", () => {
    const { container, unmount } = renderTidszone("da");
    vælgTilTidszone(container, "india");
    expect(screen.getByText("Mumbai er 3,5 timer foran København")).toBeVisible();
    unmount();

    vi.setSystemTime(new Date(VINTER));
    const vinter = renderTidszone("da");
    vælgTilTidszone(vinter.container, "india");
    expect(screen.getByText("Mumbai er 4,5 timer foran København")).toBeVisible();
  });

  test("svensk tekst skriver også brudtal med komma", () => {
    const { container } = renderTidszone("se");
    vælgTilTidszone(container, "india");

    expect(screen.getByText("Mumbai är 3,5 timmar före Stockholm")).toBeVisible();
    // Huskelisten bruger svensk time-endelse "h" (dansk bruger "t"), så den
    // læses på sin egen form — men med samme komma.
    expect(container.textContent ?? "").toContain("+3,5h");
    expect(container.textContent ?? "").not.toMatch(/3\.5/);
  });

  test("den delte tekst indeholder forskellen og den dato, den gælder for", () => {
    // Før C56 var teksten "12:00 i København = 19:00 i Tokyo" uden dato og
    // uden forskel. Den er sand i dag og forkert til vinter, fordi forskellen
    // følger sommertiden — altså en påstand, der bliver falsk uden at nogen
    // kan se det. Samme klokkeslæt giver to forskellige svar, og kun datoen
    // forteller hvilken af dem der er den kopierede.
    const { container } = renderTidszone("da");
    vælgTilTidszone(container, "japan");
    kopierResultat();

    expect(sidsteKopieredeTekst()).toBe(
      "12:00 i København = 19:00 i Tokyo. Tokyo er 7 timer foran København. Gælder 1. juli 2026 — forskellen følger sommertiden."
    );
  });

  test("til vinter er svaret et andet, og den delte tekst siger hvilken dato den gælder", () => {
    vi.setSystemTime(new Date(VINTER));
    const { container } = renderTidszone("da");
    vælgTilTidszone(container, "japan");
    kopierResultat();

    expect(sidsteKopieredeTekst()).toBe(
      "12:00 i København = 20:00 i Tokyo. Tokyo er 8 timer foran København. Gælder 1. december 2026 — forskellen følger sommertiden."
    );
  });

  test("svensk delt tekst følger det svenske sæt", () => {
    const { container } = renderTidszone("se");
    vælgTilTidszone(container, "us_east");
    kopierResultat();

    expect(sidsteKopieredeTekst()).toBe(
      "12:00 i Stockholm = 06:00 i New York. New York är 6 timmar efter Stockholm. Gäller 1 juli 2026 — skillnaden följer sommartiden."
    );
  });
});

