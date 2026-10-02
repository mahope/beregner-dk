/**
 * Leasing: månedsydelsen på en leasingaftale og den treleddede sammenligning
 * med billån og kontantkøb, som `/leasing` viser.
 *
 * ## Hvorfor sammenligningen var misvisende
 *
 * Før denne samling lå hele regnestykket i `LeasingBeregner.tsx`'s `useMemo`,
 * og sammenligningen stillede op **bruttobeløbene** over for hinanden: leasing
 * 178.350 kr mod billån 319.134 kr. Det læser som om leasing er 140.784 kr
 * billigere — men på de 36 måneder sidder du med en bil, der er værd 150.000
 * kr, fordi du ejer den under hele løbetiden. Regner man restværdien ind, er
 * billånets **netto** 169.134 kr, altså *billigere* end leasing. Begge tal var
 * rigtige, og sammenligningen var alligevel det modsatte af rigtigt.
 *
 * Derfor har hver mulighed nu to tal mere end den før havde:
 *
 * - **`ejerVedUdlob`** — bilens værdi, når perioden er slut. 0 for leasing,
 *   fordi du afleverer bilen. Restværdien for de to køb.
 * - **`nettoOmkostning`** = `total` − `ejerVedUdlod`. Det er priset for at
 *   bruge bilen i de 36 måneder, altså det eneste tal de tre kan sammenlignes på.
 *
 * ## Hvad modulet ikke regner
 *
 * - **Skat.** Leasing er skattemæssigt forskellig alt efter om den er privat
 *   eller erhvervsmæssig, så en enkelt sats ville være en gæt. Siden siger det.
 * - **Gebyrer.** Leasingselskabets bonus- og serviceavgifter ligger i aftalen,
 *   ikke i nogen offentlig sats, så de holdes på 0.
 * - **Kontantkøbets kapitalomkostning.** Ved kontantkøb binder du hele
 *   købsprisen i stedet for at betale renter. Den forskel er reel, men den
 *   afhænger af den rente *du* ellers kunne få, så den tages ikke med i tallene —
 *   kun nævnt i teksten, så påstanden ikke bliver bredere end beløbene.
 */

import { formatBelob } from "./format";
import type { Locale } from "./i18n";

/** Antal terminer pr. år i renteformlen. */
const TERMINER_PR_AAR = 12;

export interface LeasingInput {
  /** Bilens samlede pris inkl. moms. */
  bilpris: number;
  /** Bilens værdi, når leasingperioden er slut. */
  restvaerdi: number;
  /** Løbetid i måneder. */
  loebetid: number;
  /** Nominal rentesats i procent pr. år. */
  rentesats: number;
  /** Udbetaling ved indgåelsen. */
  udbetaling: number;
}

export interface LeasingResultat {
  /** `bilpris` minus `restvaerdi` — det bilen taber værdi over løbetiden. */
  vaerdtab: number;
  /** Den gæld renterne beregnes af: prisen minus udbetalingen plus restværdien, delt i to. */
  gennemsnitsGaeld: number;
  /** Månedlig ydelse, uden afrunding. */
  maanedligYdelse: number;
  /** Alle ydelser plus udbetalingen, uden afrunding. */
  totalLeasing: number;
  /** `totalLeasing` minus udbetalingen minus afskrivningen. */
  totalRente: number;
}

/**
 * Månedsydelsen på en leasingaftale.
 *
 * Ydelsen er værdiforringelsen delt på månederne **plus** renter på en
 * gennemsnitlig gæld. Gælden er ikke restværdien — den er, hvad du har bundet
 * i bilen, altså prisen minus udbetalingen, plus det du får tilbage, delt i to.
 *
 * Uden gyldig pris eller løbetid er der ingen ydelse, så funktionen giver
 * `null` frem for et tal bygget på division med nul. `LeasingBeregner.tsx`
 * bruger samme betingelse, som den gjorde før.
 */
export function beregnLeasing(input: LeasingInput): LeasingResultat | null {
  const { bilpris, restvaerdi, loebetid, rentesats, udbetaling } = input;
  if (bilpris <= 0 || loebetid <= 0) return null;

  const maanedligRente = rentesats / 100 / TERMINER_PR_AAR;
  const vaerdtab = bilpris - restvaerdi;
  const afskrivning = (bilpris - udbetaling - restvaerdi) / loebetid;
  const gennemsnitsGaeld = (bilpris - udbetaling + restvaerdi) / 2;
  const renteBeloeb = gennemsnitsGaeld * maanedligRente;
  const maanedligYdelse = afskrivning + renteBeloeb;

  return {
    vaerdtab,
    gennemsnitsGaeld,
    maanedligYdelse,
    totalLeasing: udbetaling + maanedligYdelse * loebetid,
    totalRente: renteBeloeb * loebetid,
  };
}

/** De tre måder at få bilen på, som `/leasing` sammenligner. */
export type LeasingMulighed = "leasing" | "billaan" | "kontant";

export interface FinansieringMulighed {
  /** Hvad der forlader kontoen hver måned. */
  maanedlig: number;
  /** Alt betalt i løbetiden, udbetalingen medregnet. */
  total: number;
  /** Bilens værdi, når perioden er slut. 0 for leasing. */
  ejerVedUdlob: number;
  /** `total` minus `ejerVedUdlob`: det er priset for at bruge bilen. */
  nettoOmkostning: number;
  /** Ejer du bilen, når perioden er slut? */
  egerBil: boolean;
}

/** De to måder at betale for bilen over løbetiden, som kan sammenlignes. */
export type Afdragsform = "leasing" | "billaan";

export interface LeasingSammenlign extends LeasingResultat {
  leasing: FinansieringMulighed;
  billaan: FinansieringMulighed;
  kontant: FinansieringMulighed;
  /**
   * Den billigste af de to afdragsformer, målt i `nettoOmkostning`.
   *
   * **Kontantkøb er bevidst ikke med.** Det koster aldrig mere end et billån i
   * denne model, fordi det ikke har en rente at betale — men det forlanger
   * hele købsprisen på én gang. Lægger man den foregåede rente på den bundne
   * kapital ind, blir resultatet *præcis* leasingens, fordi leasings gæld er
   * den samme gennemsnitsgæld. At pege på kontantkøb som den billigste ville
   * derfor være rigtigt og ligegyldigt på én gang, så dommen gælder de to
   * afdragsformer, som er dem brugeren i praksis vælger imellem.
   */
  billigst: Afdragsform;
  /**
   * Hvad et billån er billigere end leasing, målt i netto. Positivt tal betyder
   * at billånet er billigere. Kan være negativt.
   */
  billaanFordel: number;
}

/**
 * Den månedlige ydelse på et annuitetslån:
 *
 *   ydelse = lån × r × (1 + r)^n / ((1 + r)^n − 1)
 *
 * En rente på 0 % er ikke et annuitetslån, men den simple fordeling lånet over
 * månederne er den rigtige grænse, så den har sit eget fald — ellers ville
 * `(1 + 0)^n − 1` være 0.
 */
function ydelsePaaAnnuitaet(
  laanebelob: number,
  maanedligRente: number,
  antalBetalinger: number,
): number {
  if (maanedligRente === 0) return laanebelob / antalBetalinger;
  const faktor = Math.pow(1 + maanedligRente, antalBetalinger);
  return (laanebelob * maanedligRente * faktor) / (faktor - 1);
}

/**
 * Leasing mod billån mod kontantkøb, målt på det samme tal: hvad det koster at
 * have bilen i løbetiden.
 *
 * De månedlige tal er uændrede fra den gamle sammenligning, så det eneste nye
 * er `ejerVedUdlob` og `nettoOmkostning`. Ved **kontantkøb** vises værdiforringen
 * fordelt på løbetiden, altsig depreciationen pr. måned — ikke en ydelse, du
 * betaler til nogen.
 */
export function beregnLeasingSammenlign(
  input: LeasingInput,
): LeasingSammenlign | null {
  const leasing = beregnLeasing(input);
  if (!leasing) return null;

  const { bilpris, restvaerdi, loebetid, rentesats, udbetaling } = input;
  const maanedligRente = rentesats / 100 / TERMINER_PR_AAR;

  const laanebelob = bilpris - udbetaling;
  const maanedligLaan = ydelsePaaAnnuitaet(laanebelob, maanedligRente, loebetid);
  const totalLaan = udbetaling + maanedligLaan * loebetid;
  // Værditab fordelt på løbetiden — altså depreciationen pr. måned, som er
  // det leasingydelsen sammenlignes mod. (Prisen minus udbetalingen delt på
  // månederne er kapitalbindingen, ikke omkostningen, og er et andet tal.)
  const kontantMaanedlig = (bilpris - restvaerdi) / loebetid;
  const totalKontant = bilpris;

  const muligheder: Record<LeasingMulighed, FinansieringMulighed> = {
    leasing: {
      maanedlig: leasing.maanedligYdelse,
      total: leasing.totalLeasing,
      ejerVedUdlob: 0,
      nettoOmkostning: leasing.totalLeasing,
      egerBil: false,
    },
    billaan: {
      maanedlig: maanedligLaan,
      total: totalLaan,
      ejerVedUdlob: restvaerdi,
      nettoOmkostning: totalLaan - restvaerdi,
      egerBil: true,
    },
    kontant: {
      maanedlig: kontantMaanedlig,
      total: totalKontant,
      ejerVedUdlob: restvaerdi,
      nettoOmkostning: totalKontant - restvaerdi,
      egerBil: true,
    },
  };

  const billigst: Afdragsform =
    muligheder.billaan.nettoOmkostning <= muligheder.leasing.nettoOmkostning
      ? "billaan"
      : "leasing";

  return {
    ...leasing,
    ...muligheder,
    billigst,
    billaanFordel: muligheder.leasing.nettoOmkostning - muligheder.billaan.nettoOmkostning,
  };
}

/** Hvad de tre muligheder hedder i løbende tekst, pr. sprog. */
const MULIGHED_NAVN: Record<Locale, Record<Afdragsform, string>> = {
  da: { leasing: "leasing", billaan: "et billån" },
  se: { leasing: "leasing", billaan: "ett billån" },
  no: { leasing: "leasing", billaan: "et billån" },
};

/**
 * Den sætning, der udpeger den billigste afdragsform, bygget af tallene ovenfor.
 *
 * Den ligger i modulet og ikke i komponenten, fordi den er et **udgave fra
 * kaloriet**: Google læser den i JSON-LD'en, og brugeren skal se præcis den.
 * En håndskreven sætning om de tre beløb kan derfor glide fra det, værktøjet
 * viser — hvilket var hele fejlen på `/procent` og `/vaegttab`.
 */
export function leasingSammenlignSætning(
  sammenlign: LeasingSammenlign,
  loebetid: number,
  locale: Locale,
): string {
  const navn = MULIGHED_NAVN[locale][sammenlign.billigst];
  const enhed = locale === "da" ? "kr." : "kr";
  const vindere = sammenlign[sammenlign.billigst];
  const maaneder = formatBelob(loebetid, locale);
  const netto = `${formatBelob(vindere.nettoOmkostning, locale)} ${enhed}`;
  const leasingNetto = `${formatBelob(sammenlign.leasing.nettoOmkostning, locale)} ${enhed}`;
  const tilbage = `${formatBelob(vindere.ejerVedUdlob, locale)} ${enhed}`;
  const vaerdtab = `${formatBelob(sammenlign.kontant.nettoOmkostning, locale)} ${enhed}`;

  if (locale === "se") {
    return `Med dina siffror är ${navn} billigast: ${netto} mot ${leasingNetto} för leasing över ${maaneder} månader. När perioden är slut står du med ${tilbage} i bil, medan du med leasing står med 0 kr. Kontantköp kostar värdeminskningen på ${vaerdtab} utan ränta, men binder hela köppriset på en gång.`;
  }
  if (locale === "no") {
    return `Med tallene dine er ${navn} billigst: ${netto} mot ${leasingNetto} for leasing over ${maaneder} måneder. Når perioden er slutt står du igjen med ${tilbage} i bil, mens du med leasing står igjen med 0 kr. Kontantkjøp koster verdireduksjonen på ${vaerdtab} uten renter, men binder hele kjøpeprisen på én gang.`;
  }
  return `Med dine tal er ${navn} billigst: ${netto} mod ${leasingNetto} for leasing over ${maaneder} måneder. Når perioden er slut står du med ${tilbage} i bil, mens du med leasing står med 0 kr. Kontantkøb koster værdiforringelsen på ${vaerdtab} uden renter, men binder hele købsprisen på én gang.`;
}

/**
 * Standardeksemplet på `/leasing`. Det er de samme tal, værktøjet starter med,
 * så eksemplet i titlen og brødteksten er det, brugeren ser ved åbning.
 */
export const LEASING_EKSEMPEL: LeasingInput = {
  bilpris: 300000,
  restvaerdi: 150000,
  loebetid: 36,
  rentesats: 4.5,
  udbetaling: 30000,
};

/**
 * «mer» eller «mindre» i sætningen om forskellen mellem leasing og billån.
 *
 * Sætningen har **billånet** som subjekt («Ett billån … kostar 169 140 kr,
 * alltså 9 210 kr …»), så ordet skal beskrive billånet i forhold til
 * leasingen. Det afgør `sammenlign.billigst` — den samme vinder resten af
 * siden viser — så ordet og tabellen ikke kan modsige hinanden. (Før stod
 * det i sin egen ternie på `billaanFordel`, hvis fortegn var omvendt, så
 * standardeksemplet sagde «9 210 kr mer» om et billån der er billigere.)
 */
function sammenlignOrd(sammenlign: LeasingSammenlign, locale: Locale): string {
  const billaanErBilligere = sammenlign.billigst === "billaan";
  if (locale === "da") return billaanErBilligere ? "mindre" : "mere";
  return billaanErBilligere ? "mindre" : "mer";
}

/**
 * Svaret på «blir leasing billigere eller dyrere end et billån?», regnet på
 * `LEASING_EKSEMPEL`.
 *
 * Det stod før som «Det beror på restvärdet och räntan» med intet tal, selv om
 * spørgsmålet er hele pointen med siden. Nu siger svaret, hvad kalkylatorens
 * egne tal svarer — og det er **modulet** der svarer, ikke siden, så et tal i
 * FAQ'en og et tal i værktøjet ikke kan glide fra hinanden.
 *
 * Kun den svenske side har brødtekst om sammenligningen i dag. Dansk og norsk
 * har generiske FAQ'er, så de får svaret, når de oversættes.
 */
export function leasingSammenlignFaqSvar(
  sammenlign: LeasingSammenlign,
  locale: Locale,
): string {
  // Skabelonen ejer punktet: den skriver «kr» (ikke «kr.») i dansk, fordi
  // «kr.» + skabelonens punktum gav «178.350 kr..» og «169.140 kr.,».
  const enhed = "kr";
  const leasing = formatBelob(sammenlign.leasing.nettoOmkostning, locale);
  const billaan = formatBelob(sammenlign.billaan.nettoOmkostning, locale);
  const tilbage = formatBelob(sammenlign.billaan.ejerVedUdlob, locale);
  const rente = formatBelob(LEASING_EKSEMPEL.rentesats, locale, 1);
  const pris = formatBelob(LEASING_EKSEMPEL.bilpris, locale);
  const rest = formatBelob(LEASING_EKSEMPEL.restvaerdi, locale);
  const indskud = formatBelob(LEASING_EKSEMPEL.udbetaling, locale);
  const maaneder = formatBelob(LEASING_EKSEMPEL.loebetid, locale);

  // Hvilken af de to der er dyrest, afhænger af tallene — en sætning der
  // antager, at leasing altid er dyrest, ville være forkert for de andre
  // løbetider og restværdier, som brugeren netop kan indtaste. Derfor er
  // både beløbet og ordet læst af `sammenlign`, ikke af et tegn.
  const forskel = Math.abs(sammenlign.billaanFordel);
  const ord = sammenlignOrd(sammenlign, locale);

  if (locale === "se") {
    return `Det beror på restvärdet och räntan. Med kalkylatorns standardvärden — ${pris} kr i bilpris, ${rest} kr i restvärde, ${rente} % ränta, ${indskud} kr i kontantinsats och ${maaneder} månader — kostar leasingen ${leasing} ${enhed}. Ett billån med samma förutsättningar kostar ${billaan} ${enhed}, alltså ${formatBelob(forskel, locale)} ${enhed} ${ord}. Skillnaden är att du äger bilen under ett billån: du har ${tilbage} ${enhed} kvar att sälja den för när långivstiden är slut, medan du med leasing står med 0 ${enhed}.`;
  }
  if (locale === "no") {
    return `Det avhenger av restverdien og renten. Med kalkylatorens standardverdier — ${pris} kr i bilpris, ${rest} kr i restverdi, ${rente} % rente, ${indskud} kr i egenkapital og ${maaneder} måneder — koster leasingen ${leasing} ${enhed}. Et billån med samme forutsetninger koster ${billaan} ${enhed}, altså ${formatBelob(forskel, locale)} ${enhed} ${ord}. Forskjellen er at du eier bilen på et billån: du har ${tilbage} ${enhed} igjen å selge den for når løpetiden er ute, mens du med leasing står igjen med 0 ${enhed}.`;
  }
  return `Det afhænger af restværdien og renten. Med beregnerens standardværdier — ${pris} kr i bilpris, ${rest} kr i restværdi, ${rente} % rente, ${indskud} kr i udbetaling og ${maaneder} måneder — koster leasingen ${leasing} ${enhed}. Et billån med samme forudsætninger koster ${billaan} ${enhed}, altså ${formatBelob(forskel, locale)} ${enhed} ${ord}. Forskellen er, at du ejer bilen på et billån: du har ${tilbage} ${enhed} tilbage at sælge den for, når lånet er betalt, mens du med leasing står med 0 ${enhed}.`;
}
