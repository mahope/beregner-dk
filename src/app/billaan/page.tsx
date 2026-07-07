import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BillaanBeregner from "@/components/BillaanBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("billaan");
}

export default async function BillaanPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("billaan", locale) || getPageData("billaan", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/billaan`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/billaan" }]} />
      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <BillaanBeregner />

      {locale === "da" && (
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

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Kontakt altid din bank for
            et præcist lånetilbud med din individuelle rente. Rentesatser varierer
            afhængigt af din økonomi og kreditvurdering.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/billaan" />
    </div>
  );
}
