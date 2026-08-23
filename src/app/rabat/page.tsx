import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RabatBeregner from "@/components/RabatBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("rabat");
}

export default async function RabatPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("rabat", locale) || getPageData("rabat", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/rabat`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/rabat" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <RabatBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan bruger du rabatberegneren</h2>
            <p>
              Rabatberegneren har to tilstande: <strong>Pris efter rabat</strong> og{" "}
              <strong>Find rabatprocent</strong>.
            </p>
            <p>
              I <strong>Pris efter rabat</strong>-tilstanden indtaster du originalprisen og
              rabatprocenten. Beregneren viser, hvor mange kroner du sparer, og hvad den endelige
              pris bliver. Fx: En vare til 400 kr med 25% rabat — du sparer 100 kr og betaler 300 kr.
            </p>
            <p>
              I <strong>Find rabatprocent</strong>-tilstanden indtaster du originalprisen og
              tilbudsprisen. Beregneren regner ud, hvor mange procent rabat du får. Fx: En vare
              til 400 kr på tilbud til 300 kr giver 25% rabat.
            </p>
            <h2>Hvad betyder rabat?</h2>
            <p>
              Rabat betyder, at du får et afslag i prisen — oftest angivet som en procentdel af
              den oprindelige pris. I Danmark er det almindeligt at se tilbud som "25% rabat" eller
              "Køb 3, betal for 2". Beregneren hjælper dig med at gennemskue, hvad du reelt sparer.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/rabat" />
      </div>
      <Sidebar currentHref="/rabat" adSlotId="rabat-sidebar" />
    </div>
  );
}