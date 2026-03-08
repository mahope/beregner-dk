import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Sådan beregner du din reelle timeløn | MinBeregner.dk",
    description:
      "Lær at beregne din faktiske timeløn inkl. alle skjulte goder som pension, frokost og ferie. Se hvad du virkelig tjener per time.",
    keywords: [
      "reel timeløn",
      "beregn timeløn",
      "faktisk timeløn",
      "timeløn efter skat",
      "hvad tjener jeg i timen",
      "løn per time",
      "samlet timeløn",
    ],
    openGraph: {
      title: "Sådan beregner du din reelle timeløn",
      description: "Beregn din faktiske timeløn inkl. pension, frokost, ferie og andre goder.",
      url: `${baseUrl}/blog/saadan-beregner-du-din-reelle-timeloen`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/saadan-beregner-du-din-reelle-timeloen`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er forskellen på timeløn og reel timeløn?",
    answer: "Din almindelige timeløn er bruttoløn ÷ timer. Din reelle timeløn inkluderer også værdien af pension, frokostordning, forsikringer, ferie med løn og andre personalegoder - hvilket ofte giver 20-40% mere per time.",
  },
  {
    question: "Skal pension tælles med i timeløn?",
    answer: "Ja! Arbejdsgivers pensionsbidrag (typisk 8-15% af løn) er en del af din samlede kompensation. En løn på 35.000 kr med 12% arbejdsgiver-pension svarer til 39.200 kr i samlet værdi.",
  },
  {
    question: "Hvordan sammenligner jeg to jobtilbud?",
    answer: "Beregn den reelle timeløn for begge: Tag samlet kompensation (løn + pension + goder) og divider med faktiske arbejdstimer. Husk at inkludere transport, frokostpauser og overtid i timetal.",
  },
  {
    question: "Tæller betalt frokost med i timeløn?",
    answer: "Det afhænger af perspektivet. Hvis frokost er betalt arbejdstid, øger det din timeløn (færre 'gratis' timer). Hvis du selv betaler frokost, er det en omkostning der reducerer din reelle timeløn.",
  },
];

export default function ReelTimeloenPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">Reel timeløn</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Løn & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
            Sådan beregner du din reelle timeløn
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>13. februar 2026</span>
            <span>•</span>
            <span>7 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Ved du hvad du reelt tjener i timen? De fleste kigger kun på bruttolønnen, 
          men glemmer pension, goder og skjulte timer. Her lærer du at beregne din 
          faktiske timeløn - og sammenligne jobtilbud korrekt.
        </p>

        <h2>Hvorfor din reelle timeløn er vigtig</h2>
        <p>
          Mange sammenligner job udelukkende på månedsløn. Men en stilling med 
          35.000 kr i løn kan være <em>mere</em> værd end en med 40.000 kr - 
          hvis førstnævnte har bedre pension, kortere arbejdstid og flere goder.
        </p>
        <p>
          Din reelle timeløn viser hvad du faktisk får per time investeret i arbejde. 
          Det er den metric der tæller, når du skal træffe karrierevalg.
        </p>

        <h2>Formlen for reel timeløn</h2>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg not-prose my-6">
          <p className="font-mono text-lg text-center">
            <strong>Reel timeløn</strong> = (Samlet kompensation) ÷ (Faktiske timer)
          </p>
        </div>
        <p>
          Lyder simpelt, men djævelen er i detaljerne. Lad os gennemgå begge sider.
        </p>

        <h2>Del 1: Beregn din samlede kompensation</h2>
        <p>
          Din samlede kompensation er <em>ikke</em> bare din løn. Her er hvad du skal inkludere:
        </p>

        <h3>1. Bruttoløn</h3>
        <p>
          Din månedlige løn før skat. For at se hvad du reelt får udbetalt, 
          brug vores{" "}
          <Link href="/loen-efter-skat">løn efter skat beregner</Link>.
        </p>

        <h3>2. Arbejdsgiver-pension</h3>
        <p>
          De fleste arbejdsgivere betaler pension oveni din løn - typisk 8-15%. 
          Det er penge du får, bare med forsinket udbetaling. Brug vores{" "}
          <Link href="/pension">pensionsberegner</Link> til at se hvad det bliver til.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Eksempel:</strong> 35.000 kr løn + 12% arbejdsgiver-pension = 4.200 kr ekstra/måned
          </p>
        </div>

        <h3>3. Frokostordning</h3>
        <p>
          Betalt frokost sparer dig typisk 1.500-2.500 kr/måned. Beregn værdien som:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-sm">
            20 arbejdsdage × 80 kr/frokost = 1.600 kr/måned
          </p>
        </div>

        <h3>4. Sundhedsforsikring</h3>
        <p>
          En arbejdsgiver-betalt sundhedsforsikring koster typisk 300-500 kr/måned 
          hvis du skulle købe den selv.
        </p>

        <h3>5. Telefon og internet</h3>
        <p>
          Får du mobil eller bredbånd betalt? Værdi: 200-500 kr/måned.
        </p>

        <h3>6. Andre goder</h3>
        <ul>
          <li><strong>Firmabil:</strong> 3.000-10.000 kr/måned i værdi</li>
          <li><strong>Fitnesskort:</strong> 300-500 kr/måned</li>
          <li><strong>Massage/wellness:</strong> 200-400 kr/måned</li>
          <li><strong>Personalefester:</strong> 100-200 kr/måned (fordelt)</li>
          <li><strong>Uddannelse:</strong> Varierende værdi</li>
        </ul>

        <h3>Samlet kompensation - eksempel</h3>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg not-prose my-6">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Bruttoløn</td>
                <td className="text-right">35.000 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Arbejdsgiver-pension (12%)</td>
                <td className="text-right">4.200 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Frokostordning</td>
                <td className="text-right">1.600 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Sundhedsforsikring</td>
                <td className="text-right">400 kr</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Telefon</td>
                <td className="text-right">300 kr</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Samlet kompensation</td>
                <td className="text-right">41.500 kr/måned</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Det er <strong>18,6% mere</strong> end den rene løn! Mange overser 
          næsten en femtedel af deres kompensation.
        </p>

        <h2>Del 2: Beregn dine faktiske arbejdstimer</h2>
        <p>
          Nu til den anden side af brøken. Hvor mange timer bruger du <em>reelt</em> 
          på arbejde - ikke bare hvad der står i kontrakten?
        </p>

        <h3>Kontrakttimer</h3>
        <p>
          Standard fuldtid er 37 timer/uge = 160,3 timer/måned. Men det er sjældent 
          den fulde historie.
        </p>

        <h3>Juster for pauser</h3>
        <ul>
          <li><strong>Betalt frokostpause:</strong> Tæller ikke med (god deal!)</li>
          <li><strong>Ubetalt frokostpause:</strong> Tilføj 30 min × arbejdsdage = ca. 10 timer/måned</li>
        </ul>

        <h3>Transport</h3>
        <p>
          Mange glemmer transport, men det er tid du "giver" til arbejdet. 
          Brug vores{" "}
          <Link href="/bilberegner">bilberegner</Link> til at se kørselsomkostninger.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Eksempel:</strong> 30 min transport hver vej × 2 × 20 dage = 20 timer/måned
          </p>
        </div>

        <h3>Overtid</h3>
        <p>
          Ubetalt overtid sænker din timeløn drastisk. Vær ærlig: Arbejder du 
          reelt mere end 37 timer?
        </p>

        <h3>Faktiske timer - eksempel</h3>
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Kontrakttimer</td>
                <td className="text-right">160 timer</td>
              </tr>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Ubetalt frokost</td>
                <td className="text-right">+10 timer</td>
              </tr>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Transport</td>
                <td className="text-right">+20 timer</td>
              </tr>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Overtid (gennemsnit)</td>
                <td className="text-right">+5 timer</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Faktiske arbejdstimer</td>
                <td className="text-right">195 timer/måned</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Den endelige beregning</h2>
        <div className="bg-blue-100 dark:bg-blue-900/50 p-6 rounded-lg not-prose my-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Reel timeløn:</p>
          <p className="font-mono text-2xl mb-2">
            41.500 kr ÷ 195 timer = <strong className="text-blue-700 dark:text-blue-300">213 kr/time</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            vs. simpel beregning: 35.000 ÷ 160 = 219 kr/time
          </p>
        </div>
        <p>
          I dette eksempel er den reelle timeløn faktisk <em>lavere</em> end den simple beregning - 
          fordi transport og overtid opvejer goderne. Sådan er det ofte!
        </p>

        <h2>Sammenlign to jobs: Et eksempel</h2>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2"></th>
                <th className="text-right py-2">Job A</th>
                <th className="text-right py-2">Job B</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Bruttoløn</td>
                <td className="text-right">38.000 kr</td>
                <td className="text-right">35.000 kr</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Pension (arbejdsgiver)</td>
                <td className="text-right">8%</td>
                <td className="text-right">15%</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Frokost</td>
                <td className="text-right">Ubetalt</td>
                <td className="text-right">Gratis</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Transport (min/dag)</td>
                <td className="text-right">60 min</td>
                <td className="text-right">20 min</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Typisk overtid</td>
                <td className="text-right">5 timer/uge</td>
                <td className="text-right">0 timer</td>
              </tr>
              <tr className="border-b dark:border-gray-700 font-bold">
                <td className="py-2">Samlet kompensation</td>
                <td className="text-right">41.040 kr</td>
                <td className="text-right">42.850 kr</td>
              </tr>
              <tr className="border-b dark:border-gray-700 font-bold">
                <td className="py-2">Faktiske timer</td>
                <td className="text-right">210 timer</td>
                <td className="text-right">167 timer</td>
              </tr>
              <tr className="font-bold text-lg">
                <td className="py-2">Reel timeløn</td>
                <td className="text-right text-red-600 dark:text-red-400">195 kr</td>
                <td className="text-right text-green-600 dark:text-green-400">257 kr</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Job B er 32% bedre betalt per time</strong> - selvom lønnen er 3.000 kr lavere! 
          Sådan kan et job med lavere løn være langt mere attraktivt.
        </p>

        <h2>Sådan forbedrer du din reelle timeløn</h2>
        <ol>
          <li>
            <strong>Forhandl pension frem for løn:</strong> Arbejdsgiver-pension 
            beskattes ikke her og nu - du får mere værdi per krone.
          </li>
          <li>
            <strong>Reducer transport:</strong> Flyt tættere på, eller forhandl 
            hjemmearbejde. 30 min sparet dagligt = 10 timer mere fritid/måned.
          </li>
          <li>
            <strong>Sig nej til gratis overtid:</strong> Hver time ubetalt overtid 
            sænker din timeløn direkte.
          </li>
          <li>
            <strong>Værdisæt goder:</strong> En god sundhedsforsikring eller 
            fleksibel arbejdstid har reel værdi.
          </li>
          <li>
            <strong>Overvej deltid:</strong> Nogle bruger mere tid end de tjener 
            på de sidste timer.
          </li>
        </ol>

        <h2>Beregn din egen reelle timeløn</h2>
        <p>
          Brug vores beregnere til at komme i gang:
        </p>

        <div className="not-prose my-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/timepris"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Timepris-beregner →
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
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link 
            href="/blog/saadan-finder-du-din-timepris-som-freelancer"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Sådan finder du din timepris som freelancer →</span>
          </Link>
          <Link 
            href="/blog/30-procent-reglen-husleje"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">30% reglen: Hvor meget bør du bruge på husleje? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
