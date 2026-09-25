import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { getDageTilEvents, getDageTilPrefix, isDageTilLocale } from "@/lib/dage-til";
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
  const dageTilLinks = isDageTilLocale(locale)
    ? getDageTilEvents(locale).map((event) => ({
        href: `${getDageTilPrefix(locale)}${event[locale].slug}`,
        question: event[locale].copy.question,
      }))
    : [];

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
