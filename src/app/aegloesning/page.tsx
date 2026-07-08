import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import AegloesningBeregner from "@/components/AegloesningBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("aegloesning");
}

export default async function AegloesningPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("aegloesning", locale) || getPageData("aegloesning", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/aegloesning`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/aegloesning" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <AegloesningBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beregn din ægløsning</h2>
            <p>
              Beregneren estimerer, hvornår du har <strong>ægløsning</strong>, og hvornår dit{" "}
              <strong>frugtbare vindue</strong> er. Indtast den <strong>første dag i din sidste
              menstruation</strong> og din typiske <strong>cykluslængde</strong>. Ægløsningen sker som
              regel omkring 14 dage før næste menstruation.
            </p>
            <h2>Det frugtbare vindue</h2>
            <p>
              Dine mest frugtbare dage er dagene op til og på selve ægløsningsdagen. Sædceller kan
              overleve op til <strong>5 dage</strong>, så det frugtbare vindue dækker cirka fem dage
              før ægløsning plus selve dagen. Bemærk, at dette kun er et <strong>estimat</strong> —
              cyklusser varierer fra måned til måned, og beregneren er ikke en sikker prævention.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beräkna din ägglossning</h2>
            <p>
              Kalkylatorn uppskattar när du har <strong>ägglossning</strong> och när ditt{" "}
              <strong>fertila fönster</strong> är. Ange <strong>första dagen i din senaste mens</strong>{" "}
              och din typiska <strong>cykellängd</strong>. Ägglossningen sker vanligtvis omkring 14
              dagar före nästa mens.
            </p>
            <h2>Det fertila fönstret</h2>
            <p>
              Dina mest fertila dagar är dagarna före och på själva ägglossningsdagen. Spermier kan
              överleva upp till <strong>5 dagar</strong>, så det fertila fönstret täcker ungefär fem
              dagar före ägglossning plus själva dagen. Observera att detta bara är en{" "}
              <strong>uppskattning</strong> — cykler varierar från månad till månad, och kalkylatorn är
              inte ett säkert preventivmedel.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/aegloesning" />
      </div>
      <Sidebar currentHref="/aegloesning" adSlotId="aegloesning-sidebar" />
    </div>
  );
}
