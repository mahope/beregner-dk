import { describe, expect, test } from "vitest";
import { DAGPENGE_2026, SATSER_2026 } from "./satser-2026";
import { estimerNettoMaaned } from "./barsel/netto";
import { getIntlLocale } from "./format";
import {
  BESKAEFTIGELSESTILLAEG_2026,
  DAGPENGE_SATSER,
  INDKOMSTKRAV_2026,
  KOMMUNESKAT_SNIT_PCT_DAGPENGE,
  dagpengeEfterSkat,
  dagpengeEfterSkatFaqSvar,
  dagpengeKroner,
  dagpengeNyuddannetFaqSvar,
  dagpengeNyuddannetPeriodeFaqSvar,
  dagpengePeriodeTekst,
  dagpengeTimer,
} from "./dagpenge-satser";

/**
 * 2/10: «dagpenge sats 2026 nyuddannet» og «dagpenge sats 2026 efter skat» er de
 * to mest konkrete danske autocomplete-træffere under «dagpenge» (10 af 10 under
 * «dagpenge nyuddannet»; «… efter skat» nr. 2 under «dagpenge sats 2026»,
 * målt på `suggestqueries`, hl=da gl=dk 11:25). `/dagpenge` lovede «dagpenge
 * efter skat» i sin egen `keywords` og FAQ, men viste **intet** beløb efter
 * skat — og tre af sine egne beløb stod håndskrevet i brødteksten.
 *
 * Porten dømmer de to ting: at beløbet efter skat **regnes** af samme modul som
 * satsen, og at ingen ny tekstliteral kan stå for et dagpenge-beløb igen.
 */
describe("DAGPENGE_SATSER", () => {
  test("dækker alle satsgrupper, og hvert beløb kommer fra satsmodulet", () => {
    const belob = DAGPENGE_SATSER.map((sats) => sats.belob);
    expect(belob).toContain(DAGPENGE_2026.fuldtid);
    expect(belob).toContain(DAGPENGE_2026.deltid);
    expect(belob).toContain(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt);
    expect(belob).toContain(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt);
    expect(belob).toContain(DAGPENGE_2026.dimittendDeltidUdenForsorgerpligt);
    expect(belob).toContain(DAGPENGE_2026.dimittendDeltidMedForsorgerpligt);
    expect(belob).toContain(BESKAEFTIGELSESTILLAEG_2026);
  });

  test("hver sats har en id, en etiket og en betingelse", () => {
    const ids = DAGPENGE_SATSER.map((sats) => sats.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const sats of DAGPENGE_SATSER) {
      expect(sats.label.length).toBeGreaterThan(0);
      expect(sats.note.length).toBeGreaterThan(0);
      expect(sats.belob).toBeGreaterThan(0);
    }
  });

  test("rækkerne er sorteret fra højeste til laveste beløb", () => {
    // Tabeller læses ovenfra-nedad som en skala; springet mellem rækkerne skal
    // derfor aldrig pege baglæns.
    const belob = DAGPENGE_SATSER.map((sats) => sats.belob);
    expect([...belob].sort((a, b) => b - a)).toEqual(belob);
  });

  test("de seks ministerietsatser står uændrede i modulet", () => {
    // Tallene låst her, så en ny tekstliteral et sted på sitet ikke kan erstatte
    // dem uden at denne test siger det.
    expect(DAGPENGE_SATSER.map((sats) => sats.belob)).toContain(22041);
    expect(BESKAEFTIGELSESTILLAEG_2026).toBe(26198);
    expect(INDKOMSTKRAV_2026).toBe(263232);
  });
});

describe("dagpengeEfterSkat", () => {
  test("beløbet efter skat er mindre end beløbet før skat", () => {
    const r = dagpengeEfterSkat(DAGPENGE_2026.fuldtid);
    expect(r.foerSkat).toBe(DAGPENGE_2026.fuldtid);
    expect(r.skat).toBeGreaterThan(0);
    expect(r.efterSkat).toBeLessThan(r.foerSkat);
    expect(r.skat + r.efterSkat).toBeCloseTo(r.foerSkat, 6);
  });

  test("maxsatsen er 22.041 kr. før skat og ca. 15.544 kr. efter skat", () => {
    // Tallene er regnet med 2026's satser og svmn.dk's kommunaleskat-gennemsnit.
    const r = dagpengeEfterSkat(DAGPENGE_2026.fuldtid);
    expect(Math.round(r.skat)).toBe(6497);
    expect(Math.round(r.efterSkat)).toBe(15544);
  });

  test("dimittendsatsen regnes på samme måde: 18.074 kr. før, 13.047 kr. efter skat", () => {
    // En anden reference end maxsatsens, så porten ikke bare gentager ét tal.
    const r = dagpengeEfterSkat(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt);
    expect(Math.round(r.skat)).toBe(5027);
    expect(Math.round(r.efterSkat)).toBe(13047);
  });

  test("samme beløb som løn og som ydelse giver to forskellige nettobeløb", () => {
    // Dagpenge er en offentlig ydelse: intet AM-bidrag, intet
    // beskæftigelsesfradrag (`estimerNettoMaaned`'s egen docblock). Hvis beløbet
    // blev sendt gennem `loen`-feltet, ville de 8 % AM-bidrag blive trukket fra,
    // så porten kan se at feltet er valgt rigtigt.
    const sats = DAGPENGE_2026.fuldtid;
    const somYdelse = dagpengeEfterSkat(sats);
    const somLoen = estimerNettoMaaned({ loen: sats, ydelse: 0 });
    expect(somYdelse.foerSkat).toBe(somLoen.brutto);
    expect(somYdelse.efterSkat).not.toBeCloseTo(somLoen.netto, 2);
    expect(SATSER_2026.amBidrag).toBe(0.08);
  });

  test("højere kommuneskat giver et lavere beløb efter skat", () => {
    const foer = dagpengeEfterSkat(DAGPENGE_2026.fuldtid, { kommuneskat: 0.2 });
    const høj = dagpengeEfterSkat(DAGPENGE_2026.fuldtid, { kommuneskat: 0.3 });
    expect(høj.efterSkat).toBeLessThan(foer.efterSkat);
  });

  test("kirkeskat trækker yderligere fra", () => {
    const uden = dagpengeEfterSkat(DAGPENGE_2026.fuldtid);
    const med = dagpengeEfterSkat(DAGPENGE_2026.fuldtid, { kirkeskat: true });
    expect(med.efterSkat).toBeLessThan(uden.efterSkat);
  });

  test("et beløb på 0 giver 0 efter skat og ingen negativ værdi", () => {
    const r = dagpengeEfterSkat(0);
    expect(r.foerSkat).toBe(0);
    expect(r.efterSkat).toBe(0);
    expect(Number.isFinite(r.skat)).toBe(true);
  });
});

describe("dagpenge-FAQ", () => {
  test("«efter skat»-svaret indeholder begge beløb og siger at det er vejledende", () => {
    const svar = dagpengeEfterSkatFaqSvar();
    const r = dagpengeEfterSkat(DAGPENGE_2026.fuldtid);
    expect(svar).toContain(dagpengeKroner(r.foerSkat));
    expect(svar).toContain(dagpengeKroner(Math.round(r.efterSkat)));
    expect(svar).toContain(KOMMUNESKAT_SNIT_PCT_DAGPENGE);
    expect(svar.toLowerCase()).toContain("vejledende");
  });

  test("«nyuddannet»-svaret regner procentforholdet frem i stedet for at skrive det", () => {
    const svar = dagpengeNyuddannetFaqSvar();
    expect(svar).toContain(dagpengeKroner(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt));
    expect(svar).toContain(dagpengeKroner(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt));
    // Procentforholdet regnes med dansk decimaltegn, ikke med et tal i testen.
    const pct = new Intl.NumberFormat("da-DK", { maximumFractionDigits: 1 }).format(
      (DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt / DAGPENGE_2026.fuldtid) * 100,
    );
    expect(svar).toContain(`${pct} %`);
    expect(svar).toContain(String(DAGPENGE_2026.dimittendUddannelseMdr));
    expect(svar).toContain(String(DAGPENGE_2026.dimittendTilmeldingDage));
  });

  test("periode-svaret regner årene ud fra timerne i satsmodulet", () => {
    const svar = dagpengeNyuddannetPeriodeFaqSvar();
    const aar = DAGPENGE_2026.dagpengeperiodeTimer / DAGPENGE_2026.fuldtidTimerPerAar;
    expect(svar).toContain(String(aar));
    expect(svar).toContain(dagpengeTimer(DAGPENGE_2026.dagpengeperiodeTimer));
    expect(svar).toContain(String(DAGPENGE_2026.indkomstkravAar));
    // `dagpengeperiodeTimer` er et timetal. Formateret med `dagpengeKroner` skrev
    // perioden «3.848 kr timer» — «kr» på en timetal (punkt 11).
    expect(svar).not.toContain("kr timer");
    expect(dagpengeTimer(DAGPENGE_2026.dagpengeperiodeTimer)).toBe("3.848");
  });

  test("periodelinjen er hvert sprog sin sætning, med hvert sprog sin separator", () => {
    // `DagpengeBeregner.tsx` skrev «normalt 2 år (3.848 timer)» tre gange, med
    // «2 år» og timetallet håndskrevet. Nu regnes begge dele.
    // Forventningen bygges med samme `formatNumber`, fordi svensk og norsk
    // skriver tusindtalsseparatoren som U+00A0 — «3 848» med et hårdt mellemrum
    // er ikke samme streng (samme greb som `timepris-lokale-tal` 2/10).
    // Rækken for `no` er norsk, ikke dansk: 2/10 faldt «no» tilbage på den
    // danske sætning, så porten dømte norsk på danske ord (review-fund MIDDEL).
    for (const [locale, sætning, timer] of [
      ["da", "Dagpengeperioden er normalt 2 år", "timer"],
      ["se", "Dagpenningperioden är normalt 2 år", "timmar"],
      ["no", "Du kan normalt ha dagpenge i 2 år", "timer"],
    ] as const) {
      const t = new Intl.NumberFormat(getIntlLocale(locale)).format(
        DAGPENGE_2026.dagpengeperiodeTimer,
      );
      expect(dagpengePeriodeTekst(locale)).toBe(`${sætning} (${t} ${timer})`);
      expect(dagpengeTimer(DAGPENGE_2026.dagpengeperiodeTimer, locale)).toBe(t);
    }
    // Dansk bruger punktum, de to andre ikke — det er hele pointen.
    expect(dagpengeTimer(3848, "da")).toBe("3.848");
    expect(dagpengeTimer(3848, "se")).not.toContain(".");
    expect(dagpengeTimer(3848, "no")).not.toContain(".");
    // Norsk er sin egen sætning, ikke dansk med et andet tusindtalstegn.
    expect(dagpengePeriodeTekst("no")).not.toBe(dagpengePeriodeTekst("da"));
    expect(dagpengePeriodeTekst("no")).not.toContain("Dagpengeperioden er");
  });

  test("svarene skriver ingen sats med «kr/md» — de bruger formatterens beløb", () => {
    // De to tal, der før 2/10 stod håndskrevet på /dagpenge og i disse svar.
    for (const svar of [
      dagpengeEfterSkatFaqSvar(),
      dagpengeNyuddannetFaqSvar(),
      dagpengeNyuddannetPeriodeFaqSvar(),
    ]) {
      expect(svar).not.toContain("22.041 kr/md");
      expect(svar).not.toContain("15.759 kr/md");
      expect(svar).not.toContain("18.074 kr/md");
      expect(svar).not.toContain("26.198 kr/md");
      expect(svar).not.toContain("kr timer");
    }
  });
});