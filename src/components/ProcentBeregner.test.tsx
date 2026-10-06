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

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("1.125 er 12,50 % af 9.000");
  });

  test("find-resultat bruger komma i decimaler på begge domæner", async () => {
    // .toFixed(2) skrev "10% af 2500 er 250.00" — punktum i en dansk sætning.
    renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Find resultat/ }));
    fireEvent.change(screen.getByLabelText("Procent"), { target: { value: 10 } });
    fireEvent.change(screen.getByLabelText("Grundværdi"), { target: { value: 2500 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("10 % af 2.500 er 250,00");
  });

  test("svensk forklaring bruger mellemrum som tusindtalsseparator", async () => {
    renderProcent("se");

    fireEvent.change(screen.getByLabelText("Deltal (täljaren)"), { target: { value: 1125 } });
    fireEvent.change(screen.getByLabelText("Heltal (nämnaren)"), { target: { value: 9000 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiera resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("1 125 är 12,50 % av 9 000");
  });

  test("stigning-formateringen skriver begge værdier med separator", async () => {
    renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Procentvis ændring/ }));
    fireEvent.change(screen.getByLabelText("Startværdi"), { target: { value: 40000 } });
    fireEvent.change(screen.getByLabelText("Slutværdi"), { target: { value: 50000 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(sidsteKopieredeTekst(clipboardWrite)).toBe("Stigning fra 40.000 til 50.000 er 25,00 %");
  });

  test("hovedtallet og forklaringen bruger samme kommaformat", () => {
    // Hovedtallet gik gennem .toFixed(2), som skrev "250.00". Det samme tal skal
    // stå med komma begge steder, ellers ser siden ud til at have to formater.
    const { container } = renderProcent("da");

    fireEvent.change(screen.getByLabelText("Heltal (nævneren)"), { target: { value: 9000 } });

    expect(container.textContent).toContain("9.000");
    expect(container.textContent).not.toContain("af 9000");
  });

  test("'forskel mellem to tal' giver begge svar, fordi spørgsmålet har to", async () => {
    // Dansk autocomplete (hl=da, 2026-10-06) svarer "procentvis forskel" med ni
    // træffere, og otte af dem spørger om forskellen MELLEM TO TAL. Den søgning
    // har to rigtige svar: ændringen fra det ene tal (10 %) og forskellen på
    // middelværdien (9,52 %). Værktøjet skal vise begge — kun det ene efterlader
    // søgeren med det forkerte tal.
    renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Forskel mellem to tal/ }));
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    const tekst = sidsteKopieredeTekst(clipboardWrite);
    expect(tekst).toContain("10,00 %");
    expect(tekst).toContain("9,52 %");
  });

  test("hovedtallet i forskel-kortet er forskellen, ikke ændringen", () => {
    // Kortet viser begge tal, men det største tal er forskellen på
    // middelværdien — det er den, siden kalder «forskel». 30 000 og 33 000 er
    // 10 % ændring og 9,52 % forskel, så tallene kan ikke byttes om uden at
    // nogen ser det.
    const { container } = renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Forskel mellem to tal/ }));

    expect(container.textContent).toContain("Resultat");
    expect(screen.getByText("9,52 %")).toBeDefined();
    expect(screen.getByText("10 %")).toBeDefined();
  });

test("kun procenttilstandene får procenttegn på hovedtallet", () => {
    // find-resultat og find-heltal svarer med et BELØB — 250 kr. af 2.500, ikke
    // «250 %». De to procenttilstande og forskel-kortet svarer med en procent.
    // En forskubbet betingelse i den ene retning ville give «250 %» på et beløb.
    //
    // Kun procenttegnet må ses her: hovedtallet animerer fra sin forrige værdi,
    // så selve tallet er ikke fastlåst i det øjeblik, testen læser.
    const { container } = renderProcent("da");
    const harProcenttegn = () => container.querySelector(".text-5xl")?.textContent?.endsWith(" %");

    fireEvent.click(screen.getByRole("radio", { name: /Find resultat/ }));
    fireEvent.change(screen.getByLabelText("Procent"), { target: { value: 10 } });
    fireEvent.change(screen.getByLabelText("Grundværdi"), { target: { value: 2500 } });
    expect(harProcenttegn()).toBe(false);

    fireEvent.click(screen.getByRole("radio", { name: /Find procent/ }));
    expect(harProcenttegn()).toBe(true);

    fireEvent.click(screen.getByRole("radio", { name: /Forskel mellem to tal/ }));
    expect(harProcenttegn()).toBe(true);
  });

test("alle fem tilstande står i én række på stor skærm", () => {
    // ModeSelector tager `columns` og sætter en grid-klasse. Med fem tilstande
    // og fire kolonner falder den femte ned på en linje for sig selv på 1280 px,
    // hvilket gør den nye tilstand sværere at finde end de fire gamle. Rækken skal
    // derfor have lige så mange kolonner som der er tilstande.
    const { container } = renderProcent("da");

    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup?.className).toContain("md:grid-cols-5");
    expect(container.querySelectorAll('[role="radio"]')).toHaveLength(5);
  });

test("de to felter i forskel-tilstanden har hver sit navn", () => {
    // Uden ariaLabel på hvert felt er de to tal ubeskrivelige for en skærmlæser,
    // og det er umuligt at se hvilket tal der er heltalet — altså præcis den
    // forskel siden handler om.
    renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Forskel mellem to tal/ }));

    expect(screen.getByLabelText("Første tal")).toBeDefined();
    expect(screen.getByLabelText("Andet tal")).toBeDefined();
  });

  test("et byttet talpar giver samme forskel, men den anden ændring", () => {
    // 30 000 → 33 000 er 10 % op, og 33 000 → 30 000 er 9,09 % ned. Middelværdien
    // er den samme, så forskellen er 9,52 % begge veje. Værktøjet skal ikke
    // bytte om på de to tal.
    const { container } = renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Forskel mellem to tal/ }));
    fireEvent.change(screen.getByLabelText("Første tal"), { target: { value: 33000 } });
    fireEvent.change(screen.getByLabelText("Andet tal"), { target: { value: 30000 } });

    expect(container.textContent).toContain("9,09 %");
    expect(container.textContent).toContain("9,52 %");
  });

  test("svensk forskel-tilstand bruger svenske ord på begge domæner", () => {
    renderProcent("se");

    fireEvent.click(screen.getByRole("radio", { name: /Skillnad mellan två tal/ }));

    expect(screen.getByLabelText("Första talet")).toBeDefined();
    expect(screen.getByLabelText("Andra talet")).toBeDefined();
    // Begge overskrifter skal stå i svensk, så læseren på beraknare.se ikke
    // møder dansk i sit eget svar.
    expect(screen.getByText("Skillnad på medelvärdet")).toBeDefined();
    expect(screen.getByText("Medelvärde: 31 500")).toBeDefined();
  });

  test("et talpar der middelværdien er 0 viser en brugbar besked", () => {
    // 100 og −100 har middelværdien 0, så forskellen findes ikke. Værktøjet må
    // ikke stå og vise «0,00 %» som om det var et svar.
    const { container } = renderProcent("da");

    fireEvent.click(screen.getByRole("radio", { name: /Forskel mellem to tal/ }));
    fireEvent.change(screen.getByLabelText("Første tal"), { target: { value: -100 } });
    fireEvent.change(screen.getByLabelText("Andet tal"), { target: { value: 100 } });

    expect(container.textContent).toContain("Middelværdien er 0");
    // Bindestregen i stedet for et tal: «0,00 %» er ikke et svar på
    // «hvor stor er forskellen», det er et tal uden mening.
    expect(screen.getByText("—")).toBeDefined();
  });
});
