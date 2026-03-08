import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import MomsBeregner from "@/components/MomsBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("moms");
}

export default async function MomsPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("moms", locale) || getPageData("moms", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/moms`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/moms" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <MomsBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om moms i Danmark (2026)</h2>
        <p>
          Moms (merværdiafgift, eng. VAT) er en generel forbrugsafgift på varer og tjenesteydelser i Danmark.
          Med en momssats på <strong>25%</strong> har Danmark en af de højeste momssatser i verden.
          Momsen har været 25% siden 1992, og der er ingen planlagte ændringer for 2026.
        </p>

        <h3>Sådan beregner du moms</h3>
        <p>
          Der er tre typiske beregninger, når du arbejder med moms:
        </p>
        <ul>
          <li><strong>Tillæg moms:</strong> Gang beløbet med 1,25. Eksempel: 1.000 kr &times; 1,25 = 1.250 kr inkl. moms</li>
          <li><strong>Fratræk moms:</strong> Divider beløbet med 1,25. Eksempel: 1.250 kr &divide; 1,25 = 1.000 kr ekskl. moms</li>
          <li><strong>Find momsandelen:</strong> Gang beløbet inkl. moms med 0,20. Eksempel: 1.250 kr &times; 0,20 = 250 kr i moms</li>
        </ul>
        <p>
          Bemærk at momsandelen i en pris <em>inklusiv</em> moms er 20% (ikke 25%), fordi momsen
          beregnes af prisen uden moms: 25 / 125 = 0,20.
        </p>

        <h3>Momsfrie varer og ydelser</h3>
        <p>
          Ikke alle varer og ydelser er momspligtige i Danmark. Momsfritaget er bl.a.:
        </p>
        <ul>
          <li>Sundhedsydelser (læge, tandlæge, psykolog)</li>
          <li>Undervisning og uddannelse</li>
          <li>Finansielle tjenesteydelser (bank, forsikring)</li>
          <li>Udlejning af fast ejendom (bolig)</li>
          <li>Personbefordring (bus, tog, fly inden for DK)</li>
          <li>Aviser og tidsskrifter (0% moms)</li>
        </ul>

        <h3>Momsregistrering for virksomheder (2026)</h3>
        <p>
          Virksomheder med en årlig omsætning over <strong>50.000 kr</strong> skal momsregistreres hos
          Erhvervsstyrelsen. Registrerede virksomheder opkræver moms af deres salg (salgsmoms) og kan
          fradrage moms på erhvervsmæssige indkøb (købsmoms). Forskellen mellem salgsmoms og købsmoms
          afregnes med Skattestyrelsen.
        </p>
        <p>
          Momsperioden afhænger af din omsætning:
        </p>
        <ul>
          <li><strong>Under 5 mio. kr/år:</strong> Afregning hvert halvår</li>
          <li><strong>5-50 mio. kr/år:</strong> Afregning hvert kvartal</li>
          <li><strong>Over 50 mio. kr/år:</strong> Afregning hver måned</li>
        </ul>

        <h3>Moms i EU og ved handel med udlandet</h3>
        <p>
          EU-momssatserne varierer fra 17% (Luxembourg) til 27% (Ungarn). Danmarks 25% ligger i den
          høje ende. Ved køb af varer fra udlandet gælder:
        </p>
        <ul>
          <li><strong>Inden for EU:</strong> Privatpersoner betaler normalt momsen i sælgerlandet. Virksomheder kan bruge reverse charge</li>
          <li><strong>Uden for EU:</strong> Du betaler dansk moms (25%) + eventuel told ved import over 1.150 kr</li>
        </ul>

        <h3>Moms på digitale ydelser</h3>
        <p>
          Køber du digitale tjenester som streaming, software eller e-bøger fra udenlandske
          udbydere, skal de opkræve dansk moms (25%) via EU&apos;s One Stop Shop-ordning.
          Du betaler altså allerede dansk moms når du køber fra fx Netflix, Spotify eller Apple.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/moms" />
      </div>
      <Sidebar currentHref="/moms" adSlotId="moms-sidebar" />
    </div>
  );
}
