import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import UgenummerBeregner from "@/components/UgenummerBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("ugenummer");
}

export default async function UgenummerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("ugenummer", locale) || getPageData("ugenummer", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/ugenummer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/ugenummer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <UgenummerBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan beregnes ugenummeret</h2>
            <p>
              Ugenummeret følger ISO 8601-standarden, som bruges i Danmark og det meste af
              Europa. Reglerne er enkle: uger starter på mandag, og uge 1 er den uge, der
              indeholder årets første torsdag. Det betyder, at dage omkring nytår kan tilhøre
              uge 52 eller 53 af det foregående år — eller uge 1 af det næste år.
            </p>
            <p>
              Et eksempel: 1. januar 2026 er en torsdag, så det er uge 1 i 2026. Men 29.
              december 2025 (en mandag) tilhører også uge 1 i 2026, fordi torsdagen den uge
              ligger i 2026. Beregneren viser ISO-året ved siden af ugenummeret, så du ikke
              bliver snydt ved årsskiftet.
            </p>
            <h2>Hvornår er der 53 uger om året?</h2>
            <p>
              De fleste år har 52 uger, men cirka hvert femte eller sjette år har 53. Det sker,
              når året starter på en torsdag (i almindelige år) eller på en onsdag (i
              skudår). 2026 er et 53-ugers år, fordi 1. januar er en torsdag.
            </p>
            <p>
              Ugenummeret viser samtidig ugens dag (mandag til søndag) og hvor mange uger
              året har. Det er nyttigt til planlægning, fakturering og projekter, der følger
              ISO-uger — fx mange danske skoler og offentlige institutioner.
            </p>
            <p>
              Vil du se flere tidsrelaterede beregnere, så prøv{" "}
              <Link href="/dato">datoberegneren</Link> (dage mellem datoer),{" "}
              <Link href="/nedtaelling">nedtælling</Link> (dage til en vigtig dato) eller{" "}
              <Link href="/alder">aldersberegneren</Link> (din præcise alder).
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/ugenummer" />
      </div>
      <Sidebar currentHref="/ugenummer" adSlotId="ugenummer-sidebar" />
    </div>
  );
}