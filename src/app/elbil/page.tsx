import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ElbilBenzinBeregner from "@/components/ElbilBenzinBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("elbil");
}

export default async function ElbilPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("elbil", locale) || getPageData("elbil", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/elbil`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/elbil" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <ElbilBenzinBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Elbil eller benzinbil — hvad kan bedst betale sig?</h2>
            <p>
              På <strong>energi</strong> er en elbil næsten altid billigere at køre. En elbil bruger
              typisk <strong>15-20 kWh pr. 100 km</strong>, mens en benzinbil bruger <strong>5-7
              liter</strong>. Ved normale priser koster strømmen ofte under halvdelen af benzinen pr.
              kørt kilometer.
            </p>
            <h2>Husk merprisen ved køb</h2>
            <p>
              Elbiler er ofte <strong>dyrere at købe</strong> end tilsvarende benzinbiler. Indtast
              merprisen i beregneren, så viser den, hvor mange år det tager, før den lavere
              energiudgift har tjent merprisen hjem (tilbagebetalingstiden).
            </p>
            <h2>Hvad indgår ikke?</h2>
            <p>
              Beregneren fokuserer på <strong>energiudgiften</strong>, som er den største løbende
              forskel. Forsikring, service, dæk, grøn ejerafgift og værditab varierer meget fra bil
              til bil og indgår ikke — undersøg dem særskilt for de konkrete modeller, du overvejer.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Elbil eller bensinbil — vad lönar sig bäst?</h2>
            <p>
              På <strong>energi</strong> är en elbil nästan alltid billigare att köra. En elbil drar
              cirka <strong>15-20 kWh per 100 km</strong>, medan en bensinbil drar <strong>5-7
              liter</strong>. Vid normala priser kostar elen ofta under hälften av bensinen per körd
              kilometer.
            </p>
            <h2>Tänk på merpriset vid köp</h2>
            <p>
              Elbilar är ofta <strong>dyrare att köpa</strong> än motsvarande bensinbilar. Ange
              merpriset i kalkylatorn, så visar den hur många år det tar innan den lägre
              energikostnaden har tjänat in merpriset (återbetalningstiden).
            </p>
            <h2>Vad ingår inte?</h2>
            <p>
              Kalkylatorn fokuserar på <strong>energikostnaden</strong>, som är den största löpande
              skillnaden. Försäkring, service, däck, fordonsskatt och värdeminskning varierar mycket
              och ingår inte — undersök dem separat för de modeller du överväger.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/elbil" />
      </div>
      <Sidebar currentHref="/elbil" adSlotId="elbil-sidebar" />
    </div>
  );
}
