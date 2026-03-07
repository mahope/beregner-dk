export interface CategoryData {
  slug: string;
  name: string;
  emoji: string;
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
  icon: string;
  category: string;
}

export const beregnere: BeregnerItem[] = [
  { title: "Løn efter skat", description: "Se hvad du får udbetalt efter skat, AM-bidrag og pension", href: "/loen-efter-skat", icon: "💰", category: "Økonomi" },
  { title: "Momsberegner", description: "Tillæg eller fratræk 25% moms nemt og hurtigt", href: "/moms", icon: "🧾", category: "Økonomi" },
  { title: "Valutaberegner", description: "Omregn mellem DKK, EUR, USD og andre valutaer", href: "/valuta", icon: "💱", category: "Økonomi" },
  { title: "Renteberegner", description: "Beregn ydelse, rente og tilbagebetaling på lån", href: "/renteberegner", icon: "📊", category: "Økonomi" },
  { title: "Opsparingsberegner", description: "Beregn renters rente og se din opsparing vokse", href: "/opsparing", icon: "📈", category: "Økonomi" },
  { title: "Feriepenge", description: "Beregn hvor meget du har til gode i feriepenge", href: "/feriepenge", icon: "🏖️", category: "Økonomi" },
  { title: "Dagpengeberegner", description: "Beregn hvad du kan få i dagpenge ved ledighed", href: "/dagpenge", icon: "📋", category: "Økonomi" },
  { title: "Pensionsberegner", description: "Beregn din fremtidige pension og folkepension", href: "/pension", icon: "🧓", category: "Økonomi" },
  { title: "Efterløn", description: "Beregn din efterløn og se hvornår du kan gå", href: "/efterloen", icon: "🏖️", category: "Økonomi" },
  { title: "Rentefradrag", description: "Beregn din skattebesparelse på rentefradrag", href: "/rentefradrag", icon: "🏦", category: "Økonomi" },
  { title: "Arveafgift", description: "Beregn bo- og tillægsafgift ved arv", href: "/arveafgift", icon: "📜", category: "Økonomi" },
  { title: "Aktieskat", description: "Beregn skat på aktiegevinst — frit depot vs. ASK", href: "/aktieskat", icon: "📈", category: "Økonomi" },
  { title: "Boligstøtte", description: "Beregn din boligstøtte til husleje", href: "/boligstoette", icon: "🏘️", category: "Bolig" },
  { title: "Husleje Budget", description: "Find ud af hvad du har råd til i husleje", href: "/husleje", icon: "🏠", category: "Bolig" },
  { title: "Boliglån", description: "Beregn ydelse og omkostninger på dit boliglån", href: "/boliglaan", icon: "🏡", category: "Bolig" },
  { title: "Ejendomsværdiskat", description: "Beregn ejendomsværdiskat og grundskyld 2026", href: "/ejendomsvaerdiskat", icon: "🏠", category: "Bolig" },
  { title: "Låneberegner", description: "Beregn ydelse, sammenlign lån og se afdragsplan", href: "/laaneberegner", icon: "🏦", category: "Lån" },
  { title: "Billån", description: "Beregn månedlig ydelse og rente på billån", href: "/billaan", icon: "🚗", category: "Lån" },
  { title: "Forbrugslån", description: "Beregn ydelse og ÅOP på forbrugslån", href: "/forbrugslaan", icon: "💳", category: "Lån" },
  { title: "BMI Beregner", description: "Beregn dit Body Mass Index og se om din vægt er sund", href: "/bmi", icon: "⚖️", category: "Sundhed" },
  { title: "Kalorieberegner", description: "Beregn dit daglige kaloriebehov og makroer", href: "/kalorier", icon: "🍎", category: "Sundhed" },
  { title: "Børnepenge", description: "Se hvad du kan få i børne- og ungeydelse 2026", href: "/boernepenge", icon: "👶", category: "Familie" },
  { title: "Barselsdagpenge", description: "Beregn barselsdagpenge og se orlovsperioder", href: "/barselsdagpenge", icon: "👶", category: "Familie" },
  { title: "SU Beregner", description: "Beregn din SU og fribeløb baseret på din situation", href: "/su", icon: "🎓", category: "Uddannelse" },
  { title: "Timeprisberegner", description: "Find din timepris som freelancer eller selvstændig", href: "/timepris", icon: "⏱️", category: "Erhverv" },
  { title: "Aldersberegner", description: "Beregn din præcise alder i år, måneder og dage", href: "/alder", icon: "🎂", category: "Hverdag" },
  { title: "Brændstofberegner", description: "Beregn pris for benzin, diesel eller el-bil", href: "/braendstof", icon: "⛽", category: "Hverdag" },
  { title: "Elberegner", description: "Beregn dit elforbrug og se hvad dine apparater koster", href: "/elberegner", icon: "⚡", category: "Hverdag" },
  { title: "Tidszoneberegner", description: "Se hvad klokken er i andre lande", href: "/tidszone", icon: "🌍", category: "Hverdag" },
  { title: "Bil Værdtab", description: "Beregn værdtab og omkostninger for din bil", href: "/bil", icon: "🚙", category: "Hverdag" },
  { title: "Procentberegner", description: "Beregn procent af et tal, stigning, fald og mere", href: "/procent", icon: "➗", category: "Matematik" },
  { title: "Kvadratmeterberegner", description: "Beregn areal af rum, haver og grunde", href: "/kvadratmeter", icon: "📐", category: "Matematik" },
  { title: "Datoberegner", description: "Beregn dage mellem datoer, arbejdsdage og alder", href: "/dato", icon: "📅", category: "Praktisk" },
  { title: "Tidsberegner", description: "Beregn timer og minutter mellem tidspunkter", href: "/tidsberegner", icon: "⏱️", category: "Praktisk" },
];

export const categories: CategoryData[] = [
  {
    slug: "oekonomi",
    name: "Økonomi",
    emoji: "💰",
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
    emoji: "🏠",
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
    emoji: "🏦",
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
    emoji: "❤️",
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
    emoji: "👨‍👩‍👧",
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
    emoji: "🎓",
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
    emoji: "💼",
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
    emoji: "☀️",
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
    emoji: "🔧",
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
    emoji: "📐",
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

export function getBeregnereByCategoryName(categoryName: string): BeregnerItem[] {
  return beregnere.filter((b) => b.category === categoryName);
}

export function getAllCategorySlugs(): string[] {
  return categories.map((c) => c.slug);
}
