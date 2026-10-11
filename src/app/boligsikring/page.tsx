import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BoligsikringBeregner from "@/components/BoligsikringBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { formatBelob } from "@/lib/format";
import { BOLIGSIKRING_2026, BOLIGSIKRING_KILDER } from "@/lib/boligsikring";

const kr = (vaerdi: number) => `${formatBelob(vaerdi, "da")} kr.`;

export async function generateMetadata() {
  return generatePageMetadata("boligsikring");
}

export default async function BoligsikringPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boligsikring", locale) || getPageData("boligsikring", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/boligsikring`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs
        items={[
          { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
          { name: pageData.title, href: "/boligsikring" },
        ]}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{pageData.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{pageData.description}</p>
          </header>

          <section className="mb-12">
            <BoligsikringBeregner />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hvem kan få boligsikring?
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-4">
              <p>
                Boligsikring er boligstøtte til lejere, der ikke er pensionister. Førtidspensionister,
                som er tilkendt efter 1. januar 2003, kan også få boligsikring. Boligsikring gives
                som udgangspunkt kun til boliger med eget køkken, og du skal bruge en ansøgning hos
                Udbetaling Danmark.
              </p>
              <p>
                Der er tre satser du skal kende, når du skal regne på det: huslejeandelen på{" "}
                {formatBelob(BOLIGSIKRING_2026.huslejeandelPct * 100, "da")} pct. af huslejen,
                indkomstandelen på {formatBelob(BOLIGSIKRING_2026.indkomstandelPct * 100, "da")} pct. af
                husstandsindkomsten over indkomstgrænsen, og indkomstgrænsen selv på{" "}
                <strong>{kr(BOLIGSIKRING_2026.indkomstGraense)}</strong> i 2026.
              </p>
            </div>
            <table className="w-full border-collapse mt-4 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Sats</th>
                  <th className="border p-3 text-left">Beløb i 2026</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3">Indkomstgrænse (§ 22, stk. 1)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.indkomstGraense)}</td>
                </tr>
                <tr>
                  <td className="border p-3">Forøgelse for 2. til 4. barn (§ 22, stk. 1)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.indkomstGraensePrBarn)}</td>
                </tr>
                <tr>
                  <td className="border p-3">Mindste egenbetaling (§ 22, stk. 2)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.mindstEgenbetaling)}</td>
                </tr>
                <tr>
                  <td className="border p-3">Maksimal årlig boligsikring (§ 23, stk. 1)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.maksBoligsikring)}</td>
                </tr>
                <tr>
                  <td className="border p-3">Maksimal husleje (§ 14, stk. 1)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.maksHusleje)}</td>
                </tr>
                <tr>
                  <td className="border p-3">Formuegrænse for 10 pct. (§ 8 a)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.formueGraenseLav)}</td>
                </tr>
                <tr>
                  <td className="border p-3">Formuegrænse for 20 pct. (§ 8 a)</td>
                  <td className="border p-3">{kr(BOLIGSIKRING_2026.formueGraenseHoej)}</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-gray-600 mt-2">
              Beløbene er de satser, der gælder fra 1. januar 2026. De reguleres én gang årligt.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sådan beregnes boligsikring
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-3">
              <p>
                <strong>Huslejeandelen:</strong> {formatBelob(BOLIGSIKRING_2026.huslejeandelPct * 100, "da")} pct. af
                huslejen, du betaler. Varme- og antennebidrag tæller ikke med, men huslejen forhøjes
                med faste beløb pr. kvadratmeter, hvis du selv betaler for vand, har vedligeholdelsespligt,
                eller hvis boligen opvarmes fra et kollektivt anlæg eller udelukkende med el eller gas.
              </p>
              <p>
                <strong>Arealgrænsen:</strong> de første{" "}
                {formatBelob(BOLIGSIKRING_2026.arealFoerstePerson, "da")} m² i husstanden medtælles, og{" "}
                {formatBelob(BOLIGSIKRING_2026.arealEkstraPerson, "da")} pr. ekstra person. Bor to
                personer på 100 m², medgår derfor kun 85 af 100 kvadratmeter i beregningen.
              </p>
              <p>
                <strong>Indkomstandelen:</strong>{" "}
                {formatBelob(BOLIGSIKRING_2026.indkomstandelPct * 100, "da")} pct. af husstandsindkomsten
                over indkomstgrænsen. Alle voksne i husstandens indtægter medregnes — børns gør ikke.
                Indkomstgrænsen forhøjes med {kr(BOLIGSIKRING_2026.indkomstGraensePrBarn)} for hvert barn fra
                det 2. til det 4.
              </p>
              <p>
                <strong>Egenbetaling:</strong> du skal altid selv betale mindst{" "}
                {kr(BOLIGSIKRING_2026.mindstEgenbetaling)} af boligudgiften om året. Boligsikringen kan
                aldrig være større end den del af huslejen, der ligger over det beløb.
              </p>
              <p>
                <strong>Loftet uden børn:</strong> er der ikke børn under 18 år i husstanden, kan
                boligsikringen uanset indkomst ikke være højere end{" "}
                {formatBelob(BOLIGSIKRING_2026.loftUdenBoernPct * 100, "da")} pct. af huslejen. Undtaget
                er førtidspensionister og stærkt bevægelseshæmmede i en egnet bolig, og husstande med
                døgnhjælp.
              </p>
              <p>
                <strong>Maksimum:</strong> højst {kr(BOLIGSIKRING_2026.maksBoligsikring)} om året, der
                forhøjes med 25 pct., hvis der er fire børn eller flere. Boligsikringen udbetales, når
                den når mindst {kr(BOLIGSIKRING_2026.minimumsBeloeb)} om året.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Boligsikring og boligstøtte er to dele af samme ordning
            </h2>
            <div className="prose max-w-none text-gray-700 space-y-3">
              <p>
                Lov om individuel boligstøtte har to beregningsregler: <strong>boligydelse</strong> og{" "}
                <strong>boligsikring</strong>. Boligydelse beregnes som 75 pct. af boligudgiften med
                tillæg, minus 22,5 pct. af husstandsindkomsten over en lavere indkomstgrænse, og går til
                familier med børn. Boligsikring beregnes med 60 pct. af huslejen og 18 pct. af
                indkomsten, og går til lejere, der ikke er pensionister.
              </p>
              <p>
                Boligsikring er altså <strong>ikke en opsparingsordning</strong>, og den er heller ikke
                noget, du selv kan tegne. Det er en skattefri ydelse, som Udbetaling Danmark udbetaler —
                til dig eller direkte til udlejeren. Du søger om den på borger.dk, og ydelsen udbetales
                fra den 1. i måneden efter, at ansøgningen er indgivet.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om boligsikring" />
          </section>

          <section className="mb-12">
            <RelatedCalculators current="/boligsikring" />
          </section>

          <section className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Kilder</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              {Object.entries(BOLIGSIKRING_KILDER).map(([noegle, kilde]) => (
                <li key={noegle}>{kilde}</li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 mt-3">
              Tallet fra beregneren er vejledende. Den endelige beregning foretages af Udbetaling
              Danmark.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
