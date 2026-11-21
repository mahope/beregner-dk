import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import KalorieBeregner from "./KalorieBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { encodeCalculationState } from "@/lib/calculation-state";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

function renderKalorier(
  maal: "vedligehold" | "tab" | "opbyg",
  locale: "da" | "se" = "da",
  overrides: Partial<{ alder: number; koen: "mand" | "kvinde"; vaegt: number; hoejde: number; aktivitet: string }> = {}
) {
  const encoded = encodeCalculationState({
    type: "kalorier",
    inputs: { alder: 30, koen: "mand", vaegt: 80, hoejde: 180, aktivitet: "moderat", maal, ...overrides },
    timestamp: 1700000000000,
  });
  window.history.replaceState({}, "", `/kalorier?s=${encoded}`);
  const config =
    locale === "se" ? getDomainConfig("beraknare.se") : getDomainConfig("localhost");

  return render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <KalorieBeregner />
    </LocaleProvider>
  );
}

/** The big headline figure, "2.259 kcal" → 2259. */
function hovedresultat(): number {
  const overskrift = screen.getByText("Dagligt kaloriebehov").parentElement;
  const streng = overskrift?.querySelector("p.text-5xl")?.textContent ?? "";
  return Number(streng.replace(/[^\d-]/g, ""));
}

/** The text Kopier puts on the clipboard, read back through navigator.clipboard. */
function kopierTekst(locale: "da" | "se" = "da"): string {
  fireEvent.click(
    screen.getByRole("button", { name: locale === "se" ? "Kopiera resultat" : "Kopiér resultat" })
  );
  const skriv = navigator.clipboard.writeText as unknown as ReturnType<typeof vi.fn>;
  return String(skriv.mock.calls[0]?.[0] ?? "").replace(/ /g, " ");
}

/** The protein card's gram figure, which is the second <p> of its block. */
function proteinGram(): number {
  const overskrift = screen.getAllByText("Protein")[0];
  return Number(overskrift.parentElement?.querySelectorAll("p")[1]?.textContent?.replace("g", "").trim());
}

describe("KalorieBeregner — protein følger dit mål", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    cleanup();
  });

  test("80 kg vedligehold giver 80 g protein, ikke 144 g", () => {
    renderKalorier("vedligehold");
    expect(proteinGram()).toBe(80);
  });

  test("80 kg vægttab giver 112 g protein (1,4 g/kg)", () => {
    renderKalorier("tab");
    expect(proteinGram()).toBe(112);
  });

  test("80 kg muskelopbygning giver 152 g protein (1,9 g/kg)", () => {
    renderKalorier("opbyg");
    expect(proteinGram()).toBe(152);
  });

  test("g/kg-basis og interval vises i proteinfeltet", () => {
    renderKalorier("tab");
    const blok = screen.getAllByText("Protein")[0].parentElement;
    expect(blok?.textContent).toContain("1,4 g/kg protein");
    expect(blok?.textContent).toContain("1,2-1,6");
  });

  test("svensk visning bruger decimal-komma", () => {
    renderKalorier("opbyg", "se");
    const blok = screen.getAllByText("Protein")[0].parentElement;
    expect(proteinGram()).toBe(152);
    expect(blok?.textContent).toContain("1,9 g/kg protein");
  });
});

/**
 * 100 år, 30 kg, 100 cm, kvinde, stillesiddende: BMR 264, TDEE 317. Et
 * underskud på 500 kcal gav derfor **-183 kcal** i overskriften, -5 g fedt
 * og en delt tekst der lovede 0,5 kg pr. uge.
 */
const LILLE_INAKTIV = {
  alder: 100,
  koen: "kvinde" as const,
  vaegt: 30,
  hoejde: 100,
  aktivitet: "stillesiddende",
};

describe("KalorieBeregner — et underskud må ikke føre under basalstofskiftet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    cleanup();
  });

  test("overskriften er aldrig negativ for en lille inaktiv bruger", () => {
    renderKalorier("tab", "da", LILLE_INAKTIV);
    expect(hovedresultat()).toBeGreaterThan(0);
  });

  test("anbefalingen lander på BMR, ikke under", () => {
    renderKalorier("tab", "da", LILLE_INAKTIV);
    // BMR = 10*30 + 6,25*100 - 5*100 - 161 = 264
    expect(hovedresultat()).toBe(264);
  });

  test("ingen makro bliver negativ", () => {
    renderKalorier("tab", "da", LILLE_INAKTIV);
    for (const navn of ["Protein", "Fedt", "Kulhydrater"]) {
      const blok = screen.getAllByText(navn)[0].parentElement;
      const gram = Number(blok?.querySelectorAll("p")[1]?.textContent?.replace("g", "").trim());
      const kcal = Number(
        blok?.querySelectorAll("p")[2]?.textContent?.replace(/[^\d]/g, "")
      );
      expect(gram).toBeGreaterThanOrEqual(0);
      expect(kcal).toBeGreaterThanOrEqual(0);
    }
  });

  test("beskrivelsen siger, at gulvet er nået, i stedet for at love 0,5 kg", () => {
    renderKalorier("tab", "da", LILLE_INAKTIV);
    const overskrift = screen.getByText("Dagligt kaloriebehov").parentElement;
    expect(overskrift?.textContent).toContain("basalstofskifte");
    expect(overskrift?.textContent).not.toContain("0,5 kg");
  });

  test("sammenligningstabellen skriver det underskud der faktisk er brugt", () => {
    renderKalorier("tab", "da", LILLE_INAKTIV);
    // TDEE 316,8 minus BMR 264 = 52,8 → 53, ikke 500
    const vaegttab = screen.getAllByText("Vægttab")[0].parentElement;
    expect(vaegttab?.textContent).toContain("-53 kcal");
    expect(vaegttab?.textContent).not.toContain("-500 kcal");
  });

  test("den delte tekst lover heller ikke 500 kcal, men det der faktisk går", () => {
    renderKalorier("tab", "da", LILLE_INAKTIV);
    const tekst = kopierTekst();
    expect(tekst).toContain("så underskuddet er 53 kcal/dag");
    expect(tekst).not.toContain("0,5 kg");
  });

  test("et normalt underskud er stadig 500 kcal", () => {
    renderKalorier("tab", "da");
    const tekst = kopierTekst();
    expect(tekst).toContain("så underskuddet er 500 kcal/dag");
    expect(tekst).toContain("0,5 kg");
  });
});

describe("KalorieBeregner — den delte tekst kan bruges", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    cleanup();
  });

  test("den indeholder de input, tallet afhænger af", () => {
    renderKalorier("tab", "da");
    // Et kaloriebehov uden køn, alder, vægt, højde og aktivitet kan ikke bruges
    // af modtageren — og slet ikke efter et par måneder.
    expect(kopierTekst()).toBe(
      "2.259 kcal/dag (for at tabe ca. 0,5 kg pr. uge). Baseret på 30 år, mand, 80 kg, 180 cm, moderat aktivitet. Vedligehold er 2.759 kcal/dag, så underskuddet er 500 kcal/dag."
    );
  });

  test("den bruger decimal-komma, ikke punktum", () => {
    // "For at tabe ca. 0.5 kg pr. uge" lå i både labels.da.info500 og
    // labels.da.maalTabDesc, og maalBeskrivelse gik lige ind i klipbordet.
    renderKalorier("tab", "da");
    const tekst = kopierTekst();
    expect(tekst).toContain("0,5 kg pr. uge");
    expect(tekst).not.toContain("0.5 kg");
    expect(document.body.textContent).not.toContain("0.5 kg");
  });

  test("svensk tekst er selvstændig på svensk", () => {
    renderKalorier("opbyg", "se");
    expect(kopierTekst("se")).toBe(
      "3 059 kcal/dag (för att bygga muskelmassa). Baserat på 30 år, man, 80 kg, 180 cm, måttlig aktivitet. Underhåll är 2 759 kcal/dag, så överskottet är 300 kcal/dag."
    );
  });

  test("Del sender præcis den tekst Kopier lægger i klipbordet", () => {
    // Forskellen mellem de to steder er usynlig i DOM'en, så href'en er det
    // eneste sted den kan bevises.
    renderKalorier("tab", "da");
    const kopieret = kopierTekst();

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const twitter = screen.getByRole("link", { name: "Del på Twitter" }).getAttribute("href") ?? "";
    const deltTekst = (new URL(twitter).searchParams.get("text") ?? "").replace(/ /g, " ");

    expect(deltTekst).toBe(`Kalorieberegner: ${kopieret}`);
  });

  test("et tal med fire cifre får tusindtalsseparator", () => {
    // 300 kg, 250 cm, 15 år, meget aktiv: BMR 4.492,5, TDEE 8.535,75, +300
    renderKalorier("opbyg", "da", { alder: 15, vaegt: 300, hoejde: 250, aktivitet: "meget_aktiv" });
    const overskrift = screen.getByText("Dagligt kaloriebehov").parentElement;
    expect(overskrift?.textContent).toContain("8.836 kcal");
  });
});
