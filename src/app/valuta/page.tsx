import ValutaBeregner from "@/components/ValutaBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("valuta");
}

export default async function ValutaPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("valuta", locale) || getPageData("valuta", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/valuta`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/valuta" }]} />

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
        <ValutaBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om valutaomregning</h2>
        <p>
          <strong>Valutakurser</strong> angiver, hvor meget én valuta er værd i forhold til en anden.
          Den <strong>danske krone (DKK)</strong> er bundet til euroen gennem <strong>ERM2-samarbejdet</strong>,
          hvilket betyder at kursen mellem DKK og EUR er relativt <strong>stabil</strong>.
        </p>

        <h3>Danmarks fastkurspolitik</h3>
        <p>
          Danmark fører <strong>fastkurspolitik</strong> over for euroen. Det betyder, at <strong>Nationalbanken</strong>
          holder kronens kurs inden for et snævert bånd omkring <strong>centralkursen på 7,46038 DKK pr. EUR</strong>.
          Dette giver <strong>stabilitet</strong> i handlen med eurolandene.
        </p>

        <h3>Populære valutaer</h3>
        <ul>
          <li><strong>EUR (Euro)</strong> - Bruges i 20 EU-lande</li>
          <li><strong>USD (US Dollar)</strong> - Verdens mest handlede valuta</li>
          <li><strong>GBP (Britiske Pund)</strong> - Storbritanniens valuta</li>
          <li><strong>SEK (Svenske Kroner)</strong> - Vores nabolands valuta</li>
          <li><strong>NOK (Norske Kroner)</strong> - Norges valuta</li>
        </ul>

        <h3>Tips ved valutaveksling</h3>
        <ul>
          <li>Sammenlign kurser mellem banker og vekselkontorer</li>
          <li>Undgå at veksle i lufthavne - kurserne er ofte dårligere</li>
          <li>Overvej online tjenester som Wise for bedre kurser</li>
          <li>Brug kreditkort med gode udenlandske transaktionsvilkår</li>
          <li>Veksle aldrig mere end nødvendigt - du taber på begge veje</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om valutaomvandling</h2>
        <p>
          <strong>Växelkurser</strong> anger hur mycket en <strong>valuta</strong> är värd i förhållande till en annan.
          Kurserna ändras hela tiden beroende på utbud och efterfrågan, räntor och det ekonomiska läget
          i respektive land.
        </p>

        <h3>Populära valutor</h3>
        <ul>
          <li><strong>EUR (Euro)</strong> - Används i 20 EU-länder</li>
          <li><strong>USD (US-dollar)</strong> - Världens mest handlade valuta</li>
          <li><strong>GBP (Brittiska pund)</strong> - Storbritanniens valuta</li>
          <li><strong>SEK (Svenska kronor)</strong> - Sveriges valuta</li>
          <li><strong>NOK (Norska kronor)</strong> - Vårt grannlands valuta</li>
        </ul>

        <h3>Tänk på avgifterna vid växling</h3>
        <p>
          Den <strong>växelkurs</strong> du ser är sällan den du faktiskt betalar. Banker och växelkontor
          lägger på ett <strong>påslag</strong> och tar ofta ut en <strong>växlingsavgift</strong>. Även vid
          kortbetalning utomlands kan det tillkomma avgifter, så jämför alltid den totala kostnaden.
        </p>

        <h3>Tips vid valutaväxling</h3>
        <ul>
          <li>Jämför kurser mellan banker och växelkontor</li>
          <li>Undvik att växla på flygplatser - kurserna är ofta sämre</li>
          <li>Överväg onlinetjänster som Wise för bättre kurser</li>
          <li>Använd kort med bra villkor för utlandsbetalningar</li>
          <li>Växla aldrig mer än nödvändigt - du förlorar på båda hållen</li>
        </ul>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/valuta" />
      </div>
      <Sidebar currentHref="/valuta" adSlotId="valuta-sidebar" />
    </div>
  );
}
