/**
 * PromilleBeregner-hæftet læser den tekst, brugeren kopierer og deler — ikke
 * bare tallene på skærmen — og låser de to tilstande, hvor værktøjet før
 * svarede med en tilladelse, det ikke må give: et felt brugeren ikke har
 * tastet færdig, og en promille der står præcis på lovens grænse.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import PromilleBeregner from "./PromilleBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const seDomain = getDomainConfig("beraknare.se");

function renderPromille(locale: "da" | "se") {
  return render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfig("localhost")}>
      <PromilleBeregner />
    </LocaleProvider>,
  );
}

/** Inputfelterne står som søskende til deres label, uden htmlFor: 0 = genstande, 1 = vægt, 2 = timer. */
function felt(container: HTMLElement, nr: number): HTMLInputElement {
  return container.querySelectorAll<HTMLInputElement>('input[type="number"]')[nr];
}

function saet(container: HTMLElement, genstande: string, vaegt: string, timer: string, kvinde = false) {
  fireEvent.change(felt(container, 0), { target: { value: genstande } });
  fireEvent.change(felt(container, 1), { target: { value: vaegt } });
  fireEvent.change(felt(container, 2), { target: { value: timer } });
  if (kvinde) fireEvent.click(screen.getByRole("button", { name: "Kvinde" }));
}

async function kopiérTekst(): Promise<string> {
  await fireEvent.click(screen.getByRole("button", { name: /kopi.*resultat/i }));
  return navigator.clipboard.readText();
}

/** Del-dialogen er en modal, så strengen skal læses i Twitter-linkets `href` (C57's lærepådom). */
async function delTekst(): Promise<string> {
  await fireEvent.click(screen.getByRole("button", { name: /del(a)? (beregning|beräkning)/i }));
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('a[href^="https://twitter.com/intent/tweet"]'),
  );
  const href = links[0]?.getAttribute("href") ?? "";
  return new URL(href).searchParams.get("text") ?? "";
}

describe("PromilleBeregner", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined), readText: vi.fn().mockResolvedValue("") },
    });
  });

  afterEach(() => cleanup());

  test("et felt brugeren ikke har tastet færdig må ikke svare 'du er under grænsen'", () => {
    const { container } = renderPromille("da");
    saet(container, "", "75", "2");
    // Før la mayDrive være sand, når resultatet var null: et grønt kort med
    // "Du er under grænsen på 0,5 ‰" — en tilladelse til at køre bil, der
    // kom fra et tomt felt.
    expect(screen.queryByText(/under grænsen på/i)).toBeNull();
    expect(screen.getByText(/kan promillen ikke beregnes/i)).toBeInTheDocument();
    expect(container.textContent).not.toContain("0,00 ‰");
  });

  test("samme tomme felt giver hverken en grøn eller en rød konklusion", () => {
    const { container } = renderPromille("da");
    saet(container, "3", "0", "2");
    expect(screen.queryByText(/under grænsen på/i)).toBeNull();
    expect(screen.queryByText(/over grænsen på/i)).toBeNull();
    expect(container.textContent).not.toContain("‰");
  });

  test("promille præcis på grænsen siger 'på grænsen', ikke 'over grænsen'", () => {
    // 1 genstand, 44 kg, kvinde: 12 / (0,55 × 44) = 0,4959 → 0,50 = dansk
    // grænse. Loven siger, at det er ulovligt at køre *over* 0,5 ‰ — og
    // /promilles egen brødtekst siger det samme. Før sagde værktøjet
    // "Du er over grænsen på 0,5 ‰", altså noget siderne modsagde.
    const { container } = renderPromille("da");
    saet(container, "1", "44", "0", true);
    expect(screen.getByText("0,50 ‰")).toBeInTheDocument();
    expect(screen.getByText(/præcis på grænsen/i)).toBeInTheDocument();
    expect(screen.queryByText(/over grænsen på/i)).toBeNull();
    // Og "under grænsen om 0 timer" var en invitation til at køre nu.
    expect(container.textContent).toContain("Under grænsen om 0,5 ‰");
    expect(container.textContent).toContain("— timer");
  });

  test("over grænsen siger stadig 'over grænsen'", () => {
    const { container } = renderPromille("da");
    saet(container, "6", "70", "0");
    expect(screen.getByText(/over grænsen på 0,5 ‰/i)).toBeInTheDocument();
  });

  test("den delte tekst har de fire input, promillen og grænsen", async () => {
    const { container } = renderPromille("da");
    saet(container, "3", "75", "2");
    (navigator.clipboard.readText as ReturnType<typeof vi.fn>).mockResolvedValue("");
    await fireEvent.click(screen.getByRole("button", { name: /kopi.*resultat/i }));
    // Knappen viser ikke strengen, så den læses fra det, den fik.
    const skrevet = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(skrevet).toContain("3 genstande");
    expect(skrevet).toContain("75 kg");
    expect(skrevet).toContain("Mand");
    expect(skrevet).toContain("2 timer siden");
    expect(skrevet).toContain("0,41 ‰");
    expect(skrevet).toContain("under grænsen på 0,5 ‰");
    // Før var strengen "Din anslåede promille: 0,66 ‰" — ét tal uden de fire
    // tal, det afhænger af, i et værktøj der handler om, må man køre bil.
    expect(skrevet).not.toBe("Din anslåede promille: 0,41 ‰");
    expect(container).toBeInTheDocument();
  });

  test("Kopiér og Del siger præcis det samme", async () => {
    const { container } = renderPromille("da");
    saet(container, "4", "80", "0");
    await fireEvent.click(screen.getByRole("button", { name: /kopi.*resultat/i }));
    const kopieret = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    const delt = await delTekst();
    // ShareCalculation sætter værktøjets navn foran, så strengen skal være
    // den samme bag præfikset — C57's lærepådom.
    expect(delt).toBe(`Promilleberegner: ${kopieret}`);
    expect(kopieret).toContain("4 genstande");
  });

  test("den svenske delte tekst er svensk og bruger den svenske grænse", async () => {
    const { container } = renderPromille("se");
    saet(container, "3", "75", "2");
    await fireEvent.click(screen.getByRole("button", { name: /kopi.*resultat/i }));
    const skrevet = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(skrevet).toContain("3 standardglas");
    expect(skrevet).toContain("75 kg");
    expect(skrevet).toContain("2 timmar sedan");
    expect(skrevet).toContain("över gränsen på 0,2 ‰");
    expect(container).toBeInTheDocument();
  });

  test("tallet i den delte tekst er formateret med komma, ikke punktum", async () => {
    const { container } = renderPromille("da");
    saet(container, "4", "80", "0");
    await fireEvent.click(screen.getByRole("button", { name: /kopi.*resultat/i }));
    const skrevet = (navigator.clipboard.writeText as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string;
    expect(skrevet).toContain("0,88 ‰");
    expect(skrevet).not.toMatch(/0\.88/);
  });
});

void seDomain;
