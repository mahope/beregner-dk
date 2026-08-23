import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import dynamic from "next/dynamic";
const OpsparingsBeregner = dynamic(() => import("@/components/OpsparingsBeregner"));
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("opsparing");
}

export default async function OpsparingPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("opsparing", locale) || getPageData("opsparing", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/opsparing`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/opsparing" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <OpsparingsBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du opsparingsberegneren</h2>
        <p>
          Med vores <strong>opsparingsberegner</strong> kan du se, hvordan din opsparing vokser
          over tid med <strong>renters rente</strong>:
        </p>
        <ol>
          <li>
            <strong>Startbeløb:</strong> Hvor meget har du at starte med?
          </li>
          <li>
            <strong>Månedlig indbetaling:</strong> Hvor meget vil du spare op
            hver måned?
          </li>
          <li>
            <strong>Årlig rente:</strong> Hvilken rente/afkast forventer du?
          </li>
          <li>
            <strong>Periode:</strong> Hvor mange år vil du spare op?
          </li>
        </ol>

        <h2>Kraften i renters rente</h2>
        <p>
          <strong>Renters rente</strong> er en af de mest kraftfulde kræfter inden for økonomi.
          Albert Einstein sagde angiveligt, at &quot;<strong>renters rente er verdens
          ottende vidunder</strong>&quot;.
        </p>
        <p>Her er et eksempel på forskellen:</p>
        <ul>
          <li>
            <strong>Uden renters rente:</strong> 10.000 kr med 5% simpel rente i
            30 år = 25.000 kr
          </li>
          <li>
            <strong>Med renters rente:</strong> 10.000 kr med 5% renters rente i
            30 år = 43.219 kr
          </li>
        </ul>
        <p>Det er næsten det dobbelte!</p>

        <h2>Typiske afkast på forskellige opsparingstyper</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Typisk årligt afkast</th>
                <th>Risiko</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Bankkonto</td>
                <td>0-1%</td>
                <td>Ingen</td>
              </tr>
              <tr>
                <td>Obligationer</td>
                <td>2-4%</td>
                <td>Lav</td>
              </tr>
              <tr>
                <td>Blandede fonde</td>
                <td>4-6%</td>
                <td>Medium</td>
              </tr>
              <tr>
                <td>Aktiefonde</td>
                <td>6-8%</td>
                <td>Høj</td>
              </tr>
              <tr>
                <td>Enkeltaktier</td>
                <td>Varierende</td>
                <td>Meget høj</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips til effektiv opsparing</h2>
        <ul>
          <li>
            <strong>Start tidligt:</strong> Tid er vigtigere end beløb. Selv
            små beløb vokser enormt over 30-40 år.
          </li>
          <li>
            <strong>Automatiser:</strong> Sæt en fast overførsel op, så du
            sparer automatisk hver måned.
          </li>
          <li>
            <strong>Øg gradvist:</strong> Hver gang du får lønforhøjelse, øg
            din opsparing.
          </li>
          <li>
            <strong>Diversificer:</strong> Spred din opsparing på flere typer
            investeringer.
          </li>
          <li>
            <strong>Hold omkostninger lave:</strong> Vælg fonde med lave
            årlige omkostninger (ÅOP).
          </li>
        </ul>

        <p>
          Et budget er første skridt til at finde penge til opsparing. Se vores <Link href="/blog/maanedsbudget-2026-komplet-guide" className="text-blue-600 hover:underline">komplette guide til månedsbudget 2026</Link>.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Eksempel: Tid vs. beløb</p>
          <p className="text-green-700">
            Person A starter med 25 år og sparer 1.000 kr/md i 40 år (5% rente) = <strong>1,5 mio kr</strong><br />
            Person B starter med 35 år og sparer 2.000 kr/md i 30 år (5% rente) = <strong>1,7 mio kr</strong><br />
            Person A indbetaler kun 480.000 kr, Person B indbetaler 720.000 kr - men forskellen er minimal!
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner viser beløb før skat og inflation. Faktisk afkast
            kan variere betydeligt. Historiske afkast er ingen garanti for
            fremtidige afkast.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så använder du sparkalkylatorn</h2>
        <p>
          Med vår <strong>sparkalkylator</strong> ser du hur ditt <strong>sparande</strong> växer
          över tid tack vare <strong>ränta-på-ränta</strong>:
        </p>
        <ol>
          <li>
            <strong>Startbelopp:</strong> hur mycket har du att börja med?
          </li>
          <li>
            <strong>Månadssparande:</strong> hur mycket vill du spara varje
            månad?
          </li>
          <li>
            <strong>Årlig avkastning:</strong> vilken ränta eller avkastning
            räknar du med?
          </li>
          <li>
            <strong>Sparhorisont:</strong> hur många år vill du spara?
          </li>
        </ol>

        <h2>Kraften i ränta-på-ränta</h2>
        <p>
          <strong>Ränta-på-ränta</strong> är en av de mest kraftfulla krafterna inom ekonomi.
          Albert Einstein ska ha sagt att &quot;<strong>ränta-på-ränta är världens
          åttonde underverk</strong>&quot;.
        </p>
        <p>Här är ett exempel på skillnaden:</p>
        <ul>
          <li>
            <strong>Utan ränta-på-ränta:</strong> 100 000 kr med 5 % enkel ränta i
            30 år = 250 000 kr
          </li>
          <li>
            <strong>Med ränta-på-ränta:</strong> 100 000 kr med 5 % ränta-på-ränta i
            30 år = 432 194 kr
          </li>
        </ul>
        <p>Nästan dubbelt så mycket!</p>

        <h2>Typisk avkastning på olika sparformer</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Typ</th>
                <th>Typisk årlig avkastning</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sparkonto</td>
                <td>0-3 %</td>
                <td>Ingen</td>
              </tr>
              <tr>
                <td>Obligationer</td>
                <td>2-4 %</td>
                <td>Låg</td>
              </tr>
              <tr>
                <td>Blandfonder</td>
                <td>4-6 %</td>
                <td>Medel</td>
              </tr>
              <tr>
                <td>Aktiefonder</td>
                <td>6-8 %</td>
                <td>Hög</td>
              </tr>
              <tr>
                <td>Enskilda aktier</td>
                <td>Varierande</td>
                <td>Mycket hög</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips för ett effektivt sparande</h2>
        <ul>
          <li>
            <strong>Börja tidigt:</strong> tiden är viktigare än beloppet. Även
            små belopp växer enormt över 30-40 år.
          </li>
          <li>
            <strong>Automatisera:</strong> lägg upp en fast överföring så att du
            sparar automatiskt varje månad.
          </li>
          <li>
            <strong>Öka gradvis:</strong> höj sparandet varje gång du får en
            löneökning.
          </li>
          <li>
            <strong>Diversifiera:</strong> sprid ditt sparande över flera typer
            av tillgångar.
          </li>
          <li>
            <strong>Håll avgifterna låga:</strong> välj fonder med låga årliga
            avgifter.
          </li>
        </ul>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Exempel: tid kontra belopp</p>
          <p className="text-green-700">
            Person A börjar vid 25 års ålder och sparar 1 000 kr/mån i 40 år (5 % ränta) = <strong>1,5 mkr</strong><br />
            Person B börjar vid 35 års ålder och sparar 2 000 kr/mån i 30 år (5 % ränta) = <strong>1,7 mkr</strong><br />
            Person A sätter bara in 480 000 kr, Person B sätter in 720 000 kr - men skillnaden är liten!
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Observera</p>
          <p className="text-yellow-700">
            Kalkylatorn visar belopp före skatt och inflation. Sparar du i ett
            ISK eller på ett sparkonto påverkas nettoresultatet av skatt och
            avgifter. Faktisk avkastning kan variera betydligt, och historisk
            avkastning är ingen garanti för framtida avkastning.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/opsparing" />
    </div>
  );
}
