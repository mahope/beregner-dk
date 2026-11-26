/**
 * Strukturerede data: hver beregner er en `WebApplication`, hver side med en
 * synlig FAQ er en `FAQPage`.
 *
 * Porten læser kilden i stedet for at rendere 200 sider: en ny beregner uden
 * `CalculatorSchema`, eller en `<FAQ>` uden sin `FAQSchema`, er præcis den
 * slags hul, der ellers først opdages i Search Console. De sektionssider, der
 * er tabeller og ikke værktøjer (arbejdsdage, helligdage, klokken-i …), har
 * kun FAQPage, og står derfor udtrykkeligt som undtagelser.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import { isCalculatorPath } from "@/lib/calculator-list";

const APP = join(process.cwd(), "src", "app");
const COMPONENTS = join(process.cwd(), "src", "components");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

/** Sider uden `<CalculatorSchema>` på sidefilen, fordi de ikke er et værktøj. */
const TABELSIDER = new Set([
  "arbejdsdage", "arbetsdagar", "dage-i-aaret", "dagar-i-aret", "dage-i-maaneden",
  "dagar-i-manaden", "dage-tilbage-i-aaret", "dagar-kvar-i-aret", "timer-i-aret",
  "timmar-i-aret", "uger-i-aret", "veckor-i-aret", "helligdage", "helgdagar",
  "klokken-i", "klockan-i", "dage-til", "dagar-till",
  // Samme komponent som /dage-mellem-datoer; skemaet ligger i komponenten.
  "dage-mellem-datoer", "dagar-mellan-datum",
]);

describe("WebApplication på hver beregner", () => {
  const mapper = readdirSync(APP).filter((entry) => {
    try {
      return statSync(join(APP, entry, "page.tsx")).isFile();
    } catch {
      return false;
    }
  });

  test("der er beregnere at undersøge", () => {
    expect(mapper.filter((m) => isCalculatorPath(`/${m}`)).length).toBeGreaterThan(80);
  });

  test("hver beregnerside har CalculatorSchema", () => {
    const mangler = mapper
      .filter((m) => isCalculatorPath(`/${m}`) && !TABELSIDER.has(m))
      .filter((m) => !readFileSync(join(APP, m, "page.tsx"), "utf8").includes("CalculatorSchema"));
    expect(mangler).toEqual([]);
  });

  test("dage-mellem-datoer-komponenten har CalculatorSchema, fordi siden er et værktøj", () => {
    const kilde = readFileSync(join(COMPONENTS, "DageMellemDatoer.tsx"), "utf8");
    expect(kilde).toContain("<CalculatorSchema");
  });
});

describe("FAQPage på hver side med en synlig FAQ", () => {
  test("hver fil, der viser <FAQ>, har også <FAQSchema>", () => {
    const filer = [...walk(APP), ...walk(COMPONENTS)].filter(
      (f) => /\.tsx$/.test(f) && !/\.test\.tsx$/.test(f) && !f.endsWith("components/FAQ.tsx"),
    );
    const mangler = filer
      .filter((f) => {
        const kilde = readFileSync(f, "utf8");
        return /<FAQ[\s>]/.test(kilde) && !kilde.includes("<FAQSchema");
      })
      .map((f) => f.replace(process.cwd() + "/", ""));
    expect(mangler).toEqual([]);
  });
});

describe("JSON-LD", () => {
  const ld = (markup: string) =>
    JSON.parse(/<script[^>]*>(.*)<\/script>/s.exec(markup)![1].replace(/&quot;/g, '"'));

  test("beraknare.se nævner det svenske slug i WebApplication", () => {
    const skema = ld(
      renderToStaticMarkup(
        CalculatorSchema({
          name: "Datumkalkylator",
          description: "Räkna dagar",
          url: "https://beraknare.se/dato",
        }),
      ),
    );
    expect(skema["@type"]).toBe("WebApplication");
    expect(skema.url).toBe("https://beraknare.se/datum");
    expect(skema.inLanguage).toBe("sv");
  });

  test("minberegner.dk beholder det danske slug", () => {
    const skema = ld(
      renderToStaticMarkup(
        CalculatorSchema({ name: "Datoberegner", description: "Tæl dage", url: "https://minberegner.dk/dato" }),
      ),
    );
    expect(skema.url).toBe("https://minberegner.dk/dato");
  });

  test("FAQPage bærer spørgsmål og svar", () => {
    const skema = ld(
      renderToStaticMarkup(FAQSchema({ items: [{ question: "Hvad?", answer: "Det." }] })),
    );
    expect(skema["@type"]).toBe("FAQPage");
    expect(skema.mainEntity[0].acceptedAnswer.text).toBe("Det.");
  });
});
