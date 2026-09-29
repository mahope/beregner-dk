import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import PromilleBeregner from "@/components/PromilleBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  PROMILLE_EKSEAMPLER,
  formatGenstande,
  formatGram,
  formatPromille,
  formatTimer,
} from "@/lib/promille-eksempler";
import { graenseForLocale, PROMILLEGRANSE, PROMILLEGRANSE_UDLAND, GRAM_PR_GENSTAND } from "@/lib/promille";
import {
  PROMILLE_GENSTANDE_RAEKKER,
  PROMILLE_VAEGTE,
  formatPromilleTabel,
  genstandeTilGraense,
  vaegtNogle,
} from "@/lib/promille-genstande";

/**
 * Rækkeorden følger grænsen: de strengste først, fordi det er dem, danske
 * læsere spørger om ("promillegrænse sverige", "promillegrænse norge",
 * "promillegrænse tyskland" — dansk autocomplete, 27/9). Tallene kommer fra
 * PROMILLEGRANSE_UDLAND, så tabellen ikke kan komme i strid med beregnerens
 * egen grænse; det er låst i page.test.tsx.
 */
const PROMILLEGRAENSER_UDLAND: { land: string; nokkel: string; saerregel: string }[] = [
  {
    land: "Sverige",
    nokkel: "sverige",
    saerregel: "Ingen særregel — grænsen er den samme for alle bilister",
  },
  { land: "Norge", nokkel: "norge", saerregel: "Ingen særregel" },
  { land: "Polen", nokkel: "polen", saerregel: "Ingen særregel" },
  {
    land: "Tyskland",
    nokkel: "tyskland",
    saerregel: "0,0 ‰ under 21 år og de første 2 år med kørekort, og 0,3 ‰ hvis du samtidig begår en anden trafikforseelse",
  },
  {
    land: "Frankrig",
    nokkel: "frankrig",
    saerregel: "0,2 ‰ de første 3 år med kørekort og for buschauffører",
  },
  {
    land: "Spanien",
    nokkel: "spanien",
    saerregel: "0,3 ‰ de første 2 år og for tungtransport, 0,0 ‰ under 18 år",
  },
  {
    land: "Italien",
    nokkel: "italien",
    saerregel: "0,0 ‰ de første 3 år med kørekort og for erhvervskørsel",
  },
  {
    land: "Grækenland",
    nokkel: "graekenland",
    saerregel: "0,2 ‰ de første 2 år, for motorcykel og for erhvervskørsel",
  },
  { land: "Holland", nokkel: "holland", saerregel: "0,2 ‰ de første 5 år med kørekort" },
  { land: "Østrig", nokkel: "oestrig", saerregel: "0,1 ‰ de første 2 år med kørekort" },
  { land: "Danmark", nokkel: "danmark", saerregel: "Ingen særregel" },
  {
    land: "Storbritannien",
    nokkel: "storbritannien",
    saerregel: "0,5 ‰ i Skotland — ellers är det 0,8 ‰",
  },
];

/**
 * Samma tabell til beraknare.se. Rækkeorden er Sveriges egen grænse først,
 * fordi det er den svenske læser spørger om, og Danmark kommer med, fordi
 * grænsen der er mere end dobbelt så høj. `nokkel` er de samme nøgler som
 * PROMILLEGRANSE_UDLAND, så tallene ikke kan skrives to steder.
 */
const PROMILLEGRAENSER_UDLAND_SE: { land: string; nokkel: string; saerregel: string }[] = [
  {
    land: "Sverige",
    nokkel: "sverige",
    saerregel: "Ingen särregel — gränsen är densamma för alla förare",
  },
  { land: "Norge", nokkel: "norge", saerregel: "Ingen särregel" },
  { land: "Polen", nokkel: "polen", saerregel: "Ingen särregel" },
  { land: "Danmark", nokkel: "danmark", saerregel: "Ingen särregel" },
  {
    land: "Tyskland",
    nokkel: "tyskland",
    saerregel: "0,0 ‰ under 21 år och de första 2 åren med körkort, och 0,3 ‰ om du samtidigt begår ett annat trafikbrott",
  },
  {
    land: "Frankrike",
    nokkel: "frankrig",
    saerregel: "0,2 ‰ de första 3 åren med körkort och för bussförare",
  },
  {
    land: "Spanien",
    nokkel: "spanien",
    saerregel: "0,3 ‰ de första 2 åren och för tungtransport, 0,0 ‰ under 18 år",
  },
  {
    land: "Italien",
    nokkel: "italien",
    saerregel: "0,0 ‰ de första 3 åren med körkort och för yrkestrafik",
  },
  {
    land: "Grekland",
    nokkel: "graekenland",
    saerregel: "0,2 ‰ de första 2 åren, för motorcykel och för yrkestrafik",
  },
  { land: "Nederländerna", nokkel: "holland", saerregel: "0,2 ‰ de första 5 åren med körkort" },
  { land: "Österrike", nokkel: "oestrig", saerregel: "0,1 ‰ de första 2 åren med körkort" },
  {
    land: "Storbritannien",
    nokkel: "storbritannien",
    saerregel: "0,5 ‰ i Skottland — annars är det 0,8 ‰",
  },
];

export async function generateMetadata() {
  return generatePageMetadata("promille");
}

export default async function PromillePage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("promille", locale) || getPageData("promille", "da")!;
  const se = locale === "se";
  const graense = graenseForLocale(locale);
  const graenseTekst = `${String(graense).replace(".", ",")} ‰`;
  const timerTilGraense = (r: (typeof PROMILLE_EKSEAMPLER)[number]) =>
    se ? r.timerTilGraenseSe : r.timerTilGraenseDa;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/promille`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/promille" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <PromilleBeregner />
        </div>

        {/* Det er to forskellige tal, og den almindeligste fejl er at svare
            på det forker: du må køre bil, når du er UNDER grænsen, ikke når
            du er helt ædru. 4.159 visninger / 0,6 % CTR / pos. 7,9 (GSC
            2026-09-24), og værktøjet havde ingen af de to tidsrum før dette.
            Tallene kommer fra PROMILLE_EKSEAMPLER — samme modul som
            værktøjet bruger — så tabellen og værktøjet ikke kan glide fra
            hinanden. */}
        {(locale === "da" || locale === "se") && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-3 dark:text-white">
            {se ? "När är du åter nykter?" : "Hvornår er du igen promillefri?"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {se
              ? `Det finns två tal, och det kortare är det, der bestämmer om du får köra bil: du får köra när promillen är under ${graenseTekst}, men du är inte helt nykter före den är under 0 ‰. Kolumnen "${se ? "Under gränsen" : "Under grænsen"}" är derför alltid kortare än "${se ? "Helt nykter" : "Helt ædru"}".`
              : `Der er to tal, og det er det kortere, der bestemmer, om du må køre bil: du må køre, når promillen er under ${graenseTekst}, men du er ikke helt ædru, før den er under 0 ‰. Kolonnen "Under grænsen" er derfor altid kortere end "Helt ædru".`}
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>{se ? "Situation" : "Situation"}</th>
                  <th>{se ? "Promille nu" : "Promille nu"}</th>
                  <th>{se ? `Under ${graenseTekst}` : `Under ${graenseTekst}`}</th>
                  <th>{se ? "Helt nykter (0 ‰)" : "Helt ædru (0 ‰)"}</th>
                </tr>
              </thead>
              <tbody>
                {PROMILLE_EKSEAMPLER.map((eksempel) => {
                  const { antal, enhed } = formatGenstande(eksempel.genstande, se ? "se" : "da");
                  return (
                    <tr key={`${eksempel.genstande}-${eksempel.vaegtKg}-${eksempel.koen}-${eksempel.timerSiden}`}>
                      <td>
                        {antal} {enhed} ({formatGram(eksempel.genstande)}
                        {se ? ", " : ", "}
                        {eksempel.vaegtKg} kg {se ? (eksempel.koen === "mand" ? "man" : "kvinna") : eksempel.koen === "mand" ? "mand" : "kvinde"}
                        {eksempel.timerSiden > 0 ? (se ? `, ${eksempel.timerSiden} h efter` : `, ${eksempel.timerSiden} t efter`) : ""})
                      </td>
                      <td>
                        <strong>{formatPromille(eksempel.promille)} ‰</strong>
                      </td>
                      <td>{formatTimer(timerTilGraense(eksempel), se ? "se" : "da")}</td>
                      <td>{formatTimer(eksempel.timerTilNul, se ? "se" : "da")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 space-y-2">
            {PROMILLE_EKSEAMPLER.map((eksempel) => (
              <li
                key={`bem-${eksempel.genstande}-${eksempel.vaegtKg}-${eksempel.koen}`}
                className="text-sm text-gray-600 dark:text-gray-400"
              >
                {eksempel.bemaerkning[se ? "se" : "da"]}
              </li>
            ))}
          </ul>
        </div>
        )}

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan beregnes promille</h2>
            <p>
              Beregneren bruger <strong>Widmark-formlen</strong>, som er den anerkendte metode til at
              anslå alkoholpromille i blodet:{" "}
              <em>promille = gram alkohol / (kropsvægt × fordelingsfaktor) − 0,15 × timer</em>.
              Fordelingsfaktoren er cirka <strong>0,68 for mænd</strong> og <strong>0,55 for
              kvinder</strong>, fordi kroppens vandindhold er forskelligt. Kroppen nedbryder omkring{" "}
              <strong>0,15 ‰ i timen</strong>.
            </p>
            <h2>Hvad er én genstand?</h2>
            <p>
              I Danmark svarer <strong>én genstand til 12 gram ren alkohol</strong>. Det er cirka en
              almindelig øl (33 cl, 4,6 %), et lille glas vin (12 cl) eller et snapseglas spiritus
              (4 cl). En stærk øl eller et stort glas vin kan sagtens være 1,5–2 genstande.
            </p>
            <h2>Hvor mange promille er N øl?</h2>
            <p>
              Det er det mest søgte spørgsmål om promille, og svaret afhænger af
              kropsvægten. Regnestykket er <strong>promille = gram alkohol &divide;
              (kropsvægt &times; fordelingsfaktor)</strong>, og én pilsner på 33
              cl er ca. <strong>12 gram</strong> — altså én genstand. Tabellen
              regner med fulde genstande, altså uden alkohol i kroppen inden
              dansketiden:
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Genstande</th>
                    <th>80 kg (mand)</th>
                    <th>70 kg (mand)</th>
                    <th>60 kg (kvinde)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1 øl / 1 glas vin</td>
                    <td>0,22 ‰</td>
                    <td>0,25 ‰</td>
                    <td>0,36 ‰</td>
                  </tr>
                  <tr>
                    <td>2 øl / 2 glas vin</td>
                    <td>0,44 ‰</td>
                    <td>0,50 ‰</td>
                    <td>0,73 ‰</td>
                  </tr>
                  <tr>
                    <td>3 øl / 3 glas vin</td>
                    <td>0,66 ‰</td>
                    <td>0,76 ‰</td>
                    <td>1,09 ‰</td>
                  </tr>
                  <tr>
                    <td>4 øl / 4 glas vin</td>
                    <td>0,88 ‰</td>
                    <td>1,01 ‰</td>
                    <td>1,45 ‰</td>
                  </tr>
                  <tr>
                    <td>6 øl / 6 glas vin</td>
                    <td>1,32 ‰</td>
                    <td>1,51 ‰</td>
                    <td>2,18 ‰</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Sådan kan du se grænsen på 0,5 ‰: for en 80 kg mand nås den
              mellem to og tre øl (0,66 ‰ efter tre), for en 70 kg mand ved to
              øl (0,50 ‰), og for en 60 kg kvinde efter halvandet (0,55 ‰). Og
              kroppen bruger tid — efter yderligere en time er der ca. 0,15 ‰
              mindre. Tast dine egne tal ind i promilleberegneren ovenfor for et
              præcist estimat.
            </p>
            <h2>Promillegrænsen i Danmark</h2>
            <p>
              Det er ulovligt at køre bil med en promille <strong>over 0,5 ‰</strong>. Husk, at
              alkohol forbrændes langsomt — du kan sagtens være over grænsen morgenen efter en
              festaften. Beregneren er kun et <strong>estimat</strong>: mad, stofskifte, medicin og
              helbred påvirker den faktiske promille. Kør aldrig i tvivl.
            </p>
            <h2>Promillegrænsen i udlandet</h2>
            <p>
              Har du tænkt dig at køre bil i udlandet, så er grænsen <strong>ikke</strong> 0,5 ‰
              overalt. I Sverige og Norge er den 0,2 ‰ — altså den halve af den danske — mens
              Storbritannien ligger højere med 0,8 ‰. Resten af Europa har stort set den
              danske grænse på 0,5 ‰, men med strengere regler for nye og professionelle
              bilister. Tabellen er en oversigt fra WHO's landeoversigt over promillegrænser
              (hentet 27. september 2026) — den er vejledende, fordi reglerne ændrer sig, så
              tjek altid det enkelte lands love før du kører.
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Land</th>
                    <th>Grænse</th>
                    <th>Strengere regel for nye og professionelle bilister</th>
                  </tr>
                </thead>
                <tbody>
                  {PROMILLEGRAENSER_UDLAND.map((land) => (
                    <tr key={land.nokkel}>
                      <td>{land.land}</td>
                      <td>{`${String(PROMILLEGRANSE_UDLAND[land.nokkel]).replace(".", ",")} ‰`}</td>
                      <td>{land.saerregel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Det vigtigste at tage med er det: <strong>2 øl på 80 kg er 0,44 ‰</strong> — under
              den danske grænse, men over den svenske og norske på 0,2 ‰. Samme krop, samme
              aften, to forskellige domme. Beregneren ovenfor regner promillen, og tabellen
              fortæller dig, hvad du skal sammenligne den med.
            </p>
            <h2>To forskellige tal: under grænsen og helt ædru</h2>
            <p>
              Det er ulovligt at køre bil med en promille <strong>over 0,5 ‰</strong> — du
              behøver altså <strong>ikke</strong> være helt ædru for at køre lovligt. Det er den
              almindeligste fejl at blande sammen på: at regne promillen ned til 0 ‰ og tro, at
              det er det, der bestemmer, hvornår du må køre. Kroppen forbrænder omkring{" "}
              <strong>0,15 ‰ i timen</strong>, så der er typisk <strong>2-3 timer</strong> mellem
              det tidspunkt, hvor du må køre igen, og det tidspunkt, hvor du er helt ædru. Tabellen
              ovenfor viser begge tal for fire typiske situationer.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Så beräknas promille</h2>
            <p>
              Kalkylatorn använder <strong>Widmarks formel</strong>, den vedertagna metoden för att
              uppskatta alkoholhalten i blodet:{" "}
              <em>promille = gram alkohol / (kroppsvikt × fördelningsfaktor) − 0,15 × timmar</em>.
              Fördelningsfaktorn är cirka <strong>0,68 för män</strong> och <strong>0,55 för
              kvinnor</strong>. Kroppen bryter ner ungefär <strong>0,15 ‰ per timme</strong>.
            </p>
            <h2>Vad är ett standardglas?</h2>
            <p>
              Ett <strong>standardglas motsvarar 12 gram ren alkohol</strong> — ungefär en vanlig öl
              (33 cl), ett litet glas vin (12 cl) eller en snaps sprit (4 cl). En starköl eller ett
              stort glas vin kan lätt vara 1,5–2 standardglas.
            </p>
            <h2>Hur många promille är N öl?</h2>
            <p>
              Det är det mest sökta frågan om promille, och svaret beror på kroppsvikten.
              Regnestycket är <strong>promille = gram alkohol &divide; (kroppsvikt &times;
              fördelningsfaktor)</strong>, och en vanlig öl på 33 cl är ca{" "}
              <strong>{GRAM_PR_GENSTAND} gram</strong> — alltså ett standardglas. Tabellen räknar
              med fulla standardglas, alltså utan alkohol i kroppen från början av kvällen:
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Standardglas</th>
                    {PROMILLE_VAEGTE.map(({ vaegtKg, koen }) => (
                      <th key={`${vaegtKg}-${koen}`}>
                        {vaegtKg} kg ({koen === "mand" ? "man" : "kvinna"})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PROMILLE_GENSTANDE_RAEKKER.map((raekke) => (
                    <tr key={raekke.genstande}>
                      <td>
                        {raekke.genstande} öl / {raekke.genstande} glas vin
                      </td>
                      {PROMILLE_VAEGTE.map(({ vaegtKg, koen }) => (
                        <td key={`${vaegtKg}-${koen}`}>
                          {formatPromilleTabel(
                            raekke.promille[vaegtNogle(vaegtKg, koen)]
                          )}{" "}
                          ‰
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Så ser du var gränsen på 0,2 ‰ går: den nås efter{" "}
              <strong>{genstandeTilGraense(80, "mand", PROMILLEGRANSE.se)} öl</strong> för en 80
              kg man, <strong>{genstandeTilGraense(70, "mand", PROMILLEGRANSE.se)} öl</strong> för
              en 70 kg man och <strong>{genstandeTilGraense(60, "kvinde", PROMILLEGRANSE.se)} öl</strong>{" "}
              för en 60 kg kvinna. Den svenska gränsen är alltså låg: ett enda standardglas kan
              räcka för att nå den. Och kroppen bryter ner alkohol med tiden — efter en timme till är
              det ungefär 0,15 ‰ mindre. Fyll i dina egna siffror i promillekalkylatorn ovan för en
              exakt uppskattning.
            </p>
            <h2>Promillegränsen i Sverige</h2>
            <p>
              I Sverige går gränsen för rattfylleri vid <strong>0,2 ‰</strong> — betydligt lägre än i
              Danmark. Vid 1,0 ‰ räknas det som grovt rattfylleri. Kom ihåg att alkohol förbränns
              långsamt, så du kan vara kvar över gränsen morgonen efter. Kalkylatorn är endast en{" "}
              <strong>uppskattning</strong> — kör aldrig om du är osäker.
            </p>
            <h2>Promillegränsen utomlands</h2>
            <p>
              Ska du köra bil i utlandet är gränsen <strong>inte</strong> 0,2 ‰ överallt. I Danmark
              ligger den på 0,5 ‰ — alltså mer än dubbelt så hög — medan Norge och Polen har samma
              0,2 ‰ som Sverige och Storbritannien ligger på 0,8 ‰. Tabellens siffror kommer från
              WHO:s landsöversikt över promillegränser (hämtad 27 september 2026) och är
              vägledande, eftersom reglerna ändras — kontrollera alltid det aktuella landets regler
              innan du kör.
            </p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Land</th>
                    <th>Gräns</th>
                    <th>Strängare regel för nya och yrkesförare</th>
                  </tr>
                </thead>
                <tbody>
                  {PROMILLEGRAENSER_UDLAND_SE.map((land) => (
                    <tr key={land.nokkel}>
                      <td>{land.land}</td>
                      <td>{`${String(PROMILLEGRANSE_UDLAND[land.nokkel]).replace(".", ",")} ‰`}</td>
                      <td>{land.saerregel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Det viktigaste att ta med är det: <strong>2 öl på 80 kg är 0,44 ‰</strong> — det är
              <strong> över</strong> den svenska gränsen på 0,2 ‰ men <strong>under</strong> den
              danske på 0,5 ‰. Samma kropp, samma kväll, två olika länder. Just därför är det värt
              att veta den danska gränsen innan semesterresan.
            </p>
            <h2>Två olika tal: under gränsen och helt nykter</h2>
            <p>
              Det är alltså <strong>inte</strong> nödvändigt att vara helt nykter för att få köra
              lagligt — gränsen går vid <strong>0,2 ‰</strong>. Det är det vanligaste misstaget att
              blanda ihop: att räkna promillen ned till 0 ‰ och tro att det är det som avgör när
              du får köra. Kroppen bryter ner ungefär <strong>0,15 ‰ per timme</strong>, så det
              går typiskt <strong>2-3 timmar</strong> mellan den tidpunkt då du får köra igen och
              den tidpunkt då du är helt nykter. Tabellen ovan visar båda talen för fyra typiska
              situationer.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/promille" />
      </div>
      <Sidebar currentHref="/promille" adSlotId="promille-sidebar" />
    </div>
  );
}
