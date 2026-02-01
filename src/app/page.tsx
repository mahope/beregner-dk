import Link from "next/link";
import type { Metadata } from "next";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "MinBeregner.dk - Gratis online beregnere til danskere",
  description:
    "Danmarks samling af gratis online beregnere. BMI beregner, løn efter skat, elberegner, feriepenge, børnepenge og SU. Helt gratis og uden login.",
  keywords: [
    "beregner",
    "online beregner",
    "gratis beregner",
    "dansk beregner",
    "bmi beregner",
    "lønberegner",
    "elberegner",
    "feriepenge beregner",
    "børnepenge beregner",
    "su beregner",
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
    title: "Renteberegner",
    description: "Beregn ydelse, rente og tilbagebetaling på lån",
    href: "/renteberegner",
    icon: "🏦",
    popular: true,
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
    title: "Procentberegner",
    description: "Beregn procent af et tal, stigning, fald og mere",
    href: "/procent",
    icon: "➗",
    popular: false,
    category: "Matematik",
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
    title: "Kalorieberegner",
    description: "Beregn dit daglige kaloriebehov og makroer",
    href: "/kalorier",
    icon: "🍎",
    popular: false,
    category: "Sundhed",
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
      "Vi har beregnere til BMI, løn efter skat, elforbrug, feriepenge, børnepenge og SU. Vi tilføjer løbende nye beregnere baseret på efterspørgsel.",
  },
];

export default function Home() {
  const popularBeregnere = beregnere.filter((b) => b.popular);
  const oevrigeBeregnere = beregnere.filter((b) => !b.popular);

  return (
    <div>
      <FAQSchema items={homeFaqItems} />

      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Gratis Online Beregnere
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Danmarks samling af nyttige beregnere til økonomi, sundhed og hverdag.
          Helt gratis og uden login — dine data gemmes ikke.
        </p>
      </section>

      {/* Popular calculators */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Populære beregnere</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularBeregnere.map((beregner) => (
            <Link
              key={beregner.href}
              href={beregner.href}
              className="group block p-6 bg-white rounded-xl shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{beregner.icon}</span>
                <div>
                  <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                    {beregner.category}
                  </span>
                  <h3 className="text-xl font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                    {beregner.title}
                  </h3>
                  <p className="text-gray-600 mt-2">{beregner.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Other calculators */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Flere beregnere</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {oevrigeBeregnere.map((beregner) => (
            <Link
              key={beregner.href}
              href={beregner.href}
              className="group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{beregner.icon}</span>
                <div>
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    {beregner.category}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 group-hover:text-blue-600 transition-colors">
                    {beregner.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {beregner.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Hvorfor bruge MinBeregner.dk?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🆓</div>
            <h3 className="font-semibold text-lg mb-2">100% Gratis</h3>
            <p className="text-gray-600">
              Alle beregnere er gratis at bruge. Ingen skjulte gebyrer eller
              premium-funktioner.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="font-semibold text-lg mb-2">Privat & Sikkert</h3>
            <p className="text-gray-600">
              Dine data gemmes ikke. Alle beregninger sker lokalt i din browser.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🇩🇰</div>
            <h3 className="font-semibold text-lg mb-2">Danske Satser</h3>
            <p className="text-gray-600">
              Opdateret med de nyeste danske satser og regler for 2026.
            </p>
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="prose max-w-none mb-16">
        <h2>Om MinBeregner.dk</h2>
        <p>
          MinBeregner.dk er din go-to ressource for gratis online beregnere. Vi
          har samlet de mest nyttige værktøjer til at hjælpe dig med at få
          overblik over din økonomi, sundhed og hverdag.
        </p>
        <p>
          Vores <Link href="/loen-efter-skat">lønberegner</Link> hjælper dig med
          at se, hvad du får udbetalt efter skat, mens vores{" "}
          <Link href="/bmi">BMI beregner</Link> giver dig indsigt i din sundhed.
          Med <Link href="/elberegner">elberegneren</Link> kan du se, hvad dine
          apparater koster i strøm.
        </p>
        <p>
          For forældre har vi en <Link href="/boernepenge">børnepenge beregner</Link> med
          2026-satser, og studerende kan bruge vores{" "}
          <Link href="/su">SU beregner</Link> til at tjekke fribeløb og satser.
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
