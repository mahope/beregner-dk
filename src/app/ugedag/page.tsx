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
  return generatePageMetadata("ugedag");
}

export default async function UgedagPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("ugedag", locale) || getPageData("ugedag", "da")!;
  const erSvensk = locale === "se";

  // Brødtekstens tal læses af de samme funktioner som værktøjet og som titlen
  // og FAQ'en. Der er ingen håndskreven ugedag i denne fil — mutation af
  // `ugedagsnavn` giver derfor røde her *og* i `ugedag.test.ts` på én gang.
  const eksempel = ugedagResultat("2026-01-01", erSvensk ? "se" : "da")!;
  const juleaften = ugedagResultat("2026-12-24", erSvensk ? "se" : "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/ugedag`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/ugedag" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <UgedagBeregner initialDato={iDagPaSiden(new Date(), "da")} />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          {erSvensk ? (
            <>
              <h2>Vilken veckodag är det, och varför är det så lätt att räkna ut?</h2>
              <p>
                En veckodag kan räknas fram utan undantag och utan att räkna om
                något. {eksempel.datoTekst} var en {eksempel.ugedagTekst.toLowerCase()} — och
                därefter är det bara sju dagar framåt för varje vecka. Det finns
                ingen särskild regel för skottår: en skottag är bara ytterligare
                en {eksempel.ugedagTekst.toLowerCase()}, och kalendern gör inget
                særligt ved den.
              </p>
              <p>
                Det är därför kalkylatorn kan svara på vilken veckodag som helst
                blev född, utan att den behöver ett register. Skriv ditt
                födelsedatum i fältet ovan.
              </p>
              <h2>Vad är skillnaden mellan veckodag och veckonummer?</h2>
              <p>
                De to svarer på to forskjelliga frågor. Veckodagen er
                <strong> vilken dag i veckan</strong> — måndag till söndag.
                Veckonummeret er <strong>vilken vecka på året</strong>, og der
                regeln er den som står i ISO 8601: vecka 1 är den vecka som
                innefattar årets <em>första torsdag</em>.
              </p>
              <p>
                Det är inte samma sak som &quot;den vecka som innehåller 1
                januari&quot;, och det er derför veckorna vid årsskiftet blir
                förvånande. {juleaften.datoTekst} ligger i vecka {juleaften.uge},
                eftersom 1 januari 2027 är en fredag — veckans första torsdag —
                och då börjar räkningen på nytt. Vill du bare se vilken vecka
                på året en datum ligger i, finns{" "}
                <Link href="/ugenummer">ugenummerkalkylatorn</Link>.
              </p>
              <p>
                Behöver du i stället veta hur många dagar som gått mellan två
                datum, räknar{" "}
                <Link href="/dagar-mellan-datum">dagar mellan datum</Link> ut det.
                Och för att räkna ut vilken veckodag det <em>er</em> just nu,
                utan att skriva in något, finns{" "}
                <Link href="/nedtaelling">nedräkningen till dagens datum</Link> og{" "}
                <Link href="/dato">datumsidan</Link>, som begge viser dagens dato
                med ugedagsnavn.
              </p>
            </>
          ) : (
            <>
              <h2>Hvilken ugedag er det, og hvorfor er det så let at regne?</h2>
              <p>
                En ugedag kan regnes frem uden undtagelser og uden at regne
                noget om. {eksempel.datoTekst} var en{" "}
                {eksempel.ugedagTekst.toLowerCase()} — og derfra tæller du syv
                dage frem for hver uge. Der er ingen særlig regel for skudår: en
                skuddag er blot én {eksempel.ugedagTekst.toLowerCase()} mere, og
                kalenderen gør intet særligt ved den.
              </p>
              <p>
                Det er derfor værktøjet kan svare på, hvilken ugedag du blev
                født på, uden at have et register. Skriv din fødselsdato i
                feltet ovenfor.
              </p>
              <h2>Hvad er forskellen på ugedag og ugenummer?</h2>
              <p>
                De to svarer på to forskellige spørgsmål. Ugedagen er{" "}
                <strong>hvilken dag i ugen</strong> — mandag til søndag.
                Ugenummeret er <strong>hvilken uge på året</strong>, og der er
                reglen fra ISO 8601: uge 1 er den uge, der indeholder årets{" "}
                <em>første torsdag</em>.
              </p>
              <p>
                Det er ikke det samme som »den uge, der indeholder 1. januar«,
                og derfor er ugerne ved årsskiftet overraskende.{" "}
                {juleaften.datoTekst} ligger i uge {juleaften.uge}, fordi 1.
                januar 2027 er en fredag — ugens første torsdag — og så begynder
                tællingen forfra. Vil du alene se, hvilken uge på året en dato
                ligger i, er{" "}
                <Link href="/ugenummer">ugenummerberegneren</Link> det rigtige
                sted.
              </p>
              <p>
                Skal du derimod vide, hvor mange dage der er gået mellem to
                datoer, tæller{" "}
                <Link href="/dage-mellem-datoer">dage mellem datoer</Link> det ud.
                Og vil du bare se hvilken ugedag det er <em>nu</em> uden at
                indtaste noget, står det på{" "}
                <Link href="/nedtaelling">nedtællingen til dagens dato</Link> og
                på <Link href="/dato">datovæktøjet</Link>, som begge viser
                dagens dato med ugedagsnavn.
              </p>
            </>
          )}
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/ugedag" />
      </div>
      <Sidebar currentHref="/ugedag" adSlotId="ugedag-sidebar" />
    </div>
  );
}
