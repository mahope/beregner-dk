import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import AfkastBeregner from "@/components/AfkastBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("afkast");
}

export default async function AfkastPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("afkast", locale) || getPageData("afkast", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/afkast`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/afkast" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <AfkastBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beregn dit afkast</h2>
            <p>
              Afkast (ROI, return on investment) viser, hvor meget en investering er vokset. Indtast
              det <strong>investerede beløb</strong> og <strong>værdien i dag</strong>, så beregner vi
              det samlede afkast i procent samt kroner i gevinst.
            </p>
            <h2>Årligt afkast (CAGR)</h2>
            <p>
              Angiver du også <strong>antal år</strong>, får du det gennemsnitlige{" "}
              <strong>årlige afkast</strong> (CAGR — Compound Annual Growth Rate). Det gør det muligt
              at sammenligne investeringer over forskellige perioder. Bemærk, at{" "}
              <strong>historisk afkast ikke er nogen garanti</strong> for fremtidigt afkast, og at
              gebyrer og skat ikke er trukket fra.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beräkna din avkastning</h2>
            <p>
              Avkastning (ROI, return on investment) visar hur mycket en investering har vuxit. Ange
              det <strong>investerade beloppet</strong> och <strong>värdet idag</strong>, så beräknar
              vi den totala avkastningen i procent samt vinsten i kronor.
            </p>
            <h2>Årlig avkastning (CAGR)</h2>
            <p>
              Anger du även <strong>antal år</strong> får du den genomsnittliga{" "}
              <strong>årliga avkastningen</strong> (CAGR — Compound Annual Growth Rate). Det gör det
              möjligt att jämföra investeringar över olika perioder. Observera att{" "}
              <strong>historisk avkastning inte är någon garanti</strong> för framtida avkastning, och
              att avgifter och skatt inte är avdragna.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/afkast" />
      </div>
      <Sidebar currentHref="/afkast" adSlotId="afkast-sidebar" />
    </div>
  );
}
