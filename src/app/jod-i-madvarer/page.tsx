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
  JODVARER,
  JOD_AI_UG,
  JOD_ANBEFALING_UG,
  JOD_AR_UG,
  JOD_KILDE,
  JOD_UL_UG,
  andelAfAnbefaling,
  gramForAnbefaling,
  jod100g,
  jodIgram,
  jodTal,
  rangliste,
  vareMedNavn,
} from "@/lib/jod-i-madvarer";

export async function generateMetadata() {
  return generatePageMetadata("jod-i-madvarer");
}

/**
 * En almindelig dansk dag sat sammen af tabellens egne tal. Summen læses af
 * `jodIgram`, så teksten og tabellen ikke kan stå med forskellige tal
 * (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Torsk, atlantic, rå", gram: 150 },
  { navn: "Mælk, letmælk", gram: 250 },
  { navn: "Æg, helt", gram: 60 },
  { navn: "Feta, helmælk", gram: 30 },
].map(({ navn, gram }) => ({ vare: vareMedNavn(navn)!, gram }));

export default async function JodIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("jod-i-madvarer", domainConfig.locale) ||
    getPageData("jod-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel, så teksten, tabellerne og
  // FAQ'en ikke kan glide fra hinanden.
  const top = rangliste().filter((v) => v.jod100g > 0).slice(0, 10);
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + jodIgram(vare, gram),
    0
  );
  const salt = vareMedNavn("Joderet salt")!;
  const torsk = vareMedNavn("Torsk, atlantic, rå")!;
  const antalMedJod = JODVARER.filter((v) => v.jod100g > 0).length;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/jod-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/jod-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hvor meget jod er der i mælk, ost og fisk?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageData.description}
          </p>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Anbefalingen for voksne: {jodTal(JOD_AI_UG, 0)} µg om dagen
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Voksne kvinder og mænd (AI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {jodTal(JOD_AI_UG, 0)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Gennemsnitsbehov (AR)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {jodTal(JOD_AR_UG, 0)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Øvre sikkerhedsgrænse (UL)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {jodTal(JOD_UL_UG, 0)} µg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Graviditet og amning (WHO)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {jodTal(250, 0)} µg
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Tallene er Nordic Nutrition Recommendations 2023&apos;s egne for
            voksne. NNR2023 sætter ikke en særskilt anbefaling for gravide og
            ammende, hvorimod WHO anbefaler {jodTal(250, 0)} µg om dagen i
            graviditet og amning.
          </p>
        </section>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Hvor meget jod er der i mad?</h2>
          <p>
            Jod kommer i praksis fra fem steder: joderet salt, fisk og
            skaldyr, æg, mælk og mejeriprodukter samt brød. Af de{" "}
            {JODVARER.length} madvarer nedenfor har {antalMedJod} målbart
            jod. Alle værdier er pr. 100 g, og andelen viser, hvor meget
            portionen dækker af voksnes anbefaling på{" "}
            {jodTal(JOD_AI_UG, 0)} µg:
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
                    Andel af {jodTal(JOD_ANBEFALING_UG, 0)} µg
                  </th>
                </tr>
              </thead>
              <tbody>
                {JODVARER.map((vare) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {jodTal(jod100g(vare))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {jodTal(vare.portionGram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {jodTal(jodIgram(vare, vare.portionGram))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vare.jod100g > 0 ? `${jodTal(andelAfAnbefaling(vare), 0)} %` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Værdierne pr. 100 g er fra {JOD_KILDE.database}, datasættet{" "}
            {JOD_KILDE.dataset}, udgaven {JOD_KILDE.udgave}, næringsstof{" "}
            {JOD_KILDE.naeringsstof}. Portionsstørrelserne er almindelige
            danske serveringer valgt af os, ikke noget kilden opgiver.
          </p>

          <h2>Salt, fisk og mælk: de tre jodkilder</h2>
          <p>
            Joderet salt er den mest koncentrerede kilde på tabellen:{" "}
            {jodTal(jod100g(salt))} µg pr. 100 g, så en teskefuld på{" "}
            {jodTal(salt.portionGram, 0)} g giver{" "}
            {jodTal(jodIgram(salt, salt.portionGram))} µg — mere end dobbelt så
            meget som anbefalingen. Derfor skal man ikke spise rigeligt med
            joderet salt og samtidig tage jodtilskud. I Danmark er
            almindeligt bordsalt typisk joderet, og det fremgår af mærkningen.
          </p>
          <p>
            Af de almindelige fødevarer er fisk den bedste: torsk har{" "}
            {jodTal(jod100g(torsk))} µg pr. 100 g, så en portion på{" "}
            {jodTal(150, 0)} g dækker{" "}
            {jodTal(andelAfAnbefaling(torsk, 150), 0)} % af dagsbehovet — alene,
            uden mælk og æg. Skal du have {jodTal(JOD_ANBEFALING_UG, 0)} µg fra
            almindelige madvarer, skal du bruge{" "}
            {jodTal(gramForAnbefaling(torsk), 0)} g torsk,{" "}
            {jodTal(gramForAnbefaling(vareMedNavn("Mælk, letmælk")!), 0)} g
            mælk eller {jodTal(gramForAnbefaling(vareMedNavn("Feta, helmælk")!), 0)}{" "}
            g feta. Ost og yoghurt ligger et sted imellem: smør giver slet
            intet, og piskefløde kun lidt, fordi jod sidder i den vandige del
            af mælken — ikke i fedtet.
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
                    Gram for {jodTal(JOD_ANBEFALING_UG, 0)} µg
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
                      {jodTal(jod100g(vare))} µg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {jodTal(gramForAnbefaling(vare), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan dækker en almindelig dag behovet</h2>
          <p>
            Her er en typisk dag med køkkenet sat sammen af tabellens egne tal
            — {jodTal(150, 0)} g torsk, en halv liter letmælk, to æg og lidt
            feta:
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
                    Jod
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
                      {jodTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {jodTal(jodIgram(vare, gram))} µg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{jodTal(dagsTotal)} µg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er {jodTal(dagsTotal)} µg, altså over voksnes anbefalede
            dagsindtag — men godt under den øvre sikkerhedsgrænse på{" "}
            {jodTal(JOD_UL_UG, 0)} µg, som beregnet fra mad alene næsten ingen
            når. NNR2023 skriver, at det gennemsnitlige indtag i de nordiske
            lande ligger på 30–270 µg om dagen, og at forskellen mellem landene
            hænger sammen med, hvor meget joderet salt og mejeri der er i
            kosten.
          </p>
          <p>
            Har du en vegansk kost, er jod den næring, det er sværest at dække
            uden tilskud: planter indeholder næsten ingen jod, og mælk, æg og
            fisk er netop de tre grupper, kosten mangler. Frugt, baljplanter
            og sollys hjælper ikke på jodbalancen. Vil du se resten af
            kosten, kan du starte i{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>{" "}
            og slå op i{" "}
            <Link href="/jern-i-madvarer" className="underline font-medium">
              jern i madvarer
            </Link>
            ,{" "}
            <Link href="/zink-i-madvarer" className="underline font-medium">
              zink i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/vitamin-b12" className="underline font-medium">
              B12-vitamin
            </Link>
            , som også er typiske mangelnæringer i en plantebaseret kost.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Madindholdet er amerikanske målinger fra{" "}
              {JOD_KILDE.database}, datasættet {JOD_KILDE.dataset}, udgaven{" "}
              {JOD_KILDE.udgave}, pr. 100 g. Jodindholdet i mælk og æg er
              markant højere i USA end i Danmark, fordi amerikanske
              malkeanlæg og foderstofkæden behandles med jodholdige
              desinfektionsmidler — brug derfor tallene som overslag og ikke
              som måltal. Anbefalingerne er Nordic Nutrition Recommendations
              2023&apos;s for voksne og siger ikke noget om, hvad du personligt
              skal tage; spørg din læge, før du tager daglige doser over
              anbefalingen, især hvis du spiser tang eller skaldyr.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om jod" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/jod-i-madvarer" />
        </section>
      </div>

      <Sidebar currentHref="/jod-i-madvarer" adSlotId="jod-i-madvarer-sidebar" />
    </div>
  );
}
