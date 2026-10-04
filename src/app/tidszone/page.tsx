import TidszoneBeregner from "@/components/TidszoneBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import {
  TIDSZONER,
  tidszoneRækker,
  tidsforskelsRækker,
  tidsforskelBy,
  tidsforskelTekst,
} from "@/lib/tidszone-reference";
import { usaStatAntal, usaStatRaekker } from "@/lib/tidszone-usa-stater";
import {
  TIDSPUNKTER,
  usaTimerAntal,
  usaTimerRaekker,
  afvigendeDage,
} from "@/lib/tidszone-usa-timer";
import {
  excelEksempler,
  TIDSSKILLNADS_LANDE,
  tidsskillnadRaekker,
} from "@/lib/tidszone-eksempler";
import { KLOKKEN_LANDE, getKlokkenHubPath, getKlokkenPrefix } from "@/lib/klokken-i";
import Link from "next/link";

/**
 * De byer, brødteksten lister under "Populære tidsforskelle". Listen er de
 * fem byer, der stod der i hånden, og forskellene er **regnet** af
 * `tidsforskelsRækker` frem for skrevet som tekst.
 *
 * Det skyldes, at Sydney stod som "9-10 timer foran", mens `TIDSZONER` og
 * `sommertid.ts` giver 8-10: Sydney er UTC+10/+11 mod Danmarks UTC+1/+2, så
 * den laveste forskel er 8 timer, ikke 9. Tallet lå i en håndskrevet
 * brødtekstlinje, der hverken blev læst fra tabellen eller dækket af en
 * test — samme fejlklasse som de otte CEO-fund 29/9. Nu kommer tallet fra
 * samme kilde som tabellen ovenfor, så de to ikke kan glide fra hinanden.
 *
 * Rækkefølgen er ens på dansk og svensk, og begge sprog læser den samme
 * række, så en by ikke kan stå med et tal på det ene domæne og et andet på
 * det andet.
 */
const POPULAERE_TIDSFORSKELSER = tidsforskelsRækker([
  "London",
  "New York",
  "Los Angeles",
  "Tokyo",
  "Sydney",
]);

/**
 * Byerne bag landetabellen, som en kommasepareret liste med "og" til sidst.
 *
 * Sætningen skal kunne navngive præcis de byer, tabellen viser, så den er
 * bygget af `tidsskillnadRaekker` — den samme liste tabellen renderer. Da stod
 * navnene som tekst i JSX, og da et land kom i tabellen, kunne sætningen og
 * tabellen ikke glide fra hinanden (C84's `metaDescription`-fund og C109's
 * danske liste i samme fejlklasse).
 */
function byListe(spoergsprog: "da" | "se"): string {
  const byer = tidsskillnadRaekker(spoergsprog).map((raekke) => raekke.by);
  if (byer.length === 0) return "";
  return `${byer.slice(0, -1).join(", ")} og ${byer[byer.length - 1]}`;
}

/**
 * De lande i tabellen, der skifter sommertid på EU's datoer, altså dem
 * Danmark og Sverige flytter UTC-offseten sammen med. Uddaget af
 * `foelgerEu` og ikke skrevet i teksten: da Grønland kom i tabellen, skrev
 * sætningen stadig "Grækenland og Spanien", altså om færre lande end
 * tabellen viste.
 *
 * Det må ikke udledes af `skifterSammenMedDanmark` — den spørger, om en
 * zone *har* sommertid, og USA og Australien har den, bare på andre datoer.
 * Det ville have gjort sætningen til "USA og Australien følger Danmark",
 * hvilket er forkert i de uger, hvor kun den ene side har sommartid.
 */
function landeFoelgerDanmark(spoergsprog: "da" | "se"): string {
  const lande = TIDSSKILLNADS_LANDE.filter((l) => l.foelgerEu).map((l) =>
    spoergsprog === "se" ? (l.landSe ?? l.landDa) : l.landDa
  );
  if (lande.length <= 1) return lande[0] ?? "";
  return `${lande.slice(0, -1).join(", ")} og ${lande[lande.length - 1]}`;
}

export async function generateMetadata() {
  return generatePageMetadata("tidszone");
}

export default async function TidszonePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("tidszone", locale) || getPageData("tidszone", "da")!;
  // Præfikserne læses fra modulet, der også skriver dem i sitemap, så en
  // landeside ikke kan få et prefix her, der peger på 404. Er der intet
  // prefix (norsk domæne), er der heller ingen liste — der er ingen
  // `/klokken-i/`-rute at linke til.
  const klokkenPrefixDa = getKlokkenPrefix("da");
  const klokkenPrefixSe = getKlokkenPrefix("se");
  const klokkenHubDa = getKlokkenHubPath("da");
  const klokkenHubSe = getKlokkenHubPath("se");

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/tidszone`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/tidszone" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Svar-foerst: besvarer "hvad er klokken i X naar den er 12 i Danmark" */}
      {locale === "da" && (
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold mb-2">Når det er 12 i Danmark, er det 06 i New York</h2>
          <p className="mb-4">
            Klokken 12 i Danmark er <strong>06 i New York</strong>, 05 i Chicago og{" "}
            <strong>03 i Los Angeles</strong>. Videre ud i verden er det 11 i London, 13 i Athen,
            08 i Nuuk, 19 i Shanghai, 20 i Tokyo og 21 i Sydney. Forklaringen er tidsforskellen:
            Danmark ligger på CET (UTC+1) om vinteren og CEST (UTC+2) om sommeren. Tallene ovenfor
            er vinterværdierne, som passerer i kolonnen til venstre; byer uden sommertid, fx Tokyo,
            ligger en time tidligere, når Danmark har somertid.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>By</th>
                  <th>Vintertid (kl. 12 CET)</th>
                  <th>Sommertid (kl. 12 CEST)</th>
                </tr>
              </thead>
              <tbody>
                {tidszoneRækker().map((raekke) => (
                  <tr key={raekke.by}>
                    <td>{raekke.by}</td>
                    <td>{raekke.vinter}</td>
                    <td>{raekke.sommer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Byer, der skifter sommertid sammen med Danmark, viser samme klokkeslæt i begge
            kolonner. Byer uden sommertid — fx Tokyo, Dubai og São Paulo — ligger en time
            tidligere, når Danmark har somertid. Skiftet sker ikke altid samme dag i USA, EU og
            Australien, så i de korte overgangsperioder kan forskellen afvige en time. Brug
            tidszoneberegneren til et præcist klokkeslæt for en vilkårlig by: den følger
            sommertiden for dagens dato og viser tidsforskel, klokken nu og et valgt tidspunkt.
          </p>
        </div>
      )}

      {/* Svarer på de tre andre klokkeslæt, klyngen spørger om (21/14/16) */}
      {locale === "da" && (
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold mb-2">
            Når det er 21 i Danmark, er det 15 i New York
          </h2>
          <p className="mb-4">
            Mange spørger ikke om klokken 12, men om et andet tidspunkt. Her er hvad
            klokken er i {usaTimerAntal} amerikanske byer, når det er{" "}
            {TIDSPUNKTER.join(", ")} i Danmark. USA ligger{" "}
            <strong>6 timer bagud New York</strong>, 7 timer bagud Chicago og 9 timer
            bagud Los Angeles på {365 - afvigendeDage()} af årets 365 dage. USA skifter
            anden søndag i marts og første søndag i november, mens Danmark
            skifter sidste søndag i marts og sidste søndag i oktober, så i de{" "}
            {afvigendeDage()} dage hvor USA står på sommertid mens Danmark står på
            vintertid, ligger alle tre en time tættere på. Vil du se et helt andet
            tidspunkt, kan du bruge tidszoneberegneren ovenfor.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Når det er i Danmark</th>
                  {usaTimerRaekker().map((raekke) => (
                    <th key={raekke.by}>{raekke.by}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIDSPUNKTER.map((tidspunkt, i) => (
                  <tr key={tidspunkt}>
                    <td>kl. {String(tidspunkt).padStart(2, "0")}</td>
                    {usaTimerRaekker().map((raekke) => (
                      <td key={raekke.by}>{raekke.klokkeslaet[i]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Tallene er vinterværdier. USA og Danmark flytter sig samtidig, så de er også
            sommerværdier — kun i de få dage hvor USA skifter en uge tidligere eller
            senere end Danmark kan de afvige en time. Brug tidszoneberegneren til et
            præcist klokkeslæt på en vilkårlig dato.
          </p>
        </div>
      )}

      {/* Svarer på "hvad er klokken i Florida/Texas/Californien …" */}
      {locale === "da" && (
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold mb-2">
            Når det er 12 i Danmark, er det 06 i Florida
          </h2>
          <p className="mb-4">
            Når man spørger "hvad er klokken i USA", er det ofte en <em>stat</em> man
            mener — ikke en by. Derfor er her klokken i {usaStatAntal} af de stater, folk
            søger på, når det er 12 i Danmark. USA har fire tidszoner: <strong>Eastern</strong>{" "}
            (6 timer bagud), <strong>Central</strong> (7 timer bagud), <strong>Mountain</strong>{" "}
            (8 timer bagud) og <strong>Pacific</strong> (9 timer bagud). Florida og
            Georgia ligger i Eastern som New York, Texas og Minnesota i Central som
            Chicago, Californien og Washington i Pacific som Los Angeles.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>Samme zone som</th>
                  <th>Vintertid (kl. 12)</th>
                  <th>Sommertid (kl. 12)</th>
                </tr>
              </thead>
              <tbody>
                {usaStatRaekker().map((raekke) => (
                  <tr key={raekke.stat}>
                    <td>{raekke.stat}</td>
                    <td>{raekke.by}</td>
                    <td>{raekke.vinter}</td>
                    <td>{raekke.sommer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <strong>Arizona er undtagelsen.</strong> Phoenix ligger i Mountain Time som
            Denver, men Arizona undtaget fra sommertid siden 1967. Når Danmark går på
            sommertid flytter Denver sig med, så den står på 04 hele året, mens Phoenix
            står på 04 vinter og 03 sommer. Det er den eneste stat i tabellen, hvor de to
            sidste kolonner er forskellige.
          </p>
        </div>
      )}

      {locale === "se" && (
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold mb-2">När det är 12 i Sverige är det 06 i New York</h2>
          <p className="mb-4">
            Klockan 12 i Sverige är <strong>06 i New York</strong>, 05 i Chicago och{" "}
            <strong>03 i Los Angeles</strong>. Vidare ut i världen är det 11 i London, 13 i Aten,
            08 i Nuuk, 19 i Shanghai, 20 i Tokyo och 21 i Sydney. Förklaringen är tidsskillnaden:
            Sverige ligger på CET (UTC+1) på vintern och CEST (UTC+2) på sommaren. Siffrorna ovan är
            vintervärdena, som passar i vänsterkolumnen; städer utan sommartid, till exempel Tokyo,
            ligger en timme tidigare när Sverige har sommartid.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Stad</th>
                  <th>Vintertid (kl. 12 CET)</th>
                  <th>Sommartid (kl. 12 CEST)</th>
                </tr>
              </thead>
              <tbody>
                {tidszoneRækker(TIDSZONER, "se").map((raekke) => (
                  <tr key={raekke.by}>
                    <td>{raekke.by}</td>
                    <td>{raekke.vinter}</td>
                    <td>{raekke.sommer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Städer som byter sommartid samtidigt med Sverige visar samma klockslag i båda
            kolumnerna. Städer utan sommartid — till exempel Tokyo, Dubai och São Paulo — ligger en
            timme tidigare när Sverige har sommartid. Byte sker inte alltid samma dag i USA, EU och
            Australien, så under de korta övergångsperioderna kan skillnaden avvika en timme. Använd
            tidszonsberäknaren för ett exakt klockslag för valfri stad: den följer sommartiden för
            dagens datum och visar tidsskillnad, klockan nu och ett valt tidpunkt.
          </p>
        </div>
      )}

      {/* Svarar på de tre andra klockslagen, klustret frågar om (21/14/16) */}
      {locale === "se" && (
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold mb-2">
            När det är 21 i Sverige är det 15 i New York
          </h2>
          <p className="mb-4">
            Många frågar inte om klockan 12 utan om en annan tidpunkt. Här är vad klockan
            är i {usaTimerAntal} amerikanska städer när det är {TIDSPUNKTER.join(", ")} i
            Sverige. USA ligger <strong>6 timmar efter New York</strong>, 7 timmar efter
            Chicago och 9 timmar efter Los Angeles på {365 - afvigendeDage()} av årets 365
            dagar. USA byter andra söndagen i mars och första söndagen i november,
            medan Sverige byter sista söndagen i mars och sista söndagen i oktober, så
            under de {afvigendeDage()} dagar där USA står på sommartid medan Sverige
            står på vintertid ligger alla tre en timme närmare. Vill du se en helt
            annan tidpunkt kan du använda tidszonsberäknaren ovan.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>När det är i Sverige</th>
                  {usaTimerRaekker("se").map((raekke) => (
                    <th key={raekke.by}>{raekke.bySe ?? raekke.by}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIDSPUNKTER.map((tidspunkt, i) => (
                  <tr key={tidspunkt}>
                    <td>kl. {String(tidspunkt).padStart(2, "0")}</td>
                    {usaTimerRaekker("se").map((raekke) => (
                      <td key={raekke.by}>{raekke.klokkeslaet[i]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Siffrorna är vintervärden. USA och Sverige flyttar sig samtidigt, så de är
            också sommarvärden — endast under de få dagar då USA byter en vecka tidigare
            eller senare än Sverige kan de avvika en timme. Använd tidszonsberäknaren för
            ett exakt klockslag på ett godtyckligt datum.
          </p>
        </div>
      )}

      {/* Svarar på "vad är klockan i Florida/Texas/Kalifornien …" */}
      {locale === "se" && (
        <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
          <h2 className="text-xl font-bold mb-2">
            När det är 12 i Sverige är det 06 i Florida
          </h2>
          <p className="mb-4">
            När man frågar "vad är klockan i USA" menar man ofta en <em>delstat</em> —
            inte en stad. Därför visas klockan i {usaStatAntal} av de delstater folk söker
            på, när det är 12 i Sverige. USA har fyra tidszoner: <strong>Eastern</strong>{" "}
            (6 timmar efter), <strong>Central</strong> (7 timmar efter),{" "}
            <strong>Mountain</strong> (8 timmar efter) och <strong>Pacific</strong> (9
            timmar efter). Florida och Georgia ligger i Eastern som New York, Texas och
            Minnesota i Central som Chicago, Kalifornien och Washington i Pacific som Los
            Angeles.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Delstat</th>
                  <th>Samma zon som</th>
                  <th>Vintertid (kl. 12)</th>
                  <th>Sommartid (kl. 12)</th>
                </tr>
              </thead>
              <tbody>
                {usaStatRaekker("se").map((raekke) => (
                  <tr key={raekke.stat}>
                    <td>{raekke.stat}</td>
                    <td>{raekke.by}</td>
                    <td>{raekke.vinter}</td>
                    <td>{raekke.sommer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <strong>Arizona är undtagaget.</strong> Phoenix ligger i Mountain Time som
            Denver, men Arizona är undtaget från sommartid sedan 1967. När Sverige går på
            sommartid flyttar Denver med, så den står på 04 hela året, medan Phoenix står
            på 04 vinter och 03 sommar. Det är den enda delstat i tabellen där de två
            sista kolumnerna skiljer sig åt.
          </p>
        </div>
      )}

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <TidszoneBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om tidszoner</h2>
        <p>
          Verden er opdelt i <strong>24 tidszoner</strong>, der hver svarer til <strong>15 graders længde</strong> på jordkloden.
          Tidszoner gør det muligt at have en praktisk <strong>lokal tid</strong>, der nogenlunde følger solens gang.
        </p>

        <h3>Danmarks tidszone</h3>
        <p>
          Danmark bruger <strong>Central European Time (CET)</strong>, som er <strong>UTC+1</strong>. Om sommeren bruger vi
          {" "}<strong>Central European Summer Time (CEST)</strong>, som er <strong>UTC+2</strong>. Sommertid blev indført for
          at <strong>spare energi</strong> ved at udnytte dagslyset bedre.
        </p>

        <h3>Populære tidsforskelle fra Danmark</h3>
        <ul>
          {POPULAERE_TIDSFORSKELSER.map((raekke) => (
            <li key={raekke.by}>
              <strong>{tidsforskelBy(raekke, "da")}:</strong> {tidsforskelTekst(raekke, "da")}
            </li>
          ))}
        </ul>

        <h3>Tips til internationale møder</h3>
        <ul>
          <li>Brug et mødetidspunkt der er acceptabelt for alle tidszoner</li>
          <li>Angiv altid tidszonen tydeligt (fx &quot;14:00 CET&quot;)</li>
          <li>Overvej at rotere mødetider så byrden deles</li>
          <li>Brug kalenderinvitation med automatisk tidszone-konvertering</li>
        </ul>

        <h2>Tidsforskel til de lande, folk spørger om</h2>
        <p>
          Tabellen ovenfor viser byer. Her er de samme forskelle som hele{" "}
          <strong>lande</strong>, fordi &quot;tidsforskel Japan&quot;, &quot;tidsforskel
          Thailand&quot;, &quot;tidsforskel Tyrkiet&quot; og &quot;tidsforskel
          Grønland&quot; er land, ikke byer. For{" "}
          {byListe("da")} er forskellen den samme som i bytabellen.
        </p>
        <table className="w-full text-left border-collapse my-4">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Land</th>
              <th className="py-2 pr-4">Vintertid (kl. 12 CET)</th>
              <th className="py-2">Sommertid (kl. 12 CEST)</th>
            </tr>
          </thead>
          <tbody>
            {tidsskillnadRaekker("da").map((raekke) => (
              <tr key={raekke.land} className="border-b last:border-0">
                <td className="py-2 pr-4">{raekke.land}</td>
                <td className="py-2 pr-4">{raekke.tekstVinter}</td>
                <td className="py-2">
                  {raekke.tekstSommer ?? "Samme som vintertid"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>{landeFoelgerDanmark("da")} følger Danmark</strong>, så
          forskellen er den samme hele året. <strong>Thailand, Japan og Kina
          bruger ikke sommertid</strong>, så de ligger én time tidligere, når
          Danmark har sommertid. Det er den fælde, der giver den forkerte
          aftale.
        </p>

        <h2>Hvad er klokken i et andet land?</h2>
        <p>
          Mange spørger bare «hvad er klokken i Japan?» eller «hvad er klokken
          i Tyrkiet?». Svaret afhænger af datoen, fordi USA, Canada og
          Australien skifter tid på andre datoer end Danmark, så et fast tal
          kan være forkert i de få uger, hvor Danmark og landet ikke skifter
          samtidig. Hver side nedenfor svarer med klokkeslættet lige nu i én by
          i landet — for USA finder du alle fire kystzoner. Vil du se dem
          alle på én side, står de på{" "}
          {klokkenHubDa ? (
            <Link href={klokkenHubDa} className="underline">
              klokken i fjorten lande
            </Link>
          ) : null}{" "}
          med tidsforskellen til Danmark.
        </p>
        <ul>
          {klokkenPrefixDa
            ? KLOKKEN_LANDE.map((land) => (
                <li key={land.slugDa}>
                  <Link
                    href={`${klokkenPrefixDa}${land.slugDa}`}
                    className="underline"
                  >
                    {`Hvad er klokken i ${land.navnDa}?`}
                  </Link>
                </li>
              ))
            : null}
        </ul>

        <h2>Sådan regner du tidsforskel ud i Excel</h2>
        <p>
          Hvis du har to klokkeslæt — et i Danmark og et i den anden by — er
          forskellen én formel. Sæt dem i <code>A1</code> og <code>B1</code>.
        </p>
        <table className="w-full text-left border-collapse my-4">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Formel</th>
              <th className="py-2">Hvad den gør</th>
            </tr>
          </thead>
          <tbody>
            {excelEksempler().map((eksempel) => (
              <tr key={eksempel.formel} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">{eksempel.formel}</td>
                <td className="py-2">
                  {eksempel.hvadDa}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>To fælder.</strong> Klokkeslæt i Excel er en brøkdel af et
          døgn, så 06:00 vises som 0,2500 — du skal gange med 24 for at få
          timer. Og en by på den anden side af jorden kan ligge både foran og
          bagud: New York er 6 timer <em>bagefter</em>, Tokyo er 7 timer{" "}
          <em>frem</em>, selv om begge tal står som 12 minus 6 og 12 minus 9.{" "}
          <Link href="/tidsberegner" className="underline">
            Tidsberegneren
          </Link>{" "}
          tager sig af det sidste, hvis du vil se forskellen i hele døgn.
        </p>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om tidszoner</h2>
        <p>
          Världen är indelad i <strong>24 tidszoner</strong>, som var och en motsvarar <strong>15 graders längd</strong> på jordklotet.
          Tidszoner gör det möjligt att ha en praktisk <strong>lokal tid</strong> som ungefär följer solens gång.
        </p>

        <h3>Centraleuropeisk tid</h3>
        <p>
          Stora delar av Europa använder <strong>Central European Time (CET)</strong>, som är <strong>UTC+1</strong>. På sommaren används
          {" "}<strong>Central European Summer Time (CEST)</strong>, som är <strong>UTC+2</strong>. Sommartid infördes för
          att <strong>spara energi</strong> genom att utnyttja dagsljuset bättre.
        </p>

        <h3>Populära tidsskillnader från Sverige</h3>
        <ul>
          {POPULAERE_TIDSFORSKELSER.map((raekke) => (
            <li key={raekke.by}>
              <strong>{tidsforskelBy(raekke, "se")}:</strong> {tidsforskelTekst(raekke, "se")}
            </li>
          ))}
        </ul>

        <h3>Tips för internationella möten</h3>
        <ul>
          <li>Använd en mötestid som är acceptabel för alla tidszoner</li>
          <li>Ange alltid tidszonen tydligt (t.ex. &quot;14:00 CET&quot;)</li>
          <li>Överväg att rotera mötestider så att bördan delas</li>
          <li>Använd kalenderinbjudan med automatisk tidszonskonvertering</li>
        </ul>

        <h2>Tidsskillnad till de länder folk frågar om</h2>
        <p>
          Tabellen ovan visar städer. Här är samma skillnader för hela{" "}
          <strong>länder</strong>, eftersom{" "}
          &quot;tidsskillnad Japan&quot;,{" "}
          &quot;tidsskillnad Thailand&quot; och &quot;tidsskillnad Turkiet&quot; är
          länder, inte städer. För {byListe("se")} är skillnaden densamma som i
          städstabellen.
        </p>
        <table className="w-full text-left border-collapse my-4">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Land</th>
              <th className="py-2 pr-4">Vintertid (kl. 12 CET)</th>
              <th className="py-2">Sommartid (kl. 12 CEST)</th>
            </tr>
          </thead>
          <tbody>
            {tidsskillnadRaekker("se").map((raekke) => (
              <tr key={raekke.land} className="border-b last:border-0">
                <td className="py-2 pr-4">{raekke.land}</td>
                <td className="py-2 pr-4">{raekke.tekstVinter}</td>
                <td className="py-2">
                  {raekke.tekstSommer ?? "Samma som vintertid"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>{landeFoelgerDanmark("se")} följer Sverige</strong>, så
          skillnaden är densamma hela året. <strong>Thailand, Japan och Kina
          använder inte sommartid</strong>, så de ligger en timme tidigare, när
          Sverige har sommartid. Det är fällan som ger det felaktiga mötet.
        </p>

        <h2>Vad är klockan i ett annat land?</h2>
        <p>
          Många frågar bara «vad är klockan i Japan?» eller «vad är klockan i
          Turkiet?». Svaret beror på datum, för USA, Kanada och Australien
          byter tid på andra datum än Sverige, så ett fast tal kan vara fel i
          de få veckor då Sverige och landet inte byter samtidigt. Varje sida
          nedan svarar med klockslaget just nu i en stad i landet — för USA
          hittar du alla fyra kustzonerna. Vill du se dem alla på en sida
          står de på{" "}
          {klokkenHubSe ? (
            <Link href={klokkenHubSe} className="underline">
              klockan i fjorton länder
            </Link>
          ) : null}{" "}
          med tidsskillnaden till Sverige.
        </p>
        <ul>
          {klokkenPrefixSe
            ? KLOKKEN_LANDE.map((land) => (
                <li key={land.slugSe}>
                  <Link
                    href={`${klokkenPrefixSe}${land.slugSe}`}
                    className="underline"
                  >
                    {`Vad är klockan i ${land.navnSe}?`}
                  </Link>
                </li>
              ))
            : null}
        </ul>

        <h2>Så räknar du ut tidsskillnad i Excel</h2>
        <p>
          Har du två klockslag — ett i Sverige och ett i den andra staden — är
          skillnaden en formel. Lägg dem i <code>A1</code> och <code>B1</code>.
        </p>
        <table className="w-full text-left border-collapse my-4">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Formel</th>
              <th className="py-2">Vad den gör</th>
            </tr>
          </thead>
          <tbody>
            {excelEksempler().map((eksempel) => (
              <tr key={eksempel.formel} className="border-b last:border-0">
                <td className="py-2 pr-4 font-mono">{eksempel.formel}</td>
                <td className="py-2">
                  {eksempel.hvadSe}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Två fällor.</strong> Klockslag i Excel är en bråkdel av ett
          dygn, så 06:00 visas som 0,2500 — du måste gånger med 24 för att få
          timmar. Och en stad på andra sidan om jorden kan ligga både före och
          efter: New York är 6 timmar <em>bakåt</em>, Tokyo är 7 timmar{" "}
          <em>framåt</em>, även om båda talen skrivs som 12 minus 6 och 12
          minus 9. <Link href="/tidsberegner" className="underline">
            Tidskalkylatorn
          </Link>{" "}
          tar hand om det sista om du vill se skillnaden i hela dygn.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/tidszone" />

      {/* Returlink til indlægget om emnet (kun danske domæner) */}
      <RelateredeArtikler current="/tidszone" locale={locale} />
    </div>
  );
}
