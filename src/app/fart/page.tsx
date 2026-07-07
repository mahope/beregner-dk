import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FartBeregner from "@/components/FartBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("fart");
}

export default async function FartPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("fart", locale) || getPageData("fart", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/fart`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/fart" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <FartBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beregn fart, distance eller tid</h2>
            <p>
              Sammenhængen er enkel: <strong>distance = fart × tid</strong>. Kender du to af de tre
              værdier, regner beregneren den sidste ud. Vælg, om du vil finde <strong>farten</strong>{" "}
              (fx km/t), <strong>distancen</strong> eller <strong>tiden</strong>, og udfyld de to
              øvrige felter.
            </p>
            <h2>Tempo til løb og cykling</h2>
            <p>
              Ud over farten viser beregneren dit <strong>tempo i minutter pr. kilometer</strong>,
              som er den måde, løbere og cyklister oftest måler fart på. En fart på 10 km/t svarer til
              et tempo på 6 min/km. Det gør det let at planlægge en løbetur eller tjekke, om du holder
              det tempo, du sigter efter.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Beräkna hastighet, sträcka eller tid</h2>
            <p>
              Sambandet är enkelt: <strong>sträcka = hastighet × tid</strong>. Känner du till två av
              de tre värdena räknar kalkylatorn ut det sista. Välj om du vill hitta{" "}
              <strong>hastigheten</strong> (t.ex. km/h), <strong>sträckan</strong> eller{" "}
              <strong>tiden</strong>, och fyll i de två övriga fälten.
            </p>
            <h2>Tempo för löpning och cykling</h2>
            <p>
              Utöver hastigheten visar kalkylatorn ditt <strong>tempo i minuter per kilometer</strong>,
              vilket är så löpare och cyklister oftast mäter fart. En hastighet på 10 km/h motsvarar
              ett tempo på 6 min/km. Det gör det lätt att planera en löprunda eller kontrollera att du
              håller det tempo du siktar på.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/fart" />
      </div>
      <Sidebar currentHref="/fart" adSlotId="fart-sidebar" />
    </div>
  );
}
