import type { Locale } from "./i18n";
import { BARSEL_2026, DAGPENGE_2026, SATSER_2026, SKATTEFRADRAG_2026, SU_2026 } from "./satser-2026";
import { SOLCELLE_LEVETID_AAR_MAX, SOLCELLE_LEVETID_AAR_MIN } from "./energi/solceller";
import { BRAENDSTOF_EGENT_FORBRUG, BRAENDSTOF_EKSEMPEL_KM, BRAENDSTOF_FORUDSETNINGER, BRAENDSTOF_FORUDSETNINGER_SE, besparelseProcent, braendstofEksempelRækker, breakEvenKwhPris, elbilSammenligning, heleKroner, literPr100km, prisPrKm, prisPrMil, procent1Decimals } from "./braendstof";
import { beregnElbilLading, elbilLadingStandard } from "./elbil-lading";
import { HUSLEJE_EKSEMPEL, HUSLEJE_STANDARD } from "./husleje";
import {
  NETTOPRISINDEKS_2026M08,
  FORBRUGERPRISINDEKS_2026M08,
  NETTOPRISINDELS_MAANED,
  beregnHuslejestigning,
  nettoprisindeksUnderForbrugerprisindeks,
} from "./nettoprisindeks";
import { landSvarSprogholdig, satsUdenraekkeSvar } from "./moms-eu";
import {
  beregnImportmoms,
  EGENVAERDI_GRENSE_KR_OMRUND,
  IMPORTMOMS_EKEMPEL,
} from "./importmoms";
import { ruteCacheSætning } from "./rute-cache";
import {
  EXCEL_ANDEL,
  PROCENT_10_AF_FAQ,
  PROCENT_15_AV_BELOEB,
  PROCENT_SKILLNAD_EKSEMPEL,
  RABAT_BELOEB,
  RABAT_EKSEMPEL,
  RABAT_SATS_UDLAET,
  procentAf,
  procentDifferens,
  procentForskel,
  rabatProcent,
} from "./procent";
import { formatBelob, formatNumber, formatSvenskText } from "./format";
import { BMI_BAAND, vaegtInterval } from "./bmi-voksen-grænser";
import { idealvaegtResultat, rundIdealvaegt } from "./idealvaegt";
import { RUMFANG_EKSEMPEL, LITER_PR_KUBIKMETER } from "./rumfang";
import { AREAL_EKSEMPEL, KVADRATCENTIMETER_PR_KVADRATMETER } from "./areal";
import { OMKREDS_EKSEMPEL } from "./omkreds";
import { HUNDEALDER_EKSEMPEL, menneskeAar, regnestykke } from "./hundealder";
import { BYGGEPRIS_NIVEAUER, beregnByggepris } from "./byggepris";
import {
  GAELDSFAKTOR_STANDARD,
  LAANEKAPACITET_EKSEMPEL,
  REALKREDIT_MAKS_PCT,
  UDBETALING_MIN_PCT,
  beregnLaanekapacitet,
} from "./laanekapacitet";
import {
  LAANETYPE_EKSEMPEL_AARSRENTE,
  LAANETYPE_EKSEMPEL_HOVEDSTOL,
  LAANETYPE_EKSEMPEL_LOEBETID,
  laanetypeEksempelFor,
  laanetypeEksempelKryds,
} from "./laantype";
import {
  SEERAFSTAND_FJERN_GRAD,
  SEERAFSTAND_NAER_GRAD,
  beregnSeerafstand,
  beregnSkarmMaal,
} from "./skaermstorrelse";
import { LEASING_EKSEMPEL, beregnLeasingSammenlign, leasingSammenlignFaqSvar } from "./leasing";
import {
  BROKOST_KATEGORIER,
  BROKOST_RABATTER,
  BROKOST_START,
  brokostForskel,
  brokostKategori,
} from "./brokost";
import {
  ORESUND_GO_AARSAFGIFT,
  ORESUND_START,
  ORESUND_START_TURE,
  oresundKategori,
} from "./oresundsbroen";
import { NUTIDSKRONER_EKSEMPEL_AAR, omregnTilNutidskroner } from "./nutidskroner";
import { GAVE_RELATIONER, beregnGaveafgift } from "./gaveafgift";
import { KIRKESKAT_EKSEMPLER, KIRKESKAT_SNIT, KIRKESKAT_EKSEMPEL_INDKOMST, beregnKirkeskat, kirkeskatSats } from "./kirkeskat";
import { MALING_DAEKNING_M2_PR_LITER, MALING_STANDARD_SPILD_PCT } from "./maling";

/**
 * Sidens egne tal til `/brokost`. De læser samme konstanter som værktøjet, så
 * brødteksten, FAQ'en og værktøjet ikke kan komme til at sige hver sit.
 */
const BROKOST_START_KAT = brokostKategori(BROKOST_START)!;
const BROKOST_START_KR = heleKroner(BROKOST_START_KAT.eksprespris);
const BROKOST_KORT_KR = heleKroner(BROKOST_START_KAT.kortpris!);
const BROKOST_FORSKEL_KR = heleKroner(brokostForskel(BROKOST_START_KAT)!);
const BROKOST_RETUR_KR = heleKroner(BROKOST_START_KAT.eksprespris * 2);
const BROKOST_AFTEN_KR = heleKroner(BROKOST_START_KAT.eksprespris * 2 - BROKOST_RABATTER.aften);
const BROKOST_WEEKEND_KR = heleKroner(BROKOST_RABATTER.weekend);
const BROKOST_ANHAENGER_KR = heleKroner(brokostKategori("personbil-anhaenger-over-6")!.eksprespris);
const BROKOST_CAMPER_KR = heleKroner(brokostKategori("autocamper-10")!.eksprespris);
const BROKOST_CAMPERAFTALE_KR = heleKroner(brokostKategori("autocamper-aftale")!.eksprespris);

/**
 * Sidens egne tal til Øresundsbroen, samme princip som for Storebælt.
 */
const ORESUND_START_KAT = oresundKategori(ORESUND_START)!;
const ORESUND_START_GO_KR = heleKroner(ORESUND_START_KAT.go);
const ORESUND_START_ONLINE_KR = heleKroner(ORESUND_START_KAT.online);
const ORESUND_START_NORMAL_KR = heleKroner(ORESUND_START_KAT.normal);
const ORESUND_GO_AARSAFGIFT_KR = heleKroner(ORESUND_GO_AARSAFGIFT);
const ORESUND_START_AAR_GO_KR = heleKroner(
  ORESUND_GO_AARSAFGIFT + ORESUND_START_KAT.go * 2 * ORESUND_START_TURE
);
const ORESUND_START_AAR_NORMAL_KR = heleKroner(ORESUND_START_KAT.normal * 2 * ORESUND_START_TURE);

/**
 * Titlens regnede eksempel til `/nutidskroner`. Det læses fra `nutidskroner.ts`
 * — samme modul som værktøjet og eksempeltabellen på siden bruger — så titlen
 * ikke kan love et andet tal, end beregneren viser.
 */
export const NUTIDSKRONER_TITEL_EKSEMPEL = (() => {
  const aar = NUTIDSKRONER_EKSEMPEL_AAR[1]; // 1990
  const beloeb = Math.round(omregnTilNutidskroner(10_000, aar)!.beloeb);
  return `10.000 kr. fra ${aar} = ${beloeb.toLocaleString("da-DK")} kr.`;
})();
import { leasingSeEksempelTekster } from "./leasing-eksempler";
import { procentpointForskelFaqSvar } from "./procentpoint";
import {
  BESKAEFTIGELSESTILLAEG_2026,
  INDKOMSTKRAV_2026,
  dagpengeEfterSkatFaqSvar,
  dagpengeKroner,
  dagpengeNyuddannetFaqSvar,
  dagpengeNyuddannetPeriodeFaqSvar,
  dagpengeTimer,
} from "./dagpenge-satser";
import { markedsprisFaqSvar } from "./timepris-markedspriser";
import { timerIPeriodeFaqSvar } from "./timer-periode";
import { ugeDatoerFaqSvar } from "./ugenummer";
import { dageIAar, dageMellemIsoDatoer, ugedagResultat } from "./ugedag";
import { distanceEksempelFaqSvar, triatlonCykelAndelFaqSvar, triatlonTotalFaqSvar } from "./pace";
import { kalorierFaqItems, kalorierOverskrifter } from "./kalorier-eksempler";
import {
  aktieskatBeskrivelse,
  aktieskatFaqItems,
  aktieskatOgBeskrivelse,
  aktieskatSchemaBeskrivelse,
} from "./aktieskat-eksempler";
import { vaegttabFaqItems, vaegttabOverskrifter } from "./vaegttab-eksempler";
import { pensionFaqItems, pensionOverskrifter } from "./pension-eksempler";
import { annuitetsEksempel, hovedEksempel } from "./rente-eksempler";
import { EKSEMPEL_BARN } from "./arveafgift";
import { alderSideTekst, erstatAlderTokens } from "./alder-side-tekst";
import { dageTilDecember } from "./dage-mellem-datoer";
import { iDagPaSiden } from "./lokal-dato";
import { getHelligdage, helligdagsnavne } from "./helligdage";
import { pinseAfstande, pinseInterval } from "./pinse-intervaller";
import { estimerNettoMaaned } from "./barsel/netto";
import { PROMILLE_EKSEAMPLER, formatPromille, formatTimer } from "./promille-eksempler";
import {
  efterloenAldersSvar,
  efterloenDescription,
  efterloenFaqSvar,
  efterloenMetaDescription,
} from "./efterloen-eksempler";
import {
  AM_BIDRAG,
  PERSONFRADRAG_2026,
  loenBelob,
  loenEfterSkatFaqItems,
  loenEfterSkatOgBeskrivelse,
} from "./loen-efter-skat-eksempler";
import {
  rentefradragDescription,
  rentefradragMetaDescription,
  RENTEFRADRAG_FAQ_SVAR,
} from "./rentefradrag-eksempler";
import { topskatBeskrivelse, topskatFaqItems } from "./topskat-eksempler";
import {
  boerneBeskrivelse,
  boerneMetaBeskrivelse,
  boerneTitelEksempel,
  boernepengeFaqItems,
} from "./boernepenge-eksempler";
import {
  kvadratmeterEksempelAreal,
  kvadratmeterEksempelLignelse,
  kvadratmeterEksempelProdukt,
  kvadratmeterFaqSvar,
} from "./kvadratmeter-eksempler";
import { konfirmationFaqSvar } from "./konfirmation-eksempler";
import { fartOmregningsFakta } from "./fart-omregner";
import { PROMILLEGRANSE, PROMILLEGRANSE_UDLAND, PROMILLEGROV_SE } from "./promille";
import { SVENSK_SKATT_2026 as SV_SKATT, SVENSK_SKATT_TAL } from "./svensk-skatt";
import {
  PROMILLE_GENSTANDE_RAEKKER,
  formatPromilleTabel,
  genstandeTilGraense,
  vaegtNogle,
} from "./promille-genstande";

/**
 * svmn.dk's 2026-gennemsnit for kommuneskat, skrevet som procent. Det er
 * **et andet gennemsnit** end middeltallet over de 98 kommuner i `KOMMUNER`
 * (25,626 %), fordi vi ikke ved hvordan svmn.dk danner sit. En FAQ der også
 * nævner den billigste og dyreste kommune skal derfor skrive den sats med sin
 * kilde og ikke kalde den tabellens gennemsnit (review-fund 29/9).
 */
const KOMMUNESKAT_SNIT_PCT = formatNumber(
  SATSER_2026.kommuneskatSnit * 100,
  "da",
  { maximumFractionDigits: 3 }
);

/**
 * Bundfradraget i de to arveafgift-svar. Skrevet her og ikke i svaret, fordi
 * `/arveafgift`s tabel og brødtekst læser samme tal fra `arveafgift`-modulet —
 * et FAQ der skrev sit eget bundfradrag, ville være det tal, der bliver stående
 * naar satsen stiger (punkt 11).
 */
const ARVE_BUNDFRADRAG_TEKST = formatNumber(SATSER_2026.arveBundfradrag, "da");

/**
 * Boafgiften på `/arveafgift`s arveeksempel: 1.000.000 kr til et barn.
 *
 * Regnet af `beregnArveafgift` — samme funktion som `ArveafgiftBeregner` — så
 * bundfradraget stiger og regnestykket i Googles titellinje flytter sig med.
 * Håndskrevet holdt den boafgiften stående ved et nyt bundfradrag (punkt 11).
 */
const ARVE_EKSEMPEL_TEKST = `Arveafgift beregner: 1.000.000 kr. arv = ${formatNumber(EKSEMPEL_BARN.boafgift, "da")} kr. boafgift`;

/**
 * Gaveafgiftens egne tal til `/gaveafgift`s titel, beskrivelse og FAQ. De læser
 * samme satser som `GaveafgiftBeregner` via `GAVE_RELATIONER`, så en ny
 * bundgrænse i 2027 flytter alle tallene med i stedet for at stå stille i
 * titlen (punkt 11).
 */
const GAVE_NAER_TEKST = formatNumber(GAVE_RELATIONER.naer.bundfradrag, "da");
const GAVE_SVIGER_TEKST = formatNumber(GAVE_RELATIONER.svigerboern.bundfradrag, "da");
const GAVE_EKSEMPEL_TEKST = `Gaveafgift 2026: 100.000 kr. gave = ${formatNumber(
  beregnGaveafgift(100_000, "naer")!.afgift,
  "da"
)} kr. i afgift`;

/**
 * Dagpengens egne tal, skrevet ét sted for `/dagpenge`s beskrivelse, FAQ og
 * tabeller. Før 2/10 stod de samme beløb i fem separate strenge — «22.041 kr/md»
 * to gange, «26.198 kr/md» tre gange, «90 %», «8 %» og «263.232 kr» — så en
 * satsstigning ville have efterladt fem tal stående i de gamle (punkt 11).
 * `/dagpenge`s egen side læser dem fra samme modul.
 */
const DAGPENGE_MAX_TEKST = dagpengeKroner(DAGPENGE_2026.fuldtid);
const DAGPENGE_TILLAEG_TEKST = dagpengeKroner(BESKAEFTIGELSESTILLAEG_2026);
const DAGPENGE_INDKOMSTKRAV_TEKST = dagpengeKroner(INDKOMSTKRAV_2026);
const DAGPENGE_PROCENT_TEKST = formatNumber(DAGPENGE_2026.dagpengeProcent * 100, "da", {
  maximumFractionDigits: 0,
});
const DAGPENGE_AM_PROCENT_TEKST = formatNumber(SATSER_2026.amBidrag * 100, "da", {
  maximumFractionDigits: 0,
});
const DAGPENGE_PERIODE_TIMER_TEKST = dagpengeTimer(DAGPENGE_2026.dagpengeperiodeTimer);
const DAGPENGE_BESKRIVELSE = `Beregn dagpenge 2026. Max sats: ${DAGPENGE_MAX_TEKST}/md (${DAGPENGE_PROCENT_TEKST} % af løn efter AM-bidrag). Med beskæftigelsestillæg op til ${DAGPENGE_TILLAEG_TEKST}/md. Beregn din dagpengesats fra din løn.`;

/**
 * Alle tal i `/ugedag` og `/veckodag`s tekst, titel og FAQ er regnet her af
 * `ugedag.ts` — altså af de **samme** funktioner værktøjet kalder. Punkt 11 i
 * kvalitetsreglerne: en påstand i tekst er kode. Hvis brødteksten skrev
 * «torsdag» ved siden af et regnestykke, der siger onsdag, ville en læser
 * miste tilliden til hele siden — og det er præcis den fejl, `tidszone.ts`
 * havde med Danmark mod Australien.
 *
 * Eksemplerne er færdige, kontrollerede datoer: 1. januar 2026 (en torsdag) og
 * 24.–25. december 2026 (torsdag og fredag). Ingen af dem er «i dag», så
 * brødteksten siger det samme i morgen som i dag — en dynamisk eksempeltekst
 * ville få Google til at genspejle en ny titel hver dag.
 */
const UGEDAG_EKSEMPEL = ugedagResultat("2026-01-01", "da")!;
const UGEDAG_EKSEMPEL_SE = ugedagResultat("2026-01-01", "se")!;
const UGEDAG_JULEAFTEN = ugedagResultat("2026-12-24", "da")!;
const UGEDAG_JULEAFTEN_SE = ugedagResultat("2026-12-24", "se")!;
/** 1. januar 2027 er 365 dage efter 1. januar 2026 — 2026 er ikke et skudår. */
const UGEDAG_AAR_2026 = dageIAar(2026);
const UGEDAG_DAGE_2026_2027 = dageMellemIsoDatoer("2026-01-01", "2027-01-01")!;

/**
 * Formateringen i de to momssvar, der laeser et tal ud af `MOMS_LANDE`. Den er
 * laest her og ikke i svaret, fordi ellers ville hvert sprog skrive sit eget
 * talformat ved siden af tabellens.
 */
const MOMS_FAQ_FORMAT = {
  da: {
    procent: (tal: number) => formatNumber(tal, "da", { maximumFractionDigits: 1 }),
    pris: (tal: number) => `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`,
  },
  se: {
    procent: (tal: number) => formatNumber(tal, "se", { maximumFractionDigits: 1 }),
    pris: (tal: number) => `${formatNumber(tal, "se", { maximumFractionDigits: 2 })} kr`,
  },
} as const;

/**
 * De to importmoms-svar på `/moms` — «hvad koster det at købe noget uden for
 * EU» og «er der moms på Temu». Kaldet kommer fra dansk autocomplete 6/10
 * 21:5x: «import moms kalkulator» og «told og moms kalkulator» under «moms
 * kalkulator», «told moms beregner» under «moms beregner» og «moms på temu»
 * under «moms på».
 *
 * Alle beløb læses fra `beregnImportmoms` — samme regnestykke som værktøjet på
 * siden bruger — så svaret ikke kan glide fra den beregning, læseren kan se.
 * KILDER (læst 6/10 2026): ML § 32 stk. 1 og § 33, Rådets forordning (EU)
 * 2026/382, og toldst.dk/borger/internethandel/internethandel-uden-for-eu.
 */
const importmomsSvar = (lang: "da" | "se") => {
  const f = MOMS_FAQ_FORMAT[lang];
  const r = beregnImportmoms(IMPORTMOMS_EKEMPEL)!;
  const grænse = f.pris(EGENVAERDI_GRENSE_KR_OMRUND);
  return lang === "da"
    ? {
        spg1: "Hvad koster det at købe noget uden for EU?",
        svar1: `Varer købt uden for EU er altid pålagt 25 % dansk moms, og momsgrundlaget er varens pris, fragten og tolden (momslovens § 32 stk. 1). En pakke på ${f.pris(r.egenvaerdi)} med ${f.pris(r.fragt)} i fragt og ${r.vareposter} vareposter har ${f.pris(r.told)} i told, så momsgrundlaget er ${f.pris(r.momsgrundlag)} og momsen ${f.pris(r.moms)} — i alt ${f.pris(r.iAlt)} Under 150 EUR (${grænse}) er der fra 1. juli 2026 3 EUR (ca. 22 kr.) i told pr. varepost. Over det gælder den toldsats, EU's toldtarif giver for netop den vare, så den skal du slå op.`,
        spg2: "Er der moms på varer fra Temu, Shein og andre netbutikker uden for EU?",
        svar2: `Ja. Siden 1. juli 2021 er der ingen importmoms-fritagelse længere for varer under 22 EUR, så alle varer købt uden for EU er pålagt 25 % dansk moms, uanset prisen. Er pakken under 150 EUR (${grænse}), betaler du 3 EUR (ca. 22 kr.) i told pr. varepost oveni, og er den over, betaler du den tarifmæssige toldsats.`,
      }
    : {
        spg1: "Vad kostar det att köpa något utanför EU?",
        svar1: `Varor köpta utanför EU är alltid momsbelagda med 25 %, och beskattningsunderlaget är varans pris, frakten och tullen (EU:s momsdirektiv artikel 74). Ett paket på ${f.pris(r.egenvaerdi)} med ${f.pris(r.fragt)} i frakt och ${r.vareposter} varuposter har ${f.pris(r.told)} i tull, så underlaget är ${f.pris(r.momsgrundlag)} och momsen ${f.pris(r.moms)} — totalt ${f.pris(r.iAlt)} Under 150 EUR (${grænse}) gäller från 1 juli 2026 3 EUR (ca 22 kr) i tull per varupost. Över det gäller tullsatsen i EU:s tulltaxa för just den varan.`,
        spg2: "Finns moms på varor från länder utanför EU, som Temu och Shein?",
        svar2: `Ja. Sedan 1 juli 2021 finns ingen längre importmomsbefrielse för varor under 22 EUR, så alla varor köpta utanför EU är momsbelagda med 25 %, oavsett priset. Är paketet under 150 EUR (${grænse}) betalar du 3 EUR (ca 22 kr) i tull per varupost, och är det över gäller tullsatsen i tulltaxan.`,
      };
};

/**
 * FAQ-svarene om "hvornår må jeg køre bil igen" har to forskellige tal: tiden
 * til at komme UNDER lovgrænsen, og tiden til at være helt ædru. Kun det
 * første må bruges til at køre bil — så de skrives fra eksempelmodulet,
 * der regner dem med samme formel som værktøjet bruger.
 */
const PROMILLE_4_OEL = PROMILLE_EKSEAMPLER[0];
const PROMILLE_4_OEL_ER = `${formatPromille(PROMILLE_4_OEL.promille)} ‰`;

/**
 * De svenske svar på "hur många promille är N öl" og "promillegränsen i
 * Danmark" — de to spørgsmål svensk autocomplete faktisk har (10/10
 * variationer under "promille efter"), og som `/promille` på beraknare.se
 * ikke svarade på. Tallene læses fra `promille-genstande`, som regner dem med
 * `beregnPromille` — samme modul som værktøjet — så FAQ'en og tabellen på
 * siden ikke kan komme i strid med hinanden eller med beregneren.
 */
const PROMILE_RAEKKE = (genstande: number) =>
  PROMILLE_GENSTANDE_RAEKKER.find((r) => r.genstande === genstande)!;
const PROMILE_80_MAND = (genstande: number) =>
  formatPromilleTabel(PROMILE_RAEKKE(genstande).promille[vaegtNogle(80, "mand")]);
const PROMILE_60_KVINDE = (genstande: number) =>
  formatPromilleTabel(PROMILE_RAEKKE(genstande).promille[vaegtNogle(60, "kvinde")]);
const PROMILE_70_MAND = (genstande: number) =>
  formatPromilleTabel(PROMILE_RAEKKE(genstande).promille[vaegtNogle(70, "mand")]);

/**
 * Hvor mange øl der skal til for den svenske grænse hos en 80 kg mand.
 *
 * FAQ'en påstod tidligere "nås alltså efter två öl", mens tabellen på samme
 * side viser 0,22 ‰ efter *én* øl, brødteksten ovenfor siger 1, og
 * `genstandeTilGraense` regner 1. Antallet læses derfra nu i stedet for at
 * være håndskrevet — punkt 11: et tal i teksten skal kunne verificeres.
 */
const PROMILE_GRAENSE_80_MAND_SE = genstandeTilGraense(80, "mand", PROMILLEGRANSE.se)!;

/**
 * `/pace`'s distance answers. Before this they were hand-typed sentences in
 * `faqItems` — "En halvmaraton er 21,0975 km. 1 time og 45 minutter er 4:59
 * pr. kilometer." — on a page whose every other number is computed, so the FAQ
 * could answer a different pace than the tool above it. They are built from
 * `distanceEksempelFaqSvar`, which calls `beregnPace`.
 */

export type PageData = {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  category: string;
  breadcrumbCategory: string;
  breadcrumbCategoryHref: string;
  faqItems: { question: string; answer: string }[];
  schemaName: string;
  schemaDescription: string;
  schemaCategory: string;
};

const LEASING_SAMMENLIGN = beregnLeasingSammenlign(LEASING_EKSEMPEL)!;
/** De svenske strenge, der citerer samme eksempel. Se `leasing-eksempler`. */
const LEASING_SE = leasingSeEksempelTekster();

/**
 * Kirkeskattens egne tal til `/kirkeskat`s titel, beskrivelse og FAQ. De læser
 * samme satser som `KirkeskatBeregner` via `kommuner.ts` og `SATSER_2026`, så en
 * ny sats i 2027 flytter alle tallene med i stedet for at stå stille i
 * titlen (punkt 11). Den gennemsnitlige sats står i `SATSER_2026.kirkeskatSnit` —
 * samme kilde som BruttoNettoBeregner og TopskatBeregner bruger.
 */
const KIRKESKAT_KBH_TEKST = formatNumber(kirkeskatSats("København"), "da", { minimumFractionDigits: 2 });
const KIRKESKAT_FRB_TEKST = formatNumber(kirkeskatSats("Frederiksberg"), "da", { minimumFractionDigits: 2 });
const KIRKESKAT_AAR_TEKST = formatNumber(kirkeskatSats("Aarhus"), "da", { minimumFractionDigits: 2 });
const KIRKESKAT_ODD_TEKST = formatNumber(kirkeskatSats("Odense"), "da", { minimumFractionDigits: 2 });
const KIRKESKAT_AAL_TEKST = formatNumber(kirkeskatSats("Aalborg"), "da", { minimumFractionDigits: 2 });
const KIRKESKAT_SNIT_TEKST = formatNumber(KIRKESKAT_SNIT, "da", { minimumFractionDigits: 2 });

/**
 * `/kirkeskat`s eksempel- og FAQ-tal. Læst fra `KIRKESKAT_EKSEMPLER`, så
 * tabellen på siden og svarene i FAQ'en altid hører til de samme satser.
 */
const KIRKESKAT_EKSEMPEL_TEKST = KIRKESKAT_EKSEMPLER
  .map(
    (e) =>
      `${formatBelob(e.skattepligtig, "da")} kr. i ${e.kommune} = ${formatBelob(e.resultat.kirkeskat, "da")} kr. i kirkeskat (${formatNumber(e.resultat.sats, "da", { minimumFractionDigits: 2 })} %)`
  )
  .join("; ");

/**
 * `/fart`s omregnings-FAQ. Dansk autocomplete (hl=da, 6/10 20:3x) svarer
 * «km i timen omregner», «km i timen til miles per hour», «km i timen til
 * meter i sekundet» og «omregner knop til km» — den omvende vej, som
 * `FartOmregner` nu svarer på. Tallene læses fra `fart-omregner`, der regner
 * dem med præcise faktorer, så FAQ'en og værktøjet ikke kan glide fra
 * hinanden (punkt 11).
 */
const FART_OMREGNING = (() => {
  const da = fartOmregningsFakta("da");
  // `se` er formateret med `Intl` i svensk løbende tekst. Tallene her er alle
  // under 1.000, så der kommer ingen tusindtalsseparator ud af `Intl` — kun
  // decimalkomma, som er præcis `formatSvenskText`-formatet.
  const se = fartOmregningsFakta("se");
  return {
    daMil: da.milKm,
    daSomermil: da.somermilKm,
    daMs: da.meterPerSekund,
    daHundredeMs: da.eksempler[0].resultat,
    daHundredeKnop: da.eksempler[2].resultat,
    daTiKnop: da.eksempler[3].resultat,
    daSESSMph: da.eksempler[4].resultat,
    seSomermil: se.somermilKm,
    seMs: se.meterPerSekund,
    seHundredeMs: se.eksempler[0].resultat,
    seHundredeKnop: se.eksempler[2].resultat,
    seTiKnop: se.eksempler[3].resultat,
    seSESSMph: se.eksempler[4].resultat,
  };
})();

const kr = (value: number) => value.toLocaleString("da-DK");
/** Svensk løbende tekst: "643 000" og "32,38" — tallene fra `svensk-skatt`. */
const krSe = (tal: number) => formatSvenskText(tal);
const pctSe = (andel: number, dec = 0) => formatSvenskText(andel * 100, dec);

// ─── /husleje — "25.000 kr netto -> max ca. 7.500 kr/md" er udledt af
// HUSLEJE_STANDARD, som også er beregnerens starttilstand. Det er samme
// regnestykke, og derfor kan siden og værktøjet ikke glide fra hinanden.
const huslejeSvaer = `Tjener du ${kr(HUSLEJE_STANDARD.maanedligNettoLoen)} kr netto → max ca. ${kr(HUSLEJE_EKSEMPEL.maxBoligudgifter)} kr/md (30% reglen)`;

// ─── /husleje — nettoprisindeks. FAQ'en lover beløb, så beløbene skrives fra
// samme modul som siden bruger: en procent, der er kopieret ind i en sætning,
// kan ikke holde, når Danmarks Statistik offentliggør en ny måned.
const krH = (value: number) => value.toLocaleString("da-DK");
const npiPct = (pct: number) => pct.toLocaleString("da-DK");

// Nettoprisindekset og forbrugerprisindekset er to selvstændige tal, og
// hvilket der stiger mest, afhænger af året — det er derfor sætningen læser
// retningen fra tallene i stedet for at hævde den. Se `nettoprisindeks.ts`.
const npiRetning = nettoprisindeksUnderForbrugerprisindeks()
  ? "lavere end"
  : "højere end";

// ─── /braendstof — de tal, FAQ'en lover, udledt af de samme forudsætninger som
// sammenligningstabellen. Den gamle "50-70 %" holdt kun mod benzin (52,8 %)
// og var for højt mod diesel (40,2 %), som værktøjet selv viser.
const elModBenzinPct = procent1Decimals(besparelseProcent("benzin"));
const elModDieselPct = procent1Decimals(besparelseProcent("diesel"));
const elModDieselBreakEven = procent1Decimals(breakEvenKwhPris("diesel"));
const elPris = prisPrKm("el");
const benzinPris = prisPrKm("benzin");
const dieselPris = prisPrKm("diesel");
const krPrKm = (value: number, decimals: number) =>
  value.toFixed(decimals).replace(".", ",") + " kr. pr. km";
/** Procent med komma — dansk, svensk og norsk bruger ikke punktum. */
const pct = (value: number) => value.toFixed(1).replace(".", ",");

// ─── /vaegttab — titel og de fire beskrivelsesfelter lovede 2.209 / 2.759 /
// 550 kcal som tal i sætningen. De kommer nu fra `vaegttabEksempelTal`, som
// regner med præcis VaegttabBeregners egen formel, så søgeresultatet ikke kan
// love et tal, værktøjet ikke længere producerer. Dansk er byte-uændret.
const vaegttabDa = vaegttabOverskrifter("da");
const vaegttabNo = vaegttabOverskrifter("no");
const vaegttabSe = vaegttabOverskrifter("se");

/**
 * /pension er dansk-only, så metadata og de elleve FAQ-svar læser samme
 * konstanter som `folkepension.ts` og `satser-2026.ts`. Svarene er dem, `FAQSchema`
 * giver Google, så et tal der ikke kan glide fra beregneren.
 */
const pensionDa = pensionOverskrifter();

/**
 * De to interval-svar i pinse-klyngen, regnet i `pinse-intervaller` i stedet
 * for skrevet i hånden. Afstandene 39, 49 og 50 dage følger af, at påskedagen
 * er en søndag, så de er ens i ethvert år — porten i `pinse-intervaller.test.ts`
 * låser dem over 61 år. Arbejdsdagene i perioden er derimod *ikke* konstante:
 * når kristi himmelfartsdag falder sidst i maj, kommer grundlovsdagen 5. juni
 * ind i perioden og tager én arbejdsdag med. Derfor står de tal også regnet.
 */
const PINSE_DA = pinseAfstande(2026, "da");
const PINSE_SE = pinseAfstande(2026, "se");
const PINSE_PERIODE_DA = pinseInterval(2026, "da");
const PINSE_PERIODE_SE = pinseInterval(2026, "se");
const PINSE_FRA_PAASKE_DA =
  `Der er ${PINSE_DA.pinse} dage fra påskedagen til pinsedagen og ` +
  `${PINSE_DA.andenPinse} dage til 2. pinsedag — altid, hvert år. ` +
  `Kristi himmelfartsdag er påskedag plus ${PINSE_DA.himmelfart} dage, så ` +
  `mellem kristi himmelfartsdag og pinsedagen er der ${PINSE_DA.himmelfartTilPinse} dage. ` +
  `Påskedagen er en søndag, og derfor ligger de tre dage på hver sin fast ugedag: ` +
  `torsdag, søndag og mandag.`;
const PINSE_PERIODE_DA_TEKST =
  `Pinseperioden er de ${PINSE_PERIODE_DA.periodeKalenderdage} kalenderdage fra ` +
  `kristi himmelfartsdag til 2. pinsedag — ${PINSE_PERIODE_DA.dageHimmelfartTilAndenPinse} dage ` +
  `imellem, ikke én uge, fordi de tre helligdage ligger i to kalenderuger. Inden for dem ` +
  `er der ${PINSE_PERIODE_DA.periodeArbejdsdage} arbejdsdage og ` +
  `${PINSE_PERIODE_DA.periodeFrieDage} dage uden arbejde, og helligdagene i perioden er ` +
  `${PINSE_PERIODE_DA.periodeHelligdagsnavne.join(", ")}. Brug værktøjet ovenfor med de to ` +
  `datoer, hvis du vil tælle en bestemt periode selv.`;
const PINSE_FRA_PAASKE_SE =
  `Det är ${PINSE_SE.pinse} dagar från påskdagen till pingstdagen och ` +
  `${PINSE_SE.andenPinse} dagar till annandag pingst — alltid, varje år. ` +
  `Kristi himmelsfärdsdagen är påskdagen plus ${PINSE_SE.himmelfart} dagar, så mellan ` +
  `kristi himmelsfärdsdagen och pingstdagen ligger det ${PINSE_SE.himmelfartTilPinse} dagar. ` +
  `Påskdagen är en söndag, och därför ligger de tre dagarna på var sin fast veckodag: ` +
  `torsdag, söndag och måndag.`;
const PINSE_PERIODE_SE_TEKST =
  `Pingstperioden är de ${PINSE_PERIODE_SE.periodeKalenderdage} kalenderdagar från kristi ` +
  `himmelsfärdsdagen till annandag pingst — ${PINSE_PERIODE_SE.dageHimmelfartTilAndenPinse} dagar ` +
  `emellan, inte en vecka, eftersom de tre dagarna ligger i två kalenderveckor. Inom dem ` +
  `finns ${PINSE_PERIODE_SE.periodeArbejdsdage} arbetsdagar och ` +
  `${PINSE_PERIODE_SE.periodeFrieDage} dagar utan arbete, och helgdagarna i perioden är ` +
  `${PINSE_PERIODE_SE.periodeHelligdagsnavne.join(", ")}. Annandag pingst är en vanlig måndag ` +
  `i Sverige — bara i Danmark är den en helig dag.`;

// ─── /procent, rabat-FAQ'en. Hvert tal i de fire svenske og to danske svar er
// det samme tal, som afsnittet "Sådan beregner du rabatten i procent" regner
// lige oven i dem. De skrives derfor som regnestykker over RABAT_EKSEMPEL og
// RABAT_BELOEB frem for i hånden: sætningen og brødteksten kan så ikke glide
// fra hinanden — samme grund som MOMS_FAQ_FORMAT, huslejeSvaer og
// PROMILE_80_MAND er skrevet af.
const RABAT_NEDSAT = RABAT_EKSEMPEL.normalPris - RABAT_EKSEMPEL.nedsatPris;
const RABAT_PROCENT = rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);
/** Hvad nedsættelsen er i procent af den pris, læseren betaler — det andet tal. */
const RABAT_MOD_NY = procentForskel(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris);

/**
 * Samme tal, formatteret i det sprog de står på. `Intl` bruger U+00A0 som
 * tusindtalsseparator på svensk, som renderer som et mellemrum men er et andet
 * tegn end det almindelige mellemrum resten af den svenske tekst bruger — samme
 * normalisering som `procent/page.tsx` laver på sit `num`.
 */
const rabatTal = (locale: "da" | "se", tal: number, decimaler = 0) =>
  formatBelob(tal, locale, decimaler);

const rabatFaqTal = (locale: "da" | "se") => ({
  normalPris: rabatTal(locale, RABAT_EKSEMPEL.normalPris),
  nedsatPris: rabatTal(locale, RABAT_EKSEMPEL.nedsatPris),
  nedsat: rabatTal(locale, RABAT_NEDSAT),
  rabat: rabatTal(locale, RABAT_PROCENT, 1),
  modNy: rabatTal(locale, RABAT_MOD_NY, 1),
  satsBelob: rabatTal(locale, RABAT_BELOEB),
  satsSparer: rabatTal(locale, procentAf(RABAT_BELOEB, RABAT_SATS_UDLAET)),
  satsBetaler: rabatTal(locale, RABAT_BELOEB - procentAf(RABAT_BELOEB, RABAT_SATS_UDLAET)),
  tredjedel: rabatTal(locale, RABAT_BELOEB / 3, 2),
  tredjedelBetalt: rabatTal(locale, RABAT_BELOEB - RABAT_BELOEB / 3, 2),
});
const RABAT_DA = rabatFaqTal("da");
const RABAT_SE = rabatFaqTal("se");

/**
 * /procent's own arithmetic examples, in the three languages the page exists
 * in. 2/10 every amount in the FAQ answers was written out by hand, and those
 * answers are not just prose: `FAQSchema` publishes them as JSON-LD, so a
 * stale figure is a wrong answer in a Google rich result.
 *
 * Every value below is *computed* by the same function the calculator uses, so
 * the sentences cannot drift from the tool. That matters for the pairs, not
 * only the single numbers: 9 000 → 7 875 is -12,5 % by `procentForskel` and
 * 12,5 % by `rabatProcent`, and a hand-written sentence that mixes the two is
 * a page contradicting itself.
 *
 * The amounts themselves are the ones the module already uses elsewhere —
 * `RABAT_EKSEMPEL`, `EXCEL_ANDEL` and `PROCENT_SKILLNAD_EKSEMPEL` are the
 * figures the tables and the prose above the FAQ already show, so the FAQ
 * quotes the page instead of inventing a second set.
 */
const PROCENT_DA = {
  normalPris: rabatTal("da", RABAT_EKSEMPEL.normalPris),
  nedsatPris: rabatTal("da", RABAT_EKSEMPEL.nedsatPris),
  /** Faldet 9 000 → 7 875, med fortegn: sætningen skriver "-12,5 %". */
  forskel: rabatTal("da", procentForskel(RABAT_EKSEMPEL.nedsatPris, RABAT_EKSEMPEL.normalPris), 1),
  tyveFaaHundrede: rabatTal("da", PROCENT_10_AF_FAQ),
  tyveFaaHundredeSvar: rabatTal("da", procentAf(PROCENT_10_AF_FAQ, 10)),
};

/**
 * Norsk har ét eksempel, i `metaDescription`. Det skriver **punktum** som
 * tusindtalsseparator («2.500 kr»), fordi hele den norske blokke gør det —
 * «BMR 1.780 kcal» og «TDEE 2.759 kcal» på /kalorier er samme skrivemåde.
 * Bokmålskonventionen er egentlig et mellemrum, så det er en fejl, men den
 * vedrører hele den norske blokke og ikke dette tal, og en række `no`-sider
 * på én gang er en anden opgave end den her.
 */
const PROCENT_NO = {
  sats: String(PROCENT_15_AV_BELOEB.sats),
  belob: rabatTal("da", PROCENT_15_AV_BELOEB.belob),
  svar: rabatTal("da", procentAf(PROCENT_15_AV_BELOEB.belob, PROCENT_15_AV_BELOEB.sats)),
};

/** Excel-andelen, som `EXCEL_ANDEL` allerede viser i tabellen på samme side. */
const excelAndel = EXCEL_ANDEL.del / EXCEL_ANDEL.heltal;
const PROCENT_SE = {
  excelDel: rabatTal("se", EXCEL_ANDEL.del),
  excelHeltal: rabatTal("se", EXCEL_ANDEL.heltal),
  excelAndel: rabatTal("se", excelAndel, 2),
  excelProcent: rabatTal("se", excelAndel * 100),
  loenNy: rabatTal("se", PROCENT_SKILLNAD_EKSEMPEL[0].ny),
  loenGammal: rabatTal("se", PROCENT_SKILLNAD_EKSEMPEL[0].gammal),
  loenForskel: rabatTal("se", PROCENT_SKILLNAD_EKSEMPEL[0].ny - PROCENT_SKILLNAD_EKSEMPEL[0].gammal),
  loenProcent: rabatTal("se", procentForskel(PROCENT_SKILLNAD_EKSEMPEL[0].ny, PROCENT_SKILLNAD_EKSEMPEL[0].gammal)),
  stigningGammal: rabatTal("se", PROCENT_SKILLNAD_EKSEMPEL[1].gammal),
  stigningNy: rabatTal("se", PROCENT_SKILLNAD_EKSEMPEL[1].ny),
  stigningForskel: rabatTal("se", PROCENT_SKILLNAD_EKSEMPEL[1].ny - PROCENT_SKILLNAD_EKSEMPEL[1].gammal),
  stigningProcent: rabatTal("se", procentForskel(PROCENT_SKILLNAD_EKSEMPEL[1].ny, PROCENT_SKILLNAD_EKSEMPEL[1].gammal)),
  /** Den symmetriske forskel: middeltallet er heltalet, så 2 500 / 11 250. */
  differensGennemsnit: rabatTal("se", (PROCENT_SKILLNAD_EKSEMPEL[1].gammal + PROCENT_SKILLNAD_EKSEMPEL[1].ny) / 2),
  differens: rabatTal("se", procentDifferens(PROCENT_SKILLNAD_EKSEMPEL[1].gammal, PROCENT_SKILLNAD_EKSEMPEL[1].ny), 1),
  tyveFaaHundrede: rabatTal("se", PROCENT_10_AF_FAQ),
  tyveFaaHundredeSvar: rabatTal("se", procentAf(PROCENT_10_AF_FAQ, 10)),
};

/** Regnestykket i FAQ'en og på siden, samme tal som siden viser i tabellen. */
const braendstofEksempel = braendstofEksempelRækker();
const braendstofEksempelKm = BRAENDSTOF_EKSEMPEL_KM;
const braendstofEksempelBenzin = kommatal(braendstofEksempel[0].maengde);
const braendstofEksempelBenzinPris = heleKroner(braendstofEksempel[0].pris);
const braendstofEksempelDiesel = kommatal(braendstofEksempel[1].maengde);
const braendstofEksempelDieselPris = heleKroner(braendstofEksempel[1].pris);
const braendstofDieselBilligere = heleKroner(
  braendstofEksempel[0].pris - braendstofEksempel[1].pris,
);
const braendstofBenzinPr100 = kommatal(literPr100km(BRAENDSTOF_FORUDSETNINGER.benzin.kmPerLiter));
const braendstofBenzinLavPr100 = kommatal(literPr100km(18));
const braendstofBenzinHoejPr100 = kommatal(literPr100km(12));
const braendstofEgetKmPrLiter = kommatal(
  BRAENDSTOF_EGENT_FORBRUG.km / BRAENDSTOF_EGENT_FORBRUG.liter,
);

// ─── /braendstof på beraknare.se: samme formler, svenska kronor. Uden dem skrev den svenska
// siden "450 kr." oven på et regnestykke der siger 585 kr. Sæt: BRAENDSTOF_FORUDSETNINGER_SE.
const bfSe = braendstofEksempelRækker(BRAENDSTOF_EKSEMPEL_KM, "se");
const bfSeBenzin = bfSe[0];
const bfSeDiesel = bfSe[1];
const bfSeEl = bfSe[2];
const bfSePrisPrMil = (type: "benzin" | "diesel" | "el") => kommatal(prisPrMil(type, "se"));
const bfSeBesparelse = (type: "benzin" | "diesel") => {
  const anden = type === "benzin" ? bfSeBenzin.prisPrKm : bfSeDiesel.prisPrKm;
  return kommatal(((anden - bfSeEl.prisPrKm) / anden) * 100);
};
const bfSeDieselDyrare = heleKroner(bfSeDiesel.pris - bfSeBenzin.pris);
const bfSeBensinPris = BRAENDSTOF_FORUDSETNINGER_SE.benzin.literPris.toFixed(2).replace(".", ",");
const bfSeDieselPris = BRAENDSTOF_FORUDSETNINGER_SE.diesel.literPris.toFixed(2).replace(".", ",");
const bfSeElPris = BRAENDSTOF_FORUDSETNINGER_SE.el.kwhPris.toFixed(2).replace(".", ",");
const bfSeLiterprisDiff = kommatal(
  (BRAENDSTOF_FORUDSETNINGER_SE.diesel.literPris / BRAENDSTOF_FORUDSETNINGER_SE.benzin.literPris - 1) * 100,
);
const bfSeForbrukningP100 = kommatal(literPr100km(BRAENDSTOF_FORUDSETNINGER_SE.benzin.kmPerLiter));
/** Hele kroner, uden komma: 585.08 -> "585". */
function helekr(value: number) {
  return String(heleKroner(value));
}
/** Et tal med dansk komma: 33.333 -> "33,3". */
function kommatal(value: number) {
  return procent1Decimals(value).toFixed(1).replace(".", ",");
}

// ─── /elbil — de tal, siden og FAQ'en lover, udledt af værktöjets egne standardværdier. Den gamle
// "under halvdelen" holdt ikke ved 16 km/l: el kostede 0,45 mod benzins 0,84
// kr. pr. km, altså 53 % af benzinprisen.
const elbilDa = elbilSammenligning("da");
const elbilSe = elbilSammenligning("se");

// ─── /elbil-lading — titel og FAQ læser værktøjets egene standardværdier, så
// ingen tekst kan glide fra beregningen.
const elbilLadingStandarder = {
  da: elbilLadingStandard("da"),
  se: elbilLadingStandard("se"),
};
const elbilLadingEksempel = beregnElbilLading(elbilLadingStandarder.da)!;
const elbilLadingEksempelSe = beregnElbilLading(elbilLadingStandarder.se)!;
/** Et beløb med to decimaler og dansk komma: 2.5 -> "2,50". */
const krTal = (value: number) => value.toFixed(2).replace(".", ",");
/** Helt krontal med dansk tusindtalsseparator: 1250 -> "1.250". */
const krHelt = (value: number) => value.toLocaleString("da-DK", { maximumFractionDigits: 0 });
/** Helt tal med svensk tusindtalsseparator: 1250 -> "1 250". */
const seHelt = (value: number) => value.toLocaleString("sv-SE", { maximumFractionDigits: 0 });
/** To decimaler med svensk komma: 0.45 -> "0,45". */
const seTal = (value: number) => value.toFixed(2).replace(".", ",");
/** Tusindtalsseparator som i Sverige: 12400 -> "12 400". */
const seKr = (value: number) => value.toLocaleString("sv-SE");
/** Tusindtalsseparator som i Danmark: 9000 -> "9.000". Samme notation som `formatNumber` i `format.ts`. */
const daKr = (value: number) => formatNumber(value, "da");
/** Pris pr. km med svensk notation: 1.1875 -> "1,19 kr/km". */
const seKrPrKm = (value: number) => value.toFixed(2).replace(".", ",") + " kr/km";

// ─── /renteberegner — de tal, titlen, metadataen og FAQ'en lover, regnet af `rente-eksempler`
// frem for håndskrevet. Før 2/10 stod de i 19 felter på tre domæner, og `FAQSchema` læser
// præcis `faqItems`, så de var tal i Googles svar og ikke kun brødtekst.
const renteHoved = hovedEksempel();
const renteFormel = annuitetsEksempel();

// ─── /rumfang — de samme tal i titel, metadata, FAQ og løsning, regnet fra
// `rumfang.ts`. Skriver brødteksten dem i hånden, kan de tre steder komme til at
// sige hver sit, og de står i tre filer. Cylindereksemplet er valgt, fordi det er
// det eneste af de fem figurer hvor diameteren ikke forsvinder i et heltal.
const rumfangCylinder = RUMFANG_EKSEMPEL.cylinder.svar.kubikmeter;
const RUMFANG_TEKST_DA = {
  cylinder: rumfangCylinder.toLocaleString("da-DK", { maximumFractionDigits: 2 }),
  cylinderAreal: (rumfangCylinder / 2).toLocaleString("da-DK", { maximumFractionDigits: 2 }),
  cylinderLiter: RUMFANG_EKSEMPEL.cylinder.svar.liter.toLocaleString("da-DK", { maximumFractionDigits: 1 }),
};
const RUMFANG_TEKST_SE = {
  cylinder: formatSvenskText(rumfangCylinder, 2),
  cylinderAreal: formatSvenskText(rumfangCylinder / 2, 2),
  cylinderLiter: formatSvenskText(RUMFANG_EKSEMPEL.cylinder.svar.liter, 1),
};
// ─── /areal — de samme tal i titel, metadata, FAQ og løsning, regnet fra
// `areal.ts`. Trapez-eksemplet er valgt til titlen, fordi det er det eneste af
// de syv figurer hvor middeltallet af de to parallelle sider ikke forsvinder i
// et heltal, og cirklen bærer π i svaret.
const AREAL_TEKST_DA = {
  cirkel: AREAL_EKSEMPEL.cirkel.svar.kvadratmeter.toLocaleString("da-DK", { maximumFractionDigits: 2 }),
  cirkelCm: AREAL_EKSEMPEL.cirkel.svar.kvadratcentimeter.toLocaleString("da-DK", { maximumFractionDigits: 0 }),
  trapez: AREAL_EKSEMPEL.trapez.svar.kvadratmeter.toLocaleString("da-DK", { maximumFractionDigits: 0 }),
  cmPrM2: KVADRATCENTIMETER_PR_KVADRATMETER.toLocaleString("da-DK", { maximumFractionDigits: 0 }),
};
const AREAL_TEKST_SE = {
  cirkel: formatSvenskText(AREAL_EKSEMPEL.cirkel.svar.kvadratmeter, 2),
  cirkelCm: formatSvenskText(AREAL_EKSEMPEL.cirkel.svar.kvadratcentimeter, 0),
  trapez: formatSvenskText(AREAL_EKSEMPEL.trapez.svar.kvadratmeter, 0),
  cmPrM2: formatSvenskText(KVADRATCENTIMETER_PR_KVADRATMETER, 0),
};
// ─── /omkreds — eksemplet læses fra `omkreds.ts`, så titel, FAQ og værktøj
// ikke kan vise tre forskellige svar for den samme figur. Cirklen bærer π.
const OMKREDS_TEKST_DA = {
  cirkel: OMKREDS_EKSEMPEL.cirkel.svar.meter.toLocaleString("da-DK", { maximumFractionDigits: 2 }),
  cirkelCm: OMKREDS_EKSEMPEL.cirkel.svar.centimeter.toLocaleString("da-DK", { maximumFractionDigits: 0 }),
  rektangel: OMKREDS_EKSEMPEL.rektangel.svar.meter.toLocaleString("da-DK", { maximumFractionDigits: 0 }),
};
const OMKREDS_TEKST_SE = {
  cirkel: formatSvenskText(OMKREDS_EKSEMPEL.cirkel.svar.meter, 2),
  cirkelCm: formatSvenskText(OMKREDS_EKSEMPEL.cirkel.svar.centimeter, 0),
  rektangel: formatSvenskText(OMKREDS_EKSEMPEL.rektangel.svar.meter, 0),
};
// ─── /hundealder — eksemplet og tabeltallene læses fra `hundealder.ts`, så
// titel, FAQ og tabellen ikke kan vise tre forskellige svar for den samme hund.
const HUNDEALDER_TEKST_DA = {
  eksempelAar: HUNDEALDER_EKSEMPEL.hundAar.toLocaleString("da-DK"),
  eksempelMenneske: HUNDEALDER_EKSEMPEL.menneskeAar.toLocaleString("da-DK", { maximumFractionDigits: 1 }),
  eksempelRegnestykke: regnestykke(HUNDEALDER_EKSEMPEL.hundAar, HUNDEALDER_EKSEMPEL.storrelse),
  tiAarLille: menneskeAar(10, "lille").toLocaleString("da-DK"),
  tiAarStor: menneskeAar(10, "stor").toLocaleString("da-DK"),
  tiAarKaempe: menneskeAar(10, "kaempe").toLocaleString("da-DK"),
  syvAarMellem: menneskeAar(7, "mellem").toLocaleString("da-DK"),
};
const HUNDEALDER_TEKST_SE = {
  eksempelAar: formatSvenskText(HUNDEALDER_EKSEMPEL.hundAar, 0),
  eksempelMenneske: formatSvenskText(HUNDEALDER_EKSEMPEL.menneskeAar, 1),
  eksempelRegnestykke: regnestykke(HUNDEALDER_EKSEMPEL.hundAar, HUNDEALDER_EKSEMPEL.storrelse),
  tiAarLille: formatSvenskText(menneskeAar(10, "lille"), 0),
  tiAarStor: formatSvenskText(menneskeAar(10, "stor"), 0),
  tiAarKaempe: formatSvenskText(menneskeAar(10, "kaempe"), 0),
  syvAarMellem: formatSvenskText(menneskeAar(7, "mellem"), 0),
};
/**
 * Et helt kronetal med dansk tusindtalsseparator.
 *
 * `daKr` herover beholder decimalerne, fordi den bruges til priser pr. km, hvor
 * decimalerne er meningen. En ydelse og en samlet rente er derimod **hele
 * kroner** i en låneregning, og `formatNumber` uden options skriver dem som
 * «2.673,916» — et tal der er rigtigt regnet, men som en læser i Googles svar
 * ikke kan bruge. Derfor runder denne til 0.
 */
const daKr0 = (value: number) => formatNumber(value, "da", { maximumFractionDigits: 0 });
// ─── /laantype — hver eneste af de tal, titlen, metadataen og FAQ'en lover,
// regnet fra `laantype.ts` gennem de samme funktioner som `/renteberegner`
// bruger. De tre steder skal ikke kunne sige hver sit, og tallene står i
// Googles svar via FAQSchema, ikke kun i brødteksten.
const laantypeAnnuitet = laanetypeEksempelFor("annuitet");
const laantypeSerielaan = laanetypeEksempelFor("serielaan");
const laantypeStaende = laanetypeEksempelFor("staende");
const LAANETYPE_TEKST = {
  hovedstol: daKr0(LAANETYPE_EKSEMPEL_HOVEDSTOL),
  aarligRente: String(LAANETYPE_EKSEMPEL_AARSRENTE),
  loebetid: String(LAANETYPE_EKSEMPEL_LOEBETID),
  /** Serielånets ydelse i måned 1 minus annuitetslånets, i kroner. */
  forskelFoerste: daKr0(laantypeSerielaan.foersteYdelse - laantypeAnnuitet.foersteYdelse),
  /** Annuitetslånets samlede rente minus serielånets, i kroner. */
  renteBesparelse: daKr0(laantypeAnnuitet.samletRente - laantypeSerielaan.samletRente),
  annuitetYdelse: daKr0(laantypeAnnuitet.foersteYdelse),
  serielaanFoerste: daKr0(laantypeSerielaan.foersteYdelse),
  serielaanSidste: daKr0(laantypeSerielaan.sidsteYdelse),
  staendeYdelse: daKr0(laantypeStaende.foersteYdelse),
  annuitetRente: daKr0(laantypeAnnuitet.samletRente),
  serielaanRente: daKr0(laantypeSerielaan.samletRente),
  staendeRente: daKr0(laantypeStaende.samletRente),
  kryds: String(laanetypeEksempelKryds() ?? 0),
};
const LAANETYPE_TEKST_SE = {
  hovedstol: formatSvenskText(LAANETYPE_EKSEMPEL_HOVEDSTOL, 0),
  aarligRente: String(LAANETYPE_EKSEMPEL_AARSRENTE),
  loebetid: String(LAANETYPE_EKSEMPEL_LOEBETID),
  kryds: String(laanetypeEksempelKryds() ?? 0),
  forskelFoerste: formatSvenskText(laantypeSerielaan.foersteYdelse - laantypeAnnuitet.foersteYdelse, 0),
  renteBesparelse: formatSvenskText(laantypeAnnuitet.samletRente - laantypeSerielaan.samletRente, 0),
  annuitetYdelse: formatSvenskText(laantypeAnnuitet.foersteYdelse, 0),
  serielaanFoerste: formatSvenskText(laantypeSerielaan.foersteYdelse, 0),
  serielaanSidste: formatSvenskText(laantypeSerielaan.sidsteYdelse, 0),
  staendeYdelse: formatSvenskText(laantypeStaende.foersteYdelse, 0),
};
// ─── /idealvaegt — hver eneste af de tal, titlen, metadataen og FAQ'en lover,
// regnet fra `idealvaegt.ts`, altså fra formlernes egne kilder. Hældningen eller
// grundværdien er ændret en dag, så skriver brødteksten sig ikke til at lyve.
const IDEALVAEGT_CM = 175;
const idealvaegtMand = idealvaegtResultat(IDEALVAEGT_CM, "mand");
const idealvaegtKvinde = idealvaegtResultat(IDEALVAEGT_CM, "kvinde");
const idealvaegtNormal = vaegtInterval(IDEALVAEGT_CM / 100, BMI_BAAND[1]);
/** Én decimal med dansk komma — de samme tal, uanset hvor de står. */
const idealvaegtKg = (kg: number) => kg.toLocaleString("da-DK", { maximumFractionDigits: 1 });
/** Samme tal til svensk løbende tekst: "75,2" med komma og ét decimal. */
const idealvaegtKgSe = (kg: number) => formatSvenskText(kg, 1);
const IDEALVAEGT_EKSEMPEL_175 = `${idealvaegtKg(rundIdealvaegt(idealvaegtMand.gennemsnit))} kg ved ${IDEALVAEGT_CM} cm`;
const IDEALVAEGT_M_175 = idealvaegtKg(rundIdealvaegt(idealvaegtMand.gennemsnit));
const IDEALVAEGT_K_175 = idealvaegtKg(rundIdealvaegt(idealvaegtKvinde.gennemsnit));
const IDEALVAEGT_M_DEVINE = idealvaegtKg(rundIdealvaegt(idealvaegtMand.devine));
const IDEALVAEGT_M_HAMWI = idealvaegtKg(rundIdealvaegt(idealvaegtMand.hamwi));
const IDEALVAEGT_M_SPREDNING = idealvaegtKg(rundIdealvaegt(idealvaegtMand.spredning));
const IDEALVAEGT_K_DEVINE = idealvaegtKg(rundIdealvaegt(idealvaegtKvinde.devine));
const IDEALVAEGT_K_HAMWI = idealvaegtKg(rundIdealvaegt(idealvaegtKvinde.hamwi));
const IDEALVAEGT_M_INTERVAL_MIN = idealvaegtKg(idealvaegtNormal.min ?? 0);
const IDEALVAEGT_M_INTERVAL_MAX = idealvaegtKg(idealvaegtNormal.max ?? 0);

/** Lånekapacitetens FAQ læser sine tal fra samme modul som værktøjet. */
const LAANEKAPACITET_FAQ = beregnLaanekapacitet(LAANEKAPACITET_EKSEMPEL);

/** TV-størrelsens FAQ læser sine mål fra samme modul som værktøjet. */
const TV_55 = beregnSkarmMaal(55, "16:9")!;
const TV_65 = beregnSkarmMaal(65, "16:9")!;
const TV_55_AFSTAND = beregnSeerafstand(TV_55.breddeCm);
const tvTal = (n: number, dec = 1) =>
  formatNumber(n, "da", { maximumFractionDigits: dec });

// ─── DANISH (da) PAGE DATA ─────────────────────────────────────────────────

const daPages: Record<string, PageData> = {
    "elbil": {
      slug: "elbil",
      title: "Elbil vs. benzinbil",
      description: "Sammenlign driftsomkostningerne for en elbil og en benzinbil. Se den årlige besparelse på energi og hvornår en dyrere elbil har tjent sig hjem.",
      metaTitle: "Elbil vs. benzinbil - Hvad kan bedst betale sig?",
      metaDescription: "Sammenlign elbil og benzinbil. Indtast kørsel, elpris og benzinpris og se den årlige energibesparelse samt tilbagebetalingstiden på en dyrere elbil.",
      keywords: ["elbil vs benzinbil", "elbil eller benzinbil", "elbil besparelse", "elbil beregner", "elbil økonomi"],
      ogTitle: "Elbil vs. benzinbil - Se hvad der bedst kan betale sig",
      ogDescription: "Sammenlign driftsomkostningerne for elbil og benzinbil.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Elbil vs. benzinbil beregner",
      schemaDescription: "Sammenlign den årlige energiudgift for elbil og benzinbil og se tilbagebetalingstid på en dyrere elbil.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Er en elbil billigere end en benzinbil?", answer: `På energi er en elbil næsten altid billigere: en elbil bruger typisk 15-20 kWh pr. 100 km, mens en benzinbil bruger 5-7 liter. Beregnerens standarder — ${elbilDa.forudsætninger.elKwhPer100km} kWh pr. 100 km til ${krTal(elbilDa.forudsætninger.elKwhPris)} kr./kWh mod ${elbilDa.forudsætninger.benzinKmPerLiter} km/l til ${krTal(elbilDa.forudsætninger.benzinLiterPris)} kr./l — giver ${krPrKm(elbilDa.elPrisPrKm, 2)} for el mod ${krPrKm(elbilDa.benzinPrisPrKm, 2)} for benzin, altså ${pct(elbilDa.besparelseProcent)} % billigere pr. km. Det er ikke under halvdelen, og over ${pct(elbilDa.breakEvenKwhPris)} kr./kWh — altså ved offentlig opladning — er el dyrere end benzin. Til gengæld er elbiler ofte dyrere at købe — brug beregneren til at se, hvornår merprisen er tjent hjem.` },
        { question: "Hvor meget sparer man på en elbil om året?", answer: `Med beregnerens standarder på ${kr(elbilDa.forudsætninger.kmPrAar)} km om året er besparelsen ca. ${kr(elbilDa.aarligBesparelse)} kr. om året. Den afhænger af el- og benzinpris, så indtast dine egne tal for at se det konkrete beløb.` },
        { question: "Hvad indgår ikke i beregningen?", answer: "Beregneren sammenligner energiudgiften (el vs. benzin). Forsikring, service, dæk, grøn ejerafgift og værditab varierer meget fra bil til bil og indgår ikke — men energiudgiften er den største løbende forskel." },
        { question: "Hvornår er det billigst at lade elbilen?", answer: "Oftest om natten. Beregneren finder de fire billigste sammenhængende timer mellem kl. 18 og 08 ud fra dagens og morgendagens timepriser inkl. nettarif, afgifter og moms. Morgendagens priser kommer ca. kl. 13." },
        { question: "Hvilken elpris bruger beregneren?", answer: "Standard er dagens gennemsnitlige elpris i dit prisområde (DK1 vest eller DK2 øst for Storebælt) fra Energi Data Service plus nettarif, Energinets tariffer, elafgift og moms. Du kan altid rette den til din egen pris." },
      ],
    },
    "vandbehov": {
      slug: "vandbehov",
      title: "Vandbehov - hvor meget vand skal du drikke?",
      description: "Beregn dit daglige væskebehov ud fra din vægt og motion. Se hvor mange liter og glas vand du bør drikke.",
      metaTitle: "Vandbehov beregner - Hvor meget vand skal du drikke?",
      metaDescription: "Gratis vandbehov beregner. Find dit daglige væskebehov ud fra kropsvægt og motion. Se antal liter og glas. Vejledende ud fra ca. 35 ml pr. kg.",
      keywords: ["vandbehov", "hvor meget vand skal jeg drikke", "væskebehov beregner", "daglig vandindtag", "liter vand om dagen"],
      ogTitle: "Vandbehov - Hvor meget vand skal du drikke?",
      ogDescription: "Beregn dit daglige væskebehov ud fra vægt og motion.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Vandbehov beregner",
      schemaDescription: "Beregn dagligt væskebehov ud fra kropsvægt og motion.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvor meget vand skal man drikke om dagen?", answer: "En udbredt tommelfingerregel er cirka 35 ml pr. kilo kropsvægt. En person på 75 kg har altså brug for omkring 2,6 liter væske om dagen, mere ved motion, varme og feber." },
        { question: "Tæller kaffe og te med?", answer: "Ja, langt de fleste drikke tæller med i væskeregnskabet, og en stor del af væsken får du også fra mad — især frugt, grønt og supper. Beregneren viser det samlede væskebehov." },
        { question: "Hvordan påvirker motion vandbehovet?", answer: "Når du sveder, taber du væske, der skal erstattes. Beregneren lægger cirka en halv liter til pr. 30 minutters motion. Ved hård eller lang træning kan behovet være endnu højere." },
      ],
    },
    "skridt": {
      slug: "skridt",
      title: "Skridt til km - omregn skridt til kilometer",
      description: "Omregn skridt til kilometer, gangtid og kalorier. Se hvor langt 10.000 skridt er, og hvad de forbrænder.",
      metaTitle: "Skridt til km: 10.000 skridt er 6,6-7,9 km",
      metaDescription: "Gratis omregner fra skridt til km. 10.000 skridt er ca. 6,6 km (kvinde) eller 7,9 km (mand) og tager ca. 85 minutter. Se også kalorier.",
      keywords: ["skridt til km", "skridt omregner", "10000 skridt i km", "skridt til kalorier", "hvor langt er 10000 skridt", "skridt til km kvinder", "hvor mange skridt er en km"],
      ogTitle: "Skridt til km - Hvor langt er 10.000 skridt?",
      ogDescription: "Omregn skridt til kilometer, gangtid og kalorier.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Skridt til km omregner",
      schemaDescription: "Omregn skridt til kilometer, gangtid og kalorier.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvor langt er 10.000 skridt i km?", answer: "Ca. 6,6 km for kvinder og 7,9 km for mænd. Tallene bygger på målte gennemsnitlige skridtlængder på 66 cm for kvinder og 79 cm for mænd (Murray 1964/1970). Din egen skridtlængde afhænger af din højde og dit tempo." },
        { question: "Hvor mange skridt er 1 km?", answer: "Ca. 1.515 skridt for kvinder og 1.266 skridt for mænd med de gennemsnitlige skridtlængder på 66 og 79 cm. Er du højere end gennemsnittet, bruger du færre skridt pr. kilometer." },
        { question: "Hvor lang tid tager 10.000 skridt?", answer: "Ca. 85 minutter ved en normal kadence på 117 skridt i minuttet. Går du hurtigere, tager det kortere tid — men du når også længere pr. skridt." },
        { question: "Hvor mange kalorier forbrænder 10.000 skridt?", answer: "Ca. 349 kcal for en person på 70 kg, regnet med MET 3,5 for normal gang. En tungere person forbrænder flere, en lettere færre — beregneren regner det ud fra din vægt." },
      ],
    },
    "proteinbehov": {
      slug: "proteinbehov",
      title: "Proteinbehov - beregn dit daglige proteinindtag",
      description: "Beregn dit daglige proteinbehov ud fra kropsvægt og aktivitetsniveau. Vejledende estimat for stillesiddende til eliteatlet.",
      metaTitle: "Proteinbehov beregner - Beregn dit daglige proteinindtag",
      metaDescription: "Gratis proteinbehov beregner. Find dit daglige proteinbehov ud fra vægt og aktivitetsniveau. 0,8-2,0 g/kg. Vejledende — ikke medicinsk rådgivning.",
      keywords: ["proteinbehov beregner", "proteinindtag", "protein pr kg", "hvor meget protein", "protein kosttilskud", "protein dagligt"],
      ogTitle: "Proteinbehov - Beregn dit daglige proteinindtag",
      ogDescription: "Beregn dit daglige proteinbehov ud fra vægt og aktivitetsniveau.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Proteinbehov beregner",
      schemaDescription: "Beregn dagligt proteinbehov ud fra kropsvægt og aktivitetsniveau.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvor meget protein har jeg brug for om dagen?", answer: "Det anbefalede daglige proteinindtag er 0,8 g pr. kg kropsvægt for stillesiddende voksne. Ved motion stiger behovet til 1,2-2,0 g/kg afhængigt af træningsmængde og -intensitet." },
        { question: "Hvad er de bedste proteinkilder?", answer: "Animalske kilder (kød, fisk, æg, mejeriprodukter) indeholder alle essentielle aminosyrer. Plantebaserede kilder (bønner, linser, tofu, quinoa, nødder) kan også dække behovet ved varieret sammensætning." },
        { question: "Kan man få for meget protein?", answer: "Meget højt proteinindtag (over 2,5-3 g/kg i længere tid) kan belaste nyrerne hos sårbare personer. For raske personer er 1,5-2,0 g/kg sikkert, men følg de officielle anbefalinger og kontakt en læge ved usikkerhed." },
        { question: "Skal man tage proteinpulver?", answer: "Nej, de fleste kan dække deres proteinbehov gennem almindelig kost. Proteinpulver kan være praktisk efter træning eller ved højt behov, men er ikke nødvendigt." },
      ],
    },
    "rygestop": {
      slug: "rygestop",
      title: "Rygestop-besparelse - hvad sparer du på at holde op?",
      description: "Beregn hvor mange kroner du sparer ved at holde op med at ryge. Se besparelsen pr. dag, måned, år og over fem år.",
      metaTitle: "Rygestop beregner - Se hvad du sparer på at holde op",
      metaDescription: "Gratis rygestop beregner. Indtast cigaretter pr. dag og pakkepris, og se din besparelse pr. dag, måned, år og over 5 år.",
      keywords: ["rygestop beregner", "hvad sparer jeg på at holde op med at ryge", "cigaretter pris om året", "rygebesparelse", "holde op med at ryge penge"],
      ogTitle: "Rygestop-besparelse - Hvad sparer du på at holde op?",
      ogDescription: "Beregn hvor mange kroner du sparer ved at holde op med at ryge.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Rygestop-besparelse beregner",
      schemaDescription: "Beregn økonomisk besparelse ved rygestop ud fra cigaretforbrug og pakkepris.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvad koster det at ryge om året?", answer: "Det afhænger af forbrug og pris. Ryger du 15 cigaretter om dagen til en pakkepris på 60 kr for 20 stk, koster det cirka 16.400 kr om året — over fem år mere end 80.000 kr. Beregneren viser dit eget tal." },
        { question: "Hvordan beregnes besparelsen?", answer: "Beregneren finder prisen pr. cigaret (pakkepris divideret med antal cigarette i pakken) og ganger op med dit daglige forbrug. Årsbesparelsen er daglig besparelse × 365 dage, og månedsbesparelsen er årsbesparelsen divideret med 12." },
        { question: "Er cigaretpakker blevet dyrere?", answer: "Ja, tobaksafgifterne er forhøjet flere gange i de seneste år, og regeringens tobaksaftale betyder yderligere stigninger frem mod 2028. Din besparelse ved at holde op bliver derfor typisk større hvert år." },
        { question: "Hvor kan jeg få hjælp til at holde op?", answer: "Tal med din egen læge eller se sundhed.dk for gratis rygestop-forløb. Mange kommuner tilbyder gratis rygestop-kurser, og nogle arbejdspladser har egne tilbud." },
      ],
    },
    "alkoholenheder": {
      slug: "alkoholenheder",
      title: "Alkoholenheder - Beregn genstande og gram alkohol",
      description: "Beregn antal alkoholenheder (genstande) ud fra mængde og alkoholprocent. Se gram ren alkohol og få overblik over dit alkoholindtag.",
      metaTitle: "Alkoholenheder beregner - Beregn genstande",
      metaDescription: "Gratis alkoholenheder beregner. Indtast mængde og alkoholprocent, og se antal genstande og gram ren alkohol. Inkluderer typiske serveringsstørrelser.",
      keywords: ["alkoholenheder", "genstande beregner", "beregn genstande", "alkohol genstande", "hvor mange genstande", "alkohol udregning"],
      ogTitle: "Alkoholenheder - Beregn genstande og gram alkohol",
      ogDescription: "Beregn antal genstande ud fra mængde og alkoholprocent.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Alkoholenheder beregner",
      schemaDescription: "Beregn antal alkoholenheder (genstande) ud fra drikkevaremængde og alkoholprocent.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvad er en alkoholenhed (genstand)?", answer: "En dansk genstand indeholder 12 g ren alkohol (Sundhedsstyrelsen). Det svarer til cirka én almindelig øl (33 cl, 4,6 %), ét glas vin (12 cl, 12 %) eller én shot (4 cl, 40 %)." },
        { question: "Hvor mange genstande må man drikke?", answer: "Sundhedsstyrelsen anbefaler maksimalt 10 genstande om ugen og højst 4 genstande på samme dag. Anbefalingen er den samme for mænd og kvinder. Gravide og ammende bør helt undgå alkohol." },
        { question: "Hvordan beregnes antal genstande?", answer: "Antal genstande beregnes som: (mængde i cl × 10 × alkoholprocent / 100 × 0,789) / 12. 0,789 er massefylden for ren alkohol (g/ml), og 12 er gram alkohol pr. genstand." },
        { question: "Hvor mange kalorier er der i alkohol?", answer: "Ren alkohol indeholder cirka 7 kalorier pr. gram. En almindelig øl (33 cl, 4,6 %) indeholder omkring 120-150 kalorier, og et glas vin (12 cl, 12 %) omkring 80-100 kalorier. Brug vores kalorieberegner for et præcist tal." },
      ],
    },
    "motion-kalorier": {
      slug: "motion-kalorier",
      title: "Kalorieforbrænding ved motion",
      description: "Beregn hvor mange kalorier du forbrænder ved løb, cykling, svømning og andre aktiviteter ud fra vægt og varighed.",
      metaTitle: "Kalorieforbrænding ved motion - Beregn forbrændte kalorier",
      metaDescription: "Gratis beregner til kalorieforbrænding ved motion. Se hvor mange kalorier du brænder ved løb, cykling, svømning m.m. ud fra vægt, aktivitet og tid. MET-baseret.",
      keywords: ["kalorieforbrænding motion", "forbrændte kalorier løb", "kalorier cykling", "kalorieforbrug træning", "met kalorier"],
      ogTitle: "Kalorieforbrænding ved motion",
      ogDescription: "Beregn hvor mange kalorier du forbrænder ved forskellige aktiviteter.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kalorieforbrænding ved motion",
      schemaDescription: "Beregn forbrændte kalorier ved motion ud fra aktivitet, vægt og varighed med MET-værdier.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvor mange kalorier forbrænder man ved løb?", answer: "Løb har en høj MET-værdi (ca. 9,8). En person på 75 kg brænder omkring 370 kalorier på 30 minutters løb. Forbruget stiger med vægt, tempo og varighed." },
        { question: "Hvordan beregnes kalorieforbrændingen?", answer: "Beregneren bruger formlen kalorier = MET × vægt i kg × timer. MET (metabolic equivalent of task) angiver, hvor energikrævende en aktivitet er sammenlignet med hvile." },
        { question: "Hvor præcise er tallene?", answer: "Det er estimater. Din reelle forbrænding afhænger af intensitet, kondition og stofskifte, men MET-baserede tal giver et godt overblik til at sammenligne aktiviteter." },
      ],
    },
    "1rm": {
      slug: "1rm",
      title: "1RM beregner - anslå din maksimale styrke",
      description: "Estimer dit one-rep max (1RM) ud fra en vægt og antal gentagelser. Se også træningsvægte ved forskellige procenter.",
      metaTitle: "1RM beregner - Beregn dit one-rep max",
      metaDescription: "Gratis 1RM beregner. Estimer dit maksimale løft (one-rep max) ud fra vægt og gentagelser med Epley- og Brzycki-formlerne. Se træningsvægte i procent af 1RM.",
      keywords: ["1rm beregner", "one rep max", "maksimal styrke", "styrketræning vægt", "epley brzycki"],
      ogTitle: "1RM beregner - Anslå din maksimale styrke",
      ogDescription: "Estimer dit one-rep max ud fra en vægt og antal gentagelser.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "1RM beregner",
      schemaDescription: "Estimer one-rep max (1RM) ud fra vægt og gentagelser med Epley- og Brzycki-formlerne.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvad er 1RM?", answer: "1RM (one-rep max) er den tungeste vægt, du kan løfte én gang med korrekt teknik. Det bruges i styrketræning til at fastsætte træningsvægte som en procent af dit maksimum." },
        { question: "Hvordan beregnes 1RM?", answer: "Beregneren estimerer dit 1RM ud fra en vægt og det antal gentagelser, du kan tage, som gennemsnit af Epley-formlen (vægt × (1 + reps/30)) og Brzycki-formlen (vægt × 36/(37 − reps))." },
        { question: "Hvor præcist er estimatet?", answer: "Estimatet er mest præcist ved op til cirka 10 gentagelser. Ved mange gentagelser bliver det mindre nøjagtigt, fordi udholdenhed og teknik spiller en større rolle." },
      ],
    },
    "ohm": {
      slug: "ohm",
      title: "Ohms lov beregner - spænding, strøm, modstand og effekt",
      description: "Beregn spænding, strøm, modstand eller effekt med Ohms lov. Indtast to værdier og få resten.",
      metaTitle: "Ohms lov beregner - Spænding, strøm, modstand, effekt",
      metaDescription: "Gratis Ohms lov beregner. Beregn spænding (V), strøm (A), modstand (Ω) og effekt (W). Indtast to værdier og få de øvrige. V = I × R, P = V × I.",
      keywords: ["ohms lov beregner", "beregn spænding", "beregn strøm", "beregn modstand", "watt beregner", "effekt beregner"],
      ogTitle: "Ohms lov beregner - Spænding, strøm, modstand og effekt",
      ogDescription: "Beregn spænding, strøm, modstand eller effekt med Ohms lov.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Ohms lov beregner",
      schemaDescription: "Beregn spænding, strøm, modstand og effekt med Ohms lov.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvad er Ohms lov?", answer: "Ohms lov siger, at spænding = strøm × modstand (V = I × R). Kender du to af de tre størrelser, kan du beregne den tredje." },
        { question: "Hvordan beregner jeg effekt (watt)?", answer: "Effekt beregnes som P = V × I, altså spænding gange strøm. Den kan også skrives P = I² × R eller P = V² / R. Beregneren viser effekten automatisk." },
        { question: "Hvilke enheder bruges?", answer: "Spænding måles i volt (V), strøm i ampere (A), modstand i ohm (Ω) og effekt i watt (W)." },
      ],
    },
    "loenstigning": {
      slug: "loenstigning",
      title: "Lønstigning i procent - beregn din lønforhøjelse",
      description: "Beregn den procentvise ændring mellem din gamle og nye løn. Se stigningen i både procent og kroner.",
      metaTitle: "Lønstigning i procent - Beregn din lønforhøjelse",
      metaDescription: "Gratis beregner til lønstigning. Indtast gammel og ny løn og se stigningen i procent og kroner. Perfekt til lønforhandling. Virker med time-, måneds- og årsløn.",
      keywords: ["lønstigning procent", "beregn lønstigning", "lønforhøjelse procent", "procentvis lønstigning", "lønforhandling"],
      ogTitle: "Lønstigning i procent - Beregn din lønforhøjelse",
      ogDescription: "Beregn den procentvise ændring mellem din gamle og nye løn.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lønstigning beregner",
      schemaDescription: "Beregn den procentvise ændring mellem to lønninger.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvordan beregner jeg en lønstigning i procent?", answer: "Træk den gamle løn fra den nye, og del med den gamle løn: (ny − gammel) / gammel × 100. Går lønnen fra 30.000 til 33.000 kr, er det en stigning på 10 %." },
        { question: "Kan jeg bruge den til timeløn?", answer: "Ja. Beregneren virker med timeløn, månedsløn og årsløn — bare brug samme enhed i begge felter." },
        { question: "Er beløbet før eller efter skat?", answer: "Beregningen bruger bruttoløn (før skat). Den procentvise stigning er den samme, uanset om du regner i brutto eller netto, men kronebeløbet er brutto." },
        { question: "Hvad er en reallønsstigning?", answer: "Reallønsstigningen er din lønstigning fratrukket inflationen, altså hvor meget mere du reelt kan købe for lønnen. Beregneren bruger den seneste årlige inflation fra Danmarks Statistik som standard, og du kan selv rette satsen." },
      ],
    },
    "aegloesning": {
      slug: "aegloesning",
      title: "Ægløsningsberegner - find dine frugtbare dage",
      description: "Beregn hvornår du har ægløsning og hvornår dit frugtbare vindue er, ud fra din sidste menstruation og cykluslængde.",
      metaTitle: "Ægløsningsberegner - Beregn frugtbare dage og ægløsning",
      metaDescription: "Gratis ægløsningsberegner. Find dine frugtbare dage og din ægløsning ud fra sidste menstruation og cykluslængde. Se også hvornår næste menstruation forventes.",
      keywords: ["ægløsningsberegner", "frugtbare dage", "beregn ægløsning", "ægløsning beregner", "frugtbarhedsberegner"],
      ogTitle: "Ægløsningsberegner - Find dine frugtbare dage",
      ogDescription: "Beregn hvornår du har ægløsning og hvornår dit frugtbare vindue er.",
      category: "Familie",
      breadcrumbCategory: "Familie",
      breadcrumbCategoryHref: "/kategori/familie",
      schemaName: "Ægløsningsberegner",
      schemaDescription: "Beregn ægløsning og frugtbart vindue ud fra sidste menstruation og cykluslængde.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvornår har man ægløsning?", answer: "Ægløsningen sker typisk omkring 14 dage før næste menstruation. Ved en 28-dages cyklus er det cirka på dag 14, men det varierer med cykluslængden." },
        { question: "Hvad er det frugtbare vindue?", answer: "Det frugtbare vindue er dagene, hvor du har størst chance for at blive gravid — cirka fem dage før ægløsning plus selve ægløsningsdagen, fordi sædceller kan overleve op til 5 dage." },
        { question: "Er beregneren sikker som prævention?", answer: "Nej. Beregneren er et estimat til familieplanlægning og bør ikke bruges som prævention, da cyklusser varierer fra måned til måned." },
      ],
    },
    "planetvaegt": {
      slug: "planetvaegt",
      title: "Din vægt på planeterne",
      description: "Se hvor meget du ville veje på Månen, Mars, Jupiter og de andre planeter. Indtast din vægt på Jorden.",
      metaTitle: "Din vægt på planeterne - Hvor meget vejer du på Mars?",
      metaDescription: "Gratis beregner: se din vægt på Månen, Mars, Jupiter og alle planeterne. Indtast din vægt på Jorden. Sjov og lærerig om tyngdekraft for børn og skole.",
      keywords: ["vægt på planeterne", "vægt på månen", "vægt på mars", "tyngdekraft beregner", "vægt på jupiter"],
      ogTitle: "Din vægt på planeterne",
      ogDescription: "Se hvor meget du ville veje på Månen, Mars, Jupiter og de andre planeter.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Vægt på planeterne beregner",
      schemaDescription: "Beregn din vægt på Månen, Solen og planeterne ud fra din vægt på Jorden.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvorfor vejer man forskelligt på planeterne?", answer: "Vægt er den kraft, tyngdekraften trækker i dig med, og tyngdekraften er forskellig på hver planet. Din masse er den samme, men vægten ændrer sig med tyngdekraften." },
        { question: "Hvor meget vejer man på Månen?", answer: "På Månen vejer du cirka en sjettedel (16,6 %) af din vægt på Jorden. En person på 75 kg vejer omkring 12,5 kg på Månen." },
        { question: "Hvor ville man veje mest?", answer: "Af planeterne vejer du mest på Jupiter — mere end det dobbelte af på Jorden. På Solen (som er en stjerne) ville du veje næsten 28 gange så meget." },
      ],
    },
    "idealvaegt": {
      slug: "idealvaegt",
      title: "Idealvægt for voksne",
      description: `Beregn din idealvægt ud fra højde og køn. Devines og Hamwis formel giver hver sit tal, og du kan se dem begge ved siden af hinanden.`,
      metaTitle: `Idealvægt beregner: ${IDEALVAEGT_EKSEMPEL_175}`,
      metaDescription: `Gratis idealvægtsberegner. Find din idealvægt ud fra højde og køn med Devines (1974) og Hamwis (1964) formel. Ved 175 cm er mandens ${IDEALVAEGT_M_175} kg og kvindens ${IDEALVAEGT_K_175} kg.`,
      keywords: ["idealvægt", "idealvægt beregner", "idealvægt kvinde", "idealvægt mand", "idealvægt mænd", "devine formel", "hamwi formel", "vægtinterval"],
      ogTitle: `Idealvægt beregner: ${IDEALVAEGT_EKSEMPEL_175}`,
      ogDescription: `Beregn din idealvægt med Devines og Hamwis formel og se WHO's BMI-interval for din højde.`,
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Idealvægtsberegner",
      schemaDescription: "Beregn din idealvægt ud fra højde og køn med Devines og Hamwis publicerede formler.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvad er idealvægt?", answer: "Idealvægt (IBW) er et estimat af den vægt, der er forbundet med lavest dødelighed for en person af en given højde. Den blev udviklet i 1964 og 1974 til at dosere medicin efter kroppens størrelse, ikke som et slankemål." },
        { question: `Hvor meget er min idealvægt, hvis jeg er ${IDEALVAEGT_CM} cm høj?`, answer: `Som mand vejer du ${IDEALVAEGT_M_DEVINE} kg efter Devines formel og ${IDEALVAEGT_M_HAMWI} kg efter Hamwis — altså et interval på ${IDEALVAEGT_M_SPREDNING} kg. Som kvinde er de ${IDEALVAEGT_K_DEVINE} kg og ${IDEALVAEGT_K_HAMWI} kg. WHO's normalvægtsbånd (BMI 18,5-24,9) svarer for en mand på ${IDEALVAEGT_CM} cm til ${IDEALVAEGT_M_INTERVAL_MIN}-${IDEALVAEGT_M_INTERVAL_MAX} kg.` },
        { question: "Hvorfor giver Devine og Hamwi to forskellige tal?", answer: "De er to uafhængige formler fra henholdsvis 1964 og 1974. De er lineære og bruger forskellige grundværdier og hældninger, så de løber fra hinanden jo længere fra 152 cm, de er lavet ved. Derfor viser værktøjet begge tal og deres gennemsnit i stedet for at udpege én." },
        { question: "Er idealvægt det samme som BMI?", answer: "Nej. BMI regner forholdet mellem din vægt og din højde, så det afhænger af den vægt du har. Idealvægt regner kun højde og køn og ser altså bort fra, hvad du vejer nu. De to kan derfor pege i hver sin retning." },
      ],
    },
    "rumfang": {
      slug: "rumfang",
      title: "Rumfangsberegner",
      description: `Beregn rumfang i m³ og liter for kasse, cylinder, kugle, kegle og pyramide. Alle mål skrives i meter, og værktøjet bruger diameter — ikke radius.`,
      metaTitle: `Rumfangsberegner: cylinder med d = 1 m og h = 2 m er ${RUMFANG_TEKST_DA.cylinder} m³`,
      metaDescription: `Gratis rumfangsberegner. Beregn rumfang af kasse, cylinder, kugle, kegle og pyramide i m³ og liter. Cylinder med d = 1 m og h = 2 m: ${RUMFANG_TEKST_DA.cylinder} m³ = ${RUMFANG_TEKST_DA.cylinderLiter} liter.`,
      keywords: ["rumfangsberegner", "beregn rumfang", "rumfang cylinder", "rumfang kasse", "rumfang kugle", "rumfang formel", "rumfang liter"],
      ogTitle: `Rumfangsberegner: cylinder med d = 1 m og h = 2 m er ${RUMFANG_TEKST_DA.cylinder} m³`,
      ogDescription: `Beregn rumfang i m³ og liter for kasse, cylinder, kugle, kegle og pyramide.`,
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Rumfangsberegner",
      schemaDescription: "Beregn rumfang i m³ og liter for kasse, cylinder, kugle, kegle og pyramide.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan beregner man rumfang?", answer: `Det afhænger af figuren. Kasse er længde × bredde × højde, cylinder er π × (diameter ÷ 2)² × højde, kugle er (4 ÷ 3) × π × (diameter ÷ 2)³, kegle er (1 ÷ 3) × π × (diameter ÷ 2)² × højde, og pyramide er (1 ÷ 3) × grundside² × højde.` },
        { question: "Hvad er rumfanget af en cylinder med diameter 1 meter og højde 2 meter?", answer: `Cylinderens grundareal er π × (1 ÷ 2)² = ${RUMFANG_TEKST_DA.cylinderAreal} m². Gang med højden på 2 m, og du får ${RUMFANG_TEKST_DA.cylinder} m³ — altså ${RUMFANG_TEKST_DA.cylinderLiter} liter.` },
        { question: "Hvorfor skal jeg bruge diameter og ikke radius?", answer: "Fordi det er den fejl, der double-sidens egen. Hvis du har målt 20 cm på tværs og skriver 20 som radius, får du fire gange så stort rumfang. Værktøjet tager derfor diameter direkte." },
        { question: "Hvor mange liter er der i en kubikmeter?", answer: `1 m³ = ${LITER_PR_KUBIKMETER} liter, fordi en kubikmeter er 100 cm × 100 cm × 100 cm = 1.000.000 cm³, og der går 1.000 cm³ på literen. Værktøjet viser derfor begge tal ud fra den samme beregning.` },
        { question: "Hvordan regner man rumfang i Excel?", answer: "Kassens rumfang er bare =A1*B1*C1. Cylinderens er =PI()*(A1/2)^2*B1, hvor A1 er diameteren og B1 højden i meter. Kuglens er =4/3*PI()*(A1/2)^3." },
        { question: "Hvad er forskellet på areal og rumfang?", answer: "Areal er fladens størrelse i m² — det er, hvad /kvadratmeterberegneren regner. Rumfang er pladsen inde i kroppen i m³. En kasse på 2 × 1 × 0,5 m har et areal på 2 m² (gulvet) og et rumfang på 1 m³." },
      ],
    },
    "areal": {
      slug: "areal",
      title: "Arealberegner",
      description: `Beregn arealet i m² og cm² for cirkel, trekant, rektangel, kvadrat, trapez, parallelogram og rombe. Alle mål skrives i meter, og værktøjet tager diameter — ikke radius.`,
      metaTitle: `Arealberegner: trapez med sider 2 og 4 m = ${AREAL_TEKST_DA.trapez} m²`,
      metaDescription: `Beregn areal af cirkel, trekant, rektangel, kvadrat, trapez, parallelogram og rombe i m² og cm². Cirkel med diameter 1 m: ${AREAL_TEKST_DA.cirkel} m² = ${AREAL_TEKST_DA.cirkelCm} cm².`,
      keywords: ["arealberegner", "beregn areal", "areal af cirkel", "areal af trekant", "areal af firkant", "areal formel", "areal trapez", "areal parallelogram", "areal rombe", "areal af rektangel"],
      ogTitle: `Arealberegner: trapez med sider 2 og 4 m = ${AREAL_TEKST_DA.trapez} m²`,
      ogDescription: `Beregn arealet i m² og cm² for cirkel, trekant, rektangel, kvadrat, trapez, parallelogram og rombe.`,
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Arealberegner",
      schemaDescription: "Beregn arealet i m² og cm² for cirkel, trekant, rektangel, kvadrat, trapez, parallelogram og rombe.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan beregner man areal?", answer: "Det afhænger af figuren. Cirkel er π × (diameter ÷ 2)², trekant er (grundlinje × højde) ÷ 2, rektangel er længde × bredde, kvadrat er side × side, trapez er ((a + b) ÷ 2) × højde, parallelogram er grundlinje × højde, og rombe er (d1 × d2) ÷ 2." },
        { question: "Hvad er arealet af en cirkel med diameter 1 meter?", answer: `Radius er 0,5 m, så arealet er π × 0,5² = ${AREAL_TEKST_DA.cirkel} m² — altså ${AREAL_TEKST_DA.cirkelCm} cm². Værktøjet halverer diameteren selv, så du skriver bare 1.` },
        { question: "Hvorfor skal jeg bruge diameter og ikke radius?", answer: "Fordi det er den fejl, der firedobler svaret. Måler du 20 cm på tværs og skriver 20 som radius, bliver arealet fire gange for stort — kvadratet i πr² gør fejlen firedobbelt. Værktøjet tager derfor diameter direkte." },
        { question: "Hvordan regner man arealet af en trekant?", answer: "Arealet af en trekant er (grundlinje × højde) ÷ 2 — altså halvdelen af et rektangel med samme grundlinje og højde. En trekant med grundlinje 2 m og højde 3 m har arealet 3 m²." },
        { question: "Hvad er forskellen på areal og rumfang?", answer: "Areal er fladens størrelse i m² — gulvet, væggen, grundstykket. Rumfang er pladsen inde i kroppen i m³ — det regner /rumfang. En kasse på 2 × 1 × 0,5 m har 2 m² gulv, men kun 1 m³ rumfang." },
        { question: "Hvor mange cm² er en m²?", answer: `1 m² = ${AREAL_TEKST_DA.cmPrM2} cm², fordi 1 m er 100 cm, og 100 × 100 = ${AREAL_TEKST_DA.cmPrM2}. Værktøjet viser derfor begge enheder ud fra den samme beregning.` },
        { question: "Hvordan regner man areal i Excel?", answer: "Rektangel: =A1*B1. Cirkel: =PI()*(A1/2)^2, hvor A1 er diameteren. Trekant: =A1*B1/2. Trapez: =(A1+B1)/2*C1, hvor A1 og B1 er de parallelle sider og C1 højden." },
        { question: "Hvad er forskellen på et parallelogram og et rektangel?", answer: "De har samme formel — grundlinje × højde — men i et parallelogram står siderne skævt, så højden er den vinkelrette afstand mellem de to grundlinjer, ikke sidelængden. Måler du sidelængden i stedet for højden, bliver arealet for stort." },
      ],
    },
    "omkreds": {
      slug: "omkreds",
      title: "Omkredsberegner",
      description: `Beregn omkredsen i m og cm for cirkel, kvadrat, rektangel, trekant, trapez, parallelogram og rombe. Alle mål skrives i meter.`,
      metaTitle: `Omkredsberegner: cirkel med diameter 1 m = ${OMKREDS_TEKST_DA.cirkel} m`,
      metaDescription: `Beregn omkreds af cirkel, trekant, rektangel og flerkanter i m og cm. Cirkel med diameter 1 m er ${OMKREDS_TEKST_DA.cirkel} m = ${OMKREDS_TEKST_DA.cirkelCm} cm.`,
      keywords: ["omkredsberegner", "beregn omkreds", "omkreds af cirkel", "omkreds af trekant", "omkreds af firkant", "omkreds formel", "omkreds af rektangel", "omkreds af rombe", "omkreds cirkel diameter"],
      ogTitle: `Omkredsberegner: cirkel med diameter 1 m = ${OMKREDS_TEKST_DA.cirkel} m`,
      ogDescription: `Beregn omkredsen i m og cm for cirkel, trekant, rektangel og flerkanter.`,
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Omkredsberegner",
      schemaDescription: "Beregn omkredsen i m og cm for cirkel, kvadrat, rektangel, trekant, trapez, parallelogram og rombe.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan beregner man omkreds?", answer: "Det afhænger af figuren. Cirkel er π × diameter, kvadrat er 4 × side, rektangel er 2 × (længde + bredde), trekant er a + b + c, trapez er a + b + c + d, parallelogram er 2 × (a + b), og rombe er 4 × side." },
        { question: "Hvad er omkredsen af en cirkel med diameter 1 meter?", answer: `Omkredsen er π × 1 = ${OMKREDS_TEKST_DA.cirkel} m, altså ${OMKREDS_TEKST_DA.cirkelCm} cm. Værktøjet ganger diameteren med π, så du skriver bare 1.` },
        { question: "Hvorfor skal jeg bruge diameter og ikke radius?", answer: "Fordi radius giver det halve svar. Omkredsen er 2 × π × radius = π × diameter. Skriver du radius i diameterfeltet, bliver omkredsen halvt så stor, som den skal være." },
        { question: "Hvordan regner man omkredsen af en trekant?", answer: "Du lægger de tre sider sammen: a + b + c. En trekant med siderne 3, 4 og 5 m har omkredsen 12 m. Det gælder alle trekanter — også den retvinklede — fordi omkredsen kun er kanten rundt." },
        { question: "Hvordan regner man omkredsen af et rektangel?", answer: `Du lægger længden og bredden sammen og ganger med 2, fordi der er to af hver: 2 × (længde + bredde). Et rektangel på 2 × 3 m har omkredsen ${OMKREDS_TEKST_DA.rektangel} m.` },
        { question: "Hvad er forskellen på areal og omkreds?", answer: "Omkreds er længden af kanten rundt om figuren, målt i meter. Areal er fladens størrelse indeni, målt i m² — det regner /areal. To figurer kan have samme omkreds og forskelligt areal: et kvadrat på 2 × 2 m og et rektangel på 1 × 3 m har begge omkredsen 8 m." },
        { question: "Hvordan regner man omkreds i Excel?", answer: "Cirkel: =PI()*A1, hvor A1 er diameteren. Rektangel: =2*(A1+B1). Kvadrat: =4*A1. Trekant: =A1+B1+C1. Trapez: =A1+B1+C1+D1, hvor hver celle er en side." },
        { question: "Hvad er forskellen på omkreds og diameter?", answer: "Diameteren er den lige linje tværs over cirklen gennem midten. Omkredsen er kanten hele vejen rundt, og den er π ≈ 3,14 gange så lang som diameteren. Måler du diameteren til 10 cm, er omkredsen ca. 31,4 cm." },
      ],
    },
    "hundealder": {
      slug: "hundealder",
      title: "Hundeår til menneskeår",
      description: `Hvor gammel er din hund i menneskeår? Skriv alderen og vælg hundens størrelse, og se svaret med AVMA's metode: 15 menneskeår det første år, 9 det andet, og 4-7 pr. år derefter.`,
      metaTitle: `Hundeår til menneskeår: 7 år = ${HUNDEALDER_TEKST_DA.syvAarMellem} (mellemstor)`,
      metaDescription: `Omregn hundeår til menneskeår. En mellemstor hund på ${HUNDEALDER_TEKST_DA.eksempelAar} år er ${HUNDEALDER_TEKST_DA.eksempelMenneske} menneskeår; en stor hund på 10 år er ${HUNDEALDER_TEKST_DA.tiAarStor}, en lille er ${HUNDEALDER_TEKST_DA.tiAarLille}.`,
      keywords: ["hundeår", "hundeår til menneskeår", "hvor gammel er min hund", "hund alder i menneskeår", "hundealder", "hundens alder", "hvor gammel er hunden i menneskeår", "beregn hundeår", "hund alder beregner"],
      ogTitle: `Hundeår til menneskeår: 7 år = ${HUNDEALDER_TEKST_DA.syvAarMellem} (mellemstor)`,
      ogDescription: `Skriv hundens alder og størrelse, og se hvor gammel den er i menneskeår efter AVMA's metode.`,
      category: "Praktisk",
      breadcrumbCategory: "Praktisk",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Hundealderberegner",
      schemaDescription: "Omregn hundeår til menneskeår efter AVMA's størrelsesjusterede metode: 15 + 9, derefter 4-7 pr. år.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan regner man hundeår om til menneskeår?", answer: `Det første hundår er ca. 15 menneskeår, det andet lægger 9 til, så en hund på to år er 24 menneskeår. Derefter lægger hvert år 4 menneskeår til for en lille hund, 5 for en mellemstor, 6 for en stor og 7 for en kæmpehund. En mellemstor hund på ${HUNDEALDER_TEKST_DA.eksempelAar} år er derfor ${HUNDEALDER_TEKST_DA.eksempelRegnestykke} menneskeår.` },
        { question: "Er en hund på 7 år 49 i menneskeår?", answer: `Kun hvis den er mellemstor. 15 + 9 + 5 × 5 = 49 for en hund på 10-25 kg. Er den lille (under 10 kg), bliver den 44, er den stor (25-45 kg) 54, og er den kæmpe (over 45 kg) 59 — størrelsen afgør takten efter det andet år.` },
        { question: "Hvorfor er reglen om 7 hundår forkert?", answer: "Fordi en hund ikke ældes jævnt. En etårig hund er allerede udvokset og kønsmoden — nærmest en teenager på 15, ikke et barn på 7. Reglen rammer heller ikke størrelsesforskellen: en stor hund på 10 år er 72 menneskeår, en lille hund på 10 år kun 56." },
        { question: "Hvor gammel er en stor hund på 10 år i menneskeår?", answer: `En stor hund (25-45 kg) på 10 år er ${HUNDEALDER_TEKST_DA.tiAarStor} menneskeår efter AVMA's tabel. En kæmpehund (over 45 kg) på samme alder er ${HUNDEALDER_TEKST_DA.tiAarKaempe}, mens en lille hund kun er ${HUNDEALDER_TEKST_DA.tiAarLille}.` },
        { question: "Hvornår er en hund senior?", answer: "Små og mellemstore hunde regnes som seniorer ved 7 år, store hunde ved 6 og kæmpehunde allerede ved 5. Grænsen følger AVMA's tommelfingerregel: store racer har kortere levetid og ældes hurtigere efter de første år." },
        { question: "Hvor mange menneskeår er et hundår?", answer: "Der er ikke ét tal. Det første hundår er ca. 15 menneskeår, det andet ca. 9, og derefter 4-7 afhængigt af størrelsen. Derfor kan man ikke gange med et fast tal — værktøjet regner de tre led hver for sig." },
        { question: "Hvad hvis hunden er under to år?", answer: "Så er de to første led lineære: en hvalp på et halvt år er 15 × 0,5 = 7,5 menneskeår, og en hund på halvandet år er 15 + 9 × 0,5 = 19,5. Det er den samme interpolation, de offentliggjorte tabeller bruger mellem hele år." },
        { question: "Gælder metoden også for katte?", answer: "Nej. Katte følger 15 menneskeår det første år, 9 det andet, og derefter 4 pr. år — uden størrelsesopdeling, fordi katteracer ikke varierer i størrelse på samme måde som hunde." },
      ],
    },
    "laantype": {
      slug: "laantype",
      title: "Annuitetslån: serielån eller stående lån?",
      description: `Sammenlign de tre lånetyper på samme beløb, rente og løbetid. Serielånet på ${LAANETYPE_TEKST.hovedstol} kr. over ${LAANETYPE_TEKST.loebetid} år til ${LAANETYPE_TEKST.aarligRente} % koster ${LAANETYPE_TEKST.forskelFoerste} kr. mere i måned 1, men sparer ${LAANETYPE_TEKST.renteBesparelse} kr. i rente.`,
      metaTitle: `Annuitetslån vs serielån: ${LAANETYPE_TEKST.forskelFoerste} kr. dyrere i måned 1`,
      metaDescription: `Sammenlign annuitetslån, serielån og stående lån på ${LAANETYPE_TEKST.hovedstol} kr. over ${LAANETYPE_TEKST.loebetid} år. Se første ydelse, månedsafdrag og samlet rente.`,
      keywords: ["annuitetslån vs serielån", "annuitetslån serielån", "serielån beregner", "stående lån", "annuitetslån beregner", "serielån formel", "forskel annuitetslån serielån"],
      ogTitle: "Annuitetslån, serielån eller stående lån?",
      ogDescription: "Sammenlign de tre lånetyper på samme beløb, rente og løbetid.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lånetypeberegner",
      schemaDescription: "Sammenlign annuitetslån, serielån og stående lån på første ydelse, månedsafdrag og samlet rente.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad er forskellen på annuitetslån og serielån?", answer: `Et annuitetslån har konstant ydelse: du betaler det samme beløb hver måned, men i starten går næsten alt til renter, og i slutningen går næsten alt til afdrag. Et serielån har konstant afdrag: du afdrager det samme beløb på hovedstolen hver måned, mens renten falder, så ydelsen starter højt og bliver lavere. På ${LAANETYPE_TEKST.hovedstol} kr. over ${LAANETYPE_TEKST.loebetid} år til ${LAANETYPE_TEKST.aarligRente} % er serielånets første ydelse ${LAANETYPE_TEKST.serielaanFoerste} kr. mod annuitetslånets ${LAANETYPE_TEKST.annuitetYdelse} kr., og dens sidste ydelse er kun ${LAANETYPE_TEKST.serielaanSidste} kr.` },
        { question: "Hvilken lånetype er billigst?", answer: `Serielånet er billigst over hele løbetiden, fordi gælden bliver nedbragt hurtigere og derfor løber mindre rente på restgælden. På ${LAANETYPE_TEKST.hovedstol} kr. over ${LAANETYPE_TEKST.loebetid} år til ${LAANETYPE_TEKST.aarligRente} % er den samlede rente ${LAANETYPE_TEKST.serielaanRente} kr. mod ${LAANETYPE_TEKST.annuitetRente} kr. i et annuitetslån — altså ${LAANETYPE_TEKST.renteBesparelse} kr. mindre. Til gengæld er startydelsen ${LAANETYPE_TEKST.forskelFoerste} kr. højere, og det er startydelsen, banken vurderer dit rådighedsbeløb på.` },
        { question: "Hvornår er serielånet billigere end annuitetslånet?", answer: `Serielånets ydelse falder måned for måned, mens annuitetslånets er konstant, så de to krydser. På ${LAANETYPE_TEKST.hovedstol} kr. over ${LAANETYPE_TEKST.loebetid} år til ${LAANETYPE_TEKST.aarligRente} % er serielånet dyrere frem til måned ${LAANETYPE_TEKST.kryds} og billigere derfra. Krydsmåneden afhænger af renten og løbetiden, så værktøjet regner den for de tal, du indtaster.` },
        { question: "Hvad er forskellen på et stående lån og et afdragsfrit lån?", answer: `Der er ingen forskel i tallene — et stående lån er blot det danske navn for et afdragsfrit lån. Du betaler kun renter hele løbetiden, og hovedstolen står uændret til den dag du indfrier den. På ${LAANETYPE_TEKST.hovedstol} kr. over ${LAANETYPE_TEKST.loebetid} år til ${LAANETYPE_TEKST.aarligRente} % er ydelsen ${LAANETYPE_TEKST.staendeYdelse} kr. hver måned, men den samlede rente bliver ${LAANETYPE_TEKST.staendeRente} kr., fordi renterne løber på hele beløbet hele vejen.` },
        { question: "Må et boliglån afdrages langsommere end et 30-årigt annuitetslån?", answer: "Nej for ejerboliger til helårsbrug og fritidshuse. Realkreditlovens § 4 siger ordret, at sådanne lån \"uanset den sikkerhedsmæssige placering ikke kan ydes, så de amortiseres langsommere end et 30-årigt lån, der amortiseres over løbetiden med en ydelse, som udgør en fast procentdel af hovedstolen (annuitetslån)\". Stk. 2 giver dog tilladelse til at fravige kravet for en periode på op til 10 år — og det er grundlaget for afdragsfrihed i en periode, altså for at lånet i den periode er et stående lån. I andre ejendomskategorier er der principielt ingen grænse for afdragsfrihed." },
        { question: "Hvad betyder lånetypen for mit rentefradrag?", answer: "Fradraget følger renteudgiften, ikke afdraget. Et annuitetslån har den højeste renteudgift i starten og derfor det største fradrag de første år. Serielånets renteudgift falder fra dag 1, så fradraget falder med det." },
      ],
    },
    "sparemaal": {
      slug: "sparemaal",
      title: "Sparemålsberegner - hvor meget skal jeg spare op om måneden?",
      description: "Beregn hvor meget du skal spare op hver måned for at nå dit sparemål inden for et bestemt antal år.",
      metaTitle: "Sparemålsberegner - Hvor meget skal jeg spare op om måneden?",
      metaDescription: "Gratis sparemålsberegner. Find ud af hvor meget du skal spare op hver måned for at nå dit mål. Angiv mål, antal år, rente og startbeløb.",
      keywords: ["sparemål beregner", "hvor meget skal jeg spare op", "månedlig opsparing", "opsparingsmål", "spare op beregner"],
      ogTitle: "Sparemålsberegner - Hvor meget skal jeg spare op?",
      ogDescription: "Beregn hvor meget du skal spare op hver måned for at nå dit sparemål.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Sparemålsberegner",
      schemaDescription: "Beregn den månedlige opsparing der skal til for at nå et sparemål.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvordan beregner jeg min månedlige opsparing?", answer: "Indtast dit sparemål, antal år og en forventet rente. Beregneren bruger renters rente-formlen og viser, hvor meget du skal indbetale hver måned for at nå målet." },
        { question: "Tæller renter med?", answer: "Ja. Renten tilskrives månedligt, så jo højere rente og længere tid, jo mindre skal du selv indbetale. Beregneren viser, hvor meget af målet der kommer fra renter." },
        { question: "Kan jeg medregne en eksisterende opsparing?", answer: "Ja. Indtast dit nuværende opsparede beløb som startbeløb, så trækker beregneren det fra — inklusive den rente, det selv når at give." },
      ],
    },
    "kropsfedt": {
      slug: "kropsfedt",
      title: "Kropsfedtprocent - beregn med U.S. Navy-metoden",
      description: "Estimer din kropsfedtprocent ud fra dine kropsmål. Et mere nuanceret mål end BMI, der skelner mellem fedt og muskler.",
      metaTitle: "Kropsfedtprocent beregner - U.S. Navy-metoden",
      metaDescription: "Gratis beregner til kropsfedtprocent. Estimer dit kropsfedt ud fra højde, talje, hals (og hofte) med U.S. Navy-metoden. Se om du er i et sundt niveau.",
      keywords: ["kropsfedtprocent", "beregn kropsfedt", "fedtprocent beregner", "body fat beregner", "navy metoden"],
      ogTitle: "Kropsfedtprocent - Beregn med U.S. Navy-metoden",
      ogDescription: "Estimer din kropsfedtprocent ud fra dine kropsmål.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kropsfedtprocent beregner",
      schemaDescription: "Estimer kropsfedtprocent ud fra kropsmål med U.S. Navy-metoden.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvordan beregnes kropsfedtprocent?", answer: "Beregneren bruger U.S. Navy-metoden, der estimerer fedtprocenten ud fra omkredsen af talje, hals og højde (samt hofte for kvinder). Det er en enkel og rimeligt præcis metode, der ikke kræver udstyr." },
        { question: "Hvad er en sund kropsfedtprocent?", answer: "Vejledende ligger et sundt niveau på 14-24 % for mænd og 21-31 % for kvinder. Atleter ligger ofte lavere. Meget lave eller høje niveauer kan påvirke helbredet." },
        { question: "Er kropsfedtprocent bedre end BMI?", answer: "Kropsfedtprocent skelner mellem fedt og muskler, hvilket BMI ikke gør. En muskuløs person kan have højt BMI men lavt kropsfedt. Begge er dog kun estimater — brug dem som pejlemærker." },
      ],
    },
    "promille": {
      slug: "promille",
      title: "Promilleberegner",
      description: "4 øl til en mand på 80 kg giver 0,88 ‰. Beregn promille ud fra antal genstande, kropsvægt, køn og timer siden første genstand.",
      metaTitle: "Promilleberegner: 4 øl på 80 kg = 0,88 ‰",
      metaDescription: "4 øl på 80 kg = 0,88 ‰ med Widmark-formlen. Beregn promille ud fra genstande og vægt — og se grænsen på 0,5 ‰ her og i Sverige, Tyskland og Norge.",
      keywords: ["promilleberegner", "beregn promille", "alkoholpromille", "promille bil", "promillegrænse"],
      ogTitle: "Promilleberegner: 4 øl på 80 kg = 0,88 ‰",
      ogDescription: "4 øl på 80 kg = 0,88 ‰ med Widmark-formlen. Beregn promille ud fra genstande og vægt — og se grænsen på 0,5 ‰ her og i Sverige, Tyskland og Norge.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Promilleberegner",
      schemaDescription: "Beregn alkoholpromille med Widmark-formlen: 4 øl på 80 kg = 0,88 ‰.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hvordan beregnes promille?", answer: "Beregneren bruger Widmark-formlen: promille = gram alkohol / (kropsvægt × fordelingsfaktor) − 0,15 × timer. Fordelingsfaktoren er cirka 0,68 for mænd og 0,55 for kvinder. Kroppen forbrænder omkring 0,15 ‰ i timen." },
        { question: "Hvad er promillegrænsen i Danmark?", answer: "Det er ulovligt at køre bil med en promille over 0,5 ‰. Ved høje promiller stiger straffen, og over 2,0 ‰ mister man som udgangspunkt kørekortet ubetinget." },
        { question: "Hvor meget er én genstand?", answer: "Én genstand svarer til 12 gram ren alkohol — cirka en almindelig øl (33 cl), et lille glas vin (12 cl) eller et snapseglas spiritus (4 cl). En stærk øl kan være 1,5-2 genstande." },
        { question: "Hvor mange promille er 2 øl?", answer: "Én pilsner på 33 cl er ca. 12 gram alkohol, altså én genstand. To øl giver derfor ca. 0,44 promille hos en mand på 80 kg, 0,50 hos en mand på 70 kg og 0,73 hos en kvinde på 60 kg. Grænsen på 0,5 promille nås altså forskelligt hurtigt — og efter yderligere en time er der ca. 0,15 promille mindre." },
        { question: "Hvad er promillegrænsen i Tyskland?", answer: "Grænsen er 0,5 promille, som i Danmark. Men under 21 år og i kørekortets prøveperiode må du slet ikke drikke alkohol, før du kører — der er grænsen 0,0 promille." },
        { question: "Hvad er promillegrænsen i Norge og Sverige?", answer: "Begge lande har 0,2 promille — altså halvdelen af den danske grænse på 0,5 promille. Det betyder at 2 øl til en mand på 80 kg (0,44 promille) er lovligt i Danmark, men ulovligt i Norge og Sverige. Polen har også 0,2 promille." },
        { question: "Må jeg køre med 0,4 promille i udlandet?", answer: "Det afhænger af landet. I Sverige, Norge og Polen er 0,4 promille for højt — grænsen er 0,2. I Tyskland, Frankrig, Spanien, Italien, Grækenland, Holland, Østrig og Danmark er 0,4 promille under grænsen på 0,5, men i Storbritannien er grænsen 0,8 promille (0,5 i Skotland). For nye og professionelle bilister er grænsen i de fleste lande lavere — helt ned til 0,0 promille." },
        { question: "Er beregningen præcis?", answer: "Nej, det er et estimat. Mad, stofskifte, medicin og helbred påvirker den faktiske promille. Kør aldrig bil i tvivl — promillen kan være højere end beregnet." },
        { question: "Hvornår kan jeg køre bil igen?", answer: `4 øl på 80 kg = ${PROMILLE_4_OEL_ER}. Der er to forskellige tal, og det er nemlig det kortere, der bestemmer: du må køre bil, når promillen er under 0,5 ‰, og det tager ${formatTimer(PROMILLE_4_OEL.timerTilGraenseDa, "da")}. Helt ædru er du først efter ${formatTimer(PROMILLE_4_OEL.timerTilNul, "da")}, fordi kroppen kun forbrænder omkring 0,15 ‰ i timen. En tommers mortel: du kan godt være lovlig ude at køre klokken 03 og stadig være fuld om morgenen. Morgenstunden efter er den farligste, fordi promillen ofte er højere end man tror.` },
      ],
    },
    "del-regning": {
      slug: "del-regning",
      title: "Del regningen - fordel beløbet mellem flere",
      description: "Del en regning ligeligt mellem flere personer, med mulighed for at lægge drikkepenge oveni. Se beløbet pr. person.",
      metaTitle: "Del regningen - Beregn beløb pr. person med drikkepenge",
      metaDescription: "Gratis beregner til at dele regningen. Indtast beløb, antal personer og evt. drikkepenge og se, hvad hver skal betale. Perfekt til restaurant og fester.",
      keywords: ["del regningen", "beløb pr person", "del regning beregner", "drikkepenge beregner", "split regning"],
      ogTitle: "Del regningen - Beløb pr. person",
      ogDescription: "Del en regning ligeligt mellem flere personer, med drikkepenge.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Del regningen",
      schemaDescription: "Del en regning ligeligt mellem flere personer, med mulighed for drikkepenge.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvordan deler jeg en regning mellem flere?", answer: "Divider regningens beløb med antallet af personer. Eksempel: 500 kr delt på 4 = 125 kr pr. person. Beregneren gør det automatisk og kan også lægge drikkepenge oveni." },
        { question: "Hvor meget skal man give i drikkepenge i Danmark?", answer: "I Danmark er drikkepenge ikke forventet, da betjening er inkluderet i priserne. Mange runder op eller giver 5-10 % ved god service, men det er helt frivilligt." },
        { question: "Kan jeg regne drikkepenge med i delingen?", answer: "Ja. Vælg en drikkepengeprocent (eller indtast din egen), så lægger beregneren dem til regningen, før beløbet fordeles ligeligt mellem jer." },
      ],
    },
    "brok": {
      slug: "brok",
      title: "Brøkberegner - forkort brøk til decimaltal og procent",
      description: "6/8 forkortet = 3/4 = 0,75 = 75 %. Brøkberegneren finder største fælles divisor og viser brøk, decimaltal og procent.",
      metaTitle: "Brøkberegner: forkort 6/8 til 3/4 = 0,75 = 75 %",
      metaDescription: "Forkort brøk til enkleste form og se den som decimaltal og procent. Eksempel: 6/8 = 3/4 = 0,75 = 75 %. Indtast tæller og nævner.",
      keywords: ["brøkberegner", "forkort brøk", "brøk til decimaltal", "brøk til procent", "forkorte brøk"],
      ogTitle: "Brøkberegner: forkort 6/8 til 3/4 = 0,75 = 75 %",
      ogDescription: "Største fælles divisor finder den enkleste form. Eksempel: 6/8 = 3/4 = 0,75 = 75 %.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Brøkberegner",
      schemaDescription: "Forkort en brøk til enkleste form og se den som decimaltal og procent.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan forkorter man en brøk?", answer: "Divider både tæller og nævner med deres største fælles divisor. Fx bliver 6/8 til 3/4, fordi begge tal kan divideres med 2. Beregneren gør det automatisk." },
        { question: "Hvad er 6/8 som decimaltal og procent?", answer: "6/8 = 0,75 = 75 %. Tælleren 6 divideres med nævneren 8, og resultatet ganges med 100 for at give procent. Forkortet er brøken 3/4." },
        { question: "Hvordan laver jeg en brøk om til procent?", answer: "Divider tæller med nævner og gang med 100. Fx er 3/4 = 0,75 = 75 %. Beregneren viser både decimaltal og procent samtidig." },
        { question: "Kan beregneren håndtere uægte brøker?", answer: "Ja. En uægte brøk, hvor tælleren er større end nævneren (fx 10/4), forkortes og vises også som decimaltal (2,5) og procent (250 %)." },
        { question: "Hvad er regnereglerne for brøker?", answer: "Plus og minus kræver ens nævnere: 1/2 + 1/3 = 3/6 + 2/6 = 5/6. Gange kræver tæller ganges med tæller og nævner med nævner: 1/2 × 2/3 = 2/6 = 1/3. Dele er at bytte om og vende nævneren op og ned: 1/2 ÷ 2/3 = 1/2 × 3/2 = 3/4. Forkort altid til sidst." },
        { question: "Hvad er en brøkdel af et tal?", answer: "En brøkdel af et tal er tælleren gange med tallet, divideret med nævneren. 3/4 af 200 kr. er (3 × 200) ÷ 4 = 150 kr. Samme svar får du via procent: 3/4 er 75 %, og 75 % af 200 er 150 kr." },
        { question: "Hvad er forskellen på en ægte og en uægte brøk?", answer: "En ægte brøk har tælleren mindre end nævneren, så værdien er under 1: 3/4 = 0,75. En uægte brøk har tælleren større end nævneren, så værdien er over 1: 10/4 = 2,5. Beregneren viser begge dele, fordi den også sætter dem i decimaltal og procent." },
      ],
    },
    "enheder": {
      slug: "enheder",
      title: "Enhedsberegner - omregn længde, vægt og volumen",
      description: "Omregn mellem metriske og angelsaksiske enheder: km og mil, meter og fod, kg og pund, liter og gallon.",
      metaTitle: "Enhedsberegner - Omregn km/mil, kg/pund, liter/gallon",
      metaDescription: "Gratis enhedsberegner. Omregn længde, vægt og volumen mellem metriske og angelsaksiske enheder — km til mil, cm til tommer, kg til pund, liter til gallon.",
      keywords: ["enhedsberegner", "km til mil", "kg til pund", "cm til tommer", "liter til gallon", "omregn enheder"],
      ogTitle: "Enhedsberegner - Omregn længde, vægt og volumen",
      ogDescription: "Omregn mellem metriske og angelsaksiske enheder for længde, vægt og volumen.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Enhedsberegner",
      schemaDescription: "Omregn mellem enheder for længde, vægt og volumen — metriske og angelsaksiske.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvor mange kilometer er en engelsk mil?", answer: "En engelsk mil er 1,609 kilometer (1.609 meter). Pas på: en skandinavisk »mil« er derimod 10 kilometer. Beregneren bruger den engelske mil." },
        { question: "Hvor mange kilo er et pund?", answer: "Et engelsk/amerikansk pund (lb) er 0,4536 kg, så 1 kg er cirka 2,2 pund. Bemærk, at det danske pund i daglig tale ofte betyder 500 gram." },
        { question: "Hvor mange centimeter er en tomme?", answer: "En tomme (inch) er præcis 2,54 cm. En fod er 12 tommer = 30,48 cm, og en yard er 3 fod = 91,44 cm." },
      ],
    },
    "nedtaelling": {
      slug: "nedtaelling",
      title: "Hvor mange dage er der til en dato?",
      description: "Vælg datoen og se hvor mange dage og hele uger der er tilbage. Tæl ned til fødselsdag, ferie, eksamen eller jul — dagen i dag tælles ikke med.",
      metaTitle: "Nedtælling - hvor mange dage til en dato?",
      metaDescription: "Se hvor mange dage og uger der er til en fødselsdag, ferie, eksamen eller jul. Vælg datoen og få antallet dage og hele uger.",
      keywords: ["nedtælling", "hvor mange dage til", "dage til dato", "tæl ned til dato", "dage til jul"],
      ogTitle: "Nedtælling - hvor mange dage til en dato?",
      ogDescription: "Vælg datoen og se hvor mange dage og hele uger der er tilbage.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Nedtælling",
      schemaDescription: "Se hvor mange dage og hele uger der er til en valgt dato.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan tæller jeg dage til en dato?", answer: "Vælg datoen, så tæller beregneren automatisk fra dags dato og viser antallet af dage — og hvor mange uger og dage det svarer til." },
        { question: "Tælles dagen i dag med?", answer: "Nej, beregningen tæller antal hele dage fra i dag til den valgte dato. Vælger du morgendagen, viser den 1 dag." },
        { question: "Kan jeg tælle dage siden en dato?", answer: "Ja. Vælger du en dato, der allerede er passeret, viser beregneren, hvor mange dage der er gået siden." },
        { question: "Hvor mange dage er der til jul?", answer: "Juledagen er altid 25. december, så antallet afhænger af, hvornår du ser siden. Siden \"Hvor mange dage er der til juledagen?\" regner det ud for dig hver dag." },
      ],
    },
    "fart": {
      slug: "fart",
      title: "Fartberegner - beregn fart, distance og tid",
      description: "Beregn fart, distance eller tid ud fra de to andre. Se også dit tempo i minutter pr. kilometer til løb og cykling.",
      metaTitle: "Fartberegner: 100 km/t i 2 timer = 200 km",
      metaDescription: "Gratis fartberegner. Beregn fart, distance eller tid — og omregn km/t til m/s, mph og knop. Se tempo i min/km til løb og cykling.",
      keywords: ["fartberegner", "beregn hastighed", "km/t beregner", "tempo beregner", "min pr km", "gennemsnitsfart", "omregn km/t", "km i timen omregner", "km i timen til m/s", "km i timen til mph", "knop omregner", "omregn mph til km/t", "m/s omregner"],
      ogTitle: "Fartberegner: 100 km/t i 2 timer = 200 km",
      ogDescription: "Beregn fart, distance eller tid ud fra de to andre.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Fartberegner",
      schemaDescription: "Beregn fart, distance eller tid ud fra de to andre og se tempo i min/km.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan beregner jeg gennemsnitsfart?", answer: "Divider distancen med tiden. Eksempel: 100 km på 2 timer giver 50 km/t. Beregneren gør det automatisk — vælg 'Fart' og indtast distance og tid." },
        { question: "Hvordan omregner jeg fart til tempo (min/km)?", answer: "Del 60 med farten i km/t. Eksempel: 10 km/t = 60 / 10 = 6 min/km. Beregneren viser tempoet automatisk, hvilket er nyttigt til løb og cykling." },
        { question: "Hvad er formlen for fart, distance og tid?", answer: "Grundformlen er distance = fart × tid. Deraf følger fart = distance / tid og tid = distance / fart. Vælg blot, hvad du vil beregne." },
        { question: "Hvordan beregner jeg tid ud fra hastighed og distance?", answer: "Del distancen med farten. 300 km ved 100 km/t er 300 / 100 = 3 timer, altså 180 minutter. Husk at svaret kommer i timer, fordi både distance og fart er pr. time." },
        { question: "Er fart og tempo det samme?", answer: "Nej. Farten er i km/t, tempoet i min/km, og de omregnes med tempo = 60 delt i farten. 10 km/t er 6 min/km, 15 km/t er 4 min/km, og 20 km/t er 3 min/km." },
        { question: "Hvor mange m/s er 100 km/t?", answer: `100 km/t er ${FART_OMREGNING.daHundredeMs} m/s. Du kan regne det i hovedet: 1 m/s er præcis ${FART_OMREGNING.daMs} km/t, så del 100 med ${FART_OMREGNING.daMs}. Omregneren under overskriften «Omregn hastighed» svarer begge veje.` },
        { question: "Hvor mange km/t er 60 mph?", answer: `60 mph er ${FART_OMREGNING.daSESSMph} km/t. 1 mil er præcis ${FART_OMREGNING.daMil} km, fordi en yard er præcis 0,9144 m, så du kan altid gangen med 1,609344. Skriv 60 i feltet og vælg «Miles i timen (mph)», så får du svaret sammen med de tre andre enheder.` },
        { question: "Hvad er en knop, og hvor mange km/t er det?", answer: `En knop er én sømil i timen, altså præcis ${FART_OMREGNING.daSomermil} km/t. Derfor er 10 knob ${FART_OMREGNING.daTiKnop} km/t, og 100 km/t er ${FART_OMREGNING.daHundredeKnop} knob. Knop bruges i søfarten og i flyvning, fordi det er den enhed, begge bruger.` },
      ],
    },
    "gennemsnit": {
      slug: "gennemsnit",
      title: "Gennemsnitsberegner - beregn gennemsnit og median",
      description: "Indtast en række tal og beregn gennemsnit, median, sum, mindste og største værdi med det samme.",
      metaTitle: "Gennemsnitsberegner - Beregn gennemsnit og median",
      metaDescription: "Gratis gennemsnitsberegner. Indtast tal adskilt med komma eller mellemrum og få gennemsnit, median, sum, min og max. Perfekt til karakterer og målinger.",
      keywords: ["gennemsnitsberegner", "beregn gennemsnit", "median beregner", "middelværdi", "gennemsnit karakterer"],
      ogTitle: "Gennemsnitsberegner - Gennemsnit, median og sum",
      ogDescription: "Indtast tal og beregn gennemsnit, median og sum med det samme.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Gennemsnitsberegner",
      schemaDescription: "Beregn gennemsnit, median, sum, min og max af en række tal.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan beregner jeg et gennemsnit?", answer: "Læg alle tallene sammen og divider med antallet af tal. Eksempel: (12 + 15 + 9) / 3 = 12. Beregneren gør det automatisk, uanset hvor mange tal du indtaster." },
        { question: "Hvad er forskellen på gennemsnit og median?", answer: "Gennemsnittet er summen delt med antallet. Medianen er det midterste tal, når værdierne sorteres. Medianen påvirkes mindre af enkelte meget høje eller lave værdier og er ofte mere retvisende ved fx løn." },
        { question: "Hvordan indtaster jeg tallene?", answer: "Skriv tallene adskilt med komma, mellemrum eller linjeskift, fx '12, 15, 9'. Du kan bruge komma som decimaltegn (3,5) — beregneren forstår begge dele." },
      ],
    },
    "temperatur": {
      slug: "temperatur",
      title: "Temperaturberegner - Celsius, Fahrenheit og Kelvin",
      description: "Omregn hurtigt mellem Celsius, Fahrenheit og Kelvin. Indtast en temperatur og se de andre enheder med det samme.",
      metaTitle: "Temperaturberegner - Omregn Celsius, Fahrenheit og Kelvin",
      metaDescription: "Gratis temperaturberegner. Omregn nemt mellem Celsius, Fahrenheit og Kelvin. Perfekt til opskrifter, vejr og skole. Se formlerne og faste punkter.",
      keywords: ["celsius til fahrenheit", "fahrenheit til celsius", "temperatur omregner", "kelvin til celsius", "temperaturberegner"],
      ogTitle: "Temperaturberegner - Celsius, Fahrenheit og Kelvin",
      ogDescription: "Omregn hurtigt mellem Celsius, Fahrenheit og Kelvin.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Temperaturberegner",
      schemaDescription: "Omregn mellem Celsius, Fahrenheit og Kelvin.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvordan omregner jeg Fahrenheit til Celsius?", answer: "Træk 32 fra og gang med 5/9: °C = (°F − 32) × 5/9. Eksempel: 98,6 °F = (98,6 − 32) × 5/9 = 37 °C. Beregneren gør det automatisk." },
        { question: "Hvordan omregner jeg Celsius til Fahrenheit?", answer: "Gang med 9/5 og læg 32 til: °F = °C × 9/5 + 32. Eksempel: 20 °C = 20 × 9/5 + 32 = 68 °F." },
        { question: "Hvad er Kelvin?", answer: "Kelvin er den absolutte temperaturskala, hvor 0 K er det absolutte nulpunkt (−273,15 °C). Du omregner fra Celsius ved at lægge 273,15 til: K = °C + 273,15." },
      ],
    },
    "enhedspris": {
      slug: "enhedspris",
      title: "Enhedspris beregner - find den billigste vare",
      description: "35 kr. for 2 kg koster 17,50 kr. pr. kg — 12,5 % billigere end 20 kr. for 1 kg. Sammenlign enhedspris, kilopris og literpris.",
      metaTitle: "Enhedspris: 35 kr. for 2 kg = 17,50 kr. pr. kg",
      metaDescription: "35 kr. for 2 kg koster 17,50 kr. pr. kg, 12,5 % billigere end 20 kr. for 1 kg. Sammenlign to varers kilopris, literpris og stykpris.",
      keywords: ["enhedspris", "kilopris beregner", "literpris", "pris pr enhed", "sammenlign priser vare"],
      ogTitle: "Enhedspris: 35 kr. for 2 kg = 17,50 kr. pr. kg",
      ogDescription: "35 kr. for 2 kg koster 17,50 kr. pr. kg, 12,5 % billigere end 20 kr. for 1 kg. Sammenlign to varers kilopris, literpris og stykpris.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Enhedspris beregner",
      schemaDescription: "Sammenlign to varers pris pr. enhed: 35 kr. for 2 kg koster 17,50 kr. pr. kg, 12,5 % billigere end 20 kr. for 1 kg.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad er enhedspris?", answer: "Enhedsprisen er prisen pr. enhed — fx pr. kilo, pr. liter eller pr. stk. Den beregnes som prisen divideret med mængden og gør det muligt at sammenligne varer i forskellige størrelser retfærdigt." },
        { question: "Er den store pakke altid billigst?", answer: "Nej. Ofte er den store pakke billigst pr. enhed, men ikke altid — tilbud på små pakker kan gøre dem billigere pr. kilo. Beregneren viser det med det samme." },
        { question: "Kan jeg sammenligne forskellige enheder?", answer: "Nej, begge varer skal måles i samme enhed (fx begge i kg eller begge i liter). Omregn selv, hvis den ene er i gram og den anden i kilo." },
        { question: "Hvilken pakke er billigst pr. kilo i praksis?", answer: "Varen til 35 kr. for 2 kg koster 17,50 kr. pr. kg, mens varen til 20 kr. for 1 kg koster 20,00 kr. pr. kg. Den store pakke er altså 12,5 % billigere pr. enhed, selv om den kun koster 15 kr. mere." },
      ],
    },
    "afkast": {
      slug: "afkast",
      title: "Afkastberegner - beregn ROI og årligt afkast",
      description: "Beregn dit afkast (ROI) og det gennemsnitlige årlige afkast (CAGR) ud fra investeret beløb og værdi i dag.",
      metaTitle: "Afkastberegner - Beregn ROI og årligt afkast (CAGR)",
      metaDescription: "Gratis afkastberegner. Beregn dit afkast (ROI) i procent og kroner samt det årlige afkast (CAGR) ud fra investeret beløb, værdi i dag og antal år.",
      keywords: ["afkastberegner", "beregn afkast", "roi beregner", "årligt afkast", "cagr beregner"],
      ogTitle: "Afkastberegner - Beregn ROI og årligt afkast",
      ogDescription: "Beregn dit afkast (ROI) og det gennemsnitlige årlige afkast.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Afkastberegner",
      schemaDescription: "Beregn afkast (ROI) og årligt afkast (CAGR) ud fra investeret beløb og værdi i dag.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvordan beregner jeg afkast (ROI)?", answer: "Træk det investerede beløb fra værdien i dag, og del med det investerede beløb. Eksempel: (13.000 − 10.000) / 10.000 = 30 %. Beregneren gør det automatisk." },
        { question: "Hvad er årligt afkast (CAGR)?", answer: "CAGR (Compound Annual Growth Rate) er den gennemsnitlige årlige vækstrate. Den gør det muligt at sammenligne investeringer over forskellige perioder. Angiv antal år for at få den beregnet." },
        { question: "Er gebyrer og skat med i beregningen?", answer: "Nej. Beregneren viser bruttoafkastet. Gebyrer, kurtage og skat på gevinst reducerer dit reelle afkast og bør trækkes fra separat." },
      ],
    },
    "loen-konverter": {
      slug: "loen-konverter",
      title: "Lønberegner - timeløn, månedsløn og årsløn",
      description: "Omregn hurtigt mellem timeløn, månedsløn og årsløn. Indtast et beløb og se de andre med det samme.",
      metaTitle: "Lønberegner - Omregn timeløn, månedsløn og årsløn",
      metaDescription: "Gratis lønberegner. Omregn nemt mellem timeløn, månedsløn og årsløn ud fra dine ugentlige arbejdstimer. Perfekt til at sammenligne jobtilbud. Bruttoløn.",
      keywords: ["timeløn til månedsløn", "månedsløn til årsløn", "omregn løn", "lønberegner", "timeløn beregner"],
      ogTitle: "Lønberegner - Omregn timeløn, månedsløn og årsløn",
      ogDescription: "Omregn hurtigt mellem timeløn, månedsløn og årsløn.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lønberegner",
      schemaDescription: "Omregn mellem timeløn, månedsløn og årsløn ud fra ugentlige arbejdstimer.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvordan regner jeg timeløn om til månedsløn?", answer: "Gang timelønnen med antal timer du arbejder om ugen og med 52 uger, og del så med 12. Eksempel: 200 kr/time × 37 timer × 52 / 12 = ca. 32.067 kr om måneden. Beregneren gør det automatisk." },
        { question: "Hvor mange timer er en fuldtidsstilling?", answer: "I Danmark er en fuldtidsstilling typisk 37 timer om ugen. Beregneren bruger som standard 37 timer, men du kan ændre det til dine egne timer." },
        { question: "Er beløbet før eller efter skat?", answer: "Alle beløb er bruttoløn før skat og AM-bidrag. Vil du se din udbetaling efter skat, så brug vores løn efter skat-beregner." },
      ],
    },
    "budget": {
      slug: "budget",
      title: "Rådighedsbeløb",
      description: "Beregn dit månedlige rådighedsbeløb. Træk dine faste udgifter fra din indkomst efter skat og se hvor meget du har tilbage at leve for.",
      metaTitle: "Rådighedsbeløb beregner - Hvad har du tilbage?",
      metaDescription: "Beregn dit rådighedsbeløb. Indtast indkomst og faste udgifter (bolig, transport, mad, lån) og se hvad du har tilbage hver måned. Gratis budgetberegner.",
      keywords: ["rådighedsbeløb", "budget beregner", "månedligt budget", "rådighedsbeløb beregner", "privatøkonomi", "faste udgifter"],
      ogTitle: "Rådighedsbeløb beregner - Se hvad du har tilbage",
      ogDescription: "Beregn dit månedlige rådighedsbeløb. Indkomst minus faste udgifter.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Rådighedsbeløb beregner",
      schemaDescription: "Gratis budgetberegner. Beregn dit månedlige rådighedsbeløb ud fra indkomst og faste udgifter.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad er et rådighedsbeløb?", answer: "Rådighedsbeløbet er det beløb du har tilbage hver måned, når alle faste udgifter er betalt. Det beregnes som din indkomst efter skat minus faste udgifter som bolig, transport, mad, forsikringer og afdrag på lån." },
        { question: "Hvor stort bør mit rådighedsbeløb være?", answer: "Banker regner ofte med et minimum rådighedsbeløb ved låneansøgninger — typisk omkring 5.000-6.000 kr for en enlig og 8.500-10.000 kr for et par, plus tillæg pr. barn. Jo større rådighedsbeløb, jo bedre buffer til uforudsete udgifter og opsparing." },
        { question: "Hvad tæller med som faste udgifter?", answer: "Faste udgifter er tilbagevendende poster som husleje/boliglån, forsikringer, abonnementer (mobil, streaming, internet), transport, dagligvarer og afdrag på lån. Variable udgifter som ferie og gaver hører ikke med i det faste budget." },
      ],
    },
    "bmi": {
      slug: "bmi",
      title: "BMI Beregner for voksne",
      description: "Beregn dit Body Mass Index (BMI) som voksen og se, hvordan vægt og højde forholder sig til hinanden. BMI-formlen bruger kun vægt og højde.",
      metaTitle: "BMI-beregner for voksne: 75 kg / 1,75² = 24,5",
      metaDescription: "Beregn dit BMI på 5 sekunder. Eksempel: 75 kg / 1,75² = BMI 24,5 (normal). BMI-formlen justeres ikke for alder og er beregnet til voksne.",
      keywords: ["bmi beregner", "bmi voksne", "bmi", "body mass index", "beregn bmi", "bmi skala", "vægtinterval", "vægtberegner", "sundhed beregner", "overvægt"],
      ogTitle: "BMI-beregner for voksne: 75 kg / 1,75² = 24,5",
      ogDescription: "Gratis BMI-beregner for voksne. Se hvordan din vægt passer til din højde og find BMI-intervallet.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "BMI Beregner for voksne",
      schemaDescription: "Gratis BMI-beregner for voksne. Beregn dit Body Mass Index ud fra vægt og højde.",
      schemaCategory: "HealthApplication",
      faqItems: [
      { question: "Hvad er en normal BMI for voksne?", answer: "For voksne ligger BMI normalt mellem 18,5 og 24,9. Under 18,5 regnes som undervægt, 25-29,9 som overvægt, og over 30 som fedme." },
      { question: "Er BMI pålidelig for alle?", answer: "BMI er et nyttigt screeningsværktøj, men har begrænsninger. Meget muskuløse personer kan have høj BMI uden at være overvægtige." },
      { question: "Hvordan beregnes BMI?", answer: "BMI = vægt (kg) / højde² (m). En person på 75 kg og 175 cm har BMI = 75 / 1,75² = 24,5. Formlen justeres ikke for alder." },
      { question: "Hvad er mit vægtinterval for voksne?", answer: "Vægtintervallet for voksne med BMI 18,5-24,9 for en højde på 175 cm er ca. 57-76 kg." },
      { question: "Gælder BMI for børn?", answer: "Denne beregner er kun til voksne (18+). Den beregner råt BMI, men ikke børns percentil. Til børn skal du bruge alders- og kønsspecifikke percentiltabeller." },
      { question: "Hvad kan jeg gøre for at forbedre min BMI?", answer: "Ved overvægt: mere bevægelse og sundere kost. Ved undervægt: hyppige, næringsrige måltider og styrketræning." },
      ],
    },
    "kalorier": {
      slug: "kalorier",
      title: "Kalorieberegner",
      description: kalorierOverskrifter("da").description,
      metaTitle: kalorierOverskrifter("da").metaTitle,
      metaDescription: kalorierOverskrifter("da").metaDescription,
      keywords: ["kalorieberegner", "dagligt kaloriebehov", "TDEE beregner", "BMR beregner", "vægttab kalorier", "makroer beregner", "protein beregner", "kalorieunderskud"],
      ogTitle: kalorierOverskrifter("da").ogTitle,
      ogDescription: "BMR og TDEE ud fra alder, køn, vægt, højde og aktivitet — med makrofordeling.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kalorieberegner",
      schemaDescription: "Beregn BMR, TDEE og makrofordeling ud fra alder, køn, vægt, højde og aktivitetsniveau.",
      schemaCategory: "HealthApplication",
faqItems: kalorierFaqItems("da"),
    },
    "vaegttab": {
      slug: "vaegttab",
      title: "Vægttab Beregner",
      description: vaegttabDa.description,
      metaTitle: vaegttabDa.metaTitle,
      metaDescription: vaegttabDa.metaDescription,
      keywords: ["vægttab beregner", "kalorieunderskud", "tab dig", "kalorier vægttab", "sundt vægttab", "kg pr uge"],
      ogTitle: vaegttabDa.metaTitle,
      ogDescription: vaegttabDa.metaDescription,
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Vægttab Beregner",
      schemaDescription: vaegttabDa.schemaDescription,
      schemaCategory: "HealthApplication",
      faqItems: vaegttabFaqItems("da"),
    },
    "procent": {
      slug: "procent",
      title: "Procentberegner",
      description:
        "Beregn procent af et tal, rabatprocent og stigning eller fald mellem to tal.",
      metaTitle: "Procentberegner: 10 % af et tal, rabat og stigning/fald",
      metaDescription:
        "Beregn procent af et tal, rabatprocent og procentvis ændring mellem to tal. F.eks. rabatten på 1125 kr. ned fra 9000 kr.",
      keywords: ["procentberegner", "beregn procent", "procent af", "procentvis stigning", "procentvis ændring", "procentregning"],
      ogTitle: "Procentberegner: 10 % af et tal, rabat og stigning/fald",
      ogDescription:
        "Beregn procent af et tal, rabatprocent og procentvis ændring mellem to tal. F.eks. rabatten på 1125 kr. ned fra 9000 kr.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Procentberegner",
      schemaDescription: "Beregn 10 procent af et tal, procentvis stigning og fald.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg procent af et tal?", answer: "Gang tallet med X og divider med 100. Eksempel: 25 % af 200 = 50." },
      { question: "Hvordan beregner jeg procentvis stigning?", answer: "((Ny - Gammel) / Gammel) × 100. Fra 100 til 125 = 25 % stigning." },
      { question: "Hvad er procentpoint vs procent?", answer: "Procentpoint er den absolutte forskel mellem to procenttal, procent er den relative ændring. Renten fra 2 % til 3 % er 1 procentpoint, men 50 % stigning. Regn det ud med procentpointberegneren." },
      { question: "Hvad er forskellen på procentpoint og procent?", answer: procentpointForskelFaqSvar("da") },
      { question: "Hvor mange procentpoint er 1 procent?", answer: "Det afhænger af, hvad du regner fra. 2 % til 3 % er 1 procentpoint og 50 %. 20 % til 21 % er også 1 procentpoint, men kun 5 %. Der er ingen fast sats — procentpoint er altid bare de to tal minus hinanden." },
      { question: "Hvorfor stiger en rente 0,25 procentpoint hver gang?", answer: "Fordi Nationalbanken hæver den i skridt af 0,25 procentpoint. Hver hævning er 0,25 procentpoint uanset det niveau, den ligger på — men den procentvise stigning bliver mindre for hver hævning, fordi den regnes på et større tal." },
      { question: "Hvordan lægger jeg procent til?", answer: "Gang med (1 + procent/100). Læg 20 % til 150: 150 × 1,20 = 180. Regn det ud i feltet «Læg til / træk fra» ovenfor." },
      { question: "Hvordan regner man procent i Excel?", answer: `Skriv =A1/B1*100, hvis du vil have procent direkte, og =A1*B1/100, hvis du vil have X procent af et tal. Et fald fra ${PROCENT_DA.normalPris} kr til ${PROCENT_DA.nedsatPris} kr er =(B1-A1)/A1*100 = ${PROCENT_DA.forskel} %. Formater cellen som procent, hvis du ikke skriver *100.` },
      { question: "Hvordan regner man procentforskellen mellem to tal?", answer: `Forskellen er ((nyt tal - gammelt tal) / gammelt tal) × 100. Går en pris fra ${PROCENT_DA.normalPris} kr til ${PROCENT_DA.nedsatPris} kr, er faldet (${PROCENT_DA.nedsatPris} - ${PROCENT_DA.normalPris}) / ${PROCENT_DA.normalPris} = ${PROCENT_DA.forskel} %.` },
      { question: "Hvor stor er rabatten i procent?", answer: `Rabatten er (pris før rabat - pris efter rabat) / pris før rabat × 100. Er en vare på ${RABAT_DA.normalPris} kr. sat ${RABAT_DA.nedsat} kr. ned, er rabatten ${RABAT_DA.nedsat} / ${RABAT_DA.normalPris} = ${RABAT_DA.rabat} %.` },
      { question: "Hvordan regner man rabat i procent?", answer: `Det er tre trin: find forskellen mellem de to priser, del forskellen med den oprindelige pris, og gang med 100. Del med prisen FØR nedsættelsen, ikke med den du betaler — ${RABAT_DA.nedsat} kr. er ${RABAT_DA.modNy} % af den pris, men rabatten er ${RABAT_DA.rabat} %. Har du i stedet en rabatsats, er den nye pris beløb × (1 - sats ÷ 100): ${RABAT_DA.satsBelob} kr. med ${RABAT_SATS_UDLAET} % rabat koster ${RABAT_DA.satsBetaler} kr.` },
      { question: "Hvad er 10 procent af 500?", answer: "10 procent af 500 er 50, fordi du deler 500 med 10. Reglen er altid tallet delt med 10." },
      { question: "Hvad er 10 procent af 1.600?", answer: `10 procent af ${PROCENT_DA.tyveFaaHundrede} er ${PROCENT_DA.tyveFaaHundredeSvar}, fordi du deler ${PROCENT_DA.tyveFaaHundrede} med 10. Det er samme regel som 10 procent af 500 = 50.` },
      { question: "Hvorfor er 10 procent af 75 ikke et helt tal?", answer: "Fordi 75 ikke kan deles lige med 10. 10 procent af 75 er 7,5, og kommaet er korrekt — 10 procent af 80 ville være 8." },
      ],
    },
    "kvadratmeter": {
      slug: "kvadratmeter",
      title: "Kvadratmeterberegner",
      description: `Et rum på ${kvadratmeterEksempelAreal("da")}. Arealet er længde × bredde, så ${kvadratmeterEksempelProdukt("da")}. Skriv pris pr. m², og værktøjet regner prisen på dit gulv, dine fliser eller din maling.`,
      metaTitle: `Kvadratmeterberegner: ${kvadratmeterEksempelLignelse("da")}`,
      metaDescription: `Et rum på ${kvadratmeterEksempelAreal("da")}. Areal = længde × bredde. Beregn rektangel, cirkel, trekant og trapez, og sæt pris pr. m² på for gulv, fliser og maling.`,
      keywords: ["kvadratmeterberegner", "beregn kvadratmeter", "areal beregner", "m2 beregner", "beregn areal", "rum størrelse"],
      ogTitle: `Kvadratmeterberegner: ${kvadratmeterEksempelLignelse("da")}`,
      ogDescription: `${kvadratmeterEksempelAreal("da")}. Beregn areal af rektangler, cirkler, trekanter og trapez — og sæt pris på dit gulv, dine fliser eller din maling.`,
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Kvadratmeterberegner",
      schemaDescription: `Beregn kvadratmeter: ${kvadratmeterEksempelAreal("da")}. Areal af rektangel, cirkel, trekant og trapez med pris pr. m².`,
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg kvadratmeter?", answer: kvadratmeterFaqSvar("da").grundregel! },
      { question: "Hvordan regner man kvadratmeter ud?", answer: kvadratmeterFaqSvar("da").metode! },
      { question: "Hvor mange m² er et værelse på 3 x 4 meter?", answer: kvadratmeterFaqSvar("da").vaerelse! },
      { question: "Hvor meget koster 20 m² gulv?", answer: kvadratmeterFaqSvar("da").gulvpris! },
      { question: "Hvad er forskellen på m² og m?", answer: "Meter måler længde. Kvadratmeter måler areal/flade." },
      { question: "Omregning?", answer: kvadratmeterFaqSvar("da").omregning! },
      { question: "Hvad koster gulv pr. m²?", answer: kvadratmeterFaqSvar("da").materialer! },
      { question: "Hvor kommer arealet fra?", answer: "Når du slår en adresse op, henter vi boligareal, antal værelser og byggeår fra BBR (Bygnings- og Boligregistret) og grundarealet fra matriklen via Datafordeleren. For lejligheder bruges den konkrete lejligheds areal. BBR-arealet er målt til ydersiden af ydervæggene, så det er typisk lidt større end dine indvendige mål. Vi gemmer ikke adressen." },
      ],
    },
    "alder": {
      slug: "alder",
      title: "Aldersberegner",
      description: "Hvor gammel er du præcist? Født 15. marts 1990 er du {ALDER} pr. {DATO}. Indtast din fødselsdato, så tæller vi hele år, måneder og dage.",
      metaTitle: "Aldersberegner: født 15. marts 1990 = {AAR} år",
      metaDescription: "Hvor gammel er du præcist? Født 15. marts 1990 = {ALDER} pr. {DATO}. Beregn alder i år, måneder, uger og dage.",
      keywords: ["aldersberegner", "beregn alder", "hvor gammel er jeg", "præcis alder", "alder i dage", "hvor mange dage har jeg levet", "hvor mange dage har jeg været i live", "hvor gammel er jeg i dage", "stjernetegn"],
      ogTitle: "Aldersberegner: født 15. marts 1990 = {AAR} år",
      ogDescription: "Fødselsdato til i dag: alder i år, måneder, uger og dage. Eksempel: født 15. marts 1990 = {ALDER}.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Aldersberegner",
      schemaDescription: "Beregn din alder i år, måneder, uger og dage ud fra din fødselsdato.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvor gammel er jeg præcist?", answer: "Født 15. marts 1990 er du {ALDER} pr. {DATO}. Indtast din egen fødselsdato for at få alderen i år, måneder og dage." },
      { question: "Hvordan beregnes min alder?", answer: "Vi tæller hele år, måneder og dage fra din fødselsdato til i dag." },
      { question: "Hvor gammel er jeg i dage?", answer: "Alderen i dage er antallet af dage mellem fødselsdatoen og i dag. Eksempel: født 15. marts 1990 er der gået {DAGE} pr. {DATO}." },
      { question: "Stjernetegn?", answer: "Dit stjernetegn bestemmes af din fødselsdato. Der er 12 stjernetegn." },
      { question: "Hvor gammel er jeg, hvis jeg er født i 2007?", answer: "Et fødselsår giver to aldre, fordi fødselsdagen ikke altid er nået: født 1. januar 2007 er du den ældste i dit år, født 31. december den yngste. Derfor står der en alder fra og en alder til for hvert år i tabellen på siden, og dage-levet-tallet går fra {DAGE2007} pr. {DATO}." },
      { question: "Hvordan beregner jeg alder i Excel?", answer: "Med DATEDIF. Har fødselsdatoen i A1 og den dato, du vil regne til, i B1, er =DATEDIF(A1;B1;\"Y\") hele år, =DATEDIF(A1;B1;\"M\") måneder og =DATEDIF(A1;B1;\"D\") dage. Født 15. marts 1990 til {DATO} giver {AAR}, {MAANEDER_IALT} og {DAGE_TAL}. Vil du hele alderen i én celle: =DATEDIF(A1;B1;\"Y\")&\" år, \"&DATEDIF(A1;B1;\"YM\")&\" måneder og \"&DATEDIF(A1;B1;\"YD\")&\" dage\". Dansk Excel bruger semikolon." },
      { question: "Kan jeg beregne min alder ud fra CPR-nummeret?", answer: "Ja, men skriv fødselsdatoen ind som en rigtig dato først. CPR'ens seks første cifre er DDMMYY, og hos kvinder er dagen 40 tal højere — så 41. maj er 1. maj. Er der kun en fødselsdato, du regner til, sætter du B1 til =I2(), så Excel regner til dagens dato hver dag." },
      { question: "Kan jeg beregne alder mellem to datoer?", answer: "Ja. Værktøjet har to felter: fødselsdato og 'Beregn alder pr. dato'. Udfylder du begge, tæller det hele år, måneder og dage frem til den dato, du vælger — født 15. marts 1990 giver 20 år, 1 måned og 16 dage pr. 1. maj 2010." },
      { question: "Hvor gammel var jeg den 1. maj 2010?", answer: "Født 15. marts 1990 var du 20 år, 1 måned og 16 dage den 1. maj 2010. Sæt 'Beregn alder pr. dato' til den dato, du vil se alderen på." },
      { question: "Skudår?", answer: "Ja, beregneren tager højde for skudår og varierende månedslængder." },
      { question: "Hvor mange dager har jeg levet?", answer: "Født 15. marts 1990 er der gått {DAGE} pr. {DATO}. Det svarer til {UGER} hele uker og {MAANEDER} måneder, og til {TIMER} timer — 24 pr. døgn, aldrig 23 eller 25. Skriv fødselsdatoen i værktøjet, så får du dit eget tal." },
      { question: "Hvor mange dager har jeg været i live?", answer: "Det er samme spørgsmål som 'hvor mange dage har jeg levet': antallet af kalenderdage siden din fødselsdato. Født 15. marts 1990 har du været i live {DAGE} pr. {DATO}, hvilket er {TIMER} timer. Dagene tælles i kalenderdage, så et døgn hvor uret stilles en time stadig tæller som 1 dag." },
      ],
    },
    "dato": {
      slug: "dato",
      title: "Beregn antal dage mellem to datoer",
      description: "Vælg en startdato og en slutdato. Se straks antal dage, hele uger, ca. måneder, arbejdsdage, helligdage og weekenddage mellem datoerne.",
      metaTitle: "Beregn dage til 1. december: {DAGE_TIL_DEC} tilbage",
      metaDescription: "Hvor mange dage er der til en dato? Tæll antal dage mellem to datoer, ca. måneder, arbejdsdage, helligdage og heluger.",
      keywords: ["datoberegner", "antal dage mellem to datoer", "dage mellem datoer", "beregn dage", "arbejdsdage beregner", "helligdage 2026", "tilføj dage til dato", "dato kalkulator", "hvor mange dage er der til", "dage tilbage i året"],
      ogTitle: "Beregn dage til 1. december: {DAGE_TIL_DEC} tilbage",
      ogDescription: "Hvor mange dage er der til en dato? Tæll antal dage mellem to datoer, ca. måneder, arbejdsdage, helligdage og heluger.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Datoberegner",
      schemaDescription: "Beregn antal dage mellem to datoer, hele uger, ca. måneder, arbejdsdage og helligdage.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg dage mellem to datoer?", answer: "Vælg start- og slutdato. Beregneren viser dage, hele uger, ca. måneder, arbejdsdage, helligdage og weekenddage." },
      { question: "Tæller beregneren arbejdsdage korrekt?", answer: `Ja. Arbejdsdage er mandag-fredag undtagen de offentlige helligdage: ${helligdagsnavne(2026, "da")}. Nytårsaften er heller ikke en arbejdsdag. Store bededag blev afskaffet som helligdag i 2024.` },
      { question: "Hvilke helligdage bruger beregneren?", answer: `De ${getHelligdage(2026, "da").length} danske helligdage: ${helligdagsnavne(2026, "da")}. Påskedagen beregnes af den gregorianske algoritme og kan derfor ligge mellem 22. marts og 25. april, og de tre dage efter påsken — kristi himmelfartsdag, pinsedag og 2. pinsedag — følger med, så de ligger altid på hver sin faste ugedag: torsdag, søndag og mandag.` },
      { question: "Kan jeg trække dage fra?", answer: "Ja! Indtast et negativt tal for at gå tilbage i tid." },
      { question: "Skudår?", answer: "Ja, beregneren håndterer skudår korrekt." },
      { question: "Hvordan beregner jeg dage mellem to datoer i Excel?", answer: "Med =B1-A1. Har startdatoen i A1 og slutdatoen i B1, trækker formlen den korte forskel: 1. januar 2026 til 1. januar 2027 er 365 dage. =DATEDIF(A1;B1;\"d\") giver præcis det samme tal, og med \"m\" får du hele måneder (15. marts 2026 til 25. september 2026 er 194 dage og 6 hele måneder) og med \"y\" hele år. Dansk Excel bruger semikolon." },
      { question: "Kan Excel tælle dage mellem datoer?", answer: "Ja, og det er to formler: =B1-A1 er den korte, mens =DATEDIF(A1;B1;\"d\") tæller i dage, \"m\" i måneder og \"y\" i år. DATEDIF er et skjult navn, så det står ikke i formelassistenten, men virker i alle Excel-versioner. Vil du have arbejdsdage og helligdage med, gør datoberegneren det samme." },
      { question: "Hvor mange dage er der i en måned?", answer: "Mellem 28 og 31 dage. Februar er kortest med 28 dage (29 i skudår), og januar, marts, maj, juli, august, oktober og december har alle 31. En måned har i gennemsnit 30,44 dage, fordi et år gennemsnitligt har 365,2425 dage fordelt på 12 måneder." },
      { question: "Hvordan tæller jeg dage i en måned i Excel?", answer: "Sæt månedens første dag i A1 og første dag i næste måned i B1, så giver =B1-A1 månedens længde: 1. februar 2026 til 1. marts 2026 er 28 dage. Skriv ikke månedens sidste dag — giver du B1 = 28. februar, får du 27, fordi Excel tæller forskellen i hele døgn. =DATEDIF(A1;B1;\"d\") giver samme tal." },
      { question: "Hvor mange dage er der i et år?", answer: "365 dage, eller 366 i et skudår — et år er skudår hvis det er deleligt med 4, med undtagelse af de hundredeårhundreder der ikke er delelige med 400. 365 dage er 52,1 uger, så et kalenderår er altid lidt mere end 52 uger." },
      { question: "Hvor mange arbejdsdage er der i en måned?", answer: "Det afhænger af måneden og af hvilke helligdage der falder i den. En måned med 31 dage har typisk 21 eller 23 arbejdsdage, og en måned med 30 dage typisk 20 eller 21. Tabellen ovenfor viser det præcise tal for hver måned, og hele årets sum står under den." },
      { question: "Hvor mange dage er der fra påske til pinse?", answer: PINSE_FRA_PAASKE_DA },
      { question: "Hvor mange dage er der i pinsen?", answer: PINSE_PERIODE_DA_TEKST },
      ],
    },
    "pace": {
      slug: "pace",
      title: "Løbetidsberegner - beregn tempo og holdtider",
      description: "Beregn tempo i minutter pr. kilometer, løbetid ud fra tempo og holdtider for hver kilometer. Til løb, cykling og triatlon.",
      metaTitle: "Løbetidsberegner: 5 km på 25 min = 5:00 pr. km",
      metaDescription: "Gratis løbetidsberegner. Beregn tempo pr. kilometer, løbetid ud fra tempo og holdtider for hver kilometer. 5 km på 25 min er 5:00 pr. km.",
      keywords: ["løbetidsberegner", "pace beregner", "pace tid beregner", "km tid beregner", "marathon tid beregner", "halvmarathon tid beregner", "ironman tid beregner", "triathlon tid beregner", "cykel tid beregner", "tempo pr kilometer", "holdtider"],
      ogTitle: "Løbetidsberegner: 5 km på 25 min = 5:00 pr. km",
      ogDescription: "Beregn tempo pr. kilometer, løbetid ud fra tempo og holdtider for hver kilometer.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Løbetidsberegner",
      schemaDescription: "Beregn tempo i minutter pr. kilometer, løbetid ud fra tempo og holdtider for hver kilometer.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg tempo på en distance?", answer: "Del løbetiden med distancen. 5 km på 25 minutter er 25 divideret med 5 = 5 minutter pr. kilometer, altså 5:00 pr. km. Samme regel for alle distancer." },
      { question: "Hvordan regner jeg løbetiden ud fra tempoet?", answer: "Gang distancen med tempoet. 5 km ved 5:00 pr. kilometer er 5 gange 5:00 = 25 minutter. Vælg 'Løbetid fra tempo' i værktøjet, så får du holdtiderne for hver kilometer." },
      { question: "Hvad er et godt tempo for en halvmaraton?", answer: distanceEksempelFaqSvar("halvmaraton", "da") + " Hvad der er godt for dig, afhænger af din træning og din målsætning." },
      { question: "Hvad er et godt tempo for en marathon?", answer: distanceEksempelFaqSvar("maraton", "da") + " Hvad der er godt for dig, afhænger af din træning og din målsætning." },
      { question: "Hvad er et godt tempo på 10 km?", answer: distanceEksempelFaqSvar("tiaaenkilometer", "da") + " Hvad der er godt for dig, afhænger af din træning og din målsætning." },
      { question: "Hvad er holdtider, og hvorfor summerer de ikke helt?", answer: "Holdtider er den tid hver kilometer tager. Værktøjet lægger afrundingen i den sidste kilometer, så holdtiderne summerer til præcis den løbetid, du har indtastet." },
      { question: "Kan jeg bruge værktøjet til cykling og triatlon?", answer: "Ja. Værktøjet regner i minutter pr. kilometer, så samme tempo kan bruges til løb, cykling, kajak og rulletræning." },
      { question: "Hvor lang tid tager et Ironman?", answer: triatlonTotalFaqSvar("da") },
      { question: "Hvor stor en del af et Ironman er cyklen?", answer: triatlonCykelAndelFaqSvar("da") },
      ],
    },
    "tidsberegner": {
      slug: "tidsberegner",
      title: "Tidsberegner",
      description: "Beregn hvor lang tid der går mellem to klokkeslæt – i timer, minutter og decimaltimer. Træk en pause fra.",
      metaTitle: "Tidsberegner: 08:30 til 16:45 = 8 t 15 min. Mellem datoer",
      metaDescription: "Beregn tid mellem to klokkeslæt eller to datoer. 08:30 til 16:45 er 8 timer og 15 minutter. Se dage, arbejdsdage, sekunder og decimaltimer.",
      keywords: ["tidsberegner", "timer mellem tidspunkter", "arbejdstid beregner", "tid beregner", "timer og minutter", "timeregistrering"],
      ogTitle: "Tidsberegner: 08:30 til 16:45 = 8 t 15 min. Mellem datoer",
      ogDescription: "Beregn tid mellem to klokkeslæt eller to datoer. 08:30 til 16:45 er 8 timer og 15 minutter. Se dage, arbejdsdage, sekunder og decimaltimer.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Tidsberegner",
      schemaDescription: "Gratis tidsberegner. Beregn tidsrum mellem to klokkeslæt eller mellem to datoer, og se resultatet i timer, minutter, dage, arbejdsdage og decimaltimer.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvor lang tid er der mellem to klokkeslæt?", answer: "Sæt start- og sluttidspunkt i feltet ovenfor. 08:30 til 16:45 er 8 timer og 15 minutter. Er sluttidspunktet tidligere end starttidspunktet, regner beregneren automatisk dagen efter, så 22:00 til 06:00 er 8 timer." },
      { question: "Hvad er 08:30 til 16:45 i timer og minutter?", answer: "8 timer og 15 minutter. Det er netop det eksempel, der står i beskrivelsen af denne side, og det står i tabellen ovenfor." },
      { question: "Hvordan beregner jeg arbejdstid?", answer: "Indtast mødetidspunkt og fyraftenstid, og træk en frokostpause fra. En arbejdsdag fra 08:00 til 16:00 er 8 timer, mens 09:00 til 17:00 med 30 minutters pause er 7 timer og 30 minutter." },
      { question: "Kan jeg trække en pause fra?", answer: "Ja. Angiv pausen i minutter under 'Fratræk pause', så trækkes den fra, før timer, minutter og decimaltimer vises." },
      { question: "Hvad er decimal timer?", answer: "1,5 timer = 1 time og 30 minutter. Bruges til timeregistrering. 08:30 til 16:45 er 8,25 timer." },
      { question: "Tid over midnat?", answer: "Ja, beregneren håndterer tid over midnat automatisk. 22:00 til 06:00 er 8 timer og 0 minutter." },
      { question: "Hvordan beregner jeg tid mellem to klokkeslæt i Excel?", answer: "Sæt starttidspunktet i A1 og sluttidspunktet i B1 som rigtige klokkeslæt. =B1-A1 giver 08:30 til 16:45 som 8 timer og 15 minutter, =(B1-A1)*24 giver 8,25 decimaltimer, og =(B1-A1)*24*60 giver 495 minutter. Dansk Excel bruger semikolon som skilletegn." },
      { question: "Hvorfor får jeg et negativt tal i Excel?", answer: "Fordi Excel trækker sluttiden fra starttiden uden at vide, at nattetimen slutter næste dag. 22:00 til 06:00 giver derfor -0,67 døgn. Brug =MOD(B1-A1;1)*24, så tager den de 24 timer med igen og viser 8 timer — præcis som beregneren gør." },
      { question: "Hvordan beregner jeg tempo i minutter pr. kilometer?", answer: "Del løbetiden i minutter med distancen i kilometer. 5 km på 25 minutter giver 25 ÷ 5 = 5:00 pr. kilometer, og en halvmarathon på 1 time og 45 minutter giver 4:59 pr. kilometer." },
      { question: "Hvad er et godt tempo for et maraton?", answer: "Det afhænger af tiden: 3 timer og 30 minutter på 42,2 km er 4:59 pr. kilometer. Vil du i stedet finde distancen, deler du tiden med tempoet, så 2 timer ved 5:00 pr. kilometer bliver 24 km." },
      { question: "Hvordan regner man minutter om til timer?", answer: "Del minutter med 60. 90 minutter ÷ 60 = 1,50 timer, altså 1 time og 30 minutter. Den anden vej er timer × 60 = minutter, så 7,5 timer × 60 = 450 minutter." },
      { question: "Hvor mange timer er der i et år?", answer: timerIPeriodeFaqSvar("aar", "da") },
      { question: "Hvor mange timer er der i en uge?", answer: timerIPeriodeFaqSvar("uge", "da") },
      { question: "Hvad er 300 minutter i timer?", answer: "300 minutter ÷ 60 = 5,00 timer, altså 5 timer og 0 minutter. 1000 minutter er 16 timer og 40 minutter, og 1500 minutter er 25 timer." },
      { question: "Hvad er 1 time og 30 minutter i decimaltimer?", answer: "1 time og 30 minutter er 90 minutter, og 90 ÷ 60 = 1,50 decimaltimer. Samme regel som værktøjet bruger: minutter ÷ 60 = timer." },
      { question: "Hvordan lægger jeg to tidsrum sammen?", answer: "Læg minutterne sammen og del med 60 igen. 8 timer og 15 minutter + 5 timer og 15 minutter er 495 + 315 = 810 minutter, og 810 ÷ 60 = 13,50 timer, altså 13 timer og 30 minutter. I Excel er det =(B1-A1)*24+(D1-C1)*24, og en pause trækkes fra i timer med -(E1+E2), fordi =(B1-A1)*24 ikke kender en frokostpause." },
      { question: "Hvorfor bliver summen forkert når jeg har en pause?", answer: "En pause skal trækkes fra FØR de to tidsrum lægges sammen. En pause på 90 minutter er mere end én time, så 09:00-17:00 med 90 minutters pause er 390 minutter — ikke 480. Trækker du den fra efter summeringen får du enten et negativt tal eller dobbelt så mange minutter." },
      ],
    },
    "tidszone": {
      slug: "tidszone",
      title: "Tidszoneberegner",
      description: "Omregn tid mellem tidszoner og se hvad klokken er i andre lande.",
      metaTitle: "Tidszoner: 12 i Danmark = 06 i New York, USA",
      metaDescription: "Når det er 12 i Danmark, er det 06 i New York og 03 i Los Angeles. Se tidsforskel til 25 byer og omregn tid mellem tidszoner.",
      keywords: ["tidszoneberegner", "tidszone omregner", "hvad er klokken i", "tidsforskel", "konverter tid", "world clock", "hvad er klokken i usa når den er 21 i danmark", "hvad er klokken i usa når den er 14 i danmark", "hvad er klokken i usa når den er 16 i danmark", "hvad er klokken i usa miami", "hvad er klokken i usa florida", "klokken i usa california", "klokken i usa boston", "hvad er klokken i colorado usa", "hvad er klokken i usa texas", "hvad er klokken i arizona usa"],
      ogTitle: "Tidszoner: 12 i Danmark = 06 i New York, USA",
      ogDescription: "Tidsforskel til 25 byer plus gratis omregning mellem alle tidszoner.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Tidszoneberegner",
      schemaDescription: "Gratis tidszoneberegner. Omregn tid mellem tidszoner.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Tidsforskel Danmark-USA?", answer: "New York: -6 timer. Los Angeles: -9 timer." },
      { question: "Sommertid i Danmark?", answer: "Sidste søndag i marts til sidste søndag i oktober. UTC+2 sommer, UTC+1 vinter." },
      { question: "Hvad er UTC?", answer: "Coordinated Universal Time - den internationale tidsstandard." },
      { question: "Internationale møder?", answer: "Find et tidspunkt der passer i alle tidszoner." },
      { question: "Hvad er klokken i Thailand, Tyrkiet, Canada og Spanien, når det er 12 i Danmark?", answer: "I dansk sommertid er det 17 i Bangkok, 13 i Istanbul og 06 i Toronto, mens Madrid følger Danmark og også viser 12. I vintertid er det 18, 14 og 06. Tabellen viser alle 25 byer for både dansk vinter- og sommertid." },
      { question: "Hvorfor er der forskel på tidsforskellen om sommeren?", answer: "Byer der skifter samtidig med Danmark, fx Madrid, har altid samme klokkeslæt. Byer der ikke bruger sommertid, fx Bangkok, ligger en time tidligere, når Danmark har somertid." },
      { question: "Hvad er tidsforskellen til Japan, Thailand og Tyrkiet?", answer: "Japan er 7 timer frem, Thailand 6 timer frem og Tyrkiet 2 timer frem i dansk sommertid. I vintertid er det 8, 7 og 3 timer. Tabellen med de ti lande viser både vinter- og sommertid." },
      { question: "Hvad er klokken i USA, når det er 21 i Danmark?", answer: "15 i New York, 14 i Chicago og 12 i Los Angeles. USA ligger 6, 7 og 9 timer bagud Danmark på 337 af årets 365 dage. USA skifter anden søndag i marts og første søndag i november, mens Danmark skifter sidste søndag i marts og sidste søndag i oktober, så i de 28 dage hvor USA står på sommertid mens Danmark står på vintertid, ligger byerne en time tættere på. Tabellen viser klokken i USA for alle fire tidspunkter." },
      { question: "Hvordan regner jeg tidsforskel ud i Excel?", answer: "Sæt tiderne i to celler og brug =B1-A1, eller =(B1-A1)*24 hvis cellerne ikke er formateret som Tid. Hvis sluttidspunktet er tidligere på døgnet end starttidspunktet, lægger du =B1-A1+(B1&lt;A1) til, så et skifte over midnat ikke giver et negativt svar." },
      { question: "Hvad er klokken i Florida, Texas og Californien, når det er 12 i Danmark?", answer: "Florida er 06, Texas 05 og Californien 03, fordi Florida ligger i Eastern Time som New York, mens Texas ligger i Central Time som Chicago og Californien i Pacific Time som Los Angeles. USA har fire tidszoner: Eastern 6 timer bagud, Central 7, Mountain 8 og Pacific 9." },
      { question: "Hvorfor ligger Phoenix en time bagud Denver om sommeren?", answer: "Phoenix ligger i Mountain Time som Denver, men Arizona undtaget fra sommertid siden 1967. Når Danmark går på sommertid flytter Denver sig med og står på 04 hele året, mens Phoenix står på 04 vinter og 03 sommer. Det er den eneste af de ni stater i tabellen, hvor de to kolonner ikke er ens." },
      ],
    },
    "afstand-mellem-adresser": {
      slug: "afstand-mellem-adresser",
      title: "Afstand mellem to adresser",
      description: "Find kørselsafstanden mellem to danske adresser i km.",
      metaTitle: "Afstandsberegner: beregn kørselsafstand mellem to adresser",
      metaDescription:
        "Beregn afstanden mellem to danske adresser. Værktøjet finder den korteste bilrute, viser færge og betalingsbro og giver tur/retur og årlig kørsel.",
      keywords: [
        "afstand mellem to adresser",
        "beregn afstand mellem adresser",
        "kørselsafstand beregner",
        "afstand beregner adresse",
        "hvor langt er der mellem",
      ],
      ogTitle: "Afstand mellem to adresser",
      ogDescription: "Find kørselsafstanden mellem to danske adresser i km.",
      category: "Praktisk",
      breadcrumbCategory: "Praktisk",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Afstandsberegner",
      schemaDescription: "Beregn kørselsafstanden mellem to danske adresser.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        {
          question: "Hvordan beregnes afstanden?",
          answer: `Vi spørger en kortberegner om den korteste bilrute mellem de to adresser. Adresserne slås op hos Adressevælger fra Klimadatastyrelsen, og ruten hentes fra en OpenStreetMap-baseret ruteberegner. Vi gemmer hverken dine adresser. ${ruteCacheSætning()}`,
        },
        {
          question: "Hvorfor får jeg to afstande, når ruten krydser en færge?",
          answer: "Så findes der to veje: den korte uden færge og den med færge. Værktøjet viser dem begge, fordi en bil uden bil på trailer ikke kan vælge frit. Vælg den med færge, hvis du faktisk skal sejles.",
        },
        {
          question: "Kan jeg bruge afstanden til kørselsfradraget?",
          answer: "Ja. Kørselsfradrag-beregneren bruger præcis samme afstand, så du kan lægge den videre ind i dit fradrag. Skat bruger den normale transportvej, så vælg den kortere rute, hvis din vej ikke kræver en færge.",
        },
      ],
    },
    "rejsebudget": {
      slug: "rejsebudget",
      title: "Rejsebudget Beregner",
      description: "Beregn dit rejsebudget til populære destinationer.",
      metaTitle: "Rejsebudget Beregner - Hvad koster en ferie?",
      metaDescription: "Beregn dit rejsebudget til populære destinationer. Se estimerede udgifter til fly, hotel, mad og oplevelser. Gratis rejsebudget beregner.",
      keywords: ["rejsebudget beregner", "hvad koster en ferie", "ferie budget", "rejse pris", "feriebudget", "rejseudgifter"],
      ogTitle: "Rejsebudget Beregner",
      ogDescription: "Beregn dit samlede rejsebudget med fly, hotel, mad og oplevelser.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Rejsebudget Beregner",
      schemaDescription: "Gratis rejsebudget beregner.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad koster en uges ferie i Sydeuropa?", answer: "Typisk 5.000-8.000 DKK pr. person for en standardrejse." },
      { question: "Hvornår er det billigst at rejse?", answer: "Lavsæson: januar-marts og november for Sydeuropa." },
      { question: "Rejseforsikring?", answer: "Ja, altid. Det blå EU-sygesikringskort dækker kun offentlig behandling i EU." },
      { question: "Spare på rejsebudgettet?", answer: "Book i god tid, vær fleksibel med datoer, spis lokalt." },
      ],
    },
    "bryllup": {
      slug: "bryllup",
      title: "Bryllupsbudget Beregner",
      description: "Beregn dit bryllupsbudget. Se udgifter til venue, mad, fotograf.",
      metaTitle: "Bryllupsbudget Beregner - Hvad koster et bryllup?",
      metaDescription: "Beregn dit bryllupsbudget. Se udgifter til venue, mad, fotograf, musik, kjole og ringe. Gennemsnitlige danske bryllupspriser 2026.",
      keywords: ["bryllupsbudget", "hvad koster et bryllup", "bryllup pris", "bryllup beregner", "bryllup udgifter"],
      ogTitle: "Bryllupsbudget Beregner",
      ogDescription: "Beregn dit samlede bryllupsbudget.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bryllupsbudget Beregner",
      schemaDescription: "Gratis bryllupsbudget beregner.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad koster et bryllup i Danmark?", answer: "80.000-150.000 DKK med 80-100 gæster." },
      { question: "Største udgiftspost?", answer: "Mad og drikke: 40-50 % af budgettet." },
      { question: "Billigst at holde bryllup?", answer: "November-marts er 20-30 % billigere." },
      { question: "Spare på budgettet?", answer: "Buffet, DIY-dekoration, DJ i stedet for band." },
      ],
    },
    "konfirmation": {
      slug: "konfirmation",
      title: "Konfirmationsbudget Beregner",
      description: "Beregn dit budget til konfirmation.",
      metaTitle: "Konfirmationsbudget Beregner - Hvad koster en konfirmation?",
      metaDescription: "Beregn dit budget til konfirmation. Se udgifter til mad, lokale, tøj og fotograf. Beregn forventede gavebeløb fra familie og venner.",
      keywords: ["konfirmation budget", "konfirmation pris", "hvad koster en konfirmation", "konfirmationsgave beløb", "konfirmation beregner"],
      ogTitle: "Konfirmationsbudget Beregner",
      ogDescription: "Beregn dit samlede budget for konfirmation.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Konfirmationsbudget Beregner",
      schemaDescription: "Gratis konfirmationsbudget beregner.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad koster en konfirmation?", answer: konfirmationFaqSvar("da").koster },
      { question: "Gavebeløb?", answer: konfirmationFaqSvar("da").gavebelob },
      { question: "Hvornår er konfirmation?", answer: "Typisk april-maj i Danmark." },
      { question: "Spare på festen?", answer: "Hold festen hjemme, lav maden selv." },
      ],
    },
    "braendstof": {
      slug: "braendstof",
      title: "Brændstofberegner",
      description: "500 km benzin koster 450 kr. Ved 15 km/l bruger du 33,3 liter, og 33,3 l × 13,50 kr. = 450 kr. — 0,90 kr. pr. km. Beregn pris, forbrug og årlig omkostning for benzin, diesel og el.",
      metaTitle: "Brændstofberegner: 500 km benzin koster 450 kr.",
      metaDescription: "500 km benzin koster 450 kr. ved 15 km/l og 13,50 kr./l — 0,90 kr. pr. km. Beregn pris, forbrug og årlig omkostning for benzin, diesel og el.",
      keywords: ["brændstofberegner", "benzin beregner", "diesel beregner", "el bil beregner", "pris pr km", "brændstofforbrug"],
      ogTitle: "Brændstofberegner: 500 km benzin koster 450 kr.",
      ogDescription: "500 km benzin koster 450 kr. — 0,90 kr. pr. km. Beregn pris, forbrug og årlig omkostning for benzin, diesel og el.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Brændstofberegner",
      schemaDescription: "Beregn pris for benzin, diesel og el: 500 km benzin koster 450 kr. ved 15 km/l og 13,50 kr./l.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvad koster 500 km i benzin?", answer: "Ved 15 km/l bruger turen 500 ÷ 15 = 33,3 liter. 33,3 l × 13,50 kr. = 450 kr., altså 0,90 kr. pr. km eller 90 kr. pr. 100 km." },
      { question: "Beregn brændstofudgifter?", answer: "Distance / km/l × literpris. 200 km / 15 km/l × 13 DKK/l = 173 DKK." },
      { question: "Normal km/liter?", answer: "Benzin: 12-18 km/l. Diesel: 15-22 km/l." },
      { question: "Hvordan regner man benzinforbrug ud?", answer: `Distance delt med km/l. ${braendstofEksempelKm} km ÷ 15 km/l = ${braendstofEksempelBenzin} liter, og ${braendstofEksempelBenzin} l × 13,50 kr. = ${braendstofEksempelBenzinPris} kr. Har du kun l/100 km fra tankinstrumentet, er det 100 divideret med l/100 km: 15 km/l = ${braendstofBenzinPr100} l/100 km.` },
      { question: "Hvor meget benzin bruger en bil?", answer: `Et typisk dansk benzinbil kører 12-18 km/l, altså ${braendstofBenzinLavPr100}-${braendstofBenzinHoejPr100} l/100 km på tankinstrumentet. Find dit eget med fire fulde tankfyld: liter påfyldt delt med km kørt er dit km/l — 40 liter over 380 km er 380 ÷ 40 = ${braendstofEgetKmPrLiter} km/l.` },
      { question: "Er el-biler billigere?", answer: `Ja, når du regner på brændstoffet alene: ${pct(elModBenzinPct)} % billigere pr. km end benzin (${krPrKm(elPris, 2)} mod ${krPrKm(benzinPris, 2)}). Mod diesel er besparelsen ${pct(elModDieselPct)} %, fordi diesel i forvejen er billigere pr. km (${krPrKm(dieselPris, 2)}). Beregningen bruger 13,50 kr./l benzin, 12,80 kr./l diesel og 2,50 kr./kWh el — altså billig el. Ved offentlig opladning til 3-6 kr./kWh bliver el dyrere end diesel over ${pct(elModDieselBreakEven)} kr./kWh.` },
      { question: "Hvad påvirker forbruget?", answer: "Kørestil, hastighed, vejr, dæktryk, aircondition." },
      { question: "Hvorfor er diesel dyrere end benzin?", answer: `Fordi spørgsmålet kan betyde to ting. Pr. liter ligger diesel højere, da energi- og CO2-afgiften er højere pr. liter for diesel end for benzin. Pr. kilometer er det næsten altid benzin, der er dyrest, fordi diesel kører 15-22 km/l mod benzins 12-18 km/l, så det lavere forbrug mere end udligner forskellen. ${braendstofEksempelKm} km med forudsætningerne i værktøjet: benzin ${braendstofEksempelBenzin} l × 13,50 kr. = ${braendstofEksempelBenzinPris} kr. (${krPrKm(benzinPris, 2)}), diesel ${braendstofEksempelDiesel} l × 12,80 kr. = ${braendstofEksempelDieselPris} kr. (${krPrKm(dieselPris, 2)}) — altså ${braendstofDieselBilligere} kr. mindre for diesel.` },
      { question: "Hvad koster diesel pr. kilometer?", answer: `Med 18 km/l og 12,80 kr./l er det 12,80 ÷ 18 = ${krPrKm(dieselPris, 2)}, mens benzin med 15 km/l og 13,50 kr./l er 13,50 ÷ 15 = ${krPrKm(benzinPris, 2)}. Priserne er modelpriser, så skriv dagens pris fra pumperen og dit eget forbrug ind i værktøjet.` },
      ],
    },
    "brokost": {
      slug: "brokost",
      title: "Brokostberegner",
      description: "Beregn hvad det koster at krydse Storebæltsbroen eller Øresundsbroen — eksprespris, kortpris, onlinebillet, ØresundGO og fritidsrabatter.",
      metaTitle: "Brokost: Storebælt 205 kr. og Øresund fra 182 kr.",
      metaDescription: "Bropriser 2026 for Storebælt og Øresund. Personbil 3-6 m: 205 kr. over Storebælt og 182 kr. over Øresund med ØresundGO. Beregn turen og årsforbruget.",
      keywords: ["brokost storebælt", "storebælt pris bil", "brokostberegner", "storebælt 2026", "pris for at krydse storebælt", "aftenrabat storebælt", "weekendrabat storebælt", "storebælt med trailer", "øresundsbroen pris", "øresundsbroen pris 2026", "hvad koster øresundsbroen", "øresundgo pris", "broafgift øresund"],
      ogTitle: "Brokost: Storebælt 205 kr. og Øresund fra 182 kr.",
      ogDescription: "Beregn hvad det koster at krydse Storebæltsbroen og Øresundsbroen, med betalingsformer, rabatter og årsforbrug.",
      category: "Praktisk",
      breadcrumbCategory: "Praktisk",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Brokostberegner",
      schemaDescription: "Gratis brokostberegner. Se prislisten for 2026 for Storebælt og Øresund for bil, varebil, autocamper og motorcykel, og beregn årsforbruget.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvor meget koster det at køre over Storebælt?", answer: `En personbil 3-6 m koster ${BROKOST_START_KR} kr. for én tur med eksprespris, altså Bizz eller nummerpladebetaling i en grøn ekspresbane. Betaler du med kort eller kontanter, koster samme tur ${BROKOST_KORT_KR} kr.` },
      { question: "Hvor meget koster det at køre over Storebælt tur/retur?", answer: `En personbil 3-6 m koster ${BROKOST_START_KR} kr. hver vej, altså ${BROKOST_RETUR_KR} kr. for tur og retur med eksprespris. Med aftenrabat bliver tur og retur ${BROKOST_AFTEN_KR} kr.` },
      { question: "Hvad er forskellen på eksprespris og kortpris?", answer: `Ekspresprisen kræver et automatisk betalingsmiddel. For en personbil 3-6 m er forskellen ${BROKOST_FORSKEL_KR} kr. pr. overfart, så betaler du med kort i de blå og gule baner, er turen dyrere.` },
      { question: "Hvad er en weekendrabat?", answer: `Weekendrabatten er ${BROKOST_WEEKEND_KR} kr. for tur og retur og gælder fra fredag kl. 12 til søndag kl. 24. Den kræver en Storebælt Privataftale og et køretøj under 6 m.` },
      { question: "Hvad koster en bil med anhænger over Storebælt?", answer: `En personbil med anhænger over 6 m totallængde koster ${BROKOST_ANHAENGER_KR} kr. med eksprespris. Anhængere over 6 m kan ikke bruge fritidsbilletterne, fordi betalingsanlægget måler hele køretøjets længde.` },
      { question: "Hvad koster det at køre over Storebælt med en autocamper?", answer: `En autocamper op til 10 m koster ${BROKOST_CAMPER_KR} kr. med eksprespris, mens en autocamper under 3.500 kg og op til 6 m kun koster ${BROKOST_START_KR} kr. En autocamper under 3.500 kg og over 6 m med autocamperaftale koster ${BROKOST_CAMPERAFTALE_KR} kr., men kun med betalingsmiddel.` },
      { question: "Hvad koster det at køre over Øresundsbroen?", answer: `En personbil på max 6 m koster ${ORESUND_START_GO_KR} kr. for én overfart med ØresundGO, ${ORESUND_START_ONLINE_KR} kr. som onlinebillet og ${ORESUND_START_NORMAL_KR} kr. i betalingsanlægget. Priserne er i danske kroner inklusive moms.` },
      { question: "Hvad koster ØresundGO?", answer: `ØresundGO er en rabataftale med en årsafgift på ${ORESUND_GO_AARSAFGIFT_KR} kr., der giver den laveste pris pr. overfart. For en personbil på max 6 m er årsafgiften tjent ind allerede på den første tur tur/retur, fordi hver overfart bliver billigere.` },
      { question: "Hvad koster det at køre over Øresundsbroen tur/retur?", answer: `En personbil på max 6 m koster ${ORESUND_START_NORMAL_KR} kr. tur/retur til normalpris i betalingsanlægget. Med ØresundGO koster ${ORESUND_START_TURE} ture tur/retur ${ORESUND_START_AAR_GO_KR} kr. om året mod ${ORESUND_START_AAR_NORMAL_KR} kr. til normalpris.` },
      ],
    },
    "bil": {
      slug: "bil",
      title: "Bilomkostningsberegner",
      description: "Beregn hvad det reelt koster at eje og køre bil.",
      metaTitle: "Bilomkostningsberegner - Se hvad din bil koster",
      metaDescription: "Se hvad din bil reelt koster. Typisk: 2,50-4,50 kr/km inkl. værditab, brændstof, forsikring og afgifter. Gratis beregner 2026.",
      keywords: ["bil beregner", "bilomkostninger", "biludgifter", "elbil vs benzin", "bil pris pr km", "værditab bil"],
      ogTitle: "Bilomkostningsberegner",
      ogDescription: "Gratis bilberegner. Beregn de reelle omkostninger ved at eje bil.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bilomkostningsberegner",
      schemaDescription: "Gratis bilberegner. Beregn bilomkostninger.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad koster det at eje bil?", answer: "Typisk 2,50-4,50 DKK/km. For 15.000 km/år = ca. 4.000-6.000 DKK/md." },
      { question: "Største udgift?", answer: "Værditab: en ny bil mister 20-25 % det første år." },
      { question: "Elbil billigere?", answer: "Lavere drift, men højere købspris. Over tid ofte billigere." },
      { question: "Pris per km?", answer: "Saml alle årlige udgifter og divider med kørte km." },
      ],
    },
    "valuta": {
      slug: "valuta",
      title: "Valutaberegner",
      description: "Omregn mellem DKK, EUR, USD, GBP, SEK, NOK og mange flere.",
      metaTitle: "Valutaberegner - Omregn valuta online",
      metaDescription: "Gratis valutaberegner. Omregn mellem DKK, EUR, USD, GBP, SEK, NOK og mange flere valutaer. Se aktuelle vejledende kurser.",
      keywords: ["valutaberegner", "valuta omregner", "omregn valuta", "dkk til euro", "dollar til kroner", "valutakurs", "veksle penge"],
      ogTitle: "Valutaberegner - Omregn valuta online",
      ogDescription: "Omregn mellem danske kroner og andre valutaer.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Valutaberegner",
      schemaDescription: "Gratis valutaberegner. Omregn valuta.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "DKK til EUR?", answer: "DKK er bundet til EUR via ERM2. Ca. 7,44-7,47 DKK pr. EUR." },
      { question: "Hvorfor svinger kurser?", answer: "Renteniveauer, inflation, handelsbalancer og politisk stabilitet." },
      { question: "Hvor veksle?", answer: "Banker, vekselkontorer, lufthavne. Wise tilbyder ofte bedre kurser." },
      { question: "Købs- vs salgskurs?", answer: "Banken køber billigere og sælger dyrere. Forskellen = spread." },
      { question: "Hvor kommer kurserne fra?", answer: "Vi bruger Danmarks Nationalbanks officielle valutakurser, som offentliggøres hver bankdag omkring kl. 16. Datoen for kurserne står over beregneren. Svarer Nationalbanken ikke, bruger vi Den Europæiske Centralbanks kurser (ECB) i stedet." },
      ],
    },
    "renteberegner": {
      slug: "renteberegner",
      title: "Renteberegner",
      description: `${formatBelob(renteHoved.hovedstol, "da")} kr. i ${renteHoved.loebetid} år til ${renteHoved.aarsrente} % rente koster ${formatBelob(renteHoved.maanedligBetalning, "da")} kr. om måneden i et annuitetslån. Samlet rente: ${formatBelob(renteHoved.samletRante, "da")} kr.`,
      metaTitle: `Renteberegner: ${formatBelob(renteHoved.hovedstol, "da")} kr. i ${renteHoved.loebetid} år = ${formatBelob(renteHoved.maanedligBetalning, "da")} kr./md.`,
      metaDescription: `Annuitetslån på ${formatBelob(renteHoved.hovedstol, "da")} kr. med ${renteHoved.aarsrente} % rente i ${renteHoved.loebetid} år: ${formatBelob(renteHoved.maanedligBetalning, "da")} kr. i måneden og ${formatBelob(renteHoved.samletRante, "da")} kr. i samlet rente. Beregn også serielån.`,
      keywords: ["renteberegner", "lånberegner", "beregn lån", "månedlig ydelse", "annuitetslån", "rente beregning"],
      ogTitle: `Renteberegner: ${formatBelob(renteHoved.hovedstol, "da")} kr. i ${renteHoved.loebetid} år = ${formatBelob(renteHoved.maanedligBetalning, "da")} kr./md.`,
      ogDescription: `${formatBelob(renteHoved.hovedstol, "da")} kr. i ${renteHoved.loebetid} år til ${renteHoved.aarsrente} %: ${formatBelob(renteHoved.maanedligBetalning, "da")} kr. i måneden og ${formatBelob(renteHoved.samletRante, "da")} kr. i samlet rente.`,
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Renteberegner",
      schemaDescription: "Beregn månedsydelse og samlet rente på et annuitetslån eller serielån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Annuitetslån vs serielån?", answer: "Annuitetslån: fast ydelse. Serielån: fast afdrag, faldende ydelse." },
      { question: `Hvad er ydelsen på ${formatBelob(renteHoved.hovedstol, "da")} kr. med ${renteHoved.aarsrente} % rente i ${renteHoved.loebetid} år?`, answer: `Ca. ${formatBelob(renteHoved.maanedligBetalning, "da")} kr. om måneden i et annuitetslån, i alt ${formatBelob(renteHoved.samletRante, "da")} kr. i rente over de ${Math.round(renteHoved.antalMaaneder)} terminer.` },
      { question: "ÅOP?", answer: "Årlige Omkostninger i Procent inkl. alle gebyrer." },
      { question: "Fradrag?", answer: "Se vores rentefradragsberegner for den aktuelle fradragsværdi." },
      { question: "Hvilken formel beregner et annuitetslån, og hvordan gør man det i Excel?", answer: `Ydelsen er P × r ÷ (1 − (1 + r)^-n), hvor r er den månedlige rente og n antal måneder. Et lån på ${formatBelob(renteFormel.hovedstol, "da")} kr. til ${renteFormel.aarsrente} % i ${renteFormel.loebetid} år giver ${formatBelob(renteFormel.maanedligBetalning, "da", 2)} kr. pr. måned. I Excel er det =YDELSE(${formatBelob(renteFormel.aarsrente / 100, "da", 2)}/12;${Math.round(renteFormel.antalMaaneder)};-${renteFormel.hovedstol}) — lånebeløbet skal ind som et negativt tal.` },
      { question: "Hvad er forskellen på nominel og effektiv rente?", answer: "Den nominelle rente er den, banken oplyser, fx 4 % om året. Den effektive rente regner også med månedlig tilskrivning, så 4 % nominelt er 4,07 % effektivt. Omvendt er 1 % pr. måned 12,68 % om året. Sammenlign altid lån på den effektive rente." },
      ],
    },
    "opsparing": {
      slug: "opsparing",
      title: "Opsparingsberegner",
      description: "Se hvad din opsparing vokser til med renters rente.",
      metaTitle: "Opsparingsberegner - Renters rente beregner",
      metaDescription: "Se hvad din opsparing vokser til. Eksempel: 1.000 kr/md i 30 år med 5 % rente = 830.000 kr. Gratis beregner.",
      keywords: ["opsparingsberegner", "renters rente", "beregn opsparing", "compound interest", "investering beregner"],
      ogTitle: "Opsparingsberegner - Renters rente beregner",
      ogDescription: "Beregn hvad din opsparing vokser til med renters rente.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Opsparingsberegner",
      schemaDescription: "Gratis opsparingsberegner. Beregn renters rente.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er renters rente?", answer: "Du tjener rente på renten. Over tid accelererer dette din opsparing." },
      { question: "Hvor meget spare?", answer: "10-20 % af indkomsten. Selv små beløb vokser." },
      { question: "Realistisk rente?", answer: "Aktier: ~7 %. Obligationer: 2-4 %. Bank: under 1 %." },
      { question: "Hvad er realværdien af min opsparing?", answer: "Realværdien er opsparingen i nutidens købekraft, altså efter inflation. Slår du inflationsjustering til, er standardsatsen den seneste årlige inflation fra Danmarks Statistik (forbrugerprisindekset), men du kan selv rette den." },
      ],
    },
    "laaneberegner": {
      slug: "laaneberegner",
      title: "Låneberegner",
      description: "Beregn månedlig ydelse og sammenlign lån.",
      metaTitle: "Låneberegner: beregn månedsydelse og sammenlign lån",
      metaDescription: "Beregn månedlig ydelse og sammenlign lån. Gratis beregner.",
      keywords: ["laaneberegner", "låneberegner", "beregner", "gratis", "2026"],
      ogTitle: "Låneberegner: beregn månedsydelse og sammenlign lån",
      ogDescription: "Beregn månedlig ydelse og sammenlign lån.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Låneberegner",
      schemaDescription: "Gratis låneberegner. Beregn månedlig ydelse og sammenlign lån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruger jeg denne beregner?", answer: "Indtast dine data og se resultatet med det samme. Låneberegner er gratis og nem at bruge." },
      { question: "Er resultaterne præcise?", answer: "Beregneren giver et godt estimat. Individuelle forhold kan påvirke det endelige resultat." },
      { question: "Kan jeg bruge beregneren på mobil?", answer: "Ja, beregneren er fuldt responsiv og fungerer på alle enheder." },
      ],
    },
    "billaan": {
      slug: "billaan",
      title: "Billånsberegner",
      description: "Beregn dit billån. Se månedlig ydelse og ÅOP.",
      metaTitle: "Billånsberegner: beregn månedsydelse og ÅOP",
      metaDescription: "Beregn dit billån. Se månedlig ydelse og ÅOP. Gratis beregner.",
      keywords: ["billaan", "billånsberegner", "beregner", "gratis", "2026"],
      ogTitle: "Billånsberegner: beregn månedsydelse og ÅOP",
      ogDescription: "Beregn dit billån. Se månedlig ydelse og ÅOP.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Billånsberegner",
      schemaDescription: "Gratis billånsberegner. Beregn dit billån. Se månedlig ydelse og ÅOP.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruger jeg denne beregner?", answer: "Indtast dine data og se resultatet med det samme. Billånsberegner er gratis og nem at bruge." },
      { question: "Er resultaterne præcise?", answer: "Beregneren giver et godt estimat. Individuelle forhold kan påvirke det endelige resultat." },
      { question: "Kan jeg bruge beregneren på mobil?", answer: "Ja, beregneren er fuldt responsiv og fungerer på alle enheder." },
      ],
    },
    "leasing": {
      slug: "leasing",
      title: "Leasing Beregner",
      description: "Beregn leasingydelse og sammenlign leasing vs. billån.",
      metaTitle: "Leasing Beregner: leasingydelse mod billån",
      metaDescription: "Beregn leasingydelse og sammenlign leasing vs. billån. Gratis beregner.",
      keywords: ["leasing", "leasing beregner", "beregner", "gratis", "2026"],
      ogTitle: "Leasing Beregner: leasingydelse mod billån",
      ogDescription: "Beregn leasingydelse og sammenlign leasing vs. billån.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Leasing Beregner",
      schemaDescription: "Gratis leasing beregner. Beregn leasingydelse og sammenlign leasing vs. billån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruger jeg denne beregner?", answer: "Indtast dine data og se resultatet med det samme. Leasing Beregner er gratis og nem at bruge." },
      { question: "Er resultaterne præcise?", answer: "Beregneren giver et godt estimat. Individuelle forhold kan påvirke det endelige resultat." },
      { question: "Kan jeg bruge beregneren på mobil?", answer: "Ja, beregneren er fuldt responsiv og fungerer på alle enheder." },
      ],
    },
    "forbrugslaan": {
      slug: "forbrugslaan",
      title: "Forbrugslån Beregner",
      description: "Beregn månedlig ydelse på forbrugslån.",
      metaTitle: "Forbrugslån Beregner: beregn månedsydelse",
      metaDescription: "Beregn månedlig ydelse på forbrugslån. Gratis beregner.",
      keywords: ["forbrugslaan", "forbrugslån beregner", "beregner", "gratis", "2026"],
      ogTitle: "Forbrugslån Beregner: beregn månedsydelse",
      ogDescription: "Beregn månedlig ydelse på forbrugslån.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Forbrugslån Beregner",
      schemaDescription: "Gratis forbrugslån beregner. Beregn månedlig ydelse på forbrugslån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruger jeg denne beregner?", answer: "Indtast dine data og se resultatet med det samme. Forbrugslån Beregner er gratis og nem at bruge." },
      { question: "Er resultaterne præcise?", answer: "Beregneren giver et godt estimat. Individuelle forhold kan påvirke det endelige resultat." },
      { question: "Kan jeg bruge beregneren på mobil?", answer: "Ja, beregneren er fuldt responsiv og fungerer på alle enheder." },
      ],
    },
    "gaeldsfri": {
      slug: "gaeldsfri",
      title: "Gældsfri Beregner",
      description: "Beregn din vej ud af gæld. Sammenlign lavine- og snebold-metoden.",
      metaTitle: "Gældsfri Beregner: lavine- eller snebold-metoden",
      metaDescription: "Beregn din vej ud af gæld. Sammenlign lavine- og snebold-metoden. Gratis beregner.",
      keywords: ["gaeldsfri", "gældsfri beregner", "beregner", "gratis", "2026"],
      ogTitle: "Gældsfri Beregner: lavine- eller snebold-metoden",
      ogDescription: "Beregn din vej ud af gæld. Sammenlign lavine- og snebold-metoden.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Gældsfri Beregner",
      schemaDescription: "Gratis gældsfri beregner. Beregn din vej ud af gæld. Sammenlign lavine- og snebold-metoden.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruger jeg denne beregner?", answer: "Indtast dine data og se resultatet med det samme. Gældsfri Beregner er gratis og nem at bruge." },
      { question: "Er resultaterne præcise?", answer: "Beregneren giver et godt estimat. Individuelle forhold kan påvirke det endelige resultat." },
      { question: "Kan jeg bruge beregneren på mobil?", answer: "Ja, beregneren er fuldt responsiv og fungerer på alle enheder." },
      ],
    },
    "boliglaan": {
      slug: "boliglaan",
      title: "Boliglånsberegner",
      description: "Beregn dit boliglån. Se månedlig ydelse og skattefradrag.",
      metaTitle: "Boliglånsberegner: månedsydelse og skattefradrag",
      metaDescription: "Beregn dit boliglån. Se månedlig ydelse og skattefradrag. Gratis beregner.",
      keywords: ["boliglaan", "boliglånsberegner", "beregner", "gratis", "2026"],
      ogTitle: "Boliglånsberegner: månedsydelse og skattefradrag",
      ogDescription: "Beregn dit boliglån. Se månedlig ydelse og skattefradrag.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Boliglånsberegner",
      schemaDescription: "Gratis boliglånsberegner. Beregn dit boliglån. Se månedlig ydelse og skattefradrag.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvor meget kan jeg låne?", answer: "Op til 80 % i realkredit, 15 % banklån, 5 % udbetaling." },
      { question: "Fast vs variabel rente?", answer: "Fast: fast ydelse hele løbetiden. Variabel: justeres løbende, ofte lavere." },
      { question: "Rentefradrag?", answer: "Fradragsværdien er 33,6 % på de første 50.000 kr. renteudgifter (100.000 kr. for par) og 25,6 % på beløbet derudover." },
      { question: "Afdragsfrihed?", answer: "Du betaler kun renter, ikke afdrag. Lavere ydelse men gælden forbliver." },
      ],
    },
    "elberegner": {
      slug: "elberegner",
      title: "Elberegner",
      description: "Beregn dit elforbrug og se hvad dine apparater koster i strøm.",
      metaTitle: "Elberegner: hvad koster dine apparater i strøm",
      metaDescription: "Beregn dit elforbrug og se hvad dine apparater koster i strøm. Gratis beregner.",
      keywords: ["elberegner", "elberegner", "beregner", "gratis", "2026"],
      ogTitle: "Elberegner: hvad koster dine apparater i strøm",
      ogDescription: "Beregn dit elforbrug og se hvad dine apparater koster i strøm.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Elberegner",
      schemaDescription: "Gratis elberegner. Beregn dit elforbrug og se hvad dine apparater koster i strøm.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Beregn elforbrug?", answer: "Watt × timer / 1000 = kWh. 100W × 10t / 1000 = 1 kWh." },
      { question: "Hvad koster en kWh strøm i dag?", answer: "Beregneren henter dagens spotpriser fra Energinets Energi Data Service og lægger nettarif, Energinets tariffer, elafgift og 25 % moms oveni. Standardprisen er dagens gennemsnit for dit prisområde: Vestdanmark (DK1) er Jylland og Fyn, Østdanmark (DK2) er Sjælland, øerne og Bornholm. Dit elselskabs tillæg kommer oveni." },
      { question: "Hvornår er strømmen billigst?", answer: "Som regel om natten og midt på dagen, når der er meget vind- og solstrøm. Nettariffen er højest kl. 17-21, så aftenen er næsten altid dyrest. Grafen markerer dagens fire billigste timer." },
      { question: "Hvornår kommer morgendagens elpriser?", answer: "Spotpriserne for næste døgn fastsættes på elbørsen og offentliggøres normalt omkring kl. 13. Derefter kan du se morgendagens timer i grafen." },
      { question: "Hvor stor er elafgiften i 2026?", answer: "Elafgiften er midlertidigt sat ned til EU's minimum på 0,8 øre pr. kWh ekskl. moms i 2026 og 2027 (Den juridiske vejledning E.A.4.3.6.1). Tidligere lå den på omkring 72 øre." },
      { question: "Største strømslugere?", answer: "Tørretumblere (3000W), ovne (2500W), elkedler (2000W)." },
      { question: "Spare strøm?", answer: "Sluk standby, vælg A+++-mærkede apparater, LED-pærer." },
      ],
    },
    "solceller": {
      slug: "solceller",
      title: "Solcelle Beregner",
      description: "Beregn besparelse og tilbagebetalingstid for solceller.",
      metaTitle: "Solcelle Beregner: besparelse og tilbagebetalingstid",
      metaDescription: "Beregn besparelse og tilbagebetalingstid for solceller. Gratis beregner.",
      keywords: ["solceller", "solcelle beregner", "beregner", "gratis", "2026"],
      ogTitle: "Solcelle Beregner: besparelse og tilbagebetalingstid",
      ogDescription: "Beregn besparelse og tilbagebetalingstid for solceller.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Solcelle Beregner",
      schemaDescription: "Gratis solcelle beregner. Beregn besparelse og tilbagebetalingstid for solceller.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Pris i Danmark?", answer: "60.000-100.000 DKK for 4-8 kWp inkl. montering." },
      { question: "Tilbagebetalingstid?", answer: `Typisk 7-12 år. Anlægget producerer typisk strøm i ${SOLCELLE_LEVETID_AAR_MIN}-${SOLCELLE_LEVETID_AAR_MAX} år i alt, så der er typisk 13-23 år tilbage med gratis strøm, når investeringen er betalt.` },
      { question: "Hvor kommer produktionstallet fra?", answer: "Når du indtaster postnummer, henter beregneren den forventede årsproduktion fra EU-Kommissionens PVGIS 5.3 ud fra placering, tagretning og hældning med 14 % systemtab. Uden postnummer bruges et estimat på 950 kWh pr. kWp." },
      { question: "Hvad får jeg for overskudsstrøm?", answer: "Overskud sælges typisk til spotpris uden afgifter. Beregneren bruger som standard den gennemsnitlige spotpris de seneste 12 måneder i dit prisområde. Den strøm, du selv bruger, sparer dig for den fulde elpris inkl. nettarif, afgifter og moms." },
      { question: "Nettoafregning?", answer: "Du kan sælge overskudsstrøm til elnettet." },
      { question: "Batteri?", answer: "Øger selvforsyningsgrad fra 30 % til 60-70 %, men øger tilbagebetalingstiden." },
      ],
    },
    "timepris": {
      slug: "timepris",
      title: "Timeprisberegner",
      description: "Find din freelance timepris inkl. skat, ferie og drift.",
      metaTitle: "Timeprisberegner: inkl. skat, ferie og drift",
      metaDescription: "Find din freelance timepris inkl. skat, ferie og drift. Gratis beregner.",
      keywords: ["timepris", "timeprisberegner", "beregner", "gratis", "2026"],
      ogTitle: "Timeprisberegner: inkl. skat, ferie og drift",
      ogDescription: "Find din freelance timepris inkl. skat, ferie og drift.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Timeprisberegner",
      schemaDescription: "Gratis timeprisberegner. Find din freelance timepris inkl. skat, ferie og drift.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Beregn timepris som freelancer?", answer: "Start med ønsket nettoløn, tillæg skat (~45 %), drift, ferie, sygdom og admin-tid." },
      { question: "Normal konsulent-timepris?", answer: markedsprisFaqSvar("da") },
      { question: "Moms på timepris?", answer: "Ja, 25 % moms hvis omsætning over 50.000 DKK/år." },
      { question: "Fakturerbare timer?", answer: "Realistisk 100-130 timer/måned." },
      ],
    },
    "termin": {
      slug: "termin",
      title: "Terminsdato Beregner",
      description: "Beregn din terminsdato og se graviditetsuge.",
      metaTitle: "Terminsdato Beregner: se din graviditetsuge",
      metaDescription: "Beregn din terminsdato og se graviditetsuge. Gratis beregner.",
      keywords: ["termin", "terminsdato beregner", "beregner", "gratis", "2026"],
      ogTitle: "Terminsdato Beregner: se din graviditetsuge",
      ogDescription: "Beregn din terminsdato og se graviditetsuge.",
      category: "Sundhed",
      breadcrumbCategory: "Sundhed",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Terminsdato Beregner",
      schemaDescription: "Gratis terminsdato beregner. Beregn din terminsdato og se graviditetsuge.",
      schemaCategory: "HealthApplication",
      faqItems: [
      { question: "Hvordan beregnes terminsdatoen?", answer: "280 dage (40 uger) fra første dag i sidste menstruation." },
      { question: "Hvor præcis?", answer: "Ca. 5 % fødes på terminsdatoen. De fleste mellem uge 38 og 42." },
      { question: "Barsel i Danmark?", answer: `Mor har ret til ${BARSEL_2026.motherBeforeBirthWeeks} uger før termin. Når forældrene bor sammen ved fødslen, har hver ${BARSEL_2026.afterBirthWeeks} uger efter fødslen, hvoraf ${BARSEL_2026.earmarkedWeeks} uger er øremærkede. Op til ${BARSEL_2026.maxTransferableWeeks} uger kan overdrages under særlige betingelser.` },
      { question: "Tre trimestre?", answer: "1. trimester: uge 1-12. 2. trimester: uge 13-26. 3. trimester: uge 27-40." },
      ],
    },
    "moms": {
      slug: "moms",
      title: "Momsberegner",
      description: "Beregn dansk moms på 25 %. Læg moms til 1.000 kr. og få 1.250 kr. Træk også moms fra en pris inkl. moms, eller find momsandelen.",
      metaTitle: "Momsberegner: 1.000 kr. ekskl. moms + 25 % = 1.250 kr.",
      metaDescription: "Beregn dansk moms på 25 %. Læg moms til 1.000 kr. og få 1.250 kr. Træk også moms fra en pris inkl. moms, eller find momsandelen.",
      keywords: ["moms", "momsberegner", "moms baglæns", "moms excel", "MOMS-funktion", "hvordan beregner man moms", "moms uden moms", "beregner", "gratis", "2026"],
      ogTitle: "Momsberegner: 1.000 kr. ekskl. moms + 25 % = 1.250 kr.",
      ogDescription: "Beregn dansk moms på 25 %. Læg moms til 1.000 kr. og få 1.250 kr. Træk også moms fra en pris inkl. moms, eller find momsandelen.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Momsberegner",
      schemaDescription: "Gratis momsberegner. Beregn dansk moms på 25 % med priser inkl. og ekskl. moms.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er den danske momssats?", answer: "Den danske moms er 25 %. Varer og ydelser pålægges 25 % moms." },
      { question: "Hvordan beregner man moms?", answer: "Læg til: gang med 1,25. Træk fra: divider med 1,25. 100 kr ekskl. = 125 kr inkl." },
      { question: "Hvad er momsandelen?", answer: "Momsandelen i en pris inkl. moms er 20 % (25/125 = 0,20)." },
      { question: "Hvornår kan virksomheder trække moms fra?", answer: "Momsregistrerede virksomheder kan trække købsmoms fra og afregner med Skattestyrelsen." },
      { question: "Er der moms på bøger i Danmark?", answer: "Nej. Bøger, aviser og tidsskrifter er undtaget fra momsloven, så der betales ingen moms: en bog til 249 kr. koster 249 kr. I Sverige er bøger derimod 6 % moms." },
      { question: "Hvorfor er fødevarer ikke billigere med lavere moms?", answer: "Danmark har kun én momssats på 25 % og ingen reducerede satser, så fødevarer er 25 % moms: 80 kr. ekskl. moms koster 100 kr. inkl. moms. I Sverige er mad 12 % moms, fordi Sverige har satsen 25 %, 12 % og 6 %." },
      { question: "Hvordan trækker man 25 % moms fra et beløb?", answer: "Divider beløbet med 1,25: 1.250 kr. inkl. moms ÷ 1,25 = 1.000 kr. ekskl. moms. Momsbeløbet er forskellen på 250 kr., og momsandelen i en pris inkl. moms er 20 %, ikke 25 %." },
      { question: "Hvilke varer og ydelser er momsfrie?", answer: "Sundhedsydelser, undervisning, finansielle tjenesteydelser, udlejning af bolig, personbefordring i Danmark samt bøger, aviser og tidsskrifter er undtaget fra momsloven. Resten af handelsvarerne er 25 % moms — også forbrugsudstyr, telefoner og møbler." },
      { question: "Hvordan beregner man moms baglæns?", answer: "Del prisen med 1,25: 1.250 kr. inkl. moms ÷ 1,25 = 1.000 kr. ekskl. moms, og momsen var de 250 kr. Forskellen er den hurtigere vej, fordi momsen er 20 % af prisen med moms (1.250 × 0,20 = 250), men den giver et rundt tal på 499 kr. — 499 ÷ 1,25 = 399,20 kr. ekskl. moms." },
      { question: "Hvordan bruger man MOMS-funktionen i Excel?", answer: "Skriv =MOMS(A1;25;0;0) på et beløb uden moms — på 1.000 kr. giver den 250 kr. Prisen med moms er =A1+MOMS(A1;25;0;0), altså 1.250 kr. Til prisen baglæns kan du bruge =A1/1,25, og momsen i en pris med moms er =A1-A1/1,25. På dansk og svensk Excel bruger formler semikolon mellem argumenterne, på engelsk Excel bruges komma." },
      { question: "Hvorfor er der kun én momssats, når nogle lande har flere?", answer: "Danmark har kun satsen på 25 % og derfor ingen reducerede satser. Når en dansk pris er mindst 25 % dyrere end den udenlandske, må virksomheden opkræve dansk moms af forskellen. Den skal beregnes med 25 %, ikke med 20 % gentaget: 1,25 i fjerde potens er 2,4414, mens 20 % fratrukket fire gange kun giver 0,4096." },
      { question: "Hvad er momssatsen i Tyskland?", answer: landSvarSprogholdig("DE", "da", MOMS_FAQ_FORMAT.da) },
      { question: "Hvad er momssatsen i Holland?", answer: landSvarSprogholdig("NL", "da", MOMS_FAQ_FORMAT.da) },
      { question: "Hvilken momssats har EU's laveste og højeste land?", answer: satsUdenraekkeSvar("da", MOMS_FAQ_FORMAT.da) },
      { question: "Hvad er momssatsen i Norge?", answer: landSvarSprogholdig("NO", "da", MOMS_FAQ_FORMAT.da) },
      { question: "Hvad er momssatsen i Sverige?", answer: "Sverige har tre satser: 25 % standard, 12 % på mat, restaurang og hotell samt 6 % på bøger, kollektivtrafik og kultur. 100 kr. ekskl. moms koster 125 kr. inkl. moms på standard-satsen, 112 kr. ved 12 % og 106 kr. ved 6 %. Danmark har derimod kun 25 % og 0 % på bøger, aviser og tidsskrifter." },
      { question: importmomsSvar("da").spg1, answer: importmomsSvar("da").svar1 },
      { question: importmomsSvar("da").spg2, answer: importmomsSvar("da").svar2 },
    ],

    },
    "loen-efter-skat": {
      slug: "loen-efter-skat",
      title: "Løn efter skat 2026 - Beregn din nettoløn gratis",
      description: `Beregn din nettoløn 2026. Nyt skattesystem med mellemskat og topskat. Personfradrag ${loenBelob(PERSONFRADRAG_2026)} Se hvad du får udbetalt efter skat, AM-bidrag (${AM_BIDRAG}) og pension. Gratis lønberegner.`,
      metaTitle: "Løn efter skat 2026 - Beregn din nettoløn gratis",
      metaDescription: `Beregn din nettoløn 2026 med mellemskat og topskat. Personfradrag ${loenBelob(PERSONFRADRAG_2026)} Se hvad du får udbetalt efter skat, AM-bidrag (${AM_BIDRAG}) og pension.`,
      keywords: ["løn efter skat", "lønberegner", "nettoløn", "beregn løn efter skat", "hvad får jeg udbetalt", "skat beregner", "bruttoløn til nettoløn", "løn 2026", "skatteberegner", "am-bidrag"],
      ogTitle: "Løn efter skat 2026 - Beregn din nettoløn",
      ogDescription: loenEfterSkatOgBeskrivelse(),
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lønberegner - Løn efter skat",
      schemaDescription: "Gratis lønberegner. Se hvad du får udbetalt efter skat, AM-bidrag og pension.",
      schemaCategory: "FinanceApplication",
      faqItems: loenEfterSkatFaqItems(KOMMUNESKAT_SNIT_PCT),
    },
    "brutto-netto": {
      slug: "brutto-netto",
      title: "Brutto/Netto Beregner 2026 - Fra netto til brutto | MinBeregner.dk",
      description: "Beregn hvilken bruttoløn du skal have for at få en bestemt udbetaling. Perfekt til lønforhandling. Opdateret med 2026-skattesatser.",
      metaTitle: "Brutto/Netto Beregner 2026 - Fra netto til brutto",
      metaDescription: "Beregn hvilken bruttoløn du skal have for at få en bestemt udbetaling. Perfekt til lønforhandling. Opdateret med 2026-skattesatser.",
      keywords: ["brutto netto beregner", "netto til brutto", "løn beregner", "hvad skal jeg tjene", "lønforhandling beregner", "bruttoløn beregner", "omvendt skatteberegning"],
      ogTitle: "Brutto/Netto Beregner 2026",
      ogDescription: "Beregn hvilken bruttoløn du behøver for din ønskede udbetaling.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Brutto/Netto Beregner 2026",
      schemaDescription: "Beregn hvilken bruttoløn du behøver for at få din ønskede udbetaling. Opdateret med 2026-satser.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan beregner jeg brutto fra netto?", answer: "Indtast din ønskede månedsløn efter skat, og beregneren finder den bruttoløn der giver dig netop denne udbetaling efter AM-bidrag, bundskat, kommuneskat og eventuel mellemskat/topskat." },
      { question: "Hvad er forskellen på brutto og netto?", answer: "Bruttoløn er din løn før skat og afgifter. Nettoløn er det du faktisk får udbetalt. Forskellen er AM-bidrag (8 %), bundskat (12,01 %), kommuneskat (ca. 25 %) og eventuel mellemskat/topskat." },
      { question: "Hvor meget skal jeg tjene for at få 25.000 kr. udbetalt?", answer: "Med gennemsnitlig kommuneskat (25,049 %) og uden kirkeskat skal du tjene ca. 40.000-42.000 kr. brutto for at få ca. 25.000 kr. udbetalt. Det præcise beløb afhænger af din kommune." },
      { question: "Kan jeg bruge beregneren til lønforhandling?", answer: "Ja! Indtast den udbetaling du ønsker, og se hvilken bruttoløn du skal forhandle dig til. Husk at pension, fradrag og andre forhold også påvirker din udbetaling." },
      ],
    },
    "feriepenge": {
      slug: "feriepenge",
      title: "Feriepenge Beregner 2026 - Se hvad du får udbetalt",
      description: "Gratis feriepenge beregner. Beregn hvor meget du får udbetalt i feriepenge baseret på din løn. Se både brutto og netto feriepenge med aktuelle skattesatser.",
      metaTitle: "Feriepenge Beregner 2026 - Se hvad du får udbetalt",
      metaDescription: "Gratis feriepenge beregner. Beregn hvor meget du får udbetalt i feriepenge baseret på din løn. Se både brutto og netto feriepenge med aktuelle skattesatser.",
      keywords: ["feriepenge beregner", "beregn feriepenge", "feriepenge 2026", "ferieberegner", "feriepenge udbetaling", "hvor meget i feriepenge", "feriekonto", "ferie med løn", "ferietillæg"],
      ogTitle: "Feriepenge Beregner 2026",
      ogDescription: "Beregn dine feriepenge og se hvad du får udbetalt. Gratis ferieberegner.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Feriepenge Beregner",
      schemaDescription: "Gratis feriepenge beregner. Beregn hvor meget du får udbetalt i feriepenge.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan beregnes mine feriepenge?", answer: "Du optjener 12,5 % af din ferieberettigede løn i feriepenge. Det svarer til 2,08 feriedag per måned eller 25 dage om året (5 ugers ferie). Ved udbetaling trækkes AM-bidrag (8 %) og A-skat." },
      { question: "Hvornår kan jeg få mine feriepenge udbetalt?", answer: "Du kan anmode om udbetaling fra feriekonto.dk tidligst 1 måned før feriens start. Ved jobskifte kan ikke-afholdt ferie overføres eller udbetales. 5. ferieuge kan udbetales uden at afholde ferie efter ferieåret." },
      { question: "Hvad er forskellen på feriepenge og ferie med løn?", answer: "Timelønnede får feriepenge (12,5 % af lønnen opspares i FerieKonto). Månedslønnede funktionærer får ferie med løn - altså normal løn under ferie plus et ferietillæg på typisk 1 %." },
      { question: "Hvornår er ferieåret?", answer: "Med den nye ferielov (fra 2020) er optjeningsperioden 1. september til 31. august, og ferieåret løber fra 1. september til 31. december året efter. Du kan afholde ferie løbende." },
      { question: "Hvad sker der med mine feriepenge hvis jeg skifter job?", answer: "Ved jobskifte indbetaler din arbejdsgiver dine optjente feriepenge til FerieKonto. Du kan vælge at få dem udbetalt eller overføre dem til brug ved din nye arbejdsgiver." },
      { question: "Bliver feriepenge beskattet?", answer: "Ja, feriepenge beskattes som almindelig A-indkomst. Først trækkes AM-bidrag (8 %), derefter A-skat efter dit skattekort. Pengene indberettes automatisk til Skattestyrelsen." },
      { question: "Hvad er ferieberettiget løn?", answer: "Ferieberettiget løn inkluderer fast løn, bonus, provision, overtid og tillæg. Det inkluderer IKKE arbejdsgiverbetalt pension, skattefrie godtgørelser (kørsel, rejse) og lignende." },
      { question: "Kan jeg få feriepenge udbetalt uden at holde ferie?", answer: "Din 5. ferieuge kan udbetales uden at du holder ferie, men først efter ferieårets udløb. De første 4 ugers ferie skal som udgangspunkt afholdes som faktisk ferie." },
      ],
    },
    "dagpenge": {
      slug: "dagpenge",
      title: "Dagpengeberegner 2026 - Beregn dine dagpenge",
      description: DAGPENGE_BESKRIVELSE,
      metaTitle: "Dagpengeberegner 2026 - Beregn dine dagpenge",
      metaDescription: DAGPENGE_BESKRIVELSE,
      keywords: ["dagpenge beregner", "dagpenge 2026", "beregn dagpenge", "dagpenge sats", "a-kasse beregner", "arbejdsløshedsdagpenge", "dagpenge efter skat", "max dagpenge 2026", "dagpenge sats 2026", "dagpenge sats 2026 nyuddannet", "dagpenge nyuddannet sats", "dagpenge sats 2026 efter skat", "dimittendsats 2026"],
      ogTitle: "Dagpengeberegner 2026 - Beregn dine dagpenge",
      ogDescription: "Beregn hvad du kan få i dagpenge i 2026. Gratis og nem dagpengeberegner.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Dagpengeberegner 2026",
      schemaDescription: "Beregn hvad du kan få i dagpenge baseret på din tidligere løn",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan beregnes dagpenge?", answer: `Dagpenge beregnes som ${DAGPENGE_PROCENT_TEKST} % af din løn efter fradrag af ${DAGPENGE_AM_PROCENT_TEKST} % AM-bidrag, dog højst maxsatsen på ${DAGPENGE_MAX_TEKST}/md i 2026. Din A-kasse ser på din gennemsnitlige indtægt de seneste 12 måneder.` },
      { question: "Hvad er maxsatsen for dagpenge i 2026?", answer: `I 2026 er den maksimale dagpengesats ${DAGPENGE_MAX_TEKST}/md før skat for fuldtidsforsikrede. Med beskæftigelsestillæg kan satsen de første 3 måneder være op til ${DAGPENGE_TILLAEG_TEKST}/md.` },
      { question: "Hvad er beskæftigelsestillægget?", answer: `Beskæftigelsestillægget er et ekstra tillæg de første 3 måneders ledighed, som kan give op til ${DAGPENGE_TILLAEG_TEKST}/md i 2026. Tillægget kræver at du opfylder visse beskæftigelseskrav.` },
      { question: "Hvor længe kan jeg få dagpenge?", answer: `Dagpengeperioden er normalt 2 år (${DAGPENGE_PERIODE_TIMER_TEKST} timer) inden for ${DAGPENGE_2026.indkomstkravAar} år. Perioden kan forlænges ved arbejde eller uddannelse.` },
      { question: "Skal jeg betale skat af dagpenge?", answer: dagpengeEfterSkatFaqSvar() },
      { question: "Hvornår har jeg ret til dagpenge?", answer: `Du skal have været medlem af en A-kasse i mindst ${DAGPENGE_2026.aKasseMedlemskabMdr} måneder, have haft en vis indkomst (indkomstkravet på ca. ${DAGPENGE_INDKOMSTKRAV_TEKST} over ${DAGPENGE_2026.indkomstkravAar} år), og være aktivt jobsøgende og tilmeldt jobcentret.` },
      { question: "Hvad er dagpengesatsen for nyuddannet i 2026?", answer: dagpengeNyuddannetFaqSvar() },
      { question: "Hvor længe har nyuddannede ret til dagpenge?", answer: dagpengeNyuddannetPeriodeFaqSvar() },
      ],
    },
    "sygedagpenge": {
      slug: "sygedagpenge",
      title: "Sygedagpenge Beregner - Beregn din sats 2026 | MinBeregner.dk",
      description: "Beregn dine sygedagpenge for 2026. Se din ugentlige sats, arbejdsgiverperiode, kommunal udbetaling og løntab ved sygdom.",
      metaTitle: "Sygedagpenge Beregner - Beregn din sats 2026",
      metaDescription: "Beregn dine sygedagpenge for 2026. Se din ugentlige sats, arbejdsgiverperiode, kommunal udbetaling og løntab ved sygdom.",
      keywords: ["sygedagpenge beregner", "sygedagpenge 2026", "sygedagpenge sats", "sygdom løn", "sygemelding", "arbejdsgiverperiode", "mulighedserklæring", "sygedagpenge selvstændig"],
      ogTitle: "Sygedagpenge Beregner - Beregn din sats 2026",
      ogDescription: "Beregn sygedagpenge, se arbejdsgiverperiode og løntab ved sygdom.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Sygedagpenge Beregner",
      schemaDescription: "Beregn dine sygedagpenge for 2026. Se ugentlig sats, arbejdsgiverperiode og løntab.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er sygedagpenge?", answer: "Sygedagpenge er en ydelse, der erstatter din løn, når du er syg og ikke kan arbejde. Lønmodtagere, selvstændige og ledige kan modtage sygedagpenge, hvis de opfylder beskæftigelseskravet." },
      { question: "Hvor meget får jeg i sygedagpenge?", answer: "Sygedagpenge beregnes som 90 % af din timeløn gange dit ugentlige timetal, dog højst 4.750 kr. pr. uge i 2026. Mange arbejdsgivere supplerer op til fuld løn ifølge overenskomst." },
      { question: "Hvad er arbejdsgiverperioden?", answer: "Arbejdsgiverperioden er de første 30 kalenderdage af sygefraværet, hvor din arbejdsgiver betaler sygedagpengene. Herefter overtager kommunen udbetalingen." },
      { question: "Hvad er en mulighedserklæring?", answer: "En mulighedserklæring er et dokument, som din arbejdsgiver kan bede om fra dag 1 af dit sygefravær. Den beskriver dine muligheder for at arbejde helt eller delvist under sygdommen og udfyldes af dig, din arbejdsgiver og din læge." },
      { question: "Hvor længe kan jeg få sygedagpenge?", answer: "Kommunen revurderer din sag efter 22 uger inden for de seneste 9 måneder. Sygedagpengene kan forlænges, f.eks. hvis du afventer behandling, er under revalidering, eller der afventes afklaring til fleksjob eller førtidspension." },
      { question: "Kan selvstændige få sygedagpenge?", answer: "Ja, selvstændige kan få sygedagpenge efter 2 ugers sygdom (med mindre de har tegnet en sygedagpengeforsikring, der giver ret fra 1. eller 3. fraværsdag). Satsen beregnes ud fra den seneste årsopgørelse." },
      ],
    },
    "pension": {
      slug: "pension",
      title: `${pensionDa.metaTitle} | MinBeregner.dk`,
      description: pensionDa.description,
      metaTitle: pensionDa.metaTitle,
      metaDescription: pensionDa.metaDescription,
      keywords: ["pension"],
      ogTitle: pensionDa.ogTitle,
      ogDescription: pensionDa.ogDescription,
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Pensionsberegner - Beregn din pension",
      schemaDescription: "Gratis pensionsberegner. Beregn folkepensionen for 2026 og se hvor meget din opsparing giver pr. måned, når du går på pension.",
      schemaCategory: "FinanceApplication",
      faqItems: pensionFaqItems(),
    },
    "efterloen": {
      slug: "efterloen",
      title: "Efterløn beregner 2026 - Se hvad du kan få udbetalt",
      description: efterloenDescription(),
      metaTitle: "Efterløn beregner 2026 - Se hvad du kan få udbetalt",
      metaDescription: efterloenMetaDescription(),
      keywords: ["efterløn", "efterløn beregner", "efterlønssats 2026", "beregn efterløn", "hvornår kan jeg gå på efterløn", "efterløn alder", "efterløn sats", "efterlønsbidrag", "tidlig pension"],
      ogTitle: "Efterløn beregner 2026",
      ogDescription: "Beregn hvad du kan få i efterløn. Gratis beregner med 2026 satser.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Efterløn beregner",
      schemaDescription: "Beregn hvad du kan få i efterløn og se betingelser for ordningen.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er efterløn?", answer: "Efterløn er en frivillig tilbagetrækningsordning for ældre lønmodtagere og selvstændige. Du kan gå på efterløn nogle år før folkepensionsalderen, hvis du opfylder betingelserne." },
      { question: "Hvad er efterlønssatsen i 2026?", answer: efterloenFaqSvar["Hvad er efterlønssatsen i 2026?"] },
      { question: "Hvornår kan jeg gå på efterløn?", answer: efterloenAldersSvar() },
      { question: "Hvad er betingelserne for efterløn?", answer: "Du skal have betalt efterlønsbidrag i mindst 30 år, være medlem af en a-kasse, være tilmeldt efterlønsordningen, og have ret til dagpenge på overgangstidspunktet." },
      { question: "Kan jeg arbejde mens jeg er på efterløn?", answer: efterloenFaqSvar["Kan jeg arbejde mens jeg er på efterløn?"] },
      { question: "Hvad er efterlønspræmien?", answer: efterloenFaqSvar["Hvad er efterlønspræmien?"] },
      { question: "Kan jeg få efterløn hvis jeg bor i udlandet?", answer: "Du kan som udgangspunkt kun få efterløn, hvis du bor i Danmark eller et andet EØS-land. Der er særlige regler for ophold uden for EØS." },
      { question: "Hvad sker der med min pension hvis jeg vælger efterløn?", answer: "Din pensionsopsparing påvirker ikke din ret til efterløn, men store pensionsudbetalinger kan reducere din efterløn. Udbetaling fra pension tæller som indkomst." },
      ],
    },
    "topskat": {
      slug: "topskat",
      title: "Topskat Beregner 2026 - Betaler du topskat? | MinBeregner.dk",
      description: topskatBeskrivelse(),
      metaTitle: "Topskat Beregner 2026 - Betaler du topskat?",
      metaDescription: topskatBeskrivelse(),
      keywords: ["topskat beregner", "betaler jeg topskat", "topskat 2026", "topskattegrænse", "mellemskat 2026", "effektiv skat", "marginalskat", "skatteberegner"],
      ogTitle: "Topskat Beregner 2026",
      ogDescription: "Beregn om du betaler mellemskat eller topskat med 2026-satser.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Topskat Beregner 2026",
      schemaDescription: "Beregn om du betaler mellemskat eller topskat med 2026-satser. Se effektiv og marginal skatteprocent.",
      schemaCategory: "FinanceApplication",
      faqItems: topskatFaqItems(),
    },
    "skattefradrag": {
      slug: "skattefradrag",
      title: "Skattefradrag Beregner - Beregn alle fradrag 2026 | MinBeregner.dk",
      description: "Beregn din samlede skattebesparelse fra kørselsfradrag, rentefradrag, håndværkerfradrag, fagforening og a-kasse. Se 2026-satser og grænser.",
      metaTitle: "Skattefradrag Beregner - Beregn alle fradrag 2026",
      metaDescription: "Beregn din samlede skattebesparelse fra kørselsfradrag, rentefradrag, håndværkerfradrag, fagforening og a-kasse. Se 2026-satser og grænser.",
      keywords: ["skattefradrag beregner", "fradrag 2026", "kørselsfradrag", "rentefradrag", "håndværkerfradrag", "fagforening fradrag", "a-kasse fradrag", "skattebesparelse", "boligjobordning"],
      ogTitle: "Skattefradrag Beregner - Beregn alle fradrag 2026",
      ogDescription: "Beregn din samlede skattebesparelse fra kørsel, renter, håndværker, fagforening og a-kasse.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Skattefradrag Beregner",
      schemaDescription: "Beregn din samlede skattebesparelse fra alle fradrag: kørsel, renter, håndværker, fagforening og a-kasse.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er kørselsfradrag?", answer: "Kørselsfradrag (befordringsfradrag) er et fradrag for transport mellem hjem og arbejde. Du kan få fradrag for kørsel over 24 km dagligt (12 km hver vej), uanset om du kører bil, cykel eller bruger offentlig transport. Satsen er 3,17 kr./km for 25-120 km og 1,59 kr./km derover i 2026." },
      { question: "Hvad er rentefradrag?", answer: "Rentefradrag er et fradrag for renteudgifter på lån — fx boliglån, billån og SU-lån. Fradragsværdien er 33,6 % op til 50.000 kr. renteudgifter og 25,6 % oveni. Det betyder, at du sparer ca. 336 kr. i skat for hver 1.000 kr. du betaler i renter, indtil du når grænsen." },
      { question: "Hvad dækker håndværkerfradraget?", answer: `Boligjobordningen er delt i to ordninger i 2026. Håndværkerfradraget dækker arbejdsløn til grønne og energibesparende forbedringer — isolering, energirigtige vinduer og døre, varmepumpe, solceller og ladestander — op til ${daKr(SKATTEFRADRAG_2026.haandvaerkerMax)} kr. pr. person. Maling og andet almindeligt vedligeholdelse er ikke længere omfattet. Servicefradraget har sit eget loft på ${daKr(SKATTEFRADRAG_2026.servicefradragMax)} kr. pr. person for private serviceydelser i hjemmet: rengøring, vinduespudsning, havearbejde, snerydning og børnepasning i hjemmet. Kun arbejdsløn — ikke materialer — kan fradrages i begge ordninger.` },
      { question: "Kan jeg trække fagforening fra i skat?", answer: "Ja, du kan trække kontingent til fagforening fra op til 7.000 kr. årligt i 2026. A-kasse-kontingent kan trækkes fuldt fra uden loft. Begge fradrages som ligningsmæssige fradrag." },
      { question: "Hvornår skal jeg indberette fradrag?", answer: "De fleste fradrag indberettes automatisk af din arbejdsgiver, bank eller fagforening. Kørselsfradrag og håndværkerfradrag skal du selv indberette via skat.dk. Fristen er typisk 1. maj for årsopgørelsen." },
      ],
    },
    "aktieskat": {
      slug: "aktieskat",
      title: "Aktieskat Beregner 2026 - Beregn skat på aktier | MinBeregner.dk",
      description: aktieskatBeskrivelse(),
      metaTitle: "Aktieskat Beregner 2026 - Beregn skat på aktier",
      metaDescription: aktieskatBeskrivelse(),
      keywords: ["aktieskat beregner", "skat på aktier", "aktieindkomst skat", "aktiesparekonto", "ASK skat", "27 procent aktieskat", "42 procent aktieskat", "progressionsgrænse aktier", "lagerbeskatning", "realisationsbeskatning"],
      ogTitle: "Aktieskat Beregner 2026 - Frit depot vs. ASK",
      ogDescription: aktieskatOgBeskrivelse(),
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Aktieskat Beregner 2026",
      schemaDescription: aktieskatSchemaBeskrivelse(),
      schemaCategory: "FinanceApplication",
      faqItems: aktieskatFaqItems(),
    },
    "arveafgift": {
      slug: "arveafgift",
      title: "Arveafgift beregner - Beregn arveafgift i Danmark | MinBeregner.dk",
      description: "Beregn arveafgift i Danmark. Se hvor meget du skal betale i boafgift baseret på din relation til afdøde. Gratis beregner med 2026 satser og regler.",
      metaTitle: ARVE_EKSEMPEL_TEKST,
      metaDescription: "Beregn arveafgift i Danmark. Se hvor meget du skal betale i boafgift baseret på din relation til afdøde. Gratis beregner med 2026 satser og regler.",
      keywords: ["arveafgift"],
      ogTitle: ARVE_EKSEMPEL_TEKST,
      ogDescription: "Beregn arveafgift i Danmark. Se hvor meget du skal betale i boafgift baseret på din relation til afdøde. Gratis beregner",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Arveafgift beregner - Beregn arveafgift i Danmark",
      schemaDescription: "Gratis arveafgift beregner. Beregn boafgift baseret på din relation: ægtefælle (fritaget), børn (15 %), søskende (15 % + 25 % tillægsafgift).",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er arveafgiften i Danmark i 2026?", answer: `I 2026 betaler nærmeste familie (børn, børnebørn, forældre) 15 % boafgift af arv over bundfradraget på ${ARVE_BUNDFRADRAG_TEKST} kr. Ægtefæller er helt fritaget. Søskende og andre betaler 15 % boafgift plus 25 % tillægsafgift af arven efter boafgiften.` },
      { question: "Kan ægtefæller undgå arveafgift?", answer: "Ja, ægtefæller er fuldstændig fritaget for arveafgift i Danmark uanset beløbets størrelse. Det anbefales ofte at oprette ægtepagt, så den længstlevende ægtefælle sikres bedst muligt." },
      { question: "Hvad er tillægsafgift på arv?", answer: "Tillægsafgift er en ekstra afgift på 25 % af arven efter fradrag af boafgiften. Der er intet bundfradrag for tillægsafgiften. Den gælder for søskende (indtil 2027) og andre arvinger, der ikke er i direkte op- eller nedstigende linje." },
      { question: "Hvad er bundfradraget for arveafgift i 2026?", answer: `Bundfradraget er ${ARVE_BUNDFRADRAG_TEKST} kr i 2026. Det betyder, at de første ${ARVE_BUNDFRADRAG_TEKST} kr af arven er afgiftsfri for alle arvinger undtagen ægtefæller (som er helt fritaget).` },
      { question: "Betaler børnebørn samme arveafgift som børn?", answer: "Ja, børnebørn betaler samme sats som biologiske børn: 15 % boafgift uden tillægsafgift. Der er dog en undtagelse, hvis barnets forældre stadig lever — i så fald arver bedsteforældrenes formue typisk gennem forældrene først." },
      { question: "Hvornår skal arveafgift betales?", answer: "Arveafgiften skal betales til Skattestyrelsen inden 1 år efter dødsfaldet. Boet afvikles typisk gennem en bobestyrer eller advokat, som sørger for at beregne og afregne afgifterne." },
      { question: "Ændres reglerne for søskende i 2027?", answer: "Ja, fra 1. januar 2027 afskaffes tillægsafgiften for søskende. Det betyder at søskende fremover kun betaler 15 % boafgift i stedet for den nuværende effektive sats på op til 36,25 %." },
      { question: "Skal man betale arveafgift af forsikringer?", answer: "Forsikringsudbetalinger der tilfalder en navngiven begunstiget (fx livsforsikring) indgår som udgangspunkt ikke i boet og er dermed ikke underlagt boafgift. Men beløbet kan i stedet være omfattet af afgiftspligt efter forsikringsaftalelovens regler." },
      ],
    },
    "gaveafgift": {
      slug: "gaveafgift",
      title: "Gaveafgift 2026 - hvor meget må du give skattefrit?",
      description: `Giv op til ${GAVE_NAER_TEKST} kr. afgiftsfrit til nær familie i 2026. Beregn gaveafgiften, hvis gaven er større. Gratis beregner med 2026-satser fra Skattestyrelsen.`,
      metaTitle: GAVE_EKSEMPEL_TEKST,
      metaDescription: `Hvor meget må du give skattefrit i 2026? Nær familie: ${GAVE_NAER_TEKST} kr., svigerbørn: ${GAVE_SVIGER_TEKST} kr. Beregn gaveafgiften på det overskydende beløb.`,
      keywords: ["gaveafgift", "gaveafgift 2026", "hvor meget må jeg give i gave", "afgiftsfri gave", "gave til børn afgift", "gaveafgift beregner", "skattefri gave 2026"],
      ogTitle: GAVE_EKSEMPEL_TEKST,
      ogDescription: `Beregn gaveafgiften i 2026. Nær familie kan modtage ${GAVE_NAER_TEKST} kr. afgiftsfrit, svigerbørn ${GAVE_SVIGER_TEKST} kr.`,
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Gaveafgift beregner 2026",
      schemaDescription: `Gratis gaveafgift beregner med 2026-satser. Se hvor meget du må give afgiftsfrit til nær familie (${GAVE_NAER_TEKST} kr.) og svigerbørn (${GAVE_SVIGER_TEKST} kr.), og hvad afgiften bliver af resten.`,
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvor meget må jeg give skattefrit i 2026?", answer: `Du kan give op til ${GAVE_NAER_TEKST} kr. afgiftsfrit til et familiemedlem i din nærmeste familie i 2026. Det gælder børn, stedbørn og deres børn, forældre, samlever og plejebørn. Beløbet er pr. gavemodtager pr. kalenderår.` },
      { question: "Hvad er gaveafgiften i 2026?", answer: `Gaveafgiften er som hovedregel 15 % af det beløb, der overstiger det afgiftsfrie beløb på ${GAVE_NAER_TEKST} kr. Giver du fx 100.000 kr. til et barn, betaler du 15 % af ${formatNumber(100_000 - GAVE_RELATIONER.naer.bundfradrag, "da")} kr. = ${formatNumber(beregnGaveafgift(100_000, "naer")!.afgift, "da")} kr.` },
      { question: "Hvor meget må jeg give til et svigerbarn?", answer: `For svigerbørn er det afgiftsfrie beløb lavere: ${GAVE_SVIGER_TEKST} kr. i 2026. Giver du mere, skal der betales 15 % i gaveafgift af det overskydende beløb.` },
      { question: "Betaler bedsteforældre og stedforældre en anden sats?", answer: "Ja. Er gavemodtageren en bedsteforælder eller stedforælder, er satsen 36,25 % af beløbet over det afgiftsfrie beløb på 80.600 kr. i 2026." },
      { question: "Hvornår skal gaven anmeldes?", answer: "Gaver over det afgiftsfrie beløb skal anmeldes til Skattestyrelsen senest 1. maj året efter, at gaven er modtaget. Gaveafgiften skal betales samme dag, som anmeldelsen sendes ind." },
      { question: "Er gaver mellem ægtefæller afgiftsfrie?", answer: "Ja, som hovedregel kan ægtefæller frit give hinanden gaver, også selvom beløbet overstiger det afgiftsfrie beløb. Det gælder dog ikke, hvis ægteskabet er ophørt ved separation eller skilsmisse, når gaven modtages." },
      { question: "Skal gaver til venner og søskende beskattes?", answer: "Gaver til venner, bekendte og fjernere familie som søskende, nevøer og niecer er ikke omfattet af gaveafgift. Modtageren skal i stedet skrive beløbet på sin årsopgørelse som anden personlig indkomst. Fra 1. januar 2027 bliver søskende omfattet af de almindelige gaveafgiftsregler." },
      { question: "Er lejlighedsgaver skattefrie?", answer: "Almindelige gaver til jul, fødselsdag, konfirmation, bryllup og lignende af beskeden værdi er skattefrie. Det er de store pengegaver ud over det afgiftsfrie beløb, der udløser gaveafgift." },
      ],
    },
    "kirkeskat": {
      slug: "kirkeskat",
      title: "Kirkeskat 2026 - hvor meget betaler du i kirkeskat?",
      description: `Beregn din kirkeskat for 2026. Satsen varierer kommune til kommune - København er ${KIRKESKAT_KBH_TEKST} %, Frederiksberg ${KIRKESKAT_FRB_TEKST} % og den gennemsnitlige sats er ${KIRKESKAT_SNIT_TEKST} %. Meld dig ud af folkekirken og spar hele beløbet.`,
      metaTitle: `Kirkeskat 2026: ${kr(KIRKESKAT_EKSEMPEL_INDKOMST)} kr. i København = ${kr(beregnKirkeskat(KIRKESKAT_EKSEMPEL_INDKOMST, "København")!.kirkeskat)} kr.`,
      metaDescription: `Beregn din kirkeskat i 2026. Satsen varierer kommune til kommune (fx ${KIRKESKAT_KBH_TEKST} % i København), og den gennemsnitlige er ${KIRKESKAT_SNIT_TEKST} %.`,
      keywords: ["kirkeskat", "kirkeskat 2026", "kirkeskat beregner", "hvad er kirkeskat", "hvad koster kirkeskat", "kirkeskat sats", "melde ud af folkekirken", "spare penge kirkeskat"],
      ogTitle: "Kirkeskat 2026 - beregn din kirkeskat",
      ogDescription: `Beregn din kirkeskat i 2026. Satsen varierer kommune til kommune, og du sparer hele beløbet ved at melde dig ud af folkekirken.`,
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Kirkeskat beregner 2026",
      schemaDescription: `Gratis kirkeskat beregner med 2026-satser. Se din kirkeskat ud fra din skattepligtige indkomst og din kommune, og hvor meget du sparer ved at melde dig ud af folkekirken.`,
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er kirkeskat?", answer: "Kirkeskat er en skat til den danske folkekirke, som betales af medlemmer af kirken. Satsen varierer kommune til kommune, og grundlaget er din skattepligtige indkomst efter fradrag. Kirkeskat indregnes automatisk i din forskudsopgørelse." },
      { question: "Hvad er kirkeskattesatsen i 2026?", answer: `Satsen varierer kommune til kommune. Her er nogle eksempler: København ${KIRKESKAT_KBH_TEKST} %, Frederiksberg ${KIRKESKAT_FRB_TEKST} %, Aarhus ${KIRKESKAT_AAR_TEKST} %, Odense ${KIRKESKAT_ODD_TEKST} % og Aalborg ${KIRKESKAT_AAL_TEKST} %. Den gennemsnitlige kirkeskattesats i Danmark er ${KIRKESKAT_SNIT_TEKST} %.` },
      { question: "Hvor meget sparer jeg ved at melde mig ud?", answer: `Hvis du melder dig ud af folkekirken, sparer du hele kirkeskatten. For en person med en skattepligtig indkomst på ${kr(KIRKESKAT_EKSEMPEL_INDKOMST)} kr. i København (sats: ${KIRKESKAT_KBH_TEKST} %) er det ${kr(beregnKirkeskat(KIRKESKAT_EKSEMPEL_INDKOMST, "København")!.kirkeskat)} kr. pr. år.` },
      { question: "Hvordan regner man kirkeskat ud?", answer: "Kirkeskatten er din skattepligtige indkomst ganget med satsen for din kommune, afrundet til hele kroner. Eksempler: " + KIRKESKAT_EKSEMPEL_TEKST + "." },
      { question: "Kan man melde sig ud af folkekirken?", answer: "Ja, du kan melde dig ud af folkekirken når som helst, gratis, og altid melde dig ind igen. Det sker via skat.dk eller ved at kontakte din sognepræst." },
      { question: "Hvad er forskellen på kirkeskat og kommuneskat?", answer: "Kommuneskat er en skat til kommunen, som alle betaler. Kirkeskat er en ekstra skat, kun medlemmer af folkekirken betaler, og den indregnes automatisk i forskudsopgørelsen." },
      ],
    },
    "renteprognose": {
      slug: "renteprognose",
      title: "Renteprognose - se hvad dit boliglån koster om 5, 10 og 30 år",
      description: "Beregn hvad et boliglån koster, hvis renterne stiger eller falder. Vælg renteomlægning, afdragsform og rentesvingning, og se den månedlige ydelse og alle renter til og med hvert år.",
      metaTitle: "Renteprognose - hvad koster boliglånet om 5, 10 og 30 år?",
      metaDescription: "Beregn hvad dit boliglån koster om 5, 10 og 30 år. Vælg renteomlægning, afdragsform og rentesvingning, og fåg den månedlige ydelse år for år.",
      keywords: ["renteprognose", "renteprognose 2026", "renteprognose boliglån", "beregn renteprognose", "renteprognose nykredit", "renteprognose 2030", "renteudvikling boliglån", "hvad koster et boliglån om 10 år", "afdragsfrit boliglån beregning", "rentefrit år"],
      ogTitle: "Renteprognose - hvad koster dit boliglån?",
      ogDescription: "Se den månedlige ydelse og alle renter år for år, hvis renterne stiger eller falder.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Renteprognose",
      schemaDescription: "Beregn den månedlige ydelse og de samlede renter på et boliglån ved forskellige rentesætninger.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad er en renteprognose?", answer: "En renteprognose viser, hvad et lån koster, hvis rentesættet ændrer sig på låbetiden. Den er en følsomhedsberegning, ikke en forudsigelse: du vælger selv, hvor meget renterne stiger eller falder, og får svaret for hvert år." },
        { question: "Kan man forudse, hvad renterne bliver om 10 år?", answer: "Nej. Ingen offentlig kilde forudsiger danske realkreditrenter, og bankerne vælger den nye rente ved hver renteomlægning ud fra markedet på den dag. Derfor står værktøjet på 0 procentpoint som standard, og du kan selv vælge ±2 procentpoint og op til +3 procentpoint om året." },
        { question: "Hvad er forskellen på en variabel og en 5-årig fastrente i prognosen?", answer: "Renten fastsættes på ny ved hver renteomlægning. En variabel rente og en 1-årig fastrente får én ny rente hvert år, en 3-årig fastrente hvert tredje år og en 5-årig fastrente hvert femte. I værktøjet stiger rentesættet derfor i trin, og du ser præcis hvor i løbetiden de lander." },
        { question: "Hvad er forskellen på et lån med afdrag og et afdragsfrit lån?", answer: "Ved afdrag betaler du en fast månedlig ydelse, der dækker både renter og afdrag, så gælden bliver lavere for hver måned. Ved afdragsfrit gæld betaler du kun renterne, gælden står på 2 mio. kr., og de samlede renter bliver derfor større." },
        { question: "Hvorfor er mine renter højere end forrige år, selv om renten er uændret?", answer: "Fordi gælden er en restgæld, ikke det oprindelige lån. Når du har afdraget, er der mindre gæld til at betale rente på, så renteudgiften falder år for år. I værktøjet ser du derfor også renterne for hvert enkelt år." },
        { question: "Hvad betyder det, når prognosen viser en restgæld?", answer: "Ved et afdragsfrit lån står restgælden på hele beløbet hele løbetiden - det er pointen ved afdragsfrit. Ved et lån med afdrag ender restgælden på 0 kr. efter løbetiden, fordi du har afdraget hele beløbet." },
        { question: "Betyder en lavere rente altid et billigere lån?", answer: "Nej. En lavere rente giver lavere renter, men du afdrager langsommere, så gælden står længere. Derfor viser værktøjet både renterne i alt og restgælden, så du kan se hele billedet." },
        { question: "Kan jeg dele min prognose med min makker?", answer: "Ja. Knappen 'Del beregning' pakker dine valgte tal sammen i et link, så modtageren ser præcis samme forudsætninger. Der gemmes ingen personoplysninger, og linket indeholder kun beløb, rente, løbetid, renteomlægning, rentesætning og afdragsform." },
      ],
    },
    "rentefradrag": {
      slug: "rentefradrag",
      title: "Rentefradrag beregner 2026 - Se din skattebesparelse",
      description: rentefradragDescription(),
      metaTitle: "Rentefradrag beregner 2026 - Se din skattebesparelse",
      metaDescription: rentefradragMetaDescription(),
      keywords: ["rentefradrag", "rentefradrag beregner", "rentefradrag 2026", "beregn rentefradrag", "skattefradrag renter", "boliglån fradrag", "renteudgifter fradrag", "negativ kapitalindkomst", "fradragsværdi"],
      ogTitle: "Rentefradrag beregner 2026",
      ogDescription: "Beregn hvor meget du sparer i skat på dine renteudgifter.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Rentefradrag beregner",
      schemaDescription: "Beregn din skattebesparelse fra rentefradrag på lån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er rentefradrag?", answer: "Rentefradrag er et skattefradrag, du får for dine renteudgifter. Det reducerer din skattepligtige indkomst, så du betaler mindre i skat. Fradraget gælder for renter på boliglån, billån, forbrugslån og andre lån." },
      { question: "Hvad er fradragsværdien i 2026?", answer: RENTEFRADRAG_FAQ_SVAR.fradragsvaerdi() },
      { question: "Hvilke renter kan jeg få fradrag for?", answer: "Du kan få fradrag for renter på boliglån (realkreditlån og banklån), billån, studielån, forbrugslån, og kassekreditter. Renter på SU-lån giver også fradrag." },
      { question: "Hvornår får jeg rentefradraget?", answer: "Rentefradraget indregnes automatisk i din forskudsopgørelse, hvis du har indberettet dine lån. Du får dermed lavere skat hen over året. Alternativt får du overskydende skat tilbage ved årsopgørelsen." },
      { question: "Hvordan påvirker rentefradrag min boligøkonomi?", answer: "Rentefradraget gør det billigere at have lån, fordi staten betaler en del af dine renteudgifter via skatten. Det kan gøre det mere attraktivt at låne til bolig frem for at leje." },
      { question: "Skal jeg gøre noget for at få rentefradrag?", answer: "Nej, banker og realkreditinstitutter indberetter automatisk dine renteudgifter til Skattestyrelsen. Du skal dog kontrollere, at beløbene er korrekte i din forskudsopgørelse." },
      { question: "Hvad er negativ kapitalindkomst?", answer: "Negativ kapitalindkomst opstår, når dine renteudgifter er større end dine kapitalindtægter (f.eks. renteindtægter fra opsparing). Det er den negative kapitalindkomst, du får fradrag for." },
      { question: "Falder rentefradraget?", answer: RENTEFRADRAG_FAQ_SVAR.falder() },
      { question: "Er der et loft på rentefradraget?", answer: RENTEFRADRAG_FAQ_SVAR.loft() },
      { question: "Hvad er rentefradraget værd i procent?", answer: RENTEFRADRAG_FAQ_SVAR.effektiv() },
      { question: "Skal par fordele rentefradraget mellem sig?", answer: RENTEFRADRAG_FAQ_SVAR.par() },
      ],
    },
    "boligstoette": {
      slug: "boligstoette",
       title: "Beregn boligstøtte 2026: standardmaksima og formue",
       description: "Beregn boligstøtte 2026 ud fra husstandsindkomst, formue og areal. Standardmaksima og formuegrænser med kilde. Vejledende — fortsæt hos Udbetaling Danmark.",
       metaTitle: "Beregn boligstøtte 2026: standardmaksima og formue",
       metaDescription: "Beregn boligstøtte 2026. Se standardmaksima og formuegrænser. Vejledende — fortsæt hos Udbetaling Danmark.",
      keywords: ["boligstøtte beregner", "boligstøtte 2026", "beregn boligstøtte", "boligsikring", "huslejetilskud", "boligydelse", "boligstøtte satser", "udbetaling danmark boligstøtte"],
       ogTitle: "Beregn boligstøtte 2026: standardmaksima og formue",
       ogDescription: "Beregn boligstøtte 2026 ud fra husstandsindkomst, formue og areal. Standardmaksima og formuegrænser med kilde.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
       schemaName: "Boligstøtte-standardinterval 2026",
      schemaDescription: "Vejledende standardmaksima og formuegrænser for boligstøtte 2026. Husstand, areal og indkomst indgår i den officielle beregning.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvem kan få boligstøtte?", answer: "Boligstøtte gælder som udgangspunkt lejere i en egnet bolig med eget køkken, der bor fast i boligen. Udbetaling Danmark vurderer også indkomst, formue, antal børn og voksne, husleje og areal." },
      { question: "Hvad er forskellen på boligstøtte og boligsikring?", answer: "Boligstøtte er et tilskud fra staten til lejere i den private boligsektor, og det er det denne beregner viser. Boligsikring er en obligatorisk opsparingsordning for købere af eksisterende bolig: du lånter mod din egen opsparing og betaler tilbage på vilkår, og du får ingen månedlig ydelse. Den administreres af Realkredit Danmark, ikke af Udbetaling Danmark." },
      { question: "Hvordan søger jeg boligstøtte?", answer: "Brug først den officielle vejledende beregner på boligstoette.dk. Du kan fortsætte uden login og senere sende en ansøgning. Udbetaling Danmark afgør det endelige beløb." },
      { question: "Hvornår får jeg boligstøtte udbetalt?", answer: "Når ansøgningen er godkendt, udbetales boligstøtte månedsvist forud. Udbetaling Danmarks beregning og besked om din ansøgning afgør den konkrete udbetaling." },
      { question: "Påvirker min formue boligstøtten?", answer: "Der er ingen øvre ret til at få boligstøtte alene på grund af formue. Formuen kan dog regnes med i vurderingen af indkomsten. Ikke-pensionister og førtidspensionister efter nye regler har én gruppe grænser, mens folkepensionister og førtidspensionister før 2003 har en anden." },
      { question: "Hvad sker der, hvis min indkomst ændrer sig?", answer: "Du skal give Udbetaling Danmark besked om ændringer i indkomst, husstandens størrelse eller husleje. Beregningen og eventuel efterregulering sker derefter ud fra de nye oplysninger." },
      { question: "Hvor kommer arealet fra?", answer: "Hvis du slår din adresse op, henter vi boligens areal fra BBR (Bygnings- og Boligregistret) via Datafordeleren. For lejligheder bruges den konkrete lejligheds areal. Tjek, at tallet passer med din lejekontrakt, og ret det, hvis det ikke gør. Vi gemmer ikke adressen." },
      ],
    },
    "husleje": {
      slug: "husleje",
      title: "Husleje Budget Beregner - Hvad har du råd til? | MinBeregner.dk",
      description: `Hvad har du råd til i husleje? ${huslejeSvaer}. Beregn dit huslejebudget ud fra din indkomst og udgifter. Gratis beregner.`,
      metaTitle: "Husleje Budget Beregner - Hvad har du råd til?",
      metaDescription: `Hvad har du råd til i husleje? ${huslejeSvaer}. Beregn dit huslejebudget ud fra indkomst og udgifter.`,
      keywords: ["husleje beregner", "hvad har jeg råd til i husleje", "husleje budget", "30% reglen husleje", "bolig budget", "lejlighed budget", "hvad må husleje koste", "nettoprisindeks husleje beregner", "nettoprisindeks", "pristalsregulering husleje", "hvad koster en gennemsnitlig husleje", "huslejestigning"],
      ogTitle: "Husleje Budget Beregner - Find din max husleje",
      ogDescription: "Beregn hvor meget du kan bruge på husleje. Baseret på din indkomst og udgifter.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Husleje Budget Beregner - Hvad har du råd til?",
      schemaDescription: "Gratis husleje beregner. Find ud af hvor meget du kan bruge på husleje baseret på din indkomst og udgifter.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvor meget af min løn bør gå til husleje?", answer: `Den klassiske tommelfingerregel er max 30 % af din nettoindkomst — altså ${kr(HUSLEJE_EKSEMPEL.maxBoligudgifter)} kr i husleje, el, vand og varme for en nettoløn på ${kr(HUSLEJE_STANDARD.maanedligNettoLoen)} kr. Nogle eksperter siger 33 %, som ville give ${kr(HUSLEJE_EKSEMPEL.maxBoligudgifter33)} kr. Husk at trække el, vand og varme fra huslejen: beregneren har et eget felt til det, så tallet er huslejen og ikke hele boligbudgettet.` },
      { question: "Hvad inkluderer huslejen typisk?", answer: "Basis husleje inkluderer ofte kun lejen. A conto varme og vand kan være inkluderet. El betaler du næsten altid selv. Internet og TV er sjældent inkluderet." },
      { question: "Hvor meget skal jeg have i depositum?", answer: "Typisk 3 måneders husleje i depositum + eventuelt forudbetalt husleje. Spar op til dette inden du begynder at lede efter bolig." },
      { question: "Skal jeg have opsparing ud over husleje?", answer: "Ja, eksperter anbefaler at have 3-6 måneders udgifter i en nødfond. Plus løbende opsparing på mindst 10 % af din indkomst til fremtiden." },
      { question: "Er det bedre at leje eller købe?", answer: "Det afhænger af din situation. Leje giver fleksibilitet, køb opbygger formue. Som tommelfingerregel: Hvis du bliver 5+ år, kan køb ofte betale sig." },
      { question: "Hvad er typiske boligudgifter ud over husleje?", answer: "El (ca. 300-600 kr/md), internet (ca. 300 kr/md), indboforsikring (ca. 100-200 kr/md). Varme og vand er ofte a conto i huslejen." },
      { question: "Hvor kommer arealet fra?", answer: "I beregningen af husleje pr. m² kan du slå din adresse op, så henter vi boligens areal fra BBR (Bygnings- og Boligregistret) via Datafordeleren. For lejligheder bruges den konkrete lejligheds areal. Arealet i lejekontrakten kan afvige, så du kan altid rette tallet. Vi gemmer ikke adressen." },
      { question: "Hvor meget stiger huslejen efter nettoprisindekset?", answer: `Nettoprisindekset steg ${npiPct(NETTOPRISINDEKS_2026M08.aarsVaeksningPct)} % i ${NETTOPRISINDELS_MAANED}, så en husleje på 8.000 kr stiger med ${krH(beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct).stigning)} kr til ${krH(beregnHuslejestigning(8000, NETTOPRISINDEKS_2026M08.aarsVaeksningPct).efter)} kr om måneden. Nettoprisindekset er forbrugerprisindekset uden moms, told og afgifter, så de to kan stige hver for sig: i de samme 12 måneder steg nettoprisindekset ${npiRetning} forbrugerprisindeksets ${npiPct(FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct)} %. Skriv din egen husleje i feltet under "Hvor meget stiger huslejen efter nettoprisindekset?", så regner siden stigningen ud på dit beløb. Kilde: Danmarks Statistik PRIS04 og PRIS01, offentliggjort 10. september 2026.` },
      { question: "Hvad er forskellen på pristalsregulering og nettoprisindeks?", answer: `Nettoprisindekset er prisudviklingen uden moms, told og afgifter — ${npiPct(NETTOPRISINDEKS_2026M08.aarsVaeksningPct)} % i ${NETTOPRISINDELS_MAANED} — og det er grundlaget for huslejereguleringen: lejeloven § 5 justerer den eksisterende husleje efter nettoprisindekset. Forbrugerprisindekset er samme prisudvikling *med* de indirekte afgifter — ${npiPct(FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct)} % — så det også stiger, når en afgiftssats ændrer sig. Når lejeaftaler og aviser skriver "pristallet", er det ofte nettoprisindekset der menes.` },
      { question: "Hvem fastsætter huslejestigningen — huslejenævnet eller udlejeren?", answer: `Huslejestigningen for eksisterende lejemål fastsættes efter lejeloven § 5, som justerer huslejen efter nettoprisindekset. I kommuner med huslejenævnsvedtægt skal udlejeren indberette den påtænkte forhøjelse til huslejenævnet, som vurderer om den er urimelig — nævnet fastsætter altså ikke selv en sats pr. område. I øvrige kommuner afgør lejeaftalen alene, hvor meget huslejen må stige. Beregneren her kan derfor ikke sige, hvad din husleje bliver næste år — den viser, hvad du har til rådighed i dag. Er din husleje steget mere end din aftale tillader, kan du gøre ind på det over for udlejeren.` },
      ],
    },
    "andelsbolig": {
      slug: "andelsbolig",
      title: "Andelsbolig Beregner - Beregn månedlige omkostninger | MinBeregner.dk",
      description: "Beregn månedlige omkostninger ved køb af andelsbolig. Se boligafgift, lånydelse og sammenlign med lejebolig.",
      metaTitle: "Andelsbolig Beregner - Beregn månedlige omkostninger",
      metaDescription: "Beregn månedlige omkostninger ved køb af andelsbolig. Se boligafgift, lånydelse og sammenlign med lejebolig.",
      keywords: ["andelsbolig beregner", "andelsbolig pris", "køb andelsbolig", "andelsbolig omkostninger", "boligafgift", "andelskrone", "andel vs leje", "andelsbolig lån"],
      ogTitle: "Andelsbolig Beregner - Beregn månedlige omkostninger",
      ogDescription: "Beregn hvad det koster at købe andelsbolig og sammenlign med leje.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Andelsbolig Beregner",
      schemaDescription: "Beregn månedlige omkostninger ved køb af andelsbolig og sammenlign med lejebolig.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er en andelsbolig?", answer: "En andelsbolig er en bolig i en andelsboligforening, hvor du køber en andel af foreningen — ikke selve lejligheden. Du betaler en andelpris ved køb og en månedlig boligafgift, der dækker foreningens drift og fælleslån." },
      { question: "Hvad er andelskronen?", answer: "Andelskronen er en faktor, der bestemmer boligens værdi i forhold til den oprindelige indskudsværdi. En andelskrone på 1,0 betyder pålydende værdi. Over 1,0 betyder at boligen er steget i værdi. Andelskronen fastsættes årligt på generalforsamlingen." },
      { question: "Hæfter jeg for fælleslånet?", answer: "Ja, som andelshaver hæfter du solidarisk for foreningens fælleslån. Det betyder, at du i yderste konsekvens kan blive ansvarlig for andre andelshaveres andel af gælden. Tjek foreningens gæld og økonomi grundigt før køb." },
      { question: "Kan jeg få lån til andelsbolig?", answer: "Ja, de fleste banker tilbyder andelslån. Du kan typisk låne op til 95 % af købesummen. Renten er ofte lidt højere end på boliglån, da andelsboliger ikke kan belånes med realkreditlån." },
      { question: "Er andelsbolig billigere end ejerbolig?", answer: "Andelsboliger er typisk billigere at købe, men du betaler en løbende boligafgift. Den samlede månedlige udgift kan være lavere end en tilsvarende ejerbolig, men du opbygger ikke egenkapital på samme måde." },
      ],
    },
    "ejendomsvaerdiskat": {
      slug: "ejendomsvaerdiskat",
      title: "Ejendomsværdiskat beregner 2026 - Beregn din ejendomsskat | MinBeregner.dk",
      description: "Beregn ejendomsværdiskat og grundskyld med det nye boligskattesystem fra 2024. 5,1‰ / 14‰ satser, 80 % forsigtighedsfradrag, kommunale grundskyldspromiller. Gratis beregner med 2026 satser.",
      metaTitle: "Ejendomsværdiskat beregner 2026 - Beregn din ejendomsskat",
      metaDescription: "Beregn ejendomsværdiskat og grundskyld med boligskattesystemet fra 2024. Satser 5,1 ‰ / 14 ‰, 80 % forsigtighedsfradrag og kommunale grundskyldspromiller.",
      keywords: ["ejendomsvaerdiskat"],
      ogTitle: "Ejendomsværdiskat beregner 2026 - Beregn din ejendomsskat",
      ogDescription: "Beregn ejendomsværdiskat og grundskyld med det nye boligskattesystem fra 2024. 5,1‰ / 14‰ satser, 80 % forsigtighedsfradr",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Ejendomsværdiskat beregner 2026",
      schemaDescription: "Beregn din ejendomsværdiskat og grundskyld med det nye boligskattesystem. 5,1‰ / 14‰ satser og kommunale grundskyldspromiller.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er ejendomsværdiskatten i 2026?", answer: "Ejendomsværdiskatten beregnes som 5,1‰ (0,51 %) af 80 % af ejendomsværdien op til progressionsgrænsen på 9.007.000 kr, og 14‰ (1,4 %) af beløbet derover. De 80 % skyldes forsigtighedsfradraget på 20 %." },
      { question: "Hvad er forsigtighedsfradraget?", answer: "Forsigtighedsfradraget er 20 % af den offentlige vurdering. Du betaler kun skat af 80 % af den vurderede ejendomsværdi og grundværdi. Fradraget kompenserer for usikkerheden i de nye vurderinger." },
      { question: "Hvad er grundskyld?", answer: "Grundskyld er en skat på din grunds værdi (ikke bygningen). Den beregnes som kommunens grundskyldspromille ganget med 80 % af grundværdien. Promillen varierer fra 3,1‰ (Frederiksberg) til 17,7‰ (Varde)." },
      { question: "Hvad er progressionsgrænsen for ejendomsværdiskat?", answer: "Progressionsgrænsen er 9.007.000 kr for 2026-2027 (beskatningsgrundlag efter forsigtighedsfradrag). Det svarer til en ejendomsværdi på ca. 11,3 mio. kr. Beløbet over grænsen beskattes med 14‰ i stedet for 5,1‰." },
      { question: "Hvornår betaler man ejendomsskat?", answer: "Ejendomsskatten betales via din ejendomsskattebillet fra kommunen. Betalingen sker typisk i to rater — marts og september. Ejendomsværdiskatten opkræves via årsopgørelsen." },
      { question: "Hvad er overgangsordningen?", answer: "For at beskytte boligejere mod pludselige skattestigninger er der en overgangsordning. Hvis din skat stiger med det nye system, indfases stigningen gradvist over flere år via en skatterabat." },
      { question: "Gælder de nye regler for sommerhuse?", answer: "Ja, de nye ejendomsværdiskattesatser (5,1‰ / 14‰) og forsigtighedsfradraget gælder også for sommerhuse. Grundskyldspromillen afhænger af den kommune, sommerhuset ligger i." },
      { question: "Hvor finder jeg min ejendomsvurdering?", answer: "Du kan se din ejendomsvurdering på vurderingsportalen.dk. Her finder du både ejendomsværdi og grundværdi, som bruges til at beregne din ejendomsskat." },
      ],
    },
    "boernepenge": {
      slug: "boernepenge",
      title: "Børnepenge Beregner 2026 - Børne- og ungeydelse",
      description: boerneBeskrivelse(),
      metaTitle: `Børnepenge 2026: ${boerneTitelEksempel()}`,
      metaDescription: boerneMetaBeskrivelse(),
      keywords: ["børnepenge", "børnepenge beregner", "børne- og ungeydelse", "børnecheck", "børnepenge 2026", "børnetilskud", "hvad får jeg i børnepenge", "børneydelse beregner", "børnepenge satser", "børnepenge satser 2026", "ungeydelse 2026"],
      ogTitle: `Børnepenge 2026: ${boerneTitelEksempel()}`,
      ogDescription: "Beregn din børne- og ungeydelse med officielle 2026-satser. Se hvad du får udbetalt med ny deling mellem forældre.",
      category: "Familie",
      breadcrumbCategory: "Familie",
      breadcrumbCategoryHref: "/kategori/familie",
      schemaName: "Børnepenge Beregner - Børne- og ungeydelse",
      schemaDescription: "Gratis børnepenge beregner. Beregn din børne- og ungeydelse for 2026.",
      schemaCategory: "FinanceApplication",
      faqItems: boernepengeFaqItems(),
    },
    "barselsdagpenge": {
      slug: "barselsdagpenge",
      title: "Barselsdagpenge beregner 2026 - Se hvad du får udbetalt",
      description: `Hvad får du under barsel? Maks. sats 2026: ${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr./uge før skat og ${BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr./time ved ${BARSEL_2026.fullTimeHours} timer. Beregn din barselsdagpenge ud fra din løn og situation. Gratis beregner.`,
      metaTitle: "Barselsdagpenge beregner 2026 - Se hvad du får udbetalt",
      metaDescription: `Hvad får du under barsel? Maks. sats 2026: ${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr./uge før skat og ${BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr./time ved ${BARSEL_2026.fullTimeHours} timer. Beregn din barselsdagpenge ud fra din situation.`,
      keywords: ["barselsdagpenge", "barsel beregner", "barselsdagpenge 2026", "beregn barselsdagpenge", "hvad får jeg i barselsdagpenge", "dagpenge under barsel", "barselsorlov", "barsel sats", "mors barsel", "fars barsel"],
      ogTitle: "Barselsdagpenge beregner 2026",
      ogDescription: "Beregn hvad du får udbetalt under barsel. Gratis beregner med 2026 satser.",
      category: "Familie",
      breadcrumbCategory: "Familie",
      breadcrumbCategoryHref: "/kategori/familie",
      schemaName: "Barselsdagpenge beregner",
      schemaDescription: "Beregn hvad du får udbetalt i barselsdagpenge under barselsorlov.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvad er barselsdagpenge?", answer: "Barselsdagpenge er en ydelse fra Udbetaling Danmark, du kan få under barselsorlov, hvis du opfylder betingelserne for din situation." },
      { question: "Hvad er satsen for barselsdagpenge i 2026?", answer: `Den maksimale sats er ${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr. om ugen før skat ved ${BARSEL_2026.fullTimeHours} timer, svarende til ${BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. pr. time før skat. Hvis din timeløn er lavere, udbetales denne timeløn.` },
      { question: "Hvor længe kan jeg få barselsdagpenge?", answer: `Når forældrene bor sammen ved fødslen, har hver forælder som udgangspunkt ${BARSEL_2026.afterBirthWeeks} uger efter fødslen. Det er ${BARSEL_2026.earmarkedWeeks} øremærkede uger pr. forælder, og op til ${BARSEL_2026.maxTransferableWeeks} uger fra hver lønmodtager kan overdrages under særlige betingelser og som udgangspunkt inden for barnets første år. Far/medmor kan efter aftale med arbejdsgiveren fordele de ${BARSEL_2026.fatherAtBirthWeeks} uger ved fødslen fleksibelt inden for de første ${BARSEL_2026.firstTenWeeksAfterBirth} uger. Mor kan også holde ${BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen.` },
      { question: "Skal jeg betale skat af barselsdagpenge?", answer: "Ja, barselsdagpenge er skattepligtig indkomst. Den konkrete skat afhænger af din skattekorttype, ATP og andre forhold." },
      { question: "Hvad er forskellen på barselsdagpenge og løn under barsel?", answer: "Mange overenskomster giver ret til løn under barsel. Hvis din arbejdsgiver betaler løn, kan arbejdsgiveren modtage barselsdagpenge som refusion. Ellers udbetales den direkte til dig." },
      { question: "Kan selvstændige få barselsdagpenge?", answer: "Selvstændige og ledige har andre regler end lønmodtagere. Se Min barsel eller spørg Udbetaling Danmark, hvilke betingelser der gælder for din situation." },
      { question: "Hvordan ansøger jeg om barselsdagpenge?", answer: `Får du løn under barsel, skal du som udgangspunkt søge senest ${BARSEL_2026.applicationDeadlineWeeks} uger efter, at lønnen stopper. Hvis mor ikke får løn og holder mindst ${BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen, er fristen ${BARSEL_2026.applicationDeadlineWeeks} uger efter fødslen. Far/medmor skal søge senest ${BARSEL_2026.applicationDeadlineWeeks} uger efter første orlovsdag. En for sen ansøgning giver som udgangspunkt først ydelse fra den dag, Udbetaling Danmark modtager ansøgningen.` },
      { question: "Kan jeg arbejde deltid og stadig få barselsdagpenge?", answer: "Ja, du kan genoptage arbejdet delvist og få nedsat barselsdagpenge for de timer, du ikke arbejder. Det skal aftales med din arbejdsgiver." },
      { question: "Hvor mange kroner får jeg i barselsdagpenge efter skat?", answer: `Ved den maksimale sats på ${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr. om ugen er ydelsen ${Math.round(BARSEL_2026.maxWeeklyRate * 52 / 12).toLocaleString("da-DK")} kr. om måneden før skat. Trækker du ca. 30 % skat fra, lander du på ca. ${Math.round(estimerNettoMaaned({ loen: 0, ydelse: BARSEL_2026.maxWeeklyRate * 52 / 12 }).netto).toLocaleString("da-DK")} kr. om måneden. Skatten afhænger af din kommuneskat, af om du er under 58 år, og af hvilken anden indkomst du har.` },
      { question: "Er barselsdagpenge AM-bidragspligtig?", answer: `Nej. Barselsdagpenge er ikke AM-bidragspligtige, fordi det er en offentlig ydelse — det er kun løn, der bliver fratrukket 8 % AM-bidrag. Den er derimod skattepligtig som personlig indkomst, så du stadig betaler bundskat, kommuneskat og evt. mellemskat. Regnestykket på siden bruger ${BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. pr. time × ${BARSEL_2026.fullTimeHours} timer × 52 uger ÷ 12 måneder.` },
      ],
    },
    "barselsplanlaegger": {
      slug: "barselsplanlaegger",
      title: "Barselsplanlægger 2026 – planlæg jeres barsel uge for uge",
      description: "Læg jeres barselsplan i en kalender, se hvilke uger der er øremærkede, hvad I kan overføre, og hvad det betyder for økonomien måned for måned. Virker for mor og far, to mødre, to fædre, soloforældre, adoption og tvillinger. Gemmes kun i din browser.",
      metaTitle: "Barselsplanlægger 2026 – kalender, regler og økonomi",
      metaDescription: "Gratis barselsplanlægger: Planlæg barsel uge for uge med de nye regler, se øremærkede uger, overførsler, frister og økonomi. Print planen til arbejdsgiveren.",
      keywords: ["barselsplanlægger", "barselsplan", "barsel kalender", "planlæg barsel", "barselsorlov 2026", "øremærket barsel", "fordeling af barsel", "barsel tvillinger", "barsel soloforælder", "barselsplan arbejdsgiver"],
      ogTitle: "Barselsplanlægger 2026 – planlæg jeres barsel uge for uge",
      ogDescription: "Kalender, regler, økonomi og besked til arbejdsgiveren – gratis og kun i din browser.",
      category: "Familie",
      breadcrumbCategory: "Familie",
      breadcrumbCategoryHref: "/kategori/familie",
      schemaName: "Barselsplanlægger",
      schemaDescription: "Planlæg barselsorlov uge for uge efter barselsloven med kalender, validering, økonomi, print og besked til arbejdsgiveren.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvor mange ugers barsel har vi i 2026?", answer: `Når mor og far eller medmor bor sammen, har mor ${BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen og hver forælder ${BARSEL_2026.afterBirthWeeks} uger med barselsdagpenge efter fødslen – i alt 52 uger. Soloforældre har 22 ekstra uger, og ved flerlinger får hver forælder 13 ekstra uger.` },
        { question: "Hvad er øremærket barsel?", answer: `Hver forælder har 11 uger, der ikke kan overdrages: de 2 uger lige efter fødslen og ${BARSEL_2026.earmarkedWeeks} uger efter uge 10. De ${BARSEL_2026.earmarkedWeeks} uger skal holdes, inden barnet fylder 1 år, ellers går de tabt. Øremærkningen af de ${BARSEL_2026.earmarkedWeeks} uger gælder lønmodtagere – selvstændige og ledige kan overdrage dem.` },
        { question: "Hvor mange uger kan vi overføre til hinanden?", answer: `Far eller medmor kan overdrage op til ${BARSEL_2026.maxTransferableWeeks} uger. Mor kan overdrage 5 af sine uger efter uge 10 og derudover op til 8 af sine uger 3-10, hvis hun går tilbage på fuld tid eller i stedet starter sin forældreorlov. Planlæggeren fordeler automatisk ugerne og viser, hvor mange der er overført.` },
        { question: "Kan vi holde barsel på samme tid?", answer: "Ja. I må gerne holde orlov samtidig, fx de første uger efter fødslen. Husk, at uger holdt samtidig bruger af begges uger, så barnet samlet har en forælder hjemme i kortere tid." },
        { question: "Hvornår skal jeg give min arbejdsgiver besked?", answer: "Mor skal give besked senest 3 måneder før forventet fødsel. Far eller medmor skal senest 4 uger før fødslen varsle de 2 uger og anden orlov i de første 10 uger. Orlov efter uge 10 skal varsles senest 6 uger efter fødslen. Planlæggeren beregner datoerne for jer (barselsloven §§ 15-16)." },
        { question: "Hvad får man i barselsdagpenge i 2026?", answer: `Højst ${BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK")} kr. om ugen før skat ved ${BARSEL_2026.fullTimeHours} timer. Satsen beregnes af din timeløn efter AM-bidrag. Mange overenskomster giver løn under barsel i en del af perioden – det kan du lægge ind pr. forælder.` },
        { question: "Hvad gælder for soloforældre?", answer: "Har barnet kun én juridisk forælder, er der 22 ekstra uger med barselsdagpenge, i alt 46 uger efter fødslen. De ikke-øremærkede uger kan overdrages til forælderens egne forældre eller søskende over 18 år, som så varsler deres arbejdsgiver 8 uger før." },
        { question: "Hvad sker der ved tvillinger, eller hvis barnet bliver indlagt?", answer: "Ved flerlinger får hver forælder 13 ekstra uger, uanset antal børn. Er barnet indlagt inden for de første 46 uger, forlænges orloven med indlæggelsestiden – for børn født fra 1. januar 2026 med op til 12 måneder pr. forælder." },
        { question: "Kan man gemme barsel til senere?", answer: "Lønmodtagere kan udskyde op til 5 uger og holde dem, inden barnet fylder 9 år. Flere uger kræver en aftale med arbejdsgiveren. Man kan også aftale at gå delvist tilbage på arbejde, så orloven strækker sig over længere tid." },
        { question: "Gemmer I mine oplysninger?", answer: "Nej. Planen gemmes kun i din egen browser (localStorage), så den er der, når du kommer tilbage. Intet sendes til vores server. Et del-link indeholder planen i selve linket." },
      ],
    },
    "su": {
      slug: "su",
      title: "SU Beregner 2026 - Beregn din SU og fribeløb",
      description: `Beregn din SU 2026. Udeboende får ${kr(SU_2026.udeboende)} kr./md før skat, mens hjemmeboende har en samlet sats på ${kr(SU_2026.homewardBase)}-${kr(SU_2026.homewardMaximum)} kr. Se også fribeløb.`,
      metaTitle: "SU Beregner 2026 - Beregn din SU og fribeløb",
      metaDescription: `Beregn din SU 2026 før skat. Udeboende får ${kr(SU_2026.udeboende)} kr./md, mens hjemmeboende har en samlet sats på ${kr(SU_2026.homewardBase)}-${kr(SU_2026.homewardMaximum)} kr. Se også fribeløb.`,
      keywords: ["su beregner", "su 2026", "beregn su", "fribeløb", "su satser", "hvad får jeg i su", "su udeboende", "su hjemmeboende", "statens uddannelsesstøtte", "su-klip"],
      ogTitle: "SU Beregner 2026 - Beregn din SU og fribeløb",
      ogDescription: "Beregn din SU og tjek dit fribeløb med de officielle 2026-satser. Gratis SU-beregner.",
      category: "Uddannelse",
      breadcrumbCategory: "Uddannelse",
      breadcrumbCategoryHref: "/kategori/uddannelse",
      schemaName: "SU Beregner - Statens Uddannelsesstøtte",
      schemaDescription: "Gratis SU-beregner. Beregn din SU og fribeløb for 2026.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvor meget kan jeg få i SU 2026?", answer: `Som udeboende får du ${kr(SU_2026.udeboende)} kr. pr. måned før skat på videregående uddannelse og fra 20 år på ungdomsuddannelse. Aktuel hjemmeboende ordning er en samlet sats på ${kr(SU_2026.homewardBase)}-${kr(SU_2026.homewardMaximum)} kr., svarende til et tillæg på højst ${kr(SU_2026.homewardMaximumSupplement)} kr.` },
      { question: "Hvad er fribeløbet i 2026?", answer: `Månedsgrænserne gælder indkomst efter AM-bidrag: ${kr(SU_2026.freeAllowance.youthWithSu)} kr. på ungdomsuddannelse med SU og ${kr(SU_2026.freeAllowance.videregaaendeWithSu)} kr. på videregående uddannelse med SU, dobbelt SU eller slutlån. En indskrevet studerende uden SU har ${kr(SU_2026.freeAllowance.enrolledWithoutSu)} kr. Hvert barn under 18 år lægger ${kr(SU_2026.freeAllowance.childUnder18Annual)} kr. til årsfribeløbet, og en måned med handicaptillæg har et fribeløb på ${kr(SU_2026.freeAllowance.disabilityMonth)} kr.` },
      { question: "Hvem kan få SU?", answer: "SU kræver en godkendt uddannelse, dansk statsborgerskab eller ligestillet status og overholdelse af studieaktivitetsreglerne. På ungdomsuddannelse starter SU i kvartallet efter det 18. år. Der er ingen nedre aldersgrænse for SU på videregående uddannelse." },
      { question: "Hvor mange SU-klip får jeg?", answer: `Videregående uddannelser har i 2026 normalt en samlet ramme på ${SU_2026.suKlip} SU-klip. På ungdomsuddannelser fastsættes antallet efter uddannelsens længde.` },
      { question: "Hvad sker der, hvis jeg tjener over fribeløbet?", answer: "Når årsindkomsten overstiger årsfribeløbet, kan en del af udbetalt SU og slutlån blive nedsat eller tilbagebetalt. Det endelige beløb afhænger af den konkrete situation og beregnes af Udbetaling Danmark." },
      { question: "Kan jeg få SU-lån?", answer: `Du kan optage op til ${kr(SU_2026.loan.ordinaryMonthly)} kr. i almindeligt SU-lån pr. måned. Slutlån er op til ${kr(SU_2026.loan.finalMonthly)} kr. pr. måned i de seneste ${SU_2026.rules.finalLoanStandardMonths} måneder, i nogle tilfælde ${SU_2026.rules.finalLoanExtendedMonths} måneder. Renten er ${kr(SU_2026.loan.duringStudyRate * 100)} % under studiet og ${kr(SU_2026.loan.afterGraduationRate * 100)} % fra 1. juli 2026 efter uddannelsen.` },
      { question: "Hvad er forskellen på udeboende og hjemmeboende SU?", answer: `Udeboende på videregående uddannelse får ${kr(SU_2026.udeboende)} kr. pr. måned. Hjemmeboende får i den aktuelle ordning en samlet sats på ${kr(SU_2026.homewardBase)}-${kr(SU_2026.homewardMaximum)} kr. Den afhænger af forældrenes indkomstgrundlag to år tidligere.` },
      { question: "Hvad afhænger hjemmeboende SU af?", answer: `Hjemmeboende SU er ${kr(SU_2026.homewardBase)} kr. i grundsats plus et indkomstafhængigt tillæg på højst ${kr(SU_2026.homewardMaximumSupplement)} kr. Du får fuldt tillæg, hvis forældrenes indkomstgrundlag i ${SU_2026.parentalIncomeYear} er ${kr(SU_2026.parentalIncome.maxSupplementAtOrBelow)} kr. eller lavere, og intet tillæg, hvis det er ${kr(SU_2026.parentalIncome.noSupplementAtOrAbove)} kr. eller højere. For hver søskende under 18 år trækkes ${kr(SU_2026.parentalIncome.siblingUnder18Deduction)} kr. fra forældrenes indkomst.` },
      { question: "Hvad er forsørgertillægget?", answer: `Forsørgertillægget er ${kr(SU_2026.singleParentSupplement)} kr. pr. måned før skat til berettigede enlige forsørgere. Det er et tillæg til den øvrige SU, ikke en samlet SU-sats. Bor du sammen med en person på SU eller kontanthjælp efter sociallovens § 16, st. 1, er det ${kr(SU_2026.singleParentSupplementSharedHome)} kr.` },
      { question: "Kan jeg få et udlandsstudielån?", answer: `Ja. Udlandsstudielånet er op til ${kr(SU_2026.loan.abroadTotal)} kr. i alt i 2026 og dækker studieophold og/eller hel uddannelse i udlandet. Det er forudsat, at din egenbetaling er større end det, udlandsstipendiet dækker.` },
      { question: "Hvor er SU-satserne verificeret?", answer: `Se de linkede officielle kilder under SU-satserne, fribeløb og SU-lån. Alle tal er verificeret ${SU_2026.verifiedAt}.` },
      ],
    },
    "studielaan": {
      slug: "studielaan",
      title: "Studielån Beregner - Beregn tilbagebetaling af SU-lån | MinBeregner.dk",
      description: "Beregn din månedlige ydelse og tilbagebetalingstid for SU-lån. Se effekten af ekstra afdrag og total renteomkostning.",
      metaTitle: "Studielån Beregner - Beregn tilbagebetaling af SU-lån",
      metaDescription: "Beregn din månedlige ydelse og tilbagebetalingstid for SU-lån. Se effekten af ekstra afdrag og total renteomkostning.",
      keywords: ["studielån beregner", "SU-lån tilbagebetaling", "SU-lån rente", "studiegæld", "SU-lån afbetaling", "studielån ydelse", "tilbagebetal SU-lån"],
      ogTitle: "Studielån Beregner - Beregn tilbagebetaling af SU-lån",
      ogDescription: "Beregn månedlig ydelse og se afdragsplan for dit SU-lån.",
      category: "Uddannelse",
      breadcrumbCategory: "Uddannelse",
      breadcrumbCategoryHref: "/kategori/uddannelse",
      schemaName: "Studielån Beregner",
      schemaDescription: "Beregn månedlig ydelse og tilbagebetalingstid for SU-lån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvornår skal jeg begynde at betale SU-lån tilbage?", answer: `Tilbagebetalingen starter 1. januar året efter det år, hvor du afslutter eller afbryder din uddannelse. Almindelig SU-gæld betales typisk hver ${SU_2026.loan.repaymentFrequencyMonths}. måned, og løbetiden følger den oprindelige gæld.` },
      { question: "Hvad er renten på SU-lån?", answer: `Pr. ${SU_2026.verifiedAt} er den ${kr(SU_2026.loan.duringStudyRate * 100)} % under studiet og ${kr(SU_2026.loan.afterGraduationRate * 100)} % fra 1. juli 2026 efter uddannelsen. Renten er variabel og kan ændre sig.` },
      { question: "Kan jeg betale SU-lån hurtigere tilbage?", answer: "Ja, du kan til enhver tid betale ekstra af på dit SU-lån uden gebyr. Ekstra afdrag reducerer din restgæld og dermed din samlede renteomkostning. Selv små ekstra beløb gør en forskel." },
      { question: "Hvad sker der, hvis jeg ikke kan betale?", answer: "Kontakt Udbetaling Danmark hurtigst muligt. Du kan søge om nedsat ydelse eller midlertidigt betalingsstop, hvis du har lav indkomst. Ignorer ikke problemet — gælden vokser med renter." },
      { question: "Hvor lang tid har jeg til at betale SU-lån?", answer: `Den officielle løbetid afhænger af den oprindelige gæld: ${SU_2026.loan.repaymentMinYears} år op til ${SU_2026.loan.repaymentFirstBandMaxDebt.toLocaleString("da-DK")} kr. og op til ${SU_2026.loan.repaymentMaxYears} år fra ${SU_2026.loan.repaymentLastBandMinDebt.toLocaleString("da-DK")} kr. Beregneren kan vise et hypotetisk månedsscenario på ${SU_2026.loan.repaymentMinYears}-${SU_2026.loan.repaymentMaxYears} år, men det er ikke Udbetaling Danmarks endelige plan.` },
      ],
    },
    "rabat": {
      slug: "rabat",
      title: "Rabatberegner - beregn pris efter rabat",
      description: "Beregn prisen efter rabat og se, hvor mange procent du sparer. Indtast originalpris og rabatprocent, eller find rabatprocent ud fra tilbudspris.",
      metaTitle: "Rabatberegner - Beregn pris efter rabat & besparelse",
      metaDescription: "Gratis rabatberegner. Beregn pris efter rabat, find rabatprocent og se hvor meget du sparer. Perfekt til tilbud, udsalg og danske prissammenligninger.",
      keywords: ["rabatberegner", "beregn rabat", "pris efter rabat", "rabatprocent", "besparelse beregner", "tilbudspris beregner"],
      ogTitle: "Rabatberegner - Beregn pris efter rabat",
      ogDescription: "Beregn pris efter rabat og se, hvor mange procent du sparer. Indtast originalpris og rabatprocent.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Rabatberegner",
      schemaDescription: "Beregn pris efter rabat eller find rabatprocent mellem original- og tilbudspris.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvordan beregner man rabat?", answer: "Rabat i kroner = originalpris × rabatprocent / 100. Hvis en vare koster 400 kr og der er 25 % rabat, sparer du 100 kr og betaler 300 kr. Beregneren gør det automatisk for dig." },
        { question: "Hvordan finder man rabatprocenten?", answer: "Rabatprocent = (originalpris − tilbudspris) / originalpris × 100. Hvis en vare er sat ned fra 400 kr til 300 kr, er rabatprocenten 25 %. Beregneren regner det ud med det samme." },
        { question: "Hvad er forskellen på rabat og procent?", answer: "Rabat er et afslag i prisen, typisk angivet i procent. Det er det samme som procentregning: 'x% rabat' betyder, at du betaler (100 − x)% af originalprisen. Vores procentberegner kan også hjælpe med andre procentberegninger." },
        { question: "Kan beregneren håndtere decimaltal?", answer: "Ja, du kan indtaste priser og procenter med decimaler. Beregneren viser resultatet med to decimaler, så du får et præcist billede af, hvad du sparer." },
      ],
    },
    "befordringsfradrag": {
      slug: "befordringsfradrag",
      title: "Befordringsfradrag 2026 - Beregn dit kørselsfradrag",
      description: "Beregn dit befordringsfradrag for 2026. Se fradrag pr. dag, årlig skattebesparelse og ekstra fradrag. Opdateret med 2026-satser: 3,17 kr./km (25-120 km), 1,59 kr./km (over 120 km).",
      metaTitle: "Befordringsfradrag 2026 - Beregn dit kørselsfradrag",
      metaDescription: "Gratis befordringsfradrag 2026: 3,17 kr./km for 25-120 km, 1,59 kr./km over 120 km. Beregn kørselsfradraget og skattebesparelsen.",
      keywords: ["befordringsfradrag", "kørselsfradrag", "befordringsfradrag 2026", "kørselsfradrag 2026", "skattefradrag kørsel", "beregn befordringsfradrag", "kørsel mellem hjem og arbejde", "km fradrag"],
      ogTitle: "Befordringsfradrag 2026 - Beregn dit kørselsfradrag",
      ogDescription: "Beregn dit befordringsfradrag for 2026. Se fradrag pr. dag, årlig skattebesparelse og ekstra fradrag.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Befordringsfradrag beregner",
      schemaDescription: "Beregn befordringsfradrag for kørsel mellem hjem og arbejde med 2026-satser. Se fradrag pr. dag, årlig skattebesparelse og ekstra fradrag.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad er befordringsfradrag?", answer: "Befordringsfradrag (også kaldet kørselsfradrag) er et skattefradrag for transport mellem hjem og arbejde. Du kan få fradrag for kørsel over 24 km dagligt (12 km hver vej), uanset om du kører bil, cykel eller bruger offentlig transport. Satsen i 2026 er 3,17 kr./km for 25-120 km og 1,59 kr./km over 120 km." },
        { question: "Hvordan beregnes befordringsfradrag?", answer: "Fradraget beregnes som antal kørte km pr. dag over bundgrænsen på 24 km, ganget med satsen (3,17 kr. for 25-120 km, 1,59 kr. over 120 km) og ganget med antal arbejdsdage. Der kan også lægges brofradrag til (Storebælt: 110 kr/tur, Øresund: 50 kr/tur). Ved indkomst under 391.500 kr. gives desuden et ekstra fradrag på 64 % af kørselsfradraget, dog højst 30.800 kr." },
        { question: "Hvad er satsen for befordringsfradrag i 2026?", answer: "I 2026 er satserne 3,17 kr./km for 25-120 km dagligt og 1,59 kr./km over 120 km. I yderkommuner og visse småøer er satsen 3,51 kr./km. Bundgrænsen er 24 km pr. dag (12 km hver vej). Satserne er opdateret pr. 24. august 2026 fra skat.dk." },
        { question: "Hvad er ekstra befordringsfradrag?", answer: "Hvis din årlige indkomst før AM-bidrag er under 391.500 kr. (2026), får du et ekstra fradrag på 64 % af dit almindelige kørselsfradrag, dog højst 30.800 kr. Over 341.500 kr. nedtrappes det gradvist, og ved 391.500 kr. er det væk. Skat beregner det automatisk på årsopgørelsen." },
        { question: "Hvordan får jeg befordringsfradraget?", answer: "Befordringsfradraget indberetter du i SKATs forskudsopgørelse, så det bliver trukket fra din skat løbende hen over året. Du kan også rette det på årsopgørelsen året efter. Brug beregneren til at finde dit præcise fradrag, og indtast beløbet i din forskudsopgørelse." },
        { question: "Kan jeg få brofradrag?", answer: "Ja, hvis du krydser Storebæltsbroen eller Øresundsbroen på vej til arbejde, kan du få et ekstra fradrag pr. passage. I 2026 er det 110 kr. pr. Storebæltspassage i bil og 50 kr. pr. Øresundspassage i bil. Bruger du offentlig transport, er satserne lavere (hhv. 15 kr. og 8 kr.)." },
        { question: "Kan beregneren finde afstanden mellem hjem og arbejde?", answer: "Ja. Skriv din hjemadresse og arbejdsadresse, så finder beregneren den korteste køretur via OpenStreetMap og udfylder km tur/retur. Skat bruger den normale transportvej, som typisk er den korteste, men kan vurdere ruten anderledes – du kan altid rette tallet. Adresser og koordinater gemmes ikke." },
      ],
    },
    "ugedag": {
      slug: "ugedag",
      title: "Ugedagsberegner - hvilken ugedag er det?",
      description: "Find ugedagen for enhver dato og se hele ugen. Skriv din fødselsdato og se, hvilken ugedag du er født på.",
      metaTitle: `Ugedagsberegner: ${UGEDAG_EKSEMPEL.datoTekst} var en ${UGEDAG_EKSEMPEL.ugedagTekst.toLowerCase()}`,
      metaDescription: `Beregn ugedagen for enhver dato og se hele ugen med ISO-ugenummer. ${UGEDAG_EKSEMPEL.datoTekst} var en ${UGEDAG_EKSEMPEL.ugedagTekst.toLowerCase()}.`,
      keywords: ["ugedag", "hvilken ugedag er jeg født", "hvilken ugedag er det i dag", "ugedag beregner", "hvad ugedag er det", "ugedagsberegner", "find ugedag", "hvilken ugedag var"],
      ogTitle: `Ugedagsberegner: ${UGEDAG_EKSEMPEL.datoTekst} var en ${UGEDAG_EKSEMPEL.ugedagTekst.toLowerCase()}`,
      ogDescription: `Beregn ugedagen for enhver dato og se hele ugen med ISO-ugenummer.`,
      category: "Praktisk",
      breadcrumbCategory: "Praktisk",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Ugedagsberegner",
      schemaDescription: "Beregn hvilken ugedag en dato har, se hele ugen og ISO-ugenummeret.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvilken ugedag er jeg født?", answer: `Skriv din fødselsdato i feltet, så fortaller værktøjet hvilken ugedag du blev født på. Som eksempel: ${UGEDAG_EKSEMPEL.datoTekst} var en ${UGEDAG_EKSEMPEL.ugedagTekst.toLowerCase()}, altså uge ${UGEDAG_EKSEMPEL.uge}.` },
        { question: "Hvilken ugedag er det i dag?", answer: `Beregneren er forudindstillet med dagens dato. Du kan altid trykke på "I dag" for at komme tilbage til den, hvis du har indtastet en anden dato.` },
        { question: "Hvordan beregnes ugedagen?", answer: "Ugedagen følger den gregorianske kalender, og den kan regnes uden nogen undtagelse: 1. januar 2026 var en torsdag, og derfra tæller du syv dage frem for hver uge. Der er ingen forskel på almindelige år og skudår — en skudag er blot en ekstra tirsdag." },
        { question: "Hvad er forskellen på ISO-ugenummeret og kalenderugen?", answer: `ISO-ugenummeret tæller uger fra mandag til søndag, og uge 1 er den uge, der indeholder årets første torsdag. Derfor kan en dato i december tilhøre uge 1 af næste år. ${UGEDAG_JULEAFTEN.datoTekst} ligger i uge ${UGEDAG_JULEAFTEN.uge}, fordi 1. januar 2027 er en fredag.` },
        { question: "Hvor mange dage er der i et år?", answer: `2026 har ${UGEDAG_AAR_2026.dage} dage, fordi 2026 ikke er et skudår. Et skudår har 366 dage: 2024 havde ${dageIAar(2024).dage}, mens 1900 havde ${dageIAar(1900).dage} og 2000 havde ${dageIAar(2000).dage}. Reglen er, at hvert fjerde år er et skudår, undtagen de hundrede år der ikke er delelige med 400.` },
        { question: "Kan jeg finde ud af, hvor mange dage der er gået siden en dato?", answer: `Ja — brug ${"/dage-mellem-datoer"}s beregner, der tæller hele kalenderdage mellem to datoer. Fra 1. januar 2026 til 1. januar 2027 er der ${UGEDAG_DAGE_2026_2027} dage.` },
      ],
    },
    "ugenummer": {
      slug: "ugenummer",
      title: "Ugenummer - hvilken uge er det?",
      description: "Se hvilket ISO-ugenummer en dato har, ugens dag og hvor mange uger året har. Virker for enhver dato også omkring årsskiftet.",
      metaTitle: "Ugenummer beregner - Hvilken uge er det?",
      metaDescription: "Gratis ugenummer beregner. Se ISO-ugenummeret for enhver dato — også ved årsskifte, hvor uge 1 kan ligge i december. Inkl. ugedag og uger i året.",
      keywords: ["ugenummer", "hvilken uge er det", "uge beregner", "iso ugenummer", "uge i dag", "uge 2026", "datoer i uge", "datoer i uge 42", "ugens datoer"],
      ogTitle: "Ugenummer - Hvilken uge er det?",
      ogDescription: "Se ISO-ugenummeret for enhver dato, ugens dag og uger i året.",
      category: "Praktisk",
      breadcrumbCategory: "Praktisk",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Ugenummer beregner",
      schemaDescription: "Beregn ISO-ugenummer for en dato, se ugens dag og antal uger i året.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvilken uge er det?", answer: "Beregneren viser automatisk ugenummeret for dags dato. Du kan også vælge en anden dato for at se dens ugenummer." },
        { question: "Hvordan beregnes ISO-ugenummeret?", answer: "ISO 8601-reglen: uger starter på mandag, og uge 1 er den uge, der indeholder årets første torsdag. Det betyder, at dage omkring nytår kan tilhøre uge 52 eller 53 af det foregående år." },
        { question: "Hvor mange uger er der i 2026?", answer: "2026 har 53 uger, fordi 1. januar er en torsdag. Cirka hvert femte eller sjette år har 53 uger." },
        { question: "Hvorfor har nogle år 53 uger?", answer: "Et år har 53 uger, når året starter på en torsdag (almindelig år) eller på en onsdag (skudår). Det sker cirka hvert 5-6 år." },
        { question: "Hvilke datoer er der i uge 42?", answer: ugeDatoerFaqSvar(42, 2026) },
      ],
    },
    "flyttebudget": {
      slug: "flyttebudget",
      title: "Flyttebudget Beregner",
      description: "Beregn dit samlede flyttebudget — flyttemand, depositum, mægler, transport og mere.",
      metaTitle: "Flyttebudget Beregner - Hvad koster en flytning?",
      metaDescription: "Beregn dit flyttebudget med udgifter til flyttemand, depositum, mægler, istandsættelse og transport. Få overblik over alle flytteomkostninger. Gratis beregner.",
      keywords: ["flyttebudget beregner", "hvad koster en flytning", "flytteomkostninger", "flytning pris", "flytteudgifter", "beregn flytteomkostninger"],
      ogTitle: "Flyttebudget Beregner",
      ogDescription: "Beregn dit samlede flyttebudget med flyttemand, depositum, mægler og transport.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Flyttebudget Beregner",
      schemaDescription: "Gratis flyttebudget beregner. Beregn flytteomkostninger.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad koster en gennemsnitlig flytning i Danmark?", answer: "En flytning koster typisk 15.000-50.000 kr afhængig af om du både sælger/privatkøber, depositum på ny bolig og mængde af istandsættelse." },
        { question: "Hvad er den største udgift ved flytning?", answer: "Ejendomsmægler er ofte størst (25.000-50.000 kr), efterfulgt af depositum på ny lejebolig (typisk 3 mdrs. husleje) og istandsættelse." },
        { question: "Hvor meget koster en flyttemand?", answer: "En flyttemand koster typisk 5.000-15.000 kr for en standard 3-4 værelses lejlighed. Prisen afhænger af afstand, mængde og sæson." },
        { question: "Hvordan sparer jeg på flytningen?", answer: "Lej en flyttebil selv, rengør selv den gamle bolig, få flere tilbud på håndværkere, og sælg overskydende møbler inden flytning." },
      ],
    },
    "boligsalg": {
      slug: "boligsalg",
      title: "Boligsalg Beregner - Beregn salgsprovenu ved boligsalg",
      description: "Beregn dit nettoprovenu ved salg af bolig — mæglerhonorar, energimærke, tilstandsrapport, istandsættelse og alle andre omkostninger.",
      metaTitle: "Boligsalg Beregner - Beregn salgsprovenu ved boligsalg",
      metaDescription: "Beregn nettoprovenu ved boligsalg. Indtast salgspris og få alle salgsomkostninger — mægler, energimærke, tilstandsrapport, ejerskifteforsikring og flytning.",
      keywords: ["boligsalg beregner", "salgsprovenu beregner", "beregn boligsalg", "omkostninger ved salg af bolig", "nettoprovenu bolig", "hvad koster det at sælge sin bolig"],
      ogTitle: "Boligsalg Beregner - Beregn dit nettoprovenu",
      ogDescription: "Beregn dit nettoprovenu ved salg af bolig. Få overblik over alle salgsomkostninger.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Boligsalg Beregner",
      schemaDescription: "Gratis boligsalg beregner. Beregn nettoprovenu ved salg af bolig med mæglerhonorar, rapporter, istandsættelse og flere omkostninger.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad koster det at sælge en bolig i Danmark?", answer: "Omkostningerne afhænger af salgsprisen, mæglersalæret, istandsættelsen og de rapporter, du får udarbejdet. Beregneren summerer dem og viser dit nettoprovenu, så du selv kan se hvilke poster der vejer tungest." },
        { question: "Skal sælger betale tinglysning?", answer: "Sælger betaler normalt ikke tinglysning. Det er køber der betaler for nyt skøde og pantebrev. Øst for Storebælt deles tinglysningsafgiften dog ofte mellem køber og sælger. Beregneren kan medtage tinglysning af ny bolig hvis du også skal købe." },
        { question: "Hvad er et typisk mæglersalær?", answer: "Mæglersalæret er den største post i dit salgsregnestykke, fordi det følger salgsprisen. Beregneren regner med en procentandel, men du kan vælge et fast salær i stedet — og det er den post, der flytter mest at forhandle." },
        { question: "Hvordan får jeg det bedste salgsprovenu?", answer: "Få mindst tre mæglervurderinger og forhandl salæret, gør istandsættelsen selv når det kan lade sig gøre, og sælg de overskydende møbler i stedet for at flytte dem. Køb ingen ydelser, før du har set dit eget nettoprovenu i beregneren." },
      ],
    },
    "nutidskroner": {
      slug: "nutidskroner",
      title: "Nutidskroner - omregn et beløb til dagens prisniveau",
      description: "Se hvad et gammelt beløb svarer til i dag. Omregn kroner fra 1900 og frem med Danmarks Statistiks forbrugerprisindeks.",
      metaTitle: `Nutidskroner beregner: ${NUTIDSKRONER_TITEL_EKSEMPEL}`,
      metaDescription: "Gratis nutidskroner beregner. Omregn et beløb fra 1900 til i dag med forbrugerprisindekset og se, hvor meget priserne er steget. Kilde: Danmarks Statistik.",
      keywords: ["nutidskroner", "nutidskroner beregner", "omregn til nutidskroner", "beløb i nutidskroner", "forbrugerprisindeks", "prisindeks beregner", "omregning til nutidskroner", "hvad er 10000 kr værd i dag"],
      ogTitle: `Nutidskroner beregner: ${NUTIDSKRONER_TITEL_EKSEMPEL}`,
      ogDescription: "Omregn et beløb fra et tidligere år til dagens prisniveau med forbrugerprisindekset.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Nutidskroner beregner",
      schemaDescription: "Omregn et gammelt beløb til dagens prisniveau med Danmarks Statistiks forbrugerprisindeks.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hvad betyder nutidskroner?", answer: "Nutidskroner er et beløb fra et tidligere år regnet om til dagens prisniveau. Fordi priserne stiger over tid, kan et gammelt beløb ikke sammenlignes direkte med et beløb i dag — 10.000 kr. i 1980 kunne købe langt mere end 10.000 kr. kan i dag. Beregneren bruger forbrugerprisindekset fra Danmarks Statistik til at regne om." },
        { question: "Hvordan regner man et beløb om til nutidskroner?", answer: "Du ganger beløbet med forholdet mellem prisindekset i dag og prisindekset i det år, beløbet kommer fra: beløb × indeks(i dag) ÷ indeks(dengang). Indekset er en fælles målestok, så samme formel virker for et beløb fra 1900 og for et fra 2020." },
        { question: "Hvilket prisindeks bruger beregneren?", answer: "Beregneren bruger Danmarks Statistiks forbrugerprisindeks (årsgennemsnit), der måler prisudviklingen på et bredt gennemsnitligt dansk forbrug inkl. moms og afgifter. Tallene går tilbage til 1900, og «i dag» bruger den seneste offentliggjorte måned." },
        { question: "Hvor langt tilbage går tallene?", answer: "Indekset dækker helt tilbage til 1900, så du kan regne et beløb fra forrige århundrede om til nutidskroner. Jo længere tilbage beløbet er fra, jo større bliver forskellen — renters rente gælder også for priser." },
        { question: "Er nutidskroner det samme som nettoprisindekset?", answer: "Nej. Forbrugerprisindekset, som denne beregner bruger, inkluderer moms og afgifter, mens nettoprisindekset ser bort fra indirekte skatter. Det er nettoprisindekset, der bruges til at regulere huslejen i eksisterende lejemål — se husleje-beregneren for den regel." },
      ],
    },
    "maling": {
      slug: "maling",
      title: "Malingberegner – hvor meget maling skal du bruge?",
      description: "Beregn hvor mange liter maling du skal bruge til vægge og loft. Indtast rummets mål, antal strøg og malingens dækkevne.",
      metaTitle: "Malingberegner – beregn liter maling til vægge og loft",
      metaDescription: "Beregn hvor mange liter maling du skal bruge. Indtast rummets mål og antal strøg og få liter og maleareal med det samme.",
      keywords: ["maling beregner", "malingberegner", "hvor meget maling skal jeg bruge", "beregn maling", "liter maling", "maling pr m2", "hvor mange liter maling"],
      ogTitle: "Malingberegner – beregn liter maling til vægge og loft",
      ogDescription: "Indtast rummets mål og antal strøg og se, hvor mange liter maling du skal købe.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Malingberegner",
      schemaDescription: "Beregn hvor mange liter maling der skal bruges til vægge og loft ud fra rummets mål og antal strøg.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvor meget maling skal jeg bruge til et rum?", answer: "Regn vægarealet ud som 2 × (længde + bredde) × højde, gang med antal strøg og del med malingens dækkevne. Et rum på 5 x 4 m med 2,5 m til loftet har 45 m² væg. Skriv målene ind i beregneren, så får du literforbruget med det samme." },
        { question: "Hvor mange m² dækker en liter maling?", answer: `Det står på malingsdåsens eget datablad. En typisk vægmaling dækker ca. ${MALING_DAEKNING_M2_PR_LITER} m² pr. liter pr. strøg, men et sugende eller ru underlag bruger mere. Skriv malingens egen dækkevne ind i beregneren.` },
        { question: "Skal jeg regne med ét eller to strøg?", answer: "Regn med to strøg, når du skifter farve, eller når underlaget er sugende eller ujævnt. Skal du kun friske en ensfarvet væg op, kan ét strøg være nok — vælger du ét strøg i beregneren, halveres forbruget." },
        { question: "Hvorfor skal jeg lægge spild til?", answer: `Der skal altid lidt maling til hjørner, kanter og opretning bagefter. Branchen anbefaler ${MALING_STANDARD_SPILD_PCT} % ekstra, og det er den værdi, beregneren bruger.` },
        { question: "Skal døre og vinduer trækkes fra?", answer: "Ja, de skal ikke males. Mål dem og skriv det samlede areal i feltet «Døre og vinduer». Skal loftet også males, sætter du flueben i «Medregn loftet»." },
      ],
    },
    "tv-storrelse": {
      slug: "tv-storrelse",
      title: "TV-størrelse – hvor mange cm er et 55-tommers tv?",
      description: "Omregn tv'ets diagonale tommer til bredde og højde i centimeter. Se målene for 32 til 85 tommer og den anbefalede seerafstand.",
      metaTitle: "TV-størrelse i cm – hvor stort er et 55-tommers tv?",
      metaDescription: "Regn et tv's tommer om til centimeter. Se bredde og højde fra 32 til 85 tommer, og hvor langt væk du bør sidde fra skærmen.",
      keywords: ["tv størrelse", "hvor mange cm er 55 tommer", "tv størrelse i cm", "tommer til cm", "hvor stor er et 55 tommer tv", "seerafstand tv", "tv størrelse afstand"],
      ogTitle: "TV-størrelse i cm – regn tommer om til bredde og højde",
      ogDescription: "Skriv skærmens diagonal i tommer og se bredde, højde og anbefalet seerafstand med det samme.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "TV-størrelse beregner",
      schemaDescription: "Omregn et tv's diagonale tommer til bredde og højde i centimeter og se den anbefalede seerafstand.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvor mange cm er et 55-tommers tv?", answer: `Et 55-tommers tv i 16:9 har en diagonal på ${tvTal(TV_55.diagonalCm)} cm, er ${tvTal(TV_55.breddeCm)} cm bredt og ${tvTal(TV_55.hoejdeCm)} cm højt. Det er bredden og højden — ikke diagonalen — der afgør, om skærmen passer på væggen eller i møblet.` },
        { question: "Hvor langt væk skal man sidde fra et tv?", answer: `Der er ikke ét facit, men branchen anbefaler en vandret synsvinkel på ${SEERAFSTAND_NAER_GRAD}–${SEERAFSTAND_FJERN_GRAD} grader. For et 55-tommers tv betyder det en seerafstand på cirka ${tvTal(TV_55_AFSTAND.naerCm / 100)} til ${tvTal(TV_55_AFSTAND.fjernCm / 100)} meter. Sidder du tættere på, fylder skærmen mere af synsfeltet, hvilket kan føles mere biografagtigt, men også blive trættende i længden.` },
        { question: "Er et tv's tommer bredden eller diagonalen?", answer: "Tommerne angiver altid diagonalen — den længste afstand fra hjørne til hjørne. Et 55-tommers tv er derfor ikke 55 tommer bredt, men omkring 48 tommer (121,8 cm) bredt i 16:9. Bredden er typisk omkring 87 % af diagonalen." },
        { question: "Hvor bredt er et 65-tommers tv?", answer: `Et 65-tommers tv i 16:9 er ${tvTal(TV_65.breddeCm)} cm bredt og ${tvTal(TV_65.hoejdeCm)} cm højt, altså en diagonal på ${tvTal(TV_65.diagonalCm)} cm. Den anbefalede seerafstand er cirka ${tvTal(beregnSeerafstand(TV_65.breddeCm).naerCm / 100)} til ${tvTal(beregnSeerafstand(TV_65.breddeCm).fjernCm / 100)} meter.` },
        { question: "Hvad er forskellen på 16:9 og 21:9?", answer: "16:9 er det almindelige tv-format, hvor billedet er 16 enheder bredt for hver 9 højt. 21:9 er et ultrawide-format, der er bredere og lavere for samme diagonal — det giver en bredere billedflade uden sort bjælke under film, men passer sjældnere i et almindeligt tv-møbel." },
      ],
    },
    "laanekapacitet": {
      slug: "laanekapacitet",
      title: "Lånekapacitet – hvor meget kan du låne til bolig?",
      description:
        "Beregn hvor meget du kan låne til bolig ud fra indkomst, udbetaling og gæld. Se hvilken pris du kan købe for, og hvordan købet deles i realkredit, banklån og udbetaling.",
      metaTitle: "Lånekapacitet – hvor meget kan du låne til bolig?",
      metaDescription: `Beregn hvor meget du kan låne til bolig. Indtast indkomst, udbetaling og gæld og se, hvad du kan købe for med realkredit, banklån og udbetaling.`,
      keywords: [
        "lånekapacitet",
        "hvor meget kan jeg låne",
        "hvor meget kan jeg låne til hus",
        "hvor meget kan jeg købe bolig for",
        "låneevne",
        "gældsfaktor",
        "beregn lån til bolig",
      ],
      ogTitle: "Lånekapacitet – hvor meget kan du låne til bolig?",
      ogDescription:
        "Indtast indkomst, udbetaling og gæld og se, hvor meget du kan låne og købe bolig for.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Lånekapacitet",
      schemaDescription:
        "Beregn hvor meget du kan låne til bolig ud fra husstandsindkomst, udbetaling og eksisterende gæld.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        {
          question: "Hvor meget kan jeg låne til en bolig?",
          answer: `Det er den laveste af to grænser, der bestemmer: gældsfaktoren og udbetalingen. Med gældsfaktor ${GAELDSFAKTOR_STANDARD} må husstandens samlede gæld være ${GAELDSFAKTOR_STANDARD} gange årsindkomsten før skat, og udbetalingen skal som udgangspunkt være mindst ${UDBETALING_MIN_PCT} % af købesummen. Skriv dine tal ind i beregneren, så ser du både beløbet og hvilken grænse der binder.`,
        },
        {
          question: "Hvad er en gældsfaktor?",
          answer: `Gældsfaktoren er husstandens samlede gæld divideret med den årlige bruttoindkomst. Finanstilsynet anser som udgangspunkt en gældsfaktor over ${GAELDSFAKTOR_STANDARD} for høj — ikke som et loft, men som et punkt, hvor banken skal kunne begrunde lånet bedre. Derfor kan du vælge mellem 3,5, ${GAELDSFAKTOR_STANDARD} og 5 i beregneren.`,
        },
        {
          question: "Hvor stor en udbetaling skal jeg have?",
          answer: `Finanstilsynets vejledning bruger ${UDBETALING_MIN_PCT} % af købesummen som udgangspunkt for en passende udbetaling, og pengene skal som udgangspunkt være dine egne. På en bolig til ${LAANEKAPACITET_FAQ.maksBoligpris.toLocaleString("da-DK", { maximumFractionDigits: 0 })} kr. svarer det til ${LAANEKAPACITET_FAQ.kraevUdbetaling.toLocaleString("da-DK", { maximumFractionDigits: 0 })} kr.`,
        },
        {
          question: "Hvordan er boligkøbet finansieret?",
          answer: `Et boligkøb deles typisk i tre: realkredit kan dække op til ${REALKREDIT_MAKS_PCT} % af boligens værdi, de næste 15 % er et dyrere banklån, og de sidste ${UDBETALING_MIN_PCT} % er din egen udbetaling. På en bolig til ${LAANEKAPACITET_FAQ.maksBoligpris.toLocaleString("da-DK", { maximumFractionDigits: 0 })} kr. er det ca. ${LAANEKAPACITET_FAQ.realkreditDel.toLocaleString("da-DK", { maximumFractionDigits: 0 })} kr. i realkredit og ${LAANEKAPACITET_FAQ.banklaanDel.toLocaleString("da-DK", { maximumFractionDigits: 0 })} kr. i banklån.`,
        },
        {
          question: "Hvorfor sænker min gæld, hvor meget jeg kan låne?",
          answer:
            "Al anden gæld indgår i gældsfaktoren — billån, studielån, forbrugslån og hele kassekreditten, også selv om du ikke har brugt den. Derfor flytter det ofte mere at betale gæld ud end at få en tilsvarende lønstigning. Skriv din gæld i feltet «Anden gæld» for at se effekten.",
        },
      ],
    },
    "byggepris": {
      slug: "byggepris",
      title: "Byggepris – hvad koster det at bygge et hus?",
      description:
        "Beregn hvad det koster at bygge et nyt hus. Indtast boligareal og vælg standard, og se kvadratmeterpris og samlet byggepris eksklusiv grund.",
      metaTitle: `Byggepris: 150 m² typehus koster ${krHelt(beregnByggepris(150, "typehus").byggeprisMin)}-${krHelt(beregnByggepris(150, "typehus").byggeprisMax)} kr.`,
      metaDescription: `Beregn byggeprisen for et nyt hus. 150 m² typehus koster ${krHelt(beregnByggepris(150, "typehus").byggeprisMin)}-${krHelt(beregnByggepris(150, "typehus").byggeprisMax)} kr. ekskl. grund — indtast dit areal og standard.`,
      keywords: [
        "byggepris",
        "hvad koster det at bygge et hus",
        "byggepris beregner",
        "kvadratmeterpris nybyggeri",
        "bygge hus pris",
        "nybyg pris",
        "typehus pris",
      ],
      ogTitle: `Byggepris: 150 m² typehus koster ${krHelt(beregnByggepris(150, "typehus").byggeprisMin)}-${krHelt(beregnByggepris(150, "typehus").byggeprisMax)} kr.`,
      ogDescription: `Beregn hvad det koster at bygge et hus. Indtast boligareal og standard og se pris pr. m² og samlet byggepris.`,
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Byggeprisberegner",
      schemaDescription:
        "Beregn hvad det koster at bygge et nyt hus ud fra boligareal og standard.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        {
          question: "Hvor meget koster det at bygge et hus?",
          answer: `Det afhænger af størrelse og standard. Et typehus koster ${krHelt(BYGGEPRIS_NIVEAUER.typehus.min)}-${krHelt(BYGGEPRIS_NIVEAUER.typehus.max)} kr./m² inkl. moms, en totalentreprise ${krHelt(BYGGEPRIS_NIVEAUER.totalentreprise.min)}-${krHelt(BYGGEPRIS_NIVEAUER.totalentreprise.max)} kr./m² og et arkitekttegnet hus ${krHelt(BYGGEPRIS_NIVEAUER.arkitekttegnet.min)}-${krHelt(BYGGEPRIS_NIVEAUER.arkitekttegnet.max)} kr./m². Priserne dækker selve huset — ikke grund, byggemodning eller tilslutning.`,
        },
        {
          question: "Hvad er kvadratmeterprisen på et nyt hus?",
          answer: `Et typehus koster ${krHelt(BYGGEPRIS_NIVEAUER.typehus.min)}-${krHelt(BYGGEPRIS_NIVEAUER.typehus.max)} kr./m² inkl. moms. Jo større huset er, jo lavere bliver prisen pr. m², fordi køkken, bad og teknik fylder relativt mindre.`,
        },
        {
          question: "Hvad er forskellen på typehus og arkitekttegnet?",
          answer: `Et typehus bygges efter et standardkoncept med kendte materialer og processer og er det billigste at bygge. Et arkitekttegnet hus har unikt design, højere kompleksitet og dyrere materialer og koster typisk 20.000-30.000 kr./m² eller mere. En totalentreprise ligger imellem.`,
        },
        {
          question: "Hvad er ikke med i byggeprisen?",
          answer: `Byggeprisen dækker kun selve huset. Der skal lægges grund, byggemodning, tilslutningsafgifter, fundament og ofte arkitekthonorar til. Byggemodning og tilslutninger ligger typisk på 200.000-600.000 kr., og grundprisen varierer fra nogle hundrede tusinde kroner i landdistrikterne til flere millioner i og omkring de store byer.`,
        },
      ],
    },
    "elbil-lading": {
      slug: "elbil-lading",
      title: "Elbil-lading – hvad koster det at lade en elbil?",
      description: `Beregn hvad det koster at lade din elbil fra et ladningsniveau til et andet. Se prisen for opladningen, prisen pr. 100 km og den månedlige ladeomkostning.`,
      metaTitle: `Elbil-lading: ${krHelt(elbilLadingEksempel.kwhTilOpladning)} kWh koster ${krHelt(elbilLadingEksempel.prisForOpladning)} kr.`,
      metaDescription: `Beregn ladeomkostningen for en elbil. ${krHelt(elbilLadingEksempel.kwhTilOpladning)} kWh til ${krHelt(elbilLadingEksempel.prisForOpladning)} kr. ved ${krTal(elbilLadingStandarder.da.elpris)} kr/kWh — og se prisen pr. 100 km og pr. måned.`,
      keywords: ["elbil lading", "hvad koster det at lade en elbil", "elbil ladeomkostning", "ladekostnad elbil", "elbil opladning pris", "kwh pris elbil"],
      ogTitle: `Elbil-lading: ${krHelt(elbilLadingEksempel.kwhTilOpladning)} kWh koster ${krHelt(elbilLadingEksempel.prisForOpladning)} kr.`,
      ogDescription: `Beregn hvad det koster at lade din elbil. Se prisen for opladningen, pr. 100 km og pr. måned.`,
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Elbil-lading beregner",
      schemaDescription: "Beregn hvad det koster at lade en elbil: pris for opladningen, pr. 100 km og pr. måned.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hvad koster det at lade en elbil?", answer: `Det afhænger af batteriets størrelse, ladningsniveauerne og elprisen. Et batteri på ${krHelt(elbilLadingStandarder.da.batteriKwh)} kWh, der skal fyldes fra ${krHelt(elbilLadingStandarder.da.ladningNuPct)} til ${krHelt(elbilLadingStandarder.da.ladningTilPct)} procent, skal have ${krTal(elbilLadingEksempel.kwhTilOpladning)} kWh. Til ${krTal(elbilLadingStandarder.da.elpris)} kr/kWh koster det ${krTal(elbilLadingEksempel.prisForOpladning)} kr.` },
        { question: "Hvad koster det at køre 100 km i en elbil?", answer: `Med et forbrug på ${krTal(elbilLadingStandarder.da.forbrugKwh100km)} kWh/100 km og en elpris på ${krTal(elbilLadingStandarder.da.elpris)} kr/kWh koster kørselen ${krTal(elbilLadingEksempel.prisPr100km)} kr. pr. 100 km — altså ${krTal(elbilLadingEksempel.prisPrKm)} kr. pr. km.` },
        { question: "Hvad koster det at lade en elbil pr. måned?", answer: `Kører du ${krHelt(elbilLadingStandarder.da.kmPrMaaned)} km pr. måned ved ${krTal(elbilLadingStandarder.da.forbrugKwh100km)} kWh/100 km, bruger det ${krHelt(elbilLadingEksempel.kwhPrMaaned)} kWh og koster det ${krTal(elbilLadingEksempel.maanedligPris)} kr. pr. måned at lade bilen hjemme.` },
        { question: "Er regningen præcis?", answer: "Beregningen viser energien bilen bruger. En hjemmeoplader er typisk omkring 85-90 % effektiv, så den reelle regning fra stikkontakten kan være lidt højere end beregnet. Elprisen kan også svinge gennem dagen, så en nat- eller spotprisaftale kan halvere regningen." },
        { question: "Hvad koster en hurtigladning?", answer: `Offentlig hurtigladning koster typisk mere end hjemmeladning — ofte 4-6 kr/kWh mod din elpris på ${krTal(elbilLadingStandarder.da.elpris)} kr/kWh. Skriv den pris du betaler i elpris-feltet for at se forskellen.` },
      ],
    },
};

// ─── NORWEGIAN (no) PAGE DATA ──────────────────────────────────────────────

const noPages: Record<string, PageData> = {
    "bmi": {
      slug: "bmi",
      title: "BMI-kalkulator for voksne",
      description: "Beregn Body Mass Index (BMI) som voksen og se hvordan vekt og høyde forholder seg til hverandre. BMI-formelen bruker bare vekt og høyde.",
      metaTitle: "BMI-kalkulator for voksne - Beregn din BMI",
      metaDescription: "Beregn BMI på 5 sekunder. Eksempel: 75 kg / 1,75² = BMI 24,5 (normal). BMI-formelen justeres ikke for alder og er beregnet for voksne.",
      keywords: ["bmi kalkulator", "bmi voksne", "bmi", "body mass index", "beregn bmi", "vektintervall", "vektkalkulator", "helse kalkulator", "overvekt"],
      ogTitle: "BMI-kalkulator for voksne - Beregn din Body Mass Index",
      ogDescription: "Gratis BMI-kalkulator for voksne. Se hvordan vekten passer til høyden og finn BMI-intervallet.",
      category: "Helse",
      breadcrumbCategory: "Helse",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "BMI-kalkulator for voksne",
      schemaDescription: "Gratis BMI-kalkulator for voksne. Beregn Body Mass Index ut fra vekt og høyde.",
      schemaCategory: "HealthApplication",
      faqItems: [
      { question: "Hva er normal BMI for voksne?", answer: "For voksne ligger BMI normalt mellom 18,5 og 24,9. Under 18,5 regnes som undervekt, 25-29,9 som overvekt, og over 30 som fedme." },
      { question: "Er BMI pålitelig for alle?", answer: "BMI er et godt screeningverktøy, men har begrensninger. Svært muskuløse personer kan ha høy BMI uten å være overvektige." },
      { question: "Hvordan beregnes BMI?", answer: "BMI = vekt (kg) / høyde² (m). En person på 75 kg og 175 cm har BMI = 75 / 1,75² = 24,5. Formelen justeres ikke for alder." },
      { question: "Hva er mitt vektintervall for voksne?", answer: "Vektintervallet for voksne med BMI 18,5-24,9 ved høyde 175 cm er ca. 57-76 kg." },
      { question: "Gjelder BMI for barn?", answer: "Denne kalkulatoren er kun for voksne (18+). Den beregner rå BMI, men ikke barns percentil. For barn må du bruke alders- og kjønnsspesifikke percentiltabeller." },
      { question: "Hva kan jeg gjøre for å forbedre BMI-en min?", answer: "Ved overvekt: mer bevegelse og sunnere kosthold. Ved undervekt: hyppige, næringsrike måltider og styrketrening." },
      ],
    },
    "kalorier": {
      slug: "kalorier",
      title: "Kalorikalkulator",
      description: kalorierOverskrifter("no").description,
      metaTitle: kalorierOverskrifter("no").metaTitle,
      metaDescription: kalorierOverskrifter("no").metaDescription,
      keywords: ["kalorikalkulator", "daglig kaloriforbruk", "TDEE kalkulator", "BMR kalkulator", "vekttap kalorier", "makroer kalkulator", "proteinkalkulator"],
      ogTitle: kalorierOverskrifter("no").ogTitle,
      ogDescription: "BMR og TDEE basert på alder, kjønn, vekt, høyde og aktivitet – med makrofordeling.",
      category: "Helse",
      breadcrumbCategory: "Helse",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kalorikalkulator",
      schemaDescription: "Beregn BMR, TDEE og makrofordeling ut fra alder, kjønn, vekt, høyde og aktivitetsnivå.",
      schemaCategory: "HealthApplication",
      faqItems: kalorierFaqItems("no"),
    },
    "vaegttab": {
      slug: "vaegttab",
      title: "Vekttap Kalkulator",
      description: vaegttabNo.description,
      metaTitle: vaegttabNo.metaTitle,
      metaDescription: vaegttabNo.metaDescription,
      keywords: ["vekttap kalkulator", "kaloriunderskudd", "gå ned i vekt", "kalorier vekttap", "sunt vekttap", "kg per uke"],
      ogTitle: vaegttabNo.metaTitle,
      ogDescription: vaegttabNo.metaDescription,
      category: "Helse",
      breadcrumbCategory: "Helse",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Vekttap Kalkulator",
      schemaDescription: vaegttabNo.schemaDescription,
      schemaCategory: "HealthApplication",
      faqItems: vaegttabFaqItems("no"),
    },
    "procent": {
      slug: "procent",
      title: "Prosentkalkulator",
      description: "Beregn prosent av et tall, finn prosentvis økning eller nedgang, eller regn baklengs.",
      metaTitle: "Prosentkalkulator - Beregn prosent enkelt og gratis",
      metaDescription: `Beregn prosent raskt. Eksempel: ${PROCENT_NO.sats} % av ${PROCENT_NO.belob} kr = ${PROCENT_NO.svar} kr. Finn prosent av et tall, beregn økning/nedgang. Gratis prosentkalkulator.`,
      keywords: ["prosentkalkulator", "beregn prosent", "prosent av", "prosentvis økning", "prosentvis endring", "prosentregning"],
      ogTitle: "Prosentkalkulator - Beregn prosent enkelt",
      ogDescription: "Beregn prosent av et tall, finn økning/nedgang. Gratis prosentkalkulator.",
      category: "Matematikk",
      breadcrumbCategory: "Matematikk",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Prosentkalkulator",
      schemaDescription: "Gratis prosentkalkulator. Beregn prosent av et tall.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg prosent av et tall?", answer: "Gang tallet med X og del med 100. Eksempel: 25 % av 200 = 50." },
      { question: "Hvordan beregner jeg prosentvis økning?", answer: "((Ny - Gammel) / Gammel) × 100. Fra 100 til 125 = 25 % økning." },
      { question: "Hva er prosentpoeng vs prosent?", answer: "Prosentpoeng er absolutt endring, prosent er relativ. Renten fra 2 % til 3 % = 1 prosentpoeng men 50 % økning." },
      { question: "Hvordan legger jeg prosent til?", answer: "Gang med (1 + prosent/100). Legg 20 % til 150: 150 × 1,20 = 180." },
      ],
    },
"kvadratmeter": {
      slug: "kvadratmeter",
      title: "Kvadratmeterkalkylator",
      description: `Et rom på ${kvadratmeterEksempelAreal("no")}. Arealet er lengde × bredde, så ${kvadratmeterEksempelProdukt("no")}. Skriv pris per m², så kalkulatoren regner prisen på gulvet, flisene eller malingen.`,
      metaTitle: `Kvadratmeterkalkylator: ${kvadratmeterEksempelLignelse("no")}`,
      metaDescription: `Et rom på ${kvadratmeterEksempelAreal("no")}. Areal = lengde × bredde. Beregn rektangel, sirkel, trekant og trapes, og sett pris per m² for gulv, flis og maling.`,
      keywords: ["kvadratmeterkalkulator", "beregn kvadratmeter", "arealkalkulator", "m2 kalkulator", "beregn areal", "rom størrelse"],
      ogTitle: `Kvadratmeterkalkylator: ${kvadratmeterEksempelLignelse("no")}`,
      ogDescription: `${kvadratmeterEksempelAreal("no")}. Beregn areal av rektangler, sirkler, trekanter og trapes — og sett pris på gulv, flis og maling.`,
      category: "Matematikk",
      breadcrumbCategory: "Matematikk",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Kvadratmeterkalkulator",
      schemaDescription: `Beregn kvadratmeter: ${kvadratmeterEksempelAreal("no")}. Areal av rektangel, sirkel, trekant og trapes med pris per m².`,
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg kvadratmeter?", answer: kvadratmeterFaqSvar("no").grundregel! },
      { question: "Hva koster 20 m² gulv?", answer: kvadratmeterFaqSvar("no").gulvpris! },
      { question: "Hva er forskjellen på m² og m?", answer: "Meter måler lengde. Kvadratmeter måler areal/flate." },
      { question: "Omregning?", answer: kvadratmeterFaqSvar("no").omregning! },
      { question: "Hva koster gulv per m²?", answer: kvadratmeterFaqSvar("no").materialer! },
      ],
    },
    "alder": {
      slug: "alder",
      title: "Alderskalkulator",
      description: "Hvor gammel er du nøyaktig? Født 15. mars 1990 er du {ALDER} per {DATO}. Skriv inn fødselsdatoen, så teller vi hele år, måneder og dager.",
      metaTitle: "Alderskalkulator: født 15. mars 1990 = {AAR} år",
      metaDescription: "Hvor gammel er du nøyaktig? Født 15. mars 1990 = {ALDER} per {DATO}. Beregn alder i år, måneder, uker og dager.",
      keywords: ["alderskalkulator", "beregn alder", "hvor gammel er jeg", "nøyaktig alder", "alder i dager", "hvor mange dager har jeg levt", "hvor gammel er jeg i dager", "stjernetegn"],
      ogTitle: "Alderskalkulator: født 15. mars 1990 = {AAR} år",
      ogDescription: "Fødselsdatoen til i dag: alder i år, måneder, uker og dager. Eksempel: født 15. mars 1990 = {ALDER}.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Alderskalkulator",
      schemaDescription: "Beregn alderen din i år, måneder, uker og dager ut fra fødselsdatoen.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvor gammel er jeg nøyaktig?", answer: "Født 15. mars 1990 er du {ALDER} per {DATO}. Skriv inn din egen fødselsdato for å få alderen i år, måneder og dager." },
      { question: "Hvordan beregnes alderen min?", answer: "Vi teller hele år, måneder og dager fra fødselsdatoen din til i dag." },
      { question: "Hvor gammel er jeg i dager?", answer: "Alderen i dager er antallet dager mellom fødselsdatoen og i dag. Eksempel: født 15. mars 1990 er det gått {DAGE} per {DATO}." },
      { question: "Stjernetegn?", answer: "Stjernetegnet ditt bestemmes av fødselsdatoen. Det finnes 12 stjernetegn." },
      { question: "Skuddår?", answer: "Ja, kalkulatoren tar hensyn til skuddår og varierende månedslengder." },
      ],
    },
    "dato": {
      slug: "dato",
      title: "Datokalkulator",
      description: "Beregn antall dager mellom to datoer, legg til dager, eller beregn arbeidsdager.",
      metaTitle: "Datokalkulator - Beregn dager mellom datoer gratis",
      metaDescription: "Gratis datokalkulator. Beregn antall dager mellom to datoer, legg til dager, beregn arbeidsdager.",
      keywords: ["datokalkulator", "dager mellom datoer", "beregn dager", "arbeidsdager kalkulator", "legg til dager", "dato kalkulator"],
      ogTitle: "Datokalkulator - Beregn dager mellom datoer",
      ogDescription: "Beregn dager mellom datoer, arbeidsdager. Gratis datokalkulator.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Datokalkulator",
      schemaDescription: "Gratis datokalkulator. Beregn antall dager mellom to datoer.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg dager mellom to datoer?", answer: "Velg start- og sluttdato. Kalkulatoren viser dager, uker, måneder og arbeidsdager." },
      { question: "Teller kalkulatoren arbeidsdager korrekt?", answer: "Hverdager (mandag-fredag) telles. Helligdager er ikke inkludert." },
      { question: "Kan jeg trekke fra dager?", answer: "Ja! Skriv inn et negativt tall for å gå tilbake i tid." },
      { question: "Skuddår?", answer: "Ja, kalkulatoren håndterer skuddår korrekt." },
      ],
    },
    "tidsberegner": {
      slug: "tidsberegner",
      title: "Tidskalkulator",
      description: "Beregn tid mellom to tidspunkter. Perfekt for arbeidstid og timeregistrering.",
      metaTitle: "Tidskalkulator - Beregn timer og minutter mellom tidspunkter",
      metaDescription: "Beregn tid raskt. Eksempel: 08:30 til 16:45 = 8 timer 15 min. Perfekt for arbeidstid og timeregistrering. Gratis tidskalkulator.",
      keywords: ["tidskalkulator", "timer mellom tidspunkter", "arbeidstid kalkulator", "tid kalkulator", "timer og minutter", "timeregistrering"],
      ogTitle: "Tidskalkulator - Timer og minutter",
      ogDescription: "Beregn tid mellom to tidspunkter. Gratis tidskalkulator.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Tidskalkulator",
      schemaDescription: "Gratis tidskalkulator. Beregn tid mellom to tidspunkter.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg arbeidstid?", answer: "Skriv inn møtetidspunkt og sluttid. Trekk fra lunsjpause." },
      { question: "Hva er desimaltimer?", answer: "1,5 timer = 1 time og 30 minutter. Brukes til timeregistrering." },
      { question: "Tid over midnatt?", answer: "Ja, kalkulatoren håndterer tid over midnatt automatisk." },
      ],
    },
    "tidszone": {
      slug: "tidszone",
      title: "Tidssonekalkulator",
      description: "Omregn tid mellom tidssoner og se hva klokka er i andre land.",
      metaTitle: "Tidssonekalkulator - Omregn tid mellom land",
      metaDescription: "Hva er klokka i New York, Tokyo eller Sydney? Norge til New York: -6 timer. Omregn tid mellom tidssoner. Gratis tidssonekalkulator.",
      keywords: ["tidssonekalkulator", "tidssone omregner", "hva er klokka i", "tidsforskjell", "konverter tid", "world clock"],
      ogTitle: "Tidssonekalkulator - Omregn tid mellom land",
      ogDescription: "Se hva klokka er i andre land og omregn mellom tidssoner.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Tidssonekalkulator",
      schemaDescription: "Gratis tidssonekalkulator. Omregn tid mellom tidssoner.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Tidsforskjell Norge-USA?", answer: "New York: -6 timer. Los Angeles: -9 timer." },
      { question: "Sommertid i Norge?", answer: "Siste søndag i mars til siste søndag i oktober. UTC+2 sommer, UTC+1 vinter." },
      { question: "Hva er UTC?", answer: "Coordinated Universal Time - den internasjonale tidsstandarden." },
      { question: "Internasjonale møter?", answer: "Finn et tidspunkt som passer i alle tidssoner." },
      ],
    },
    "rejsebudget": {
      slug: "rejsebudget",
      title: "Reisebudsjett Kalkulator",
      description: "Beregn reisebudsjettet ditt til populære reisemål.",
      metaTitle: "Reisebudsjett Kalkulator - Hva koster en ferie?",
      metaDescription: "Beregn reisebudsjettet ditt til populære reisemål. Se estimerte utgifter til fly, hotell, mat og opplevelser. Gratis reisebudsjett kalkulator.",
      keywords: ["reisebudsjett kalkulator", "hva koster en ferie", "ferie budsjett", "reise pris", "feriebudsjett", "reiseutgifter"],
      ogTitle: "Reisebudsjett Kalkulator",
      ogDescription: "Beregn ditt samlede reisebudsjett med fly, hotell, mat og opplevelser.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Reisebudsjett Kalkulator",
      schemaDescription: "Gratis reisebudsjett kalkulator.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hva koster en ukes ferie i Sør-Europa?", answer: "Typisk 6.000-10.000 NOK per person for en standardreise." },
      { question: "Når er det billigst å reise?", answer: "Lavsesong: januar-mars og november for Sør-Europa." },
      { question: "Reiseforsikring?", answer: "Ja, alltid. Europeisk helsetrygdkort dekker kun offentlig behandling i EU/EØS." },
      { question: "Spare på reisebudsjettet?", answer: "Bestill i god tid, vær fleksibel med datoer, spis lokalt." },
      ],
    },
    "bryllup": {
      slug: "bryllup",
      title: "Bryllupsbudsjett Kalkulator",
      description: "Beregn bryllupsbudsjettet ditt. Se utgifter til lokale, mat, fotograf.",
      metaTitle: "Bryllupsbudsjett Kalkulator - Hva koster et bryllup?",
      metaDescription: "Beregn bryllupsbudsjettet ditt. Se utgifter til lokale, mat, fotograf, musikk, kjole og ringer. Gjennomsnittlige norske bryllupspriser 2026.",
      keywords: ["bryllupsbudsjett", "hva koster et bryllup", "bryllup pris", "bryllup kalkulator", "bryllup utgifter"],
      ogTitle: "Bryllupsbudsjett Kalkulator",
      ogDescription: "Beregn ditt samlede bryllupsbudsjett.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bryllupsbudsjett Kalkulator",
      schemaDescription: "Gratis bryllupsbudsjett kalkulator.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hva koster et bryllup i Norge?", answer: "150.000-350.000 NOK med 80-100 gjester." },
      { question: "Største utgiftspost?", answer: "Mat og drikke: 40-50 % av budsjettet." },
      { question: "Billigst å holde bryllup?", answer: "November-mars er typisk rimeligere." },
      { question: "Spare på budsjettet?", answer: "Buffet, DIY-dekorasjon, DJ i stedet for band." },
      ],
    },
    "konfirmation": {
      slug: "konfirmation",
      title: "Konfirmasjonsbudsjett Kalkulator",
      description: "Beregn budsjettet ditt til konfirmasjon.",
      metaTitle: "Konfirmasjonsbudsjett - Hva koster en konfirmasjon?",
      metaDescription: "Beregn budsjettet ditt til konfirmasjon. Se utgifter til mat, lokale, klær og fotograf. Beregn forventede gavebeløp fra familie og venner.",
      keywords: ["konfirmasjon budsjett", "konfirmasjon pris", "hva koster en konfirmasjon", "konfirmasjonsgave beløp", "konfirmasjon kalkulator"],
      ogTitle: "Konfirmasjonsbudsjett Kalkulator",
      ogDescription: "Beregn ditt samlede budsjett for konfirmasjon.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Konfirmasjonsbudsjett Kalkulator",
      schemaDescription: "Gratis konfirmasjonsbudsjett kalkulator.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hva koster en konfirmasjon?", answer: konfirmationFaqSvar("no").koster },
      { question: "Gavebeløp?", answer: konfirmationFaqSvar("no").gavebelob },
      { question: "Når er konfirmasjon?", answer: "Typisk mai i Norge." },
      { question: "Spare på festen?", answer: "Hold festen hjemme, lag maten selv." },
      ],
    },
    "braendstof": {
      slug: "braendstof",
      title: "Drivstoffkalkulator",
      description: "500 km bensin koster 450 kr. Ved 15 km/l bruker du 33,3 liter, og 33,3 l × 13,50 kr. = 450 kr. — 0,90 kr. per km. Beregn pris, forbruk og årlig kostnad for bensin, diesel og el.",
      metaTitle: "Drivstoffkalkulator: 500 km bensin koster 450 kr.",
      metaDescription: "500 km bensin koster 450 kr. ved 15 km/l og 13,50 kr./l — 0,90 kr. per km. Beregn pris, forbruk og årlig kostnad for bensin, diesel og el.",
      keywords: ["drivstoffkalkulator", "bensin kalkulator", "diesel kalkulator", "elbil kalkulator", "pris per km", "drivstofforbruk"],
      ogTitle: "Drivstoffkalkulator: 500 km bensin koster 450 kr.",
      ogDescription: "500 km bensin koster 450 kr. — 0,90 kr. per km. Beregn pris, forbruk og årlig kostnad for bensin, diesel og el.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Drivstoffkalkulator",
      schemaDescription: "Beregn pris for bensin, diesel og el: 500 km bensin koster 450 kr. ved 15 km/l og 13,50 kr./l.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hva koster 500 km med bensin?", answer: "Ved 15 km/l bruker turen 500 ÷ 15 = 33,3 liter. 33,3 l × 13,50 kr. = 450 kr., altså 0,90 kr. per km eller 90 kr. per 100 km." },
      { question: "Beregn drivstoffutgifter?", answer: "Distanse / km/l × literpris. 200 km / 15 km/l × 18 NOK/l = 240 NOK." },
      { question: "Normal km/liter?", answer: "Bensin: 12-18 km/l. Diesel: 15-22 km/l." },
      { question: "Er elbiler billigere?", answer: `Ja, når du bare regner på drivstoffet: ${pct(elModBenzinPct)} % billigere per km enn bensin (${krPrKm(elPris, 2)} mot ${krPrKm(benzinPris, 2)}). Mot diesel er besparingen ${pct(elModDieselPct)} %, fordi diesel allerede koster mindre per km (${krPrKm(dieselPris, 2)}). Beregningen bruker 13,50 kr./l bensin, 12,80 kr./l diesel og 2,50 kr./kWh el. Offentlig lading på 3-6 kr./kWh gjør el dyrere enn diesel over ${pct(elModDieselBreakEven)} kr./kWh.` },
      { question: "Hva påvirker forbruket?", answer: "Kjørestil, hastighet, vær, dekktrykk, air condition." },
      ],
    },
    "bil": {
      slug: "bil",
      title: "Bilkostnadskalkulator",
      description: "Beregn hva det reelt koster å eie og kjøre bil.",
      metaTitle: "Bilkostnadskalkulator - Se hva bilen din koster",
      metaDescription: "Se hva bilen din reelt koster. Typisk: 3,50-6,00 NOK/km inkl. verditap, drivstoff, forsikring og avgifter. Gratis kalkulator 2026.",
      keywords: ["bil kalkulator", "bilkostnader", "bilutgifter", "elbil vs bensin", "bil pris per km", "verditap bil"],
      ogTitle: "Bilkostnadskalkulator",
      ogDescription: "Gratis bilkalkulator. Beregn de reelle kostnadene ved å eie bil.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bilkostnadskalkulator",
      schemaDescription: "Gratis bilkalkulator. Beregn bilkostnader.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hva koster det å eie bil?", answer: "Typisk 3,50-6,00 NOK/km. For 15.000 km/år = ca. 5.000-8.000 NOK/md." },
      { question: "Største utgift?", answer: "Verditap: en ny bil taper 20-25 % det første året." },
      { question: "Elbil billigere?", answer: "Lavere drift, men høyere kjøpspris. Over tid ofte billigere i Norge pga. avgiftsfordeler." },
      { question: "Pris per km?", answer: "Samle alle årlige utgifter og del med kjørte km." },
      ],
    },
    "valuta": {
      slug: "valuta",
      title: "Valutakalkulator",
      description: "Omregn mellom NOK, EUR, USD, GBP, SEK, DKK og mange flere.",
      metaTitle: "Valutakalkulator - Omregn valuta online",
      metaDescription: "Gratis valutakalkulator. Omregn mellom NOK, EUR, USD, GBP, SEK, DKK og mange flere valutaer. Se veiledende kurser fra Norges Bank.",
      keywords: ["valutakalkulator", "valuta omregner", "omregn valuta", "nok til euro", "dollar til kroner", "valutakurs", "veksle penger"],
      ogTitle: "Valutakalkulator",
      ogDescription: "Omregn mellom norske kroner og andre valutaer.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Valutakalkulator",
      schemaDescription: "Gratis valutakalkulator. Omregn valuta.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "NOK til EUR?", answer: "Norske kroner flyter fritt. Kursen varierer med oljepris og markedsforhold." },
      { question: "Hvorfor svinger kurser?", answer: "Rentenivåer, inflasjon, handelsbalanse, oljepris og politisk stabilitet." },
      { question: "Hvor veksle?", answer: "Banker, vekslingskontor, flyplasser. Wise tilbyr ofte bedre kurser." },
      { question: "Kjøps- vs salgskurs?", answer: "Banken kjøper billigere og selger dyrere. Forskjellen = spread." },
      ],
    },
    "renteberegner": {
      slug: "renteberegner",
      title: "Rentekalkulator",
      description: `${formatBelob(renteHoved.hovedstol, "no")} kr i ${renteHoved.loebetid} år til ${renteHoved.aarsrente} % rente koster ${formatBelob(renteHoved.maanedligBetalning, "no")} kr i måneden i et annuitetslån. Total rente: ${formatBelob(renteHoved.samletRante, "no")} kr.`,
      metaTitle: `Rentekalkulator: ${formatBelob(renteHoved.hovedstol, "no")} kr i ${renteHoved.loebetid} år = ${formatBelob(renteHoved.maanedligBetalning, "no")} kr/md`,
      metaDescription: `Annuitetslån på ${formatBelob(renteHoved.hovedstol, "no")} kr med ${renteHoved.aarsrente} % rente i ${renteHoved.loebetid} år: ${formatBelob(renteHoved.maanedligBetalning, "no")} kr i måneden og ${formatBelob(renteHoved.samletRante, "no")} kr i total rente. Beregn også serielån.`,
      keywords: ["rentekalkulator", "lånekalkulator", "beregn lån", "månedlig betaling", "annuitetslån", "renteberegning"],
      ogTitle: `Rentekalkulator: ${formatBelob(renteHoved.hovedstol, "no")} kr i ${renteHoved.loebetid} år = ${formatBelob(renteHoved.maanedligBetalning, "no")} kr/md`,
      ogDescription: `${formatBelob(renteHoved.hovedstol, "no")} kr i ${renteHoved.loebetid} år til ${renteHoved.aarsrente} %: ${formatBelob(renteHoved.maanedligBetalning, "no")} kr i måneden og ${formatBelob(renteHoved.samletRante, "no")} kr i total rente.`,
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Rentekalkulator",
      schemaDescription: "Beregn månedlig betaling og total rente på et annuitetslån eller serielån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Annuitetslån vs serielån?", answer: "Annuitetslån: fast betaling. Serielån: fast avdrag, synkende betaling." },
      { question: `Hva er betalingen på ${formatBelob(renteHoved.hovedstol, "no")} kr med ${renteHoved.aarsrente} % rente i ${renteHoved.loebetid} år?`, answer: `Ca. ${formatBelob(renteHoved.maanedligBetalning, "no")} kr i måneden med annuitetslån, totalt ${formatBelob(renteHoved.samletRante, "no")} kr i rente over de ${Math.round(renteHoved.antalMaaneder)} avdragene.` },
      { question: "Effektiv rente?", answer: "Årlige kostnader inkl. gebyrer." },
      { question: "Fradrag?", answer: "Sjekk Skatteetaten for fradragsregler for renteutgifter." },
      ],
    },
    "opsparing": {
      slug: "opsparing",
      title: "Sparekalkulator",
      description: "Se hva sparepengene dine vokser til med rentes rente.",
      metaTitle: "Sparekalkulator - Rentes rente kalkulator",
      metaDescription: "Se hva sparepengene dine vokser til. Eksempel: 1.000 NOK/md i 30 år med 5 % rente = 830.000 NOK. Gratis kalkulator.",
      keywords: ["sparekalkulator", "rentes rente", "beregn sparing", "compound interest", "investering kalkulator"],
      ogTitle: "Sparekalkulator",
      ogDescription: "Beregn hva sparepengene vokser til med rentes rente.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Sparekalkulator",
      schemaDescription: "Gratis sparekalkulator. Beregn rentes rente.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hva er rentes rente?", answer: "Du tjener rente på renten. Over tid akselererer dette sparepengene dine." },
      { question: "Hvor mye spare?", answer: "10-20 % av inntekten. Selv små beløp vokser." },
      { question: "Realistisk rente?", answer: "Aksjer: ~7 %. Obligasjoner: 2-4 %. Bank: under 1 %." },
      ],
    },
    "laaneberegner": {
      slug: "laaneberegner",
      title: "Lånekalkulator",
      description: "Beregn månedlig betaling og sammenlign lån.",
      metaTitle: "Lånekalkulator",
      metaDescription: "Beregn månedlig betaling og sammenlign lån. Gratis kalkulator.",
      keywords: ["laaneberegner", "lånekalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Lånekalkulator",
      ogDescription: "Beregn månedlig betaling og sammenlign lån.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lånekalkulator",
      schemaDescription: "Gratis lånekalkulator. Beregn månedlig betaling og sammenlign lån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruker jeg denne kalkulatoren?", answer: "Skriv inn dataene dine og se resultatet umiddelbart. Lånekalkulator er gratis og enkel å bruke." },
      { question: "Er resultatene nøyaktige?", answer: "Kalkulatoren gir et godt estimat. Individuelle forhold kan påvirke det endelige resultatet." },
      { question: "Kan jeg bruke kalkulatoren på mobil?", answer: "Ja, kalkulatoren er fullt responsiv og fungerer på alle enheter." },
      ],
    },
    "billaan": {
      slug: "billaan",
      title: "Billånkalkulator",
      description: "Beregn billånet ditt. Se månedlig betaling.",
      metaTitle: "Billånkalkulator",
      metaDescription: "Beregn billånet ditt. Se månedlig betaling. Gratis kalkulator.",
      keywords: ["billaan", "billånkalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Billånkalkulator",
      ogDescription: "Beregn billånet ditt. Se månedlig betaling.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Billånkalkulator",
      schemaDescription: "Gratis billånkalkulator. Beregn billånet ditt. Se månedlig betaling.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruker jeg denne kalkulatoren?", answer: "Skriv inn dataene dine og se resultatet umiddelbart. Billånkalkulator er gratis og enkel å bruke." },
      { question: "Er resultatene nøyaktige?", answer: "Kalkulatoren gir et godt estimat. Individuelle forhold kan påvirke det endelige resultatet." },
      { question: "Kan jeg bruke kalkulatoren på mobil?", answer: "Ja, kalkulatoren er fullt responsiv og fungerer på alle enheter." },
      ],
    },
    "leasing": {
      slug: "leasing",
      title: "Leasing Kalkulator",
      description: "Beregn leasingbetaling og sammenlign leasing vs. billån.",
      metaTitle: "Leasing Kalkulator",
      metaDescription: "Beregn leasingbetaling og sammenlign leasing vs. billån. Gratis kalkulator.",
      keywords: ["leasing", "leasing kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Leasing Kalkulator",
      ogDescription: "Beregn leasingbetaling og sammenlign leasing vs. billån.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Leasing Kalkulator",
      schemaDescription: "Gratis leasing kalkulator. Beregn leasingbetaling og sammenlign leasing vs. billån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruker jeg denne kalkulatoren?", answer: "Skriv inn dataene dine og se resultatet umiddelbart. Leasing Kalkulator er gratis og enkel å bruke." },
      { question: "Er resultatene nøyaktige?", answer: "Kalkulatoren gir et godt estimat. Individuelle forhold kan påvirke det endelige resultatet." },
      { question: "Kan jeg bruke kalkulatoren på mobil?", answer: "Ja, kalkulatoren er fullt responsiv og fungerer på alle enheter." },
      ],
    },
    "forbrugslaan": {
      slug: "forbrugslaan",
      title: "Forbrukslån Kalkulator",
      description: "Beregn månedlig betaling på forbrukslån.",
      metaTitle: "Forbrukslån Kalkulator",
      metaDescription: "Beregn månedlig betaling på forbrukslån. Gratis kalkulator.",
      keywords: ["forbrugslaan", "forbrukslån kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Forbrukslån Kalkulator",
      ogDescription: "Beregn månedlig betaling på forbrukslån.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Forbrukslån Kalkulator",
      schemaDescription: "Gratis forbrukslån kalkulator. Beregn månedlig betaling på forbrukslån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruker jeg denne kalkulatoren?", answer: "Skriv inn dataene dine og se resultatet umiddelbart. Forbrukslån Kalkulator er gratis og enkel å bruke." },
      { question: "Er resultatene nøyaktige?", answer: "Kalkulatoren gir et godt estimat. Individuelle forhold kan påvirke det endelige resultatet." },
      { question: "Kan jeg bruke kalkulatoren på mobil?", answer: "Ja, kalkulatoren er fullt responsiv og fungerer på alle enheter." },
      ],
    },
    "gaeldsfri": {
      slug: "gaeldsfri",
      title: "Gjeldfri Kalkulator",
      description: "Beregn din vei ut av gjeld. Sammenlign lavine- og snøball-metoden.",
      metaTitle: "Gjeldfri Kalkulator",
      metaDescription: "Beregn din vei ut av gjeld. Sammenlign lavine- og snøball-metoden. Gratis kalkulator.",
      keywords: ["gaeldsfri", "gjeldfri kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Gjeldfri Kalkulator",
      ogDescription: "Beregn din vei ut av gjeld. Sammenlign lavine- og snøball-metoden.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Gjeldfri Kalkulator",
      schemaDescription: "Gratis gjeldfri kalkulator. Beregn din vei ut av gjeld. Sammenlign lavine- og snøball-metoden.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvordan bruker jeg denne kalkulatoren?", answer: "Skriv inn dataene dine og se resultatet umiddelbart. Gjeldfri Kalkulator er gratis og enkel å bruke." },
      { question: "Er resultatene nøyaktige?", answer: "Kalkulatoren gir et godt estimat. Individuelle forhold kan påvirke det endelige resultatet." },
      { question: "Kan jeg bruke kalkulatoren på mobil?", answer: "Ja, kalkulatoren er fullt responsiv og fungerer på alle enheter." },
      ],
    },
    "boliglaan": {
      slug: "boliglaan",
      title: "Boliglånkalkulator",
      description: "Beregn boliglånet ditt. Se månedlig betaling og skattefradrag.",
      metaTitle: "Boliglånkalkulator",
      metaDescription: "Beregn boliglånet ditt. Se månedlig betaling og skattefradrag. Gratis kalkulator.",
      keywords: ["boliglaan", "boliglånkalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Boliglånkalkulator",
      ogDescription: "Beregn boliglånet ditt. Se månedlig betaling og skattefradrag.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Boliglånkalkulator",
      schemaDescription: "Gratis boliglånkalkulator. Beregn boliglånet ditt. Se månedlig betaling og skattefradrag.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hvor mye kan jeg låne?", answer: "Normalt inntil 85 % av boligens verdi (85 % belåningsgrad). 15 % egenkapital." },
      { question: "Fast vs flytende rente?", answer: "Fast: fast betaling i avtalt periode. Flytende: endres med markedet, ofte lavere." },
      { question: "Rentefradrag?", answer: "Du kan trekke fra renteutgifter på selvangivelsen. Fradragsverdien er 22 % (skattesats)." },
      { question: "Avdragsfrihet?", answer: "Noen banker tilbyr avdragsfrihet i perioder. Du betaler kun renter." },
      ],
    },
    "elberegner": {
      slug: "elberegner",
      title: "Strømkalkulator",
      description: "Beregn strømforbruket ditt og se hva apparatene koster i strøm.",
      metaTitle: "Strømkalkulator",
      metaDescription: "Beregn strømforbruket ditt og se hva apparatene koster i strøm. Gratis kalkulator.",
      keywords: ["elberegner", "strømkalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Strømkalkulator",
      ogDescription: "Beregn strømforbruket ditt og se hva apparatene koster i strøm.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Strømkalkulator",
      schemaDescription: "Gratis strømkalkulator. Beregn strømforbruket ditt og se hva apparatene koster i strøm.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Beregn strømforbruk?", answer: "Watt × timer / 1000 = kWh. 100W × 10t / 1000 = 1 kWh." },
      { question: "Pris per kWh i Norge?", answer: "Varierer mye. Typisk 0,50-2,00 NOK/kWh avhengig av spotpris og strømstøtte." },
      { question: "Største strømsluker?", answer: "Tørketrommel (3000W), ovn (2500W), vannkoker (2000W)." },
      { question: "Spare strøm?", answer: "Slå av standby, velg A+++-merkede apparater, LED-pærer." },
      ],
    },
    "solceller": {
      slug: "solceller",
      title: "Solcelle Kalkulator",
      description: "Beregn besparelse og tilbakebetalingstid for solceller.",
      metaTitle: "Solcelle Kalkulator",
      metaDescription: "Beregn besparelse og tilbakebetalingstid for solceller. Gratis kalkulator.",
      keywords: ["solceller", "solcelle kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Solcelle Kalkulator",
      ogDescription: "Beregn besparelse og tilbakebetalingstid for solceller.",
      category: "Bolig",
      breadcrumbCategory: "Bolig",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Solcelle Kalkulator",
      schemaDescription: "Gratis solcelle kalkulator. Beregn besparelse og tilbakebetalingstid for solceller.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Pris i Norge?", answer: "70.000-120.000 NOK for 4-8 kWp inkl. montering. Enova gir tilskudd." },
      { question: "Tilbakebetalingstid?", answer: "Typisk 8-15 år avhengig av strømpris og lokasjon." },
      { question: "Plusskunde?", answer: "Du kan selge overskuddsstrøm til strømnettet som plusskunde." },
      { question: "Batteri?", answer: "Øker selvforsyningsgraden, men øker tilbakebetalingstiden." },
      ],
    },
    "timepris": {
      slug: "timepris",
      title: "Timepris Kalkulator",
      description: "Finn din freelance timepris inkl. skatt, ferie og drift.",
      metaTitle: "Timepris Kalkulator",
      metaDescription: "Finn din freelance timepris inkl. skatt, ferie og drift. Gratis kalkulator.",
      keywords: ["timepris", "timepris kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Timepris Kalkulator",
      ogDescription: "Finn din freelance timepris inkl. skatt, ferie og drift.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Timepris Kalkulator",
      schemaDescription: "Gratis timepris kalkulator. Finn din freelance timepris inkl. skatt, ferie og drift.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Beregn timepris som frilanser?", answer: "Start med ønsket nettolønn, legg til skatt (~40 %), drift, ferie, sykdom og admin-tid." },
      { question: "Normal konsulent-timepris?", answer: markedsprisFaqSvar("no") },
      { question: "MVA på timepris?", answer: "Ja, 25 % MVA hvis omsetning over 50.000 NOK/år. Registrer hos Skatteetaten." },
      { question: "Fakturerbare timer?", answer: "Realistisk 100-130 timer/måned." },
      ],
    },
    "termin": {
      slug: "termin",
      title: "Termin Kalkulator",
      description: "Beregn terminsdatoen din og se svangerskapsuke.",
      metaTitle: "Termin Kalkulator",
      metaDescription: "Beregn terminsdatoen din og se svangerskapsuke. Gratis kalkulator.",
      keywords: ["termin", "termin kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "Termin Kalkulator",
      ogDescription: "Beregn terminsdatoen din og se svangerskapsuke.",
      category: "Helse",
      breadcrumbCategory: "Helse",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Termin Kalkulator",
      schemaDescription: "Gratis termin kalkulator. Beregn terminsdatoen din og se svangerskapsuke.",
      schemaCategory: "HealthApplication",
      faqItems: [
      { question: "Hvordan beregnes termindatoen?", answer: "280 dager (40 uker) fra første dag i siste menstruasjon." },
      { question: "Hvor nøyaktig?", answer: "Ca. 5 % fødes på termindatoen. De fleste mellom uke 38 og 42." },
      { question: "Foreldrepermisjon i Norge?", answer: "Totalt 49 uker med 100 % dekning eller 59 uker med 80 % dekning via NAV." },
      { question: "Tre trimestre?", answer: "1. trimester: uke 1-12. 2. trimester: uke 13-26. 3. trimester: uke 27-40." },
      ],
    },
    "moms": {
      slug: "moms",
      title: "MVA Kalkulator",
      description: "Beregn norsk MVA (25 %). Legg til, trekk fra eller finn MVA-andelen.",
      metaTitle: "MVA Kalkulator",
      metaDescription: "Beregn norsk MVA (25 %). Legg til, trekk fra eller finn MVA-andelen. Gratis kalkulator.",
      keywords: ["moms", "mva kalkulator", "kalkulator", "gratis", "2026"],
      ogTitle: "MVA Kalkulator",
      ogDescription: "Beregn norsk MVA (25 %). Legg til, trekk fra eller finn MVA-andelen.",
      category: "Økonomi",
      breadcrumbCategory: "Økonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "MVA Kalkulator",
      schemaDescription: "Gratis mva kalkulator. Beregn norsk MVA (25 %). Legg til, trekk fra eller finn MVA-andelen.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hva er den norske MVA-satsen?", answer: "Standard MVA-sats i Norge er 25 %. Redusert sats er 15 % (mat) og 12 % (transport, kino)." },
      { question: "Hvordan beregner man MVA?", answer: "Legg til: gang med 1,25. Trekk fra: del med 1,25. 100 NOK ekskl. = 125 NOK inkl." },
      { question: "Hva er MVA-andelen?", answer: "MVA-andelen i en pris inkl. MVA er 20 % (25/125 = 0,20)." },
      { question: "Når kan virksomheter trekke fra MVA?", answer: "MVA-registrerte virksomheter kan trekke fra inngående MVA og rapporterer til Skatteetaten." },
      ],
    },
    "pace": {
      slug: "pace",
      title: "Løpetidsberegner - beregn fart og deltider",
      description: "Beregn fart i minutter pr. kilometer, løpetid ut fra fart og deltider for hver kilometer. Til løping, sykling og triatlon.",
      metaTitle: "Løpetidsberegner: 5 km på 25 min = 5:00 pr. km",
      metaDescription: "Gratis løpetidsberegner. Beregn fart pr. kilometer, løpetid ut fra fart og deltider for hver kilometer. 5 km på 25 min er 5:00 pr. km.",
      keywords: ["løpetidsberegner", "pace beregner", "fart beregner", "km tid beregner", "marathon tid beregner", "halvmarathon tid beregner", "ironman tid beregner", "triatlon tid beregner", "sykkel tid beregner", "fart pr kilometer", "deltider"],
      ogTitle: "Løpetidsberegner: 5 km på 25 min = 5:00 pr. km",
      ogDescription: "Beregn fart pr. kilometer, løpetid ut fra fart og deltider for hver kilometer.",
      category: "Hverdag",
      breadcrumbCategory: "Hverdag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Løpetidsberegner",
      schemaDescription: "Beregn fart i minutter pr. kilometer, løpetid ut fra fart og deltider for hver kilometer.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hvordan beregner jeg fart på en distance?", answer: "Del løpetiden med distansen. 5 km på 25 minutter er 25 delt på 5 = 5 minutter pr. kilometer, altså 5:00 pr. km. Samme regel for alle distanser." },
      { question: "Hvordan regner jeg løpetiden ut fra farten?", answer: "Gang distansen med farten. 5 km med 5:00 pr. kilometer er 5 ganger 5:00 = 25 minutter. Velg «Løpetid fra fart» i verktøyet, så får du deltidene for hver kilometer." },
      { question: "Hva er en god fart på halvmaraton?", answer: distanceEksempelFaqSvar("halvmaraton", "no") + " Hva som er godt for deg, avhenger av treningen din og målet ditt." },
      { question: "Hva er en god fart på maraton?", answer: distanceEksempelFaqSvar("maraton", "no") + " Hva som er godt for deg, avhenger av treningen din og målet ditt." },
      { question: "Hva er en god fart på 10 km?", answer: distanceEksempelFaqSvar("tiaaenkilometer", "no") + " Hva som er godt for deg, avhenger av treningen din og målet ditt." },
      { question: "Hva er deltider, og hvorfor summerer de ikke helt?", answer: "Deltider er tiden hver kilometer tar. Verktøyet legger avrundingen i den siste kilometeren, så deltidene summerer til nøyaktig den løpetiden du har tastet inn." },
      { question: "Kan jeg bruke verktøyet til sykling og triatlon?", answer: "Ja. Verktøyet regner i minutter pr. kilometer, så samme fart kan brukes til løping, sykling, kajakk og rulleski." },
      { question: "Hvor lang tid tar et Ironman?", answer: triatlonTotalFaqSvar("no") },
      { question: "Hvor stor en del av et Ironman er sykkeletappen?", answer: triatlonCykelAndelFaqSvar("no") },
      ],
    },
};

// ─── SWEDISH (se) PAGE DATA ────────────────────────────────────────────────

const sePages: Record<string, PageData> = {
    "veckodag": {
      slug: "veckodag",
      title: "Veckodagskalkylator - vilken veckodag är det?",
      description: "Hitta veckodagen för vilket som helst datum och se hela veckan. Skriv ditt födelsedatum och se vilken veckodag du föddes på.",
      metaTitle: `Veckodagskalkylator: ${UGEDAG_EKSEMPEL_SE.datoTekst} var en ${UGEDAG_EKSEMPEL_SE.ugedagTekst.toLowerCase()}`,
      metaDescription: `Beräkna veckodagen för vilket datum som helst och se hela veckan med ISO-veckonummer. ${UGEDAG_EKSEMPEL_SE.datoTekst} var en ${UGEDAG_EKSEMPEL_SE.ugedagTekst.toLowerCase()}.`,
      keywords: ["veckodag", "vilken veckodag är jag född", "vilken veckodag är det idag", "veckodagskalkylator", "vilken veckodag", "veckodag född", "räkna veckodag"],
      ogTitle: `Veckodagskalkylator: ${UGEDAG_EKSEMPEL_SE.datoTekst} var en ${UGEDAG_EKSEMPEL_SE.ugedagTekst.toLowerCase()}`,
      ogDescription: "Beräkna veckodagen för vilket datum som helst och se hela veckan med ISO-veckonummer.",
      category: "Praktiskt",
      breadcrumbCategory: "Praktiskt",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Veckodagskalkylator",
      schemaDescription: "Beräkna vilken veckodag ett datum har, se hela veckan och ISO-veckonummeret.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Vilken veckodag är jag född?", answer: `Skriv ditt födelsedatum i fältet så berättar kalkylatorn vilken veckodag du föddes på. Som exempel: ${UGEDAG_EKSEMPEL_SE.datoTekst} var en ${UGEDAG_EKSEMPEL_SE.ugedagTekst.toLowerCase()}, alltså vecka ${UGEDAG_EKSEMPEL_SE.uge}.` },
        { question: "Vilken veckodag är det idag?", answer: `Kalkylatorn är förinställd med dagens datum. Du kan alltid trycka på "I dag" för att komma tillbaka till den om du har skrivit in ett annat datum.` },
        { question: "Hur beräknas veckodagen?", answer: "Veckodagen följer den gregorianska kalendern och kan räknas fram utan undantag: 1 januari 2026 var en torsdag, och därifrån räknar du sju dagar framåt för varje vecka. Det är ingen skillnad på vanliga år och skottår — en skottag är bara ytterligare en tisdag." },
        { question: "Vad är skillnaden mellan ISO-veckonummer och kalendervecka?", answer: `ISO-veckonummeret räknar veckor från måndag till söndag, och vecka 1 är den vecka som innefattar årets första torsdag. Därför kan ett datum i december tillhöra vecka 1 av nästa år. ${UGEDAG_JULEAFTEN_SE.datoTekst} ligger i vecka ${UGEDAG_JULEAFTEN_SE.uge}, eftersom 1 januari 2027 är en fredag.` },
        { question: "Hur många dagar har ett år?", answer: `2026 har ${UGEDAG_AAR_2026.dage} dagar, eftersom 2026 inte är ett skottår. Ett skottår har 366 dagar: 2024 hade ${dageIAar(2024).dage} dagar, medan 1900 hade ${dageIAar(1900).dage} och 2000 hade ${dageIAar(2000).dage}. Regeln är att vart fjärde år är ett skottår, utom de hundraår som inte är delbara med 400.` },
        { question: "Kan jag räkna ut hur många dagar som gått sedan ett datum?", answer: `Ja — använd ${"/dagar-mellan-datum"}s kalkylator, som räknar hela kalenderdagar mellan två datum. Från 1 januari 2026 till 1 januari 2027 går det ${UGEDAG_DAGE_2026_2027} dagar.` },
      ],
    },
    "elbil": {
      slug: "elbil",
      title: "Elbil vs. bensinbil",
      description: "Jämför driftskostnaden för en elbil och en bensinbil. Se den årliga besparingen på energi och när en dyrare elbil har tjänat in sig.",
      metaTitle: "Elbil vs. bensinbil - Vad lönar sig bäst?",
      metaDescription: "Jämför elbil och bensinbil. Ange körsträcka, elpris och bensinpris och se den årliga energibesparingen samt återbetalningstiden för en dyrare elbil.",
      keywords: ["elbil vs bensinbil", "elbil eller bensinbil", "elbil besparing", "elbilskalkylator", "elbil ekonomi"],
      ogTitle: "Elbil vs. bensinbil - Se vad som lönar sig bäst",
      ogDescription: "Jämför driftskostnaden för elbil och bensinbil.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Elbil vs. bensinbil",
      schemaDescription: "Jämför den årliga energikostnaden för elbil och bensinbil och se återbetalningstid på en dyrare elbil.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Är en elbil billigare än en bensinbil?", answer: `På energi är en elbil nästan alltid billigare: en elbil drar cirka 15-20 kWh per 100 km, en bensinbil 5-7 liter. Kalkylatorns standardvärden — ${elbilSe.forudsætninger.elKwhPer100km} kWh per 100 km till ${krTal(elbilSe.forudsætninger.elKwhPris)} kr/kWh mot ${elbilSe.forudsætninger.benzinKmPerLiter} km/l till ${krTal(elbilSe.forudsætninger.benzinLiterPris)} kr/l — ger ${seKrPrKm(elbilSe.elPrisPrKm)} för el mot ${seKrPrKm(elbilSe.benzinPrisPrKm)} för bensin, alltså ${pct(elbilSe.besparelseProcent)} % billigare per km. Över ${pct(elbilSe.breakEvenKwhPris)} kr/kWh — alltså vid offentlig laddning — är el dyrare än bensin. Elbilar är dock ofta dyrare att köpa — kalkylatorn visar när merpriset är intjänat.` },
        { question: "Hur mycket sparar man på en elbil per år?", answer: `Med kalkylatorns standardvärden på ${seKr(elbilSe.forudsætninger.kmPrAar)} km per år är besparingen ca. ${seKr(elbilSe.aarligBesparelse)} kr per år. Den beror på el- och bensinpris, så fyll i dina egna tal.` },
        { question: "Vad ingår inte i beräkningen?", answer: "Kalkylatorn jämför energikostnaden (el vs. bensin). Försäkring, service, däck, fordonsskatt och värdeminskning varierar mycket och ingår inte — men energikostnaden är den största löpande skillnaden." },
      ],
    },
    "elbil-lading": {
      slug: "elbil-lading",
      title: "Laddkostnad elbil – vad kostar det att ladda en elbil?",
      description: "Beräkna vad det kostar att ladda din elbil från en laddningsnivå till en annan. Se kostnaden för laddningen, kostnaden per 100 km och den månatliga laddkostnaden.",
      metaTitle: `Laddkostnad elbil: ${seHelt(elbilLadingEksempelSe.kwhTilOpladning)} kWh kostar ${seHelt(elbilLadingEksempelSe.prisForOpladning)} kr.`,
      metaDescription: `Beräkna laddkostnaden för en elbil. ${seHelt(elbilLadingEksempelSe.kwhTilOpladning)} kWh till ${seHelt(elbilLadingEksempelSe.prisForOpladning)} kr. vid ${seTal(elbilLadingStandarder.se.elpris)} kr/kWh — och se kostnaden per 100 km och per månad.`,
      keywords: ["laddkostnad elbil", "vad kostar det att ladda en elbil", "elbil laddkostnad", "laddning elbil pris", "kwh pris elbil", "ladda elbil kostnad"],
      ogTitle: `Laddkostnad elbil: ${seHelt(elbilLadingEksempelSe.kwhTilOpladning)} kWh kostar ${seHelt(elbilLadingEksempelSe.prisForOpladning)} kr.`,
      ogDescription: "Beräkna vad det kostar att ladda din elbil. Se kostnaden för laddningen, per 100 km och per månad.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Laddkostnad elbil kalkylator",
      schemaDescription: "Beräkna vad det kostar att ladda en elbil: kostnad för laddningen, per 100 km och per månad.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Vad kostar det att ladda en elbil?", answer: `Det beror på batteriets storlek, laddningsnivåerna och elpriset. Ett batteri på ${seHelt(elbilLadingStandarder.se.batteriKwh)} kWh som ska fyllas från ${seHelt(elbilLadingStandarder.se.ladningNuPct)} till ${seHelt(elbilLadingStandarder.se.ladningTilPct)} procent behöver ${seTal(elbilLadingEksempelSe.kwhTilOpladning)} kWh. Till ${seTal(elbilLadingStandarder.se.elpris)} kr/kWh kostar det ${seTal(elbilLadingEksempelSe.prisForOpladning)} kr.` },
        { question: "Vad kostar det att köra 100 km i en elbil?", answer: `Med en förbrukning på ${seTal(elbilLadingStandarder.se.forbrugKwh100km)} kWh/100 km och ett elpris på ${seTal(elbilLadingStandarder.se.elpris)} kr/kWh kostar det ${seTal(elbilLadingEksempelSe.prisPr100km)} kr. per 100 km — alltså ${seTal(elbilLadingEksempelSe.prisPrKm)} kr. per km.` },
        { question: "Vad kostar det att ladda en elbil per månad?", answer: `Kör du ${seHelt(elbilLadingStandarder.se.kmPrMaaned)} km per månad vid ${seTal(elbilLadingStandarder.se.forbrugKwh100km)} kWh/100 km används ${seHelt(elbilLadingEksempelSe.kwhPrMaaned)} kWh och kostar det ${seTal(elbilLadingEksempelSe.maanedligPris)} kr. per månad att ladda bilen hemma.` },
        { question: "Är beräkningen exakt?", answer: "Beräkningen visar energin bilen använder. En hemladdare är typisk cirka 85-90 % effektiv, så den verkliga räkningen från vägguttaget kan vara lite högre än beräknat. Elpriset kan också variera under dagen, så ett natt- eller spotprisavtal kan halvera kostnaden." },
        { question: "Vad kostar en snabbladdning?", answer: `Offentlig snabbladdning kostar oftast mer än hemladdning — ofta 4-6 kr/kWh mot ditt elpris på ${seTal(elbilLadingStandarder.se.elpris)} kr/kWh. Ange det pris du betalar i elprisfältet för att se skillnaden.` },
      ],
    },
    "vandbehov": {
      slug: "vandbehov",
      title: "Vattenbehov - hur mycket vatten ska du dricka?",
      description: "Beräkna ditt dagliga vätskebehov utifrån din vikt och motion. Se hur många liter och glas vatten du bör dricka.",
      metaTitle: "Vattenbehov kalkylator - Hur mycket vatten ska du dricka?",
      metaDescription: "Gratis vattenbehov kalkylator. Hitta ditt dagliga vätskebehov utifrån kroppsvikt och motion. Se antal liter och glas. Vägledande utifrån ca 35 ml per kg.",
      keywords: ["vattenbehov", "hur mycket vatten ska jag dricka", "vätskebehov kalkylator", "dagligt vattenintag", "liter vatten om dagen"],
      ogTitle: "Vattenbehov - Hur mycket vatten ska du dricka?",
      ogDescription: "Beräkna ditt dagliga vätskebehov utifrån vikt och motion.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Vattenbehov kalkylator",
      schemaDescription: "Beräkna dagligt vätskebehov utifrån kroppsvikt och motion.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hur mycket vatten ska man dricka om dagen?", answer: "En vanlig tumregel är cirka 35 ml per kilo kroppsvikt. En person på 75 kg behöver alltså runt 2,6 liter vätska om dagen, mer vid motion, värme och feber." },
        { question: "Räknas kaffe och te med?", answer: "Ja, de allra flesta drycker räknas med i vätskebalansen, och en stor del av vätskan får du också från mat — särskilt frukt, grönt och soppor. Kalkylatorn visar det totala vätskebehovet." },
        { question: "Hur påverkar motion vattenbehovet?", answer: "När du svettas förlorar du vätska som behöver ersättas. Kalkylatorn lägger till cirka en halv liter per 30 minuters motion. Vid hård eller lång träning kan behovet vara ännu högre." },
      ],
    },
    "skridt": {
      slug: "skridt",
      title: "Steg till km - räkna om steg till kilometer",
      description: "Räkna om steg till kilometer, gångtid och kalorier. Se hur långt 10 000 steg är och vad de förbränner.",
      metaTitle: "Steg till km: 10 000 steg är 6,6-7,9 km",
      metaDescription: "Gratis omvandlare från steg till km. 10 000 steg är ca 6,6 km (kvinna) eller 7,9 km (man) och tar ca 85 minuter. Se även kalorier.",
      keywords: ["steg till km", "steg omvandlare", "10000 steg i km", "steg till kalorier", "hur långt är 10000 steg", "10000 steg kcal", "hur många steg är en km"],
      ogTitle: "Steg till km - Hur långt är 10 000 steg?",
      ogDescription: "Räkna om steg till kilometer, gångtid och kalorier.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Steg till km omvandlare",
      schemaDescription: "Räkna om steg till kilometer, gångtid och kalorier.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hur långt är 10 000 steg i km?", answer: "Ca 6,6 km för kvinnor och 7,9 km för män. Siffrorna bygger på uppmätta genomsnittliga steglängder på 66 cm för kvinnor och 79 cm för män (Murray 1964/1970). Din egen steglängd beror på din längd och ditt tempo." },
        { question: "Hur många steg är 1 km?", answer: "Ca 1 515 steg för kvinnor och 1 266 steg för män med de genomsnittliga steglängderna på 66 och 79 cm. Är du längre än genomsnittet använder du färre steg per kilometer." },
        { question: "Hur lång tid tar 10 000 steg?", answer: "Ca 85 minuter vid en normal kadens på 117 steg i minuten. Går du fortare tar det kortare tid — men du når också längre per steg." },
        { question: "Hur många kalorier förbränner 10 000 steg?", answer: "Ca 349 kcal för en person på 70 kg, räknat med MET 3,5 för normal gång. En tyngre person förbränner fler, en lättare färre — kalkylatorn räknar ut det utifrån din vikt." },
      ],
    },
    "motion-kalorier": {
      slug: "motion-kalorier",
      title: "Kaloriförbränning vid motion",
      description: "Beräkna hur många kalorier du förbränner vid löpning, cykling, simning och andra aktiviteter utifrån vikt och längd.",
      metaTitle: "Kaloriförbränning vid motion - Beräkna förbrända kalorier",
      metaDescription: "Gratis kalkylator för kaloriförbränning vid motion. Se hur många kalorier du bränner vid löpning, cykling och simning utifrån vikt, aktivitet och tid.",
      keywords: ["kaloriförbränning motion", "förbrända kalorier löpning", "kalorier cykling", "kaloriförbrukning träning", "met kalorier"],
      ogTitle: "Kaloriförbränning vid motion",
      ogDescription: "Beräkna hur många kalorier du förbränner vid olika aktiviteter.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kaloriförbränning vid motion",
      schemaDescription: "Beräkna förbrända kalorier vid motion utifrån aktivitet, vikt och längd med MET-värden.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hur många kalorier förbränner man vid löpning?", answer: "Löpning har ett högt MET-värde (ca 9,8). En person på 75 kg bränner runt 370 kalorier på 30 minuters löpning. Förbrukningen ökar med vikt, tempo och längd." },
        { question: "Hur beräknas kaloriförbränningen?", answer: "Kalkylatorn använder formeln kalorier = MET × vikt i kg × timmar. MET (metabolic equivalent of task) anger hur energikrävande en aktivitet är jämfört med vila." },
        { question: "Hur exakta är siffrorna?", answer: "Det är uppskattningar. Din verkliga förbränning beror på intensitet, kondition och ämnesomsättning, men MET-baserade siffror ger en bra överblick för att jämföra aktiviteter." },
      ],
    },
    "proteinbehov": {
      slug: "proteinbehov",
      title: "Proteinbehov kalkylator - beräkna ditt dagliga proteinintag",
      description: "Beräkna ditt dagliga proteinbehov utifrån kroppsvikt och aktivitetsnivå. Vägledande uppskattning för stillasittande till elitidrottare.",
      metaTitle: "Proteinbehov kalkylator - Beräkna ditt dagliga proteinintag",
      metaDescription: "Gratis proteinbehov kalkylator. Hitta ditt dagliga proteinbehov utifrån vikt och aktivitetsnivå. 0,8-2,0 g/kg. Vägledande — inte medicinsk rådgivning.",
      keywords: ["proteinbehov kalkylator", "proteinintag", "protein per kg", "hur mycket protein", "protein dagligen"],
      ogTitle: "Proteinbehov kalkylator - Beräkna ditt dagliga proteinintag",
      ogDescription: "Beräkna ditt dagliga proteinbehov utifrån vikt och aktivitetsnivå.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Proteinbehov kalkylator",
      schemaDescription: "Beräkna dagligt proteinbehov utifrån kroppsvikt och aktivitetsnivå.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hur mycket protein behöver jag per dag?", answer: "Det rekommenderade dagliga proteinintaget är 0,8 g per kg kroppsvikt för stillasittande vuxna. Vid motion ökar behovet till 1,2-2,0 g/kg beroende på träningsmängd och -intensitet." },
        { question: "Vilka är de bästa proteinkällorna?", answer: "Animaliska källor (kött, fisk, ägg, mejeriprodukter) innehåller alla essentiella aminosyror. Växtbaserade källor (bönor, linser, tofu, quinoa, nötter) kan också täcka behovet vid varierad sammansättning." },
        { question: "Kan man få för mycket protein?", answer: "Mycket högt proteinintag (över 2,5-3 g/kg under längre tid) kan belasta njurarna hos sårbara personer. För friska personer är 1,5-2,0 g/kg säkert." },
      ],
    },
    "1rm": {
      slug: "1rm",
      title: "1RM kalkylator - uppskatta din maximala styrka",
      description: "Uppskatta ditt one-rep max (1RM) utifrån en vikt och antal repetitioner. Se även träningsvikter vid olika procent.",
      metaTitle: "1RM kalkylator - Beräkna ditt one-rep max",
      metaDescription: "Gratis 1RM-kalkylator. Uppskatta ditt maximala lyft (one-rep max) utifrån vikt och repetitioner, med Epley- och Brzycki-formlerna. Se träningsvikter i procent.",
      keywords: ["1rm kalkylator", "one rep max", "maximal styrka", "styrketräning vikt", "epley brzycki"],
      ogTitle: "1RM kalkylator - Uppskatta din maximala styrka",
      ogDescription: "Uppskatta ditt one-rep max utifrån en vikt och antal repetitioner.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "1RM kalkylator",
      schemaDescription: "Uppskatta one-rep max (1RM) utifrån vikt och repetitioner med Epley- och Brzycki-formlerna.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Vad är 1RM?", answer: "1RM (one-rep max) är den tyngsta vikt du kan lyfta en gång med korrekt teknik. Det används i styrketräning för att sätta träningsvikter som en procent av ditt maximum." },
        { question: "Hur beräknas 1RM?", answer: "Kalkylatorn uppskattar ditt 1RM utifrån en vikt och antalet repetitioner du klarar, som ett genomsnitt av Epley-formeln (vikt × (1 + reps/30)) och Brzycki-formeln (vikt × 36/(37 − reps))." },
        { question: "Hur exakt är uppskattningen?", answer: "Uppskattningen är mest exakt vid upp till cirka 10 repetitioner. Vid många repetitioner blir den mindre exakt, eftersom uthållighet och teknik spelar större roll." },
      ],
    },
    "ohm": {
      slug: "ohm",
      title: "Ohms lag kalkylator - spänning, ström, resistans och effekt",
      description: "Beräkna spänning, ström, resistans eller effekt med Ohms lag. Ange två värden och få resten.",
      metaTitle: "Ohms lag kalkylator - Spänning, ström, resistans, effekt",
      metaDescription: "Gratis Ohms lag kalkylator. Beräkna spänning (V), ström (A), resistans (Ω) och effekt (W). Ange två värden och få de övriga. V = I × R, P = V × I.",
      keywords: ["ohms lag kalkylator", "beräkna spänning", "beräkna ström", "beräkna resistans", "watt kalkylator", "effekt kalkylator"],
      ogTitle: "Ohms lag kalkylator - Spänning, ström, resistans och effekt",
      ogDescription: "Beräkna spänning, ström, resistans eller effekt med Ohms lag.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Ohms lag kalkylator",
      schemaDescription: "Beräkna spänning, ström, resistans och effekt med Ohms lag.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Vad är Ohms lag?", answer: "Ohms lag säger att spänning = ström × resistans (V = I × R). Känner du till två av de tre storheterna kan du beräkna den tredje." },
        { question: "Hur beräknar jag effekt (watt)?", answer: "Effekt beräknas som P = V × I, alltså spänning gånger ström. Den kan även skrivas P = I² × R eller P = V² / R. Kalkylatorn visar effekten automatiskt." },
        { question: "Vilka enheter används?", answer: "Spänning mäts i volt (V), ström i ampere (A), resistans i ohm (Ω) och effekt i watt (W)." },
      ],
    },
    "loenstigning": {
      slug: "loenstigning",
      title: "Löneökning i procent - beräkna din löneförhöjning",
      description: "Beräkna den procentuella ändringen mellan din gamla och nya lön. Se ökningen i både procent och kronor.",
      metaTitle: "Löneökning i procent - Beräkna din löneförhöjning",
      metaDescription: "Gratis kalkylator för löneökning. Ange gammal och ny lön och se ökningen i procent och kronor. Fungerar med tim-, månads- och årslön.",
      keywords: ["löneökning procent", "beräkna löneökning", "löneförhöjning procent", "procentuell löneökning", "löneförhandling"],
      ogTitle: "Löneökning i procent - Beräkna din löneförhöjning",
      ogDescription: "Beräkna den procentuella ändringen mellan din gamla och nya lön.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Löneökning kalkylator",
      schemaDescription: "Beräkna den procentuella ändringen mellan två löner.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur beräknar jag en löneökning i procent?", answer: "Dra bort den gamla lönen från den nya och dela med den gamla lönen: (ny − gammal) / gammal × 100. Går lönen från 30 000 till 33 000 kr är det en ökning på 10 %." },
        { question: "Kan jag använda den för timlön?", answer: "Ja. Kalkylatorn fungerar med timlön, månadslön och årslön — använd bara samma enhet i båda fälten." },
        { question: "Är beloppet före eller efter skatt?", answer: "Beräkningen använder bruttolön (före skatt). Den procentuella ökningen är densamma oavsett om du räknar i brutto eller netto, men kronbeloppet är brutto." },
      ],
    },
    "aegloesning": {
      slug: "aegloesning",
      title: "Ägglossningskalkylator - hitta dina fertila dagar",
      description: "Beräkna när du har ägglossning och när ditt fertila fönster är, utifrån din senaste mens och cykellängd.",
      metaTitle: "Beräkna ägglossning och fertila dagar",
      metaDescription: "Gratis ägglossningskalkylator. Hitta dina fertila dagar och din ägglossning utifrån senaste mens och cykellängd. Se även när nästa mens förväntas.",
      keywords: ["ägglossningskalkylator", "fertila dagar", "beräkna ägglossning", "ägglossning kalkylator", "fertilitetskalkylator"],
      ogTitle: "Ägglossningskalkylator - Hitta dina fertila dagar",
      ogDescription: "Beräkna när du har ägglossning och när ditt fertila fönster är.",
      category: "Familj",
      breadcrumbCategory: "Familj",
      breadcrumbCategoryHref: "/kategori/familie",
      schemaName: "Ägglossningskalkylator",
      schemaDescription: "Beräkna ägglossning och fertilt fönster utifrån senaste mens och cykellängd.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "När har man ägglossning?", answer: "Ägglossningen sker vanligtvis omkring 14 dagar före nästa mens. Vid en 28-dagarscykel är det cirka dag 14, men det varierar med cykellängden." },
        { question: "Vad är det fertila fönstret?", answer: "Det fertila fönstret är de dagar då du har störst chans att bli gravid — cirka fem dagar före ägglossning plus själva ägglossningsdagen, eftersom spermier kan överleva upp till 5 dagar." },
        { question: "Är kalkylatorn säker som preventivmedel?", answer: "Nej. Kalkylatorn är en uppskattning för familjeplanering och bör inte användas som preventivmedel, eftersom cykler varierar från månad till månad." },
      ],
    },
    "planetvaegt": {
      slug: "planetvaegt",
      title: "Din vikt på planeterna",
      description: "Se hur mycket du skulle väga på Månen, Mars, Jupiter och de andra planeterna. Ange din vikt på Jorden.",
      metaTitle: "Din vikt på planeterna - Hur mycket väger du på Mars?",
      metaDescription: "Gratis kalkylator: se din vikt på Månen, Mars, Jupiter och alla planeterna. Ange din vikt på Jorden. Rolig och lärorik om gravitation för barn och skola.",
      keywords: ["vikt på planeterna", "vikt på månen", "vikt på mars", "gravitation kalkylator", "vikt på jupiter"],
      ogTitle: "Din vikt på planeterna",
      ogDescription: "Se hur mycket du skulle väga på Månen, Mars, Jupiter och de andra planeterna.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Vikt på planeterna kalkylator",
      schemaDescription: "Beräkna din vikt på Månen, Solen och planeterna utifrån din vikt på Jorden.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Varför väger man olika på planeterna?", answer: "Vikt är den kraft som gravitationen drar i dig med, och gravitationen är olika på varje planet. Din massa är densamma, men vikten ändras med gravitationen." },
        { question: "Hur mycket väger man på Månen?", answer: "På Månen väger du cirka en sjättedel (16,6 %) av din vikt på Jorden. En person på 75 kg väger runt 12,5 kg på Månen." },
        { question: "Var skulle man väga mest?", answer: "Av planeterna väger du mest på Jupiter — mer än det dubbla mot på Jorden. På Solen (som är en stjärna) skulle du väga nästan 28 gånger så mycket." },
      ],
    },
    "idealvaegt": {
      slug: "idealvaegt",
      title: "Idealvikt för vuxna",
      description: "Beräkna din idealvikt utifrån längd och kön. Devines och Hamwis formel ger var sitt tal, och du ser dem båda sida vid sida.",
      metaTitle: `Idealvikt: ${idealvaegtKgSe(rundIdealvaegt(idealvaegtMand.gennemsnit))} kg vid ${IDEALVAEGT_CM} cm`,
      metaDescription: `Gratis idealviktkalkylator. Beräkna din idealvikt utifrån längd och kön med Devines (1974) och Hamwis (1964) formel. Vid ${IDEALVAEGT_CM} cm: man ${idealvaegtKgSe(rundIdealvaegt(idealvaegtMand.gennemsnit))} kg, kvinna ${idealvaegtKgSe(rundIdealvaegt(idealvaegtKvinde.gennemsnit))} kg.`,
      keywords: ["idealvikt", "idealvikt kalkylator", "idealvikt kvinna", "idealvikt man", "idealvikt män", "devine formel", "hamwi formel", "viktsintervall"],
      ogTitle: `Idealvikt: ${idealvaegtKgSe(rundIdealvaegt(idealvaegtMand.gennemsnit))} kg vid ${IDEALVAEGT_CM} cm`,
      ogDescription: "Beräkna din idealvikt med Devines och Hamwis formel och se WHO:s BMI-intervall för din längd.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Idealviktkalkylator",
      schemaDescription: "Beräkna din idealvikt utifrån längd och kön med Devines och Hamwis publicerade formler.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Vad är idealvikt?", answer: "Idealvikt (IBW) är en uppskattning av den vikt som är förknippad med lägst dödlighet för en person av en given längd. Den utvecklades 1964 och 1974 för att dosera medicin efter kroppens storlek, inte som ett bantmål." },
        { question: `Hur mycket är min idealvikt om jag är ${IDEALVAEGT_CM} cm lång?`, answer: `Som man väger du ${idealvaegtKgSe(rundIdealvaegt(idealvaegtMand.devine))} kg enligt Devines formel och ${idealvaegtKgSe(rundIdealvaegt(idealvaegtMand.hamwi))} kg enligt Hamwis — ett intervall på ${idealvaegtKgSe(rundIdealvaegt(idealvaegtMand.spredning))} kg. Som kvinna är de ${idealvaegtKgSe(rundIdealvaegt(idealvaegtKvinde.devine))} kg och ${idealvaegtKgSe(rundIdealvaegt(idealvaegtKvinde.hamwi))} kg. WHO:s normalviktsband (BMI 18,5-24,9) motsvarar för en man på ${IDEALVAEGT_CM} cm ${idealvaegtKgSe(idealvaegtNormal.min ?? 0)}-${idealvaegtKgSe(idealvaegtNormal.max ?? 0)} kg.` },
        { question: "Varför ger Devine och Hamwi två olika tal?", answer: "De är två oberoende formler från 1964 respektive 1974. De är linjära och använder olika grundvärden och lutningar, så de avviker allt mer ju längre från 152 cm, de är byggda kring. Därför visar kalkylatorn båda talen och deras medelvärde i stället för att peka ut ett." },
        { question: "Är idealvikt samma sak som BMI?", answer: "Nej. BMI räknar förhållandet mellan din vikt och din längd, så det beror på den vikt du har. Idealvikten räknar bara längd och kön och bortser alltså från vad du väger nu. De två kan därför peka i var sin riktning." },
      ],
    },
    "rumfang": {
      slug: "rumfang",
      title: "Volymberäknare",
      description: `Beräkna volym i m³ och liter för låda, cylinder, sfär, kon och pyramid. Alla mått skrivs i meter, och kalkylatorn använder diameter — inte radie.`,
      metaTitle: `Volymberäknare: cylinder med d = 1 m och h = 2 m är ${RUMFANG_TEKST_SE.cylinder} m³`,
      metaDescription: `Gratis volymberäknare. Beräkna volym av låda, cylinder, sfär, kon och pyramid i m³ och liter. Cylinder d = 1 m, h = 2 m: ${RUMFANG_TEKST_SE.cylinder} m³ = ${RUMFANG_TEKST_SE.cylinderLiter} liter.`,
      keywords: ["volymberäknare", "beräkna volym", "volym cylinder", "volym låda", "volym sfär", "volym formel", "volym liter"],
      ogTitle: `Volymberäknare: cylinder med d = 1 m och h = 2 m är ${RUMFANG_TEKST_SE.cylinder} m³`,
      ogDescription: "Beräkna volym i m³ och liter för låda, cylinder, sfär, kon och pyramid.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Volymberäknare",
      schemaDescription: "Beräkna volym i m³ och liter för låda, cylinder, sfär, kon och pyramid.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur beräknar man volym?", answer: `Det beror på formen. Låda är längd × bredd × höjd, cylinder är π × (diameter ÷ 2)² × höjd, sfär är (4 ÷ 3) × π × (diameter ÷ 2)³, kon är (1 ÷ 3) × π × (diameter ÷ 2)² × höjd, och pyramid är (1 ÷ 3) × grundside² × höjd.` },
        { question: "Vad är volymen av en cylinder med diameter 1 meter och höjd 2 meter?", answer: `Cylinderns basarea är π × (1 ÷ 2)² = ${RUMFANG_TEKST_SE.cylinderAreal} m². Multiplicera med höjden 2 m, så får du ${RUMFANG_TEKST_SE.cylinder} m³ — alltså ${RUMFANG_TEKST_SE.cylinderLiter} liter.` },
        { question: "Varför ska jag använda diameter och inte radie?", answer: "Eftersom det är felet som fyrdubblar svaret. Om du mätt 20 cm på tvären och skriver 20 som radie får du fyra gånger så stor volym. Kalkylatorn tar därför diameter direkt." },
        { question: "Hur många liter går det på en kubikmeter?", answer: `1 m³ = ${LITER_PR_KUBIKMETER} liter, eftersom en kubikmeter är 100 cm × 100 cm × 100 cm = 1.000.000 cm³ och det går 1.000 cm³ på litern. Kalkylatorn visar därför båda talen från samma beräkning.` },
        { question: "Hur räknar man ut volym i Excel?", answer: "Lådans volym är bara =A1*B1*C1. Cylinderns är =PI()*(A1/2)^2*B1, där A1 är diametern och B1 höjden i meter. Sfärens är =4/3*PI()*(A1/2)^3." },
        { question: "Vad är skillnaden mellan area och volym?", answer: "Area är ytan storlek i m² — det är vad /kvadratmeterkalkylatorn räknar. Volym är utrymmet innanför kroppen i m³. En låda på 2 × 1 × 0,5 m har en area på 2 m² (golvet) och en volym på 1 m³." },
      ],
    },
    "areal": {
      slug: "areal",
      title: "Areaberäknare",
      description: `Beräkna arean i m² och cm² för cirkel, triangel, rektangel, kvadrat, trapets, parallellogram och romb. Alla mått skrivs i meter, och kalkylatorn använder diameter — inte radie.`,
      metaTitle: `Areaberäknare: trapets med sidor 2 och 4 m = ${AREAL_TEKST_SE.trapez} m²`,
      metaDescription: `Beräkna area av cirkel, triangel, rektangel, kvadrat, trapets, parallellogram och romb i m² och cm². Cirkel med diameter 1 m: ${AREAL_TEKST_SE.cirkel} m² = ${AREAL_TEKST_SE.cirkelCm} cm².`,
      keywords: ["areaberäknare", "beräkna area", "area cirkel", "area triangel", "area rektangel", "area formel", "area trapets", "area parallellogram", "area romb"],
      ogTitle: `Areaberäknare: trapets med sidor 2 och 4 m = ${AREAL_TEKST_SE.trapez} m²`,
      ogDescription: "Beräkna arean i m² och cm² för cirkel, triangel, rektangel, kvadrat, trapets, parallellogram och romb.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Areaberäknare",
      schemaDescription: "Beräkna arean i m² och cm² för cirkel, triangel, rektangel, kvadrat, trapets, parallellogram och romb.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur beräknar man area?", answer: "Det beror på formen. Cirkel är π × (diameter ÷ 2)², triangel är (baslinje × höjd) ÷ 2, rektangel är längd × bredd, kvadrat är sida × sida, trapets är ((a + b) ÷ 2) × höjd, parallellogram är baslinje × höjd, och romb är (d1 × d2) ÷ 2." },
        { question: "Vad är arean av en cirkel med diameter 1 meter?", answer: `Radien är 0,5 m, så arean är π × 0,5² = ${AREAL_TEKST_SE.cirkel} m² — alltså ${AREAL_TEKST_SE.cirkelCm} cm². Kalkylatorn halverar diametern själv, så du skriver bara 1.` },
        { question: "Varför ska jag använda diameter och inte radie?", answer: "Eftersom det är felet som fyrdubblar svaret. Mäter du 20 cm på tvären och skriver 20 som radie blir arean fyra gånger för stor — kvadraten i πr² gör felet fyrdubbelt. Kalkylatorn tar därför diameter direkt." },
        { question: "Hur räknar man arean av en triangel?", answer: "Arean av en triangel är (baslinje × höjd) ÷ 2 — alltså halva en rektangel med samma baslinje och höjd. En triangel med baslinje 2 m och höjd 3 m har arean 3 m²." },
        { question: "Vad är skillnaden mellan area och volym?", answer: "Area är ytans storlek i m² — golvet, väggen, tomten. Volym är utrymmet innanför kroppen i m³ — det räknar /rumfang. En låda på 2 × 1 × 0,5 m har 2 m² golv men bara 1 m³ volym." },
        { question: "Hur många cm² går det på en m²?", answer: `1 m² = ${AREAL_TEKST_SE.cmPrM2} cm², eftersom 1 m är 100 cm och 100 × 100 = ${AREAL_TEKST_SE.cmPrM2}. Kalkylatorn visar därför båda enheterna från samma beräkning.` },
        { question: "Hur räknar man area i Excel?", answer: "Rektangel: =A1*B1. Cirkel: =PI()*(A1/2)^2, där A1 är diametern. Triangel: =A1*B1/2. Trapets: =(A1+B1)/2*C1, där A1 och B1 är de parallella sidorna och C1 höjden." },
        { question: "Vad är skillnaden mellan en parallellogram och en rektangel?", answer: "De har samma formel — baslinje × höjd — men i en parallellogram står sidorna snett, så höjden är det vinkelräta avståndet mellan de två baslinjerna, inte sidlängden. Mäter du sidlängden i stället för höjden blir arean för stor." },
      ],
    },
    "omkreds": {
      slug: "omkreds",
      title: "Omkretsberäknare",
      description: `Beräkna omkretsen i m och cm för cirkel, kvadrat, rektangel, triangel, trapets, parallellogram och romb. Alla mått skrivs i meter.`,
      metaTitle: `Omkretsberäknare: cirkel med diameter 1 m = ${OMKREDS_TEKST_SE.cirkel} m`,
      metaDescription: `Beräkna omkrets av cirkel, triangel, rektangel och månghörningar i m och cm. Cirkel med diameter 1 m är ${OMKREDS_TEKST_SE.cirkel} m = ${OMKREDS_TEKST_SE.cirkelCm} cm.`,
      keywords: ["omkretsberäknare", "beräkna omkrets", "omkrets cirkel", "omkrets triangel", "omkrets rektangel", "omkrets formel", "omkrets kvadrat", "omkrets romb", "omkrets diameter"],
      ogTitle: `Omkretsberäknare: cirkel med diameter 1 m = ${OMKREDS_TEKST_SE.cirkel} m`,
      ogDescription: "Beräkna omkretsen i m och cm för cirkel, triangel, rektangel och månghörningar.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Omkretsberäknare",
      schemaDescription: "Beräkna omkretsen i m och cm för cirkel, kvadrat, rektangel, triangel, trapets, parallellogram och romb.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur beräknar man omkrets?", answer: "Det beror på formen. Cirkel är π × diameter, kvadrat är 4 × sida, rektangel är 2 × (längd + bredd), triangel är a + b + c, trapets är a + b + c + d, parallellogram är 2 × (a + b), och romb är 4 × sida." },
        { question: "Vad är omkretsen av en cirkel med diameter 1 meter?", answer: `Omkretsen är π × 1 = ${OMKREDS_TEKST_SE.cirkel} m, alltså ${OMKREDS_TEKST_SE.cirkelCm} cm. Kalkylatorn multiplicerar diametern med π, så du skriver bara 1.` },
        { question: "Varför ska jag använda diameter och inte radie?", answer: "Eftersom radien ger halva svaret. Omkretsen är 2 × π × radie = π × diameter. Skriver du radien i diameterfältet blir omkretsen hälften så stor som den ska vara." },
        { question: "Hur räknar man omkretsen av en triangel?", answer: "Du lägger ihop de tre sidorna: a + b + c. En triangel med sidorna 3, 4 och 5 m har omkretsen 12 m. Det gäller alla trianglar — även den rätvinkliga — eftersom omkretsen bara är kanten runt." },
        { question: "Hur räknar man omkretsen av en rektangel?", answer: `Du lägger ihop längden och bredden och multiplicerar med 2, eftersom det finns två av varje: 2 × (längd + bredd). En rektangel på 2 × 3 m har omkretsen ${OMKREDS_TEKST_SE.rektangel} m.` },
        { question: "Vad är skillnaden mellan area och omkrets?", answer: "Omkrets är längden av kanten runt figuren, mätt i meter. Area är ytans storlek innanför, mätt i m² — det räknar /areal. Två figurer kan ha samma omkrets och olika area: en kvadrat på 2 × 2 m och en rektangel på 1 × 3 m har båda omkretsen 8 m." },
        { question: "Hur räknar man omkrets i Excel?", answer: "Cirkel: =PI()*A1, där A1 är diametern. Rektangel: =2*(A1+B1). Kvadrat: =4*A1. Triangel: =A1+B1+C1. Trapets: =A1+B1+C1+D1, där varje cell är en sida." },
        { question: "Vad är skillnaden mellan omkrets och diameter?", answer: "Diametern är den raka linjen tvärs över cirkeln genom mitten. Omkretsen är kanten hela vägen runt, och den är π ≈ 3,14 gånger så lång som diametern. Mäter du diametern till 10 cm är omkretsen ca 31,4 cm." },
      ],
    },
    "hundealder": {
      slug: "hundealder",
      title: "Hundår till människoår",
      description: `Hur gammal är din hund i människoår? Skriv åldern och välj hundens storlek, och se svaret med AVMA:s metod: 15 människoår första året, 9 det andra, och 4-7 per år därefter.`,
      metaTitle: `Hundår till människoår: 7 år = ${HUNDEALDER_TEKST_SE.syvAarMellem} (mellanstor)`,
      metaDescription: `Omvandla hundår till människoår. En mellanstor hund på ${HUNDEALDER_TEKST_SE.eksempelAar} år är ${HUNDEALDER_TEKST_SE.eksempelMenneske} människoår; en stor hund på 10 år är ${HUNDEALDER_TEKST_SE.tiAarStor}, en liten är ${HUNDEALDER_TEKST_SE.tiAarLille}.`,
      keywords: ["hundår", "hundår till människoår", "hur gammal är min hund", "hund alder i människoår", "hundålder", "hundens ålder", "kalkylator alder hund", "beräkna hundår"],
      ogTitle: `Hundår till människoår: 7 år = ${HUNDEALDER_TEKST_SE.syvAarMellem} (mellanstor)`,
      ogDescription: `Skriv hundens ålder och storlek, och se hur gammal den är i människoår med AVMA:s metod.`,
      category: "Praktiskt",
      breadcrumbCategory: "Praktiskt",
      breadcrumbCategoryHref: "/kategori/praktisk",
      schemaName: "Hundåldersberäknare",
      schemaDescription: "Omvandla hundår till människoår med AVMA:s storleksjusterade metod: 15 + 9, därefter 4-7 per år.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur räknar man hundår till människoår?", answer: `Det första hundåret är ca 15 människoår, det andra lägger till 9, så en hund på två år är 24 människoår. Därefter lägger varje år till 4 människoår för en liten hund, 5 för en mellanstor, 6 för en stor och 7 för en jättehund. En mellanstor hund på ${HUNDEALDER_TEKST_SE.eksempelAar} år är alltså ${HUNDEALDER_TEKST_SE.eksempelRegnestykke} människoår.` },
        { question: "Är en hund på 7 år 49 i människoår?", answer: "Bara om den är mellanstor. 15 + 9 + 5 × 5 = 49 för en hund på 10-25 kg. Är den liten (under 10 kg) blir den 44, är den stor (25-45 kg) 54, och är den jättehund (över 45 kg) 59 — storleken avgör takten efter det andra året." },
        { question: "Varför är 7-regeln fel?", answer: "Därför att en hund inte åldras jämnt. En ettårig hund är redan färdigvuxen och könsmogen — närmast en tonåring på 15, inte ett barn på 7. Regeln missar också storleksskillnaden: en stor hund på 10 år är 72 människoår, en liten hund på 10 år bara 56." },
        { question: "Hur gammal är en stor hund på 10 år i människoår?", answer: `En stor hund (25-45 kg) på 10 år är ${HUNDEALDER_TEKST_SE.tiAarStor} människoår enligt AVMA:s tabell. En jättehund (över 45 kg) i samma ålder är ${HUNDEALDER_TEKST_SE.tiAarKaempe}, medan en liten hund bara är ${HUNDEALDER_TEKST_SE.tiAarLille}.` },
        { question: "När är en hund senior?", answer: "Små och mellanstora hundar räknas som seniorer vid 7 år, stora hundar vid 6 och jättehundar redan vid 5. Gränsen följer AVMA:s tumregel: stora raser lever kortare och åldras snabbare efter de första åren." },
        { question: "Hur många människoår är ett hundår?", answer: "Det finns inget enda tal. Det första hundåret är ca 15 människoår, det andra ca 9, och därefter 4-7 beroende på storleken. Därför kan man inte multiplicera med ett fast tal — kalkylatorn räknar de tre leden var för sig." },
        { question: "Vad gäller om hunden är under två år?", answer: "Då är de två första leden linjära: en valp på ett halvt år är 15 × 0,5 = 7,5 människoår, och en hund på ett och ett halvt år är 15 + 9 × 0,5 = 19,5. Det är samma interpolation som de publicerade tabellerna använder mellan hela år." },
        { question: "Gäller metoden även katter?", answer: "Nej. Katter följer 15 människoår första året, 9 det andra, och därefter 4 per år — utan storleksuppdelning, eftersom kattraser inte varierar i storlek på samma sätt som hundar." },
      ],
    },
    "laantype": {
      slug: "laantype",
      title: "Annuitetslån: serielån eller stående lån?",
      description: `Jämför de tre lånetyperna på samma belopp, ränta och löptid. Serielånet på ${LAANETYPE_TEKST_SE.hovedstol} kr. över ${LAANETYPE_TEKST.loebetid} år till ${LAANETYPE_TEKST.aarligRente} % kostar ${LAANETYPE_TEKST_SE.forskelFoerste} kr. mer i månad 1, men sparar ${LAANETYPE_TEKST_SE.renteBesparelse} kr. i ränta.`,
      metaTitle: `Annuitetslån vs serielån: ${LAANETYPE_TEKST_SE.forskelFoerste} kr. dyrare i månad 1`,
      metaDescription: `Jämför annuitetslån, serielån och stående lån på ${LAANETYPE_TEKST_SE.hovedstol} kr. över ${LAANETYPE_TEKST.loebetid} år. Se första betalning, månadsamortisering och total ränta.`,
      keywords: ["serielån vs annuitetslån", "annuitetslån serielån", "serielån kalkylator", "stående lån", "annuitetslån kalkylator", "serielån formel", "skillnad annuitetslån serielån"],
      ogTitle: "Annuitetslån, serielån eller stående lån?",
      ogDescription: "Jämför de tre lånetyperna på samma belopp, ränta och löptid.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/ekonomi",
      schemaName: "Lånetypeberäknare",
      schemaDescription: "Jämför annuitetslån, serielån och stående lån på första betalning, månadsamortisering och total ränta.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Vad är skillnaden mellan annuitetslån och serielån?", answer: `Ett annuitetslån har konstant betalning: du betalar samma belopp varje månad, men i början går nästan allt till ränta och i slutet nästan allt till amortering. Ett serielån har konstant amortering: du amorterar samma belopp på kapitalet varje månad, medan räntan faller, så betalningen börjar hög och blir lägre. På ${LAANETYPE_TEKST_SE.hovedstol} kr. över ${LAANETYPE_TEKST.loebetid} år till ${LAANETYPE_TEKST.aarligRente} % är serielånets första betalning ${LAANETYPE_TEKST_SE.serielaanFoerste} kr. mot annuitetslånets ${LAANETYPE_TEKST_SE.annuitetYdelse} kr., och dess sista betalning är bara ${LAANETYPE_TEKST_SE.serielaanSidste} kr.` },
        { question: "Vilken lånetyp är billigast?", answer: `Serielånet är billigast över hela löptiden, eftersom skulden amorteras snabbare och mindre ränta löper på restskulden. På ${LAANETYPE_TEKST_SE.hovedstol} kr. över ${LAANETYPE_TEKST.loebetid} år till ${LAANETYPE_TEKST.aarligRente} % är den totala räntan lägre i serielånet än i annuitetslånet, men startbetalningen är ${LAANETYPE_TEKST_SE.forskelFoerste} kr. högre — och det är startbetalningen banken bedömer din betalningsförmåga på.` },
        { question: "När är serielånet billigare än annuitetslånet?", answer: `Serielånets betalning faller månad för månad medan annuitetslånets är konstant, så de två korsas. På ${LAANETYPE_TEKST_SE.hovedstol} kr. över ${LAANETYPE_TEKST.loebetid} år till ${LAANETYPE_TEKST.aarligRente} % är serielånet dyrare fram till månad ${LAANETYPE_TEKST.kryds} och billigare därefter. Korsmånaden beror på räntan och löptiden, så verktyget räknar den för dina egna siffror.` },
        { question: "Vad är skillnaden mellan stående lån och amorteringsfritt lån?", answer: `Det finns ingen skillnad i siffrorna — stående lån är bara det svenska namnet på ett amorteringsfritt lån. Du betalar enbart ränta under hela löptiden och kapitalet står oförändrat till den dag du löser lånet. På ${LAANETYPE_TEKST_SE.hovedstol} kr. över ${LAANETYPE_TEKST.loebetid} år till ${LAANETYPE_TEKST.aarligRente} % är betalningen ${LAANETYPE_TEKST_SE.staendeYdelse} kr. varje månad, men den totala räntan blir högst, eftersom räntan löper på hela beloppet hela vägen.` },
        { question: "Hur påverkar lånetypen mitt ränteavdrag?", answer: "Avdraget följer räntekostnaden, inte amorteringen. Ett annuitetslån har högst räntekostnad i början och ger därför störst avdrag de första åren. Serielånets räntekostnad faller från dag ett, så avdraget faller med den." },
      ],
    },
    "sparemaal": {
      slug: "sparemaal",
      title: "Sparmålskalkylator - hur mycket ska jag spara per månad?",
      description: "Beräkna hur mycket du behöver spara varje månad för att nå ditt sparmål inom ett visst antal år.",
      metaTitle: "Sparmålskalkylator - Hur mycket ska jag spara per månad?",
      metaDescription: "Gratis sparmålskalkylator. Ta reda på hur mycket du behöver spara varje månad för att nå ditt mål. Ange mål, antal år, ränta och startbelopp.",
      keywords: ["sparmål kalkylator", "hur mycket ska jag spara", "månadssparande", "sparmål", "spara kalkylator"],
      ogTitle: "Sparmålskalkylator - Hur mycket ska jag spara?",
      ogDescription: "Beräkna hur mycket du behöver spara varje månad för att nå ditt sparmål.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Sparmålskalkylator",
      schemaDescription: "Beräkna det månadssparande som krävs för att nå ett sparmål.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur beräknar jag mitt månadssparande?", answer: "Ange ditt sparmål, antal år och en förväntad ränta. Kalkylatorn använder ränta-på-ränta-formeln och visar hur mycket du behöver sätta in varje månad för att nå målet." },
        { question: "Räknas ränta med?", answer: "Ja. Räntan läggs till månadsvis, så ju högre ränta och längre tid, desto mindre behöver du själv sätta in. Kalkylatorn visar hur mycket av målet som kommer från ränta." },
        { question: "Kan jag räkna med ett befintligt sparande?", answer: "Ja. Ange ditt nuvarande sparade belopp som startbelopp, så drar kalkylatorn av det — inklusive den ränta det själv hinner ge." },
      ],
    },
    "kropsfedt": {
      slug: "kropsfedt",
      title: "Kroppsfettprocent - beräkna med U.S. Navy-metoden",
      description: "Uppskatta din kroppsfettprocent utifrån dina kroppsmått. Ett mer nyanserat mått än BMI som skiljer mellan fett och muskler.",
      metaTitle: "Kroppsfettprocent kalkylator - U.S. Navy-metoden",
      metaDescription: "Gratis kalkylator för kroppsfettprocent. Uppskatta ditt kroppsfett utifrån längd, midja, hals (och höft) med U.S. Navy-metoden. Se om du är på en hälsosam nivå.",
      keywords: ["kroppsfettprocent", "beräkna kroppsfett", "fettprocent kalkylator", "body fat kalkylator", "navy metoden"],
      ogTitle: "Kroppsfettprocent - Beräkna med U.S. Navy-metoden",
      ogDescription: "Uppskatta din kroppsfettprocent utifrån dina kroppsmått.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kroppsfettprocent kalkylator",
      schemaDescription: "Uppskatta kroppsfettprocent utifrån kroppsmått med U.S. Navy-metoden.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hur beräknas kroppsfettprocent?", answer: "Kalkylatorn använder U.S. Navy-metoden, som uppskattar fettprocenten utifrån omkretsen på midja, hals och längd (samt höft för kvinnor). Det är en enkel och relativt exakt metod som inte kräver utrustning." },
        { question: "Vad är en hälsosam kroppsfettprocent?", answer: "Vägledande ligger en hälsosam nivå på 14-24 % för män och 21-31 % för kvinnor. Atleter ligger ofta lägre. Mycket låga eller höga nivåer kan påverka hälsan." },
        { question: "Är kroppsfettprocent bättre än BMI?", answer: "Kroppsfettprocent skiljer mellan fett och muskler, vilket BMI inte gör. En muskulös person kan ha högt BMI men lågt kroppsfett. Båda är dock bara uppskattningar — använd dem som riktmärken." },
      ],
    },
    "promille": {
      slug: "promille",
      title: "Promillekalkylator",
      description: "4 öl till en man på 80 kg ger 0,88 ‰. Beräkna promille utifrån antal standardglas, kroppsvikt, kön och timmar sedan första glaset.",
      metaTitle: "Promillekalkylator: 4 öl på 80 kg = 0,88 ‰",
      metaDescription: "4 öl på 80 kg = 0,88 ‰ med Widmarks formel. Beräkna promille utifrån standardglas, vikt, kön och timmar — och se gränsen på 0,2 ‰.",
      keywords: ["promillekalkylator", "beräkna promille", "alkoholpromille", "promillemätare", "rattfylleri gräns"],
      ogTitle: "Promillekalkylator: 4 öl på 80 kg = 0,88 ‰",
      ogDescription: "4 öl på 80 kg = 0,88 ‰ med Widmarks formel. Beräkna promille utifrån standardglas, vikt, kön och timmar — och se gränsen på 0,2 ‰.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Promillekalkylator",
      schemaDescription: "Beräkna alkoholpromille med Widmarks formel: 4 öl på 80 kg = 0,88 ‰.",
      schemaCategory: "HealthApplication",
      faqItems: [
        { question: "Hur beräknas promille?", answer: "Kalkylatorn använder Widmarks formel: promille = gram alkohol / (kroppsvikt × fördelningsfaktor) − 0,15 × timmar. Fördelningsfaktorn är cirka 0,68 för män och 0,55 för kvinnor. Kroppen bryter ner ungefär 0,15 ‰ per timme." },
        { question: "Vad är promillegränsen i Sverige?", answer: `Gränsen för rattfylleri är ${pct(PROMILLEGRANSE.se)} ‰. Vid ${pct(PROMILLEGROV_SE)} ‰ räknas det som grovt rattfylleri. Gränsen är betydligt lägre än i Danmark (${pct(PROMILLEGRANSE.da)} ‰).` },
        { question: "Hur mycket är ett standardglas?", answer: "Ett standardglas motsvarar 12 gram ren alkohol — ungefär en vanlig öl (33 cl), ett litet glas vin (12 cl) eller en snaps sprit (4 cl)." },
        { question: "Hur många promille är 2 öl?", answer: `En vanlig öl på 33 cl är ca 12 gram alkohol, alltså ett standardglas. Två öl ger därför ca ${PROMILE_80_MAND(2)} promille hos en man på 80 kg och ${PROMILE_60_KVINDE(2)} hos en kvinna på 60 kg. Den svenska gränsen på ${pct(PROMILLEGRANSE.se)} promille nås alltså efter ${PROMILE_GRAENSE_80_MAND_SE} öl hos en man på 80 kg — och efter ytterligare en timme är det ungefär 0,15 promille mindre.` },
        { question: "Hur många promille är farligt?", answer: `Promillen stiger kraftigt för varje standardglas: 4 öl på 80 kg är ${formatPromille(PROMILLE_4_OEL.promille)} promille, och 6 öl på 70 kg ger ${PROMILE_70_MAND(6)} promille. Det är inte promillet i sig som är farligt, utan vad du gör med bilen: från ${pct(PROMILLEGRANSE.se)} promille är det redan rattfylleri, och vid ${pct(PROMILLEGROV_SE)} promille räknas det som grovt rattfylleri — den grad där du som utgångspunkt förlorar ditt körkort. Det gäller oavsett om du känner dig "lagom" eller inte.` },
        { question: "Vad är promillegränsen i Danmark?", answer: `I Danmark går gränsen vid ${pct(PROMILLEGRANSE.da)} promille — alltså mer än dubbelt så hög som den svenska på ${pct(PROMILLEGRANSE.se)}. Det betyder att 2 öl till en man på 80 kg, som ger ${PROMILE_80_MAND(2)} promille, är lovligt i Danmark men rattonyktert i Sverige. Polen har också ${pct(PROMILLEGRANSE_UDLAND.polen)} promille, medan Storbritannien ligger på ${pct(PROMILLEGRANSE_UDLAND.storbritannien)}.` },
        { question: "Är beräkningen exakt?", answer: "Nej, det är en uppskattning. Mat, ämnesomsättning, medicin och hälsa påverkar den faktiska promillen. Kör aldrig bil om du är osäker." },
        { question: "När kan jag köra bil igen?", answer: `4 öl på 80 kg = ${PROMILLE_4_OEL_ER}. Det finns två olika tal, och det är det kortare som avgör: du får köra bil när promillen är under ${pct(PROMILLEGRANSE.se)} ‰, och det tar ${formatTimer(PROMILLE_4_OEL.timerTilGraenseSe, "se")}. Helt nykter är du först efter ${formatTimer(PROMILLE_4_OEL.timerTilNul, "se")}, eftersom kroppen bara bryter ner ungefär 0,15 ‰ per timme. Tolv glas är alltså fullt lagliga kvar vid tre på natten och du är fortfarande berusad på morgonen. Morgonen efter är den farligaste, eftersom promillen ofta är högre än man tror.` },
      ],
    },
    "del-regning": {
      slug: "del-regning",
      title: "Dela notan - fördela beloppet mellan flera",
      description: "Dela en nota jämnt mellan flera personer, med möjlighet att lägga till dricks. Se beloppet per person.",
      metaTitle: "Dela notan - Beräkna belopp per person med dricks",
      metaDescription: "Gratis kalkylator för att dela notan. Ange belopp, antal personer och ev. dricks och se vad var och en ska betala. Perfekt för restaurang och fester.",
      keywords: ["dela notan", "belopp per person", "dela nota kalkylator", "dricks kalkylator", "splitta notan"],
      ogTitle: "Dela notan - Belopp per person",
      ogDescription: "Dela en nota jämnt mellan flera personer, med dricks.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Dela notan",
      schemaDescription: "Dela en nota jämnt mellan flera personer, med möjlighet till dricks.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur delar jag en nota mellan flera?", answer: "Dela notans belopp med antalet personer. Exempel: 500 kr delat på 4 = 125 kr per person. Kalkylatorn gör det automatiskt och kan även lägga till dricks." },
        { question: "Hur mycket dricks ska man ge i Sverige?", answer: "I Sverige förväntas inte dricks, eftersom servicen ingår i priserna. Många rundar upp eller ger 5-10 % vid bra service, men det är helt frivilligt." },
        { question: "Kan jag räkna med dricks i delningen?", answer: "Ja. Välj en dricksprocent (eller ange din egen), så lägger kalkylatorn till den på notan innan beloppet fördelas jämnt mellan er." },
      ],
    },
    "brok": {
      slug: "brok",
      title: "Bråkkalkylator - förkorta bråk till decimaltal och procent",
      description: "6/8 förkortat = 3/4 = 0,75 = 75 %. Bråkkalkylatorn hittar största gemensamma delare och visar bråk, decimaltal och procent.",
      metaTitle: "Bråkkalkylator: förkorta 6/8 till 3/4 = 0,75 = 75 %",
      metaDescription: "Förkorta ett bråk till enklaste form och se det som decimaltal och procent. Exempel: 6/8 = 3/4 = 0,75 = 75 %. Ange täljare och nämnare.",
      keywords: ["bråkkalkylator", "förkorta bråk", "bråk till decimaltal", "bråk till procent", "förkorta bråk"],
      ogTitle: "Bråkkalkylator: förkorta 6/8 till 3/4 = 0,75 = 75 %",
      ogDescription: "Största gemensamma delare hittar den enklaste formen. Exempel: 6/8 = 3/4 = 0,75 = 75 %.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Bråkkalkylator",
      schemaDescription: "Förkorta ett bråk till enklaste form och omvandla till decimaltal och procent.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur förkortar man ett bråk?", answer: "Dela både täljare och nämnare med deras största gemensamma delare. T.ex. blir 6/8 till 3/4, eftersom båda talen kan delas med 2. Kalkylatorn gör det automatiskt." },
        { question: "Vad är 6/8 som decimaltal och procent?", answer: "6/8 = 0,75 = 75 %. Täljaren 6 delas med nämnaren 8, och resultatet multipliceras med 100 för att ge procent. Förkortat är bråket 3/4." },
        { question: "Hur gör jag om ett bråk till procent?", answer: "Dela täljaren med nämnaren och multiplicera med 100. T.ex. är 3/4 = 0,75 = 75 %. Kalkylatorn visar både decimaltal och procent samtidigt." },
      ],
    },
    "enheder": {
      slug: "enheder",
      title: "Enhetskalkylator - omvandla längd, vikt och volym",
      description: "Omvandla mellan metriska och angloamerikanska enheter: km och mil, meter och fot, kg och pund, liter och gallon.",
      metaTitle: "Enhetskalkylator - Omvandla km/mil, kg/pund, liter/gallon",
      metaDescription: "Gratis enhetskalkylator. Omvandla längd, vikt och volym mellan metriska och angloamerikanska enheter — km till mil, kg till pund, liter till gallon.",
      keywords: ["enhetskalkylator", "km till mil", "kg till pund", "cm till tum", "liter till gallon", "omvandla enheter"],
      ogTitle: "Enhetskalkylator - Omvandla längd, vikt och volym",
      ogDescription: "Omvandla mellan metriska och angloamerikanska enheter för längd, vikt och volym.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Enhetskalkylator",
      schemaDescription: "Omvandla mellan enheter för längd, vikt och volym — metriska och angloamerikanska.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur många kilometer är en engelsk mil?", answer: "En engelsk mil är 1,609 kilometer (1 609 meter). Se upp: en skandinavisk »mil« är däremot 10 kilometer. Kalkylatorn använder engelsk mil." },
        { question: "Hur många kilo är ett pund?", answer: "Ett engelskt/amerikanskt pund (lb) är 0,4536 kg, så 1 kg är cirka 2,2 pund. Observera att det svenska skålpundet i vardagstal ibland betyder 500 gram." },
        { question: "Hur många centimeter är en tum?", answer: "En tum (inch) är exakt 2,54 cm. En fot är 12 tum = 30,48 cm, och en yard är 3 fot = 91,44 cm." },
      ],
    },
    "nedtaelling": {
      slug: "nedtaelling",
      title: "Hur många dagar är det kvar till ett datum?",
      description: "Välj datumet och se hur många dagar och hela veckor som är kvar. Räkna ner till födelsedag, semester, tenta eller jul — dagens datum räknas inte med.",
      metaTitle: "Nedräkning dagar - hur många dagar kvar till ett datum?",
      metaDescription: "Se hur många dagar och veckor som är kvar till en födelsedag, semester, tenta eller jul. Välj datumet och få antalet dagar och hela veckor.",
      keywords: ["nedräkning", "hur många dagar till", "dagar till datum", "räkna ner till datum", "dagar till jul"],
      ogTitle: "Nedräkning dagar - hur många dagar kvar till ett datum?",
      ogDescription: "Välj datumet och se hur många dagar och hela veckor som är kvar.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Nedräkning",
      schemaDescription: "Se hur många dagar och hela veckor som är kvar till ett valt datum.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur räknar jag dagar till ett datum?", answer: "Välj datumet, så räknar kalkylatorn automatiskt från dagens datum och visar antalet dagar — och hur många veckor och dagar det motsvarar." },
        { question: "Räknas dagens datum med?", answer: "Nej, beräkningen räknar antal hela dagar från idag till det valda datumet. Väljer du morgondagen visar den 1 dag." },
        { question: "Kan jag räkna dagar sedan ett datum?", answer: "Ja. Väljer du ett datum som redan passerat visar kalkylatorn hur många dagar som gått sedan dess." },
        { question: "Hur räknar jag ut dagar kvar i Excel?", answer: "Sätt måldatumet i cell A1 och skriv =DATEDIF(IDAG();A1;\"d\"). Då står antalet dagar kvar i cellen bredvid. Semikolon används i svensk Excel, och DATEDIF är ett dolt namn som inte syns i funktionslistan." },
        { question: "Hur får jag timmar, minuter och sekunder kvar i Excel?", answer: "DATEDIF räknar bara hela dagar. Multiplicera i stället A1−IDAG() med 24 för timmar, 1440 för minuter eller 86400 för sekunder — Excel lagrar ett datum som ett bråktal av ett dygn. Formatera cellen som Tal, annars visas ett datumformat." },
        { question: "Hur många dagar är det kvar till jul?", answer: "Juldagen är alltid 25 december, så antalet beror på när du läser sidan. Sidan \"Hur många dagar är det kvar till juldagen?\" räknar ut det åt dig varje dag." },
      ],
    },
    "fart": {
      slug: "fart",
      title: "Hastighetskalkylator - beräkna hastighet, sträcka och tid",
      description: "Beräkna hastighet, sträcka eller tid utifrån de två andra. Se även ditt tempo i minuter per kilometer för löpning och cykling.",
      metaTitle: "Hastighetsberäknare: 100 km/h i 2 timmar = 200 km",
      metaDescription: "Gratis hastighetskalkylator. Beräkna fart, sträcka eller tid — och omvandla km/h till m/s, mph och knop. Se tempo i min/km för löpning och cykling.",
      keywords: ["hastighetskalkylator", "beräkna hastighet", "km/h kalkylator", "tempo kalkylator", "min per km", "medelhastighet", "omvandla km/h", "km i timmen m/s", "omvandla mph", "knop till km/h", "omvandla fart"],
      ogTitle: "Hastighetsberäknare: 100 km/h i 2 timmar = 200 km",
      ogDescription: "Beräkna hastighet, sträcka eller tid utifrån de två andra.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Hastighetskalkylator",
      schemaDescription: "Beräkna hastighet, sträcka eller tid utifrån de två andra och se tempo i min/km.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur beräknar jag medelhastighet?", answer: "Dela sträckan med tiden. Exempel: 100 km på 2 timmar ger 50 km/h. Kalkylatorn gör det automatiskt — välj 'Hastighet' och ange sträcka och tid." },
        { question: "Hur omvandlar jag hastighet till tempo (min/km)?", answer: "Dela 60 med hastigheten i km/h. Exempel: 10 km/h = 60 / 10 = 6 min/km. Kalkylatorn visar tempot automatiskt, vilket är användbart för löpning och cykling." },
        { question: "Vad är formeln för hastighet, sträcka och tid?", answer: "Grundformeln är sträcka = hastighet × tid. Därav följer hastighet = sträcka / tid och tid = sträcka / hastighet. Välj bara vad du vill beräkna." },
        { question: "Hur många m/s är 100 km/h?", answer: `100 km/h är ${FART_OMREGNING.seHundredeMs} m/s. Du kan räkna det i huvudet: 1 m/s är exakt ${FART_OMREGNING.seMs} km/h, så dela 100 med ${FART_OMREGNING.seMs}. Omvandlaren under rubriken «Omvandla hastighet» svarar åt båda håll.` },
        { question: "Vad är en knop, och hur många km/h är det?", answer: `En knop är en sjömil i timmen, alltså exakt ${FART_OMREGNING.seSomermil} km/h. Därför är 10 knop ${FART_OMREGNING.seTiKnop} km/h, och 100 km/h är ${FART_OMREGNING.seHundredeKnop} knop. Knop används inom sjöfart och flyg, eftersom det är den enhet båda använder.` },
        { question: "Hur många km/h är 60 mph?", answer: `60 mph är ${FART_OMREGNING.seSESSMph} km/h. Skriv 60 i fältet och välj «Miles i timmen (mph)», så får du svaret tillsammans med de tre andra enheterna.` },
      ],
    },
    "gennemsnit": {
      slug: "gennemsnit",
      title: "Medelvärdeskalkylator - beräkna medelvärde och median",
      description: "Ange en rad tal och beräkna medelvärde, median, summa, minsta och största värde direkt.",
      metaTitle: "Medelvärdeskalkylator - Beräkna medelvärde och median",
      metaDescription: "Gratis medelvärdeskalkylator. Ange tal separerade med komma eller mellanslag och få medelvärde, median, summa, min och max. Perfekt för betyg och mätningar.",
      keywords: ["medelvärdeskalkylator", "beräkna medelvärde", "median kalkylator", "medelvärde betyg", "räkna ut medelvärde"],
      ogTitle: "Medelvärdeskalkylator - Medelvärde, median och summa",
      ogDescription: "Ange tal och beräkna medelvärde, median och summa direkt.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Medelvärdeskalkylator",
      schemaDescription: "Beräkna medelvärde, median, summa, min och max av en rad tal.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur beräknar jag ett medelvärde?", answer: "Lägg ihop alla talen och dela med antalet tal. Exempel: (12 + 15 + 9) / 3 = 12. Kalkylatorn gör det automatiskt, oavsett hur många tal du anger." },
        { question: "Vad är skillnaden mellan medelvärde och median?", answer: "Medelvärdet är summan delat med antalet. Medianen är det mittersta talet när värdena sorteras. Medianen påverkas mindre av enstaka mycket höga eller låga värden och är ofta mer rättvisande vid t.ex. lön." },
        { question: "Hur anger jag talen?", answer: "Skriv talen separerade med komma, mellanslag eller radbrytning, t.ex. '12, 15, 9'. Du kan använda komma som decimaltecken (3,5) — kalkylatorn förstår båda." },
      ],
    },
    "temperatur": {
      slug: "temperatur",
      title: "Temperaturkalkylator - Celsius, Fahrenheit och Kelvin",
      description: "Omvandla snabbt mellan Celsius, Fahrenheit och Kelvin. Ange en temperatur och se de andra enheterna direkt.",
      metaTitle: "Temperaturkalkylator - Celsius, Fahrenheit, Kelvin",
      metaDescription: "Gratis temperaturkalkylator. Omvandla enkelt mellan Celsius, Fahrenheit och Kelvin. Perfekt för recept, väder och skola. Se formlerna och fasta punkter.",
      keywords: ["celsius till fahrenheit", "fahrenheit till celsius", "temperatur omvandlare", "kelvin till celsius", "temperaturkalkylator"],
      ogTitle: "Temperaturkalkylator - Celsius, Fahrenheit och Kelvin",
      ogDescription: "Omvandla snabbt mellan Celsius, Fahrenheit och Kelvin.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Temperaturkalkylator",
      schemaDescription: "Omvandla mellan Celsius, Fahrenheit och Kelvin.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
        { question: "Hur omvandlar jag Fahrenheit till Celsius?", answer: "Dra bort 32 och multiplicera med 5/9: °C = (°F − 32) × 5/9. Exempel: 98,6 °F = (98,6 − 32) × 5/9 = 37 °C. Kalkylatorn gör det automatiskt." },
        { question: "Hur omvandlar jag Celsius till Fahrenheit?", answer: "Multiplicera med 9/5 och lägg till 32: °F = °C × 9/5 + 32. Exempel: 20 °C = 20 × 9/5 + 32 = 68 °F." },
        { question: "Vad är Kelvin?", answer: "Kelvin är den absoluta temperaturskalan där 0 K är den absoluta nollpunkten (−273,15 °C). Du omvandlar från Celsius genom att lägga till 273,15: K = °C + 273,15." },
      ],
    },
    "enhedspris": {
      slug: "enhedspris",
      title: "Jämförpris - hitta den billigaste varan",
      description: "35 kr för 2 kg kostar 17,50 kr per kg — 12,5 % billigare än 20 kr för 1 kg. Jämför jämförpris, kilopris och literpris.",
      metaTitle: "Jämförpris: 35 kr för 2 kg = 17,50 kr per kg",
      metaDescription: "35 kr för 2 kg kostar 17,50 kr per kg, 12,5 % billigare än 20 kr för 1 kg. Jämför två varors kilopris, literpris och styckpris.",
      keywords: ["jämförpris", "kilopris kalkylator", "literpris", "pris per enhet", "jämför priser vara"],
      ogTitle: "Jämförpris: 35 kr för 2 kg = 17,50 kr per kg",
      ogDescription: "35 kr för 2 kg kostar 17,50 kr per kg, 12,5 % billigare än 20 kr för 1 kg. Jämför två varors kilopris, literpris och styckpris.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Jämförpriskalkylator",
      schemaDescription: "Jämför två varors pris per enhet: 35 kr för 2 kg kostar 17,50 kr per kg, 12,5 % billigare än 20 kr för 1 kg.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Vad är jämförpris?", answer: "Jämförpriset är priset per enhet — t.ex. per kilo, per liter eller per styck. Det beräknas som priset delat med mängden och gör det möjligt att jämföra varor i olika storlekar rättvist." },
        { question: "Är det stora paketet alltid billigast?", answer: "Nej. Ofta är det stora paketet billigast per enhet, men inte alltid — rea på små paket kan göra dem billigare per kilo. Kalkylatorn visar det direkt." },
        { question: "Kan jag jämföra olika enheter?", answer: "Nej, båda varorna måste mätas i samma enhet (t.ex. båda i kg eller båda i liter). Omvandla själv om den ena är i gram och den andra i kilo." },
        { question: "Vilken förpackning är billigast per kilo i praktiken?", answer: "Varan till 35 kr för 2 kg kostar 17,50 kr per kg, medan varan till 20 kr för 1 kg kostar 20,00 kr per kg. Det stora paketet är alltså 12,5 % billigare per enhet, trots att det bara kostar 15 kr mer." },
      ],
    },
    "afkast": {
      slug: "afkast",
      title: "Avkastningskalkylator - beräkna ROI och årlig avkastning",
      description: "Beräkna din avkastning (ROI) och den genomsnittliga årliga avkastningen (CAGR) utifrån investerat belopp och värde idag.",
      metaTitle: "Avkastningskalkylator - Beräkna ROI och CAGR",
      metaDescription: "Gratis avkastningskalkylator. Beräkna avkastning (ROI) i procent och kronor samt årlig avkastning (CAGR) utifrån investerat belopp, värde idag och antal år.",
      keywords: ["avkastningskalkylator", "beräkna avkastning", "roi kalkylator", "årlig avkastning", "cagr kalkylator"],
      ogTitle: "Avkastningskalkylator - Beräkna ROI och årlig avkastning",
      ogDescription: "Beräkna din avkastning (ROI) och den genomsnittliga årliga avkastningen.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Avkastningskalkylator",
      schemaDescription: "Beräkna avkastning (ROI) och årlig avkastning (CAGR) utifrån investerat belopp och värde idag.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur beräknar jag avkastning (ROI)?", answer: "Dra bort det investerade beloppet från värdet idag och dela med det investerade beloppet. Exempel: (13 000 − 10 000) / 10 000 = 30 %. Kalkylatorn gör det automatiskt." },
        { question: "Vad är årlig avkastning (CAGR)?", answer: "CAGR (Compound Annual Growth Rate) är den genomsnittliga årliga tillväxttakten. Den gör det möjligt att jämföra investeringar över olika perioder. Ange antal år för att få den beräknad." },
        { question: "Ingår avgifter och skatt i beräkningen?", answer: "Nej. Kalkylatorn visar bruttoavkastningen. Avgifter, courtage och skatt på vinst minskar din verkliga avkastning och bör dras av separat." },
      ],
    },
    "loen-konverter": {
      slug: "loen-konverter",
      title: "Lönekalkylator - timlön, månadslön och årslön",
      description: "Omvandla snabbt mellan timlön, månadslön och årslön. Ange ett belopp och se de andra direkt.",
      metaTitle: "Lönekalkylator - Omvandla timlön, månadslön och årslön",
      metaDescription: "Gratis lönekalkylator. Omvandla enkelt mellan timlön, månadslön och årslön utifrån dina veckotimmar. Perfekt för att jämföra jobberbjudanden. Bruttolön.",
      keywords: ["timlön till månadslön", "månadslön till årslön", "omvandla lön", "lönekalkylator", "timlön kalkylator"],
      ogTitle: "Lönekalkylator - Omvandla timlön, månadslön och årslön",
      ogDescription: "Omvandla snabbt mellan timlön, månadslön och årslön.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lönekalkylator",
      schemaDescription: "Omvandla mellan timlön, månadslön och årslön utifrån veckotimmar.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur räknar jag om timlön till månadslön?", answer: "Multiplicera timlönen med antal timmar du arbetar per vecka och med 52 veckor, dela sedan med 12. Exempel: 200 kr/tim × 40 timmar × 52 / 12 = ca 34 667 kr per månad. Kalkylatorn gör det automatiskt." },
        { question: "Hur många timmar är en heltid?", answer: "I Sverige är en heltid vanligtvis 40 timmar per vecka. Kalkylatorn använder 40 timmar som standard, men du kan ändra till dina egna timmar." },
        { question: "Är beloppet före eller efter skatt?", answer: "Alla belopp är bruttolön före skatt. Vill du se vad du får ut efter skatt, använd vår lön efter skatt-kalkylator." },
      ],
    },
    "budget": {
      slug: "budget",
      title: "Hushållsbudget",
      description: "Beräkna hur mycket du har kvar att leva på varje månad. Dra dina fasta utgifter från din inkomst efter skatt.",
      metaTitle: "Hushållsbudget – Kvar att leva på",
      metaDescription: "Räkna ut hur mycket du har kvar att leva på. Ange inkomst och fasta utgifter (boende, transport, mat, lån) och se ditt månadsöverskott. Gratis budgetkalkylator.",
      keywords: ["hushållsbudget", "kvar att leva på", "budgetkalkylator", "månadsbudget", "privatekonomi", "fasta utgifter"],
      ogTitle: "Hushållsbudget – Kvar att leva på",
      ogDescription: "Beräkna hur mycket du har kvar att leva på varje månad.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Hushållsbudget",
      schemaDescription: "Gratis budgetkalkylator. Räkna ut hur mycket du har kvar att leva på varje månad.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Vad betyder kvar att leva på?", answer: "Kvar att leva på är det belopp du har över varje månad när alla fasta utgifter är betalda – din inkomst efter skatt minus boende, transport, mat, försäkringar och amorteringar." },
        { question: "Hur mycket bör jag ha kvar att leva på?", answer: "Kronofogden använder ett normalbelopp (förbehållsbelopp) som riktmärke – 2026 cirka 6 400 kr per månad för en ensamstående vuxen, utöver boendekostnaden. Ett större överskott ger buffert och möjlighet att spara." },
        { question: "Vilka räknas som fasta utgifter?", answer: "Fasta utgifter är återkommande poster som hyra/bolån, försäkringar, abonnemang (mobil, streaming, internet), transport, mat och amortering på lån." },
      ],
    },
    "bolan": {
      slug: "bolan",
      title: "Bolånekalkylator",
      description: "Beräkna månadskostnaden för ditt bolån 2026 – ränta, amorteringskrav och ränteavdrag. Se belåningsgrad och kontantinsats.",
      metaTitle: "Bolånekalkylator 2026 – Beräkna månadskostnad",
      metaDescription: "Beräkna ditt bolån 2026. Ange bostadens pris, lånebelopp och ränta och se månadskostnad, amorteringskrav, belåningsgrad och ränteavdrag.",
      keywords: ["bolån", "bolånekalkylator", "amorteringskrav", "belåningsgrad", "månadskostnad bolån", "ränteavdrag", "bolånetak"],
      ogTitle: "Bolånekalkylator 2026 – Beräkna månadskostnad",
      ogDescription: "Beräkna månadskostnaden för ditt bolån 2026 med amorteringskrav och ränteavdrag.",
      category: "Bostad",
      breadcrumbCategory: "Bostad",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Bolånekalkylator",
      schemaDescription: "Gratis bolånekalkylator. Beräkna månadskostnad, amorteringskrav och ränteavdrag för ditt bolån 2026.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur mycket måste jag amortera på mitt bolån 2026?", answer: "Sedan 1 april 2026 beror amorteringskravet enbart på belåningsgraden: minst 2 % av lånet per år vid belåningsgrad över 70 %, minst 1 % vid 50–70 %, och inget krav under 50 %. Det tidigare skuldkvotskravet (extra 1 % för lån över 4,5× inkomsten) är borttaget." },
        { question: "Hur stor kontantinsats behöver jag?", answer: "Bolånetaket är 90 % av bostadens värde från 2026, så du behöver minst 10 % i kontantinsats. Tidigare var kravet 15 %." },
        { question: "Vad är ränteavdrag?", answer: "Du får dra av 30 % av dina räntekostnader upp till 100 000 kr underskott av kapital per år, och 21 % på beloppet däröver. Det sänker din effektiva räntekostnad." },
        { question: "Vad är skillnaden på bunden och rörlig ränta?", answer: "Bunden ränta är låst en period (t.ex. 1–5 år) och ger en förutsägbar månadskostnad. Rörlig ränta (oftast 3 månader) är ofta lägre men kan ändras. Många väljer en kombination." },
      ],
    },
    "lon-efter-skatt": {
      slug: "lon-efter-skatt",
      title: "Lön efter skatt",
      description: "Beräkna din nettolön efter skatt 2026. Se kommunalskatt, statlig skatt, jobbskatteavdrag och grundavdrag – vad får du kvar efter skatt?",
      metaTitle: "Lön efter skatt 2026 – Beräkna din nettolön",
      metaDescription: "Beräkna lön efter skatt 2026. Ange bruttolön och kommunalskatt och se nettolön per månad, jobbskatteavdrag, statlig skatt och effektiv skatt. Gratis kalkylator.",
      keywords: ["lön efter skatt", "nettolön", "lönekalkylator", "skatt 2026", "jobbskatteavdrag", "kommunalskatt", "statlig skatt"],
      ogTitle: "Lön efter skatt 2026 – Beräkna din nettolön",
      ogDescription: "Beräkna din nettolön efter skatt 2026 med jobbskatteavdrag och kommunalskatt.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lön efter skatt",
      schemaDescription: "Gratis lönekalkylator. Beräkna din nettolön efter skatt 2026 med jobbskatteavdrag, kommunalskatt och statlig skatt.",
      schemaCategory: "FinanceApplication",
      faqItems: [
        { question: "Hur mycket skatt betalar jag på min lön 2026?", answer: `Skatten består av kommunalskatt (i genomsnitt ${pctSe(SV_SKATT.kommunalskattSnitt, 2)} % 2026) på din beskattningsbara inkomst, plus statlig inkomstskatt på ${pctSe(SV_SKATT.statligSkatt)} % för beskattningsbar inkomst över ${krSe(SV_SKATT.skiktgrans)} kr. Jobbskatteavdraget sänker skatten med upp till cirka ${krSe(SVENSK_SKATT_TAL.jobbskatteavdragMaxManad)} kr per månad.` },
        { question: "Vad är jobbskatteavdrag?", answer: "Jobbskatteavdraget är en skattereduktion för arbetsinkomst som räknas av mot din kommunalskatt. Storleken beror på din inkomst och kommunalskattesats. För 2026 slopas avtrappningen vid höga inkomster." },
        { question: "Vad är grundavdrag?", answer: `Grundavdraget är en del av inkomsten du inte betalar skatt på. Det varierar mellan cirka ${krSe(SVENSK_SKATT_TAL.grundavdragMin)} och ${krSe(SVENSK_SKATT_TAL.grundavdragMax)} kr per år 2026 beroende på din inkomst (prisbasbelopp ${krSe(SV_SKATT.prisbasbelopp)} kr).` },
        { question: "När betalar man statlig inkomstskatt?", answer: `Statlig inkomstskatt på ${pctSe(SV_SKATT.statligSkatt)} % tas ut på beskattningsbar förvärvsinkomst över skiktgränsen ${krSe(SV_SKATT.skiktgrans)} kr 2026, vilket motsvarar en bruttolön (brytpunkt) på cirka ${krSe(SVENSK_SKATT_TAL.statligBrytpunkt)} kr per år för den som är under 66 år.` },
        { question: "Ingår pensionsavgift och public service-avgift?", answer: `Allmän pensionsavgift (${pctSe(SV_SKATT.pensionsavgift)} %) dras men krediteras fullt ut via skattereduktion, så den påverkar normalt inte din nettolön. Public service-avgiften är ${pctSe(SV_SKATT.publicServiceSats)} % av inkomsten, högst ${krSe(SV_SKATT.publicServiceMax)} kr per år 2026.` },
      ],
    },
    "bmi": {
      slug: "bmi",
      title: "BMI-kalkylator för vuxna",
      description: "Beräkna ditt Body Mass Index (BMI) som vuxen och se hur vikt och längd förhåller sig till varandra. BMI-formeln använder endast vikt och längd.",
      metaTitle: "BMI-kalkylator för vuxna: 75 kg / 1,75² = 24,5",
      metaDescription: "Beräkna ditt BMI på 5 sekunder. Exempel: 75 kg / 1,75² = BMI 24,5 (normalt). BMI-formeln justeras inte för ålder och är avsedd för vuxna.",
      keywords: ["bmi kalkylator", "bmi vuxna", "bmi", "body mass index", "beräkna bmi", "bmi skala", "viktintervall", "viktkalkylator", "hälsa kalkylator", "övervikt"],
      ogTitle: "BMI-kalkylator för vuxna: 75 kg / 1,75² = 24,5",
      ogDescription: "Gratis BMI-kalkylator för vuxna. Se hur vikten passar till längden och hitta BMI-intervallet.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "BMI-kalkylator för vuxna",
      schemaDescription: "Gratis BMI-kalkylator för vuxna. Beräkna ditt Body Mass Index utifrån vikt och längd.",
      schemaCategory: "HealthApplication",
      faqItems: [
      { question: "Vad är ett normalt BMI för vuxna?", answer: "För vuxna ligger BMI normalt mellan 18,5 och 24,9. Under 18,5 räknas som undervikt, 25-29,9 som övervikt och över 30 som fetma." },
      { question: "Är BMI tillförlitligt för alla?", answer: "BMI är ett bra screeningverktyg men har begränsningar. Mycket muskulösa personer kan ha högt BMI utan att vara överviktiga." },
      { question: "Hur beräknas BMI?", answer: "BMI = vikt (kg) / längd² (m). En person på 75 kg och 175 cm har BMI = 75 / 1,75² = 24,5. Formeln justeras inte för ålder." },
      { question: "Vad är mitt viktintervall för vuxna?", answer: "Viktintervallet för vuxna med BMI 18,5-24,9 vid en längd på 175 cm är cirka 57-76 kg." },
      { question: "Gäller BMI för barn?", answer: "Den här kalkylatorn är endast för vuxna (18+). Den beräknar rått BMI, men inte barns percentil. För barn behöver du ålders- och könsspecifika percentiltabeller." },
      { question: "Vad kan jag göra för att förbättra mitt BMI?", answer: "Vid övervikt: mer motion och hälsosammare kost. Vid undervikt: frekventa, näringsrika måltider och styrketräning." },
      ],
    },
    "kalorier": {
      slug: "kalorier",
      title: "Kalorikalkylator",
      description: kalorierOverskrifter("se").description,
      metaTitle: kalorierOverskrifter("se").metaTitle,
      metaDescription: kalorierOverskrifter("se").metaDescription,
      keywords: ["kalorikalkylator", "dagligt kaloribehov", "TDEE kalkylator", "BMR kalkylator", "viktminskning kalorier", "makrokalkylator", "proteinkalkylator"],
      ogTitle: kalorierOverskrifter("se").ogTitle,
      ogDescription: "BMR och TDEE baserat på ålder, kön, vikt, längd och aktivitet – med makrofördelning.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Kalorikalkylator",
      schemaDescription: "Beräkna BMR, TDEE och makrofördelning utifrån ålder, kön, vikt, längd och aktivitetsnivå.",
      schemaCategory: "HealthApplication",
      faqItems: kalorierFaqItems("se"),
    },
    "vaegttab": {
      slug: "vaegttab",
      title: "Viktminskning Kalkylator",
      description: vaegttabSe.description,
      metaTitle: vaegttabSe.metaTitle,
      metaDescription: vaegttabSe.metaDescription,
      keywords: ["viktminskning kalkylator", "kaloriunderskott", "gå ner i vikt", "kalorier viktminskning", "hälsosam viktminskning"],
      ogTitle: vaegttabSe.metaTitle,
      ogDescription: vaegttabSe.metaDescription,
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Viktminskning Kalkylator",
      schemaDescription: vaegttabSe.schemaDescription,
      schemaCategory: "HealthApplication",
      faqItems: vaegttabFaqItems("se"),
    },
    "procent": {
      slug: "procent",
      title: "Procenträknare",
      description: "Beräkna procent av ett tal, rabattprocent och ökning eller minskning mellan två tal.",
      metaTitle: "Procenträknare: 10 % av ett tal, rabatt och ökning/minskning",
      metaDescription:
        "Beräkna procent av ett tal, rabattprocent och procentuell ändring mellan två tal. T. ex. rabatten på 1125 kr ned från 9000 kr.",
      keywords: ["procenträknare", "beräkna procent", "procent av", "procentuell ökning", "procentuell förändring", "procenträkning"],
      ogTitle: "Procenträknare: 10 % av ett tal, rabatt och ökning/minskning",
      ogDescription:
        "Beräkna procent av ett tal, rabattprocent och procentuell ändring mellan två tal. T. ex. rabatten på 1125 kr ned från 9000 kr.",
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Procenträknare",
      schemaDescription: "Beräkna 10 procent av ett tal, procentuell ökning och minskning.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hur beräknar jag procent av ett tal?", answer: "Multiplicera talet med X och dela med 100. Exempel: 25 % av 200 = 50." },
      { question: "Hur räknar man ut procent i Excel?", answer: `Skriv =A1/B1 om du vill ha andelen, eller =A1/B1*100 om du vill ha procent direkt. ${PROCENT_SE.excelDel} kr av ${PROCENT_SE.excelHeltal} kr ger ${PROCENT_SE.excelAndel}, alltså ${PROCENT_SE.excelProcent} procent. Formatera cellen som procent om du inte skriver *100.` },
      { question: "Hur räknar man ut hur stor del av en summa som är X?", answer: `Dividera beloppet med summan. ${PROCENT_SE.excelDel} kr av en nota på ${PROCENT_SE.excelHeltal} kr = ${PROCENT_SE.excelDel} / ${PROCENT_SE.excelHeltal} = ${PROCENT_SE.excelAndel} = ${PROCENT_SE.excelProcent} procent.` },
      { question: "Hur räknar man ut procent på lön?", answer: `Räkna ut skillnaden mellan ny och gammal lön och dividera med den gamla lönen. ${PROCENT_SE.loenNy} kr mot ${PROCENT_SE.loenGammal} kr ger ${PROCENT_SE.loenForskel} / ${PROCENT_SE.loenGammal} = ${PROCENT_SE.loenProcent} procent.` },
      { question: "Hur beräknar jag procentuell ökning?", answer: "((Ny - Gammal) / Gammal) × 100. Från 100 till 125 = 25 % ökning." },
      { question: "Vad är procentenheter vs procent?", answer: "Procentenheter är den absoluta skillnaden mellan två procenttal, procent är den relativa förändringen. Räntan från 2 % till 3 % är 1 procentenhet, men 50 % ökning. Räkna ut det med procentenhetsräknaren." },
      { question: "Vad är skillnaden på procentenheter och procent?", answer: procentpointForskelFaqSvar("se") },
      { question: "Hur många procentenheter är 1 procent?", answer: "Det beror på vad du räknar från. 2 % till 3 % är 1 procentenhet och 50 %. 20 % till 21 % är också 1 procentenhet, men bara 5 %. Det finns ingen fast sats — procentenheter är alltid bara de två talen minus varandra." },
      { question: "Hur lägger jag till procent?", answer: "Multiplicera med (1 + procent/100). Lägg 20 % till 150: 150 × 1,20 = 180. Räkna ut det i fältet «Lägg till / dra av» ovan." },
      // Rabattklyngen. Svensk autocomplete (hl=se&gl=se, 2026-09-30) svarar på
      // "rabatt i procent" med sju formuleringar, hvorav fyra egna frågor:
      // "hur stor är rabatten i procent", "hur mycket rabatt i procent",
      // "räkna ut rabatt i procent excel" och "procentuell rabatt". Ingen af dem
      // fandtes i FAQ'en, selv om F2 gav siden hela afsnittet "Så här räknar
      // du ut rabatten i procent" — og /rabat er daOnly, så beraknare.se har
      // ingen anden side, hvor spørgsmålet kunne besvares.
      { question: "Hur stor är rabatten i procent?", answer: `Rabatten är (pris före rabatt - pris efter rabatt) / pris före rabatt × 100. En vara som sänks från ${RABAT_SE.normalPris} kr till ${RABAT_SE.nedsatPris} kr har alltså en rabatt på ${RABAT_SE.nedsat} / ${RABAT_SE.normalPris} = ${RABAT_SE.rabat} procent.` },
      { question: "Hur räknar man ut rabatt i procent i Excel?", answer: `Skriv =(B1-A1)/A1*100, där A1 är priset före rabatten och B1 det nya priset. ${RABAT_SE.normalPris} i A1 och ${RABAT_SE.nedsatPris} i B1 ger ${RABAT_SE.rabat} procent rabatt. Vill du bara se vad du sparar, skriv du =A1-B1, som ger ${RABAT_SE.nedsat} kr.` },
      { question: "Vad är procentuell rabatt?", answer: `Procentuell rabatt är hur många procent varan har sänkts, mätt på det pris den hade före sänningen. Det är inte samma sak som hur många kronor du sparar, och inte heller som hur mycket det vanliga priset har stigit: ${RABAT_SE.nedsat} kr är ${RABAT_SE.modNy} procent av det du betalar, men rabatten är ${RABAT_SE.rabat} procent, eftersom heltalet är det vanliga priset.` },
      { question: "Hur mycket rabatt i procent får jag på en vara?", answer: `Har du en rabatsats i stället för två priser, så är rabatten satsen, och det du sparar är beloppet × satsen ÷ 100. ${RABAT_SATS_UDLAET} % rabatt på en vara för ${RABAT_SE.satsBelob} kr är ${RABAT_SE.satsSparer} kr, så du betalar ${RABAT_SE.satsBetaler} kr. ${RABAT_SATS_UDLAET} % är inte en tredjedel: en tredjedel av ${RABAT_SE.satsBelob} kr är ${RABAT_SE.tredjedel} kr, så du hade betalat ${RABAT_SE.tredjedelBetalt} kr.` },
      { question: "Hur räknar man ut skillnaden i procent mellan två tal?", answer: `Det beror på vilket tal som är heltalet. För procentuell förändring är det den gamla summan: ${PROCENT_SE.stigningGammal} till ${PROCENT_SE.stigningNy} ger (${PROCENT_SE.stigningNy} - ${PROCENT_SE.stigningGammal}) / ${PROCENT_SE.stigningGammal} = ${PROCENT_SE.stigningProcent} procent. För procentdifferens, som är lika oberoende av vilken riktning du räknar i, tar du medelvärdet: ${PROCENT_SE.stigningForskel} / ${PROCENT_SE.differensGennemsnit} = ${PROCENT_SE.differens} procent för samma två tal.` },
      { question: "Hur räknar man ut skillnaden mellan två tal i Excel?", answer: `Skriv =(B1-A1)/A1*100, där A1 är det gamla talet och B1 det nya. ${PROCENT_SE.stigningGammal} i A1 och ${PROCENT_SE.stigningNy} i B1 ger ${PROCENT_SE.stigningProcent} procent. Vill du ha den symmetriska skillnaden i stället, skriver du =ABS(A1-B1)/((A1+B1)/2)*100, som ger ${PROCENT_SE.differens} procent för samma tal.` },
      { question: "Vad är 10 procent av 500?", answer: "10 procent av 500 är 50, eftersom du delar 500 med 10. Regeln är alltid att talet delas med 10." },
      { question: "Vad är 10 procent av 1 600?", answer: `10 procent av ${PROCENT_SE.tyveFaaHundrede} är ${PROCENT_SE.tyveFaaHundredeSvar}, eftersom du delar ${PROCENT_SE.tyveFaaHundrede} med 10. Det är samma regel som 10 procent av 500 = 50.` },
      { question: "Varför är 10 procent av 75 inte ett helt tal?", answer: "För att 75 inte kan delas jämnt med 10. 10 procent av 75 är 7,5, och kommat är korrekt — 10 procent av 80 hade varit 8." },
      ],
    },
    "kvadratmeter": {
      slug: "kvadratmeter",
      title: "Kvadratmeterkalkylator",
      description: `Ett rum på ${kvadratmeterEksempelAreal("se")}. Arean är längd × bredd, så ${kvadratmeterEksempelProdukt("se")}. Skriv in pris per m², så kalkylatorn räknar ut priset för ditt golv, dina plattor eller din målning.`,
      metaTitle: `Kvadratmeterkalkylator: ${kvadratmeterEksempelLignelse("se")}`,
      metaDescription: `Ett rum på ${kvadratmeterEksempelAreal("se")}. Area = längd × bredd. Beräkna rektangel, cirkel, triangel och trapets, och sätt pris per m² för golv, plattor och målning.`,
      keywords: ["kvadratmeterkalkylator", "beräkna kvadratmeter", "areakalkylator", "m2 kalkylator", "beräkna area", "rumsstorlek"],
      ogTitle: `Kvadratmeterkalkylator: ${kvadratmeterEksempelLignelse("se")}`,
      ogDescription: `${kvadratmeterEksempelAreal("se")}. Beräkna area av rektanglar, cirklar, trianglar och trapets — och sätt pris på golv, plattor och målning.`,
      category: "Matematik",
      breadcrumbCategory: "Matematik",
      breadcrumbCategoryHref: "/kategori/matematik",
      schemaName: "Kvadratmeterkalkylator",
      schemaDescription: `Beräkna kvadratmeter: ${kvadratmeterEksempelAreal("se")}. Area av rektangel, cirkel, triangel och trapets med pris per m².`,
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hur beräknar jag kvadratmeter?", answer: kvadratmeterFaqSvar("se").grundregel! },
      { question: "Hur räknar man ut kvadratmeter?", answer: kvadratmeterFaqSvar("se").metode! },
      { question: "Hur många m² är ett rum på 3 x 4 meter?", answer: kvadratmeterFaqSvar("se").vaerelse! },
      { question: "Vad kostar 20 m² golv?", answer: kvadratmeterFaqSvar("se").gulvpris! },
      { question: "Vad är skillnaden mellan m² och m?", answer: "Meter mäter längd. Kvadratmeter mäter area/yta." },
      { question: "Omvandling?", answer: kvadratmeterFaqSvar("se").omregning! },
      { question: "Vad kostar golv per m²?", answer: kvadratmeterFaqSvar("se").materialer! },
      ],
    },
    "alder": {
      slug: "alder",
      title: "Ålderskalkylator",
      description: "Hur gammal är du exakt? Född 15 mars 1990 är du {ALDER} per {DATO}. Fyll i födelsedatum, så räknar vi hela år, månader och dagar.",
      metaTitle: "Ålderskalkylator: född 15 mars 1990 = {AAR} år",
      metaDescription: "Hur gammal är du exakt? Född 15 mars 1990 = {ALDER} per {DATO}. Beräkna ålder i år, månader, veckor och dagar.",
      keywords: ["ålderskalkylator", "beräkna ålder", "hur gammal är jag", "exakt ålder", "ålder i dagar", "hur många dagar har jag levt", "hur många timmar har jag levt", "hur gammal är jag i dagar", "stjärntecken"],
      ogTitle: "Ålderskalkylator: född 15 mars 1990 = {AAR} år",
      ogDescription: "Födelsedatum till idag: ålder i år, månader, veckor och dagar. Exempel: född 15 mars 1990 = {ALDER}.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Ålderskalkylator",
      schemaDescription: "Beräkna din ålder i år, månader, veckor och dagar utifrån ditt födelsedatum.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hur gammal är jag exakt?", answer: "Född 15 mars 1990 är du {ALDER} per {DATO}. Fyll i ditt eget födelsedatum för att få åldern i år, månader och dagar." },
      { question: "Hur beräknas min ålder?", answer: "Vi räknar hela år, månader och dagar från ditt födelsedatum till idag." },
      { question: "Hur gammal är jag i dagar?", answer: "Åldern i dagar är antalet dagar mellan födelsedatum och idag. Exempel: född 15 mars 1990 har det gått {DAGE} per {DATO}." },
      { question: "Stjärntecken?", answer: "Ditt stjärntecken bestäms av ditt födelsedatum. Det finns 12 stjärntecken." },
      { question: "Kan jag beräkna ålder mellan två datum?", answer: "Ja. Kalkylatorn har två fält: födelsedatum och 'Beräkna ålder per datum'. Fyller du i båda räknar den hela år, månader och dagar fram till det datum du väljer — född 15 mars 1990 ger 20 år, 1 månad och 16 dagar per 1 maj 2010." },
      { question: "Hur gammal var jag den 1 maj 2010?", answer: "Född 15 mars 1990 var du 20 år, 1 månad och 16 dagar den 1 maj 2010. Sätt 'Beräkna ålder per datum' till det datum du vill se åldern på." },
      { question: "Skottår?", answer: "Ja, kalkylatorn tar hänsyn till skottår och varierande månadslängder." },
      { question: "Räkna ut ålder från personnummer?", answer: "De sex första siffrorna i ett svenskt personnummer är födelsedatumet i ordningen år, månad och dag: 900315 betyder född 15 mars 1990, som ger {ALDER} per {DATO}. Fyll in det datumet i kalkylatorn. Har du ett samordningsnummer är dagen 60 högre, så 63 ska läsas som 3. Källa: Skatteverket." },
      { question: "Hur beräknar man ålder i Excel?", answer: "Med DATEDIF. Har du födelsedatumet i A1 och det datum du vill räkna till i B1, är =DATEDIF(A1;B1;\"Y\") hela år, =DATEDIF(A1;B1;\"M\") månader och =DATEDIF(A1;B1;\"D\") dagar. Född 15 mars 1990 till {DATO} ger {AAR}, {MAANEDER_IALT} och {DAGE_TAL}. Vill du hela åldern i en cell: =DATEDIF(A1;B1;\"Y\")&\" år, \"&DATEDIF(A1;B1;\"YM\")&\" månader och \"&DATEDIF(A1;B1;\"YD\")&\" dagar\". Svensk Excel använder semikolon mellan argumenten." },
      { question: "Varför står det två åldrar för varje födelseår?", answer: "Ett födelseår ger två åldrar, eftersom födelsedagen inte alltid har inträffat: född 1 januari är du äldst i ditt år och född 31 december yngst. Därför står det en ålder från och en ålder till i tabellen på sidan, och dagar-talet för ett år spänner mer än 365 dagar. Vill du ha dag, månad och år fyller du i födelsedatumet i verktyget." },
      { question: "Hur många dagar har jag levt?", answer: "Född 15 mars 1990 har det gått {DAGE} per {DATO}. Det motsvarar {UGER} hela veckor och {MAANEDER} månader, och {TIMER} timmar — exakt 24 per dygn, aldrig 23 eller 25. Fyll i ditt födelsedatum i verktyget, så får du din egen siffra." },
      { question: "Hur många timmar har jag levt?", answer: "Det är samma tal i två steg: dagar × 24 = timmar. Född 15 mars 1990 har du levt {DAGE}, vilket är {TIMER} timmar per {DATO}. Räknas i minuter är det {MINUTTER}. Timmarna är dagarna gånger 24 och aldrig 23 eller 25, även på en dag då klockan ställs om." },
      ],
    },
    "dato": {
      slug: "dato",
      title: "Beräkna antal dagar mellan två datum",
      description: "Välj ett startdatum och ett slutdatum. Se direkt antal dagar, hela veckor, ungefärligt antal månader, arbetsdagar och helgdagar mellan datumen.",
      metaTitle: "Beräkna dagar till 1 december: {DAGE_TIL_DEC} kvar",
      metaDescription: "Hur många dagar är det kvar till ett datum? Räkna antal dagar mellan två datum, ungefärligt antal månader, arbetsdagar och helgdagar.",
      keywords: ["datumkalkylator", "antal dagar mellan två datum", "dagar mellan datum", "beräkna dagar", "arbetsdagar kalkylator", "helgdagar 2026", "lägg till dagar", "datumräknare", "hur många dagar är det kvar", "dagar kvar till"],
      ogTitle: "Beräkna dagar till 1 december: {DAGE_TIL_DEC} kvar",
      ogDescription: "Hur många dagar är det kvar till ett datum? Räkna antal dagar mellan två datum, ungefärligt antal månader, arbetsdagar och helgdagar.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Datumkalkylator",
      schemaDescription: "Beräkna antal dagar mellan två datum, hela veckor, ungefärligt antal månader och arbetsdagar.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hur beräknar jag dagar mellan två datum?", answer: "Välj start- och slutdatum. Kalkylatorn visar dagar, hela veckor, ungefärligt antal månader, arbetsdagar, helgdagar och lördagar/söndagar." },
      { question: "Räknar kalkylatorn arbetsdagar korrekt?", answer: "Ja. Arbetsdagar är måndag till fredag utom Sveriges rödagar. Helgdagar räknas alltså inte som arbetsdagar, och det syns i en egen kolumn." },
      { question: "Vilka helgdagar använder kalkylatorn?", answer: `Sveriges ${getHelligdage(2026, "se").length} rödagar: ${helligdagsnavne(2026, "se")}. Midsommar och alla helgons dag räknas alltid som den lördag de infaller på. Annandag pingst — måndagen efter pingstdagen — är inte en röd dag i Sverige, till skillnad från Danmark där både pinsedag och 2. pinsedag är helligdagar.` },
      { question: "Hur många dagar är det mellan två datum?", answer: "Fyll i startdatum och slutdatum, så räknar kalkylatorn ut antalet dagar direkt. Den visar även hela veckor, ungefärligt antal månader, arbetsdagar, helgdagar och lördagar/söndagar." },
      { question: "Hur räknar jag ut antalet dagar mellan datum?", answer: "Ange det tidigare datumet som startdatum och det senare som slutdatum. Antalet dagar räknas som slutsiffrans datum minus startdatum, så avståndet är detsamma oavsett vilken veckodag datumen faller på." },
      { question: "Hur många dagar till 31 december?", answer: "Ange dagens datum som startdatum och 31 december som slutdatum, så ser du antalet dagar. Kalkylatorn tar også med helgdagar om du vill se hur många arbetsdagar som återstår." },
      { question: "Kan jag dra av dagar?", answer: "Ja! Ange ett negativt tal för att gå bakåt i tiden." },
      { question: "Skottår?", answer: "Ja, kalkylatorn hanterar skottår korrekt." },
      { question: "Hur räknar jag ut antalet dagar mellan datum i Excel?", answer: "Med =B1-A1. Har startdatumet i A1 och slutdatumet i B1 drar formeln den korta skillnaden: 1 januari 2026 till 1 januari 2027 är 365 dagar. =DATEDIF(A1;B1;\"d\") ger exakt samma tal, och med \"m\" får du hela månader (15 mars 2026 till 25 september 2026 är 194 dagar och 6 hela månader) och med \"y\" hela år. Svensk Excel använder semikolon." },
      { question: "Kan Excel räkna ut antalet dagar mellan två datum?", answer: "Ja, och det är två formler: =B1-A1 är den korta, medan =DATEDIF(A1;B1;\"d\") räknar i dagar, \"m\" i månader och \"y\" i år. DATEDIF är ett dolt namn, så det syns inte i formelassistenten, men fungerar i alla Excel-versioner. Vill du ha arbetsdagar och helgdagar med gör datokalkylatorn samma sak." },
      { question: "Hur många dagar är det i en månad?", answer: "Mellan 28 och 31 dagar. februari är kortast med 28 dagar (29 under skottår), och januari, mars, maj, juli, augusti, oktober och december har alla 31. En månad har i genomsnitt 30,44 dagar, eftersom ett år i genomsnitt har 365,2425 dagar fördelade på 12 månader." },
      { question: "Hur räknar jag ut dagar i en månad i Excel?", answer: "Sätt månadens första dag i A1 och första dagen i nästa månad i B1, så ger =B1-A1 månadens längd: 1 februari 2026 till 1 mars 2026 är 28 dagar. Skriv inte månadens sista dag — sätter du B1 = 28 februari får du 27, eftersom Excel räknar skillnaden i hela dygn. =DATEDIF(A1;B1;\"d\") ger samma tal." },
      { question: "Hur många dagar är det i ett år?", answer: "365 dagar, eller 366 under ett skottår — ett år är skottår om det är delbart med 4, med undantag för de hundraårsårtal som inte är delbara med 400. 365 dagar är 52,1 veckor, så ett kalenderår är alltid lite mer än 52 veckor." },
      { question: "Hur många arbetsdagar är det i en månad?", answer: "Det beror på vilken månad det är och vilka helgdagar som infaller i den. En månad med 31 dagar har vanligtvis 21 eller 23 arbetsdagar, och en månad med 30 dagar vanligtvis 20 eller 21. Tabellen ovan visar det exakta talet för varje månad, och hela årets summa står under den." },
      { question: "Hur många dagar är det mellan påsk och pingst?", answer: PINSE_FRA_PAASKE_SE },
      { question: "Hur många dagar är det i pingsten?", answer: PINSE_PERIODE_SE_TEKST },
      ],
    },
    "pace": {
      slug: "pace",
      title: "Löptidsberäknare - beräkna pace och deltider",
      description: "Beräkna pace i minuter per kilometer, löptid från pace och deltider för varje kilometer. För löpning, cykel och triathlon.",
      metaTitle: "Löptidsberäknare: 5 km på 25 min = 5:00 per km",
      metaDescription: "Gratis löptidsberäknare. Beräkna pace per kilometer, löptid från pace och deltider för varje kilometer. 5 km på 25 min är 5:00 per km.",
      keywords: ["löptidsberäknare", "pace kalkylator", "pace tid beräknare", "km tid beräknare", "marathon tid beräknare", "halvmarathon tid beräknare", "ironman tid beräknare", "triathlon tid beräknare", "cykel tid beräknare", "tempo per kilometer", "deltider"],
      ogTitle: "Löptidsberäknare: 5 km på 25 min = 5:00 per km",
      ogDescription: "Beräkna pace per kilometer, löptid från pace och deltider för varje kilometer.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Löptidsberäknare",
      schemaDescription: "Beräkna pace i minuter per kilometer, löptid från pace och deltider för varje kilometer.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hur beräknar jag pace på en sträcka?", answer: "Dela löptiden med sträckan. 5 km på 25 minuter är 25 dividerat med 5 = 5 minuter per kilometer, alltså 5:00 per km." },
      { question: "Hur räknar jag ut löptiden från pacen?", answer: "Multiplicera sträckan med pacen. 5 km med 5:00 per kilometer är 5 gånger 5:00 = 25 minuter." },
      { question: "Vad är deltider, och varför summerar de inte exakt?", answer: "Deltider är tiden för varje kilometer. Verktyget lägger avrundningen i sista kilometern, så deltiderna summerar till exakt den löptid du angett." },
      { question: "Kan jag använda verktyget till cykel och triathlon?", answer: "Ja. Verktyget räknar i minuter per kilometer, så samma pace kan användas till löpning, cykel, kayak och rullträning." },
      { question: "Vad är ett bra tempo för en marathon?", answer: distanceEksempelFaqSvar("maraton", "se") + " Vad som är bra för dig beror på din träning och ditt mål." },
      { question: "Vad är ett bra tempo för en halvmaraton?", answer: distanceEksempelFaqSvar("halvmaraton", "se") + " Vad som är bra för dig beror på din träning och ditt mål." },
      { question: "Vad är ett bra tempo på 10 km?", answer: distanceEksempelFaqSvar("tiaaenkilometer", "se") + " Vad som är bra för dig beror på din träning och ditt mål." },
      { question: "Hur lång tid tar ett Ironman?", answer: triatlonTotalFaqSvar("se") },
      { question: "Hur stor del av ett Ironman är cykelbenet?", answer: triatlonCykelAndelFaqSvar("se") },
      ],
    },
    "tidsberegner": {
      slug: "tidsberegner",
      title: "Tidskalkylator",
      description: "Beräkna hur lång tid det går mellan två klockslag – i timmar, minuter och decimaltimmar. Dra av en rast.",
      metaTitle: "Tidskalkylator: 08:30 till 16:45 = 8 t 15 min",
      metaDescription: "Beräkna hur lång tid det går mellan två klockslag. Exempel: 08:30 till 16:45 är 8 timmar och 15 minuter. Se decimaltimmar och dra av en rast.",
      keywords: ["tidskalkylator", "timmar mellan tidpunkter", "arbetstid kalkylator", "tidräknare", "timmar och minuter", "tidrapportering"],
      ogTitle: "Tidskalkylator: 08:30 till 16:45 = 8 t 15 min",
      ogDescription: "Beräkna hur lång tid det går mellan två klockslag. Exempel: 08:30 till 16:45 är 8 timmar och 15 minuter. Se decimaltimmar och dra av en rast.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Tidskalkylator",
      schemaDescription: "Gratis tidskalkylator. Beräkna tidsintervall mellan två klockslag och se resultatet i timmar, minuter och decimaltimmar.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Hur räknar jag ut timmar och minuter mellan två klockslag?", answer: "Ange starttid och sluttid, så räknar kalkylatorn ut skillnaden i timmar och minuter. Exempel: 08:30 till 16:45 är 8 timmar och 15 minuter." },
      { question: "Hur räknar jag ut hur lång tid det tar?", answer: "Sätt sluttiden minus starttiden. Räknar du på flera dagar, lägger du till 24 timmar per dygn, och kalkylatorn hanterar även tid över midnatt åt båda håll." },
      { question: "Hur beräknar jag arbetstid?", answer: "Ange starttid och sluttid och dra av lunchpaus. Då får du den timmar och minuter som faktiskt går på jobbet." },
      { question: "Vad är decimaltimmar?", answer: "1,5 timmar = 1 timme och 30 minuter. Används för tidrapportering." },
      { question: "Tid över midnatt?", answer: "Ja, kalkylatorn hanterar tid över midnatt automatiskt." },
      { question: "Hur räknar jag ut timmar mellan två klockslag i Excel?", answer: "Sätt starttiden i A1 och sluttiden i B1 som riktiga klockslag. =B1-A1 ger 08:30 till 16:45 som 8 timmar och 15 minuter, =(B1-A1)*24 ger 8,25 decimaltimmar och =(B1-A1)*24*60 ger 495 minuter. Svensk Excel använder semikolon som avgränsare." },
      { question: "Varför får jag ett negativt tal i Excel?", answer: "För att Excel drar sluttiden från starttiden utan att veta att nattpasset slutar följande dag. 22:00 till 06:00 ger därför -0,67 dygn. Använd =MOD(B1-A1;1)*24, så tar den med de 24 timmarna igen och visar 8 timmar — precis som kalkylatorn gör." },
      { question: "Hur räknar man ut tempo i minuter per kilometer?", answer: "Dividera loptiden i minuter med distansen i kilometer. 5 km på 25 minuter ger 25 ÷ 5 = 5:00 per kilometer, och en halvmaraton på 1 timme och 45 minuter ger 4:59 per kilometer." },
      { question: "Vad är ett bra tempo för ett maraton?", answer: "Tempot avgörs av tiden: 3 timmar och 30 minuter på 42,2 km är 4:59 per kilometer. För att hitta distansen i stället delar du tiden med tempot, så 2 timmar vid 5:00 per kilometer blir 24 km." },
      { question: "Hur många timmar finns det på ett år?", answer: timerIPeriodeFaqSvar("aar", "se") },
      { question: "Hur många timmar finns det i en vecka?", answer: timerIPeriodeFaqSvar("uge", "se") },
      { question: "Hur räknar jag om minuter till timmar?", answer: "Dividera minuterna med 60. 90 minuter ÷ 60 = 1,50 timmar, alltså 1 timme och 30 minuter. Åt andra hållet gäller timmar × 60 = minuter, så 7,5 timmar × 60 = 450 minuter." },
      { question: "Vad är 08:30 till 16:45 i timmar och minuter?", answer: "Det är 8 timmar och 15 minuter, alltså 8,25 decimaltimmar. Räkna ut det direkt i tabellen över vanliga tidsintervall ovanför, eller skriv in klockslagen i kalkylatorn." },
      { question: "Hur lägger jag ihop två tidsintervall?", answer: "Lägg ihop minuterna och dela med 60 igen. 8 timmar och 15 minuter + 5 timmar och 15 minuter är 495 + 315 = 810 minuter, och 810 ÷ 60 = 13,50 timmar, alltså 13 timmar och 30 minuter. I Excel är det =(B1-A1)*24+(D1-C1)*24, och en paus dras av i timmar med -(E1+E2), eftersom =(B1-A1)*24 inte känner en lunchpaus." },
      { question: "Varför blir summan fel när jag har en paus?", answer: "En paus måste dras av FÖR de två tidsintervallen läggs ihop. En paus på 90 minuter är mer än en timme, så 09:00-17:00 med 90 minuters paus är 390 minuter — inte 480. Drar du av den efter summeringen får du antingen ett negativt tal eller dubbelt så många minuter." },
      ],
    },
    "tidszone": {
      slug: "tidszone",
      title: "Tidszonskalkylator",
      description: "Omvandla tid mellan tidszoner och se vad klockan är i andra länder.",
      metaTitle: "Tidszoner: 12 i Sverige = 06 i New York, USA",
      metaDescription: "När det är 12 i Sverige är det 06 i New York och 03 i Los Angeles. Se tidsskillnad till 25 städer och omvandla tid mellan tidszoner.",
      keywords: ["tidszonskalkylator", "tidszonsomvandlare", "vad är klockan i", "tidsskillnad", "konvertera tid", "world clock", "vad är klockan i usa när det är 21 i sverige", "vad är klockan i florida usa", "vad är klockan i usa miami", "vad är klockan i texas usa", "vad är klockan i usa california", "vad är klockan i arizona usa", "vad är klockan i atlanta usa"],
      ogTitle: "Tidszoner: 12 i Sverige = 06 i New York, USA",
      ogDescription: "Tidsskillnad till 25 städer plus gratis omvandling mellan alla tidszoner.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Tidszonskalkylator",
      schemaDescription: "Gratis tidszonskalkylator. Omvandla tid mellan tidszoner.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Tidsskillnad Sverige-USA?", answer: "New York: -6 timmar. Los Angeles: -9 timmar." },
      { question: "Sommartid i Sverige?", answer: "Sista söndagen i mars till sista söndagen i oktober. UTC+2 sommar, UTC+1 vinter." },
      { question: "Vad är UTC?", answer: "Coordinated Universal Time - den internationella tidsstandarden." },
      { question: "Internationella möten?", answer: "Hitta en tid som passar i alla tidszoner." },
      { question: "Vad är klockan i Japan, Thailand, Turkiet och Spanien när det är 12 i Sverige?", answer: "I svensk sommartid är det 19 i Tokyo, 18 i Bangkok och 14 i Istanbul, medan Aten och Madrid följer Sverige och visar 12. I vintertid är det 20, 19 och 15. Tabellen visar förhållandet för vinter- och sommartid för alla 25 städer." },
      { question: "Varför skiljer sig tidsskillnaden mellan sommar och vinter?", answer: "Städer som byter samtidigt med Sverige, till exempel Aten, Madrid och London, har samma klockslag hela året. Städer som inte använder sommartid, till exempel Tokyo, Bangkok och Shanghai, ligger en timme tidigare när Sverige har sommartid." },
      { question: "Vad är tidsskillnaden till Japan, Thailand och Turkiet?", answer: "Japan är 7 timmar framåt, Thailand 6 timmar framåt och Turkiet 2 timmar framåt i svensk sommartid. I vintertid är det 8, 7 och 3 timmar. Tabellen med de tio länderna visar både vinter- och sommartid." },
      { question: "Vad är klockan i USA när det är 21 i Sverige?", answer: "15 i New York, 14 i Chicago och 12 i Los Angeles. USA ligger 6, 7 och 9 timmar efter Sverige på 337 av årets 365 dagar. USA byter andra söndagen i mars och första söndagen i november, medan Sverige byter sista söndagen i mars och sista söndagen i oktober, så under de 28 dagar där USA står på sommartid medan Sverige står på vintertid ligger städerna en timme närmare. Tabellen visar klockan i USA för alla fyra tidpunkterna." },
      { question: "Hur räknar jag ut tidsskillnaden i Excel?", answer: "Sätt tiderna i två celler och använd =B1-A1, eller =(B1-A1)*24 om cellerna inte är formaterade som Tid. Om måttidspunkten är tidigare på dygnet än starttidspunkten lägger du till =B1-A1+(B1<A1), så att ett skifte över midnat inte ger ett negativt svar." },
      { question: "Vad är klockan i Florida, Texas och Kalifornien när det är 12 i Sverige?", answer: "Florida är 06, Texas 05 och Kalifornien 03, eftersom Florida ligger i Eastern Time som New York, Texas i Central Time som Chicago och Kalifornien i Pacific Time som Los Angeles. USA har fyra tidszoner: Eastern 6 timmar efter, Central 7, Mountain 8 och Pacific 9." },
      { question: "Varför ligger Phoenix en timme efter Denver på sommaren?", answer: "Phoenix ligger i Mountain Time som Denver, men Arizona är undtaget från sommartid sedan 1967. När Sverige går på sommartid flyttar Denver med och står på 04 hela året, medan Phoenix står på 04 vinter och 03 sommar. Det är den enda av de nio delstaterna i tabellen där de två kolumnerna inte är lika." },
      ],
    },
    "rejsebudget": {
      slug: "rejsebudget",
      title: "Resebudget Kalkylator",
      description: "Beräkna din resebudget till populära resmål.",
      metaTitle: "Resebudget Kalkylator - Vad kostar en semester?",
      metaDescription: "Beräkna din resebudget till populära resmål. Se uppskattade utgifter för flyg, hotell, mat och upplevelser. Gratis resebudget kalkylator.",
      keywords: ["resebudget kalkylator", "vad kostar en semester", "semester budget", "resepris", "semesterbudget", "reseutgifter"],
      ogTitle: "Resebudget Kalkylator",
      ogDescription: "Beräkna din totala resebudget med flyg, hotell, mat och upplevelser.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Resebudget Kalkylator",
      schemaDescription: "Gratis resebudget kalkylator.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Vad kostar en veckas semester i Sydeuropa?", answer: "Typiskt 6.000-10.000 SEK per person för en standardresa." },
      { question: "När är det billigast att resa?", answer: "Lågsäsong: januari-mars och november för Sydeuropa." },
      { question: "Reseförsäkring?", answer: "Ja, alltid. EU-sjukförsäkringskortet täcker bara offentlig vård inom EU." },
      { question: "Spara på resebudgeten?", answer: "Boka i god tid, var flexibel med datum, ät lokalt." },
      ],
    },
    "bryllup": {
      slug: "bryllup",
      title: "Bröllopsbudget Kalkylator",
      description: "Beräkna din bröllopsbudget. Se utgifter för lokal, mat, fotograf.",
      metaTitle: "Bröllopsbudget Kalkylator - Vad kostar ett bröllop?",
      metaDescription: "Beräkna din bröllopsbudget. Se utgifter för lokal, mat, fotograf, musik, klänning och ringar. Genomsnittliga svenska bröllopspriser 2026.",
      keywords: ["bröllopsbudget", "vad kostar ett bröllop", "bröllop pris", "bröllop kalkylator", "bröllop utgifter"],
      ogTitle: "Bröllopsbudget Kalkylator",
      ogDescription: "Beräkna din totala bröllopsbudget.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bröllopsbudget Kalkylator",
      schemaDescription: "Gratis bröllopsbudget kalkylator.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Vad kostar ett bröllop i Sverige?", answer: "150.000-350.000 SEK med 80-100 gäster." },
      { question: "Största utgiftsposten?", answer: "Mat och dryck: 40-50 % av budgeten." },
      { question: "Billigast att ha bröllop?", answer: "November-mars är typiskt billigare." },
      { question: "Spara på budgeten?", answer: "Buffé, DIY-dekoration, DJ istället för band." },
      ],
    },
    "konfirmation": {
      slug: "konfirmation",
      title: "Konfirmationsbudget Kalkylator",
      description: "Beräkna din budget för konfirmation.",
      metaTitle: "Konfirmationsbudget Kalkylator - Vad kostar en konfirmation?",
      metaDescription: "Beräkna din budget för konfirmation. Se utgifter för mat, lokal, kläder och fotograf. Beräkna förväntade gåvobelopp.",
      keywords: ["konfirmation budget", "konfirmation pris", "vad kostar en konfirmation", "konfirmationspresent belopp", "konfirmation kalkylator"],
      ogTitle: "Konfirmationsbudget Kalkylator",
      ogDescription: "Beräkna din totala budget för konfirmation.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Konfirmationsbudget Kalkylator",
      schemaDescription: "Gratis konfirmationsbudget kalkylator.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Vad kostar en konfirmation?", answer: konfirmationFaqSvar("se").koster },
      { question: "Gåvobelopp?", answer: konfirmationFaqSvar("se").gavebelob },
      { question: "När är konfirmation?", answer: "Typiskt april-maj i Sverige." },
      { question: "Spara på festen?", answer: "Ha festen hemma, laga maten själv." },
      ],
    },
    "braendstof": {
      slug: "braendstof",
      title: "Bränslekalkylator",
      description: `500 km bensin kostar ${helekr(bfSeBenzin.pris)} kr. Vid 15 km/l använder du ${kommatal(bfSeBenzin.maengde)} liter, och ${kommatal(bfSeBenzin.maengde)} l × ${bfSeBensinPris} kr. = ${helekr(bfSeBenzin.pris)} kr. — ${kommatal(bfSeBenzin.prisPrKm)} kr. per km. Beräkna pris, förbrukning och årlig kostnad för bensin, diesel och el.`,
      metaTitle: "Bränslekalkylator: 500 km bensin kostar 585 kr.",
      metaDescription: `500 km bensin kostar ${helekr(bfSeBenzin.pris)} kr. vid 15 km/l och ${bfSeBensinPris} kr./l — ${kommatal(bfSeBenzin.prisPrKm)} kr. per km. Beräkna pris, förbrukning och årlig kostnad.`,
      keywords: ["bränslekalkylator", "bensin kalkylator", "diesel kalkylator", "elbil kalkylator", "pris per km", "bränsleförbrukning"],
      ogTitle: "Bränslekalkylator: 500 km bensin kostar 585 kr.",
      ogDescription: `500 km bensin kostar ${helekr(bfSeBenzin.pris)} kr. — ${kommatal(bfSeBenzin.prisPrKm)} kr. per km. Beräkna pris, förbrukning och årlig kostnad för bensin, diesel och el.`,
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bränslekalkylator",
      schemaDescription: `Beräkna pris för bensin, diesel och el: 500 km bensin kostar ${helekr(bfSeBenzin.pris)} kr. vid 15 km/l och ${bfSeBensinPris} kr./l.`,
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Vad kostar 500 km med bensin?", answer: `Vid 15 km/l använder resan ${braendstofEksempelKm} ÷ 15 = ${kommatal(bfSeBenzin.maengde)} liter. ${kommatal(bfSeBenzin.maengde)} l × ${bfSeBensinPris} kr. = ${helekr(bfSeBenzin.pris)} kr., alltså ${kommatal(bfSeBenzin.prisPrKm)} kr. per km och ${bfSePrisPrMil("benzin")} kr. per mil.` },
      { question: "Varför är diesel dyrare än bensin?", answer: `I Sverige är diesel dyrare både per liter och per kilometer, mätt 21 september 2026: bensin ${bfSeBensinPris} kr./l och diesel ${bfSeDieselPris} kr./l, alltså ${bfSeLiterprisDiff} % dyrare pr. liter (GlobalPetrolPrices). Dieseln kör ${BRAENDSTOF_FORUDSETNINGER_SE.diesel.kmPerLiter} km/l mot bensins ${BRAENDSTOF_FORUDSETNINGER_SE.benzin.kmPerLiter} km/l, men den större literprisen går inte helt vägs. ${braendstofEksempelKm} km kostar ${helekr(bfSeBenzin.pris)} kr. med bensin och ${helekr(bfSeDiesel.pris)} kr. med diesel, så ${bfSeDieselDyrare} kr. mer för diesel.` },
      { question: "Hur räknar man ut bränslekostnad?", answer: `Sträckan delad med förbrukningen ger mängden, och mängden gånger med literpriset ger kostnaden. ${braendstofEksempelKm} ÷ 15 = ${kommatal(bfSeBenzin.maengde)} liter, och ${kommatal(bfSeBenzin.maengde)} l × ${bfSeBensinPris} kr. = ${helekr(bfSeBenzin.pris)} kr.` },
      { question: "Vad kostar bränslet per mil?", answer: `En mil är 10 km, så priset per mil är priset per km × 10. Med sidans förutsättningar: bensin ${bfSePrisPrMil("benzin")} kr. per mil, diesel ${bfSePrisPrMil("diesel")} kr. per mil och el ${bfSePrisPrMil("el")} kr. per mil. Tankinstrumentet visar liter per 100 km, så ${BRAENDSTOF_FORUDSETNINGER_SE.benzin.kmPerLiter} km/l blir ${bfSeForbrukningP100} l/100 km och ${kommatal(Number(bfSeForbrukningP100) / 10)} l/mil.` },
      { question: "Hur hittar jag min egen förbrukning?", answer: `Liter som fylls på delat med kilometer som körts ger ditt km/l. Fyra påfyllningar på ${BRAENDSTOF_EGENT_FORBRUG.liter} liter över ${BRAENDSTOF_EGENT_FORBRUG.km} km ger ${BRAENDSTOF_EGENT_FORBRUG.km} ÷ ${BRAENDSTOF_EGENT_FORBRUG.liter} = ${kommatal(BRAENDSTOF_EGENT_FORBRUG.km / BRAENDSTOF_EGENT_FORBRUG.liter)} km/l, alltså ${kommatal((BRAENDSTOF_EGENT_FORBRUG.liter / BRAENDSTOF_EGENT_FORBRUG.km) * 100)} liter per 100 km. Kör gärna 300-400 km på fyra fulla tankar så att du inte missar av en felavläsning på en enda påfyllning.` },
      { question: "Normal km/liter?", answer: `Bensin: 12-18 km/l (${kommatal(literPr100km(18))}-${kommatal(literPr100km(12))} l/100 km). Diesel: 15-22 km/l. El: 15-20 kWh/100 km.` },
      { question: "Är elbilar billigare?", answer: `Ja, om man bara räknar drivmedlet: ${bfSeBesparelse("benzin")} % billigare per km än bensin (${kommatal(bfSeBenzin.prisPrKm)} mot ${kommatal(bfSeEl.prisPrKm)} kr.) och ${bfSeBesparelse("diesel")} % billigare än diesel. Beräkningen använder ${bfSeBensinPris} kr./l bensin, ${bfSeDieselPris} kr./l diesel och ${bfSeElPris} kr./kWh el. Offentlig laddning på 3-6 kr./kWh gör el dyrare än bensin över ${kommatal(bfSeBenzin.prisPrKm / (BRAENDSTOF_FORUDSETNINGER_SE.el.kwhPer100km / 100))} kr./kWh.` },
      { question: "Vad påverkar förbrukningen?", answer: "Körstil, hastighet, väder, däcktryck och luftkonditionering. Ett typiskt bensinbil kör 12-18 km/l, och fel däcktryck ensamt kan flytta förbrukningen med flera procent." },
      ],
    },
    "bil": {
      slug: "bil",
      title: "Bilkostnadskalkylator",
      description: "Beräkna vad det verkligen kostar att äga och köra bil.",
      metaTitle: "Bilkostnadskalkylator - Se vad din bil kostar",
      metaDescription: "Se vad din bil verkligen kostar. Typiskt: 3,50-6,00 SEK/km inkl. värdeminskning, bränsle, försäkring och skatt. Gratis kalkylator 2026.",
      keywords: ["bil kalkylator", "bilkostnader", "bilutgifter", "elbil vs bensin", "bil pris per km", "värdeminskning bil"],
      ogTitle: "Bilkostnadskalkylator",
      ogDescription: "Gratis bilkalkylator. Beräkna de verkliga kostnaderna för att äga bil.",
      category: "Vardag",
      breadcrumbCategory: "Vardag",
      breadcrumbCategoryHref: "/kategori/hverdag",
      schemaName: "Bilkostnadskalkylator",
      schemaDescription: "Gratis bilkalkylator. Beräkna bilkostnader.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Vad kostar det att äga bil?", answer: "Typiskt 3,50-6,00 SEK/km. För 15.000 km/år = ca. 5.000-8.000 SEK/mån." },
      { question: "Största utgiften?", answer: "Värdeminskning: en ny bil tappar 20-25 % första året." },
      { question: "Elbil billigare?", answer: "Lägre drift men högre inköpspris. Över tid ofta billigare." },
      { question: "Pris per km?", answer: "Samla alla årliga utgifter och dela med körda km." },
      ],
    },
    "valuta": {
      slug: "valuta",
      title: "Valutakalkylator",
      description: "Omvandla mellan SEK, EUR, USD, GBP, NOK, DKK och många fler.",
      metaTitle: "Valutakalkylator - Omvandla valuta online",
      metaDescription: "Gratis valutakalkylator. Omvandla mellan SEK, EUR, USD, GBP, NOK, DKK och många fler valutor. Se vägledande kurser.",
      keywords: ["valutakalkylator", "valutaomvandlare", "omvandla valuta", "sek till euro", "dollar till kronor", "valutakurs", "växla pengar"],
      ogTitle: "Valutakalkylator",
      ogDescription: "Omvandla mellan svenska kronor och andra valutor.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Valutakalkylator",
      schemaDescription: "Gratis valutakalkylator. Omvandla valuta.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "SEK till EUR?", answer: "Svenska kronan flyter fritt. Kursen påverkas av Riksbankens ränta och marknadsförhållanden." },
      { question: "Varför svänger kurser?", answer: "Räntenivåer, inflation, handelsbalans och politisk stabilitet." },
      { question: "Var växla?", answer: "Banker, växlingskontor, flygplatser. Wise erbjuder ofta bättre kurser." },
      { question: "Köp- vs säljkurs?", answer: "Banken köper billigare och säljer dyrare. Skillnaden = spread." },
      ],
    },
    "renteberegner": {
      slug: "renteberegner",
      title: "Räntekalkylator",
      description: `${formatBelob(renteHoved.hovedstol, "se")} kr i ${renteHoved.loebetid} år till ${renteHoved.aarsrente} % ränta kostar ${formatBelob(renteHoved.maanedligBetalning, "se")} kr i månaden i ett annuitetslån. Total ränta: ${formatBelob(renteHoved.samletRante, "se")} kr.`,
      metaTitle: `Räntekalkylator: ${formatBelob(renteHoved.hovedstol, "se")} kr i ${renteHoved.loebetid} år = ${formatBelob(renteHoved.maanedligBetalning, "se")} kr/mån`,
      metaDescription: `Annuitetslån på ${formatBelob(renteHoved.hovedstol, "se")} kr med ${renteHoved.aarsrente} % ränta i ${renteHoved.loebetid} år: ${formatBelob(renteHoved.maanedligBetalning, "se")} kr i månaden och ${formatBelob(renteHoved.samletRante, "se")} kr i total ränta. Beräkna även rak amortering.`,
      keywords: ["räntekalkylator", "lånekalkylator", "beräkna lån", "månatlig betalning", "annuitetslån", "ränteberäkning"],
      ogTitle: `Räntekalkylator: ${formatBelob(renteHoved.hovedstol, "se")} kr i ${renteHoved.loebetid} år = ${formatBelob(renteHoved.maanedligBetalning, "se")} kr/mån`,
      ogDescription: `${formatBelob(renteHoved.hovedstol, "se")} kr i ${renteHoved.loebetid} år till ${renteHoved.aarsrente} %: ${formatBelob(renteHoved.maanedligBetalning, "se")} kr i månaden och ${formatBelob(renteHoved.samletRante, "se")} kr i total ränta.`,
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Räntekalkylator",
      schemaDescription: "Beräkna månadskostnad och total ränta på annuitetslån eller rak amortering.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Annuitetslån vs serielån?", answer: "Annuitetslån: fast betalning. Serielån: fast amortering, sjunkande betalning." },
      { question: `Vad blir betalningen på ${formatBelob(renteHoved.hovedstol, "se")} kr med ${renteHoved.aarsrente} % ränta i ${renteHoved.loebetid} år?`, answer: `Ca ${formatBelob(renteHoved.maanedligBetalning, "se")} kr i månaden med annuitetslån, totalt ${formatBelob(renteHoved.samletRante, "se")} kr i ränta under de ${Math.round(renteHoved.antalMaaneder)} betalningarna.` },
      { question: "Effektiv ränta?", answer: "Årliga kostnader inkl. avgifter." },
      { question: "Vad är formeln för ett annuitetslån?", answer: `Betalningen är P × r ÷ (1 − (1 + r)^-n), där r är månadsräntan och n antal månader. Ett lån på ${formatBelob(renteFormel.hovedstol, "se")} kr till ${renteFormel.aarsrente} % i ${renteFormel.loebetid} år ger ${formatBelob(renteFormel.maanedligBetalning, "se")} kr i månaden — ${Math.round(renteFormel.antalMaaneder)} månader, ${formatBelob(renteFormel.samletBetaling, "se")} kr i alt varav ${formatBelob(renteFormel.samletRante, "se")} kr är ränta.` },
      { question: "Hur räknar man ut effektiv ränta?", answer: "Den effektiva årsräntan är (1 + månadsränta)^12 − 1. En månadsränta på 1 % blir 12,68 % per år, och en nominell årsränta på 4 % ger en månadsränta på 0,3333 %, vilket är 4,07 % effektivt." },
      { question: "Avdrag?", answer: "Kontrollera Skatteverket för avdragsregler." },
      { question: "Hur räknar jag ett annuitetslån i Excel?", answer: `Använd BETALNING med semikolon mellan argumenten: =BETALNING(${formatBelob(renteHoved.aarsrente / 100, "se", 2)}/12;${Math.round(renteHoved.antalMaaneder)};-${renteHoved.hovedstol}) ger ${formatBelob(renteHoved.maanedligBetalning, "se")} kr i månaden på ${formatBelob(renteHoved.hovedstol, "se")} kr under ${renteHoved.loebetid} år.` },
      ],
    },
    "opsparing": {
      slug: "opsparing",
      title: "Sparkalkylator",
      description: "Se vad ditt sparande växer till med ränta på ränta.",
      metaTitle: "Sparkalkylator - Ränta på ränta kalkylator",
      metaDescription: "Se vad ditt sparande växer till. Exempel: 1.000 SEK/mån i 30 år med 5 % ränta = 830.000 SEK. Gratis kalkylator.",
      keywords: ["sparkalkylator", "ränta på ränta", "beräkna sparande", "compound interest", "investering kalkylator"],
      ogTitle: "Sparkalkylator",
      ogDescription: "Beräkna vad ditt sparande växer till med ränta på ränta.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Sparkalkylator",
      schemaDescription: "Gratis sparkalkylator. Beräkna ränta på ränta.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Vad är ränta på ränta?", answer: "Du tjänar ränta på räntan. Över tid accelererar detta ditt sparande." },
      { question: "Hur mycket spara?", answer: "10-20 % av inkomsten. Även små belopp växer." },
      { question: "Realistisk ränta?", answer: "Aktier: ~7 %. Obligationer: 2-4 %. Bank: under 1 %." },
      ],
    },
    "laaneberegner": {
      slug: "laaneberegner",
      title: "Lånekalkylator",
      description: "Beräkna månatlig betalning och jämför lån.",
      metaTitle: "Lånekalkylator",
      metaDescription: "Beräkna månatlig betalning och jämför lån. Gratis kalkylator.",
      keywords: ["laaneberegner", "lånekalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Lånekalkylator",
      ogDescription: "Beräkna månatlig betalning och jämför lån.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Lånekalkylator",
      schemaDescription: "Gratis lånekalkylator. Beräkna månatlig betalning och jämför lån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hur använder jag denna kalkylator?", answer: "Ange dina uppgifter och se resultatet direkt. Lånekalkylator är gratis och enkel att använda." },
      { question: "Är resultaten korrekta?", answer: "Kalkylatorn ger en god uppskattning. Individuella förhållanden kan påverka det slutliga resultatet." },
      { question: "Kan jag använda kalkylatorn på mobilen?", answer: "Ja, kalkylatorn är fullt responsiv och fungerar på alla enheter." },
      ],
    },
    "billaan": {
      slug: "billaan",
      title: "Billånkalkylator",
      description: "Beräkna ditt billån. Se månatlig betalning.",
      metaTitle: "Billånkalkylator",
      metaDescription: "Beräkna ditt billån. Se månatlig betalning. Gratis kalkylator.",
      keywords: ["billaan", "billånkalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Billånkalkylator",
      ogDescription: "Beräkna ditt billån. Se månatlig betalning.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Billånkalkylator",
      schemaDescription: "Gratis billånkalkylator. Beräkna ditt billån. Se månatlig betalning.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hur använder jag denna kalkylator?", answer: "Ange dina uppgifter och se resultatet direkt. Billånkalkylator är gratis och enkel att använda." },
      { question: "Är resultaten korrekta?", answer: "Kalkylatorn ger en god uppskattning. Individuella förhållanden kan påverka det slutliga resultatet." },
      { question: "Kan jag använda kalkylatorn på mobilen?", answer: "Ja, kalkylatorn är fullt responsiv och fungerar på alla enheter." },
      ],
    },
    "leasing": {
      slug: "leasing",
      title: LEASING_SE.title,
      description: LEASING_SE.description,
      metaTitle: "Fåretagsleasing bil - beräkna leasingkostnaden",
      metaDescription: LEASING_SE.metaDescription,
      keywords: ["leasing", "leasing kalkylator", "leasingkostnad", "leasing vs billån", "fåretagsleasing bil", "kalkylator", "gratis", "2026"],
      ogTitle: "Fåretagsleasing bil - beräkna leasingkostnaden",
      ogDescription: LEASING_SE.ogDescription,
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Leasingkalkylator",
      schemaDescription: LEASING_SE.schemaDescription,
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: LEASING_SE.faqKostnadQuestion, answer: LEASING_SE.faqKostnadAnswer },
      { question: "Vad är värdetabet på en leasingbil?", answer: LEASING_SE.faqVaerdetabAnswer },
      { question: "Blir leasing dyrare eller billigare än ett billån?", answer: leasingSammenlignFaqSvar(LEASING_SAMMENLIGN, "se") },
      { question: "Vad är fåretagsleasing och vad kostar det?", answer: LEASING_SE.faqFaretagAnswer },
      { question: "Kan jag ändra bilpris, restvärde, ränta och löptid?", answer: "Ja. Alla fält är redigerbara, så att du kan få en beräkning som följer det leasingavtal du jämför." },
      { question: "Är resultatet korrekt?", answer: "Kalkylatorn ger en god uppskattning utifrån effektiv ränta och en genomsnittlig gällande gäld. Den slutliga kostnaden beror på leasingavtalets villkor, till exempel bonus och serviceavgifter." },
      ],
    },
    "forbrugslaan": {
      slug: "forbrugslaan",
      title: "Konsumtionslån Kalkylator",
      description: "Beräkna månatlig betalning på konsumtionslån.",
      metaTitle: "Konsumtionslån Kalkylator",
      metaDescription: "Beräkna månatlig betalning på konsumtionslån. Gratis kalkylator.",
      keywords: ["forbrugslaan", "konsumtionslån kalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Konsumtionslån Kalkylator",
      ogDescription: "Beräkna månatlig betalning på konsumtionslån.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Konsumtionslån Kalkylator",
      schemaDescription: "Gratis konsumtionslån kalkylator. Beräkna månatlig betalning på konsumtionslån.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hur använder jag denna kalkylator?", answer: "Ange dina uppgifter och se resultatet direkt. Konsumtionslån Kalkylator är gratis och enkel att använda." },
      { question: "Är resultaten korrekta?", answer: "Kalkylatorn ger en god uppskattning. Individuella förhållanden kan påverka det slutliga resultatet." },
      { question: "Kan jag använda kalkylatorn på mobilen?", answer: "Ja, kalkylatorn är fullt responsiv och fungerar på alla enheter." },
      ],
    },
    "gaeldsfri": {
      slug: "gaeldsfri",
      title: "Skuldfri Kalkylator",
      description: "Beräkna din väg ut ur skuld. Jämför lavin- och snöbollsmetoden.",
      metaTitle: "Skuldfri Kalkylator",
      metaDescription: "Beräkna din väg ut ur skuld. Jämför lavin- och snöbollsmetoden. Gratis kalkylator.",
      keywords: ["gaeldsfri", "skuldfri kalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Skuldfri Kalkylator",
      ogDescription: "Beräkna din väg ut ur skuld. Jämför lavin- och snöbollsmetoden.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Skuldfri Kalkylator",
      schemaDescription: "Gratis skuldfri kalkylator. Beräkna din väg ut ur skuld. Jämför lavin- och snöbollsmetoden.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hur använder jag denna kalkylator?", answer: "Ange dina uppgifter och se resultatet direkt. Skuldfri Kalkylator är gratis och enkel att använda." },
      { question: "Är resultaten korrekta?", answer: "Kalkylatorn ger en god uppskattning. Individuella förhållanden kan påverka det slutliga resultatet." },
      { question: "Kan jag använda kalkylatorn på mobilen?", answer: "Ja, kalkylatorn är fullt responsiv och fungerar på alla enheter." },
      ],
    },
    "boliglaan": {
      slug: "boliglaan",
      title: "Bolånekalkylator",
      description: "Beräkna ditt bolån. Se månatlig betalning och ränteavdrag.",
      metaTitle: "Bolånekalkylator",
      metaDescription: "Beräkna ditt bolån. Se månatlig betalning och ränteavdrag. Gratis kalkylator.",
      keywords: ["boliglaan", "bolånekalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Bolånekalkylator",
      ogDescription: "Beräkna ditt bolån. Se månatlig betalning och ränteavdrag.",
      category: "Bostad",
      breadcrumbCategory: "Bostad",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Bolånekalkylator",
      schemaDescription: "Gratis bolånekalkylator. Beräkna ditt bolån. Se månatlig betalning och ränteavdrag.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Hur mycket kan jag låna?", answer: "Normalt upp till 85 % av bostadens värde. 15 % kontantinsats krävs." },
      { question: "Fast vs rörlig ränta?", answer: "Fast: fast betalning under avtalad period. Rörlig: ändras med marknaden, ofta lägre." },
      { question: "Ränteavdrag?", answer: "Du kan dra av 30 % av räntekostnader upp till 100.000 SEK och 21 % däröver via Skatteverket." },
      { question: "Amorteringsfrihet?", answer: "Vissa banker erbjuder amorteringsfrihet i perioder. Krav på amortering enligt Finansinspektionen." },
      ],
    },
    "elberegner": {
      slug: "elberegner",
      title: "Elkalkylator",
      description: "Beräkna din elförbrukning och se vad dina apparater kostar i ström.",
      metaTitle: "Elkalkylator",
      metaDescription: "Beräkna din elförbrukning och se vad dina apparater kostar i ström. Gratis kalkylator.",
      keywords: ["elberegner", "elkalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Elkalkylator",
      ogDescription: "Beräkna din elförbrukning och se vad dina apparater kostar i ström.",
      category: "Bostad",
      breadcrumbCategory: "Bostad",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Elkalkylator",
      schemaDescription: "Gratis elkalkylator. Beräkna din elförbrukning och se vad dina apparater kostar i ström.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Beräkna elförbrukning?", answer: "Watt × timmar / 1000 = kWh. 100W × 10t / 1000 = 1 kWh." },
      { question: "Pris per kWh i Sverige?", answer: "Varierar mycket. Typiskt 0,50-2,50 SEK/kWh beroende på elområde och spotpris." },
      { question: "När är elen billigast?", answer: "Som regel om natten och mitt på dagen, när det är mycket vind- och solkraft. Nättariffen är högst kl. 17-21, så kvällen är nästan alltid dyrast." },
      { question: "När kommer morgondagens elpriser?", answer: "Spotpriserna för nästa dygn fastställs på elbörsen och publiceras normalt runt kl. 13. Därefter kan du se morgondagens timmar i grafen." },
      { question: "Hur stor är elskatten i 2026?", answer: "Energiskatten på el är 0,45 SEK/kWh (2026). Det är en statlig skatt på elektricitet som ingår i elpriset." },
      { question: "Största elslukarna?", answer: "Torktumlare (3000W), ugn (2500W), vattenkokare (2000W)." },
      { question: "Spara el?", answer: "Stäng av standby, välj A+++-märkta apparater, LED-lampor." },
      ],
    },
    "solceller": {
      slug: "solceller",
      title: "Solcellskalkylator",
      description: "Beräkna besparing och återbetalningstid för solceller.",
      metaTitle: "Solcellskalkylator",
      metaDescription: "Beräkna besparing och återbetalningstid för solceller. Gratis kalkylator.",
      keywords: ["solceller", "solcellskalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Solcellskalkylator",
      ogDescription: "Beräkna besparing och återbetalningstid för solceller.",
      category: "Bostad",
      breadcrumbCategory: "Bostad",
      breadcrumbCategoryHref: "/kategori/bolig",
      schemaName: "Solcellskalkylator",
      schemaDescription: "Gratis solcellskalkylator. Beräkna besparing och återbetalningstid för solceller.",
      schemaCategory: "UtilitiesApplication",
      faqItems: [
      { question: "Pris i Sverige?", answer: "70.000-120.000 SEK för 4-8 kWp inkl. montering. Grönt avdrag på 20 %." },
      { question: "Återbetalningstid?", answer: "Typiskt 8-14 år beroende på elpris och läge." },
      { question: "Sälja överskottsel?", answer: "Du kan sälja överskottsel till elnätet och få skattereduktion." },
      { question: "Batteri?", answer: "Ökar självförsörjningsgraden men ökar återbetalningstiden." },
      ],
    },
    "timepris": {
      slug: "timepris",
      title: "Timpris Kalkylator",
      description: "Hitta ditt freelance timpris inkl. skatt, semester och drift.",
      metaTitle: "Timpris Kalkylator",
      metaDescription: "Hitta ditt freelance timpris inkl. skatt, semester och drift. Gratis kalkylator.",
      keywords: ["timepris", "timpris kalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Timpris Kalkylator",
      ogDescription: "Hitta ditt freelance timpris inkl. skatt, semester och drift.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Timpris Kalkylator",
      schemaDescription: "Gratis timpris kalkylator. Hitta ditt freelance timpris inkl. skatt, semester och drift.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Beräkna timpris som frilansare?", answer: "Börja med önskad nettolön, lägg till skatt (~40 %), drift, semester, sjukdom och admin-tid." },
      { question: "Normalt konsult-timpris?", answer: markedsprisFaqSvar("se") },
      { question: "Moms på timpris?", answer: "Ja, 25 % moms om omsättning över ca. 80.000 SEK/år. Registrera hos Skatteverket." },
      { question: "Fakturerbara timmar?", answer: "Realistiskt 100-130 timmar/månad." },
      ],
    },
    "termin": {
      slug: "termin",
      title: "Beräknad Förlossning Kalkylator",
      description: "Beräkna ditt beräknade förlossningsdatum och se graviditetsvecka.",
      metaTitle: "Beräknad Förlossning Kalkylator",
      metaDescription: "Beräkna ditt beräknade förlossningsdatum och se graviditetsvecka. Gratis kalkylator.",
      keywords: ["termin", "beräknad förlossning kalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Beräknad Förlossning Kalkylator",
      ogDescription: "Beräkna ditt beräknade förlossningsdatum och se graviditetsvecka.",
      category: "Hälsa",
      breadcrumbCategory: "Hälsa",
      breadcrumbCategoryHref: "/kategori/sundhed",
      schemaName: "Beräknad Förlossning Kalkylator",
      schemaDescription: "Gratis beräknad förlossning kalkylator. Beräkna ditt beräknade förlossningsdatum och se graviditetsvecka.",
      schemaCategory: "HealthApplication",
      faqItems: [
      { question: "Hur beräknas beräknat förlossningsdatum?", answer: "280 dagar (40 veckor) från första dagen i senaste menstruationen." },
      { question: "Hur exakt?", answer: "Ca. 5 % föds på beräknat datum. De flesta mellan vecka 38 och 42." },
      { question: "Föräldraledighet i Sverige?", answer: "480 dagar totalt, varav 90 dagar öronmärkta per förälder. Via Försäkringskassan." },
      { question: "Tre trimestrar?", answer: "1:a trimestern: vecka 1-12. 2:a trimestern: vecka 13-26. 3:e trimestern: vecka 27-40." },
      ],
    },
    "moms": {
      slug: "moms",
      title: "Momskalkylator",
      description: "Beräkna svensk moms på 25 %, 12 % eller 6 %. Lägg till 1 000 kr. och få 1 250 kr. Dra av moms eller hitta momsandelen.",
      metaTitle: "Momskalkylator: 1 000 kr. exkl. moms + 25 % = 1 250 kr.",
      metaDescription: "Beräkna svensk moms på 25 %, 12 % eller 6 %. Lägg till 1 000 kr. och få 1 250 kr. Dra av moms eller hitta momsandelen.",
      keywords: ["moms", "momskalkylator", "kalkylator", "gratis", "2026"],
      ogTitle: "Momskalkylator: 1 000 kr. exkl. moms + 25 % = 1 250 kr.",
      ogDescription: "Beräkna svensk moms på 25 %, 12 % eller 6 %. Lägg till 1 000 kr. och få 1 250 kr. Dra av moms eller hitta momsandelen.",
      category: "Ekonomi",
      breadcrumbCategory: "Ekonomi",
      breadcrumbCategoryHref: "/kategori/oekonomi",
      schemaName: "Momskalkylator",
      schemaDescription: "Gratis momskalkylator. Beräkna svensk moms på 25 %, 12 % och 6 % med priser inkl. och exkl. moms.",
      schemaCategory: "FinanceApplication",
      faqItems: [
      { question: "Vilka momssatser finns i Sverige?", answer: "Standardsatsen är 25 %. För livsmedel, restaurang och hotell finns 12 %, medan böcker, kollektivtrafik och kultur ofta omfattas av 6 %." },
      { question: "Hur beräknar man moms vid 25 %, 12 % och 6 %?", answer: "Lägg till: 1 000 kr × 1,25 = 1 250 kr, × 1,12 = 1 120 kr eller × 1,06 = 1 060 kr. Dra av: dividera beloppet inkl. moms med samma faktor." },
      { question: "Vad är momsandelen i ett pris inklusive moms?", answer: "Momsandelen är cirka 20 % vid 25 % moms, 10,71 % vid 12 % och 5,66 % vid 6 %." },
      { question: "När kan företag dra av moms?", answer: "Momsregistrerade företag kan dra av ingående moms och rapporterar till Skatteverket." },
      { question: "Hur räknar man ut moms baklänges?", answer: "Del priset med 1,25: 1 250 kr inkl. moms ÷ 1,25 = 1 000 kr exkl. moms, och momsen var 250 kr. Kortvägen är att ta 20 % av priset (1 250 × 0,20 = 250), men den ger ett runt tal på 499 kr — 499 ÷ 1,25 = 399,20 kr exkl. moms." },
      { question: "Hur beräknar man moms i Excel?", answer: "Svensk Excel har ingen inbyggd momsfunktion, så du skriver formeln själv: =A1*1,25 lägger till moms, =A1/1,25 räknar baklänges och =A1*0,20 ger momsandelen. Använd semikolon som argumentavskiljare i svensk Excel och se till att cellen är formaterad som Tal, inte text." },
      { question: "Vad är momssatsen i Tyskland?", answer: landSvarSprogholdig("DE", "se", MOMS_FAQ_FORMAT.se) },
      { question: "Vad är momssatsen i Holland?", answer: landSvarSprogholdig("NL", "se", MOMS_FAQ_FORMAT.se) },
      { question: "Vilket EU-land har lägst och högst momssats?", answer: satsUdenraekkeSvar("se", MOMS_FAQ_FORMAT.se) },
      { question: "Vad är momssatsen i Norge?", answer: landSvarSprogholdig("NO", "se", MOMS_FAQ_FORMAT.se) },
      { question: "Hur mycket moms är det på mat i Sverige?", answer: "På mat, restaurang och hotell är satsen 12 %, så 100 kr. exkl. moms kostar 112 kr. inkl. moms. Böcker, kollektivtrafik och kultur har 6 % (100 kr. blir 106 kr.). Standardvaror har 25 % (100 kr. blir 125 kr.). I Danmark finns ingen reducerad sats, så mat där är 25 %." },
      { question: importmomsSvar("se").spg1, answer: importmomsSvar("se").svar1 },
      { question: importmomsSvar("se").spg2, answer: importmomsSvar("se").svar2 },
      ],
    },
  };

// ─── LOOKUP FUNCTIONS ────────────────────────────────────────────────────────

const allPages: Record<Locale, Record<string, PageData>> = { da: daPages, no: noPages, se: sePages };

/**
 * Sider, hvis tekst afhænger af dagens dato, og derfor må regnes **ved
 * hvert kald** frem for ved modulens import.
 *
 * `/alder` skrev "36 år, 6 måneder og 10 dage pr. 25. september 2026" i
 * `description`, `metaDescription`, `ogDescription` og fire FAQ-svar. Da
 * `allPages` er et modul-niveau-`const`, ville de tal være frosset ved
 * processens start — altså ved deploy, ikke ved build — og blive dagsvis
 * mere forkert i Googles snippet. Pladsholderne `{ALDER}`, `{DATO}` og
 * resten løses nu her, af `alderLevet` og `foedselsaarRaekker`: de samme
 * moduler som selve værktøjet bruger.
 *
 * Kaldet sker i `getPageData`, som både `generateMetadata` og sidens egen
 * render går igennem. `/alder` er dynamisk, fordi den læser `getLocale()`,
 * der læser `headers()` — tallene er altså et rigtigt serverkald og ikke en
 * frossen byggeværdi. Det er samme mønster som `/dato`s nedtællinger.
 */
const LEVENDE_SIDER = new Set(["alder", "dato"]);

/** Dagens dato i sidens egen tidszone, så tallene ikke er en dag bag. */
function referenceDato(locale: Locale): string {
  return iDagPaSiden(new Date(), locale);
}

function medLevendeTekst(
  side: PageData,
  slug: string,
  locale: Locale
): PageData {
  if (!LEVENDE_SIDER.has(slug)) return side;

  // `/dato` har ét token, `{DAGE_TIL_DEC}`, og det er hele «58 dage» /
  // «58 dagar». Datoens navn står i titlen selv, fordi det er forskelligt
  // pr. sprog og ikke ændrer sig med dagen — kun dagene gør det.
  if (slug === "dato") {
    const { kort } = dageTilDecember(locale === "se" ? "se" : "da", new Date());
    const saet = (tekst: string) => tekst.replaceAll("{DAGE_TIL_DEC}", kort);
    return {
      ...side,
      metaTitle: saet(side.metaTitle),
      metaDescription: saet(side.metaDescription),
      ogTitle: saet(side.ogTitle),
      ogDescription: saet(side.ogDescription),
    };
  }

  const vaerdier = alderSideTekst(referenceDato(locale), locale);
  const saet = (tekst: string) => erstatAlderTokens(tekst, vaerdier);
  return {
    ...side,
    description: saet(side.description),
    // `metaTitle`/`ogTitle` er ikke rørt før 3/10, fordi ingen af dem havde et
    // token. /alders har nu `{AAR}` i titlen (se `alder-side-tekst.ts`), så
    // uden disse to linjer ville titlen løbe ud i Google som «{AAR} år».
    metaTitle: saet(side.metaTitle),
    metaDescription: saet(side.metaDescription),
    ogTitle: saet(side.ogTitle),
    ogDescription: saet(side.ogDescription),
    faqItems: side.faqItems.map((item) => ({ ...item, answer: saet(item.answer) })),
  };
}

export function getPageData(slug: string, locale: Locale): PageData | undefined {
  const side = allPages[locale]?.[slug];
  return side ? medLevendeTekst(side, slug, locale) : undefined;
}

export function getAvailableSlugs(locale: Locale): string[] {
  return Object.keys(allPages[locale] || {});
}
