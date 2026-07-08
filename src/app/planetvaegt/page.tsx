import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import PlanetVaegtBeregner from "@/components/PlanetVaegtBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("planetvaegt");
}

export default async function PlanetVaegtPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("planetvaegt", locale) || getPageData("planetvaegt", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/planetvaegt`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/planetvaegt" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <PlanetVaegtBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor meget vejer du på Månen og Mars?</h2>
            <p>
              Din vægt afhænger af <strong>tyngdekraften</strong>, og den er forskellig fra planet til
              planet. På <strong>Månen</strong> vejer du kun cirka en sjettedel af din vægt på Jorden,
              mens du på <strong>Jupiter</strong> ville veje mere end det dobbelte. Indtast din vægt og
              se den på alle planeterne — plus Månen og Solen.
            </p>
            <h2>Vægt eller masse?</h2>
            <p>
              Det er vigtigt at skelne: din <strong>masse</strong> (mængden af stof i din krop) er den
              samme overalt i universet. Det er kun <strong>vægten</strong> — den kraft, tyngdekraften
              trækker i dig med — der ændrer sig. Beregneren bruger hver klodes overfladetyngde i
              forhold til Jordens.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur mycket väger du på Månen och Mars?</h2>
            <p>
              Din vikt beror på <strong>gravitationen</strong>, och den är olika från planet till
              planet. På <strong>Månen</strong> väger du bara cirka en sjättedel av din vikt på Jorden,
              medan du på <strong>Jupiter</strong> skulle väga mer än det dubbla. Ange din vikt och se
              den på alla planeter — plus Månen och Solen.
            </p>
            <h2>Vikt eller massa?</h2>
            <p>
              Det är viktigt att skilja på: din <strong>massa</strong> (mängden materia i din kropp) är
              densamma överallt i universum. Det är bara <strong>vikten</strong> — den kraft som
              gravitationen drar i dig med — som ändras. Kalkylatorn använder varje himlakropps
              ytgravitation i förhållande till Jordens.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/planetvaegt" />
      </div>
      <Sidebar currentHref="/planetvaegt" adSlotId="planetvaegt-sidebar" />
    </div>
  );
}
