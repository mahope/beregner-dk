import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Fradrag 2026: Komplet guide til skattefradrag i Danmark | MinBeregner.dk",
    description:
      "Overblik over alle skattefradrag i 2026: Rentefradrag, kørselsfradrag, håndværkerfradrag, fagforening og mere. Se hvad du kan trække fra.",
    keywords: [
      "skattefradrag 2026",
      "fradrag 2026",
      "rentefradrag 2026",
      "kørselsfradrag 2026",
      "håndværkerfradrag 2026",
      "befordringsfradrag",
      "fagforening fradrag",
    ],
    openGraph: {
      title: "Fradrag 2026: Komplet guide til skattefradrag i Danmark",
      description: "Alle skattefradrag i 2026 — rentefradrag, kørsel, håndværker og mere.",
      url: `${baseUrl}/blog/fradrag-2026-komplet-guide`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/fradrag-2026-komplet-guide`,
    },
  };
}

const faqItems = [
  {
    question: "Hvilke fradrag kan man få i 2026?",
    answer:
      "De vigtigste fradrag i 2026 er: rentefradrag (boliglån), befordringsfradrag (over 24 km), fagforeningskontingent, A-kasse, håndværkerfradrag (serviceydelser) og pensionsindbetaling.",
  },
  {
    question: "Hvad er håndværkerfradraget i 2026?",
    answer:
      "Håndværkerfradraget (serviceydelser) giver fradrag for op til 12.900 kr per person i 2026 for arbejdsløn til rengøring, havearbejde, vinduespudsning og lignende serviceydelser i hjemmet.",
  },
  {
    question: "Hvor meget sparer jeg på rentefradraget?",
    answer:
      "Rentefradraget giver en skattebesparelse på ca. 25-33% af dine renteudgifter, afhængigt af din kommune. Betaler du 50.000 kr i renter, sparer du ca. 12.500-16.500 kr i skat.",
  },
];

export default function FradragGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Fradrag 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Økonomi & Skat</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Fradrag 2026: Komplet guide til skattefradrag i Danmark
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Skattefradrag kan spare dig tusindvis af kroner hvert år — men mange danskere udnytter
          ikke alle de fradrag, de har ret til. Her er din komplette guide til de vigtigste
          skattefradrag i 2026.
        </p>

        <h2>Oversigt: Fradrag i 2026</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fradrag</th>
                <th>Max beløb (2026)</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Beskæftigelsesfradrag</td>
                <td>63.300 kr</td>
                <td>Automatisk</td>
              </tr>
              <tr>
                <td>Personfradrag</td>
                <td>54.100 kr</td>
                <td>Automatisk</td>
              </tr>
              <tr>
                <td>Rentefradrag</td>
                <td>Ingen grænse</td>
                <td>Automatisk*</td>
              </tr>
              <tr>
                <td>Befordringsfradrag</td>
                <td>Variabelt</td>
                <td>Selvoplyst</td>
              </tr>
              <tr>
                <td>Fagforening</td>
                <td>7.000 kr</td>
                <td>Automatisk*</td>
              </tr>
              <tr>
                <td>A-kasse</td>
                <td>Fuldt beløb</td>
                <td>Automatisk*</td>
              </tr>
              <tr>
                <td>Håndværkerfradrag (service)</td>
                <td>12.900 kr</td>
                <td>Selvoplyst</td>
              </tr>
              <tr>
                <td>Ratepension</td>
                <td>68.700 kr</td>
                <td>Automatisk</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          * Indberettes typisk automatisk af bank, fagforening eller A-kasse, men tjek altid din forskudsopgørelse.
        </p>

        <h2>1. Rentefradrag</h2>
        <p>
          Rentefradraget er for mange boligejere det mest værdifulde fradrag. Du kan trække renter
          fra på alle lån — boliglån, billån, forbrugslån og SU-lån. Skattebesparelsen er:
        </p>
        <ul>
          <li><strong>Negativ kapitalindkomst under 50.000 kr:</strong> Ca. 25-33% fradragsværdi</li>
          <li><strong>Negativ kapitalindkomst over 50.000 kr:</strong> Ca. 25-33% fradragsværdi</li>
        </ul>
        <p>
          Renterne indberettes automatisk af din bank. Beregn din besparelse med vores{" "}
          <Link href="/rentefradrag" className="text-blue-600 hover:underline">rentefradrag-beregner</Link>.
        </p>

        <h2>2. Befordringsfradrag (kørselsfradrag)</h2>
        <p>
          Har du mere end <strong>24 km</strong> mellem din bopæl og arbejdsplads, kan du få befordringsfradrag.
          I 2026 er satserne:
        </p>
        <ul>
          <li><strong>25-120 km:</strong> 2,23 kr per km (begge veje tæller)</li>
          <li><strong>Over 120 km:</strong> 1,12 kr per km</li>
        </ul>
        <p>
          Fradraget beregnes for den korteste vej og gælder uanset transportmiddel (bil, tog, cykel).
          Du skal selv oplyse det på din forskudsopgørelse.
        </p>

        <h2>3. Håndværkerfradrag (serviceydelser)</h2>
        <p>
          I 2026 kan du trække op til <strong>12.900 kr</strong> fra per person for arbejdsløn til
          serviceydelser i hjemmet:
        </p>
        <ul>
          <li>Rengøring og vinduespudsning</li>
          <li>Havearbejde (plæneklipning, hækklipning)</li>
          <li>Børnepasning i hjemmet</li>
          <li>Almindelig vedligeholdelse (maling, tapetsering)</li>
        </ul>
        <p>
          <strong>Vigtigt:</strong> Kun arbejdslønnen kan fradrages — ikke materialer. Betalingen
          skal ske elektronisk (aldrig kontant).
        </p>

        <h2>4. Fagforening og A-kasse</h2>
        <p>
          Kontingent til fagforening kan fradrages med op til <strong>7.000 kr</strong> om året.
          A-kasse-kontingent er fuldt fradragsberettiget. Begge indberettes typisk automatisk,
          men tjek at beløbene er korrekte på din forskudsopgørelse.
        </p>

        <h2>5. Pension</h2>
        <p>
          Indbetalinger til ratepension er fradragsberettigede med op til <strong>68.700 kr</strong> i 2026.
          Indbetalinger til livrente har ingen loft. Bemærk at aldersopsparing ikke giver fradrag
          (til gengæld er udbetalingen skattefri).
        </p>
        <p>
          Beregn din pension med vores{" "}
          <Link href="/pension" className="text-blue-600 hover:underline">pensionsberegner</Link>.
        </p>

        <h2>6. Gaver til velgørenhed</h2>
        <p>
          Du kan trække gaver til godkendte velgørende organisationer fra med op til <strong>18.300 kr</strong> i
          2026. Gaverne indberettes automatisk af organisationen.
        </p>

        <h2>Sådan tjekker du dine fradrag</h2>
        <ol>
          <li>Log ind på <strong>skat.dk</strong> med MitID</li>
          <li>Gå til din forskudsopgørelse for 2026</li>
          <li>Tjek at alle fradrag er korrekte (renter, kørsel, fagforening)</li>
          <li>Tilføj eventuelle manglende fradrag (befordring, håndværker)</li>
          <li>Gem og få en ny trækprocent</li>
        </ol>

        <h2>De mest glemte fradrag</h2>
        <p>
          Mange danskere går glip af fradrag, de har ret til:
        </p>
        <ul>
          <li><strong>Befordringsfradrag:</strong> Mange glemmer at oplyse kørsel over 24 km</li>
          <li><strong>Dobbelt husførelse:</strong> Har du arbejde langt fra bopæl og en midlertidig bolig?</li>
          <li><strong>Rejsefradrag:</strong> Ved midlertidig arbejdsplads over 24 km fra bopæl</li>
          <li><strong>Underholdsbidrag:</strong> Betaler du ægtefællebidrag?</li>
          <li><strong>Studielånsrenter:</strong> Glemmes ofte af nyuddannede</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dine fradrag</p>
          <p className="text-blue-700 dark:text-blue-400">
            Start med vores <Link href="/rentefradrag" className="underline font-medium">rentefradrag-beregner</Link> for
            at se din besparelse. Brug også{" "}
            <Link href="/loen-efter-skat" className="underline font-medium">løn efter skat-beregneren</Link> for
            at se det samlede billede, eller{" "}
            <Link href="/pension" className="underline font-medium">pensionsberegneren</Link> for at planlægge din opsparing.
          </p>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Skat 2026: Alt du skal vide →</span>
          </Link>
          <Link href="/blog/guide-til-laan-og-renter" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide til lån og renter →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
