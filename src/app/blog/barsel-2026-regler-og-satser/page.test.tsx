import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { BARSEL_2026 } from "@/lib/satser-2026";
import { REGLER } from "@/lib/barsel/regler";
import { adoption, flerling, flerlingUgevaerdi, indlaeggelse } from "@/lib/barsel/special";
import Barsel2026Page from "./page";

vi.mock("@/components/FAQ", () => ({ default: () => null }));
vi.mock("@/components/StructuredData", () => ({ FAQSchema: () => null, ArticleSchema: () => null }));

const markup = () => renderToStaticMarkup(<Barsel2026Page />);
const f = flerling();
const a = adoption();
const ind = indlaeggelse();

describe("barsel 2026 — tvillinger, indlæggelse og adoption", () => {
  test("svarer på tvillinger med modulets 13 uger og totalen", async () => {
    const html = await markup();

    expect(html).toContain("Tvillinger og flerlinger");
    expect(html).toContain(`${f.ekstraUgerPrForaelder} ekstra uger`);
    // 24 + 13 = 37 skal stå i markuppen, ikke kun i FAQ'en.
    expect(html).toContain(`${f.totalUgerPrForaelder} uger`);
    // Og det skal være regnestykket, ellers er 37 et ubevidst tal.
    // Skrivs med dansk tusindtalsseparator — C84's krav om at tallet i
    // brødteksten er det læseren faktisk ser, ikke råt fra modulet.
    expect(html).toContain(
      `${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr. × ${f.ekstraUgerPrForaelder} uger`
    );
    expect(html).toContain(`${flerlingUgevaerdi().toLocaleString("da-DK")} kr. før skat`);
    // Negativt krav: den råe form må ikke slippe igennem nogen sted.
    expect(html).not.toContain(`${BARSEL_2026.maxWeeklyRate} kr. × `);
  });

  test("siger at tallet er det samme uanset antal børn", async () => {
    const html = await markup();

    // Uden denne sætning er "13 ekstra" ubesvaret for de, der får trillinger.
    expect(html).toContain("uanset antallet af børn");
    expect(html).toContain("ikke 3");
  });

  test("svarer på indlæggelse med 46-uge-vinduet og begge loftgrænser", async () => {
    const html = await markup();

    expect(html).toContain("Når barnet er indlagt");
    expect(html).toContain(`inden for de første ${ind.vindueUger} uger`);
    // Begge ordninger skal stå, ellers læser en forælder i 2025 det forkerte loft.
    expect(html).toContain(`${ind.maksUger} uger pr. forælder`);
    expect(html).toContain(`${ind.maksUgerFoer2026} uger i alt`);
    // Dansk dato, ikke ISO: "2026-01-01" i brødteksten er målefejl nr. 31.
    expect(html).toContain(ind.nyRegelDato);
    expect(html).not.toContain("2026-01-01");
  });

  test("forklarer at skæringsdatoen er fødselsdatoen, ikke ansøgningsdatoen", async () => {
    const html = await markup();

    expect(html).toContain("31. december 2025");
    expect(html).toContain("1. januar 2026");
  });

  test("svarer på adoption med alle fem rækker og regnestykket", async () => {
    const html = await markup();

    expect(html).toContain("Adoption:");
    expect(html).toContain(`${a.ugerFoerModtagelseUdland} uger`);
    expect(html).toContain(`${a.efterUge10} uger`);
    expect(html).toContain(`${a.tidligeUger} + ${a.efterUge10} =`);
    expect(html).toContain(`${a.totalUgerEnadoptant} uger`);
  });

  test("citerer loven som primærkilde", async () => {
    const html = await markup();

    expect(html).toContain(REGLER.kilde);
    expect(html).toContain("LBK nr. 206");
    // Og de tre paragraffer, de tre afsnit hviler på.
    expect(html).toContain("§ 14 a");
    expect(html).toContain("§ 14");
    expect(html).toContain("§ 8");
  });

  test("de tre nye spørgsmål er med i FAQ'en", async () => {
    // FAQSchema er mocket ud her, så JSON-LD'en ligger ikke i markupken.
    // Vi låser derfor spørgsmålene selv — de er præcis de strenge
    // FAQSchema serialiserer, så låsen kan ikke blive vakuum-grøn.
    const html = await markup();

    expect(html).toContain("Hvor mange uger får man ved tvillinger?");
    expect(html).toContain("Hvad hvis barnet er indlagt på hospitalet?");
    expect(html).toContain("Hvor mange uger får man ved adoption?");
    // 4 spørgsmål før denne iteration → 7 nu, og de må ikke forsvinde.
    for (const gammel of [
      "Hvad er barselsdagpengesatsen i 2026?",
      "Hvor lang tid kan man holde barselsorlov?",
      "Hvad er øremærket barsel?",
      "Hvornår skal jeg søge om barselsdagpenge?",
    ]) {
      expect(html, gammel).toContain(gammel);
    }
  });

  test("FAQ'ens svar skal kunne regnes efter af læseren", async () => {
    // C84's krav: et tal i brødteksten skal ikke kunne modsige modulet.
    const html = await markup();

    expect(html).toContain(`${f.totalUgerPrForaelder} uger hver i stedet for ${BARSEL_2026.afterBirthWeeks}`);
    expect(html).toContain(`${ind.maksUger} uger pr. forælder (12 måneder)`);
    expect(html).toContain(`${ind.maksUgerFoer2026} uger i alt (3 måneder)`);
    expect(html).toContain("de samme 24 uger");
  });

  test("linker videre til planlæggeren, der kan regne på de tre situationer", async () => {
    const html = await markup();

    expect(html).toContain('href="/barselsplanlaegger"');
    // Ellers lover vi en værktøjsevne, indlæggelsen så ikke kan se.
    expect(html).toContain("flerlinger, indlæggelse og adoption");
  });

  test("de eksisterende satser er urørte", async () => {
    // En CTR-iteration må ikke flytte de tal, siden allerede er indekseret på.
    const html = await markup();

    expect(html).toContain(`${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr. pr. uge`);
    expect(html).toContain(`${BARSEL_2026.earmarkedWeeks} uger øremærket`);
  });
});
