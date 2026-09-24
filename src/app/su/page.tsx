import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { SU_2026 } from "@/lib/satser-2026";
import SUBeregner from "@/components/SUBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("su");
}

const kr = (value: number) => value.toLocaleString("da-DK");

export default async function SUPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("su", locale) || getPageData("su", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/su`}
        category={pageData.schemaCategory}
        siteName={domainConfig.siteName}
        currency={domainConfig.currency}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/su" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <SUBeregner />

      {locale === "da" && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
          <Link href="/blog/su-2026-satser-og-regler" className="font-medium underline">
            Læs guide til SU 2026
          </Link>{" "}
          med aldersgrænser, forældreindkomst, fribeløb og officielle kilder.
        </div>
      )}

      {locale === "da" && (
        <div className="mt-12 prose max-w-none dark:prose-invert">
          <h2>Om SU (Statens Uddannelsesstøtte)</h2>
          <p>
            <strong>SU</strong> er statens månedlige støtte til godkendte videregående uddannelser,
            ungdomsuddannelser og visse andre uddannelser. På ungdomsuddannelse starter SU i
            kvartallet efter det 18. år. Der er ingen nedre aldersgrænse for SU på videregående
            uddannelse, men SU-lån kan først optages, når du er fyldt 18 år.
          </p>

          <h3>SU-satser 2026</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Månedlig SU før skat</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Udeboende på videregående uddannelse</td>
                  <td>{kr(SU_2026.udeboende)} kr.</td>
                </tr>
                <tr>
                  <td>Hjemmeboende, ordning fra {SU_2026.currentHomewardSchemeStart}</td>
                  <td>Samlet sats {kr(SU_2026.homewardBase)}-{kr(SU_2026.homewardMaximum)} kr. i ordningen fra {SU_2026.currentHomewardSchemeStart}</td>
                </tr>
                <tr>
                  <td>Videregående uddannelse, i særlige tilfælde omfattet af ordningen fra før {SU_2026.currentHomewardSchemeStart}</td>
                  <td>{kr(SU_2026.homewardLegacy)} kr.</td>
                </tr>
                <tr>
                  <td>Ungdomsuddannelse, udeboende fra 20 år</td>
                  <td>{kr(SU_2026.udeboende)} kr.</td>
                </tr>
                <tr>
                  <td>Ungdomsuddannelse, godkendt udeboende 18-19 år</td>
                  <td>{kr(SU_2026.youthAway18To19Base)} kr. + tillæg; samlet sats højst {kr(SU_2026.udeboende)} kr.</td>
                </tr>
                <tr>
                  <td>Ungdomsuddannelse startet før {SU_2026.currentHomewardSchemeStart}, 18-19 år</td>
                  <td>Grundsats {kr(SU_2026.youthLegacy18To19Base)} kr. + tillæg; samlet sats højst {kr(SU_2026.homewardLegacy)} kr.</td>
                </tr>
                <tr>
                  <td>Ungdomsuddannelse startet før {SU_2026.currentHomewardSchemeStart}, fra 20 år</td>
                  <td>{kr(SU_2026.homewardLegacy)} kr.</td>
                </tr>
                <tr>
                  <td>Forsørgertillæg til berettiget enlig forsørger</td>
                  <td>{kr(SU_2026.singleParentSupplement)} kr.</td>
                </tr>
                <tr>
                  <td>Handicaptillæg på videregående uddannelse</td>
                  <td>{kr(SU_2026.disabilitySupplement.videregaaende)} kr.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Hjemmeboende består af {kr(SU_2026.homewardBase)} kr. i grundsats og et
            indkomstafhængigt tillæg på højst {kr(SU_2026.homewardMaximumSupplement)} kr.;
            den samlede sats er dermed højst {kr(SU_2026.homewardMaximum)} kr.
          </p>
          <p>
            Et barn under 18 år giver i den aktuelle ordning automatisk det maksimale
            indkomstafhængige tillæg, så den samlede hjemmeboende SU er{" "}
            {kr(SU_2026.homewardMaximum)} kr. før skat, og en godkendt 18-19-årig udeboende får
            den fulde sats på {kr(SU_2026.udeboende)} kr. I en særlig ordning fra før{" "}
            {SU_2026.currentHomewardSchemeStart} kan den ældre faste sats på{" "}
            {kr(SU_2026.homewardLegacy)} kr. fortsat gælde. En berettiget enlig forsørger kan
            herudover få forsørgertillæg på {kr(SU_2026.singleParentSupplement)} kr. pr. måned.
            Forsørgertillæg og forældrelån er separate ydelser; se vilkårene hos{" "}
            <a href={SU_2026.sources.singleParentEligibility} target="_blank" rel="noopener noreferrer">su.dk</a>.
          </p>
          <p>
            En 18- eller 19-årig på ungdomsuddannelse får normalt hjemmeboende SU, medmindre
            udeboendesats er godkendt. Har den unge sit eget barn under 18 år, gælder den fulde
            udeboendesats på {kr(SU_2026.udeboende)} kr. uden særlig godkendelse. På den gamle
            ungdomsordning er 18-19-åriges hjemmeboende sats en grundsats på{" "}
            {kr(SU_2026.youthLegacy18To19Base)} kr. med et indkomstafhængigt tillæg op til{" "}
            {kr(SU_2026.homewardLegacy)} kr.; fra 20 år er den faste sats{" "}
            {kr(SU_2026.homewardLegacy)} kr. Se{" "}
            <a href={SU_2026.sources.youthHousing} target="_blank" rel="noopener noreferrer">reglerne for bopæl og SU-satser</a>.
          </p>
          <p>
            Kilder:{" "}
            <a href={SU_2026.sources.homewardVideregaaende} target="_blank" rel="noopener noreferrer">hjemmeboende VU</a>,{" "}
            <a href={SU_2026.sources.udeboendeVideregaaende} target="_blank" rel="noopener noreferrer">udeboende VU</a>,{" "}
            <a href={SU_2026.sources.udeboendeUngdomsuddannelse} target="_blank" rel="noopener noreferrer">ungdomsuddannelse</a>,{" "}
            <a href={SU_2026.sources.homewardUngdomsuddannelse} target="_blank" rel="noopener noreferrer">hjemmeboende ungdom</a>,{" "}
            <a href={SU_2026.sources.youthHousing} target="_blank" rel="noopener noreferrer">ungdomsregler</a>,{" "}
            <a href={SU_2026.sources.parents} target="_blank" rel="noopener noreferrer">forældre</a> og{" "}
            <a href={SU_2026.sources.disability} target="_blank" rel="noopener noreferrer">handicaptillæg</a>.
          </p>

          <h2>Fribeløb 2026</h2>
          <p>
            Fribeløbet er din egen indkomstgrænse og beregnes måned for måned. I 2026 gælder
            disse beløb for indkomst efter AM-bidrag:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Månedligt fribeløb</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>SU på ungdomsuddannelse</td>
                  <td>{kr(SU_2026.freeAllowance.youthWithSu)} kr.</td>
                </tr>
                <tr>
                  <td>SU, dobbelt SU eller slutlån på videregående uddannelse</td>
                  <td>{kr(SU_2026.freeAllowance.videregaaendeWithSu)} kr.</td>
                </tr>
                <tr>
                  <td>Indskrevet studerende uden SU i måneden</td>
                  <td>{kr(SU_2026.freeAllowance.enrolledWithoutSu)} kr.</td>
                </tr>
                <tr>
                  <td>Højeste sats, når du ikke er studerende</td>
                  <td>{kr(SU_2026.freeAllowance.notStudying)} kr.</td>
                </tr>
                <tr>
                  <td>Måned med handicaptillæg</td>
                  <td>{kr(SU_2026.freeAllowance.disabilityMonth)} kr.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Hvert barn
            under 18 år hæver årsfribeløbet med {kr(SU_2026.freeAllowance.childUnder18Annual)} kr.
            En måned med handicaptillæg bruger det nedsatte månedsfribeløb på{" "}
            {kr(SU_2026.freeAllowance.disabilityMonth)} kr.; måneder uden SU følger ellers den valgte
            studiestatus. Beregneren bruger de valgte SU-måneder. Er din aktuelle hjemmeboende SU
            lavere end den samlede maksimumsats, hæves fribeløbet som udgangspunkt med forskellen
            mellem din sats og {kr(SU_2026.homewardMaximum)} kr. For en godkendt 18-19-årig er
            sammenligningen med den fulde udeboendesats {kr(SU_2026.udeboende)} kr. Hvis forskellen
            anvendes til forhøjet SU-lån, indgår kun den resterende forskel i fribeløbet.
          </p>
          <p>
            Overstiger årsindkomsten fribeløbet, kan SU og slutlån blive nedsat eller tilbagebetalt.
            Det endelige beløb afhænger af den konkrete situation og beregnes af Udbetaling Danmark.
            Læs de officielle{" "}
            <a href={SU_2026.sources.freeAllowance} target="_blank" rel="noopener noreferrer">månedsfribeløb</a>{" "}
            og{" "}
            <a href={SU_2026.sources.enhancedFreeAllowance} target="_blank" rel="noopener noreferrer">regler for forhøjet årsfribeløb</a>.
          </p>

          <h2>SU-klip</h2>
          <p>
            Videregående uddannelser har i 2026 normalt en samlet ramme på {SU_2026.suKlip} SU-klip.
            {SU_2026.suKlipExtraSupportMonths} ekstra klip kan gives som forlænget støttetid, men
            rammen på {SU_2026.suKlip} klip gælder fortsat. På ungdomsuddannelser fastsættes
            antallet efter den enkelte uddannelses længde. Se{" "}
            <a href={SU_2026.sources.suKlip} target="_blank" rel="noopener noreferrer">SU-klippekortet</a>.
          </p>

          <h2>SU-lån</h2>
          <ul>
            <li>Almindeligt SU-lån: op til {kr(SU_2026.loan.ordinaryMonthly)} kr. pr. måned.</li>
            <li>SU-lån til forældre: op til {kr(SU_2026.loan.parentMonthly)} kr. pr. måned.</li>
            <li>Almindeligt SU-lån og forældrelån: i alt op til {kr(SU_2026.loan.combinedMonthly)} kr. pr. måned.</li>
            <li>Slutlån: op til {kr(SU_2026.loan.finalMonthly)} kr. pr. måned i de seneste {SU_2026.rules.finalLoanStandardMonths} måneder, i nogle tilfælde {SU_2026.rules.finalLoanExtendedMonths} måneder.</li>
          </ul>
          <p>
            Renten er {kr(SU_2026.loan.duringStudyRate * 100)} % under studiet og{" "}
            {kr(SU_2026.loan.afterGraduationRate * 100)} % fra 1. juli 2026 efter uddannelsen.
            Tilbagebetalingen begynder 1. januar året efter det år, hvor uddannelsen afsluttes.
            Almindelig SU-gæld betales typisk hver {SU_2026.loan.repaymentFrequencyMonths}. måned.
            Den officielle løbetid følger lånets størrelse: {SU_2026.loan.repaymentMinYears} år
            op til {SU_2026.loan.repaymentFirstBandMaxDebt.toLocaleString("da-DK")} kr. og op til{" "}
            {SU_2026.loan.repaymentMaxYears} år fra{" "}
            {SU_2026.loan.repaymentLastBandMinDebt.toLocaleString("da-DK")} kr. Se{" "}
            <a href={SU_2026.sources.loanRepayment} target="_blank" rel="noopener noreferrer">betalingsreglerne</a>,{" "}
            <a href={SU_2026.sources.loan} target="_blank" rel="noopener noreferrer">SU-lånssatserne</a>,{" "}
            <a href={SU_2026.sources.finalLoan} target="_blank" rel="noopener noreferrer">slutlånsreglerne</a> og de aktuelle{" "}
            <a href={SU_2026.sources.loanInterest} target="_blank" rel="noopener noreferrer">rentesatser</a>.
          </p>

          <h2>SU og skat</h2>
          <p>
            SU og handicaptillæg er skattepligtige. Den konkrete skat afhænger af din samlede
            indkomst, fradrag, skattekort og kommune. Beregneren viser derfor kun beløb før skat.
            Se vores{" "}
            <Link href="/loen-efter-skat">løn efter skat-beregner</Link> for en mere detaljeret
            skatteberegning på arbejdsindkomst.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
            <p className="font-medium text-blue-800 dark:text-blue-300">Få din officielle SU-vurdering</p>
            <p className="text-blue-700 dark:text-blue-400">
              På <a href="https://www.su.dk" target="_blank" rel="noopener noreferrer" className="underline">su.dk</a> kan du søge SU, se din klipsaldo og få din konkrete fribeløbsberegning.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
            <p className="font-medium text-green-800 dark:text-green-300">Kilder verificeret {SU_2026.verifiedAt}</p>
            <p className="text-green-700 dark:text-green-400">
              Alle viste 2026-beløb er hentet fra de officielle su.dk-sider ovenfor. Læs også vores{" "}
              <Link href="/blog/su-2026-satser-og-regler" className="underline">komplette guide til SU 2026</Link>.
            </p>
          </div>
        </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/su" />
    </div>
  );
}
