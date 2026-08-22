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
    popular: string;
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
      "Danmarks samling af gratis online beregnere. Beregn løn efter skat, moms, lån, pension, feriepenge, BMI og meget mere. 44 beregnere med 2026-satser — helt gratis og uden login.",
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
      "44+ gratis beregnere til økonomi, bolig, skat, sundhed og hverdag. Opdateret med 2026-satser — helt gratis og uden login.",
  },
  trustSignals: {
    calculators: "44+|Gratis beregnere",
    rates: "2026|Opdaterede satser",
    price: "0 kr.|Ingen login eller betaling",
    privacy: "100%|Privat — data gemmes ikke",
  },
  sections: {
    popular: "Populære beregnere",
    whyUse: "Hvorfor bruge MinBeregner.dk?",
    features: {
      free: {
        title: "100% Gratis",
        description:
          "Alle beregnere er gratis at bruge. Ingen skjulte gebyrer eller premium-funktioner.",
      },
      private: {
        title: "Privat & Sikkert",
        description:
          "Dine data gemmes ikke. Alle beregninger sker lokalt i din browser.",
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
        "Ja, alle beregnere på MinBeregner.dk er 100% gratis. Vi kræver ingen tilmelding eller betaling.",
    },
    {
      question: "Gemmer I mine data?",
      answer:
        "Nej, alle beregninger sker lokalt i din browser. Vi gemmer ingen personlige data, og dine oplysninger forlader aldrig din computer.",
    },
    {
      question: "Er beregningerne pålidelige?",
      answer:
        "Vores beregnere giver gode estimater baseret på officielle satser og formler. For præcise beløb anbefaler vi altid at tjekke de officielle kilder (SKAT, borger.dk, etc.).",
    },
    {
      question: "Hvilke beregnere har I?",
      answer:
        "Vi har 44 beregnere til økonomi (løn, skat, pension, dagpenge, feriepenge, moms), bolig (boliglån, ejendomsværdiskat, boligstøtte), lån (billån, forbrugslån, renteberegner), sundhed (BMI, kalorier) og hverdag (el, brændstof, dato). Vi tilføjer løbende nye beregnere.",
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
  { title: "Løn efter skat", description: "Se hvad du får udbetalt efter skat, AM-bidrag og pension", href: "/loen-efter-skat", popular: true, category: "Økonomi" },
  { title: "BMI Beregner", description: "Beregn dit Body Mass Index og se om din vægt er sund", href: "/bmi", popular: true, category: "Sundhed" },
  { title: "Låneberegner", description: "Beregn ydelse, sammenlign lån og se afdragsplan", href: "/laaneberegner", popular: true, category: "Økonomi" },
  { title: "Momsberegner", description: "Tillæg eller fratræk 25% moms nemt og hurtigt", href: "/moms", popular: true, category: "Økonomi" },
  { title: "Valutaberegner", description: "Omregn mellem DKK, EUR, USD og andre valutaer", href: "/valuta", popular: true, category: "Økonomi" },
  { title: "Procentberegner", description: "Beregn procent af et tal, stigning, fald og mere", href: "/procent", popular: true, category: "Matematik" },
  { title: "Renteberegner", description: "Beregn ydelse, rente og tilbagebetaling på lån", href: "/renteberegner", popular: false, category: "Økonomi" },
  { title: "Opsparingsberegner", description: "Beregn renters rente og se din opsparing vokse", href: "/opsparing", popular: false, category: "Økonomi" },
  { title: "Kvadratmeterberegner", description: "Beregn areal af rum, haver og grunde", href: "/kvadratmeter", popular: false, category: "Matematik" },
  { title: "Aldersberegner", description: "Beregn din præcise alder i år, måneder og dage", href: "/alder", popular: false, category: "Hverdag" },
  { title: "Timeprisberegner", description: "Find din timepris som freelancer eller selvstændig", href: "/timepris", popular: false, category: "Erhverv" },
  { title: "Brændstofberegner", description: "Beregn pris for benzin, diesel eller el-bil", href: "/braendstof", popular: false, category: "Hverdag" },
  { title: "Elberegner", description: "Beregn dit elforbrug og se hvad dine apparater koster", href: "/elberegner", popular: false, category: "Hverdag" },
  { title: "Feriepenge", description: "Beregn hvor meget du har til gode i feriepenge", href: "/feriepenge", popular: false, category: "Økonomi" },
  { title: "Børnepenge", description: "Se hvad du kan få i børne- og ungeydelse 2026", href: "/boernepenge", popular: false, category: "Familie" },
  { title: "SU Beregner", description: "Beregn din SU og fribeløb baseret på din situation", href: "/su", popular: false, category: "Uddannelse" },
  { title: "Dagpengeberegner", description: "Beregn hvad du kan få i dagpenge ved ledighed", href: "/dagpenge", popular: false, category: "Økonomi" },
  { title: "Boligstøtte", description: "Beregn din boligstøtte til husleje", href: "/boligstoette", popular: false, category: "Bolig" },
  { title: "Kalorieberegner", description: "Beregn dit daglige kaloriebehov og makroer", href: "/kalorier", popular: false, category: "Sundhed" },
  { title: "Datoberegner", description: "Beregn dage mellem datoer, arbejdsdage og alder", href: "/dato", popular: false, category: "Praktisk" },
  { title: "Husleje Budget", description: "Find ud af hvad du har råd til i husleje", href: "/husleje", popular: false, category: "Bolig" },
  { title: "Tidszoneberegner", description: "Se hvad klokken er i andre lande", href: "/tidszone", popular: false, category: "Hverdag" },
  { title: "Tidsberegner", description: "Beregn timer og minutter mellem tidspunkter", href: "/tidsberegner", popular: false, category: "Praktisk" },
  { title: "Pensionsberegner", description: "Beregn din fremtidige pension og folkepension", href: "/pension", popular: false, category: "Økonomi" },
  { title: "Efterløn", description: "Beregn din efterløn og se hvornår du kan gå", href: "/efterloen", popular: false, category: "Økonomi" },
  { title: "Barselsdagpenge", description: "Beregn barselsdagpenge og se orlovsperioder", href: "/barselsdagpenge", popular: false, category: "Familie" },
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
  { title: "Studielån", description: "Beregn tilbagebetaling af SU-lån", href: "/studielaan", popular: false, category: "Uddannelse" },
  { title: "Solcelle Beregner", description: "Beregn besparelse og tilbagebetalingstid for solceller", href: "/solceller", popular: false, category: "Bolig" },
  { title: "Bryllupsbudget", description: "Beregn komplet bryllupsbudget", href: "/bryllup", popular: false, category: "Familie" },
  { title: "Skattefradrag", description: "Beregn alle skattefradrag samlet", href: "/skattefradrag", popular: false, category: "Økonomi" },
  { title: "Forbrugslån", description: "Beregn ydelse og ÅOP på forbrugslån", href: "/forbrugslaan", popular: false, category: "Lån" },
  { title: "Rentefradrag", description: "Beregn din skattebesparelse på rentefradrag", href: "/rentefradrag", popular: false, category: "Økonomi" },
  { title: "Ejendomsværdiskat", description: "Beregn ejendomsværdiskat og grundskyld 2026", href: "/ejendomsvaerdiskat", popular: false, category: "Bolig" },
  { title: "Arveafgift", description: "Beregn bo- og tillægsafgift ved arv", href: "/arveafgift", popular: false, category: "Økonomi" },
  { title: "Aktieskat", description: "Beregn skat på aktiegevinst — frit depot vs. ASK", href: "/aktieskat", popular: false, category: "Økonomi" },
  { title: "Topskat Beregner", description: "Beregn om du betaler mellemskat eller topskat", href: "/topskat", popular: false, category: "Økonomi" },
  { title: "Brutto/Netto Beregner", description: "Find bruttoløn ud fra ønsket udbetaling", href: "/brutto-netto", popular: false, category: "Økonomi" },
  { title: "Bil Værdtab", description: "Beregn værdtab og omkostninger for din bil", href: "/bil", popular: false, category: "Hverdag" },
];

/* ------------------------------------------------------------------ */
/*  Norwegian / Bokmål (no)                                            */
/* ------------------------------------------------------------------ */

const noPageData: HomePageData = {
  meta: {
    title: "Beregner.no - Gratis online kalkulatorer for Norge",
    description:
      "Norges samling av gratis online kalkulatorer. Beregn moms, lån, renter, BMI og mye mer. 20+ kalkulatorer med 2026-satser — helt gratis og uten innlogging.",
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
      "20+ gratis kalkulatorer for økonomi, bolig, helse og hverdag. Oppdatert med 2026-satser — helt gratis og uten innlogging.",
  },
  trustSignals: {
    calculators: "20+|Gratis kalkulatorer",
    rates: "2026|Oppdaterte satser",
    price: "0 kr|Ingen innlogging eller betaling",
    privacy: "100%|Privat — data lagres ikke",
  },
  sections: {
    popular: "Populære kalkulatorer",
    whyUse: "Hvorfor bruke Beregner.no?",
    features: {
      free: {
        title: "100% Gratis",
        description:
          "Alle kalkulatorer er gratis å bruke. Ingen skjulte gebyrer eller premium-funksjoner.",
      },
      private: {
        title: "Privat & Sikkert",
        description:
          "Dine data lagres ikke. Alle beregninger skjer lokalt i nettleseren din.",
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
        "Ja, alle kalkulatorer på Beregner.no er 100% gratis. Vi krever ingen registrering eller betaling.",
    },
    {
      question: "Lagrer dere mine data?",
      answer:
        "Nei, alle beregninger skjer lokalt i nettleseren din. Vi lagrer ingen personlige data, og opplysningene dine forlater aldri datamaskinen din.",
    },
    {
      question: "Er beregningene pålitelige?",
      answer:
        "Våre kalkulatorer gir gode estimater basert på offisielle satser og formler. For nøyaktige beløp anbefaler vi alltid å sjekke de offisielle kildene (Skatteetaten, nav.no, osv.).",
    },
    {
      question: "Hvilke kalkulatorer har dere?",
      answer:
        "Vi har over 20 kalkulatorer for økonomi (moms, valuta, renter, opsparing), bolig (boliglån, strøm, solceller), lån (billån, leasing, forbrukslån), helse (BMI, kalorier) og hverdag (drivstoff, dato, tidssoner). Vi legger løpende til nye kalkulatorer.",
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
  { title: "BMI Kalkulator", description: "Beregn din Body Mass Index og se om vekten din er sunn", href: "/bmi", popular: true, category: "Helse" },
  { title: "Momskalkulator (MVA)", description: "Legg til eller trekk fra 25% moms enkelt og raskt", href: "/moms", popular: true, category: "Økonomi" },
  { title: "Lånekalkulator", description: "Beregn månedlig betaling, sammenlign lån og se nedbetalingsplan", href: "/laaneberegner", popular: true, category: "Lån" },
  { title: "Valutakalkulator", description: "Regn om mellom NOK, EUR, USD og andre valutaer", href: "/valuta", popular: true, category: "Økonomi" },
  { title: "Prosentkalkulator", description: "Beregn prosent av et tall, økning, nedgang og mer", href: "/procent", popular: true, category: "Matematikk" },
  { title: "Rentekalkulator", description: "Beregn renter, avdrag og total tilbakebetaling på lån", href: "/renteberegner", popular: true, category: "Økonomi" },
  // Non-popular
  { title: "Sparekalkulator", description: "Beregn rentes rente og se sparepengene dine vokse", href: "/opsparing", popular: false, category: "Økonomi" },
  { title: "Kvadratmeterkalkulator", description: "Beregn areal av rom, hager og tomter", href: "/kvadratmeter", popular: false, category: "Matematikk" },
  { title: "Alderskalkulator", description: "Beregn din nøyaktige alder i år, måneder og dager", href: "/alder", popular: false, category: "Hverdag" },
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
      "Sveriges samling av gratis online kalkylatorer. Beräkna moms, lån, räntor, BMI och mycket mer. 20+ kalkylatorer med 2026-satser — helt gratis och utan inloggning.",
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
      "20+ gratis kalkylatorer för ekonomi, bostad, hälsa och vardag. Uppdaterade med 2026-satser — helt gratis och utan inloggning.",
  },
  trustSignals: {
    calculators: "20+|Gratis kalkylatorer",
    rates: "2026|Uppdaterade satser",
    price: "0 kr|Ingen inloggning eller betalning",
    privacy: "100%|Privat — data sparas inte",
  },
  sections: {
    popular: "Populära kalkylatorer",
    whyUse: "Varför använda Beräknare.se?",
    features: {
      free: {
        title: "100% Gratis",
        description:
          "Alla kalkylatorer är gratis att använda. Inga dolda avgifter eller premiumfunktioner.",
      },
      private: {
        title: "Privat & Säkert",
        description:
          "Dina uppgifter sparas inte. Alla beräkningar sker lokalt i din webbläsare.",
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
        "Ja, alla kalkylatorer på Beräknare.se är 100% gratis. Vi kräver ingen registrering eller betalning.",
    },
    {
      question: "Sparar ni mina uppgifter?",
      answer:
        "Nej, alla beräkningar sker lokalt i din webbläsare. Vi sparar inga personuppgifter, och dina uppgifter lämnar aldrig din dator.",
    },
    {
      question: "Är beräkningarna tillförlitliga?",
      answer:
        "Våra kalkylatorer ger bra uppskattningar baserade på officiella satser och formler. För exakta belopp rekommenderar vi alltid att kontrollera de officiella källorna (Skatteverket, Försäkringskassan, etc.).",
    },
    {
      question: "Vilka kalkylatorer har ni?",
      answer:
        "Vi har över 20 kalkylatorer för ekonomi (moms, valuta, räntor, sparande), bostad (bolån, el, solceller), lån (billån, leasing, konsumtionslån), hälsa (BMI, kalorier) och vardag (bränsle, datum, tidszoner). Vi lägger löpande till nya kalkylatorer.",
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
  // Popular
  { title: "BMI Kalkylator", description: "Beräkna ditt Body Mass Index och se om din vikt är hälsosam", href: "/bmi", popular: true, category: "Hälsa" },
  { title: "Momskalkylator", description: "Lägg till eller dra av 25% moms enkelt och snabbt", href: "/moms", popular: true, category: "Ekonomi" },
  { title: "Lånekalkylator", description: "Beräkna månadskostnad, jämför lån och se amorteringsplan", href: "/laaneberegner", popular: true, category: "Lån" },
  { title: "Valutakalkylator", description: "Räkna om mellan SEK, EUR, USD och andra valutor", href: "/valuta", popular: true, category: "Ekonomi" },
  { title: "Procentkalkylator", description: "Beräkna procent av ett tal, ökning, minskning och mer", href: "/procent", popular: true, category: "Matematik" },
  { title: "Räntekalkylator", description: "Beräkna räntor, amortering och total återbetalning på lån", href: "/renteberegner", popular: true, category: "Ekonomi" },
  // Non-popular
  { title: "Sparkalkylator", description: "Beräkna ränta på ränta och se ditt sparande växa", href: "/opsparing", popular: false, category: "Ekonomi" },
  { title: "Kvadratmeterkalkylator", description: "Beräkna yta av rum, trädgårdar och tomter", href: "/kvadratmeter", popular: false, category: "Matematik" },
  { title: "Ålderskalkylator", description: "Beräkna din exakta ålder i år, månader och dagar", href: "/alder", popular: false, category: "Vardag" },
  { title: "Timpriskalkylator", description: "Hitta ditt timpris som frilansare eller egenföretagare", href: "/timepris", popular: false, category: "Ekonomi" },
  { title: "Bränslekalkylator", description: "Beräkna pris för bensin, diesel eller elbil", href: "/braendstof", popular: false, category: "Vardag" },
  { title: "Elkalkylator", description: "Beräkna din elförbrukning och se vad dina apparater kostar", href: "/elberegner", popular: false, category: "Vardag" },
  { title: "Kalorikalkylator", description: "Beräkna ditt dagliga kaloribehov och makros", href: "/kalorier", popular: false, category: "Hälsa" },
  { title: "Datumkalkylator", description: "Beräkna dagar mellan datum, arbetsdagar och ålder", href: "/dato", popular: false, category: "Praktiskt" },
  { title: "Tidszonskalkylator", description: "Se vad klockan är i andra länder", href: "/tidszone", popular: false, category: "Vardag" },
  { title: "Tidskalkylator", description: "Beräkna timmar och minuter mellan tidpunkter", href: "/tidsberegner", popular: false, category: "Praktiskt" },
  { title: "Bolån", description: "Beräkna månadskostnad och kostnader för ditt bolån", href: "/boliglaan", popular: false, category: "Bostad" },
  { title: "Billån", description: "Beräkna månadskostnad och ränta på billån", href: "/billaan", popular: false, category: "Lån" },
  { title: "Leasing Kalkylator", description: "Beräkna leasingkostnad och jämför med billån", href: "/leasing", popular: false, category: "Lån" },
  { title: "Skuldfri Kalkylator", description: "Beräkna vägen ut ur skuld med lavin-/snöbollsmetoden", href: "/gaeldsfri", popular: false, category: "Lån" },
  { title: "Konsumtionslån", description: "Beräkna månadskostnad och effektiv ränta på konsumtionslån", href: "/forbrugslaan", popular: false, category: "Lån" },
  { title: "Beräknad Förlossning", description: "Beräkna förlossningsdatum och se graviditetsvecka", href: "/termin", popular: false, category: "Familj" },
  { title: "Konfirmationsbudget", description: "Beräkna budget för konfirmation med utgifter och gåvor", href: "/konfirmation", popular: false, category: "Familj" },
  { title: "Viktnedgång Kalkylator", description: "Beräkna kaloriunderskott för viktnedgång", href: "/vaegttab", popular: false, category: "Hälsa" },
  { title: "Resebudget", description: "Beräkna resebudget till populära destinationer", href: "/rejsebudget", popular: false, category: "Vardag" },
  { title: "Solcellskalkylator", description: "Beräkna besparing och återbetalningstid för solceller", href: "/solceller", popular: false, category: "Bostad" },
  { title: "Bröllopsbudget", description: "Beräkna komplett bröllopsbudget", href: "/bryllup", popular: false, category: "Familj" },
  { title: "Bil Värdeminskning", description: "Beräkna värdeminskning och kostnader för din bil", href: "/bil", popular: false, category: "Vardag" },
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

export function getHomePageData(locale: Locale): HomePageData {
  return pageDataMap[locale] ?? pageDataMap.da;
}

export function getHomeCalculators(locale: Locale): HomeCalculator[] {
  return calculatorMap[locale] ?? calculatorMap.da;
}
