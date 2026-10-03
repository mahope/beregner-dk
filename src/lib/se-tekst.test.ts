/**
 * Svensk tekst må ikke få danske ord.
 *
 * Fire sådanne fejl lå i `sePages` 3/10: «og efter ytterligare» i promille-FAQ'en,
 * «og ikke heller» i /procent og «Timmene er dage gange 24» i /alder — alle
 * sammen i brødtekst og JSON-LD, altså synligt for svenske læsere. De er nemme
 * at lave igen ved at skrive på dansk og oversætte med to ord ad gangen, så
 * porten dømmer dem fremover.
 *
 * Den læser kun **visningsstrenge**, altså hele `sePages`-objektet minus nøgler
 * der ikke er tekst: slug, id, canonical og path. Det er nødvendigt, fordi
 * beraknare.se bevidst bruger danske URL-slugs (`/tidsberegner`, `/dato`) — de
 * er ikke dansk, de er bare slugs. Alt andet med et mellomrum i sig tælles som
 * tekst, også nøgler porten ikke kender, så et nyt felt dømmes automatisk.
 */
import { describe, expect, test } from "vitest";
import { getAvailableSlugs, getPageData } from "./page-data";

/** Nøgler der ikke er læsertekst, uanset indhold. */
const IKKE_TEKST = new Set(["slug", "id", "canonical", "path", "href", "url"]);

/**
 * Ord der kun findes i dansk — aldrig i svensk. Listen er bevidst kort og
 * uden ord der findes i begge sprog («med», «mest», «ikke» er dansk, men
 * «ikke» er *også* … nej: hold listen til ord, porten har dømt en fejl på).
 * Rækkefølgen er uden betydning; listen skal bare dække det, der faktisk er
 * skrevet forkert.
 */
const DANSKE_ORD = [
  "af",
  "altid",
  "antallet",
  "beløb",
  "beregne",
  "dage",
  "frem",
  "gerne",
  "gennem",
  "grænse",
  "højere",
  "hvilken",
  "hvilket",
  "hvor",
  "ikke",
  "imellem",
  "indtil",
  "krone",
  "længere",
  "mange",
  "mellem",
  "mindste",
  "og",
  "regne",
  "største",
  "til",
  "tilbage",
  "tilfælde",
  "tallet",
  "være",
  "værdi",
  "værktøj",
  "ændre",
] as const;

/** Finder alle `ord` i `tekst` på ordgrænse, så «beregner» ikke tæller som «er». */
function danseFund(tekst: string): string[] {
  const fund: string[] = [];
  for (const ord of DANSKE_ORD) {
    const re = new RegExp(`(^|[^\\p{L}])${ord}(?![\\p{L}])`, "iu");
    if (re.test(tekst)) fund.push(ord);
  }
  return fund;
}

/** Hele objektets strenge, minus nøgler der ikke er læsertekst. */
function visningsstrenge(node: unknown, noegel?: string): string[] {
  if (node === null || node === undefined) return [];
  if (typeof node === "string") {
    if (noegel && IKKE_TEKST.has(noegel)) return [];
    // Slugs, URL'er og uopløste pladsholdere er ikke læsertekst.
    if (/^[a-z0-9-]+$/.test(node) || node.includes("http") || node.includes("{")) return [];
    return [node];
  }
  if (typeof node === "number" || typeof node === "boolean") return [];
  if (Array.isArray(node)) return node.flatMap((n) => visningsstrenge(n));
  if (typeof node !== "object") return [];
  return Object.entries(node as Record<string, unknown>).flatMap(([k, v]) =>
    visningsstrenge(v, k)
  );
}

describe("sePages", () => {
  const slugs = getAvailableSlugs("se");

  test("har sider at dømme", () => {
    expect(slugs.length).toBeGreaterThan(50);
  });

  test("skriver ingen danske ord i svensk tekst", () => {
    const fund: string[] = [];
    for (const slug of slugs) {
      const side = getPageData(slug, "se");
      if (!side) {
        fund.push(`${slug}: getPageData gav intet`);
        continue;
      }
      for (const streng of visningsstrenge(side)) {
        for (const ord of danseFund(streng)) {
          fund.push(`/se/${slug}: «${ord}» i «${streng.slice(0, 120)}»`);
        }
      }
    }
    expect(fund.slice(0, 40)).toEqual([]);
  });
});