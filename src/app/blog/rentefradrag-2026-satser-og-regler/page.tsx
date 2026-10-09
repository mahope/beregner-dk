import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import { NaesteSkridt } from "@/components/BlogNaesteSkridt";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { formatBelob, formatNumber } from "@/lib/format";
import { OG_IMAGE } from "@/lib/page-helpers";
import { beregnRentefradrag } from "@/lib/rentefradrag";
import { RENTEFRADRAG_2026 } from "@/lib/satser-2026";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: { absolute: titel },
    description: beskrivelse,
    keywords: [
      "rentefradrag 2026",
      "rentefradrag",
      "rentefradrag beregner",
      "fradrag for renter",
      "rentefradrag realkreditlån",
      "hvor meget er rentefradrag",
    ],
    openGraph: {
      images: OG_IMAGE,
      title: titel,
      description: beskrivelse,
      url: `${baseUrl}/blog/rentefradrag-2026-satser-og-regler`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/rentefradrag-2026-satser-og-regler`,
    },
  };
}

const da = (beloeb: number) => formatNumber(beloeb, "da");
const pct = (vaerdi: number) => `${formatBelob(vaerdi, "da", 1)} %`;
const HOEJ = RENTEFRADRAG_2026.highRate * 100;
const LAV = RENTEFRADRAG_2026.lowRate * 100;
const ENLIG_GRAENSE = RENTEFRADRAG_2026.highRateLimitSingle;
const PAR_GRAENSE = RENTEFRADRAG_2026.highRateLimitCouple;

/**
 * Eksemplet er det samme, beregneren på /rentefradrag bruger: 80.000 kr. i
 * årlige renteudgifter. Alt i teksten læses af disse to kald, så ingen beløb i
 * tabellen, eksemplet eller FAQ'en kan stå i modstrid med værktøjet.
 */
const EKSEMPEL_RENTER = 80_000;
const enlig = beregnRentefradrag(EKSEMPEL_RENTER, "single");
const par = beregnRentefradrag(EKSEMPEL_RENTER, "couple");
const ekstraForPar = par.besparelse - enlig.besparelse;

const titel = `Rentefradrag 2026: ${pct(HOEJ)} af renterne op til ${da(ENLIG_GRAENSE)} kr.`;

const beskrivelse =
  `Rentefradraget i 2026 er ${pct(HOEJ)} af de første ${da(ENLIG_GRAENSE)} kr. ` +
  `(${da(PAR_GRAENSE)} kr. for par) og ${pct(LAV)} af beløbet derover. Se eksempler på 80.000 kr. og hvilke lån der gælder.`;

const faqItems = [
  {
    question: "Hvor meget kan jeg trække fra i renter i 2026?",
    answer:
      `Der er ingen grænse for, hvor store renteudgifter du kan få fradrag for — ` +
      `men fradragsværdien er ${pct(HOEJ)} af de første ${da(ENLIG_GRAENSE)} kr. ` +
      `(${da(PAR_GRAENSE)} kr. for par med fælles økonomi) og ${pct(LAV)} af beløbet derover.`,
  },
  {
    question: "Skal jeg selv gøre noget for at få rentefradraget?",
    answer:
      `Nej. Banken eller realkreditinstituttet indberetter de betalte renter automatisk til Skattestyrelsen, ` +
      `og fradraget kommer med i din forskudsopgørelse og årsopgørelse. Har du lån i udlandet, ` +
      `hvor långiveren ikke indberetter til Danmark, skal du selv oplyse renteudgifterne i TastSelv.`,
  },
  {
    question: "Gælder rentefradraget for forbrugslån og kreditkort?",
    answer:
      `Ja. Renter af forbrugslån og kreditkortgæld er fradragsberettigede efter samme regler som ` +
      `realkredit- og banklån. Da renten på denne type gæld ofte er høj, kan fradraget udgøre ` +
      `et forholdsvis stort beløb, selvom hovedstolen er lille.`,
  },
  {
    question: "Påvirker topskat mit rentefradrag?",
    answer:
      `Nej. Rentefradraget er et kapitalindkomstfradrag, så fradragsværdien afhænger udelukkende af, ` +
      `om dine samlede renteudgifter er over eller under ${da(ENLIG_GRAENSE)} kr. ` +
      `(${da(PAR_GRAENSE)} kr. for par) — ikke af din kommunes skatteprocent og ikke af, om du betaler topskat.`,
  },
  {
    question: "Kan vi fordele renteudgifter mellem os, når vi er par?",
    answer:
      `Ja. Ægtepar og registrerede partnere med fælles økonomi har en fælles beløbsgrænse på ${da(PAR_GRAENSE)} kr. ` +
      `I eksemplet her med ${da(EKSEMPEL_RENTER)} kr. i renter sparer parret ${da(ekstraForPar)} kr. mere om året ` +
      `end to enlige ville gjort hver for sig, fordi hele beløbet rammer den høje sats.`,
  },
  {
    question: "Kan jeg trække afdrag fra?",
    answer:
      `Nej. Kun de renter du betaler i løbet af året er fradragsberettigede. Afdrag på selve gælden giver ikke fradrag, ` +
      `uanset om det er et realkreditlån, et banklån eller et forbrugslån.`,
  },
];

export default function RentefradragBlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BlogArticleSchema
        slug="rentefradrag-2026-satser-og-regler"
        title={titel}
        description={beskrivelse}
        category="Økonomi"
      />

      <nav className="text-sm mb-4 text-gray-600 dark:text-gray-400">
        <Link href="/" className="hover:underline">
          Forside
        </Link>
        {" / "}
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        {" / "}
        <span>Rentefradrag 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <h1>Rentefradrag 2026: sats, regler og hvad du sparer</h1>
        <p className="lead">
          Rentefradrag er en skattebesparelse på <strong>{pct(HOEJ)}</strong> af de første{" "}
          {da(ENLIG_GRAENSE)} kr. i årlige renteudgifter — {da(PAR_GRAENSE)} kr., hvis du er par med
          fælles økonomi. Det er et kapitalindkomstfradrag, så værdien afhænger ikke af din kommune
          og ikke af, om du betaler topskat, og banken indberetter renterne automatisk til Skattestyrelsen.
        </p>

        <h2>Satsen i 2026</h2>
        <p>
          Fradragsværdinen er delt i to trin, og grænsen afhænger af din civilstand — ikke af,
          hvor meget lånet ejer i byen eller hvor høj din indkomst er.
        </p>
        <table>
          <thead>
            <tr>
              <th>Civilstand</th>
              <th>Høj sats</th>
              <th>Grænse</th>
              <th>Resten</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Enlig</td>
              <td>{pct(HOEJ)}</td>
              <td>{da(ENLIG_GRAENSE)} kr.</td>
              <td>{pct(LAV)}</td>
            </tr>
            <tr>
              <td>
                <strong>Par med fælles økonomi</strong>
              </td>
              <td>{pct(HOEJ)}</td>
              <td>{da(PAR_GRAENSE)} kr.</td>
              <td>{pct(LAV)}</td>
            </tr>
          </tbody>
        </table>
        <p>
          Der er ingen loft på selve renteudgiften, du kan få fradrag for — grænsen gælder kun
          for, hvor stor en andel af beløbet der får den høje sats. For beløb over grænsen
          er fradragsværdien {pct(LAV)}.
        </p>

        <h2>Eksempel: {da(EKSEMPEL_RENTER)} kr. i renteudgifter</h2>
        <p>
          Med {da(EKSEMPEL_RENTER)} kr. i årlige renteudgifter regner beregneren således:
        </p>
        <table>
          <thead>
            <tr>
              <th>Civilstand</th>
              <th>Høj sats af</th>
              <th>Lav sats af</th>
              <th>Skattebesparelse</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Enlig</td>
              <td>{da(enlig.hoejAndel)} kr.</td>
              <td>{da(enlig.lavAndel)} kr.</td>
              <td>
                <strong>{da(Math.round(enlig.besparelse))} kr.</strong>
              </td>
            </tr>
            <tr>
              <td>Par med fælles økonomi</td>
              <td>{da(par.hoejAndel)} kr.</td>
              <td>{da(par.lavAndel)} kr.</td>
              <td>
                <strong>{da(Math.round(par.besparelse))} kr.</strong>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          Det enlige eksempel er {da(enlig.hoejAndel)} × {pct(HOEJ)} + {da(enlig.lavAndel)} × {pct(LAV)} =
          {" "}{da(Math.round(enlig.besparelse))} kr. Parret har hele {da(EKSEMPEL_RENTER)} kr. under grænsen på{" "}
          {da(PAR_GRAENSE)} kr., altså {pct(HOEJ)} af det hele = {da(Math.round(par.besparelse))} kr.
          Forskellen på at fordele renteudgifterne mellem sig er {da(Math.round(ekstraForPar))} kr. om året.
        </p>

        <h2>Hvilke lån giver rentefradrag?</h2>
        <p>
          Fradraget gælder alle betalte renter i løbet af året — ikke afdrag. Det mest almindelige
          eksempel er et realkreditlån til din helårsbolig, men reglen dækker flere typer gæld:
        </p>
        <ul>
          <li>Realkreditlån til din helårsbolig — typisk den største post.</li>
          <li>Banklån, herunder billån og kassekredit i banken.</li>
          <li>Forbrugslån og kreditkortgæld, hvor den høje rente gør fradraget mærkbart.</li>
          <li>Studielån fra Statens Uddannelsesstøtte.</li>
          <li>Lån til et sommerhus i Danmark regnes sammen med dine øvrige renteudgifter.</li>
        </ul>
        <p>
          Renteindtægter og renteudgifter modregnes først, så det er den samlede negative
          kapitalindkomst, der giver fradrag. Har du fået renter af dine opspguldfri penge,
          trækkes dem fra, før fradraget beregnes.
        </p>

        <h2>Sådan kommer fradraget med i din skat</h2>
        <p>
          Din bank eller realkreditinstitut indberetter de betalte renter automatisk til
          Skattestyrelsen, og fradraget indgår i din forskudsopgørelse og årsopgørelse — du
          behøver som udgangspunkt ikke gøre noget selv. Har du lån i udlandet, hvor långiveren
          ikke indberetter til Danmark, skal du selv oplyse renteudgifterne i TastSelv.
        </p>
        <p>
          Tjek altid din forskudsopgørelse, især hvis du har omlagt et lån eller skiftet bank
          i løbet af året. Ved omlægning til en lavere rente falder dine renteudgifter — og
          dermed også fradraget i kroner og øre — selvom det typisk stadig er en økonomisk
          fordel samlet set.
        </p>
        <p>
          <Link href="/rentefradrag">Beregn dit rentefradrag med vores beregner</Link> — den lægger
          dine lån og eventuelle renteindtægter sammen og regner skattebesparelsen ud med
          2026-satserne. Og har du flere fradrag, kan du{" "}
          <Link href="/skattefradrag">sammenligne dem med dine øvrige skattefradrag</Link>.
        </p>

        <FAQItems items={faqItems} />
      </article>

      <NaesteSkridt
        href="/rentefradrag"
        handling="Beregn dit rentefradrag"
        beskrivelse="Læg dine lån og eventuelle renteindtægter ind, og få skattebesparelsen ud med 2026-satserne."
        sekundaer={{ href: "/skattefradrag", handling: "Sammenlign med dine øvrige skattefradrag" }}
      />

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4">
          <Link href="/rentefradrag" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Rentefradragsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn skattebesparelsen af dine renteudgifter</p>
          </Link>
          <Link href="/renteberegner" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Renteberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvordan renterne udgør din månedlige ydelse</p>
          </Link>
          <Link href="/skattefradrag" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Skattefradragsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Læg alle dine fradrag sammen og se værdien</p>
          </Link>
          <Link href="/boliglaan" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boliglånsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn ydelse og renteudgifter på dit realkreditlån</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/fradrag-2026-komplet-guide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Fradrag 2026: komplet guide →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Alle fradragene på ét sted, med satser for 2026</p>
          </Link>
          <Link href="/blog/boliglaan-2026-renter-og-afdrag" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boliglån 2026: renter og afdrag →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Renteudgifter, afdragsformer og hvad et lån koster</p>
          </Link>
          <Link href="/blog/skat-2026-alt-du-skal-vide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Skat 2026: alt du skal vide →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ændringer i skatten, og hvad de betyder for din lønseddel</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function FAQItems({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="mt-8">
      {items.map((item) => (
        <div key={item.question} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.question}</h3>
          <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
        </div>
      ))}
      <FAQSchema items={items} />
    </div>
  );
}
