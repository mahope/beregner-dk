import { describe, expect, test } from "vitest";
import { REGLER } from "./regler";
import { adoption, flerling, flerlingUgevaerdi, indlaeggelse } from "./special";
import { BARSEL_2026 } from "../satser-2026";

describe("flerlinger (§ 14 a)", () => {
  test("er 13 ekstra uger pr. forælder, uanset antal børn", () => {
    // § 14 a, stk. 1: "fast 13, ikke pr. ekstra barn" — så tre og fire børn
    // giver præcis det samme tal som to. Det er den egenskab, der gør at
    // regelmotorens `antalBoern > 1`-gren er rigtig.
    expect(flerling().ekstraUgerPrForaelder).toBe(13);
    const f = flerling();
    expect(f.totalUgerPrForaelder).toBe(37);
    // 24 + 13, ikke 24 + 13 pr. barn.
    expect(f.totalUgerPrForaelder - BARSEL_2026.afterBirthWeeks).toBe(13);
  });

  test("tæller kun én gang uanset hvor mange børn der fødes", () => {
    // Motoren læser `antalBoern > 1` og lægger ÉN spand på, så tallet kan
    // ikke afhænge af antallet. Hvis nogen senere gør spanden pr. barn, er
    // det her der: totalUgerPrForaelder må aldrig blive 24 + 13·2.
    expect(flerling().totalUgerPrForaelder).toBe(37);
    expect(flerling().totalUgerPrForaelder).not.toBe(50);
    expect(flerling().ekstraUgerPrForaelder).toBe(REGLER.flerlingEkstraUger);
  });

  test("skal holdes inden for det første år", () => {
    // § 14 a, stk. 6.
    expect(flerling().fristUger).toBe(52);
  });

  test("en soloforælder kan give op til 13 uger til en nærtstående", () => {
    // § 14 a, stk. 3 og 4: loftet er 13 i alt, ikke 13 pr. modtager.
    expect(flerling().tilNaertstaaendeMaks).toBe(13);
  });

  test("er værd 13 ugers sats ved maksimum", () => {
    // 5.085 × 13 = 66.105. Beregnet, ikke skrevet i hånden.
    expect(flerlingUgevaerdi()).toBe(5085 * 13);
  });
});

describe("adoption (§ 8, § 21)", () => {
  test("giver hver adoptant de samme 24 uger som en fødsel", () => {
    // 6 i de første 10 uger + 18 efter uge 10 = 24, hvilket er præcis
    // BARSEL_2026.afterBirthWeeks. Så adoption ikke diskuterer om en
    // adoptant "mister" uger.
    const a = adoption();
    expect(a.tidligeUger).toBe(6);
    expect(a.efterUge10).toBe(18);
    expect(a.totalUgerPrAdoptant).toBe(24);
    expect(a.totalUgerPrAdoptant).toBe(BARSEL_2026.afterBirthWeeks);
  });

  test("er 4 uger før modtagelse i udlandet og 1 uge i Danmark", () => {
    // § 8, stk. 1 og 4.
    const a = adoption();
    expect(a.ugerFoerModtagelseUdland).toBe(4);
    expect(a.ugerFoerModtagelseDanmark).toBe(1);
  });

  test("kun 4 af de 6 tidlige uger kan overdrages", () => {
    // § 8, stk. 6: 6 uger, op til 4 overdragelige — altså 2 bliver.
    const a = adoption();
    expect(a.tidligeOverdragelige).toBe(4);
    expect(a.tidligeUger - a.tidligeOverdragelige).toBe(2);
  });

  test("en eneadoptant får 46 uger", () => {
    // 6 + 18 + 22 = 46, samme tal motoren skriver i sin solo-besked.
    expect(adoption().totalUgerEnadoptant).toBe(46);
  });

  test("de 18 uger efter uge 10 indeholder de 9 øremærkede", () => {
    expect(adoption().oeremaerketUger).toBe(9);
  });
});

describe("indlæggelse (§ 14)", () => {
  test("vinduet er de første 46 uger", () => {
    expect(indlaeggelse().vindueUger).toBe(46);
  });

  test("børn født fra 1/1-2026 kan forlænges op til 12 måneder pr. forælder", () => {
    const i = indlaeggelse();
    expect(i.maksUger).toBe(52);
    expect(i.nyRegelFra).toBe("2026-01-01");
    // ISO-datoen er ikke noget en læser må se, så modulet leverer den
    // danske form ved siden af. Samme fejlklasse som C84's 12 byer.
    expect(i.nyRegelDato).toBe("1. januar 2026");
  });

  test("før 1/1-2026 var loftet 3 måneder i alt", () => {
    // 13 uger ≈ 3 måneder. En fødselsdato lige før skæringsdatoen må derfor
    // give et MINDRE tal end en fødselsdato lige efter — det er hele
    // pointen med at have et skæringsår.
    const i = indlaeggelse();
    expect(i.maksUgerFoer2026).toBe(13);
    expect(i.ekstraUger("2025-12-31", 30)).toBe(13);
    expect(i.ekstraUger("2026-01-01", 30)).toBe(30);
  });

  test("skæringsdatoen er eksakt 1/1-2026, ikke 'år 2026'", () => {
    // En fødsel 31/12-2025 er gammel ordning, 1/1-2026 er ny. Grænsen
    // må ikke glide en dag, fordi nogen skriver new Date() med tidszone.
    const i = indlaeggelse();
    expect(i.ekstraUger("2025-12-31", 60)).toBe(13);
    expect(i.ekstraUger("2026-01-01", 60)).toBe(52);
  });

  test("kortere indlæggelse end loftet bærer det fulde antal", () => {
    const i = indlaeggelse();
    expect(i.ekstraUger("2026-03-01", 1)).toBe(1);
    expect(i.ekstraUger("2026-03-01", 8)).toBe(8);
    expect(i.ekstraUger("2026-03-01", 52)).toBe(52);
  });

  test("længere indlæggelse end loftet korteres aldrig, men heller aldrig forlænges", () => {
    const i = indlaeggelse();
    // 60 uger indlæggelse i 2026-ordningen giver 52, ikke 60.
    expect(i.ekstraUger("2026-03-01", 60)).toBe(52);
    // Og før 2026: 60 uger giver kun 13.
    expect(i.ekstraUger("2025-03-01", 60)).toBe(13);
  });

  test("nul og negative uger giver nul, aldrig negativ forlængelse", () => {
    const i = indlaeggelse();
    expect(i.ekstraUger("2026-03-01", 0)).toBe(0);
    expect(i.ekstraUger("2026-03-01", -5)).toBe(0);
  });

  test("udskrivning skal ske inden 60 uger, når arbejdet genoptages", () => {
    // § 14, stk. 3.
    expect(indlaeggelse().udskrivningSenestUger).toBe(60);
  });
});
