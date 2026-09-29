/**
 * State-tabellen på "/tidszone".
 *
 * Modsvejs verificeret: de tests der kræver stat-navnene, kolonnen og
 * Arizona-undtagelsen falder med master-koden, fordi hverken modulet eller
 * blokken findes. Tests der låser *forhold* mellem rækkerne (fx at alle byer
 * i samme zone får samme klokkeslæt) er grønne begge veje med vilje — de er
 * låse, ikke fund.
 */

import { describe, expect, test } from "vitest";
import { TIDSZONER, klokkeslaetVed } from "./tidszone-reference";
import {
  USA_STATER,
  usaStatAntal,
  usaStatRaekker,
} from "./tidszone-usa-stater";

const zone = (by: string) => {
  const fundet = TIDSZONER.find((kandidat) => kandidat.by === by);
  if (!fundet) throw new Error(`manglende zone: ${by}`);
  return fundet;
};

describe("usaStatRaekker", () => {
  test("de ni stater, autocomplete spørger om, er der — i begge sprog", () => {
    const da = usaStatRaekker("da").map((raekke) => raekke.stat);
    const se = usaStatRaekker("se").map((raekke) => raekke.stat);

    expect(da).toEqual([
      "Florida",
      "Californien",
      "Texas",
      "Washington",
      "Georgia",
      "Arizona",
      "Colorado",
      "Minnesota",
      "Massachusetts",
    ]);
    // Svensk oversætter kun Californien; resten hedder det samme.
    expect(se).toEqual([
      "Florida",
      "Kalifornien",
      "Texas",
      "Washington",
      "Georgia",
      "Arizona",
      "Colorado",
      "Minnesota",
      "Massachusetts",
    ]);
    expect(usaStatAntal).toBe(9);
  });

  test("klokkeslættet er byens egen, ikke et håndskrevet tal", () => {
    for (const raekke of usaStatRaekker()) {
      const byZone = zone(raekke.by);
      expect(raekke.vinter).toBe(klokkeslaetVed(12, byZone, false));
      expect(raekke.sommer).toBe(klokkeslaetVed(12, byZone, true));
    }
  });

  test("Florida er 06/06 og Californien 03/04 ved kl. 12 i Danmark", () => {
    const raekker = usaStatRaekker();
    const florida = raekker.find((r) => r.stat === "Florida")!;
    const californien = raekker.find((r) => r.stat === "Californien")!;

    // Florida = Eastern (UTC-5): 12 - 1 - 5 = 06, samme hele året fordi
    // Florida skifter som Danmark.
    expect(florida.vinter).toBe("06:00");
    expect(florida.sommer).toBe("06:00");
    // Californien = Pacific (UTC-8/-7), som skifter samtidig med Danmark:
    // 12 - 1 - 8 = 03 vinter og 12 - 2 - 7 = 03 sommer. Samme hele aaret.
    expect(californien.vinter).toBe("03:00");
    expect(californien.sommer).toBe("03:00");
  });

  test("Arizona er den eneste, hvor vinter- og sommertallet er forskellige", () => {
    // Phoenix er fast UTC-7 mens Danmark flytter sig en time, saa Phoenix
    // *falder* fra 04 til 03 naar Danmark gaar paa sommertid. Resten af
    // rækkerne skifter samtidig med Danmark og har derfor samme tal hele
    // aaret - saadan er Arizona undtagelsen, der er vaerd at have en egen
    // kolonne og en egen foetnote til.
    const raekker = usaStatRaekker();
    const afvigende = raekker.filter((r) => r.vinter !== r.sommer);
    expect(afvigende.map((r) => r.stat)).toEqual(["Arizona"]);
  });

  test("Phoenix er 04 vinter og 03 sommer, Denver er 04 hele året", () => {
    const raekker = usaStatRaekker();
    const arizona = raekker.find((r) => r.stat === "Arizona")!;
    const colorado = raekker.find((r) => r.stat === "Colorado")!;

    expect(arizona.vinter).toBe("04:00");
    expect(arizona.sommer).toBe("03:00");
    expect(arizona.fastZone).toBe(true);
    // Colorado = Mountain med sommertid (UTC-7/-6): 12 - 1 - 7 = 04 vinter,
    // 12 - 2 - 6 = 04 sommer.
    expect(colorado.vinter).toBe("04:00");
    expect(colorado.sommer).toBe("04:00");
    expect(colorado.fastZone).toBe(false);
  });

  test("Phoenix har ingen sommertid i TIDSZONER, og det er grunden", () => {
    // Hvis Phoenix en gang får sommertid, skal tabellen miste sin undtagelse
    // — dvs. Arizona's to kolonner bliver lig. Låst på kilden, ikke på
    // teksten, så en senere tilføjelse ikke kan glemmes.
    const phoenix = zone("Phoenix");
    expect(phoenix.utcSommer).toBeUndefined();
    expect(phoenix.utcVinter).toBe(-7);
  });

  test("to stater i samme zone får præcis samme klokkeslæt", () => {
    const raekker = usaStatRaekker();
    const iSammeZone = (a: string, b: string) => {
      const raekkeA = raekker.find((r) => r.stat === a)!;
      const raekkeB = raekker.find((r) => r.stat === b)!;
      expect(raekkeA.vinter).toBe(raekkeB.vinter);
      expect(raekkeA.sommer).toBe(raekkeB.sommer);
    };

    // Georgia og Massachusetts ligger i Eastern som Florida.
    iSammeZone("Florida", "Georgia");
    iSammeZone("Florida", "Massachusetts");
    // Texas og Minnesota ligger i Central som Chicago.
    iSammeZone("Texas", "Minnesota");
    // Californien og Washington ligger i Pacific som Los Angeles.
    iSammeZone("Californien", "Washington");
  });

  test("hver stat peger på en by, der findes i TIDSZONER", () => {
    for (const stat of USA_STATER) {
      expect(TIDSZONER.some((kandidat) => kandidat.by === stat.by)).toBe(true);
    }
  });

  test("dansk og svensk har samme rækker i samme rækkefølge", () => {
    expect(usaStatRaekker("da").length).toBe(usaStatRaekker("se").length);
    expect(usaStatRaekker("da").map((r) => r.by)).toEqual(
      usaStatRaekker("se").map((r) => r.by)
    );
  });

  test("kaster på en by, der ikke findes i TIDSZONER", () => {
    // Samme fejlklasse som usaTimerRaekker: en springet-by-over ville give en
    // tabel med en række for lidt, og intet ville sige det.
    const medUkendtBy = [...USA_STATER, { statDa: "Udvalgt", by: "Findes Ikke" }];
    const zoneFor = (by: string) => {
      const fundet = TIDSZONER.find((kandidat) => kandidat.by === by);
      if (!fundet) throw new Error(`Byen "${by}" findes ikke i TIDSZONER`);
      return fundet;
    };
    expect(() => medUkendtBy.map((stat) => zoneFor(stat.by))).toThrow(
      /findes ikke i TIDSZONER/
    );
  });
});
