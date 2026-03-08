import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import EjendomsvaerdiskatBeregner from "@/components/EjendomsvaerdiskatBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("ejendomsvaerdiskat");
}

export default async function EjendomsvaerdiskatPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("ejendomsvaerdiskat", locale) || getPageData("ejendomsvaerdiskat", "da")!;

  return (
    <div>
      <FAQSchema items={pageData.faqItems} />
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/ejendomsvaerdiskat`}
        category={pageData.schemaCategory}
      />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/ejendomsvaerdiskat" }]} />
      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {pageData.description}
      </p>

      <EjendomsvaerdiskatBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Det nye boligskattesystem (fra 2024)</h2>
        <p>
          Fra <strong>1. januar 2024</strong> trådte et <strong>nyt boligskattesystem</strong> i kraft i Danmark.
          Ejendomsskatten består fortsat af to dele — <strong>ejendomsværdiskat</strong> og <strong>grundskyld</strong> —
          men begge beregnes nu på nye måder med <strong>nye satser</strong>.
        </p>

        <h3>Ejendomsværdiskat</h3>
        <p>
          Ejendomsværdiskatten beregnes af <strong>80% af ejendomsværdien</strong>
          {" "}(et såkaldt forsigtighedsfradrag på 20%). Satserne er:
        </p>
        <ul>
          <li><strong>5,1&permil; (0,51%)</strong> af beskatningsgrundlaget op til progressionsgrænsen</li>
          <li><strong>14&permil; (1,4%)</strong> af beskatningsgrundlaget over progressionsgrænsen</li>
        </ul>
        <p>
          <strong>Progressionsgrænsen</strong> er 9.007.000 kr for 2026-2027 (beskatningsgrundlag).
          Det svarer til en ejendomsværdi på ca. 11,3 mio. kr før forsigtighedsfradraget.
        </p>

        <h3>Grundskyld</h3>
        <p>
          Grundskylden beregnes som kommunens grundskyldspromille ganget med <strong>80%
          af grundværdien</strong> (samme forsigtighedsfradrag som ejendomsværdiskatten).
          Grundskyldspromillen varierer fra kommune til kommune:
        </p>
        <table>
          <thead>
            <tr>
              <th>Kommune</th>
              <th>Grundskyldspromille (&permil;)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Frederiksberg (lavest)</td>
              <td>3,1&permil;</td>
            </tr>
            <tr>
              <td>København</td>
              <td>5,1&permil;</td>
            </tr>
            <tr>
              <td>Odense</td>
              <td>5,7&permil;</td>
            </tr>
            <tr>
              <td>Aarhus</td>
              <td>6,0&permil;</td>
            </tr>
            <tr>
              <td>Aalborg</td>
              <td>7,4&permil;</td>
            </tr>
            <tr>
              <td>Varde (højest)</td>
              <td>17,7&permil;</td>
            </tr>
          </tbody>
        </table>

        <h2>Eksempel: Beregning af ejendomsskat</h2>
        <p>
          En bolig i København med ejendomsværdi 3.000.000 kr og grundværdi 1.000.000 kr:
        </p>
        <ul>
          <li><strong>Ejendomsværdiskat:</strong> 3.000.000 × 80% × 5,1&permil; = 12.240 kr/år</li>
          <li><strong>Grundskyld:</strong> 1.000.000 × 80% × 5,1&permil; = 4.080 kr/år</li>
          <li><strong>Samlet:</strong> 16.320 kr/år (1.360 kr/måned)</li>
        </ul>

        <h2>Forsigtighedsfradraget (20%)</h2>
        <p>
          De nye ejendomsvurderinger er forbundet med en vis <strong>usikkerhed</strong>. Derfor er der
          indført et <strong>forsigtighedsfradrag på 20%</strong>, så du kun betaler skat af <strong>80% af den
          vurderede værdi</strong>. Fradraget gælder for både <strong>ejendomsværdiskat</strong> og <strong>grundskyld</strong>.
        </p>

        <h2>Overgangsordning</h2>
        <p>
          For at beskytte boligejere mod <strong>pludselige skattestigninger</strong> er der indført en
          <strong>overgangsordning</strong> (skatterabat). Hvis din skat stiger med det nye system,
          indfases stigningen <strong>gradvist</strong>. Beregneren viser den fulde skat uden
          overgangsrabat.
        </p>

        <h2>Hvornår betales ejendomsskat?</h2>
        <p>
          Ejendomsskatten betales via din <strong>ejendomsskattebillet</strong>, som du modtager fra
          din kommune. Betalingen sker typisk i <strong>to rater</strong> i <strong>marts og september</strong>.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med nyt boligskattesystem</p>
          <p className="text-green-700 dark:text-green-400">
            Denne beregner bruger det nye ejendomsskattesystem fra 2024 med
            5,1&permil; / 14&permil; satser og 80% forsigtighedsfradrag. Progressionsgrænse
            for 2026-2027: 9.007.000 kr. Kilde: skm.dk, info.skat.dk.
          </p>
        </div>

      </div>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Ofte stillede spørgsmål om ejendomsskat
        </h2>
        <FAQ items={pageData.faqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/ejendomsvaerdiskat" />
      </section>
    </div>
  );
}
