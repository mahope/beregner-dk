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
  MINUTTER_TILL_TIMMAR,
} from "@/lib/tids-eksempler";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  TEMPO_EKSEMPLER,
  beregnTempo,
  formatSekunder,
  type TempoEksempel,
} from "@/lib/tidsberegner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const TEMPO_RAEKKE = TEMPO_EKSEMPLER.map((eksempel) => ({
  ...eksempel,
  tempo: beregnTempo(eksempel.minutter, eksempel.km)!,
}));

const TEMPO_NAEVN_DA: Record<TempoEksempel["id"], string> = {
  km5: "5 km",
  km10: "10 km",
  halvmaraton: "Halvmarathon (21,1 km)",
  maraton: "Marathon (42,2 km)",
};

const TEMPO_NAEVN_SE: Record<TempoEksempel["id"], string> = {
  km5: "5 km",
  km10: "10 km",
  halvmaraton: "Halvmarathon (21,1 km)",
  maraton: "Maraton (42,2 km)",
};

/** "2026-09-25" → "25. sep.". Datoerne læses i UTC, så de kan ikke glide en dag. */function formatDato(iso: string | undefined, locale: "da" | "se"): string {
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
  /** Svar-først-tabellen findes i de to sprog, der serverer kalkulatorer. */
  const daSe = locale === "se" ? "se" : "da";

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
          : locale === "se"
            ? "Hur lång tid är det mellan två klockslag?"
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
          intervaller på tværs af datoer, men siden ikke nævnte det.
          C120 løftede `locale === "da"`-porten: beraknare.se/tidsberegner er
          domænets andenstørste side (59.270 visninger) og havde 0 fund på
          "8 t 15 min", "1 t 30 min" og "80,00" — hele svar-først-tabellen var
          dansk-only. Svaret formateres med `formatTidsvar`, så beraknare.se
          får "8 h 15 min" og ikke den danske "t" (C73's R4). */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-3 dark:text-white">
          {daSe === "se"
            ? "Svar på de vanligaste tidsintervallen"
            : "Svar på de oftest søgte tidsrum"}
        </h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>Slut</th>
                <th>{daSe === "se" ? "Datum" : "Dato"}</th>
                <th>{daSe === "se" ? "Paus" : "Pause"}</th>
                <th>Svar</th>
                <th>{daSe === "se" ? "Decimaltimmar" : "Decimaltimer"}</th>
              </tr>
            </thead>
            <tbody>
              {TIDS_EKSEEMPLER.map((eksempel) => (
                <tr key={`${eksempel.start}-${eksempel.slut}`}>
                  <td>{eksempel.start}</td>
                  <td>{eksempel.slut}</td>
                  <td>
                    {eksempel.startDato
                      ? `${formatDato(eksempel.startDato, daSe)} – ${formatDato(eksempel.slutDato, daSe)}`
                      : daSe === "se"
                        ? "Samma dag"
                        : "Samme dag"}
                  </td>
                  <td>{eksempel.pause > 0 ? `${eksempel.pause} min` : "Ingen"}</td>
                  <td>
                    <strong>{formatTidsvar(eksempel, daSe)}</strong>
                    {eksempel.overMidnat && !eksempel.startDato && " (dagen efter)"}
                  </td>
                  <td>
                    {formatTimer(eksempel.decimalTimer, locale)}{" "}
                    {daSe === "se" ? "timmar" : "timer"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {locale === "se" ? (
            <>
              {TIDS_EKSEEMPLER[0].start} till {TIDS_EKSEEMPLER[0].slut} är alltså{" "}
              <strong>{formatTidsvar(TIDS_EKSEEMPLER[0], "se")}</strong> ={" "}
              {formatTimer(TIDS_EKSEEMPLER[0].decimalTimer, "se")} decimaltimmar. Fyll i dina egna
              klockslag ovanför, så drar kalkylatorn automatiskt av en lunchrast om du anger den.
            </>
          ) : (
            <>
              {TIDS_EKSEEMPLER[0].start} til {TIDS_EKSEEMPLER[0].slut} er altså{" "}
              <strong>{formatTidsvar(TIDS_EKSEEMPLER[0], "da")}</strong> ={" "}
              {formatTimer(TIDS_EKSEEMPLER[0].decimalTimer, "da")} decimaltimer. Indtast dine egne
              klokkeslæt ovenfor, og beregneren trækker automatisk en frokostpause
              fra, hvis du angiver den.
            </>
          )}
        </p>
      </div>


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

        <h2>Hvor hurtigt løber jeg? Tempo i minutter pr. kilometer</h2>
        <p>
          Tempoet er løbetiden delt med distancen:{" "}
          <strong>5 km på 25 minutter er 5:00 pr. kilometer</strong>, altså
          25 ÷ 5. Den samme fart er 8:03 pr. engelsk mil, fordi én mil er 1,609344
          km. Sådan regner du: tag løbetiden i minutter, del den med
          kilometerne, så har du tempoet — og du kan gange det med distancen for
          at finde den samme fart over en længere tur.
        </p>
        <table>
          <thead>
            <tr>
              <th>Løb</th>
              <th>Tid</th>
              <th>Min. pr. km</th>
              <th>Min. pr. mil</th>
            </tr>
          </thead>
          <tbody>
            {TEMPO_RAEKKE.map((raekke) => (
              <tr key={raekke.id}>
                <td>{TEMPO_NAEVN_DA[raekke.id]}</td>
                <td>{raekke.minutter} min.</td>
                <td>{formatSekunder(raekke.tempo.sekunderPerKm)}</td>
                <td>{formatSekunder(raekke.tempo.sekunderPerMil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Har du en løbetid og vil vide, hvor langt du nåede, er det
          modsatte regnestykke det samme:{" "}
          <strong>tid ÷ tempo = distance</strong>. Et 5 km-løb på 25 minutter er
          altså 5 km, og en halvmarathon på 1 time og 45 minutter er 21,1 km ved
          4:58 pr. kilometer. Samme regel som værktøjet bruger ovenfor: et
          interval er bare en tid delt med en distance.
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

        {/* DA-autocomplete under "minutter til timer" er 7 af 10 numeriske
            variationer (300, 1000, 150, 2000, 120, 1500, 2500 minutter), og
            under "time og minutter" ligger "1 time og 30 minutter" og
            "1 time og 45 minutter". Den danske side havde kun decimal-listen
            ovenfor, som er fire linjer — altså svarer den på ingen af dem.
            Sektionen er C120's svenska "Räkna om minuter till timmar", og
            alle tal regnes fra `MINUTTER_TILL_TIMMAR` i `tids-eksempler.ts`,
            som div/mod 60 bruger — samme regel som værktøjet. */}
        <h2>Omregn minutter til timer – og timer til minutter</h2>
        <p>
          Omregningen er altid <strong>minutter ÷ 60 = timer</strong>, og den
          anden vej er <strong>timer × 60 = minutter</strong>. Decimaltimer er
          samme sag med komma: 90 minutter er 1,50 timer, og 1,50 timer er 90
          minutter igen.
        </p>
        <table>
          <thead>
            <tr>
              <th>Minutter</th>
              <th>Timer og minutter</th>
              <th>Decimaltimer</th>
              <th>Divisionen</th>
            </tr>
          </thead>
          <tbody>
            {MINUTTER_TILL_TIMMAR.map((raekke) => (
              <tr key={raekke.minutter}>
                <td>{raekke.minutter}</td>
                <td>
                  {formatTidsvar(
                    { timer: raekke.timer, minutter: raekke.restMinutter },
                    "da"
                  )}
                </td>
                <td>{formatTimer(raekke.decimalTimer, "da")}</td>
                <td>
                  {raekke.minutter} ÷ 60 = {formatTimer(raekke.decimalTimer, "da")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Den anden vej er <strong>timer × 60 = minutter</strong>: 7,5 timer
          bliver 450 minutter, altså 7 timer og 30 minutter. Og 495 minutter er
          08:30–16:45 ovenfor — det er samme par rækker som værktøjet regner.
          Vil du vide hvor langt du kom under et løb, deler du tiden med
          tempoet i stedet, og det står under{" "}
          <a href="/fart">fartberegneren</a>.
        </p>

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

        <h2>Hur fort springer jag? Tempo i minuter per kilometer</h2>
        <p>
          Tempot är loptiden delad med distansen:{" "}
          <strong>5 km på 25 minuter är 5:00 per kilometer</strong>, alltså
          25 ÷ 5. Samma fart är 8:03 per engelsk mil, eftersom en mil är 1,609344
          km. Så räknar du: ta loptiden i minuter, dela den med kilometrarna, så
          har du tempot — och du kan multiplicera det med distansen för att
          hitta samma fart över en längre tur.
        </p>
        <table>
          <thead>
            <tr>
              <th>Lopp</th>
              <th>Tid</th>
              <th>Min. per km</th>
              <th>Min. per mil</th>
            </tr>
          </thead>
          <tbody>
            {TEMPO_RAEKKE.map((raekke) => (
              <tr key={raekke.id}>
                <td>{TEMPO_NAEVN_SE[raekke.id]}</td>
                <td>{raekke.minutter} min.</td>
                <td>{formatSekunder(raekke.tempo.sekunderPerKm)}</td>
                <td>{formatSekunder(raekke.tempo.sekunderPerMil)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Har du en loptid och vill veta hur långt du kom, är det motsatt
          uttryck: <strong>tid ÷ tempo = distans</strong>. Ett 5 km-lopp på 25
          minuter är alltså 5 km, och en halvmaraton på 1 timme och 45 minuter
          är 21,1 km med 4:59 per kilometer. Samma regel som verktyget använder
          ovan: ett intervall är bara en tid delad med en distans.
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

        {/* C120: SE-autocomplete under "räkna ut timmar och minuter" har
            "räkna ut timmar från minuter" (nr. 7) og "räkna timmar till
            minuter" (nr. 10) — altså båda riktningarna i omvandlingen. Den
            svenska sidan svarade på ingen av dem. Alla tal räknas från
            `totalMinutter`, så de kan inte glida ifrån `decimalTimer`. */}
        <h2>Räkna om minuter till timmar – och tillbaka</h2>
        <p>
          Omvandlingen är alltid <strong>minuter ÷ 60 = timmar</strong>, och
          den andra vägen är <strong>timmar × 60 = minuter</strong>. Decimaltimmar
          är samma sak med kommatecken: 90 minuter är 1,50 timmar, och 1,50
          timmar är 90 minuter igen.
        </p>
        <table>
          <thead>
            <tr>
              <th>Minuter</th>
              <th>Timmar och minuter</th>
              <th>Decimaltimmar</th>
              <th>Divisionen</th>
            </tr>
          </thead>
          <tbody>
            {MINUTTER_TILL_TIMMAR.map((række) => (
              <tr key={række.minutter}>
                <td>{række.minutter}</td>
                <td>
                  {formatTidsvar(
                    { timer: række.timer, minutter: række.restMinutter },
                    "se"
                  )}
                </td>
                <td>{formatTimer(række.decimalTimer, "se")}</td>
                <td>
                  {række.minutter} ÷ 60 = {formatTimer(række.decimalTimer, "se")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Den andra vägen är <strong>timmar × 60 = minuter</strong>: 7,5 timmar
          blir 450 minuter, alltså 7 timmar och 30 minuter. Och 495 minuter
          timmar tillbaka till 08:30–16:45 ovan — det är samma par rader som
          verktyget räknar. Vill du veta hur långt du kommit under ett lopp
          delar du tiden med tempot i stället, och det står under{" "}
          <a href="/fart">fartberäknaren</a>.
        </p>

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
