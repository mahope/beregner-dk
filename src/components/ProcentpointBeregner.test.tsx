/**
 * ProcentpointBeregner låser den forveksling, hele værktøjet findes for:
 * point forskellen og den procentvise ændring er to forskellige tal, og de må
 * aldrig kunne læses som det samme. Porten skriver derfor i felterne og læser
 * begge tal ud af DOM'en, i begge sprog.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ProcentpointBeregner from "./ProcentpointBeregner";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

afterEach(cleanup);

function renderVærktøj(locale: "da" | "se") {
  return render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfig("localhost")}>
      <ProcentpointBeregner />
    </LocaleProvider>,
  );
}

function felter(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="number"]'));
}

function skrivOgRegn(
  container: HTMLElement,
  gammel: string,
  ny: string,
  knap: string,
) {
  const [foerste, anden] = felter(container);
  fireEvent.change(foerste, { target: { value: gammel } });
  fireEvent.change(anden, { target: { value: ny } });
  fireEvent.click(screen.getByRole("button", { name: knap }));
}

describe("værktøjet starter uden at svare", () => {
  test("dansk: feltet er tomt indtil man trykker", () => {
    renderVærktøj("da");
    expect(
      screen.getByText(/Skriv to procenttal og tryk på «Regn ud»/)
    ).toBeTruthy();
  });

  test("svensk: feltet er tomt indtil man trykker", () => {
    renderVærktøj("se");
    expect(
      screen.getByText(/Skriv två procenttal och tryck på «Räkna ut»/)
    ).toBeTruthy();
  });
});

describe("point forskellen og den procentvise ændring er to tal", () => {
  test("dansk: 2 % til 3 % er 1,0 procentpoint og 50 procent", () => {
    const { container } = renderVærktøj("da");
    skrivOgRegn(container, "2", "3", "Regn ud");
    expect(screen.getByText("1,0")).toBeTruthy();
    expect(screen.getByText("50 %")).toBeTruthy();
  });

  test("et fald er negativt i begge tal", () => {
    const { container } = renderVærktøj("da");
    skrivOgRegn(container, "3", "2", "Regn ud");
    expect(screen.getByText("-1,0")).toBeTruthy();
    expect(screen.getByText("-33,3 %")).toBeTruthy();
  });

  test("svensk: 2 % till 3 % är 1,0 procentenhet och 50 procent", () => {
    const { container } = renderVærktøj("se");
    skrivOgRegn(container, "2", "3", "Räkna ut");
    expect(screen.getByText("1,0")).toBeTruthy();
    expect(screen.getByText("50 %")).toBeTruthy();
  });

  test("ét procentpoint er 5 % på 20 og 50 % på 2", () => {
    // Samme flytning i point, helt forskelligt i procent. Dette er hele
    // pointen med værktøjet, så porten dømmer på de to tal side om side.
    const { container } = renderVærktøj("da");
    skrivOgRegn(container, "20", "21", "Regn ud");
    expect(screen.getByText("1,0")).toBeTruthy();
    expect(screen.getByText("5 %")).toBeTruthy();

    cleanup();
    const anden = renderVærktøj("da");
    skrivOgRegn(anden.container, "2", "3", "Regn ud");
    expect(screen.getByText("1,0")).toBeTruthy();
    expect(screen.getByText("50 %")).toBeTruthy();
  });
});

describe("retningen læses ordentlig", () => {
  test("opad hedder stigning, nedad fald, uændret sig selv", () => {
    const { container, unmount } = renderVærktøj("da");
    skrivOgRegn(container, "2", "3", "Regn ud");
    expect(screen.getByText("stigning")).toBeTruthy();
    unmount();

    const anden = renderVærktøj("da");
    skrivOgRegn(anden.container, "3", "2", "Regn ud");
    expect(screen.getByText("fald")).toBeTruthy();
  });

  test("svensk: opad heter ökning, nedåt minskning", () => {
    const { container, unmount } = renderVærktøj("se");
    skrivOgRegn(container, "2", "3", "Räkna ut");
    expect(screen.getByText("ökning")).toBeTruthy();
    unmount();

    const anden = renderVærktøj("se");
    skrivOgRegn(anden.container, "3", "2", "Räkna ut");
    expect(screen.getByText("minskning")).toBeTruthy();
  });
});

describe("et gammelt procenttal på 0", () => {
  test("procentpoint kan stadig regnes, den procentvise ændring kan ikke", () => {
    const { container } = renderVærktøj("da");
    skrivOgRegn(container, "0", "2.5", "Regn ud");
    // 0 -> 2,5 er 2,5 procentpoint, og det står i det store felt.
    expect(screen.getByText("2,5")).toBeTruthy();
    // Den procentvise ændring er umulig, så den forklares i stedet for at
    // vise et falsk 0 %.
    expect(
      screen.getByText(/Et gammelt procenttal på 0 kan ikke være heltalet/)
    ).toBeTruthy();
    expect(screen.queryByText("Det svarer til")).toBeNull();
  });
});

describe("tilgængelighed", () => {
  test("begge felter har en label med htmlFor", () => {
    const { container } = renderVærktøj("da");
    for (const label of Array.from(container.querySelectorAll("label"))) {
      const htmlFor = label.getAttribute("for");
      expect(htmlFor).toBeTruthy();
      expect(container.querySelector(`#${htmlFor}`)).toBeTruthy();
    }
  });

  test("aria-live-boksen findes FØR læseren trykker, ikke først bagefter", () => {
    // En boks der først opstår med svaret, giver skærmlæseren intet at læse
    // ændringen i, så porten kræver den i DOM'en fra starten.
    const { container } = renderVærktøj("da");
    const foer = container.querySelector('[aria-live="polite"]');
    expect(foer).toBeTruthy();
    expect(foer!.textContent).toContain("Skriv to procenttal");
  });

  test("begge felter er koblet til deres hjælpetekst", () => {
    const { container } = renderVærktøj("da");
    for (const felt of felter(container)) {
      const hjaelp = felt.getAttribute("aria-describedby");
      expect(hjaelp).toBeTruthy();
      expect(container.querySelector(`#${hjaelp}`)).toBeTruthy();
    }
  });
});
