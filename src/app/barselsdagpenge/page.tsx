import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { BARSEL_2026, SATSER_2026 } from "@/lib/satser-2026";
import { beregnBarselsdagpenge } from "@/lib/barselsdagpenge";
import { estimerNettoMaaned } from "@/lib/barsel/netto";
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

  const maksPerMaaned = (BARSEL_2026.maxWeeklyRate * 52) / 12;
  const timebaseretPerMaaned = (BARSEL_2026.maxHourlyRate * BARSEL_2026.fullTimeHours * 52) / 12;
  const maksNetto = estimerNettoMaaned({ loen: 0, ydelse: maksPerMaaned });
  const maksNettoKirke = estimerNettoMaaned({ loen: 0, ydelse: maksPerMaaned, kirkeskat: true });
  const kr = (value: number) => `${Math.round(value).toLocaleString("da-DK")} kr.`;
  // Lowest gross monthly pay (full time) where the after-AM hourly pay reaches the cap, rounded to 50 kr.
  const loenForMaksSats =
    Math.ceil(
      (BARSEL_2026.maxHourlyRate / (1 - SATSER_2026.amBidrag)) * BARSEL_2026.fullTimeHours * 52 / 12 / 50,
    ) * 50;
  const loenRaekker = [20000, 25000, 30000, 40000].map((loen) => {
    const r = beregnBarselsdagpenge({ monthlyIncome: loen, weeklyHours: BARSEL_2026.fullTimeHours, weeks: BARSEL_2026.defaultWeeks })!;
    return { loen, ugesats: r.weeklyRate, nettoMaaned: r.monthlyAfterTax, erMaks: r.weeklyRate >= BARSEL_2026.maxWeeklyRate };
  });
  const satsRækker =[4000, 4500, BARSEL_2026.maxWeeklyRate].map((uge) => {
    const prMaaned = (uge * 52) / 12;
    const n = estimerNettoMaaned({ loen: 0, ydelse: prMaaned });
    return {
      uge,
      prMaaned,
      netto: n.netto,
      skat: n.skat,
      skattepct: prMaaned > 0 ? (n.skat / prMaaned) * 100 : 0,
      erMaks: uge === BARSEL_2026.maxWeeklyRate,
    };
  });

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
              Barselsdagpenge sats 2026
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                Den højeste sats for barselsdagpenge i 2026 er <strong>{kr(BARSEL_2026.maxWeeklyRate)} om ugen før skat</strong> ved {BARSEL_2026.fullTimeHours} timer, svarende til {BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. i timen. Satsen er den samme for mor, far og medmor. Din egen sats er din timeløn efter AM-bidrag gange din ugentlige arbejdstid, men aldrig mere end maksimum.
              </p>
              <p>
                Som lønmodtager på fuld tid rammer du maksimum ved en bruttoløn på ca. {kr(loenForMaksSats)} om måneden. Tjener du mindre, får du din egen løn efter AM-bidrag, og tjener du mere, får du stadig kun maksimum.
              </p>
              <table className="w-full border-collapse mt-4">
                <caption className="sr-only">Barselsdagpenge pr. uge og måned ved forskellig løn</caption>
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Løn pr. måned (fuldtid)</th>
                    <th className="border p-3 text-left">Barselsdagpenge pr. uge</th>
                    <th className="border p-3 text-left">Pr. måned efter skat (skøn)</th>
                  </tr>
                </thead>
                <tbody>
                  {loenRaekker.map((r) => (
                    <tr key={r.loen} className={r.erMaks ? "font-semibold" : undefined}>
                      <td className="border p-3">{kr(r.loen)}</td>
                      <td className="border p-3">{kr(r.ugesats)}{r.erMaks ? " (maks)" : ""}</td>
                      <td className="border p-3">{kr(r.nettoMaaned)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm">
                Kilde: <a href={BARSEL_2026.source} className="underline">Borger.dk, lønmodtager på barsel</a>, verificeret {BARSEL_2026.verifiedAt}. Beløbene efter skat er et skøn.
              </p>
            </div>
          </section>
          )}

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Barselsdagpenge efter skat — hvad får du på konto?
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                Satsen er det, din arbejdsgiver betaler, og den er <strong>før skat</strong>. Regnestykket for den maksimale sats er timeprisen gange fuldtid:
              </p>
              <p className="font-semibold text-gray-900">
                {BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. × {BARSEL_2026.fullTimeHours} timer = {Math.round(BARSEL_2026.maxHourlyRate * BARSEL_2026.fullTimeHours).toLocaleString("da-DK")} kr. om ugen
              </p>
              <p className="font-semibold text-gray-900">
                {Math.round(BARSEL_2026.maxWeeklyRate).toLocaleString("da-DK")} kr. × 52 uger ÷ 12 måneder = {Math.round(maksPerMaaned).toLocaleString("da-DK")} kr. om måneden før skat
              </p>
              <p>
                Timeprisen og ugesatsen peger altså samme vej: {BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr. × {BARSEL_2026.fullTimeHours} timer × 52 ÷ 12 giver {Math.round(timebaseretPerMaaned).toLocaleString("da-DK")} kr. — en forskel på under én krone.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Så meget er der tilbage efter skat</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Sats pr. uge</th>
                    <th className="border p-3 text-left">Før skat pr. måned</th>
                    <th className="border p-3 text-left">Skat pr. måned</th>
                    <th className="border p-3 text-left">Efter skat pr. måned</th>
                  </tr>
                </thead>
                <tbody>
                  {satsRækker.map((r) => (
                    <tr key={r.uge} className={r.erMaks ? "font-semibold" : undefined}>
                      <td className="border p-3">
                        {r.uge.toLocaleString("da-DK")} kr.{r.erMaks ? " (maks)" : ""}
                      </td>
                      <td className="border p-3">{Math.round(r.prMaaned).toLocaleString("da-DK")} kr.</td>
                      <td className="border p-3">
                        {Math.round(r.skat).toLocaleString("da-DK")} kr. ({r.skattepct.toLocaleString("da-DK", { maximumFractionDigits: 1 })} %)
                      </td>
                      <td className="border p-3">{Math.round(r.netto).toLocaleString("da-DK")} kr.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4">
                Ved makssatsen er det altså ca. {Math.round(maksNetto.netto).toLocaleString("da-DK")} kr. om måneden, du har tilbage — <strong>{Math.round(maksNetto.skat).toLocaleString("da-DK")} kr.</strong> går til skat. Er du også kirkemedlem, bliver det ca. {Math.round(maksNettoKirke.netto).toLocaleString("da-DK")} kr.
              </p>
              <p>
                <strong>Barselsdagpenge er ikke AM-bidragspligtig.</strong> Du skal derfor ikke trække 8 % fra af ydelsen, sådan som du gør ved løn — kun af løn. Ydelsen er skattepligtig personlig indkomst, og beskæftigelsesfradraget gælder din løn, ikke dagpengen.
              </p>
              <p>
                Tallene er <strong>vejledende</strong>: de regner på den 2026-gennemsnitlige kommuneskat, uden kirkeskat, og de forudsætter at dagpengen er din eneste indkomst hele året. Er du under 58 år, har en højere løn ved siden af, eller bor i en kommune med højere eller lavere skat, ændrer det beløbet. Vil du se dit eget tal, kan du regne det videre på <Link href="/loen-efter-skat" className="font-medium underline">løn efter skat</Link>.
              </p>
              <p className="text-sm">
                Satser: <a href={BARSEL_2026.source} className="underline">Borger.dk, lønmodtager på barsel</a>, verificeret {BARSEL_2026.verifiedAt}. Skatteberegningen er den samme model som <Link href="/barselsplanlaegger" className="font-medium underline">barselsplanlæggeren</Link> bruger.
              </p>
            </div>
          </section>
          )}

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om barselsdagpenge
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Barselsdagpenge</strong> er en offentlig ydelse fra Udbetaling Danmark. Den kan erstatte løn, når du holder pause fra arbejdet for at være sammen med dit barn.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Hvem har ret til barselsdagpenge?</h3>
              <p>Som lønmodtager skal du opfylde disse krav:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Være ansat på den første dag i orloven eller dagen før</li>
                <li>Have arbejdet mindst {BARSEL_2026.employmentHours} timer inden for de seneste {BARSEL_2026.employmentMonths} hele måneder</li>
                <li>Have arbejdet mindst {BARSEL_2026.monthlyHoursThreshold} timer om måneden i mindst {BARSEL_2026.monthsWithMonthlyHours} af de {BARSEL_2026.employmentMonths} måneder</li>
                <li>Være sammen med dit barn dagligt</li>
              </ul>
              <h3 className="text-xl font-semibold mt-6 mb-3">Selvstændige og ledige</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Selvstændig:</strong> Satsen bygger på virksomhedens overskud, og du skal have drevet virksomhed i mindst halvdelen af en normal arbejdsuge i mindst 6 af de seneste 12 måneder. Fuld sats kræver et årligt overskud på ca. {kr(BARSEL_2026.selfEmployedProfitForMaxRate)}. Øremærkningen af uger gælder ikke selvstændige. Kilde: <a href={BARSEL_2026.sourceSelfEmployed} className="underline">Borger.dk, selvstændig på barsel</a>.
                </li>
                <li>
                  <strong>Ledig:</strong> Er du medlem af en a-kasse og ville have været berettiget til dagpenge, får du barselsdagpenge med samme sats som dine <Link href="/dagpenge" className="font-medium underline">dagpenge</Link>, dog højst {kr(BARSEL_2026.maxWeeklyRate)} om ugen. Fraværet skal meldes til a-kassen. Kilde: <a href={BARSEL_2026.sourceUnemployed} className="underline">Borger.dk, ledig på barsel</a>.
                </li>
                <li>
                  <strong>Studerende:</strong> SU alene giver ikke ret til barselsdagpenge. Du kan i stedet få SU-fødselsstøtte. Se <Link href="/su" className="font-medium underline">SU-beregneren</Link>.
                </li>
              </ul>
              <p className="mt-2 text-sm">Reglerne for selvstændige og ledige er gennemgået {BARSEL_2026.sourcesVerifiedAt}. Beregneren ovenfor regner for dem med overskuddet eller dagpengene som grundlag, og tallet er et skøn.</p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Løn under barsel</h3>
              <p>
                Om du får løn under barsel, afgøres af din overenskomst eller kontrakt, ikke af barselsloven. Betaler arbejdsgiveren løn, får arbejdsgiveren barselsdagpengene som refusion, og du får lønnen i stedet. I beregneren kan du sætte, hvor mange uger arbejdsgiveren betaler, og få et gennemsnit for hele barslen. Tjek din overenskomst for antallet af uger.
              </p>
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
              <h3 className="text-xl font-semibold mt-6 mb-3">Sådan søger du barselsdagpenge</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Giv din arbejdsgiver besked om orloven inden for fristerne i barselsloven. Mor varsler senest 3 måneder før forventet fødsel. <Link href="/barselsplanlaegger" className="font-medium underline">Barselsplanlæggeren</Link> regner datoerne ud for jer.</li>
                <li>Søg Udbetaling Danmark via Borger.dk, så snart orloven er aftalt, og inden fristerne ovenfor (som udgangspunkt {BARSEL_2026.applicationDeadlineWeeks} uger efter fødslen eller første orlovsdag).</li>
                <li>Er du ledig, skal du også melde fraværet til din a-kasse. Er du selvstændig, skal du dokumentere dit overskud.</li>
                <li>Udbetaling Danmark oplyser normalt, at du får svar inden for {BARSEL_2026.applicationProcessingDays} hverdage. Pengene udbetales sidste torsdag i måneden.</li>
              </ol>
              <p className="mt-4">
                Skal du bruge tal fra andre ydelser, kan du også prøve <Link href="/dagpenge" className="font-medium underline">dagpengeberegneren</Link> (a-dagpenge som ledig) og <Link href="/sygedagpenge" className="font-medium underline">sygedagpengeberegneren</Link>.
              </p>
              <p className="mt-4 text-sm">Kilde: <a href={BARSEL_2026.source} className="underline">Borger.dk, lønmodtager på barsel</a>. Verificeret {BARSEL_2026.verifiedAt}. Frister og varsler: <a href={BARSEL_2026.sourceLaw} className="underline">barselsloven (Retsinformation)</a>.</p>
            </div>
          </section>
          )}

          <section className="mb-12">
            <FAQ items={pageData.faqItems} />
          </section>

          <section>
            <RelatedCalculators current="/barselsdagpenge" />
          </section>
        </article>
      </main>
    </div>
  );
}
