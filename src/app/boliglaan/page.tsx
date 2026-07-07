import { generatePageMetadata } from "@/lib/page-helpers";
import dynamic from "next/dynamic";
const BoliglaanBeregner = dynamic(() => import("@/components/BoliglaanBeregner"));
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("boliglaan");
}

export default async function BoliglaanPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boliglaan", locale) || getPageData("boliglaan", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/boliglaan`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/boliglaan" }]} />
      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <BoliglaanBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan fungerer boliglån i Danmark</h2>
        <p>
          Når du køber bolig i Danmark, finansierer du typisk købet med en kombination af:
        </p>
        <ul>
          <li><strong>Udbetaling:</strong> Minimum 5% af boligens pris (anbefalet: 10-20%)</li>
          <li><strong>Realkreditlån:</strong> Op til 80% af boligens værdi</li>
          <li><strong>Banklån/tillægslån:</strong> De resterende 15% (mellem udbetaling og realkredit)</li>
        </ul>

        <h2>Fastforrentet vs. variabel rente</h2>

        <h3>Fastforrentet lån</h3>
        <p>
          Med et <strong>fastforrentet lån</strong> kender du din ydelse i hele lånets løbetid. Det giver <strong>tryghed</strong> og
          <strong>budgetsikkerhed</strong>, men typisk til en lidt højere rente end variabel.
        </p>
        <ul>
          <li>Fast ydelse hele perioden</li>
          <li>Beskyttet mod rentestigninger</li>
          <li>Nem at budgettere</li>
          <li>Typisk højere startrente</li>
          <li>Kan være dyrere at indfri</li>
        </ul>

        <h3>Variabel rente (F-kort, F1, F3, F5)</h3>
        <p>
          Med <strong>variabel rente</strong> justeres din rente løbende. Du kan ofte få <strong>lavere rente</strong>, men med <strong>risiko for stigninger</strong>.
        </p>
        <ul>
          <li>Ofte lavere rente</li>
          <li>Fleksibelt at indfri</li>
          <li>Usikker fremtidig ydelse</li>
          <li>Risiko ved rentestigninger</li>
        </ul>

        <h2>Hvad er bidragssatsen?</h2>
        <p>
          <strong>Bidragssatsen</strong> er det realkreditinstituttet tager for at administrere dit lån.
          Den afhænger af:
        </p>
        <ul>
          <li><strong>Belåningsgrad:</strong> Jo højere belåning, jo højere bidrag</li>
          <li><strong>Boligtype:</strong> Ejerlejligheder har ofte højere bidrag</li>
          <li><strong>Låntype:</strong> Afdragsfrie lån har højere bidrag</li>
        </ul>
        <p>
          Typiske bidragssatser (2026):
        </p>
        <table>
          <thead>
            <tr>
              <th>Belåningsgrad</th>
              <th>Med afdrag</th>
              <th>Afdragsfrit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0-40%</td>
              <td>0,45-0,65%</td>
              <td>0,55-0,85%</td>
            </tr>
            <tr>
              <td>40-60%</td>
              <td>0,55-0,85%</td>
              <td>0,75-1,15%</td>
            </tr>
            <tr>
              <td>60-80%</td>
              <td>0,75-1,25%</td>
              <td>1,05-1,55%</td>
            </tr>
          </tbody>
        </table>

        <h2>Skattefradrag på renteudgifter</h2>
        <p>
          I Danmark kan du <strong>trække renteudgifter fra i skat</strong>. I 2024-2026 er <strong>fradragsværdien</strong>:
        </p>
        <ul>
          <li><strong>Op til ca. 50.000 kr:</strong> ca. 33% fradrag</li>
          <li><strong>Over 50.000 kr:</strong> ca. 25,6% fradrag</li>
        </ul>
        <p>
          Vores beregner bruger en gennemsnitlig <strong>fradragsværdi på 25,6%</strong> som et konservativt estimat.
        </p>

        <h2>Tips til boligkøb</h2>
        <ul>
          <li><strong>Spar op til mindst 5% udbetaling</strong> - gerne mere for bedre vilkår</li>
          <li><strong>Få flere tilbud</strong> - sammenlign realkredit og bank</li>
          <li><strong>Overvej din risikoprofil</strong> - fast rente = tryghed, variabel = risiko/gevinst</li>
          <li><strong>Regn på totaløkonomi</strong> - ikke kun den månedlige ydelse</li>
          <li><strong>Husk omkostninger</strong> - kursskæring, tinglysning, advokat, etc.</li>
        </ul>

        <h2>Hvad påvirker din ydelse mest?</h2>
        <p>
          I rækkefølge af betydning:
        </p>
        <ol>
          <li><strong>Lånebeløbet</strong> - jo mere du låner, jo mere betaler du</li>
          <li><strong>Renten</strong> - selv små renteændringer har stor effekt over 30 år</li>
          <li><strong>Løbetiden</strong> - kortere løbetid = højere ydelse, men færre renter totalt</li>
          <li><strong>Bidragssatsen</strong> - kan være næsten lige så dyr som selve renten</li>
        </ol>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Kontakt altid din bank eller
            realkreditinstitut for præcise tilbud. Der kan være yderligere omkostninger som
            kursskæring, stiftelsesomkostninger, tinglysningsafgift m.v.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/boliglaan" />
      </div>
      <Sidebar currentHref="/boliglaan" adSlotId="boliglaan-sidebar" />
    </div>
  );
}
