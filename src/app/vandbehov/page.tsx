import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import VandbehovBeregner from "@/components/VandbehovBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("vandbehov");
}

export default async function VandbehovPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("vandbehov", locale) || getPageData("vandbehov", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/vandbehov`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/vandbehov" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <VandbehovBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor meget vand har du brug for?</h2>
            <p>
              En udbredt tommelfingerregel er cirka <strong>35 ml væske pr. kilo kropsvægt</strong> om
              dagen. En person på 75 kg har altså brug for omkring <strong>2,6 liter</strong>. Når du
              dyrker motion og sveder, stiger behovet — beregneren lægger ekstra væske til for de
              minutter, du har trænet.
            </p>
            <h2>Husk væske fra mad</h2>
            <p>
              Ikke al væske behøver komme fra vand. En stor del får du gennem <strong>mad</strong> —
              især frugt, grønt og supper — samt kaffe, te og andre drikke. Behovet stiger i{" "}
              <strong>varmt vejr</strong>, ved feber og under amning. Lyt til kroppen: tørst og lys
              urin er gode tegn på, at du drikker nok.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur mycket vatten behöver du?</h2>
            <p>
              En vanlig tumregel är cirka <strong>35 ml vätska per kilo kroppsvikt</strong> om dagen.
              En person på 75 kg behöver alltså runt <strong>2,6 liter</strong>. När du motionerar och
              svettas ökar behovet — kalkylatorn lägger till extra vätska för de minuter du har
              tränat.
            </p>
            <h2>Kom ihåg vätska från mat</h2>
            <p>
              All vätska behöver inte komma från vatten. En stor del får du genom <strong>mat</strong>{" "}
              — särskilt frukt, grönt och soppor — samt kaffe, te och andra drycker. Behovet ökar i{" "}
              <strong>varmt väder</strong>, vid feber och under amning. Lyssna på kroppen: törst och
              ljus urin är bra tecken på att du dricker tillräckligt.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/vandbehov" />
      </div>
      <Sidebar currentHref="/vandbehov" adSlotId="vandbehov-sidebar" />
    </div>
  );
}
