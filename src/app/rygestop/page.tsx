import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RygestopBeregner from "@/components/RygestopBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("rygestop");
}

export default async function RygestopPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("rygestop", locale) || getPageData("rygestop", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/rygestop`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/rygestop" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <RygestopBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan beregner du din rygestop-besparelse</h2>
            <p>
              Beregneren tager udgangspunkt i tre tal: hvor mange cigaretter du ryger om dagen,
              hvad en pakke koster, og hvor mange cigaretter der er i en pakke. Ud fra det regner
              den ud, hvad dine cigaretter koster pr. dag, pr. måned, pr. år — og over fem år.
            </p>
            <p>
              Et eksempel: Ryger du 15 cigaretter om dagen til en pakkepris på 60 kr for 20 stk,
              koster det omkring <strong>45 kr om dagen</strong>. Det lyder måske ikke af meget,
              men over et år er det cirka <strong>16.400 kr</strong> — og over fem år over
              80.000 kr. Det svarer til en pæn ferie, et nyt tv eller et solidt bidrag til din
              opsparing.
            </p>
            <h2>Cigaretter er blevet dyrere</h2>
            <p>
              Cigaretpakker er steget markant i pris gennem de seneste år, og regeringens
              tobaksaftale betyder yderligere afgiftsforhøjelser frem mod 2028. Det betyder, at
              besparelsen ved at holde op med at ryge typisk bliver <em>større</em> hvert år —
              indtast din aktuelle pakkepris for at se dit eget tal.
            </p>
            <h2>Hvad skal du bruge pengene til?</h2>
            <p>
              Den mest motiverende måde at bruge beregneren på er at sætte et konkret mål.
              Læg beløbet ind i{" "}
              <Link href="/opsparing">opsparingsberegneren</Link> og se, hvordan pengene vokser
              med renters rente, eller sæt det op som et fast{" "}
              <Link href="/sparemaal">sparemål</Link> i dit{" "}
              <Link href="/budget">månedsbudget</Link>.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Vejledende:</strong> Beregneren viser en økonomisk besparelse ud fra de
              tal du indtaster. Priser varierer mellem mærker og butikker, og beregneren siger
              intet om de helbredsmæssige gevinster ved at holde op med at ryge — dem er der
              mange af. Gratis hjælp finder du hos din læge eller på sundhed.dk.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/rygestop" />
      </div>
      <Sidebar currentHref="/rygestop" adSlotId="rygestop-sidebar" />
    </div>
  );
}
