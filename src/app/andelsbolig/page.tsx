import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import AndelsboligBeregner from "@/components/AndelsboligBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("andelsbolig");
}

export default async function AndelsboligPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("andelsbolig", locale) || getPageData("andelsbolig", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/andelsbolig`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/andelsbolig" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <AndelsboligBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvad koster det at købe andelsbolig?</h2>
          <p>
            Prisen på en andelsbolig består af <strong>andelsprisen</strong> (din andel af foreningens formue) plus evt. <strong>forbedringer</strong> (køkken, bad mv.) foretaget af den tidligere ejer. Derudover betaler du en <strong>månedlig boligafgift</strong>.
          </p>

          <h2>Boligafgift forklaret</h2>
          <p>
            <strong>Boligafgiften</strong> dækker foreningens driftsudgifter og omfatter typisk:
          </p>
          <ul>
            <li><strong>Ejendomsskat</strong> og forsikring</li>
            <li><strong>Vedligeholdelse</strong> af ejendommen</li>
            <li>Vand og renovation</li>
            <li>Afdrag på <strong>fælleslån</strong></li>
          </ul>
          <p>
            En høj boligafgift kan betyde stor <strong>fællesgæld</strong> — men også at du betaler en lavere <strong>andelspris</strong>.
          </p>

          <h2>Tjekliste før du køber andelsbolig</h2>
          <ul>
            <li><strong>Gennemgå årsrapporten:</strong> Se foreningens økonomi, gæld og vedligeholdelsesplan</li>
            <li><strong>Tjek fællesgælden:</strong> Høj gæld pr. m² kan være et risikotegn</li>
            <li><strong>Forstå andelskronen:</strong> En høj andelskrone giver højere pris, men kan falde</li>
            <li><strong>Se vedligeholdelsesplanen:</strong> Store kommende renoveringer kan betyde stigende boligafgift</li>
            <li><strong>Undersøg udlejningsregler:</strong> Mange foreninger begrænser fremleje</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/andelsbolig" />
      </div>

      <Sidebar currentHref="/andelsbolig" adSlotId="andelsbolig-sidebar" />
    </div>
  );
}
