import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ArealBeregner from "@/components/ArealBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  AREAL_EKSEMPEL,
  AREAL_FORMEL,
  KVADRATCENTIMETER_PR_KVADRATMETER,
} from "@/lib/areal";

export async function generateMetadata() {
  return generatePageMetadata("areal");
}

/** Formeltabellen læser `AREAL_FORMEL`, så brødteksten ikke kan vise en anden formel end værktøjet. */
const AREAL_NAVN: Record<keyof typeof AREAL_FORMEL, { da: string; se: string }> = {
  cirkel: { da: "Cirkel", se: "Cirkel" },
  trekant: { da: "Trekant", se: "Triangel" },
  rektangel: { da: "Rektangel", se: "Rektangel" },
  kvadrat: { da: "Kvadrat", se: "Kvadrat" },
  trapez: { da: "Trapez", se: "Trapets" },
  parallelogram: { da: "Parallelogram", se: "Parallellogram" },
  rombe: { da: "Rombe", se: "Romb" },
};

export default async function ArealPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("areal", locale) || getPageData("areal", "da")!;
  const se = locale === "se";
  const rektangel = AREAL_EKSEMPEL.rektangel.svar.kvadratmeter;
  const rektangelTekst = rektangel.toLocaleString("da-DK", { maximumFractionDigits: 2 });
  const rektangelCm = AREAL_EKSEMPEL.rektangel.svar.kvadratcentimeter.toLocaleString("da-DK", {
    maximumFractionDigits: 0,
  });
  const cirkel = AREAL_EKSEMPEL.cirkel.svar.kvadratmeter.toLocaleString("da-DK", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/areal`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/areal" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <ArealBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8 not-prose">
          <h2 className="text-2xl font-bold mb-3">
            {se ? "Formlerna för de sju figurerna" : "Formlerne for de syv figurer"}
          </h2>
          <table className="w-full text-left border-collapse">
            <caption className="sr-only">{se ? "Area per form" : "Areal pr. figur"}</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="py-2 pr-4">
                  {se ? "Form" : "Figur"}
                </th>
                <th scope="col" className="py-2">
                  {se ? "Formel (d = diameter, h = höjd)" : "Formel (d = diameter, h = højde)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(AREAL_FORMEL) as (keyof typeof AREAL_FORMEL)[]).map((figur) => (
                <tr key={figur} className="border-b last:border-0">
                  <th scope="row" className="py-2 pr-4 text-left font-medium text-gray-900 dark:text-white">
                    {AREAL_NAVN[figur][se ? "se" : "da"]}
                  </th>
                  <td className="py-2">
                    <code>{AREAL_FORMEL[figur]}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {se
              ? "Alla mått skrivs i meter. π är 3,14159…, så ett tal med många decimaler är korrekt — avrundningen görs i visningen, inte i formeln."
              : "Alle mål skrives i meter. π er 3,14159…, så et tal med mange decimaler er korrekt — afrundingen sker i visningen, ikke i formlen."}
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>{se ? "Kvadratmeter och kvadratcentimeter" : "Kvadratmeter og kvadratcentimeter"}</h2>
          <p>
            {se ? `1 m² = ${KVADRATCENTIMETER_PR_KVADRATMETER.toLocaleString("da-DK")} cm². ` : `1 m² = ${KVADRATCENTIMETER_PR_KVADRATMETER.toLocaleString("da-DK")} cm². `}
            {se
              ? `En rektangel på 2 × 3 m har arean ${rektangelTekst} m², vilket är ${rektangelCm} cm². Det är samma yta i två enheter — välj den som passar din fråga.`
              : `Et rektangel på 2 × 3 m har arealet ${rektangelTekst} m², hvilket er ${rektangelCm} cm². Det er samme flade i to enheder — vælg den, der passer til dit spørgsmål.`}
          </p>
          <p>
            {se
              ? "Mått i meter ger ofta ett tal med många decimaler, fordi en cirkel på 40 cm har arean 0,126 m². Det är inte ett fel — räkna i centimeter, när du jämför med en ritning eller en skoluppgift."
              : "Mål i meter giver ofte et tal med mange decimaler, fordi en cirkel på 40 cm har arealet 0,126 m². Det er ikke en fejl — regn i centimeter, når du sammenligner med en tegning eller en skoleopgave."}
          </p>

          <h2>{se ? "Area och volym är inte samma sak" : "Areal og rumfang er ikke det samme"}</h2>
          <p>
            {se ? "Area är ytans storlek i m² — golvet, väggen, tomten. Det är vad den här sidan räknar. Volym är utrymmet innanför kroppen i m³ — det räknar " : "Areal er fladens størrelse i m² — gulvet, væggen, grundstykket. Det er det, denne side regner. Rumfang er pladsen inde i kroppen i m³ — det regner "}
            <Link href="/rumfang">{se ? "volymberäknaren" : "rumfangsberegneren"}</Link>
            {se
              ? ". En låda på 2 × 1 × 0,5 m har 2 m² golv men bara 1 m³ volym."
              : ". Den samme kasse på 2 × 1 × 0,5 m har 2 m² gulv, men kun 1 m³ rumfang."}
          </p>

          <h2>{se ? "Varför diameter och inte radie" : "Hvorfor diameter og ikke radius"}</h2>
          <p>
            {se
              ? `En cirkel med diametern 1 m har arean ${cirkel} m². Skriver du 1 som radie i stället, blir svaret fyra gånger för stort — kvadraten i πr² gör felet fyrdubbelt. Verktyget tar därför diameter direkt och halverar den själv.`
              : `En cirkel med diameter 1 m har arealet ${cirkel} m². Skriver du 1 som radius i stedet, bliver svaret fire gange for stort — kvadraten i πr² gør fejlen firedobbelt. Værktøjet tager derfor diameter direkte og halverer den selv.`}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/areal" />
      </div>
      <Sidebar currentHref="/areal" adSlotId="areal-sidebar" />
    </div>
  );
}
