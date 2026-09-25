import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { BARSEL_2026 } from "@/lib/satser-2026";
import Link from "next/link";
import BarselBeregner from "@/components/BarselBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("barselsdagpenge");
}

export default async function BarselPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("barselsdagpenge", locale) || getPageData("barselsdagpenge", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/barselsdagpenge`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/barselsdagpenge" }]} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">

        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {pageData.title}
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              {pageData.description}
            </p>
          </header>

          <section className="mb-12">
            <BarselBeregner />
          </section>

          <div className="mb-12 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="font-semibold text-blue-900 dark:text-blue-200">Vil du se den korte version af reglerne?</p>
            <p className="mt-2 text-blue-800 dark:text-blue-300">
              Læs <Link href="/blog/barsel-2026-regler-og-satser" className="font-medium underline">barsel 2026-guiden</Link> med sats, perioder, overdragelse og ansøgningsfrister.
            </p>
            <p className="mt-2 text-blue-800 dark:text-blue-300">
              Skal I fordele ugerne? Brug <Link href="/barselsplanlaegger" className="font-medium underline">barselsplanlæggeren</Link> med kalender, økonomi og besked til arbejdsgiveren.
            </p>
            <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">
              Kilde: <a href={BARSEL_2026.source} className="underline">Borger.dk</a>, verificeret {BARSEL_2026.verifiedAt}.
            </p>
          </div>

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om barselsdagpenge
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Barselsdagpenge</strong> er en offentlig ydelse fra Udbetaling Danmark. Den kan erstatte løn, når du holder pause fra arbejdet for at være sammen med dit barn.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Hvem kan få barselsdagpenge?</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Være ansat på den første dag i orloven eller dagen før</li>
                <li>Have arbejdet mindst {BARSEL_2026.employmentHours} timer inden for de seneste {BARSEL_2026.employmentMonths} hele måneder</li>
                <li>Have arbejdet mindst {BARSEL_2026.monthlyHoursThreshold} timer om måneden i mindst {BARSEL_2026.monthsWithMonthlyHours} af de {BARSEL_2026.employmentMonths} måneder</li>
                <li>Være sammen med dit barn dagligt</li>
              </ul>
              <p>Selvstændige, ledige og studerende har andre regler. Se Min barsel eller spørg Udbetaling Danmark om din konkrete situation.</p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Barselsoversigt 2026</h3>
              <p>Når forældrene bor sammen ved fødslen, har hver som udgangspunkt {BARSEL_2026.afterBirthWeeks} uger med barselsdagpenge efter fødslen:</p>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Periode</th>
                    <th className="border p-3 text-left">Mor</th>
                    <th className="border p-3 text-left">Far/medmor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Før fødsel</td>
                    <td className="border p-3">{BARSEL_2026.motherBeforeBirthWeeks} uger</td>
                    <td className="border p-3">-</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Ved fødsel</td>
                    <td className="border p-3">{BARSEL_2026.motherAtBirthWeeks} uger (kan ikke overdrages)</td>
                    <td className="border p-3">{BARSEL_2026.fatherAtBirthWeeks} uger i de første {BARSEL_2026.firstTenWeeksAfterBirth} uger (kan fordeles fleksibelt efter aftale med arbejdsgiveren)</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Første {BARSEL_2026.firstTenWeeksAfterBirth} uger efter fødsel</td>
                    <td className="border p-3">{BARSEL_2026.motherEarlyAfterBirthWeeks} uger</td>
                    <td className="border p-3">-</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Øremærket til hver forælder</td>
                    <td className="border p-3">{BARSEL_2026.earmarkedWeeks} uger</td>
                    <td className="border p-3">{BARSEL_2026.earmarkedWeeks} uger</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Efter de første {BARSEL_2026.firstTenWeeksAfterBirth} uger</td>
                    <td className="border p-3">{BARSEL_2026.motherLateTransferableWeeks} uger</td>
                    <td className="border p-3">-</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Kan overdrages</td>
                    <td className="border p-3">{BARSEL_2026.motherEarlyAfterBirthWeeks} + {BARSEL_2026.motherLateTransferableWeeks} uger under særlige betingelser</td>
                    <td className="border p-3">{BARSEL_2026.maxTransferableWeeks} uger</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-4">Far/medmor kan fordele de {BARSEL_2026.fatherAtBirthWeeks} uger fleksibelt inden for de første {BARSEL_2026.firstTenWeeksAfterBirth} uger efter aftale med arbejdsgiveren. Overdragelse af de {BARSEL_2026.motherEarlyAfterBirthWeeks} + {BARSEL_2026.motherLateTransferableWeeks} uger for mor og de {BARSEL_2026.maxTransferableWeeks} uger for far/medmor sker under nærmere betingelser og som udgangspunkt inden for barnets første år.</p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Ansøgningsfrist</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Får du løn under barsel, skal du som udgangspunkt søge senest {BARSEL_2026.applicationDeadlineWeeks} uger efter, at lønnen stopper.</li>
                <li>Hvis mor ikke får løn og holder mindst {BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen, er fristen {BARSEL_2026.applicationDeadlineWeeks} uger efter fødslen.</li>
                <li>Far/medmor skal søge senest {BARSEL_2026.applicationDeadlineWeeks} uger efter første orlovsdag.</li>
                <li>En for sen ansøgning giver som udgangspunkt først ydelse fra den dag, Udbetaling Danmark modtager ansøgningen.</li>
              </ul>
              <p className="mt-4 text-sm">Kilde: <a href={BARSEL_2026.source} className="underline">Borger.dk, lønmodtager på barsel</a>. Verificeret {BARSEL_2026.verifiedAt}.</p>
            </div>
          </section>
          )}

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Ofte stillede spørgsmål
            </h2>
            <FAQ items={pageData.faqItems} />
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Relaterede beregnere
            </h2>
            <RelatedCalculators current="/barselsdagpenge" />
          </section>
        </article>
      </main>
    </div>
  );
}
