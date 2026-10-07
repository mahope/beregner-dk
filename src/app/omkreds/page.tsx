import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import OmkredsBeregner from "@/components/OmkredsBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { OMKREDS_EKSEMPEL, OMKREDS_FORMEL } from "@/lib/omkreds";

export async function generateMetadata() {
  return generatePageMetadata("omkreds");
}

/** Formeltabellen læser `OMKREDS_FORMEL`, så brødteksten ikke kan vise en anden formel end værktøjet. */
const OMKREDS_NAVN: Record<keyof typeof OMKREDS_FORMEL, { da: string; se: string }> = {
  cirkel: { da: "Cirkel", se: "Cirkel" },
  kvadrat: { da: "Kvadrat", se: "Kvadrat" },
  rektangel: { da: "Rektangel", se: "Rektangel" },
  trekant: { da: "Trekant", se: "Triangel" },
  trapez: { da: "Trapez", se: "Trapets" },
  parallelogram: { da: "Parallelogram", se: "Parallellogram" },
  rombe: { da: "Rombe", se: "Romb" },
};

export default async function OmkredsPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("omkreds", locale) || getPageData("omkreds", "da")!;
  const se = locale === "se";
  const cirkel = OMKREDS_EKSEMPEL.cirkel.svar.meter.toLocaleString("da-DK", {
    maximumFractionDigits: 2,
  });
  const cirkelCm = OMKREDS_EKSEMPEL.cirkel.svar.centimeter.toLocaleString("da-DK", {
    maximumFractionDigits: 0,
  });
  const rektangel = OMKREDS_EKSEMPEL.rektangel.svar.meter.toLocaleString("da-DK", {
    maximumFractionDigits: 0,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/omkreds`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/omkreds" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <OmkredsBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">
            {se ? "Formlerna för de sju figurerna" : "Formlerne for de syv figurer"}
          </h2>
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">{se ? "Omkrets per form" : "Omkreds pr. figur"}</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4">
                  {se ? "Form" : "Figur"}
                </th>
                <th scope="col" className="py-2">
                  {se ? "Formel (a, b, c, d = sidor)" : "Formel (a, b, c, d = sider)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(OMKREDS_FORMEL) as (keyof typeof OMKREDS_FORMEL)[]).map((figur) => (
                <tr key={figur} className="border-b last:border-0">
                  <th scope="row" className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white">
                    {OMKREDS_NAVN[figur][se ? "se" : "da"]}
                  </th>
                  <td className="py-2">
                    <code>{OMKREDS_FORMEL[figur]}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Alla mått skrivs i meter. Cirkelns omkrets är π × diameter — diametern är hela vägen tvärs över, inte radien."
              : "Alle mål skrives i meter. Cirkelens omkreds er π × diameter — diameteren er hele vejen tværs over, ikke radius."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "Meter och centimeter" : "Meter og centimeter"}</h2>
          <p>
            {se
              ? `En cirkel med diametern 1 m har omkretsen ${cirkel} m, vilket är ${cirkelCm} cm. En rektangel på 2 × 3 m har omkretsen ${rektangel} m. Verktyget visar båda enheterna från samma beräkning — välj den som passar din fråga.`
              : `En cirkel med diameter 1 m har omkredsen ${cirkel} m, hvilket er ${cirkelCm} cm. Et rektangel på 2 × 3 m har omkredsen ${rektangel} m. Værktøjet viser begge enheder ud fra den samme beregning — vælg den, der passer til dit spørgsmål.`}
          </p>

          <h2>{se ? "Omkrets och area är inte samma sak" : "Omkreds og areal er ikke det samme"}</h2>
          <p>
            {se ? "Omkrets är längden av kanten runt figuren, mätt i meter. Area är ytans storlek innanför kanten, mätt i m² — det räknar " : "Omkreds er længden af kanten rundt om figuren, målt i meter. Areal er fladens størrelse inden for kanten, målt i m² — det regner "}
            <Link href="/areal">{se ? "areaberäknaren" : "arealberegneren"}</Link>
            {se
              ? ". Samma omkrets kan ge olika area: en kvadrat på 2 × 2 m och en rektangel på 1 × 3 m har båda omkretsen 8 m, men arean 4 m² respektive 3 m²."
              : ". Den samme omkreds kan give forskelligt areal: et kvadrat på 2 × 2 m og et rektangel på 1 × 3 m har begge omkredsen 8 m, men arealet 4 m² mod 3 m²."}
          </p>

          <h2>{se ? "Varför diameter och inte radie" : "Hvorfor diameter og ikke radius"}</h2>
          <p>
            {se
              ? "Omkretsen är 2 × π × radie = π × diameter. Skriver du radien i diameterfältet blir svaret hälften så stort som det ska vara — därför tar verktyget diametern direkt."
              : "Omkredsen er 2 × π × radius = π × diameter. Skriver du radius i diameterfeltet, bliver svaret halvt så stort, som det skal være — derfor tager værktøjet diameteren direkte."}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/omkreds" />
      </div>
      <Sidebar currentHref="/omkreds" adSlotId="omkreds-sidebar" />
    </div>
  );
}
