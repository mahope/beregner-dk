import { generatePageMetadata } from "@/lib/page-helpers";
import { getPageData } from "@/lib/page-data";
import PortoBeregner from "@/components/PortoBeregner";
import FAQ from "@/components/FAQ";
import { PORTO_VARER } from "@/lib/porto";
import { formatBelob, formatNumber } from "@/lib/format";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { PORTO_DAO_SHOPS, PORTO_KILDE, PORTO_REKOMMANDERET_FRA_KR } from "@/lib/porto";

export async function generateMetadata() {
  return generatePageMetadata("porto");
}

export default function PortoPage() {
  const pageData = getPageData("porto", "da");
  if (!pageData) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Hverdag", href: "/kategori/hverdag" },
          { name: pageData.title, href: "/porto" },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pageData.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{pageData.description}</p>
          <div className="mt-6">
            <PortoBeregner />
          </div>

          <section className="mt-8 space-y-4 text-gray-700 dark:text-gray-300">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Dao overtog breve den 1. januar 2026
            </h2>
            <p>
              PostNord stoppede med at omdele breve i Danmark den 1. januar 2026. Breve til hele
              landet leveres nu af dao, som også har overtaget breve til og fra udland. PostNord står
              stadig for pakker og værdiforsendelser.
            </p>
            <p>
              Breve op til 250 g og 1 cm tykkelse sendes til den samme pris, uanset om modtageren bor
              i København eller i Thy. Vejer brevet mere end 250 g, skal det sendes som pakke, og så
              bestemmer pakkens format prisen.
            </p>
            <p>
              Et brev sendes ved at købe porto som brevkode på dao.dk eller i appen, skrive koden i
              brevets øverste højre hjørne og aflevere det i den røde kasse i en af landets{" "}
              {formatNumber(PORTO_DAO_SHOPS, "da")} daoSHOPs.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Dao's brevpriser
            </h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                    <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Vægt</th>
                    <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Brevtype</th>
                    <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">Levering</th>
                    <th className="pb-2 font-medium text-gray-600 dark:text-gray-400">Pris</th>
                  </tr>
                </thead>
                <tbody>
                  {PORTO_VARER.map((vare) => (
                    <tr
                      key={`${vare.destination}-${vare.type}-${vare.vaegtMax}`}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        {vare.vaegtMax === 100 ? "0-100 g" : "101-250 g"}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                        {vare.destination === "danmark" ? "Danmark" : "Udland"} ·{" "}
                        {vare.type === "plus" ? "PLUS" : "almindeligt"}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{vare.levering}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-gray-100">
                        {formatBelob(vare.pris, "da")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Kilde: dao's egen prisliste, læst {PORTO_KILDE.verifiedAt}. Et rekommanderet brev til
              dansk adresse koster fra {PORTO_REKOMMANDERET_FRA_KR} kr. op til 100 g; til udlandet
              indleveres rekommanderede breve hos PostNord.
            </p>
          </section>

          <div className="mt-8">
            <FAQ items={pageData.faqItems} />
          </div>
          <CalculatorSchema
            name={pageData.schemaName}
            description={pageData.schemaDescription}
            url="https://minberegner.dk/porto"
          />
          <FAQSchema items={pageData.faqItems} />
        </main>
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
      </div>
      <RelatedCalculators current="porto" />
    </div>
  );
}
