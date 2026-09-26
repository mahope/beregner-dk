import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RenteBeregner from "./RenteBeregner";
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

function renderRente(locale: "da" | "se") {
  const domainConfig = locale === "se" ? seDomain : daDomain;

  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <RenteBeregner />
    </LocaleProvider>,
  );
}

describe("RenteBeregner", () => {
  let clipboardWrite: ReturnType<typeof vi.fn>;

  /** Intl sætter et kernende mellemrum i beløb — samme normalisering som MomsBeregner. */
  function kopieretTekst(): string {
    return String(clipboardWrite.mock.calls[0]?.[0] ?? "").replace(/\u00a0/g, " ");
  }

  function kopier(locale: "da" | "se" = "da") {
    renderRente(locale);
    fireEvent.click(screen.getByRole("button", { name: locale === "se" ? "Kopiera resultat" : "Kopiér resultat" }));
  }

  beforeEach(() => {
    window.history.replaceState({}, "", "/renteberegner");
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

  test("den delte tekst skriver et brudtal med komma i dansk", () => {
    // Rentesatsen kom råt fra et talfelt, så 3,5 % blev "3.5%" i den tekst
    // brugeren kopierer ind i en mail — med punktum i dansk.
    renderRente("da");
    fireEvent.change(screen.getByLabelText("Årlig rente (%)"), { target: { value: 3.5 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(kopieretTekst()).toContain("til 3,5 % i 30 år");
    expect(kopieretTekst()).not.toContain("3.5");
  });

  test("den delte tekst siger hvilken låntype og hvilken ydelse", () => {
    // Den gamle tekst var "1.000.000 kr. til 5% i 30 år - samlet rente …":
    // uden låntype, og uden den ydelse læseren egentlig er ude efter.
    renderRente("da");
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(kopieretTekst()).toBe(
      "1.000.000 kr. til 5 % i 30 år (annuitetslån). Månedlig ydelse 5.368 kr. og samlet rente 932.558 kr.",
    );
  });

  test("serielån deler første og sidste ydelse, fordi der ikke er én fast", () => {
    renderRente("da");
    fireEvent.click(screen.getByRole("button", { name: "Serielån" }));
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(kopieretTekst()).toBe(
      "1.000.000 kr. til 5 % i 30 år (serielån). Første måneds ydelse 6.944 kr., sidste måneds ydelse 2.789 kr. og samlet rente 752.083 kr.",
    );
  });

  test("svensk delt tekst bruger svensk mønster og valuta", () => {
    kopier("se");

    expect(kopieretTekst()).toBe(
      "1 000 000 kr till 5 % i 30 år (annuitetslån). Månatlig betalning 5 368 kr och total ränta 932 558 kr",
    );
  });

  test("Del sender præcis den tekst Kopier lægger i klipbordet", () => {
    // /moms havde to steder der byggede hver sin streng (C52), og forskellene
    // er usynlige i DOM'en. Del-l-linket koder teksten ind i href'en, så den er
    // den eneste måde at bevise at de to steder siger det samme.
    renderRente("da");
    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));

    const twitter = screen.getByRole("link", { name: "Del på Twitter" }).getAttribute("href") ?? "";
    const deltTekst = (new URL(twitter).searchParams.get("text") ?? "").replace(/ /g, " ");

    expect(deltTekst).toBe(
      "Renteberegner: 1.000.000 kr. til 5 % i 30 år (annuitetslån). Månedlig ydelse 5.368 kr. og samlet rente 932.558 kr.",
    );
  });
});
