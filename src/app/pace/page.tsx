import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import PaceBeregner from "@/components/PaceBeregner";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import { formatNumber } from "@/lib/format";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import type { Locale } from "@/lib/i18n";
import { beregnPace, beregnTriatlon, formaterLobetid, triatlonBenNaevn } from "@/lib/pace";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";
import { formatSekunder } from "@/lib/tidsberegner";

/**
 * Alle tal i brødteksten dannes af de samme funktioner som værktøjet, så
 * siden ikke kan modsige beregneren. 5 km på 25 minutter og en halvmaraton
 * på 1:45 er de samme to eksempler som /tidsberegners egen tempo-FAQ bruger.
 */
const EKS = beregnPace("tid", 5, 25 * 60, 0)!;
const HALV = beregnPace("tid", 21.0975, 105 * 60, 0)!;
/** De tre ben og deres tempo — samme `beregnPace` som værktøjet bruger. */
const TRIATLON = beregnTriatlon();

/**
 * Sideteksten findes på alle tre domæner, så den norske side ikke arver
 * danske overskrifter. Samme fejlklasse som den svenske dagpenge-linje blev
 * rettet for 2/10.
 */
const TRIATLON_TEKST: Record<Locale, {
  h2: string;
  indledning: string;
  benKolonne: string;
  distanceKolonne: string;
  tidKolonne: string;
  tempoKolonne: string;
  total: string;
  taltOgTreBen: string;
  note: string;
}> = {
  da: {
    h2: "Triatlon og Ironman: tiden for alle tre ben",
    indledning:
      "Et Ironman har tre ben: 3,8 km svømning, 180 km cykel og 42,195 km løb. Hvert ben har sin egen fart, så tempoet pr. kilometer bliver helt forskelligt — men regnestykket er det samme som løbens.",
    benKolonne: "Ben",
    distanceKolonne: "Distance",
    tidKolonne: "Tid i eksemplet",
    tempoKolonne: "Tempo pr. km",
    total: "I alt",
    taltOgTreBen: "tre ben",
    note:
      "Tiderne i tabellen er vores eget eksempel, ikke en påstand om hvad netop du har brug for. Læg dem ind i værktøjet ovenfor, så får du holdtiderne for løbbenet og kan se, hvad tempoet bliver.",
  },
  se: {
    h2: "Triathlon och Ironman: tiden för alla tre ben",
    indledning:
      "Ett Ironman har tre ben: 3,8 km simning, 180 km cykel och 42,195 km löpning. Varje ben har sin egen fart, så tempot per kilometer blir helt olika — men regnestycket är detsamma som för löpningen.",
    benKolonne: "Ben",
    distanceKolonne: "Distans",
    tidKolonne: "Tid i exemplet",
    tempoKolonne: "Pace per km",
    total: "Totalt",
    taltOgTreBen: "tre ben",
    note:
      "Tiderna i tabellen är vårt eget exempel, inte ett påstående om vad just du behöver. Lägg in dem i verktyget ovan så får du deltiderna för löpbenet och ser vilket pace det blir.",
  },
  no: {
    h2: "Triatlon og Ironman: tiden for alle tre etapper",
    indledning:
      "Et Ironman har tre etapper: 3,8 km svømming, 180 km sykkel og 42,195 km løping. Hver etappe har sin egen fart, så farten per kilometer blir helt forskjellig — men regnestykket er det samme som for løping.",
    benKolonne: "Etappe",
    distanceKolonne: "Distanse",
    tidKolonne: "Tid i eksemplet",
    tempoKolonne: "Fart per km",
    total: "Til sammen",
    taltOgTreBen: "tre etapper",
    note:
      "Tidene i tabellen er eksemplet vårt, ikke et påstand om hva nettopp du trenger. Legg dem inn i verktøyet ovenfor, så får du deltidene for løpingen og ser hvilken fart det blir.",
  },
};

export async function generateMetadata() {
  return generatePageMetadata("pace");
}

export default async function PacePage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("pace", locale) || getPageData("pace", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/pace`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/pace" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <PaceBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan beregner du tempo på en distance</h2>
            <p>
              Tempo er den gennemsnitlige tid pr. kilometer. Den fås ved at <strong>dele løbetiden med distancen</strong>.
              5 km på 25 minutter er {formaterLobetid(EKS.totalSek)}, og det giver {formatSekunder(EKS.sekunderPerKm)} pr.
              kilometer. Det er hele regnestykket — der er ingen anden formel inde i vejen.
            </p>

            <h3>Den anden vej: løbetid ud fra tempo</h3>
            <p>
              Skal du finde ud af, hvor langt du når på en time, er regnestykket det modsatte:{" "}
              <strong>tid = distance × tempo</strong>. 5 km ved {formatSekunder(EKS.sekunderPerKm)} pr. kilometer er 5 × 5
              = 25 minutter. Vælg derfor «Tempo fra løbetid», når du kender tiden, og «Løbetid fra tempo», når du kender
              tempoet.
            </p>

            <h3>Holdtider pr. kilometer</h3>
            <p>
              En løbetid på {formaterLobetid(HALV.totalSek)} over en halvmaraton på 21,0975 km svarer til{" "}
              {formatSekunder(HALV.sekunderPerKm)} pr. kilometer. Værktøjet viser holdtiderne for hver kilometer, og de
              summerer til præcis den samme løbetid som resultatet — sidste kilometer bærer den afrunding, der ellers
              ville hoppe én sekund for hver kilometer.
            </p>

            <h3>De to løbedistancer bruger flest spørgsmål</h3>
            <p>
              Tidsberegneren kan også regne klokkeslæt og timer imellem hinanden, hvis du skal finde ud af, hvornår du
              skal gå hjem for at nå en given sluttid. Vil du i stedet se gennemsnitsfarten i km/t, er det{" "}
              <a href="/fart">fartberegneren</a>.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Så beräknar du pace på en sträcka</h2>
            <p>
              Pace är den genomsnittliga tiden per kilometer. Den fås genom att{" "}
              <strong>dela löptiden med sträckan</strong>. 5 km på 25 minuter är {formaterLobetid(EKS.totalSek)}, vilket ger{" "}
              {formatSekunder(EKS.sekunderPerKm)} per kilometer.
            </p>

            <h3>Åt andra vägen: löptid ut från pace</h3>
            <p>
              Vill du veta hur långt du hinner på en timme är regnestycket omvänt:{" "}
              <strong>tid = sträcka × pace</strong>. 5 km med {formatSekunder(EKS.sekunderPerKm)} per kilometer är 5 × 5 = 25
              minuter.
            </p>

            <h3>Deltider per kilometer</h3>
            <p>
              En löptid på {formaterLobetid(HALV.totalSek)} över en halvmaraton på 21,0975 km motsvarar{" "}
              {formatSekunder(HALV.sekunderPerKm)} per kilometer. Verktyget visar deltiderna för varje kilometer, och de
              summerar till exakt samma löptid som resultatet.
            </p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{TRIATLON_TEKST[locale].h2}</h2>
          <p>{TRIATLON_TEKST[locale].indledning}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 pr-3 font-semibold">{TRIATLON_TEKST[locale].benKolonne}</th>
                  <th className="text-right py-2 px-3 font-semibold">{TRIATLON_TEKST[locale].distanceKolonne}</th>
                  <th className="text-right py-2 px-3 font-semibold">{TRIATLON_TEKST[locale].tidKolonne}</th>
                  <th className="text-right py-2 pl-3 font-semibold">{TRIATLON_TEKST[locale].tempoKolonne}</th>
                </tr>
              </thead>
              <tbody>
                {TRIATLON.ben.map((rad) => (
                  <tr key={rad.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-3">{triatlonBenNaevn(rad.id, locale)}</td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {formatNumber(rad.distanceKm, locale, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} km
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{formaterLobetid(rad.totalSek)}</td>
                    <td className="py-2 pl-3 text-right tabular-nums">{formaterLobetid(rad.sekunderPerKm)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 pr-3 font-semibold">{TRIATLON_TEKST[locale].total}</td>
                  <td className="py-2 px-3 text-right font-semibold tabular-nums">
                    {formatNumber(TRIATLON.totalKm, locale, { minimumFractionDigits: 0, maximumFractionDigits: 3 })} km
                  </td>
                  <td className="py-2 px-3 text-right font-semibold tabular-nums">{formaterLobetid(TRIATLON.totalSek)}</td>
                  <td className="py-2 pl-3 text-right text-gray-500 dark:text-gray-400">
                    {TRIATLON_TEKST[locale].taltOgTreBen}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>{TRIATLON_TEKST[locale].note}</p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/pace" />
      </div>
      <Sidebar currentHref="/pace" adSlotId="pace-sidebar" />
    </div>
  );
}