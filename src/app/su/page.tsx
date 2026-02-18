import type { Metadata } from "next";
import SUBeregner from "@/components/SUBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "SU Beregner 2026 - Beregn din SU og fribeløb",
  description:
    "Beregn din SU 2026. Officielle satser: Udeboende 7.426 kr/md, hjemmeboende 3.692 kr/md. Fribeløb: 20.749 kr/md (videregående). Tjek om du holder dig under fribeløbet.",
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
      "I 2026 er de officielle SU-satser: Udeboende på videregående: 7.426 kr/md, hjemmeboende: 3.692 kr/md (gammel ordning) eller 1.154 kr + tillæg (ny ordning). Forsørgere får ca. 8.575 kr/md. Alle beløb er før skat.",
  },
  {
    question: "Hvad er fribeløbet i 2026?",
    answer:
      "Fribeløbet i 2026 afhænger af din uddannelse: Videregående uddannelse: 20.749 kr/md, ungdomsuddannelse: 15.297 kr/md (begge før AM-bidrag). Fribeløbet gælder årligt, så du kan tjene mere nogle måneder og mindre andre.",
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
      "Hvis din årsindkomst overstiger det samlede fribeløb, skal du tilbagebetale for meget udbetalt SU. Tilbagebetalingen sker året efter via SKAT. Du kan tjekke dit fribeløb løbende på su.dk.",
  },
  {
    question: "Kan jeg få SU-lån?",
    answer:
      "Ja, du kan optage studielån på op til 3.799 kr/md i 2026 under hele uddannelsen. De sidste 12 måneder kan du desuden søge slutlån. Lånet tilbagebetales efter endt uddannelse med renter.",
  },
  {
    question: "Hvad er forskellen på udeboende og hjemmeboende SU?",
    answer:
      "Udeboende på videregående får 7.426 kr/md i 2026, mens hjemmeboende får 3.692 kr/md (gammel ordning) eller 1.154 kr + indkomstafhængigt tillæg (ny ordning). For at få udeboende-sats skal du dokumentere at du ikke bor hos dine forældre.",
  },
  {
    question: "Kan jeg få ekstra SU som forælder?",
    answer:
      "Ja, forsørgere kan få højere SU-sats (ca. 8.575 kr/md i 2026). Enlige forsørgere kan få yderligere tillæg. Derudover kan du søge om børnetilskud som supplement via borger.dk.",
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
      <Breadcrumbs items={[{ name: "Uddannelse", href: "/kategori/uddannelse" }, { name: "SU Beregner", href: "/su" }]} />

      <h1 className="text-3xl font-bold mb-2">SU Beregner 2026</h1>
      <p className="text-gray-600 mb-8">
        Beregn din SU og se om du holder dig under fribeløbet. Opdateret med de
        nyeste 2026-satser.
      </p>

      <SUBeregner />

      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Om SU (Statens Uddannelsesstøtte)</h2>
        <p>
          SU er en støtte fra staten til studerende på videregående uddannelser,
          ungdomsuddannelser og visse andre uddannelser. Du kan modtage SU fra
          du er 18 år.
        </p>

        <h3>SU-satser 2026 (officielle)</h3>
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
                <td>7.426 kr</td>
              </tr>
              <tr>
                <td>Hjemmeboende (før 1/7-2014)</td>
                <td>3.692 kr</td>
              </tr>
              <tr>
                <td>Hjemmeboende (ny ordning)</td>
                <td>1.154 kr + indkomstafhængigt tillæg</td>
              </tr>
              <tr>
                <td>Ungdomsudd. udeboende (18-19 år)</td>
                <td>4.764 kr</td>
              </tr>
              <tr>
                <td>Ungdomsudd. udeboende (20+ år)</td>
                <td>7.426 kr</td>
              </tr>
              <tr>
                <td>Forsørger</td>
                <td>ca. 8.575 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Fribeløb 2026</h2>
        <p>
          Fribeløbet er det beløb, du må tjene ved siden af din SU uden at
          skulle tilbagebetale. Fribeløbet afhænger af din uddannelsestype:
        </p>
        <ul>
          <li><strong>Videregående uddannelse:</strong> 20.749 kr/md (før AM-bidrag)</li>
          <li><strong>Ungdomsuddannelse:</strong> 15.297 kr/md (før AM-bidrag)</li>
        </ul>
        <p>
          Vigtigt: Fribeløbet gælder <strong>årligt</strong>. Så du kan tjene
          mere nogle måneder og mindre andre, så længe din samlede årsindkomst
          ikke overstiger det samlede fribeløb.
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
            <strong>Studielån:</strong> Op til 3.799 kr/md under hele
            uddannelsen (2026)
          </li>
          <li>
            <strong>Slutlån:</strong> Tilgængeligt de sidste 12 måneder
            af uddannelsen
          </li>
        </ul>
        <p>Lånet skal tilbagebetales efter afsluttet uddannelse med renter.</p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Administrer din SU</p>
          <p className="text-blue-700 dark:text-blue-400">
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

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med 2026-satser</p>
          <p className="text-green-700 dark:text-green-400">
            Satserne er de officielle 2026-satser fra su.dk. Sidst verificeret februar 2026.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/su" />
    </div>
  );
}
