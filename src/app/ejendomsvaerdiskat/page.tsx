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
import {
  EKSEMPEL_TEKST,
  EJENDOMSVAERDISKAT,
  GRUNDSKYLD_KOMMUNER,
  kr,
  satsTilProcent,
  satsTilPromille,
} from "@/lib/ejendomsvaerdiskat";

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
        <aside className="mt-8 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold">Slå din egen adresse op</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            På <a href="https://minboligskat.dk/" className="underline">minboligskat.dk</a> henter vi den
            officielle foreløbige vurdering for din adresse og regner ejendomsværdiskat og grundskyld ud
            med din kommunes promille, pensionistnedslag og skatterabat.
          </p>
        </aside>
      )}

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
          <li>
            <strong>
              {satsTilPromille(EJENDOMSVAERDISKAT.lavSats * 1000)}&permil; ({satsTilProcent(EJENDOMSVAERDISKAT.lavSats)} %)
            </strong>{" "}
            af beskatningsgrundlaget op til progressionsgrænsen
          </li>
          <li>
            <strong>
              {satsTilPromille(EJENDOMSVAERDISKAT.hoejSats * 1000)}&permil; ({satsTilProcent(EJENDOMSVAERDISKAT.hoejSats)} %)
            </strong>{" "}
            af beskatningsgrundlaget over progressionsgrænsen
          </li>
        </ul>
        <p>
          <strong>Progressionsgrænsen</strong> er {kr(EJENDOMSVAERDISKAT.progressionsgraense)} kr for 2026-2027 (beskatningsgrundlag).
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
              <td>{satsTilPromille(GRUNDSKYLD_KOMMUNER.frederiksberg.promille)}&permil;</td>
            </tr>
            <tr>
              <td>København</td>
              <td>{satsTilPromille(GRUNDSKYLD_KOMMUNER.koebenhavn.promille)}&permil;</td>
            </tr>
            <tr>
              <td>Odense</td>
              <td>{satsTilPromille(GRUNDSKYLD_KOMMUNER.odense.promille)}&permil;</td>
            </tr>
            <tr>
              <td>Aarhus</td>
              <td>{satsTilPromille(GRUNDSKYLD_KOMMUNER.aarhus.promille)}&permil;</td>
            </tr>
            <tr>
              <td>Aalborg</td>
              <td>{satsTilPromille(GRUNDSKYLD_KOMMUNER.aalborg.promille)}&permil;</td>
            </tr>
            <tr>
              <td>Varde (højest)</td>
              <td>17,7&permil;</td>
            </tr>
          </tbody>
        </table>

        <h2>Eksempel: Beregning af ejendomsskat</h2>
        <p>
          {EKSEMPEL_TEKST.intro}
        </p>
        <ul>
          <li><strong>Ejendomsværdiskat:</strong> {EKSEMPEL_TEKST.ejendomsvaerdiskat}</li>
          <li><strong>Grundskyld:</strong> {EKSEMPEL_TEKST.grundskyld}</li>
          <li><strong>Samlet:</strong> {EKSEMPEL_TEKST.samlet}</li>
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
            Denne beregner bruger det nye ejendomsskattesystem fra 2024 med{" "}
            {satsTilPromille(EJENDOMSVAERDISKAT.lavSats * 1000)}&permil; /{" "}
            {satsTilPromille(EJENDOMSVAERDISKAT.hoejSats * 1000)}&permil; satser og
            80% forsigtighedsfradrag. Progressionsgrænse for 2026-2027:{" "}
            {kr(EJENDOMSVAERDISKAT.progressionsgraense)} kr. Kilde: skm.dk, info.skat.dk.
          </p>
        </div>

      </div>
      )}

      <section className="mt-12">
        <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om ejendomsskat" />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/ejendomsvaerdiskat" />
      </section>
    </div>
  );
}
