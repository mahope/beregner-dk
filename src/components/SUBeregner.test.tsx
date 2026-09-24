import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import SUBeregner from "./SUBeregner";
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

function renderSU() {
  return render(
    <LocaleProvider locale="da" domainConfig={domainConfig}>
      <SUBeregner />
    </LocaleProvider>,
  );
}

function resultCard(label: string) {
  return screen.getByText(label).parentElement;
}

function legacyParentState(erEnligForsorger: boolean) {
  return encodeCalculationState({
    type: "su",
    inputs: {
      uddannelse: "videregaaende",
      boligstatus: "foraelder",
      arbejdsindkomst: 5000,
      antalMaaneder: 12,
      harHandicap: false,
      erEnligForsorger,
    },
    timestamp: 1700000000000,
  });
}

describe("SUBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/su");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("renderer ikke et resultat før URL-state er kontrolleret", () => {
    const markup = renderToString(
      <LocaleProvider locale="da" domainConfig={domainConfig}>
        <SUBeregner />
      </LocaleProvider>,
    );

    expect(markup).not.toContain("Månedlig SU (før skat)");
    expect(markup).toContain("Indlæser SU-beregning");
  });

  test("viser kun dokumenterede beløb før skat", () => {
    renderSU();

    expect(screen.getByRole("group", { name: "Uddannelsestype" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Boligsituation" })).toBeInTheDocument();
    expect(screen.getByText("Månedlig SU (før skat)")).toBeInTheDocument();
    expect(screen.queryByText(/efter skat/i)).not.toBeInTheDocument();
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("7.426");
  });

  test("mærker hjemmeboende som et grundsats-scenarie", () => {
    renderSU();

    fireEvent.click(screen.getByRole("button", { name: /Hjemmeboende/ }));

    expect(screen.getByText("Forældreindkomst påvirker satsen")).toBeInTheDocument();
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("1.154");
  });

  test("kræver godkendelse før 18-19-årig udeboendesats", () => {
    renderSU();

    fireEvent.click(screen.getByRole("button", { name: /Ungdomsuddannelse/ }));
    fireEvent.click(screen.getByRole("button", { name: /^18-19 år/ }));
    expect(screen.getByText("Udeboendesats kræver godkendelse")).toBeInTheDocument();
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("1.154");

    fireEvent.click(screen.getByLabelText("Jeg har godkendelse til udeboendesats"));
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("4.764");
    expect(screen.getByText("Forældreindkomst påvirker satsen")).toBeInTheDocument();
  });

  test("giver 18-19-årige med barn fuld udeboendesats uden godkendelse", () => {
    renderSU();

    fireEvent.click(screen.getByRole("button", { name: /Ungdomsuddannelse/ }));
    fireEvent.click(screen.getByRole("button", { name: /^18-19 år/ }));
    fireEvent.click(screen.getByLabelText("Jeg har ét barn under 18 år"));

    expect(screen.queryByLabelText("Jeg har godkendelse til udeboendesats")).not.toBeInTheDocument();
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("7.426");
  });

  test("viser kun handicaptillæggets officielle uddannelse", () => {
    renderSU();

    const disability = screen.getByLabelText("Handicaptillæg") as HTMLSelectElement;
    expect(disability).toHaveTextContent("Videregående uddannelse");
    expect(disability).not.toHaveTextContent("Dansk erhvervsuddannelse");

    fireEvent.click(screen.getByRole("button", { name: /Ungdomsuddannelse/ }));
    fireEvent.change(disability, { target: { value: "erhverv" } });

    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("14.050");
  });

  test("adskiller barnets sats fra forsørgertillæg og forældrelån", () => {
    renderSU();

    fireEvent.click(screen.getByLabelText("Jeg har ét barn under 18 år"));
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("7.426");
    expect(resultCard("Maks. SU-lån")).toHaveTextContent("5.699");
    expect(screen.getByLabelText("Forsørgertillæg til enlige forsørgere")).not.toBeChecked();

    fireEvent.click(screen.getByLabelText("Forsørgertillæg til enlige forsørgere"));
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("14.852");
    expect(screen.getAllByText(/34.129/)).toHaveLength(2);
  });

  test("indlæser begge legacy foraelder-varianter uden at opfinde forsørgertillæg", async () => {
    window.history.replaceState(
      {},
      "",
      `/su?s=${legacyParentState(false)}`,
    );
    const firstView = renderSU();
    await waitFor(() => {
      expect(screen.getByLabelText("Jeg har ét barn under 18 år")).toBeChecked();
    });
    expect(screen.getByLabelText("Forsørgertillæg til enlige forsørgere")).not.toBeChecked();
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("7.426");
    firstView.unmount();

    window.history.replaceState(
      {},
      "",
      `/su?s=${legacyParentState(true)}`,
    );
    renderSU();
    await waitFor(() => {
      expect(screen.getByLabelText("Forsørgertillæg til enlige forsørgere")).toBeChecked();
    });
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("14.852");
  });

  test("indlæser et gammelt ungdoms-hjemmeboende-link som aktuel ordning", async () => {
    const state = encodeCalculationState({
      type: "su",
      inputs: {
        uddannelse: "ungdom",
        boligstatus: "hjemmeboende",
        arbejdsindkomst: 5000,
        antalMaaneder: 12,
        harHandicap: false,
        erEnligForsorger: false,
      },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/su?s=${state}`);

    renderSU();

    await waitFor(() => {
      expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("1.154");
    });
  });

  test("bevarer nuværende state-felter i et nyt delelink", () => {
    renderSU();

    fireEvent.click(screen.getByRole("button", { name: /Hjemmeboende/ }));
    fireEvent.click(screen.getByLabelText("Jeg har ét barn under 18 år"));
    fireEvent.click(screen.getByLabelText("Jeg er fortsat indskrevet i de øvrige måneder"));
    fireEvent.click(screen.getByRole("button", { name: "Del beregning" }));
    const shareUrl = screen.getByLabelText("Delbart link").getAttribute("value") ?? "";
    const encoded = new URL(shareUrl).searchParams.get("s") ?? "";

    expect(decodeCalculationState(encoded)?.inputs).toMatchObject({
      uddannelse: "videregaaende",
      boligstatus: "hjemmeboende",
      homewardScheme: "current",
      nonSuStatus: "notStudying",
      antalMaaneder: 12,
      harBarnUnder18: true,
      harHandicap: false,
      erEnligForsorger: false,
    });
  });

  test("rydder både delestaten og URL ved nulstilling", async () => {
    window.history.replaceState(
      {},
      "",
      `/su?s=${legacyParentState(false)}`,
    );

    renderSU();
    await waitFor(() => {
      expect(screen.getByLabelText("Jeg har ét barn under 18 år")).toBeChecked();
    });

    fireEvent.click(screen.getByRole("button", { name: "Nulstil" }));

    expect(screen.getByLabelText("Jeg har ét barn under 18 år")).not.toBeChecked();
    expect(new URL(window.location.href).searchParams.has("s")).toBe(false);
  });

  test("afviser en malformed delelink uden crash", () => {
    window.history.replaceState(
      {},
      "",
      "/su?s=eyJ2IjoiMSIsInQiOiJzdSIsImkiOm51bGwsInRzIjoxNzAwMDAwMDAwMDAwfQ",
    );

    renderSU();

    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("7.426");
  });

  test("viser ingen SU eller SU-lån ved nul SU-måneder", () => {
    renderSU();

    fireEvent.change(screen.getByLabelText("Antal SU-måneder i år"), {
      target: { value: "0" },
    });

    expect(screen.getByText("Ingen SU valgt i år")).toBeInTheDocument();
    expect(resultCard("Maks. SU-lån")).toHaveTextContent("0 kr.");
  });

  test("beholder formularen ved et ikke-finitt arbejdsindkomsttal", () => {
    renderSU();

    fireEvent.change(screen.getByLabelText(/Forventet arbejdsindkomst/), {
      target: { value: "1e309" },
    });

    expect(screen.getByLabelText(/Forventet arbejdsindkomst/)).toHaveValue(0);
    expect(resultCard("Månedlig SU (før skat)")).toHaveTextContent("7.426");
  });
});
