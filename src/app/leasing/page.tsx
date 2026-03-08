import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import LeasingBeregner from "@/components/LeasingBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("leasing");
}

export default async function LeasingPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("leasing", locale) || getPageData("leasing", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/leasing`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/leasing" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <LeasingBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Leasing af bil i Danmark</h2>
          <p>
            Leasing er blevet en <strong>populær måde at få bil på</strong> i Danmark. I stedet for at købe bilen betaler du en <strong>fast månedlig ydelse</strong> for at bruge den i en aftalt periode — typisk <strong>12-48 måneder</strong>. Ved periodens udløb afleverer du bilen.
          </p>

          <h2>Privat leasing vs. erhvervsleasing</h2>
          <p>
            Ved <strong>privat leasing</strong> betaler du en fast ydelse inkl. moms. Du kan ikke fradrage ydelsen i skat. Prisen inkluderer typisk service og vejhjælp, men ikke forsikring.
          </p>
          <p>
            Ved <strong>erhvervsleasing</strong> kan virksomheden fradrage leasingydelsen som driftsudgift og trække momsen fra. Det gør leasing særligt attraktivt for selvstændige og virksomheder.
          </p>

          <h2>Leasing vs. billån vs. kontantkøb</h2>
          <p>
            Hver <strong>finansieringsform</strong> har fordele:
          </p>
          <ul>
            <li><strong>Leasing:</strong> Lav månedlig ydelse, men du ejer ikke bilen</li>
            <li><strong>Billån:</strong> Du ejer bilen og opbygger egenkapital, men højere ydelse</li>
            <li><strong>Kontantkøb:</strong> Ingen renter, men kræver stor opsparing</li>
          </ul>

          <h2>Hvad påvirker leasingydelsen?</h2>
          <ul>
            <li><strong>Bilpris:</strong> Jo dyrere bilen, jo højere ydelse</li>
            <li><strong>Restværdi:</strong> Jo højere restværdi, jo lavere ydelse (du betaler kun for værditabet)</li>
            <li><strong>Løbetid:</strong> Længere perioder giver lavere ydelse, men mere i renter</li>
            <li><strong>Rente/ÅOP:</strong> Leasingselskabets finansieringsomkostning</li>
            <li><strong>Udbetaling:</strong> Større udbetaling sænker den månedlige ydelse</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/leasing" />
      </div>

      <Sidebar currentHref="/leasing" adSlotId="leasing-sidebar" />
    </div>
  );
}
