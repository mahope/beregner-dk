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
          <h2>Sådan planlægger du konfirmationsbudgettet</h2>
          <p>
            En konfirmation er en stor dag — både for konfirmanden og familien. Ved at <strong>planlægge budgettet tidligt</strong> undgår du ubehagelige overraskelser og kan fokusere på det vigtigste: at fejre dagen.
          </p>

          <h2>De største udgiftsposter</h2>
          <p>
            <strong>Mad og drikke</strong> er typisk den største post og kan variere fra 150-200 kr./person hjemme til 400-700 kr./person på restaurant. <strong>Konfirmandtøj</strong> koster typisk 1.500-4.000 kr., og en <strong>fotograf</strong> ligger omkring 1.000-3.000 kr.
          </p>

          <h2>Gennemsnitlige konfirmationsgaver 2026</h2>
          <p>
            Gavebeløbet afhænger af <strong>relationen til konfirmanden</strong>. Forældre giver typisk mest, efterfulgt af bedsteforældre. Mange konfirmander modtager samlet set mellem <strong>10.000 og 25.000 kr.</strong> i gaver.
          </p>

          <h2>Sparetips til konfirmationen</h2>
          <ul>
            <li><strong>Hold festen hjemme:</strong> Spar tusindvis af kroner på lokaleleje</li>
            <li><strong>Lav maden selv:</strong> En buffet er billigere og nemmere end servering</li>
            <li><strong>Køb tøj i god tid:</strong> Undgå sæsontillæg ved at købe tidligt</li>
            <li><strong>Del fotograf:</strong> Gå sammen med en anden konfirmandfamilie</li>
            <li><strong>Brug naturen:</strong> Blomster og grene fra haven er flot og gratis pynt</li>
          </ul>
        </div>
        )}

        {locale === "se" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Så planerar du konfirmationsbudgeten</h2>
          <p>
            En konfirmation är en stor dag — både för konfirmanden och familjen. Genom att <strong>planera budgeten tidigt</strong> slipper du obehagliga överraskningar och kan fokusera på det viktigaste: att fira dagen.
          </p>

          <h2>De största utgiftsposterna</h2>
          <p>
            <strong>Mat och dryck</strong> är oftast den största posten och kan variera från 150-250 kr/person hemma till 400-800 kr/person på restaurang. <strong>Konfirmationskläder</strong> kostar vanligtvis 1 500-4 000 kr, och en <strong>fotograf</strong> ligger kring 1 500-4 000 kr.
          </p>

          <h2>Genomsnittliga konfirmationspresenter 2026</h2>
          <p>
            Presentbeloppet beror på <strong>relationen till konfirmanden</strong>. Föräldrar ger vanligtvis mest, följt av mor- och farföräldrar. Många konfirmander tar sammanlagt emot mellan <strong>10 000 och 25 000 kr</strong> i presenter.
          </p>

          <h2>Spartips till konfirmationen</h2>
          <ul>
            <li><strong>Håll festen hemma:</strong> Spara tusentals kronor på lokalhyra</li>
            <li><strong>Laga maten själv:</strong> En buffé är billigare och enklare än serverad middag</li>
            <li><strong>Köp kläder i god tid:</strong> Undvik säsongstillägg genom att handla tidigt</li>
            <li><strong>Dela fotograf:</strong> Gå ihop med en annan konfirmandfamilj</li>
            <li><strong>Använd naturen:</strong> Blommor och grenar från trädgården är vackra och gratis dekorationer</li>
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
