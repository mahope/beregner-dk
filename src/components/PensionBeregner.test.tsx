import { decodeCalculationState } from "@/lib/calculation-state";
import { getDomainConfig } from "@/lib/domain-config";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import PensionBeregner from "./PensionBeregner";
import { LocaleProvider } from "./LocaleProvider";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const domainConfig = getDomainConfig("localhost");

function renderPension() {
  return render(
    <LocaleProvider locale="da" domainConfig={domainConfig}>
      <PensionBeregner />
    </LocaleProvider>,
  );
}

/** Intel bruger et ikke-brydende mellemrum før "kr.", så talnormaliseres før tjek. */
function normalize(text: string | null | undefined): string {
  return (text ?? "").replace(/[\u00a0\u202f\u2009]/g, " ");
}

function folkepensionTotal(): string {
  return normalize(screen.getByText("I alt pr. måned før skat").closest("li")?.textContent);
}

function række(regning: RegExp): string {
  return normalize(screen.getByText(regning).closest("li")?.textContent);
}

function setSamliv(value: "enlig" | "samlevende") {
  fireEvent.change(screen.getByLabelText("Samlivsstatus"), { target: { value } });
}

function setIndkomst(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

const EGEN_INDKOMST = "Din årlige indkomst ud over arbejdsindkomst";
const SAMLEVER_INDKOMST = "Samleverens årlige indkomst ud over arbejdsindkomst";

describe("PensionBeregner — folkepensionsalder følger fødselsåret, ikke et fast tal", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/pension");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("viser den udledte folkepensionsalder i stedet for et fast 68 år", async () => {
    renderPension();

    // Standardbrugeren er 30 år, så fødselsåret er 1996 — over 1971-skiftet.
    await waitFor(() => {
      expect(folkepensionTotal()).toMatch(/16\.273\skr\./);
    });
    const fodselsaar = new Date().getFullYear() - 30;
    expect(fodselsaar).toBeGreaterThanOrEqual(1971);
    expect(screen.getByText(`Din folkepensionsalder er ca. 70 år (født ca. ${fodselsaar})`)).toBeInTheDocument();
    expect(screen.queryByText(/Folkepensionsalder er 68 år/)).not.toBeInTheDocument();
  });

  test("forklarer at den valgte alder ligger før folkepensionsalderen", async () => {
    renderPension();

    await waitFor(() => {
      expect(
        screen.getByText(/2 år før din folkepensionsalder på ca\. 70 år/),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/folkepensionen udbetales først, når du har nået folkepensionsalderen/)).toBeInTheDocument();
  });

  test("nævner at folkepensionen skal søges for, når alderen er valgt til 70", async () => {
    renderPension();
    fireEvent.change(screen.getByLabelText("Ønsket pensionsalder"), { target: { value: "70" } });

    await waitFor(() => {
      expect(
        screen.getByText(/Din valgte alder er din folkepensionsalder på ca\. 70 år/),
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/husk at du skal selv søge om folkepensionen/)).toBeInTheDocument();
  });

  test("følger alderen, så en 60-årig får 68 år", async () => {
    renderPension();
    fireEvent.change(screen.getByLabelText("Din alder"), { target: { value: "60" } });

    const fodselsaar = new Date().getFullYear() - 60;
    await waitFor(() => {
      expect(screen.getByText(`Din folkepensionsalder er ca. 68 år (født ca. ${fodselsaar})`)).toBeInTheDocument();
    });
  });
});

describe("PensionBeregner — pensionstillæg efter indkomst", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/pension");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("viser grundbeløb og fuldt tillæg for en enlig uden anden indkomst", async () => {
    renderPension();

    await waitFor(() => {
      expect(folkepensionTotal()).toMatch(/16\.273\skr\./);
    });
    expect(række(/^Grundbeløb$/)).toMatch(/7\.544\skr\./);
    expect(række(/Pensionstillæg, fuldt \(enlig\)/)).toMatch(/8\.729\skr\./);
    expect(
      screen.getByText(/Du har ikke opgivet andre indkomster, så du får det fulde pensionstillæg/),
    ).toBeInTheDocument();
  });

  test("giver gifte og samlevende det lavere tillæg på 12.011 kr.", async () => {
    renderPension();
    setSamliv("samlevende");

    await waitFor(() => {
      expect(folkepensionTotal()).toMatch(/12\.011\skr\./);
    });
    expect(række(/Pensionstillæg, fuldt \(gift\/samlevende\)/)).toMatch(/4\.467\skr\./);
    expect(række(/^Grundbeløb$/)).toMatch(/7\.544\skr\./);
  });

  test("sætter tillægget ned af andre indkomster og viser nedsættelsen", async () => {
    renderPension();
    setIndkomst(EGEN_INDKOMST, "119200");

    await waitFor(() => {
      expect(
        screen.getByText(/Tillægget sættes ned med 30,9 % af indkomsten over 99\.200\skr\./),
      ).toBeInTheDocument();
    });
    // 8.729 - 20.000 x 0,309 = 2.549 kr. i tillæg, 7.544 + 2.549 = 10.093 kr.
    expect(folkepensionTotal()).toMatch(/10\.093\skr\./);
    expect(række(/Nedsat på grund af andre indkomster/)).toMatch(/6\.180\skr\./);
  });

  test("fjerner pensionstillægget over bortfaldsgrænsen, men ikke grundbeløbet", async () => {
    renderPension();
    setIndkomst(EGEN_INDKOMST, "500000");

    await waitFor(() => {
      expect(screen.getByText(/fjerner pensionstillægget helt/)).toBeInTheDocument();
    });
    expect(screen.getByText(/0 kr\. — bortfaldet/)).toBeInTheDocument();
    expect(folkepensionTotal()).toMatch(/7\.544\skr\./);
  });

  test("regner kun 46 % af samleverens indkomst med, når samleveren ikke er pensionist", async () => {
    renderPension();
    setSamliv("samlevende");
    setIndkomst(SAMLEVER_INDKOMST, "200000");

    await waitFor(() => {
      expect(screen.getByText(/kun 46 % af din samlevers indkomst tæller med/)).toBeInTheDocument();
    });
    // 54 % af 200.000 holdes ude, så grundlaget er 92.000 kr. — under grænsen på 198.800 kr.
    expect(screen.getByText(/Der er holdt 108\.000\skr\. ude/)).toBeInTheDocument();
    expect(folkepensionTotal()).toMatch(/12\.011\skr\./);
  });

  test("regner hele samleverens indkomst med, når samleveren er pensionist", async () => {
    renderPension();
    setSamliv("samlevende");
    fireEvent.click(screen.getByRole("checkbox"));
    setIndkomst(SAMLEVER_INDKOMST, "200000");

    await waitFor(() => {
      expect(
        screen.getByText(/Tillægget sættes ned med 16 % af indkomsten over 198\.800\skr\./),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText(/kun 46 % af din samlevers indkomst/)).not.toBeInTheDocument();
    // 4.467 - 1.200 x 0,16 = 4.275 kr. i tillæg, 7.544 + 4.275 = 11.819 kr.
    expect(folkepensionTotal()).toMatch(/11\.819\skr\./);
  });

  test("deler samlivsstatus og indkomst i delelinket", async () => {    renderPension();
    await waitFor(() => {
      expect(folkepensionTotal()).toMatch(/16\.273\skr\./);
    });

    setSamliv("samlevende");
    setIndkomst(EGEN_INDKOMST, "120000");
    setIndkomst(SAMLEVER_INDKOMST, "30000");

    fireEvent.click(await screen.findByRole("button", { name: "Del beregning" }));
    const shareInput = (await screen.findByLabelText("Link til beregning")) as HTMLInputElement;
    const encoded = new URL(shareInput.value).searchParams.get("s");
    expect(decodeCalculationState(encoded ?? "")).toMatchObject({
      type: "pension",
      inputs: {
        samliv: "samlevende",
        samleverErPensionist: false,
        aarligIndkomst: 120000,
        aarligSamleverIndkomst: 30000,
      },
    });
  });
});
