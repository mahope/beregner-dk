import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ByggeprisBeregner from "@/components/ByggeprisBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  BYGGEPRIS_EKSEMPEL,
  BYGGEPRIS_NIVEAUER,
  beregnByggepris,
} from "@/lib/byggepris";

export async function generateMetadata() {
  return generatePageMetadata("byggepris");
}

const fmt = (n: number, maks = 0) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

/** Eksempeltabellens arealer. Priserne regnes af samme modul som værktøjet. */
const EKSEMPEL_AREALER = [100, 120, 150, 180, 200];

export default async function ByggeprisPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("byggepris", locale) || getPageData("byggepris", "da")!;

  const eksempel = beregnByggepris(BYGGEPRIS_EKSEMPEL.arealM2, BYGGEPRIS_EKSEMPEL.niveau);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/byggepris`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/byggepris" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <ByggeprisBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvad koster det at bygge et hus?</h2>
          <p>
            Prisen afhænger af størrelse og standard. Et <strong>typehus</strong> koster{" "}
            <strong>
              {fmt(BYGGEPRIS_NIVEAUER.typehus.min)}-{fmt(BYGGEPRIS_NIVEAUER.typehus.max)} kr./m²
            </strong>{" "}
            inkl. moms, en <strong>totalentreprise</strong>{" "}
            <strong>
              {fmt(BYGGEPRIS_NIVEAUER.totalentreprise.min)}-{fmt(BYGGEPRIS_NIVEAUER.totalentreprise.max)} kr./m²
            </strong>{" "}
            og et <strong>arkitekttegnet</strong> hus{" "}
            <strong>
              {fmt(BYGGEPRIS_NIVEAUER.arkitekttegnet.min)}-{fmt(BYGGEPRIS_NIVEAUER.arkitekttegnet.max)} kr./m²
            </strong>
            . Priserne dækker selve huset — ikke grund, byggemodning eller tilslutning.
          </p>
          <p>
            Et typehus på {BYGGEPRIS_EKSEMPEL.arealM2} m² koster typisk{" "}
            <strong>
              {fmt(eksempel.byggeprisMin)}-{fmt(eksempel.byggeprisMax)} kr.
            </strong>{" "}
            ekskl. grund. Jo større huset er, jo lavere bliver prisen pr. m², fordi køkken, bad og
            teknik fylder relativt mindre.
          </p>

          <h2>Så mange kroner til et givent areal</h2>
          <p>
            Tabellen viser byggeprisen for et typehus — den laveste af de tre standarder. Vælger du en
            totalentreprise eller et arkitekttegnet hus, ligger prisen højere.
          </p>
          <table>
            <thead>
              <tr>
                <th>Boligareal</th>
                <th>Kvadratmeterpris</th>
                <th>Byggepris (ekskl. grund)</th>
              </tr>
            </thead>
            <tbody>
              {EKSEMPEL_AREALER.map((areal) => {
                const r = beregnByggepris(areal, "typehus");
                return (
                  <tr key={areal}>
                    <td>{areal} m²</td>
                    <td>
                      {fmt(r.kvadratmeterprisMin)}-{fmt(r.kvadratmeterprisMax)} kr./m²
                    </td>
                    <td>
                      <strong>
                        {fmt(r.byggeprisMin)}-{fmt(r.byggeprisMax)} kr.
                      </strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Hvad er forskellen på de tre standarder?</h2>
          <p>
            Et <strong>typehus</strong> bygges efter et standardkoncept med kendte materialer og processer og er
            det billigste at bygge. En <strong>totalentreprise</strong> giver dig eget design med én ansvarlig
            entreprenør, men koster mere. Et <strong>arkitekttegnet</strong> hus har unik design, højere
            kompleksitet og dyrere materialer og ligger i den høje ende.
          </p>

          <h2>Hvad er ikke med i byggeprisen?</h2>
          <p>
            Byggeprisen dækker kun selve huset. Der skal lægges <strong>grund</strong>,{" "}
            <strong>byggemodning</strong>, <strong>tilslutningsafgifter</strong>, <strong>fundament</strong> og
            ofte <strong>arkitekthonorar</strong> til. Byggemodning og tilslutninger ligger typisk på
            200.000-600.000 kr., og grundprisen varierer fra nogle hundrede tusinde kroner i
            landdistrikterne til flere millioner i og omkring de store byer.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Beregneren er et skøn. Ingen myndighed fører et officielt register over m²-priser på nybyggeri,
              så tallene er triangulerede overslag fra branchen. Har du brug for at finansiere byggeriet, kan
              du bruge{" "}
              <Link href="/laanekapacitet" className="underline font-medium">
                lånekapacitetsberegneren
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om byggepris" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/byggepris" />
        </section>
      </div>

      <Sidebar currentHref="/byggepris" adSlotId="byggepris-sidebar" />
    </div>
  );
}
