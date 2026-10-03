/**
 * Tal i dansk og svensk tekst skal have komma som decimalseparator.
 *
 * Klassen opstod i C52 og har fundet en reel fejl i hver eneste iteration
 * siden: C76 rettede otte beregnersider, og dette er de ni næste steder.
 * Det alvorlige var ikke selve tegnet, men hvor tallene lander —
 * `/arveafgift`s `effektivSats` nåede både `CopyResultButton` og
 * `ShareCalculation.resultSummary`, altså den tekst brugeren kopierer ud
 * af sitet og deler. Derfor læser denne test ikke bare den synlige
 * procent, men også den tekst der sendes videre.
 *
 * Bevidst ikke testet: `RuteAfstand.tsx` og `lib/rute.ts` bruger
 * `toFixed(6)`/`toFixed(4)` på **geo-koordinater**, hvor punktum er
 * korrekt, og `BraendstofBeregner`/`promille-eksempler`/`page-data` bruger
 * `.toFixed(n).replace(".", ",")`, som er korrekt. En ren `toFixed(0)` kan
 * desuden ikke lave et decimaltegn.
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ArveafgiftBeregner from "./ArveafgiftBeregner";
import LaaneBeregner from "./LaaneBeregner";
import LoenBeregner from "./LoenBeregner";
import BoliglaanBeregner from "./BoliglaanBeregner";
import TidsBeregner from "./TidsBeregner";
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
// fallback bruger. Uden stubben giver den to uhandlede rejections, og filen
// exited 1 selv om alle tests var grønne.
Object.defineProperty(document, "execCommand", {
  value: () => true,
  configurable: true,
  writable: true,
});

const daDomain = getDomainConfig("localhost");
const seDomain = getDomainConfig("beraknare.se");

function renderIn(node: React.ReactNode, locale: Locale) {
  const domainConfig = locale === "se" ? seDomain : daDomain;
  return render(
    <LocaleProvider locale={locale} domainConfig={domainConfig}>
      {node}
    </LocaleProvider>,
  );
}

function helTekst(container: HTMLElement): string {
  return container.textContent ?? "";
}

/**
 * Læser den tekst `CopyResultButton` faktisk skriver i klipbordet, efter
 * C57's metode. DOM'en viser ikke den streng — den er kun et `text`-prop på
 * knappen — så en test der læser container-teksten ville aldrig se den.
 *
 *Bemærk: `ShareCalculation` har **ikke** et `data-share-text`-attribut, så
 * C77's `/arveafgift`-test løb over en tom liste og var dermed grøn uden at
 * se noget. Det er samme fejltype som de målefejl, planen har fem af.
 */
async function tekstIKlipbordet(): Promise<string> {
  const skrevet: string[] = [];
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: (t: string) => skrevet.push(t) },
    configurable: true,
  });
  const knap = screen.getByRole("button", { name: /Kopiér resultat|Kopiera resultat/ });
  fireEvent.click(knap);
  return skrevet.join("\n");
}

afterEach(cleanup);

describe("decimal-komma — procenter i dansk og svensk tekst", () => {
  describe("/arveafgift (effektiv sats, også i Kopier og Del)", () => {
    /** 1.000.000 kr. arv som barn: 15 % boafgift over bundfradraget. */
    function medArvebeloeb(locale: Locale) {
      const { container } = renderIn(<ArveafgiftBeregner />, locale);
      // Feltet hentes på sit id, ikke på rolle: komponenten har flere
      // tekstfelter, og "det første" er en antagelse der holder kun indtil
      // nogen tilføjer et felt oveni.
      const felt = container.querySelector<HTMLInputElement>("#arvebeloeb");
      if (!felt) throw new Error("#arvebeloeb ikke i DOM'en");
      fireEvent.change(felt, { target: { value: "1000000" } });
      return container;
    }

    test("da: den synlige sats skriver komma, ikke punktum", () => {
      const tekst = helTekst(medArvebeloeb("da"));
      // Boafgiften er 15 %, men kun af arven *over* bundfradraget på
      // 392.300, så den effektive sats er 91155/1000000 = 9,1 %.
      expect(tekst).toContain("9,1%");
      expect(tekst).not.toContain("9.1%");
    });

    test("se: den synlige sats skriver komma, ikke punktum", () => {
      const tekst = helTekst(medArvebeloeb("se"));
      expect(tekst).toContain("9,1%");
      expect(tekst).not.toContain("9.1%");
    });

    test("da: teksten i Kopier og Del bruger også komma", async () => {
      medArvebeloeb("da");
      // `CopyResultButton` og `ShareCalculation` får samme streng; vi læser
      // den fra klipbordet, fordi det er det brugeren faktisk tager med ud.
      // C77's version løb over `[data-share-text]`, et attribut der ikke
      // findes nogen steder i repoet — listen var tom og testen grøn uden
      // at have set noget.
      const delt = await tekstIKlipbordet();
      expect(delt).toContain("9,1%");
      expect(delt).not.toContain("9.1%");
    });
  });

  describe("/laane (aop-annuitet)", () => {
    test("da: 100.000 kr. over 5 år til 8 % skriver komma", () => {
      const tekst = helTekst(renderIn(<LaaneBeregner />, "da").container);
      // Den effektive årlige rente ligger mellem 8 % og 8,5 %.
      expect(tekst).toMatch(/\d,\d ?%/);
      expect(tekst).not.toMatch(/\d\.\d ?%/);
    });

    test("se: samme side skriver komma", () => {
      const tekst = helTekst(renderIn(<LaaneBeregner />, "se").container);
      expect(tekst).toMatch(/\d,\d ?%/);
      expect(tekst).not.toMatch(/\d\.\d ?%/);
    });
  });

  describe("/lon-efter-skat (effektiv skatteprocent)", () => {
    test("da: skatteprocenten skriver komma", () => {
      const tekst = helTekst(renderIn(<LoenBeregner />, "da").container);
      expect(tekst).toMatch(/Effektiv skatteprocent: \d+,\d ?%/);
    });

    test("se: samme side skriver komma", () => {
      const tekst = helTekst(renderIn(<LoenBeregner />, "se").container);
      expect(tekst).not.toMatch(/Effektiv skatteprocent: \d+\.\d%/);
    });

    test("da: kommunesatslinjen skriver komma, ikke punktum", () => {
      // Procenten kommer fra et input-felt, så den bliver interpoleret råt.
      // Uden formatNumber skrev linjen «Kommuneskat (24.94 %)» lige under
      // «Kirkeskat (0,64 %)» på samme side.
      const tekst = helTekst(renderIn(<LoenBeregner />, "da").container);
      expect(tekst).toContain("Kommuneskat (24,94 %)");
      expect(tekst).not.toContain("24.94 %");
    });

    test("da: kommune-listen skriver komma, ikke punktum", () => {
      // Samme fejl ét felt længere oppe: listen af kommuner interpolerer
      // satsen råt fra `KOMMUNER`, så hvert af de 98 valg skrev
      // «Gentofte (22.8 %)» med punktum i dansk markup.
      const tekst = helTekst(renderIn(<LoenBeregner />, "da").container);
      expect(tekst).toContain("Gentofte (22,8 %)");
      expect(tekst).not.toMatch(/\(\d+\.\d+ ?%\)/);
    });

    test("da: kirkeskatlinjen under kommune-listen skriver komma", () => {
      const { container } = renderIn(<LoenBeregner />, "da");
      fireEvent.change(container.querySelector("#loen-kommune")!, {
        target: { value: "Gentofte" },
      });
      const tekst = helTekst(container);
      expect(tekst).toContain("Kirkeskat: 0,43 %");
      expect(tekst).not.toContain("0.43 %");
    });
  });

  describe("/boliglaan (belåningsgrad og rentespænd)", () => {
    test("da: 150.000 ud af 3.000.000 er 5,0 % med komma", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "da").container);
      expect(tekst).toContain("5,0 %");
      expect(tekst).not.toContain("5.0%");
    });

    test("da: rentespændene bruger komma", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "da").container);
      expect(tekst).toContain("ca. 3,5-4,0 %");
      expect(tekst).toContain("ca. 5,0-7,0 %");
    });

    test("se: rentespændene bruger komma, punktum ville være dansk", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "se").container);
      expect(tekst).toContain("ca. 3,5-4,0 %");
      expect(tekst).not.toContain("ca. 3.5-4.0");
    });

    test("se: belåningsgraden skriver komma", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "se").container);
      expect(tekst).toContain("5,0 %");
      expect(tekst).not.toContain("5.0%");
    });
  });

  /**
   * C78's fund. `/tidsberegner` er sitets **tredjestørste** side i dansk
   * GSC (72.725 visninger) og andenstørste på beraknare.se (57.541), og de fire
   * `toFixed(2)` i `lib/tidsberegner.ts` nåede *alt*: eksempel-tabellen og
   * brødteksten i den server-renderede HTML — altså den tekst Google
   * indekserer — samt resultatet, Kopiér- og Del-teksten.
   *
   * Testen slår fast på **konkrete værdier** (08:30→16:45 = 8,25 timer =
   * 1,03 arbejdsdage = 0,34 døgn) frem for et regex over hele teksten, efter
   * C77's lektie: et `/\d\.\d/` faldt på tusindtalsseparatoren i "3.000.000".
   */
  describe("/tidsberegner (decimaltimer, arbejdsdage og hele døgn)", () => {
    /** 08:30 → 16:45 = 8 t 15 min = 495 min. */
    function medInterval(locale: Locale) {
      const { container } = renderIn(<TidsBeregner />, locale);
      const start = container.querySelector<HTMLInputElement>("#tid-start-tidspunkt");
      const slut = container.querySelector<HTMLInputElement>("#tid-slut-tidspunkt");
      if (!start || !slut) throw new Error("tidsfelterne ikke i DOM'en");
      fireEvent.change(start, { target: { value: "08:30" } });
      fireEvent.change(slut, { target: { value: "16:45" } });
      return container;
    }

    test("da: de fire resultattal skriver komma", () => {
      const tekst = helTekst(medInterval("da"));
      expect(tekst).toContain("8,25");
      expect(tekst).toContain("1,03");
      expect(tekst).toContain("0,34");
    });

    test("se: de fire resultattal skriver også komma", () => {
      const tekst = helTekst(medInterval("se"));
      expect(tekst).toContain("8,25");
      expect(tekst).toContain("1,03");
      expect(tekst).toContain("0,34");
    });

    test("da: teksten i Kopier og Del bruger også komma", async () => {
      medInterval("da");
      const delt = await tekstIKlipbordet();
      // "8 t 15 min (8,25 timer)" — decimaltimeret skal have samme notation
      // på skærmen og i den tekst brugeren tager med ud.
      expect(delt).toContain("8,25");
      expect(delt).not.toMatch(/\d\.\d/);
    });

    test("se: Kopier-teksten bruger også komma", async () => {
      medInterval("se");
      const delt = await tekstIKlipbordet();
      expect(delt).toContain("8,25");
      expect(delt).not.toMatch(/\d\.\d/);
    });

    test("heltallet vises med to decimaler, som før", () => {
      // 08:00 → 16:00 er præcis 8 timer. Det skal stadig stå "8,00" — en
      // rettelse af decimaltegnet må ikke slå nullerne væk.
      const { container } = renderIn(<TidsBeregner />, "da");
      const start = container.querySelector<HTMLInputElement>("#tid-start-tidspunkt");
      const slut = container.querySelector<HTMLInputElement>("#tid-slut-tidspunkt");
      if (!start || !slut) throw new Error("tidsfelterne ikke i DOM'en");
      fireEvent.change(start, { target: { value: "08:00" } });
      fireEvent.change(slut, { target: { value: "16:00" } });
      expect(helTekst(container)).toContain("8,00");
    });
  });
});
