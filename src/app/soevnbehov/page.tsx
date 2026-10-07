import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SoevnbehovBeregner from "@/components/SoevnbehovBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  SOEVN_EKSEMPEL,
  SOEVN_GRUPPER,
  SENGETID_CYKLUSSER,
  sengetider,
  soevnInterval,
} from "@/lib/soevnbehov";

export async function generateMetadata() {
  return generatePageMetadata("soevnbehov");
}

export default async function SoevnbehovPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData =
    getPageData("soevnbehov", locale) || getPageData("soevnbehov", "da")!;
  const se = locale === "se";
  const eksempel = soevnInterval(SOEVN_EKSEMPEL);
  const eksempelGruppe = SOEVN_EKSEMPEL.gruppe[se ? "se" : "da"];
  const sengetidEksempel = sengetider("07:00");

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/soevnbehov`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/soevnbehov" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <SoevnbehovBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">
            {se ? "Sömnbehov per ålder" : "Søvnbehov pr. alder"}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">
                {se
                  ? "Rekommenderad sömn i timmar per dygn, per åldersgrupp"
                  : "Anbefalet søvn i timer i døgnet, pr. aldersgruppe"}
              </caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2 pr-4">
                    {se ? "Ålder" : "Alder"}
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    {se ? "Grupp" : "Gruppe"}
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    {se ? "Sömn per dygn" : "Søvn i døgnet"}
                  </th>
                  <th scope="col" className="py-2 pr-4">
                    {se ? "Tupplur" : "Lur"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SOEVN_GRUPPER.map((gruppe) => (
                  <tr key={gruppe.id} className="border-b last:border-0">
                    <th
                      scope="row"
                      className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white"
                    >
                      {gruppe[se ? "alderSe" : "alderDa"]}
                    </th>
                    <td className="py-2 pr-4">{gruppe[se ? "se" : "da"]}</td>
                    <td className="py-2 pr-4">
                      {gruppe.minTimer}-{gruppe.maxTimer} {se ? "tim" : "timer"}
                    </td>
                    <td className="py-2 pr-4">{gruppe.lur ? "Ja" : "Nej"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Tabellen följer rekommendationerna från American Academy of Sleep Medicine och American Academy of Pediatrics, återgivna av Sleep Foundation."
              : "Tabellen følger anbefalingerne fra American Academy of Sleep Medicine og American Academy of Pediatrics, gengivet af Sleep Foundation."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "Så mycket sömn behöver du" : "Så meget søvn har du brug for"}</h2>
          <p>
            {se
              ? `Hur mycket sömn du behöver beror på din ålder. En ${SOEVN_EKSEMPEL.aar}-åring tillhör gruppen ${eksempelGruppe.toLowerCase()} och rekommenderas ${eksempel} timmars sömn per dygn, medan ett skolbarn behöver 9-12 timmar och en vuxen 7-9 timmar. Siffrorna kommer från den tabell som American Academy of Sleep Medicine står bakom.`
              : `Hvor meget søvn du har brug for, afhænger af din alder. En ${SOEVN_EKSEMPEL.aar}-årig hører til gruppen ${eksempelGruppe.toLowerCase()} og anbefales ${eksempel} timers søvn i døgnet, mens et skolebarn har brug for 9-12 timer og en voksen 7-9 timer. Tallene kommer fra den tabel, American Academy of Sleep Medicine står bag.`}
          </p>
          <p>
            {se
              ? "Rekommendationerna är en tumregel, inte ett mått. Det individuella behovet varierar, och sömnkvaliteten betyder lika mycket som antalet timmar. Om du känner dig utvilad, klarar dagen utan att somna till och kan hålla fokus, får du troligen den sömn du behöver."
              : "Anbefalingerne er en tommelfingerregel, ikke et facit. Det individuelle behov varierer, og søvnkvaliteten betyder lige så meget som antallet af timer. Føler du dig udhvilet, kan holde dig vågen om dagen og bevare fokus, får du sandsynligvis den søvn, du har brug for."}
          </p>

          <h2>{se ? "Därför behöver barn mer sömn" : "Derfor har børn brug for mere søvn"}</h2>
          <p>
            {se
              ? "Barn och unga växer och utvecklas, och sömnen är en del av den processen. Därför sjunker behovet steg för steg med åldern: en baby sover 14-17 timmar, ett småbarn 11-14 och en tonåring 8-10. Att hoppa över sömnen för att hinna med skola och fritid går ut över både humör och inlärning."
              : "Børn og unge vokser og udvikler sig, og søvnen er en del af den proces. Derfor falder behovet trin for trin med alderen: en baby sover 14-17 timer, et småbarn 11-14 og en teenager 8-10. At skære ned på søvnen for at nå skole og fritid går ud over både humør og indlæring."}
          </p>

          <h2>{se ? "Så räknar du ut när du bör gå och lägga dig" : "Sådan regner du din sengetid ud"}</h2>
          <p>
            {se
              ? `Sömnen rör sig i cykler på cirka 90 minuter. Om du ska upp kl. 07:00 bör du därför gå och lägga dig omkring ${sengetidEksempel
                  .slice(0, SENGETID_CYKLUSSER.length)
                  .map((t) => t.tid)
                  .join(", ")} — räknat bakåt i hela cykler, med en stund för att somna. Välj den tid som passar dig bäst.`
              : `Søvnen bevæger sig i cyklusser på cirka 90 minutter. Skal du op kl. 07:00, bør du derfor gå i seng omkring ${sengetidEksempel
                  .slice(0, SENGETID_CYKLUSSER.length)
                  .map((t) => t.tid)
                  .join(", ")} — regnet baglæns i hele cyklusser og med lidt tid til at falde i søvn. Vælg den tid, der passer dig bedst.`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Kalkylatorn är vägledande och ersätter inte läkare. Sömnbesvär som håller i sig bör utredas."
              : "Beregneren er vejledende og erstatter ikke en læge. Søvnbesvær, der varer ved, bør undersøges."}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/soevnbehov" />
      </div>
      <Sidebar currentHref="/soevnbehov" adSlotId="soevnbehov-sidebar" />
    </div>
  );
}
