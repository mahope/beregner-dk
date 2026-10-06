import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import NutidskronerBeregner from "@/components/NutidskronerBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  NUTIDSKRONER_EKSEMPEL_AAR,
  NUTIDSKRONER_NU_PERIODE,
  NUTIDSKRONER_SENESTE_HELE_AAR,
  NUTIDSKRONER_KILDE,
  omregnTilNutidskroner,
} from "@/lib/nutidskroner";

export async function generateMetadata() {
  return generatePageMetadata("nutidskroner");
}

const kr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });
const pct = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 1 });

/** Eksempelbeløbet læses fra ét sted, så porten for hårdkodede beløb holder. */
const EKSEMPEL_BELOEB = 10_000;

export default async function NutidskronerPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("nutidskroner", locale) || getPageData("nutidskroner", "da")!;

  // Eksempeltabellen regnes af samme modul som værktøjet (kvalitetsregel 11),
  // så brødteksten ikke kan love et tal, beregneren modsiger.
  const eksempler = NUTIDSKRONER_EKSEMPEL_AAR.map((aar) => {
    const r = omregnTilNutidskroner(EKSEMPEL_BELOEB, aar)!;
    return { aar, beloeb: r.beloeb, pct: r.aendringPct };
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/nutidskroner`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/nutidskroner" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <NutidskronerBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>Hvad er nutidskroner?</h2>
          <p>
            Et beløb fra et tidligere år kan ikke sammenlignes direkte med et beløb i dag. {kr(EKSEMPEL_BELOEB)} kr. i
            1980 kunne købe langt mere, end {kr(EKSEMPEL_BELOEB)} kr. kan i dag. <strong>Nutidskroner</strong> er et
            gammelt beløb regnet om til dagens prisniveau, så du kan se, hvad det reelt svarer til.
            Omregningen følger <strong>forbrugerprisindekset</strong> fra Danmarks Statistik, der måler,
            hvor meget et typisk dansk vare- og tjenestekøb er steget i pris.
          </p>

          <h2>Sådan regner du et beløb om til nutidskroner</h2>
          <p>
            Formlen er <strong>beløb × indeks(i dag) ÷ indeks(dengang)</strong>. Indekset er en fælles
            målestok: en stigning fra 100 til 200 betyder, at priserne er fordoblet, uanset hvilket år
            basen ligger i. Derfor kan et beløb fra 1900 og et fra 2020 regnes med samme formel. Et par
            eksempler med {kr(EKSEMPEL_BELOEB)} kr.:
          </p>
          <div className="not-prose overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="py-2 pr-4 font-semibold">Beløb</th>
                  <th className="py-2 pr-4 font-semibold">Svarer til ({NUTIDSKRONER_NU_PERIODE})</th>
                  <th className="py-2 font-semibold">Prisstigning</th>
                </tr>
              </thead>
              <tbody>
                {eksempler.map((e) => (
                  <tr key={e.aar} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">{kr(EKSEMPEL_BELOEB)} kr. i {e.aar}</td>
                    <td className="py-2 pr-4 font-medium">{kr(e.beloeb)} kr.</td>
                    <td className="py-2">{pct(e.pct)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Et beløb fra {NUTIDSKRONER_SENESTE_HELE_AAR} har kun flyttet sig med den seneste års
            prisstigning, mens et beløb fra 1980 er mere end tredoblet. Jo længere tilbage, jo større
            bliver forskellen — renters rente gælder også for priser.
          </p>

          <h2>Hvornår bruger man nutidskroner?</h2>
          <p>
            Nutidskroner bruges overalt, hvor et gammelt tal skal give mening i dag: en løn fra et
            ansættelsesbrev fra 1995, en forsikringssum, et arvebeløb, en husleje fra en gammel kontrakt
            eller et gavebeløb fra en barnedåb. Det er også den måde, offentlige satser og domme
            sammenlignes over tid. Vil du i stedet se, hvad en løn i dag er værd efter skat, kan du bruge{" "}
            <a href="/loen-efter-skat">løn efter skat</a>, og skal et lejeboligs beløb reguleres efter
            nettoprisindekset, forklarer <a href="/husleje">husleje-beregneren</a> forskellen på de to
            indeks.
          </p>

          <h2>Hvilket indeks bruger beregneren?</h2>
          <p>
            Beregneren bruger <strong>forbrugerprisindekset</strong> (i Danmark ofte kaldet
            «pristallet»), som omfatter moms og afgifter og dækker et bredt gennemsnitligt forbrug.
            Tallene er årsgennemsnit fra <strong>{NUTIDSKRONER_KILDE.navn}</strong> og går tilbage til
            1900. «I dag» bruger den seneste offentliggjorte måned, {NUTIDSKRONER_NU_PERIODE}, fordi
            årets gennemsnit først findes, når året er omme.
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/nutidskroner" />
      </div>
      <Sidebar currentHref="/nutidskroner" adSlotId="nutidskroner-sidebar" />
    </div>
  );
}
