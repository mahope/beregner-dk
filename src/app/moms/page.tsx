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

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om moms i Sverige (2026)</h2>
        <p>
          Moms (mervärdesskatt, eng. VAT) är en generell konsumtionsskatt på varor och tjänster i Sverige.
          Standardsatsen är <strong>25%</strong>, vilket är en av de högsta momssatserna i Europa.
          Utöver standardsatsen finns två reducerade satser: <strong>12%</strong> och <strong>6%</strong>.
        </p>

        <h3>Sveriges tre momssatser</h3>
        <ul>
          <li><strong>25% (standardsats):</strong> gäller de flesta varor och tjänster</li>
          <li><strong>12% (reducerad):</strong> livsmedel, restaurang- och cateringtjänster samt hotell och logi</li>
          <li><strong>6% (starkt reducerad):</strong> böcker, tidningar, kollektivtrafik, konserter, idrott och kultur</li>
        </ul>

        <h3>Så här räknar du ut moms</h3>
        <p>
          Det finns tre typiska beräkningar när du arbetar med moms (exemplen utgår från 25%):
        </p>
        <ul>
          <li><strong>Lägga på moms:</strong> Multiplicera beloppet med 1,25. Exempel: 1 000 kr &times; 1,25 = 1 250 kr inkl. moms</li>
          <li><strong>Räkna bort moms:</strong> Dividera beloppet med 1,25. Exempel: 1 250 kr &divide; 1,25 = 1 000 kr exkl. moms</li>
          <li><strong>Hitta momsandelen:</strong> Multiplicera beloppet inkl. moms med 0,20. Exempel: 1 250 kr &times; 0,20 = 250 kr i moms</li>
        </ul>
        <p>
          Observera att momsandelen i ett pris <em>inklusive</em> 25% moms är 20% (inte 25%), eftersom
          momsen beräknas på priset utan moms: 25 / 125 = 0,20. För 12% moms är andelen ca 10,71% och för
          6% moms ca 5,66%.
        </p>

        <h3>Momsfria varor och tjänster</h3>
        <p>
          Alla varor och tjänster är inte momspliktiga i Sverige. Momsfritt är bland annat:
        </p>
        <ul>
          <li>Sjukvård, tandvård och social omsorg</li>
          <li>Utbildning inom det offentliga skolväsendet</li>
          <li>Bank- och finansieringstjänster samt försäkringar</li>
          <li>Uthyrning av bostad</li>
        </ul>

        <h3>Momsregistrering för företag (2026)</h3>
        <p>
          Företag registrerar sig för moms hos <strong>Skatteverket</strong>. Företag med en omsättning
          på högst <strong>120 000 kr</strong> per år kan vara momsbefriade, men de flesta väljer eller
          måste momsregistrera sig. Registrerade företag tar ut moms på sin försäljning (utgående moms)
          och får dra av moms på inköp i verksamheten (ingående moms). Skillnaden redovisas till
          Skatteverket i en <strong>momsdeklaration</strong>.
        </p>
        <p>
          Redovisningsperioden beror på företagets omsättning:
        </p>
        <ul>
          <li><strong>Upp till 1 miljon kr/år:</strong> redovisning en gång per år</li>
          <li><strong>1–40 miljoner kr/år:</strong> redovisning varje kvartal</li>
          <li><strong>Över 40 miljoner kr/år:</strong> redovisning varje månad</li>
        </ul>

        <h3>Moms i EU och vid handel med utlandet</h3>
        <p>
          Momssatserna i EU varierar från 17% (Luxemburg) till 27% (Ungern). Sveriges 25% ligger i den
          höga delen. Vid köp av varor från utlandet gäller:
        </p>
        <ul>
          <li><strong>Inom EU:</strong> Privatpersoner betalar normalt momsen i säljarlandet. Företag kan använda omvänd skattskyldighet</li>
          <li><strong>Utanför EU:</strong> Du betalar svensk moms (25%) plus eventuell tull vid import</li>
        </ul>

        <h3>Moms på digitala tjänster</h3>
        <p>
          Köper du digitala tjänster som streaming, mjukvara eller e-böcker från utländska leverantörer
          ska de ta ut svensk moms (25%) via EU:s One Stop Shop-ordning. Du betalar alltså redan svensk
          moms när du köper från exempelvis Netflix, Spotify eller Apple.
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
