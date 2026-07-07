import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import TerminBeregner from "@/components/TerminBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("termin");
}

export default async function TerminPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("termin", locale) || getPageData("termin", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/termin`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/termin" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <TerminBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan beregnes din terminsdato</h2>
          <p>
            Terminsdatoen beregnes ved at lægge <strong>280 dage (40 uger)</strong> til første dag i din sidste menstruation (Naegeles regel). Denne metode bruges af læger og jordmødre verden over og er den mest udbredte beregningsmetode.
          </p>
          <p>
            Bemærk at beregningen antager en <strong>cyklus på 28 dage</strong> og at ægløsningen sker på dag 14. Hvis din cyklus er kortere eller længere, kan terminsdatoen justeres af din læge ved <strong>scanningen i uge 12</strong>.
          </p>

          <h2>Graviditetens tre trimestre</h2>
          <ul>
            <li><strong>1. trimester (uge 1-12):</strong> Alle organer dannes. Risikoen for spontan abort er størst i denne periode. Nakkefoldscanning tilbydes i uge 11-14.</li>
            <li><strong>2. trimester (uge 13-26):</strong> Barnet vokser hurtigt. De fleste oplever øget energi. Misdannelsesscanning tilbydes i uge 18-20.</li>
            <li><strong>3. trimester (uge 27-40):</strong> Barnet modnes og gør sig klar til fødsel. Fra uge 37 regnes barnet som fuldbårent.</li>
          </ul>

          <h2>Barsel i Danmark 2026</h2>
          <p>
            Mor har ret til barsel fra <strong>4 uger før terminsdatoen</strong>. Samlet har forældrene ret til 52 ugers barselsorlov med barselsdagpenge. I 2026 er reglerne:
          </p>
          <ul>
            <li>2 uger øremærket til mor før fødsel</li>
            <li>2 uger øremærket til far/medmor ved fødsel</li>
            <li>8 uger øremærket til mor efter fødsel</li>
            <li>9 uger øremærket til far/medmor (kan ikke overdrages)</li>
            <li>Resten kan deles frit mellem forældrene</li>
          </ul>
          <p>
            Brug vores <a href="/barselsdagpenge">barselsdagpenge-beregner</a> for at se hvad du kan få udbetalt under barsel.
          </p>
        </div>
        )}

        {locale === "se" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Så beräknas ditt beräknade förlossningsdatum</h2>
          <p>
            Det beräknade förlossningsdatumet (BF) räknas ut genom att lägga <strong>280 dagar (40 veckor)</strong> till första dagen i din senaste menstruation (Naegeles regel). Metoden används av läkare och barnmorskor världen över och är den mest utbredda beräkningsmetoden.
          </p>
          <p>
            Observera att beräkningen utgår från en <strong>cykel på 28 dagar</strong> och att ägglossningen sker på dag 14. Om din cykel är kortare eller längre kan datumet justeras av barnmorskan vid <strong>ultraljudet i vecka 12</strong>.
          </p>

          <h2>Graviditetens tre trimestrar</h2>
          <ul>
            <li><strong>1:a trimestern (vecka 1-12):</strong> Alla organ bildas. Risken för missfall är störst under denna period. Ett tidigt ultraljud kan erbjudas i vecka 11-14.</li>
            <li><strong>2:a trimestern (vecka 13-26):</strong> Barnet växer snabbt. De flesta upplever ökad energi. Rutinultraljudet görs vanligtvis i vecka 18-20.</li>
            <li><strong>3:e trimestern (vecka 27-40):</strong> Barnet mognar och gör sig redo för förlossningen. Från vecka 37 räknas barnet som fullgånget.</li>
          </ul>

          <h2>Föräldraledighet i Sverige 2026</h2>
          <p>
            I Sverige har föräldrarna tillsammans rätt till <strong>480 dagar med föräldrapenning</strong> per barn. Reglerna innebär bland annat:
          </p>
          <ul>
            <li>390 dagar på sjukpenningnivå (baserat på din inkomst)</li>
            <li>90 dagar på lägstanivå</li>
            <li>90 dagar är reserverade för vardera föräldern och kan inte överlåtas</li>
            <li>Gravid kan ta ut föräldrapenning från 60 dagar före beräknat datum</li>
            <li>Resterande dagar kan fördelas fritt mellan föräldrarna</li>
          </ul>
          <p>
            Använd vår <a href="/barselsdagpenge">räknare för föräldrapenning</a> för att se vad du kan få utbetalt under ledigheten.
          </p>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/termin" />
      </div>

      <Sidebar currentHref="/termin" adSlotId="termin-sidebar" />
    </div>
  );
}
