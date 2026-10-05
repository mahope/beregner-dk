import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RumfangBeregner from "@/components/RumfangBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { LITER_PR_KUBIKMETER, RUMFANG_EKSEMPEL, RUMFANG_FORMEL } from "@/lib/rumfang";

export async function generateMetadata() {
  return generatePageMetadata("rumfang");
}

/** Formeltabellen læser `RUMFANG_FORMEL`, så brødteksten ikke kan vise en anden formel end værktøjet. */
const RUMFANG_NAVN: Record<keyof typeof RUMFANG_FORMEL, { da: string; se: string }> = {
  kasse: { da: "Kasse", se: "Låda" },
  cylinder: { da: "Cylinder", se: "Cylinder" },
  kugle: { da: "Kugle", se: "Sfär" },
  kegle: { da: "Kegle", se: "Kon" },
  pyramide: { da: "Pyramide", se: "Pyramid" },
};

export default async function RumfangPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("rumfang", locale) || getPageData("rumfang", "da")!;
  const se = locale === "se";
  const kasse = RUMFANG_EKSEMPEL.kasse.svar.kubikmeter;
  const kasseTekst = kasse.toLocaleString("da-DK", { maximumFractionDigits: 2 });
  const kasseLiter = RUMFANG_EKSEMPEL.kasse.svar.liter.toLocaleString("da-DK", { maximumFractionDigits: 0 });
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/rumfang`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/rumfang" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <RumfangBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">{se ? "Formlerna för de fem figurerna" : "Formlerne for de fem figurer"}</h2>
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">
              {se ? "Rumfang per figur" : "Rumfang pr. figur"}
            </caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4">
                  {se ? "Figur" : "Figur"}
                </th>
                <th scope="col" className="py-2">
                  {se ? "Formel (d = diameter, H = höjd)" : "Formel (d = diameter, H = højde)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(RUMFANG_FORMEL) as (keyof typeof RUMFANG_FORMEL)[]).map((figur) => (
                <tr key={figur} className="border-b last:border-0">
                  <th scope="row" className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white">
                    {RUMFANG_NAVN[figur][se ? "se" : "da"]}
                  </th>
                  <td className="py-2">
                    <code>{RUMFANG_FORMEL[figur]}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Alla mått skrivs i meter. π är 3,14159…, så ett tal med många decimaler är korrekt — avrundningen görs i visningen, inte i formeln."
              : "Alle mål skrives i meter. π er 3,14159…, så et tal med mange decimaler er korrekt — afrundningen sker i visningen, ikke i formlen."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "Meters till liter" : "Meter til liter"}</h2>
          <p>
            {se ? `1 m³ = ${LITER_PR_KUBIKMETER} liter. ` : `1 m³ = ${LITER_PR_KUBIKMETER} liter. `}
            {se
              ? `En låda på 2 × 1 × 0,5 m har alltså volymen 1 m³, vilket är ${kasseLiter} liter. Det är samma sak i två enheter — välj den som passar din fråga.`
              : `En kasse på 2 × 1 × 0,5 m har altså rumfanget ${kasseTekst} m³, hvilket er ${kasseLiter} liter. Det er samme tal i to enheder — vælg den, der passer dit spørgsmål.`}
          </p>
          <p>
            {se
              ? "Målen i meter ger ofta et tal med mange decimaler, fordi en kugle på 40 cm er 0,0335 m³. Det er ikke en fejl — brug liter, når du skal sammenligne med en opskrift eller en beholder."
              : "Mål i meter giver ofte et tal med mange decimaler, fordi en kugle på 40 cm er 0,0335 m³. Det er ikke en fejl — brug liter, når du skal sammenligne med en opskrift eller en beholder."}
          </p>

          <h2>{se ? "Rumfang och area är inte samma sak" : "Rumfang og areal er ikke det samme"}</h2>
          <p>
            {se
              ? `Areal är ytan storlek i m² — golvet, väggen, tomten. Det är vad ` : `Areal er fladens størrelse i m² — gulvet, væggen, grundstykket. Det er det, `}
            <Link href="/kvadratmeter">{se ? "kvadratmeterkalkylatorn" : "kvadratmeterberegneren"}</Link>
            {se
              ? " räknar. Rumfang är utrymmet innanför kroppen i m³. Samma låda på 2 × 1 × 0,5 m har 10 m² golv och 1 m³ rumfang."
              : " regner. Rumfang er pladsen inde i kroppen i m³. Den samme kasse på 2 × 1 × 0,5 m har 10 m² gulv og 1 m³ rumfang."}
          </p>

          <h2>{se ? "Varför diameter och inte radie" : "Hvorfor diameter og ikke radius"}</h2>
          <p>
            {se
              ? "När någon mäter en gryta med 20 cm i diametern och skriver 20 som radie blir svaret fyra gånger för stort — kvadraten i cirkelarean gör felet till ett fyrdubbelt fel. Verktyget tar därför diameter direkt, och halverar den själv."
              : "Når man måler en gryde på 20 cm i diameter og skriver 20 som radius, blir svaret fire gange for stort — kvadraten i cirkelarealet gør fejlen til en firedobbelt fejl. Værktøjet tager derfor diameter direkte og halverer den selv."}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/rumfang" />
      </div>
      <Sidebar currentHref="/rumfang" adSlotId="rumfang-sidebar" />
    </div>
  );
}