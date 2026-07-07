import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BoernepengBeregner from "@/components/BoernepengBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("boernepenge");
}

export default async function BoernepengePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boernepenge", locale) || getPageData("boernepenge", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/boernepenge`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/boernepenge" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <BoernepengBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Om børne- og ungeydelse</h2>
        <p>
          Børne- og ungeydelsen (ofte kaldet &quot;børnepenge&quot; eller
          &quot;børnecheck&quot;) er en skattefri ydelse, som{" "}
          <strong>Udbetaling Danmark</strong> udbetaler til forældre med børn
          under 18 år. Ydelsen udbetales automatisk og kræver ingen ansøgning.
        </p>
        <p>
          Siden <strong>januar 2022</strong> deles ydelsen som standard <strong>ligeligt mellem forældre</strong>
          med <strong>fælles forældremyndighed</strong> — hver forælder modtager halvdelen.
        </p>

        <h3>Børnepenge satser 2026 (officielle)</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Alder</th>
                <th>Årligt</th>
                <th>Udbetaling</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>0-2 år</td>
                <td>21.480 kr</td>
                <td>5.370 kr/kvartal</td>
              </tr>
              <tr>
                <td>3-6 år</td>
                <td>17.004 kr</td>
                <td>4.251 kr/kvartal</td>
              </tr>
              <tr>
                <td>7-14 år</td>
                <td>13.380 kr</td>
                <td>3.345 kr/kvartal</td>
              </tr>
              <tr>
                <td>15-17 år (ungeydelse)</td>
                <td>13.380 kr</td>
                <td>1.115 kr/måned</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          <strong>Børneydelsen</strong> (0-14 år) udbetales <strong>kvartalsvis</strong> forud den 20. i januar, april, juli og oktober.
          <strong>Ungeydelsen</strong> (15-17 år) udbetales <strong>månedligt</strong> den 20. direkte til den unge.
        </p>

        <h2>Aftrapning for høje indkomster</h2>
        <p>
          Hvis din indkomst overstiger <strong>961.100 kr.</strong> i 2026,
          nedsættes ydelsen med 2% af beløbet over grænsen.
        </p>
        <p>
          <strong>Eksempel:</strong> Tjener du 1.100.000 kr., er du 138.900 kr. over grænsen.
          Aftrapningen bliver 2% × 138.900 kr. = 2.778 kr. årligt.
        </p>

        <h2>Deling mellem forældre</h2>
        <p>
          Siden <strong>januar 2022</strong> deles ydelsen automatisk mellem forældre med <strong>fælles
          forældremyndighed</strong>. Det betyder:
        </p>
        <ul>
          <li>Hver forælder modtager halvdelen af ydelsen</li>
          <li>Gælder uanset barnets bopæl</li>
          <li>Bor barnet kun hos én forælder, kan man søge om fuld ydelse via borger.dk</li>
        </ul>

        <h2>Ekstra ydelser til enlige forsørgere</h2>
        <p>Enlige forsørgere kan derudover være berettiget til:</p>
        <ul>
          <li>
            <strong>Ordinært børnetilskud:</strong> Ca. 6.300 kr. pr. kvartal pr. barn
          </li>
          <li>
            <strong>Ekstra børnetilskud:</strong> Ca. 6.600 kr. pr. kvartal (kun
            én gang uanset antal børn)
          </li>
          <li>
            <strong>Særligt børnetilskud:</strong> Hvis den anden forælder er
            død eller ukendt
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Ansøg og administrer</p>
          <p className="text-blue-700 dark:text-blue-400">
            Du kan administrere din børneydelse på{" "}
            <a
              href="https://www.borger.dk/familie-og-boern/Familieydelser-oversigt/Boerne-ungeydelse"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              borger.dk
            </a>
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med 2026-satser</p>
          <p className="text-green-700 dark:text-green-400">
            Satserne i denne beregner er de officielle 2026-satser fra
            borger.dk. Sidst verificeret februar 2026.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/boernepenge" />
    </div>
  );
}
