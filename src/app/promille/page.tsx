import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import PromilleBeregner from "@/components/PromilleBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("promille");
}

export default async function PromillePage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("promille", locale) || getPageData("promille", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/promille`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/promille" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <PromilleBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan beregnes promille</h2>
            <p>
              Beregneren bruger <strong>Widmark-formlen</strong>, som er den anerkendte metode til at
              anslå alkoholpromille i blodet:{" "}
              <em>promille = gram alkohol / (kropsvægt × fordelingsfaktor) − 0,15 × timer</em>.
              Fordelingsfaktoren er cirka <strong>0,68 for mænd</strong> og <strong>0,55 for
              kvinder</strong>, fordi kroppens vandindhold er forskelligt. Kroppen nedbryder omkring{" "}
              <strong>0,15 ‰ i timen</strong>.
            </p>
            <h2>Hvad er én genstand?</h2>
            <p>
              I Danmark svarer <strong>én genstand til 12 gram ren alkohol</strong>. Det er cirka en
              almindelig øl (33 cl, 4,6 %), et lille glas vin (12 cl) eller et snapseglas spiritus
              (4 cl). En stærk øl eller et stort glas vin kan sagtens være 1,5–2 genstande.
            </p>
            <h2>Promillegrænsen i Danmark</h2>
            <p>
              Det er ulovligt at køre bil med en promille <strong>over 0,5 ‰</strong>. Husk, at
              alkohol forbrændes langsomt — du kan sagtens være over grænsen morgenen efter en
              festaften. Beregneren er kun et <strong>estimat</strong>: mad, stofskifte, medicin og
              helbred påvirker den faktiske promille. Kør aldrig i tvivl.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Så beräknas promille</h2>
            <p>
              Kalkylatorn använder <strong>Widmarks formel</strong>, den vedertagna metoden för att
              uppskatta alkoholhalten i blodet:{" "}
              <em>promille = gram alkohol / (kroppsvikt × fördelningsfaktor) − 0,15 × timmar</em>.
              Fördelningsfaktorn är cirka <strong>0,68 för män</strong> och <strong>0,55 för
              kvinnor</strong>. Kroppen bryter ner ungefär <strong>0,15 ‰ per timme</strong>.
            </p>
            <h2>Vad är ett standardglas?</h2>
            <p>
              Ett <strong>standardglas motsvarar 12 gram ren alkohol</strong> — ungefär en vanlig öl
              (33 cl), ett litet glas vin (12 cl) eller en snaps sprit (4 cl). En starköl eller ett
              stort glas vin kan lätt vara 1,5–2 standardglas.
            </p>
            <h2>Promillegränsen i Sverige</h2>
            <p>
              I Sverige går gränsen för rattfylleri vid <strong>0,2 ‰</strong> — betydligt lägre än i
              Danmark. Vid 1,0 ‰ räknas det som grovt rattfylleri. Kom ihåg att alkohol förbränns
              långsamt, så du kan vara kvar över gränsen morgonen efter. Kalkylatorn är endast en{" "}
              <strong>uppskattning</strong> — kör aldrig om du är osäker.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/promille" />
      </div>
      <Sidebar currentHref="/promille" adSlotId="promille-sidebar" />
    </div>
  );
}
