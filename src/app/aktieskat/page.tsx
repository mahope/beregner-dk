import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import AktieskatBeregner from "@/components/AktieskatBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("aktieskat");
}

export default async function AktieskatPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("aktieskat", locale) || getPageData("aktieskat", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/aktieskat`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/aktieskat" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <AktieskatBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Aktieskat i Danmark 2026</h2>
          <p>
            Når du sælger aktier med gevinst i Danmark, skal du betale skat af gevinsten. Skatten afhænger af om du investerer via et <strong>frit depot</strong> eller en <strong>aktiesparekonto (ASK)</strong>.
          </p>

          <h2>Frit depot — realisationsbeskatning</h2>
          <p>
            I et <strong>frit depot</strong> beskattes du kun når du <strong>realiserer en gevinst</strong> (sælger aktier med overskud). Skattesatsen i 2026 er:
          </p>
          <ul>
            <li><strong>27%</strong> af de første 79.400 kr. i aktieindkomst</li>
            <li><strong>42%</strong> af aktieindkomst over 79.400 kr.</li>
          </ul>
          <p>
            For <strong>ægtepar</strong> er progressionsgrænsen det dobbelte: <strong>158.800 kr.</strong> samlet. Uudnyttet progressionsgrænse kan <strong>overføres mellem ægtefæller</strong>.
          </p>

          <h2>Aktiesparekonto (ASK) — lagerbeskatning</h2>
          <p>
            En <strong>aktiesparekonto</strong> beskattes med kun <strong>17%</strong>, men der er <strong>lagerbeskatning</strong>. Det betyder at du betaler skat af årets værdistigning — også selvom du ikke har solgt. Til gengæld er satsen markant lavere.
          </p>
          <p>
            I 2026 er det maksimale indskud på en ASK <strong>174.200 kr.</strong> Gevinster ud over indskuddet kan forblive på kontoen, men du kan ikke indsætte mere end loftet.
          </p>

          <h2>Hvornår er ASK bedst?</h2>
          <p>
            ASK er typisk en fordel når:
          </p>
          <ul>
            <li>Du investerer langsigtet og forventer gevinst</li>
            <li>Din aktieindkomst overstiger progressionsgrænsen (79.400 kr.)</li>
            <li>Du kan leve med lagerbeskatning (skat årligt, ikke kun ved salg)</li>
          </ul>
          <p>
            For store porteføljer kan forskellen mellem <strong>42% skat</strong> (frit depot over grænsen) og <strong>17%</strong> (ASK) betyde <strong>tusindvis af kroner i besparelse</strong> årligt.
          </p>

          <h2>Tabsmodregning</h2>
          <p>
            <strong>Tab på aktier</strong> kan modregnes i gevinster inden for samme depot-type. Har du et <strong>nettotab</strong> i et år, kan det <strong>fremføres til modregning</strong> i fremtidige gevinster. Vær opmærksom på at tab i frit depot <strong>ikke kan modregnes</strong> i ASK-gevinster og omvendt.
          </p>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/aktieskat" />
      </div>

      <Sidebar currentHref="/aktieskat" adSlotId="aktieskat-sidebar" />
    </div>
  );
}
