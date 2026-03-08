import KonfirmationBeregner from "@/components/KonfirmationBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("konfirmation");
}

export default async function KonfirmationPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("konfirmation", locale) || getPageData("konfirmation", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/konfirmation`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/konfirmation" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <KonfirmationBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>S&aring;dan planl&aelig;gger du konfirmationsbudgettet</h2>
          <p>
            En konfirmation er en stor dag — b&aring;de for konfirmanden og familien. Ved at <strong>planl&aelig;gge budgettet tidligt</strong> undg&aring;r du ubehagelige overraskelser og kan fokusere p&aring; det vigtigste: at fejre dagen.
          </p>

          <h2>De st&oslash;rste udgiftsposter</h2>
          <p>
            <strong>Mad og drikke</strong> er typisk den st&oslash;rste post og kan variere fra 150-200 kr./person hjemme til 400-700 kr./person p&aring; restaurant. <strong>Konfirmandt&oslash;j</strong> koster typisk 1.500-4.000 kr., og en <strong>fotograf</strong> ligger omkring 1.000-3.000 kr.
          </p>

          <h2>Gennemsnitlige konfirmationsgaver 2026</h2>
          <p>
            Gavebel&oslash;bet afh&aelig;nger af <strong>relationen til konfirmanden</strong>. For&aelig;ldre giver typisk mest, efterfulgt af bedstefor&aelig;ldre. Mange konfirmander modtager samlet set mellem <strong>10.000 og 25.000 kr.</strong> i gaver.
          </p>

          <h2>Sparetips til konfirmationen</h2>
          <ul>
            <li><strong>Hold festen hjemme:</strong> Spar tusindvis af kroner p&aring; lokaleleje</li>
            <li><strong>Lav maden selv:</strong> En buffet er billigere og nemmere end servering</li>
            <li><strong>K&oslash;b t&oslash;j i god tid:</strong> Undg&aring; s&aelig;sontill&aelig;g ved at k&oslash;be tidligt</li>
            <li><strong>Del fotograf:</strong> G&aring; sammen med en anden konfirmandfamilie</li>
            <li><strong>Brug naturen:</strong> Blomster og grene fra haven er flot og gratis pynt</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/konfirmation" />
      </div>

      <Sidebar currentHref="/konfirmation" adSlotId="konfirmation-sidebar" />
    </div>
  );
}
