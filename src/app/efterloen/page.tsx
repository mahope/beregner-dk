import type { Metadata } from "next";
import EfterloensBeregner from "@/components/EfterloensBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Efterløn beregner 2026 - Se hvad du kan få udbetalt",
  description:
    "Beregn efterløn 2026. Max sats: ca. 20.057 kr/md (91% af dagpenge). Se hvornår du kan gå på efterløn, betingelser og præcis sats ud fra din indkomst. Gratis beregner.",
  keywords: [
    "efterløn",
    "efterløn beregner",
    "efterlønssats 2026",
    "beregn efterløn",
    "hvornår kan jeg gå på efterløn",
    "efterløn alder",
    "efterløn sats",
    "efterlønsbidrag",
    "tidlig pension",
  ],
  openGraph: {
    title: "Efterløn beregner 2026",
    description:
      "Beregn hvad du kan få i efterløn. Gratis beregner med 2026 satser.",
    url: `${baseUrl}/efterloen`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/efterloen`,
  },
};

const faqItems = [
  {
    question: "Hvad er efterløn?",
    answer:
      "Efterløn er en frivillig tilbagetrækningsordning for ældre lønmodtagere og selvstændige. Du kan gå på efterløn nogle år før folkepensionsalderen, hvis du opfylder betingelserne.",
  },
  {
    question: "Hvad er efterlønssatsen i 2026?",
    answer:
      "I 2026 er den maksimale efterlønssats ca. 20.057 kr. om måneden (91% af dagpengesatsen) ved fuldtidsforsikring. Satsen afhænger af din tidligere indkomst og forsikringsstatus.",
  },
  {
    question: "Hvornår kan jeg gå på efterløn?",
    answer:
      "Efterlønsalderen stiger gradvist og afhænger af dit fødselsår. I 2026 kan personer født i 1963 tidligst gå på efterløn som 64-årige. Tjek borger.dk for din præcise efterlønsalder.",
  },
  {
    question: "Hvad er betingelserne for efterløn?",
    answer:
      "Du skal have betalt efterlønsbidrag i mindst 30 år, være medlem af en a-kasse, være tilmeldt efterlønsordningen, og have ret til dagpenge på overgangstidspunktet.",
  },
  {
    question: "Kan jeg arbejde mens jeg er på efterløn?",
    answer:
      "Ja, du kan arbejde ved siden af efterlønnen, men din efterløn reduceres time for time. Arbejder du mere end 962 timer om året, kan du optjene skattefri præmie til din folkepension.",
  },
  {
    question: "Hvad er efterlønspræmien?",
    answer:
      "Hvis du arbejder et vist antal timer mens du er på efterløn, kan du optjene skattefri præmieportioner. Hver portion er ca. 15.500 kr. (2026), og du kan optjene op til 12 portioner.",
  },
  {
    question: "Kan jeg få efterløn hvis jeg bor i udlandet?",
    answer:
      "Du kan som udgangspunkt kun få efterløn, hvis du bor i Danmark eller et andet EØS-land. Der er særlige regler for ophold uden for EØS.",
  },
  {
    question: "Hvad sker der med min pension hvis jeg vælger efterløn?",
    answer:
      "Din pensionsopsparing påvirker ikke din ret til efterløn, men store pensionsudbetalinger kan reducere din efterløn. Udbetaling fra pension tæller som indkomst.",
  },
];

const relatedCalculators = [
  { title: "Pension", href: "/pension", description: "Beregn din pension" },
  { title: "Dagpenge", href: "/dagpenge", description: "Dagpengesats" },
  { title: "Løn efter skat", href: "/loen-efter-skat", description: "Nettoløn" },
  { title: "Opsparing", href: "/opsparing", description: "Opsparingsberegner" },
];

export default function EfterloenPage() {
  return (
    <div>
      <CalculatorSchema
        name="Efterløn beregner"
        description="Beregn hvad du kan få i efterløn og se betingelser for ordningen."
        url={`${baseUrl}/efterloen`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Økonomi", href: "/kategori/oekonomi" }, { name: "Efterløn", href: "/efterloen" }]} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Efterløn beregner 2026
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Se hvad du kan forvente at få i efterløn, og hvornår du tidligst kan gå på efterløn. 
              Beregneren bruger de aktuelle satser for 2026.
            </p>
          </header>

          <section className="mb-12">
            <EfterloensBeregner />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om efterløn
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Efterløn</strong> er en ordning, der giver dig mulighed for at <strong>trække dig tilbage fra
                arbejdsmarkedet</strong> før folkepensionsalderen. Ordningen er frivillig og kræver,
                at du har indbetalt til <strong>efterlønsordningen</strong> gennem din a-kasse.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Efterlønsalder (2026)</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Født</th>
                    <th className="border p-3 text-left">Efterlønsalder</th>
                    <th className="border p-3 text-left">Folkepensionsalder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">1961</td>
                    <td className="border p-3">63 år</td>
                    <td className="border p-3">68 år</td>
                  </tr>
                  <tr>
                    <td className="border p-3">1962</td>
                    <td className="border p-3">63½ år</td>
                    <td className="border p-3">68 år</td>
                  </tr>
                  <tr>
                    <td className="border p-3">1963</td>
                    <td className="border p-3">64 år</td>
                    <td className="border p-3">69 år</td>
                  </tr>
                  <tr>
                    <td className="border p-3">1964</td>
                    <td className="border p-3">64½ år</td>
                    <td className="border p-3">69 år</td>
                  </tr>
                  <tr>
                    <td className="border p-3">1965+</td>
                    <td className="border p-3">65 år</td>
                    <td className="border p-3">69+ år</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-gray-500 mt-2">
                * Aldrene reguleres løbende baseret på middellevetiden.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ofte stillede spørgsmål
            </h2>
            <FAQ items={faqItems} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Relaterede beregnere
            </h2>
            <RelatedCalculators calculators={relatedCalculators} />
          </section>
        </article>
      </main>
    </div>
  );
}
