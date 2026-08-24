import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import AlkoholenhederBeregner from "@/components/AlkoholenhederBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("alkoholenheder");
}

export default async function AlkoholenhederPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("alkoholenheder", locale) || getPageData("alkoholenheder", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/alkoholenheder`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/alkoholenheder" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <AlkoholenhederBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Sådan beregner du alkoholenheder</h2>
          <p>
            Beregneren omregner mængde og alkoholprocent til danske alkoholenheder (genstande).
            Én dansk genstand svarer til 12 g ren alkohol (Sundhedsstyrelsen). Resultatet er
            vejledende, da praktiske serveringsstørrelser kan variere.
          </p>

          <h3>Typiske genstande i almindelige drinks</h3>
          <ul>
            <li><strong>Almindelig øl (33 cl, 4,6 %):</strong> cirka 1 genstand</li>
            <li><strong>Stærk øl (33 cl, 8 %):</strong> cirka 1,7 genstand</li>
            <li><strong>Vin (12 cl, 12 %):</strong> cirka 1 genstand</li>
            <li><strong>Shot (4 cl, 40 %):</strong> cirka 1 genstand</li>
            <li><strong>Cider (33 cl, 4,5 %):</strong> cirka 1 genstand</li>
          </ul>

          <h3>Sundhedsstyrelsens anbefalinger</h3>
          <p>
            Sundhedsstyrelsen anbefaler, at voksne drikker maksimalt 10 genstande om ugen og
            højst 4 genstande på samme dag. For gravide og ammende anbefales helt at undgå alkohol.
            Anbefalingerne er ens for mænd og kvinder (kilde: Sundhedsstyrelsen, 2023).
          </p>

          <h3>Hvad betyder alkoholprocent?</h3>
          <p>
            Alkoholprocenten (ABV — Alcohol by Volume) angiver, hvor stor en andel af drikkevaren
            der er ren alkohol. En øl på 4,6 % indeholder 4,6 ml ren alkohol pr. 100 ml væske.
            Alkohol er lettere end vand (massefylde 0,789 g/ml), derfor vejer 1 ml ren alkohol
            kun 0,789 gram.
          </p>

          <h3>Brug beregneren i praksis</h3>
          <p>
            Vælg en serveringsstørrelse under "Almindelige serveringer" eller indtast selv
            mængde og alkoholprocent. Angiv antal drinks af samme type for at beregne samlet
            alkoholindtag. Resultatet viser både antal genstande og gram ren alkohol.
          </p>

          <p>
            Se også vores <Link href="/promille">promilleberegner</Link> for at vurdere din
            aktuelle alkoholpromille, eller <Link href="/kalorier">kalorieberegneren</Link> for
            at se, hvor mange kalorier alkoholen indeholder.
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/alkoholenheder" />
      </div>
      <Sidebar currentHref="/alkoholenheder" adSlotId="alkoholenheder-sidebar" />
    </div>
  );
}