import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { SU_2026 } from "@/lib/satser-2026";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "SU 2026: Nye satser og regler for studerende",
    description:
      "Se officielle SU-satser for 2026, aldersgrænser, fribeløb, forsørgertillæg og SU-lån. Med kilder fra su.dk.",
    keywords: [
      "SU 2026",
      "SU satser 2026",
      "SU udeboende 2026",
      "SU hjemmeboende 2026",
      "fribeløb 2026",
      "SU-lån 2026",
      "studerende økonomi",
    ],
    openGraph: {
      title: "SU 2026: Nye satser og regler for studerende",
      description: "Officielle 2026-satser for SU, fribeløb, forsørgertillæg og SU-lån.",
      url: `${baseUrl}/blog/su-2026-satser-og-regler`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/su-2026-satser-og-regler`,
    },
  };
}

const kr = (value: number) => value.toLocaleString("da-DK");

const faqItems = [
  {
    question: "Hvor meget får man i SU som udeboende i 2026?",
    answer: `Som udeboende på videregående uddannelse får du ${kr(SU_2026.udeboende)} kr. pr. måned før skat. Det samme gælder udeboende på ungdomsuddannelse fra 20 år.`,
  },
  {
    question: "Hvor meget får man som hjemmeboende i 2026?",
    answer: `Den aktuelle hjemmeboende ordning har en samlet sats på ${kr(SU_2026.homewardBase)}-${kr(SU_2026.homewardMaximum)} kr. pr. måned. Det svarer til ${kr(SU_2026.homewardBase)} kr. i grundsats og højst ${kr(SU_2026.homewardMaximumSupplement)} kr. i indkomstafhængigt tillæg.`,
  },
  {
    question: "Hvad er fribeløbet for SU i 2026?",
    answer: `Fribeløbet er ${kr(SU_2026.freeAllowance.youthWithSu)} kr. pr. måned på ungdomsuddannelse med SU og ${kr(SU_2026.freeAllowance.videregaaendeWithSu)} kr. på videregående uddannelse med SU, dobbelt SU eller slutlån. En indskrevet studerende uden SU har ${kr(SU_2026.freeAllowance.enrolledWithoutSu)} kr. i den måned.`,
  },
  {
    question: "Kan man få SU-lån i 2026?",
    answer: `Ja. Almindeligt SU-lån er op til ${kr(SU_2026.loan.ordinaryMonthly)} kr. pr. måned. Slutlån er op til ${kr(SU_2026.loan.finalMonthly)} kr. i de seneste ${SU_2026.rules.finalLoanStandardMonths} måneder, i nogle tilfælde ${SU_2026.rules.finalLoanExtendedMonths} måneder.`,
  },
];

export default function SU2026GuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="Brødkrumme">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">SU 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Uddannelse & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            SU 2026: Nye satser og regler for studerende
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-09-24">Opdateret 24. september 2026</time>
            <span aria-hidden="true">•</span>
            <span>9 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          SU er den månedlige støtte fra staten til studerende på godkendte uddannelser. Satserne for
          2026 er justeret, og især hjemmeboende studerende skal holde 2024-forældreindkomst og det
          aktuelle studieforløb ind i beregningen.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Se din sats og dit fribeløb</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores{" "}
            <Link href="/su" className="underline font-medium">SU-beregner</Link> til at vælge
            uddannelse, boligsituation og antal SU-måneder. Beregneren viser beløb før skat.
          </p>
        </div>

        <h2>SU-satser 2026: Det vigtigste først</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Situation</th>
                <th>Beløb pr. måned før skat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Udeboende på videregående uddannelse</td>
                <td>{kr(SU_2026.udeboende)} kr.</td>
              </tr>
              <tr>
                <td>Udeboende på ungdomsuddannelse fra 20 år</td>
                <td>{kr(SU_2026.udeboende)} kr.</td>
              </tr>
              <tr>
                <td>Hjemmeboende i ordningen fra {SU_2026.currentHomewardSchemeStart}</td>
                <td>Samlet sats {kr(SU_2026.homewardBase)}-{kr(SU_2026.homewardMaximum)} kr. i ordningen fra {SU_2026.currentHomewardSchemeStart}</td>
              </tr>
              <tr>
                <td>Videregående uddannelse, i særlige tilfælde omfattet af ordningen fra før {SU_2026.currentHomewardSchemeStart}</td>
                <td>{kr(SU_2026.homewardLegacy)} kr.</td>
              </tr>
              <tr>
                <td>Godkendt udeboende 18-19 år på ungdomsuddannelse</td>
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
              <tr>
                <td>Handicaptillæg på dansk erhvervsuddannelse</td>
                <td>{kr(SU_2026.disabilitySupplement.erhverv)} kr.</td>
              </tr>
              <tr>
                <td>Almindeligt SU-lån</td>
                <td>{kr(SU_2026.loan.ordinaryMonthly)} kr.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Kilder:{" "}
          <a href={SU_2026.sources.homewardVideregaaende} target="_blank" rel="noopener noreferrer">hjemmeboende VU</a>,{" "}
          <a href={SU_2026.sources.udeboendeVideregaaende} target="_blank" rel="noopener noreferrer">udeboende VU</a>,{" "}
          <a href={SU_2026.sources.homewardUngdomsuddannelse} target="_blank" rel="noopener noreferrer">hjemmeboende ungdom</a>,{" "}
          <a href={SU_2026.sources.udeboendeUngdomsuddannelse} target="_blank" rel="noopener noreferrer">ungdomsuddannelse</a>,{" "}
          <a href={SU_2026.sources.youthHousing} target="_blank" rel="noopener noreferrer">ungdomsregler</a>,{" "}
          <a href={SU_2026.sources.parents} target="_blank" rel="noopener noreferrer">forsørgertillæg</a>,{" "}
          <a href={SU_2026.sources.singleParentEligibility} target="_blank" rel="noopener noreferrer">enlige forsørgere</a> og{" "}
          <a href={SU_2026.sources.disability} target="_blank" rel="noopener noreferrer">handicaptillæg</a> og{" "}
          <a href={SU_2026.sources.loan} target="_blank" rel="noopener noreferrer">SU-lån</a>.
        </p>

        <h2>Hvem kan få SU?</h2>
        <p>For at få SU skal du blandt andet:</p>
        <ul>
          <li>være indskrevet på en godkendt uddannelse, der giver ret til SU</li>
          <li>være dansk statsborger eller have en ligestillet status</li>
          <li>overholde kravene til studieaktivitet</li>
          <li>ikke modtage en anden offentlig ydelse, der dækker de samme udgifter</li>
        </ul>
        <p>
          På ungdomsuddannelse starter SU i kvartallet efter det {SU_2026.rules.youthEducationAge}. år. Der er ingen nedre
          aldersgrænse for SU på videregående uddannelse, men SU-lån kan først optages, når du er
          fyldt {SU_2026.rules.minimumLoanAge} år. I 2026 er den normale ramme for videregående uddannelser {SU_2026.suKlip} SU-klip.
          {SU_2026.suKlipExtraSupportMonths} ekstra klip kan gives som forlænget støttetid, men den samlede ramme på {SU_2026.suKlip} klip gælder fortsat. Se{" "}
          <a href={SU_2026.sources.suKlip} target="_blank" rel="noopener noreferrer">SU-klippekortet</a>.
        </p>

        <h2>Hjemmeboende: forældreindkomst to år tidligere</h2>
        <p>
          I den aktuelle ordning er hjemmeboende SU ikke én fast sats. Den består af{" "}
          {kr(SU_2026.homewardBase)} kr. i grundsats og et tillæg, der afhænger af forældrenes
          indkomstgrundlag i {SU_2026.parentalIncomeYear}. SU for 2026 bruger dermed normalt
          forældreindkomst fra 2024. Den samlede sats kan spænde fra{" "}
          {kr(SU_2026.homewardBase)} til {kr(SU_2026.homewardMaximum)} kr. pr. måned.
        </p>
        <p>
          Har forældrene hver adresse, vurderes normalt den forælder, hvis adresse du havde den
          første i den pågældende måned. En særlig regel kan gælde efter samlivsændringer og i
          undtagelsessituationer. Se su.dk's{" "}
          <a href={SU_2026.sources.parentalIncome} target="_blank" rel="noopener noreferrer">regler for tilfælde med kun én forælder</a>.
        </p>

        <p>
          Et barn under 18 år giver i den aktuelle ordning automatisk det maksimale
          indkomstafhængige tillæg, så den samlede hjemmeboende SU er{" "}
          {kr(SU_2026.homewardMaximum)} kr. En godkendt 18-19-årig udeboende får i stedet
          automatisk den fulde udeboendesats på {kr(SU_2026.udeboende)} kr. I en særlig ordning
          fra før {SU_2026.currentHomewardSchemeStart} kan den ældre faste sats på{" "}
          {kr(SU_2026.homewardLegacy)} kr. fortsat gælde. Barnet under 18 år hæver desuden
          årsfribeløbet med {kr(SU_2026.freeAllowance.childUnder18Annual)} kr., uanset om
          studerende er enlig forsørger. En berettiget enlig forsørger kan dermed få de
          beregnede komponenter {kr(SU_2026.homewardMaximum)} kr. i SU og{" "}
          {kr(SU_2026.singleParentSupplement)} kr. i forsørgertillæg. Forsørgertillægget og
          forældrelånet er separate ordninger; se{" "}
          <a href={SU_2026.sources.singleParentEligibility} target="_blank" rel="noopener noreferrer">betingelserne for enlige forsørgere</a>.
        </p>
        <h2>18-19 år og udeboendesats</h2>
        <p>
          En 18- eller 19-årig på ungdomsuddannelse kan normalt først få fuld udeboendesats fra det
          20. år. En lavere sats på {kr(SU_2026.youthAway18To19Base)} kr. pr. måned kan kræve
          godkendelse fra uddannelsesinstitutionen. Det kan være aktuelt ved mindst {SU_2026.rules.youthAwayMinimumDistanceKm} km til
          uddannelsesstedet, over {SU_2026.rules.youthAwayMinimumTravelMinutes} minutters samlet offentlig transport, mindst {SU_2026.rules.youthAwayRequiredPriorMonths} måneders
          sammenhængende udeboende siden eller særlige forhold i hjemmet. Har den unge sit eget barn
          under 18 år, gælder den fulde udeboendesats på {kr(SU_2026.udeboende)} kr. uden særlig
          godkendelse. I ungdomsordningen fra før {SU_2026.currentHomewardSchemeStart} er 18-19-åriges
          sats {kr(SU_2026.youthLegacy18To19Base)} kr. i grundsats med et forældreindkomstafhængigt
          tillæg op til {kr(SU_2026.homewardLegacy)} kr.; fra 20 år er satsen fast{" "}
          {kr(SU_2026.homewardLegacy)} kr. Se{" "}
          <a href={SU_2026.sources.youthHousing} target="_blank" rel="noopener noreferrer">bopæls- og SU-reglerne</a>.
        </p>

        <h2>Fribeløb: hvor meget må du tjene?</h2>
        <p>Fribeløbet beregnes måned for måned og derefter samlet for kalenderåret:</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Situation i måneden</th>
                <th>Fribeløb efter AM-bidrag</th>
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
                <td>Indskrevet studerende uden SU</td>
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
          Hvert barn under 18 år hæver årsfribeløbet med{" "}
          {kr(SU_2026.freeAllowance.childUnder18Annual)} kr. En måned med handicaptillæg bruger
          det nedsatte månedsfribeløb på {kr(SU_2026.freeAllowance.disabilityMonth)} kr.; måneder
          uden handicaptillæg følger den valgte studiestatus. Beregneren bruger de valgte
          SU-måneder. Er din aktuelle hjemmeboende SU lavere end den samlede maksimumsats, hæves
          fribeløbet som udgangspunkt med forskellen mellem din sats og{" "}
          {kr(SU_2026.homewardMaximum)} kr. For en godkendt 18-19-årig er sammenligningen med den
          fulde udeboendesats {kr(SU_2026.udeboende)} kr. Hvis forskellen bruges til forhøjet
          SU-lån, indgår kun den resterende forskel i fribeløbet.
        </p>
        <p>
          Overstiger årsindkomsten årsfribeløbet, kan SU og slutlån blive nedsat eller tilbagebetalt.
          Det er derfor ikke korrekt automatisk at regne hele overskuddet som tilbagebetaling. Se{" "}
          <a href={SU_2026.sources.freeAllowance} target="_blank" rel="noopener noreferrer">månedsfribeløbene</a>,{" "}
          <a href={SU_2026.sources.enhancedFreeAllowance} target="_blank" rel="noopener noreferrer">reglerne for forhøjet årsfribeløb</a> og{" "}
          <a href={SU_2026.sources.disabilityFreeAllowance} target="_blank" rel="noopener noreferrer">fribeløb ved handicaptillæg</a>.
        </p>

        <h2>SU-lån: ekstra penge med rente</h2>
        <ul>
          <li>Almindeligt SU-lån: op til {kr(SU_2026.loan.ordinaryMonthly)} kr. pr. måned.</li>
          <li>SU-lån til forældre: op til {kr(SU_2026.loan.parentMonthly)} kr. pr. måned.</li>
          <li>Almindeligt SU-lån og forældrelån: i alt op til {kr(SU_2026.loan.combinedMonthly)} kr. pr. måned.</li>
          <li>Slutlån: op til {kr(SU_2026.loan.finalMonthly)} kr. pr. måned i de seneste {SU_2026.rules.finalLoanStandardMonths} måneder, i nogle tilfælde {SU_2026.rules.finalLoanExtendedMonths} måneder.</li>
        </ul>
        <p>
          Pr. {SU_2026.verifiedAt} er renten{" "}
          {kr(SU_2026.loan.duringStudyRate * 100)} % under studiet og{" "}
          {kr(SU_2026.loan.afterGraduationRate * 100)} % fra 1. juli 2026 efter uddannelsen.
          Tilbagebetalingen starter 1. januar året efter det år, hvor uddannelsen slutter.
          Almindelig SU-gæld betales typisk hver {SU_2026.loan.repaymentFrequencyMonths}. måned,
          og den officielle løbetid følger lånets størrelse: {SU_2026.loan.repaymentMinYears}
          år op til {SU_2026.loan.repaymentFirstBandMaxDebt.toLocaleString("da-DK")} kr. og op
          til {SU_2026.loan.repaymentMaxYears} år fra{" "}
          {SU_2026.loan.repaymentLastBandMinDebt.toLocaleString("da-DK")} kr. Vores{" "}
          <Link href="/studielaan">studielånsberegner</Link> viser et hypotetisk månedsscenario
          med annuity og er ikke Udbetaling Danmarks endelige afdragsplan. Læs de{" "}
          <a href={SU_2026.sources.loanRepayment} target="_blank" rel="noopener noreferrer">officielle betalingsregler</a>,{" "}
          <a href={SU_2026.sources.loan} target="_blank" rel="noopener noreferrer">SU-lånssatser</a>,{" "}
          <a href={SU_2026.sources.finalLoan} target="_blank" rel="noopener noreferrer">slutlånsregler</a> og{" "}
          <a href={SU_2026.sources.loanInterest} target="_blank" rel="noopener noreferrer">rentetabel</a>.
        </p>

        <h2>SU og skat</h2>
        <p>
          SU og handicaptillæg er skattepligtige. Den faktiske skat afhænger af din samlede
          indkomst, personfradrag, andre fradrag, skattekort og kommune. Derfor kan to studerende med
          samme SU have forskellig skat. Vores SU-beregner viser bevidst kun beløb før skat. Se vores{" "}
          <Link href="/loen-efter-skat">løn efter skat-beregner</Link> for en mere detaljeret
          beregning af arbejdsindkomst.
        </p>

        <h2>Tjek din samlede studieøkonomi</h2>
        <ul>
          <li>Se din aktuelle SU, fribeløb og maksimale SU-lån med <Link href="/su">SU-beregneren</Link>.</li>
          <li>Planlæg afdrag på studiegæld med <Link href="/studielaan">studielånsberegneren</Link>.</li>
          <li>Undersøg din boligudgift med <Link href="/boligstoette">boligstøtteberegneren</Link>.</li>
          <li>Se børnetilskud og afhængige ydelser med <Link href="/boernepenge">børnepengeberegneren</Link>.</li>
        </ul>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Kilder verificeret {SU_2026.verifiedAt}</p>
          <p className="text-green-700 dark:text-green-400">
            Alle konkrete beløb i denne guide kommer fra de officielle su.dk-sider ovenfor. En
            særskilt fungerende fribeløbsberegner findes på{" "}
            <a href={SU_2026.sources.freeAllowanceCalculator} target="_blank" rel="noopener noreferrer" className="underline">su.dk</a>.
          </p>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Skat 2026: Alt du skal vide →</span>
          </Link>
          <Link href="/blog/boligstoette-2026-nye-regler" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Boligstøtte 2026: Nye regler →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
