import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Guide: Feriepenge - Hvornår og Hvor Meget? | MinBeregner.dk",
  description:
    "Komplet guide til feriepenge i 2026: Hvornår får du dem udbetalt? Hvor meget får du? Lær om ferieåret, samtidighedsferie, og beregn dine egne feriepenge.",
  keywords: [
    "feriepenge",
    "hvornår får man feriepenge",
    "hvor meget feriepenge",
    "feriepenge udbetaling",
    "ferieår",
    "samtidighedsferie",
    "12,5 procent feriepenge",
    "feriepenge beregning",
    "ferieloven",
    "feriefridage",
  ],
  openGraph: {
    title: "Guide: Feriepenge - Hvornår og Hvor Meget?",
    description: "Alt du skal vide om feriepenge i 2026: beregning, udbetaling og dine rettigheder.",
    url: `${baseUrl}/blog/guide-feriepenge-hvornaar-og-hvor-meget`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/guide-feriepenge-hvornaar-og-hvor-meget`,
  },
};

const faqItems = [
  {
    question: "Hvornår får jeg mine feriepenge udbetalt?",
    answer: "Med samtidighedsferie optjener og afvikler du ferie i samme periode (1. sept - 31. aug). Du får feriepengene udbetalt når du holder ferie. Ved fratræden udbetales resterende feriepenge automatisk via FerieKonto eller din arbejdsgiver.",
  },
  {
    question: "Hvor meget får jeg i feriepenge?",
    answer: "Feriepenge udgør 12,5% af din ferieberettigede løn. Ved 40.000 kr/måned i bruttoløn får du ca. 60.000 kr i årlige feriepenge før skat, svarende til ca. 35.000 kr netto for 25 feriedage.",
  },
  {
    question: "Hvad er forskellen på ferie med løn og feriepenge?",
    answer: "Funktionærer og mange overenskomstansatte får typisk 'ferie med løn' - du får din normale løn under ferie plus et ferietillæg på 1%. Timelønnede og andre får 'feriepenge' - 12,5% af lønnen opsparet separat.",
  },
  {
    question: "Kan jeg få udbetalt feriepenge uden at holde ferie?",
    answer: "Ja, i visse situationer: Ved fratræden, hvis du har uhævede feriepenge efter ferieårets udløb, eller den 5. ferieuge hvis du ikke har kunnet afholde den. Kontakt din arbejdsgiver eller FerieKonto.",
  },
  {
    question: "Hvor mange feriedage har jeg ret til?",
    answer: "Alle lønmodtagere har ret til 5 ugers ferie (25 dage) om året. Du optjener 2,08 feriedag per måned. Ved deltid har du samme antal dage, men feriepengene er lavere.",
  },
  {
    question: "Hvad sker der med mine feriepenge hvis jeg skifter job?",
    answer: "Dine optjente feriepenge følger dig. De indbetales til FerieKonto og kan udbetales når du holder ferie hos din nye arbejdsgiver, eller kontant hvis du har en periode uden arbejde.",
  },
];

export default function FeriepengeGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">Feriepenge guide</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Løn & Ferie</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
            Guide: Feriepenge - Hvornår og Hvor Meget?
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>13. februar 2026</span>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Feriepenge kan være forvirrende: Hvornår optjener du dem? Hvornår udbetales de? 
          Og hvor meget får du egentlig? I denne guide får du svar på alt om feriepenge 
          i 2026 - inklusiv hvordan du beregner dine egne.
        </p>

        <h2>Sådan fungerer feriepenge i Danmark</h2>
        <p>
          Siden september 2020 har Danmark haft <strong>samtidighedsferie</strong>. 
          Det betyder, at du optjener og kan afholde ferie i samme periode - ferieåret, 
          der løber fra 1. september til 31. august året efter.
        </p>
        <p>
          For hver måned du arbejder, optjener du 2,08 feriedag. Over 12 måneder giver det 
          25 feriedage - svarende til 5 ugers ferie.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg not-prose my-6">
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Ferieåret 2025/2026</h3>
          <ul className="space-y-1 text-gray-700 dark:text-gray-300">
            <li>📅 <strong>Optjeningsperiode:</strong> 1. sept 2024 - 31. aug 2025</li>
            <li>🏖️ <strong>Ferieafholdelse:</strong> 1. sept 2025 - 31. dec 2026</li>
          </ul>
        </div>

        <h2>Hvor meget får du i feriepenge?</h2>
        <p>
          Feriepenge beregnes som <strong>12,5% af din ferieberettigede løn</strong>. 
          Det inkluderer din bruttoløn, men typisk ikke pension og visse tillæg.
        </p>

        <h3>Eksempel: Beregning af feriepenge</h3>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg not-prose my-6">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Månedlig bruttoløn</td>
                <td className="text-right">40.000 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Årlig bruttoløn</td>
                <td className="text-right">480.000 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Feriepenge (12,5%)</td>
                <td className="text-right">60.000 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">- AM-bidrag (8%)</td>
                <td className="text-right">4.800 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">- Skat (~38%)</td>
                <td className="text-right">20.976 kr</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Netto feriepenge (25 dage)</td>
                <td className="text-right text-green-700 dark:text-green-400">34.224 kr</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Per feriedag: ca. 1.369 kr netto
          </p>
        </div>

        <p>
          Vil du beregne dine egne feriepenge? Brug vores{" "}
          <Link href="/feriepenge">feriepenge-beregner</Link> - den tager højde for 
          AM-bidrag og estimeret skat.
        </p>

        <h2>Ferie med løn vs. feriepenge</h2>
        <p>
          Der er to måder at få betaling under ferie på i Danmark:
        </p>

        <h3>1. Ferie med løn (+ ferietillæg)</h3>
        <p>
          Funktionærer og mange overenskomstansatte får deres normale løn under ferie, 
          plus et <strong>ferietillæg på 1%</strong> af årslønnen. Ferietillægget udbetales 
          typisk med april- eller maj-lønnen.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Eksempel:</strong> 40.000 kr/måned × 12 × 1% = 4.800 kr i ferietillæg
          </p>
        </div>

        <h3>2. Feriepenge (12,5%)</h3>
        <p>
          Timelønnede, løsarbejdere og nogle ansatte får i stedet feriepenge - 12,5% af 
          lønnen, som indbetales til FerieKonto eller udbetales direkte af arbejdsgiver.
        </p>

        <h2>Hvornår udbetales feriepenge?</h2>
        <p>
          Timing afhænger af din ansættelsesform og om du stadig er i job:
        </p>

        <h3>Når du er i job</h3>
        <ul>
          <li><strong>Ferie med løn:</strong> Du får din normale løn under ferien</li>
          <li><strong>Feriepenge via arbejdsgiver:</strong> Udbetales med lønnen når du holder ferie</li>
          <li><strong>FerieKonto:</strong> Du anmoder om udbetaling inden ferie - pengene kommer inden for få dage</li>
        </ul>

        <h3>Når du skifter eller stopper job</h3>
        <p>
          Ved fratræden får du dine optjente, men ikke afholdte feriepenge udbetalt. 
          De indbetales typisk til FerieKonto, medmindre:
        </p>
        <ul>
          <li>Du starter nyt job inden for 1 måned (arbejdsgiver kan overføre direkte)</li>
          <li>Du bliver ledig og skal have dagpenge (særlige regler - se{" "}
            <Link href="/dagpenge">dagpengeberegner</Link>)</li>
        </ul>

        <h3>Uhævede feriepenge</h3>
        <p>
          Har du feriepenge stående, som du ikke har fået udbetalt inden ferieåret slutter 
          (31. december)? De forfalder <em>ikke</em> automatisk - du kan søge om at få dem 
          udbetalt efterfølgende.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-gray-900 dark:text-white">💡 Husk den 5. ferieuge</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Du kan få den 5. ferieuge (de sidste 5 dage) udbetalt kontant, hvis du ikke kan 
            nå at afholde dem inden ferieårets udløb. Det kræver ansøgning.
          </p>
        </div>

        <h2>Vigtige datoer i ferieåret</h2>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Dato</th>
                <th className="text-left py-2">Hvad sker der?</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">1. september</td>
                <td>Nyt ferieår starter - nye feriedage klar til brug</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">April/maj</td>
                <td>Ferietillæg (1%) udbetales til funktionærer</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">31. august</td>
                <td>Optjeningsperioden slutter (for næste ferieår)</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">31. december</td>
                <td>Deadline for at afholde/overføre ferie fra forrige ferieår</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Særlige situationer</h2>

        <h3>Barsel og feriepenge</h3>
        <p>
          Under barsel med løn optjener du ferie som normalt. Under barselsdagpenge 
          optjener du <em>ikke</em> ferie. Brug vores{" "}
          <Link href="/barselsdagpenge">barselsdagpenge-beregner</Link> for at se 
          hvad du får under barsel.
        </p>

        <h3>Sygdom og ferie</h3>
        <p>
          Bliver du syg før ferien, kan du udskyde ferien. Bliver du syg under ferien, 
          har du ret til erstatningsferie fra dag 6 af sygdommen.
        </p>

        <h3>Deltid og feriepenge</h3>
        <p>
          Du har ret til samme antal feriedage (25) som fuldtidsansatte. Men dine feriepenge 
          er lavere, da de beregnes af din faktiske løn.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Eksempel deltid (20 timer/uge):</strong> 20.000 kr/måned × 12 × 12,5% = 
            30.000 kr i årlige feriepenge (før skat)
          </p>
        </div>

        <h3>Nyt job midt i ferieåret</h3>
        <p>
          Starter du nyt job f.eks. 1. marts, har du kun optjent ferie for de måneder du 
          har arbejdet. Fra 1. marts til 31. august = 6 måneder = 12,5 feriedage.
        </p>

        <h2>Feriefridage vs. feriedage</h2>
        <p>
          Mange forveksler de to - men de er forskellige:
        </p>
        <ul>
          <li>
            <strong>Feriedage (25):</strong> Lovpligtige, finansieret af 12,5% feriepenge
          </li>
          <li>
            <strong>Feriefridage (typisk 5):</strong> Aftalebaserede fridage (overenskomst eller kontrakt), 
            ofte med fuld løn
          </li>
        </ul>
        <p>
          Feriefridage er <em>ikke</em> omfattet af ferieloven - de er et personalegode. 
          Tjek din kontrakt eller overenskomst.
        </p>

        <h2>Sådan får du mest ud af dine feriepenge</h2>
        <ol>
          <li>
            <strong>Planlæg ferien tidligt:</strong> Book ferien i god tid, så du når at 
            bruge alle dage inden 31. december.
          </li>
          <li>
            <strong>Tjek FerieKonto:</strong> Log ind på{" "}
            <a href="https://www.borger.dk/arbejde-dagpenge-ferie/Ferie-og-fridage/Feriekonto" 
               target="_blank" 
               rel="noopener noreferrer">
              borger.dk
            </a> for at se dine feriepenge.
          </li>
          <li>
            <strong>Husk den 5. ferieuge:</strong> Får du ikke brugt alle dage, kan du søge 
            om kontant udbetaling.
          </li>
          <li>
            <strong>Kombiner med helligdage:</strong> Hold ferie omkring påske, pinse eller 
            jul for at få flere sammenhængende fridage.
          </li>
        </ol>

        <h2>Beregn dine feriepenge</h2>
        <p>
          Vil du vide præcis hvor meget du får? Brug vores gratis beregner:
        </p>

        <div className="not-prose my-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/feriepenge"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Beregn feriepenge →
          </Link>
          <Link 
            href="/loen-efter-skat"
            className="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Løn efter skat →
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

      <div className="mt-12 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link 
            href="/feriepenge"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Feriepenge-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn dine feriepenge før og efter skat</p>
          </Link>
          <Link 
            href="/loen-efter-skat"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Løn efter skat →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvad du får udbetalt af din løn</p>
          </Link>
          <Link 
            href="/dagpenge"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Dagpenge-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn dagpenge ved ledighed</p>
          </Link>
          <Link 
            href="/barselsdagpenge"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Barselsdagpenge →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvad du får under barsel</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link 
            href="/blog/saadan-beregner-du-din-reelle-timeloen"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Sådan beregner du din reelle timeløn →</span>
          </Link>
          <Link 
            href="/blog/saadan-finder-du-din-timepris-som-freelancer"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Sådan finder du din timepris som freelancer →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
