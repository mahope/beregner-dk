import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import EnhedsprisBeregner from "@/components/EnhedsprisBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("enhedspris");
}

export default async function EnhedsprisPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("enhedspris", locale) || getPageData("enhedspris", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/enhedspris`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/enhedspris" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <EnhedsprisBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvilken vare er billigst?</h2>
            <p>
              Den store pakke er ikke altid den billigste. Med denne beregner finder du{" "}
              <strong>prisen pr. enhed</strong> (kilopris, literpris eller stykpris) og kan se præcis,
              hvilken af to varer der giver mest for pengene — også når størrelserne er forskellige.
            </p>
            <h2>Sådan bruger du den</h2>
            <p>
              Vælg en fælles enhed, og indtast <strong>pris og mængde</strong> for hver vare.
              Beregneren regner enhedsprisen ud og fortæller dig, hvor mange procent billigere den
              bedste vare er. Perfekt at bruge på indkøb, hvor tilbud på store pakker ikke altid kan
              betale sig.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Vilken vara är billigast?</h2>
            <p>
              Det stora paketet är inte alltid billigast. Med den här kalkylatorn räknar du ut{" "}
              <strong>jämförpriset</strong> (kilopris, literpris eller styckpris) och ser exakt vilken
              av två varor som ger mest för pengarna — även när storlekarna skiljer sig.
            </p>
            <h2>Så använder du den</h2>
            <p>
              Välj en gemensam enhet och ange <strong>pris och mängd</strong> för varje vara.
              Kalkylatorn räknar ut jämförpriset och visar hur många procent billigare den bästa varan
              är. Perfekt vid inköp där rea på stora paket inte alltid lönar sig.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/enhedspris" />
      </div>
      <Sidebar currentHref="/enhedspris" adSlotId="enhedspris-sidebar" />
    </div>
  );
}
