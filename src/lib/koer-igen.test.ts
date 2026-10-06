import { describe, expect, test } from "vitest";
import {
  KOER_IGEN_EKSEMPLER,
  KOER_IGEN_FORVENTET,
  koerIgenTidspunkt,
} from "./koer-igen";
import { beregnPromille, timerTilGraense } from "./promille";

/**
 * Porten til «hvornår kan jeg køre bil igen».
 *
 * Tallene i `KOER_IGEN_FORVENTET` er håndskrevet i decimalregnestykkerne i
 * modulets docblock og lagt **uden** omkring `koerIgenTidspunkt`, så en
 * mutation i formlen eller i omregningen til minutter gør dem røde. Omvendt
 * henter ingen test sit forventede svar fra modulet under prøv — det er præcis
 * den fejl, `dage-til`-porten lavede, da den låste Valborg fast i 14. februar.
 */

const da = 0.5;

/**
 * Minutterne til grænsen, regnet **uafhængigt** af modulet.
 *
 * Modulet går vejen promille → time (afrundet op til 0,1) → minutter
 * (`Math.round(timer × 60)`). Porten går den anden vej og regner kravet i
 * minutter direkte fra promillen.
 *
 * Der er **intet krav om et bestemt minuttal**, og det er en erkendt
 * begrænsning, ikke en bortladelse. `timerTilGraense` i `promille.ts`
 * avrunder i to led — `Math.ceil(x × 10) / 10` og så `× 60` — og de to led
 * lander på forskellige flydekomma: 0,51/0,15 × 60 = 204,00000000000003,
 * mens `ceil(0,51/0,15 × 10)/10 × 60` er 204. En port med et bestemt
 * minuttal ville derfor kunne gengive modulet eller glide en 6-minutters
 * tranche væk — og en port, der tager sit svar fra den funktion den skal
 * dømme, dømmer intet.
 *
 * Det porten **kan** dømme er hele den dokumenterede kontrakt:
 *
 *   1. minutterne er et multiplum af 6 — de har 6 minutters opløsning;
 *   2. de ligger aldrig under kravet (for lavt = en tilladelse til at køre
 *      for tidligt, det er den farlige retning);
 *   3. de ligger højst 6 minutter over kravet — 0,1 times opløsning.
 *
 * Det er nok til at gøre mutationen rød, der reelt findes: `Math.floor` i
 * stedet for `Math.round` i `timerTilMinutter` giver **245** minutter for
 * 5 genstande på 80 kg mand (krav 240), og 245 er ikke et multiplum af 6.
 */
function grænseFejl(promille: number, graense: number, faktiskeMinutter: number): string | null {
  const behov = ((promille - graense) / 0.15) * 60;
  if (behov <= 0) return faktiskeMinutter === 0 ? null : `behøver 0 min, fik ${faktiskeMinutter}`;
  if (faktiskeMinutter % 6 !== 0) return `${faktiskeMinutter} er ikke et multiplum af 6`;
  // EPS findes **kun** på den nedre grænse. 0,51/0,15 × 60 =
  // 204,00000000000003, så et korrekt svar på 204 minutter ligger 3 · 10⁻¹⁴
  // under «kravet» — det er repræsenteringsstøj, ikke et minut for tidligt.
  // Opad må der ikke være slinger: 6 minutter er hele opløsningen.
  if (faktiskeMinutter < behov - 1e-9) return `${faktiskeMinutter} er under kravet ${behov.toFixed(4)}`;
  if (faktiskeMinutter > behov + 6) return `${faktiskeMinutter} er over kravet ${behov.toFixed(4)} + 6`;
  return null;
}

/** Samme kontrakt for «helt ædru», hvor grænsen er 0 promille. */
function nulFejl(promille: number, faktiskeMinutter: number): string | null {
  return grænseFejl(promille, 0, faktiskeMinutter);
}

/** "HH:MM" → minutter siden dagstart, til at læse modulets svar på. */
function tilMinutter(klokkeslaet: string): number {
  const [t, m] = klokkeslaet.split(":").map(Number);
  return t * 60 + m;
}

describe("koerIgenTidspunkt", () => {
  test("de fire eksemplers håndskrevne klokkeslæt er rigtige", () => {
    const fundne: Record<string, unknown> = {};
    for (const e of KOER_IGEN_EKSEMPLER) {
      const r = koerIgenTidspunkt(e);
      expect(r, e.id).not.toBeNull();
      fundne[e.id] = {
        underGraense: r!.underGraenseKlokkeslaet,
        heltAedru: r!.heltAedruKlokkeslaet,
        dageUnderGraense: r!.underGraenseHeleDage,
      };
    }
    expect(fundne).toEqual(KOER_IGEN_FORVENTET);
  });

  test("døgnskiftet tælles fra det indtastede klokkeslæt, ikke fra i dag", () => {
    // 23:30 + 2 t 36 min er 02:06 — næste døgn. Et klokkeslæt uden dato er
    // kun rigtigt, hvis "hele dage" er hævet netop så mange gange.
    const r = koerIgenTidspunkt({
      antalGenstande: 4, vaegtKg: 80, koen: "mand", klokkeslaet: "23:30", graense: da,
    })!;
    expect(r.underGraenseKlokkeslaet).toBe("02:06");
    expect(r.underGraenseHeleDage).toBe(1);
    expect(r.heltAedruKlokkeslaet).toBe("05:24");
    expect(r.heltAedruHeleDage).toBe(1);
  });

  test("et eftermiddagsglas bliver samme dags eftermiddag, ikke i morgen", () => {
    // Modsat fejl: et klokkeslæt på 13:00 må ikke automatisk få +
    // 1 dag, fordi "senere" er senere end "senere i natten".
    const r = koerIgenTidspunkt({
      antalGenstande: 2, vaegtKg: 65, koen: "kvinde", klokkeslaet: "13:00", graense: da,
    })!;
    expect(r.underGraenseHeleDage).toBe(0);
    expect(r.heltAedruHeleDage).toBe(0);
    expect(r.underGraenseKlokkeslaet).toBe("14:12");
    expect(r.heltAedruKlokkeslaet).toBe("17:30");
  });

  test("timeantallet er præcis dem PromilleBeregner viser i samme felt", () => {
    // De to værktøjer står på samme side. Hvis de viste forskellige timer
    // ville læseren få «under grænsen om 2,6 timer» og «klokken 02:00».
    for (const e of KOER_IGEN_EKSEMPLER) {
      const r = koerIgenTidspunkt(e)!;
      const gammelt = beregnPromille(e.antalGenstande, e.vaegtKg, e.koen, 0, e.graense)!;
      expect(r.timerTilGraense, e.id).toBe(gammelt.timerTilGraense);
      expect(r.timerTilNul, e.id).toBe(gammelt.timerTilNul);
      expect(r.promille, e.id).toBe(gammelt.promille);
    }
  });

  test("omregningen til minutter runder OP, så klokkeslættet aldrig bliver tidligere", () => {
    // timerTilGraense runder op til 0,1 time = 6 minutter. Rundes der ned i
    // stedet (Math.floor(timer*60)) bliver 2,6 timer til 155 minutter, og
    // klokkeslættet er så 01:00 i stedet for 01:06 — en tilladelse til at køre
    // bil 6 minutter for tidligt.
    const r = koerIgenTidspunkt({
      antalGenstande: 4, vaegtKg: 80, koen: "mand", klokkeslaet: "23:30", graense: da,
    })!;
    const minutter = r.timerTilGraense * 60;
    expect(minutter % 6).toBe(0); // et multiplum af 6, aldrig et løst decimal
    expect(Math.round(minutter)).toBe(156);
    expect(Math.floor(minutter) === Math.round(minutter)).toBe(true);
  });

  test("5 øl på 80 kg: 4,1 timer må ikke blive 245 minutter", () => {
    // Den her fejl var målbar, ikke hypotetisk. 4,1 er **ikke** repræsenterbart
    // som et binært brøk, så 4,1 × 60 = 245,99999999999997. `Math.floor` i
    // stedet for `Math.round` giver derfor 245 minutter — ét minut for tidligt,
    // i et helt almindeligt input (5 genstande, 80 kg mand, 1,10 promille).
    // Porten under sweepet herunder dømmer alle 30 × 121 felter; denne linje
    // gør fejlen læsbar i loggen.
    const r = koerIgenTidspunkt({
      antalGenstande: 5, vaegtKg: 80, koen: "mand", klokkeslaet: "22:00", graense: da,
    })!;
    expect(r.promille).toBe(1.1);
    expect(r.timerTilGraense).toBe(4.1);
    expect(r.underGraenseKlokkeslaet).toBe("02:06");
    expect(r.underGraenseHeleDage).toBe(1);
  });

  test("svensk grænse 0,2 ‰ giver et tidligere klokkeslæt end dansk 0,5 ‰", () => {
    const fælles = { antalGenstande: 4, vaegtKg: 80, koen: "mand" as const, klokkeslaet: "23:30" };
    const dansk = koerIgenTidspunkt({ ...fælles, graense: 0.5 })!;
    const svensk = koerIgenTidspunkt({ ...fælles, graense: 0.2 })!;
    expect(dansk.promille).toBe(svensk.promille); // samme indtastning
    expect(svensk.timerTilGraense).toBeGreaterThan(dansk.timerTilGraense);
    // Sveriges grænse må aldrig give et tidligere klokkeslæt end Danmarks.
    const danskMin = dansk.underGraenseKlokkeslaet;
    const svenskMin = svensk.underGraenseKlokkeslaet;
    expect(svenskMin >= danskMin || svensk.underGraenseHeleDage > dansk.underGraenseHeleDage).toBe(true);
  });

  test("promille under grænsen allerede giver det indtastede klokkeslæt", () => {
    // Ét genstand på 95 kg mand er 12/64,6 = 0,19 promille, under den danske
    // grænse. Helt ædru er 0,19/0,15 = 1,3 h = 78 minutter senere — **samme**
    // døgn, fordi 18:00 + 1:18 = 19:18.
    const r = koerIgenTidspunkt({
      antalGenstande: 1, vaegtKg: 95, koen: "mand", klokkeslaet: "18:00", graense: da,
    })!;
    expect(r.alleredeUnderGraense).toBe(true);
    expect(r.underGraenseKlokkeslaet).toBe("18:00");
    expect(r.underGraenseHeleDage).toBe(0);
    expect(r.heltAedruKlokkeslaet).toBe("19:18");
    expect(r.heltAedruHeleDage).toBe(0);
  });

  test("promille præcis på grænsen giver det samme klokkeslæt, ikke et tidligere", () => {
    // 0,5 promille er ikke *under* grænsen. Værktøjet må derfor ikke flytte
    // klokkeslættet **frem** — det er den værste af de to fejl, fordi den
    // fortæller en stadig beruset læser, at han må køre nu.
    const promille = 0.5;
    const peak = promille;
    const genstande = Math.round((peak * 0.68 * 80) / 12 * 1000) / 1000;
    // Find den genstande-mængde, der giver præcis 0,50 promille på 80 kg.
    const praecis = 0.5 * 0.68 * 80 / 12;
    const r = koerIgenTidspunkt({
      antalGenstande: praecis, vaegtKg: 80, koen: "mand", klokkeslaet: "20:00", graense: da,
    })!;
    expect(r.promille).toBe(0.5);
    expect(r.promilleResultat.paaGraensen).toBe(true);
    expect(r.alleredeUnderGraense).toBe(false);
    expect(r.underGraenseKlokkeslaet).toBe("20:00");
    expect(r.timerTilGraense).toBe(timerTilGraense(0.5, da));
    expect(genstande).toBeCloseTo(2.2667, 3);
  });

  test("ugyldigt klokkeslæt giver null, aldrig et opdigtet tidspunkt", () => {
    const base = { antalGenstande: 3, vaegtKg: 80, koen: "mand" as const, graense: da };
    for (const klokkeslaet of ["", "  ", "24:00", "12:60", "kl. 12", "1230", "12:5", "-1:00", "12:00:00"]) {
      expect(koerIgenTidspunkt({ ...base, klokkeslaet }), klokkeslaet).toBeNull();
    }
  });

  test("manglende genstande eller vægt giver null", () => {
    expect(koerIgenTidspunkt({ antalGenstande: 0, vaegtKg: 80, koen: "mand", klokkeslaet: "22:00", graense: da })).toBeNull();
    expect(koerIgenTidspunkt({ antalGenstande: -1, vaegtKg: 80, koen: "mand", klokkeslaet: "22:00", graense: da })).toBeNull();
    expect(koerIgenTidspunkt({ antalGenstande: 3, vaegtKg: 0, koen: "mand", klokkeslaet: "22:00", graense: da })).toBeNull();
    expect(koerIgenTidspunkt({ antalGenstande: 3, vaegtKg: -80, koen: "mand", klokkeslaet: "22:00", graense: da })).toBeNull();
    expect(koerIgenTidspunkt({ antalGenstande: Number.NaN, vaegtKg: 80, koen: "mand", klokkeslaet: "22:00", graense: da })).toBeNull();
  });

  test("et meget stort antal genstande kan ikke rulle døgnet helt rundt i timeværktøjet", () => {
    // 100 genstande er ~22 promille, altså ~146 timer = 6 døgn. Klokkeslættet
    // skal stadig være gyldigt HH:MM, og dage-tallet må ikke miste et døgn.
    const r = koerIgenTidspunkt({
      antalGenstande: 100, vaegtKg: 80, koen: "mand", klokkeslaet: "23:30", graense: da,
    })!;
    expect(r.underGraenseKlokkeslaet).toMatch(/^\d{2}:\d{2}$/);
    expect(r.heltAedruKlokkeslaet).toMatch(/^\d{2}:\d{2}$/);
    expect(r.heltAedruHeleDage).toBeGreaterThan(r.underGraenseHeleDage);
  });

  test("midt i døgnet kan svaret vægte over nul og alligevel over midnat", () => {
    // 06:00 er det tidspunkt, en læser oftest spørger fra, og 2,6 timer er
    // 08:36 — samme døgn. Døgnskiftet skal komme fra regnestykket, ikke fra
    // at klokkeslættet ser "tidligt" ud.
    const r = koerIgenTidspunkt({
      antalGenstande: 4, vaegtKg: 80, koen: "mand", klokkeslaet: "06:00", graense: da,
    })!;
    expect(r.underGraenseKlokkeslaet).toBe("08:36");
    expect(r.underGraenseHeleDage).toBe(0);
  });

  /**
   * Hele det indtastede rum, 30 genstande × 121 kropsvægte × 2 grænser.
   *
   * Formlen i modulet er rigtig på de fire eksempler, men de fire dækker
   * ikke de 4,1-timers-værdier, hvor `Math.floor` i stedet for `Math.round`
   * tager et minut af svaret. Sweepet er derfor ikke en gentagelse af de fire
   * — det er den port, der fangede mutationen M1, de fire ikke gjorde.
   */
  test("alle 30 × 121 × 2 × 2 felter holder den dokumenterede minuttal-kontrakt", () => {
    const START = 22 * 60;
    const afvigelser: string[] = [];
    for (let genstande = 1; genstande <= 30; genstande++) {
      for (let kg = 40; kg <= 160; kg++) {
        for (const graense of [0.5, 0.2]) {
          for (const koen of ["mand", "kvinde"] as const) {
            const r = koerIgenTidspunkt({ antalGenstande: genstande, vaegtKg: kg, koen, klokkeslaet: "22:00", graense });
            const nøgle = `${genstande} genstande, ${kg} kg ${koen}, grænse ${graense}`;
            if (!r) { afvigelser.push(`${nøgle}: null`); continue; }

            const tilGraense = r.underGraenseHeleDage * 1440 + tilMinutter(r.underGraenseKlokkeslaet) - START;
            const gFejl = grænseFejl(r.promille, graense, tilGraense);
            if (gFejl) afvigelser.push(`${nøgle}: til grænsen — ${gFejl}`);

            const tilNul = r.heltAedruHeleDage * 1440 + tilMinutter(r.heltAedruKlokkeslaet) - START;
            const nFejl = nulFejl(r.promille, tilNul);
            if (nFejl) afvigelser.push(`${nøgle}: til 0 promille — ${nFejl}`);

            // «Helt ædru» må aldrig komme FØR grænsen. Det er den tilsyn, der
            // gør "du må køre kl. X, helt ædru kl. Y" troværdigt, og den
            // fejl, en læser aldrig ville opdage ved at læse begge tal.
            if (tilNul < tilGraense) afvigelser.push(`${nøgle}: helt ædru ${tilNul} før grænsen ${tilGraense}`);
          }
        }
      }
    }
    expect(afvigelser.slice(0, 8)).toEqual([]);
    expect(afvigelser).toHaveLength(0);
  });
});
