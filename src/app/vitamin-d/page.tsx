import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  VITAMIN_D_ANBEFALING_UG,
  VITAMIN_D_AR_UG,
  VITAMIN_D_RI_75_PLUS_UG,
  VITAMIN_D_RI_UG,
  VITAMIN_D_RI_UDEN_SOL_UG,
  VITAMIN_D_UL_UG,
  VITAMIN_D_KILDE,
  VITAMIN_D_VARER,
  andelAfAnbefaling,
  d100g,
  dIgram,
  gramForAnbefaling,
  rangliste,
  vareMedNavn,
  vitaminDTal,
} from "@/lib/vitamin-d";

export async function generateMetadata() {
  return generatePageMetadata("vitamin-d");
}

/**
 * Et almindeligt dagsindtag sat sammen af tabellens egne tal. Summen læses af
 * `dIgram`, så teksten og tabellen ikke kan stå med forskellige tal (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Makrel, atlantic, rå", gram: 125 },
  { navn: "Mælk, sødmælk, m. tilsat D-vitamin", gram: 500 },
  { navn: "Æg, helt, råt", gram: 120 },
].map(({ navn, gram }) => ({ vare: vareMedNavn(navn)!, gram }));

export default async function VitaminDPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("vitamin-d", domainConfig.locale) ||
    getPageData("vitamin-d", "da")!;

  // Alle tal på siden læses fra den samme tabel, så teksten, tabellerne og
  // FAQ'en ikke kan glide fra hinanden.
  const top = rangliste().filter((v) => v.d100g > 0).slice(0, 8);
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + dIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/vitamin-d`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/vitamin-d" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hvor meget D-vitamin skal du have om dagen?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageData.description}
          </p>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Anbefalingen for voksne: {vitaminDTal(VITAMIN_D_RI_UG, 0)} µg om dagen
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Voksne kvinder og mænd (RI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminDTal(VITAMIN_D_RI_UG, 0)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Over 75 år (RI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminDTal(VITAMIN_D_RI_75_PLUS_UG, 0)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Lidt eller ingen sol (RI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminDTal(VITAMIN_D_RI_UDEN_SOL_UG, 0)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Gennemsnitsbehov (AR)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminDTal(VITAMIN_D_AR_UG)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Øvre sikkerhedsgrænse (UL)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminDTal(VITAMIN_D_UL_UG, 0)} µg
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Tallene er Nordic Nutrition Recommendations 2023&apos;s egne for
            voksne. {vitaminDTal(VITAMIN_D_RI_UG, 0)} µg svarer til 400
            internationale enheder (IE), som tilskud ofte er angivet i.
          </p>
        </section>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Hvor meget D-vitamin er der i mad?</h2>
          <p>
            D-vitamin findes kun i få fødevarer. Af de {VITAMIN_D_VARER.length}{" "}
            kilder nedenfor er det fed fisk, æggeblomme og beriget mælk, der
            rent faktisk tæller — de øvrige madvarer på køleskabet indeholder
            ingen eller ingen nævneværdige mængder. Alle værdier er pr. 100 g,
            og andelen viser, hvor meget portionen dækker af voksnes anbefaling
            på {vitaminDTal(VITAMIN_D_RI_UG, 0)} µg:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Portion
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    I portionen
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Andel af {vitaminDTal(VITAMIN_D_ANBEFALING_UG, 0)} µg
                  </th>
                </tr>
              </thead>
              <tbody>
                {VITAMIN_D_VARER.map((vare) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {vitaminDTal(d100g(vare))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vitaminDTal(vare.portionGram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {vitaminDTal(dIgram(vare, vare.portionGram))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {d100g(vare) > 0 ? `${vitaminDTal(andelAfAnbefaling(vare), 0)} %` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Værdierne pr. 100 g er fra {VITAMIN_D_KILDE.database}, datasættet{" "}
            {VITAMIN_D_KILDE.dataset}, udgaven {VITAMIN_D_KILDE.udgave}.
            Portionsstørrelserne er almindelige danske serveringer valgt af os,
            ikke noget kilden opgiver.
          </p>

          <h2>De største kilder pr. 100 g</h2>
          <p>
            Makrel er den almindelige fisk med mest D-vitamin:{" "}
            {vitaminDTal(d100g(vareMedNavn("Makrel, atlantic, rå")!))} µg pr.
            100 g, så en portion på {vitaminDTal(125, 0)} g dækker hele{" "}
            {vitaminDTal(andelAfAnbefaling(vareMedNavn("Makrel, atlantic, rå")!), 0)} %
            af dagsbehovet. En teskefuld torskeleverolie på {vitaminDTal(5, 0)}{" "}
            g giver {vitaminDTal(dIgram(vareMedNavn("Torskeleverolie")!, 5))} µg —
            det er den mest koncentrerede kilde på tabellen, men den spises i
            teskeer. Skal du have {vitaminDTal(VITAMIN_D_ANBEFALING_UG, 0)} µg fra
            almindelige madvarer, skal du bruge{" "}
            {vitaminDTal(gramForAnbefaling(vareMedNavn("Torsk, atlantic, rå")!), 0)}{" "}
            g torsk, {vitaminDTal(gramForAnbefaling(vareMedNavn("Mælk, sødmælk, m. tilsat D-vitamin")!), 0)}{" "}
            g beriget mælk eller {vitaminDTal(gramForAnbefaling(vareMedNavn("Æg, helt, råt")!), 0)}{" "}
            g æg.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Pr. 100 g
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Gram for {vitaminDTal(VITAMIN_D_ANBEFALING_UG, 0)} µg
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.map((vare) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {vitaminDTal(d100g(vare))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vitaminDTal(gramForAnbefaling(vare), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan dækker kosterne en hel dag</h2>
          <p>
            Her er en almindelig dag sat sammen af tabellens egne tal —{" "}
            {vitaminDTal(125, 0)} g makrel, et halvt liter beriget mælk og to æg:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th scope="col" className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400">
                    Madvare
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    Mængde
                  </th>
                  <th scope="col" className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums">
                    D-vitamin
                  </th>
                </tr>
              </thead>
              <tbody>
                {DAGS_EKSEMPEL.map(({ vare, gram }) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {vitaminDTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {vitaminDTal(dIgram(vare, gram))} µg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{vitaminDTal(dagsTotal)} µg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er {vitaminDTal(dagsTotal)} µg — altså over voksnes anbefalede
            dagsindtag. NNR2023 skriver, at den gennemsnitlige kost i de
            nordiske lande giver 4,3–13 µg om dagen, før tilskud, fordi
            berigelsen af mælkeprodukter er forskellig fra land til land. Om
            sommeren laver huden D-vitamin af sollys, og det sidste stykke af
            anbefalingen regnes typisk ind på den måde.
          </p>

          <p>
            Vil du se den spiselige dels energi og de andre næringsstoffer, kan
            du bruge{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>{" "}
            eller læg dem sammen med{" "}
            <Link href="/protein-i-madvarer" className="underline font-medium">
              protein i madvarer
            </Link>
            ,{" "}
            <Link href="/fedt-i-madvarer" className="underline font-medium">
              fedt i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/salt-i-madvarer" className="underline font-medium">
              salt i madvarer
            </Link>
            . Læs også{" "}
            <Link href="/blog/hvor-mange-kalorier-skal-jeg-have" className="underline font-medium">
              guiden om kaloriebehov
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Madindholdet er gennemsnit fra {VITAMIN_D_KILDE.database},
              datasættet {VITAMIN_D_KILDE.dataset}, udgaven{" "}
              {VITAMIN_D_KILDE.udgave}, pr. 100 g. Danske mælkeprodukter er
              beriget, men hvor meget varierer mellem produkterne — tjek
              mærkningen. Anbefalingerne er Nordic Nutrition Recommendations
              2023&apos;s for voksne og siger ikke noget om, hvad du personligt
              skal tage; spørg din læge, før du tager daglige doser over
              anbefalingen.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om D-vitamin" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/vitamin-d" />
        </section>
      </div>

      <Sidebar currentHref="/vitamin-d" adSlotId="vitamin-d-sidebar" />
    </div>
  );
}
