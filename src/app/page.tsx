import Link from "next/link";
import type { Metadata } from "next";
import { FAQSchema } from "@/components/StructuredData";
import SearchBar from "@/components/SearchBar";
import { getTrendingHrefs } from "@/lib/trending";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "MinBeregner.dk - Gratis online beregnere til danskere",
  description:
    "Danmarks samling af gratis online beregnere. Beregn løn efter skat, moms, lån, pension, feriepenge, BMI og meget mere. 33+ beregnere med 2026-satser — helt gratis og uden login.",
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
  openGraph: {
    title: "MinBeregner.dk - Gratis online beregnere",
    description:
      "Danmarks samling af gratis beregnere til økonomi, sundhed og hverdag.",
    url: baseUrl,
    type: "website",
  },
  alternates: {
    canonical: baseUrl,
  },
};

const beregnere = [
  {
    title: "Løn efter skat",
    description: "Se hvad du får udbetalt efter skat, AM-bidrag og pension",
    href: "/loen-efter-skat",
    icon: "💰",
    popular: true,
    category: "Økonomi",
  },
  {
    title: "BMI Beregner",
    description: "Beregn dit Body Mass Index og se om din vægt er sund",
    href: "/bmi",
    icon: "⚖️",
    popular: true,
    category: "Sundhed",
  },
  {
    title: "Låneberegner",
    description: "Beregn ydelse, sammenlign lån og se afdragsplan",
    href: "/laaneberegner",
    icon: "🏦",
    popular: true,
    category: "Økonomi",
  },
  {
    title: "Momsberegner",
    description: "Tillæg eller fratræk 25% moms nemt og hurtigt",
    href: "/moms",
    icon: "🧾",
    popular: true,
    category: "Økonomi",
  },
  {
    title: "Valutaberegner",
    description: "Omregn mellem DKK, EUR, USD og andre valutaer",
    href: "/valuta",
    icon: "💱",
    popular: true,
    category: "Økonomi",
  },
  {
    title: "Procentberegner",
    description: "Beregn procent af et tal, stigning, fald og mere",
    href: "/procent",
    icon: "➗",
    popular: true,
    category: "Matematik",
  },
  {
    title: "Renteberegner",
    description: "Beregn ydelse, rente og tilbagebetaling på lån",
    href: "/renteberegner",
    icon: "📊",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Opsparingsberegner",
    description: "Beregn renters rente og se din opsparing vokse",
    href: "/opsparing",
    icon: "📈",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Kvadratmeterberegner",
    description: "Beregn areal af rum, haver og grunde",
    href: "/kvadratmeter",
    icon: "📐",
    popular: false,
    category: "Matematik",
  },
  {
    title: "Aldersberegner",
    description: "Beregn din præcise alder i år, måneder og dage",
    href: "/alder",
    icon: "🎂",
    popular: false,
    category: "Hverdag",
  },
  {
    title: "Timeprisberegner",
    description: "Find din timepris som freelancer eller selvstændig",
    href: "/timepris",
    icon: "⏱️",
    popular: false,
    category: "Erhverv",
  },
  {
    title: "Brændstofberegner",
    description: "Beregn pris for benzin, diesel eller el-bil",
    href: "/braendstof",
    icon: "⛽",
    popular: false,
    category: "Hverdag",
  },
  {
    title: "Elberegner",
    description: "Beregn dit elforbrug og se hvad dine apparater koster",
    href: "/elberegner",
    icon: "⚡",
    popular: false,
    category: "Hverdag",
  },
  {
    title: "Feriepenge",
    description: "Beregn hvor meget du har til gode i feriepenge",
    href: "/feriepenge",
    icon: "🏖️",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Børnepenge",
    description: "Se hvad du kan få i børne- og ungeydelse 2026",
    href: "/boernepenge",
    icon: "👶",
    popular: false,
    category: "Familie",
  },
  {
    title: "SU Beregner",
    description: "Beregn din SU og fribeløb baseret på din situation",
    href: "/su",
    icon: "🎓",
    popular: false,
    category: "Uddannelse",
  },
  {
    title: "Dagpengeberegner",
    description: "Beregn hvad du kan få i dagpenge ved ledighed",
    href: "/dagpenge",
    icon: "📋",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Boligstøtte",
    description: "Beregn din boligstøtte til husleje",
    href: "/boligstoette",
    icon: "🏘️",
    popular: false,
    category: "Bolig",
  },
  {
    title: "Kalorieberegner",
    description: "Beregn dit daglige kaloriebehov og makroer",
    href: "/kalorier",
    icon: "🍎",
    popular: false,
    category: "Sundhed",
  },
  {
    title: "Datoberegner",
    description: "Beregn dage mellem datoer, arbejdsdage og alder",
    href: "/dato",
    icon: "📅",
    popular: false,
    category: "Praktisk",
  },
  {
    title: "Husleje Budget",
    description: "Find ud af hvad du har råd til i husleje",
    href: "/husleje",
    icon: "🏠",
    popular: false,
    category: "Bolig",
  },
  {
    title: "Tidszoneberegner",
    description: "Se hvad klokken er i andre lande",
    href: "/tidszone",
    icon: "🌍",
    popular: false,
    category: "Hverdag",
  },
  {
    title: "Tidsberegner",
    description: "Beregn timer og minutter mellem tidspunkter",
    href: "/tidsberegner",
    icon: "⏱️",
    popular: false,
    category: "Praktisk",
  },
  {
    title: "Pensionsberegner",
    description: "Beregn din fremtidige pension og folkepension",
    href: "/pension",
    icon: "🧓",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Efterløn",
    description: "Beregn din efterløn og se hvornår du kan gå",
    href: "/efterloen",
    icon: "🏖️",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Barselsdagpenge",
    description: "Beregn barselsdagpenge og se orlovsperioder",
    href: "/barselsdagpenge",
    icon: "👶",
    popular: false,
    category: "Familie",
  },
  {
    title: "Boliglån",
    description: "Beregn ydelse og omkostninger på dit boliglån",
    href: "/boliglaan",
    icon: "🏡",
    popular: false,
    category: "Bolig",
  },
  {
    title: "Billån",
    description: "Beregn månedlig ydelse og rente på billån",
    href: "/billaan",
    icon: "🚗",
    popular: false,
    category: "Lån",
  },
  {
    title: "Forbrugslån",
    description: "Beregn ydelse og ÅOP på forbrugslån",
    href: "/forbrugslaan",
    icon: "💳",
    popular: false,
    category: "Lån",
  },
  {
    title: "Rentefradrag",
    description: "Beregn din skattebesparelse på rentefradrag",
    href: "/rentefradrag",
    icon: "🏦",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Ejendomsværdiskat",
    description: "Beregn ejendomsværdiskat og grundskyld 2026",
    href: "/ejendomsvaerdiskat",
    icon: "🏠",
    popular: false,
    category: "Bolig",
  },
  {
    title: "Arveafgift",
    description: "Beregn bo- og tillægsafgift ved arv",
    href: "/arveafgift",
    icon: "📜",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Aktieskat",
    description: "Beregn skat på aktiegevinst — frit depot vs. ASK",
    href: "/aktieskat",
    icon: "📈",
    popular: false,
    category: "Økonomi",
  },
  {
    title: "Bil Værdtab",
    description: "Beregn værdtab og omkostninger for din bil",
    href: "/bil",
    icon: "🚙",
    popular: false,
    category: "Hverdag",
  },
];

const homeFaqItems = [
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
      "Vi har 33+ beregnere til økonomi (løn, skat, pension, dagpenge, feriepenge, moms), bolig (boliglån, ejendomsværdiskat, boligstøtte), lån (billån, forbrugslån, renteberegner), sundhed (BMI, kalorier) og hverdag (el, brændstof, dato). Vi tilføjer løbende nye beregnere.",
  },
];

const categoryOrder = [
  { key: "Økonomi", emoji: "💰" },
  { key: "Bolig", emoji: "🏠" },
  { key: "Lån", emoji: "🏦" },
  { key: "Sundhed", emoji: "❤️" },
  { key: "Familie", emoji: "👨‍👩‍👧" },
  { key: "Uddannelse", emoji: "🎓" },
  { key: "Erhverv", emoji: "💼" },
  { key: "Hverdag", emoji: "☀️" },
  { key: "Praktisk", emoji: "🔧" },
  { key: "Matematik", emoji: "📐" },
];

export default function Home() {
  const trendingHrefs = getTrendingHrefs();
  const popularBeregnere = beregnere.filter((b) => b.popular);
  const oevrigeBeregnere = beregnere.filter((b) => !b.popular);

  // Group non-popular by category
  const grouped = new Map<string, typeof beregnere>();
  for (const b of oevrigeBeregnere) {
    const list = grouped.get(b.category) || [];
    list.push(b);
    grouped.set(b.category, list);
  }

  // Search bar needs flat list
  const searchData = beregnere.map(({ title, description, href, icon, category }) => ({
    title,
    description,
    href,
    icon,
    category,
  }));

  return (
    <div>
      <FAQSchema items={homeFaqItems} />

      {/* Hero */}
      <section className="-mx-4 px-4 pt-4 pb-12 mb-12 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Gratis Online Beregnere
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            33+ gratis beregnere til økonomi, bolig, skat, sundhed og hverdag.
            Opdateret med 2026-satser — helt gratis og uden login.
          </p>
          <SearchBar beregnere={searchData} />
        </div>
      </section>

      {/* Trust signals */}
      <section className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 text-center">
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">33+</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Gratis beregnere</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">2026</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Opdaterede satser</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">0 kr.</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Ingen login eller betaling</div>
        </div>
        <div>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Privat — data gemmes ikke</div>
        </div>
      </section>

      {/* Popular calculators */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Populære beregnere</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
          {popularBeregnere.map((beregner) => {
            const isTrending = trendingHrefs.includes(beregner.href);
            return (
              <Link
                key={beregner.href}
                href={beregner.href}
                className="group relative block p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all"
              >
                {isTrending && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full shadow">
                    Trending
                  </span>
                )}
                <div className="text-center">
                  <span className="text-5xl block mb-3">{beregner.icon}</span>
                  <span className="inline-block text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full mb-2">
                    {beregner.category}
                  </span>
                  <h3 className="text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-white transition-colors">
                    {beregner.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    {beregner.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Categorized sections */}
      {categoryOrder.map(({ key, emoji }) => {
        const items = grouped.get(key);
        if (!items || items.length === 0) return null;
        return (
          <section key={key} className="mb-12">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              {emoji} {key}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((beregner) => {
                const isTrending = trendingHrefs.includes(beregner.href);
                return (
                  <Link
                    key={beregner.href}
                    href={beregner.href}
                    className="group relative flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-transparent hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                  >
                    <span className="text-3xl flex-shrink-0">{beregner.icon}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 dark:text-white transition-colors truncate">
                        {beregner.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm truncate">
                        {beregner.description}
                      </p>
                    </div>
                    {isTrending && (
                      <span className="flex-shrink-0 bg-orange-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        Trending
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center dark:text-white">
          Hvorfor bruge MinBeregner.dk?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🆓</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">100% Gratis</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Alle beregnere er gratis at bruge. Ingen skjulte gebyrer eller
              premium-funktioner.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Privat & Sikkert</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Dine data gemmes ikke. Alle beregninger sker lokalt i din browser.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🇩🇰</div>
            <h3 className="font-semibold text-lg mb-2 dark:text-white">Danske Satser</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Opdateret med de nyeste danske satser og regler for 2026.
            </p>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="prose dark:prose-invert max-w-none mb-16">
        <h2>Om MinBeregner.dk — Danmarks gratis beregnerportal</h2>
        <p>
          MinBeregner.dk samler over 33 gratis online beregnere til danskere. Alle beregnere er
          opdateret med de nyeste satser og regler for 2026, og beregningerne sker lokalt i din
          browser — vi gemmer ingen persondata. Uanset om du skal beregne løn efter skat, finde ud
          af hvad du kan få i pension, eller regne moms ud, finder du det hele her.
        </p>

        <h2>Økonomi og skat</h2>
        <p>
          Vores mest brugte beregner er <Link href="/loen-efter-skat">løn efter skat</Link>, hvor du
          kan se hvad du får udbetalt efter AM-bidrag, kommuneskat, bundskat og eventuelt topskat.
          Beregneren er opdateret med 2026-skattesatserne, herunder det nye mellemskat-trin.
          Du kan også bruge vores <Link href="/moms">momsberegner</Link> til hurtigt at tillægge
          eller fratrække 25% moms, og <Link href="/procent">procentberegneren</Link> til
          at beregne procent af et tal, procentvis stigning og fald.
        </p>
        <p>
          Til skatteoptimering har vi en <Link href="/rentefradrag">rentefradrag-beregner</Link> der
          viser din skattebesparelse, og en <Link href="/arveafgift">arveafgift-beregner</Link> med
          de korrekte satser for boafgift (15%) og tillægsafgift (25%).
        </p>

        <h2>Pension, dagpenge og offentlige ydelser</h2>
        <p>
          Planlæg din fremtid med vores <Link href="/pension">pensionsberegner</Link>. Se hvad du
          kan forvente i folkepension, arbejdsmarkedspension og privat opsparing. Overvejer du at
          trække dig tidligt tilbage? Vores <Link href="/efterloen">efterlønsberegner</Link> viser
          din sats baseret på 2026-reglerne.
        </p>
        <p>
          Er du ledig, kan du bruge <Link href="/dagpenge">dagpengeberegneren</Link> til at se din
          dagpengesats. Forældre finder <Link href="/barselsdagpenge">barselsdagpenge-beregneren</Link> nyttig
          til at planlægge økonomi under barsel, og <Link href="/boernepenge">børnepenge-beregneren</Link> viser
          de aktuelle satser for børne- og ungeydelse. Studerende kan bruge vores{" "}
          <Link href="/su">SU beregner</Link> til at tjekke satser og fribeløb, og{" "}
          <Link href="/feriepenge">feriepenge-beregneren</Link> viser hvad du får udbetalt i ferie.
        </p>

        <h2>Bolig og lån</h2>
        <p>
          Skal du købe bolig? Start med vores <Link href="/boliglaan">boliglåns-beregner</Link> for
          at se ydelsen på dit lån, og brug <Link href="/ejendomsvaerdiskat">ejendomsværdiskat-beregneren</Link> til
          at beregne din årlige boligskat med det nye 2024-system (5,1‰ / 14‰ af vurderingen).
          Lejer du, kan du tjekke om du har ret til <Link href="/boligstoette">boligstøtte</Link> med
          vores beregner, eller bruge <Link href="/husleje">huslejebudget-beregneren</Link> til at
          finde ud af hvad du har råd til.
        </p>
        <p>
          Vi har også specialiserede låneberegnere: <Link href="/laaneberegner">generel låneberegner</Link>,{" "}
          <Link href="/billaan">billån</Link>, <Link href="/forbrugslaan">forbrugslån</Link> og{" "}
          <Link href="/renteberegner">renteberegner</Link> med afdragsplaner. Med{" "}
          <Link href="/opsparing">opsparingsberegneren</Link> kan du se hvordan renters rente får
          din opsparing til at vokse over tid.
        </p>

        <h2>Sundhed og krop</h2>
        <p>
          Vores <Link href="/bmi">BMI beregner</Link> giver dig indblik i dit Body Mass Index og
          om din vægt er sund. Kombiner den med <Link href="/kalorier">kalorieberegneren</Link> for
          at se dit daglige kaloriebehov baseret på alder, køn og aktivitetsniveau.
        </p>

        <h2>Hverdag og praktisk</h2>
        <p>
          Med <Link href="/elberegner">elberegneren</Link> kan du se hvad dine apparater koster i
          strøm, og <Link href="/braendstof">brændstofberegneren</Link> hjælper dig med at beregne
          transportomkostninger. <Link href="/bil">Bil værdtab-beregneren</Link> viser hvad din bil
          koster at eje over tid. Til planlægning har vi en <Link href="/dato">datoberegner</Link>,{" "}
          <Link href="/alder">aldersberegner</Link>, <Link href="/tidsberegner">tidsberegner</Link>,{" "}
          <Link href="/tidszone">tidszoneberegner</Link> og <Link href="/valuta">valutaberegner</Link>.
          Selvstændige og freelancere finder vores <Link href="/timepris">timeprisberegner</Link> nyttig
          til at fastsætte den rette pris.
        </p>

        <h2>Ofte stillede spørgsmål</h2>
        {homeFaqItems.map((item, index) => (
          <div key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
