import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import KropsfedtBeregner from "@/components/KropsfedtBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("kropsfedt");
}

export default async function KropsfedtPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("kropsfedt", locale) || getPageData("kropsfedt", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kropsfedt`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/kropsfedt" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <KropsfedtBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beregn din kropsfedtprocent</h2>
            <p>
              Kropsfedtprocenten fortæller, hvor stor en del af din krop der er fedt — et mere
              nuanceret mål end BMI, fordi det skelner mellem fedt og muskler. Denne beregner bruger{" "}
              <strong>U.S. Navy-metoden</strong>, der estimerer fedtprocenten ud fra dine kropsmål.
            </p>
            <h2>Sådan måler du rigtigt</h2>
            <p>
              Mål med et målebånd direkte på huden: <strong>taljen</strong> ved navlen,{" "}
              <strong>halsen</strong> lige under adamsæblet, og for kvinder også{" "}
              <strong>hoften</strong> på det bredeste sted. Stå afslappet, og træk ikke maven ind.
              Metoden er et <strong>estimat</strong> — en DEXA-scanning er mere præcis, men også langt
              dyrere.
            </p>
            <h2>Hvad er sundt?</h2>
            <p>
              Vejledende ligger et sundt niveau typisk på <strong>14-24 % for mænd</strong> og{" "}
              <strong>21-31 % for kvinder</strong>. Atleter ligger ofte lavere. Fedtprocent siger dog
              ikke alt om sundhed — se den sammen med kondition, kost og velvære.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beräkna din kroppsfettprocent</h2>
            <p>
              Kroppsfettprocenten visar hur stor del av kroppen som är fett — ett mer nyanserat mått
              än BMI, eftersom det skiljer mellan fett och muskler. Den här kalkylatorn använder{" "}
              <strong>U.S. Navy-metoden</strong>, som uppskattar fettprocenten utifrån dina kroppsmått.
            </p>
            <h2>Så mäter du rätt</h2>
            <p>
              Mät med ett måttband direkt mot huden: <strong>midjan</strong> vid naveln,{" "}
              <strong>halsen</strong> strax under adamsäpplet, och för kvinnor även{" "}
              <strong>höften</strong> på bredaste stället. Stå avslappnad och dra inte in magen.
              Metoden är en <strong>uppskattning</strong> — en DEXA-scanning är mer exakt men också
              betydligt dyrare.
            </p>
            <h2>Vad är hälsosamt?</h2>
            <p>
              Ett hälsosamt intervall ligger vägledande på <strong>14-24 % för män</strong> och{" "}
              <strong>21-31 % för kvinnor</strong>. Atleter ligger ofta lägre. Fettprocenten säger
              dock inte allt om hälsan — se den tillsammans med kondition, kost och välmående.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/kropsfedt" />
      </div>
      <Sidebar currentHref="/kropsfedt" adSlotId="kropsfedt-sidebar" />
    </div>
  );
}
