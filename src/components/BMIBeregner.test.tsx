import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import BMIBeregner from "./BMIBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { decodeCalculationState, encodeCalculationState } from "@/lib/calculation-state";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderBMI(locale: "da" | "no" | "se" = "da") {
  const config = locale === "no"
    ? getDomainConfig("beregner.no")
    : locale === "se"
      ? getDomainConfig("beraknare.se")
      : domainConfig;

  return render(
    <LocaleProvider locale={locale} domainConfig={config}>
      <BMIBeregner />
    </LocaleProvider>,
  );
}

describe("BMIBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/bmi");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("viser et voksenværktøj uden alder eller køn som input", () => {
    const { container } = renderBMI();

    expect(screen.getByText(/BMI for voksne \(18\+\)/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Alder")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Mand" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Kvinde" })).not.toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Vælg måleenhed" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "kg / cm" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,5");
  });

  test("renderer ikke et voksent BMI-resultat før URL-state er kontrolleret", () => {
    const markup = renderToString(
      <LocaleProvider locale="da" domainConfig={domainConfig}>
        <BMIBeregner />
      </LocaleProvider>,
    );

    expect(markup).not.toContain("24,5");
    expect(markup).not.toContain("Dit BMI (voksentall)");
  });

  test("viser norske labels på beregner.no", () => {
    renderBMI("no");

    expect(screen.getByLabelText("Vekt (kg)")).toHaveValue(75);
    expect(screen.getByText(/BMI for voksne \(18\+\)/)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Velg måleenhet" })).toBeInTheDocument();
    expect(screen.queryByText("Vægt (kg)")).not.toBeInTheDocument();
  });

  test("viser svenska labels på beraknare.se", () => {
    renderBMI("se");

    expect(screen.getByLabelText("Vikt (kg)")).toHaveValue(75);
    expect(screen.getByText(/BMI för vuxna \(18\+\)/)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Välj måtenhet" })).toBeInTheDocument();
    expect(screen.queryByText("Vægt (kg)")).not.toBeInTheDocument();
  });

  test("viser WHR som et råt, kønsuafhængigt forholdstal", () => {
    renderBMI();

    fireEvent.change(screen.getByLabelText("Taljemål (cm)"), { target: { value: "82" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (cm)"), { target: { value: "100" } });

    expect(screen.getByText("0,82")).toBeInTheDocument();
    expect(screen.getByText(/Råt forholdstal uden kønsjustering/)).toBeInTheDocument();
    expect(screen.queryByText(/0,90|0,85/)).not.toBeInTheDocument();
  });

  test("rounder WHR kun til visning", () => {
    renderBMI();

    fireEvent.change(screen.getByLabelText("Taljemål (cm)"), { target: { value: "89.9" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (cm)"), { target: { value: "100" } });

    expect(screen.getByText("0,90")).toBeInTheDocument();
  });

  test("afviser legacy-barninput uden at vise voksne BMI-kategorier", async () => {
    const legacyChildState = "eyJ2IjoxLCJ0IjoiYm1pIiwiaSI6eyJ2YWVndCI6NDUsImhvZWpkZSI6MTQwLCJrb2VuIjoia3ZpbmRlIiwiYWxkZXIiOjEyfSwidHMiOjE3MDAwMDAwMDAwMDB9";
    window.history.replaceState({}, "", `/bmi?s=${legacyChildState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(45);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(140);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Delelinken indeholder en alder under 18");
    expect(container.querySelector(".text-5xl")).not.toBeInTheDocument();
  });

  test("afviser barninput uden at vise voksne BMI-kategorier", () => {
    const { container } = renderBMI();

    fireEvent.change(screen.getByLabelText("Vægt (kg)"), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText("Højde (cm)"), { target: { value: "120" } });

    expect(screen.getByRole("alert")).toHaveTextContent("Indtast vægt og højde for en voksen");
    expect(container.querySelector(".text-5xl")).not.toBeInTheDocument();
  });

  test("indlæser legacy delelinks og deler uden alder eller køn", async () => {
    const legacyState = "eyJ2IjoxLCJ0IjoiYm1pIiwiaSI6eyJ2YWVndCI6ODAsImhvZWpkZSI6MTgwLCJrb2VuIjoia3ZpbmRlIiwiYWxkZXIiOjMwfSwidHMiOjE3MDAwMDAwMDAwMDB9";
    window.history.replaceState({}, "", `/bmi?s=${legacyState}`);

    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(80);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(180);
    });
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,7");
    expect(screen.queryByLabelText("Alder")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = screen.getByLabelText("Link til beregning").getAttribute("value") ?? "";
    const sharedEncoded = new URL(shareUrl).searchParams.get("s");
    const sharedState = decodeCalculationState(sharedEncoded ?? "");

    expect(sharedState?.inputs).toMatchObject({ vaegt: 80, hoejde: 180, enhed: "metrisk" });
    expect(sharedState?.inputs).not.toHaveProperty("alder");
    expect(sharedState?.inputs).not.toHaveProperty("koen");
  });

  test("bevarer enheden i et nyt imperialt delelink", async () => {
    const firstRender = renderBMI();

    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));
    expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(165.35);
    expect(screen.getByLabelText("Højde (inches)")).toHaveValue(68.9);

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = screen.getByLabelText("Link til beregning").getAttribute("value") ?? "";
    const sharedEncoded = new URL(shareUrl).searchParams.get("s") ?? "";
    firstRender.unmount();

    window.history.replaceState({}, "", `/bmi?s=${sharedEncoded}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(165.35);
      expect(screen.getByLabelText("Højde (inches)")).toHaveValue(68.9);
    });
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,5");
  });

  test("synkroniserer fokuserede felter ved enhedsskift og nulstilling", () => {
    const { container } = renderBMI();
    const metricWeight = screen.getByLabelText("Vægt (kg)");

    fireEvent.change(metricWeight, { target: { value: "90" } });
    fireEvent.focus(metricWeight);
    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));

    const imperialWeight = screen.getByLabelText("Vægt (lbs)");

    expect(imperialWeight).toHaveValue(198.42);

    fireEvent.focus(imperialWeight);
    fireEvent.click(screen.getByRole("button", { name: "Nulstil" }));

    expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(75);
    expect(screen.getByLabelText("Højde (cm)")).toHaveValue(175);
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,5");
  });

  test("beholder WHR-værdier inden for enhedens grænser ved skift", () => {
    const { container } = renderBMI();

    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));
    fireEvent.change(screen.getByLabelText("Taljemål (inches)"), { target: { value: "79" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (inches)"), { target: { value: "79" } });
    fireEvent.click(screen.getByRole("button", { name: "kg / cm" }));

    expect(screen.getByLabelText("Taljemål (cm)")).toHaveValue(200.66);
    expect(screen.getByLabelText("Hoftemål (cm)")).toHaveValue(200.66);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.querySelector(".text-2xl")?.textContent).toBe("1,00");
  });

  test("bevarer WHR ved gentaget enhedsskift", () => {
    const { container } = renderBMI();

    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));
    fireEvent.change(screen.getByLabelText("Taljemål (inches)"), { target: { value: "79" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (inches)"), { target: { value: "70" } });
    expect(container.querySelector(".text-2xl")?.textContent).toBe("1,13");

    fireEvent.click(screen.getByRole("button", { name: "kg / cm" }));
    expect(screen.getByLabelText("Taljemål (cm)")).toHaveValue(200.66);
    expect(screen.getByLabelText("Hoftemål (cm)")).toHaveValue(177.8);
    expect(container.querySelector(".text-2xl")?.textContent).toBe("1,13");

    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));
    expect(screen.getByLabelText("Taljemål (inches)")).toHaveValue(79);
    expect(screen.getByLabelText("Hoftemål (inches)")).toHaveValue(70);
    expect(container.querySelector(".text-2xl")?.textContent).toBe("1,13");
  });

  test("bevarer BMI, enhedsværdier og delelink gennem gentaget enhedsskift", async () => {
    const firstRender = renderBMI();

    fireEvent.change(screen.getByLabelText("Vægt (kg)"), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText("Højde (cm)"), { target: { value: "143.4" } });
    const readBmi = () => Number(
      firstRender.container.querySelector(".text-5xl")?.textContent?.replace(",", "."),
    );
    const originalBmi = readBmi();

    expect(originalBmi).toBe(19.5);

    const bmiDeviations: number[] = [];
    for (const unit of ["imperial", "metrisk", "imperial"] as const) {
      fireEvent.click(screen.getByRole("button", {
        name: unit === "imperial" ? "lbs / inches" : "kg / cm",
      }));
      bmiDeviations.push(Math.abs(readBmi() - originalBmi));
    }
    const maximumDeviation = Math.max(...bmiDeviations);

    expect(bmiDeviations).toHaveLength(3);
    expect(maximumDeviation).toBe(0);

    const imperialWeight = screen.getByLabelText("Vægt (lbs)") as HTMLInputElement;
    const imperialHeight = screen.getByLabelText("Højde (inches)") as HTMLInputElement;

    expect(firstRender.container.querySelector(".text-5xl")?.textContent).toBe("19,5");
    expect(imperialWeight).toHaveValue(88.18);
    expect(imperialHeight).toHaveValue(56.46);

    fireEvent.blur(imperialWeight);
    fireEvent.blur(imperialHeight);

    expect(imperialWeight.validity.stepMismatch).toBe(false);
    expect(imperialHeight.validity.stepMismatch).toBe(false);
    expect(imperialWeight).toHaveAttribute("aria-invalid", "false");
    expect(imperialHeight).toHaveAttribute("aria-invalid", "false");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = screen.getByLabelText("Link til beregning").getAttribute("value") ?? "";
    const sharedEncoded = new URL(shareUrl).searchParams.get("s") ?? "";
    const sharedState = decodeCalculationState(sharedEncoded);

    expect(sharedState?.inputs).toMatchObject({
      vaegt: 88.18,
      hoejde: 56.46,
      enhed: "imperial",
      vaegtKg: 40,
      hoejdeCm: 143.4,
    });

    firstRender.unmount();
    window.history.replaceState({}, "", `/bmi?s=${sharedEncoded}`);

    const secondRender = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(88.18);
      expect(screen.getByLabelText("Højde (inches)")).toHaveValue(56.46);
    });
    expect(
      Number(secondRender.container.querySelector(".text-5xl")?.textContent?.replace(",", ".")),
    ).toBe(originalBmi);
  });

  test("normaliserer URL-værdier til inputens 0.01-præcision", async () => {
    const encodedState = encodeCalculationState({
      type: "bmi",
      inputs: { vaegt: 80.123, hoejde: 180.456, enhed: "metrisk" },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/bmi?s=${encodedState}`);
    renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(80.12);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(180.46);
    });
    expect((screen.getByLabelText("Vægt (kg)") as HTMLInputElement).validity.stepMismatch).toBe(false);
    expect((screen.getByLabelText("Højde (cm)") as HTMLInputElement).validity.stepMismatch).toBe(false);
  });

  test("afviser et delvist BMI-delelink i stedet for at blande defaults", async () => {
    const encodedState = encodeCalculationState({
      type: "bmi",
      inputs: { hoejde: 60, enhed: "imperial" },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/bmi?s=${encodedState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(75);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(175);
    });
    expect(screen.getByRole("button", { name: "kg / cm" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,5");
  });

  test("accepterer legacy BMI-state med numeriske strenge", async () => {
    const encodedState = encodeCalculationState({
      type: "bmi",
      inputs: { vaegt: "80", hoejde: "180", enhed: "metrisk", alder: "30" },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/bmi?s=${encodedState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(80);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(180);
    });
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,7");
  });

  test("afviser canonical BMI-state, der ikke matcher de viste værdier", async () => {
    const encodedState = encodeCalculationState({
      type: "bmi",
      inputs: { vaegt: 40, hoejde: 180, enhed: "metrisk", vaegtKg: 90, hoejdeCm: 180 },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/bmi?s=${encodedState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(40);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(180);
    });
    expect(container.querySelector(".text-5xl")?.textContent).toBe("12,3");
  });

  test.each([
    ["null", null],
    ["en tom streng", ""],
  ])("falder tilbage til de viste værdier ved %s canonical data", async (_label, canonicalVægt) => {
    const encodedState = encodeCalculationState({
      type: "bmi",
      inputs: { vaegt: 75, hoejde: 175, enhed: "metrisk", vaegtKg: canonicalVægt, hoejdeCm: 175 },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/bmi?s=${encodedState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (kg)")).toHaveValue(75);
      expect(screen.getByLabelText("Højde (cm)")).toHaveValue(175);
    });
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,5");
  });

  test("genkender et legacy imperialt delelink uden enhedsfelt", async () => {
    const legacyImperialState = "eyJ2IjoxLCJ0IjoiYm1pIiwiaSI6eyJ2YWVndCI6MTY1LjM1LCJob2VqZGUiOjY4LjksImtvZW4iOiJtYW5kIiwiYWxkZXIiOjMwfSwidHMiOjE3MDAwMDAwMDAwMDB9";
    window.history.replaceState({}, "", `/bmi?s=${legacyImperialState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(165.35);
      expect(screen.getByLabelText("Højde (inches)")).toHaveValue(68.9);
    });
    expect(container.querySelector(".text-5xl")?.textContent).toBe("24,5");
  });

  test("accepterer den laveste gyldige imperiale grænseværdi", async () => {
    const encodedState = encodeCalculationState({
      type: "bmi",
      inputs: { vaegt: 66.14, hoejde: 39.37, enhed: "imperial" },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/bmi?s=${encodedState}`);
    const { container } = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(66.14);
      expect(screen.getByLabelText("Højde (inches)")).toHaveValue(39.37);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.querySelector(".text-5xl")?.textContent).toBe("30,0");
  });

  test("skjuler WHR-resultat uden for måleenhedens grænser", () => {
    const { container } = renderBMI();

    fireEvent.change(screen.getByLabelText("Taljemål (cm)"), { target: { value: "201" } });
    fireEvent.change(screen.getByLabelText("Hoftemål (cm)"), { target: { value: "100" } });

    expect(container.querySelector(".text-2xl")).not.toBeInTheDocument();
  });

  test("afviser imperial værdier under de metriske voksengænser", () => {
    const { container } = renderBMI();

    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));
    fireEvent.change(screen.getByLabelText("Vægt (lbs)"), { target: { value: "66" } });
    fireEvent.change(screen.getByLabelText("Højde (inches)"), { target: { value: "39" } });

    expect(screen.getByRole("alert")).toHaveTextContent("Indtast vægt og højde for en voksen");
    expect(container.querySelector(".text-5xl")).not.toBeInTheDocument();
  });

  test("fjerner resultat og deling ved imperial vægt over maksimum", () => {
    const { container } = renderBMI();

    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));
    fireEvent.change(screen.getByLabelText("Vægt (lbs)"), { target: { value: "661.39" } });

    expect(screen.getByRole("alert")).toHaveTextContent("Indtast vægt og højde for en voksen");
    expect(container.querySelector(".text-5xl")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Del beregning" })).not.toBeInTheDocument();
  });

  test("bevarer gyldige maksimale værdier ved enhedsskift og delelink", async () => {
    const { container, unmount } = renderBMI();

    fireEvent.change(screen.getByLabelText("Vægt (kg)"), { target: { value: "300" } });
    fireEvent.change(screen.getByLabelText("Højde (cm)"), { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: "lbs / inches" }));

    expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(661.38);
    expect(screen.getByLabelText("Højde (inches)")).toHaveValue(98.42);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(container.querySelector(".text-5xl")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = screen.getByLabelText("Link til beregning").getAttribute("value") ?? "";
    const sharedEncoded = new URL(shareUrl).searchParams.get("s") ?? "";
    expect(decodeCalculationState(sharedEncoded)?.inputs).toMatchObject({ vaegtKg: 300, hoejdeCm: 250 });

    unmount();
    window.history.replaceState({}, "", `/bmi?s=${sharedEncoded}`);
    const reloaded = renderBMI();

    await waitFor(() => {
      expect(screen.getByLabelText("Vægt (lbs)")).toHaveValue(661.38);
      expect(screen.getByLabelText("Højde (inches)")).toHaveValue(98.42);
    });
    fireEvent.click(screen.getByRole("button", { name: "kg / cm" }));
    const metricWeight = screen.getByLabelText("Vægt (kg)");
    const metricHeight = screen.getByLabelText("Højde (cm)");
    fireEvent.blur(metricWeight);
    fireEvent.blur(metricHeight);
    expect(metricWeight).toHaveValue(300);
    expect(metricHeight).toHaveValue(250);
    expect(metricWeight).toHaveAttribute("aria-invalid", "false");
    expect(metricHeight).toHaveAttribute("aria-invalid", "false");
    expect(reloaded.container.querySelector(".text-5xl")?.textContent).toBe("48,0");
  });
});
