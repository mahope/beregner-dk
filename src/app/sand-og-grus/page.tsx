import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SandOgGrusBeregner from "@/components/SandOgGrusBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  GRUS_KOMPRIMERING_EKSTRA_PCT,
  GRUS_MATERIALER,
  GRUS_STANDARD_SPILD_PCT,
  SAND_OG_GRUS_KILDE,
  beregnGrus,
  grusEksempel,
  grusMaterialeVedId,
} from "@/lib/sand-og-grus";

export async function generateMetadata() {
  return generatePageMetadata("sand-og-grus");
}

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

/** Arealet de faste tabeller regner på, i m². */
const TABEL_AREAL_M2 = 10;

export default async function SandOgGrusPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("sand-og-grus", locale) || getPageData("sand-og-grus", "da")!;

  // Brødteksten læser værktøjets egne tal, så de to ikke kan glide fra hinanden.
  const eksempel = grusEksempel();
  const eksempelMateriale = eksempel.materiale;
  const afretningssand = grusMaterialeVedId("afretningssand");
  const stabilgrus = grusMaterialeVedId("stabilgrus");
  const bundsikring = grusMaterialeVedId("bundsikring");

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/sand-og-grus`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/sand-og-grus" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <SandOgGrusBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan regner du mængden ud</h2>
          <p>
            Du finder mængden i to trin. Først regner du <strong>arealet</strong> ud som længde gange
            bredde. Derefter ganger du med <strong>lagtykkelsen</strong> omregnet til meter:
          </p>
          <p>
            <strong>volumen (m³) = areal (m²) × lagtykkelse (m) × (1 + spild)</strong>
          </p>
          <p>
            Et areal på {fmt(eksempel.arealM2, 0)} m² med {fmt(eksempel.lagCm, 0)} cm{" "}
            {eksempelMateriale.navn.toLowerCase()} er{" "}
            <strong>{fmt(eksempel.volumenM3, 2)} m³</strong> uden spild. Med{" "}
            {GRUS_STANDARD_SPILD_PCT} % til ujævnheder bliver det{" "}
            <strong>{fmt(eksempel.volumenMedSpildM3, 2)} m³</strong> — og fordi sand vejer{" "}
            {fmt(eksempelMateriale.densitetTPerM3, 1)} ton pr. m³, omkring{" "}
            <strong>{fmt(eksempel.tonMedSpild, 1)} ton</strong>. Det er den samme formel uanset, om
            du regner sand, grus eller bundsikring — kun densiteten skifter.
          </p>

          <h2>Lagtykkelse og vægt pr. materiale</h2>
          <p>
            Lagtykkelsen og densiteten afhænger af materialet. Tabellen viser leverandørernes
            anbefalinger og det vejledende antal m³ og ton til {TABEL_AREAL_M2} m² ved den
            anbefalede lagtykkelse.
          </p>
          <table>
            <thead>
              <tr>
                <th>Materiale</th>
                <th>Lagtykkelse</th>
                <th>Densitet</th>
                <th>Til {TABEL_AREAL_M2} m²</th>
              </tr>
            </thead>
            <tbody>
              {GRUS_MATERIALER.map((m) => {
                const r = beregnGrus({
                  laengdeM: TABEL_AREAL_M2,
                  breddeM: 1,
                  materialeId: m.id,
                  lagCm: m.lagCmStandard,
                  spildPct: 0,
                });
                return (
                  <tr key={m.id}>
                    <td>{m.navn}</td>
                    <td>
                      {m.lagCmMin}–{m.lagCmMax} cm
                    </td>
                    <td>{fmt(m.densitetTPerM3, 1)} ton/m³</td>
                    <td>
                      <strong>{fmt(r.volumenM3, 1)} m³</strong> / {fmt(r.tonMedSpild, 1)} ton
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Hvor meget sand skal du bruge under fliser?</h2>
          <p>
            Under fliser og belægningssten lægges et afretningslag af sand, hvor fliserne rettes af.
            Leverandørerne anbefaler <strong>{afretningssand.lagCmMin}–{afretningssand.lagCmMax} cm</strong>,
            og lægger du det tykkere, kan fliserne med tiden rykke sig. Afretningssand vejer omkring{" "}
            {fmt(afretningssand.densitetTPerM3, 1)} ton pr. m³. Skal du både have fliser og sand, kan
            du regne fliserne i{" "}
            <Link href="/fliser" className="underline font-medium">
              fliseberegneren
            </Link>{" "}
            og sandet her.
          </p>

          <h2>Hvor meget grus skal du bruge til en indkørsel?</h2>
          <p>
            En indkørsel bygges typisk i tre lag: bundsikring nederst (
            {bundsikring.lagCmMin}–{bundsikring.lagCmMax} cm), stabilgrus som bærelag (
            {stabilgrus.lagCmMin}–{stabilgrus.lagCmMax} cm, mest til tung trafik) og et tyndere lag
            afretningssand eller granitskærver øverst. Regn hvert lag for sig og læg mængderne
            sammen. Stabilgrus vejer omkring {fmt(stabilgrus.densitetTPerM3, 1)} ton pr. m³, mens
            bundsikring ligger på {fmt(bundsikring.densitetTPerM3, 1)} ton pr. m³.
          </p>

          <h2>Husk komprimeringen</h2>
          <p>
            Sand og grus skal stampes med en pladevibrator, og et lag synker, når det komprimeres.
            Leverandørerne anbefaler derfor at regne med omkring {GRUS_KOMPRIMERING_EKSTRA_PCT} %
            ekstra, før laget stampes — sæt spildfeltet op til {GRUS_KOMPRIMERING_EKSTRA_PCT} %, hvis
            du vil have det med. Den første vanding og regn sætter også laget lidt.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Mængden er et skøn. Arealet er sjældent helt rektangulært, densiteten afhænger af
              fugtindholdet, og komprimeringen ændrer volumen, så bestil hellere lidt for meget end
              for lidt. Skal du også bruge maling eller fliser, har vi{" "}
              <Link href="/maling" className="underline font-medium">
                malingberegneren
              </Link>{" "}
              og{" "}
              <Link href="/fliser" className="underline font-medium">
                fliseberegneren
              </Link>
              .
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 not-prose">
            Lagtykkelser: {SAND_OG_GRUS_KILDE.lagtykkelser}. Densiteter:{" "}
            {SAND_OG_GRUS_KILDE.densiteter}. Verificeret {SAND_OG_GRUS_KILDE.verifiedAt}.
          </p>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om sand og grus" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/sand-og-grus" />
        </section>
      </div>

      <Sidebar currentHref="/sand-og-grus" adSlotId="sand-og-grus-sidebar" />
    </div>
  );
}
