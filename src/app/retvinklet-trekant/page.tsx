import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RetvinkletTrekantBeregner from "@/components/RetvinkletTrekantBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { RETVINKLET_EKSEMPEL, RETVINKLET_FORMEL } from "@/lib/retvinklet-trekant";
import { formatNumber } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("retvinklet-trekant");
}

/** Formeltabellen læser `RETVINKLET_FORMEL`, så brødteksten ikke kan vise en anden formel end værktøjet. */
const FORMEL_NAVN: Record<keyof typeof RETVINKLET_FORMEL, { da: string; se: string }> = {
  hypotenuse: { da: "Hypotenusen", se: "Hypotenusan" },
  katete: { da: "En katete", se: "En katet" },
  areal: { da: "Arealet", se: "Arean" },
  omkreds: { da: "Omkredsen", se: "Omkretsen" },
  vinkel: { da: "Vinklerne", se: "Vinklarna" },
};

export default async function RetvinkletTrekantPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData =
    getPageData("retvinklet-trekant", locale) || getPageData("retvinklet-trekant", "da")!;
  const se = locale === "se";
  const eks = RETVINKLET_EKSEMPEL.svar;
  const tal = (n: number, decimals: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/retvinklet-trekant`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/retvinklet-trekant" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <RetvinkletTrekantBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">
            {se ? "Pythagoras sats och de fem formlerna" : "Pythagoras og de fem formler"}
          </h2>
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">
              {se ? "Formler för en rätvinklig triangel" : "Formler for en retvinklet trekant"}
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4">
                  {se ? "Vad du räknar ut" : "Hvad du regner ud"}
                </th>
                <th scope="col" className="py-2">
                  {se ? "Formel (a, b = kateter, c = hypotenusa)" : "Formel (a, b = kateter, c = hypotenuse)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(RETVINKLET_FORMEL) as (keyof typeof RETVINKLET_FORMEL)[]).map((noegle) => (
                <tr key={noegle} className="border-b last:border-0">
                  <th scope="row" className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white">
                    {FORMEL_NAVN[noegle][se ? "se" : "da"]}
                  </th>
                  <td className="py-2">
                    <code>{RETVINKLET_FORMEL[noegle]}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "c är alltid den längsta sidan och ligger mittemot den räta vinkeln. a och b är de två kateterna, som möts i den räta vinkeln."
              : "c er altid den længste side og ligger modsat den rette vinkel. a og b er de to kateter, som mødes i den rette vinkel."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "Ett uträknat exempel: 3-4-5" : "Et gennemregnet eksempel: 3-4-5"}</h2>
          <p>
            {se
              ? `En rätvinklig triangel med kateterna 3 m och 4 m har hypotenusan ${tal(eks.c, 3)} m, eftersom 3² + 4² = 9 + 16 = 25 och √25 = 5. Arean är ${tal(eks.areal, 3)} m² och omkretsen ${tal(eks.omkreds, 3)} m. De två spetsiga vinklarna blir ${tal(eks.vinkelA, 2)}° och ${tal(eks.vinkelB, 2)}° — de summerar alltid till 90°, eftersom den tredje vinkeln är 90°.`
              : `En retvinklet trekant med kateterne 3 m og 4 m har hypotenusen ${tal(eks.c, 3)} m, fordi 3² + 4² = 9 + 16 = 25 og √25 = 5. Arealet er ${tal(eks.areal, 3)} m² og omkredsen ${tal(eks.omkreds, 3)} m. De to spidse vinkler bliver ${tal(eks.vinkelA, 2)}° og ${tal(eks.vinkelB, 2)}° — de giver altid 90° tilsammen, fordi den tredje vinkel er 90°.`}
          </p>

          <h2>{se ? "Hypotenusa eller katet?" : "Hypotenuse eller katete?"}</h2>
          <p>
            {se
              ? "Hypotenusan är den sida som ligger mittemot den räta vinkeln, och den är alltid den längsta. De två andra sidorna kallas kateter. Byter du plats på dem och skriver en katet i hypotenusfältet blir svaret fel — därför tar verktyget alla tre sidorna och räknar ut den du lämnade tom."
              : "Hypotenusen er den side, der ligger modsat den rette vinkel, og den er altid den længste. De to andre sider kaldes kateter. Bytter du om på dem og skriver en katete i hypotenusfeltet, bliver svaret forkert — derfor tager værktøjet alle tre sider og regner den ud, du lod stå tom."}
          </p>

          <h2>{se ? "Varför stämmer det?" : "Hvorfor passer det?"}</h2>
          <p>
            {se
              ? "Pythagoras sats säger att a² + b² = c² i varje rätvinklig triangel. Kvadraterna är arean av varsin kvadrat byggd på kateterna, och tillsammans är de lika stora som kvadraten på hypotenusan. Är sidorna 3 och 4 blir kvadraterna 9 och 16 — alltså 25, och 5² = 25."
              : "Pythagoras' læresætning siger, at a² + b² = c² i enhver retvinklet trekant. Kvadraterne er arealet af hver sin firkant bygget på kateterne, og tilsammen er de præcis lige så store som firkanten på hypotenusen. Er siderne 3 og 4, bliver kvadraterne 9 og 16 — altså 25, og 5² = 25."}
          </p>
          <p>
            {se
              ? "Samma formel används i "
              : "Den samme formel bruges i "}
            <Link href="/areal">{se ? "areaberäknaren" : "arealberegneren"}</Link>
            {se
              ? ", där den rätvinkliga triangeln är halva rektangeln: arean är (a × b) ÷ 2."
              : ", hvor den retvinklede trekant er det halve rektangel: arealet er (a × b) ÷ 2."}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/retvinklet-trekant" />
      </div>
      <Sidebar currentHref="/retvinklet-trekant" adSlotId="retvinklet-trekant-sidebar" />
    </div>
  );
}
