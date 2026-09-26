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
import { graenseForLocale } from "@/lib/promille";

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
              ? `Det finns två tal, och det kortare är det, der bestämmer om du får köra bil: du får köra när promillen är under ${graenseTekst}, men du är inte helt nykter før den är under 0 ‰. Kolumnen "${se ? "Under gränsen" : "Under grænsen"}" er derfor altid kortere end "${se ? "Helt nykter" : "Helt ædru"}".`
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
            <h2>Promillegrænsen i Danmark</h2>
            <p>
              Det er ulovligt at køre bil med en promille <strong>over 0,5 ‰</strong>. Husk, at
              alkohol forbrændes langsomt — du kan sagtens være over grænsen morgenen efter en
              festaften. Beregneren er kun et <strong>estimat</strong>: mad, stofskifte, medicin og
              helbred påvirker den faktiske promille. Kør aldrig i tvivl.
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
            <h2>Promillegränsen i Sverige</h2>
            <p>
              I Sverige går gränsen för rattfylleri vid <strong>0,2 ‰</strong> — betydligt lägre än i
              Danmark. Vid 1,0 ‰ räknas det som grovt rattfylleri. Kom ihåg att alkohol förbränns
              långsamt, så du kan vara kvar över gränsen morgonen efter. Kalkylatorn är endast en{" "}
              <strong>uppskattning</strong> — kör aldrig om du är osäker.
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
