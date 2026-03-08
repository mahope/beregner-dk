import dynamic from "next/dynamic";
const DatoBeregner = dynamic(() => import("@/components/DatoBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("dato");
}

export default async function DatoPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("dato", locale) || getPageData("dato", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/dato`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/dato" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <DatoBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>S&aring;dan bruger du datoberegneren</h2>
        <p>Datoberegneren har <strong>fire forskellige funktioner</strong>:</p>

        <h3>1. Dage mellem datoer</h3>
        <p>
          Beregn hvor mange <strong>dage der er mellem to datoer</strong>. Du f&aring;r ogs&aring; antal
          uger, ca. m&aring;neder, arbejdsdage og weekenddage.
        </p>
        <ul>
          <li>V&aelig;lg startdato og slutdato</li>
          <li>Resultatet vises automatisk</li>
          <li>
            Negativt tal betyder at slutdato er f&oslash;r startdato
          </li>
        </ul>

        <h3>2. Tilf&oslash;j dage</h3>
        <p>
          Find ud af hvilken dato det bliver om <strong>X dage</strong>, eller hvilken dato det
          var for X dage siden.
        </p>
        <ul>
          <li>V&aelig;lg en udgangsdato</li>
          <li>Indtast antal dage (brug minus for at g&aring; tilbage)</li>
          <li>Se resultatet med ugedag og dato</li>
        </ul>

        <h3>3. Arbejdsdage</h3>
        <p>
          Beregn en dato baseret p&aring; antal <strong>arbejdsdage</strong>. Perfekt til
          {" "}<strong>projektplanl&aelig;gning</strong> og deadline-beregning.
        </p>
        <ul>
          <li>V&aelig;lg startdato</li>
          <li>Indtast antal arbejdsdage</li>
          <li>Weekender springes automatisk over</li>
        </ul>

        <h3>4. Alder</h3>
        <p>
          Beregn din <strong>pr&aelig;cise alder</strong> i &aring;r, m&aring;neder og dage. Se ogs&aring; hvor mange
          dage du har levet, og hvorn&aring;r du fylder &aring;r.
        </p>

        <h2>Nyttige datofakta</h2>
        <ul>
          <li>1 &aring;r = 365 dage (366 i skud&aring;r)</li>
          <li>1 m&aring;ned = ca. 30,44 dage i gennemsnit</li>
          <li>1 uge = 7 dage</li>
          <li>1 arbejdsuge = typisk 5 dage</li>
          <li>1 &aring;r &asymp; 52 uger</li>
          <li>1 &aring;r &asymp; 260 arbejdsdage (uden helligdage)</li>
        </ul>

        <h2>Skud&aring;r</h2>
        <p>Et &aring;r er et <strong>skud&aring;r</strong> hvis:</p>
        <ul>
          <li>&Aring;ret er deleligt med 4, OG</li>
          <li>&Aring;ret er IKKE deleligt med 100, MED MINDRE</li>
          <li>&Aring;ret er deleligt med 400</li>
        </ul>
        <p>
          Eksempel: 2024 er skud&aring;r (deleligt med 4). 2100 er ikke skud&aring;r
          (deleligt med 100). 2000 var skud&aring;r (deleligt med 400).
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Beregneren tager ikke h&oslash;jde for helligdage ved beregning af
            arbejdsdage, da disse varierer fra &aring;r til &aring;r. Tilf&oslash;j selv ekstra
            dage for helligdage i din periode.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/dato" />
    </div>
  );
}
