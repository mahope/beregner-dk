import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Sådan finder du din timepris som freelancer | MinBeregner.dk",
  description:
    "Lær at beregne den rigtige timepris som freelancer. Trin-for-trin guide til at sætte en fair pris der dækker alle dine omkostninger.",
  keywords: [
    "freelancer timepris",
    "beregn timepris",
    "konsulent timepris",
    "hvad skal jeg tage i timen",
    "selvstændig timepris",
    "timepris guide",
  ],
  openGraph: {
    title: "Sådan finder du din timepris som freelancer",
    description: "Trin-for-trin guide til at sætte den rigtige timepris som freelancer.",
    url: `${baseUrl}/blog/saadan-finder-du-din-timepris-som-freelancer`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/saadan-finder-du-din-timepris-som-freelancer`,
  },
};

const faqItems = [
  {
    question: "Hvad er en normal timepris for en freelancer?",
    answer: "Det varierer meget efter branche: Webudviklere 600-1.200 kr, tekstforfattere 500-1.000 kr, konsulenter 800-1.500 kr. Erfaring og speciale påvirker prisen markant.",
  },
  {
    question: "Skal jeg lægge moms på min timepris?",
    answer: "Ja, hvis din omsætning overstiger 50.000 kr/år skal du momsregistreres og lægge 25% moms oveni. Ved B2B angives priser typisk ekskl. moms.",
  },
  {
    question: "Hvor mange timer kan jeg fakturere pr. måned?",
    answer: "Realistisk set 100-130 timer. Resten går til salg, administration, uddannelse og stille perioder.",
  },
];

export default function TimeprisGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">Timepris som freelancer</span>
      </nav>

      <article className="prose prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 font-medium">Erhverv</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Sådan finder du din timepris som freelancer
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>7. februar 2026</span>
            <span>•</span>
            <span>6 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          En af de sværeste beslutninger som ny freelancer er at sætte sin timepris. 
          For lav pris giver en dårlig indtjening, for høj pris kan skræmme kunder væk. 
          Her lærer du at finde den rigtige balance.
        </p>

        <h2>Hvorfor din timepris skal være højere end en fastansat</h2>
        <p>
          Mange nye freelancere tager deres tidligere timeløn og bruger den som timepris. 
          <strong>Det er en stor fejl.</strong> Som freelancer har du mange ekstra omkostninger:
        </p>
        <ul>
          <li><strong>Ingen betalt ferie</strong> - 5-6 uger = 10-12% af din tid</li>
          <li><strong>Ingen pension</strong> fra arbejdsgiver</li>
          <li><strong>Ingen løn under sygdom</strong></li>
          <li><strong>Software og udstyr</strong> - du betaler selv</li>
          <li><strong>Forsikringer</strong> - ansvar, erhverv, sundhed</li>
          <li><strong>Bogføring og revisor</strong></li>
          <li><strong>Administrativ tid</strong> - salg, mails, fakturering</li>
          <li><strong>Stille perioder</strong> uden opgaver</li>
        </ul>

        <h2>Trin-for-trin: Beregn din timepris</h2>

        <h3>Trin 1: Bestem din ønskede nettoløn</h3>
        <p>
          Start med hvad du vil have udbetalt hver måned. Vær realistisk - hvad har du 
          brug for til at leve det liv du ønsker?
        </p>
        <div className="bg-gray-50 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600">Eksempel: Ønsket nettoløn = 30.000 kr/måned</p>
        </div>

        <h3>Trin 2: Beregn bruttoløn</h3>
        <p>
          Som selvstændig betaler du ca. 45% i skat (AM-bidrag + indkomstskat). 
          Divider din ønskede nettoløn med 0,55:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono">30.000 ÷ 0,55 = 54.545 kr bruttoløn</p>
        </div>

        <h3>Trin 3: Tilføj driftsomkostninger</h3>
        <p>
          Læg dine månedlige erhvervsomkostninger til:
        </p>
        <ul>
          <li>Software: ~500 kr</li>
          <li>Telefon/internet: ~400 kr</li>
          <li>Forsikring: ~500 kr</li>
          <li>Bogføring: ~500 kr</li>
          <li>Diverse: ~500 kr</li>
        </ul>
        <div className="bg-gray-50 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono">54.545 + 2.400 = 56.945 kr/måned</p>
        </div>

        <h3>Trin 4: Beregn fakturerbare timer</h3>
        <p>
          Du kan ikke fakturere 37 timer om ugen. Regn med:
        </p>
        <ul>
          <li>47 arbejdsuger (5 uger ferie)</li>
          <li>-5% til sygdom og stille perioder</li>
          <li>-20% til administration, salg og uddannelse</li>
        </ul>
        <div className="bg-gray-50 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono">
            47 uger × 37 timer × 0,95 × 0,80 = 1.322 timer/år<br/>
            = ca. 110 fakturerbare timer/måned
          </p>
        </div>

        <h3>Trin 5: Beregn timepris</h3>
        <div className="bg-blue-50 p-4 rounded-lg not-prose my-6">
          <p className="font-mono text-lg">
            Timepris = Månedlig omsætning ÷ Fakturerbare timer<br/>
            = 56.945 ÷ 110 = <strong>518 kr/time</strong>
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-yellow-800">💡 Rund op!</p>
          <p className="text-yellow-700 text-sm mt-1">
            I praksis ville du runde op til 550 eller 600 kr for at have buffer. 
            Husk at dette er ekskl. moms - for virksomhedskunder tillægges 25%.
          </p>
        </div>

        <h2>Typiske timepriser i Danmark (2026)</h2>
        <div className="not-prose my-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Branche</th>
                <th className="text-right py-2">Junior</th>
                <th className="text-right py-2">Senior</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">Webudvikling</td>
                <td className="text-right">500-700 kr</td>
                <td className="text-right">800-1.400 kr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Grafisk design</td>
                <td className="text-right">400-600 kr</td>
                <td className="text-right">700-1.000 kr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Tekstforfatning</td>
                <td className="text-right">500-700 kr</td>
                <td className="text-right">800-1.200 kr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Marketing</td>
                <td className="text-right">500-800 kr</td>
                <td className="text-right">900-1.500 kr</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Konsulentarbejde</td>
                <td className="text-right">600-900 kr</td>
                <td className="text-right">1.000-2.000 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips til at hæve din timepris</h2>
        <ol>
          <li><strong>Specialiser dig</strong> - Eksperter kan tage mere</li>
          <li><strong>Dokumenter resultater</strong> - Vis hvad du har opnået</li>
          <li><strong>Hæv gradvist</strong> - 5-10% årligt for eksisterende kunder</li>
          <li><strong>Sælg værdi, ikke timer</strong> - Fokuser på resultater</li>
          <li><strong>Sig nej til lavbudget</strong> - Det sænker din gennemsnitspris</li>
        </ol>

        <h2>Brug vores timepris-beregner</h2>
        <p>
          Vil du have et mere præcist tal? Brug vores gratis beregner der tager 
          højde for alle dine specifikke forhold.
        </p>

        <div className="not-prose my-8">
          <Link 
            href="/timepris"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til timepris-beregneren →
          </Link>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link 
            href="/blog/hvordan-beregner-man-moms"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Hvordan beregner man moms? →</span>
          </Link>
          <Link 
            href="/blog/guide-til-laan-og-renter"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Guide til lån og renter →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
