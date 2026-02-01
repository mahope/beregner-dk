import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "30% reglen: Hvor meget bør du bruge på husleje? | MinBeregner.dk",
  description:
    "Forstå 30% reglen for husleje. Lær hvordan du budgetterer din bolig korrekt baseret på din nettoindkomst.",
  keywords: [
    "30 procent reglen",
    "husleje budget",
    "hvor meget husleje",
    "hvad har jeg råd til i husleje",
    "boligbudget",
    "husleje nettoløn",
  ],
  openGraph: {
    title: "30% reglen: Hvor meget bør du bruge på husleje?",
    description: "Forstå 30% reglen og lær at budgettere din bolig korrekt.",
    url: `${baseUrl}/blog/30-procent-reglen-husleje`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/30-procent-reglen-husleje`,
  },
};

const faqItems = [
  {
    question: "Hvad er 30% reglen?",
    answer: "30% reglen siger, at din husleje (inkl. forbrugsudgifter) ikke bør overstige 30% af din nettoindkomst.",
  },
  {
    question: "Er 30% eller 33% den rigtige grænse?",
    answer: "30% er den konservative anbefaling, 33% er mere fleksibel. Vælg 30% for mere buffer til uforudsete udgifter.",
  },
  {
    question: "Hvad skal inkluderes i huslejeberegningen?",
    answer: "Inkluder grundleje, a conto varme/vand, el, internet og eventuel indboforsikring.",
  },
];

export default function HuslejeGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">30% reglen for husleje</span>
      </nav>

      <article className="prose prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 font-medium">Bolig</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            30% reglen: Hvor meget bør du bruge på husleje?
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>7. februar 2026</span>
            <span>•</span>
            <span>4 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          At finde den rigtige balance mellem husleje og andre udgifter er afgørende 
          for en sund økonomi. 30% reglen er en velafprøvet tommelfingerregel, der 
          kan hjælpe dig med at budgettere.
        </p>

        <h2>Hvad er 30% reglen?</h2>
        <p>
          30% reglen er en simpel tommelfingerregel: <strong>Din husleje bør max udgøre 
          30% af din nettoindkomst</strong>. Hvis du tjener 25.000 kr efter skat, bør din 
          husleje altså ikke overstige 7.500 kr.
        </p>

        <div className="bg-blue-50 p-4 rounded-lg not-prose my-6">
          <p className="font-mono text-lg">Max husleje = Nettoløn × 0,30</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: 28.000 kr × 0,30 = 8.400 kr max husleje
          </p>
        </div>

        <h2>Hvorfor lige 30%?</h2>
        <p>
          30% giver plads til andre nødvendige udgifter:
        </p>
        <ul>
          <li><strong>~30%</strong> til husleje og boligudgifter</li>
          <li><strong>~30%</strong> til forbrug (mad, transport, tøj)</li>
          <li><strong>~20%</strong> til opsparing og gæld</li>
          <li><strong>~20%</strong> til fritid og uforudsete udgifter</li>
        </ul>

        <h2>Hvad skal du inkludere i "husleje"?</h2>
        <p>
          Når du beregner dine boligudgifter, skal du inkludere alle relaterede omkostninger:
        </p>
        <ul>
          <li>Grundleje/husleje</li>
          <li>A conto varme og vand</li>
          <li>Elektricitet</li>
          <li>Internet (og evt. TV)</li>
          <li>Indboforsikring</li>
          <li>Evt. parkering</li>
        </ul>

        <div className="bg-green-50 border border-green-200 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-green-800">✅ Eksempel på boligbudget</p>
          <div className="text-green-700 text-sm mt-2 space-y-1">
            <p>Husleje: 6.500 kr</p>
            <p>A conto varme/vand: 500 kr</p>
            <p>El: 400 kr</p>
            <p>Internet: 300 kr</p>
            <p>Forsikring: 150 kr</p>
            <p className="font-bold pt-2 border-t border-green-300">Total: 7.850 kr</p>
          </div>
        </div>

        <h2>Hvornår kan du bruge mere end 30%?</h2>
        <p>
          30% er en rettesnor, ikke en absolut regel. Du kan overskride den hvis:
        </p>
        <ul>
          <li>Du har meget lave øvrige udgifter (ingen bil, lav gæld)</li>
          <li>Du bor i et dyrt område med høje lønninger</li>
          <li>Du har stabil indkomst og stor opsparing</li>
          <li>Du prioriterer boligen højt og sparer andre steder</li>
        </ul>

        <h2>Hvornår bør du bruge mindre end 30%?</h2>
        <ul>
          <li>Du har høj gæld der skal afdrages</li>
          <li>Din indkomst er usikker (freelance, provision)</li>
          <li>Du sparer op til noget stort (bolig, uddannelse)</li>
          <li>Du har høje andre faste udgifter (bil, børn)</li>
        </ul>

        <h2>Tips til at finde en billigere bolig</h2>
        <ol>
          <li><strong>Delelejlighed</strong> - Halver (næsten) udgifterne</li>
          <li><strong>Udenfor centrum</strong> - Lavere priser i forstæder</li>
          <li><strong>Almene boliger</strong> - Skriv dig op i boligforeninger</li>
          <li><strong>Mindre kvadratmeter</strong> - Har du virkelig brug for 70m²?</li>
          <li><strong>Forhandl</strong> - Nogen huslejer kan forhandles</li>
        </ol>

        <h2>Brug vores husleje-beregner</h2>
        <p>
          Vil du vide præcis, hvad du kan bruge på husleje? Brug vores gratis 
          beregner, der tager højde for alle dine udgifter.
        </p>

        <div className="not-prose my-8">
          <Link 
            href="/husleje"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til husleje-beregneren →
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
