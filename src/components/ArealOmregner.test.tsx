import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import ArealOmregner from "./ArealOmregner";
import { LocaleProvider } from "./LocaleProvider";

const domainConfig = getDomainConfig("localhost");

function renderMed(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <ArealOmregner />
    </LocaleProvider>,
  );
}

afterEach(cleanup);

describe("ArealOmregner", () => {
  // Dansk autocomplete 6/10: 9 af 10 træffere under «omregn kvadratmeter til»
  // er denne omregning, og «500 kvadratfod» er første træffer under
  // «kvadratfod». Værktøjet på /kvadratmeter viste kun den ene vej, så den
  // omvende var umulig at løse på sitet.
  test("500 kvadratfod viser alle fem andre enheder, da er standardvalget", () => {
    renderMed("da");

    expect(screen.getByText("46,45")).toBeInTheDocument();
    expect(screen.getByText("464.515")).toBeInTheDocument();
    expect(screen.getByText("0,0046")).toBeInTheDocument();
    expect(screen.getByText("0,000046")).toBeInTheDocument();
    expect(screen.getByText("0,011478")).toBeInTheDocument();
  });

  test("alle seks enheder er valgbare, og m² står først", () => {
    renderMed("da");

    const valg = screen.getByLabelText("Enhed") as HTMLSelectElement;
    const muligheder = Array.from(valg.options).map((o) => o.value);
    expect(muligheder).toEqual(["m2", "cm2", "km2", "hektar", "kvadratfod", "acre"]);
    expect(valg.value).toBe("kvadratfod");
  });

  test("der står præcist, hvorfor tallene er rigtige — 0,09290304 m² pr. kvadratfod", () => {
    renderMed("da");
    expect(screen.getByText(/0,09290304 m²/)).toBeInTheDocument();
  });

  test("et tomt felt siger, hvad der mangler, i stedet for at vise NaN", () => {
    const { container } = render(
      <LocaleProvider locale="da" domainConfig={domainConfig}>
        <ArealOmregner />
      </LocaleProvider>,
    );
    const felt = screen.getByLabelText("Areal") as HTMLInputElement;
    expect(felt.value).toBe("500");
    expect(container.innerHTML).not.toContain("NaN");

    fireEvent.change(felt, { target: { value: "" } });

    expect(screen.getByText(/Skriv et tal i feltet/)).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("NaN");
  });

  // Et felt med minus skal sige hvorfor, ikke vise NaN (punkt 8: en fejl skal
  // sige hvad der gikalt og hvad man gør nu).
  test("et negativt areal siger hvorfor, i stedet for at vise NaN", () => {
    renderMed("da");
    const felt = screen.getByLabelText("Areal") as HTMLInputElement;

    fireEvent.change(felt, { target: { value: "-20" } });

    expect(screen.getByText(/Et areal kan ikke være negativt/)).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("NaN");
  });

  // En norsk læser skal ikke få dansk eller svensk (F9 i planen).
  test("svensk og norsk får hver sit sprog uden dansk", () => {
    const { unmount } = renderMed("se");
    expect(screen.getByText("Omvandla area")).toBeInTheDocument();
    expect(screen.getByText(/exakt 0,09290304/)).toBeInTheDocument();
    expect(screen.getByText(/1 kvadratfot är exakt/)).toBeInTheDocument();
    expect(document.body.innerHTML).not.toContain("Omregn areal");
    unmount();

    renderMed("no");
    // `no` er ikke en af de to sproge med eget arealværktøj, så den falder
    // tilbage på dansk — som `KvadratmeterBeregner` og `EnhederBeregner` gør.
    expect(screen.getByText("Omregn areal")).toBeInTheDocument();
  });
});