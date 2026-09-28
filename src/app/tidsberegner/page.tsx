import TidsBeregner from "@/components/TidsBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { formatNumber } from "@/lib/format";
import {
  TIDS_EKSEEMPLER,
  TIDS_EKSEMPEL_DAG,
  TIDS_EKSEMPEL_FLERE_DAGE,
  TIDS_EKSEMPEL_MIDNAT,
  TIDS_EKSEMPEL_PAUSE,
  TIDS_UDEN_DATOER,
  formatTidsvar,
  excelDifferens,
  totalMinutter,
} from "@/lib/tids-eksempler";
import RelatedCalculators from "@/components/RelatedCalculators";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

/** "2026-09-25" → "25. sep.". Datoerne læses i UTC, så de kan ikke glide en dag. */
function formatDato(iso: string | undefined, locale: "da" | "se"): string {
  if (!iso) return "";
  const dato = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(dato.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "se" ? "sv-SE" : "da-DK", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(dato);
}

/**
 * Eksemplernes decimaltimer er tal, ikke strenge (se `TidsintervalResultat`),
 * så notationen vælges her. Før dette skrev tabellen og brødteksten
 * "8.25 timer" på både minberegner.dk og beraknare.se.
 */
function formatTimer(tal: number, locale: "da" | "se" | "no"): string {
  return formatNumber(tal, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function generateMetadata() {
  return generatePageMetadata("tidsberegner");
}

export default async function TidsberegnerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("tidsberegner", locale) || getPageData("tidsberegner", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/tidsberegner`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/tidsberegner" }]} />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {locale === "da"
          ? "Hvor lang tid er der mellem to klokkeslæt?"
          : pageData.title}
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        {pageData.description}
      </p>

      {/* Svar-først: Search Console viser 790 visninger (pos. 6) på søgningen
          "hvor lang tid" og 969 (pos. 4) på "tidsberegner", men spørgsmålet
          stod ingen steder på siden. Tallene nedenfor kommer fra
          `beregnTidsinterval` — samme modul som værktøjet bruger.
          C51 lagde de to rækker med datofelter ind, fordi værktøjet kan
          intervaller på tværs af datoer, men siden ikke nævnte det. */}
      {locale === "da" && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-3 dark:text-white">
          Svar på de oftest søgte tidsrum
        </h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>Slut</th>
                <th>Dato</th>
                <th>Pause</th>
                <th>Svar</th>
                <th>Decimaltimer</th>
              </tr>
            </thead>
            <tbody>
              {TIDS_EKSEEMPLER.map((eksempel) => (
                <tr key={`${eksempel.start}-${eksempel.slut}`}>
                  <td>{eksempel.start}</td>
                  <td>{eksempel.slut}</td>
                  <td>
                    {eksempel.startDato
                      ? `${formatDato(eksempel.startDato, "da")} – ${formatDato(eksempel.slutDato, "da")}`
                      : "Samme dag"}
                  </td>
                  <td>{eksempel.pause > 0 ? `${eksempel.pause} min` : "Ingen"}</td>
                  <td>
                    <strong>{eksempel.svar}</strong>
                    {eksempel.overMidnat && !eksempel.startDato &&
                      " (dagen efter)"}
                  </td>
                  <td>{formatTimer(eksempel.decimalTimer, locale)} timer</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {TIDS_EKSEEMPLER[0].start} til {TIDS_EKSEEMPLER[0].slut} er altså{" "}
          <strong>{TIDS_EKSEEMPLER[0].svar}</strong> ={" "}
          {formatTimer(TIDS_EKSEEMPLER[0].decimalTimer, locale)} decimaltimer. Indtast dine egne
          klokkeslæt ovenfor, og beregneren trækker automatisk en frokostpause
          fra, hvis du angiver den.
        </p>
      </div>
      )}


      <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
        <TidsBeregner />
      </div>

      {/* SEO Content */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Hvordan beregner du tid mellem to klokkeslæt?</h2>
        <p>
          Vores <strong>tidsberegner</strong> hjælper dig med at beregne den <strong>præcise tid</strong> mellem
          to tidspunkter. Den er ideel til:
        </p>
        <ul>
          <li>
            <strong>Arbejdstidsregistrering</strong> - beregn dine timer til
            lønseddel
          </li>
          <li>
            <strong>Mødetid</strong> - se hvor lang tid et møde varede
          </li>
          <li>
            <strong>Projektplanlægning</strong> - estimer tid til opgaver
          </li>
          <li>
            <strong>Nattevagter</strong> - beregn tid over midnat
          </li>
          <li>
            <strong>Intervaller på flere dage</strong> - beregn fra en dato og
            et klokkeslæt til en anden dato og et andet klokkeslæt
          </li>
        </ul>

        <h2>Beregner tid på tværs af datoer</h2>
        <p>
          Under de to klokkeslæt ligger der to <strong>valgfrie datofelter</strong>.
          Uden dem regner beregneren inden for samme døgn, og den tager så
          automatisk natten med, når sluttidspunktet er tidligere end
          starttidspunktet. Det dækker en arbejdsdag og en nattevagt. Men skal
          tiden dække mere end ét døgn — en weekend, en ferie, en turnus over
          flere dage — så skal begge datoer ind, ellers regner beregneren kun
          det, der ligger mellem klokkeslættene.
        </p>
        <p>
          Et gennemgående eksempel: <strong>fredag kl. {TIDS_EKSEMPEL_FLERE_DAGE.start} til mandag kl.{" "}
          {TIDS_EKSEMPEL_FLERE_DAGE.slut}</strong> er{" "}
          <strong>{formatTidsvar(TIDS_EKSEMPEL_FLERE_DAGE, "da")}</strong> ={" "}
          {formatTimer(TIDS_EKSEMPEL_FLERE_DAGE.decimalTimer, locale)} decimaltimer, fordi de tre
          fulde døgn regnes med. Uden datoerne ville det samme interval være{" "}
          {TIDS_UDEN_DATOER.da} — kun det, der ligger mellem klokkeslættene.
        </p>
        <p>
          Er startdatoen tidligere end slutdatoen, viser beregneren intet
          resultat, fordi et interval ikke kan gå baglæns. Er der kun indtastet
          én dato, bruges den anden som samme dag — så begge datoer skal derfor
          ind, hvis intervallet går over en dag.
        </p>

        <h2>Sådan beregner du tid mellem to klokkeslæt i Excel</h2>
        <p>
          Skriv starttidspunktet i <strong>A1</strong> og sluttidspunktet i{" "}
          <strong>B1</strong> — begge som rigtige klokkeslæt, ikke som tekst.
          Så er den korte formel <code>=B1-A1</code>, og med cellen formateret
          som <strong>Tid</strong> viser den{" "}
          <strong>
            {TIDS_EKSEMPEL_DAG.slut} − {TIDS_EKSEMPEL_DAG.start} ={" "}
            {formatTidsvar(TIDS_EKSEMPEL_DAG, "da")}
          </strong>{" "}
          (altså {totalMinutter(TIDS_EKSEMPEL_DAG)} minutter).
        </p>
        <p>
          Til <strong>decimaltimer</strong> — den notation mange virksomheder
          bruger — skal du gange med 24:{" "}
          <code>=(B1-A1)*24</code> giver{" "}
          <strong>{formatTimer(TIDS_EKSEMPEL_DAG.decimalTimer, "da")} timer</strong>{" "}
          for præcis det samme par. Og til <strong>alle minutter i ét tal</strong>{" "}
          (til en løntimesrapport) er det{" "}
          <code>=(B1-A1)*24*60</code> ={" "}
          <strong>{totalMinutter(TIDS_EKSEMPEL_DAG)}</strong>.
        </p>
        <p>
          <strong>Den fælde, der giver et negativt tal:</strong> hvis
          sluttidspunktet er tidligere end starttidspunktet — en nattevagt fra{" "}
          {TIDS_EKSEMPEL_MIDNAT.start} til {TIDS_EKSEMPEL_MIDNAT.slut} — giver{" "}
          <code>=B1-A1</code>{" "}
          <strong>
            {formatNumber(excelDifferens(TIDS_EKSEMPEL_MIDNAT), "da", { maximumFractionDigits: 2 })}
          </strong>{" "}
          døgn, altså minus 16 timer. Wrap formlen i{" "}
          <code>=MOD(B1-A1;1)*24</code>, så den tager de 24 timer med igen, og
          du får <strong>{formatTimer(TIDS_EKSEMPEL_MIDNAT.decimalTimer, "da")} timer</strong>{" "}
          — præcis som værktøjet ovenfor.
        </p>
        <p>
          <strong>Og en pause?</strong> Træk den fra i timer, ikke i klokkeslæt:{" "}
          <code>=(B1-A1)*24-0,5</code> giver{" "}
          <strong>{formatTimer(TIDS_EKSEMPEL_PAUSE.decimalTimer, "da")} timer</strong>{" "}
          for {TIDS_EKSEMPEL_PAUSE.start} til {TIDS_EKSEMPEL_PAUSE.slut} med 30
          minutters frokost. Dansk Excel bruger <strong>semikolon</strong> som
          skilletegn, fordi komma er decimaltegn — samme som i{" "}
          <a href="/dato">datoberegnerens</a> formler.
        </p>
        <p>
          Er tallet hjemme i Excel{" "}
          <strong>
            {formatNumber(excelDifferens(TIDS_EKSEMPEL_DAG), "da", { maximumFractionDigits: 4 })}
          </strong>{" "}
          i stedet for{" "}
          {formatTidsvar(TIDS_EKSEMPEL_DAG, "da")}, står cellen formateret som{" "}
          <strong>Tal</strong>: Excel gemmer et klokkeslæt som en brøkdel af et
          døgn, og {TIDS_EKSEMPEL_DAG.slut} − {TIDS_EKSEMPEL_DAG.start} er
          netop {formatNumber(TIDS_EKSEMPEL_DAG.heleDoegn, "da", { maximumFractionDigits: 4 })}{" "}
          af et døgn. Skift formateringen til Tid, eller gang med 24.
        </p>

        <h2>Decimal timer vs. timer:minutter</h2>
        <p>
          Mange virksomheder bruger decimal timer til timeregistrering. Her er
          en hurtig reference:
        </p>
        <ul>
          <li>15 min = 0,25 timer</li>
          <li>30 min = 0,50 timer</li>
          <li>45 min = 0,75 timer</li>
          <li>1 time 15 min = 1,25 timer</li>
        </ul>

        <h2>Tips til præcis timeregistrering</h2>
        <ul>
          <li>Husk altid at <strong>fratrække pauser</strong> fra din arbejdstid</li>
          <li>De fleste har <strong>30 minutters frokostpause</strong>, som ikke tælles med i den betalte arbejdstid</li>
          <li>Brug <strong>decimal timer</strong> når din virksomhed kræver det til timeregistrering</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Så här använder du tidsberäknaren</h2>
        <p>
          Vår <strong>tidsberäknare</strong> hjälper dig att beräkna den <strong>exakta tiden</strong> mellan
          två tidpunkter. Den är idealisk för:
        </p>
        <ul>
          <li>
            <strong>Arbetstidsregistrering</strong> - beräkna dina timmar till
            lönebesked
          </li>
          <li>
            <strong>Mötestid</strong> - se hur länge ett möte varade
          </li>
          <li>
            <strong>Projektplanering</strong> - uppskatta tid för uppgifter
          </li>
          <li>
            <strong>Nattpass</strong> - beräkna tid över midnatt
          </li>
          <li>
            <strong>Intervall som spänner flera dagar</strong> - beräkna från
            ett datum och en tid till ett annat datum och en annan tid
          </li>
        </ul>

        <h2>Beräkna tid över flera datum</h2>
        <p>
          Under de två klockslagen finns två <strong>valfria datumfält</strong>.
          Utan dem räknar verktyget inom ett dygn, och det tar då automatiskt
          med natten när sluttiden är tidigare än starttiden. Det räcker till
          en arbetsdag eller ett nattpass. Ska tiden omfatta mer än ett dygn —
          en weekend, en semester, ett skift över flera dagar — ska båda
          datum indateras, annars räknar verktyget bara det som ligger
          mellan klockslagen.
        </p>
        <p>
          Ett återkommande exempel: <strong>fredag kl. {TIDS_EKSEMPEL_FLERE_DAGE.start} till måndag kl.{" "}
          {TIDS_EKSEMPEL_FLERE_DAGE.slut}</strong> är{" "}
          <strong>{formatTidsvar(TIDS_EKSEMPEL_FLERE_DAGE, "se")}</strong> ={" "}
          {formatTimer(TIDS_EKSEMPEL_FLERE_DAGE.decimalTimer, locale)} decimaltimmar, för de tre
          fulla dygnen räknas med. Utan datum skulle samma intervall bli{" "}
          {TIDS_UDEN_DATOER.se} — bara det som ligger mellan klockslagen.
        </p>
        <p>
          Är startdatumet efter slutdatumet visar verktyget inget resultat, eftersom
          ett intervall inte kan gå bakåt. Är bara ett datum ifyllt används det
          andra som samma dag — så båda datum behöver alltså ifyllas om
          intervallet går över en dag.
        </p>

        <h2>Så räknar du ut timmar mellan två klockslag i Excel</h2>
        <p>
          Skriv starttiden i <strong>A1</strong> och sluttiden i{" "}
          <strong>B1</strong> — båda som riktiga klockslag, inte som text. Då är
          den korta formeln <code>=B1-A1</code>, och med cellen formaterad som{" "}
          <strong>Tid</strong> visar den{" "}
          <strong>
            {TIDS_EKSEMPEL_DAG.slut} − {TIDS_EKSEMPEL_DAG.start} ={" "}
            {formatTidsvar(TIDS_EKSEMPEL_DAG, "se")}
          </strong>{" "}
          (alltså {totalMinutter(TIDS_EKSEMPEL_DAG)} minuter).
        </p>
        <p>
          För <strong>decimaltimmar</strong> — den notation många företag
          använder — ska du multiplicera med 24:{" "}
          <code>=(B1-A1)*24</code> ger{" "}
          <strong>{formatTimer(TIDS_EKSEMPEL_DAG.decimalTimer, "se")} timmar</strong>{" "}
          för exakt samma par. Och för <strong>alla minuter i ett tal</strong>{" "}
          (till en lönerapport) är det{" "}
          <code>=(B1-A1)*24*60</code> ={" "}
          <strong>{totalMinutter(TIDS_EKSEMPEL_DAG)}</strong>.
        </p>
        <p>
          <strong>Fällan som ger ett negativt tal:</strong> om sluttiden är
          tidigare än starttiden — ett nattpass från{" "}
          {TIDS_EKSEMPEL_MIDNAT.start} till {TIDS_EKSEMPEL_MIDNAT.slut} — ger{" "}
          <code>=B1-A1</code>{" "}
          <strong>
            {formatNumber(excelDifferens(TIDS_EKSEMPEL_MIDNAT), "se", { maximumFractionDigits: 2 })}
          </strong>{" "}
          dygn, alltså minus 16 timmar. Lägg formeln i{" "}
          <code>=MOD(B1-A1;1)*24</code>, så tar den med de 24 timmarna igen, och
          du får{" "}
          <strong>{formatTimer(TIDS_EKSEMPEL_MIDNAT.decimalTimer, "se")} timmar</strong>{" "}
          — precis som verktyget ovan.
        </p>
        <p>
          <strong>En rast?</strong> Dra av den i timmar, inte i klockslag:{" "}
          <code>=(B1-A1)*24-0,5</code> ger{" "}
          <strong>{formatTimer(TIDS_EKSEMPEL_PAUSE.decimalTimer, "se")} timmar</strong>{" "}
          för {TIDS_EKSEMPEL_PAUSE.start} till {TIDS_EKSEMPEL_PAUSE.slut} med 30
          minuters lunch. Svensk Excel använder <strong>semikolon</strong> som
          avgränsare, eftersom komma är decimaltecken — samma som i{" "}
          <a href="/dato">datokalkylatorns</a> formler.
        </p>
        <p>
          Blir talet i Excel{" "}
          <strong>
            {formatNumber(excelDifferens(TIDS_EKSEMPEL_DAG), "se", { maximumFractionDigits: 4 })}
          </strong>{" "}
          i stället för{" "}
          {formatTidsvar(TIDS_EKSEMPEL_DAG, "se")}, står cellen formaterad som{" "}
          <strong>Tal</strong>: Excel lagrar ett klockslag som en bråkdel av ett
          dygn, och {TIDS_EKSEMPEL_DAG.slut} − {TIDS_EKSEMPEL_DAG.start} är
          precis{" "}
          {formatNumber(TIDS_EKSEMPEL_DAG.heleDoegn, "se", { maximumFractionDigits: 4 })}{" "}
          av ett dygn. Byt formateringen till Tid, eller multiplicera med 24.
        </p>

        <h2>Decimaltimmar vs. timmar:minuter</h2>
        <p>
          Många företag använder decimaltimmar för tidsregistrering. Här är
          en snabb referens:
        </p>
        <ul>
          <li>15 min = 0,25 timmar</li>
          <li>30 min = 0,50 timmar</li>
          <li>45 min = 0,75 timmar</li>
          <li>1 timme 15 min = 1,25 timmar</li>
        </ul>

        <h2>Tips för exakt tidsregistrering</h2>
        <ul>
          <li>Kom alltid ihåg att <strong>dra av raster</strong> från din arbetstid</li>
          <li>De flesta har <strong>30 minuters lunchrast</strong>, som inte räknas med i den betalda arbetstiden</li>
          <li>Använd <strong>decimaltimmar</strong> när ditt företag kräver det för tidsregistrering</li>
        </ul>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/tidsberegner" />
    </div>
  );
}
