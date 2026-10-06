import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";
import KoerIgenBeregner from "./KoerIgenBeregner";
import { LocaleProvider } from "./LocaleProvider";

/**
 * Porten på selve værktøjet.
 *
 * Sidesiden (`promille/page.test.tsx`) erstatter KoerIgenBeregner med en
 * pladsholder, fordi den renderer hele siden til statisk markup. Uden denne
 * fil ville intet teste, at komponenten viser det rigtige klokkeslæt — kun at
 * tabellen på siden gør det.
 */

const domainConfig = getDomainConfig("localhost");

function renderMed(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <KoerIgenBeregner />
    </LocaleProvider>,
  );
}

afterEach(cleanup);

describe("KoerIgenBeregner", () => {
  // Dansk autocomplete 6/10 06:3x: «hvornår kan jeg køre bil igen» og
  // «hvornår må jeg køre bil efter druk» er de to største af i alt 20
  // træffere. Forudindstillingen er derfor den aften, spørgsmålet handler om:
  // fire øl kl. 23:30 på en mand på 80 kg.
  test("forudindstillet svarer 02:06 og siger, at det er næste døgn", () => {
    renderMed("da");
    expect(screen.getByText("02:06")).toBeTruthy();
    // Døgnskiftet skal stå i markuppen ved siden af klokkeslættet. Uden det
    // læses 02:06 som den tid på dagen, og svaret er tidligere end det er.
    expect(screen.getByText("næste døgn")).toBeTruthy();
    expect(screen.getByText("05:24")).toBeTruthy();
  });

  test("et eftermiddagsglas svarer samme dags eftermiddag", () => {
    renderMed("da");
    fireEvent.change(screen.getByLabelText("Antal genstande"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Kropsvægt"), { target: { value: "65" } });
    fireEvent.click(screen.getByRole("button", { name: "Kvinde" }));
    fireEvent.change(screen.getByLabelText("Sidste genstand var kl."), { target: { value: "13:00" } });
    expect(screen.getByText("14:12")).toBeTruthy();
    expect(screen.getByText("samme døgn")).toBeTruthy();
    expect(screen.queryByText("02:06")).toBeNull();
  });

  test("et ugyldigt klokkeslæt giver fejltilstand, ikke et opdigtet tidspunkt", () => {
    renderMed("da");
    fireEvent.change(screen.getByLabelText("Sidste genstand var kl."), { target: { value: "" } });
    // Uden gyldige felter må værktøjet ikke svare med et klokkeslæt: det er en
    // tilladelse til at køre bil, og den må ikke komme fra et felt læseren
    // endnu ikke har tastet.
    expect(screen.getByText(/Udfyld klokkeslæt/)).toBeTruthy();
    expect(screen.queryByText("02:06")).toBeNull();
  });

  // Punkt 1 fra kvalitetstjeklisten: et klokkeslæt er læserens tidspunkt,
  // ikke sidens "nu". Der er ingen databaseadgang og ingen hydration-fælde.
  test("værktøjet spørger ikke om klokkeslættet nu, det indtastes", () => {
    renderMed("da");
    const felt = screen.getByLabelText("Sidste genstand var kl.") as HTMLInputElement;
    expect(felt.type).toBe("time");
    expect(felt.value).toBe("23:30");
  });

  test("beraknare.se får svensk tekst og Sveriges lavere grænse", () => {
    renderMed("se");
    expect(screen.getByText("När kan jag köra bil igen?")).toBeTruthy();
    expect(screen.getByLabelText("Sista glaset var kl.")).toBeTruthy();
    // 0,2 ‰ i stedet for 0,5 ‰: 23:30 + 4 t 36 min = 04:06, ikke 02:06.
    // Svarer værktøjet 02:06 på beraknare.se, svarer det med dansk lov.
    expect(screen.getByText("04:06")).toBeTruthy();
    expect(screen.queryByText("Hvornår kan jeg køre bil igen?")).toBeNull();
  });

  test("alle felter har et label, der er bundet til sit felt", () => {
    const { container } = renderMed("da");
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    for (const input of inputs) {
      expect(input.getAttribute("aria-label") ?? input.id).toBeTruthy();
      const label = container.querySelector(`label[for="${input.id}"]`);
      expect(label, `feltet ${input.id} har intet label`).not.toBeNull();
    }
  });
});