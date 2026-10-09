import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import IsolationsBeregner from "@/components/IsolationsBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  BR18_OMBYGNING,
  BYGNINGSDELER,
  ISOLERINGSMATERIALER,
  ISOLERING_KILDE,
  ISOLERING_EKSEMPEL,
  RSE,
  beregnIsolering,
  bygningsdelVedId,
  luftlag,
  materialeVedId,
  tykkelseForU,
} from "@/lib/isolation";

export async function generateMetadata() {
  return generatePageMetadata("isolation");
}

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

export default async function IsolationPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("isolation", locale) || getPageData("isolation", "da")!;

  const eksempel = beregnIsolering(ISOLERING_EKSEMPEL);
  const loft = bygningsdelVedId("loft");
  const vaeg = bygningsdelVedId("vaeg");
  const gulv = bygningsdelVedId("gulv");

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/isolation`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/isolation" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <IsolationsBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan regner du tykkelsen ud</h2>
          <p>
            Regnestykket er bygningsreglementets eget: en bygningsdels varmegennemgang
            (<strong>U-værdien</strong>) er omvendt af dens samlede varmemodstand, og den
            samlede modstand er luftlagene på hver side plus isoleringens egen:
          </p>
          <p>
            <strong>
              U = 1 / (Rsi + d/λ + Rse) — altså d = λ × (1/U − Rsi − Rse)
            </strong>
          </p>
          <p>
            λ er materialets varmeledningsevne, d er tykkelsen i meter, og Rsi/Rse er
            luftlagene indenfor og udenfor. Et loft til {fmt(0.2, 2)} W/m²K skal altså
            have en samlet modstand på <strong>5,00 m²K/W</strong>. Luftlagene tager{" "}
            {fmt(luftlag(loft), 2)} — varme stiger, så luften over et varmt loft holder
            bedre på varmen end luften under et koldt gulv — og resten skal isoleringen
            stå for.
          </p>

          <h2>Hvor mange cm skal hvert materiale være?</h2>
          <p>
            Tabellen gælder et loft til {fmt(loft.brKrav, 2)} W/m²K. Jo lavere λ-tallet
            er, jo tyndere lag kan du komme af med — PIR er knapt halvt så tykt som
            stenuld for samme U-værdi:
          </p>
          <table>
            <thead>
              <tr>
                <th>Materiale</th>
                <th>λ W/(m·K)</th>
                <th>Tykkelse til {fmt(loft.brKrav, 2)} W/m²K</th>
                <th>Modstand m²K/W</th>
              </tr>
            </thead>
            <tbody>
              {ISOLERINGSMATERIALER.map((m) => {
                const tykkelse = tykkelseForU("loft", m.id, loft.brKrav);
                return (
                  <tr key={m.id}>
                    <td>{m.navn}</td>
                    <td>{fmt(m.lambda, 3)}</td>
                    <td>
                      <strong>{fmt(tykkelse, 1)} cm</strong>
                    </td>
                    <td>{fmt(tykkelse / 100 / m.lambda, 2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Hvor tykt er tykt nok til de tre bygningsdele?</h2>
          <p>
            Kravene er BR18s generelle mindstekrav til klimaskærm (§ 257, bilag 2 tabel
            1). Ved ombygning og efterisolering er kravene skarpere — § 279 kræver{" "}
            {fmt(BR18_OMBYGNING.vaeg, 2)} W/m²K i vægge,{" "}
            {fmt(BR18_OMBYGNING.loft, 2)} på loftet og{" "}
            {fmt(BR18_OMBYGNING.gulv, 2)} i gulve:
          </p>
          <table>
            <thead>
              <tr>
                <th>Bygningsdel</th>
                <th>Luftlag m²K/W</th>
                <th>Krav i W/m²K</th>
                <th>Stenuld, cm</th>
                <th>PIR, cm</th>
              </tr>
            </thead>
            <tbody>
              {[loft, vaeg, gulv].map((d) => (
                <tr key={d.id}>
                  <td>{d.navn}</td>
                  <td>{fmt(luftlag(d), 2)}</td>
                  <td>{fmt(d.brKrav, 2)}</td>
                  <td>
                    <strong>{fmt(tykkelseForU(d.id, "stenuld", d.brKrav), 1)}</strong>
                  </td>
                  <td>{fmt(tykkelseForU(d.id, "pir", d.brKrav), 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2>Hvad tykkelsen betyder for varmeregningen</h2>
          <p>
            U-værdien ganges med arealet, og så har du varmetabet pr. grads
            temperaturforskel mellem inde og ude. Et loft på{" "}
            {fmt(eksempel.arealM2, 0)} m² til {fmt(eksempel.uVaerdi, 2)} W/m²K taber{" "}
            <strong>{fmt(eksempel.varmetabPrGrad, 1)} W</strong> ved 1 grad forskel —
            ved 20 grader er det {fmt(eksempel.varmetabPrGrad * 20, 0)} W, altså lige
            så meget som {fmt((eksempel.varmetabPrGrad * 20) / 1000, 2)} kW i time. Det
            er den størrelse, isoleringen formår at holde inde.
          </p>
          <p>
            Materialeforbruget følger tykkelsen: {fmt(eksempel.tykkelseCm, 1)} cm
            stenuld på {fmt(eksempel.arealM2, 0)} m² er{" "}
            <strong>{fmt(eksempel.volumenM3, 2)} m³</strong> — den mængde du ellers
            bruger{" "}
            <Link href="/beton" className="underline font-medium">
              betonberegneren
            </Link>{" "}
            og{" "}
            <Link href="/sand-og-grus" className="underline font-medium">
              sand- og grusberegneren
            </Link>{" "}
            til.
          </p>

          <h2>Hvad beregneren ikke tager med</h2>
          <p>
            Regnestykket er ét isoleringslag i en plan konstruktion. Bjælker, gips,
            beklædning og varmebroer tæller også med i den rigtige U-værdi, og fugt i
            mineraluld sænker effekten markant — derfor skal der dampspærre og tætning,
            særlig i et bjælkelag mod et koldt tagloft. Er du i tvivl om en
            konstruktion, spørg en rådgiver eller en entreprenør.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              λ-værdierne er intervals midtpunkter, ikke enkeltprodukters deklarerede
              værdi — den står på databladet til det produkt du køber, og den kan både
              være højere og lavere. Brug beregneren til at vurdere, om et tilbud er
              rimeligt, ikke som dokumentation til kommunen.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 not-prose">
            Krav: {ISOLERING_KILDE.krav}. λ-værdier: {ISOLERING_KILDE.lambda}. Luftlag:{" "}
            {ISOLERING_KILDE.luftlag}. Formel: {ISOLERING_KILDE.formel}. Verificeret{" "}
            {ISOLERING_KILDE.verifiedAt}.
          </p>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om isolering" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/isolation" />
        </section>
      </div>

      <Sidebar currentHref="/isolation" adSlotId="isolation-sidebar" />
    </div>
  );
}
