import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { BARSEL_2026 } from "@/lib/satser-2026";
import { REGLER } from "@/lib/barsel/regler";
import BarselPlanlaegger from "@/components/barsel/BarselPlanlaegger";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("barselsplanlaegger");
}

const maxUge = BARSEL_2026.maxWeeklyRate.toLocaleString("da-DK");

const REGEL_RAEKKER: { situation: string; foer: string; efter: string; oe: string; delbar: string }[] = [
  { situation: "Mor (fødende)", foer: "4 uger", efter: "24 uger (10 + 14)", oe: "11 (2 + 9)", delbar: "5 + op til 8 af uge 3-10" },
  { situation: "Far eller medmor", foer: "–", efter: "24 uger (2 + 22)", oe: "11 (2 + 9)", delbar: "13" },
  { situation: "To fædre (surrogati), hver", foer: "–", efter: "24 uger (6 + 18)", oe: "11 (2 + 9)", delbar: "4 + 9" },
  { situation: "Adoptant, hver", foer: "1 uge (4 fra udlandet)", efter: "24 uger (6 + 18)", oe: "11 (2 + 9)", delbar: "4 + 9" },
  { situation: "Soloforælder", foer: "4 uger", efter: "46 uger", oe: "11", delbar: "Til nærtstående: op til 27" },
  { situation: "Flerlinger", foer: "–", efter: "+13 uger pr. forælder", oe: "–", delbar: "–" },
];

export default async function BarselsplanlaeggerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("barselsplanlaegger", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/barselsplanlaegger`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <div className="print:hidden">
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: "Barselsplanlægger", href: "/barselsplanlaegger" },
          ]}
        />
      </div>

      <article>
        <header className="barsel-side-indhold mb-6 max-w-3xl print:hidden">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Gratis · opdateret med 2026-reglerne</p>
          <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">Barselsplanlægger 2026</h1>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Læg jeres barsel ind i en kalender uge for uge, og se med det samme, hvilke uger der er øremærkede, hvad I kan overføre til hinanden, og hvad
            det betyder for økonomien måned for måned. Når planen er klar, kan I printe den og sende en færdig besked med datoer til arbejdsgiveren.
          </p>
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100">
            <strong>Vejledende.</strong> Tjek altid med{" "}
            <a href={BARSEL_2026.source} className="underline" rel="noopener">
              borger.dk
            </a>{" "}
            og din arbejdsgiver. Planen gemmes kun i din browser.
          </p>
        </header>

        <section className="mb-12" aria-label="Barselsplanlægger">
          <BarselPlanlaegger />
        </section>

        <div className="barsel-side-indhold print:hidden">
          <section className="mb-12 max-w-3xl">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Sådan virker reglerne</h2>
            <div className="prose max-w-none">
              <p>
                Reglerne gælder børn født eller modtaget fra 2. august 2022 og bygger på barselsloven (
                <a href={REGLER.kilde} rel="noopener">
                  LBK nr. 206 af 22. januar 2026
                </a>
                ). Planlæggeren fordeler automatisk jeres orlovsuger i den rækkefølge, der udnytter reglerne bedst: først de uger, der kun kan bruges på
                et bestemt tidspunkt, så de øremærkede, så jeres egne delbare uger og til sidst uger overført fra den anden.
              </p>
              <h3>Uger med barselsdagpenge</h3>
            </div>
            <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className="w-full min-w-[36rem] text-sm">
                <thead className="bg-gray-50 text-left dark:bg-gray-900/50">
                  <tr className="text-gray-900 dark:text-white">
                    <th scope="col" className="px-3 py-2">Hvem</th>
                    <th scope="col" className="px-3 py-2">Før fødsel/modtagelse</th>
                    <th scope="col" className="px-3 py-2">Efter</th>
                    <th scope="col" className="px-3 py-2">Øremærket</th>
                    <th scope="col" className="px-3 py-2">Kan overdrages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 dark:divide-gray-700 dark:text-gray-200">
                  {REGEL_RAEKKER.map((r) => (
                    <tr key={r.situation}>
                      <th scope="row" className="px-3 py-2 text-left font-medium">{r.situation}</th>
                      <td className="px-3 py-2">{r.foer}</td>
                      <td className="px-3 py-2">{r.efter}</td>
                      <td className="px-3 py-2">{r.oe}</td>
                      <td className="px-3 py-2">{r.delbar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="prose mt-6 max-w-none">
              <h3>De vigtigste frister</h3>
              <ul>
                <li>Mor giver arbejdsgiveren besked senest 3 måneder før forventet fødsel.</li>
                <li>Far eller medmor varsler de 2 uger ved fødslen senest 4 uger før forventet fødsel. De 2 uger skal holdes i de første 10 uger.</li>
                <li>Orlov efter uge 10 varsles senest 6 uger efter fødslen. De 9 øremærkede uger skal holdes, inden barnet fylder 1 år.</li>
                <li>Barselsdagpenge søges senest 8 uger efter fødslen eller første fraværsdag – eller 8 uger efter, at lønnen stopper.</li>
              </ul>
              <h3>Økonomi</h3>
              <p>
                Barselsdagpenge er højst {maxUge} kr. om ugen før skat i 2026 og beregnes af timelønnen efter AM-bidrag. Mange har løn under barsel efter
                overenskomsten i en del af perioden. Beregn satsen alene med <Link href="/barselsdagpenge">barselsdagpenge-beregneren</Link>, eller læs
                den korte version i <Link href="/blog/barsel-2026-regler-og-satser">guiden til barsel 2026</Link>.
              </p>
              <h3>Situationer, planlæggeren ikke regner på</h3>
              <p>
                Forældre, der ikke bor sammen ved fødslen, sociale forældre, stedbarnsadoption, sorgorlov ved barnets død og pasning af alvorligt syge børn
                har egne regler. Se{" "}
                <a href="https://www.borger.dk/familie-og-boern/barsel-oversigt" rel="noopener">
                  borger.dk om barsel
                </a>
                ,{" "}
                <a href="https://www.borger.dk/familie-og-boern/barsel-oversigt/sorgorlov" rel="noopener">
                  sorgorlov
                </a>{" "}
                og{" "}
                <a href="https://www.borger.dk/familie-og-boern/barn-syg-og-omsorgsdage/pasning-alvorligt-syge-boern" rel="noopener">
                  pasning af alvorligt syge børn
                </a>
                .
              </p>
            </div>
          </section>

          <section className="mb-12">
            <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om barselsplanen" />
          </section>

          <section>
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Relaterede beregnere</h2>
            <RelatedCalculators current="/barselsplanlaegger" />
          </section>
        </div>
      </article>
    </div>
  );
}
