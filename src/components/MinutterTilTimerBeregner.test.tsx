import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import MinutterTilTimerBeregner from "./MinutterTilTimerBeregner";
import { LocaleProvider } from "./LocaleProvider";

const domainConfig = getDomainConfig("localhost");

function renderMed(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <MinutterTilTimerBeregner />
    </LocaleProvider>,
  );
}

afterEach(cleanup);

describe("MinutterTilTimerBeregner", () => {
  // Dansk autocomplete 6/10: «omregn 145 minutter til timer» er en af fire
  // konkrete træffere under «omregn minutter til timer», som GSC også fanger
  // i «tid beregner» (132 visninger, pos. 6) og «beregn tid» (88, pos. 6).
  // Siden havde brødteksten og tabellen, men intet værktøj.
  test("145 minutter viser 2:25, 2,42 decimaltimer og 8.700 sekunder", () => {
    const { container } = renderMed("da");

    expect(screen.getByText("2:25")).toBeInTheDocument();
    expect(screen.getByText("2,42")).toBeInTheDocument();
    expect(screen.getByText("8.700")).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("NaN");
  });

  test("begge veje er valgbare, og minutter → timer er standardvalget", () => {
    renderMed("da");

    const radiogruppe = screen.getByRole("radiogroup");
    const radioer = Array.from(
      radiogruppe.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];

    expect(radioer).toHaveLength(2);
    expect(radioer[0].checked).toBe(true);
    expect(screen.getByLabelText("Minutter")).toHaveValue("145");
  });

  test("timer → minutter ganger med 60, så 1,5 time er 90 minutter", () => {
    renderMed("da");

    fireEvent.click(screen.getByRole("radio", { name: /Timer → Minutter/ }));

    const felt = screen.getByLabelText("Timer") as HTMLInputElement;
    expect(felt.value).toBe("1,5");
    expect(screen.getByText(/1,5 timer × 60 = 90 minutter/)).toBeInTheDocument();
  });

  test("et tomt felt siger, hvad der mangler, i stedet for at vise NaN", () => {
    const { container } = renderMed("da");

    fireEvent.change(screen.getByLabelText("Minutter"), { target: { value: "" } });

    expect(screen.getByText(/Skriv et antal minutter/)).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("NaN");
  });

  test("et ugyldigt felt siger, hvilken form der skal bruges", () => {
    renderMed("da");

    fireEvent.change(screen.getByLabelText("Minutter"), { target: { value: "abc" } });

    expect(screen.getByText(/Skriv et tal/)).toBeInTheDocument();
  });

  test("0 minutter er et svar, ikke en fejl: kortet viser 0:00 og 0,00", () => {
    renderMed("da");

    fireEvent.change(screen.getByLabelText("Minutter"), { target: { value: "0" } });

    expect(screen.getByText("0:00")).toBeInTheDocument();
    expect(screen.getByText("0,00")).toBeInTheDocument();
  });

  // Punkt 1/4: komma er dansk og svensk notation, punkt 11: tallene i
  // knapperne er de målte søgninger, ikke tilfældige.
  test("genvejsknapperne er de tal, søgningerne bruger — 25, 145 og 180 minutter", () => {
    renderMed("da");

    for (const minutter of ["25", "145", "180", "90", "1000", "1500"]) {
      expect(screen.getByRole("button", { name: `${minutter} minutter` })).toBeInTheDocument();
    }
  });

  test("et genvejstast sætter feltet, så læseren ser regnestykket ske", () => {
    renderMed("da");

    fireEvent.click(screen.getByRole("button", { name: "25 minutter" }));

    expect((screen.getByLabelText("Minutter") as HTMLInputElement).value).toBe("25");
    expect(screen.getByText("0:25")).toBeInTheDocument();
    expect(screen.getByText(/25 minutter ÷ 60 = 0,42 timer/)).toBeInTheDocument();
  });

  test("beraknare.se får svensk overskrift, felt og knapper", () => {
    renderMed("se");

    expect(screen.getByText("Räkna om minuter till timmar")).toBeInTheDocument();
    expect(screen.getByLabelText("Minuter")).toHaveValue("145");
    expect(screen.getByRole("button", { name: "25 minuter" })).toBeInTheDocument();
    expect(screen.getByText(/minuter ÷ 60 = timmar/)).toBeInTheDocument();
  });

  test("svensk decimal med komma læses som komma, ikke som to tal", () => {
    const { container } = renderMed("se");

    fireEvent.click(screen.getByRole("radio", { name: /Timmar → Minuter/ }));

    expect((screen.getByLabelText("Timmar") as HTMLInputElement).value).toBe("1,5");
    expect(screen.getByText(/1,5 timmar × 60 = 90 minuter/)).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("NaN");
  });

  test("den svenske side lækker ingen dansk", () => {
    const { container } = renderMed("se");

    expect(container.innerHTML).not.toContain("Minutter");
    expect(container.innerHTML).not.toContain("døgn");
  });
});