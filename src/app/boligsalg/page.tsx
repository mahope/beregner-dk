import BoligsalgBeregner from "@/components/BoligsalgBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import Link from "next/link";

export async function generateMetadata() {
  return generatePageMetadata("boligsalg");
}

export default async function BoligsalgPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boligsalg", locale) || getPageData("boligsalg", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/boligsalg`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/boligsalg" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <BoligsalgBeregner />

        {locale === "da" && (
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>Hvad koster det at sælge en bolig i Danmark?</h2>
            <p>
              At sælge en bolig indebærer en række omkostninger, der nemt kan løbe op i <strong>150.000-250.000 kr.</strong> for en gennemsnitlig bolig til 3 mio. kr.
              De største poster er typisk <strong>ejendomsmæglersalær</strong> (3-6% af salgsprisen), <strong>istandsættelse</strong> og <strong>energimærke</strong>.
            </p>

            <h2>Hvilke udgifter skal du regne med?</h2>
            <ul>
              <li><strong>Ejendomsmægler:</strong> 3-6% af salgsprisen eller et fast salær på 25.000-60.000 kr. Forhandles individuelt.</li>
              <li><strong>Energimærke:</strong> Ca. 6.900-8.700 kr afhængigt af boligens størrelse. Gyldigt i 10 år.</li>
              <li><strong>Tilstandsrapport:</strong> 5.000-8.000 kr. Skal udarbejdes af en byggeskadetekniker.</li>
              <li><strong>Elinstallationsrapport:</strong> 3.000-5.000 kr. Kræves ved salg af ældre boliger.</li>
              <li><strong>Ejerskifteforsikring:</strong> Sælger betaler typisk halvdelen, ca. 3.000-8.000 kr.</li>
              <li><strong>Istandsættelse:</strong> Ofte 20.000-50.000 kr til maling, reparationer og rengøring.</li>
              <li><strong>Gyldige salgsrapporter:</strong> Kræver at rapporterne er fra de seneste 6-12 måneder.</li>
            </ul>

            <h2>Sådan optimerer du dit salgsprovenu</h2>
            <ul>
              <li><strong>Forhandl mæglersalæret:</strong> De fleste mæglere giver rabat, især ved høj salgspris</li>
              <li><strong>Gør klar selv:</strong> Mal og rengør frem for at betale håndværkere</li>
              <li><strong>Få flere tilbud:</strong> Indhent mindst 3 mæglervurderinger og vælg den bedste kombination af salær og service</li>
              <li><strong>Sælg løsøre:</strong> Overskydende møbler og indbo kan sælges på DBA eller i genbrug — færre ting at flytte og ekstra penge</li>
              <li><strong>Home staging:</strong> Professionel styling koster 5.000-15.000 kr, men kan øge salgsprisen</li>
            </ul>

            <p className="mt-8">
              Læs vores komplette guide:{' '}
              <Link href="/blog/boligsalg-2026-guide-til-omkostninger-og-provenu" className="text-blue-600 hover:underline font-medium">
                Boligsalg 2026 — omkostninger og salgsprovenu →
              </Link>
            </p>

            <h2>Kilder</h2>
            <p className="text-sm text-gray-500">
              Priser og satser er baseret på Boligejer.dk (Erhvervsstyrelsen), opdateret august 2025, samt 2026-estimater for pristalsregulering.
              Mæglerhonorar, istandsættelse og flytteomkostninger er vejledende markedsestimater.
              Tinglysningssatser: 0,6% + 1.850 kr (skøde) og 1,45% + 1.825 kr (pantebrev, 2026-estimat).
            </p>
          </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/boligsalg" />
      </div>

      <Sidebar currentHref="/boligsalg" adSlotId="boligsalg-sidebar" />
    </div>
  );
}