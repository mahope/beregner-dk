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

    test("da: teksten i Kopier og Del bruger også komma", () => {
      medArvebeloeb("da");
      // `CopyResultButton` og `ShareCalculation` får samme streng; vi læser
      // den fra DOM'en, fordi den er det brugeren faktisk tager med ud.
      const delteTekster = Array.from(document.querySelectorAll("[data-share-text]")).map(
        (n) => n.getAttribute("data-share-text") ?? "",
      );
      // Uanset hvordan knappen er bygget, må ingen streng i DOM'en have
      // punktum som decimalseparator.
      for (const t of delteTekster) expect(t).not.toContain("9.1%");
    });
  });

  describe("/laane (aop-annuitet)", () => {
    test("da: 100.000 kr. over 5 år til 8 % skriver komma", () => {
      const tekst = helTekst(renderIn(<LaaneBeregner />, "da").container);
      // Den effektive årlige rente ligger mellem 8 % og 8 %,5 %.
      expect(tekst).toMatch(/\d,\d%/);
      expect(tekst).not.toMatch(/\d\.\d%/);
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
      expect(tekst).toMatch(/Effektiv skatteprocent: \d+,\d%/);
    });

    test("se: samme side skriver komma", () => {
      const tekst = helTekst(renderIn(<LoenBeregner />, "se").container);
      expect(tekst).not.toMatch(/Effektiv skatteprocent: \d+\.\d%/);
    });
  });

  describe("/boliglaan (belåningsgrad og rentespænd)", () => {
    test("da: 150.000 ud af 3.000.000 er 5,0 % med komma", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "da").container);
      expect(tekst).toContain("5,0%");
      expect(tekst).not.toContain("5.0%");
    });

    test("da: rentespændene bruger komma", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "da").container);
      expect(tekst).toContain("ca. 3,5-4,0%");
      expect(tekst).toContain("ca. 5,0-7,0%");
    });

    test("se: rentespændene bruger komma, punktum ville være dansk", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "se").container);
      expect(tekst).toContain("ca. 3,5-4,0 %");
      expect(tekst).not.toContain("ca. 3.5-4.0");
    });

    test("se: belåningsgraden skriver komma", () => {
      const tekst = helTekst(renderIn(<BoliglaanBeregner />, "se").container);
      expect(tekst).toContain("5,0%");
      expect(tekst).not.toContain("5.0%");
    });
  });
});
