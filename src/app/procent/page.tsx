import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import ProcentBeregner from "@/components/ProcentBeregner";
import ProcentpointBeregner from "@/components/ProcentpointBeregner";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import { formatNumber } from "@/lib/format";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";
import {
  EXCEL_ANDEL,
  EXCEL_PROCENT_AF,
  HVERDAG_LOENSTIGNING,
  HVERDAG_MOMS,
  HVERDAG_RABAT,
  HVERDAG_RENTE,
  PROCENTFALD_EKSEMPEL,
  PROCENT_10_AF_TAL,
  PROCENT_SKILLNAD_EKSEMPEL,
  RABAT_BELOEB,
  RABAT_EKSEMPEL,
  RABAT_SATS,
  procentAf,
  procentBesparelse,
  procentDifferens,
  procentFald,
  procentForskel,
  rabatProcent,
} from "@/lib/procent";
import {
  PROCENTPOINT_EKSEMPEL,
  procentpointForskel,
  procentpointRelativ,
} from "@/lib/procentpoint";
import Link from "next/link";

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

  // Rabatafsnittets tal. De to priser er læserens egne (RABAT_EKSEMPEL), så
  // nedsættelsen, den nye pris, rabatten og den 14,3 % man får ved at dele med
  // den nye pris regnes alle her — ingen af dem står skrevet i sætningen.
  const rabatNedsat = RABAT_EKSEMPEL.normalPris - RABAT_EKSEMPEL.nedsatPris;

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
            <strong>Find resultat:</strong> Hvad er X % af Y?
          </li>
          <li>
            <strong>Find heltal:</strong> Hvis X er Y %, hvad er så 100 %?
          </li>
          <li>
            <strong>Procentvis ændring:</strong> Hvor mange procent er
            stigningen/faldet fra X til Y?
          </li>
        </ol>

        <h2>Sådan beregner du rabatten i procent</h2>
        <p>
          &quot;En telefon er sat {num(rabatNedsat)} kr. ned.
          Normalt koster den {num(RABAT_EKSEMPEL.normalPris)} kr. Hvor stor er
          rabatten i procent?&quot; er et af de største spørgsmål, Google har
          registreret på denne side. Svaret er én deling:{" "}
          <strong>prisnedsættelsen delt med den normale pris</strong>, ganget
          med 100.
        </p>
        <p>
          <code>Rabatprocent = (Prisnedsættelse ÷ Normalpris) × 100</code>
        </p>
        <p>
          Regnet på spørgslens tal: normalprisen er {num(RABAT_EKSEMPEL.normalPris)} kr,
          varen er sat {num(rabatNedsat)} kr ned, så den nye pris er{" "}
          {num(RABAT_EKSEMPEL.nedsatPris)} kr. Rabatten er altså{" "}
          {num(rabatNedsat)} ÷ {num(RABAT_EKSEMPEL.normalPris)} × 100 ={" "}
          <strong>{num(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)} procent</strong>.
        </p>
        <p>
          <strong>Del med den normale pris, ikke med den nye.</strong>{" "}
          {num(rabatNedsat)} kr er{" "}
          {num(procentForskel(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)}{" "}
          procent af den pris, du betaler, men det er et andet spørgsmål: hvor
          meget er den normale pris stigeret fra den pris, du betaler. Rabatten
          på varen er {num(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)}{" "}
          procent, fordi det er den pris, varen lå på før nedsættelsen, der er
          heltalet.
        </p>
        <h3>Hvad koster X % rabat på en vare til {num(RABAT_BELOEB)} kr?</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Rabat</th>
                <th>Du sparer</th>
                <th>Du betaler</th>
              </tr>
            </thead>
            <tbody>
              {RABAT_SATS.map((sats) => (
                <tr key={sats}>
                  <td>{sats} %</td>
                  <td>{num(procentAf(RABAT_BELOEB, sats))}</td>
                  <td>{num(RABAT_BELOEB - procentAf(RABAT_BELOEB, sats))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Tallene i tabellen er regnet, ikke skrevet i hånden, så de kan ikke
          glide fra regnestykket ovenfor. 33 % er ikke en tredjedel: en
          tredjedel af {num(RABAT_BELOEB)} kr er{" "}
          {num(RABAT_BELOEB / 3, 2)} kr, så du ville betalt{" "}
          {num(RABAT_BELOEB - RABAT_BELOEB / 3, 2)} kr. Butikker skriver 33 %
          fordi det ser pænere ud — du betaler {num(RABAT_BELOEB - procentAf(RABAT_BELOEB, 33))} kr.
        </p>
        <p>
          Har du de to priser og vil have tallet uden at regne:{" "}
          <Link href="/rabat" className="text-blue-700 underline">
            rabatberegneren
          </Link>
          .
        </p>

        <h2>Procentregning i hverdagen</h2>
        <p>Procent bruges overalt i hverdagen:</p>
        <ul>
          <li>
            {/* Alle fire regnes fra HVERDAG_* i src/lib/procent.ts. De 9.000/
                1.125-tal stod her tidligere, men nu har rabatafsnittet dem
                regnet — samme par, én ejer. */}
            <strong>Rabatter:</strong> {HVERDAG_RABAT.sats} % rabat på en vare
            til {num(HVERDAG_RABAT.beloeb)} kr = du sparer{" "}
            {num(procentAf(HVERDAG_RABAT.beloeb, HVERDAG_RABAT.sats))} kr
          </li>
          <li>
            <strong>Moms:</strong> {HVERDAG_MOMS.sats} % moms på{" "}
            {num(HVERDAG_MOMS.beloeb)} kr ={" "}
            {num(procentAf(HVERDAG_MOMS.beloeb, HVERDAG_MOMS.sats))} kr i moms
            ({num(HVERDAG_MOMS.beloeb + procentAf(HVERDAG_MOMS.beloeb, HVERDAG_MOMS.sats))}{" "}
            kr total)
          </li>
          <li>
            <strong>Renter:</strong> {HVERDAG_RENTE.sats} % rente på{" "}
            {num(HVERDAG_RENTE.beloeb)} kr ={" "}
            {num(procentAf(HVERDAG_RENTE.beloeb, HVERDAG_RENTE.sats))} kr i
            rente
          </li>
          <li>
            <strong>Lønstigninger:</strong> {HVERDAG_LOENSTIGNING.sats} %
            stigning på {num(HVERDAG_LOENSTIGNING.beloeb)} kr ={" "}
            {num(
              procentAf(HVERDAG_LOENSTIGNING.beloeb, HVERDAG_LOENSTIGNING.sats),
            )}{" "}
            kr mere
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

        <h2>Forskellen på procentpoint og procent</h2>
        <p>
          Når det er to <em>procenttal</em> der flytter sig, har dansk og
          svensk to ord for det, og de er ikke det samme.{" "}
          <strong>Procentpoint</strong> er de to tal minus hinanden. Den
          procentvise ændring regner du på det gamle tal. Begge svar er
          rigtige — de måler bare hver deres ting, og det er derfor en
          rentehævning på ét procentpoint kan omtales som en stor stigning
          eller en lille.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Ændring</th>
                <th>Procentpoint</th>
                <th>Procentvis ændring</th>
              </tr>
            </thead>
            <tbody>
              {PROCENTPOINT_EKSEMPEL.rente.map((par) => (
                <tr key={`${par.gammel}-${par.ny}`}>
                  <td>
                    {num(par.gammel, 1)} % til {num(par.ny, 1)} %
                  </td>
                  <td>
                    <strong>
                      {num(procentpointForskel(par.gammel, par.ny), 1)} point
                    </strong>
                  </td>
                  <td>{num(procentpointRelativ(par.gammel, par.ny), 1)} %</td>
                </tr>
              ))}
              {PROCENTPOINT_EKSEMPEL.valg.map((par) => (
                <tr key={`${par.gammel}-${par.ny}`}>
                  <td>
                    {num(par.gammel, 1)} % til {num(par.ny, 1)} %
                  </td>
                  <td>
                    <strong>
                      {num(procentpointForskel(par.gammel, par.ny), 1)} point
                    </strong>
                  </td>
                  <td>{num(procentpointRelativ(par.gammel, par.ny), 1)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>De tre renterækker er det samme flytning, tre gange.</strong>{" "}
          De er alle sammen +1 procentpoint, fordi point forskellen er den
          absolutte afstand. Men den procentvise ændring bliver mindre og
          mindre for hver gang, fordi den regnes på et større tal:{" "}
          {num(PROCENTPOINT_EKSEMPEL.rente[0].gammel, 1)} % til{" "}
          {num(PROCENTPOINT_EKSEMPEL.rente[0].ny, 1)} % er{" "}
          {num(procentpointRelativ(PROCENTPOINT_EKSEMPEL.rente[0].gammel, PROCENTPOINT_EKSEMPEL.rente[0].ny))}{" "}
          %, mens{" "}
          {num(PROCENTPOINT_EKSEMPEL.rente[2].gammel, 1)} % til{" "}
          {num(PROCENTPOINT_EKSEMPEL.rente[2].ny, 1)} % kun er{" "}
          {num(
            procentpointRelativ(
              PROCENTPOINT_EKSEMPEL.rente[2].gammel,
              PROCENTPOINT_EKSEMPEL.rente[2].ny,
            ),
            1,
          )}{" "}
          %. Ved et valgresultat er det samme regnestykke, bare med komma:{" "}
          {num(PROCENTPOINT_EKSEMPEL.valg[0].gammel, 1)} % til{" "}
          {num(PROCENTPOINT_EKSEMPEL.valg[0].ny, 1)} % er{" "}
          {num(
            procentpointForskel(
              PROCENTPOINT_EKSEMPEL.valg[0].gammel,
              PROCENTPOINT_EKSEMPEL.valg[0].ny,
            ),
            1,
          )}{" "}
          procentpoint, svarende til{" "}
          {num(
            procentpointRelativ(
              PROCENTPOINT_EKSEMPEL.valg[0].gammel,
              PROCENTPOINT_EKSEMPEL.valg[0].ny,
            ),
            1,
          )}{" "}
          %. Har du to procenttal fra en avis eller en nyhedsartikel, så får du
          begge tal uden at regne:{" "}
          <ProcentpointBeregner />
        </p>
        <p>
          Nationalbanken hæver den danske rente i skridt af 0,25 procentpoint ad
          gangen. Den fulde rentebane står på{" "}
          <a
            href="https://www.nationalbanken.dk/den-rabende-rente"
            className="text-blue-700 underline"
          >
            Danmarks Nationalbank
          </a>
          .
        </p>

        <h2>Sådan beregner du procentforskellen mellem to tal</h2>
        <p>
          Spørgsmålet "procent forskel mellem to tal" har to svar, og
          hvilket du får afhænger af, hvilket tal der er heltalet. Det
          almindelige er procentvis ændring: hvor meget har det nye tal ændret
          sig fra det gamle? Så er det den gamle sum, der er heltalet. Spørger
          du i stedet, hvor stor forskellen er mellem to tal uanset
          retningen — altså om det ene tal er større eller mindre — så regner
          du på middelværdien, og svaret hedder procentdifferens.
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
                <td>Hvor meget har værdien ændret sig fra Gammel til Ny?</td>
                <td>
                  <code>((Ny - Gammel) / Gammel) × 100</code>
                </td>
                <td>
                  {num(belobEksempel.gammal)} til {num(belobEksempel.ny)} ={" "}
                  {num(procentForskel(belobEksempel.ny, belobEksempel.gammal))}{" "}
                  procent
                </td>
              </tr>
              <tr>
                <td>Hvor stor er forskellen på talene, uanset retning?</td>
                <td>
                  <code>(|A - B| / ((A + B) / 2)) × 100</code>
                </td>
                <td>
                  {num(belobEksempel.gammal)} og {num(belobEksempel.ny)} ={" "}
                  {num(
                    procentDifferens(belobEksempel.gammal, belobEksempel.ny),
                    1,
                  )}{" "}
                  procent
                </td>
              </tr>
              <tr>
                <td>Samme sag i Excel, når A1 er det gamle tal?</td>
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
          <strong>De to formler giver aldrig samme svar.</strong>{" "}
          {num(lonEksempel.gammal)} kr, der stiger til {num(lonEksempel.ny)} kr,
          er en stigning på{" "}
          {num(procentForskel(lonEksempel.ny, lonEksempel.gammal))} procent i en
          løn, fordi den gamle sum er heltalet. Den{" "}
          {num(procentDifferens(lonEksempel.gammal, lonEksempel.ny), 1)} procent
          store forskel er det samme par tal regnet på middelværdien — bytter du
          om talene får du samme svar. Når du skal vide, om en løn stiger, er
          det den første formel du skal bruge. Den anden bruges, når du vil
          sammenligne, hvor store to beløb er i forhold til hinanden, uden at
          retningen skal betyde noget.
        </p>
        <p>
          En lønprocent kan du se i kroner her:{" "}
          <Link href="/loenstigning" className="text-blue-700 underline">
            lønstigning i procent
          </Link>
          .
        </p>

        <h2>Sådan beregner du procentfald</h2>
        <p>
          Et procentfald er den samme formel som en stigning, bare læst den anden
          vej: <code>((Gammel - Ny) / Gammel) × 100</code>. Tallet <em>før</em>{" "}
          faldet er heltalet, og derfor kommer svaret ud som et positivt tal —
          en pris, der falder en femtedel, er et fald på 20 procent og ikke
          minus 20 procent. I Excel, når A1 er det gamle tal, er det samme
          regnestykke <code>=(A1-B1)/A1*100</code>.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fra</th>
                <th>Til</th>
                <th>Procentfald</th>
                <th>Sparer</th>
              </tr>
            </thead>
            <tbody>
              {PROCENTFALD_EKSEMPEL.map((par) => (
                <tr key={par.gammal}>
                  <td>{num(par.gammal)} kr.</td>
                  <td>{num(par.ny)} kr.</td>
                  <td>{num(procentFald(par.gammal, par.ny))} procent</td>
                  <td>
                    {num(procentBesparelse(par.gammal, procentFald(par.gammal, par.ny)))} kr.
                  </td>
                </tr>
              ))}
              <tr>
                <td>{num(RABAT_BELOEB)} kr.</td>
                <td>20 procents fald</td>
                <td>20 procent</td>
                <td>{num(procentBesparelse(RABAT_BELOEB, 20))} kr.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Bevægelsen skal altid starte fra det samme tal.</strong>{" "}
          {num(PROCENTFALD_EKSEMPEL[0].gammal)} kr., der falder til{" "}
          {num(PROCENTFALD_EKSEMPEL[0].ny)} kr., er et fald på{" "}
          {num(procentFald(PROCENTFALD_EKSEMPEL[0].gammal, PROCENTFALD_EKSEMPEL[0].ny))}{" "}
          procent, fordi {num(PROCENTFALD_EKSEMPEL[0].gammal)} er heltalet. De
          samme to tal læst som en stigning fra{" "}
          {num(PROCENTFALD_EKSEMPEL[0].ny)} kr. til{" "}
          {num(PROCENTFALD_EKSEMPEL[0].gammal)} kr. giver{" "}
          {num(
            procentForskel(
              PROCENTFALD_EKSEMPEL[0].gammal,
              PROCENTFALD_EKSEMPEL[0].ny,
            ),
            1,
          )}{" "}
          procent, fordi nu er {num(PROCENTFALD_EKSEMPEL[0].ny)} kr. heltalet.
        </p>

        <h2>10 procent af et tal</h2>
        <p>
          "10 procent af" er det tredjestørste spørgsmål Google har registreret
          på denne side, og det er altid samme regnestykke:{" "}
          <strong>tallet delt med 10</strong>. Flytter du blot kommaet én plads
          til venstre, får du svaret med det samme: 250 bliver til 25,0, altså
          10 procent af 250 er 25.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Spørgsmål</th>
                <th>Svar</th>
              </tr>
            </thead>
            <tbody>
              {PROCENT_10_AF_TAL.map((tal) => (
                <tr key={tal}>
                  <td>10 procent af {num(tal)}</td>
                  <td>{num(procentAf(tal, 10), 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Tallene i tabellen er regnet, ikke skrevet i hånden, så de kan ikke
          komme i uoverensstemmelse med værktøjet ovenfor. Et beløb der ikke
          ender på 0 giver et svar med decimaler, og det er ikke en fejl: 10
          procent af 75 er 7,5. Skal du regne en anden sats, er reglen den
          samme —{" "}
          <Link href="/moms" className="text-blue-700 underline">
            25 procent er en fjerdedel
          </Link>
          , mens 1 procent er tallet delt med 100.
        </p>

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
                <td>10 %</td>
                <td>Flyt kommaet én plads til venstre</td>
                <td>10 % af 250 = 25</td>
              </tr>
              <tr>
                <td>5 %</td>
                <td>Find 10 % og halver</td>
                <td>5 % af 250 = 12,5</td>
              </tr>
              <tr>
                <td>25 %</td>
                <td>Divider med 4</td>
                <td>25 % af 200 = 50</td>
              </tr>
              <tr>
                <td>50 %</td>
                <td>Halver tallet</td>
                <td>50 % af 180 = 90</td>
              </tr>
              <tr>
                <td>1 %</td>
                <td>Divider med 100</td>
                <td>1 % af 350 = 3,5</td>
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
                <td>
                  {num(EXCEL_ANDEL.del)} af {num(EXCEL_ANDEL.heltal)} ={" "}
                  {num((EXCEL_ANDEL.del / EXCEL_ANDEL.heltal) * 100)}
                </td>
              </tr>
              <tr>
                <td>Hvad er A1 procent af B1?</td>
                <td>
                  <code>=A1*B1/100</code>
                </td>
                <td>
                  {EXCEL_PROCENT_AF.sats} procent af{" "}
                  {num(EXCEL_PROCENT_AF.heltal)} ={" "}
                  {num(procentAf(EXCEL_PROCENT_AF.heltal, EXCEL_PROCENT_AF.sats))}
                </td>
              </tr>
              <tr>
                <td>Hvor stor er ændringen fra A1 til B1?</td>
                <td>
                  <code>=(B1-A1)/A1*100</code>
                </td>
                <td>
                  {/* Samme par som rabatafsnittet ovenfor — 9.000 kr varen koster
                      7.875 kr, altså et fald på 12,5 %. */}
                  {num(RABAT_EKSEMPEL.normalPris)} til{" "}
                  {num(RABAT_EKSEMPEL.nedsatPris)} ={" "}
                  {num(
                    procentForskel(
                      RABAT_EKSEMPEL.nedsatPris,
                      RABAT_EKSEMPEL.normalPris,
                    ),
                    1,
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Skriver du <code>=A1/B1</code> får du andelen (
          {num(EXCEL_ANDEL.del / EXCEL_ANDEL.heltal, 2)}), og så skal cellen
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
            Husk at 50 % af 40 er det samme som 40 % af 50 - begge giver 20. Dette
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
            <strong>Hitta resultat:</strong> Vad är X % av Y?
          </li>
          <li>
            <strong>Hitta heltal:</strong> Om X är Y %, vad är då 100 %?
          </li>
          <li>
            <strong>Procentuell förändring:</strong> Hur många procent är
            ökningen/minskningen från X till Y?
          </li>
        </ol>

        <h2>Så här räknar du ut rabatten i procent</h2>
        <p>
          Frågan "en telefon har sänkts {num(rabatNedsat)} kr. Normalt
          kostar den {num(RABAT_EKSEMPEL.normalPris)} kr. Hur stor är rabatten
          i procent?" är ett av de största sökord Google registrerat för den
          här sidan. Svaret är en enda division:{" "}
          <strong>prisnedsättningen delad med det vanliga priset</strong>,
          gånger 100.
        </p>
        <p>
          <code>Rabatprocent = (Prisnedsättning ÷ Vanligt pris) × 100</code>
        </p>
        <p>
          Räknat på frågans siffror: det vanliga priset är{" "}
          {num(RABAT_EKSEMPEL.normalPris)} kr, varan har sänkts{" "}
          {num(rabatNedsat)} kr, så det nya priset är{" "}
          {num(RABAT_EKSEMPEL.nedsatPris)} kr. Rabatten är alltså{" "}
          {num(rabatNedsat)} ÷ {num(RABAT_EKSEMPEL.normalPris)} × 100 ={" "}
          <strong>{num(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)} procent</strong>.
        </p>
        <p>
          <strong>Dela med det vanliga priset, inte med det nya.</strong>{" "}
          {num(rabatNedsat)} kr är{" "}
          {num(procentForskel(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)}{" "}
          procent av det du betalar, men det är en annan fråga: hur mycket har
          det vanliga priset stigit från det du betalar. Rabatten är{" "}
          {num(rabatProcent(RABAT_EKSEMPEL.normalPris, RABAT_EKSEMPEL.nedsatPris), 1)}{" "}
          procent, eftersom det är priset varan hade före nedsättningen som är
          heltalet.
        </p>
        <h3>Vad kostar X % rabatt på en vara för {num(RABAT_BELOEB)} kr?</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Rabatt</th>
                <th>Du sparar</th>
                <th>Du betalar</th>
              </tr>
            </thead>
            <tbody>
              {RABAT_SATS.map((sats) => (
                <tr key={sats}>
                  <td>{sats} %</td>
                  <td>{num(procentAf(RABAT_BELOEB, sats))}</td>
                  <td>{num(RABAT_BELOEB - procentAf(RABAT_BELOEB, sats))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Siffrorna i tabellen är uträknade, inte handskrivna, så de inte kan
          glida ifrån regnestycket ovan. 33 % är inte en tredjedel: en
          tredjedel av {num(RABAT_BELOEB)} kr är{" "}
          {num(RABAT_BELOEB / 3, 2)} kr, så du hade betalat{" "}
          {num(RABAT_BELOEB - RABAT_BELOEB / 3, 2)} kr. Butiker skriver 33 %
          eftersom det ser snyggare ut — du betalar{" "}
          {num(RABAT_BELOEB - procentAf(RABAT_BELOEB, 33))} kr.
        </p>

        <h2>Procenträkning i vardagen</h2>
        <p>Procent används överallt i vardagen:</p>
        <ul>
          <li>
            <strong>Rabatter:</strong> {HVERDAG_RABAT.sats} % rabatt på en
            vara för {num(HVERDAG_RABAT.beloeb)} kr = du sparar{" "}
            {num(procentAf(HVERDAG_RABAT.beloeb, HVERDAG_RABAT.sats))} kr
          </li>
          <li>
            <strong>Moms:</strong> {HVERDAG_MOMS.sats} % moms på{" "}
            {num(HVERDAG_MOMS.beloeb)} kr ={" "}
            {num(procentAf(HVERDAG_MOMS.beloeb, HVERDAG_MOMS.sats))} kr i moms
            ({num(HVERDAG_MOMS.beloeb + procentAf(HVERDAG_MOMS.beloeb, HVERDAG_MOMS.sats))}{" "}
            kr totalt)
          </li>
          <li>
            <strong>Ränta:</strong> {HVERDAG_RENTE.sats} % ränta på{" "}
            {num(HVERDAG_RENTE.beloeb)} kr ={" "}
            {num(procentAf(HVERDAG_RENTE.beloeb, HVERDAG_RENTE.sats))} kr i
            ränta
          </li>
          <li>
            <strong>Löneökningar:</strong> {HVERDAG_LOENSTIGNING.sats} %
            ökning på {num(HVERDAG_LOENSTIGNING.beloeb)} kr ={" "}
            {num(
              procentAf(HVERDAG_LOENSTIGNING.beloeb, HVERDAG_LOENSTIGNING.sats),
            )}{" "}
            kr mer
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

        <h2>10 procent av ett tal</h2>
        <p>
          "10 procent av" är det tredjestörsta sökordet Google registrerat för
          den här sidan, och det är alltid samma uträkning:{" "}
          <strong>dela talet med 10</strong>. Flyttar du bara kommat ett steg
          åt vänster får du svaret på samma sätt: 250 blir 25,0, alltså är 10
          procent av 250 = 25.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fråga</th>
                <th>Svar</th>
              </tr>
            </thead>
            <tbody>
              {PROCENT_10_AF_TAL.map((tal) => (
                <tr key={tal}>
                  <td>10 procent av {num(tal)}</td>
                  <td>{num(procentAf(tal, 10), 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Siffrorna i tabellen är uträknade, inte handskrivna, så de inte kan
          komma i konflikt med verktyget ovan. Ett belopp som inte slutar på 0
          ger ett svar med decimaler, och det är inget fel: 10 procent av 75 är
          7,5. Räknar du med en annan sats är regeln densamma —{" "}
          <Link href="/moms" className="text-blue-700 underline">
            25 procent är en fjärdedel
          </Link>
          , medan 1 procent är talet delat med 100.
        </p>

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
                <td>10 %</td>
                <td>Flytta kommat ett steg åt vänster</td>
                <td>10 % av 250 = 25</td>
              </tr>
              <tr>
                <td>5 %</td>
                <td>Hitta 10 % och halvera</td>
                <td>5 % av 250 = 12,5</td>
              </tr>
              <tr>
                <td>25 %</td>
                <td>Dividera med 4</td>
                <td>25 % av 200 = 50</td>
              </tr>
              <tr>
                <td>50 %</td>
                <td>Halvera talet</td>
                <td>50 % av 180 = 90</td>
              </tr>
              <tr>
                <td>1 %</td>
                <td>Dividera med 100</td>
                <td>1 % av 350 = 3,5</td>
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
                <td>
                  {num(EXCEL_ANDEL.del)} av {num(EXCEL_ANDEL.heltal)} ={" "}
                  {num((EXCEL_ANDEL.del / EXCEL_ANDEL.heltal) * 100)}
                </td>
              </tr>
              <tr>
                <td>Vad är A1 procent av B1?</td>
                <td>
                  <code>=A1*B1/100</code>
                </td>
                <td>
                  {EXCEL_PROCENT_AF.sats} procent av{" "}
                  {num(EXCEL_PROCENT_AF.heltal)} ={" "}
                  {num(procentAf(EXCEL_PROCENT_AF.heltal, EXCEL_PROCENT_AF.sats))}
                </td>
              </tr>
              <tr>
                <td>Hur stor ändring är det från A1 till B1?</td>
                <td>
                  <code>=(B1-A1)/A1*100</code>
                </td>
                <td>
                  {/* Samme par som belobEksempel fra PROCENT_SKILLNAD_EKSEMPEL,
                      som skillnadsafsnittet ovenfor bruger, så Excel-eksemplet
                      og formelafsnittet ikke kan glide fra hinanden. */}
                  {num(belobEksempel.gammal)} till {num(belobEksempel.ny)} ={" "}
                  {num(procentForskel(belobEksempel.ny, belobEksempel.gammal), 1)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Skriver du <code>=A1/B1</code> får du andelen (
          {num(EXCEL_ANDEL.del / EXCEL_ANDEL.heltal, 2)}) och måste
          då formatera cellen som procent. Vill du se kronor och procent
          samtidigt på en löneforhåndring är det{" "}
          <Link href="/loenstigning" className="text-blue-700 underline">
            löneökning i procent
          </Link>{" "}
          du söker efter.
        </p>

        <h2>Skillnad mellan procentenheter och procent</h2>
        <p>
          När det är två <em>procenttal</em> som flyttar sig har svensk och
          dansk två ord för det, och de är inte samma sak.{" "}
          <strong>Procentenheter</strong> är de två talen minus varandra. Den
          procentuella förändringen räknar du på det gamla talet. Båda svaren
          är rätta — de mäter var sitt, och det är därför en räntehöjning på
          en procentenhet kan beskrivas som stor eller liten.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Förändring</th>
                <th>Procentenheter</th>
                <th>Procentuell förändring</th>
              </tr>
            </thead>
            <tbody>
              {PROCENTPOINT_EKSEMPEL.rente.map((par) => (
                <tr key={`${par.gammel}-${par.ny}`}>
                  <td>
                    {num(par.gammel, 1)} % till {num(par.ny, 1)} %
                  </td>
                  <td>
                    <strong>
                      {num(procentpointForskel(par.gammel, par.ny), 1)}
                    </strong>
                  </td>
                  <td>{num(procentpointRelativ(par.gammel, par.ny), 1)} %</td>
                </tr>
              ))}
              {PROCENTPOINT_EKSEMPEL.valg.map((par) => (
                <tr key={`${par.gammel}-${par.ny}`}>
                  <td>
                    {num(par.gammel, 1)} % till {num(par.ny, 1)} %
                  </td>
                  <td>
                    <strong>
                      {num(procentpointForskel(par.gammel, par.ny), 1)}
                    </strong>
                  </td>
                  <td>{num(procentpointRelativ(par.gammel, par.ny), 1)} %</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Ränderaderna är samma flytt, tre gånger.</strong> De är alla
          +1 procentenhet, eftersom enhetsskillnaden är det absoluta avståndet.
          Men den procentuella förändringen blir mindre för varje steg, eftersom
          den räknas på ett större tal: {num(PROCENTPOINT_EKSEMPEL.rente[0].gammel, 1)} % till{" "}
          {num(PROCENTPOINT_EKSEMPEL.rente[0].ny, 1)} % är{" "}
          {num(procentpointRelativ(PROCENTPOINT_EKSEMPEL.rente[0].gammel, PROCENTPOINT_EKSEMPEL.rente[0].ny))}{" "}
          %, medan {num(PROCENTPOINT_EKSEMPEL.rente[2].gammel, 1)} % till{" "}
          {num(PROCENTPOINT_EKSEMPEL.rente[2].ny, 1)} % bara är{" "}
          {num(
            procentpointRelativ(
              PROCENTPOINT_EKSEMPEL.rente[2].gammel,
              PROCENTPOINT_EKSEMPEL.rente[2].ny,
            ),
            1,
          )}{" "}
          %. Samma uträkning gäller ett valresultat, bara med komma:{" "}
          {num(PROCENTPOINT_EKSEMPEL.valg[0].gammel, 1)} % till{" "}
          {num(PROCENTPOINT_EKSEMPEL.valg[0].ny, 1)} % är{" "}
          {num(
            procentpointForskel(
              PROCENTPOINT_EKSEMPEL.valg[0].gammel,
              PROCENTPOINT_EKSEMPEL.valg[0].ny,
            ),
            1,
          )}{" "}
          procentenheter, vilket motsvarar{" "}
          {num(
            procentpointRelativ(
              PROCENTPOINT_EKSEMPEL.valg[0].gammel,
              PROCENTPOINT_EKSEMPEL.valg[0].ny,
            ),
            1,
          )}{" "}
          %. Har du två procenttal från en tidning eller en nyhetsartikel, så
          får du båda talen utan att räkna:{" "}
          <ProcentpointBeregner />
        </p>
        <p>
          Sveriges Riksbank höjer sin styrränta i steg om 0,25 procentenheter.
          Hela räntebanan står på{" "}
          <a
            href="https://www.riksbank.se/sv/politik/penningpolitik/"
            className="text-blue-700 underline"
          >
            Riksbanken
          </a>
          .
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
          En lönprocent kan du se som kronor här:{" "}
          <Link href="/loenstigning" className="text-blue-700 underline">
            löneökning i procent
          </Link>
          .
        </p>

        <h2>Så här räknar du ut procentfall</h2>
        <p>
          Ett procentfall är samma formel som en ökning, bara läst åt andra
          hållet: <code>((Gammal - Ny) / Gammal) × 100</code>. Talet{" "}
          <em>före</em> fallet är heltalet, och därför blir svaret positivt — en
          pris som faller en femtedel är ett fall på 20 procent och inte minus
          20 procent. I Excel, när A1 är det gamla talet, är det samma
          uträkning <code>=(A1-B1)/A1*100</code>.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Från</th>
                <th>Till</th>
                <th>Procentfall</th>
                <th>Sparar</th>
              </tr>
            </thead>
            <tbody>
              {PROCENTFALD_EKSEMPEL.map((par) => (
                <tr key={par.gammal}>
                  <td>{num(par.gammal)} kr</td>
                  <td>{num(par.ny)} kr</td>
                  <td>{num(procentFald(par.gammal, par.ny))} procent</td>
                  <td>
                    {num(procentBesparelse(par.gammal, procentFald(par.gammal, par.ny)))} kr
                  </td>
                </tr>
              ))}
              <tr>
                <td>{num(RABAT_BELOEB)} kr</td>
                <td>20 procents fall</td>
                <td>20 procent</td>
                <td>{num(procentBesparelse(RABAT_BELOEB, 20))} kr</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Rörelsen måste alltid starta från samma tal.</strong>{" "}
          {num(PROCENTFALD_EKSEMPEL[0].gammal)} kr som faller till{" "}
          {num(PROCENTFALD_EKSEMPEL[0].ny)} kr är ett fall på{" "}
          {num(procentFald(PROCENTFALD_EKSEMPEL[0].gammal, PROCENTFALD_EKSEMPEL[0].ny))}{" "}
          procent, eftersom {num(PROCENTFALD_EKSEMPEL[0].gammal)} är heltalet.
          Samma två tal lästa som en ökning från{" "}
          {num(PROCENTFALD_EKSEMPEL[0].ny)} kr till{" "}
          {num(PROCENTFALD_EKSEMPEL[0].gammal)} kr ger{" "}
          {num(
            procentForskel(
              PROCENTFALD_EKSEMPEL[0].gammal,
              PROCENTFALD_EKSEMPEL[0].ny,
            ),
            1,
          )}{" "}
          procent, eftersom nu är {num(PROCENTFALD_EKSEMPEL[0].ny)} kr heltalet.
        </p>

        {/* Samme som i den danske gren: formlerne har én ejer, boksen i
            ProcentBeregner. */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips</p>
          <p className="text-blue-700">
            Kom ihåg att 50 % av 40 är samma sak som 40 % av 50 - båda ger 20. Det
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
