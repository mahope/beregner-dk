import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FliserBeregner from "@/components/FliserBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  FLISER_EKSEMPEL,
  FLISER_FORMATER,
  FLISER_STANDARD_PR_ESKE,
  FLISER_STANDARD_SPILD_PCT,
  fliserEksempel,
  fliserPrKvadratmeter,
} from "@/lib/fliser";

export async function generateMetadata() {
  return generatePageMetadata("fliser");
}

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

/** Eksempeltabellen viser behovet for det samme areal på tværs af formater. */
const TABEL_AREAL_M2 = 10;

/** Antal cm² på én m², brugt i forklaringen af omregningen. */
const CM2_PR_M2 = 10000;

export default async function FliserPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("fliser", locale) || getPageData("fliser", "da")!;

  // Brødteksten læser værktøjets egne tal, så de to ikke kan glide fra hinanden.
  const eksempel = fliserEksempel();
  const format = `${fmt(FLISER_EKSEMPEL.fliseBreddeCm, 0)} × ${fmt(FLISER_EKSEMPEL.fliseHoejdeCm, 0)} cm`;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/fliser`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/fliser" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <FliserBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor mange fliser skal du bruge?</h2>
          <p>
            Du finder behovet i tre trin. Først regner du <strong>rummets areal</strong> ud som
            længde gange bredde. Derefter regner du <strong>én flises areal</strong> ud — målene i
            cm ganges sammen og deles med {fmt(CM2_PR_M2, 0)}, så du får m². Til sidst deler du arealet med
            flisens areal og lægger spild til:
          </p>
          <p>
            <strong>fliser = rummets areal (m²) ÷ flisens areal (m²) × (1 + spild)</strong>
          </p>
          <p>
            Et rum på {FLISER_EKSEMPEL.laengdeM} × {FLISER_EKSEMPEL.breddeM} m er{" "}
            <strong>{fmt(eksempel.arealM2, 0)} m²</strong>. Med {format}-fliser fylder én flise{" "}
            {fmt(eksempel.fliseArealM2, 2)} m², så der skal{" "}
            <strong>{fmt(eksempel.fliserUdenSpild, 0)} fliser</strong> til uden spild. Med{" "}
            {FLISER_STANDARD_SPILD_PCT} % til tilskæring bliver det{" "}
            <strong>{fmt(eksempel.fliserMedSpild, 0)} fliser</strong> — altså{" "}
            {fmt(eksempel.esker, 0)} kasser, når der er {FLISER_STANDARD_PR_ESKE} i hver.
          </p>

          <h2>Så mange fliser går der på en m²</h2>
          <p>
            Tabellen viser de almindelige formater. &laquo;Fliser pr. m²&raquo; er 1 ÷ flisens
            areal, og den sidste kolonne er antallet for et rum på {TABEL_AREAL_M2} m² uden spild.
          </p>
          <table>
            <thead>
              <tr>
                <th>Format</th>
                <th>Areal pr. flise</th>
                <th>Fliser pr. m²</th>
                <th>Fliser til {TABEL_AREAL_M2} m²</th>
              </tr>
            </thead>
            <tbody>
              {FLISER_FORMATER.map(([bredde, hoejde]) => {
                const fliseAreal = (bredde * hoejde) / 10000;
                const prM2 = fliserPrKvadratmeter(bredde, hoejde);
                const tilAreal = Math.ceil(TABEL_AREAL_M2 / fliseAreal);
                return (
                  <tr key={`${bredde}x${hoejde}`}>
                    <td>
                      {bredde} × {hoejde} cm
                    </td>
                    <td>{fmt(fliseAreal, 2)} m²</td>
                    <td>{fmt(prM2, 1)}</td>
                    <td>
                      <strong>{tilAreal}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Hvorfor lægge spild til?</h2>
          <p>
            Der skal altid skæres fliser til langs vægge, om hjørner og om rørgennemføringer, og
            nogle fliser knækker undervejs. Branchen anbefaler{" "}
            <strong>{FLISER_STANDARD_SPILD_PCT} % ekstra</strong>, og det er den værdi, beregneren
            bruger. Lægger du fliser i et rum med mange vinkler, eller vælger du et diagonalt
            mønster, bør du gå op til 15 %. Har du fliser til overs, kan de gemmes til en senere
            reparation — en udgået serie kan ikke skaffes igen.
          </p>

          <h2>Kasser, hele fliser og købsareal</h2>
          <p>
            Fliser sælges sjældent enkeltvis, men i kasser. Beregneren runder derfor op til hele
            kasser og viser, hvor mange m² du faktisk kommer til at købe — det er ofte lidt mere
            end behovet, fordi den sidste kasse ikke kan deles. Antallet pr. kasse står på kassen og
            varierer med formatet; skriv det ind, du køber.
          </p>

          <h2>Gulv eller væg?</h2>
          <p>
            Beregneren regner et rektangulært areal. Skal du både have fliser på gulv og væg, så
            regn væggen for sig: mål væggens længde og højde og skriv det ind som længde og bredde.
            Har du brug for arealet af en flade, der ikke er et rum, kan du bruge{" "}
            <Link href="/kvadratmeter" className="underline font-medium">
              kvadratmeterberegneren
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Antallet er et skøn. Rummet er måske ikke helt rektangulært, og spild og kassestørrelse
              afgør det reelle antal, så køb hellere en kasse for meget end en for lidt. Skal du
              også male, kan du bruge{" "}
              <Link href="/maling" className="underline font-medium">
                malingberegneren
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om fliser" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/fliser" />
        </section>
      </div>

      <Sidebar currentHref="/fliser" adSlotId="fliser-sidebar" />
    </div>
  );
}
