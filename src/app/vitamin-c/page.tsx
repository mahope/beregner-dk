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
  VITAMIN_C_ANBEFALING_MG,
  VITAMIN_C_AR_KVINDE_MG,
  VITAMIN_C_AR_MAND_MG,
  VITAMIN_C_KILDE,
  VITAMIN_C_RI_KVINDE_MG,
  VITAMIN_C_RI_MAND_MG,
  VITAMIN_C_RYGENDE_EKSTRA_MG,
  VITAMIN_C_VARER,
  KARTOFFEL_KOGT_C_MG_100G,
  andelAfAnbefaling,
  c100g,
  cIgram,
  gramForAnbefaling,
  rangliste,
  vareMedNavn,
  vitaminCTal,
} from "@/lib/vitamin-c";

export async function generateMetadata() {
  return generatePageMetadata("vitamin-c");
}

/**
 * Et almindeligt dagsindtag sat sammen af tabellens egne tal. Summen læses af
 * `cIgram`, så teksten og tabellen ikke kan stå med forskellige tal (punkt 11).
 */
const DAGS_EKSEMPEL = [
  { navn: "Kartoffel, rå", gram: 200 },
  { navn: "Grønkål, rå", gram: 100 },
].map(({ navn, gram }) => ({ vare: vareMedNavn(navn)!, gram }));

export default async function VitaminCPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("vitamin-c", domainConfig.locale) ||
    getPageData("vitamin-c", "da")!;

  // Alle tal på siden læses fra den samme tabel, så teksten, tabellerne og
  // FAQ'en ikke kan glide fra hinanden.
  const kartoffel = vareMedNavn("Kartoffel, rå")!;
  const peberfrugt = vareMedNavn("Peberfrugt, rød, rå")!;
  const appelsin = vareMedNavn("Appelsin, rå")!;
  const top = rangliste().slice(0, 8);
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + cIgram(vare, gram),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/vitamin-c`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/vitamin-c" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hvor meget C-vitamin skal du have om dagen?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageData.description}
          </p>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Anbefalingen for voksne: {vitaminCTal(VITAMIN_C_RI_KVINDE_MG, 0)} mg
            (kvinder) og {vitaminCTal(VITAMIN_C_RI_MAND_MG, 0)} mg (mænd) om dagen
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Voksne kvinder (RI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminCTal(VITAMIN_C_RI_KVINDE_MG, 0)} mg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Voksne mænd (RI)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminCTal(VITAMIN_C_RI_MAND_MG, 0)} mg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Gennemsnitsbehov (AR)</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {vitaminCTal(VITAMIN_C_AR_KVINDE_MG, 0)}/{vitaminCTal(VITAMIN_C_AR_MAND_MG, 0)} mg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Rygere skal have mere</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                +{vitaminCTal(VITAMIN_C_RYGENDE_EKSTRA_MG, 0)} mg
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Tallene er Nordic Nutrition Recommendations 2023&apos;s egne for voksne.
            NNR2023 sætter ingen øvre sikkerhedsgrænse (UL) for C-vitamin, fordi
            der ikke findes et mål for skadelig effekt. Meget høje indtager fra
            tilskud kan give diaré og maveforstyrrelser.
          </p>
        </section>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Hvor meget C-vitamin er der i mad?</h2>
          <p>
            C-vitamin findes i frugt og grønt, og det er der rigtig meget af i
            dansk kost. Af de {VITAMIN_C_VARER.length} kilder nedenfor er det
            solbær, persille, rød peberfrugt og kålslagene, der topper listen —
            mens kartofler gør meget ud af ret små indhold, fordi vi spiser dem i
            store mængder. Alle værdier er pr. 100 g, og andelen viser, hvor
            meget portionen dækker af kvinders anbefaling på{" "}
            {vitaminCTal(VITAMIN_C_ANBEFALING_MG, 0)} mg:
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
                    Andel af {vitaminCTal(VITAMIN_C_ANBEFALING_MG, 0)} mg
                  </th>
                </tr>
              </thead>
              <tbody>
                {VITAMIN_C_VARER.map((vare) => (
                  <tr key={vare.fdcId} className="border-b border-gray-100 dark:border-gray-700/60">
                    <th scope="row" className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100">
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {vitaminCTal(c100g(vare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vitaminCTal(vare.portionGram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {vitaminCTal(cIgram(vare, vare.portionGram))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vitaminCTal(andelAfAnbefaling(vare), 0)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Værdierne pr. 100 g er fra {VITAMIN_C_KILDE.database}, datasættet{" "}
            {VITAMIN_C_KILDE.dataset}, udgaven {VITAMIN_C_KILDE.udgave}.
            Portionsstørrelserne er almindelige danske serveringer valgt af os,
            ikke noget kilden opgiver.
          </p>

          <h2>De største kilder pr. 100 g</h2>
          <p>
            Rød peberfrugt slår alt, hvad angår almindelige danskere indtag:{" "}
            {vitaminCTal(c100g(peberfrugt))} mg pr. 100 g, så en portion på{" "}
            {vitaminCTal(peberfrugt.portionGram, 0)} g dækker hele{" "}
            {vitaminCTal(andelAfAnbefaling(peberfrugt), 0)} % af dagsbehovet for en
            kvinde. Skal du have {vitaminCTal(VITAMIN_C_ANBEFALING_MG, 0)} mg fra
            én enkelt madvare, skal du bruge{" "}
            {vitaminCTal(gramForAnbefaling(peberfrugt), 0)} g peberfrugt,{" "}
            {vitaminCTal(gramForAnbefaling(appelsin), 0)} g appelsin eller{" "}
            {vitaminCTal(gramForAnbefaling(kartoffel), 0)} g kartoffel. Persille
            har {vitaminCTal(c100g(vareMedNavn("Persille, frisk")!))} mg pr. 100 g,
            men den spises i gram, ikke i hele 100 g.
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
                    Gram for {vitaminCTal(VITAMIN_C_ANBEFALING_MG, 0)} mg
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
                      {vitaminCTal(c100g(vare))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vitaminCTal(gramForAnbefaling(vare), 0)} g
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Sådan dækker danskere en hel dag</h2>
          <p>
            Her er en almindelig dag sat sammen af tabellens egne tal —{" "}
            {vitaminCTal(200, 0)} g kartoffel og {vitaminCTal(100, 0)} g grønkål:
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
                    C-vitamin
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
                      {vitaminCTal(gram, 0)} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {vitaminCTal(cIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">{vitaminCTal(dagsTotal)} mg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er {vitaminCTal(dagsTotal)} mg — altså over kvinders anbefaling på{" "}
            {vitaminCTal(VITAMIN_C_RI_KVINDE_MG, 0)} mg og over mænds på{" "}
            {vitaminCTal(VITAMIN_C_RI_MAND_MG, 0)} mg. NNR2023 oplyser, at det
            gennemsnitlige indtag i de nordiske og baltiske lande ligger mellem 69
            og 132 mg om dagen, fordi det afhænger af, hvor meget frugt, grønt og
            kartofler koster rummer.
          </p>

          <p>
            C-vitamin er vandopløseligt og hitter ikke: det taber du, når
            kartofler koges i meget vand — kildens egen kogte kartoffelrække
            holder {vitaminCTal(KARTOFFEL_KOGT_C_MG_100G)} mg pr. 100 g mod{" "}
            {vitaminCTal(c100g(kartoffel))} mg rå. Gem kogevandet til
            sauce, eller damp grønten.
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
            </Link>{" "}
            ,{" "}
            <Link href="/fiber-i-madvarer" className="underline font-medium">
              fiber i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/vitamin-d" className="underline font-medium">
              D-vitamin i madvarer
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
              Madindholdet er gennemsnit fra {VITAMIN_C_KILDE.database},
              datasættet {VITAMIN_C_KILDE.dataset}, udgaven{" "}
              {VITAMIN_C_KILDE.udgave}, pr. 100 g. Præcist indhold varierer med
              sort, dyrkning, lagring og tilberedning — mærkningen på den enkelte
              vare slår tallene her. Anbefalingerne er Nordic Nutrition
              Recommendations 2023&apos;s for voksne og siger ikke noget om, hvad
              du personligt skal tage; spørg din læge, før du tager daglige doser
              over anbefalingen.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om C-vitamin" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/vitamin-c" />
        </section>
      </div>

      <Sidebar currentHref="/vitamin-c" adSlotId="vitamin-c-sidebar" />
    </div>
  );
}
