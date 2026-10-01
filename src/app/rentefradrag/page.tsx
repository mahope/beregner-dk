import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import RentefradragBeregner from "@/components/RentefradragBeregner";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";
import { RENTEFRADRAG_2026 } from "@/lib/satser-2026";
import { beregnRentefradrag } from "@/lib/rentefradrag";

const HOEJ_SATS_PCT = (RENTEFRADRAG_2026.highRate * 100).toLocaleString("da-DK");
const LAV_SATS_PCT = (RENTEFRADRAG_2026.lowRate * 100).toLocaleString("da-DK");

/** Beløbet der bruges i "loft"-afsnittet — over grænsen, så begge satser ses. */
const LOFT_EKSEMPEL_BELOEB = 80_000;

const formatSats = (sats: number) => `${sats.toFixed(1).replace(".", ",")} %`;

const loftEksempel = beregnRentefradrag(LOFT_EKSEMPEL_BELOEB, "single");
const loftEksempelPar = beregnRentefradrag(LOFT_EKSEMPEL_BELOEB, "couple");
const hoejAndelEksempel = loftEksempel.hoejAndel * RENTEFRADRAG_2026.highRate;
const lavAndelEksempel = loftEksempel.lavAndel * RENTEFRADRAG_2026.lowRate;

/**
 * Ujævn fordeling: 95.000 kr. hos den ene, 5.000 kr. hos den anden.
 * Sammenlignes mod de samme 100.000 kr. som ét fælles beløb for et par.
 */
const ULIJ_HAEJ = 95_000;
const ULIJ_LAV = 5_000;
const uligBesparelseSamlet = beregnRentefradrag(ULIJ_HAEJ + ULIJ_LAV, "couple").besparelse;
const uligBesparelseFordelt =
  beregnRentefradrag(ULIJ_HAEJ, "single").besparelse +
  beregnRentefradrag(ULIJ_LAV, "single").besparelse;

import Link from "next/link";

export async function generateMetadata() {
  return generatePageMetadata("rentefradrag");
}

export default async function RentefradragPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("rentefradrag", locale) || getPageData("rentefradrag", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/rentefradrag`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/rentefradrag" }]} />

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
            <RentefradragBeregner />
          </section>

          {locale === "da" && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Om rentefradrag
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                <strong>Rentefradrag</strong> er en af de mest værdifulde <strong>skattefordele</strong> for boligejere i Danmark.
                Når du betaler renter på dit lån, får du lov til at <strong>trække en del fra i skat</strong>.
                Det betyder, at staten reelt betaler en del af dine <strong>renteudgifter</strong>.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Fradragssatser 2026</h3>
              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3 text-left">Renteudgifter</th>
                    <th className="border p-3 text-left">Fradragsværdi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">
                      De første {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. (enlig) /{" "}
                      {RENTEFRADRAG_2026.highRateLimitCouple.toLocaleString("da-DK")} kr. (par)
                    </td>
                    <td className="border p-3">{HOEJ_SATS_PCT}%</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Beløbet over grænsen</td>
                    <td className="border p-3">{LAV_SATS_PCT}%</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm text-gray-700 mt-2">
                Fradragsværdien afhænger af beløbsgrænsen — <strong>ikke af din kommune</strong> og
                ikke af om du betaler topskat. Rentefradraget er et kapitalindkomstfradrag, så
                topskat på din øvrige indkomst hæver ikke værdien. Er der både renteudgifter og
                renteindtægter, nettinges de først, så det er det samlede beløb, der tæller.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                * Kilde:{" "}
                <a
                  href={RENTEFRADRAG_2026.officialRules}
                  className="underline hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Skattestyrelsen, fradrag for renteudgifter
                </a>{" "}
                (hvilke renter der kan fradrages, og at banken indberetter dem automatisk) og{" "}
                <a
                  href={RENTEFRADRAG_2026.ratesReference}
                  className="underline hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Borgerhåndbog, rentefradrag
                </a>{" "}
                for beløbsgrænsen på {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. /{" "}
                {RENTEFRADRAG_2026.highRateLimitCouple.toLocaleString("da-DK")} kr. Verificeret{" "}
                {RENTEFRADRAG_2026.verifiedAt}.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                Er der et loft på rentefradraget?
              </h3>
              <p>
                Nej — og det er det svar, de fleste søger efter, fordi tallet{" "}
                {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. ofte
                forveksles med en grænse for, hvor meget du overhovedet kan trække fra.
                <strong> Der er intet loft på selve renteudgifterne</strong>: du kan
                indberette og trække fra alle de renter, du betaler. Det, der er begrænset,
                er kun hvor stor en andel af beløbet der giver den høje
                fradragsværdi på {HOEJ_SATS_PCT} %.
              </p>
              <p className="mt-3">
                Forskellen er stor, fordi den lave sats er {LAV_SATS_PCT} % — så det er
                ikke "alt eller intet", men en trinvis nedtrapning. En enlig med{" "}
                {LOFT_EKSEMPEL_BELOEB.toLocaleString("da-DK")} kr. i renteudgifter får:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>
                  {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. ×{" "}
                  {HOEJ_SATS_PCT} % ={" "}
                  {hoejAndelEksempel.toLocaleString("da-DK")} kr.
                </li>
                <li>
                  {(LOFT_EKSEMPEL_BELOEB - RENTEFRADRAG_2026.highRateLimitSingle).toLocaleString("da-DK")} kr. ×{" "}
                  {LAV_SATS_PCT} % = {lavAndelEksempel.toLocaleString("da-DK")} kr.
                </li>
                <li>
                  <strong>
                    I alt {loftEksempel.besparelse.toLocaleString("da-DK")} kr. — svarende
                    til en effektiv sats på {formatSats(loftEksempel.effektivSats)}
                  </strong>
                </li>
              </ul>
              <p className="text-sm text-gray-700 mt-3">
                Den effektive sats er altså <strong>lavere end {HOEJ_SATS_PCT} %</strong>{" "}
                for alle, der kommer over grænsen. Grænsen er de{" "}
                {RENTEFRADRAG_2026.highRateLimitSingle.toLocaleString("da-DK")} kr. hos en
                enlig og {RENTEFRADRAG_2026.highRateLimitCouple.toLocaleString("da-DK")} kr. hos
                et par, så det er den du skal holde øje med — ikke et loft.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">
                Skal par fordele renterne mellem sig?
              </h3>
              <p>
                Det er et godt råd, der ofte gives — men med <strong>præcis samme</strong>{" "}
                fradragsværdi i de fleste tilfælde, fordi den fælles grænse er dobbelt så stor
                som den enkelte. Et par med {LOFT_EKSEMPEL_BELOEB.toLocaleString("da-DK")} kr. i
                renter får {loftEksempelPar.besparelse.toLocaleString("da-DK")} kr. i
                besparelse, uanset om beløbet står på den ene eller deles i to halvdele.
              </p>
              <p className="mt-3">
                Det bliver først en fordel at fordele, når renterne er{" "}
                <strong>ujævnt fordelt</strong>, fordi den enkeltes lavere sats så kan bruges
                på den andens høje sats. Fordel 95.000 kr. og 5.000 kr. i stedet for
                100.000 kr. samlet, og besparelsen falder fra{" "}
                {uligBesparelseSamlet.toLocaleString("da-DK")} kr. til{" "}
                {uligBesparelseFordelt.toLocaleString("da-DK")} kr. — altså{" "}
                {Math.abs(uligBesparelseFordelt - uligBesparelseSamlet).toLocaleString("da-DK")}{" "}
                kr. mindre. Den høje sats skal bruges på den med flest renter.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                * Kilde:{" "}
                <a
                  href={RENTEFRADRAG_2026.ratesReference}
                  className="underline hover:text-gray-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Borgerhåndbog, rentefradrag
                </a>{" "}
                — "Der er ikke et loft på selve renteudgiften, du kan indberette — kun på,
                hvor stor en andel af beløbet der giver den høje fradragsværdi."
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Eksempel</h3>
              <p>
                Hvis du har{" "}
                <strong>
                  {LOFT_EKSEMPEL_BELOEB.toLocaleString("da-DK")} kr. i årlige renteudgifter
                </strong>{" "}
                som enlig:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  De første {loftEksempel.hoejAndel.toLocaleString("da-DK")} kr. giver
                  fradrag: {loftEksempel.hoejAndel.toLocaleString("da-DK")} ×{" "}
                  {HOEJ_SATS_PCT}% ={" "}
                  {(loftEksempel.hoejAndel * RENTEFRADRAG_2026.highRate).toLocaleString("da-DK")} kr.
                </li>
                <li>
                  De næste {loftEksempel.lavAndel.toLocaleString("da-DK")} kr. giver
                  fradrag: {loftEksempel.lavAndel.toLocaleString("da-DK")} ×{" "}
                  {LAV_SATS_PCT}% ={" "}
                  {(loftEksempel.lavAndel * RENTEFRADRAG_2026.lowRate).toLocaleString("da-DK")} kr.
                </li>
                <li>
                  <strong>
                    Samlet skattebesparelse: {loftEksempel.besparelse.toLocaleString("da-DK")} kr.
                  </strong>
                </li>
                <li>
                  Er I gift eller samlevende med fælles økonomi, er grænsen{" "}
                  {loftEksempelPar.graense.toLocaleString("da-DK")} kr., så hele beløbet ville
                  give {LOFT_EKSEMPEL_BELOEB.toLocaleString("da-DK")} × {HOEJ_SATS_PCT}% ={" "}
                  {(LOFT_EKSEMPEL_BELOEB * RENTEFRADRAG_2026.highRate).toLocaleString("da-DK")} kr.
                </li>
              </ul>
              <p className="text-sm text-gray-700 mt-3">
                Vil du se, hvad et lån koster dig i renter, før du regner på fradraget, kan du
                bruge <Link href="/renteberegner" className="underline">renteberegneren</Link>.
              </p>
            </div>
          </section>
          )}

          <section className="mb-12">
            <FAQ items={pageData.faqItems} />
          </section>

          <section>
            <RelatedCalculators current="/rentefradrag" />
          </section>

          <RelateredeArtikler current="/rentefradrag" locale={locale} />
        </article>
      </main>
    </div>
  );
}
