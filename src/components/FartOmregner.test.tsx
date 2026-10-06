import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import FartOmregner from "./FartOmregner";
import { LocaleProvider } from "./LocaleProvider";

const domainConfig = getDomainConfig("localhost");

function renderMed(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <FartOmregner />
    </LocaleProvider>,
  );
}

function skrivEnhed(vaerdi: string) {
  fireEvent.change(screen.getByLabelText(/^(Hastighed|Hastighet)$/), {
    target: { value: vaerdi },
  });
}

afterEach(cleanup);

describe("FartOmregner", () => {
  // Dansk autocomplete 6/10 20:3x: 10 af 10 træffere under «km i timen» er
  // omregning («km i timen omregner», «km i timen til miles per hour», «km i
  // timen til meter i sekundet», «km i timen til knob»). Beregneren på /fart
  // kunne *finde* en fart i km/t, men havde intet felt at skrive i.
  test("100 km/t viser alle fire enheder, og km/t er standardvalget", () => {
    renderMed("da");

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("27,78")).toBeInTheDocument();
    expect(screen.getByText("62,1")).toBeInTheDocument();
    expect(screen.getByText("54")).toBeInTheDocument();
  });

  test("alle fire enheder er valgbare, og km/t står først", () => {
    renderMed("da");

    const valg = screen.getByLabelText("Enhed") as HTMLSelectElement;
    const muligheder = Array.from(valg.options).map((o) => o.value);
    expect(muligheder).toEqual(["km_t", "m_s", "mph", "knop"]);
  });

  test("svarer den anden vej: 10 knob er 18,52 km/t", () => {
    renderMed("da");
    skrivEnhed("10");
    fireEvent.change(screen.getByLabelText("Enhed"), { target: { value: "knop" } });

    expect(screen.getByText("18,5")).toBeInTheDocument();
    expect(screen.getByText("5,14")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  test("farten i m/s svarer til samme km/t, så værktøjet ikke kan glide", () => {
    renderMed("da");
    fireEvent.change(screen.getByLabelText("Enhed"), { target: { value: "m_s" } });

    // 100 m/s er 360 km/t — det er den fælde, der giver 36 km/t, hvis
    // faktorretningen er vendt om.
    expect(screen.getByText("360")).toBeInTheDocument();
    expect(screen.getByText("223,7")).toBeInTheDocument();
  });

  test("tempo og sekunder pr. 100 m følger farten modsat", () => {
    renderMed("da");

    // 100 km/t er 0,6 min/km og 3,6 sekunder pr. 100 m.
    expect(screen.getByText("0,6")).toBeInTheDocument();
    expect(screen.getByText("3,6")).toBeInTheDocument();
  });

  test("ved 0 står der en forklaring i stedet for et umuligt tempo", () => {
    renderMed("da");
    skrivEnhed("0");

    expect(screen.getByText(/kan du ikke løbe/)).toBeInTheDocument();
  });

  test("svensk side skriver sine egne ord og tal med komma", () => {
    renderMed("se");

    expect(screen.getByText("27,78")).toBeInTheDocument();
    expect(screen.getByText("62,1")).toBeInTheDocument();
    expect(screen.getByLabelText("Hastighet")).toBeInTheDocument();
    expect(screen.getByText("Omvandla hastighet")).toBeInTheDocument();
    // Dansk «hastighed» og «enhed» må ikke stå på beraknare.se.
    expect(screen.queryByLabelText("Hastighed")).not.toBeInTheDocument();
  });

  test("en tom etiket-løs etiket er bundet til sit felt", () => {
    renderMed("da");

    expect(screen.getByLabelText("Hastighed")).toBeInTheDocument();
    expect(screen.getByLabelText("Enhed")).toBeInTheDocument();
  });
});
