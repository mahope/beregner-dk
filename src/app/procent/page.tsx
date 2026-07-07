import ProcentBeregner from "@/components/ProcentBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("procent");
}

export default async function ProcentPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("procent", locale) || getPageData("procent", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/procent`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/procent" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <ProcentBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du procentberegneren</h2>
        <p>
          Vores procentberegner kan hjælpe dig med fire forskellige typer
          beregninger:
        </p>
        <ol>
          <li>
            <strong>Find procent:</strong> Hvor mange procent er X af Y?
          </li>
          <li>
            <strong>Find resultat:</strong> Hvad er X% af Y?
          </li>
          <li>
            <strong>Find heltal:</strong> Hvis X er Y%, hvad er så 100%?
          </li>
          <li>
            <strong>Procentvis ændring:</strong> Hvor mange procent er
            stigningen/faldet fra X til Y?
          </li>
        </ol>

        <h2>Procentregning i hverdagen</h2>
        <p>Procent bruges overalt i hverdagen:</p>
        <ul>
          <li>
            <strong>Rabatter:</strong> 25% rabat på en vare til 400 kr = du
            sparer 100 kr
          </li>
          <li>
            <strong>Moms:</strong> 25% moms på 1000 kr = 250 kr i moms (1250 kr
            total)
          </li>
          <li>
            <strong>Renter:</strong> 5% rente på 10.000 kr = 500 kr i rente
          </li>
          <li>
            <strong>Lønstigninger:</strong> 3% stigning på 30.000 kr = 900 kr
            mere
          </li>
          <li>
            <strong>Skat:</strong> 37% skat af 40.000 kr = 14.800 kr i skat
          </li>
        </ul>

        <h2>Hurtige procent-tricks</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>For at finde...</th>
                <th>Gør dette</th>
                <th>Eksempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>Flyt kommaet én plads til venstre</td>
                <td>10% af 250 = 25</td>
              </tr>
              <tr>
                <td>5%</td>
                <td>Find 10% og halver</td>
                <td>5% af 250 = 12,5</td>
              </tr>
              <tr>
                <td>25%</td>
                <td>Divider med 4</td>
                <td>25% af 200 = 50</td>
              </tr>
              <tr>
                <td>50%</td>
                <td>Halver tallet</td>
                <td>50% af 180 = 90</td>
              </tr>
              <tr>
                <td>1%</td>
                <td>Divider med 100</td>
                <td>1% af 350 = 3,5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Procentregningens formler</h2>
        <ul>
          <li>
            <strong>Find procent:</strong> Procent = (Del / Heltal) × 100
          </li>
          <li>
            <strong>Find del:</strong> Del = (Procent / 100) × Heltal
          </li>
          <li>
            <strong>Find heltal:</strong> Heltal = Del × (100 / Procent)
          </li>
          <li>
            <strong>Procentvis ændring:</strong> ((Ny - Gammel) / Gammel) × 100
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Husk at 50% af 40 er det samme som 40% af 50 - begge giver 20. Dette
            trick kan gøre hovedregning nemmere!
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så här använder du procenträknaren</h2>
        <p>
          Vår procenträknare kan hjälpa dig med fyra olika typer av
          beräkningar:
        </p>
        <ol>
          <li>
            <strong>Hitta procent:</strong> Hur många procent är X av Y?
          </li>
          <li>
            <strong>Hitta resultat:</strong> Vad är X% av Y?
          </li>
          <li>
            <strong>Hitta heltal:</strong> Om X är Y%, vad är då 100%?
          </li>
          <li>
            <strong>Procentuell förändring:</strong> Hur många procent är
            ökningen/minskningen från X till Y?
          </li>
        </ol>

        <h2>Procenträkning i vardagen</h2>
        <p>Procent används överallt i vardagen:</p>
        <ul>
          <li>
            <strong>Rabatter:</strong> 25% rabatt på en vara för 400 kr = du
            sparar 100 kr
          </li>
          <li>
            <strong>Moms:</strong> 25% moms på 1000 kr = 250 kr i moms (1250 kr
            totalt)
          </li>
          <li>
            <strong>Ränta:</strong> 5% ränta på 10 000 kr = 500 kr i ränta
          </li>
          <li>
            <strong>Löneökningar:</strong> 3% ökning på 30 000 kr = 900 kr
            mer
          </li>
          <li>
            <strong>Skatt:</strong> 37% skatt på 40 000 kr = 14 800 kr i skatt
          </li>
        </ul>

        <h2>Snabba procent-knep</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>För att hitta...</th>
                <th>Gör så här</th>
                <th>Exempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>Flytta kommat ett steg åt vänster</td>
                <td>10% av 250 = 25</td>
              </tr>
              <tr>
                <td>5%</td>
                <td>Hitta 10% och halvera</td>
                <td>5% av 250 = 12,5</td>
              </tr>
              <tr>
                <td>25%</td>
                <td>Dividera med 4</td>
                <td>25% av 200 = 50</td>
              </tr>
              <tr>
                <td>50%</td>
                <td>Halvera talet</td>
                <td>50% av 180 = 90</td>
              </tr>
              <tr>
                <td>1%</td>
                <td>Dividera med 100</td>
                <td>1% av 350 = 3,5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Procenträkningens formler</h2>
        <ul>
          <li>
            <strong>Hitta procent:</strong> Procent = (Del / Heltal) × 100
          </li>
          <li>
            <strong>Hitta del:</strong> Del = (Procent / 100) × Heltal
          </li>
          <li>
            <strong>Hitta heltal:</strong> Heltal = Del × (100 / Procent)
          </li>
          <li>
            <strong>Procentuell förändring:</strong> ((Ny - Gammal) / Gammal) × 100
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips</p>
          <p className="text-blue-700">
            Kom ihåg att 50% av 40 är samma sak som 40% av 50 - båda ger 20. Det
            här knepet kan göra huvudräkning enklare!
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/procent" />
      </div>
      <Sidebar currentHref="/procent" adSlotId="procent-sidebar" />
    </div>
  );
}
