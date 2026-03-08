import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Privatøkonomi for unge: 5 beregnere du skal kende | MinBeregner.dk",
    description:
      "Guide til privatøkonomi for unge: SU-beregning, budget, husleje, opsparing og skat. 5 gratis beregnere der hjælper dig med at få styr på økonomien.",
    keywords: [
      "privatøkonomi unge",
      "økonomi studerende",
      "budget unge",
      "SU budget",
      "opsparing unge",
      "husleje unge",
      "skat studerende",
    ],
    openGraph: {
      title: "Privatøkonomi for unge: 5 beregnere du skal kende",
      description: "5 gratis beregnere der hjælper unge med privatøkonomien.",
      url: `${baseUrl}/blog/privatoekonomi-for-unge`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/privatoekonomi-for-unge`,
    },
  };
}

const faqItems = [
  {
    question: "Hvor meget bør man spare op som ung?",
    answer:
      "En god tommelfingerregel er at spare 10-20% af din indkomst. Som studerende kan selv 500-1.000 kr/md gøre en forskel over tid takket være renters rente-effekten.",
  },
  {
    question: "Hvor meget bør man bruge på husleje som studerende?",
    answer:
      "Max 30-33% af din samlede indkomst (SU + job + evt. boligstøtte). Med SU på 6.397 kr og et studiejob bør huslejen ideelt ikke overstige 4.000-5.500 kr.",
  },
  {
    question: "Skal man betale skat af SU?",
    answer:
      "Ja, SU er skattepligtig. Men med personfradraget på 49.700 kr/år betaler de fleste studerende uden studiejob kun lidt eller ingen skat.",
  },
];

export default function PrivatoekonomieGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Privatøkonomi for unge</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Privatøkonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Privatøkonomi for unge: 5 beregnere du skal kende
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>7 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          At flytte hjemmefra og styre sin egen økonomi for første gang kan være overvældende.
          SU, husleje, fribeløb, skat — der er mange bolde i luften. Her er 5 gratis beregnere,
          der hjælper dig med at få overblik.
        </p>

        <h2>1. SU-beregneren: Ved hvad du får</h2>
        <p>
          SU er rygraden i de fleste studerendes økonomi. I 2026 får du som udeboende
          studerende <strong>6.397 kr/md</strong> før skat. Men hvad får du reelt udbetalt?
          Det afhænger af din trækprocent.
        </p>
        <p>
          Med vores{" "}
          <Link href="/su" className="text-blue-600 hover:underline">SU-beregner</Link> kan du:
        </p>
        <ul>
          <li>Se din SU-sats (hjemme- vs. udeboende)</li>
          <li>Beregne dit fribeløb</li>
          <li>Se hvor meget du kan tjene ved siden af</li>
        </ul>
        <p>
          <strong>Pro-tip:</strong> Overvej at fravælge SU i sommermånederne, hvis du har et
          godt sommerjob. Det giver et højere fribeløb resten af året.
        </p>

        <h2>2. Huslejeberegneren: Hvad har du råd til?</h2>
        <p>
          Husleje er typisk den største faste udgift. Tommelfingerreglen siger max <strong>30%
          af din indkomst</strong> på husleje. Men hvad betyder det i praksis?
        </p>
        <p>
          Brug vores{" "}
          <Link href="/husleje" className="text-blue-600 hover:underline">huslejeberegner</Link> til
          at se, hvad du har råd til baseret på din SU og eventuelle studiejobindkomst.
        </p>
        <p>
          <strong>Eksempel:</strong> Med SU (6.397 kr) + studiejob (5.000 kr) = 11.397 kr/md brutto.
          30% af dette er ca. 3.400 kr — men husk at tjekke{" "}
          <Link href="/boligstoette" className="text-blue-600 hover:underline">boligstøtte</Link>,
          som kan give dig op til 1.000-2.000 kr ekstra om måneden.
        </p>

        <h2>3. Løn efter skat: Hvad får du udbetalt?</h2>
        <p>
          Når du starter dit første studiejob, kan det være forvirrende at se forskellen mellem
          brutto- og nettoløn. Med vores{" "}
          <Link href="/loen-efter-skat" className="text-blue-600 hover:underline">løn efter skat-beregner</Link> kan
          du se præcist, hvad du får udbetalt.
        </p>
        <p>
          Som studerende har du et personfradrag på 49.700 kr/år. Hvis din samlede indkomst
          (SU + job) er under dette beløb, betaler du ingen skat. Men de fleste studerende
          med studiejob kommer over grænsen.
        </p>

        <h2>4. Opsparingsberegneren: Start tidligt</h2>
        <p>
          Det kan virke umuligt at spare op som studerende, men selv små beløb gør en kæmpe
          forskel over tid takket være <strong>renters rente-effekten</strong>.
        </p>
        <p>
          Brug vores{" "}
          <Link href="/opsparing" className="text-blue-600 hover:underline">opsparingsberegner</Link> til
          at se, hvad dine penge vokser til.
        </p>
        <p>
          <strong>Eksempel:</strong> Sparer du 500 kr/md fra du er 20 til du er 30 med 7% afkast,
          har du ca. 87.000 kr. Fortsætter du til du er 60, har du over 1 million kr — bare
          fra 500 kr/md!
        </p>

        <h2>5. Procentberegneren: Forstå tilbud og renter</h2>
        <p>
          Procenter dukker op overalt: rabatter, renter, skattesatser, lønforhøjelser. Med vores{" "}
          <Link href="/procent" className="text-blue-600 hover:underline">procentberegner</Link> kan
          du hurtigt beregne:
        </p>
        <ul>
          <li>Hvad 30% rabat svarer til i kroner</li>
          <li>Hvor mange procent din husleje er steget</li>
          <li>Hvad renten på dit SU-lån koster</li>
        </ul>

        <h2>Budget-skabelon for studerende</h2>
        <p>
          Her er et realistisk månedsbudget for en udeboende studerende i 2026:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Post</th>
                <th>Beløb</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Indkomst</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>SU (efter skat)</td>
                <td>ca. 5.800 kr</td>
              </tr>
              <tr>
                <td>Studiejob (efter skat)</td>
                <td>ca. 4.000 kr</td>
              </tr>
              <tr>
                <td>Boligstøtte</td>
                <td>ca. 1.000 kr</td>
              </tr>
              <tr>
                <td><strong>Total indkomst</strong></td>
                <td><strong>ca. 10.800 kr</strong></td>
              </tr>
              <tr>
                <td><strong>Udgifter</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>Husleje</td>
                <td>4.000 kr</td>
              </tr>
              <tr>
                <td>Mad og dagligvarer</td>
                <td>2.500 kr</td>
              </tr>
              <tr>
                <td>Transport</td>
                <td>500 kr</td>
              </tr>
              <tr>
                <td>Forsikring</td>
                <td>200 kr</td>
              </tr>
              <tr>
                <td>Telefon/internet</td>
                <td>250 kr</td>
              </tr>
              <tr>
                <td>Fritid og socialt</td>
                <td>1.500 kr</td>
              </tr>
              <tr>
                <td>Opsparing</td>
                <td>500 kr</td>
              </tr>
              <tr>
                <td>Uforudsete udgifter</td>
                <td>350 kr</td>
              </tr>
              <tr>
                <td><strong>Total udgifter</strong></td>
                <td><strong>ca. 9.800 kr</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Gode råd til din privatøkonomi</h2>
        <ul>
          <li><strong>Lav budget:</strong> Brug de første 30 dage på at tracke alle udgifter</li>
          <li><strong>Automatisk opsparing:</strong> Sæt en fast overførsel den 1. i måneden</li>
          <li><strong>Undgå forbrugslån:</strong> Renten er typisk 10-25% — det er ekstremt dyrt</li>
          <li><strong>Udnyt studierabatter:</strong> Transport, software, streaming, fitness</li>
          <li><strong>Madplan:</strong> Planlæg ugens måltider og undgå impulskøb</li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Kom i gang</p>
          <p className="text-blue-700 dark:text-blue-400">
            Start med at beregne din <Link href="/su" className="underline font-medium">SU</Link> og
            se hvad du har råd til i <Link href="/husleje" className="underline font-medium">husleje</Link>.
            Tjek også om du kan få <Link href="/boligstoette" className="underline font-medium">boligstøtte</Link>.
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
          <Link href="/blog/su-2026-satser-og-regler" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">SU 2026: Satser og regler →</span>
          </Link>
          <Link href="/blog/30-procent-reglen-husleje" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">30% reglen: Hvor meget bør du bruge på husleje? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
