import type { Metadata } from "next";
import BillaanBeregner from "@/components/BillaanBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

const faqItems = [
  {
    question: "Hvor meget kan jeg låne til bil?",
    answer:
      "Som hovedregel kan du låne op til bilens fulde værdi. De fleste banker tilbyder billån op til 500.000 kr uden sikkerhedsstillelse. Typisk anbefales en udbetaling på 10-20% af bilens pris.",
  },
  {
    question: "Hvad er forskellen på billån og forbrugslån?",
    answer:
      "Billån er ofte billigere end forbrugslån, da bilen kan bruges som sikkerhed. Billån har typisk 2-4% lavere rente end usikrede forbrugslån. Til gengæld kan banken tage bilen tilbage, hvis du ikke kan betale.",
  },
  {
    question: "Kan jeg finansiere en brugt bil med billån?",
    answer:
      "Ja, de fleste banker tilbyder billån til både nye og brugte biler. For brugte biler kan der være krav om bilens alder og stand. Typisk skal bilen være max 10-12 år gammel ved lånets udløb.",
  },
  {
    question: "Hvad betyder ÅOP (Årlig Omkostning i Procent)?",
    answer:
      "ÅOP viser den samlede pris for lånet som årlig procent. Den inkluderer rente, gebyrer og andre omkostninger. Brug ÅOP til at sammenligne lån - jo lavere ÅOP, jo billigere er lånet.",
  },
  {
    question: "Skal jeg vælge fast eller variabel rente på billån?",
    answer:
      "De fleste billån har fast rente i hele løbetiden. Nogle banker tilbyder FlexBillån med variabel rente. Variabel rente kan være billigere, men giver usikkerhed om fremtidige ydelser.",
  },
  {
    question: "Kan jeg indfri billånet før tid?",
    answer:
      "Ja, de fleste billån kan indfries når som helst. Der kan være et mindre indfrielsesgebyr (ofte 1-2 måneders rente). Tjek låneaftalens vilkår for de specifikke regler.",
  },
  {
    question: "Hvad koster det at låne 200.000 kr til bil?",
    answer:
      "Ved et billån på 200.000 kr over 7 år med 6% rente: Månedlig ydelse ca. 3.000 kr, samlet rente ca. 52.000 kr, samlet tilbagebetaling ca. 252.000 kr. Det præcise beløb afhænger af din kreditvurdering og bankens rente.",
  },
  {
    question: "Hvad påvirker min rentesats på billån?",
    answer:
      "Din rente afhænger af: din økonomi (indkomst, gæld, betalingsanmærkninger), udbetalingens størrelse, bilens alder og stand, din relation til banken, og markedets renteniveau.",
  },
];

export const metadata: Metadata = {
  title: "Billånsberegner - Beregn månedlig ydelse på billån | Beregner.dk",
  description:
    "Beregn dit billån nemt og hurtigt. Indtast bilpris, udbetaling, løbetid og rente - se månedlig ydelse, samlet rente og ÅOP. Gratis online billånsberegner.",
  keywords:
    "billån, billånsberegner, billån rente, månedlig ydelse bil, finansiering bil, billån beregner",
};

export default function BillaanPage() {
  return (
    <div>
      <CalculatorSchema
        name="Billånsberegner - Beregn din månedlige ydelse"
        description="Gratis billånsberegner. Beregn månedlig ydelse, samlet rente og ÅOP på dit billån."
        url={`${baseUrl}/billaan`}
        category="FinanceApplication"
      />
      <FAQSchema items={faqItems} />
      <Breadcrumbs items={[{ name: "Lån", href: "/kategori/laan" }, { name: "Billånsberegner", href: "/billaan" }]} />
      <h1 className="text-3xl font-bold mb-2">Billånsberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvad dit billån vil koste om måneden, og se hvor meget du betaler i alt over lånets løbetid.
      </p>

      <BillaanBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan fungerer billån i Danmark</h2>
        <p>
          Når du køber bil i Danmark, kan du finansiere købet på flere måder. Et <strong>billån</strong> er ofte
          den mest fordelagtige løsning, da du kan bruge bilen som <strong>sikkerhed</strong> og derved få en
          <strong>lavere rente</strong> end ved et usikret forbrugslån.
        </p>

        <h2>Typer af billån</h2>

        <h3>Billån med pant i bilen</h3>
        <p>
          Det traditionelle billån hvor banken har <strong>pant i bilen</strong> som sikkerhed. Dette giver
          typisk den <strong>laveste rente (5-8%)</strong>, men banken kan i værste fald tage bilen tilbage
          ved betalingsproblemer.
        </p>
        <ul>
          <li>✅ Lav rente (5-8%)</li>
          <li>✅ Mulighed for større lånebeløb</li>
          <li>✅ Bilen kan bruges som udbetaling ved ny bil</li>
          <li>❌ Pant i bilen</li>
          <li>❌ Kort løbetid (typisk max 7 år)</li>
        </ul>

        <h3>FlexBillån / Variabelt billån</h3>
        <p>
          Et billån med <strong>variabel rente</strong>, der løbende tilpasses markedet. Renten kan både <strong>stige
          og falde</strong> i lånets løbetid.
        </p>
        <ul>
          <li>✅ Lavere startrente end fastforrentet</li>
          <li>✅ Mulighed for at konvertere til fast rente</li>
          <li>❌ Usikkerhed om fremtidige ydelser</li>
          <li>❌ Kan blive dyrere ved rentestigninger</li>
        </ul>

        <h3>Forbrugslån til bil</h3>
        <p>
          Et <strong>usikret lån</strong> uden pant i bilen. Kan bruges til enhver bil, men har <strong>højere rente</strong>
          end traditionelt billån.
        </p>
        <ul>
          <li>✅ Ingen pant i bilen</li>
          <li>✅ Fleksibel brug af pengene</li>
          <li>✅ Ingen krav til bilens alder</li>
          <li>❌ Højere rente (8-15%)</li>
          <li>❌ Typisk lavere lånebeløb</li>
        </ul>

        <h2>Hvad påvirker din rente?</h2>
        <p>
          Den <strong>rente</strong> du tilbydes afhænger af flere faktorer:
        </p>
        <ul>
          <li><strong>Din økonomi:</strong> Indkomst, gældsfrihed og betalingshistorik</li>
          <li><strong>Udbetaling:</strong> Større udbetaling = lavere rente</li>
          <li><strong>Løbetid:</strong> Kortere løbetid = lavere rente</li>
          <li><strong>Bilens værdi:</strong> Nyere/billigere biler giver bedre vilkår</li>
          <li><strong>Bankens politik:</strong> Forskellige banker har forskellige satser</li>
        </ul>

        <h2>Typiske billån satser (2026)</h2>
        <table>
          <thead>
            <tr>
              <th>Bank</th>
              <th>Rente fra</th>
              <th>ÅOP fra</th>
              <th>Udbetaling</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nordea</td>
              <td>5,95%</td>
              <td>6,5%</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Bank Norwegian</td>
              <td>5,49%</td>
              <td>6,0%</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Basisbank</td>
              <td>6,25%</td>
              <td>7,0%</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Santander</td>
              <td>6,50%</td>
              <td>7,2%</td>
              <td>10%</td>
            </tr>
          </tbody>
        </table>

        <h2>Sådan får du det bedste tilbud</h2>
        <ol>
          <li>
            <strong>Sammenlign minimum 3 banker</strong> - brug en sammenligningstjeneste
            som Samlino eller Mybanker
          </li>
          <li>
            <strong>Forhandl med din nuværende bank</strong> - de kan ofte matche eller
            slå konkurrenternes tilbud
          </li>
          <li>
            <strong>Overvej totalomkostninger</strong> - ikke kun den månedlige ydelse,
            men også ÅOP og gebyrer
          </li>
          <li>
            <strong>Tjek din kreditvurdering</strong> - jo bedre score, jo bedre rente
          </li>
          <li>
            <strong>Undgå unødvendige tillægsprodukter</strong> - betal kun for det du
            reelt har brug for
          </li>
        </ol>

        <h2>Hvad koster et billån typisk?</h2>
        <p>
          Eksempel på billån (2026):
        </p>
        <table>
          <thead>
            <tr>
              <th>Lånebeløb</th>
              <th>Udbetaling</th>
              <th>Løbetid</th>
              <th>Rente</th>
              <th>Månedlig ydelse</th>
              <th>Samlet omkostning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>100.000 kr</td>
              <td>10.000 kr</td>
              <td>5 år</td>
              <td>6%</td>
              <td>1.933 kr</td>
              <td>116.000 kr</td>
            </tr>
            <tr>
              <td>200.000 kr</td>
              <td>20.000 kr</td>
              <td>7 år</td>
              <td>6%</td>
              <td>3.017 kr</td>
              <td>253.000 kr</td>
            </tr>
            <tr>
              <td>300.000 kr</td>
              <td>30.000 kr</td>
              <td>7 år</td>
              <td>6%</td>
              <td>4.525 kr</td>
              <td>380.000 kr</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Kontakt altid din bank for
            et præcist lånetilbud med din individuelle rente. Rentesatser varierer
            afhængigt af din økonomi og kreditvurdering.
          </p>
        </div>
      </div>

      <FAQ items={faqItems} />

      <RelatedCalculators current="/billaan" />
    </div>
  );
}
