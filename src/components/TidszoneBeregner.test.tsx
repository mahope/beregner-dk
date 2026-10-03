/**
 * `/tidszone` er den fjerdestørste side i Search Console (24.723 visninger) og
 * GSC's søgning "hvad er klokken i usa når den er 12 i danmark" (183 visninger,
 * pos. 6) er præcis den konvertering, Kopier og Del skriver ud. Tidszonen er
 * låst til Danmark, fordi både sommertidsreglen og datoen i den delte tekst er
 * læst i læserens egen tid — på en maskine med UTC-tid ville fejlen ellers kun
 * kunne fejle halvdelen af året.
 */
process.env.TZ = "Europe/Copenhagen";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import TidszoneBeregner, { TIDSZONER_BEREGNER } from "./TidszoneBeregner";
import { LocaleProvider } from "./LocaleProvider";
import { getDomainConfig } from "@/lib/domain-config";
import { TIDSZONER } from "@/lib/tidszone-reference";
import { utcOffsetMinutter } from "@/lib/sommertid";

/**
 * Danmarks egen UTC-interval. Samme to tal som `TidszoneBeregner.tsx:42-43`
 * (`HJEM_VINTER`/`HJEM_SOMMER`), som ikke er eksporterede. De står her, fordi
 * porten skal regne forventningen selv — se testen «sommer- og vinterværdien»
 * for hvorfor et håndskrevet tidszonetal går rødt to gange om året.
 */
const HJEM_VINTER = 60;
const HJEM_SOMMER = 120;

vi.mock("@/lib/analytics", () => ({
  trackCalculation: vi.fn(),
  initScrollDepthTracking: vi.fn(() => () => {}),
  trackShare: vi.fn(),
  trackResultCopied: vi.fn(),
  trackAffiliateClick: vi.fn(),
}));

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderTidszone(locale: "da" | "se") {
  const domainConfig = locale === "se" ? seDomain : daDomain;

  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      <TidszoneBeregner />
    </LocaleProvider>,
  );
}

function selectOptions(container: HTMLElement) {
  return Array.from(container.querySelectorAll("select"))
    .flatMap((select) => Array.from(select.querySelectorAll("option")).map((option) => option.textContent ?? ""));
}

describe("TidszoneBeregner", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/tidszone");
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test("forankrer hjemtidszonen i Danmark på dansk", () => {
    const { container } = renderTidszone("da");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("København");
    expect(screen.getByRole("heading", { name: "Tidsforskel fra Danmark" })).toBeVisible();
    expect(tekst).not.toContain("Sverige");
    expect(selectOptions(container)).toContain("København - Danmark (CET/CEST)");
  });

  test("forankrer hjemtidszonen i Sverige på svensk", () => {
    const { container } = renderTidszone("se");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("Stockholm");
    expect(screen.getByRole("heading", { name: "Tidsskillnad från Sverige" })).toBeVisible();
    expect(tekst).toContain("Sverige byter till sommartid");
    expect(tekst).not.toContain("Köpenhamn");
    expect(tekst).not.toContain("från Danmark");
    expect(selectOptions(container)).toContain("Stockholm - Sverige (CET/CEST)");
  });

  test("beholder delte links med fraTidszone=dk gyldige i begge locales", () => {
    const dansk = renderTidszone("da");
    const svensk = renderTidszone("se");

    for (const { container } of [dansk, svensk]) {
      const fraZone = container.querySelector("select") as HTMLSelectElement;
      expect(fraZone.value).toBe("dk");
      expect(fraZone.options[0].textContent).toMatch(/Danmark \(CET\/CEST\)|Sverige \(CET\/CEST\)/);
    }
  });

  test("regner tidsforskellen fra hjemtidszonen, uanset locale", () => {
    for (const [locale, forventet] of [
      ["da", "New York er 6 timer bagud København"],
      ["se", "New York är 6 timmar efter Stockholm"],
    ] as const) {
      const { unmount } = renderTidszone(locale);

      // Danmark og USA skifter sommertid nogenlunde samtidig, så forskellen til
      // New York er 6 timer både sommer og vinter. Det er gjort til en test, fordi
      // det før var den vinterværdi alene, der holdt.
      expect(screen.getByText(forventet)).toBeVisible();
      unmount();
    }
  });

  test("offsettene er de samme som i reference-modulet, brødteksten læser", () => {
    // `tidszone-reference.ts` driver tabellen på /tidszone, `TidszoneBeregner`
    // driver værktøjet. De lå tidligere hver med deres egne offsettal, så et
    // brud på den ene siden ville ikke blive fanget af den anden.
    const by = (navn: string) =>
      TIDSZONER.find((zone) => zone.by === navn || zone.bySe === navn);

    for (const zone of TIDSZONER_BEREGNER) {
      const reference = by(zone.bySe ?? zone.by);
      // `dk` springes over med vilje: reference-modulet har ingen række for
      // Danmark/Sverige, fordi CET-offsetten der er dens egen udgangspunkt
      // (`DANSK_UTC_VINTER`), ikke en by den kan sammenlignes med. Før C66 lå der
      // en `.replace("København", "Danmark")` i dette opslag — den så ud til at
      // dække hjemtidszonen, men "Danmark" findes ikke i `TIDSZONER`, så den
      // gjorde intet andet end at skjule, at rækken aldrig blev tjekket.
      if (!reference) continue;
      expect(zone.offset / 60, `${zone.id} har forkert vinteroffset`).toBe(reference.utcVinter);
      expect((zone.offsetSommer ?? zone.offset) / 60, `${zone.id} har forkert sommeroffset`).toBe(
        reference.utcSommer ?? reference.utcVinter
      );
    }

    // Tællen sikrer, at krydschecket ikke bliver tomt ved en fremtidig redigering.
    const tjekkede = TIDSZONER_BEREGNER.filter((zone) => by(zone.bySe ?? zone.by));
    expect(tjekkede.length).toBeGreaterThanOrEqual(9);
  });

  test("zonenavn og by kommer fra samme række, oversat pr. locale", () => {
    // Før C66 lå de samme oplysninger to steder: et array i modulscope med danske
    // navne, og et `labels`-objekt med `navn`/`by` pr. locale, som displayen
    // brugte. Arrayet var altså halvt dødt — og en redigering der havde brugt
    // `tz.navn` ville have skrevet dansk på beraknare.se uden at nogen test så
    // det. Nu er der én række pr. zone med dansk form + `Se`-variant.
    const dansk = renderTidszone("da");
    const danskValg = selectOptions(dansk.container).join(" | ");
    dansk.unmount();

    const svensk = renderTidszone("se");
    const svenskValg = selectOptions(svensk.container).join(" | ");
    svensk.unmount();

    for (const zone of TIDSZONER_BEREGNER) {
      expect(danskValg, `${zone.id} mangler i den danske dropdown`).toContain(
        `${zone.by} - ${zone.navn}`
      );
      expect(svenskValg, `${zone.id} mangler i den svenske dropdown`).toContain(
        `${zone.bySe ?? zone.by} - ${zone.navnSe ?? zone.navn}`
      );
      // En zone med en `Se`-variant må ikke vise den danske form på beraknare.se.
      if (zone.navnSe) {
        expect(svenskValg, `${zone.id} viser stadig dansk navn på svensk`).not.toContain(
          `${zone.bySe ?? zone.by} - ${zone.navn}`
        );
      }
      if (zone.bySe) {
        expect(svenskValg, `${zone.id} viser stadig dansk by på svensk`).not.toContain(
          `${zone.by} - `
        );
      }
    }
  });

  test("kun de zoner, hvor svensk afviger, har en Se-variant", () => {
    // `labels.se` havde engang en `greece: "Aten"` — den svenske form, kopieret
    // ned i den danske. Derfor stod "Aten" i dropdown'en på minberegner.dk, mens
    // brødteksten på samme side sagde "13 i Athen". Tællen låser den konvention:
    // tilføjes der en zone, skal den have en `Se`-variant, hvis ordet afviger.
    const afvigende = TIDSZONER_BEREGNER.filter((zone) => zone.navnSe || zone.bySe);

    expect(afvigende.map((zone) => zone.id)).toEqual([
      "dk",
      "us_east",
      "us_west",
      "greece",
      "greenland",
    ]);

    for (const zone of afvigende) {
      if (zone.navnSe) expect(zone.navnSe, `${zone.id} har en Se-variant, der ikke afviger`).not.toBe(zone.navn);
      if (zone.bySe) expect(zone.bySe, `${zone.id} har en bySe, der ikke afviger`).not.toBe(zone.by);
    }
  });

  test("Athen hedder Athen på dansk, også i dropdown'en", () => {
    // Den konkrete fejl C66 fandt. `labels.se.by.greece` sagde "Aten", og den
    // værdi var kopieret ned i `labels.da.by` — så "Aten" stod i dropdown'en på
    // minberegner.dk og i huskelisten, mens brødteksten på samme side sagde
    // "13 i Athen". Dansk er Athen, svensk er Aten.
    const dansk = renderTidszone("da");
    const danskTekst = dansk.container.textContent ?? "";
    expect(selectOptions(dansk.container)).toContain("Athen - Grækenland (EET/EEST)");
    expect(danskTekst).not.toContain("Aten");
    dansk.unmount();

    const svensk = renderTidszone("se");
    expect(selectOptions(svensk.container)).toContain("Aten - Grekland (EET/EEST)");
    expect(svensk.container.textContent).not.toContain("Athen");
    svensk.unmount();
  });

  test("de byer de to tabeller deler, hedder det samme på dansk", () => {
    // Samme sammenligning som offset-krydschecket, men på navnet. Uden den kunne
    // de to tabeller kalde den samme by to ting og ingen kunne se det — C66's
    // "Aten" kom netop af, at de tre tabeller holdt hinanden oppe i stedet for
    // hinanden.
    for (const zone of TIDSZONER) {
      for (const navn of [zone.by, zone.bySe].filter(Boolean) as string[]) {
        const samme = TIDSZONER_BEREGNER.find(
          (kandidat) => kandidat.by === navn || kandidat.bySe === navn
        );
        if (!samme) continue;
        expect(samme.by, `reference-modulet kalder byen ${navn}, beregneren ${samme.by}`).toBe(zone.by);
      }
    }
  });

  test("sommer- og vinterværdien af forskellen til hjemtidszonen vises begge", () => {
    const { container } = renderTidszone("da");
    const tekst = container.textContent ?? "";

    // Sydney står på AEST om sommeren og AEDT om vinteren, så tallet bevæger sig
    // to gange om året. Kun det aktuelle tal uden vinterværdien ville være en
    // vildledende halvdel.
    //
    // **De to tal regnes herfra, de er ikke håndskrevet.** 4/10 2026 gik denne
    // test rød, fordi Sydney skiftede til AEDT netop den dag (første søndag i
    // oktober): «+8t» holdt kun fra marts til oktober. `tidszone-reference.ts`
    // siger i sin egen docblock, at Sydney ligger mellem 8 og 10, fordi de to
    // lande skifter på hver sin dato — så et fast tal i en port er et tal, der
    // går rødt to gange om året. Forventningen regnes derfor fra
    // `TIDSZONER_BEREGNER` — komponentens egen tabel i **minutter** — og
    // `erSommertid`, altså de præcis samme to kilder
    // `TidszoneBeregner.tsx:469-477` regner med. Ikke fra
    // `tidszone-reference.ts`, hvis `TIDSZONER` står i timer og derfor ville
    // give et tal 60 gange for lille.
    const nu = new Date();
    const Sydney = TIDSZONER_BEREGNER.find((z) => z.by === "Sydney");
    const Tokyo = TIDSZONER_BEREGNER.find((z) => z.by === "Tokyo");
    if (!Sydney || !Tokyo) throw new Error("Sydney eller Tokyo mangler i tabellen");
    const hjemNu = utcOffsetMinutter(HJEM_VINTER, HJEM_SOMMER, "eu", nu);
    const sydneyNu =
      (utcOffsetMinutter(Sydney.offset, Sydney.offsetSommer, Sydney.dst, nu) - hjemNu) / 60;
    const tokyoNu = (utcOffsetMinutter(Tokyo.offset, Tokyo.offsetSommer, Tokyo.dst, nu) - hjemNu) / 60;
    const vinterDato = new Date(nu.getFullYear(), 0, 15);
    const hjemVinter = utcOffsetMinutter(HJEM_VINTER, HJEM_SOMMER, "eu", vinterDato);
    const sydneyVinter =
      (utcOffsetMinutter(Sydney.offset, Sydney.offsetSommer, Sydney.dst, vinterDato) - hjemVinter) / 60;
    const tokyoVinter =
      (utcOffsetMinutter(Tokyo.offset, Tokyo.offsetSommer, Tokyo.dst, vinterDato) - hjemVinter) / 60;

    expect(tekst).toMatch(new RegExp(`Sydney\\+${sydneyNu}t \\(\\+${sydneyVinter}t om vinteren\\)`));
    expect(tekst).toMatch(new RegExp(`Tokyo\\+${tokyoNu}t \\(\\+${tokyoVinter}t om vinteren\\)`));

    // London skifter sommertid sammen med Danmark, så forskelsen er den hele
    // året og viser ingen vinterværdi.
    expect(tekst).toMatch(/London-1t(?! \()/);
    expect(tekst).toMatch(/New York-6t(?! \()/);
  });

  test("sommertidsnoten fortæller, at beregneren følger sommertiden", () => {
    const dansk = renderTidszone("da");
    expect(dansk.container.textContent).toContain("følger sommertiden for dagens dato");
    dansk.unmount();

    const svensk = renderTidszone("se");
    expect(svensk.container.textContent).toContain("följer sommartiden för dagens datum");
    svensk.unmount();
  });
});

describe("tidsforskellen og den delte tekst i TidszoneBeregner", () => {
  let clipboardWrite: ReturnType<typeof vi.fn>;

  /** Sommer i Danmark: Indien (UTC+5.30) ligger 210 minutter foran, altså 3,5 t. */
  const SOMMER = "2026-07-01T12:00:00";
  /** Vinter i Danmark: samme par ligger 270 minutter foran, altså 4,5 t. */
  const VINTER = "2026-12-01T12:00:00";

  function sidsteKopieredeTekst(): string {
    return String(clipboardWrite.mock.calls[0]?.[0] ?? "").replace(/\u00a0/g, " ");
  }

  function vælgTilTidszone(container: HTMLElement, id: string) {
    const felter = container.querySelectorAll<HTMLSelectElement>("select");
    fireEvent.change(felter[1], { target: { value: id } });
  }

  function kopierResultat() {
    fireEvent.click(screen.getByRole("button", { name: /Kopiér resultat|Kopiera resultat/ }));
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(SOMMER));
    window.history.replaceState({}, "", "/tidszone");
    clipboardWrite = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: clipboardWrite },
      configurable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  test("et brudtal skrives med komma på alle tre steder, ikke med punktum", () => {
    // Indien er den eneste zone med et brudtal (UTC+5.30). `String(3.5)` skrev
    // "3.5" med punktum i dansk tekst — i det store tal, i sætningen under det og
    // i huskelisten, som alle tre viste det samme brud på forskellige stier.
    const { container } = renderTidszone("da");
    vælgTilTidszone(container, "india");
    const tekst = container.textContent ?? "";

    expect(tekst).toContain("Mumbai er 3,5 timer foran København");
    expect(tekst).toContain("+3,5 timer");
    expect(tekst).toContain("+3,5t");
    expect(tekst).toMatch(/\+3,5t \(\+4,5t om vinteren\)/);
    expect(tekst).not.toMatch(/3\.5/);
  });

  test("det brudtal følger sæsonen: 3,5 timer sommer, 4,5 timer vinter", () => {
    const { container, unmount } = renderTidszone("da");
    vælgTilTidszone(container, "india");
    expect(screen.getByText("Mumbai er 3,5 timer foran København")).toBeVisible();
    unmount();

    vi.setSystemTime(new Date(VINTER));
    const vinter = renderTidszone("da");
    vælgTilTidszone(vinter.container, "india");
    expect(screen.getByText("Mumbai er 4,5 timer foran København")).toBeVisible();
  });

  test("svensk tekst skriver også brudtal med komma", () => {
    const { container } = renderTidszone("se");
    vælgTilTidszone(container, "india");

    expect(screen.getByText("Mumbai är 3,5 timmar före Stockholm")).toBeVisible();
    // Huskelisten bruger svensk time-endelse "h" (dansk bruger "t"), så den
    // læses på sin egen form — men med samme komma.
    expect(container.textContent ?? "").toContain("+3,5h");
    expect(container.textContent ?? "").not.toMatch(/3\.5/);
  });

  test("den delte tekst indeholder forskellen og den dato, den gælder for", () => {
    // Før C56 var teksten "12:00 i København = 19:00 i Tokyo" uden dato og
    // uden forskel. Den er sand i dag og forkert til vinter, fordi forskellen
    // følger sommertiden — altså en påstand, der bliver falsk uden at nogen
    // kan se det. Samme klokkeslæt giver to forskellige svar, og kun datoen
    // forteller hvilken af dem der er den kopierede.
    const { container } = renderTidszone("da");
    vælgTilTidszone(container, "japan");
    kopierResultat();

    expect(sidsteKopieredeTekst()).toBe(
      "12:00 i København = 19:00 i Tokyo. Tokyo er 7 timer foran København. Gælder 1. juli 2026 — forskellen følger sommertiden."
    );
  });

  test("til vinter er svaret et andet, og den delte tekst siger hvilken dato den gælder", () => {
    vi.setSystemTime(new Date(VINTER));
    const { container } = renderTidszone("da");
    vælgTilTidszone(container, "japan");
    kopierResultat();

    expect(sidsteKopieredeTekst()).toBe(
      "12:00 i København = 20:00 i Tokyo. Tokyo er 8 timer foran København. Gælder 1. december 2026 — forskellen følger sommertiden."
    );
  });

  test("svensk delt tekst følger det svenske sæt", () => {
    const { container } = renderTidszone("se");
    vælgTilTidszone(container, "us_east");
    kopierResultat();

    expect(sidsteKopieredeTekst()).toBe(
      "12:00 i Stockholm = 06:00 i New York. New York är 6 timmar efter Stockholm. Gäller 1 juli 2026 — skillnaden följer sommartiden."
    );
  });
});

