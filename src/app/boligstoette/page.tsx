import BoligstoetteBeregner from "@/components/BoligstoetteBeregner";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import { formatNumber } from "@/lib/format";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";
import { BOLIGSTOETTE_2026 } from "@/lib/satser-2026";
import Link from "next/link";

export async function generateMetadata() {
  const metadata = await generatePageMetadata("boligstoette");
  return { ...metadata, referrer: "no-referrer" as const };
}

const kr = (value: number) => value.toLocaleString("da-DK");
const tenPercent = formatNumber(BOLIGSTOETTE_2026.wealth.considerationRates.tenPercent * 100, "da");
const twentyPercent = formatNumber(
  BOLIGSTOETTE_2026.wealth.considerationRates.twentyPercent * 100,
  "da",
);

export default async function BoligstoettePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boligstoette", locale) || getPageData("boligstoette", "da")!;

  return (
    <div className="mx-auto max-w-4xl">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/boligstoette`}
        category={pageData.schemaCategory}
        siteName={domainConfig.siteName}
        currency={domainConfig.currency}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs
        items={[
          { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
          { name: pageData.title, href: "/boligstoette" },
        ]}
      />

      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">{pageData.title}</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">{pageData.description}</p>
      </div>

      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
        <p className="font-semibold">Vil du se Udbetaling Danmarks vejledende beregning?</p>
        <p className="mt-1">
          Den officielle beregner kan bruges med eller uden login. Den tager blandt andet husleje,
          indkomst, formue, beboere og areal med og giver et mere konkret udgangspunkt.
        </p>
        <a
          href={BOLIGSTOETTE_2026.sources.officialCalculator}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Åbn den officielle beregner
        </a>
      </div>

      <BoligstoetteBeregner />

      {locale === "da" && (
        <section className="prose mt-12 max-w-none prose-blue">
          <h2>Hvad er boligstøtte?</h2>
          <p>
            Boligstøtte er et skattefrit tilskud til husleje for lejere, der opfylder
            Udbetaling Danmarks betingelser. Den endelige vurdering afhænger blandt andet af
            husstandsindkomst, formue, antal børn og voksne, husleje og boligens areal.
          </p>
          <p>
            Kender du ikke boligens areal, kan du slå adressen op i beregneren ovenfor. Så
            henter vi arealet fra BBR, og du kan rette det, hvis det ikke passer med din
            lejekontrakt.
          </p>

           <h2>Standardmaksimumsbeløb i 2026</h2>
           <p>
             Borger.dk oplyser følgende standardsatser pr. måned for almindelige lejere.
             Særlige ordninger og enkelte boligforhold kan give højere beløb, og tabellen er
             ikke et beløb, du automatisk har krav på.
           </p>
          <a
            href="#boligstoette-standardmaksima"
            className="sr-only focus:not-sr-only focus:mb-2 focus:inline-block focus:underline"
          >
            Spring til standardmaksimum
          </a>
          <div
            id="boligstoette-standardmaksima"
            className="not-prose overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            role="region"
            aria-label="Standardmaksimum for boligstøtte i 2026"
            tabIndex={-1}
          >
            <table>
              <caption className="sr-only">
                Standardmaksimum pr. måned i 2026 efter pensionstatus og antal børn
              </caption>
              <thead>
                <tr>
                  <th scope="col">Situation</th>
                  <th scope="col">0 børn</th>
                  <th scope="col">1-3 børn</th>
                  <th scope="col">4+ børn</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Lejer, ikke-pensionist</th>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.noChildren)} kr.</td>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.oneToThreeChildren)} kr.</td>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.nonPensioner.fourPlusChildren)} kr.</td>
                </tr>
                <tr>
                  <th scope="row">Førtidspension efter nye regler</th>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.noChildren)} kr.</td>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.oneToThreeChildren)} kr.</td>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.newDisabilityPension.fourPlusChildren)} kr.</td>
                </tr>
                <tr>
                  <th scope="row">Folkepension eller førtidspension før 2003</th>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.oldPension.noChildren)} kr.</td>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.oldPension.oneToThreeChildren)} kr.</td>
                  <td>{kr(BOLIGSTOETTE_2026.maximumMonthly.oldPension.fourPlusChildren)} kr.</td>
                </tr>
              </tbody>
            </table>
          </div>
            <p>
              Kilder:{" "}
              <a href={BOLIGSTOETTE_2026.sources.officialRules} target="_blank" rel="noopener noreferrer">
                Udbetaling Danmark på Borger.dk
              </a>
              ,{" "}
              <a href={BOLIGSTOETTE_2026.sources.officialFormula} target="_blank" rel="noopener noreferrer">
                VEJ nr. 9156 om husstandsindkomst
              </a>{" "}
              og{" "}
              <a href={BOLIGSTOETTE_2026.sources.officialRates} target="_blank" rel="noopener noreferrer">
                VEJ nr. 9336 om 2026-satser
              </a>
              , verificeret {BOLIGSTOETTE_2026.verifiedAt}.
            </p>
           <p>
             Pensionsrækkerne er en ordningsafklaring, ikke et krav på boligstøtte. Nogle
             pensionister kan være berettiget til boligydelse, som følger andre regler; den
             officielle beregner afgør, hvilken ordning der gælder.
           </p>

          <h2>Formue påvirker boligstøtten</h2>
           <p>
             Der er ingen øvre grænse for, hvor stor formue du kan have og fortsætte få
             boligstøtte. I den forenklede vurdering regnes {tenPercent} % af formuen over den laveste
             grænse i det første bånd og {twentyPercent} % af beløbet over den højeste grænse. Den {tenPercent} %-del
             fortsætter også i det øverste interval. Udbetaling Danmarks fulde beregning
              anvender flere oplysninger end dette forenklede standardinterval.
           </p>
          <a
            href="#boligstoette-formuegraenser"
            className="sr-only focus:not-sr-only focus:mb-2 focus:inline-block focus:underline"
          >
            Spring til formuegrænser
          </a>
          <div
            id="boligstoette-formuegraenser"
            className="not-prose overflow-x-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            role="region"
            aria-label="Formuegrænser for boligstøtte i 2026"
            tabIndex={-1}
          >
            <table>
              <caption className="sr-only">
                Hvordan formue påvirker vurderingen af boligstøtte i 2026
              </caption>
              <thead>
                 <tr>
                   <th scope="col">Gruppe</th>
                   <th scope="col">Ingen betydning</th>
                   <th scope="col">{tenPercent} % i første bånd</th>
                   <th scope="col">
                     {tenPercent} % i første bånd + {twentyPercent} % over øvre grænse
                   </th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                   <th scope="row">Ikke-pensionister og førtidspensionister efter nye regler</th>
                   <td>0–{kr(BOLIGSTOETTE_2026.wealth.nonPensioner.noEffect)} kr.</td>
                   <td>
                     Over {kr(BOLIGSTOETTE_2026.wealth.nonPensioner.noEffect)} kr. til{" "}
                     {kr(BOLIGSTOETTE_2026.wealth.nonPensioner.tenPercent)} kr.
                   </td>
                   <td>{kr(BOLIGSTOETTE_2026.wealth.nonPensioner.tenPercent)} kr. og derover</td>
                 </tr>
                 <tr>
                   <th scope="row">Folkepensionister og førtidspensionister før 2003</th>
                   <td>0–{kr(BOLIGSTOETTE_2026.wealth.pensioner.noEffect)} kr.</td>
                   <td>
                     Over {kr(BOLIGSTOETTE_2026.wealth.pensioner.noEffect)} kr. til{" "}
                     {kr(BOLIGSTOETTE_2026.wealth.pensioner.tenPercent)} kr.
                   </td>
                   <td>{kr(BOLIGSTOETTE_2026.wealth.pensioner.tenPercent)} kr. og derover</td>
                 </tr>
              </tbody>
            </table>
          </div>

          <h2>Hvilke huslejeudgifter tæller med?</h2>
          <p>
            Udbetaling Danmark oplyser, at huslejen skal oplyses uden forbrugsudgifter.
             Følgende skal derfor normalt trækkes fra, før du bruger beløbet i vores standardinterval:
          </p>
          <ul>
            {BOLIGSTOETTE_2026.rentExcludes.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <p>
            Betaler du særskilt for forbedringer som et nyt køkken eller bad, skal beløbet
            lægges til huslejen, før du bruger det i beregningen.
          </p>

          <h2>Boligstøtte og boligydelse</h2>
          <p>
            Boligstøtte er den almindelige ordning for lejere. Folkepensionister og visse
            førtidspensionister kan være berettiget til boligydelse, som er en særlig ordning
            med andre regler. Den officielle beregner afgør, hvilken ordning der gælder.
          </p>

          <h3>Vil du se den fulde guide?</h3>
          <p>
            Læs <Link href="/blog/boligstoette-2026-nye-regler">boligstøtte 2026-guiden</Link>{" "}
            for sammenhængen mellem husleje, indkomst, formue, areal og de officielle kilder.
          </p>

          <div className="not-prose my-6 rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
            <p className="font-medium text-blue-900">Få den officielle vurdering</p>
            <p className="mt-1 text-blue-800">
              <a href={BOLIGSTOETTE_2026.sources.officialCalculator} target="_blank" rel="noopener noreferrer" className="underline">
                Åbn Udbetaling Danmarks beregner
              </a>{" "}
              og fortsæt uden login, hvis du vil se den vejledende beregning.
            </p>
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Ofte stillede spørgsmål om boligstøtte</h2>
        <FAQ items={pageData.faqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/boligstoette" />
      </section>
    </div>
  );
}
