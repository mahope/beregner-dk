import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import LaaneplanBeregner from "./LaaneplanBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
}));

const rene = (t: string | null) => (t ?? "").replace(/ /g, " ");

function renderDa(variant: "annuitet" | "forbrugslaan", props: { foldGebyrer?: boolean; medBeloebTabel?: boolean } = {}) {
  return render(
    <LocaleProvider locale="da" domainConfig={getDomainConfig("localhost")}>
      <LaaneplanBeregner variant={variant} {...props} />
    </LocaleProvider>,
  );
}

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

describe("LaaneplanBeregner", () => {
  test("annuitetslån: 1 mio. til 5 % over 30 år giver 5.368 kr. og ÅOP 5,12 %", () => {
    renderDa("annuitet");
    expect(rene(document.querySelector("p.text-4xl")?.textContent ?? null)).toBe("5.368 kr.");
    expect(screen.getAllByText("5,12 %").length).toBeGreaterThan(0);
  });

  test("forbrugslån starter på 100.000 kr., 9 % og 5 år med stiftelsesgebyr", () => {
    renderDa("forbrugslaan");
    expect((screen.getByLabelText(/Lånebeløb/) as HTMLInputElement).value).toBe("100000");
    expect((screen.getByLabelText(/Stiftelsesgebyr/) as HTMLInputElement).value).toBe("1500");
  });

  test("viser sammenligning, graf og amortiseringsplan", () => {
    renderDa("annuitet");
    expect(screen.getByRole("heading", { name: /Annuitetslån eller serielån/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Restgæld over tid/ })).toBeTruthy();
    expect(screen.getByRole("table", { name: /Amortiseringsplan pr\. år/ })).toBeTruthy();
    expect(screen.getByText(/Vis alle 360 måneder/)).toBeTruthy();
  });

  test("læser et del-link og skriver ændringer tilbage i adressen", () => {
    window.history.replaceState(null, "", "/forbrugslaan?beloeb=250000&rente=7.5&aar=10&type=serielaan");
    renderDa("forbrugslaan");
    expect((screen.getByLabelText(/Lånebeløb/) as HTMLInputElement).value).toBe("250000");
    expect(screen.getByRole("button", { name: "Serielån" }).getAttribute("aria-pressed")).toBe("true");

    fireEvent.change(screen.getByLabelText(/Lånebeløb/), { target: { value: "300000" } });
    expect(window.location.search).toContain("beloeb=300000");
    expect(window.location.search).toContain("type=serielaan");
  });

  test("ugyldigt beløb viser en fejl i stedet for NaN", () => {
    renderDa("annuitet");
    fireEvent.change(screen.getByLabelText(/Lånebeløb/), { target: { value: "0" } });
    expect(screen.getByRole("alert").textContent).toMatch(/Lånebeløbet skal være mellem/);
    expect(document.body.textContent).not.toMatch(/NaN/);
  });

  test("gebyr hæver ÅOP over renten", () => {
    renderDa("annuitet");
    fireEvent.change(screen.getByLabelText(/Stiftelsesgebyr/), { target: { value: "10000" } });
    const aop = Array.from(document.querySelectorAll("dt"))
      .find((dt) => dt.textContent === "ÅOP")
      ?.nextElementSibling?.textContent;
    expect(Number((aop ?? "").replace(/[^\d,]/g, "").replace(",", "."))).toBeGreaterThan(5.12);
  });

  test("foldet gebyr: felterne ligger under 'Gebyrer og ÅOP' og er lukket som standard", () => {
    renderDa("annuitet", { foldGebyrer: true });
    const details = screen.getByText("Gebyrer og ÅOP").closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(details.contains(screen.getByLabelText(/Stiftelsesgebyr/))).toBe(true);
    // Der er stadig kun ét lånebeløb-felt på siden.
    expect(screen.getAllByLabelText(/Lånebeløb/)).toHaveLength(1);
  });

  test("foldet gebyr åbnes af et del-link med gebyr", () => {
    window.history.replaceState(null, "", "/renteberegner?beloeb=500000&rente=4&aar=20&stiftelse=5000");
    renderDa("annuitet", { foldGebyrer: true });
    expect((screen.getByText("Gebyrer og ÅOP").closest("details") as HTMLDetailsElement).open).toBe(true);
    expect((screen.getByLabelText(/Stiftelsesgebyr/) as HTMLInputElement).value).toBe("5000");
  });

  test("gammelt del-link (?s=…) fra den tidligere renteberegner genskaber tallene", () => {
    const gammel = {
      v: "1",
      t: "rente",
      i: { hovedstol: 750000, rente: 3.5, loebetid: 25, type: "serielaan" },
      ts: 1,
    };
    const kodet = btoa(JSON.stringify(gammel)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    window.history.replaceState(null, "", `/renteberegner?s=${kodet}`);
    renderDa("annuitet", { foldGebyrer: true });
    expect((screen.getByLabelText(/Lånebeløb/) as HTMLInputElement).value).toBe("750000");
    expect((screen.getByLabelText(/^Rente \(debitorrente/) as HTMLInputElement).value).toBe("3.5");
    expect((screen.getByLabelText(/Løbetid/) as HTMLInputElement).value).toBe("25");
    expect(screen.getByRole("button", { name: "Serielån" }).getAttribute("aria-pressed")).toBe("true");
  });

  test("beløbstabellen følger rente og løbetid fra de samme felter", () => {
    renderDa("annuitet", { medBeloebTabel: true });
    expect(screen.getByRole("heading", { name: "Hvor meget koster det at låne?" })).toBeTruthy();
    const ydelse = () => document.querySelector("table tbody tr:nth-child(1) td")?.textContent;
    const foer = ydelse();
    fireEvent.change(screen.getByLabelText(/Løbetid/), { target: { value: "10" } });
    expect(ydelse()).not.toBe(foer);
    expect(screen.getAllByLabelText(/Lånebeløb/)).toHaveLength(1);
  });

  test("viser ingenting på de svenske og norske domæner", () => {
    const { container } = render(
      <LocaleProvider locale="se" domainConfig={getDomainConfig("beraknare.se")}>
        <LaaneplanBeregner variant="annuitet" />
      </LocaleProvider>,
    );
    expect(container.textContent).toBe("");
  });
});
