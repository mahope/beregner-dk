import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import OpskriftBeregner from "@/components/OpskriftBeregner";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { madvareMedNavn } from "@/lib/kalorier-madvarer";
import { OPSKRIFT_EKSEMPEL_DATA, opskriftLinje } from "@/lib/opskrift-kalorier";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";

/**
 * Ethvert tal på siden regnes af de funktioner, værktøjet selv bruger — der
 * står ingen håndskrevne kalorier i sætningerne, så en rettet række i
 * `kalorier-madvarer.ts` flytter både tabel, FAQ og metadata med det samme.
 */
export async function generateMetadata() {
  return generatePageMetadata("kalorier-i-opskrift");
}

export default async function KalorierIOpskriftPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("kalorier-i-opskrift", locale) || getPageData("kalorier-i-opskrift", "da")!;

  const dec = (vaerdi: number) => formatNumber(vaerdi, locale, { maximumFractionDigits: 0 });
  /** Kalorier pr. 100 g, læst fra tabellen — et navn der ikke findes, kaster. */
  const kcal100g = (navn: string) => {
    const madvare = madvareMedNavn(navn);
    if (!madvare) throw new Error(`Unknown food in the calorie prose: ${navn}`);
    return madvare.kcal100g;
  };
  const gramIAlt = (linjer: readonly { gram: number }[]) =>
    linjer.reduce((sum, linje) => sum + linje.gram, 0);
  const [carbonara, groed] = OPSKRIFT_EKSEMPEL_DATA;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kalorier-i-opskrift`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/kalorier-i-opskrift" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <OpskriftBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan beregner du kalorier i en opskrift</h2>
          <ol>
            <li>Vej hver ingrediens, og skriv mængden i gram i beregneren.</li>
            <li>Skriv hvor mange portioner retten giver.</li>
            <li>
              Læs kalorierne pr. portion — det er tallet der svarer på «hvor meget får jeg i
              mig?».
            </li>
          </ol>
          <p>
            Metoden er simpel, fordi kalorier bare lægges sammen: en portion indeholder summen af
            det, der er lagt i den. Tag{" "}
            <strong>
              {carbonara.navn.toLowerCase()} til {carbonara.portioner}
            </strong>
            . De fire ingredienser vejer tilsammen {dec(gramIAlt(carbonara.linjer))} g og giver{" "}
            {dec(carbonara.total.kcal)} kcal — delt på {carbonara.portioner} portioner bliver det{" "}
            <strong>{dec(carbonara.prPortion.kcal)} kcal pr. portion</strong>, med{" "}
            {dec(carbonara.prPortion.protein)} g protein, {dec(carbonara.prPortion.fedt)} g fedt og{" "}
            {dec(carbonara.prPortion.kulhydrat)} g kulhydrat.
          </p>

          <h2>To opskrifter udregnet</h2>
          <p>
            Tallene nedenfor kommer fra de samme 53 madvarer som{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>{" "}
            slår op i — US Department of Agricultures tabel USDA FoodData Central, udgave 2018-04,
            pr. 100 g.
          </p>

          {OPSKRIFT_EKSEMPEL_DATA.map((eksempel) => (
            <div key={eksempel.navn}>
              <h3>
                {eksempel.navn} til {eksempel.portioner}
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Ingrediens</th>
                    <th>Gram</th>
                    <th>kcal</th>
                  </tr>
                </thead>
                <tbody>
                  {eksempel.linjer.map((linje) => (
                    <tr key={linje.madvare.navn}>
                      <td>{linje.madvare.navn}</td>
                      <td>{dec(linje.gram)}</td>
                      <td>{dec(opskriftLinje(linje).kcal)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <strong>I alt</strong>
                    </td>
                    <td>
                      <strong>{dec(gramIAlt(eksempel.linjer))}</strong>
                    </td>
                    <td>
                      <strong>{dec(eksempel.total.kcal)} kcal</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Pr. portion ({eksempel.portioner})</strong>
                    </td>
                    <td>—</td>
                    <td>
                      <strong>{dec(eksempel.prPortion.kcal)} kcal</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          <h2>Hvad betyder protein, fedt og kulhydrat?</h2>
          <p>
            Kaloritallet er summen af de tre makronæringsstoffer: protein og kulhydrat giver 4 kcal
            pr. gram, fedt 9 kcal pr. gram. Derfor vejer en ret med meget fedt tungere i kalorier
            end sin vægt peger på — 100 g smør giver {dec(kcal100g("Smør"))} kcal, mens 100 g
            bagt kartoffel giver {dec(kcal100g("Kartoffel, bagt"))} kcal.
          </p>
          <p>
            Brødteksten viser makroernes andel af energien, regnet med de samme 4-4-9 kcal pr. gram.
            Kildens eget kalorital er målt med næringsstof-specifikke faktorer, så makroudregningen
            ikke lander præcis på summens kcal — det er forskellen mellem en beregning og en måling,
            ikke en fejl.
          </p>

          <h2>Vej tørre varer tørre og kogte varer kogte</h2>
          <p>
            Hver række bærer sin tilberedningsform i navnet, og den afgør tallet: «Nudler, tørrede»
            er de du vejer i køkkenet, mens kogt pasta har optaget vand og derfor færre kalorier pr.
            100 g. Samme logik gælder kartofler — rå, kogt, bagt og mosset er fire forskellige
            rækker med fire forskellige tal.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Tallene er vejledende</p>
            <p className="text-blue-700 dark:text-blue-400">
              Madvarernes næringstal er gennemsnit fra kilden, ikke målinger af lige netop din
              pose. Brug dem til at få retten i perspektiv — ikke som et korrekt måltal. Skal du
              regne mellem gram og deciliter først, har du{" "}
              <Link href="/gram-til-dl" className="underline font-medium">
                gram-til-dl-beregneren
              </Link>
              , og skal du vide hvor meget du skal købe,{" "}
              <Link href="/portioner" className="underline font-medium">
                portionsberegneren
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om kalorier i opskrifter" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/kalorier-i-opskrift" />
        </section>
      </div>

      <Sidebar currentHref="/kalorier-i-opskrift" adSlotId="kalorier-i-opskrift-sidebar" />
    </div>
  );
}
