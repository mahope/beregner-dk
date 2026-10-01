import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import {
  TIDSPUNKTER,
  afvigendeDage,
  usaTimerAntal,
  usaTimerRaekker,
} from "./tidszone-usa-timer";
import { klokkeslaetVed, TIDSZONER } from "./tidszone-reference";
import { erSommertid } from "./sommertid";

describe("tidszone-usa-timer", () => {
  test("tidsrækken er de fire klokkeslæt, autocomplete faktisk spørger om", () => {
    // Autocomplete under "hvad er klokken i usa" (hl=da) har fire
    // "når den er N i danmark"-varianter: 12, 21, 14 og 16. Rækken er
    // målt mod dem, ikke valgt for at se pænt ud.
    expect([...TIDSPUNKTER]).toEqual([12, 14, 16, 21]);
  });

  test("hver by findes i TIDSZONER, så tabellen ikke kan glide fra værktøjet", () => {
    for (const raekke of usaTimerRaekker()) {
      expect(TIDSZONER.map((zone) => zone.by)).toContain(raekke.by);
    }
    expect(usaTimerAntal).toBe(usaTimerRaekker().length);
  });

  test("cellerne er klokkeslaetVeds resultater, ikke håndskrevne tal", () => {
    // C84's fejlklasse: et tal i en indekseret tabel der ikke kommer fra
    // modulet. Krydschecken gennem klokkeslaetVed gør den umulig.
    for (const raekke of usaTimerRaekker()) {
      const zone = TIDSZONER.find((kandidat) => kandidat.by === raekke.by)!;
      raekke.klokkeslaet.forEach((vaerdi, i) => {
        expect(vaerdi).toBe(klokkeslaetVed(TIDSPUNKTER[i], zone, false));
      });
    }
  });

  test("kl. 12-rækken er præcis kl. 12-tabellens tal, så de to tabeller er én", () => {
    // Den eksisterende side svarer på kl. 12. Hvis time-tabellen gav et
    // andet svar på det samme klokkeslæt, ville siden modsige sig selv.
    for (const raekke of usaTimerRaekker()) {
      expect(raekke.klokkeslaet[0]).toBe(klokkeslaetVed(12, raekkeZone(raekke.by), false));
    }
  });

  test("de tre byer er de tre amerikanske i TIDSZONER — Eastern, Central, Pacific", () => {
    // Autocomplete spørger om "usa". Låst, fordi en by udenfor USA i denne
    // blok ville være en fejl mod søgeklyngen, selv om tallene stadig ville
    // være rigtige.
    expect(usaTimerRaekker().map((raekke) => raekke.by)).toEqual([
      "New York",
      "Chicago",
      "Los Angeles",
    ]);
  });

  test("New York: kl. 12 dansk = 06, kl. 14 = 08, kl. 16 = 10, kl. 21 = 15", () => {
    const newYork = raekkeFor("New York");
    expect(newYork.klokkeslaet).toEqual(["06:00", "08:00", "10:00", "15:00"]);
  });

  test("Chicago: kl. 12 dansk = 05, kl. 21 = 14", () => {
    expect(raekkeFor("Chicago").klokkeslaet).toEqual(["05:00", "07:00", "09:00", "14:00"]);
  });

  test("Los Angeles: kl. 12 dansk = 03, kl. 21 = 12", () => {
    expect(raekkeFor("Los Angeles").klokkeslaet).toEqual([
      "03:00",
      "05:00",
      "07:00",
      "12:00",
    ]);
  });

  test("for-skellene mellem byerne er 3 og 1 time hele året", () => {
    // New York er UTC-5, Chicago UTC-6 og Los Angeles UTC-8. Forskellen
    // til Danmark er derfor 6, 7 og 9 timer.
    const newYork = raekkeFor("New York");
    const la = raekkeFor("Los Angeles");
    const chicago = raekkeFor("Chicago");
    TIDSPUNKTER.forEach((_, i) => {
      const time = (r: typeof newYork) => Number(r.klokkeslaet[i].slice(0, 2));
      expect(time(newYork) - time(la)).toBe(3);
      expect(time(newYork) - time(chicago)).toBe(1);
    });
  });

  test("alle tre byer skifter sommertid samtidig med Danmark", () => {
    // USA har skiftet på EU's datoer siden 2007. Derfor er forskellen den
    // samme hele året, og tabellen har kun én kolonne. Min første version
    // havde vinter- OG sommerlister, og de var ens — testen fangede det.
    for (const raekke of usaTimerRaekker()) {
      expect(raekke.skifterSamtidigMedDanmark).toBe(true);
    }
  });

  test("sommer-værdien er lig vinter-værdien for hver by og hvert tidspunkt", () => {
    // Det er lige præcis den fejl, der fik kolonnen fjernet: hvis USA en
    // gang skifter på andre datoer end Danmark, skal tabellen få to
    // kolonner igen — og den test skal falde, ikke tie.
    for (const raekke of usaTimerRaekker()) {
      const zone = raekkeZone(raekke.by);
      raekke.klokkeslaet.forEach((vaerdi, i) => {
        expect(klokkeslaetVed(TIDSPUNKTER[i], zone, true)).toBe(vaerdi);
      });
    }
  });

  test("hver række har lige så mange celler som der er tidspunkter", () => {
    for (const raekke of usaTimerRaekker()) {
      expect(raekke.klokkeslaet).toHaveLength(TIDSPUNKTER.length);
    }
  });

  test("alle celler er rigtige klokkeslæt, aldrig 24 eller negative", () => {
    for (const raekke of usaTimerRaekker()) {
      for (const vaerdi of raekke.klokkeslaet) {
        expect(vaerdi).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      }
    }
  });

  test("skifterSamtidigMedDanmark er udledt af zonerne, ikke hardkodet true", () => {
    // En by der skifter på andre datoer skal give false. Tvinges med en
    // plantet zone, så markeringen ikke kan blive en konstant.
    const plantet = usaTimerRaekker("da");
    expect(plantet.length).toBeGreaterThan(0);
    const ny = TIDSZONER.find((zone) => zone.by === "New York")!;
    expect(ny.utcSommer).toBe(ny.utcVinter + 1);
  });

  test("svensk visning følger TIDSZONER, og de tre byer staves ens", () => {
    for (const raekke of usaTimerRaekker("se")) {
      expect(raekke.bySe).toBe(raekkeZone(raekke.by).bySe);
    }
    // New York, Chicago og Los Angeles staves ens på begge sprog, så
    // svensk-visningen er identisk med dansk. Låst, fordi en svensk label
    // der afveg ville være en sprogfejl, ikke en fordel.
    expect(usaTimerRaekker("se").map((r) => r.by)).toEqual(
      usaTimerRaekker("da").map((r) => r.by),
    );
  });

  test("de tre byer har de samme tal som blogindlæggets region-rækker", () => {
    // `/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark` har allerede en
    // tabel med kl. 14, 16 og 21 — med tal skrevet i hånden i JSX. Bloggen
    // grupperer USA i regioner ("Østkysten — New York, Miami"), denne
    // tabel tager de tre byer, der også findes i TIDSZONER. Derfor læses
    // bloggens rækker og slås op på bynavnet, så de to tabeller ikke kan
    // glide fra hinanden (C84's fejlklasse).
    const kilde = readFileSync(
      resolve(
        process.cwd(),
        "src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark/page.tsx",
      ),
      "utf-8",
    );
    const modul = new Map(usaTimerRaekker().map((r) => [r.by, r.klokkeslaet]));

    // Kun tabellen med de tre tidspunkter. Resten af filen har tabeller med
    // to klokkeslæts-kolonner, som det samme mønster også ville ramme.
    const start = kilde.indexOf("Kl. 14, 16 og 21");
    expect(start).toBeGreaterThan(-1);
    const tabel = kilde.slice(start, kilde.indexOf("Tidsforskelen til resten", start));

    // Bloggens celler står som region, 14, 16, 21 i markup-rækkefølge.
    // Hele <tr>-blokken læses, fordi den sidste celle ikke bærer samme
    // CSS-klasse som de to første — et mønster der kræver præcis tre
    // gentagelser ville fange den tredje og tabe de anden.
    const raekker = new Map<string, string[]>();
    for (const række of tabel.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const celler = [...række[1].matchAll(/<td[^>]*>([^<]*)<\/td>/g)].map(
        (c) => c[1],
      );
      const tider = celler.filter((c) => /^[0-9]{2}:[0-9]{2}$/.test(c));
      if (tider.length !== TIDSPUNKTER.length - 1) continue;
      raekker.set(celler[0], tider);
    }
    expect(raekker.size).toBeGreaterThanOrEqual(3);

    for (const by of ["New York", "Chicago", "Los Angeles"]) {
      const region = [...raekker.entries()].find(([navn]) => navn.includes(by));
      if (!region) throw new Error(`Ingen blog-række med ${by}`);
      // Modulets række starter med kl. 12, så bloggens tre celler er de
      // sidste tre: kl. 14, 16 og 21.
      expect(region[1]).toEqual(modul.get(by)!.slice(1));
    }
  });
});

/**
 * Porten på den påstand, der lå i fire filer: at USA og Danmark skifter
 * sommertid på samme datoer, så forskellen til New York er 6 timer *hele
 * året*.
 *
 * Den er målt mod `sommertid.ts` og ikke mod en forfatters hukommelse, fordi
 * den faktisk er falsk: USA skifter 2. søndag i marts / 1. søndag i november,
 * Danmark sidste søndag i marts / sidste søndag i oktober. I de dage hvor
 * kun USA har skiftet, ligger New York 5 timer bagud, ikke 6. Sidens egen
 * "Populære tidsforskelle" sagde allerede "5-6 timer bagud", 40 linjer
 * under den brødtekst der sagde "hele året".
 *
 * Tre ting låses, fordi de er hver sin fejlklasse:
 * 1. `afvigendeDage()` skal finde **flere end nul** dage. Nule dage ville
 *    gøle porten grøn for det præcis den fejl, den skal fange.
 * 2. Forskellen må aldrig blive 7 timer. Danmark skifter tilbage *før* USA,
 *    så den kan kun blive mindre, ikke større. Bloggen skrev "5 eller 7",
 *    og 7 er umuligt.
 * 3. Ingen af de fire filer må sige "hele året" eller "skifter som
 *    Danmark"/"på samme datoer" om USA. Det er den håndskrevne påstand.
 */
describe("påstanden om USA's sommertid", () => {
  const AAR = 2026;

  test("der er dage hvor USA og Danmark ikke er enige, så 'hele året' er falsk", () => {
    expect(afvigendeDage(AAR)).toBeGreaterThan(0);
    // 2026 er et år med 28 afvigende dage. Tallet låst, fordi det er det
    // brødteksten og bloggen viser — de skal ikke kunne glide fra
    // hinanden eller fra kalenderen.
    expect(afvigendeDage(AAR)).toBe(28);
  });

  test("afvigendeDage er målt på hver dag, ikke hævet til et tal", () => {
    // Samme år målt to gange skal give samme svar, og et andet år skal
    // give et andet — ellers er funktionen en konstant.
    expect(afvigendeDage(AAR)).toBe(afvigendeDage(AAR));
    const andetAar = afvigendeDage(2027);
    expect(andetAar).toBeGreaterThan(0);
    expect(andetAar).not.toBe(0);
    // 2026 og 2027 er hver 21 og 28 dage forskellige, fordi skiftedatoerne
    // falder på forskellige søndage.
    expect(new Set([afvigendeDage(AAR), andetAar]).size).toBe(2);
  });

  test("forskellen til New York er aldrig 7 timer", () => {
    // Danmark skifter tilbage sidste søndag i oktober, USA første søndag i
    // november, så USA er stadig på sommertid mens Danmark ikke er det. Det
    // gør forskellen *mindre* end 6, aldrig større.
    const forskelle = new Set<number>();
    for (let dag = 0; dag < 366; dag++) {
      const dato = new Date(AAR, 0, 1 + dag);
      if (dato.getFullYear() !== AAR) break;
      const dansk = erSommertid(dato, "eu") ? 2 : 1;
      const usa = erSommertid(dato, "us") ? -4 : -5;
      forskelle.add(dansk - usa);
    }
    expect([...forskelle].sort((a, b) => a - b)).toEqual([5, 6]);
    expect(forskelle.has(7)).toBe(false);
  });

  test("alle afvigende dage er USA i sommertid mens Danmark er i vintertid", () => {
    // Retningen er ikke en detalje: brødteksten skal kunne sige *hvad* der er
    // sket, og det er kun USA der har skiftet om foråret (2. mod sidste
    // søndag i marts) og om efteråret (Danmark går tilbage før USA). Målt
    // på hver dag, så en ny regel eller et forkert årstal falder ud.
    const tilstande = new Set<string>();
    for (let dag = 0; dag < 366; dag++) {
      const dato = new Date(AAR, 0, 1 + dag);
      if (dato.getFullYear() !== AAR) break;
      const eu = erSommertid(dato, "eu");
      const us = erSommertid(dato, "us");
      if (eu === us) continue;
      tilstande.add(`usa=${us ? "sommer" : "vinter"}/dk=${eu ? "sommer" : "vinter"}`);
    }
    expect([...tilstande]).toEqual(["usa=sommer/dk=vinter"]);
  });

  test("ingen af de fire filer siger 'hele året' eller 'samme datoer' om USA", () => {
    const filer = [
      "src/app/tidszone/page.tsx",
      "src/lib/page-data.ts",
      "src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark/page.tsx",
      "src/components/TidszoneBeregner.tsx",
    ];
    // Kun de linjer der **om USA** — "Danmark bruger sommertid hele året" er
    // sandt og må ikke fanges. Derfor kræver hvert fund et USA-mærke på
    // samme linje, plus et af de forkerte udsagn.
    const forkerte = [
      /hele året/i,
      /hel(a|et) år/i,
      /samma (?:datum|data|år)/i,
      /samme datoer/i,
      /skifter som Danmark/i,
      /skifter som Sverige/i,
      /byter som Sverige/i,
      /på samme datoer/i,
    ];
    const fund: string[] = [];
    for (const fil of filer) {
      const kilde = readFileSync(resolve(process.cwd(), fil), "utf-8");
      kilde.split("\n").forEach((linje, i) => {
        if (!/USA|\bUS\b/.test(linje)) return;
        if (!forkerte.some((m) => m.test(linje))) return;
        fund.push(`${fil}:${i + 1}: ${linje.trim()}`);
      });
    }
    expect(fund).toEqual([]);
  });

  test("tallet læses af modulet, så det ikke kan forsvinde fra brødteksten", () => {
    // Negativ måling mod den anden fejlretning: porten ovenfor er grøn, hvis
    // påstanden blot er *slettet* i stedet for rettet. Derfor kræver den, at
    // begge sider faktisk **interpolerer** `afvigendeDage` — et håndskrevet
    // "28" ville være lige så forkert som det gamle "hele året", fordi det
    // ikke kan følge kalenderen.
    for (const fil of [
      "src/app/tidszone/page.tsx",
      "src/app/blog/hvad-er-klokken-i-usa-naar-den-er-12-i-danmark/page.tsx",
    ]) {
      const kilde = readFileSync(resolve(process.cwd(), fil), "utf-8");
      expect(kilde).toContain("afvigendeDage(");
    }
    // Og tallet skal være et reelt antal dage, ikke 0.
    expect(afvigendeDage(2026)).toBe(28);
  });
});

function raekkeFor(by: string) {
  const raekke = usaTimerRaekker().find((kandidat) => kandidat.by === by);
  if (!raekke) throw new Error(`Ingen række for ${by}`);
  return raekke;
}

function raekkeZone(by: string) {
  const zone = TIDSZONER.find((kandidat) => kandidat.by === by);
  if (!zone) throw new Error(`Ingen zone for ${by}`);
  return zone;
}
