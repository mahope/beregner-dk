import { describe, it, expect } from "vitest";
import { SATSER_2026, SU_2026 } from "./satser-2026";
import {
  beregnIndtaegtsgraense,
  bruttoForEfterAM,
  handicapMaanedsSats,
  maanedssats,
  barnUnder18Tillaeg,
  type IndtaegtsgraenseInput,
} from "./su-indtaegtsgraense";

const full = (overrides: Partial<IndtaegtsgraenseInput> = {}): IndtaegtsgraenseInput => ({
  education: "videregaaende",
  suMonths: 12,
  statusUdenSu: "mellemste",
  childUnder18: 0,
  handicaptillaeg: false,
  ...overrides,
});

describe("satserne er su.dk's egne 2026-tal", () => {
  it("laver den laveste maanedsfribeloeb, mellemste og hoejeste", () => {
    // su.dk/su/naar-du-faar-su/saa-meget-maa-du-tjene/satser-for-maanedsfribeloeb
    expect(maanedssats("laveste", "ungdom")).toBe(15297);
    expect(maanedssats("laveste", "videregaaende")).toBe(20749);
    expect(maanedssats("mellemste", "videregaaende")).toBe(23598);
    expect(maanedssats("hoejeste", "videregaaende")).toBe(45420);
    expect(handicapMaanedsSats()).toBe(3921);
    expect(barnUnder18Tillaeg()).toBe(34129);
  });

  it("laever de samme tal som SU_2026.freeAllowance, saa tabel og vaerktøj ikke kan glide", () => {
    expect(maanedssats("laveste", "ungdom")).toBe(SU_2026.freeAllowance.youthWithSu);
    expect(maanedssats("laveste", "videregaaende")).toBe(SU_2026.freeAllowance.videregaaendeWithSu);
    expect(maanedssats("mellemste", "videregaaende")).toBe(SU_2026.freeAllowance.enrolledWithoutSu);
    expect(maanedssats("hoejeste", "videregaaende")).toBe(SU_2026.freeAllowance.notStudying);
    expect(handicapMaanedsSats()).toBe(SU_2026.freeAllowance.disabilityMonth);
    expect(barnUnder18Tillaeg()).toBe(SU_2026.freeAllowance.childUnder18Annual);
  });

  it("skelner mellem ungdoms- og videregaaende kun i den laveste sats", () => {
    // su.dk: "Mellemste og højeste månedsfribeløb er det samme for studerende på
    // ungdomsuddannelser og studerende på videregående uddannelser."
    for (const status of ["mellemste", "hoejeste"] as const) {
      expect(maanedssats(status, "ungdom")).toBe(maanedssats(status, "videregaaende"));
    }
    expect(maanedssats("laveste", "ungdom")).not.toBe(maanedssats("laveste", "videregaaende"));
  });
});

describe("aarsfribeloebet er de 12 maaneder lagt sammen", () => {
  it("giver 12 x laveste, naar alle 12 maaneder har SU", () => {
    const result = beregnIndtaegtsgraense(full({ suMonths: 12 }));
    expect(result).not.toBeNull();
    expect(result!.aarsfribeloeb).toBe(12 * 20749);
    expect(result!.maanederUdenSu).toBe(0);
    expect(result!.aarsGennemsnitPrMaaned).toBe(20749);
  });

  it("blander de to satser efter antallet af SU-maaneder", () => {
    // 6 maaneder med SU + 6 uden: 6 x 20.749 + 6 x 23.598.
    const result = beregnIndtaegtsgraense(full({ suMonths: 6 }));
    expect(result!.aarsfribeloeb).toBe(6 * 20749 + 6 * 23598);
    expect(result!.maanederUdenSu).toBe(6);
  });

  it("bruger den hoejeste sats i de maaneder uden SU, naar brugeren ikke er indskrevet", () => {
    const enrolled = beregnIndtaegtsgraense(full({ suMonths: 9 }));
    const notStudying = beregnIndtaegtsgraense(full({ suMonths: 9, statusUdenSu: "hoejeste" }));
    expect(notStudying!.aarsfribeloeb - enrolled!.aarsfribeloeb).toBe(3 * (45420 - 23598));
  });

  it("laegger hvert barn under 18 til AARET, ikke til en maaned", () => {
    const uden = beregnIndtaegtsgraense(full({ suMonths: 12 }));
    const med = beregnIndtaegtsgraense(full({ suMonths: 12, childUnder18: 2 }));
    expect(med!.aarsfribeloeb - uden!.aarsfribeloeb).toBe(2 * 34129);
    // 12 maaneder x 2 born = 24 maaneders fribeloeb, saa det kan ikke vaere 2 x 34.129
    // fordelt paa maaneder: forskellen er den aarlige, ikke den maanedlige.
    expect(med!.aarsfribeloeb).toBe(12 * 20749 + 2 * 34129);
  });

  it("bruger det nedsatte fribeloeb i SU-maanederne, naar der er handicaptillaeg", () => {
    const result = beregnIndtaegtsgraense(full({ suMonths: 12, handicaptillaeg: true }));
    expect(result!.maanedMedSu).toBe(3921);
    expect(result!.aarsfribeloeb).toBe(12 * 3921);
  });

  it("tager den laveste sats paa ungdomsuddannelse", () => {
    const result = beregnIndtaegtsgraense(full({ education: "ungdom", suMonths: 12 }));
    expect(result!.aarsfribeloeb).toBe(12 * 15297);
  });

  it("regner 0 SU-maaneder som 12 maaneder uden SU", () => {
    const result = beregnIndtaegtsgraense(full({ suMonths: 0, statusUdenSu: "hoejeste" }));
    expect(result!.maanederUdenSu).toBe(12);
    expect(result!.aarsfribeloeb).toBe(12 * 45420);
  });
});

describe("brutto-tallet er det en studerende kan genkende paa en lonblank", () => {
  it("regner AM-bidraget fra og runder ned, saa tallet aldrig lover for meget", () => {
    expect(bruttoForEfterAM(1000)).toBe(Math.floor(1000 / (1 - SATSER_2026.amBidrag)));
    // 20.749 efter AM -> 22.553,26 brutto, rundet NED til 22.553.
    expect(bruttoForEfterAM(20749)).toBe(22553);
    // Nedrunding: resultatet efter AM-bidrag må aldrig overstige input.
    for (const afterAM of [1, 999, 20749, 23598, 45420, 34129, 1_000_000]) {
      expect(bruttoForEfterAM(afterAM) * (1 - SATSER_2026.amBidrag)).toBeLessThanOrEqual(afterAM);
    }
  });

  it("giver brutto for bade maaned og aar", () => {
    const result = beregnIndtaegtsgraense(full({ suMonths: 12 }));
    expect(result!.maanedBrutto).toBe(bruttoForEfterAM(result!.maanedGrænse));
    expect(result!.aarsBrutto).toBe(bruttoForEfterAM(result!.aarsfribeloeb));
  });
});

describe("ugyldigt input faar ikke et tal ud af det blaa", () => {
  it("returnerer null, naar ingen situation er valgt", () => {
    expect(beregnIndtaegtsgraense({})).toBeNull();
    expect(beregnIndtaegtsgraense(undefined)).toBeNull();
    expect(beregnIndtaegtsgraense(null)).toBeNull();
    expect(beregnIndtaegtsgraense([1, 2])).toBeNull();
    expect(beregnIndtaegtsgraense("su")).toBeNull();
  });

  it("klemmer SU-maaneder til 0-12 og born til hele, ikke-negative tal", () => {
    const forMange = beregnIndtaegtsgraense(full({ suMonths: 99, childUnder18: -5 }));
    expect(forMange!.maanederUdenSu).toBe(0);
    expect(forMange!.aarsfribeloeb).toBe(12 * 20749);

    const negativ = beregnIndtaegtsgraense(full({ suMonths: -3 }));
    expect(negativ!.maanederUdenSu).toBe(12);
  });

  it("afviser en ukendt statusUdenSu og bruger mellemste", () => {
    const result = beregnIndtaegtsgraense({
      ...full({ suMonths: 6 }),
      statusUdenSu: "laveste",
    });
    expect(result!.maanedUdenSu).toBe(23598);
  });

  it("behandler en ukendt uddannelse som videregaaende, men med 0 maaneder uden svar", () => {
    // Uden uddannelse, maaneder OG born er der ingen situation, saar der svares ikke.
    expect(beregnIndtaegtsgraense({ education: "erhverv", suMonths: 0, childUnder18: 0 })).toBeNull();
    // Men faar der et barn, er situationen alligevel besvaret.
    const medBarn = beregnIndtaegtsgraense({ education: "erhverv", suMonths: 0, childUnder18: 1 });
    expect(medBarn).not.toBeNull();
    expect(medBarn!.aarsfribeloeb).toBe(12 * 23598 + 34129);
  });
});
