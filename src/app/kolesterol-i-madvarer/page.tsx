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
  AEG_GRAM,
  AEG_MG,
  DAGS_EKSEMPEL,
  KOLESTEROL_ANBEFALING_KILDE,
  KOLESTEROL_KILDE,
  KOLESTEROLVARER,
  antalAeg,
  kolesterol100g,
  kolesterol100gForNavn,
  kolesterolIgram,
  kolesterolTal,
  planter,
  rangliste,
  vareMedNavn,
} from "@/lib/kolesterol-i-madvarer";

export async function generateMetadata() {
  return generatePageMetadata("kolesterol-i-madvarer");
}

export default async function KolesterolIMadvarerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("kolesterol-i-madvarer", domainConfig.locale) ||
    getPageData("kolesterol-i-madvarer", "da")!;

  // Alle tal på siden læses fra den samme tabel, så teksten, tabellerne og
  // FAQ'en ikke kan glide fra hinanden (punkt 11).
  const dagsTotal = DAGS_EKSEMPEL.reduce(
    (sum, { vare, gram }) => sum + kolesterolIgram(vare, gram),
    0
  );
  const blomme = vareMedNavn("Æggeblomme, rå")!;
  const poster = vareMedNavn("Leverpostej")!;
  const dagTotalAeg = dagsTotal / AEG_MG;
  const posterGram = 50;
  const posterMg = Math.round(kolesterolIgram(poster, posterGram));
  // De ti mest koncentrerede kilder, læst af den samme tabel som resten.
  const top = rangliste().filter((v) => v.kolesterol100g > 0).slice(0, 10);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kolesterol-i-madvarer`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            {
              name: pageData.breadcrumbCategory,
              href: pageData.breadcrumbCategoryHref,
            },
            { name: pageData.title, href: "/kolesterol-i-madvarer" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Hvor meget cholesterol er der i æg, ost og kød?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageData.description}
          </p>
        </div>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Der findes ingen dansk anbefaling for kostkolesterol
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {KOLESTEROL_ANBEFALING_KILDE} Det betyder, at der ikke er et tal at
            regne imod — og derfor viser denne side heller ikke en «andel af
            anbefalingen» for hver madvare.
          </p>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-600 dark:text-gray-400">
                Anbefalet dagsmængde cholesterol
              </dt>
              <dd className="text-2xl font-bold dark:text-white">Ingen</dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">
                Loft for mættet fedt (det der anbefales)
              </dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {KOLESTEROL_KILDE.maettetFedtLoftProcent} % af energien
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">Ét helt æg</dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {kolesterolTal(AEG_MG)} mg
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 dark:text-gray-400">
                Madvarer i tabellen
              </dt>
              <dd className="text-2xl font-bold tabular-nums dark:text-white">
                {KOLESTEROLVARER.length}
              </dd>
            </div>
          </dl>
        </section>

        <div className="prose dark:prose-invert max-w-none">
          <h2>De mest koncentrerede kolesterolkilder</h2>
          <p>
            Her er de ti varer i tabellen med mest cholesterol pr. 100 g — den
            samme tal, som den fulde tabel nedenfor er bygget af, bare sorteret
            efter mængde frem for efter gruppe.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th
                    scope="col"
                    className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400"
                  >
                    Madvare
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Pr. 100 g
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Svarer til æg
                  </th>
                </tr>
              </thead>
              <tbody>
                {top.map((vare) => (
                  <tr
                    key={vare.fdcId}
                    className="border-b border-gray-100 dark:border-gray-700/60"
                  >
                    <th
                      scope="row"
                      className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100"
                    >
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kolesterolTal(kolesterol100g(vare), 0)} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {kolesterolTal(antalAeg(vare))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Kolesterol pr. 100 g i madvarer</h2>
          <p>
            Kolesterol findes kun i animalsk mad. Alle værdier er pr. 100 g, og
            sidste kolonne viser hvor mange æg portionen svarer til — ét helt
            råt æg på {AEG_GRAM} gram er det danske sammenligningstal.
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th
                    scope="col"
                    className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400"
                  >
                    Madvare
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Pr. 100 g
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Portion
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    I portionen
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Svarer til æg
                  </th>
                </tr>
              </thead>
              <tbody>
                {KOLESTEROLVARER.map((vare) => (
                  <tr
                    key={vare.fdcId}
                    className="border-b border-gray-100 dark:border-gray-700/60"
                  >
                    <th
                      scope="row"
                      className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100"
                    >
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kolesterolTal(vare.kolesterol100g, 0)} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vare.portionGram} g
                    </td>
                    <td className="py-2 px-2 tabular-nums font-medium text-gray-800 dark:text-gray-100">
                      {kolesterolTal(kolesterolIgram(vare, vare.portionGram))} mg
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-600 dark:text-gray-400">
                      {vare.kolesterol100g > 0
                        ? kolesterolTal(antalAeg(vare))
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Værdierne pr. 100 g er fra {KOLESTEROL_KILDE.database}, datasættet{" "}
            {KOLESTEROL_KILDE.dataset}, udgaven {KOLESTEROL_KILDE.udgave},
            næringsstof {KOLESTEROL_KILDE.naeringsstof}. Portionsstørrelserne er
            almindelige danske serveringer valgt af os, ikke noget kilden
            opgiver.
          </p>

          <h2>Æg, lever og skaldyr: de mest koncentrerede</h2>
          <p>
            Æggeblommen er klart spidsen med{" "}
            {kolesterolTal(kolesterol100g(blomme))} mg pr. 100 g. Ét helt æg på{" "}
            {AEG_GRAM} g indeholder {kolesterolTal(AEG_MG)} mg, fordi blommen kun
            er {kolesterolTal((blomme.portionGram / AEG_GRAM) * 100, 0)} % af
            æggets vægt. Lever er det næstkoncentrerede: leverpostej har{" "}
            {kolesterolTal(kolesterol100g(poster))} mg pr. 100 g, så de to
            skiver på {kolesterolTal(posterGram, 0)} gram giver {kolesterolTal(posterMg)} mg.
          </p>
          <p>
            Skaldyr kommer overraskende højt: kaviar har{" "}
            {kolesterolTal(kolesterol100gForNavn("Kaviar"))} mg pr. 100 g,
            konserverede rejer{" "}
            {kolesterolTal(kolesterol100gForNavn("Rejer, konserveret"))} mg og
            dampede kammuslinger{" "}
            {kolesterolTal(kolesterol100gForNavn("Kammusling, dampet"))} mg. Fisk
            er derimod moderate — vild laks{" "}
            {kolesterolTal(
              kolesterol100gForNavn("Laks, atlantic, vild, grill")
            )}{" "}
            mg, tun på dåse{" "}
            {kolesterolTal(
              kolesterol100gForNavn("Tun, let, konserveret i vand")
            )}{" "}
            mg. Kød ligger tæt omkring de 100 mg pr. 100 g uanset om det er
            kylling, svinekød eller oksekød.
          </p>

          <h2>Mejeri: ost og smør, ikke mælk</h2>
          <p>
            Forskellen mellem mejeriprodukter er stor. Smør har{" "}
            {kolesterolTal(kolesterol100gForNavn("Smør, saltet"))} mg pr. 100 g
            og piskefløde{" "}
            {kolesterolTal(kolesterol100gForNavn("Fløde, piskefløde"))} mg, mens
            letmælk kun har{" "}
            {kolesterolTal(kolesterol100gForNavn("Mælk, letmælk"))} mg og skummet
            mælk {kolesterolTal(kolesterol100gForNavn("Mælk, skummet"))} mg.
            Fedt- og proteinfraktionerne i mejeriet er dem, der bærer
            cholesterolet. Ost ligger i mellemrummet: cheddar{" "}
            {kolesterolTal(kolesterol100gForNavn("Cheddar"))} mg, flødeost{" "}
            {kolesterolTal(kolesterol100gForNavn("Flødeost"))} mg, gouda{" "}
            {kolesterolTal(kolesterol100gForNavn("Gouda"))} mg.
          </p>

          <h2>Plantemad har intet cholesterol</h2>
          <p>
            Kilden har målt{" "}
            {planter()
              .map((v) => v.navn.split(",")[0].toLocaleLowerCase("da-DK"))
              .join(", ")}{" "}
            til {kolesterolTal(0)} mg pr. 100 g — cholesterol dannes i dyr, ikke
            i planter. En vegetarisk kost har derfor ikke behov for at tænke
            over kostkolesterol, men har til gengæld brug for B12-vitamin og
            jod. Se{" "}
            <Link href="/vitamin-b12" className="underline font-medium">
              B12-vitamin i madvarer
            </Link>{" "}
            og{" "}
            <Link href="/jod-i-madvarer" className="underline font-medium">
              jod i madvarer
            </Link>
            .
          </p>

          <h2>Sådan ser en almindelig dag ud</h2>
          <p>
            Her er en typisk dansk dag sat sammen af tabellens egne tal — og
            summen af en hverdag uden leverpostej:
          </p>
          <div className="overflow-x-auto not-prose">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th
                    scope="col"
                    className="py-2 pr-2 font-medium text-gray-600 dark:text-gray-400"
                  >
                    Madvare
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Mængde
                  </th>
                  <th
                    scope="col"
                    className="py-2 px-2 font-medium text-gray-600 dark:text-gray-400 tabular-nums"
                  >
                    Kolesterol
                  </th>
                </tr>
              </thead>
              <tbody>
                {DAGS_EKSEMPEL.map(({ vare, gram }) => (
                  <tr
                    key={vare.fdcId}
                    className="border-b border-gray-100 dark:border-gray-700/60"
                  >
                    <th
                      scope="row"
                      className="py-2 pr-2 font-normal text-gray-800 dark:text-gray-100"
                    >
                      {vare.navn}
                    </th>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {gram} g
                    </td>
                    <td className="py-2 px-2 tabular-nums text-gray-700 dark:text-gray-300">
                      {kolesterolTal(kolesterolIgram(vare, gram))} mg
                    </td>
                  </tr>
                ))}
                <tr className="font-medium text-gray-900 dark:text-white">
                  <th scope="row" className="py-2 pr-2">
                    I alt
                  </th>
                  <td className="py-2 px-2" />
                  <td className="py-2 px-2 tabular-nums">
                    {kolesterolTal(dagsTotal)} mg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Det er {kolesterolTal(dagsTotal)} mg, altså cirka{" "}
            {kolesterolTal(dagTotalAeg)} æg. Leverpostej på frokosten en dag
            ville lægge yderligere {kolesterolTal(posterMg)} mg til.
            Uden en daglig grænse at måle imod er tallene bedst læst som et
            overblik — vil du se resten af din kost, kan du starte i{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>{" "}
            og{" "}
            <Link href="/fedt-i-madvarer" className="underline font-medium">
              fedtindholdet i madvarer
            </Link>
            , fordi det er mættet fedt, det danske kostråd sætter en grænse på.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">
              Vejledende tal
            </p>
            <p className="text-blue-700 dark:text-blue-400">
              Madindholdet er amerikanske målinger fra{" "}
              {KOLESTEROL_KILDE.database}, datasættet{" "}
              {KOLESTEROL_KILDE.dataset}, udgaven {KOLESTEROL_KILDE.udgave}, pr.
              100 g. Danske produkter afviger, især for ost og smør, hvor
              sammensætningen varierer. Denne side er et vidensredskab, ikke
              en kostplan — har du forhøjet cholesterol, tal med din læge eller
              en klinisk diætist.
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ
            items={pageData.faqItems}
            title="Ofte stillede spørgsmål om cholesterol"
          />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/kolesterol-i-madvarer" />
        </section>
      </div>

      <Sidebar
        currentHref="/kolesterol-i-madvarer"
        adSlotId="kolesterol-i-madvarer-sidebar"
      />
    </div>
  );
}