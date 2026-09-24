import { decodeCalculationState, encodeCalculationState } from "@/lib/calculation-state";
import { getDomainConfig } from "@/lib/domain-config";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import BoligstoetteBeregner from "./BoligstoetteBeregner";
import { LocaleProvider } from "./LocaleProvider";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderBoligstoette() {
  return render(
    <LocaleProvider locale="da" domainConfig={domainConfig}>
      <BoligstoetteBeregner />
    </LocaleProvider>,
  );
}

describe("BoligstoetteBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/boligstoette");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("markerer husleje, indkomst og areal som påkrævede felter", () => {
    renderBoligstoette();

    expect(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)")).toBeRequired();
    expect(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)")).toBeRequired();
    expect(screen.getByLabelText("Boligens areal (m²)")).toBeRequired();
    expect(screen.getByLabelText("Personer i husstanden")).toBeRequired();
    expect(screen.getByLabelText("Børn under 18 år")).toBeRequired();
    expect(screen.getByLabelText("Søgerens pensionstatus")).toBeRequired();
  });

  test("accepterer decimaler i beløb og areal", () => {
    renderBoligstoette();

    fireEvent.change(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)"), {
      target: { value: "6000.5" },
    });
    fireEvent.change(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)"), {
      target: { value: "216000.5" },
    });
    fireEvent.change(screen.getByLabelText("Boligens areal (m²)"), {
      target: { value: "65.5" },
    });

    expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
  });

  test("accepterer positive værdier under 1", () => {
    renderBoligstoette();

    const rent = screen.getByLabelText(
      "Månedlig husleje (kr./md, uden forbrugsudgifter)",
    ) as HTMLInputElement;
    const area = screen.getByLabelText("Boligens areal (m²)") as HTMLInputElement;
    fireEvent.change(rent, { target: { value: "0.5" } });
    fireEvent.change(area, { target: { value: "0.5" } });

    expect(rent.checkValidity()).toBe(true);
    expect(area.checkValidity()).toBe(true);
  });

  test("viser ikke et resultat før nødvendige oplysninger er indtastet", () => {
    const markup = renderToString(
      <LocaleProvider locale="da" domainConfig={domainConfig}>
        <BoligstoetteBeregner />
      </LocaleProvider>,
    );

    expect(markup).not.toContain("Vejledende månedsinterval");
    expect(screen.queryByText(/Screeningestimat/)).not.toBeInTheDocument();
  });

  test("viser et interval og den officielle næste handling", () => {
    renderBoligstoette();

    fireEvent.change(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)"), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)"), {
      target: { value: "216000" },
    });

    expect(screen.getByText(/Screeningestimat/)).toBeInTheDocument();
    expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
    expect(screen.getByText(/ikke et krav på støtte/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Åbn Udbetaling Danmarks beregner" }),
    ).toHaveAttribute(
      "href",
      "https://www.boligstoette.dk/bos-selvbetjening/beregner/basisoplysninger",
    );
  });

  test("accepterer nul indkomst og bevarer uoplyst formue som uoplyst", () => {
    renderBoligstoette();

    fireEvent.change(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)"), {
      target: { value: "6000" },
    });
    const income = screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)") as HTMLInputElement;
    fireEvent.change(income, { target: { value: "0" } });

    expect(income.checkValidity()).toBe(true);
    expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
    expect(
      screen.getByText(/Formuen er ikke oplyst, så der vises ikke et formuejusteret indkomstsignal/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Screeningens formuejusterede indkomstsignal/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = (screen.getByLabelText("Delbart link") as HTMLInputElement).value;
    const encoded = new URL(shareUrl).hash.slice("#s=".length);
    const decoded = decodeCalculationState(encoded);
    expect(decoded?.inputs).toMatchObject({ husstandsindkomst: 0 });
    expect(decoded?.inputs).not.toHaveProperty("formue");
  });

  test("indlæser gamle query-links uden at opfinde en ny husstandsprofil", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 6000,
        husstandsindkomst: 216000,
        antalPersoner: 1,
        areal: 65,
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette?s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)")).toHaveValue(6000);
    });
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
    expect(screen.getByText("Nogle oplysninger i delelinket er ugyldige. Indtast dem igen.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Personer i husstanden"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Børn under 18 år"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Søgerens pensionstatus"), { target: { value: "ingen" } });

    expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
  });

  test("viser feltfeedback, når arealet tømmes", () => {
    renderBoligstoette();

    fireEvent.change(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)"), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)"), {
      target: { value: "216000" },
    });
    const areal = screen.getByLabelText("Boligens areal (m²)");
    fireEvent.change(areal, { target: { value: "" } });

    expect(areal).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Indtast et areal større end 0 m².");
    expect(screen.getByRole("status")).toHaveTextContent("Udfyld areal");
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
  });

  test("viser den fulde officielle huslejevejledning", () => {
    renderBoligstoette();

    expect(screen.getByText(/fællesantenne/)).toBeInTheDocument();
    expect(screen.getByText(/leje betalt forud/)).toBeInTheDocument();
    expect(screen.getByText(/møbler i en møbleret bolig/)).toBeInTheDocument();
    expect(screen.getByText(/vaskeri/)).toBeInTheDocument();
    expect(screen.getByText(/nyt køkken eller bad/)).toBeInTheDocument();
  });

  test("bruger husstandsprofilen til at vælge det officielle maksimum", () => {
    renderBoligstoette();

    fireEvent.change(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)"), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)"), {
      target: { value: "216000" },
    });
    fireEvent.change(screen.getByLabelText("Personer i husstanden"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Børn under 18 år"), { target: { value: "2" } });

    expect(screen.getByText(/0 – 4\.201 kr\/md/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Søgerens pensionstatus"), {
      target: { value: "folkepension" },
    });

    expect(screen.getByText("Vejledende ordningsinterval")).toBeInTheDocument();
    expect(screen.getByText(/Du kan være berettiget til boligydelse/)).toBeInTheDocument();
    expect(screen.getByText(/0 – 4\.969 kr\/md/)).toBeInTheDocument();
  });

  test("begrænser valgmulighederne for børn til husstandens størrelse", () => {
    renderBoligstoette();

    const personer = screen.getByLabelText("Personer i husstanden") as HTMLSelectElement;
    const born = screen.getByLabelText("Børn under 18 år") as HTMLSelectElement;
    expect(Array.from(born.options).map((option) => option.textContent)).toEqual(["0 børn"]);

    fireEvent.change(personer, { target: { value: "3" } });
    expect(Array.from(born.options).map((option) => option.textContent)).toEqual([
      "0 børn",
      "1 barn",
      "2 børn",
    ]);

    fireEvent.change(born, { target: { value: "2" } });
    fireEvent.change(personer, { target: { value: "1" } });
    expect(born).toHaveValue("0");
  });

  test("melder ugyldige tal med tilgængelig feltfeedback", () => {
    renderBoligstoette();

    const husleje = screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)");
    fireEvent.change(husleje, { target: { value: "-1" } });
    fireEvent.change(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)"), {
      target: { value: "216000" },
    });

    expect(husleje).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Indtast en husleje større end 0 kr.");
    expect(screen.getByRole("status")).toHaveTextContent("Ret de ugyldige oplysninger");
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
  });

  test("viser formuegrænsens officielle konsekvens", () => {
    renderBoligstoette();

    fireEvent.change(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)"), {
      target: { value: "6000" },
    });
    fireEvent.change(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)"), {
      target: { value: "216000" },
    });
    fireEvent.change(screen.getByLabelText("Husstandens formue, som Udbetaling Danmark regner med (valgfri)"), {
      target: { value: "896400" },
    });

    expect(screen.getAllByText(/10 % af formuen/)).toHaveLength(2);
    expect(screen.getByText(/Screeningens formuejusterede indkomstsignal/)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/10 % af formuen/);
    expect(screen.getByText(/305\.640 kr\.\/år/)).toBeInTheDocument();
  });

  test("indlæser gamle delestater uden det døde boligType-felt", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: "6000",
        husstandsindkomst: "216000",
        antalPersoner: "1",
        areal: "65",
        boligType: "leje",
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette#s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)")).toHaveValue(6000);
    });
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Boligtype")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Børn under 18 år"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Søgerens pensionstatus"), { target: { value: "ingen" } });
    expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
  });

  test("rundefører en fuld aktuel delestat og advarer om økonomiske data", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 7200,
        husstandsindkomst: 0,
        antalPersoner: 4,
        antalBorn: 2,
        formue: 0,
        areal: 92,
        pensionStatus: "folkepension",
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette#s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByText(/0 – 4\.969 kr\/md/)).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)")).toHaveValue(7200);
    expect(screen.getByLabelText("Årlig husstandsindkomst før skat (kr./år)")).toHaveValue(0);
    expect(screen.getByLabelText("Personer i husstanden")).toHaveValue("4");
    expect(screen.getByLabelText("Børn under 18 år")).toHaveValue("2");
    expect(screen.getByLabelText("Husstandens formue, som Udbetaling Danmark regner med (valgfri)")).toHaveValue(0);
    expect(screen.getByLabelText("Boligens areal (m²)")).toHaveValue(92);
    expect(screen.getByLabelText("Søgerens pensionstatus")).toHaveValue("folkepension");

    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const privacyWarning = screen.getByText(/Linket kan indeholde husleje, årlig indkomst, formue, husstandsstørrelse, antal børn, pensionstatus og areal/);
    const shareInput = screen.getByLabelText("Delbart link");
    expect(privacyWarning).toHaveAttribute("id");
    expect(shareInput).toHaveAttribute("aria-describedby", privacyWarning.id);
    expect(screen.getByText("Link til beregning")).toHaveAttribute("for", shareInput.id);
    expect(screen.queryByLabelText("Vis QR-kode")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Del på Twitter" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Del på Facebook" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Del via email" })).not.toBeInTheDocument();

    const shareUrl = (screen.getByLabelText("Delbart link") as HTMLInputElement).value;
    const encoded = new URL(shareUrl).hash.slice("#s=".length);
    expect(decodeCalculationState(encoded ?? "")).toMatchObject({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 7200,
        husstandsindkomst: 0,
        antalPersoner: 4,
        antalBorn: 2,
        formue: 0,
        areal: 92,
        pensionStatus: "folkepension",
      },
    });
  });

  test("indlæser ikke ugyldige deletal som gyldige resultater", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 6000,
        husstandsindkomst: "meget",
        areal: -20,
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette#s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByLabelText("Boligens areal (m²)")).toHaveValue(null);
    });
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
    expect(screen.getByText("Indtast et areal større end 0 m².")).toBeInTheDocument();
  });

  test("avviser boolean- og arrayværdier i husstandsfelter", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 6000,
        husstandsindkomst: 216000,
        antalPersoner: true,
        antalBorn: ["1"],
        areal: 65,
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette#s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByText("Nogle oplysninger i delelinket er ugyldige. Indtast dem igen.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
  });

  test("håndterer en malformed delelink uden crash", () => {
    window.history.replaceState({}, "", "/boligstoette?s=not-valid");

    renderBoligstoette();

    expect(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)")).toHaveValue(null);
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
  });

  test("avviser en delestat med ugyldig pensionstatus, husstand og formue", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 6000,
        husstandsindkomst: 216000,
        antalPersoner: 0,
        antalBorn: 2,
        formue: -1,
        areal: 65,
        pensionStatus: "ukendt",
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette#s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(
        screen.getByText("Nogle oplysninger i delelinket er ugyldige. Indtast dem igen."),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
  });

  test("beholder ugyldigt delestat-fejl indtil det berørte felt er rettet", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 6000,
        husstandsindkomst: 216000,
        antalPersoner: 1,
        antalBorn: 0,
        areal: 65,
        pensionStatus: "ukendt",
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette#s=${state}`);

    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByText("Nogle oplysninger i delelinket er ugyldige. Indtast dem igen.")).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText("Boligens areal (m²)"), { target: { value: "70" } });
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Søgerens pensionstatus"), { target: { value: "ingen" } });
    expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
  });

  test("rydder formularen og URL-state ved nulstilling", async () => {
    const state = encodeCalculationState({
      type: "boligstoette",
      inputs: {
        maanedligHusleje: 6000,
        husstandsindkomst: 216000,
        antalPersoner: 1,
        antalBorn: 0,
        areal: 65,
        pensionStatus: "ingen",
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/boligstoette?s=${state}`);
    renderBoligstoette();

    await waitFor(() => {
      expect(screen.getByText(/0 – 1\.194 kr\/md/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Nulstil" }));

    expect(screen.getByLabelText("Månedlig husleje (kr./md, uden forbrugsudgifter)")).toHaveValue(null);
    expect(screen.queryByText(/Vejledende månedsinterval/)).not.toBeInTheDocument();
    expect(new URL(window.location.href).searchParams.has("s")).toBe(false);
  });
});
