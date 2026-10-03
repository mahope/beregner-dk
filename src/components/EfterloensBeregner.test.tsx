/**
 * Efterlønsberegneren skrev præmieportionen, timerprisen og udskydelsestimerne
 * håndskrevet i sin brødtekst, selv om `SKATTEFRI_PRAEMIE_2026` lå i modulet og
 * drev selve beregningen — samme fejlklasse som `/rentefradrag`s håndskrevne
 * «Eksempel». Beløbene er nu interpolationer, og denne test dømmer på den
 * **renderede** tekst: den læser talene fra modulet og kræver, at de står med
 * rigtige mellemrum omkring. JSX spiser et linjeskift lige efter et `}`, så
 * «(10.580 kr.» på én linje og «kr. for deltidsforsikrede» på den næste ville
 * renderes som «10.580kr. for deltidsforsikrede» uden en `{" "}` — det kan
 * hverken `tsc`, lint eller build se.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import EfterloensBeregner from "./EfterloensBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { EFTERLOEN_MAX_SATS, SKATTEFRI_PRAEMIE_2026 } from "@/lib/efterloen";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const num = (v: number) => v.toLocaleString("da-DK");
const full = num(SKATTEFRI_PRAEMIE_2026.portion.full);
const part = num(SKATTEFRI_PRAEMIE_2026.portion.part);

afterEach(cleanup);

const visBeregner = () =>
  render(
    <LocaleProvider locale="da" domainConfig={getDomainConfig("localhost")}>
      <EfterloensBeregner />
    </LocaleProvider>
  );

describe("EfterloensBeregner", () => {
  test("præmieordningen læser portion, timer og loft fra modulet", () => {
    visBeregner();
    const guide = screen.getByText(/skattefri præmieportion/);
    expect(guide.textContent).toContain(`${full} kr.`);
    expect(guide.textContent).toContain(`${part} kr. for deltidsforsikrede`);
    expect(guide.textContent).toContain(`${SKATTEFRI_PRAEMIE_2026.timerPerPortion} arbejdstimer`);
    expect(guide.textContent).toContain(`højst optjene ${SKATTEFRI_PRAEMIE_2026.maxPortioner} portioner`);
  });

  test("den viste månedsats er den, siden og FAQ'en lover", () => {
    // De to tal lå hårdkodet her i komponenten (`MAX_EFTERLOEN_91 = 20057`) og
    // endnu en gang i sidens metadata og FAQ. Nu læser begge steder
    // `EFTERLOEN_MAX_SATS`, så beregnerens resultat og søgeresultatets løfte
    // ikke kan glide fra hinanden. Standardvalget er fuldtid uden udskydelse.
    visBeregner();
    const resultat = screen.getByText("Månedlig efterløn").parentElement!;
    expect(resultat.textContent).toContain(
      `${num(EFTERLOEN_MAX_SATS.udenUdskydelse)} kr.`,
    );
  });

  test("timerfeltets forklaring læser de tre tal fra modulet", () => {
    visBeregner();
    fireEvent.click(screen.getByLabelText("Jeg vil arbejde ved siden af"));
    const forklaring = screen.getByText(/Hver \d+ timer giver/);
    expect(forklaring.textContent).toContain(`${full} kr.`);
    expect(forklaring.textContent).toContain(`${part} kr. for deltidsforsikrede`);
    expect(forklaring.textContent).toContain(
      `de ${num(SKATTEFRI_PRAEMIE_2026.udskydelseTimer.full)} timer borger.dk kræver`
    );
    // Feltet er forudfyldt med ét års timers i den toårige udskydelse.
    const felt = screen.getByLabelText("Forventede arbejdstimer pr. år") as HTMLInputElement;
    expect(felt.value).toBe(
      String(SKATTEFRI_PRAEMIE_2026.udskydelseTimer.full / SKATTEFRI_PRAEMIE_2026.udskydelseAar)
    );
  });
});
