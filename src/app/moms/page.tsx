import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import MomsBeregner from "@/components/MomsBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import Sidebar from "@/components/Sidebar";
import { SelvstaendigAffiliate } from "@/components/AffiliateBox";
import { formatNumber } from "@/lib/format";
import { beregnMoms, DEFAULT_MOMS_SATS, fratraekRaekker, momsFaktor } from "@/lib/moms";

export async function generateMetadata() {
  return generatePageMetadata("moms");
}

export default async function MomsPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("moms", locale) || getPageData("moms", "da")!;

  // Samme modul som vaerktøjet bruger, saa tabellerne ikke kan modsige
  // regnestykket. Kun den danske gren bruger dem.
  const kr = (tal: number) => `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`;
  const fratraek = fratraekRaekker(DEFAULT_MOMS_SATS);
  // 499 er med, fordi det er det beløb hvor 20 %-metoden og ÷ 1,25 giver
  // hver sit svar — det er den forskel afsnittet handler om.
  const eksempler = [1250, 499, 2000].map((inkl) =>
    beregnMoms(inkl, "fratraekMoms", DEFAULT_MOMS_SATS)
  );
  const kvart25 = [100, 1000].map((pris) => {
    // Uden afrunding: hver fælde skal kunne efterprøves af læseren, så
    // 1.000 x 1,25 = 1.250 og 1.250 x 1,25 = 1.562,50, ikke "1.560".
    const Trin = [1, 2, 3, 4].map((n) => pris * momsFaktor(25) ** n);
    return {
      pris,
      pris25: Trin[3],
      regnestykke: Trin.map((tal, i) =>
        i === 0 ? `${kr(tal)} × 1,25` : `× 1,25 = ${kr(tal)}`
      ).join(" "),
    };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/moms`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/moms" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <MomsBeregner />
        <SelvstaendigAffiliate className="mt-8" />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om moms i Danmark (2026)</h2>
        <p>
          Moms (merværdiafgift, eng. VAT) er en generel forbrugsafgift på varer og tjenesteydelser i Danmark.
          Med en momssats på <strong>25%</strong> har Danmark en af de højeste momssatser i verden.
          Momsen har været 25% siden 1992, og der er ingen planlagte ændringer for 2026.
        </p>

        <h3>Sådan beregner du moms</h3>
        <p>
          Der er tre typiske beregninger, når du arbejder med moms:
        </p>
        <ul>
          <li><strong>Læg moms til:</strong> Gang beløbet med 1,25. Eksempel: 1.000 kr &times; 1,25 = 1.250 kr inkl. moms</li>
          <li><strong>Træk moms fra:</strong> Divider beløbet med 1,25. Eksempel: 1.250 kr &divide; 1,25 = 1.000 kr ekskl. moms</li>
          <li><strong>Find momsandelen:</strong> Gang beløbet inkl. moms med 0,20. Eksempel: 1.250 kr &times; 0,20 = 250 kr i moms</li>
        </ul>
        <p>
          Bemærk at momsandelen i en pris <em>inklusiv</em> moms er 20% (ikke 25%), fordi momsen
          beregnes af prisen uden moms: 25 / 125 = 0,20.
        </p>

        <h3>Sådan beregner du moms baglæns</h3>
        <p>
          &ldquo;Baglæns&rdquo; er det, du laver når du har prisen <em>med</em> moms og vil
          vide hvor meget der var <em>før</em> moms. Det er den ene regel: <strong>del med 1,25</strong>.
          De tre almindelige priser ser sådan ud:
        </p>
        <ul>
          {eksempler.map((r) => (
            <li key={r.prisInklMoms}>
              <strong>{kr(r.prisInklMoms)} inkl. moms</strong> &divide; 1,25 ={" "}
              <strong>{kr(r.prisUdenMoms)} ekskl. moms</strong> — og momsen var{" "}
              {kr(r.momsBeloeb)}
            </li>
          ))}
        </ul>
        <p>
          <strong>Findes momsen direkte i prisen:</strong> tag 20 % af beløbet. 1.250 kr. &times; 0,20
          = <strong>250 kr. moms</strong>. Det er den kortere vej, men den kan give et rundt tal,
          fordi 499 &minus; 499 / 1,25 = {kr(eksempler[1].momsBeloeb)} — altså 100 kr. hvis du
          tager 20 % af de 499 kr.
        </p>
        <table className="w-full text-left my-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Pris inkl. moms</th>
              <th className="py-2 pr-4">÷ 1,25 = ekskl. moms</th>
              <th className="py-2 pr-4">Momsbeløb</th>
              <th className="py-2">Momsandelen</th>
            </tr>
          </thead>
          <tbody>
            {fratraek. map((r) => (
              <tr key={r.prisInklMoms} className="border-b">
                <td className="py-2 pr-4">{kr(r.prisInklMoms)}</td>
                <td className="py-2 pr-4">{kr(r.prisUdenMoms)}</td>
                <td className="py-2 pr-4">{kr(r.momsBeloeb)}</td>
                <td className="py-2">20 %</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Og når du skal lægge momsen oveni igen:</strong> 1.000 kr. ekskl. &times; 1,25
          = 1.250 kr. inkl. De to regler er hinandens modsætning, så tallet kan altid findes
          tilbage.
        </p>

        <h3>Momsen fire gange i træk</h3>
        <p>
          Når en pris er <em>mindst</em> 25 % dyrere end udlandet, må virksomheden opkræve
          dansk moms af forskellen. Det er en regel, der bliver brugt meget i de store
          e-handelshistorier, fordi den er nem at regne <em>forkert</em> — og den fejl er
          dyr, fordi den er så stor.
        </p>
        <table className="w-full text-left my-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Udenlandsk pris</th>
              <th className="py-2 pr-4">Pris i Danmark</th>
              <th className="py-2">Sådan regnes den</th>
            </tr>
          </thead>
          <tbody>
            {kvart25.map((k) => (
              <tr key={k.pris} className="border-b">
                <td className="py-2 pr-4">{kr(k.pris)}</td>
                <td className="py-2 pr-4">{kr(k.pris25)}</td>
                <td className="py-2">{k.regnestykke}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Derfor er der kun én sats at regne med:</strong> 1,25 gang fire er 2,4414, så
          1.000 kr. bliver 2.441 kr. Men hvis du i stedet trækker 20 % fire gange, får du
          0,4096 — altså kun 410 kr. oveni. Det er den forskel, der gør at en pris kan se
          ud til at være 10 % billigere end en konkurrent, mens den reelt er dobbelt så
          dyr. <strong>Beregn kun med 25 %, aldrig med 20 % gentaget.</strong>
        </p>

        <h3>Momsberegneren i Excel</h3>
        <p>
          Har du en faktura- eller prisliste, er det hurtigere at lade Excel regne det.
          Excel har momsen indbygget, så du ikke skal huske 1,25 selv:
        </p>
        <table className="w-full text-left my-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Formel</th>
              <th className="py-2 pr-4">Gør hvad</th>
              <th className="py-2">På 1.000 kr. ekskl. moms</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=MOMS(A1;25;0;0)</code></td>
              <td className="py-2 pr-4">momsen på et beløb uden moms</td>
              <td className="py-2">250 kr.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1+MOMS(A1;25;0;0)</code></td>
              <td className="py-2 pr-4">beløbet med moms lagt på</td>
              <td className="py-2">1.250 kr.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1/1,25</code></td>
              <td className="py-2 pr-4">beløb med moms, regnet baglæns</td>
              <td className="py-2">1.000 kr.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=MOMS(A1/1,25;25;0;0)</code></td>
              <td className="py-2 pr-4">momsen i et beløb med moms</td>
              <td className="py-2">250 kr.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1-A1/1,25</code></td>
              <td className="py-2 pr-4">samme som ovenfor, uden MOMS-funktionen</td>
              <td className="py-2">250 kr.</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Pas på, når du kopierer:</strong> på dansk og svensk Excel bruger formler
          <em>semikolon</em> som tegn mellem argumenterne, så <code>=MOMS(A1;25;0;0)</code>
          — på engelsk Excel er det komma. Og får du &oslash;, fordi cellen er formateret
          som tekst, skal den formateres som Tal.
        </p>

        <h3>Momsfrie varer og ydelser</h3>
        <p>
          Ikke alle varer og ydelser er momspligtige i Danmark. Momsfritaget er bl.a.:
        </p>
        <ul>
          <li>Sundhedsydelser (læge, tandlæge, psykolog)</li>
          <li>Undervisning og uddannelse</li>
          <li>Finansielle tjenesteydelser (bank, forsikring)</li>
          <li>Udlejning af fast ejendom (bolig)</li>
          <li>Personbefordring (bus, tog, fly inden for DK)</li>
          <li>Bøger, aviser og tidsskrifter</li>
        </ul>
        <p>
          Momsfrit betyder, at varen er <em>undtaget</em> fra momsloven — der betales ikke 0 % moms,
          der betales slet ingen moms. Prisen er derfor den samme med og uden moms. En bog til 249 kr.
          koster 249 kr. Til sammenligning er bøger i Sverige 6 % moms.
        </p>

        <h3>Der er kun én dansk momssats — også på fødevarer</h3>
        <p>
          Danmark har ingen reducerede momssatser. Fødevarer, drikkevarer, biler og tøj er derfor
          alle 25 % moms, og det er derfor de oftest stillede spørgsmål om
          &ldquo;moms på fødevarer&rdquo; og &ldquo;moms på frugt og grønt&rdquo; har samme svar: den fulde
          sats. En fødevare til 80 kr. ekskl. moms koster 100 kr. inkl. moms, fordi 80 kr. &times; 1,25
          = 100 kr.
        </p>
        <p>
          Undtagelserne er de ydelser, der er listet ovenfor. <strong>Bøger er en af de få varer,
          der er helt uden moms</strong> — resten af handelsvarerne er 25 % moms. I Sverige er det
          omvendt: mad er 12 % og bøger 6 % moms, fordi Sverige har tre satser.
        </p>

        <h3>Er der moms på det, jeg køber? Sådan tjekker du det</h3>
        <ul>
          <li><strong>Se om der står &ldquo;inkl. moms&rdquo; eller &ldquo;ekskl. moms&rdquo;:</strong> prisen på hylden er ofte ekskl. moms, så 100 kr. bliver 125 kr. i kassen</li>
          <li><strong>Fødevarer, restauranter og tøj:</strong> altid 25 %</li>
          <li><strong>Bøger, aviser og tidsskrifter:</strong> uden moms</li>
          <li><strong>Forbrugsudstyr, telefoner og møbler:</strong> 25 % — også når de står på tilbud</li>
          <li><strong>Transport:</strong> bus og tog i Danmark er uden moms, et fly uden for Danmark har 25 %</li>
        </ul>

        <h3>Momsregistrering for virksomheder (2026)</h3>
        <p>
          Virksomheder med en årlig omsætning over <strong>50.000 kr</strong> skal momsregistreres hos
          Erhvervsstyrelsen. Registrerede virksomheder opkræver moms af deres salg (salgsmoms) og kan
          fradrage moms på erhvervsmæssige indkøb (købsmoms). Forskellen mellem salgsmoms og købsmoms
          afregnes med Skattestyrelsen.
        </p>
        <p>
          Momsperioden afhænger af din omsætning:
        </p>
        <ul>
          <li><strong>Under 5 mio. kr/år:</strong> Afregning hvert halvår</li>
          <li><strong>5-50 mio. kr/år:</strong> Afregning hvert kvartal</li>
          <li><strong>Over 50 mio. kr/år:</strong> Afregning hver måned</li>
        </ul>

        <h3>Moms i EU og ved handel med udlandet</h3>
        <p>
          EU-momssatserne varierer fra 17% (Luxembourg) til 27% (Ungarn). Danmarks 25% ligger i den
          høje ende. Ved køb af varer fra udlandet gælder:
        </p>
        <ul>
          <li><strong>Inden for EU:</strong> Privatpersoner betaler normalt momsen i sælgerlandet. Virksomheder kan bruge reverse charge</li>
          <li><strong>Tysk købsmoms:</strong> En dansk virksomhed, der køber tjenester i Tyskland, betaler ikke tysk moms. Ved omvendt betalingsansvar registrerer virksomheden selv beløbet med 25 % i sin egen afregning</li>
          <li><strong>Uden for EU:</strong> Du betaler dansk moms (25%) + eventuel told ved import over 1.150 kr</li>
        </ul>

        <h3>Moms på digitale ydelser</h3>
        <p>
          Køber du digitale tjenester som streaming, software eller e-bøger fra udenlandske
          udbydere, skal de opkræve dansk moms (25%) via EU&apos;s One Stop Shop-ordning.
          Du betaler altså allerede dansk moms når du køber fra fx Netflix, Spotify eller Apple.
        </p>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om moms i Sverige (2026)</h2>
        <p>
          Moms (mervärdesskatt, eng. VAT) är en generell konsumtionsskatt på varor och tjänster i Sverige.
          Standardsatsen är <strong>25%</strong>, vilket är en av de högsta momssatserna i Europa.
          Utöver standardsatsen finns två reducerade satser: <strong>12%</strong> och <strong>6%</strong>.
        </p>

        <h3>Sveriges tre momssatser</h3>
        <ul>
          <li><strong>25% (standardsats):</strong> gäller de flesta varor och tjänster</li>
          <li><strong>12% (reducerad):</strong> livsmedel, restaurang- och cateringtjänster samt hotell och logi</li>
          <li><strong>6% (starkt reducerad):</strong> böcker, tidningar, kollektivtrafik, konserter, idrott och kultur</li>
        </ul>

        <h3>Så här räknar du ut moms</h3>
        <p>
          Det finns tre typiska beräkningar när du arbetar med moms (exemplen utgår från 25%):
        </p>
        <ul>
          <li><strong>Lägga på moms:</strong> Multiplicera beloppet med 1,25. Exempel: 1 000 kr &times; 1,25 = 1 250 kr inkl. moms</li>
          <li><strong>Räkna bort moms:</strong> Dividera beloppet med 1,25. Exempel: 1 250 kr &divide; 1,25 = 1 000 kr exkl. moms</li>
          <li><strong>Hitta momsandelen:</strong> Multiplicera beloppet inkl. moms med 0,20. Exempel: 1 250 kr &times; 0,20 = 250 kr i moms</li>
        </ul>
        <p>
          Observera att momsandelen i ett pris <em>inklusive</em> 25% moms är 20% (inte 25%), eftersom
          momsen beräknas på priset utan moms: 25 / 125 = 0,20. För 12% moms är andelen ca 10,71% och för
          6% moms ca 5,66%.
        </p>

        <h3>Momsfria varor och tjänster</h3>
        <p>
          Alla varor och tjänster är inte momspliktiga i Sverige. Momsfritt är bland annat:
        </p>
        <ul>
          <li>Sjukvård, tandvård och social omsorg</li>
          <li>Utbildning inom det offentliga skolväsendet</li>
          <li>Bank- och finansieringstjänster samt försäkringar</li>
          <li>Uthyrning av bostad</li>
        </ul>

        <h3>Momsregistrering för företag (2026)</h3>
        <p>
          Företag registrerar sig för moms hos <strong>Skatteverket</strong>. Företag med en omsättning
          på högst <strong>120 000 kr</strong> per år kan vara momsbefriade, men de flesta väljer eller
          måste momsregistrera sig. Registrerade företag tar ut moms på sin försäljning (utgående moms)
          och får dra av moms på inköp i verksamheten (ingående moms). Skillnaden redovisas till
          Skatteverket i en <strong>momsdeklaration</strong>.
        </p>
        <p>
          Redovisningsperioden beror på företagets omsättning:
        </p>
        <ul>
          <li><strong>Upp till 1 miljon kr/år:</strong> redovisning en gång per år</li>
          <li><strong>1–40 miljoner kr/år:</strong> redovisning varje kvartal</li>
          <li><strong>Över 40 miljoner kr/år:</strong> redovisning varje månad</li>
        </ul>

        <h3>Moms i EU och vid handel med utlandet</h3>
        <p>
          Momssatserna i EU varierar från 17% (Luxemburg) till 27% (Ungern). Sveriges 25% ligger i den
          höga delen. Vid köp av varor från utlandet gäller:
        </p>
        <ul>
          <li><strong>Inom EU:</strong> Privatpersoner betalar normalt momsen i säljarlandet. Företag kan använda omvänd skattskyldighet</li>
          <li><strong>Utanför EU:</strong> Du betalar svensk moms (25%) plus eventuell tull vid import</li>
        </ul>

        <h3>Moms på digitala tjänster</h3>
        <p>
          Köper du digitala tjänster som streaming, mjukvara eller e-böcker från utländska leverantörer
          ska de ta ut svensk moms (25%) via EU:s One Stop Shop-ordning. Du betalar alltså redan svensk
          moms när du köper från exempelvis Netflix, Spotify eller Apple.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/moms" />

      <RelateredeArtikler current="/moms" locale={locale} />
      </div>
      <Sidebar currentHref="/moms" adSlotId="moms-sidebar" />
    </div>
  );
}
