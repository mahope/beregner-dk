import dynamic from "next/dynamic";
const DatoBeregner = dynamic(() => import("@/components/DatoBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { getDageTilEvents, getDageTilPrefix, isDageTilLocale } from "@/lib/dage-til";

export async function generateMetadata() {
  return generatePageMetadata("dato");
}

export default async function DatoPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("dato", locale) || getPageData("dato", "da")!;
  // Search Console (2026-08-27→09-24) har "hvor mange dage er der til 1 december"
  // (996 visninger, pos. 5) og "hvor mange dage er der tilbage af 2026" (223, pos. 5)
  // som to af sidens fire søgninger. `/dage-til/*`-siderne svarer på begge, men
  // `/dato` linkede til ingen af dem: hele kæden lå kun den anden vej.
  const dageTilLinks = isDageTilLocale(locale)
    ? getDageTilEvents(locale).map((event) => ({
        href: `${getDageTilPrefix(locale)}${event[locale].slug}`,
        question: event[locale].copy.question,
      }))
    : [];

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/dato`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/dato" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <DatoBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du datoberegneren</h2>
        <p>Datoberegneren har <strong>fire forskellige funktioner</strong>:</p>

        <h3>1. Dage mellem datoer</h3>
        <p>
          Beregn hvor mange <strong>dage der er mellem to datoer</strong>. Du får også antal
          uger, ca. måneder, arbejdsdage og weekenddage.
        </p>
        <ul>
          <li>Vælg startdato og slutdato</li>
          <li>Resultatet vises automatisk</li>
          <li>
            Negativt tal betyder at slutdato er før startdato
          </li>
        </ul>

        <h3>2. Tilføj dage</h3>
        <p>
          Find ud af hvilken dato det bliver om <strong>X dage</strong>, eller hvilken dato det
          var for X dage siden.
        </p>
        <ul>
          <li>Vælg en udgangsdato</li>
          <li>Indtast antal dage (brug minus for at gå tilbage)</li>
          <li>Se resultatet med ugedag og dato</li>
        </ul>

        <h3>3. Arbejdsdage</h3>
        <p>
          Beregn en dato baseret på antal <strong>arbejdsdage</strong>. Perfekt til
          {" "}<strong>projektplanlægning</strong> og deadline-beregning.
        </p>
        <ul>
          <li>Vælg startdato</li>
          <li>Indtast antal arbejdsdage</li>
          <li>Weekender, helligdage og nytårsaften springes over</li>
        </ul>

        <h3>4. Alder</h3>
        <p>
          Beregn din <strong>præcise alder</strong> i år, måneder og dage. Se også hvor mange
          dage du har levet, og hvornår du fylder år. Vil du finde ud af, hvor gammel du
          var på en bestemt dato, kan du bruge{" "}
          <Link href="/alder">aldersberegneren</Link>.
        </p>

        <h2>Nyttige datofakta</h2>
        <ul>
          <li>1 år = 365 dage (366 i skudår)</li>
          <li>1 måned = ca. 30,44 dage i gennemsnit</li>
          <li>1 uge = 7 dage</li>
          <li>1 arbejdsuge = typisk 5 dage</li>
          <li>1 år &asymp; 52 uger</li>
          <li>1 år &asymp; 260 hverdage (uden helligdage)</li>
          <li>2026 har 253 arbejdsdage</li>
        </ul>

        <h2>Skudår</h2>
        <p>Et år er et <strong>skudår</strong> hvis:</p>
        <ul>
          <li>Året er deleligt med 4, OG</li>
          <li>Året er IKKE deleligt med 100, MED MINDRE</li>
          <li>Året er deleligt med 400</li>
        </ul>
        <p>
          Eksempel: 2024 er skudår (deleligt med 4). 2100 er ikke skudår
          (deleligt med 100). 2000 var skudår (deleligt med 400).
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Arbejdsdage tælles mandag til fredag og springer de offentlige
            helligdage over: nytårsdag, skærtorsdag, langfredag, påskedag,
            2. påskedag, grundlovsdag, juleaftensdag, juledag og 2. juledag.
            Nytårsaften er ikke en helligdag, men er heller ikke en
            arbejdsdag, så den springes også over. Store bededag var
            afskaffet som helligdag i 2024.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så här använder du datumräknaren</h2>
        <p>Datumräknaren har <strong>fyra olika funktioner</strong>:</p>

        <h3>1. Dagar mellan datum</h3>
        <p>
          Beräkna hur många <strong>dagar det är mellan två datum</strong>. Du får också antal
          hela veckor, ungefärligt antal månader, arbetsdagar och helgdagar.
        </p>
        <ul>
          <li>Välj startdatum och slutdatum</li>
          <li>Resultatet visas automatiskt</li>
          <li>
            Negativt tal betyder att slutdatumet är före startdatumet
          </li>
        </ul>

        <h3>2. Lägg till dagar</h3>
        <p>
          Ta reda på vilket datum det blir om <strong>X dagar</strong>, eller vilket datum det
          var för X dagar sedan.
        </p>
        <ul>
          <li>Välj ett utgångsdatum</li>
          <li>Ange antal dagar (använd minus för att gå bakåt)</li>
          <li>Se resultatet med veckodag och datum</li>
        </ul>

        <h3>3. Arbetsdagar</h3>
        <p>
          Beräkna ett datum baserat på antal <strong>arbetsdagar</strong>. Perfekt för
          {" "}<strong>projektplanering</strong> och deadline-beräkning.
        </p>
        <ul>
          <li>Välj startdatum</li>
          <li>Ange antal arbetsdagar</li>
          <li>Helger och röda dagar hoppas över</li>
        </ul>

        <h3>4. Ålder</h3>
        <p>
          Beräkna din <strong>exakta ålder</strong> i år, månader och dagar. Se också hur många
          dagar du har levt, och när du fyller år.
        </p>

        <h2>Nyttiga datumfakta</h2>
        <ul>
          <li>1 år = 365 dagar (366 under skottår)</li>
          <li>1 månad = ca 30,44 dagar i genomsnitt</li>
          <li>1 vecka = 7 dagar</li>
          <li>1 arbetsvecka = vanligtvis 5 dagar</li>
          <li>1 år &asymp; 52 veckor</li>
          <li>1 år &asymp; 260 vardagar (utan helgdagar)</li>
        </ul>

        <h2>Skottår</h2>
        <p>Ett år är ett <strong>skottår</strong> om:</p>
        <ul>
          <li>Året är delbart med 4, OCH</li>
          <li>Året är INTE delbart med 100, OM INTE</li>
          <li>Året är delbart med 400</li>
        </ul>
        <p>
          Exempel: 2024 är skottår (delbart med 4). 2100 är inte skottår
          (delbart med 100). 2000 var skottår (delbart med 400).
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips</p>
          <p className="text-blue-700">
            Arbetsdagar räknas måndag till fredag och hoppar över Sveriges
            rödagar: nyårsdagen, trettondedag jul, långfredagen, påskdagen,
            annandag påsk, första maj, kristi himmelsfärdsdag, nationaldagen,
            midsommarafton och midsommardagen, alla helgons dag, julafton,
            juldagen, annandag jul och nyårsafton.
          </p>
        </div>
      </div>
      )}

      {dageTilLinks.length > 0 && (
      <div className="prose dark:prose-invert max-w-none mt-12">
        <h2>
          {locale === "se"
            ? "Datum folk oftast räknar ner till"
            : "Datoer folk oftest tæller ned til"}
        </h2>
        <p>
          {locale === "se"
            ? "Vill du veta exakt hur många dagar som är kvar till ett bestämt datum? Sidan för varje datum räknar om sig själv varje dag, så talet är alltid aktuellt."
            : "Vil du se det præcise antal dage til en bestemt dato? Siden for hver dato tæller sig selv frem hver dag, så tallet er altid aktuelt."}
        </p>
        <ul>
          {dageTilLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.question}</Link>
            </li>
          ))}
        </ul>
        <p>
          {locale === "se" ? (
            <>
              Vill du bara räkna ner till ett datum och se det som veckor och dagar kan du
              använda <Link href="/nedtaelling">nedräkningen</Link>.
            </>
          ) : (
            <>
              Vil du bare tælle ned til én dato og se det som uger og dage, kan du bruge{" "}
              <Link href="/nedtaelling">nedtællingen</Link>.
            </>
          )}
        </p>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/dato" />
    </div>
  );
}
