import { describe, expect, test } from "vitest";
import { getPageData } from "./page-data";
import { dageIAaretCopy } from "./dage-i-aaret";
import { ugerCopy } from "./uger-i-aret";
import { dageMellemCopy } from "./dage-mellem-datoer";

/**
 * Svenske titler og beskrivelser på beraknare.se (GSC 18/8-16/11-2026:
 * 688.000 visninger, CTR 0,1 %). Hver række låser sidens hovedsøgeord, som
 * står først eller tidligt i titlen, og at titel og beskrivelse ikke bliver
 * klippet i Google (60 og 155 tegn).
 */
const SIDER: { slug: string; ord: string }[] = [
  { slug: "alder", ord: "Räkna ut ålder" },
  { slug: "procent", ord: "Procenträknare" },
  { slug: "kvadratmeter", ord: "Kvadratmeterkalkylator" },
  { slug: "valuta", ord: "Valutakalkylator" },
  { slug: "elberegner", ord: "Beräkna elkostnad" },
  { slug: "leasing", ord: "Företagsleasing bil" },
  { slug: "boliglaan", ord: "Bolånekalkylator" },
  { slug: "bil", ord: "Bilkostnadskalkylator" },
];

describe("svenske titler og beskrivelser (beraknare.se)", () => {
  test.each(SIDER)("/$slug har hovedsøgeordet først og holder længden", ({ slug, ord }) => {
    const data = getPageData(slug, "se");
    expect(data, slug).toBeDefined();
    expect(data!.metaTitle.startsWith(ord), data!.metaTitle).toBe(true);
    expect(data!.metaTitle.length, data!.metaTitle).toBeLessThanOrEqual(60);
    expect(data!.metaDescription.length, data!.metaDescription).toBeLessThanOrEqual(155);
    expect(data!.ogTitle).toBe(data!.metaTitle);
    expect(`${data!.metaTitle}${data!.metaDescription}`).not.toMatch(/[—–]|\{[A-Z]+\}|Fåret/);
  });

  test.each([
    ["dagar-i-aret", dageIAaretCopy.se, "hur många dagar är det på ett år"],
    ["veckor-i-aret", ugerCopy.se, "hur många veckor är det på ett år"],
    ["dagar-mellan-datum", dageMellemCopy.se, "dagar mellan datum"],
  ] as const)("/%s har spørgsmålet i titlen og holder længden", (_slug, c, sporgsmal) => {
    expect(c.title.toLowerCase()).toContain(sporgsmal);
    expect(c.title.length, c.title).toBeLessThanOrEqual(60);
    expect(c.description.length, c.description).toBeLessThanOrEqual(155);
    expect(c.description).not.toMatch(/[—–]|helvdag|helgvag/);
  });
});
