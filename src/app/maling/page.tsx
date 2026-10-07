import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import MalingBeregner from "@/components/MalingBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  MALING_DAEKNING_M2_PR_LITER,
  MALING_EKSEMPEL,
  MALING_STANDARD_SPILD_PCT,
  MALING_STANDARD_STROEG,
  beregnMalingLiter,
  malingEksempelAreal,
  malingEksempelLiter,
} from "@/lib/maling";

export async function generateMetadata() {
  return generatePageMetadata("maling");
}

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

/** Eksempeltabellens arealer. Literne regnes af samme modul som værktøjet. */
const EKSEMPEL_AREALER = [10, 20, 30, 40, 50];

export default async function MalingPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("maling", locale) || getPageData("maling", "da")!;

  // Brødteksten læser værktøjets egne tal, så de to ikke kan glide fra hinanden.
  const eksempelAreal = malingEksempelAreal();
  const eksempelLiter = malingEksempelLiter();

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/maling`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/maling" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <MalingBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget maling skal du bruge?</h2>
          <p>
            Du finder behovet i to trin. Først regner du <strong>malearealet</strong> ud: et rums vægareal er
            omkredsen gange højden, altså <strong>2 × (længde + bredde) × højde</strong>. Derefter ganger du
            arealet med <strong>antal strøg</strong> og deler med malingens <strong>dækkevne</strong>:
          </p>
          <p>
            <strong>liter = areal (m²) × antal strøg ÷ dækkevne (m² pr. liter)</strong>
          </p>
          <p>
            Et rum på {MALING_EKSEMPEL.laengdeM} × {MALING_EKSEMPEL.breddeM} m med{" "}
            {fmt(MALING_EKSEMPEL.hoejdeM)} m til loftet har{" "}
            <strong>{fmt(eksempelAreal.samletM2, 0)} m² væg</strong>. Med{" "}
            {MALING_STANDARD_STROEG} strøg og en dækkevne på {MALING_DAEKNING_M2_PR_LITER} m² pr. liter giver
            det <strong>{fmt(eksempelLiter.literEksakt, 0)} liter</strong>, og med {MALING_STANDARD_SPILD_PCT} %
            til spild <strong>{fmt(eksempelLiter.literMedSpild)} liter</strong> — altså{" "}
            {fmt(eksempelLiter.literKoeb, 0)} liter, der skal købes.
          </p>

          <h2>Så mange liter til et givent areal</h2>
          <p>
            Tabellen er regnet med {MALING_STANDARD_STROEG} strøg og {MALING_DAEKNING_M2_PR_LITER} m² pr.
            liter — de samme tal som værktøjet starter på. Skal du kun male ét strøg, halveres forbruget.
          </p>
          <table>
            <thead>
              <tr>
                <th>Maleareal</th>
                <th>Liter, {MALING_STANDARD_STROEG} strøg</th>
                <th>Køb (med {MALING_STANDARD_SPILD_PCT} % spild)</th>
              </tr>
            </thead>
            <tbody>
              {EKSEMPEL_AREALER.map((areal) => {
                const r = beregnMalingLiter(areal, MALING_STANDARD_STROEG, MALING_DAEKNING_M2_PR_LITER);
                return (
                  <tr key={areal}>
                    <td>{areal} m²</td>
                    <td>{fmt(r.literEksakt)} liter</td>
                    <td>
                      <strong>{fmt(r.literKoeb, 0)} liter</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Døre, vinduer og loft</h2>
          <p>
            Døre og vinduer skal ikke males, så mål dem og træk deres areal fra. Skal loftet også males, sætter
            du flueben i <strong>«Medregn loftet»</strong>, og loftets areal (længde × bredde) lægges oveni.
          </p>

          <h2>Hvorfor lægge spild til?</h2>
          <p>
            Der skal altid lidt maling til rådighed til hjørner, kanter og opretning bagefter. Branchen
            anbefaler <strong>{MALING_STANDARD_SPILD_PCT} % ekstra</strong>, og det er den værdi, beregneren
            bruger. På et sugende underlag — fx ny gips eller ubehandlet træ — kan malingen trække mere, så
            dækkevnen bliver lavere end dåsen angiver. Justér dækkevnen, hvis du kender din maling.
          </p>

          <h2>Dækkevnen står på dåsen</h2>
          <p>
            Der findes ikke ét rigtigt tal for, hvor langt en liter maling rækker. Det afhænger af malingtypen,
            farven og underlaget og står i produktets datablad. Beregneren starter på{" "}
            {MALING_DAEKNING_M2_PR_LITER} m² pr. liter pr. strøg, som er et almindeligt udgangspunkt for
            vægmaling — men du bør altid læse det tal, der står på netop din dåse, og skrive det ind.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Beregneren er et skøn. Underlagets sugning, malingens dækkevne og antallet af strøg afgør det
              reelle forbrug, så køb hellere en liter for meget end en for lidt. Har du brug for arealet af en
              flade, der ikke er et rum, kan du bruge{" "}
              <Link href="/kvadratmeter" className="underline font-medium">
                kvadratmeterberegneren
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om maling" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/maling" />
        </section>
      </div>

      <Sidebar currentHref="/maling" adSlotId="maling-sidebar" />
    </div>
  );
}
