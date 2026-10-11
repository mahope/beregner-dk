/**
 * Kolesterol i madvarer. Baggrunden er den danske autocomplete-klynge «hvor
 * meget kolesterol er der i …» (målt 10/10 2026, `suggestqueries.google.com`,
 * hl=da: æg, rejer, ost, kylling, smør, skyr og mælk). De øvrige «i
 * madvarer»-sider svarede på jern, calcium, magnesium, kalium, zink, jod,
 * D-vitamin, C-vitamin, B12, fiber, sukker, salt, protein, kulhydrat og fedt —
 * men ingen svarede på kostkolesterol, som er det mest googlede emne i
 * kostafdelingen efter kalorier.
 *
 * **Hvor tallene kommer fra.** USDA *SR Legacy* (udgaven 2018-04), som de andre
 * madvaresider læser, næringsstof **1253 — Cholesterol (mg)**, pr. 100 g.
 * Hver værdi bærer sin `fdcId`, så den kan slås op i kilden:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Der er ingen håndskrevne tal i denne fil.
 *
 * **Der findes ingen dansk anbefaling for kostkolesterol.** Det er den vigtigste
 * ting ved emnet, og derfor står den også i selve modulet: Sundhedsstyrelsens
 * kost.dk, rammeplanen for diætbehandling af iskæmisk hjertesygdom og
 * dyslipidæmi (FaKD, november 2024), skriver under diætens sammensætning
 * direkte «Der er findes ikke anbefaling for kolesterol», og angiver i stedet
 * energifordelingen «Max. 10 E % fra mættet fedt».
 * Nordic Nutrition Recommendations 2023 har tilsvarende intet kolesterolafsnit
 * blandt sine 34 næringsstofafsnit. Derfor regner siden **ikke**
 * en «andel af anbefalingen» — det ville opfinde en grænse, ingen myndighed
 * har sat. Siden regner i stedet om til det tal alle danskere kender: ét æg.
 */
/** Kilden til kolesteroltallet pr. `fdcId`. */
export const KOLESTEROL_KILDE = {
  database: "USDA FoodData Central",
  dataset: "SR Legacy",
  udgave: "2018-04",
  naeringsstof: "1253 Cholesterol (mg)",
  laest: "11/10 2026",
  anbefaling: "https://www.sst.dk",
  rammeplan:
    "https://kost.dk/sites/default/files/2024-11/FaKD%20Rammeplan%20-%20Di%C3%A6tbehandling%20af%20isk%C3%A6misk%20hjertesygdom%20og%20dyslipid%C3%A6mi%20%28FINAL%29.pdf",
  /** Den øvre grænse for mættet fedt, som er det kostrådet faktisk gælder. */
  maettetFedtLoftProcent: 10,
} as const;

/**
 * Den officielle danske holdning, som siden citerer ordret. `null` betyder: der
 * er ingen anbefalet dagsmængde, og det er ikke en mangel i tabellen — det er
 * den faktiske stilling.
 */
export const KOLESTEROL_ANBEFALING_MG = null;

export const KOLESTEROL_ANBEFALING_KILDE =
  "Sundhedsstyrelsens kost.dk, rammeplanen for diætbehandling af iskæmisk hjertesygdom og dyslipidæmi (2024): «Der er findes ikke anbefaling for kolesterol».";

/** En kolesterokilde pr. 100 g fra kilden. */
export interface Kolesterolvare {
  navn: string;
  /** USDA FoodData Central-fdcId for kildens egen række. */
  fdcId: number;
  /** Kolesterol pr. 100 g i mg. */
  kolesterol100g: number;
  /**
   * En almindelig dansk portion. Vægten er valgt af os — ikke noget kilden
   * opgiver.
   */
  portionGram: number;
}

/**
 * Kolesterol pr. 100 g pr. `fdcId`, læst af kildens næringsstof 1253. Listen er
 * de varer en dansk køkken bruger mest, sorgeret efter gruppe (æg, mejeri,
 * kød, fisk og skaldyr) — de fire plantemadvarer står i bunden og er kildens
 * målinger til 0, fordi cholesterol dannes i dyr og ikke i planter.
 */
export const KOLESTEROLVARER: readonly Kolesterolvare[] = [
  { navn: "Æg, helt, rå", fdcId: 171287, kolesterol100g: 372, portionGram: 60 },
  { navn: "Æg, helt, kogt", fdcId: 173424, kolesterol100g: 373, portionGram: 60 },
  { navn: "Æggeblomme, rå", fdcId: 172184, kolesterol100g: 1085, portionGram: 17 },
  { navn: "Æg, vagtel, helt, rå", fdcId: 172191, kolesterol100g: 844, portionGram: 9 },
  { navn: "Æg, rørert, stegt", fdcId: 172187, kolesterol100g: 277, portionGram: 100 },
  { navn: "Smør, saltet", fdcId: 173410, kolesterol100g: 215, portionGram: 15 },
  { navn: "Cheddar", fdcId: 173414, kolesterol100g: 99, portionGram: 30 },
  { navn: "Gouda", fdcId: 171241, kolesterol100g: 114, portionGram: 30 },
  { navn: "Feta", fdcId: 173420, kolesterol100g: 89, portionGram: 30 },
  { navn: "Flødeost", fdcId: 169081, kolesterol100g: 90, portionGram: 30 },
  { navn: "Parmesan, revet", fdcId: 171247, kolesterol100g: 86, portionGram: 20 },
  { navn: "Swiss ost", fdcId: 171251, kolesterol100g: 93, portionGram: 30 },
  { navn: "Mozzarella, letmælk", fdcId: 170847, kolesterol100g: 64, portionGram: 30 },
  { navn: "Hytteost, flødet", fdcId: 172179, kolesterol100g: 17, portionGram: 100 },
  { navn: "Yoghurt, naturel, fuldfedt", fdcId: 171284, kolesterol100g: 13, portionGram: 200 },
  { navn: "Yoghurt, naturel, letmælk", fdcId: 170886, kolesterol100g: 6, portionGram: 200 },
  { navn: "Mælk, letmælk", fdcId: 170872, kolesterol100g: 5, portionGram: 250 },
  { navn: "Mælk, sødmælk", fdcId: 172217, kolesterol100g: 10, portionGram: 250 },
  { navn: "Mælk, skummet", fdcId: 173432, kolesterol100g: 2, portionGram: 250 },
  { navn: "Fløde, piskefløde", fdcId: 170859, kolesterol100g: 113, portionGram: 30 },
  { navn: "Is, vanilje", fdcId: 167573, kolesterol100g: 92, portionGram: 100 },
  { navn: "Kyllingebryst, uden skind, grill", fdcId: 171534, kolesterol100g: 104, portionGram: 120 },
  { navn: "Kyllingelår, stegt", fdcId: 172375, kolesterol100g: 94, portionGram: 100 },
  { navn: "Kylling, med skind, ovnstegt", fdcId: 171050, kolesterol100g: 107, portionGram: 150 },
  { navn: "Kalkunbryst, med skind, ovnstegt", fdcId: 171492, kolesterol100g: 74, portionGram: 120 },
  { navn: "Bacon, stegt", fdcId: 167712, kolesterol100g: 110, portionGram: 30 },
  { navn: "Pølse, svin og kalkun, forkogt", fdcId: 171632, kolesterol100g: 72, portionGram: 60 },
  { navn: "Polsk pølse, svin", fdcId: 174577, kolesterol100g: 70, portionGram: 60 },
  { navn: "Morgenpølse, okse", fdcId: 174616, kolesterol100g: 60, portionGram: 45 },
  { navn: "Hakket oksekød, 7 % fedt, stegt", fdcId: 174755, kolesterol100g: 89, portionGram: 125 },
  { navn: "Hakket oksekød, 25 % fedt, stegt", fdcId: 174040, kolesterol100g: 89, portionGram: 125 },
  { navn: "Oksekød, hangerbåd, grill", fdcId: 168727, kolesterol100g: 96, portionGram: 125 },
  { navn: "Oksekød, brystflæk, gravet", fdcId: 169488, kolesterol100g: 106, portionGram: 125 },
  { navn: "Svinekød, ribben, mager, ovnstegt", fdcId: 168306, kolesterol100g: 105, portionGram: 120 },
  { navn: "Svinekød, ribben, med fedt, gravet", fdcId: 167854, kolesterol100g: 121, portionGram: 120 },
  { navn: "Kalv, lår, mager, ovnstegt", fdcId: 175274, kolesterol100g: 106, portionGram: 120 },
  { navn: "And, kød, ovnstegt", fdcId: 172409, kolesterol100g: 84, portionGram: 120 },
  { navn: "Okselever, tilberedt", fdcId: 168626, kolesterol100g: 396, portionGram: 100 },
  { navn: "Hønselever, stegt", fdcId: 171061, kolesterol100g: 563, portionGram: 100 },
  { navn: "Leverpostej", fdcId: 172930, kolesterol100g: 255, portionGram: 50 },
  { navn: "Hønseleverpostej, dåse", fdcId: 172928, kolesterol100g: 391, portionGram: 50 },
  { navn: "Rejer, kogte", fdcId: 175180, kolesterol100g: 189, portionGram: 100 },
  { navn: "Rejer, konserveret", fdcId: 171972, kolesterol100g: 252, portionGram: 100 },
  { navn: "Krabbe, blå, kogt", fdcId: 174205, kolesterol100g: 97, portionGram: 100 },
  { navn: "Hummer, nordlig, kogt", fdcId: 174209, kolesterol100g: 146, portionGram: 100 },
  { navn: "Kammusling, dampet", fdcId: 167742, kolesterol100g: 41, portionGram: 85 },
  { navn: "Blæksprutte, stegt", fdcId: 171982, kolesterol100g: 260, portionGram: 100 },
  { navn: "Kaviar", fdcId: 174188, kolesterol100g: 588, portionGram: 20 },
  { navn: "Laks, atlantic, vild, grill", fdcId: 171998, kolesterol100g: 71, portionGram: 120 },
  { navn: "Laks, opdrættet, grill", fdcId: 175168, kolesterol100g: 63, portionGram: 120 },
  { navn: "Tun, let, konserveret i vand", fdcId: 173709, kolesterol100g: 36, portionGram: 100 },
  { navn: "Sild, atlantic, saltet og røget", fdcId: 173668, kolesterol100g: 82, portionGram: 100 },
  { navn: "Makrel, spansk, rå", fdcId: 173673, kolesterol100g: 76, portionGram: 100 },
  { navn: "Makrel, konserveret", fdcId: 175121, kolesterol100g: 79, portionGram: 100 },
  { navn: "Havregryn, tørre", fdcId: 173904, kolesterol100g: 0, portionGram: 50 },
  { navn: "Rugbrød", fdcId: 172684, kolesterol100g: 0, portionGram: 40 },
  { navn: "Gulerødder, rå", fdcId: 170393, kolesterol100g: 0, portionGram: 100 },
  { navn: "Olivenolie", fdcId: 171413, kolesterol100g: 0, portionGram: 15 },
];

/** Kolesterol-tal, formleret på dansk. Heltal til at starte med. */
export function kolesterolTal(tal: number, decimaler = 1): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });
}

/** Henter en vare pr. navn. */
export function vareMedNavn(navn: string): Kolesterolvare | undefined {
  const soegt = navn.trim().toLocaleLowerCase("da-DK");
  return KOLESTEROLVARER.find(
    (v) => v.navn.toLocaleLowerCase("da-DK") === soegt
  );
}

/** Kolesterol pr. 100 g for en vare, i mg. */
export function kolesterol100g(vare: Kolesterolvare): number {
  return vare.kolesterol100g;
}

/**
 * Kolesterol pr. 100 g for én vare pr. navn. Kaster på et ukendt navn, så en
 * stavefejl i en tekst aldrig kan skrive «0 mg» i stedet for varens tal.
 */
export function kolesterol100gForNavn(navn: string): number {
  const vare = vareMedNavn(navn);
  if (!vare) {
    throw new Error(`Kolesteroltabellen kender ikke varen: ${navn}`);
  }
  return vare.kolesterol100g;
}

/** Kolesterol i en given mængde gram, i mg. */
export function kolesterolIgram(
  vare: Kolesterolvare,
  gram: number
): number {
  return (vare.kolesterol100g * Math.max(0, gram)) / 100;
}

/**
 * Ét helt rå æg på {AEG_GRAM} g — det danske sammenligningstal, siden bruger
 * i stedet for en anbefaling, der ikke findes.
 */
export const AEG_GRAM = 60;

/** Kolesterol i ét helt rå æg, i mg. Læst fra tabellens egen æg-række. */
export const AEG_MG = (() => {
  const aeg = vareMedNavn("Æg, helt, rå");
  return aeg ? Math.round(kolesterolIgram(aeg, AEG_GRAM) * 10) / 10 : 0;
})();

/** Hvor mange æg en mængde svarer til. Ét æg = 1. */
export function antalAeg(vare: Kolesterolvare, gram = vare.portionGram): number {
  if (AEG_MG <= 0) return 0;
  return kolesterolIgram(vare, gram) / AEG_MG;
}

/** Hvor mange gram af varen, der skal til for at svare til ét æg. */
export function gramForEtAeg(vare: Kolesterolvare): number {
  if (vare.kolesterol100g <= 0) return Number.POSITIVE_INFINITY;
  return (AEG_MG / vare.kolesterol100g) * 100;
}

/** Sorteret listen: mest cholesterol pr. 100 g først. */
export function rangliste(): readonly Kolesterolvare[] {
  return [...KOLESTEROLVARER].sort(
    (a, b) => b.kolesterol100g - a.kolesterol100g
  );
}

/** Varer, kilden har målt til 0 — altså plantemad. */
export function planter(varer: readonly Kolesterolvare[] = KOLESTEROLVARER) {
  return varer.filter((v) => v.kolesterol100g <= 0);
}

/**
 * Et gennemtænkt eksempel på en dansk hverdag, læst af tabellens egne tal, så
 * brødteksten og tabellen ikke kan stå med forskellige tal (punkt 11).
 */
export const DAGS_EKSEMPEL: readonly { vare: Kolesterolvare; gram: number }[] = [
  { vare: vareMedNavn("Havregryn, tørre")!, gram: 50 },
  { vare: vareMedNavn("Mælk, letmælk")!, gram: 250 },
  { vare: vareMedNavn("Æg, helt, kogt")!, gram: 120 },
  { vare: vareMedNavn("Cheddar")!, gram: 30 },
  { vare: vareMedNavn("Hønseleverpostej, dåse")!, gram: 50 },
  { vare: vareMedNavn("Kyllingebryst, uden skind, grill")!, gram: 120 },
  { vare: vareMedNavn("Laks, atlantic, vild, grill")!, gram: 120 },
  { vare: vareMedNavn("Rugbrød")!, gram: 80 },
];

/** Summen af dagens eksempel, i mg. */
export function dagsTotal(): number {
  return DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + kolesterolIgram(vare, gram),
    0
  );
}
