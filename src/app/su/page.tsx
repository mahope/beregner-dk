import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SUBeregner from "@/components/SUBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("su");
}

export default async function SUPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("su", locale) || getPageData("su", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/su`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/su" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <SUBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Om SU (Statens Uddannelsesstøtte)</h2>
        <p>
          <strong>SU</strong> er en støtte fra staten til studerende på <strong>videregående uddannelser</strong>,
          <strong>ungdomsuddannelser</strong> og visse andre uddannelser. Du kan modtage SU fra
          du fylder <strong>18 år</strong>.
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
          <strong>Fribeløbet</strong> er det beløb, du må tjene ved siden af din SU uden at
          skulle <strong>tilbagebetale</strong>. Fribeløbet afhænger af din <strong>uddannelsestype</strong>:
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
          Du får tildelt et antal <strong>SU-klip</strong> (måneder med SU) baseret på din
          uddannelses <strong>normerede varighed</strong>:
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
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/su" />
    </div>
  );
}
