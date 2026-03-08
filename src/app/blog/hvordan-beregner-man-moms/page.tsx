import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Hvordan beregner man moms? En komplet guide | MinBeregner.dk",
    description:
      "Lær alt om dansk moms: Hvordan du tillægger og fratrækker 25% moms, hvornår du skal momsregistreres, og hvad der er momsfrit.",
    keywords: [
      "beregn moms",
      "hvordan beregner man moms",
      "tillæg moms",
      "fratræk moms",
      "25% moms",
      "moms guide",
      "momsberegning",
    ],
    openGraph: {
      title: "Hvordan beregner man moms? En komplet guide",
      description: "Lær alt om dansk moms: Tillæg, fratræk og beregn 25% moms korrekt.",
      url: `${baseUrl}/blog/hvordan-beregner-man-moms`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/hvordan-beregner-man-moms`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er den danske momssats?",
    answer: "Den danske momssats er 25%. Det er en af de højeste i verden.",
  },
  {
    question: "Hvordan beregner jeg moms af et beløb?",
    answer: "For at tillægge moms: Gang med 1,25. For at fratrække moms: Divider med 1,25.",
  },
  {
    question: "Hvornår skal jeg momsregistreres?",
    answer: "Virksomheder med årlig omsætning over 50.000 kr skal momsregistreres.",
  },
];

export default function MomsGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">Hvordan beregner man moms?</span>
      </nav>

      {/* Article header */}
      <article className="prose prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 font-medium">Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Hvordan beregner man moms? En komplet guide
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>7. februar 2026</span>
            <span>•</span>
            <span>5 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Moms (merværdiafgift) er en afgift på 25% der lægges på næsten alle varer og 
          tjenesteydelser i Danmark. I denne guide lærer du, hvordan du beregner moms korrekt.
        </p>

        <h2>Hvad er moms?</h2>
        <p>
          Moms er en forbrugsafgift, der opkræves af virksomheder og betales til staten. 
          Slutforbrugeren betaler momsen som en del af prisen, mens momsregistrerede 
          virksomheder kan trække momsen fra på deres indkøb.
        </p>
        <p>
          Den danske momssats er <strong>25%</strong>, hvilket gør den til en af de 
          højeste i verden. Til sammenligning har de fleste EU-lande satser mellem 17-27%.
        </p>

        <h2>Sådan beregner du moms</h2>
        
        <h3>Tillæg moms til en pris</h3>
        <p>
          Når du har en pris uden moms og vil finde prisen inkl. moms:
        </p>
        <div className="bg-blue-50 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Pris inkl. moms = Pris uden moms × 1,25</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: 800 kr × 1,25 = 1.000 kr inkl. moms
          </p>
        </div>

        <h3>Fratræk moms fra en pris</h3>
        <p>
          Når du har en pris inkl. moms og vil finde prisen uden moms:
        </p>
        <div className="bg-blue-50 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Pris uden moms = Pris inkl. moms ÷ 1,25</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: 1.000 kr ÷ 1,25 = 800 kr uden moms
          </p>
        </div>

        <h3>Find momsbeløbet</h3>
        <p>
          Når du vil finde selve momsbeløbet i en pris inkl. moms:
        </p>
        <div className="bg-blue-50 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Moms = Pris inkl. moms - (Pris inkl. moms ÷ 1,25)</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: 1.000 kr - 800 kr = 200 kr i moms
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-yellow-800">💡 Vigtig pointe</p>
          <p className="text-yellow-700 text-sm mt-1">
            Momsandelen i en pris inkl. moms er <strong>20%</strong> (ikke 25%). 
            Det skyldes at 200 kr af 1.000 kr er 20%. Momsen beregnes af prisen 
            <em>uden</em> moms, ikke af totalen. Forvirret over procenter? Brug vores{" "}
            <Link href="/procent" className="text-blue-600 hover:underline">procentberegner</Link>.
          </p>
        </div>

        <h2>Momsregistrering for virksomheder</h2>
        <p>
          Virksomheder med en årlig omsætning over <strong>50.000 kr</strong> skal 
          momsregistreres hos SKAT. Er du freelancer? Læs vores{" "}
          <Link href="/blog/saadan-finder-du-din-timepris-som-freelancer" className="text-blue-600 hover:underline">guide til timepris</Link>{" "}
          og brug <Link href="/timepris" className="text-blue-600 hover:underline">timepris-beregneren</Link>.
          Som momsregistreret virksomhed:
        </p>
        <ul>
          <li>Opkræver du moms af dit salg (salgsmoms)</li>
          <li>Kan du trække moms fra på erhvervsmæssige indkøb (købsmoms)</li>
          <li>Afregner du forskellen med SKAT (typisk kvartalsvis)</li>
        </ul>

        <h2>Moms vs. indkomstskat</h2>
        <p>
          Moms er ikke det samme som indkomstskat. Moms betales af forbrugeren på varer/ydelser, 
          mens indkomstskat trækkes af din løn. Vil du se hvor meget du får udbetalt efter skat? 
          Brug vores <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">løn efter skat beregner</Link>.
        </p>

        <h2>Hvad er momsfrit?</h2>
        <p>
          Ikke alle varer og ydelser er momspligtige. Følgende er momsfritaget i Danmark:
        </p>
        <ul>
          <li><strong>Sundhedsydelser</strong> - læge, tandlæge, fysioterapi</li>
          <li><strong>Uddannelse</strong> - skoler, kurser, undervisning</li>
          <li><strong>Finansielle ydelser</strong> - bank, forsikring, værdipapirer</li>
          <li><strong>Fast ejendom</strong> - salg og udlejning (med undtagelser)</li>
          <li><strong>Personbefordring</strong> - bus, tog, taxi</li>
          <li><strong>Aviser og magasiner</strong> - fysiske publikationer</li>
        </ul>

        <h2>Brug vores momsberegner</h2>
        <p>
          Du behøver ikke regne i hovedet. Brug vores gratis momsberegner til at 
          tillægge eller fratrække moms med det samme.
        </p>

        <div className="not-prose my-8">
          <Link 
            href="/moms"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til momsberegneren →
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

      {/* Related links */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link 
            href="/blog/guide-til-laan-og-renter"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Guide til lån og renter →</span>
          </Link>
          <Link 
            href="/blog/saadan-finder-du-din-timepris-som-freelancer"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Find din timepris som freelancer →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
