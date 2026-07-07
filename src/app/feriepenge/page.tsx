import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FeriepengeBeregner from "@/components/FeriepengeBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("feriepenge");
}

export default async function FeriepengePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("feriepenge", locale) || getPageData("feriepenge", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/feriepenge`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/feriepenge" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <FeriepengeBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan beregnes feriepenge i 2026</h2>
        <p>
          I Danmark optjener du{" "}
          <strong>12,5% af din ferieberettigede løn</strong> i feriepenge. Denne sats er
          fastsat i <strong>ferieloven</strong> og gælder uændret i 2026. Det svarer til <strong>2,08 feriedage
          per måned</strong> eller <strong>25 dage om året</strong> (5 ugers ferie).
        </p>
        <p>
          Ved udbetaling trækkes først <strong>AM-bidrag (8%)</strong>, derefter <strong>A-skat</strong> efter dit skattekort.
          Eksempel: Med en månedsløn på <strong>35.000 kr</strong> optjener du <strong>52.500 kr</strong> i feriepenge om året
          (35.000 &times; 12 &times; 12,5%). Det svarer til ca. <strong>2.100 kr brutto per feriedag</strong>.
        </p>

        <h3>Ferieåret 2025/2026</h3>
        <p>Med den nye ferielov (fra 2020) optjener og afholder du ferie samtidigt:</p>
        <ul>
          <li>
            <strong>Optjeningsperiode:</strong> 1. september til 31. august
          </li>
          <li>
            <strong>Ferieår:</strong> 1. september til 31. december året efter
          </li>
          <li>Du kan afholde ferie løbende, efterhånden som du optjener den</li>
        </ul>

        <h2>Hvad er ferieberettiget løn?</h2>
        <p>Din ferieberettigede løn inkluderer typisk:</p>
        <ul>
          <li>Fast løn</li>
          <li>Bonus og provision</li>
          <li>Overtidsbetaling</li>
          <li>Tillæg (aften, weekend, etc.)</li>
          <li>Værdi af fri bil, telefon, etc.</li>
        </ul>
        <p>
          <strong>Ikke inkluderet:</strong> Arbejdsgiverbetalt pension,
          godtgørelser (kørsel, rejse), og andre skattefrie ydelser.
        </p>

        <h2>Feriepenge vs. ferie med løn</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Feriepenge</th>
                <th>Ferie med løn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Timelønnede / løsarbejdere</td>
                <td>Månedslønnede / funktionærer</td>
              </tr>
              <tr>
                <td>12,5% af lønnen opspares</td>
                <td>Normal løn + ferietillæg (1%)</td>
              </tr>
              <tr>
                <td>Udbetales via FerieKonto</td>
                <td>Udbetales direkte af arbejdsgiver</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Skat af feriepenge</h2>
        <p>Feriepenge beskattes som almindelig indkomst:</p>
        <ol>
          <li>AM-bidrag (8%) trækkes først</li>
          <li>Derefter beregnes A-skat efter dit skattekort</li>
          <li>Feriepengene indberettes automatisk til SKAT</li>
        </ol>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">
            Tip: Tjek din ferieopsparing
          </p>
          <p className="text-blue-700">
            Log ind på{" "}
            <a
              href="https://www.feriekonto.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              feriekonto.dk
            </a>{" "}
            med MitID for at se din præcise feriepengeopsparing og anmode om
            udbetaling.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat. Din faktiske udbetaling afhænger af
            dit skattekort og præcise lønforhold. For eksakt beløb, se
            feriekonto.dk.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/feriepenge" />
    </div>
  );
}
