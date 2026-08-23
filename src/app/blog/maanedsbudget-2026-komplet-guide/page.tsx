import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Månedsbudget 2026 - Komplet guide til privatøkonomi | MinBeregner.dk",
    description:
      "Komplet guide til at lave et månedsbudget i 2026: Faste og variable udgifter, 50/30/20-reglen, tommelfingerregler for bolig og opsparing. Få styr på din økonomi.",
    keywords: [
      "månedsbudget 2026",
      "privatøkonomi budget",
      "hvordan laver man et budget",
      "budget guide",
      "50 30 20 reglen",
      "faste udgifter",
      "variable udgifter",
      "privatøkonomi",
    ],
    openGraph: {
      title: "Månedsbudget 2026 - Komplet guide til privatøkonomi",
      description: "Lær at lave et budget der holder: Faste/variable udgifter, tommelfingerregler og gratis budgetberegner.",
      url: `${baseUrl}/blog/maanedsbudget-2026-komplet-guide`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/maanedsbudget-2026-komplet-guide`,
    },
  };
}

const faqItems = [
  {
    question: "Hvor meget bør jeg bruge på bolig?",
    answer: "Tommelfingerreglen siger maks. 30-35% af din nettoindkomst. Bor du til leje i København, kan det være svært at holde sig under 30%, men undgå at gå over 40% — så bliver din økonomi sårbar over for rentestigninger eller tab af indtægt.",
  },
  {
    question: "Hvad er 50/30/20-reglen?",
    answer: "50/30/20-reglen fordeler din nettoindkomst efter skat: 50% til nødvendigheder (bolig, mad, transport, forsikring), 30% til personlige ønsker (rejser, restaurant, streaming, hobby) og 20% til opsparing og gældsafbetaling. Reglen er en tommelfingerregel udviklet af Elizabeth Warren og kan tilpasses efter din situation.",
  },
  {
    question: "Hvor meget bør jeg spare op hver måned?",
    answer: "Mindst 10-20% af din nettoindkomst. Har du gæld med høj rente (f.eks. forbrugslån og kassekredit), bør du prioritere at betale den ud først — det giver en højere garanteret gevinst end opsparing. Har du ingen gæld, bør du have en opsparing på 3-6 måneders leveomkostninger som buffer.",
  },
  {
    question: "Hvad er forskellen på faste og variable udgifter?",
    answer: "Faste udgifter er de samme hver måned: husleje, boliglån, forsikring, a-kasse, fagforening, licenser og abonnementer. Variable udgifter svinger fra måned til måned: mad, transport, strøm, varme, tøj, fritid og rejser. De variable udgifter er nemmest at skære i, hvis du skal spare penge.",
  },
  {
    question: "Hvordan laver jeg et budget?",
    answer: "Start med at finde din nettoindkomst efter skat. Notér alle dine faste udgifter. Gæt eller slå op hvad du bruger på variable udgifter (brug eventuelt bankens forbrugsoversigt eller en måneds kvitteringer). Sæt et opsparingsmål. Træk udgifter og opsparing fra indkomsten — er der overskud, fordeler du det til ønsker eller ekstra opsparing. Er der underskud, find områder at skære i. Brug vores gratis budgetberegner til at gøre processen lettere.",
  },
  {
    question: "Hvor meget koster en gennemsnitlig dansk husstand?",
    answer: "En gennemsnitlig dansk husstand bruger ca. 25.000-35.000 kr/måned inkl. bolig, mad, transport og faste udgifter. Bolig er den største post (ca. 30-40% af budgettet), derefter mad og dagligvarer (ca. 12-18%), transport (ca. 8-12%) og forsikring/faste udgifter (ca. 5-10%).",
  },
];

export default function MaanedsbudgetGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span>Månedsbudget 2026</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="not-prose mb-8">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Privatøkonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">Månedsbudget 2026: Komplet guide til privatøkonomi</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">23. august 2026 · 10 min læsetid</p>
        </header>

        <p className="lead">
          Et budget er fundamentet for en sund privatøkonomi. Alligevel har hver tredje dansker ifølge
          Finans Danmark ikke et overblik over deres månedlige udgifter. I denne guide får du en
          komplet metode til at lave et månedsbudget i 2026 — med konkrete tommelfingerregler,
          typiske danske tal og en gratis beregner der gør arbejdet for dig.
        </p>

        <h2>Hvorfor er et budget vigtigt?</h2>
        <p>
          Uden et budget er det nærmest umuligt at vide om du bruger mere, end du tjener. Et
          månedsbudget giver dig:
        </p>
        <ul>
          <li><strong>Overblik:</strong> Du ved præcis hvor mange penge der kommer ind og går ud</li>
          <li><strong>Kontrol:</strong> Du kan se om du bruger for meget på bestemte områder</li>
          <li><strong>Tryghed:</strong> Du ved at regningerne bliver betalt og at der er penge til uforudsete udgifter</li>
          <li><strong>Målrettet opsparing:</strong> Du kan planlægge hvad du sparer op til — og hvor hurtigt du når dit mål</li>
        </ul>

        <p>
          Et budget behøver ikke være kompliceret. Brug 30 minutter på at sætte det op, og
          juster det en gang om måneden. Det er den bedste investering du kan gøre i din
          privatøkonomi.
        </p>

        <h2>De 5 trin til et solidt budget</h2>

        <h3>1. Find din nettoindkomst</h3>
        <p>
          Start med at finde ud af hvor mange penge du får udbetalt hver måned efter skat. For
          de fleste lønmodtagere er dette beløbet på lønsedlen efter AM-bidrag, skat og eventuelle
          pensionsordninger. Har du flere indkomstkilder (f.eks. SU, freelancer-indtægt eller
          udlejning), lægger du dem alle sammen.
        </p>
        <p>
          Den gennemsnitlige danske lønmodtager havde i 2026 en <strong>månedsløn før skat på ca. 47.000 kr</strong>,
          svarende til en nettoindkomst på omkring <strong>28.000-32.000 kr/måned</strong> efter
          skat (afhænger af kommune og fradrag).
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores lønberegner</strong> til at se præcis hvor meget du får udbetalt efter skat og AM-bidrag.{' '}
            <Link href="/loen-efter-skat" className="text-blue-600 hover:underline font-medium">Gå til Løn efter skat →</Link>
          </p>
        </div>

        <h3>2. Notér dine faste udgifter</h3>
        <p>
          Faste udgifter er de regninger der er de samme hver måned. Her er de typiske poster
          for en dansk husstand i 2026:
        </p>

        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Typisk beløb/måned</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Husleje / boliglån</td>
              <td>6.000-12.000 kr</td>
            </tr>
            <tr>
              <td>Forsikringer (indbo, ansvar, ulykke)</td>
              <td>400-800 kr</td>
            </tr>
            <tr>
              <td>A-kasse + fagforening</td>
              <td>800-1.200 kr</td>
            </tr>
            <tr>
              <td>Streaming + mobilabonnement</td>
              <td>300-600 kr</td>
            </tr>
            <tr>
              <td>Internet + tv-pakke</td>
              <td>300-500 kr</td>
            </tr>
            <tr>
              <td>Bilforsikring (pr. måned)</td>
              <td>500-1.200 kr</td>
            </tr>
            <tr>
              <td>Grøn ejerafgift (pr. måned)</td>
              <td>150-500 kr</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Beløbene er vejledende og varierer efter boligstørrelse, biltype, forsikringsdækning og bopæl.
        </p>

        <h3>3. Gæt eller mål dine variable udgifter</h3>
        <p>
          Variable udgifter svinger fra måned til måned. Den nemmeste måde at finde dem på er at
          kigge på de sidste 3-6 måneders bankudtog. Her er typiske poster:
        </p>

        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Typisk beløb/måned</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Mad og dagligvarer (enlig)</td>
              <td>2.000-3.000 kr</td>
            </tr>
            <tr>
              <td>Mad og dagligvarer (par)</td>
              <td>4.000-6.000 kr</td>
            </tr>
            <tr>
              <td>Mad og dagligvarer (fam. med børn)</td>
              <td>5.500-8.000 kr</td>
            </tr>
            <tr>
              <td>Transport (bil + brændstof/el)</td>
              <td>1.500-4.000 kr</td>
            </tr>
            <tr>
              <td>Varme + el + vand</td>
              <td>1.500-3.000 kr</td>
            </tr>
            <tr>
              <td>Restaurant + takeaway</td>
              <td>500-2.000 kr</td>
            </tr>
            <tr>
              <td>Tøj + personlig pleje</td>
              <td>500-1.500 kr</td>
            </tr>
            <tr>
              <td>Fritid + hobby</td>
              <td>500-2.000 kr</td>
            </tr>
            <tr>
              <td>Rejser (gennemsnit pr. måned)</td>
              <td>500-1.500 kr</td>
            </tr>
          </tbody>
        </table>

        <h3>4. Sæt et opsparingsmål</h3>
        <p>
          En tommelfingerregel er at spare <strong>mindst 10-20% af din nettoindkomst</strong> op
          hver måned. Har du gæld med høj rente (forbrugslån, kassekredit, kviklån), bør du
          prioritere at betale den ud før du sparer op — det giver dig en garanteret gevinst på
          15-25% årligt.
        </p>
        <p>
          <strong>Nødbufferen</strong> bør være på 3-6 måneders leveomkostninger, typisk
          50.000-150.000 kr afhængigt af din husstandsstørrelse. Når bufferen er på plads, kan du
          spare op til større mål: boligkøb, bil, rejser eller pension.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores opsparingsberegner</strong> til at se hvor lang tid det tager at nå dit mål.{' '}
            <Link href="/opsparing" className="text-blue-600 hover:underline font-medium">Gå til Opsparingsberegner →</Link>
          </p>
        </div>

        <h3>5. Justér og følg op</h3>
        <p>
          Et budget er ikke statisk. Gennemgå det én gang om måneden og justér efter virkeligheden:
        </p>
        <ul>
          <li>Bruger du mere på mad end budgetteret? Så sæt posten op — eller find måder at spare</li>
          <li>Fik du en lønforhøjelse? Læg merbeløbet i opsparing, før forbrugsvanerne følger med</li>
          <li>Har du betalt et lån ud? Fordel den frigjorte ydelse til opsparing i stedet</li>
          <li>Store årlige udgifter (forsikring, ejerafgift, ferie) — sæt dem ind i budgettet i den måned de falder</li>
        </ul>

        <h2>50/30/20-reglen i praksis</h2>
        <p>
          50/30/20-reglen er en enkel måde at strukturere dit budget på. Den fordeler din
          nettoindkomst i tre kategorier:
        </p>
        <ul>
          <li><strong>50% til nødvendigheder:</strong> bolig, mad, transport, forsikring, minimumsbetaling på gæld</li>
          <li><strong>30% til personlige ønsker:</strong> restaurant, rejser, streaming, tøj, hobby — alt du kan leve uden</li>
          <li><strong>20% til opsparing og gæld:</strong> ekstra afdrag på lån, aktier, pension, nødbuffer</li>
        </ul>
        <p>
          Har du en høj boligudgift (f.eks. i København), kan nødvendighederne sagtens løbe op i
          60-65%. I så fald må du skære i ønsker eller finde en billigere bolig på sigt.
          Omvendt har du lave boligudgifter, kan du øge opsparingsandelen.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores budgetberegner</strong> til at lave et komplet budget med faste og variable udgifter.{' '}
            <Link href="/budget" className="text-blue-600 hover:underline font-medium">Gå til Budgetberegner →</Link>
          </p>
        </div>

        <h2>Hvor meget koster en gennemsnitlig dansk husstand?</h2>
        <p>
          Ifølge Danmarks Statistik bruger en gennemsnitlig dansk husstand ca. <strong>28.000-35.000 kr/måned</strong>.
          Her er et typisk regnestykke for en familie på 4 i 2026:
        </p>

        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Beløb/måned</th>
              <th>Andel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Bolig (husleje/fællesudgifter/renter)</td>
              <td>10.000 kr</td>
              <td>33%</td>
            </tr>
            <tr>
              <td>Mad og dagligvarer</td>
              <td>6.000 kr</td>
              <td>20%</td>
            </tr>
            <tr>
              <td>Transport (bil + brændstof)</td>
              <td>3.500 kr</td>
              <td>12%</td>
            </tr>
            <tr>
              <td>Faste udgifter (forsikring, a-kasse)</td>
              <td>2.500 kr</td>
              <td>8%</td>
            </tr>
            <tr>
              <td>Forbrug (el, varme, vand)</td>
              <td>2.000 kr</td>
              <td>7%</td>
            </tr>
            <tr>
              <td>Fritid, tøj, rejser</td>
              <td>3.500 kr</td>
              <td>12%</td>
            </tr>
            <tr>
              <td>Opsparing</td>
              <td>2.500 kr</td>
              <td>8%</td>
            </tr>
            <tr className="font-bold border-t-2">
              <td>I alt</td>
              <td>30.000 kr</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Eksemplet er vejledende og baseret på en familie i ejerbolig med to børn og én bil.
        </p>

        <h2>Typiske fejl i budgettet</h2>
        <ul>
          <li><strong>Glemmer årlige udgifter:</strong> Forsikring, ejerafgift, kontingenter og julegaver — fordel dem over 12 måneder</li>
          <li><strong>Sætter budgettet for stramt:</strong> Hvis du budgetterer med 0 kr til fritid, holder du det ikke. Vær realistisk</li>
          <li><strong>Glemmer småudgifter:</strong> En kop kaffe her, en snack dér — det løber hurtigt op i 500-1.000 kr/måned</li>
          <li><strong>Opdaterer ikke:</strong> Budgettet skal følge din virkelighed. Gennemgå det månedligt</li>
          <li><strong>Ingen buffer:</strong> Uforudsete udgifter (vaskemaskine, tandlæge, bilreperation) vælter budgettet hvis du ikke har en post til dem</li>
        </ul>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores beregnere til at optimere din privatøkonomi:</strong>{' '}
            <Link href="/budget" className="text-blue-600 hover:underline">Budgetberegner</Link>
            {' · '}
            <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">Løn efter skat</Link>
            {' · '}
            <Link href="/opsparing" className="text-blue-600 hover:underline">Opsparingsberegner</Link>
            {' · '}
            <Link href="/sparemaal" className="text-blue-600 hover:underline">Sparemålsberegner</Link>
            {' · '}
            <Link href="/huslejeberegner" className="text-blue-600 hover:underline">Huslejeberegner</Link>
          </p>
        </div>

        <h2>Digitale værktøjer til budget</h2>
        <p>
          Der findes mange gode værktøjer til at holde styr på dit budget. Vores gratis
          <Link href="/budget"> budgetberegner</Link> giver dig et komplet overblik over
          faste og variable udgifter. Derudover kan du bruge din banks forbrugsoversigt,
          Spiir, eller Lunar til automatisk kategorisering af udgifter.
        </p>
        <p>
          Uanset hvilket værktøj du vælger, er det vigtigste at du <strong>starter i dag</strong>.
          Et budget taget 30 minutter at lægge — og det kan spare dig for tusindvis af kroner om året.
        </p>

        <div className="not-prose my-8">
          <Link
            href="/budget"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til Budgetberegner →
          </Link>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.question}</h3>
            <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4">
          <Link href="/budget" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Budgetberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lav et komplet budget med faste og variable udgifter</p>
          </Link>
          <Link href="/loen-efter-skat" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Løn efter skat →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn din nettoindkomst med 2026-satser</p>
          </Link>
          <Link href="/opsparing" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Opsparingsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn hvor lang tid det tager at nå dit mål</p>
          </Link>
          <Link href="/sparemaal" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Sparemålsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find ud af hvor meget du skal spare op hver måned</p>
          </Link>
          <Link href="/huslejeberegner" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Huslejeberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tjek om din husleje er rimelig</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/pension-hvor-meget-skal-du-spare-op" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Pension: Hvor meget skal du spare op? →</span>
          </Link>
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Skat 2026: Alt du skal vide →</span>
          </Link>
          <Link href="/blog/fradrag-2026-komplet-guide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Fradrag 2026: Komplet guide →</span>
          </Link>
          <Link href="/blog/30-procent-reglen-husleje" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">30% reglen: Hvor meget bør du bruge på husleje? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}