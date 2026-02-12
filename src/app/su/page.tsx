import type { Metadata } from "next";
import SUBeregner from "@/components/SUBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "SU Beregner 2026 - Beregn din SU og fribeløb",
  description:
    "Hvad får du i SU? 2026 satser: Udeboende 6.888 kr/md, hjemmeboende 3.046 kr/md. Fribeløb: 14.943 kr/md. Beregn din SU og tjek om du holder dig under fribeløbet. Gratis beregner.",
  keywords: [
    "su beregner",
    "su 2026",
    "beregn su",
    "fribeløb",
    "su satser",
    "hvad får jeg i su",
    "su udeboende",
    "su hjemmeboende",
    "statens uddannelsesstøtte",
    "su-klip",
  ],
  openGraph: {
    title: "SU Beregner 2026 - Beregn din SU og fribeløb",
    description:
      "Beregn din SU og tjek dit fribeløb med de nyeste 2026 satser. Gratis SU beregner.",
    url: `${baseUrl}/su`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/su`,
  },
};

const faqItems = [
  {
    question: "Hvor meget kan jeg få i SU 2026?",
    answer:
      "I 2026 er SU-satserne ca.: Udeboende på videregående: 6.888 kr/md, hjemmeboende: 3.046 kr/md. Udeboende forsørgere får ca. 8.594 kr/md. Alle beløb er før skat.",
  },
  {
    question: "Hvad er fribeløbet i 2026?",
    answer:
      "Fribeløbet i 2026 er ca. 14.943 kr/md (før AM-bidrag) i måneder med SU. I måneder uden SU eller ved uddannelsens start/slut er det forhøjede fribeløb ca. 20.810 kr/md.",
  },
  {
    question: "Hvem kan få SU?",
    answer:
      "Du kan få SU hvis du er dansk statsborger eller EU-borger, er indskrevet på en SU-berettigende uddannelse, er studieaktiv, og er fyldt 18 år. Du må ikke have opbrugt dine SU-klip.",
  },
  {
    question: "Hvor mange SU-klip får jeg?",
    answer:
      "På videregående uddannelser får du 70 SU-klip total, som kan bruges til flere uddannelser. På ungdomsuddannelser får du klip svarende til uddannelsens normerede længde.",
  },
  {
    question: "Hvad sker der hvis jeg tjener over fribeløbet?",
    answer:
      "Hvis din årsindkomst overstiger det samlede fribeløb, skal du tilbagebetale for meget udbetalt SU. Tilbagebetalingen sker året efter via SKAT.",
  },
  {
    question: "Kan jeg få SU-lån?",
    answer:
      "Ja, du kan optage studielån (op til ca. 3.594 kr/md under hele uddannelsen) og slutlån (op til ca. 8.782 kr/md de sidste 12 måneder). Lånet tilbagebetales efter endt uddannelse.",
  },
  {
    question: "Hvad er forskellen på udeboende og hjemmeboende SU?",
    answer:
      "Udeboende får højere SU (ca. 6.888 kr/md) fordi de skal betale husleje. For at få udeboende-sats skal du dokumentere at du ikke bor hos dine forældre.",
  },
  {
    question: "Kan jeg få ekstra SU som forælder?",
    answer:
      "Ja, forsørgere kan få højere SU-sats. Enlige forsørgere får mest (ca. 8.594 kr/md). Derudover kan du søge om børnetilskud som supplement.",
  },
];

export default function SUPage() {
  return (
    <div>
      <CalculatorSchema
        name="SU Beregner - Statens Uddannelsesstøtte"
        description="Gratis SU beregner. Beregn din SU og fribeløb for 2026."
        url={`${baseUrl}/su`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "SU Beregner", url: `${baseUrl}/su` },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-4">
        <a href="/" className="hover:text-blue-600">
          Forside
        </a>
        <span className="mx-2">/</span>
        <span className="text-gray-900">SU Beregner</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">SU Beregner 2026</h1>
      <p className="text-gray-600 mb-8">
        Beregn din SU og se om du holder dig under fribeløbet. Opdateret med de
        nyeste 2026-satser.
      </p>

      <SUBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Om SU (Statens Uddannelsesstøtte)</h2>
        <p>
          SU er en støtte fra staten til studerende på videregående uddannelser,
          ungdomsuddannelser og visse andre uddannelser. Du kan modtage SU fra
          du er 18 år.
        </p>

        <h3>SU-satser 2026</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Månedlig SU (før skat)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Udeboende, videregående</td>
                <td>ca. 6.888 kr</td>
              </tr>
              <tr>
                <td>Hjemmeboende</td>
                <td>ca. 3.046 kr</td>
              </tr>
              <tr>
                <td>Udeboende forsørger</td>
                <td>ca. 8.594 kr</td>
              </tr>
              <tr>
                <td>Enlig forsørger</td>
                <td>ca. 8.594 kr + tillæg</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Fribeløb</h2>
        <p>
          Fribeløbet er det beløb, du må tjene ved siden af din SU uden at
          skulle tilbagebetale. I 2026 er det ca.{" "}
          <strong>14.943 kr/md</strong> (før AM-bidrag).
        </p>
        <p>
          Vigtigt: Fribeløbet gælder <strong>årligt</strong>. Så du kan tjene
          mere nogle måneder og mindre andre, så længe din samlede årsindkomst
          ikke overstiger det samlede fribeløb.
        </p>

        <h3>Forhøjet fribeløb</h3>
        <p>
          I måneder hvor du starter eller slutter din uddannelse, samt i måneder
          uden SU, får du et forhøjet fribeløb (ca. 20.810 kr/md i 2026).
        </p>

        <h2>SU-klip</h2>
        <p>
          Du får tildelt et antal SU-klip (måneder med SU) baseret på din
          uddannelses normerede varighed:
        </p>
        <ul>
          <li>
            <strong>Videregående:</strong> 70 klip total (kan bruges til flere
            uddannelser)
          </li>
          <li>
            <strong>Ungdomsuddannelse:</strong> Klip svarende til uddannelsens
            længde
          </li>
          <li>
            <strong>Bonus-klip:</strong> Ekstra klip hvis du bliver færdig på
            normeret tid
          </li>
        </ul>

        <h2>SU-lån</h2>
        <p>Du kan optage SU-lån som supplement til din SU:</p>
        <ul>
          <li>
            <strong>Studielån:</strong> Op til 3.594 kr/md under hele
            uddannelsen
          </li>
          <li>
            <strong>Slutlån:</strong> Op til 8.782 kr/md de sidste 12 måneder
          </li>
        </ul>
        <p>Lånet skal tilbagebetales efter afsluttet uddannelse med renter.</p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Administrer din SU</p>
          <p className="text-blue-700">
            Du kan søge SU, se din klipsaldo og tjekke dit fribeløb på{" "}
            <a
              href="https://www.su.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              su.dk
            </a>
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Satserne er estimater for 2026 og kan afvige fra de officielle
            satser. Tjek altid su.dk for de aktuelle satser.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/su" />
    </div>
  );
}
