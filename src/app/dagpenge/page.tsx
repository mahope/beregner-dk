import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import DagpengeBeregner from "@/components/DagpengeBeregner";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { RelatedCalculators } from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { formatNumber } from "@/lib/format";
import { DAGPENGE_2026, SATSER_2026 } from "@/lib/satser-2026";
import {
  BESKAEFTIGELSESTILLAEG_2026,
  INDKOMSTKRAV_2026,
  KOMMUNESKAT_SNIT_PCT_DAGPENGE,
  dagpengeEfterSkat,
  dagpengeKroner,
  DAGPENGE_SATSER,
} from "@/lib/dagpenge-satser";

export async function generateMetadata() {
  return generatePageMetadata("dagpenge");
}

export default async function DagpengePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("dagpenge", locale) || getPageData("dagpenge", "da")!;
  const kr = (belob: number) => `${formatNumber(belob, locale)} kr`;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/dagpenge`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/dagpenge" }]} />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <DagpengeBeregner />

      {/* Info sektion */}
      {locale === "da" && (
      <section className="mt-12 prose prose-blue max-w-none dark:prose-invert">
        <h2>Sådan fungerer dagpenge i 2026</h2>
        <p>
          <strong>Dagpenge</strong> er en økonomisk sikkerhed for dig, der er medlem af en <strong>A-kasse</strong> og
          bliver ledig. Dagpengene giver dig mulighed for at fokusere på at finde et
          nyt job uden at bekymre dig for meget om <strong>økonomien</strong>.
        </p>

        <h3>Dagpenge-satser 2026</h3>
        <p>
          Alle satser er pr. måned. <strong>Før skat</strong> er det beløb, din
          A-kasse udbetaler. <strong>Efter skat</strong> er et vejledende estimat — det
          regner med {KOMMUNESKAT_SNIT_PCT_DAGPENGE} % i kommunaleskat og 2026&apos;s
          øvrige satser, men hverken med din egen kirkeskat eller din øvrige indkomst,
          så det endelige tal kommer fra dit skattekort. Dagpenge er skattepligtig
          indkomst uden AM-bidrag.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Beløb pr. måned</th>
              </tr>
            </thead>
            <tbody>
              {DAGPENGE_SATSER.map((sats) => {
                const efterSkat = dagpengeEfterSkat(sats.belob);
                return (
                  <tr key={sats.id}>
                    <td>
                      {sats.label}
                      <br />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {sats.note}
                      </span>
                    </td>
                    <td className="whitespace-nowrap align-top">
                      {kr(sats.belob)}
                      <br />
                      <span className="text-sm">
                        ca. {dagpengeKroner(efterSkat.efterSkat)} efter skat
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h3>Nyuddannet? Sådan får du dimittendsatsen</h3>
        <p>
          Er du nyuddannet, altså <strong>dimittend</strong>, får du dagpenge efter en lavere
          sats end maxsatsen: <strong>{kr(DAGPENGE_2026.dimittendFuldtidUdenForsorgerpligt)}</strong> pr. måned
          uden forsørgelsespligt, og <strong>{kr(DAGPENGE_2026.dimittendFuldtidMedForsorgerpligt)}</strong> hvis
          du har forsørgelsespligt. Dimittendsatsen gælder, når din uddannelse har varet mindst{" "}
          <strong>{DAGPENGE_2026.dimittendUddannelseMdr} måneder</strong>, og du har
          tilmeldt dig A-kassen senest{" "}
          <strong>{DAGPENGE_2026.dimittendTilmeldingDage} dage</strong> efter at uddannelsen
          er afsluttet.
        </p>

        <h3>Hvad påvirker din dagpengesats?</h3>
        <ul>
          <li><strong>Din tidligere løn:</strong> Dagpenge = {formatNumber(DAGPENGE_2026.dagpengeProcent * 100, locale, { maximumFractionDigits: 0 })} % af løn efter {formatNumber(SATSER_2026.amBidrag * 100, locale, { maximumFractionDigits: 0 })} % AM-bidrag</li>
          <li><strong>Maxsatsen:</strong> Uanset din løn kan du højst få {kr(DAGPENGE_2026.fuldtid)}/md i 2026</li>
          <li><strong>Beskæftigelsestillæg:</strong> Op til {kr(BESKAEFTIGELSESTILLAEG_2026)}/md de første 3 måneder</li>
          <li><strong>Arbejdstid:</strong> Deltidsforsikrede får {kr(DAGPENGE_2026.deltid)}/md — 2/3 af fuldtidssatsen</li>
          <li><strong>A-kasse medlemskab:</strong> Du skal have været medlem i mindst 1 år</li>
        </ul>

        <h3>Indkomstkravet</h3>
        <p>
          For at få ret til dagpenge skal du opfylde et <strong>indkomstkrav</strong>. I 2026 skal du
          have haft en samlet indkomst på mindst <strong>{kr(INDKOMSTKRAV_2026)}</strong> inden for de seneste {DAGPENGE_2026.indkomstkravAar} år,
          eller have haft <strong>fuldtidsarbejde</strong> i mindst{" "}
          <strong>{formatNumber(DAGPENGE_2026.indkomstkravTimer, locale)} timer</strong>{" "}
          inden for de seneste {DAGPENGE_2026.indkomstkravAar} år.
        </p>

        <h3>Supplerende dagpenge</h3>
        <p>
          Hvis du arbejder på <strong>nedsat tid</strong> (under 37 timer), kan du få <strong>supplerende dagpenge</strong>.
          Dog er der et loft på <strong>30 ugers</strong> supplerende dagpenge inden for <strong>104 uger</strong>.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med 2026-satser</p>
          <p className="text-green-700 dark:text-green-400">
            Satserne er de officielle 2026-satser fra Beskæftigelsesministeriet (bm.dk).
            Max-, deltids- og dimittendsatserne er verificeret mod ministeriets sats-tabel den{" "}
            {new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric" }).format(
              new Date(DAGPENGE_2026.verifiedAt),
            )}.
          </p>
        </div>
      </section>
      )}

      {/* FAQ */}
      <section className="mt-12">
        <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om dagpenge" />
      </section>

      {/* Related */}
      <section className="mt-12">
        <RelatedCalculators current="/dagpenge" />
      </section>
      </div>
      <Sidebar currentHref="/dagpenge" adSlotId="dagpenge-sidebar" />
    </div>
  );
}
