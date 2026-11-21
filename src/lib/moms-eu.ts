import { beregnMoms } from "./moms";

/**
 * EU's momssatser plus Norge, som ikke er medlem men er det land danske og
 * svenske laesere oftest spoergt om ved siden af EU.
 *
 * KILDE: Your Europe, "VAT rules and rates" (europa.eu, hentet 2026-09-29) —
 * tabellen "VAT rates applied in EU member countries" giver standard- og
 * reducerede satser pr. medlemsland. Norge staar ikke i den tabel, fordi Norge
 * ikke er i EU; Norges satser er fra Skatteetaten, "Value added tax" (2026):
 * 25 % normalsats, 15 % foedevarer, 12 % persontransport, hotel og lignende.
 *
 * Filen indeholder **kun satser** — ingen summerede priser. Hver celle i
 * tabellen gaar gennem `beregnMoms`, samme regnestykke som vaerktøjet bruger,
 * saa en sats ikke kan vise en pris den ikke ville give, og en sats ikke kan
 * ændre sig i tabellen uden at vaerktøjet foelger med (C84's og C190's laere).
 */
export interface MomsLand {
  /** ISO-3166-landekode, saa rækkerne kan sorteres og slaaes op stabilt. */
  kode: string;
  navn: { da: string; se: string };
  /** Standardsatsen, altid den der gaelder for de fleste varer og ydelser. */
  standard: number;
  /**
   * Den **laveste** reducerede sats i landet, eller `null` naar landet kun har
   * standardsatsen. Hvilke varer den laagste sats dækker, varierer fra land til
   * land, saa teksten **ikke** maa navngive varer — kun satsen. Danmark har
   * 0 % paa boeger, som ikke er en reduceret sats men en undtagelse, saa den
   * staar i `undtagelse` og ikke i `reduceret`.
   */
  reduceret: number | null;
  /** En undtagelse vaerd at navngive, fordi den ofte er det folk egentlig spoerger om. */
  undtagelse?: { da: string; se: string };
  /** Norge er ikke i EU, og det skal siges i stedet for at blive listet som EU-medlem. */
  ikkeEu?: true;
}

/**
 * Alle 27 EU-medlemsstater i alfabetisk rækkefoelge paa dansk navn, saa
 * rækkerne staar i samme orden paa begge domæner. Finland skrives med
 * decimalkomma her, fordi det er den notation sidens egen tekst bruger.
 */
export const MOMS_LANDE: readonly MomsLand[] = [
  { kode: "AT", navn: { da: "Østrig", se: "Österrike" }, standard: 20, reduceret: 10 },
  { kode: "BE", navn: { da: "Belgien", se: "Belgien" }, standard: 21, reduceret: 6 },
  { kode: "BG", navn: { da: "Bulgarien", se: "Bulgarien" }, standard: 20, reduceret: 9 },
  { kode: "HR", navn: { da: "Kroatien", se: "Kroatien" }, standard: 25, reduceret: 5 },
  { kode: "CY", navn: { da: "Cypern", se: "Cypern" }, standard: 19, reduceret: 5 },
  { kode: "CZ", navn: { da: "Tjekkiet", se: "Tjeckien" }, standard: 21, reduceret: 12 },
  {
    kode: "DK",
    navn: { da: "Danmark", se: "Danmark" },
    standard: 25,
    reduceret: null,
    undtagelse: { da: "Bøger, aviser og tidsskrifter er 0 %", se: "Böcker, tidningar och tidskrifter är 0 %" },
  },
  { kode: "EE", navn: { da: "Estland", se: "Estland" }, standard: 24, reduceret: 9 },
  { kode: "FI", navn: { da: "Finland", se: "Finland" }, standard: 25.5, reduceret: 10 },
  { kode: "FR", navn: { da: "Frankrig", se: "Frankrike" }, standard: 20, reduceret: 5.5 },
  { kode: "EL", navn: { da: "Grækenland", se: "Grekland" }, standard: 24, reduceret: 6 },
  { kode: "HU", navn: { da: "Ungarn", se: "Ungern" }, standard: 27, reduceret: 5 },
  { kode: "IE", navn: { da: "Irland", se: "Irland" }, standard: 23, reduceret: 9 },
  { kode: "IT", navn: { da: "Italien", se: "Italien" }, standard: 22, reduceret: 5 },
  { kode: "LV", navn: { da: "Letland", se: "Lettland" }, standard: 21, reduceret: 5 },
  { kode: "LT", navn: { da: "Litauen", se: "Litauen" }, standard: 21, reduceret: 5 },
  { kode: "LU", navn: { da: "Luxembourg", se: "Luxemburg" }, standard: 17, reduceret: 8 },
  { kode: "MT", navn: { da: "Malta", se: "Malta" }, standard: 18, reduceret: 5 },
  {
    kode: "NL",
    navn: { da: "Holland", se: "Nederländerna" },
    standard: 21,
    reduceret: 9,
  },
  { kode: "PL", navn: { da: "Polen", se: "Polen" }, standard: 23, reduceret: 5 },
  { kode: "PT", navn: { da: "Portugal", se: "Portugal" }, standard: 23, reduceret: 6 },
  { kode: "RO", navn: { da: "Rumænien", se: "Rumänien" }, standard: 21, reduceret: 11 },
  { kode: "SK", navn: { da: "Slovakiet", se: "Slovakien" }, standard: 23, reduceret: 5 },
  { kode: "SI", navn: { da: "Slovenien", se: "Slovenien" }, standard: 22, reduceret: 5 },
  { kode: "ES", navn: { da: "Spanien", se: "Spanien" }, standard: 21, reduceret: 10 },
  { kode: "SE", navn: { da: "Sverige", se: "Sverige" }, standard: 25, reduceret: 6 },
  { kode: "DE", navn: { da: "Tyskland", se: "Tyskland" }, standard: 19, reduceret: 7 },
  {
    kode: "NO",
    navn: { da: "Norge", se: "Norge" },
    standard: 25,
    reduceret: 12,
    undtagelse: { da: "Fødevarer er 15 %", se: "Livsmedel är 15 %" },
    ikkeEu: true,
  },
];

/** Laegses op paa ISO-kode, saa kilden og tabellen ikke kan glide fra hinanden. */
export function momsLand(kode: string): MomsLand {
  const land = MOMS_LANDE.find((l) => l.kode === kode);
  if (!land) throw new Error(`Ukendt momssatsland: ${kode}`);
  return land;
}

/**
 * Den laveste og hoejeste standardsats i tabellen. Den er **beregnet** af
 * `MOMS_LANDE` og ikke skrevet i filen, fordi brødteksten i dag siger
 * "varierer fra 17 % (Luxembourg) til 27 % (Ungarn)" — to tal der hang paa
 * to lande, som en ny sats kunne gøre forkerte uden at nogen opdagede det.
 */
export function momsSatsUdenraekke(): { lavest: MomsLand; hoejest: MomsLand } {
  const sorteret = [...MOMS_LANDE].sort((a, b) => a.standard - b.standard);
  return { lavest: sorteret[0], hoejest: sorteret[sorteret.length - 1] };
}

export interface MomsUdenlandRaekke {
  land: MomsLand;
  /** 100 kr. ekskl. moms i landet -> pris inkl. moms, regnet af `beregnMoms`. */
  prisInklMoms100: number;
  /** Hvad 100 kr. inkl. moms koster ekskl. moms i landet. */
  prisUdenMoms100: number;
  /** Forskellen i procent, saa en laeser kan se satsen uden at regne. */
  sats: number;
}

/**
 * Rækkerne i "Momssatsen i EU's medlemslande", hver beregnet af `beregnMoms` —
 * samme modul og samme regnestykke som vaerktøjet bruger, saa tabellen ikke kan
 * vise en pris vaerktøjet ikke ville give. 100 kr. er valgt, fordi det er
 * mindste runde tal, en laeser kan efterprøve paa kassen.
 */
export function udenlandRaeekker(): MomsUdenlandRaekke[] {
  return MOMS_LANDE.map((land) => {
    const med = beregnMoms(100, "tillaegMoms", land.standard);
    const uden = beregnMoms(100, "fratraekMoms", land.standard);
    return {
      land,
      prisInklMoms100: med.prisInklMoms,
      prisUdenMoms100: uden.prisUdenMoms,
      sats: land.standard,
    };
  });
}

interface FaqFormat {
  procent: (tal: number) => string;
  pris: (tal: number) => string;
}

/**
 * De to svar, der indeholder et tal fra tabellen, er skrevet her og ikke i
 * `page-data.ts`, saa de **laeses af `MOMS_LANDE`** i stedet for at være
 * gentaget ved siden af. Hvis Luxembourg eller et hvilket som helst andet land
 * ændrer sats, ændrer svaret og tabellen sig med — ellers ville de to steder
 * kunne komme til at modsige hinanden, hvilket er hele den fejl C84, C86 og
 * C192 rettede.
 */
export function landSvarSprogholdig(
  kode: string,
  locale: "da" | "se",
  format: FaqFormat
): string {
  const land = momsLand(kode);
  const pris = beregnMoms(100, "tillaegMoms", land.standard).prisInklMoms;
  const reduceret =
    land.reduceret === null
      ? locale === "da"
        ? "ingen reducerede satser"
        : "inga reducerade satser"
      : locale === "da"
        ? `en reduceret sats på ${format.procent(land.reduceret)} %`
        : `en reducerad sats på ${format.procent(land.reduceret)} %`;

  if (locale === "da") {
    return (
      `Momssatsen i ${land.navn.da} er ${format.procent(land.standard)} %` +
      (land.ikkeEu ? ", og landet er ikke medlem af EU. " : ". ") +
      `Der er ${reduceret}. 100 kr. ekskl. moms koster ${format.pris(pris)} inkl. moms i ${land.navn.da}, ` +
      `fordi 100 × ${format.procent(land.standard)}/100 = ${format.procent(land.standard)} kr. moms.`
    );
  }
  return (
    `Momssatsen i ${land.navn.se} är ${format.procent(land.standard)} %` +
    (land.ikkeEu ? ", och landet ingår inte i EU. " : ". ") +
    `Det finns ${reduceret}. 100 kr. exkl. moms kostar ${format.pris(pris)} inkl. moms i ${land.navn.se}, ` +
    `eftersom 100 × ${format.procent(land.standard)}/100 = ${format.procent(land.standard)} kr. moms.`
  );
}

/**
 * Svaret på "hvad er den laveste momssats i EU" — igen læst af tabellen, så
 * det ikke kan blive "17 %" mens tabellen siger noget andet.
 */
export function satsUdenraekkeSvar(
  locale: "da" | "se",
  format: FaqFormat
): string {
  const { lavest, hoejest } = momsSatsUdenraekke();
  if (locale === "da") {
    return (
      `Den laveste standardsats i EU er ${format.procent(lavest.standard)} % i ${lavest.navn.da}, ` +
      `og den højeste er ${format.procent(hoejest.standard)} % i ${hoejest.navn.da}. ` +
      `Danmarks 25 % ligger i den høje ende, men laveste sats er ikke det samme som den laveste pris: ` +
      `en vare til 100 kr. ekskl. moms koster 117 kr. med luxembourgsk moms mod 127 kr. med ungarsk.`
    );
  }
  return (
    `Den lägsta standardsatsen i EU är ${format.procent(lavest.standard)} % i ${lavest.navn.se}, ` +
    `och den högsta är ${format.procent(hoejest.standard)} % i ${hoejest.navn.se}. ` +
    `Sveriges 25 % ligger i den höga delen, men lägsta sats är inte detsamma som lägsta pris: ` +
    `en vara till 100 kr. exkl. moms kostar 117 kr. med luxemburgsk moms mot 127 kr. med ungersk.`
  );
}
