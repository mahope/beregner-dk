// Tiden låses, fordi `dageTilDecember` læser dagens dato — ellers ville
// porten kun være grøn på den dag den er skrevet, og dagen efter ville
// `new Date()` give et andet svar end de forventede tal.
process.env.TZ = "Europe/Copenhagen";

import { describe, expect, test } from "vitest";
import { dageTilDato, dageTilDecember, naesteJuleaften } from "./dage-mellem-datoer";

/** En dato ved **dagens** klokkeslæt i sidens egen tidszone. */
function dag(iso: string): Date {
  const [aar, maaned, dato] = iso.split("-").map(Number);
  return new Date(aar, maaned - 1, dato, 12, 0, 0);
}

describe("dageTilDecember", () => {
  // /dato har 131.320 visninger og 0,7 % CTR, og GSC's to største søgninger
  // er «hvor mange dage er der til 1 december» (1.219 v, pos. 5) og «hvor
  // mange dage er der til den 24 december» (1.001 v, pos. 5). Titlen skal
  // derfor regne nedtællingen — og den gjorde det ikke før 4/10, da den skrev
  // «1. jan. 2026→2027 = 365», et interval der i svensk læses som «365 dage
  // kvar». Tallene her er modbevis mod den gamle kode: `heleDageMellem` giver
  // præcis disse tal, og 58 er det der står i `metaTitle` 4/10.
  test("dansk: 4/10 2026 er der 58 dage til 1. december", () => {
    const e = dageTilDecember("da", dag("2026-10-04"));
    expect(e.dage).toBe(58);
    expect(e.decemberIso).toBe("2026-12-01");
    expect(e.decemberTekst).toBe("1. december");
    expect(e.kort).toBe("58 dage");
  });

  test("svensk: samme dag, eget format", () => {
    const e = dageTilDecember("se", dag("2026-10-04"));
    expect(e.dage).toBe(58);
    expect(e.decemberTekst).toBe("1 december");
    expect(e.kort).toBe("58 dagar");
  });

  // Nyårsdag er det længste interval i året, og det er det kun 333 dage fordi
  // 2027 ikke er skudår — en titel der siger «365 dage tilbage» i januar
  // ville være den samme løgn som den gamle titel var i svensk.
  test("januar: der er 333 dage til 1. december 2027", () => {
    expect(dageTilDecember("da", dag("2027-01-02")).dage).toBe(333);
  });

  // Skudår: februar har 29 dage, så 2028 har **334** dage fra 2. januar.
  // Den gamle titel skrev «= 365» som håndskrevet bogstav, altså ville den
  // have sagt 365 for et interval der er 366 dage.
  test("skudår: 2/1 2028 er der 334 dage til 1. december", () => {
    expect(dageTilDecember("da", dag("2028-01-02")).dage).toBe(334);
  });

  // På selve 1. december må titlen ikke sige «0 dage» — «hvor mange dage er der
  // til 1. december» spørger på den næste, og det er næste år.
  test("på 1. december regnes der til næste år, ikke til 0 dage", () => {
    const e = dageTilDecember("da", dag("2026-12-01"));
    expect(e.decemberIso).toBe("2027-12-01");
    expect(e.dage).toBe(365);
    expect(e.kort).not.toBe("0 dage");
  });

  // Tæt på skiftet: 30/11 er 1 dag, 2/12 er 364 dage. Uden denne er en
  // fasefejl i `>=` usynlig, fordi de øvrige tal stadig er plausible.
  test("dagen før og dagen efter 1. december", () => {
    expect(dageTilDecember("da", dag("2026-11-30")).dage).toBe(1);
    expect(dageTilDecember("da", dag("2026-12-02")).dage).toBe(364);
  });

  // Tallene i `Intl` afhænger af default-locale på maskinen, så datoens navn
  // dømmes på den del, der er sproget: «december» i begge, med punktum kun på
  // dansk.
  test("datoens navn er ikke formateret med årets første dag", () => {
    const e = dageTilDecember("da", dag("2026-10-04"));
    expect(e.decemberTekst).not.toMatch(/2026/);
    expect(e.decemberTekst.toLowerCase()).toContain("december");
  });
});
describe("naesteJuleaften", () => {
  // Standarden i værktøjets nye tilstand. GSC's to største søgninger på `/dato`
  // er «hvor mange dage er der til 1 december» (1.282 v, pos. 5) og «…til den
  // 24 december» (1.036 v, pos. 5), så den dato skal være valgt uden at læseren
  // rører feltet.
  test("i oktober er det årets juleaften", () => {
    expect(naesteJuleaften("da", dag("2026-10-06"))).toBe("2026-12-24");
    expect(naesteJuleaften("se", dag("2026-10-06"))).toBe("2026-12-24");
  });

  // På selve juleaften skal svaret ikke være «0 dage» — juleaften 2027 er den
  // næste, og den er en fredag, så et årstal der hang på 2026 ville være en
  // påstand uden dækning.
  test("på juleaften peger feltet på næste år, og dagen efter også", () => {
    expect(naesteJuleaften("da", dag("2026-12-24"))).toBe("2026-12-24");
    expect(naesteJuleaften("da", dag("2026-12-25"))).toBe("2027-12-24");
  });
});

describe("dageTilDato", () => {
  // 6. oktober 2026 → 24. december 2026 er 79 dage = 11 hele uger + 2 dage, og
  // 24. december 2026 er en torsdag. Uden den ugedag kan læseren ikke se, om
  // de skal gå ud lørdag eller på en hverdag.
  test("dansk: 6/10 2026 er der 79 dage til juleaften", () => {
    const e = dageTilDato("da", "2026-12-24", dag("2026-10-06"));
    expect(e?.dage).toBe(79);
    expect(e?.uger).toBe(11);
    expect(e?.restDage).toBe(2);
    expect(e?.datoTekst).toBe("24. december 2026");
    expect(e?.ugedagTekst).toBe("torsdag");
    expect(e?.overskredet).toBe(false);
    expect(e?.sætning).toBe("Der er 79 dage til 24. december 2026, som er en torsdag.");
  });

  // Samme regnestykke på svensk: intet med punktum i datoen, og «är» i stedet
  // for «er».
  test("svensk: samme dag, eget format og egen sætning", () => {
    const e = dageTilDato("se", "2026-12-24", dag("2026-10-06"));
    expect(e?.dage).toBe(79);
    expect(e?.datoTekst).toBe("24 december 2026");
    expect(e?.sætning).toBe("Det är 79 dagar till 24 december 2026, som är en torsdag.");
  });

  // Ét tal, ét ord. Dansk og svensk har begge to former, og «1 dage» i den
  // sætning brugeren kopierer er en fejl — `DatoBeregner`-porten dømmer
  // allerede den fejl i dage-mellem-tilstanden.
  test("én dag får «1 dag», og dagens dato får 0", () => {
    expect(dageTilDato("da", "2026-10-07", dag("2026-10-06"))?.sætning).toBe(
      "Der er 1 dag til 7. oktober 2026, som er en onsdag."
    );
    const nul = dageTilDato("da", "2026-10-06", dag("2026-10-06"));
    expect(nul?.dage).toBe(0);
    expect(nul?.uger).toBe(0);
    expect(nul?.sætning).toContain("Der er 0 dage til 6. oktober 2026");
  });

  // En dato i fortiden er ikke en fejl — «hvor mange dage siden jul» er et
  // lige så almindeligt spørgsmål. Negativt tal i en nedtælling ville være
  // svært at læse, så sætningen vender sig i stedet.
  test("en dato i fortiden tælles baglæns og siger det i sætningen", () => {
    const e = dageTilDato("da", "2026-01-01", dag("2026-10-06"));
    expect(e?.dage).toBe(-278);
    expect(e?.overskredet).toBe(true);
    expect(e?.uger).toBe(39);
    expect(e?.restDage).toBe(5);
    expect(e?.sætning).toBe(
      "Der er gået 278 dage siden 1. januar 2026, som var en torsdag."
    );
  });

  // 25.–26. oktober 2026 er skiftet tilbage, så der går 25 timer mellem de to
  // midnat. Tælles der på millisekunder, bliver svaret 2 dage for to datoer der
  // er præcis én dag hinanden — `heleDageMellem` tæller på kalenderfelterne.
  test("et skifte for sommertid tælles som én dag, ikke to", () => {
    expect(dageTilDato("da", "2026-10-25", dag("2026-10-24"))?.dage).toBe(1);
    expect(dageTilDato("da", "2026-10-26", dag("2026-10-24"))?.dage).toBe(2);
  });

  // Et tomt felt eller en umulig dato må ikke blive `NaN dage` på siden.
  test("et felt brugeren ikke har udfyldt giver intet svar", () => {
    expect(dageTilDato("da", "", dag("2026-10-06"))).toBeNull();
    expect(dageTilDato("da", "2026-02-31", dag("2026-10-06"))).toBeNull();
    expect(dageTilDato("da", "24-12-2026", dag("2026-10-06"))).toBeNull();
  });

  // Skudårsdagen: 29. februar 2028 skal kunne vælges, og et interval der
  // krydser skiftet mellem februar og marts skal tælle 29 dage i februar.
  test("et skudår tælles med sin 29. februar", () => {
    expect(dageTilDato("da", "2028-03-01", dag("2028-02-01"))?.dage).toBe(29);
  });
});
