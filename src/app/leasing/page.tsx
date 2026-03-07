import type { Metadata } from "next";
import LeasingBeregner from "@/components/LeasingBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Leasing Beregner 2026 - Beregn leasingydelse for bil | MinBeregner.dk",
  description:
    "Beregn din månedlige leasingydelse gratis. Sammenlign leasing vs. billån vs. kontantkøb. Indtast bilpris, restværdi og løbetid — se hvad det koster.",
  keywords: [
    "leasing beregner",
    "bil leasing",
    "leasingydelse beregner",
    "privat leasing",
    "erhvervsleasing",
    "leasing vs køb",
    "bil leasing pris",
    "leasing bil beregner",
  ],
  openGraph: {
    title: "Leasing Beregner - Beregn leasingydelse for bil",
    description: "Beregn leasingydelse og sammenlign leasing vs. lån vs. kontantkøb.",
    url: `${baseUrl}/leasing`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/leasing`,
  },
};

const faqItems = [
  {
    question: "Hvordan beregnes en leasingydelse?",
    answer: "Leasingydelsen dækker bilens værditab (pris minus restværdi fordelt over perioden) plus renter af den gennemsnitlige gæld. Derudover kan der komme gebyrer og forsikring.",
  },
  {
    question: "Hvad er forskellen på leasing og billån?",
    answer: "Ved leasing lejer du bilen og afleverer den efter perioden. Ved billån ejer du bilen og kan sælge den. Leasing har ofte lavere månedlig ydelse, men du opbygger ingen egenkapital.",
  },
  {
    question: "Hvad er restværdi?",
    answer: "Restværdien er bilens forventede værdi ved leasingperiodens udløb. Jo højere restværdi, jo lavere månedlig ydelse — men du bærer risikoen hvis bilen er mindre værd ved aflevering.",
  },
  {
    question: "Er privat leasing billigere end billån?",
    answer: "Privat leasing giver typisk lavere månedlig ydelse end billån, men du ejer ikke bilen og opbygger ingen egenkapital. Over flere biler kan billån eller kontantkøb være billigere samlet set.",
  },
  {
    question: "Kan jeg trække leasing fra i skat?",
    answer: "Privatpersoner kan ikke trække leasing fra. Virksomheder kan fratrække leasingydelsen som driftsudgift og få momsfradrag, hvilket gør erhvervsleasing skattemæssigt fordelagtigt.",
  },
];

const relatedCalculators = [
  { title: "Billån", description: "Beregn ydelse på billån", href: "/billaan", icon: "🚗" },
  { title: "Bil Værdtab", description: "Beregn din bils værditab", href: "/bil", icon: "🚙" },
  { title: "Brændstofberegner", description: "Beregn dine køreomkostninger", href: "/braendstof", icon: "⛽" },
  { title: "Låneberegner", description: "Sammenlign lån og se afdragsplan", href: "/laaneberegner", icon: "🏦" },
];

export default function LeasingPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name="Leasing Beregner"
          description="Beregn månedlig leasingydelse for bil. Sammenlign leasing vs. billån vs. kontantkøb."
          url={`${baseUrl}/leasing`}
          category="FinanceApplication"
        />
        <FAQSchema items={faqItems} />
        <Breadcrumbs items={[{ name: "Lån", href: "/kategori/laan" }, { name: "Leasing Beregner", href: "/leasing" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">Leasing Beregner</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Beregn din månedlige leasingydelse for bil og sammenlign med billån og kontantkøb. Se hvad det reelt koster at lease en bil.
        </p>

        <LeasingBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Leasing af bil i Danmark</h2>
          <p>
            Leasing er blevet en <strong>populær måde at få bil på</strong> i Danmark. I stedet for at købe bilen betaler du en <strong>fast månedlig ydelse</strong> for at bruge den i en aftalt periode — typisk <strong>12-48 måneder</strong>. Ved periodens udløb afleverer du bilen.
          </p>

          <h2>Privat leasing vs. erhvervsleasing</h2>
          <p>
            Ved <strong>privat leasing</strong> betaler du en fast ydelse inkl. moms. Du kan ikke fradrage ydelsen i skat. Prisen inkluderer typisk service og vejhjælp, men ikke forsikring.
          </p>
          <p>
            Ved <strong>erhvervsleasing</strong> kan virksomheden fradrage leasingydelsen som driftsudgift og trække momsen fra. Det gør leasing særligt attraktivt for selvstændige og virksomheder.
          </p>

          <h2>Leasing vs. billån vs. kontantkøb</h2>
          <p>
            Hver <strong>finansieringsform</strong> har fordele:
          </p>
          <ul>
            <li><strong>Leasing:</strong> Lav månedlig ydelse, men du ejer ikke bilen</li>
            <li><strong>Billån:</strong> Du ejer bilen og opbygger egenkapital, men højere ydelse</li>
            <li><strong>Kontantkøb:</strong> Ingen renter, men kræver stor opsparing</li>
          </ul>

          <h2>Hvad påvirker leasingydelsen?</h2>
          <ul>
            <li><strong>Bilpris:</strong> Jo dyrere bilen, jo højere ydelse</li>
            <li><strong>Restværdi:</strong> Jo højere restværdi, jo lavere ydelse (du betaler kun for værditabet)</li>
            <li><strong>Løbetid:</strong> Længere perioder giver lavere ydelse, men mere i renter</li>
            <li><strong>Rente/ÅOP:</strong> Leasingselskabets finansieringsomkostning</li>
            <li><strong>Udbetaling:</strong> Større udbetaling sænker den månedlige ydelse</li>
          </ul>
        </div>

        <FAQ items={faqItems} />
        <RelatedCalculators calculators={relatedCalculators} />
      </div>

      <Sidebar currentHref="/leasing" adSlotId="leasing-sidebar" />
    </div>
  );
}
