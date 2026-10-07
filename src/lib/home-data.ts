import { isCalculatorAvailable } from "./calculator-list";
import {
  formatTargetDate,
  formatTargetYear,
  getDageTilAnswer,
  getDageTilEvents,
  getDageTilPrefix,
  dageTilArm,
  type DageTilLocale,
} from "./dage-til";
import type { Locale } from "./i18n";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HomePageData {
  meta: {
    title: string;
    description: string;
    keywords: string[];
    ogTitle: string;
    ogDescription: string;
  };
  hero: {
    title: string;
    subtitle: string;
  };
  trustSignals: {
    calculators: string;
    rates: string;
    price: string;
    privacy: string;
  };
  sections: {
    /**
     * Heading for the popular-calculator cards. They sit directly under the
     * hero, so a phone lands on a menu of calculators instead of prose.
     */
    popular: string;
    /**
     * Label on the badge that marks a seasonal calculator. It is a claim the
     * site makes to a reader, so it lives here with the rest of the copy
     * instead of standing as an English literal in the page — the site has no
     * other English on the homepage and neither do its readers.
     */
    trending: string;
    /**
     * Heading for the countdown-link section. Only the locales that serve
     * /dage-til pages carry it; beregner.no serves no dage-til section at all,
     * so it is absent there rather than rendered empty.
     */
    dageTil?: string;
    whyUse: string;
    features: {
      free: { title: string; description: string };
      private: { title: string; description: string };
      local: { title: string; description: string };
    };
  };
  faqItems: { question: string; answer: string }[];
  categoryOrder: { key: string }[];
}

export interface HomeCalculator {
  title: string;
  description: string;
  href: string;
  popular: boolean;
  category: string;
}

/* ------------------------------------------------------------------ */
/*  Danish (da)                                                        */
/* ------------------------------------------------------------------ */

const daPageData: HomePageData = {
  meta: {
    title: "MinBeregner.dk - Gratis online beregnere til danskere",
    description:
      "Danmarks samling af gratis beregnere. Beregn løn efter skat, moms, lån, pension, feriepenge og BMI. {count} beregnere med 2026-satser — gratis og uden login.",
    keywords: [
      "beregner",
      "online beregner",
      "gratis beregner",
      "dansk beregner",
      "momsberegner",
      "låneberegner",
      "valutaberegner",
      "lønberegner",
      "bmi beregner",
      "elberegner",
      "timeprisberegner",
    ],
    ogTitle: "MinBeregner.dk - Gratis online beregnere",
    ogDescription:
      "Danmarks samling af gratis beregnere til økonomi, sundhed og hverdag.",
  },
  hero: {
    title: "Gratis Online Beregnere",
    subtitle:
      "{count}+ gratis beregnere til økonomi, bolig, skat, sundhed og hverdag. Opdateret med 2026-satser — helt gratis og uden login.",
  },
  trustSignals: {
    calculators: "{count}+|Gratis beregnere",
    rates: "2026|Opdaterede satser",
    price: "0 kr.|Ingen login eller betaling",
    privacy: "Lokalt|Ingen input gemmes i database",
  },
  sections: {
    popular: "Populære beregnere",
    trending: "Populær nu",
    dageTil: "Hvor mange dage er der til…",
    whyUse: "Hvorfor bruge MinBeregner.dk?",
    features: {
      free: {
        title: "100 % Gratis",
        description:
          "Alle beregnere er gratis at bruge. Ingen skjulte gebyrer eller premium-funktioner.",
      },
      private: {
        title: "Privat & Sikkert",
        description:
          "Dine input gemmes ikke i nogen database, og beregningen sker lokalt i din browser. Hvis du vælger en ekstern delingstjeneste, modtager den de kodede input.",
      },
      local: {
        title: "Danske Satser",
        description:
          "Opdateret med de nyeste danske satser og regler for 2026.",
      },
    },
  },
  faqItems: [
    {
      question: "Er beregnerne gratis at bruge?",
      answer:
        "Ja, alle beregnere på MinBeregner.dk er 100 % gratis. Vi kræver ingen tilmelding eller betaling.",
    },
    {
      question: "Gemmer I mine data?",
      answer:
        "Nej, selve beregningen sker lokalt i din browser, og vi gemmer ikke dine personlige input i nogen database. Delelinks afhænger af beregneren: Nogle bruger URL-fragmenter, som browseren normalt ikke sender med sideanmodningen, mens andre bruger query-parametre, som kan sendes, når linket åbnes. Læs privatlivspolitikken for detaljer.",
    },
    {
      question: "Er beregningerne pålidelige?",
      answer:
        "Vores beregnere og screeninger giver estimater baseret på officielle satser, formler og dokumenterede signaler. Se altid de officielle kilder, når et præcist beløb eller en endelig ydelse er vigtigt.",
    },
    {
      question: "Hvilke beregnere har I?",
      answer:
        "Vi har {count} beregnere til økonomi (løn, skat, pension, dagpenge, feriepenge, moms), bolig (boliglån, ejendomsværdiskat, boligstøtte), lån (billån, forbrugslån, renteberegner), sundhed (BMI for voksne, kalorier) og hverdag (el, brændstof, dato). Vi tilføjer løbende nye beregnere.",
    },
  ],
  categoryOrder: [
    { key: "Økonomi" },
    { key: "Bolig" },
    { key: "Lån" },
    { key: "Sundhed" },
    { key: "Familie" },
    { key: "Uddannelse" },
    { key: "Erhverv" },
    { key: "Hverdag" },
    { key: "Praktisk" },
    { key: "Matematik" },
  ],
};

const daCalculators: HomeCalculator[] = [
  // Popular — de mest besøgte danske beregnere pr. Plausible 2026-10-04 (28 dage):
  // /dato 1104, /bmi 950, /boligstoette 528, /rentefradrag 456, /kvadratmeter 393,
  // /tidsberegner 277, /kalorier 272, /braendstof 256, /barselsdagpenge 236,
  // /husleje 169, /promille 157, /renteberegner 137, /pension 140 og
  // /boernepenge — efterfulgt af lønberegneren, som er sidens brandværktøj.
  // Listen er målt i den rækkefølge, læserne kommer i.
  { title: "Datoberegner", description: "Beregn dage mellem datoer, arbejdsdage og alder", href: "/dato", popular: true, category: "Praktisk" },
  { title: "BMI Beregner for voksne", description: "Beregn BMI for voksne ud fra vægt og højde", href: "/bmi", popular: true, category: "Sundhed" },
  { title: "Boligstøtte", description: "Se standardmaksima og formuegrænser for boligstøtte", href: "/boligstoette", popular: true, category: "Bolig" },
  { title: "Kvadratmeterberegner", description: "Beregn areal af rum, haver og grunde", href: "/kvadratmeter", popular: true, category: "Matematik" },
  { title: "Rentefradrag", description: "Beregn din skattebesparelse på rentefradrag", href: "/rentefradrag", popular: true, category: "Økonomi" },
  { title: "Renteprognose", description: "Se hvad dit boliglån koster om 5, 10 og 30 år", href: "/renteprognose", popular: false, category: "Økonomi" },
  { title: "Tidsberegner", description: "Beregn timer og minutter mellem tidspunkter", href: "/tidsberegner", popular: true, category: "Praktisk" },
  { title: "Kalorieberegner", description: "Beregn dit daglige kaloriebehov og makroer", href: "/kalorier", popular: true, category: "Sundhed" },
  { title: "Brændstofberegner", description: "Beregn pris for benzin, diesel eller el-bil", href: "/braendstof", popular: true, category: "Hverdag" },
  { title: "Barselsdagpenge", description: "Beregn barselsdagpenge og se orlovsperioder", href: "/barselsdagpenge", popular: true, category: "Familie" },
  { title: "Husleje Budget", description: "Find ud af hvad du har råd til i husleje", href: "/husleje", popular: true, category: "Bolig" },
  // /promille stod i den ikke-populære halvdel, selv om den 4/10 var den
  // hurtigst voksende danske side (+1327 %, 157 besøgende/28d). Uden den stod
  // den ottende mest besøgte side uden et enkelt link fra forsiden og uden
  // sidebar-plads på de ~120 kalkulatorsider.
  { title: "Promilleberegner", description: "Anslå din alkoholpromille med Widmark-formlen", href: "/promille", popular: true, category: "Sundhed" },
  { title: "Lånetype", description: "Sammenlign annuitetslån, serielån og stående lån", href: "/laantype", popular: false, category: "Økonomi" },
  { title: "Renteberegner", description: "Beregn ydelse, rente og tilbagebetaling på lån", href: "/renteberegner", popular: true, category: "Økonomi" },
  { title: "Børnepenge", description: "Se hvad du kan få i børne- og ungeydelse 2026", href: "/boernepenge", popular: true, category: "Familie" },
  { title: "Pensionsberegner", description: "Beregn din fremtidige pension og folkepension", href: "/pension", popular: true, category: "Økonomi" },
  // /procent, /tidszone og /moms stod i den ikke-populære halvdel, selv om de er
  // de tre danske sider med mest uopfyldt søgning: Search Console 5/10 (28 dage)
  // giver /procent 151.008 visninger på 0,1 % CTR og pos. 7,5, /tidszone 24.829
  // på 0,4 % og pos. 7,7 og /moms 24.000 på 0,2 % og pos. 7,0 — altså 200.000
  // visninger på position 5-8, hvor der er trafik, men ingen klik. Plausible
  // viser dem ikke i top-15, fordi de få klik tælles som besøgende, og netop
  // derfor stod de uden et enkelt link fra forsiden og uden sidebar-plads på de
  // ~120 kalkulatorsider. Rækkefølgen er visninger, de tre har hver 0,1-0,4 %
  // CTR.
  { title: "Procentberegner", description: "Beregn procent af et tal, stigning, fald og mere", href: "/procent", popular: true, category: "Matematik" },
  { title: "Tidszoneberegner", description: "Se hvad klokken er i andre lande", href: "/tidszone", popular: true, category: "Hverdag" },
  { title: "Momsberegner", description: "Tillæg eller fratræk 25 % moms nemt og hurtigt", href: "/moms", popular: true, category: "Økonomi" },
  { title: "Løn efter skat", description: "Se hvad du får udbetalt efter skat, AM-bidrag og pension", href: "/loen-efter-skat", popular: true, category: "Økonomi" },
  // Non-popular
  { title: "Låneberegner", description: "Beregn ydelse, sammenlign lån og se afdragsplan", href: "/laaneberegner", popular: false, category: "Lån" },
  { title: "Valutaberegner", description: "Omregn mellem DKK, EUR, USD og andre valutaer", href: "/valuta", popular: false, category: "Økonomi" },
  { title: "Opsparingsberegner", description: "Beregn renters rente og se din opsparing vokse", href: "/opsparing", popular: false, category: "Økonomi" },
  { title: "Aldersberegner", description: "Beregn din præcise alder i år, måneder og dage", href: "/alder", popular: false, category: "Hverdag" },
  { title: "Timeprisberegner", description: "Find din timepris som freelancer eller selvstændig", href: "/timepris", popular: false, category: "Erhverv" },
  { title: "Elberegner", description: "Beregn dit elforbrug og se hvad dine apparater koster", href: "/elberegner", popular: false, category: "Hverdag" },
  { title: "Feriepenge", description: "Beregn hvor meget du har til gode i feriepenge", href: "/feriepenge", popular: false, category: "Økonomi" },
  { title: "SU Beregner", description: "Beregn din SU og fribeløb baseret på din situation", href: "/su", popular: false, category: "Uddannelse" },
  { title: "Dagpengeberegner", description: "Beregn hvad du kan få i dagpenge ved ledighed", href: "/dagpenge", popular: false, category: "Økonomi" },
  { title: "Efterløn", description: "Beregn din efterløn og se hvornår du kan gå", href: "/efterloen", popular: false, category: "Økonomi" },
  { title: "Barselsplanlægger", description: "Planlæg barsel uge for uge med kalender og økonomi", href: "/barselsplanlaegger", popular: false, category: "Familie" },
  { title: "Terminsdato Beregner", description: "Beregn terminsdato og se graviditetsuge", href: "/termin", popular: false, category: "Familie" },
  { title: "Boliglån", description: "Beregn ydelse og omkostninger på dit boliglån", href: "/boliglaan", popular: false, category: "Bolig" },
  { title: "Billån", description: "Beregn månedlig ydelse og rente på billån", href: "/billaan", popular: false, category: "Lån" },
  { title: "Leasing Beregner", description: "Beregn leasingydelse og sammenlign med billån", href: "/leasing", popular: false, category: "Lån" },
  { title: "Gældsfri Beregner", description: "Beregn din vej ud af gæld med lavine/snebold", href: "/gaeldsfri", popular: false, category: "Lån" },
  { title: "Sygedagpenge", description: "Beregn sygedagpenge og se arbejdsgiverperiode", href: "/sygedagpenge", popular: false, category: "Økonomi" },
  { title: "Konfirmationsbudget", description: "Beregn budget for konfirmation med udgifter og gaver", href: "/konfirmation", popular: false, category: "Familie" },
  { title: "Vægttab Beregner", description: "Beregn kalorieunderskud for vægttab", href: "/vaegttab", popular: false, category: "Sundhed" },
  { title: "Andelsbolig Beregner", description: "Beregn omkostninger ved køb af andelsbolig", href: "/andelsbolig", popular: false, category: "Bolig" },
  { title: "Rejsebudget", description: "Beregn rejsebudget til populære destinationer", href: "/rejsebudget", popular: false, category: "Hverdag" },
  { title: "Afstand mellem adresser", description: "Beregn kørselsafstanden mellem to adresser", href: "/afstand-mellem-adresser", popular: false, category: "Hverdag" },
  { title: "Studielån", description: "Beregn tilbagebetaling af SU-lån", href: "/studielaan", popular: false, category: "Uddannelse" },
  { title: "Solcelle Beregner", description: "Beregn besparelse og tilbagebetalingstid for solceller", href: "/solceller", popular: false, category: "Bolig" },
  { title: "Bryllupsbudget", description: "Beregn komplet bryllupsbudget", href: "/bryllup", popular: false, category: "Familie" },
  { title: "Skattefradrag", description: "Beregn alle skattefradrag samlet", href: "/skattefradrag", popular: false, category: "Økonomi" },
  { title: "Forbrugslån", description: "Beregn ydelse og ÅOP på forbrugslån", href: "/forbrugslaan", popular: false, category: "Lån" },
  { title: "Ejendomsværdiskat", description: "Beregn ejendomsværdiskat og grundskyld 2026", href: "/ejendomsvaerdiskat", popular: false, category: "Bolig" },
  { title: "Arveafgift", description: "Beregn bo- og tillægsafgift ved arv", href: "/arveafgift", popular: false, category: "Økonomi" },
  { title: "Gaveafgift", description: "Se hvor meget du må give afgiftsfrit, og beregn gaveafgiften", href: "/gaveafgift", popular: false, category: "Økonomi" },
  { title: "Aktieskat", description: "Beregn skat på aktiegevinst — frit depot vs. ASK", href: "/aktieskat", popular: false, category: "Økonomi" },
  { title: "Topskat Beregner", description: "Beregn om du betaler mellemskat eller topskat", href: "/topskat", popular: false, category: "Økonomi" },
  { title: "Brutto/Netto Beregner", description: "Find bruttoløn ud fra ønsket udbetaling", href: "/brutto-netto", popular: false, category: "Økonomi" },
  { title: "Bil Værdtab", description: "Beregn værdtab og omkostninger for din bil", href: "/bil", popular: false, category: "Hverdag" },
  // Resten af sitets egen katalog (`categories.ts`), der pr. 2026-09-28 ikke var
  // linked fra forsiden. /brok (4.913 visninger) og /fart (4.570) ligger begge
  // på Google-sides første side, så de havde nul interne links fra sitets mest
  // linkede side. /promille stod også her og er 4/10 flyttet op i den populære
  // række, fordi den målte 157 besøgende/28d. Titler, beskrivelser og kategorier
  // er kopieret ordret fra `categories.ts`, så de to lister ikke kan glide fra hinanden.

  // Økonomi
  { title: "Rådighedsbeløb", description: "Beregn dit månedlige rådighedsbeløb", href: "/budget", popular: false, category: "Økonomi" },
  { title: "Lønberegner", description: "Omregn mellem timeløn, månedsløn og årsløn", href: "/loen-konverter", popular: false, category: "Økonomi" },
  { title: "Afkastberegner", description: "Beregn ROI og årligt afkast (CAGR)", href: "/afkast", popular: false, category: "Økonomi" },
  { title: "Sparemål", description: "Hvor meget skal du spare op om måneden?", href: "/sparemaal", popular: false, category: "Økonomi" },
  { title: "Lønstigning", description: "Beregn lønstigning i procent og kroner", href: "/loenstigning", popular: false, category: "Økonomi" },
  { title: "Befordringsfradrag", description: "Beregn dit kørselsfradrag 2026 og se skattebesparelsen", href: "/befordringsfradrag", popular: false, category: "Økonomi" },

  // Bolig
  { title: "Boligsalg Beregner", description: "Beregn nettoprovenu ved salg af bolig — alle omkostninger", href: "/boligsalg", popular: false, category: "Bolig" },

  // Sundhed
  { title: "Kropsfedtprocent", description: "Beregn din fedtprocent med U.S. Navy-metoden", href: "/kropsfedt", popular: false, category: "Sundhed" },
  { title: "Rumfangsberegner", description: "Beregn rumfang i m³ og liter", href: "/rumfang", popular: false, category: "Matematik" },
  { title: "Idealvægt", description: "Devines og Hamwis formel for din højde", href: "/idealvaegt", popular: false, category: "Sundhed" },
  { title: "1RM beregner", description: "Anslå dit maksimale løft (one-rep max)", href: "/1rm", popular: false, category: "Sundhed" },
  { title: "Vandbehov", description: "Beregn dit daglige væskebehov", href: "/vandbehov", popular: false, category: "Sundhed" },
  { title: "Skridt til km", description: "Hvor langt er 10.000 skridt?", href: "/skridt", popular: false, category: "Sundhed" },
  { title: "Kalorieforbrænding", description: "Forbrændte kalorier ved løb, cykling m.m.", href: "/motion-kalorier", popular: false, category: "Sundhed" },
  { title: "Proteinbehov", description: "Beregn dit daglige proteinbehov efter aktivitetsniveau", href: "/proteinbehov", popular: false, category: "Sundhed" },
  { title: "Rygestop", description: "Se hvad du sparer på at holde op med at ryge", href: "/rygestop", popular: false, category: "Sundhed" },
  { title: "Alkoholenheder", description: "Beregn antal genstande ud fra mængde og alkoholprocent", href: "/alkoholenheder", popular: false, category: "Sundhed" },

  // Familie
  { title: "Ægløsningsberegner", description: "Find dine frugtbare dage og din ægløsning", href: "/aegloesning", popular: false, category: "Familie" },

  // Hverdag
  { title: "Elbil vs. benzinbil", description: "Sammenlign driftsomkostninger for elbil og benzinbil", href: "/elbil", popular: false, category: "Hverdag" },
  { title: "Elbil-lading", description: "Beregn hvad det koster at lade din elbil", href: "/elbil-lading", popular: false, category: "Hverdag" },
  { title: "Enhedspris", description: "Find den billigste vare pr. kilo, liter eller stk", href: "/enhedspris", popular: false, category: "Hverdag" },
  { title: "Brokost Storebælt og Øresund", description: "Se prisen for at krydse Storebælt og Øresund og dit årsforbrug", href: "/brokost", popular: false, category: "Hverdag" },
  { title: "Rabatberegner", description: "Beregn pris efter rabat og se din besparelse", href: "/rabat", popular: false, category: "Hverdag" },
  { title: "Fartberegner", description: "Beregn fart, distance og tid — plus tempo i min/km", href: "/fart", popular: false, category: "Hverdag" },
  { title: "Løbetidsberegner", description: "Beregn tempo i min/km og holdtider pr. kilometer", href: "/pace", popular: false, category: "Hverdag" },
  { title: "Del regningen", description: "Fordel regningen ligeligt mellem flere personer", href: "/del-regning", popular: false, category: "Hverdag" },
  { title: "Nedtælling", description: "Tæl dage til en fødselsdag, ferie eller jul", href: "/nedtaelling", popular: false, category: "Hverdag" },
  { title: "Flyttebudget Beregner", description: "Beregn dit samlede flyttebudget", href: "/flyttebudget", popular: false, category: "Hverdag" },

  // Praktisk
  { title: "Ugenummer", description: "Se ISO-ugenummer for enhver dato", href: "/ugenummer", popular: false, category: "Praktisk" },

  // Matematik
  { title: "Temperaturberegner", description: "Omregn mellem Celsius, Fahrenheit og Kelvin", href: "/temperatur", popular: false, category: "Matematik" },
  { title: "Gennemsnitsberegner", description: "Beregn gennemsnit, sum og median af tal", href: "/gennemsnit", popular: false, category: "Matematik" },
  { title: "Enhedsberegner", description: "Omregn længde, vægt og volumen mellem enheder", href: "/enheder", popular: false, category: "Matematik" },
  { title: "Brøkberegner", description: "Forkort brøk og omregn til decimal og procent", href: "/brok", popular: false, category: "Matematik" },
  { title: "Ohms lov", description: "Beregn spænding, strøm, modstand og effekt", href: "/ohm", popular: false, category: "Matematik" },
  { title: "Vægt på planeterne", description: "Se din vægt på Månen, Mars og de andre planeter", href: "/planetvaegt", popular: false, category: "Matematik" },
  { title: "Nutidskroner", description: "Omregn et gammelt beløb til dagens prisniveau", href: "/nutidskroner", popular: false, category: "Økonomi" },
  { title: "Malingberegner", description: "Beregn hvor mange liter maling du skal bruge", href: "/maling", popular: false, category: "Hverdag" },
  { title: "TV-størrelse", description: "Omregn tv'ets tommer til cm og se seerafstanden", href: "/tv-storrelse", popular: false, category: "Hverdag" },
  { title: "Lånekapacitet", description: "Se hvor meget du kan låne til bolig", href: "/laanekapacitet", popular: false, category: "Bolig" },
];

/* ------------------------------------------------------------------ */
/*  Norwegian / Bokmål (no)                                            */
/* ------------------------------------------------------------------ */

const noPageData: HomePageData = {
  meta: {
    title: "Beregner.no - Gratis online kalkulatorer for Norge",
    description:
      "Norges samling av gratis online kalkulatorer. Beregn moms, lån, renter, BMI for voksne og mye mer. {count} kalkulatorer med 2026-satser — helt gratis og uten innlogging.",
    keywords: [
      "kalkulator",
      "online kalkulator",
      "gratis kalkulator",
      "norsk kalkulator",
      "mva kalkulator",
      "lånekalkulator",
      "valutakalkulator",
      "bmi kalkulator",
      "strømkalkulator",
      "timepris kalkulator",
    ],
    ogTitle: "Beregner.no - Gratis online kalkulatorer",
    ogDescription:
      "Norges samling av gratis kalkulatorer for økonomi, helse og hverdag.",
  },
  hero: {
    title: "Gratis Online Kalkulatorer",
    subtitle:
      "{count}+ gratis kalkulatorer for økonomi, bolig, helse og hverdag. Oppdatert med 2026-satser — helt gratis og uten innlogging.",
  },
  trustSignals: {
    calculators: "{count}+|Gratis kalkulatorer",
    rates: "2026|Oppdaterte satser",
    price: "0 kr|Ingen innlogging eller betaling",
    privacy: "Lokalt|Ingen inndata lagres i database",
  },
  sections: {
    popular: "Populære kalkulatorer",
    trending: "Populær nå",
    whyUse: "Hvorfor bruke Beregner.no?",
    features: {
      free: {
        title: "100 % Gratis",
        description:
          "Alle kalkulatorer er gratis å bruke. Ingen skjulte gebyrer eller premium-funksjoner.",
      },
      private: {
        title: "Privat & Sikkert",
        description:
          "Inndataene lagres ikke i noen database, og beregningen skjer lokalt i nettleseren. Når du velger en ekstern delingstjeneste, mottar den de kodede inndataene.",
      },
      local: {
        title: "Norske Satser",
        description:
          "Oppdatert med de nyeste norske satsene og reglene for 2026.",
      },
    },
  },
  faqItems: [
    {
      question: "Er kalkulatorene gratis å bruke?",
      answer:
        "Ja, alle kalkulatorer på Beregner.no er 100 % gratis. Vi krever ingen registrering eller betaling.",
    },
    {
      question: "Lagrer dere mine data?",
      answer:
        "Nei, selve beregningen skjer lokalt i nettleseren, og vi lagrer ikke inndataene dine i noen database. Delelenker avhenger av kalkulatoren: Noen bruker URL-fragmenter som normalt ikke sendes med sideforespørselen, mens andre bruker query-parametere som kan sendes når lenken åpnes. Se personvernerklæringen for detaljer.",
    },
    {
      question: "Er beregningene pålitelige?",
      answer:
        "Våre kalkulatorer gir gode estimater basert på offisielle satser og formler. For nøyaktige beløp anbefaler vi alltid å sjekke de offisielle kildene (Skatteetaten, nav.no, osv.).",
    },
    {
      question: "Hvilke kalkulatorer har dere?",
      answer:
        "Vi har {count} kalkulatorer for økonomi (moms, valuta, renter, opsparing), bolig (boliglån, strøm, solceller), lån (billån, leasing, forbrukslån), helse (BMI for voksne, kalorier) og hverdag (drivstoff, dato, tidssoner). Vi legger løpende til nye kalkulatorer.",
    },
  ],
  categoryOrder: [
    { key: "Økonomi" },
    { key: "Bolig" },
    { key: "Lån" },
    { key: "Helse" },
    { key: "Familie" },
    { key: "Hverdag" },
    { key: "Praktisk" },
    { key: "Matematikk" },
  ],
};

const noCalculators: HomeCalculator[] = [
  // Popular
  { title: "BMI Kalkulator for voksne", description: "Beregn BMI for voksne ut fra vekt og høyde", href: "/bmi", popular: true, category: "Helse" },
  { title: "Momskalkulator (MVA)", description: "Legg til eller trekk fra 25 % moms enkelt og raskt", href: "/moms", popular: true, category: "Økonomi" },
  { title: "Lånekalkulator", description: "Beregn månedlig betaling, sammenlign lån og se nedbetalingsplan", href: "/laaneberegner", popular: true, category: "Lån" },
  { title: "Valutakalkulator", description: "Regn om mellom NOK, EUR, USD og andre valutaer", href: "/valuta", popular: true, category: "Økonomi" },
  { title: "Prosentkalkulator", description: "Beregn prosent av et tall, økning, nedgang og mer", href: "/procent", popular: true, category: "Matematikk" },
  { title: "Rentekalkulator", description: "Beregn renter, avdrag og total tilbakebetaling på lån", href: "/renteberegner", popular: true, category: "Økonomi" },
  // Non-popular
  { title: "Sparekalkulator", description: "Beregn rentes rente og se sparepengene dine vokse", href: "/opsparing", popular: false, category: "Økonomi" },
  { title: "Kvadratmeterkalkulator", description: "Beregn areal av rom, hager og tomter", href: "/kvadratmeter", popular: false, category: "Matematikk" },
  { title: "Alderskalkulator", description: "Beregn din nøyaktige alder i år, måneder og dager", href: "/alder", popular: false, category: "Hverdag" },
  { title: "Løpetidskalkulator", description: "Beregn tempo per km og deltider per kilometer", href: "/pace", popular: false, category: "Hverdag" },
  { title: "Timepriskalkulator", description: "Finn timeprisen din som frilanser eller selvstendig", href: "/timepris", popular: false, category: "Økonomi" },
  { title: "Drivstoffkalkulator", description: "Beregn pris for bensin, diesel eller elbil", href: "/braendstof", popular: false, category: "Hverdag" },
  { title: "Strømkalkulator", description: "Beregn strømforbruket ditt og se hva apparatene koster", href: "/elberegner", popular: false, category: "Hverdag" },
  { title: "Kaloriekalkulator", description: "Beregn ditt daglige kaloriebehov og makroer", href: "/kalorier", popular: false, category: "Helse" },
  { title: "Datokalkulator", description: "Beregn dager mellom datoer, arbeidsdager og alder", href: "/dato", popular: false, category: "Praktisk" },
  { title: "Tidssonekalkulator", description: "Se hva klokken er i andre land", href: "/tidszone", popular: false, category: "Hverdag" },
  { title: "Tidskalkulator", description: "Beregn timer og minutter mellom tidspunkter", href: "/tidsberegner", popular: false, category: "Praktisk" },
  { title: "Boliglån", description: "Beregn månedlig betaling og kostnader på boliglånet ditt", href: "/boliglaan", popular: false, category: "Bolig" },
  { title: "Billån", description: "Beregn månedlig betaling og rente på billån", href: "/billaan", popular: false, category: "Lån" },
  { title: "Leasing Kalkulator", description: "Beregn leasingkostnad og sammenlign med billån", href: "/leasing", popular: false, category: "Lån" },
  { title: "Gjeldsfri Kalkulator", description: "Beregn veien ut av gjeld med lavine-/snøballmetoden", href: "/gaeldsfri", popular: false, category: "Lån" },
  { title: "Forbrukslån", description: "Beregn månedlig betaling og effektiv rente på forbrukslån", href: "/forbrugslaan", popular: false, category: "Lån" },
  { title: "Termindato Kalkulator", description: "Beregn termindato og se graviditetsuke", href: "/termin", popular: false, category: "Familie" },
  { title: "Konfirmasjonsbudsjett", description: "Beregn budsjett for konfirmasjon med utgifter og gaver", href: "/konfirmation", popular: false, category: "Familie" },
  { title: "Vekttap Kalkulator", description: "Beregn kalorieunderskudd for vekttap", href: "/vaegttab", popular: false, category: "Helse" },
  { title: "Skritt til km", description: "Hvor langt er 10 000 skritt?", href: "/skridt", popular: false, category: "Helse" },
  { title: "Reisebudsjett", description: "Beregn reisebudsjett til populære destinasjoner", href: "/rejsebudget", popular: false, category: "Hverdag" },
  { title: "Solcelle Kalkulator", description: "Beregn besparelse og tilbakebetalingstid for solceller", href: "/solceller", popular: false, category: "Bolig" },
  { title: "Bryllupsbudsjett", description: "Beregn komplett bryllupsbudsjett", href: "/bryllup", popular: false, category: "Familie" },
  { title: "Bil Verditap", description: "Beregn verditap og kostnader for bilen din", href: "/bil", popular: false, category: "Hverdag" },
];

/* ------------------------------------------------------------------ */
/*  Swedish (se)                                                       */
/* ------------------------------------------------------------------ */

const sePageData: HomePageData = {
  meta: {
    title: "Beräknare.se - Gratis online kalkylatorer för Sverige",
    description:
      "Sveriges samling av gratis online kalkylatorer. Beräkna moms, lån, räntor, pension och BMI. {count} kalkylatorer med 2026-satser — gratis och utan inloggning.",
    keywords: [
      "kalkylator",
      "online kalkylator",
      "gratis kalkylator",
      "svensk kalkylator",
      "momskalkylator",
      "lånekalkylator",
      "valutakalkylator",
      "bmi kalkylator",
      "elkalkylator",
      "timpriskalkylator",
    ],
    ogTitle: "Beräknare.se - Gratis online kalkylatorer",
    ogDescription:
      "Sveriges samling av gratis kalkylatorer för ekonomi, hälsa och vardag.",
  },
  hero: {
    title: "Gratis Online Kalkylatorer",
    subtitle:
      "{count}+ gratis kalkylatorer för ekonomi, bostad, hälsa och vardag. Uppdaterade med 2026-satser — helt gratis och utan inloggning.",
  },
  trustSignals: {
    calculators: "{count}+|Gratis kalkylatorer",
    rates: "2026|Uppdaterade satser",
    price: "0 kr|Ingen inloggning eller betalning",
    privacy: "Lokalt|Inga uppgifter sparas i databas",
  },
  sections: {
    popular: "Populära kalkylatorer",
    trending: "Populär nu",
    dageTil: "Hur många dagar är det till…",
    whyUse: "Varför använda Beräknare.se?",
    features: {
      free: {
        title: "100 % Gratis",
        description:
          "Alla kalkylatorer är gratis att använda. Inga dolda avgifter eller premiumfunktioner.",
      },
      private: {
        title: "Privat & Säkert",
        description:
          "Dina uppgifter sparas inte i någon databas, och beräkningen sker lokalt i webbläsaren. När du väljer en extern delningstjänst tar den emot de kodade uppgifterna.",
      },
      local: {
        title: "Svenska Satser",
        description:
          "Uppdaterade med de senaste svenska satserna och reglerna för 2026.",
      },
    },
  },
  faqItems: [
    {
      question: "Är kalkylatorerna gratis att använda?",
      answer:
        "Ja, alla kalkylatorer på Beräknare.se är 100 % gratis. Vi kräver ingen registrering eller betalning.",
    },
    {
      question: "Sparar ni mina uppgifter?",
      answer:
        "Nej, själva beräkningen sker lokalt i webbläsaren, och vi sparar inte dina uppgifter i någon databas. Dellänkar beror på kalkylatorn: Vissa använder URL-fragment som normalt inte skickas med sidans förfrågan, medan andra använder query-parametrar som kan skickas när länken öppnas. Läs integritetspolicyn för detaljer.",
    },
    {
      question: "Är beräkningarna tillförlitliga?",
      answer:
        "Våra kalkylatorer ger bra uppskattningar baserade på officiella satser och formler. För exakta belopp rekommenderar vi alltid att kontrollera de officiella källorna (Skatteverket, Försäkringskassan, etc.).",
    },
    {
      question: "Vilka kalkylatorer har ni?",
      answer:
        "Vi har {count} kalkylatorer för ekonomi (moms, valuta, räntor, sparande), bostad (bolån, el, solceller), lån (billån, leasing, konsumtionslån), hälsa (BMI för vuxna, kalorier) och vardag (bränsle, datum, tidszoner). Vi lägger löpande till nya kalkylatorer.",
    },
  ],
  categoryOrder: [
    { key: "Ekonomi" },
    { key: "Bostad" },
    { key: "Lån" },
    { key: "Hälsa" },
    { key: "Familj" },
    { key: "Vardag" },
    { key: "Praktiskt" },
    { key: "Matematik" },
  ],
};

const seCalculators: HomeCalculator[] = [
  // Popular — de mest besökte svenska kalkylatorerna pr. 2026-09-25 (28 dage)
  { title: "Tidskalkylator", description: "Beräkna timmar och minuter mellan tidpunkter", href: "/tidsberegner", popular: true, category: "Praktiskt" },
  { title: "Datumkalkylator", description: "Beräkna dagar mellan datum, arbetsdagar och ålder", href: "/dato", popular: true, category: "Praktiskt" },
  { title: "Leasing Kalkylator", description: "Beräkna leasingkostnad och jämför med billån", href: "/leasing", popular: true, category: "Lån" },
  { title: "Nedräkningskalkylator", description: "Beräkna hur många dagar till ett givet datum", href: "/nedtaelling", popular: true, category: "Praktiskt" },
  { title: "Tidszonskalkylator", description: "Se vad klockan är i andra länder", href: "/tidszone", popular: true, category: "Vardag" },
  { title: "Lön efter skatt", description: "Beräkna din nettolön efter svensk skatt", href: "/lon-efter-skatt", popular: true, category: "Ekonomi" },
  // Non-popular
  { title: "BMI Kalkylator för vuxna", description: "Beräkna BMI för vuxna utifrån vikt och längd", href: "/bmi", popular: false, category: "Hälsa" },
  { title: "Momskalkylator", description: "Lägg till eller dra av 25 % moms enkelt och snabbt", href: "/moms", popular: false, category: "Ekonomi" },
  { title: "Lånekalkylator", description: "Beräkna månadskostnad, jämför lån och se amorteringsplan", href: "/laaneberegner", popular: false, category: "Lån" },
  { title: "Valutakalkylator", description: "Räkna om mellan SEK, EUR, USD och andra valutor", href: "/valuta", popular: false, category: "Ekonomi" },
  { title: "Procentkalkylator", description: "Beräkna procent av ett tal, ökning, minskning och mer", href: "/procent", popular: false, category: "Matematik" },
  { title: "Lånetyp", description: "Jämför annuitetslån, serielån och stående lån", href: "/laantype", popular: false, category: "Ekonomi" },
  { title: "Räntekalkylator", description: "Beräkna räntor, amortering och total återbetalning på lån", href: "/renteberegner", popular: false, category: "Ekonomi" },
  { title: "Sparkalkylator", description: "Beräkna ränta på ränta och se ditt sparande växa", href: "/opsparing", popular: false, category: "Ekonomi" },
  { title: "Kvadratmeterkalkylator", description: "Beräkna yta av rum, trädgårdar och tomter", href: "/kvadratmeter", popular: false, category: "Matematik" },
  { title: "Ålderskalkylator", description: "Beräkna din exakta ålder i år, månader och dagar", href: "/alder", popular: false, category: "Vardag" },
  { title: "Timpriskalkylator", description: "Hitta ditt timpris som frilansare eller egenföretagare", href: "/timepris", popular: false, category: "Ekonomi" },
  { title: "Bränslekalkylator", description: "Beräkna pris för bensin, diesel eller elbil", href: "/braendstof", popular: false, category: "Vardag" },
  { title: "Elkalkylator", description: "Beräkna din elförbrukning och se vad dina apparater kostar", href: "/elberegner", popular: false, category: "Vardag" },
  { title: "Kalorikalkylator", description: "Beräkna ditt dagliga kaloribehov och makros", href: "/kalorier", popular: false, category: "Hälsa" },
  { title: "Bolån", description: "Beräkna månadskostnad och kostnader för ditt bolån", href: "/boliglaan", popular: false, category: "Bostad" },
  { title: "Bolån 2026", description: "Beräkna amortering och räntekostnad med svenska bolåneregler", href: "/bolan", popular: false, category: "Bostad" },
  { title: "Billån", description: "Beräkna månadskostnad och ränta på billån", href: "/billaan", popular: false, category: "Lån" },
  { title: "Skuldfri Kalkylator", description: "Beräkna vägen ut ur skuld med lavin-/snöbollsmetoden", href: "/gaeldsfri", popular: false, category: "Lån" },
  { title: "Konsumtionslån", description: "Beräkna månadskostnad och effektiv ränta på konsumtionslån", href: "/forbrugslaan", popular: false, category: "Lån" },
  { title: "Beräknad Förlossning", description: "Beräkna förlossningsdatum och se graviditetsvecka", href: "/termin", popular: false, category: "Familj" },
  { title: "Konfirmationsbudget", description: "Beräkna budget för konfirmation med utgifter och gåvor", href: "/konfirmation", popular: false, category: "Familj" },
  { title: "Viktnedgång Kalkylator", description: "Beräkna kaloriunderskott för viktnedgång", href: "/vaegttab", popular: false, category: "Hälsa" },
  { title: "Resebudget", description: "Beräkna resebudget till populära destinationer", href: "/rejsebudget", popular: false, category: "Vardag" },
  { title: "Solcellskalkylator", description: "Beräkna besparing och återbetalningstid för solceller", href: "/solceller", popular: false, category: "Bostad" },
  { title: "Bröllopsbudget", description: "Beräkna komplett bröllopsbudget", href: "/bryllup", popular: false, category: "Familj" },
  { title: "Bil Värdeminskning", description: "Beräkna värdeminskning och kostnader för din bil", href: "/bil", popular: false, category: "Vardag" },
  // Tillagda 2026-09-28: de 22 som manglade, så att katalogen på beraknare.se
  // har samma 53 kort som den svenska delen af calculator-list.ts. Titel og
  // beskrivelse er kopieret ordret derfra, så de to lister ikke kan glide fra
  // hinanden; kategorien er den svenska oversættelse af den danske
  // kategori i categories.ts (Økonomi→Ekonomi, Sundhed→Hälsa, Familie→Familj,
  // Hverdag→Vardag, Matematik→Matematik).
  { title: "Lönekalkylator", description: "Omvandla timlön, månadslön och årslön", href: "/loen-konverter", popular: false, category: "Ekonomi" },
  { title: "Hushållsbudget", description: "Räkna ut kvar att leva på", href: "/budget", popular: false, category: "Ekonomi" },
  { title: "Avkastningskalkylator", description: "Beräkna ROI och årlig avkastning", href: "/afkast", popular: false, category: "Ekonomi" },
  { title: "Sparmål", description: "Hur mycket ska du spara per månad?", href: "/sparemaal", popular: false, category: "Ekonomi" },
  { title: "Löneökning", description: "Beräkna löneökning i procent", href: "/loenstigning", popular: false, category: "Ekonomi" },
  { title: "Promillekalkylator", description: "Uppskatta din alkoholpromille", href: "/promille", popular: false, category: "Hälsa" },
  { title: "Kroppsfettprosent", description: "Beräkna fettprocent (Navy-metoden)", href: "/kropsfedt", popular: false, category: "Hälsa" },
  { title: "Volymberäknare", description: "Beräkna volym i m³ och liter", href: "/rumfang", popular: false, category: "Matematik" },
  { title: "Idealvikt", description: "Devines och Hamwis formel för din längd", href: "/idealvaegt", popular: false, category: "Hälsa" },
  { title: "1RM kalkylator", description: "Uppskatta ditt maxlyft", href: "/1rm", popular: false, category: "Hälsa" },
  { title: "Vattenbehov", description: "Hur mycket vatten ska du dricka?", href: "/vandbehov", popular: false, category: "Hälsa" },
  { title: "Steg till km", description: "Hur långt är 10 000 steg?", href: "/skridt", popular: false, category: "Hälsa" },
  { title: "Kaloriförbränning", description: "Förbrända kalorier vid motion", href: "/motion-kalorier", popular: false, category: "Hälsa" },
  { title: "Proteinbehov", description: "Beräkna ditt dagliga proteinbehov", href: "/proteinbehov", popular: false, category: "Hälsa" },
  { title: "Elbil vs. bensin", description: "Jämför elbil och bensinbil", href: "/elbil", popular: false, category: "Vardag" },
  { title: "Laddkostnad elbil", description: "Beräkna vad det kostar att ladda din elbil", href: "/elbil-lading", popular: false, category: "Vardag" },
  { title: "Jämförpris", description: "Hitta den billigaste varan per enhet", href: "/enhedspris", popular: false, category: "Vardag" },
  { title: "Hastighetskalkylator", description: "Beräkna hastighet, sträcka och tid", href: "/fart", popular: false, category: "Vardag" },
  { title: "Löptidsberäknare", description: "Beräkna pace per km och deltider per kilometer", href: "/pace", popular: false, category: "Vardag" },
  { title: "Dela notan", description: "Fördela notan mellan flera", href: "/del-regning", popular: false, category: "Vardag" },
  { title: "Ägglossning", description: "Hitta dina fertila dagar", href: "/aegloesning", popular: false, category: "Familj" },
  { title: "Temperatur", description: "Omvandla °C, °F och Kelvin", href: "/temperatur", popular: false, category: "Matematik" },
  { title: "Medelvärde", description: "Beräkna medelvärde och median", href: "/gennemsnit", popular: false, category: "Matematik" },
  { title: "Enhetskalkylator", description: "Omvandla längd, vikt och volym", href: "/enheder", popular: false, category: "Matematik" },
  { title: "Bråkkalkylator", description: "Förkorta bråk till decimal och procent", href: "/brok", popular: false, category: "Matematik" },
  { title: "Ohms lag", description: "Beräkna spänning, ström och resistans", href: "/ohm", popular: false, category: "Matematik" },
  { title: "Vikt på planeterna", description: "Hur mycket väger du på Mars?", href: "/planetvaegt", popular: false, category: "Matematik" },
];

/* ------------------------------------------------------------------ */
/*  Lookup maps                                                        */
/* ------------------------------------------------------------------ */

const pageDataMap: Record<Locale, HomePageData> = {
  da: daPageData,
  no: noPageData,
  se: sePageData,
};

const calculatorMap: Record<Locale, HomeCalculator[]> = {
  da: daCalculators,
  no: noCalculators,
  se: seCalculators,
};

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export function getHomeCalculatorCount(locale: Locale): number {
  return getHomeCalculators(locale).length;
}

export function getHomePageData(locale: Locale): HomePageData {
  const data = pageDataMap[locale] ?? pageDataMap.da;
  const count = String(getHomeCalculatorCount(locale));
  return {
    ...data,
    meta: {
      ...data.meta,
      description: data.meta.description.replaceAll("{count}", count),
      ogDescription: data.meta.ogDescription.replaceAll("{count}", count),
    },
    hero: {
      ...data.hero,
      subtitle: data.hero.subtitle.replaceAll("{count}", count),
    },
    trustSignals: {
      ...data.trustSignals,
      calculators: data.trustSignals.calculators.replace("{count}", count),
    },
    faqItems: data.faqItems.map((item) => ({
      ...item,
      answer: item.answer.replaceAll("{count}", count),
    })),
  };
}

export function getHomeCalculators(locale: Locale): HomeCalculator[] {
  return (calculatorMap[locale] ?? calculatorMap.da).filter((calculator) =>
    isCalculatorAvailable(calculator.href, locale)
  );
}

/**
 * The homepage's most visited calculators, in measured order (Plausible,
 * 28 days), rendered as the popular cards directly under the hero.
 *
 * **One list, one place.** A compact "quick links" strip used to sit above the
 * trust bar with the *first eight of these same cards*, so a Danish reader met
 * eight of the fourteen twice on one screen: as bare links under the hero and
 * again as 230 px cards further down, while the Swedish and Norwegian homepages
 * — which have only six popular entries — met the same six links twice. The
 * cards now sit directly under the hero instead, so the entry point is on the
 * first screen and each calculator is linked once.
 *
 * **Why the cards and not eight bare links.** The cards carry the
 * calculator's own description and category, which is what lets a visitor
 * choose; the strip only repeated the titles. A locale is never padded.
 */

/** Per-locale words for the countdown line. Each is that language's own. */
const dageTilOrd: Record<DageTilLocale, { dag: string; til: string; idag: string }> = {
  da: { dag: "dage", til: "til", idag: "i dag" },
  se: { dag: "dagar", til: "till", idag: "i dag" },
};

/**
 * The ten /dage-til pages as homepage cards.
 *
 * They were reachable from /dato and /nedtaelling and nowhere else — including
 * the homepage, the site's most linked page — while "hvor mange dage er der
 * til 1 december" is the second largest query cluster on the site.
 *
 * Every string is derived from the event module: the title is the event's own
 * `question`, which is also that page's <h1>, and the day count is computed by
 * getDageTilAnswer for `today`. A card therefore cannot describe a countdown
 * the linked page does not show, and cannot go stale — the number moves with
 * the calendar because it is recalculated per request.
 *
 * Empty for any locale without the section (beregner.no serves no dage-til
 * pages), which is why getDageTilEvents guards the locale.
 */
export function getDageTilKort(
  locale: Locale,
  today: Date
): HomeCalculator[] {
  const prefix = getDageTilPrefix(locale);
  if (!prefix) return [];

  return getDageTilEvents(locale).map((event) => {
    const sprog = locale as DageTilLocale;
    const answer = getDageTilAnswer(event, sprog, today);
    const ord = dageTilOrd[sprog];
    const dato = `${formatTargetDate(answer.targetDate, sprog)} ${formatTargetYear(answer.targetDate)}`;

    return {
      title: dageTilArm(event, sprog).copy.question,
      description: answer.isToday
        ? `${ord.dag} … ${dato} — det er ${ord.idag}.`
        : `${answer.days} ${ord.dag} ${ord.til} ${dato}.`,
      // `prefix` already carries both slashes ("/dage-til/"). Wrapping it in
      // `/${prefix}/${slug}` produced "//dage-til//juledagen", and a leading
      // "//" is a protocol-relative URL — the browser resolved every card to a
      // host named "dage-til" instead of this site.
      href: `${prefix}${dageTilArm(event, sprog).slug}`,
      popular: false,
      category: "",
    };
  });
}
