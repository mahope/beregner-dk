import VaegttabBeregner from "@/components/VaegttabBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("vaegttab");
}

export default async function VaegttabPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("vaegttab", locale) || getPageData("vaegttab", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/vaegttab`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/vaegttab" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <VaegttabBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan taber du dig sundt</h2>
          <p>
            Vægttab handler grundlæggende om at spise færre kalorier, end din krop forbrænder. Men <strong>tempoet er afgørende</strong> — for hurtigt vægttab fører ofte til <strong>muskeltab</strong>, nedsat stofskifte og <strong>jo-jo-effekt</strong>.
          </p>

          <h2>Den gyldne regel: 0,5-1 kg pr. uge</h2>
          <p>
            Sundhedsstyrelsen og de fleste ernæringseksperter anbefaler et vægttab på <strong>0,5-1 kg pr. uge</strong>. Det svarer til et dagligt kalorieunderskud på 500-1.000 kcal og er et tempo, de fleste kan fastholde.
          </p>

          <h2>Beregningen bag</h2>
          <p>
            Beregneren bruger <strong>Mifflin-St Jeor formlen</strong> til at beregne dit basalstofskifte (BMR), som ganges med en aktivitetsfaktor for at finde dit daglige energiforbrug (TDEE). Dit kaloriemål er TDEE minus det nødvendige underskud.
          </p>

          <h2>Tips til vægttab</h2>
          <ul>
            <li><strong>Spis proteinrigt:</strong> Protein mætter og bevarer muskelmasse under vægttab</li>
            <li><strong>Styrketræn:</strong> Bevar og opbyg muskler, som holder dit stofskifte oppe</li>
            <li><strong>Sov nok:</strong> Søvnmangel øger sult og gør vægttab sværere</li>
            <li><strong>Vej dig ugentligt:</strong> Brug gennemsnittet, ikke daglige svingninger</li>
            <li><strong>Vær tålmodig:</strong> Varige resultater kræver varige ændringer</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/vaegttab" />
      </div>

      <Sidebar currentHref="/vaegttab" adSlotId="vaegttab-sidebar" />
    </div>
  );
}
