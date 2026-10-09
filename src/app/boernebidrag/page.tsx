import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BoernebidragBeregner from "@/components/BoernebidragBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import Sidebar from "@/components/Sidebar";
import {
  BOERNEBIDRAG_2026,
  BOERNEBIDRAG_AAR,
  BOERNEBIDRAG_KILDE,
  FRADRAGSVAERDI_PCT,
  MAX_ANTAL_BOERN,
  boernebidragEksempel,
  formaterGrae,
  indkomstNiveauRækker,
} from "@/lib/boernebidrag";

export async function generateMetadata() {
  return generatePageMetadata("boernebidrag");
}

const kr = (n: number) => n.toLocaleString("da-DK");

export default async function BoernebidragPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("boernebidrag", locale) || getPageData("boernebidrag", "da")!;

  const eksempel = boernebidragEksempel();
  const niveauer = indkomstNiveauRækker();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/boernebidrag`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/boernebidrag" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <BoernebidragBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan regnes børnebidraget ud</h2>
          <p>
            Normalbidraget er det beløb, der gælder, når indkomsten ikke udløser et
            forhøjet bidrag. I {BOERNEBIDRAG_AAR} består det af et grundbeløb og et
            tillæg:
          </p>
          <p>
            <strong>
              {kr(BOERNEBIDRAG_2026.grundbeloebMaaned)} kr. + {kr(BOERNEBIDRAG_2026.tillaegMaaned)} kr. ={" "}
              {kr(BOERNEBIDRAG_2026.normalbidragMaaned)} kr. pr. måned pr. barn
            </strong>
          </p>
          <p>
            Et forhøjet bidrag er altid normalbidraget plus en procentsats af{" "}
            <strong>grundbeløbet</strong> — ikke af hele normalbidraget. Ved 100 % bliver
            regnestykket {kr(BOERNEBIDRAG_2026.grundbeloebMaaned)} +{" "}
            {kr(BOERNEBIDRAG_2026.grundbeloebMaaned)} + {kr(BOERNEBIDRAG_2026.tillaegMaaned)} ={" "}
            <strong>{kr(BOERNEBIDRAG_2026.grundbeloebMaaned * 2 + BOERNEBIDRAG_2026.tillaegMaaned)} kr.</strong>{" "}
            Det er netop den detalje, der gør forskellen mellem at regne af grundbeløbet og
            af hele normalbidraget.
          </p>

          <h2>Hvilke indkomstgrænser udløser et forhøjet bidrag?</h2>
          <p>
            Grænserne er de vejledende beløb fra indkomstoversigten for{" "}
            {BOERNEBIDRAG_AAR}. De stiger med antallet af børn, og beregneren har en
            kolonne for 1 til {MAX_ANTAL_BOERN} børn:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Tillæg</th>
                  {Array.from({ length: MAX_ANTAL_BOERN }, (_, i) => i + 1).map((n) => (
                    <th key={n}>{n === 1 ? "1 barn" : `${n} børn`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {niveauer.map((niveau) => (
                  <tr key={niveau.niveauPct}>
                    <td>
                      <strong>{niveau.niveauPct} %</strong>
                    </td>
                    {niveau.grae.map((graense, i) => (
                      <td key={i}>{formaterGrae(graense)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Grænserne er kumulative: en indkomst over 200 %-grænsen er også over
            100 %-grænsen, så det højeste niveau, indkomsten når, er det, der gælder.
          </p>

          <h2>Hvad koster det, og hvad får du i skat?</h2>
          <p>
            Familieretshusets eget regneeksempel er én bidragsbetaler med{" "}
            {kr(eksempel.aarligIndomst)} kr. i årlig indkomst og ét barn. Indkomsten
            rammer 100 %-niveauet, og bidraget bliver{" "}
            <strong>{kr(eksempel.bidragPrBarnMaaned)} kr. pr. måned</strong> — altså{" "}
            {kr(eksempel.bidragSamletAar)} kr. om året.
          </p>
          <p>
            Betaler du normalbidraget, kan du trække grundbeløbet fra:{" "}
            {kr(BOERNEBIDRAG_2026.grundbeloebMaaned)} kr. pr. måned pr. barn. Er bidraget
            aftalt i stedet, er fradraget beløbet minus tillægget på{" "}
            {kr(BOERNEBIDRAG_2026.tillaegMaaned)} kr. Ved ca. {FRADRAGSVAERDI_PCT} %
            fradragsværdi svarer det til omkring{" "}
            <strong>
              {kr(Math.round((BOERNEBIDRAG_2026.grundbeloebMaaned * FRADRAGSVAERDI_PCT) / 100))} kr.
            </strong>{" "}
            pr. måned pr. barn. Et forhøjet bidrag giver ikke større fradrag, fordi det kun
            er grundbeløbet, der kan trækkes fra.
          </p>

          <h2>Hvad beregneren ikke tager med</h2>
          <p>
            Regnestykket dækker normalbidraget og det forhøjede bidrag. Samvær, et
            hjemmetilskud, en aftale mellem forældrene eller andre forhold kan ændre det
            endelige beløb, og det er Familieretshuset eller forældrene selv, der
            fastsætter det. Beregneren viser størrelsen — ikke en afgørelse.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Indkomstgrænserne er de vejledende beløb for {BOERNEBIDRAG_AAR}. De faktiske
              tal fastsættes af Familieretshuset eller i en aftale mellem forældrene, så
              brug beregneren til at forstå størrelsen — ikke som dokumentation.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 not-prose">
            Satser og indkomstgrænser: {BOERNEBIDRAG_KILDE.indkomstoversigt}. Beregning:{" "}
            {BOERNEBIDRAG_KILDE.beregning}. Skat: {BOERNEBIDRAG_KILDE.skat}. Verificeret{" "}
            {BOERNEBIDRAG_KILDE.verifiedAt}.
          </p>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om børnebidrag" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/boernebidrag" />
          <RelateredeArtikler current="/boernebidrag" locale={locale} />
        </section>
      </div>

      <Sidebar currentHref="/boernebidrag" adSlotId="boernebidrag-sidebar" />
    </div>
  );
}
