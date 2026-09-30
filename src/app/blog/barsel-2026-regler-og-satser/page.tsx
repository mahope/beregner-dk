import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import { NaesteSkridt } from "@/components/BlogNaesteSkridt";
import { BARSEL_2026 } from "@/lib/satser-2026";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";
import {
  adoption,
  flerling,
  flerlingUgevaerdi,
  indlaeggelse,
} from "@/lib/barsel/special";

const maxWeeklyRate = BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK");
const maxHourlyRate = BARSEL_2026.maxHourlyRate.toLocaleString("da-DK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const f = flerling();
const a = adoption();
const ind = indlaeggelse();
const flerlingPris = flerlingUgevaerdi().toLocaleString("da-DK");

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: { absolute: "Barsel 2026: Sats, orlov og overdragelse" },
    description: `Barsel 2026 med ${maxWeeklyRate} kr. pr. uge før skat, ${maxHourlyRate} kr. pr. time og de aktuelle regler for øremærket orlov, overdragelse og ansøgningsfrister.`,
    keywords: [
      "barsel 2026",
      "barselsdagpenge 2026",
      "barselsorlov 2026",
      "øremærket barsel",
      "barsel far 2026",
      "barsel mor 2026",
      "barselsdagpenge sats",
      "barsel tvillinger 2026",
      "barselsregler tvillinger",
      "barsel flerlinger",
      "barsel indlæggelse",
      "barsel adoption",
    ],
    openGraph: {
      images: OG_IMAGE,
      title: "Barsel 2026: Sats, orlov og overdragelse",
      description: `Det korte svar: ${maxWeeklyRate} kr. pr. uge før skat ved ${BARSEL_2026.fullTimeHours} timer i 2026. Se også reglerne for orlov og overdragelse.`,
      url: `${baseUrl}/blog/barsel-2026-regler-og-satser`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/barsel-2026-regler-og-satser`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er barselsdagpengesatsen i 2026?",
    answer: `For en lønmodtager er den maksimale sats ${maxWeeklyRate} kr. pr. uge før skat ved ${BARSEL_2026.fullTimeHours} timer, svarende til ${maxHourlyRate} kr. pr. time før skat. Hvis din timeløn er lavere, får du din normale timeløn.`,
  },
  {
    question: "Hvor lang tid kan man holde barselsorlov?",
    answer: `Når forældrene bor sammen ved fødslen, har hver ${BARSEL_2026.afterBirthWeeks} uger med barselsdagpenge efter fødslen. Mor kan også holde ${BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen.`,
  },
  {
    question: "Hvad er øremærket barsel?",
    answer: `Hver forælder har ${BARSEL_2026.earmarkedWeeks} uger øremærket barsel, som ikke kan overdrages. Hvis de ikke bruges, går de som udgangspunkt forbi, medmindre særlige forhold forhindrer brugen. Reglen gælder for børn født fra ${BARSEL_2026.earmarkedModelStart}.`,
  },
  {
    question: "Hvornår skal jeg søge om barselsdagpenge?",
    answer: `Hvis du får løn under barsel, skal du som udgangspunkt søge senest ${BARSEL_2026.applicationDeadlineWeeks} uger efter, at lønnen stopper. Hvis mor ikke får løn og holder mindst ${BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen, er fristen ${BARSEL_2026.applicationDeadlineWeeks} uger efter fødslen. Far/medmor skal søge senest ${BARSEL_2026.applicationDeadlineWeeks} uger efter første orlovsdag. En for sen ansøgning giver som udgangspunkt først ydelse fra den dag, Udbetaling Danmark modtager ansøgningen.`,
  },
  {
    question: "Hvor mange uger får man ved tvillinger?",
    answer: `Hver forælder får ${f.ekstraUgerPrForaelder} ekstra uger med barselsdagpenge, så I har ${f.totalUgerPrForaelder} uger hver i stedet for ${BARSEL_2026.afterBirthWeeks}. Det er ${f.ekstraUgerPrForaelder} uanset antallet af børn — tre børn giver ikke 3 gange ${f.ekstraUgerPrForaelder} uger. Ugerne er ikke øremærkede og skal holdes inden for det første år.`,
  },
  {
    question: "Hvad hvis barnet er indlagt på hospitalet?",
    answer: `Så forlænges fraværsperioden, hvis indlæggelsen sker inden for de første ${ind.vindueUger} uger. For børn født fra ${ind.nyRegelDato} er der højst ${ind.maksUger} uger pr. forælder (12 måneder). Før ${ind.nyRegelDato} var loftet ${ind.maksUgerFoer2026} uger i alt (3 måneder). Reglen afgøres efter fødselsdatoen, ikke efter hvornår du søger.`,
  },
  {
    question: "Hvor mange uger får man ved adoption?",
    answer: `Hver adoptant får ${a.totalUgerPrAdoptant} uger: ${a.tidligeUger} uger i de første 10 uger efter modtagelsen (hvoraf op til ${a.tidligeOverdragelige} kan overdrages til den anden adoptant) og ${a.efterUge10} uger efter uge 10. Det er de samme ${a.totalUgerPrAdoptant} uger som en fødsel giver. En eneadoptant får ${a.totalUgerEnadoptant} uger.`,
  },
];

export default function BarselGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <BlogArticleSchema
        slug="barsel-2026-regler-og-satser"
        title="Barsel 2026: Sats, orlov og overdragelse"
        description="barsel 2026"
      />
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Barsel 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Familie & Barsel</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Barsel 2026: Sats, orlov og overdragelse
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>8 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Det vigtigste ved barsel 2026 er, at en lønmodtager ved {BARSEL_2026.fullTimeHours} timer kan få højst {maxWeeklyRate} kr. i barselsdagpenge om ugen før skat. Sådan beregnes beløbet, og sådan er orloven fordelt.
        </p>

        <h2>Det korte svar</h2>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 not-prose dark:border-blue-800 dark:bg-blue-900/20">
          <p className="font-semibold text-blue-900 dark:text-blue-200">Maks. {maxWeeklyRate} kr. pr. uge før skat</p>
          <p className="mt-1 text-blue-800 dark:text-blue-300">
            Det svarer til {maxHourlyRate} kr. pr. time ved {BARSEL_2026.fullTimeHours} timer. Hvis din timeløn er lavere, udbetales din normale timeløn for de timer, du holder orlov.
          </p>
          <p className="mt-3">
            <Link href="/barselsdagpenge" className="font-medium text-blue-700 underline dark:text-blue-300">Beregn din barselsdagpenge</Link>
          </p>
        </div>

        <h2>Barselsdagpenge-satser 2026</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Sats (2026)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Maks. pr. uge ved {BARSEL_2026.fullTimeHours} timer</td>
                <td>{maxWeeklyRate} kr. før skat</td>
              </tr>
              <tr>
                <td>Maks. pr. time</td>
                <td>{maxHourlyRate} kr. før skat</td>
              </tr>
              <tr>
                <td>Under maksimum</td>
                <td>Din normale timeløn × orlovstimer</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          Kilde: <a href={BARSEL_2026.source} className="underline">Borger.dk, lønmodtager på barsel</a>, verificeret {BARSEL_2026.verifiedAt}. Beregningen er et estimat; Udbetaling Danmark træffer den endelige afgørelse.
        </p>

        <h2>Barselsorlovens perioder</h2>
        <p>
          Når forældrene bor sammen ved fødslen, har hver forælder som udgangspunkt {BARSEL_2026.afterBirthWeeks} uger med barselsdagpenge efter fødslen. Sådan er de fordelt:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th>Mor</th>
                <th>Far/medmor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Før fødsel</td>
                <td>{BARSEL_2026.motherBeforeBirthWeeks} uger</td>
                <td>–</td>
              </tr>
              <tr>
                <td>Ved fødsel</td>
                <td>{BARSEL_2026.motherAtBirthWeeks} uger, ikke overdragbare</td>
                <td>{BARSEL_2026.fatherAtBirthWeeks} uger i de første {BARSEL_2026.firstTenWeeksAfterBirth} uger, kan fordeles fleksibelt efter aftale med arbejdsgiveren</td>
              </tr>
              <tr>
                <td>Første {BARSEL_2026.firstTenWeeksAfterBirth} uger efter fødsel</td>
                <td>{BARSEL_2026.motherEarlyAfterBirthWeeks} uger</td>
                <td>–</td>
              </tr>
              <tr>
                <td>Øremærket til hver forælder</td>
                <td>{BARSEL_2026.earmarkedWeeks} uger</td>
                <td>{BARSEL_2026.earmarkedWeeks} uger</td>
              </tr>
              <tr>
                <td>Efter de første {BARSEL_2026.firstTenWeeksAfterBirth} uger</td>
                <td>{BARSEL_2026.motherLateTransferableWeeks} uger</td>
                <td>–</td>
              </tr>
              <tr>
                <td>Kan overdrages</td>
                <td>{BARSEL_2026.motherEarlyAfterBirthWeeks} + {BARSEL_2026.motherLateTransferableWeeks} uger under særlige betingelser</td>
                <td>{BARSEL_2026.maxTransferableWeeks} uger</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Far/medmor kan aftale med arbejdsgiveren at fordele de {BARSEL_2026.fatherAtBirthWeeks} uger fleksibelt inden for de første {BARSEL_2026.firstTenWeeksAfterBirth} uger. Mor kan under særlige betingelser overdrage sine {BARSEL_2026.motherEarlyAfterBirthWeeks} + {BARSEL_2026.motherLateTransferableWeeks} uger. Far/medmor kan overdrage op til {BARSEL_2026.maxTransferableWeeks} uger. Overdragelse skal aftales og anmeldes, og overdragne uger skal som udgangspunkt holdes inden for barnets første år med mulighed for forlængelse.
        </p>

        <h2>Sådan fungerer øremærket barsel</h2>
        <p>
          Hver forælder har {BARSEL_2026.earmarkedWeeks} ugers øremærket barsel. Disse uger kan ikke overdrages til den anden forælder. Hvis de ikke bruges, går de som udgangspunkt forbi, medmindre særlige forhold forhindrer brugen. Det gælder for børn født fra {BARSEL_2026.earmarkedModelStart}.
        </p>
        <ul>
          <li>Øremærket barsel kan ikke overdrages.</li>
          <li>Du skal selv tilpasse barselsplanen, hvis I vil fordele orloven.</li>
          <li>Arbejdsgiveren skal fortsat have en samlet orlovsplan for perioden.</li>
        </ul>

        <h2>Hvem kan få barselsdagpenge?</h2>
        <p>
          For lønmodtagere gælder beskæftigelseskravet ved starten af hver fraværsperiode. Du skal blandt andet have været ansat på den første dag i orloven eller dagen før.
        </p>
        <ul>
          <li>Mindst {BARSEL_2026.employmentHours} arbejdstimer inden for de seneste {BARSEL_2026.employmentMonths} hele måneder</li>
          <li>Mindst {BARSEL_2026.monthlyHoursThreshold} timer om måneden i mindst {BARSEL_2026.monthsWithMonthlyHours} af de {BARSEL_2026.employmentMonths} måneder</li>
          <li>Daglig kontakt med barnet</li>
        </ul>
        <p>Selvstændige, ledige og studerende har separate regler. Se <a href="https://barselsdagpenge.dk" className="underline">Min barsel</a> for den officielle ansøgning.</p>

        <h2>Tvillinger og flerlinger: {f.ekstraUgerPrForaelder} ekstra uger hver</h2>
        <p>
          Får I to eller flere børn ved samme fødsel, får <strong>hver forælder {f.ekstraUgerPrForaelder} ekstra uger</strong> med barselsdagpenge. I alt bliver det {f.totalUgerPrForaelder} uger pr. forælder i stedet for {BARSEL_2026.afterBirthWeeks}.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Situation</th>
                <th>Uger pr. forælder</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ét barn</td>
                <td>{BARSEL_2026.afterBirthWeeks} uger</td>
              </tr>
              <tr>
                <td>Tvillinger, trillinger eller flere</td>
                <td>{BARSEL_2026.afterBirthWeeks} + {f.ekstraUgerPrForaelder} = <strong>{f.totalUgerPrForaelder} uger</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>Regnestykket:</strong> {maxWeeklyRate} kr. × {f.ekstraUgerPrForaelder} uger = {flerlingPris} kr. før skat, hvis I begge er på den maksimale sats.
        </p>
        <p>
          Der er tre ting, der ofte misforstås ved flerlinger:
        </p>
        <ul>
          <li>
            <strong>Det er {f.ekstraUgerPrForaelder} uanset hvor mange børn.</strong> Tre børn giver præcis det samme ekstra som to — ikke 3 × {f.ekstraUgerPrForaelder}.
          </li>
          <li>
            <strong>Ugerne er ikke øremærkede.</strong> De kan bruges frit af den forælder, der tager dem, og skal holdes inden for det første år ({f.fristUger} uger).
          </li>
          <li>
            <strong>En soloforælder kan give dem videre.</strong> Er du alene med børnene, kan du tildele en nærtstående eller social forælder op til {f.tilNaertstaaendeMaks} af ugerne.
          </li>
        </ul>

        <h2>Når barnet er indlagt: op til {ind.maksUger} ugers forlængelse</h2>
        <p>
          Bliver barnet indlagt på hospital — eller i tidligt hjemmeophold — kan fraværsperioden forlænges. Det gælder både hvis I ikke genoptager arbejdet, og hvis I gør det: så udsættes den resterende orlov til efter udskrivningen.
        </p>
        <ul>
          <li>
            <strong>Indlæggelsen skal ske inden for de første {ind.vindueUger} uger</strong> efter fødslen, ellers giver det ikke længere tid.
          </li>
          <li>
            <strong>Børn født fra {ind.nyRegelDato}: højst {ind.maksUger} uger pr. forælder</strong> — svarende til 12 måneder.
          </li>
          <li>
            <strong>Før {ind.nyRegelDato}: højst {ind.maksUgerFoer2026} uger i alt</strong> (3 måneder). Det er den gamle regel, som mange tekster stadig skriver.
          </li>
          <li>Genoptager I arbejdet, skal barnet udskrives inden {ind.udskrivningSenestUger} uger.</li>
        </ul>
        <p>
          Reglen skelner altså på <strong>fødselsdatoen</strong>, ikke på hvornår I søger. Et barn født 31. december 2025 følger de gamle 3 måneder, mens et barn født 1. januar 2026 får de fulde 12 måneder.
        </p>

        <h2>Adoption: {a.totalUgerPrAdoptant} uger pr. adoptant</h2>
        <p>
          Bliver I adoptant, har I de samme {a.totalUgerPrAdoptant} uger som forældre efter en fødsel — men de ligger anderledes i forhold til barnets ankomst.
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Periode</th>
                <th>Uger pr. adoptant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Før modtagelse, adoption fra udlandet</td>
                <td>{a.ugerFoerModtagelseUdland} uger</td>
              </tr>
              <tr>
                <td>Før modtagelse, adoption i Danmark</td>
                <td>{a.ugerFoerModtagelseDanmark} uge</td>
              </tr>
              <tr>
                <td>Første 10 uger efter modtagelse</td>
                <td>{a.tidligeUger} uger, hvoraf op til {a.tidligeOverdragelige} kan overdrages</td>
              </tr>
              <tr>
                <td>Efter uge 10</td>
                <td>{a.efterUge10} uger</td>
              </tr>
              <tr>
                <td><strong>I alt</strong></td>
                <td>{a.tidligeUger} + {a.efterUge10} = <strong>{a.totalUgerPrAdoptant} uger</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <strong>En eneadoptant får {a.totalUgerEnadoptant} uger.</strong> Det er de {a.tidligeUger} + {a.efterUge10} uger plus de 22 ekstra uger, der gælder for en forælder alene med barnet. Ud af de {a.efterUge10} uger efter uge 10 er {a.oeremaerketUger} øremærkede, hvis du er lønmodtager.
        </p>
        <p>
          Børnene skal være under 1 år ved modtagelsen. Er I to adoptanter, kan op til {a.tidligeOverdragelige} af de {a.tidligeUger} tidlige uger overdrages til den anden — de resterende {a.tidligeUger - a.tidligeOverdragelige} er ikke overdragelige.
        </p>
        <p>
          Kilde til alle tre afsnit: <a href={f.kilde} className="underline">Barselsloven, LBK nr. 206 af 22. januar 2026</a> — § 14 a om flerlinger, § 14 om indlæggelse og § 8 og § 21 om adoption.
        </p>

        <h2>Vigtige frister</h2>
        <ul>
          <li>Hvis du får løn under barsel: søg senest {BARSEL_2026.applicationDeadlineWeeks} uger efter, at lønnen stopper.</li>
          <li>Hvis mor ikke får løn og holder mindst {BARSEL_2026.motherBeforeBirthWeeks} uger før fødslen: søg senest {BARSEL_2026.applicationDeadlineWeeks} uger efter fødslen.</li>
          <li>For far/medmor: søg senest {BARSEL_2026.applicationDeadlineWeeks} uger efter første orlovsdag.</li>
          <li>En for sen ansøgning giver som udgangspunkt først ydelse fra den dag, Udbetaling Danmark modtager ansøgningen.</li>
          <li>Udbetaling Danmark oplyser normalt, at du får svar inden for {BARSEL_2026.applicationProcessingDays} hverdage.</li>
        </ul>

        <h2>Fuld løn under barsel</h2>
        <p>
          Din overenskomst eller ansættelseskontraft afgør, om du har løn under barsel. Hvis arbejdsgiveren betaler løn, kan arbejdsgiveren få barselsdagpenge som refusion. Det er derfor vigtigt at aftale orlov og løn med arbejdsgiveren.
        </p>

        <h2>Barsel for selvstændige</h2>
        <p>
          Selvstændige har en anden beregning og andre dokumentationskrav end lønmodtagere. Start derfor med Min barsel, når du er usikker på din ret, i stedet for at bruge et generelt estimat.
        </p>

        <h2>Planlægning af barsel</h2>
        <ul>
          <li><strong>Planlæg tidligt:</strong> Lav en barselsplan med din partner og arbejdsgiver – fx i vores <Link href="/barselsplanlaegger" className="text-blue-600 hover:underline">barselsplanlægger</Link>, der viser uger, frister og økonomi. Den kan også regne på flerlinger, indlæggelse og adoption.</li>
          <li><strong>Tjek overenskomsten:</strong> Den aftaler, om du har løn under barsel.</li>
          <li><strong>Fordel øremærket orlov:</strong> Reserver de {BARSEL_2026.earmarkedWeeks} uger til den rigtige forælder.</li>
          <li><strong>Beregn økonomien:</strong> Brug vores <Link href="/barselsdagpenge" className="text-blue-600 hover:underline">barselsdagpenge-beregner</Link> som et vejledende estimat.</li>
          <li><strong>Søg børnepenge:</strong> Du kan søge <Link href="/boernepenge" className="text-blue-600 hover:underline">børnepenge</Link> fra barnets fødsel.</li>
        </ul>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <NaesteSkridt
        href="/barselsdagpenge"
        handling="Beregn din barselsdagpenge"
        beskrivelse="Se dagpengen for hver uge ud fra din timeløn og dine orlovsuger. Beregningen er et estimat, og Udbetaling Danmark træffer den endelige afgørelse."
        sekundaer={{
          href: "/barselsplanlaegger",
          handling: "Planlæg dine uger med barselsplanlæggeren",
        }}
      />

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/guide-feriepenge-hvornaar-og-hvor-meget" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide: Feriepenge — hvornår og hvor meget? →</span>
          </Link>
          <Link href="/blog/dagpenge-saadan-finder-du-din-sats" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Dagpenge: Sådan finder du din sats →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
