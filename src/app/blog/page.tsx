import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Blog - Guides og tips | MinBeregner.dk",
    description:
      "Læs vores guides om økonomi, beregninger og privatøkonomi. Lær hvordan du beregner moms, finder den rigtige husleje, og meget mere.",
    keywords: [
      "økonomi guide",
      "privatøkonomi tips",
      "beregning guide",
      "moms guide",
      "husleje tips",
      "lån guide",
    ],
    openGraph: {
      title: "Blog - Guides og tips | MinBeregner.dk",
      description: "Guides og tips om økonomi og beregninger.",
      url: `${baseUrl}/blog`,
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/blog`,
    },
  };
}

const blogPosts = [
  {
    slug: "skat-2026-alt-du-skal-vide",
    title: "Skat 2026: Alt du skal vide om skatteændringer",
    description: "Komplet overblik over skat i 2026: Nye satser for personfradrag, topskat, AM-bidrag, kommuneskat og beskæftigelsesfradrag.",
    category: "Økonomi & Skat",
    date: "2026-02-17",
    readTime: "8 min",
  },
  {
    slug: "su-2026-satser-og-regler",
    title: "SU 2026: Nye satser og regler for studerende",
    description: "Komplet guide til SU i 2026: Satser for hjemmeboende og udeboende, fribeløb, SU-lån og nye regler.",
    category: "Uddannelse & Økonomi",
    date: "2026-02-17",
    readTime: "8 min",
  },
  {
    slug: "dagpenge-saadan-finder-du-din-sats",
    title: "Dagpenge 2026: Sådan finder du din dagpengesats",
    description: "Komplet guide til dagpenge i 2026: Max dagpengesats, beregningsgrundlag, krav til optjening og dimittendsats.",
    category: "Arbejde & Dagpenge",
    date: "2026-02-17",
    readTime: "7 min",
  },
  {
    slug: "boliglaan-2026-renter-og-afdrag",
    title: "Boliglån 2026: Renter, afdrag og hvad du har råd til",
    description: "Komplet guide til boliglån i 2026: Aktuelle renter, realkreditlån vs. banklån, fast vs. variabel rente.",
    category: "Bolig & Lån",
    date: "2026-02-17",
    readTime: "9 min",
  },
  {
    slug: "fradrag-2026-komplet-guide",
    title: "Fradrag 2026: Komplet guide til skattefradrag",
    description: "Overblik over alle skattefradrag i 2026: Rentefradrag, kørselsfradrag, håndværkerfradrag, fagforening og mere.",
    category: "Økonomi & Skat",
    date: "2026-02-17",
    readTime: "8 min",
  },
  {
    slug: "barsel-2026-regler-og-satser",
    title: "Barsel 2026: Nye regler for barselsdagpenge og orlov",
    description: "Komplet guide til barsel i 2026: Øremærket barsel, barselsdagpenge-satser, orlovsperioder for mor og far.",
    category: "Familie & Barsel",
    date: "2026-02-17",
    readTime: "8 min",
  },
  {
    slug: "arveafgift-regler-og-satser",
    title: "Arveafgift i Danmark: Regler, satser og eksempler",
    description: "Komplet guide til arveafgift (boafgift) i 2026: Bundfradrag, satser, tillægsafgift og beregningseksempler.",
    category: "Arv & Økonomi",
    date: "2026-02-17",
    readTime: "8 min",
  },
  {
    slug: "elpriser-2026-beregn-dit-forbrug",
    title: "Elpriser 2026: Sådan beregner du dit elforbrug",
    description: "Guide til elpriser i 2026: Hvad koster strøm, gennemsnitligt forbrug og 10 tips til at spare på strømmen.",
    category: "Energi & Forbrug",
    date: "2026-02-17",
    readTime: "7 min",
  },
  {
    slug: "privatoekonomi-for-unge",
    title: "Privatøkonomi for unge: 5 beregnere du skal kende",
    description: "Guide til privatøkonomi for unge: SU-beregning, budget, husleje, opsparing og skat med gratis beregnere.",
    category: "Privatøkonomi",
    date: "2026-02-17",
    readTime: "7 min",
  },
  {
    slug: "koeb-af-bolig-2026-omkostninger",
    title: "Køb af bolig 2026: Alle omkostninger du skal kende",
    description: "Komplet guide til boligkøb i 2026: Tinglysningsafgift, advokat, udbetaling, ejendomsværdiskat og skjulte omkostninger.",
    category: "Bolig & Økonomi",
    date: "2026-02-17",
    readTime: "9 min",
  },
  {
    slug: "pension-hvor-meget-skal-du-spare-op",
    title: "Pension: Hvor Meget Skal Du Spare Op?",
    description: "Komplet guide til pensionsopsparing i 2026: Tommelfingerregler, de tre pensionssøjler, og hvor meget du faktisk har brug for.",
    category: "Pension & Opsparing",
    date: "2026-02-13",
    readTime: "10 min",
  },
  {
    slug: "boligstoette-2026-nye-regler",
    title: "Boligstøtte 2026 - Nye Regler og Satser",
    description: "Komplet guide til boligstøtte i 2026: Nye satser, ændrede regler, hvem kan få støtte og hvor meget. Se de opdaterede grænser.",
    category: "Bolig & Økonomi",
    date: "2026-02-13",
    readTime: "9 min",
  },
  {
    slug: "bmi-for-boern-saadan-tjekker-du",
    title: "BMI for Børn - Sådan Tjekker Du",
    description: "BMI for børn beregnes anderledes end voksne. Lær om percentiler, ISO BMI, og hvordan du tjekker dit barns vægt sundt. Inkl. tabeller.",
    category: "Sundhed & Børn",
    date: "2026-02-13",
    readTime: "9 min",
  },
  {
    slug: "guide-feriepenge-hvornaar-og-hvor-meget",
    title: "Guide: Feriepenge - Hvornår og Hvor Meget?",
    description: "Komplet guide til feriepenge i 2026: Hvornår får du dem udbetalt? Hvor meget får du? Lær om ferieåret og samtidighedsferie.",
    category: "Løn & Ferie",
    date: "2026-02-13",
    readTime: "8 min",
  },
  {
    slug: "saadan-beregner-du-din-reelle-timeloen",
    title: "Sådan beregner du din reelle timeløn",
    description: "Lær at beregne din faktiske timeløn inkl. pension, frokost, ferie og andre goder. Se hvad du virkelig tjener per time.",
    category: "Løn & Økonomi",
    date: "2026-02-13",
    readTime: "7 min",
  },
  {
    slug: "hvordan-beregner-man-moms",
    title: "Hvordan beregner man moms? En komplet guide",
    description: "Lær alt om dansk moms: Hvordan du tillægger og fratrækker 25% moms, og hvornår du skal gøre hvad.",
    category: "Økonomi",
    date: "2026-02-07",
    readTime: "5 min",
  },
  {
    slug: "30-procent-reglen-husleje",
    title: "30% reglen: Hvor meget bør du bruge på husleje?",
    description: "Forstå den klassiske tommelfingerregel for husleje og lær hvordan du budgetterer din bolig korrekt.",
    category: "Bolig",
    date: "2026-02-07",
    readTime: "4 min",
  },
  {
    slug: "saadan-finder-du-din-timepris-som-freelancer",
    title: "Sådan finder du din timepris som freelancer",
    description: "En trin-for-trin guide til at beregne den rigtige timepris, så du får en fair løn som selvstændig.",
    category: "Erhverv",
    date: "2026-02-07",
    readTime: "6 min",
  },
  {
    slug: "guide-til-laan-og-renter",
    title: "Guide til lån og renter: Forstå hvad du betaler",
    description: "Alt hvad du skal vide om lån: Annuitetslån, serielån, ÅOP og hvordan du sammenligner lån korrekt.",
    category: "Økonomi",
    date: "2026-02-07",
    readTime: "7 min",
  },
  {
    slug: "spar-penge-paa-braendstof",
    title: "Spar penge på brændstof: Tips til billigere kørsel",
    description: "Praktiske tips til at reducere dit brændstofforbrug og spare penge på benzin, diesel eller el.",
    category: "Transport",
    date: "2026-02-07",
    readTime: "5 min",
  },
  {
    slug: "biloekonomi-2026-hvad-koster-det-at-eje-bil",
    title: "Biløkonomi 2026: Hvad koster det at eje bil?",
    description: "Komplet guide til biløkonomi: Registreringsafgift, grøn ejerafgift, forsikring, brændstof, værditab og finansiering. Få det fulde overblik.",
    category: "Transport & Økonomi",
    date: "2026-08-23",
    readTime: "10 min",
  },
  {
    slug: "leasing-af-bil-2026-pris-og-guide",
    title: "Leasing af bil 2026: Pris, fordele, ulemper og guide",
    description: "Komplet guide til leasing af bil i 2026: Privat leasing vs. billån, typiske priser, fordele og ulemper, km-grænser og hvordan du finder det bedste tilbud.",
    category: "Transport & Økonomi",
    date: "2026-08-23",
    readTime: "9 min",
  },
  {
    slug: "maanedsbudget-2026-komplet-guide",
    title: "Månedsbudget 2026: Komplet guide til privatøkonomi",
    description: "Komplet guide til at lave et månedsbudget i 2026: Faste og variable udgifter, 50/30/20-reglen, tommelfingerregler og gratis budgetberegner.",
    category: "Privatøkonomi",
    date: "2026-08-24",
    readTime: "10 min",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Blog</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Guides, tips og artikler om økonomi, beregninger og privatøkonomi.
        </p>
      </div>

      <div className="grid gap-6">
        {blogPosts.map((post) => (
          <article 
            key={post.slug}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{post.category}</span>
                  <h2 className="text-xl font-semibold mt-1 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{post.description}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime} læsetid</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Brug vores beregnere</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Vi har 33+ gratis beregnere til økonomi, sundhed og hverdag.
        </p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Se alle beregnere
        </Link>
      </div>
    </div>
  );
}
