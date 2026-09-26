import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ProcentBeregner from "./ProcentBeregner";
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

function renderProcent(locale: "da" | "se") {
  return render(
    <LocaleProvider locale={locale} domainConfig={locale === "se" ? seDomain : daDomain}>
      <ProcentBeregner />
    </LocaleProvider>,
  );
}

function sidsteKopieredeTekst(clipboardWrite: ReturnType<typeof vi.fn>): string {
  return String(clipboardWrite.mock.calls[0]?.[0] ?? "").replace(/\u00a0/g, " ");
}

describe("ProcentBeregner", () => {
  let clipboardWrite: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.history.replaceState({}, "", "/procent");
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

  test("find-procent sætter tusindtalsseparator i forklaringen", async () => {
    // GSC: "en telefon er sat 1125 kr. ned. normalt koster den 9000 kr." Den gamle
    // forklaring skrev "1125 er 12,50% af 9000" — tal uden separator, i en dansk
    // sætning hvor 9.000 er det, der menes.
    renderProcent("da");

    fireEvent.change(screen.getByLabelText("Del-tal (tælleren)"), { target: { value: 1125 } });
    fireEvent.change(screen.getByLabelText("Heltal (nævneren)"), { target: { value: 9000 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("1.125 er 12,50% af 9.000");
  });

  test("find-resultat bruger komma i decimaler på begge domæner", async () => {
    // .toFixed(2) skrev "10% af 2500 er 250.00" — punktum i en dansk sætning.
    renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Find resultat/ }));
    fireEvent.change(screen.getByLabelText("Procent"), { target: { value: 10 } });
    fireEvent.change(screen.getByLabelText("Grundværdi"), { target: { value: 2500 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("10% af 2.500 er 250,00");
  });

  test("svensk forklaring bruger mellemrum som tusindtalsseparator", async () => {
    renderProcent("se");

    fireEvent.change(screen.getByLabelText("Deltal (täljaren)"), { target: { value: 1125 } });
    fireEvent.change(screen.getByLabelText("Heltal (nämnaren)"), { target: { value: 9000 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiera resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("1 125 är 12,50% av 9 000");
  });

  test("stigning-formateringen skriver begge værdier med separator", async () => {
    renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Procentvis ændring/ }));
    fireEvent.change(screen.getByLabelText("Startværdi"), { target: { value: 40000 } });
    fireEvent.change(screen.getByLabelText("Slutværdi"), { target: { value: 50000 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("Stigning fra 40.000 til 50.000 er 25,00%");
  });

  test("hovedtallet og forklaringen bruger samme kommaformat", () => {
    // Hovedtallet gik gennem .toFixed(2), som skrev "250.00". Det samme tal skal
    // stå med komma begge steder, ellers ser siden ud til at have to formater.
    const { container } = renderProcent("da");

    fireEvent.change(screen.getByLabelText("Heltal (nævneren)"), { target: { value: 9000 } });

    expect(container.textContent).toContain("9.000");
    expect(container.textContent).not.toContain("af 9000");
  });
});
