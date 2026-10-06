import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import UgedagBeregner from "@/components/UgedagBeregner";
import Link from "next/link";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { ugedagResultat } from "@/lib/ugedag";
import { iDagPaSiden } from "@/lib/lokal-dato";

export async function generateMetadata() {
  return generatePageMetadata("veckodag");
}

export default async function VeckodagPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("veckodag", locale) || getPageData("veckodag", "se")!;

  // Samme regler, samme funktioner og samme eksempel som den danske side —
  // forskellen er **kun** sproget. `ugedagResultat` læser sit eget sprog fra
  // den kalenderfil, den får, så de to sider kan umuligt vise hver sin
  // ugedag for samme dato.
  const eksempel = ugedagResultat("2026-01-01", "se")!;
  const julafton = ugedagResultat("2026-12-24", "se")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/veckodag`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/veckodag" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <UgedagBeregner initialDato={iDagPaSiden(new Date(), "se")} />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Vilken veckodag är det, och varför är det så lätt att räkna ut?</h2>
          <p>
            En veckodag kan räknas fram utan undantag och utan att räkna om
            något. {eksempel.datoTekst} var en {eksempel.ugedagTekst.toLowerCase()} — och
            därefter är det bara sju dagar framåt för varje vecka. Det finns ingen
            särskild regel för skottår: en skottag är bara ytterligare en{" "}
            {eksempel.ugedagTekst.toLowerCase()}, och kalendern gör inget särligt
            vid den.
          </p>
          <p>
            Det är därför kalkylatorn kan svara på vilken veckodag du föddes på,
            utan att ha något register. Skriv ditt födelsedatum i fältet ovan.
          </p>
          <h2>Vad är skillnaden mellan veckodag och veckonummer?</h2>
          <p>
            De två svarar på två frågor. Veckodagen är <strong>vilken dag i
            veckan</strong> — måndag till söndag. Veckonummeret är{" "}
            <strong>vilken vecka på året</strong>, och regeln kommer från ISO
            8601: vecka 1 är den vecka som innefattar årets <em>första torsdag</em>.
          </p>
          <p>
            Det är inte samma sak som ”den vecka som innehåller 1 januari”, och
            därför blir veckorna vid årsskiftet förvånande.{" "}
            {julafton.datoTekst} ligger i vecka {julafton.uge}, eftersom 1 januari
            2027 är en fredag — veckans första torsdag — och då börjar räkningen
            om. Kalkylatorn visar veckonummeret ovanför, i fältet{" "}
            <strong>ISO-veckonummer</strong>.
          </p>
          <p>
            Skal du i stället veta hur många dagar som gått mellan två datum,
            räknar <Link href="/dagar-mellan-datum">dagar mellan datum</Link> ut
            det. Och för att se vilken veckodag det <em>er</em> nu, utan att
            skriva in något, står det på{" "}
            <Link href="/nedtaelling">nedräkningen till dagens datum</Link> och på{" "}
            <Link href="/dato">datumsidan</Link>, som båda visar dagens datum med
            veckodagsnamn.
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/veckodag" />
      </div>
      <Sidebar currentHref="/veckodag" adSlotId="veckodag-sidebar" />
    </div>
  );
}
