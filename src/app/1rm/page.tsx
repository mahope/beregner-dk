import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import EnRepMaxBeregner from "@/components/EnRepMaxBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("1rm");
}

export default async function EnRepMaxPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("1rm", locale) || getPageData("1rm", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/1rm`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/1rm" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <EnRepMaxBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvad er 1RM?</h2>
            <p>
              <strong>1RM (one-rep max)</strong> er den tungeste vægt, du kan løfte én gang med korrekt
              teknik. Det er et centralt tal i styrketræning, fordi træningsprogrammer ofte angiver
              vægte som en procent af dit 1RM. I stedet for at teste et rigtigt maxløft — som er hårdt
              og risikabelt — kan du <strong>estimere det</strong> ud fra en vægt, du løfter for flere
              gentagelser.
            </p>
            <h2>Sådan beregnes det</h2>
            <p>
              Beregneren bruger et gennemsnit af to anerkendte formler,{" "}
              <strong>Epley</strong> og <strong>Brzycki</strong>. Indtast en vægt og antal
              gentagelser, du lige akkurat kan klare, så får du dit anslåede 1RM samt en tabel over{" "}
              <strong>træningsvægte ved forskellige procenter</strong> — nyttigt til at planlægge dine
              sæt. Estimatet er mest præcist ved <strong>op til cirka 10 gentagelser</strong>.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Vad är 1RM?</h2>
            <p>
              <strong>1RM (one-rep max)</strong> är den tyngsta vikt du kan lyfta en gång med korrekt
              teknik. Det är ett centralt tal i styrketräning, eftersom träningsprogram ofta anger
              vikter som en procent av ditt 1RM. I stället för att testa ett riktigt maxlyft — som är
              tungt och riskabelt — kan du <strong>uppskatta det</strong> utifrån en vikt du lyfter
              för flera repetitioner.
            </p>
            <h2>Så beräknas det</h2>
            <p>
              Kalkylatorn använder ett genomsnitt av två vedertagna formler,{" "}
              <strong>Epley</strong> och <strong>Brzycki</strong>. Ange en vikt och antal repetitioner
              du precis klarar, så får du ditt uppskattade 1RM samt en tabell över{" "}
              <strong>träningsvikter vid olika procent</strong> — användbart för att planera dina set.
              Uppskattningen är mest exakt vid <strong>upp till cirka 10 repetitioner</strong>.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/1rm" />
      </div>
      <Sidebar currentHref="/1rm" adSlotId="1rm-sidebar" />
    </div>
  );
}
