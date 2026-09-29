import Link from "next/link";
import ProcentBeregner from "@/components/ProcentBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";
import { formatNumber } from "@/lib/format";
import {
  PROCENT_SKILLNAD_EKSEMPEL,
  procentDifferens,
  procentForskel,
} from "@/lib/procent";

export async function generateMetadata() {
  return generatePageMetadata("procent");
}

export default async function ProcentPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("procent", locale) || getPageData("procent", "da")!;

  // Tallene i skillnadsafsnittet regnes, ikke skrives i hånden. Intl bruger
  // U+00A0 som tusindtalsseparator på svensk, mens resten af den svenske side
  // bruger et almindeligt mellemrum, så tegnet normaliseres — ellers ville de
  // samme tal stå med to forskellige separatorer på én side.
  const [lonEksempel, belobEksempel] = PROCENT_SKILLNAD_EKSEMPEL;
  const num = (vaerdi: number, decimaler = 0) =>
    formatNumber(vaerdi, locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    }).replace(/\u00a0/g, " ");

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/procent`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/procent" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <ProcentBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du procentberegneren</h2>
        <p>
          Vores procentberegner kan hjælpe dig med fire forskellige typer
          beregninger:
        </p>
        <ol>
          <li>
            <strong>Find procent:</strong> Hvor mange procent er X af Y?
          </li>
          <li>
            <strong>Find resultat:</strong> Hvad er X% af Y?
          </li>
          <li>
            <strong>Find heltal:</strong> Hvis X er Y%, hvad er så 100%?
          </li>
          <li>
            <strong>Procentvis ændring:</strong> Hvor mange procent er
            stigningen/faldet fra X til Y?
          </li>
        </ol>

        <h2>Procentregning i hverdagen</h2>
        <p>Procent bruges overalt i hverdagen:</p>
        <ul>
          <li>
            <strong>Rabatter:</strong> 25% rabat på en vare til 400 kr = du
            sparer 100 kr. En vare, der koster 9.000 kr og er sat 1.125 kr.
            ned, har en rabat på 1.125 ÷ 9.000 = 12,5 %
          </li>
          <li>
            <strong>Moms:</strong> 25% moms på 1.000 kr = 250 kr i moms (1.250
            kr total)
          </li>
          <li>
            <strong>Renter:</strong> 5% rente på 10.000 kr = 500 kr i rente
          </li>
          <li>
            <strong>Lønstigninger:</strong> 3% stigning på 30.000 kr = 900 kr
            mere
          </li>
          <li>
            <strong>Skat:</strong> Skatten er ikke én sats. Kommuneskatten er i
            gennemsnit ca. 25 %, og dertil kommer arbejdsmarkedsbidrag samt
            statslig indkomstskat for de højeste indkomster. Hvad du reelt
            betaler afhænger af din kommune og din indkomst — få et færdigt
            tal med{" "}
            <Link href="/loen-efter-skat" className="text-blue-700 underline">
              løn efter skat
            </Link>
            .
          </li>
        </ul>

        <h2>Hurtige procent-tricks</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>For at finde...</th>
                <th>Gør dette</th>
                <th>Eksempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>Flyt kommaet én plads til venstre</td>
                <td>10% af 250 = 25</td>
              </tr>
              <tr>
                <td>5%</td>
                <td>Find 10% og halver</td>
                <td>5% af 250 = 12,5</td>
              </tr>
              <tr>
                <td>25%</td>
                <td>Divider med 4</td>
                <td>25% af 200 = 50</td>
              </tr>
              <tr>
                <td>50%</td>
                <td>Halver tallet</td>
                <td>50% af 180 = 90</td>
              </tr>
              <tr>
                <td>1%</td>
                <td>Divider med 100</td>
                <td>1% af 350 = 3,5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Hvordan regner man procent i Excel?</h2>
        <p>
          Skriver du procent i Excel er det her formlerne du skal bruge. Antag
          at beløbet står i A1 og sammenligningstallet i B1:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Spørgsmål</th>
                <th>Formel</th>
                <th>Eksempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hvad er A1 i procent af B1?</td>
                <td>
                  <code>=A1/B1*100</code>
                </td>
                <td>2.500 af 10.000 = 25</td>
              </tr>
              <tr>
                <td>Hvad er A1 procent af B1?</td>
                <td>
                  <code>=A1*B1/100</code>
                </td>
                <td>10 procent af 10.000 = 1.000</td>
              </tr>
              <tr>
                <td>Hvor stor er ændringen fra A1 til B1?</td>
                <td>
                  <code>=(B1-A1)/A1*100</code>
                </td>
                <td>9.000 til 7.875 = -12,5</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Skriver du <code>=A1/B1</code> får du andelen (0,25), og så skal cellen
          formateres som procent. En løn, der stiger i procent, regner du med{" "}
          <Link href="/loenstigning" className="text-blue-700 underline">
            lønstigning i procent
          </Link>
          .
        </p>

        {/* De fire formler står i ProcentBeregners "Formler"-boks lige
            under værktøjet. Her lå de en gang til igen i et eget afsnit, så
            de stod to gange i samme dokument i to overskrifter om det
            samme. */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Husk at 50% af 40 er det samme som 40% af 50 - begge giver 20. Dette
            trick kan gøre hovedregning nemmere!
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så här använder du procenträknaren</h2>
        <p>
          Vår procenträknare kan hjälpa dig med fyra olika typer av
          beräkningar:
        </p>
        <ol>
          <li>
            <strong>Hitta procent:</strong> Hur många procent är X av Y?
          </li>
          <li>
            <strong>Hitta resultat:</strong> Vad är X% av Y?
          </li>
          <li>
            <strong>Hitta heltal:</strong> Om X är Y%, vad är då 100%?
          </li>
          <li>
            <strong>Procentuell förändring:</strong> Hur många procent är
            ökningen/minskningen från X till Y?
          </li>
        </ol>

        <h2>Procenträkning i vardagen</h2>
        <p>Procent används överallt i vardagen:</p>
        <ul>
          <li>
            <strong>Rabatter:</strong> 25% rabatt på en vara för 400 kr = du
            sparar 100 kr
          </li>
          <li>
            <strong>Moms:</strong> 25% moms på 1000 kr = 250 kr i moms (1250 kr
            totalt)
          </li>
          <li>
            <strong>Ränta:</strong> 5% ränta på 10 000 kr = 500 kr i ränta
          </li>
          <li>
            <strong>Löneökningar:</strong> 3% ökning på 30 000 kr = 900 kr
            mer
          </li>
          <li>
            <strong>Skatt:</strong> Skatt i Sverige är kommunal skatt
            plus statlig skatt, så procentsatsen beror på din kommun och
            inkomstnivå. Får ett färdigt nettolön:{" "}
            <Link href="/lon-efter-skatt" className="text-blue-700 underline">
              lön efter skatt
            </Link>
            .
          </li>
        </ul>

        <h2>Snabba procent-knep</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>För att hitta...</th>
                <th>Gör så här</th>
                <th>Exempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10%</td>
                <td>Flytta kommat ett steg åt vänster</td>
                <td>10% av 250 = 25</td>
              </tr>
              <tr>
                <td>5%</td>
                <td>Hitta 10% och halvera</td>
                <td>5% av 250 = 12,5</td>
              </tr>
              <tr>
                <td>25%</td>
                <td>Dividera med 4</td>
                <td>25% av 200 = 50</td>
              </tr>
              <tr>
                <td>50%</td>
                <td>Halvera talet</td>
                <td>50% av 180 = 90</td>
              </tr>
              <tr>
                <td>1%</td>
                <td>Dividera med 100</td>
                <td>1% av 350 = 3,5</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Hur räknar man ut procent i Excel?</h2>
        <p>
          Skriver du procent i Excel är det här formlerna du behöver. Anta
          att beloppet står i A1 och jämförelsetalet i B1:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fråga</th>
                <th>Formel</th>
                <th>Exempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Vad är A1 som procent av B1?</td>
                <td>
                  <code>=A1/B1*100</code>
                </td>
                <td>2 500 av 10 000 = 25</td>
              </tr>
              <tr>
                <td>Vad är A1 procent av B1?</td>
                <td>
                  <code>=A1*B1/100</code>
                </td>
                <td>10 procent av 10 000 = 1 000</td>
              </tr>
              <tr>
                <td>Hur stor ändring är det från A1 till B1?</td>
                <td>
                  <code>=(B1-A1)/A1*100</code>
                </td>
                <td>10 000 till 12 500 = 25</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Skriver du <code>=A1/B1</code> får du andelen (0,25) och måste
          då formatera cellen som procent. Vill du se kronor och procent
          samtidigt på en löneforhåndring är det{" "}
          <Link href="/loenstigning" className="text-blue-700 underline">
            löneökning i procent
          </Link>{" "}
          du söker efter.
        </p>

        <h2>Skillnad i procent mellan två tal</h2>
        <p>
          Frågan "procent skillnad mellan två tal" har två svar, och vilket
          du får beror på vilket tal som är heltalet. Det vanligaste är
          procentuell förändring: hur mycket har det nya talet ändrats från det
          gamla? Då är det den gamla summan som är heltalet. Frågar du i stället
          hur stor skillnaden är mellan två tal oavsett riktning — om det ene
          tallet är större eller mindre — så regner man på middelvärdet, och
          svaret kallas procentdifferens.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fråga</th>
                <th>Formel</th>
                <th>Exempel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hur mycket har värdet ändrats från Gammal till Ny?</td>
                <td>
                  <code>((Ny - Gammal) / Gammal) × 100</code>
                </td>
                <td>
                  {num(belobEksempel.gammal)} till {num(belobEksempel.ny)} ={" "}
                  {num(procentForskel(belobEksempel.ny, belobEksempel.gammal))}{" "}
                  procent
                </td>
              </tr>
              <tr>
                <td>Hur stor är skillnaden mellan talen, oavsett riktning?</td>
                <td>
                  <code>(|A - B| / ((A + B) / 2)) × 100</code>
                </td>
                <td>
                  {num(belobEksempel.gammal)} och {num(belobEksempel.ny)} ={" "}
                  {num(
                    procentDifferens(belobEksempel.gammal, belobEksempel.ny),
                    1
                  )}{" "}
                  procent
                </td>
              </tr>
              <tr>
                <td>Samma sak i Excel, där A1 är det gamla talet?</td>
                <td>
                  <code>=(B1-A1)/A1*100</code>
                </td>
                <td>
                  A1 = {num(belobEksempel.gammal)}, B1 ={" "}
                  {num(belobEksempel.ny)} ={" "}
                  {num(procentForskel(belobEksempel.ny, belobEksempel.gammal))}{" "}
                  procent
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>De två formlerna ger aldrig samma svar.</strong>{" "}
          {num(lonEksempel.gammal)} kr, som stiger till {num(lonEksempel.ny)} kr,
          är en ökning på{" "}
          {num(procentForskel(lonEksempel.ny, lonEksempel.gammal))} procent i en
          lön, eftersom den gamla summan är heltalet. Den{" "}
          {num(procentDifferens(lonEksempel.gammal, lonEksempel.ny), 1)}{" "}
          procent stora skillnaden är samma par tal, räknat på
          medelvärdet — byter du om talen får du samma svar. När du ska
          veta om en lön stiger är det den första formeln du ska använda. Den
          andra används när du vill jämföra hur stora två belopp är i förhållande
          till varandra, utan att riktningen ska betyda något.
        </p>
        <p>
          En lønsprocent kan du se som kroner her:{" "}
          <Link href="/loenstigning" className="text-blue-700 underline">
            löneökning i procent
          </Link>
          .
        </p>

        {/* Samme som i den danske gren: formlerne har én ejer, boksen i
            ProcentBeregner. */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips</p>
          <p className="text-blue-700">
            Kom ihåg att 50% av 40 är samma sak som 40% av 50 - båda ger 20. Det
            här knepet kan göra huvudräkning enklare!
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/procent" />
      </div>
      <Sidebar currentHref="/procent" adSlotId="procent-sidebar" />
    </div>
  );
}
