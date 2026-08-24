import { getCalculatorsByLocale } from "./calculator-list";
import type { Locale } from "./i18n";

export interface CategoryData {
  slug: string;
  name: string;
  title: string;
  metaDescription: string;
  description: string;
  keywords: string[];
  faqItems: { question: string; answer: string }[];
}

export interface BeregnerItem {
  title: string;
  description: string;
  href: string;
  category: string;
}

export const beregnere: BeregnerItem[] = [
  { title: "Løn efter skat", description: "Se hvad du får udbetalt efter skat, AM-bidrag og pension", href: "/loen-efter-skat", category: "Økonomi" },
  { title: "Momsberegner", description: "Tillæg eller fratræk 25% moms nemt og hurtigt", href: "/moms", category: "Økonomi" },
  { title: "Valutaberegner", description: "Omregn mellem DKK, EUR, USD og andre valutaer", href: "/valuta", category: "Økonomi" },
  { title: "Renteberegner", description: "Beregn ydelse, rente og tilbagebetaling på lån", href: "/renteberegner", category: "Økonomi" },
  { title: "Opsparingsberegner", description: "Beregn renters rente og se din opsparing vokse", href: "/opsparing", category: "Økonomi" },
  { title: "Rådighedsbeløb", description: "Beregn dit månedlige rådighedsbeløb", href: "/budget", category: "Økonomi" },
  { title: "Lønberegner", description: "Omregn mellem timeløn, månedsløn og årsløn", href: "/loen-konverter", category: "Økonomi" },
  { title: "Afkastberegner", description: "Beregn ROI og årligt afkast (CAGR)", href: "/afkast", category: "Økonomi" },
  { title: "Sparemål", description: "Hvor meget skal du spare op om måneden?", href: "/sparemaal", category: "Økonomi" },
  { title: "Lønstigning", description: "Beregn lønstigning i procent og kroner", href: "/loenstigning", category: "Økonomi" },
  { title: "Lön efter skatt", description: "Beräkna din nettolön efter skatt", href: "/lon-efter-skatt", category: "Økonomi" },
  { title: "Feriepenge", description: "Beregn hvor meget du har til gode i feriepenge", href: "/feriepenge", category: "Økonomi" },
  { title: "Dagpengeberegner", description: "Beregn hvad du kan få i dagpenge ved ledighed", href: "/dagpenge", category: "Økonomi" },
  { title: "Sygedagpenge", description: "Beregn sygedagpenge og se arbejdsgiverperiode", href: "/sygedagpenge", category: "Økonomi" },
  { title: "Pensionsberegner", description: "Beregn din fremtidige pension og folkepension", href: "/pension", category: "Økonomi" },
  { title: "Efterløn", description: "Beregn din efterløn og se hvornår du kan gå", href: "/efterloen", category: "Økonomi" },
  { title: "Rentefradrag", description: "Beregn din skattebesparelse på rentefradrag", href: "/rentefradrag", category: "Økonomi" },
  { title: "Arveafgift", description: "Beregn bo- og tillægsafgift ved arv", href: "/arveafgift", category: "Økonomi" },
  { title: "Aktieskat", description: "Beregn skat på aktiegevinst — frit depot vs. ASK", href: "/aktieskat", category: "Økonomi" },
  { title: "Topskat Beregner", description: "Beregn om du betaler mellemskat eller topskat", href: "/topskat", category: "Økonomi" },
  { title: "Brutto/Netto Beregner", description: "Find bruttoløn ud fra ønsket udbetaling", href: "/brutto-netto", category: "Økonomi" },
  { title: "Boligstøtte", description: "Beregn din boligstøtte til husleje", href: "/boligstoette", category: "Bolig" },
  { title: "Bolån", description: "Beräkna månadskostnad för bolån", href: "/bolan", category: "Bolig" },
  { title: "Husleje Budget", description: "Find ud af hvad du har råd til i husleje", href: "/husleje", category: "Bolig" },
  { title: "Boliglån", description: "Beregn ydelse og omkostninger på dit boliglån", href: "/boliglaan", category: "Bolig" },
  { title: "Ejendomsværdiskat", description: "Beregn ejendomsværdiskat og grundskyld 2026", href: "/ejendomsvaerdiskat", category: "Bolig" },
  { title: "Andelsbolig Beregner", description: "Beregn omkostninger ved køb af andelsbolig", href: "/andelsbolig", category: "Bolig" },
  { title: "Solcelle Beregner", description: "Beregn besparelse og tilbagebetalingstid for solceller", href: "/solceller", category: "Bolig" },
  { title: "Låneberegner", description: "Beregn ydelse, sammenlign lån og se afdragsplan", href: "/laaneberegner", category: "Lån" },
  { title: "Billån", description: "Beregn månedlig ydelse og rente på billån", href: "/billaan", category: "Lån" },
  { title: "Forbrugslån", description: "Beregn ydelse og ÅOP på forbrugslån", href: "/forbrugslaan", category: "Lån" },
  { title: "Leasing Beregner", description: "Beregn leasingydelse og sammenlign med billån", href: "/leasing", category: "Lån" },
  { title: "Gældsfri Beregner", description: "Beregn din vej ud af gæld med lavine/snebold", href: "/gaeldsfri", category: "Lån" },
  { title: "BMI Beregner", description: "Beregn dit Body Mass Index og se om din vægt er sund", href: "/bmi", category: "Sundhed" },
  { title: "Kalorieberegner", description: "Beregn dit daglige kaloriebehov og makroer", href: "/kalorier", category: "Sundhed" },
  { title: "Vægttab Beregner", description: "Beregn kalorieunderskud for vægttab", href: "/vaegttab", category: "Sundhed" },
  { title: "Promilleberegner", description: "Anslå din alkoholpromille med Widmark-formlen", href: "/promille", category: "Sundhed" },
  { title: "Kropsfedtprocent", description: "Beregn din fedtprocent med U.S. Navy-metoden", href: "/kropsfedt", category: "Sundhed" },
  { title: "1RM beregner", description: "Anslå dit maksimale løft (one-rep max)", href: "/1rm", category: "Sundhed" },
  { title: "Vandbehov", description: "Beregn dit daglige væskebehov", href: "/vandbehov", category: "Sundhed" },
  { title: "Kalorieforbrænding", description: "Forbrændte kalorier ved løb, cykling m.m.", href: "/motion-kalorier", category: "Sundhed" },
  { title: "Proteinbehov", description: "Beregn dit daglige proteinbehov efter aktivitetsniveau", href: "/proteinbehov", category: "Sundhed" },
  { title: "Rygestop", description: "Se hvad du sparer på at holde op med at ryge", href: "/rygestop", category: "Sundhed" },
  { title: "Børnepenge", description: "Se hvad du kan få i børne- og ungeydelse 2026", href: "/boernepenge", category: "Familie" },
  { title: "Barselsdagpenge", description: "Beregn barselsdagpenge og se orlovsperioder", href: "/barselsdagpenge", category: "Familie" },
  { title: "Terminsdato Beregner", description: "Beregn terminsdato og se graviditetsuge", href: "/termin", category: "Familie" },
  { title: "Ægløsningsberegner", description: "Find dine frugtbare dage og din ægløsning", href: "/aegloesning", category: "Familie" },
  { title: "Konfirmationsbudget", description: "Beregn budget for konfirmation med udgifter og gaver", href: "/konfirmation", category: "Familie" },
  { title: "Rejsebudget Beregner", description: "Beregn rejsebudget til populære destinationer", href: "/rejsebudget", category: "Hverdag" },
  { title: "Studielån Beregner", description: "Beregn tilbagebetaling af SU-lån", href: "/studielaan", category: "Uddannelse" },
  { title: "Bryllupsbudget", description: "Beregn komplet bryllupsbudget", href: "/bryllup", category: "Familie" },
  { title: "Skattefradrag Beregner", description: "Beregn alle skattefradrag samlet", href: "/skattefradrag", category: "Økonomi" },
  { title: "SU Beregner", description: "Beregn din SU og fribeløb baseret på din situation", href: "/su", category: "Uddannelse" },
  { title: "Timeprisberegner", description: "Find din timepris som freelancer eller selvstændig", href: "/timepris", category: "Erhverv" },
  { title: "Aldersberegner", description: "Beregn din præcise alder i år, måneder og dage", href: "/alder", category: "Hverdag" },
  { title: "Brændstofberegner", description: "Beregn pris for benzin, diesel eller el-bil", href: "/braendstof", category: "Hverdag" },
  { title: "Elbil vs. benzinbil", description: "Sammenlign driftsomkostninger for elbil og benzinbil", href: "/elbil", category: "Hverdag" },
  { title: "Enhedspris", description: "Find den billigste vare pr. kilo, liter eller stk", href: "/enhedspris", category: "Hverdag" },
  { title: "Rabatberegner", description: "Beregn pris efter rabat og se din besparelse", href: "/rabat", category: "Hverdag" },
  { title: "Befordringsfradrag", description: "Beregn dit kørselsfradrag 2026 og se skattebesparelsen", href: "/befordringsfradrag", category: "Økonomi" },
  { title: "Fartberegner", description: "Beregn fart, distance og tid — plus tempo i min/km", href: "/fart", category: "Hverdag" },
  { title: "Del regningen", description: "Fordel regningen ligeligt mellem flere personer", href: "/del-regning", category: "Hverdag" },
  { title: "Elberegner", description: "Beregn dit elforbrug og se hvad dine apparater koster", href: "/elberegner", category: "Hverdag" },
  { title: "Tidszoneberegner", description: "Se hvad klokken er i andre lande", href: "/tidszone", category: "Hverdag" },
  { title: "Bil Værdtab", description: "Beregn værdtab og omkostninger for din bil", href: "/bil", category: "Hverdag" },
  { title: "Procentberegner", description: "Beregn procent af et tal, stigning, fald og mere", href: "/procent", category: "Matematik" },
  { title: "Kvadratmeterberegner", description: "Beregn areal af rum, haver og grunde", href: "/kvadratmeter", category: "Matematik" },
  { title: "Temperaturberegner", description: "Omregn mellem Celsius, Fahrenheit og Kelvin", href: "/temperatur", category: "Matematik" },
  { title: "Gennemsnitsberegner", description: "Beregn gennemsnit, sum og median af tal", href: "/gennemsnit", category: "Matematik" },
  { title: "Enhedsberegner", description: "Omregn længde, vægt og volumen mellem enheder", href: "/enheder", category: "Matematik" },
  { title: "Brøkberegner", description: "Forkort brøk og omregn til decimal og procent", href: "/brok", category: "Matematik" },
  { title: "Ohms lov", description: "Beregn spænding, strøm, modstand og effekt", href: "/ohm", category: "Matematik" },
  { title: "Vægt på planeterne", description: "Se din vægt på Månen, Mars og de andre planeter", href: "/planetvaegt", category: "Matematik" },
  { title: "Nedtælling", description: "Tæl dage til en fødselsdag, ferie eller jul", href: "/nedtaelling", category: "Hverdag" },
  { title: "Datoberegner", description: "Beregn dage mellem datoer, arbejdsdage og alder", href: "/dato", category: "Praktisk" },
  { title: "Tidsberegner", description: "Beregn timer og minutter mellem tidspunkter", href: "/tidsberegner", category: "Praktisk" },
];

export const categories: CategoryData[] = [
  {
    slug: "oekonomi",
    name: "Økonomi",
    title: "Økonomiberegnere — Løn, Skat, Pension & Opsparing",
    metaDescription: "Gratis økonomiberegnere til løn efter skat, feriepenge, dagpenge, pension, opsparing, moms og rentefradrag. Opdateret med 2026-satser.",
    description: "Beregn løn efter skat, feriepenge, dagpenge, pension, opsparing og meget mere. Alle beregnere er opdateret med de nyeste 2026-satser og regler fra SKAT og borger.dk.",
    keywords: ["økonomi beregner", "løn efter skat", "skatteberegner", "pensionsberegner", "feriepenge beregner", "dagpenge beregner", "momsberegner", "opsparingsberegner"],
    faqItems: [
      {
        question: "Hvilke økonomiberegnere har I?",
        answer: "Vi har 11 økonomiberegnere: løn efter skat, moms, valuta, rente, opsparing, feriepenge, dagpenge, pension, efterløn, rentefradrag og arveafgift. Alle er gratis og opdateret med 2026-satser.",
      },
      {
        question: "Er beregningerne baseret på de nyeste satser?",
        answer: "Ja, alle vores økonomiberegnere er opdateret med de gældende 2026-satser fra SKAT, ATP og relevante myndigheder. Vi opdaterer satserne årligt.",
      },
      {
        question: "Kan jeg beregne min løn efter skat?",
        answer: "Ja, vores lønberegner beregner din udbetaling efter AM-bidrag, A-skat, pension og eventuelle fradrag. Indtast din bruttoløn og se hvad du får udbetalt.",
      },
    ],
  },
  {
    slug: "bolig",
    name: "Bolig",
    title: "Boligberegnere — Boliglån, Husleje & Ejendomsskat",
    metaDescription: "Gratis boligberegnere til boliglån, husleje-budget, boligstøtte og ejendomsværdiskat. Beregn hvad din bolig koster dig.",
    description: "Find ud af hvad din bolig koster dig med vores gratis boligberegnere. Beregn boliglån, husleje-budget, boligstøtte og ejendomsværdiskat — alt opdateret med 2026-regler.",
    keywords: ["boligberegner", "boliglån beregner", "husleje beregner", "boligstøtte beregner", "ejendomsværdiskat beregner", "boligudgifter"],
    faqItems: [
      {
        question: "Hvordan beregner jeg mine boligudgifter?",
        answer: "Brug vores husleje-budgetberegner til at se hvad du har råd til, boliglån-beregneren til at se månedlig ydelse, og ejendomsværdiskat-beregneren til at beregne årlig skat på din bolig.",
      },
      {
        question: "Kan jeg få boligstøtte?",
        answer: "Brug vores boligstøtteberegner til at se om du er berettiget. Boligstøtte afhænger af din husleje, indkomst, formue og boligens størrelse. Beregneren bruger 2026-satserne.",
      },
      {
        question: "Hvad koster et boliglån?",
        answer: "Brug vores boliglånberegner til at beregne månedlig ydelse, samlet tilbagebetaling og renteomkostninger. Du kan sammenligne fast og variabel rente.",
      },
    ],
  },
  {
    slug: "laan",
    name: "Lån",
    title: "Låneberegnere — Billån, Forbrugslån & Låneberegner",
    metaDescription: "Gratis låneberegnere til billån, forbrugslån og generelle lån. Beregn månedlig ydelse, ÅOP og samlet tilbagebetaling.",
    description: "Sammenlign lån og beregn månedlig ydelse, rente og ÅOP med vores gratis låneberegnere. Se hvad dit billån eller forbrugslån reelt koster dig.",
    keywords: ["låneberegner", "billån beregner", "forbrugslån beregner", "lån ydelse", "ÅOP beregner", "rente beregner"],
    faqItems: [
      {
        question: "Hvordan sammenligner jeg lån?",
        answer: "Brug ÅOP (årlige omkostninger i procent) til at sammenligne lån. ÅOP inkluderer både rente og gebyrer, så du får et retvisende billede af låneomkostningerne.",
      },
      {
        question: "Hvad koster et billån?",
        answer: "Et billån har typisk en rente på 3-8% afhængig af udbetaling, løbetid og din kreditværdighed. Brug vores billånberegner til at se din præcise månedlige ydelse.",
      },
      {
        question: "Er forbrugslån dyrt?",
        answer: "Forbrugslån har typisk højere renter end boliglån og billån. ÅOP kan ligge fra 5% til over 20%. Brug beregneren til at se de reelle omkostninger før du optager et lån.",
      },
    ],
  },
  {
    slug: "sundhed",
    name: "Sundhed",
    title: "Sundhedsberegnere — BMI & Kalorieberegner",
    metaDescription: "Gratis sundhedsberegnere: BMI beregner og kalorieberegner. Beregn dit Body Mass Index og daglige kaloriebehov.",
    description: "Hold styr på din sundhed med vores gratis beregnere. Beregn dit BMI og daglige kaloriebehov baseret på din alder, køn, højde og aktivitetsniveau.",
    keywords: ["sundhed beregner", "bmi beregner", "kalorieberegner", "body mass index", "kaloriebehov", "idealvægt"],
    faqItems: [
      {
        question: "Hvad er en normal BMI?",
        answer: "En normal BMI ligger mellem 18,5 og 24,9. Under 18,5 er undervægt, 25-29,9 er overvægt, og over 30 regnes som fedme. BMI tager dog ikke højde for muskelmasse.",
      },
      {
        question: "Hvor mange kalorier har jeg brug for?",
        answer: "Dit daglige kaloriebehov afhænger af køn, alder, højde, vægt og aktivitetsniveau. En gennemsnitlig voksen har brug for 1.800-2.500 kalorier om dagen. Brug vores kalorieberegner for et præcist estimat.",
      },
    ],
  },
  {
    slug: "familie",
    name: "Familie",
    title: "Familieberegnere — Børnepenge & Barselsdagpenge",
    metaDescription: "Gratis familieberegnere: Beregn børnepenge (børne- og ungeydelse) og barselsdagpenge. Opdateret med 2026-satser.",
    description: "Beregn hvad du kan få i børnepenge og barselsdagpenge med vores gratis familieberegnere. Alle satser er opdateret til 2026.",
    keywords: ["familieberegner", "børnepenge beregner", "barselsdagpenge beregner", "børne- og ungeydelse", "barsel beregner"],
    faqItems: [
      {
        question: "Hvor meget får jeg i børnepenge?",
        answer: "Børne- og ungeydelsen afhænger af barnets alder. I 2026 er satserne ca. 4.596 kr/kvartal for 0-2 år, 3.636 kr/kvartal for 3-6 år og 2.862 kr/kvartal for 7-14 år. Brug beregneren for præcise beløb.",
      },
      {
        question: "Hvordan beregnes barselsdagpenge?",
        answer: "Barselsdagpenge beregnes ud fra din gennemsnitlige indkomst, dog maksimalt 4.695 kr. per uge (2026-sats). Både mor og far har ret til barselsdagpenge i forskellige perioder.",
      },
    ],
  },
  {
    slug: "uddannelse",
    name: "Uddannelse",
    title: "Uddannelsesberegnere — SU Beregner",
    metaDescription: "Gratis SU beregner: Beregn din SU og fribeløb baseret på din situation. Opdateret med 2026-satser.",
    description: "Beregn din SU og fribeløb med vores gratis SU-beregner. Se hvad du kan få i SU baseret på om du er hjemme- eller udeboende, og hvor meget du må tjene ved siden af.",
    keywords: ["su beregner", "su sats", "fribeløb", "su udeboende", "su hjemmeboende", "studiestøtte"],
    faqItems: [
      {
        question: "Hvor meget får jeg i SU?",
        answer: "SU-satsen afhænger af om du er hjemme- eller udeboende. I 2026 er udeboende-satsen ca. 6.597 kr/md og hjemmeboende-satsen ca. 2.944 kr/md (før på forældreindkomst).",
      },
      {
        question: "Hvad er fribeløb?",
        answer: "Fribeløb er det beløb du må tjene ved siden af din SU uden at skulle betale SU tilbage. I 2026 er det årlige fribeløb ca. 15.500 kr/md i de måneder du modtager SU.",
      },
    ],
  },
  {
    slug: "erhverv",
    name: "Erhverv",
    title: "Erhvervsberegnere — Timeprisberegner",
    metaDescription: "Gratis timeprisberegner for freelancere og selvstændige. Beregn din timepris så den dækker alle omkostninger.",
    description: "Beregn din optimale timepris som freelancer eller selvstændig med vores gratis timeprisberegner. Tag højde for skat, ferie, sygdom og alle omkostninger.",
    keywords: ["timeprisberegner", "freelancer timepris", "selvstændig timepris", "beregn timepris", "konsulentpris"],
    faqItems: [
      {
        question: "Hvordan beregner jeg min timepris?",
        answer: "Din timepris skal dække din ønskeløn, skat, ferie, sygdom, forsikringer og overhead. Brug vores timeprisberegner til at finde den timepris der sikrer du får nok udbetalt.",
      },
    ],
  },
  {
    slug: "hverdag",
    name: "Hverdag",
    title: "Hverdagsberegnere — El, Brændstof, Bil & Tidszone",
    metaDescription: "Gratis hverdagsberegnere: Beregn elforbrug, brændstofpris, bil værdtab, alder og tidszoner. Praktiske værktøjer til hverdagen.",
    description: "Praktiske beregnere til hverdagen. Beregn dit elforbrug, brændstofomkostninger, bil værdtab og meget mere med vores gratis online beregnere.",
    keywords: ["elberegner", "brændstofberegner", "bil værdtab", "aldersberegner", "tidszoneberegner", "hverdagsberegner"],
    faqItems: [
      {
        question: "Hvad koster min strøm?",
        answer: "Brug vores elberegner til at beregne hvad dine apparater koster i strøm. Indtast effekt (watt) og dagligt forbrug, så beregner vi din årlige elregning.",
      },
      {
        question: "Hvad koster det at køre bil?",
        answer: "Brug vores brændstofberegner til at beregne køreomkostninger og bil værdtab-beregneren til at se hvad din bil taber i værdi over tid.",
      },
    ],
  },
  {
    slug: "praktisk",
    name: "Praktisk",
    title: "Praktiske Beregnere — Dato & Tidsberegner",
    metaDescription: "Gratis praktiske beregnere: Beregn dage mellem datoer, arbejdsdage, timer og minutter. Handy værktøjer til hverdagen.",
    description: "Praktiske beregnere til dato- og tidsberegninger. Beregn antal dage mellem datoer, arbejdsdage, timer og minutter mellem tidspunkter.",
    keywords: ["datoberegner", "tidsberegner", "dage mellem datoer", "arbejdsdage beregner", "timer beregner"],
    faqItems: [
      {
        question: "Hvordan beregner jeg dage mellem to datoer?",
        answer: "Brug vores datoberegner til at beregne antal dage, uger eller måneder mellem to datoer. Du kan også beregne arbejdsdage (ekskl. weekender og helligdage).",
      },
    ],
  },
  {
    slug: "matematik",
    name: "Matematik",
    title: "Matematikberegnere — Procent & Kvadratmeter",
    metaDescription: "Gratis matematikberegnere: Procentberegner og kvadratmeterberegner. Beregn procent, areal og mere.",
    description: "Beregn procenter, arealer og mere med vores gratis matematikberegnere. Perfekte til skole, arbejde og hverdag.",
    keywords: ["procentberegner", "kvadratmeterberegner", "beregn procent", "beregn areal", "matematikberegner"],
    faqItems: [
      {
        question: "Hvordan beregner jeg procent?",
        answer: "Vores procentberegner kan beregne procent af et tal, procentvis stigning/fald, og hvad en procentsats svarer til. Fx: 25% af 400 = 100.",
      },
      {
        question: "Hvordan beregner jeg areal i kvadratmeter?",
        answer: "Brug vores kvadratmeterberegner til at beregne areal af rektangulære, cirkulære og trekantede flader. Indtast dimensionerne og få arealet i m².",
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryData | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getBeregnereByCategoryName(
  categoryName: string,
  locale: Locale = "da"
): BeregnerItem[] {
  const inCategory = beregnere.filter((b) => b.category === categoryName);
  // Danish keeps the curated titles/descriptions but still drops any
  // calculator not available on the Danish site (e.g. seOnly ones).
  if (locale === "da") {
    const daAvail = new Set(getCalculatorsByLocale("da").map((c) => c.href));
    return inCategory.filter((b) => daAvail.has(b.href));
  }
  // For other locales, use the localized names from the calculator list and
  // drop calculators that are not available in this locale (e.g. daOnly ones).
  const byHref = new Map(getCalculatorsByLocale(locale).map((c) => [c.href, c]));
  return inCategory
    .filter((b) => byHref.has(b.href))
    .map((b) => {
      const c = byHref.get(b.href)!;
      return { ...b, title: c.title, description: c.description };
    });
}

export function getAllCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}
