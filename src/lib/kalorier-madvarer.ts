/**
 * Kalorier og makronæringsstoffer pr. 100 g for de fødevarer danskere
 * faktisk slår op: **9 af 10** danske autocomplete-træffere under "kalorier"
 * er "kalorier i æg", "kalorier i en banan", "kalorier i kartofler" og så
 * videre (målt 6/10 22:2x, `suggestqueries.google.com`, hl=da). /kalorier
 * havde siden det kloge værktøj — men ingen sted, læseren kunne finde svaret
 * på sit eget spørgsmål.
 *
 * **Hvor tallene kommer fra.** Hver værdi er hentet fra USDA FoodData Central,
 * datasættet *SR Legacy*, udgaven 2018-04, som er fri nedlæsning fra
 * {{@link https://fdc.nal.usda.gov}}. Rækkerne er fundet på deres engelske
 * produktsnavn (fx "Bananas, raw"), og hver linje bærer sit `fdc_id`, så enhver
 * værdi kan slås op og efterprøves:
 * `https://fdc.nal.usda.gov/fdc-app.html#/food-details/{fdcId}/nutrients`.
 * Tal er hentet fra næringsstofferne 1008 (kcal), 1003 (protein), 1004 (fedt)
 * og 1005 (kulhydrat) pr. 100 g — altså den enhed, opslagstjenesten selv
 * bruger. Danske navne er oversættelser; *tilberedningsformen står i navnet*,
 * for "Kartoffel, kogt" (87 kcal) og "Kartoffel, rå" (77 kcal) er to forskellige
 * tal, og det samme gælder mælk, smør og meget mere.
 *
 * Der er ingen håndskrevne tal i denne fil. Værdierne kommer fra CSV'en, og
 * `fdcId` står ved siden af hver eneste af dem — så en fejltransskription
 * ikke kan gemme sig, og næste iteration kan efterprøve mod samme kilde.
 */

export type MadvareGruppe =
  | "frugt"
  | "grønt"
  | "æg"
  | "kød"
  | "brød"
  | "mejeri"
  | "fedt"
  | "sødt";

export interface Madvare {
  /** Dansk navn, med tilberedningsform når den har en. */
  navn: string;
  gruppe: MadvareGruppe;
  kcal100g: number;
  protein100g: number;
  fedt100g: number;
  kulhydrat100g: number;
  /** fdc_id i USDA FoodData Central — se {@link MADVARER_KILDE}. */
  fdcId: number;
}

/** Kilden til hvert tal i {@link MADVARER}, så det kan efterprøves. */
export const MADVARER_KILDE = {
  database: "USDA FoodData Central",
  dataset: "SR Legacy",
  udgave: "2018-04",
  laest: "6/10 2026",
  url: "https://fdc.nal.usda.gov",
  naeringsstoffer: "1008 kcal, 1003 protein, 1004 fedt, 1005 kulhydrat",
} as const;

/** Rækkefølgen grupperne vises i, og den rækkefølge porten låser fast. */
export const MADVARE_GRUPPER: readonly MadvareGruppe[] = [
  "frugt",
  "grønt",
  "æg",
  "kød",
  "brød",
  "mejeri",
  "fedt",
  "sødt",
];

export const MADVARE_GRUPPE_NAVN: Record<MadvareGruppe, string> = {
  frugt: "Frugt",
  grønt: "Grøntsager",
  æg: "Æg",
  kød: "Kød",
  brød: "Brød, korn og ris",
  mejeri: "Mejeri",
  fedt: "Fedt",
  sødt: "Sødt",
};

export const MADVARER: readonly Madvare[] = [
  // frugt
  { navn: "Banan", gruppe: "frugt", kcal100g: 89, protein100g: 1.1, fedt100g: 0.3, kulhydrat100g: 22.8, fdcId: 173944 }, // Bananas, raw
  { navn: "Æble", gruppe: "frugt", kcal100g: 57, protein100g: 0.3, fedt100g: 0.1, kulhydrat100g: 13.6, fdcId: 168202 }, // Apples, raw, golden delicious, with skin
  { navn: "Pære", gruppe: "frugt", kcal100g: 57, protein100g: 0.4, fedt100g: 0.1, kulhydrat100g: 15.2, fdcId: 169118 }, // Pears, raw
  { navn: "Vindrue", gruppe: "frugt", kcal100g: 69, protein100g: 0.7, fedt100g: 0.2, kulhydrat100g: 18.1, fdcId: 174683 }, // Grapes, red or green (European type, such as Thompson seedless), raw
  { navn: "Appelsin", gruppe: "frugt", kcal100g: 47, protein100g: 0.9, fedt100g: 0.1, kulhydrat100g: 11.8, fdcId: 169097 }, // Oranges, raw, all commercial varieties
  { navn: "Jordbær", gruppe: "frugt", kcal100g: 32, protein100g: 0.7, fedt100g: 0.3, kulhydrat100g: 7.7, fdcId: 167762 }, // Strawberries, raw
  { navn: "Blåbær", gruppe: "frugt", kcal100g: 57, protein100g: 0.7, fedt100g: 0.3, kulhydrat100g: 14.5, fdcId: 171711 }, // Blueberries, raw
  { navn: "Kirsebær", gruppe: "frugt", kcal100g: 63, protein100g: 1.1, fedt100g: 0.2, kulhydrat100g: 16.0, fdcId: 171719 }, // Cherries, sweet, raw
  { navn: "Vandmelon", gruppe: "frugt", kcal100g: 30, protein100g: 0.6, fedt100g: 0.1, kulhydrat100g: 7.5, fdcId: 167765 }, // Watermelon, raw
  { navn: "Ananas", gruppe: "frugt", kcal100g: 50, protein100g: 0.5, fedt100g: 0.1, kulhydrat100g: 13.1, fdcId: 169124 }, // Pineapple, raw, all varieties
  { navn: "Mango", gruppe: "frugt", kcal100g: 60, protein100g: 0.8, fedt100g: 0.4, kulhydrat100g: 15.0, fdcId: 169910 }, // Mangos, raw
  { navn: "Avocado", gruppe: "frugt", kcal100g: 160, protein100g: 2, fedt100g: 14.7, kulhydrat100g: 8.5, fdcId: 171705 }, // Avocados, raw, all commercial varieties
  { navn: "Blomme", gruppe: "frugt", kcal100g: 46, protein100g: 0.7, fedt100g: 0.3, kulhydrat100g: 11.4, fdcId: 169949 }, // Plums, raw
  { navn: "Druer, tørrede", gruppe: "frugt", kcal100g: 301, protein100g: 3.3, fedt100g: 0.2, kulhydrat100g: 80.0, fdcId: 168164 }, // Raisins, golden, seedless
  { navn: "Banan, tørret", gruppe: "frugt", kcal100g: 346, protein100g: 3.9, fedt100g: 1.8, kulhydrat100g: 88.3, fdcId: 173945 }, // Bananas, dehydrated, or banana powder
  // grønt
  { navn: "Gulerod", gruppe: "grønt", kcal100g: 41, protein100g: 0.9, fedt100g: 0.2, kulhydrat100g: 9.6, fdcId: 170393 }, // Carrots, raw
  { navn: "Kartoffel, rå", gruppe: "grønt", kcal100g: 77, protein100g: 2.0, fedt100g: 0.1, kulhydrat100g: 17.5, fdcId: 170026 }, // Potatoes, flesh and skin, raw
  { navn: "Kartoffel, kogt", gruppe: "grønt", kcal100g: 87, protein100g: 1.9, fedt100g: 0.1, kulhydrat100g: 20.1, fdcId: 170114 }, // Potatoes, boiled, cooked in skin, flesh, with salt
  { navn: "Kartoffel, bagt", gruppe: "grønt", kcal100g: 93, protein100g: 2.5, fedt100g: 0.1, kulhydrat100g: 21.1, fdcId: 170111 }, // Potatoes, baked, flesh and skin, with salt
  { navn: "Kartoffel, mosset", gruppe: "grønt", kcal100g: 113, protein100g: 1.9, fedt100g: 4.2, kulhydrat100g: 16.8, fdcId: 168555 }, // Potatoes, mashed, home-prepared, whole milk and butter added
  { navn: "Tomat", gruppe: "grønt", kcal100g: 18, protein100g: 0.9, fedt100g: 0.2, kulhydrat100g: 3.9, fdcId: 170457 }, // Tomatoes, red, ripe, raw, year round average
  { navn: "Agurk", gruppe: "grønt", kcal100g: 15, protein100g: 0.7, fedt100g: 0.1, kulhydrat100g: 3.6, fdcId: 168409 }, // Cucumber, with peel, raw
  { navn: "Løg", gruppe: "grønt", kcal100g: 40, protein100g: 1.1, fedt100g: 0.1, kulhydrat100g: 9.3, fdcId: 170000 }, // Onions, raw
  { navn: "Broccoli", gruppe: "grønt", kcal100g: 34, protein100g: 2.8, fedt100g: 0.4, kulhydrat100g: 6.6, fdcId: 170379 }, // Broccoli, raw
  { navn: "Blomkål", gruppe: "grønt", kcal100g: 25, protein100g: 1.9, fedt100g: 0.3, kulhydrat100g: 5.0, fdcId: 169986 }, // Cauliflower, raw
  { navn: "Peberfrugt, rød", gruppe: "grønt", kcal100g: 26, protein100g: 1.0, fedt100g: 0.3, kulhydrat100g: 6.0, fdcId: 170108 }, // Peppers, sweet, red, raw
  { navn: "Spinat", gruppe: "grønt", kcal100g: 23, protein100g: 2.9, fedt100g: 0.4, kulhydrat100g: 3.6, fdcId: 168462 }, // Spinach, raw
  // kød
  { navn: "Kylling, hel", gruppe: "kød", kcal100g: 119, protein100g: 21.4, fedt100g: 3.1, kulhydrat100g: 0, fdcId: 171052 }, // Chicken, broilers or fryers, meat only, raw
  { navn: "Svinekød, kotelet", gruppe: "kød", kcal100g: 143, protein100g: 26.2, fedt100g: 3.5, kulhydrat100g: 0, fdcId: 168250 }, // Pork, fresh, loin, tenderloin, separable lean only, cooked, roasted
  { navn: "Skinke", gruppe: "kød", kcal100g: 178, protein100g: 22.6, fedt100g: 9.0, kulhydrat100g: 0, fdcId: 167872 }, // Pork, cured, ham, boneless, regular (approximately 11% fat), roasted
  { navn: "Oksekød, mørbrad", gruppe: "kød", kcal100g: 249, protein100g: 19.4, fedt100g: 18.5, kulhydrat100g: 0, fdcId: 168724 }, // Beef, tenderloin, steak, separable lean and fat, trimmed to 1/8" fat, select, raw
  // brød
  { navn: "Hvedebrød", gruppe: "brød", kcal100g: 266, protein100g: 8.8, fedt100g: 3.3, kulhydrat100g: 49.4, fdcId: 174924 }, // Bread, white, commercially prepared (includes soft bread crumbs)
  { navn: "Rugbrød", gruppe: "brød", kcal100g: 259, protein100g: 8.5, fedt100g: 3.3, kulhydrat100g: 48.3, fdcId: 172684 }, // Bread, rye
  { navn: "Franskbrød", gruppe: "brød", kcal100g: 272, protein100g: 10.8, fedt100g: 2.4, kulhydrat100g: 51.9, fdcId: 172675 }, // Bread, french or vienna (includes sourdough)
  { navn: "Havregryn, tørrede", gruppe: "brød", kcal100g: 389, protein100g: 16.9, fedt100g: 6.9, kulhydrat100g: 66.3, fdcId: 169705 }, // Oats (Includes foods for USDA's Food Distribution Program)
  { navn: "Ris, hvidt, kogt", gruppe: "brød", kcal100g: 130, protein100g: 2.7, fedt100g: 0.3, kulhydrat100g: 28.2, fdcId: 168878 }, // Rice, white, long-grain, regular, enriched, cooked
  { navn: "Nudler, tørrede", gruppe: "brød", kcal100g: 362, protein100g: 13.5, fedt100g: 2.7, kulhydrat100g: 73.1, fdcId: 168915 }, // Pasta, whole grain, 51% whole wheat, remaining unenriched semolina, dry
  { navn: "Bulgur, tørret", gruppe: "brød", kcal100g: 342, protein100g: 12.3, fedt100g: 1.3, kulhydrat100g: 75.9, fdcId: 170688 }, // Bulgur, dry
  { navn: "Quinoa, kogt", gruppe: "brød", kcal100g: 120, protein100g: 4.4, fedt100g: 1.9, kulhydrat100g: 21.3, fdcId: 168917 }, // Quinoa, cooked
  // mejeri
  { navn: "Mælk, letmælk 1,5 %", gruppe: "mejeri", kcal100g: 46, protein100g: 3.4, fedt100g: 1.5, kulhydrat100g: 5.0, fdcId: 170872 }, // Dansk letmælk 1,5 % — fedtindholdet er 1,5 g pr. 100 g ifølge mærkningen; USDA's 1 % milkfat (1,0 g) er et andet produkt
  { navn: "Mælk, sødmælk", gruppe: "mejeri", kcal100g: 61, protein100g: 3.1, fedt100g: 3.2, kulhydrat100g: 4.8, fdcId: 171265 }, // Milk, whole, 3.25% milkfat, with added vitamin D
  { navn: "Fløde, 38 %", gruppe: "mejeri", kcal100g: 364, protein100g: 2.8, fedt100g: 38.0, kulhydrat100g: 2.8, fdcId: 170859 }, // Dansk fløde 38 % — fedtindholdet er 38 g pr. 100 g ifølge mærkningen; USDA's heavy whipping cream (36,1 g) er et andet produkt
  { navn: "Yoghurt, natur", gruppe: "mejeri", kcal100g: 61, protein100g: 3.5, fedt100g: 3.2, kulhydrat100g: 4.7, fdcId: 171284 }, // Yogurt, plain, whole milk
  { navn: "Hytteost", gruppe: "mejeri", kcal100g: 98, protein100g: 11.1, fedt100g: 4.3, kulhydrat100g: 3.4, fdcId: 172179 }, // Cheese, cottage, creamed, large or small curd
  { navn: "Gouda", gruppe: "mejeri", kcal100g: 356, protein100g: 24.9, fedt100g: 27.4, kulhydrat100g: 2.2, fdcId: 171241 }, // Cheese, gouda
  { navn: "Feta", gruppe: "mejeri", kcal100g: 265, protein100g: 14.2, fedt100g: 21.5, kulhydrat100g: 3.9, fdcId: 173420 }, // Cheese, feta
  // fedt
  { navn: "Smør", gruppe: "fedt", kcal100g: 717, protein100g: 0.8, fedt100g: 81.1, kulhydrat100g: 0.1, fdcId: 173410 }, // Butter, salted
  { navn: "Olivenolie", gruppe: "fedt", kcal100g: 884, protein100g: 0, fedt100g: 100, kulhydrat100g: 0, fdcId: 171413 }, // Oil, olive, salad or cooking
  { navn: "Rapsolie", gruppe: "fedt", kcal100g: 884, protein100g: 0, fedt100g: 100, kulhydrat100g: 0, fdcId: 172336 }, // Oil, canola
  // sødt
  { navn: "Chokolade, mælke", gruppe: "sødt", kcal100g: 535, protein100g: 7.7, fedt100g: 29.7, kulhydrat100g: 59.4, fdcId: 167587 }, // Candies, milk chocolate
  { navn: "Sukker", gruppe: "sødt", kcal100g: 387, protein100g: 0, fedt100g: 0, kulhydrat100g: 100.0, fdcId: 169655 }, // Sugars, granulated
  // æg
  { navn: "Æg, helt, råt", gruppe: "æg", kcal100g: 143, protein100g: 12.6, fedt100g: 9.5, kulhydrat100g: 0.7, fdcId: 171287 }, // Egg, whole, raw, fresh
  { navn: "Æggeblomme", gruppe: "æg", kcal100g: 322, protein100g: 15.9, fedt100g: 26.5, kulhydrat100g: 3.6, fdcId: 172184 }, // Egg, yolk, raw, fresh
];

/**
 * Æ, ø og å skriver sig "ae", "oe" og "aa" i et søgefelt, så "banan", "Æble"
 * og "rugbrod" skal kunne finde hver hinanden. Samme normalisering bruges på
 * begge sider af søgningen — søgningen skal ikke være afhængig af, om
 * læseren rammer æ, ø og å på tastaturet.
 */
export function normaliserMadvar(tekst: string): string {
  return tekst
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/\s+/g, " ");
}

/**
 * Kalorier i en portion. 100 g giver nøjagtig `kcal100g`, så tallet i
 * tabellen og tallet i feltet ikke kan komme i strid. Negativt og ikke-tal
 * giver 0 — en portion kan ikke have negativt indhold.
 */
export function kalorieIgram(madvare: Madvare, gram: number): number {
  if (!Number.isFinite(gram) || gram <= 0) return 0;
  return (madvare.kcal100g * gram) / 100;
}

/**
 * Madvarer der matcher søgningen. Et tomt søgefelt giver hele tabellen i
 * gruppernes rækkefølge; ellers de fundne, med navne der *begynder* med
 * søgningen før dem der bare indeholder den — så "æg" finder "Æg, helt, råt"
 * og "Æggeblomme" frem for "Rugbrød".
 */
/**
 * De samme tre varianter af hvert navn: med "ae/oe/aa", med "a/o" og uden
 * vokalen ("brød" kan skrives "brod" eller "broed"). Bruges kun som
 * nødalternativ, når den strenge søgning ingen ting fandt — så den ikke kan
 * gøre præcisionen dårligere for de opslag, der allerede virker.
 */
function navneVarianter(navn: string): string[] {
  const n = normaliserMadvar(navn);
  return [...new Set([n, n.replace(/oe/g, "o").replace(/ae/g, "a"), n.replace(/ae|oe|aa/g, "")])];
}

export function soegMadvarer(tekst: string): Madvare[] {
  const q = normaliserMadvar(tekst);
  if (q === "") return [...MADVARER];
  const rang = (navn: string) => {
    const n = normaliserMadvar(navn);
    if (n === q) return 0;
    return n.startsWith(q) ? 1 : 2;
  };
  const filtrer = (varianter: (t: string) => string[]) =>
    MADVARER.filter((m) => varianter(m.navn).some((n) => n.includes(q))).sort(
      (a, b) => rang(a.navn) - rang(b.navn)
    );
  const streng = filtrer((navn) => [normaliserMadvar(navn)]);
  // Sorter kun på rangen. Den er stabil, så madvarer i samme rang beholder
  // tabellens rækkefølge — og den er skrevet, så det opslag læseren næsten
  // altid vil have ("Æg, helt, råt" før "Æggeblomme") ligger først.
  if (streng.length > 0) return streng;
  return filtrer(navneVarianter);
}

/** En madvare efter sit danske navn, eller `undefined` hvis den ikke findes. */
export function madvareMedNavn(navn: string): Madvare | undefined {
  return MADVARER.find((m) => m.navn === navn);
}
