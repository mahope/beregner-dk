import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { getDageTilEvents, getDageTilPrefix, isDageTilLocale, dageTilArm, getDageTilAnswer, formatTargetDate,
} from "@/lib/dage-til";
import { excelEksempel } from "@/lib/nedtaelling-eksempler";
import { formatNumber } from "@/lib/format";
import NedtaellingBeregner from "@/components/NedtaellingBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("nedtaelling");
}

export default async function NedtaellingPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("nedtaelling", locale) || getPageData("nedtaelling", "da")!;
  // Samme liste som på `/dato`, og samme grund: den linkede til de 15 datoer
  // uden at svare. GSC's "nedrækning dagar" (183 visninger, pos. 9) og
  // "hur många dagar är det kvar till 1 november" (19, pos. 5) er spørgsmål
  // om et tal, så tallet står på siden der rangerer — ikke kun på undersiden.
  const dageTilLinks = isDageTilLocale(locale)
    ? getDageTilEvents(locale).map((event) => {
        const answer = getDageTilAnswer(event, locale, new Date());
        return {
          href: `${getDageTilPrefix(locale)}${dageTilArm(event, locale).slug}`,
          question: dageTilArm(event, locale).copy.question,
          days: answer.days,
          target: formatTargetDate(answer.targetDate, locale),
          weeks: answer.weeks,
          daysLeft: answer.daysLeft,
        };
      })
    : [];

  const eksempel = excelEksempel();
  const se = (n: number, maxDesimaler?: number) =>
    formatNumber(n, "se", maxDesimaler === undefined ? undefined : { maximumFractionDigits: maxDesimaler });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/nedtaelling`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/nedtaelling" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <NedtaellingBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor mange dage til…?</h2>
            <p>
              Tæl ned til en <strong>fødselsdag</strong>, <strong>ferie</strong>,{" "}
              <strong>eksamen</strong>, jul eller en hvilken som helst vigtig dato. Vælg datoen, så
              viser beregneren, hvor mange dage der er tilbage — både som antal dage og som uger og
              dage.
            </p>
            <h2>Sådan regnes der</h2>
            <p>
              Beregneren tæller fra <strong>dags dato</strong> til den dato, du vælger. Vælger du en
              dato, der allerede er passeret, viser den i stedet, hvor mange dage der er gået. Dagen i
              dag tælles ikke med, så vælger du morgendagen, får du 1 dag.
            </p>
            <h2>Dage og uger: sådan deles tallet op</h2>
            <p>
              En uge er 7 dage, så tallet kan altid skrives som hele uger plus de dage, der er
              tilbage. Sådan ser det ud for de antal dage, du ofte får:
            </p>
            <div className="overflow-x-auto not-prose">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 pr-4">Dage i alt</th>
                    <th className="py-2 pr-4">Hele uger</th>
                    <th className="py-2">Dage tilbage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4">30 dage</td>
                    <td className="py-2 pr-4">4 uger</td>
                    <td className="py-2">2 dage</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">45 dage</td>
                    <td className="py-2 pr-4">6 uger</td>
                    <td className="py-2">3 dage</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">60 dage</td>
                    <td className="py-2 pr-4">8 uger</td>
                    <td className="py-2">4 dage</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">100 dage</td>
                    <td className="py-2 pr-4">14 uger</td>
                    <td className="py-2">2 dage</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">365 dage</td>
                    <td className="py-2 pr-4">52 uger</td>
                    <td className="py-2">1 dag</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur många dagar till…?</h2>
            <p>
              Räkna ner till en <strong>födelsedag</strong>, <strong>semester</strong>,{" "}
              <strong>tenta</strong>, jul eller vilket viktigt datum som helst. Välj datumet, så visar
              kalkylatorn hur många dagar som är kvar — både som antal dagar och som veckor och dagar.
            </p>
            <h2>Så räknas det</h2>
            <p>
              Kalkylatorn räknar från <strong>dagens datum</strong> till det datum du väljer. Väljer
              du ett datum som redan passerat visar den i stället hur många dagar som gått. Dagens
              datum räknas inte med, så väljer du morgondagen får du 1 dag.
            </p>
            <h2>Dagar och veckor: så delas talet upp</h2>
            <p>
              En vecka är 7 dagar, så antalet kan alltid skrivas som hela veckor plus de dagar som är
              kvar. Så här ser det ut för de antal dagar man oftast får:
            </p>
            <div className="overflow-x-auto not-prose">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 pr-4">Dagar totalt</th>
                    <th className="py-2 pr-4">Hela veckor</th>
                    <th className="py-2">Dagar kvar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4">30 dagar</td>
                    <td className="py-2 pr-4">4 veckor</td>
                    <td className="py-2">2 dagar</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">45 dagar</td>
                    <td className="py-2 pr-4">6 veckor</td>
                    <td className="py-2">3 dagar</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">60 dagar</td>
                    <td className="py-2 pr-4">8 veckor</td>
                    <td className="py-2">4 dagar</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">100 dagar</td>
                    <td className="py-2 pr-4">14 veckor</td>
                    <td className="py-2">2 dagar</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">365 dagar</td>
                    <td className="py-2 pr-4">52 veckor</td>
                    <td className="py-2">1 dag</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Så räknar du ut dagar kvar i Excel</h2>
            <p>
              Sätt måldatumet i cell A1 och använd{" "}
              <code>=DATEDIF(IDAG();A1;&quot;d&quot;)</code>. Då står antalet dagar kvar i cellen
              bredvid, och formeln räknar om sig själv varje dag. Semikolon används i svensk
              Excel. <code>DATEDIF</code> är ett dolt namn — det står inte i funktionslistan, men
              fungerar.
            </p>
            <p>
              Från 29 september 2026 till julafton den 24 december 2026 kl. 09:30 är det{" "}
              <strong>
                {se(eksempel.dage)} dagar = {se(eksempel.helaVeckor)} hela veckor och{" "}
                {eksempel.restDage} dagar
              </strong>
              . Samma uttryck med <code>=DATEDIF(A1;IDAG();&quot;d&quot;)</code> ger dagar{" "}
              <strong>eftersom</strong> datumet passerat — <code>DATEDIF</code> kan bara räkna
              framåt och ger felet <code>#NUM!</code> bakvänt. Kalkylatorn visar i stället hur
              många dagar som gått sedan det datumet.
            </p>
            <h3>Timmar, minuter och sekunder kvar</h3>
            <p>
              Vill du ha timmar, minuter och sekunder i stället för hela dagar kan du inte gå
              vidare från <code>DATEDIF</code> — den räknar bara hela dagar och kastar resten av
              dagen bort. Excel lagrar ett datum som ett bråktal av ett dygn, så det är{" "}
              <code>A1−IDAG()</code> du ska gå med. Från 29 september 2026 till 24 december
              2026 kl. 09:30 ger det:
            </p>
            <div className="overflow-x-auto not-prose">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="py-2 pr-4">Formel i B1</th>
                    <th className="py-2 pr-4">Det den visar</th>
                    <th className="py-2 pr-4">Timer</th>
                    <th className="py-2">Minuter och sekunder</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 pr-4">=DATEDIF(IDAG();A1;&quot;d&quot;)</td>
                    <td className="py-2 pr-4">Hela dagar</td>
                    <td className="py-2 pr-4">{se(eksempel.dage)}</td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">=DATEDIF(IDAG();A1;&quot;d&quot;)*24</td>
                    <td className="py-2 pr-4">Timmar, utan minuter och sekunder</td>
                    <td className="py-2 pr-4">{se(eksempel.helaDagarTimmar)}</td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">=(A1−IDAG())*24</td>
                    <td className="py-2 pr-4">Timmar, med minuter och sekunder</td>
                    <td className="py-2 pr-4">{se(eksempel.timmerMedRest, 1)}</td>
                    <td className="py-2">
                      {se(eksempel.minuter)} min.{" "}
                      {se(eksempel.sekunder)} sek.
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">=MOD(A1−IDAG();1)*1440</td>
                    <td className="py-2 pr-4">Minuter i totalt</td>
                    <td className="py-2 pr-4">
                      {se(Math.floor(eksempel.minuter / 60))}
                    </td>
                    <td className="py-2">{se(eksempel.minuter)} min.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              <code>MOD(…;1)</code> är bara en tydligare skrivning av samma uttryck som raden
              ovanför — den tar endast dagens bråktal. Du behöver den bara om du vill se den.{" "}
              <strong>Cellen ska formateras som Tal</strong>, annars visar Excel ett datumformat,
              eftersom det är ett tal från en datumformel. Ska du räkna dagar mellan två
              valfria datum, arbetsdagar eller datum plus veckor:{" "}
              <Link href="/dato">datokalkylatorn</Link>.
            </p>
          </div>
        )}

        {dageTilLinks.length > 0 && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>
              {locale === "se"
                ? "Datum folk oftast räknar ner till"
                : "Datoer folk oftest tæller ned til"}
            </h2>
            <p>
              {locale === "se"
                ? "Vill du veta exakt hur många dagar som är kvar till ett bestämt datum? Sidan för varje datum räknar om sig själv varje dag, så talet er alltid aktuellt."
                : "Vil du se det præcise antal dage til en bestemt dato? Siden for hver dato tæller sig selv frem hver dag, så tallet er altid aktuelt."}
            </p>
            <p>
              {locale === "se"
                ? "Talet nedan är dagens antal dagar, och räknas om varje dag."
                : "Tallet nedenfor er dagens antal dage, og det genberegnes hver dag."}
            </p>
            <ul>
              {dageTilLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.question}</Link>{" "}
                  {locale === "se" ? (
                    <>
                      {link.target} {formatNumber(link.days, "se")}{" "}
                      {link.days === 1 ? "dag" : "dagar"}
                      {link.days === 0 ? " — det är dagen i dag." : ` (${formatNumber(link.weeks, "se")} ${link.weeks === 1 ? "vecka" : "veckor"}${link.daysLeft === 0 ? "" : ` och ${formatNumber(link.daysLeft, "se")} dagar`}).`}
                    </>
                  ) : (
                    <>
                      {link.target}:{" "}
                      <strong>{formatNumber(link.days, "da")} dage</strong>
                      {link.days === 0 ? " — det er dagen i dag." : ` (${formatNumber(link.weeks, "da")} ${link.weeks === 1 ? "uge" : "uger"}${link.daysLeft === 0 ? "" : ` og ${formatNumber(link.daysLeft, "da")} dage`}).`}
                    </>
                  )}
                </li>
              ))}
            </ul>
            <p>
              {locale === "se" ? (
                <>
                  Ska du räkna dagar mellan två valfria datum, arbetsdagar eller datum plus veckor
                  kan du använna{" "}
                  <Link href="/dato">datokalkylatorn</Link>.
                </>
              ) : (
                <>
                  Skal du tælle dage mellem to valgfrie datoer, arbejdsdage eller datoer plus uger,
                  kan du bruge <Link href="/dato">datoberegneren</Link>.
                </>
              )}
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/nedtaelling" />
      </div>
      <Sidebar currentHref="/nedtaelling" adSlotId="nedtaelling-sidebar" />
    </div>
  );
}
