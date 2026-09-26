import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import MomsBeregner from "./MomsBeregner";
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

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderMoms(locale: "da" | "se") {
  const domainConfig = locale === "se" ? seDomain : daDomain;

  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <MomsBeregner />
    </LocaleProvider>,
  );
}

function getInfoItem(text: string) {
  return screen.getByText((_, element) => element?.tagName === "LI" && element.textContent?.includes(text) === true);
}

function getResultText(container: HTMLElement) {
  return Array.from(container.querySelectorAll(".text-2xl"))
    .map((element) => element.textContent)
    .join(" ")
    .replace(/\u00a0/g, " ");
}

describe("MomsBeregner", () => {
  let clipboardWrite: ReturnType<typeof vi.fn>;

  /** Intl sætter et kernende mellemrum i beløb — samme normalisering som getResultText. */
  function sidsteKopieredeTekst(): string {
    return String(clipboardWrite.mock.calls[0]?.[0] ?? "").replace(/\u00a0/g, " ");
  }

  beforeEach(() => {
    window.history.replaceState({}, "", "/moms");
    clipboardWrite = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("kopierer en tekst der indeholder momsen som tal", async () => {
    // Den gamle separator læst "1.000,00 kr. + moms = 1.250,00 kr." — momsen
    // var en etiket uden et tal, så det kopierede resultat ikke lod sig regne på.
    renderMoms("da");

    const kopier = screen.getByRole("button", { name: "Kopiér resultat" });
    fireEvent.click(kopier);

    expect(sidsteKopieredeTekst()).toBe("1.000,00 kr. uden moms + 250,00 kr. moms (25 %) = 1.250,00 kr. inkl. moms");
  });

  test("find-modes opsummering svarer på andelen, ikke på en differens", async () => {
    renderMoms("da");

    fireEvent.click(screen.getByRole("button", { name: /Find moms/ }));
    fireEvent.change(screen.getByLabelText("Beløb inkl. moms"), { target: { value: 1250 } });
    fireEvent.click(screen.getByRole("button", { name: "Kopiér resultat" }));

    expect(sidsteKopieredeTekst()).toBe("Moms i 1.250,00 kr. er 250,00 kr. (20 % af beløbet)");
  });

  test("svensk opsummering følger den sats, brugeren valgte", async () => {
    renderMoms("se");

    fireEvent.click(screen.getByRole("button", { name: /^6%/ }));
    fireEvent.click(screen.getByRole("button", { name: "Kopiera resultat" }));

    expect(sidsteKopieredeTekst()).toBe("1 000,00 kr utan moms + 60,00 kr moms (6 %) = 1 060,00 kr inkl. moms");
  });

  test.each([
    { rate: 25, factor: "1,25", share: "20 %", moms: "250,00 kr", total: "1 250,00 kr" },
    { rate: 12, factor: "1,12", share: "10,71 %", moms: "120,00 kr", total: "1 120,00 kr" },
    { rate: 6, factor: "1,06", share: "5,66 %", moms: "60,00 kr", total: "1 060,00 kr" },
  ])("viser $rate % i beregning, reference og formler", async ({ rate, factor, share, moms, total }) => {
    const { container } = renderMoms("se");

    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${rate}%`) }));

    await waitFor(() => {
      expect(screen.getByText(`Moms (${rate}%)`)).toBeVisible();
    });
    expect(screen.getByRole("button", { name: new RegExp(`^${rate}%`) })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /Lägg till moms/ })).toHaveAttribute("aria-pressed", "true");
    expect(getInfoItem(`Den valda momssatsen är ${rate} %`)).toBeVisible();
    expect(getInfoItem(`För att beräkna pris inkl. moms: Belopp × ${factor}`)).toBeInTheDocument();
    expect(getInfoItem(`För att hitta pris utan moms: Belopp ÷ ${factor}`)).toBeInTheDocument();
    expect(getInfoItem(`Momsandelen av ett pris inkl. moms är ${share}`)).toBeInTheDocument();
    expect(screen.getByText(`Pris inkl. moms = Pris utan moms × ${factor}`)).toBeInTheDocument();
    expect(screen.getByText(`Pris utan moms = Pris inkl. moms ÷ ${factor}`)).toBeInTheDocument();
    expect(screen.getByText(`Moms = Pris inkl. moms - (Pris inkl. moms ÷ ${factor})`)).toBeInTheDocument();

    const referenceRow = screen.getAllByRole("row").find((row) => row.textContent?.includes("1") && row.textContent?.includes("000,00"));
    expect(referenceRow).toBeDefined();
    expect(referenceRow).toHaveTextContent(moms);
    expect(referenceRow).toHaveTextContent(total);

    await waitFor(() => {
      const resultText = getResultText(container);
      expect(resultText).toContain(moms);
      expect(resultText).toContain(total);
    }, { timeout: 3000 });
  });

  test("beholder dansk URL-state på 25 %", async () => {
    const encoded = encodeCalculationState({
      type: "moms",
      inputs: { beloeb: 1000, beregningsType: "tillaegMoms", momssats: 12 },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/moms?s=${encoded}`);

    renderMoms("da");

    await waitFor(() => {
      expect(screen.getByText("Moms (25%)")).toBeInTheDocument();
    });
    expect(screen.queryByText("Moms (12%)")).not.toBeInTheDocument();
    expect(getInfoItem("For at beregne pris inkl. moms: Beløb × 1,25")).toBeInTheDocument();
  });

  test.each([12, 6])("deler svensk URL-state ved % %", async (rate) => {
    renderMoms("se");

    fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${rate}%`) }));
    fireEvent.click(screen.getByRole("button", { name: "Dela beräkning" }));

    const shareInput = screen.getByLabelText("Länk till beräkning") as HTMLInputElement;
    await waitFor(() => {
      expect(shareInput.value).toContain("/moms?s=");
    });
    const shareUrl = shareInput.value;
    const sharedState = decodeCalculationState(new URL(shareUrl).searchParams.get("s") ?? "");

    expect(sharedState?.inputs).toMatchObject({
      beloeb: 1000,
      beregningsType: "tillaegMoms",
      momssats: rate,
    });
  });

  test("beregner fratrækning med reduceret sats", async () => {
    const { container } = renderMoms("se");

    fireEvent.click(screen.getByRole("button", { name: /^12%/ }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^12%/ })).toHaveAttribute("aria-pressed", "true");
    });
    fireEvent.click(screen.getByRole("button", { name: /Dra av moms/ }));
    fireEvent.change(screen.getByLabelText("Belopp inkl. moms"), { target: { value: 1120 } });

    await waitFor(() => {
      const resultText = getResultText(container);
      expect(resultText).toContain("1 000,00 kr");
      expect(resultText).toContain("120,00 kr");
      expect(resultText).toContain("1 120,00 kr");
    }, { timeout: 3000 });
  });

  test.each([
    { rate: 25, factor: "1,25", base: "987,65", moms: "246,91" },
    { rate: 12, factor: "1,12", base: "1 102,29", moms: "132,27" },
    { rate: 6, factor: "1,06", base: "1 164,68", moms: "69,88" },
  ])("indlæser og genskaber svensk URL-state ved $rate %", async ({ rate, factor, base, moms }) => {
    const encoded = encodeCalculationState({
      type: "moms",
      inputs: { beloeb: 1234.56, beregningsType: "fratraekMoms", momssats: rate },
      timestamp: 1700000000000,
    });
    window.history.replaceState({}, "", `/moms?s=${encoded}`);

    const firstRender = renderMoms("se");

    await waitFor(() => {
      expect(screen.getByText(`Moms (${rate}%)`)).toBeVisible();
    });
    expect(screen.getByLabelText("Belopp inkl. moms")).toHaveValue(1234.56);
    expect(screen.getByRole("button", { name: /Dra av moms/ })).toHaveAttribute("aria-pressed", "true");
    expect(getInfoItem(`För att beräkna pris inkl. moms: Belopp × ${factor}`)).toBeVisible();
    await waitFor(() => {
      const resultText = getResultText(firstRender.container);
      expect(resultText).toContain(base);
      expect(resultText).toContain(moms);
      expect(resultText).toContain("1 234,56 kr");
    }, { timeout: 3000 });
    firstRender.unmount();

    renderMoms("se");

    await waitFor(() => {
      expect(screen.getByText(`Moms (${rate}%)`)).toBeVisible();
    });
    expect(screen.getByLabelText("Belopp inkl. moms")).toHaveValue(1234.56);
    expect(screen.getByRole("button", { name: /Dra av moms/ })).toHaveAttribute("aria-pressed", "true");
  });
});
