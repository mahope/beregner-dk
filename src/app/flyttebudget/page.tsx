import FlyttebudgetBeregner from "@/components/FlyttebudgetBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("flyttebudget");
}

export default async function FlyttebudgetPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("flyttebudget", locale) || getPageData("flyttebudget", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/flyttebudget`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/flyttebudget" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <FlyttebudgetBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvad koster en flytning i Danmark?</h2>
          <p>
            En <strong>flytning</strong> kan hurtigt løbe op i mange tusinde kroner, især hvis du både sælger og køber bolig samtidig. De største poster er typisk <strong>ejendomsmægler</strong>, <strong>depositum</strong> på ny lejebolig og <strong>istandsættelse</strong> af den gamle bolig.
          </p>

          <h2>De største udgiftsposter</h2>
          <p>
            <strong>Ejendomsmægler</strong> koster som regel 2-5% af salgsprisen, i gennemsnit 25.000-40.000 kr. <strong>Depositum</strong> svarer ofte til 3-6 måneders husleje, mens <strong>flyttemand</strong> typisk koster 5.000-15.000 kr afhængig af mængde og afstand.
          </p>

          <h2>Sådan sparer du på flytningen</h2>
          <ul>
            <li><strong>Gør det selv:</strong> Lej en trailer eller flyttebil i stedet for flyttemand</li>
            <li><strong>Få flere tilbud:</strong> Indhent mindst 3 tilbud på flyttemand og håndværkere</li>
            <li><strong>Rengør selv:</strong> Spar 1.000-4.000 kr på flytterengøring</li>
            <li><strong>Forhandl mæglersalær:</strong> De fleste mæglere giver rabat på provisionssatsen</li>
            <li><strong>Sælg overskydende møbler:</strong> Færre ting = billigere flytning + ekstra penge i kassen</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/flyttebudget" />
      </div>

      <Sidebar currentHref="/flyttebudget" adSlotId="flyttebudget-sidebar" />
    </div>
  );
}