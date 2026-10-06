/**
 * Værktøjet læser den tekst, brugeren kopierer og deler — ikke bare tallene på
 * skærmen. Tidszonen låses til Danmark, fordi portene skal kunne fejle i det
 * vindue, hvor serverens UTC-dato og sidens danske dato er forskellige: mellem
 * kl. 00.00 og 02.00 dansk tid er UTC-dagen *i går*. Det er præcis det
 * vindue, hvor `toUtcMidnight` i `dage-til.ts` gav alle nedtællinger én dag
 * forkerte (punkt 4 i kvalitetsreglerne).
 */
process.env.TZ = "Europe/Copenhagen";

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import UgedagBeregner from "./UgedagBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderUgedag(locale: "da" | "se", iso?: string) {
  const domainConfig = locale === "se" ? seDomain : daDomain;
  const rendered = render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <UgedagBeregner />
    </LocaleProvider>,
  );
  if (iso) {
    const felt = rendered.container.querySelector<HTMLInputElement>('input[type="date"]')!;
    fireEvent.change(felt, { target: { value: iso } });
  }
  return rendered;
}

afterEach(cleanup);

describe("ugedagsværktøjet", () => {
  test("en fødselsdato giver præcis den ugedag, kalenderen siger", () => {
    // 15. marts 1990 var en torsdag. Det er den færdige port fra
    // `ugedagResultat`, og den må ikke kunne glide fra brødteksten på siden.
    renderUgedag("da", "1990-03-15");
    expect(screen.getByText("Torsdag")).toBeTruthy();
    expect(screen.getByText("15. marts 1990")).toBeTruthy();
  });

  // Ugedagen er hele sidens hensigt, så den skal læses på hvert af de syv
  // ugedage — ikke bare på den ene, porten tilfældigvis valgte. Mutation af
  // rækken → 6 røde.
  test("alle syv ugedage læses rigtigt forskelligt", () => {
    // 2026-11-02 = mandag … 2026-11-08 = søndag.
    const forventet = [
      ["2026-11-02", "Mandag"],
      ["2026-11-03", "Tirsdag"],
      ["2026-11-04", "Onsdag"],
      ["2026-11-05", "Torsdag"],
      ["2026-11-06", "Fredag"],
      ["2026-11-07", "Lørdag"],
      ["2026-11-08", "Søndag"],
    ];
    for (const [iso, navn] of forventet) {
      const { container, unmount } = renderUgedag("da", iso);
      // Svaret står i overskriften (`<p class="text-3xl">`) og igen i kalenderrækkens
      // `sr-only`-tekst. Begge skal være præcis den ugedag, kalenderen siger — og ingen
      // af dem må være en *anden* ugedag fra listen.
      const overskrift = container.querySelector("p.text-3xl")!.textContent?.trim();
      expect(overskrift).toBe(navn);
      const srOnly = Array.from(container.querySelectorAll("span.sr-only")).map((n) =>
        n.textContent?.trim().split(" ")[0],
      );
      // Rækken indeholder alle syv ugedage; den valgte skal være den rigtige her.
      expect(srOnly).toHaveLength(7);
      expect(srOnly).toContain(navn);
      unmount();
    }
  });

  test("svensk udgave skriver sine egne ugedage", () => {
    // "Lördag"/"Söndag" staves med ö, "Lørdag"/"Søndag" med ø, og mandag er
    // "Måndag" på svensk mod "Mandag" på dansk. Mutation: gør `se` til dansk
    // → rød på alle tre.
    for (const [iso, navn] of [
      ["2026-11-07", "Lördag"],
      ["2026-11-08", "Söndag"],
      ["2026-11-02", "Måndag"],
      ["2026-11-03", "Tisdag"],
    ] as const) {
      const { container, unmount } = renderUgedag("se", iso);
      expect(container.querySelector("p.text-3xl")!.textContent?.trim()).toBe(navn);
      unmount();
    }
  });

  test("ISO-ugenummeret vises, og det er ikke kalenderens ugetal", () => {
    // 31. december 2026 er en torsdag i **uge 53** — den højeste uge et år kan
    // have. Mutation af ISO-formlen til "den uge der indeholder 1. januar"
    // giver 52 her.
    renderUgedag("da", "2026-12-31");
    expect(screen.getByText("Torsdag")).toBeTruthy();
    expect(screen.getByText("53")).toBeTruthy();
  });

  test("kalenderrækken viser hele ugen og markerer den valgte dag", () => {
    const { container } = renderUgedag("da", "2026-11-04"); // en onsdag
    const valgt = container.querySelector('[aria-current="date"]');
    expect(valgt).toBeTruthy();
    expect(valgt?.querySelector("span:last-child")?.textContent).toBe("4");
    // Ugens syv dage: 2.–8. november.
    for (const dag of ["2", "3", "4", "5", "6", "7", "8"]) {
      expect(container.textContent).toContain(dag);
    }
  });

  test("kalenderrækken bruger korte ugedagsnavne i hvert sprog", () => {
    // Rækken begynder på mandag, som i ISO — så overskrifterne er Ma, Ti, On,
    // To, Fr, Lø, Sø. Mutation af `ugedagsnavnKort` til `getDay()`-rækkens
    // rækkefølge sætter Sø først.
    const { container } = renderUgedag("da", "2026-11-04");
    const korte = Array.from(container.querySelectorAll("span.uppercase")).map(
      (n) => n.textContent?.trim(),
    );
    expect(korte).toEqual(["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"]);
    cleanup();
    const svensk = renderUgedag("se", "2026-11-04");
    expect(
      Array.from(svensk.container.querySelectorAll("span.uppercase")).map((n) => n.textContent?.trim()),
    ).toEqual(["Må", "Ti", "On", "To", "Fr", "Lö", "Sö"]);
  });

  test("dagens dato kommer ind som prop, og 'i dag' sætter den", () => {
    // Punktet er **ikke** at værktøjet selv regner dagen — det er siden, der
    // gør det i sidens tidszone og sender den ned. Uden prop'en er den
    // server-renderede HTML tom (punkt 1), og `ugedag-side.test.tsx` dømmer
    // netop det. Her dømmes, at værktøjet bruger den og at knappen genskaber
    // den: en bruger, der har ændret datoen, skal kunne komme tilbage.
    const forudindstillet = "2026-03-30"; // en mandag
    const { container } = renderUgedag("da", forudindstillet);
    expect(container.querySelector<HTMLInputElement>('input[type="date"]')!.value).toBe(
      forudindstillet,
    );
    fireEvent.click(screen.getByRole("button", { name: /i dag/i }));
    // 6/10 er en tirsdag, så den skal skille sig fra den mandag vi startede med.
    expect(container.querySelector<HTMLInputElement>('input[type="date"]')!.value).not.toBe(
      forudindstillet,
    );
  });

  test("'i dag'-knappen bruger sidens tidszone, ikke serverens UTC", () => {
    // Sæt systemklokken til 00:30 dansk tid. I UTC er det 22:30 dagen før, så
    // `new Date()` læst råt ville give *i går* — præcis den fejl
    // `toUtcMidnight` havde, og den fejl der gjorde alle nedtællinger i
    // `dage-til.ts` én dag forkerte mellem kl. 00 og 02. 30. marts 2026 var en
    // mandag.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-29T23:30:00Z")); // 00:30 CEST 30/3
    const dansk = renderUgedag("da");
    fireEvent.click(screen.getByRole("button", { name: /i dag/i }));
    expect(dansk.container.querySelector<HTMLInputElement>('input[type="date"]')!.value).toBe(
      "2026-03-30",
    );
    dansk.unmount();
    // 00:30 svensk tid er 22:30 UTC dagen før — samme forskydning.
    const svensk = renderUgedag("se");
    fireEvent.click(screen.getByRole("button", { name: /i dag/i }));
    expect(svensk.container.querySelector<HTMLInputElement>('input[type="date"]')!.value).toBe(
      "2026-03-30",
    );
    svensk.unmount();
    vi.useRealTimers();
  });

  test("knappen 'i dag' sætter dagens dato efter en manuel ændring", () => {
    const { container } = renderUgedag("da", "1990-03-15");
    const felt = container.querySelector<HTMLInputElement>('input[type="date"]')!;
    expect(felt.value).toBe("1990-03-15");
    const knap = screen.getByRole("button", { name: /i dag/i });
    fireEvent.click(knap);
    expect(felt.value).not.toBe("1990-03-15");
  });

  test("et felt der tømmes viser en venlig besked, ikke et NaN", () => {
    const { container } = renderUgedag("da", "2026-11-04");
    const felt = container.querySelector<HTMLInputElement>('input[type="date"]')!;
    fireEvent.change(felt, { target: { value: "" } });
    expect(screen.getByText(/vælg en gyldig dato/i)).toBeTruthy();
    expect(container.textContent).not.toContain("NaN");
    expect(container.textContent).not.toContain("undefined");
  });

  test("datofeltet har en label, der er bundet til feltet", () => {
    // `htmlFor`/`id`-parret er det, der gør feltet findbart for en skærmlæser
    // — en `<label>` uden `htmlFor` er usynlig for den, uanset hvor tydelig den
    // ser ud.
    const dansk = renderUgedag("da");
    const label = dansk.container.querySelector('label[for="ugedag-dato"]')!;
    expect(label.textContent?.trim()).toBe("Dato");
    expect(dansk.container.querySelector("#ugedag-dato")).toBeTruthy();
    dansk.unmount();
    const svensk = renderUgedag("se");
    expect(
      svensk.container.querySelector('label[for="ugedag-dato"]')!.textContent?.trim(),
    ).toBe("Datum");
    svensk.unmount();
  });

  test("alle trykbare flader er mindst 44 px høje", () => {
    // Designreglen: 44×44 px som minimum, målt på den faktiske værdi i klasserne.
    const { container } = renderUgedag("da");
    for (const knap of container.querySelectorAll("button")) {
      expect(knap.className).toMatch(/min-h-\[44px\]/);
    }
    const felt = container.querySelector<HTMLInputElement>('input[type="date"]')!;
    expect(felt.className).toMatch(/min-h-\[44px\]/);
  });
});
