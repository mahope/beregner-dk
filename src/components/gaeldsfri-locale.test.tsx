/**
 * `/gaeldsfri` skrev **dansk** i den tekst brugeren deler — fundet under C71
 * (opgave 99) som den eneste *synlige* danske streng i de fire domæner,
 * `scripts/locale-leak.mjs` meldte.
 *
 * 1. `calculatorName="Gældsfri Beregner"` lå i JSX, ikke i `labels`. Det er
 *    den streng der går ind i del-linket: `ShareCalculation.tsx:191-197` bygger
 *    `shareText`, Twitter-`href` og mail-`subject` af den. `/gaeldsfri` er
 *    **ikke** `daOnly` (`calculator-list.ts:96` — titlen er "Skuldfri" på
 *    beraknare.se), så en svensk læser delte et dansk værktøjsnavn.
 * 2. `` `Gæld ${p.id}` `` var fallback-navnet på en tom gældspost. Det er
 *    rettet for samme grund, men det står i `result.aktive`, som kun bruges
 *    internt i simuleringen — så det er forebyggende, ikke synligt i dag.
 *
 * De tre andre domæner i opgave 99 viste sig at være **døde** strenge: de tre
 * `src/components/energi/`-komponenter monteres kun inden for `live`, og
 * `live` er `locale === "da" ? elprisData : null` i både `Elberegner.tsx:76`
 * og `ElbilBenzinBeregner.tsx:79` (og `erDa` i `SolcelleBeregner.tsx:447`).
 * Se planen.
 */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import GaeldsfriBeregner from "./GaeldsfriBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

// Se C63/C64: jsdom mangler `document.execCommand`, som `CopyResultButton`s
// fallback bruger. Uden stubben giver den uhandlede rejections, og filen
// exited 1 selv om alle tests var grønne.
Object.defineProperty(document, "execCommand", {
  value: () => true,
  configurable: true,
  writable: true,
});

const domainConfig = getDomainConfig("localhost");

function renderIn(locale: Locale) {
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <GaeldsfriBeregner />
    </LocaleProvider>,
  );
}

/**
 * Del-dialogens tekst. Den er ikke bare kosmetik: den er `shareText`, som
 * `ShareCalculation.tsx:191` også lægger i Twitter-`href` og mail-`subject`,
 * så den skriver sig ud af sitet med navnet på.
 */
async function aabnDelDialogen(): Promise<HTMLElement> {
  fireEvent.click(screen.getByRole("button", { name: /del/i }));
  return screen.findByRole("dialog");
}

/** Twitter-linkets `href` — beviset på at strengen faktisk forlader siden. */
async function twitterHref(): Promise<string> {
  const link = await waitFor(() => {
    const a = document.querySelector<HTMLAnchorElement>('a[href*="twitter.com"]');
    if (!a) throw new Error("Twitter-link ikke fundet i del-dialogen");
    return a;
  });
  return decodeURIComponent(link.href);
}

afterEach(cleanup);

describe("GaeldsfriBeregner — delt tekst pr. domæne", () => {
  test("da-domænet deler dansk værktøjsnavn", async () => {
    renderIn("da");
    await aabnDelDialogen();
    expect(await twitterHref()).toContain("Gældsfri Beregner");
  });

  test("se-domænet deler svensk værktøjsnavn", async () => {
    renderIn("se");
    await aabnDelDialogen();
    const href = await twitterHref();
    expect(href).toContain("Skuldfri beräknare");
    expect(href).not.toContain("Gæld");
  });

  test("no-domænet deler norsk værktøjsnavn", async () => {
    renderIn("no");
    await aabnDelDialogen();
    const href = await twitterHref();
    expect(href).toContain("Gjeldfri-kalkulator");
    expect(href).not.toContain("Gæld");
  });

  test("Mail-`subject` på beraknare.se er svensk — den skrives også ud af sitet", async () => {
    renderIn("se");
    await aabnDelDialogen();
    const mail = await waitFor(() => {
      const a = document.querySelector<HTMLAnchorElement>('a[href^="mailto:"]');
      if (!a) throw new Error("Mail-link ikke fundet i del-dialogen");
      return a;
    });
    expect(decodeURIComponent(mail.href)).toContain("Skuldfri beräknare");
    expect(decodeURIComponent(mail.href)).not.toContain("Gæld");
  });

  test("Ingen danske gældsposter-navne i nogen af de tre locales", () => {
    for (const locale of ["da", "se", "no"] as Locale[]) {
      const { container, unmount } = renderIn(locale);
      expect(container.textContent ?? "").not.toMatch(/Gæld \d/);
      unmount();
    }
  });
});
