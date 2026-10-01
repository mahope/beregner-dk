import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import RenteBeregner from "@/components/RenteBeregner";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import { formatNumber } from "@/lib/format";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";
import {
  AARS_FIRE_PROCENT,
  MAANEDLIG_ONE_PROCENT,
  annuitetsEksempel,
  effektivAarsrente,
} from "@/lib/rente-eksempler";
import { EXCEL_FAELLOR_SE, excelRaekkerSe } from "@/lib/rente-excel";
import { RENTEFRADRAG_2026 } from "@/lib/satser-2026";
import Link from "next/link";

/** Fradragsværdien som dansk procenttal med ét decimal, læst fra modulet. */
function fradragProcent(værdi: number): string {
  return (værdi * 100).toFixed(1).replace(".", ",");
}

/**
 * Dansk kronetal med punktum som tusindtalsseparator og altid to decimaler,
 * så et tal læst i brødteksten kan slås op i formelblokken nedenfor. Samme
 * regel som `krSe` på den svenske gren.
 */
function krDa(tal: number): string {
  return tal.toLocaleString("da-DK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Dansk procenttal med komma og fire decimaler, uanset sidens locale. Samme
 * præcision som `procent` på den svenske gren, så de to sprog viser samme
 * månedlige rentesats.
 */
function procentDa(værdi: number): string {
  return (værdi * 100).toLocaleString("da-DK", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

/** Den nominelle månedsrente i dansk procenttal med fire decimaler. */
function maanedligProcentDa(aarsrente: number): string {
  return procentDa(aarsrente / 12);
}

/** Den effektive årsrente i dansk procenttal med to decimaler. */
function effProcentDa(maanedligRente: number): string {
  return (effektivAarsrente(maanedligRente) * 100).toLocaleString("da-DK", {
    maximumFractionDigits: 2,
  });
}

/**
 * Et tal som det skrives i en dansk Excel-formel: komma som decimaltegn og
 * ingen tusindtalsseparator, fordi separatoren i formlen er skilletegnet.
 */
function excelDa(tal: number): string {
  return tal.toLocaleString("da-DK", {
    useGrouping: false,
    maximumFractionDigits: 6,
  });
}

/**
 * Ydelsen som den skrives i en dansk Excel-formel: to decimaler, fordi det er
 * de samme to decimaler brødteksten viser, og brugeren indtaster dem.
 */
function excelBetalning(tal: number): string {
  return tal.toLocaleString("da-DK", {
    useGrouping: false,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Svensk tusindtalsseparator med mellemrum. Ikke `formatNumber`, fordi den
 * følger sidens locale — brødteksten skal kunne skrives med ét talformat
 * uanset hvilket sprog grenen er.
 */
function krSe(tal: number): string {
  return tal.toLocaleString("sv-SE", { maximumFractionDigits: 2 });
}

/** Et decimal som svensk procenttal, uanset sidens locale. */
function procent(værdi: number): string {
  return (værdi * 100).toLocaleString("sv-SE", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
}

/** Den effektive årsränta i procent med to decimaler. */
function effProcent(maanedligRente: number): string {
  return (effektivAarsrente(maanedligRente) * 100).toLocaleString("sv-SE", {
    maximumFractionDigits: 2,
  });
}

/** Den nominella månadsränta i procent med fire decimaler. */
function maanedligProcent(aarsrente: number): string {
  return procent(aarsrente / 12);
}

/**
 * Den reelle rente efter fradrag, for et lån til 5 % — den sats siden bruger i
 * sit eksempel. Beregnes af fradragsværdien, så den ikke kan komme ud af trit
 * med de to trin i `RENTEFRADRAG_2026`.
 */
const EKSEMPEL_RENTE = 0.05;
const foersteProcent = fradragProcent(RENTEFRADRAG_2026.highRate);
const overProcent = fradragProcent(RENTEFRADRAG_2026.lowRate);
const foersteEfterSkat = fradragProcent(EKSEMPEL_RENTE * (1 - RENTEFRADRAG_2026.highRate));
const overEfterSkat = fradragProcent(EKSEMPEL_RENTE * (1 - RENTEFRADRAG_2026.lowRate));

/** Eksemplet både formelafsnittene regner på, fra `rente-eksempler`. */
const eksempel = annuitetsEksempel();

/** Den danske Excel-formel til ydelsen, med tallene fra eksemplet. */
const formelYdelse = `=YDELSE(${excelDa(eksempel.aarsrente / 100)}/12;${
  eksempel.antalMaaneder
};-${eksempel.hovedstol})`;

/** Den danske Excel-formel til løbetiden på den ydelse. */
const formelRentePerioder = `=RENTENPERIODER(${excelDa(
  eksempel.aarsrente / 100
)}/12;-${excelBetalning(eksempel.maanedligBetalning)};${eksempel.hovedstol})`;

/** Den danske Excel-formel til den samlede rente. */
const formelSamletRente = `=YDELSE(${excelDa(
  eksempel.aarsrente / 100
)}/12;${eksempel.antalMaaneder};-${eksempel.hovedstol})*${
  eksempel.antalMaaneder
}-${eksempel.hovedstol}`;

export async function generateMetadata() {
  return generatePageMetadata("renteberegner");
}

export default async function RenteberegnerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("renteberegner", locale) || getPageData("renteberegner", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/renteberegner`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/renteberegner" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <RenteBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Annuitetslån beregner: beregn månedsydelsen på et lån</h2>
        <p>
          Vores <strong>renteberegner</strong> er også en{" "}
          <strong>annuitetslån beregner</strong>: du indtaster lånebeløbet, den
          årlige rente og løbetiden, og får den faste månedsydelse. Et
          annuitetslån på {eksempel.hovedstol.toLocaleString("da-DK")} kr. til{" "}
          {eksempel.aarsrente} % over {eksempel.loebetid} år giver{" "}
          <strong>{krDa(eksempel.maanedligBetalning)} kr. pr. måned</strong> — i
          alt {krDa(eksempel.samletBetaling)} kr., hvoraf{" "}
          {krDa(eksempel.samletRante)} kr. er renter.
        </p>
        <h3>Sådan bruger du renteberegneren</h3>
        <ol>
          <li>
            <strong>Indtast lånebeløbet</strong> - hvor meget vil du låne?
          </li>
          <li>
            <strong>Angiv renten</strong> - den årlige rentesats (ÅOP eller
            debitorrente)
          </li>
          <li>
            <strong>Vælg løbetid</strong> - hvor mange år skal lånet løbe?
          </li>
          <li>
            <strong>Vælg låntype</strong> - annuitetslån eller serielån
          </li>
        </ol>

        <h2>Annuitetslån vs. serielån</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Egenskab</th>
                <th>Annuitetslån</th>
                <th>Serielån</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Månedlig ydelse</td>
                <td>Fast</td>
                <td>Faldende over tid</td>
              </tr>
              <tr>
                <td>Afdrag</td>
                <td>Stigende over tid</td>
                <td>Fast</td>
              </tr>
              <tr>
                <td>Rente</td>
                <td>Faldende over tid</td>
                <td>Faldende over tid</td>
              </tr>
              <tr>
                <td>Samlet rente</td>
                <td>Højere</td>
                <td>Lavere</td>
              </tr>
              <tr>
                <td>Startydelse</td>
                <td>Lavere</td>
                <td>Højere</td>
              </tr>
              <tr>
                <td>Populær til</td>
                <td>Boliglån, billån</td>
                <td>Erhvervslån</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Formlen for et annuitetslån — og de samme tal i Excel</h2>
        <p>
          Ydelsen i et annuitetslån er den samme hver måned, og den findes med
          én formel. Med lånebeløb <strong>P</strong>, den månedlige rente{" "}
          <strong>r</strong> og <strong>n</strong> måneders løbetid:
        </p>
        <p>
          <code>ydelse = P &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>)</code>
        </p>
        <p>
          Eksempel: du låner{" "}
          <strong>{eksempel.hovedstol.toLocaleString("da-DK")} kr.</strong> til{" "}
          <strong>{eksempel.aarsrente} %</strong> i {eksempel.loebetid} år. Den
          månedlige rente er {eksempel.aarsrente} &divide; 12 ={" "}
          {maanedligProcentDa(eksempel.aarsrente / 100)}, og n ={" "}
          {eksempel.antalMaaneder} måneder. Ydelsen bliver{" "}
          <strong>{krDa(eksempel.maanedligBetalning)} kr. pr. måned</strong> — i
          alt {krDa(eksempel.samletBetaling)} kr., hvoraf{" "}
          {krDa(eksempel.samletRante)} kr. er renter.
        </p>
        <p>
          Formlen er ikke en tommelfingerregel. Hver ydelse dækker kun en
          brøkdel af det resterende lån — 1 &divide; (1 + r), 1 &divide; (1 + r)²
          og så videre i 240 led. Summen af den geometriske række er præcis
          (1 &minus; (1 + r)<sup>&minus;n</sup>) &divide; r, og derfor er
          lånebeløbet P = ydelse &times; den sum. Flytter du bare renterne til
          en anden side af ligheden får du beviset, som det er det
          &ldquo;annuitetslån formel bevis&rdquo; spørger om.
        </p>

        <h3>De samme tal i Excel</h3>
        <p>
          Excel har begge funktioner indbygget. Den danske Excel bruger
          <strong> semikolon</strong> som skilletegn, og den skal have lånebeløbet
          ind som et negativt tal for at ydelsen kommer ud positiv:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Spørgsmål</th>
                <th>Formel</th>
                <th>Resultat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Hvad er ydelsen på{" "}
                  {eksempel.hovedstol.toLocaleString("da-DK")} kr. over{" "}
                  {eksempel.antalMaaneder} måneder?
                </td>
                <td>
                  <code>{formelYdelse}</code>
                </td>
                <td>{krDa(eksempel.maanedligBetalning)} kr.</td>
              </tr>
              <tr>
                <td>Hvor mange måneder varer lånet på den ydelse?</td>
                <td>
                  <code>{formelRentePerioder}</code>
                </td>
                <td>{eksempel.antalMaaneder} måneder</td>
              </tr>
              <tr>
                <td>Hvad er den samlede rente på lånet?</td>
                <td>
                  <code>{formelSamletRente}</code>
                </td>
                <td>{krDa(eksempel.samletRante)} kr.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Månedlig rente til årlig rente</h3>
        <p>
          Den rente banken oplyser er den <strong>nominelle</strong> årlige
          rente. Den <strong>effektive</strong> årlige rente regner også med, at
          renten tilskrives hver måned, og den er derfor den faireste at
          sammenligne lån på.
        </p>
        <ul>
          <li>
            1 % <strong>pr. måned</strong> er (1,01)<sup>12</sup> &minus; 1 ={" "}
            <strong>{effProcentDa(MAANEDLIG_ONE_PROCENT)} % om året</strong>
          </li>
          <li>
            4 % <strong>om året</strong> er 0,04 &divide; 12 ={" "}
            {maanedligProcentDa(AARS_FIRE_PROCENT)} % pr. måned, hvilket svarer
            til (1 + {procentDa(eksempel.maanedligRente)})<sup>12</sup> &minus; 1 ={" "}
            <strong>{effProcentDa(AARS_FIRE_PROCENT / 12)} % effektivt</strong>
          </li>
        </ul>

        <h2>Tips til at få et godt lån</h2>
        <ul>
          <li>
            <strong>Sammenlign ÅOP</strong> - ikke kun renten, men alle
            omkostninger
          </li>
          <li>
            <strong>Overvej løbetiden</strong> - kort løbetid = mindre rente i
            alt
          </li>
          <li>
            <strong>Tjek din kreditvurdering</strong> - påvirker den rente du
            kan få
          </li>
          <li>
            <strong>Undgå overtræk</strong> - kassekredit har ofte 15-20% i
            rente
          </li>
          <li>
            <strong>Prioriter dyre lån</strong> - afbetal lån med høj rente
            først
          </li>
        </ul>

        <h2>Skattefradrag for renter</h2>
        <p>
          I Danmark kan du få <strong>fradrag for renteudgifter</strong> på private lån.
          Fradraget svarer til <strong>{foersteProcent}%</strong> af de første{" "}
          {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. i
          renteudgifter ({RENTEFRADRAG_2026.highRateLimitCouple.toLocaleString("da-DK")}{" "}
          kr. for par) og <strong>{overProcent}%</strong> af beløbet over grænsen, hvilket
          reducerer din skattebetaling. Så længe du er under grænsen koster et lån med 5%
          rente dig reelt kun ca. <strong>{foersteEfterSkat}% efter skat</strong> — over
          grænsen er det ca. {overEfterSkat}%.
        </p>
        <p>
          Fradragsværdien afhænger af beløbsgrænsen og året — ikke af din kommune. Se
          2026-reglen med kilde og beregn effekten i{" "}
          <Link href="/rentefradrag">vores rentefradragsberegner</Link>.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip: Brug beregneren til at sammenligne</p>
          <p className="text-blue-700">
            Prøv at indtaste det samme lån med forskellig løbetid eller låntype
            for at se, hvordan det påvirker din samlede betaling.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat. Faktiske lånetilbud kan afvige på
            grund af gebyrer, bidragssatser og din kreditvurdering. Kontakt
            altid din bank eller realkreditinstitut for præcise tilbud.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så använder du räntekalkylatorn</h2>
        <p>
          Med vår <strong>räntekalkylator</strong> räknar du snabbt ut vad ett lån kostar
          dig:
        </p>
        <ol>
          <li>
            <strong>Ange lånebeloppet</strong> - hur mycket vill du låna?
          </li>
          <li>
            <strong>Ange räntan</strong> - den årliga räntesatsen (nominell
            eller effektiv ränta)
          </li>
          <li>
            <strong>Välj löptid</strong> - över hur många år ska lånet betalas?
          </li>
          <li>
            <strong>Välj amorteringstyp</strong> - annuitetslån eller rak
            amortering
          </li>
        </ol>

        <h2>Nominell kontra effektiv ränta</h2>
        <p>
          Den <strong>nominella räntan</strong> är den räntesats banken anger på själva lånet.
          Den <strong>effektiva räntan</strong> räknar även in <strong>avgifter</strong>, uppläggningskostnader
          och hur ofta räntan läggs på, och ger därför den mest rättvisande bilden av vad lånet
          faktiskt kostar.           Jämför alltid lån på den <strong>effektiva räntan</strong>.
        </p>
        <p>
          Skillnaden kan räknas fram. Om räntan läggs på varje månad blir
          den effektiva årsräntan (1 + månadsränta)<sup>12</sup> &minus; 1, och
          en månadsränta på 1 % ger alltså{" "}
          <strong>
            {effProcent(MAANEDLIG_ONE_PROCENT)} % per år
          </strong>
          . Ska du gå åt andra hållen — från en effektiv årsränta till den
          nominella — är formeln (1 + årsränta)<sup>1/12</sup> &minus; 1, og
          4 % om året motsvarar en månadsränta på{" "}
          <strong>{maanedligProcent(AARS_FIRE_PROCENT)} %</strong>, vilket ger{" "}
          <strong>{effProcent(AARS_FIRE_PROCENT / 12)} % effektivt</strong>.
        </p>

        <h2>Formeln för ett annuitetslån</h2>
        <p>
          Betalningen är densamma varje månad, och den hittar du med en enda
          formel. Med lånebelopp <strong>P</strong>, den månatliga räntan{" "}
          <strong>r</strong> och <strong>n</strong> månaders löptid:
        </p>
        <p>
          <code>betalning = P &times; r &divide; (1 &minus; (1 + r)<sup>&minus;n</sup>)</code>
        </p>
        <p>
          Exempel: du lånar <strong>{krSe(eksempel.hovedstol)}</strong> till{" "}
          <strong>{eksempel.aarsrente} %</strong> i {eksempel.loebetid} år. Den
          månatliga räntan är {eksempel.aarsrente} &divide; 12 ={" "}
          {procent(eksempel.maanedligRente)} och n = {eksempel.antalMaaneder}{" "}
          månader. Betalningen blir{" "}
          <strong>{krSe(eksempel.maanedligBetalning)} i månaden</strong> —{" "}
          {krSe(eksempel.samletBetaling)} i alt, varav{" "}
          {krSe(eksempel.samletRante)} är ränta.
        </p>
        <p>
          Formeln är inte en tumregel. Varje betalning täcker bara en bråkdel
          av det lån som är kvar — 1 &divide; (1 + r), 1 &divide; (1 + r)²
          och så vidare i {eksempel.antalMaaneder} led. Summan av den
          geometriska serien är precis (1 &minus; (1 + r)<sup>&minus;n</sup>)
          &divide; r, och därför är lånebeloppet P = betalning &times; den summan.
          Flyttar du bara räntorna till den andra sidan av likhetstecknet får
          du beviset — det är vad &ldquo;annuitetslån formel
          bevis&rdquo; söker efter.
        </p>
        <p>
          Vill du hellre räkna på serielånet i stället? Där är det
          amorteringen som är fast, så varje månadsbetalning är olika.{" "}
          <Link href="/laaneberegner">Lånekalkylatorn</Link> räknar båda
          sorterna, och <Link href="/rentefradrag">rentefradraget</Link> visar
          hur mycket av räntan som blir kvar.
        </p>

        <h2>Annuitetslån kontra rak amortering</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Egenskap</th>
                <th>Annuitetslån</th>
                <th>Rak amortering</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Månadskostnad</td>
                <td>Fast</td>
                <td>Sjunker över tid</td>
              </tr>
              <tr>
                <td>Amortering</td>
                <td>Ökar över tid</td>
                <td>Fast</td>
              </tr>
              <tr>
                <td>Ränta</td>
                <td>Sjunker över tid</td>
                <td>Sjunker över tid</td>
              </tr>
              <tr>
                <td>Total räntekostnad</td>
                <td>Högre</td>
                <td>Lägre</td>
              </tr>
              <tr>
                <td>Kostnad i början</td>
                <td>Lägre</td>
                <td>Högre</td>
              </tr>
              <tr>
                <td>Vanlig för</td>
                <td>Privatlån, billån</td>
                <td>Bolån</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Samma tal i Excel</h2>
        <p>
          Du behöver inte räkna ut annuity-formeln för hand. Excel har
          funktionen <strong>BETALNING</strong> inbyggd, och med samma tre
          tal som ovan får du samma svar som kalkylatorn.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Fråga</th>
                <th>Formel</th>
                <th>Svar</th>
              </tr>
            </thead>
            <tbody>
              {excelRaekkerSe().map((raekke) => (
              <tr key={raekke.formel}>
                <td>{raekke.spoergsmaal}</td>
                <td>
                  <code>{raekke.formel}</code>
                </td>
                <td>{raekke.svar}</td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          <strong>Tre fällor i svensk Excel</strong>
        </p>
        <ul>
          {EXCEL_FAELLOR_SE.map((faelle) => (
          <li key={faelle}>{faelle}</li>
          ))}
        </ul>

        <h2>Tips för att få ett bra lån</h2>
        <ul>
          <li>
            <strong>Jämför effektiv ränta</strong> - inte bara räntan, utan alla
            kostnader
          </li>
          <li>
            <strong>Tänk på löptiden</strong> - kort löptid = lägre räntekostnad
            totalt
          </li>
          <li>
            <strong>Se över din kreditvärdighet</strong> - den påverkar vilken
            ränta du kan få
          </li>
          <li>
            <strong>Undvik dyra krediter</strong> - kontokrediter och
            snabblån har ofta mycket hög ränta
          </li>
          <li>
            <strong>Prioritera dyra lån</strong> - betala av lån med hög ränta
            först
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips: använd kalkylatorn för att jämföra</p>
          <p className="text-blue-700">
            Prova att mata in samma lån med olika löptid eller amorteringstyp
            för att se hur det påverkar din totala kostnad.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Observera</p>
          <p className="text-yellow-700">
            Kalkylatorn ger en uppskattning. Faktiska låneerbjudanden kan avvika
            på grund av avgifter och din kreditvärdighet. Kontakta alltid din
            bank eller långivare för exakta villkor.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/renteberegner" />

      <RelateredeArtikler current="/renteberegner" locale={locale} />
    </div>
  );
}
