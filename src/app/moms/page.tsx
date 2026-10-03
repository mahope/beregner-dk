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
import { beregnMoms, DEFAULT_MOMS_SATS, fratraekRaekker, MOMS_REFERENCE_BELOEB, momsAndel, momsFaktor } from "@/lib/moms";
import { baklaengesEksempler, baklaengesTabel, krSe } from "@/lib/moms-eksempler";
import { MOMS_LANDE, momsSatsUdenraekke, udenlandRaeekker } from "@/lib/moms-eu";

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
  // "Hurtig reference"-tabellen skal vise præcis det, modulet regner. Med tallene
  // håndskrevet i cellerne var den en sjette kopi af momsen, og det var den der
  // ville blive stående, når satsen ændrer sig. 1.000 kr. er
  // `MOMS_REFERENCE_BELOEB`s tredje beløb.
  const EXCEL_BELOEB = MOMS_REFERENCE_BELOEB[2];
  const EXCEL_FAKTOR = formatNumber(momsFaktor(DEFAULT_MOMS_SATS), "da");
  const EXCEL_SATS = String(DEFAULT_MOMS_SATS);
  const excelTillaeg = beregnMoms(EXCEL_BELOEB, "tillaegMoms", DEFAULT_MOMS_SATS);
  const excelFratraek = beregnMoms(EXCEL_BELOEB, "fratraekMoms", DEFAULT_MOMS_SATS);
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

  // EU-tabellen. `udenlandRaeekker` regner hver pris gennem `beregnMoms`, saa
  // ingen celle i tabellen kan vise et tal vaerktøjet ikke ville give, og
  // `momsSatsUdenraekke` finder laveste og hoejeste sats af de samme lande,
  // saa brødteksten ikke kan modsige tabellen.
  const udenland = udenlandRaeekker();
  const satsUdenraekke = momsSatsUdenraekke();
  const procentDa = (tal: number) =>
    formatNumber(tal, "da", { maximumFractionDigits: 1 });
  const procentSe = (tal: number) =>
    formatNumber(tal, "se", { maximumFractionDigits: 1 });
  const krDa = (tal: number) =>
    `${formatNumber(tal, "da", { maximumFractionDigits: 2 })} kr.`;
  const krSeLang = (tal: number) =>
    `${formatNumber(tal, "se", { maximumFractionDigits: 2 })} kr`;

  // Eksemplerne i brødteksten er de beløb, "hurtig reference" bruger (1.000
  // kr.), og de er regnet af `beregnMoms` — samme modul som tabellerne og
  // værktøjet. De var håndskrevet i begge sprog, to gange i hvert sprog plus de
  // fire rækker i den svenske Excel-tabel, så de var otte kopier af tal, der
  // ville blive stående, når satsen ændrer sig.
  const EK = MOMS_REFERENCE_BELOEB[2];
  const EK_MED = beregnMoms(EK, "tillaegMoms", DEFAULT_MOMS_SATS);
  const EK_BRUTTO = EK_MED.prisInklMoms;
  const EK_FRA = beregnMoms(EK_BRUTTO, "fratraekMoms", DEFAULT_MOMS_SATS);
  // Momsandelen i en pris *med* moms er 0,20 — ikke satsen. Den er skrevet med
  // to decimaler, fordi det er den notationsform brødteksten bruger.
  const ANDEL_FAKTOR = formatNumber(momsAndel(DEFAULT_MOMS_SATS), "da", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const ANDEL_FAKTOR_SE = formatNumber(momsAndel(DEFAULT_MOMS_SATS), "se", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const EXCEL_FAKTOR_SE = formatNumber(momsFaktor(DEFAULT_MOMS_SATS), "se", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const ANDEL_PCT_DA = `${procentDa(momsAndel(DEFAULT_MOMS_SATS) * 100)} %`;
  const ANDEL_PCT_SE = `${procentSe(momsAndel(DEFAULT_MOMS_SATS) * 100)} %`;
  // Svensk momsandel for de andre satserna, med to decimaler sa 12 %'s
  // 10,71 % ikke bliver til 10,7 %.
  const andelSe = (momssats: number) =>
    formatNumber(momsAndel(momssats) * 100, "se", { maximumFractionDigits: 2 });
  // «Momsen fire gange i træk»: 1,25⁴ mod 0,8⁴. Begge faktorer læses fra
  // modulet, så de to tal i afsnittet ikke kan modsige hinanden.
  const KVART_GANGE = 4;
  const KVART_25 = momsFaktor(DEFAULT_MOMS_SATS) ** KVART_GANGE;
  const KVART_20 = (1 - momsAndel(DEFAULT_MOMS_SATS)) ** KVART_GANGE;
  const faktorDa = (f: number) => formatNumber(f, "da", { maximumFractionDigits: 4 });

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
          <li><strong>Læg moms til:</strong> Gang beløbet med {EXCEL_FAKTOR}. Eksempel: {kr(EK)} &times; {EXCEL_FAKTOR} = {kr(EK_MED.prisInklMoms)} inkl. moms</li>
          <li><strong>Træk moms fra:</strong> Divider beløbet med {EXCEL_FAKTOR}. Eksempel: {kr(EK_BRUTTO)} &divide; {EXCEL_FAKTOR} = {kr(EK_FRA.prisUdenMoms)} ekskl. moms</li>
          <li><strong>Find momsandelen:</strong> Gang beløbet inkl. moms med {ANDEL_FAKTOR}. Eksempel: {kr(EK_BRUTTO)} &times; {ANDEL_FAKTOR} = {kr(EK_FRA.momsBeloeb)} i moms</li>
        </ul>
        <p>
          Bemærk at momsandelen i en pris <em>inklusiv</em> moms er {ANDEL_PCT_DA} (ikke 25%), fordi momsen
          beregnes af prisen uden moms: 25 / 125 = {ANDEL_FAKTOR}.
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
          <strong>Findes momsen direkte i prisen:</strong> tag {ANDEL_PCT_DA} af beløbet. {kr(EK_BRUTTO)} &times; {ANDEL_FAKTOR}
          = <strong>{kr(EK_FRA.momsBeloeb)} moms</strong>. Det er den kortere vej, men den kan give et rundt tal,
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
          <strong>Og når du skal lægge momsen oveni igen:</strong> {kr(EK)} ekskl. &times; {EXCEL_FAKTOR}
          = {kr(EK_MED.prisInklMoms)} inkl. De to regler er hinandens modsætning, så tallet kan altid findes
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
          <strong>Derfor er der kun én sats at regne med:</strong> {EXCEL_FAKTOR} gang fire er {faktorDa(KVART_25)}, så
          {kr(kvart25[1].pris)} bliver {kr(kvart25[1].pris25)}. Men hvis du i stedet trækker {ANDEL_PCT_DA} fire gange,
          bliver prisen {faktorDa(KVART_20)} af den oprindelige — altså {kr(kvart25[1].pris * KVART_20)} i alt.
          Det er den forskel, der gør at en pris kan se
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
              <th className="py-2">På {kr(EXCEL_BELOEB)}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=MOMS(A1;{EXCEL_SATS};0;0)</code></td>
              <td className="py-2 pr-4">momsen på et beløb uden moms</td>
              <td className="py-2">{kr(excelTillaeg.momsBeloeb)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1+MOMS(A1;{EXCEL_SATS};0;0)</code></td>
              <td className="py-2 pr-4">beløbet med moms lagt på</td>
              <td className="py-2">{kr(excelTillaeg.prisInklMoms)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1/{EXCEL_FAKTOR}</code></td>
              <td className="py-2 pr-4">beløb med moms, regnet baglæns (A1 er her {kr(EXCEL_BELOEB)} inkl. moms)</td>
              <td className="py-2">{kr(excelFratraek.prisUdenMoms)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=MOMS(A1/{EXCEL_FAKTOR};{EXCEL_SATS};0;0)</code></td>
              <td className="py-2 pr-4">momsen i et beløb med moms (A1 er her {kr(EXCEL_BELOEB)} inkl. moms)</td>
              <td className="py-2">{kr(excelFratraek.momsBeloeb)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1-A1/{EXCEL_FAKTOR}</code></td>
              <td className="py-2 pr-4">samme som ovenfor, uden MOMS-funktionen (A1 er her {kr(EXCEL_BELOEB)} inkl. moms)</td>
              <td className="py-2">{kr(excelFratraek.momsBeloeb)}</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>De to første rækker</strong> regner på {kr(EXCEL_BELOEB)} <em>uden</em>{" "}
          moms, som overskriften siger. <strong>De tre sidste</strong> regner på{" "}
          {kr(EXCEL_BELOEB)} <em>med</em> moms — for det er kun et beløb med moms, man
          kan regne momsen ud af. Derfor står grundlaget i hver af de rækker.
        </p>
        <p>
          <strong>Pas på, når du kopierer:</strong> på dansk og svensk Excel bruger formler
          <em>semikolon</em> som tegn mellem argumenterne, så <code>=MOMS(A1;{EXCEL_SATS};0;0)</code>
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

        <h3>Momssatsen i EU&apos;s medlemslande</h3>
        <p>
          EU-momssatserne varierer fra {procentDa(satsUdenraekke.lavest.standard)} % (
          {satsUdenraekke.lavest.navn.da}) til {procentDa(satsUdenraekke.hoejest.standard)} % (
          {satsUdenraekke.hoejest.navn.da}). Danmarks 25 % ligger i den høje ende. Norge er ikke
          medlem af EU, men står med, fordi det er det nærmeste norske spørgsmål og det er med 25 %
          på normal sats.
        </p>
        <p>
          Kolonnen &ldquo;100 kr. ekskl. moms&rdquo; viser, hvad 100 kr. uden moms koster med moms i
          hvert land, regnet med landets egen sats. Den danske række er den, dit eget køb
          gennemgår: 100 kr. ekskl. moms bliver 125 kr. inkl. moms.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-3">Land</th>
                <th scope="col" className="text-left py-2 pr-3">Standard</th>
                <th scope="col" className="text-left py-2 pr-3">Reduceret</th>
                <th scope="col" className="text-left py-2 pr-3">100 kr. ekskl. moms</th>
              </tr>
            </thead>
            <tbody>
              {udenland.map(({ land, prisInklMoms100 }) => (
                <tr key={land.kode} className="border-b last:border-b-0">
                  <th scope="row" className="text-left font-normal py-1.5 pr-3">
                    {land.navn.da}
                    {land.ikkeEu ? " (ikke EU)" : ""}
                  </th>
                  <td className="py-1.5 pr-3">{procentDa(land.standard)} %</td>
                  <td className="py-1.5 pr-3">
                    {land.reduceret === null ? "Ingen" : `${procentDa(land.reduceret)} %`}
                  </td>
                  <td className="py-1.5 pr-3">{krDa(prisInklMoms100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Danmark er det eneste land i tabellen helt uden reduceret sats. Sverige har 12 % på mad,
          restaurang og hotell og 6 % på bøger, kollektivtrafik og kultur, mens Norge har 15 % på
          fødevarer og 12 % på persontransport og indkvartering. Bøger, aviser og tidsskrifter er
          0 % i Danmark — det er en undtagelse fra momsloven, ikke en reduceret sats.
        </p>

        <h3>Moms i EU og ved handel med udlandet</h3>
        <p>
          Ved køb af varer fra udlandet gælder:
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
          <li><strong>Lägga på moms:</strong> Multiplicera beloppet med {EXCEL_FAKTOR_SE}. Exempel: {krSe(EK)} &times; {EXCEL_FAKTOR_SE} = {krSe(EK_MED.prisInklMoms)} inkl. moms</li>
          <li><strong>Räkna bort moms:</strong> Dividera beloppet med {EXCEL_FAKTOR_SE}. Exempel: {krSe(EK_BRUTTO)} &divide; {EXCEL_FAKTOR_SE} = {krSe(EK_FRA.prisUdenMoms)} exkl. moms</li>
          <li><strong>Hitta momsandelen:</strong> Multiplicera beloppet inkl. moms med {ANDEL_FAKTOR_SE}. Exempel: {krSe(EK_BRUTTO)} &times; {ANDEL_FAKTOR_SE} = {krSe(EK_FRA.momsBeloeb)} i moms</li>
        </ul>
        <p>
          Observera att momsandelen i ett pris <em>inklusive</em> 25% moms är {ANDEL_PCT_SE} (inte 25%), eftersom
          momsen beräknas på priset utan moms: 25 / 125 = {ANDEL_FAKTOR_SE}. För 12% moms är andelen ca {andelSe(12)} % och för
          6% moms ca {andelSe(6)} %.
        </p>

        <h3>Så räknar du ut moms baklänges</h3>
        <p>
          &ldquo;Baklänges&rdquo; är det du gör när du har prisen <em>med</em> moms och vill veta
          hur mycket det var <em>för</em> moms. Det är den enda regeln: <strong>dela med 1,25</strong>.
          De tre vanliga priserna ser ut så här:
        </p>
        <ul>
          {baklaengesEksempler().map((r) => (
            <li key={r.prisInklMoms}>
              <strong>{krSe(r.prisInklMoms)} inkl. moms</strong> &divide; 1,25 ={" "}
              <strong>{krSe(r.prisUdenMoms)} exkl. moms</strong> — och momsen var{" "}
              {krSe(r.momsBeloeb)}
            </li>
          ))}
        </ul>
        <p>
          <strong>Hittar du momsen direkt i priset:</strong> ta {ANDEL_PCT_SE} av beloppet. {krSe(EK_BRUTTO)} &times; {ANDEL_FAKTOR_SE}
          = <strong>{krSe(EK_FRA.momsBeloeb)} i moms</strong>. Det är den kortare vägen, men den kan ge ett runt tal,
          eftersom 499 &minus; 499 / 1,25 = {krSe(baklaengesEksempler()[1].momsBeloeb)} — alltså 100 kr
          om du tar 20 % av de 499 kr.
        </p>
        <table className="w-full text-left my-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Pris inkl. moms</th>
              <th className="py-2 pr-4">÷ 1,25 = exkl. moms</th>
              <th className="py-2 pr-4">Momsbelopp</th>
              <th className="py-2">Momsandelen</th>
            </tr>
          </thead>
          <tbody>
            {baklaengesTabel().map((r) => (
              <tr key={r.prisInklMoms} className="border-b">
                <td className="py-2 pr-4">{krSe(r.prisInklMoms)}</td>
                <td className="py-2 pr-4">{krSe(r.prisUdenMoms)}</td>
                <td className="py-2 pr-4">{krSe(r.momsBeloeb)}</td>
                <td className="py-2">20 %</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Och när du ska lägga på momsen igen:</strong> {krSe(EK)} exkl. &times; {EXCEL_FAKTOR_SE}
          = {krSe(EK_MED.prisInklMoms)} inkl. De två reglerna är varandras motsats, så talet kan alltid hittas tillbaka.
        </p>

        <h3>Moms i Excel</h3>
        <p>
          Har du en faktura- eller prislista är det snabbare att låta Excel räkna det. Svensk Excel
          har ingen inbyggd momsfunktion, så du skriver formeln själv:
        </p>
        <table className="w-full text-left my-6">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Formel</th>
              <th className="py-2 pr-4">Gör vad</th>
              <th className="py-2">Exempel</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1*{EXCEL_FAKTOR_SE}</code></td>
              <td className="py-2 pr-4">lägga till moms på ett belopp utan moms</td>
              <td className="py-2">{krSe(EK)} exkl. &rarr; {krSe(EK_MED.prisInklMoms)} inkl.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1/{EXCEL_FAKTOR_SE}</code></td>
              <td className="py-2 pr-4">belopp med moms, räknat baklänges</td>
              <td className="py-2">{krSe(EK_BRUTTO)} inkl. &rarr; {krSe(EK_FRA.prisUdenMoms)} exkl.</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1*{ANDEL_FAKTOR_SE}</code></td>
              <td className="py-2 pr-4">momsandelen i ett belopp inkl. moms</td>
              <td className="py-2">{krSe(EK_BRUTTO)} inkl. &rarr; {krSe(EK_FRA.momsBeloeb)} i moms</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-4"><code>=A1-A1/{EXCEL_FAKTOR_SE}</code></td>
              <td className="py-2 pr-4">momsen i ett belopp inkl. moms</td>
              <td className="py-2">{krSe(EK_BRUTTO)} inkl. &rarr; {krSe(EK_FRA.momsBeloeb)} i moms</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Passa när du kopierar:</strong> i svensk Excel använder formler <em>semikolon</em>{" "}
          som tecken mellan argumenten — i engelsk Excel är det komma. Om formeln står kvar som text
          måste cellen formateras som Tal.
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

        <h3>Momssatsen i EU:s medlemsländer</h3>
        <p>
          Momssatserna i EU varierar från {procentSe(satsUdenraekke.lavest.standard)} % (
          {satsUdenraekke.lavest.navn.se}) till {procentSe(satsUdenraekke.hoejest.standard)} % (
          {satsUdenraekke.hoejest.navn.se}). Sveriges 25 % ligger i den höga delen. Norge ingår inte
          i EU men finns med, eftersom det är det närmaste norska frågan och Norge har 25 % som
          normal sats.
        </p>
        <p>
          Kolonnen &ldquo;100 kr. exkl. moms&rdquo; visar vad 100 kr. utan moms kostar med moms i
          respektive land, räknat med landets egen sats. Den svenska raden är den som ditt eget
          köp går igenom: 100 kr. exkl. moms blir 125 kr. inkl. moms.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th scope="col" className="text-left py-2 pr-3">Land</th>
                <th scope="col" className="text-left py-2 pr-3">Standard</th>
                <th scope="col" className="text-left py-2 pr-3">Reducerad</th>
                <th scope="col" className="text-left py-2 pr-3">100 kr. exkl. moms</th>
              </tr>
            </thead>
            <tbody>
              {udenland.map(({ land, prisInklMoms100 }) => (
                <tr key={land.kode} className="border-b last:border-b-0">
                  <th scope="row" className="text-left font-normal py-1.5 pr-3">
                    {land.navn.se}
                    {land.ikkeEu ? " (inte EU)" : ""}
                  </th>
                  <td className="py-1.5 pr-3">{procentSe(land.standard)} %</td>
                  <td className="py-1.5 pr-3">
                    {land.reduceret === null ? "Ingen" : `${procentSe(land.reduceret)} %`}
                  </td>
                  <td className="py-1.5 pr-3">{krSeLang(prisInklMoms100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Danmark är det enda landet i tabellen helt utan reducerad sats. Sverige har 12 % på mat,
          restaurang och hotell och 6 % på böcker, kollektivtrafik och kultur, medan Norge har 15 %
          på livsmedel och 12 % på persontransport och boende. Böcker, tidningar och tidskrifter är
          0 % i Danmark — det är ett undantag från momslagen, inte en reducerad sats.
        </p>

        <h3>Moms i EU och vid handel med utlandet</h3>
        <p>
          Vid köp av varor från utlandet gäller:
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
