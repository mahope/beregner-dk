import BoligOpslag from "@/components/BoligOpslag";
import KvadratmeterBeregner from "@/components/KvadratmeterBeregner";
import ArealOmregner from "@/components/ArealOmregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import {
  kvadratmeterFacit,
  kvadratmeterOmregninger,
  kvadratmeterOmregningsFakta,
  kvadratmeterPrisAreal,
  kvadratmeterPrisBeloeb,
  kvadratmeterPrisPrM2,
  kvadratmeterUdtryk,
} from "@/lib/kvadratmeter-eksempler";
import {
  KVADRATALEN_I_M2,
  KVADRATALEN_PR_TONDE_LAND,
  TONDE_LAND_I_M2,
  omregnAreal,
} from "@/lib/areal-omregner";

export async function generateMetadata() {
  return generatePageMetadata("kvadratmeter");
}

export default async function KvadratmeterPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("kvadratmeter", locale) || getPageData("kvadratmeter", "da")!;
  const fakta = kvadratmeterOmregningsFakta(locale);

  // Gamle danske landmålingsenheder. Tallene læses fra `areal-omregner`, samme
  // modul som omregneren ovenfor bruger, så tabellen og værktøjet ikke kan
  // vise to forskellige svar. Kun på dansk: enhederne er danske, og den
  // svenske side har sine egne.
  const gammelNum = (vaerdi: number, decimaler: number) =>
    vaerdi.toLocaleString("da-DK", { maximumFractionDigits: decimaler });
  const tondeLandM2 = gammelNum(TONDE_LAND_I_M2, 2);
  const tondeLandHektar = gammelNum(omregnAreal(1, "tonder-land", "hektar"), 4);
  const kvadratalenM2 = gammelNum(KVADRATALEN_I_M2, 4);
  const hektarTonder = gammelNum(omregnAreal(1, "hektar", "tonder-land"), 2);
  const m2Kvadratalen = gammelNum(omregnAreal(1, "m2", "kvadratalen"), 3);

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/kvadratmeter`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/kvadratmeter" }]} />

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
        <KvadratmeterBeregner />
      </div>

      {/* BBR lookup: Danish register, Danish locale only */}
      {locale === "da" && <BoligOpslag />}

      {/* Omregning begge veje. Værktøjet ovenfor kun *viste* m², cm², hektar og
          kvadratfod for det areal man lige havde regnet, så «500 kvadratfod til
          m²» — første danske træffer under «kvadratfod», jf. autocomplete 6/10 —
          var umulig at løse på sitet. */}
      <ArealOmregner />

      {/* Teksten under værktøjet, så brødteksten og facit læser de samme tal. */}
      {(locale === "da" || locale === "se") && (
      <div className="prose max-w-none mb-8">
        <h2>{locale === "se" ? "Omvandla kvadratmeter till andra enheter" : "Omregn kvadratmeter til andre enheder"}</h2>
        <p>
          {locale === "se"
            ? `Omregningen bygger på exakta mått, inte avrundade. En fot är exakt ${fakta.fodMeter} m, så en kvadratfot är exakt ${fakta.kvadratfodM2} m², och en acre är de ${fakta.kvadratfodPrAcre} kvadratfoten i en acre = ${fakta.acreM2} m². Här är tre omregningar du kan kontrollera själv:`
            : `Omregningen bygger på eksakte mål, ikke avrundede. En fod er præcis ${fakta.fodMeter} m, så en kvadratfod er præcis ${fakta.kvadratfodM2} m², og en acre er de ${fakta.kvadratfodPrAcre} kvadratfod i en acre = ${fakta.acreM2} m². Her er tre omregninger, du kan efterprøve selv:`}
        </p>
        <ul>
          {kvadratmeterOmregninger(locale).map(({ foer, efter }) => (
            <li key={foer}>
              <strong>{foer}</strong> = <strong>{efter}</strong>
            </li>
          ))}
        </ul>
      </div>
      )}

      {/* Samma sak på svenska: "hur räknar man ut kvadratmeter" är svensk
          autocomplete (10 variationer under "räkna ut kvadratmeter", hvoraf
          vägg, golv, tak, cirkel och triangel själva formen), och
          beraknare.se/kvadratmeter låg på pos. 11,2 med 0,2 % CTR. */}
      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Så här räknar man ut kvadratmeter med siffror</h2>
        <p>
          Arean är alltid <strong>längd × bredd</strong> — det enda som ändras
          är vilken figur som ligger under. Samma fyra räkneexempel med siffror
          gäller för <strong>golv, vägg, tak, en cirkel och en triangel</strong>,
          så här kan du efterpröva dem:
        </p>
        <ul>
          <li>
            <strong>Rektangel</strong> (ett rum, en platta, ett golv): längd ×
            bredd. Ett rum på 5 m × 4 m är{" "}
            <strong>
              {kvadratmeterUdtryk("se").rektangel} = {kvadratmeterFacit("se").rektangel} m²
            </strong>
            .
          </li>
          <li>
            <strong>Cirkel</strong> (ett rundt bord, en brunn, en rund platta):
            3,14 × radie × radie. En cirkel med radien 3 m är{" "}
            <strong>
              {kvadratmeterUdtryk("se").cirkel} = {kvadratmeterFacit("se").cirkel} m²
            </strong>
            . Mäter du i diameter halverar du den först, så en diameter på 6 m är
            igen radien 3 m.
          </li>
          <li>
            <strong>Triangel</strong>: (grundlinje × höjd) / 2. En grundlinje på
            6 m med en höjd på 4 m är{" "}
            <strong>
              {kvadratmeterUdtryk("se").trekant} = {kvadratmeterFacit("se").trekant} m²
            </strong>
            . Den kan alltid delas i två rektanglar.
          </li>
          <li>
            <strong>Trapets</strong> (fyra sidor, där två är parallella): ((de två
            parallella sidorna) / 2) × höjd. Sidor på 4 m och 6 m med en höjd på
            3 m är{" "}
            <strong>
              {kvadratmeterUdtryk("se").trapez} = {kvadratmeterFacit("se").trapez} m²
            </strong>
            .
          </li>
        </ul>
        <p>
          Ska du köpa golv, plattor eller målning är det samma tal gånger med
          priset per m². Som exempel: {kvadratmeterPrisAreal("se")} till{" "}
          {kvadratmeterPrisPrM2("se", "kr/m²")} kostar{" "}
          <strong>{kvadratmeterPrisBeloeb("se")}</strong>, och så lägger du 5-10 %
          till för kapning och spill.
        </p>
      </div>
      )}

      {/* Metoden med tal: "hvordan regner man kvadratmeter ud" (359 visninger,
          pos. 3 i dansk GSC) er sitets fjerdestørste søgning, og værktøjet
          skrev kun formlerne symbolske ("Areal = Længde × Bredde").
          Begge sproggrene læser tallene fra `kvadratmeter-eksempler`, så den
          danske og den svenske blok ikke kan komme i forskæld. */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Sådan regner du kvadratmeter ud med tal</h2>
        <p>
          Arealet er altid <strong>længde × bredde</strong> — det eneste, der
          ændrer sig, er hvilken figur der ligger under. Her er de fire
          regneeksempler med tal, du kan efterprøve:
        </p>
        <ul>
          <li>
            <strong>Rektangel</strong> (et værelse, en flise, et gulv):{" "}
            længde × bredde. Et rum på 5 m × 4 m er{" "}
            <strong>{kvadratmeterUdtryk("da").rektangel} = {kvadratmeterFacit("da").rektangel} m²</strong>.
          </li>
          <li>
            <strong>Cirkel</strong> (en rund tabel, en brønd, en rund flise):
            3,14 × radius × radius. En cirkel med radius 3 m er{" "}
            <strong>{kvadratmeterUdtryk("da").cirkel} = {kvadratmeterFacit("da").cirkel} m²</strong>.
            Måler du i diameter skal du halvere den først, så en diameter på 6 m
            er igen radius 3 m.
          </li>
          <li>
            <strong>Trekant</strong>: (grundlinje × højd) / 2. En grundlinje på
            6 m med en højde på 4 m er{" "}
            <strong>{kvadratmeterUdtryk("da").trekant} = {kvadratmeterFacit("da").trekant} m²</strong>.
            Den kan altid deles i to rektangler.
          </li>
          <li>
            <strong>Trapez</strong> (fire sider, hvor to er parallelle): ((de to
            parallelle sider) / 2) × højde. Sider på 4 m og 6 m med en højde på
            3 m er{" "}
            <strong>{kvadratmeterUdtryk("da").trapez} = {kvadratmeterFacit("da").trapez} m²</strong>.
          </li>
        </ul>
        <p>
          Skal du købe gulv, fliser eller maling, er det samme tal ganget med
          prisen pr. m². {kvadratmeterPrisAreal("da")} til{" "}
          {kvadratmeterPrisPrM2("da")} er{" "}
          <strong>{kvadratmeterPrisBeloeb("da")}</strong>, og så lægger du 5-10 %
          til for tilskæring og spild.
        </p>
      </div>
      )}

      {/* Gamle danske arealenheder. Dansk autocomplete 9/10: «tønder land til
          hektar», «tønder land til m2», «hektar til tønder» og «kvadratalen
          til kvadratmeter». Enhederne blev afskaffet i 1907, men står stadig i
          ældre skøder og matrikelkort, og sitet havde dem slet ikke. */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Hvor meget er en tønde land og en kvadratalen?</h2>
        <p>
          Ældre skøder og matrikelkort opgiver grundens størrelse i enheder, der
          blev afskaffet, da Danmark gik over til metersystemet i 1907. En{" "}
          <strong>tønde land</strong> var oprindeligt det areal, man kunne tilså
          med en tønde korn, og en <strong>kvadratalen</strong> er én alen i
          anden. Omregneren ovenfor kan regne dem, og de faste tal er disse:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Gammel enhed</th>
                <th>Svarer til</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1 tønde land</td>
                <td>{tondeLandM2} m² ({tondeLandHektar} hektar)</td>
              </tr>
              <tr>
                <td>1 kvadratalen</td>
                <td>{kvadratalenM2} m²</td>
              </tr>
              <tr>
                <td>1 hektar</td>
                <td>{hektarTonder} tønde land</td>
              </tr>
              <tr>
                <td>1 m²</td>
                <td>{m2Kvadratalen} kvadratalen</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Tallene er regnet fra alen: den danske alen er to fod, og loven af 4.
          maj 1907 fastsætter foden til 0,3138535 m, så én alen er 0,627707 m og
          én kvadratalen {kvadratalenM2} m². En tønde land er{" "}
          {gammelNum(KVADRATALEN_PR_TONDE_LAND, 0)} kvadratalen, altså{" "}
          {tondeLandM2} m². Kilde: Teknisk Kulturarvs metertabeller
          (1907-loven), Wikipedia «Tønde land» og jomark.dk (verificeret 9.
          oktober 2026).
        </p>
        <p>
          <strong>Brug tallet fra matriklen, ikke fra skødet.</strong> Er grunden
          blevet udstykket eller sammenlagt, siden skødet blev skrevet, er det
          gamle areal forældet. Til en byggesag eller en bebyggelsesprocent er
          det altid det nuværende areal i BBR og matriklen, der gælder — ikke
          tallet i tønder land.
        </p>
      </div>
      )}

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om arealberegning</h2>
        <p>
          Areal måles i <strong>kvadratmeter (m²)</strong> og angiver størrelsen af en flade.
          Det er vigtigt at kunne beregne areal ved mange lejligheder — fra <strong>gulvlægning</strong>
          og <strong>maling</strong> til køb af bolig.
        </p>

        <h3>Almindelige anvendelser</h3>
        <ul>
          <li><strong>Bolig:</strong> Beregn boligareal, værelsesstørrelser</li>
          <li><strong>Have:</strong> Planlæg græsplæne, terrasse, bede</li>
          <li><strong>Renovering:</strong> Beregn materialer til gulv, væg, loft</li>
          <li><strong>Ejendomshandel:</strong> Forstå grundstørrelse og BBR-areal</li>
        </ul>

        <h3>BBR-areal vs. boligareal</h3>
        <p>
          Ved <strong>boligkøb</strong> skelner man mellem:
        </p>
        <ul>
          <li><strong>Boligareal:</strong> De faktiske beboelige rum</li>
          <li><strong>BBR-areal:</strong> Det registrerede areal inkl. vægge</li>
          <li><strong>Grundareal:</strong> Hele grundens størrelse</li>
          <li><strong>Bebygget areal:</strong> Bygningens fodaftryk</li>
        </ul>
        <p>
          Med <strong>Slå din bolig op</strong> ovenfor kan du se boligens areal, grundareal, antal
          værelser og byggeår fra BBR og matriklen og sammenligne med dine egne mål.
        </p>

        <h3>Materialeberegning</h3>
        <p>
          Når du skal købe materialer, læg altid <strong>5-10% til for spild</strong>:
        </p>
        <ul>
          <li>Gulvbrædder: +10% for tilskæring</li>
          <li>Maling: Ca. 8-12 m² pr. liter (tjek produktets egen rækkevidde)</li>
          <li>Fliser: +5-10% for tilskæring og knækkede</li>
        </ul>
        <p>
          <strong>Beregn materialer</strong> ovenfor lægger spild på, tæller antallet af
          ens felter og regner hele købsarealet, liter eller ruller ud — og prisen,
          hvis du indtaster den. Værktøjet bruger 10% spild som standard, fordi det er
          det de danske gulvleverandører anbefaler. Kilde:{" "}
          <a href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/" rel="noreferrer nofollow noopener" target="_blank">
            hjemmeland.dk
          </a>{" "}
          (verificeret 25. september 2026). Malingens dækning står på produktets eget
          datablad og afhænger af underlag og kvalitet, så den kan overskrives i
          værktøjet.
        </p>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om ytberäkning</h2>
        <p>
          Yta mäts i <strong>kvadratmeter (m²)</strong> och anger storleken på en yta.
          Det är viktigt att kunna beräkna yta vid många tillfällen — från <strong>golvläggning</strong>
          och <strong>målning</strong> till bostadsköp.
        </p>

        <h3>Vanliga användningsområden</h3>
        <ul>
          <li><strong>Bostad:</strong> Beräkna boyta, rumsstorlekar</li>
          <li><strong>Trädgård:</strong> Planera gräsmatta, terrass, rabatter</li>
          <li><strong>Renovering:</strong> Beräkna material till golv, vägg, tak</li>
          <li><strong>Fastighetsaffär:</strong> Förstå tomtstorlek och boyta</li>
        </ul>

        <h3>Olika ytbegrepp</h3>
        <p>
          Vid <strong>bostadsköp</strong> skiljer man mellan:
        </p>
        <ul>
          <li><strong>Boyta:</strong> De faktiskt beboeliga rummen</li>
          <li><strong>Biyta:</strong> Utrymmen som inte räknas som boyta</li>
          <li><strong>Tomtyta:</strong> Hela tomtens storlek</li>
          <li><strong>Byggnadsyta:</strong> Byggnadens fotavtryck</li>
        </ul>

        <h3>Materialberäkning</h3>
        <p>
          När du ska köpa material, lägg alltid <strong>5-10% till för spill</strong>:
        </p>
        <ul>
          <li>Golvbrädor: +10% för kapning</li>
          <li>Färg: Ca 8-12 m² per liter (kontrollera produktens egen täckning)</li>
          <li>Kakel: +5-10% för kapning och trasiga plattor</li>
        </ul>
        <p>
          <strong>Beräkna material</strong> ovan lägger på spill, räknar antalet
          lika ytor och räknar ut hela köparean, litern eller rullarna — och
          priset om du anger det. Verktyget använder 10% spill som standard,
          vilket är det danska golvleverantörerna rekommenderar. Källa:{" "}
          <a href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/" rel="noreferrer nofollow noopener" target="_blank">
            hjemmeland.dk
          </a>{" "}
          (verifierad 25 september 2026).
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/kvadratmeter" />

      {/* Returlink til indlægget om emnet (kun danske domæner) */}
      <RelateredeArtikler current="/kvadratmeter" locale={locale} />
    </div>
  );
}
