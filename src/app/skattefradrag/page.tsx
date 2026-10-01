import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { SKATTEFRADRAG_2026 } from "@/lib/satser-2026";
import { formatNumber, getCurrencySuffix } from "@/lib/format";
import dynamic from "next/dynamic";
const SkattefradragBeregner = dynamic(() => import("@/components/SkattefradragBeregner"));
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("skattefradrag");
}

export default async function SkattefradragPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("skattefradrag", locale) || getPageData("skattefradrag", "da")!;
  const fmt = (n: number) => `${formatNumber(n, locale)} ${getCurrencySuffix(locale)}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/skattefradrag`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/skattefradrag" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <SkattefradragBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Oversigt over danske skattefradrag 2026</h2>
          <p>
            Der er mange fradrag, du kan bruge til at <strong>reducere din skat</strong>. De vigtigste er <strong>kørselsfradrag</strong>, <strong>rentefradrag</strong>, <strong>håndværkerfradrag</strong> og fradrag for fagforening og a-kasse.
          </p>

          <h2>Kørselsfradrag (befordringsfradrag)</h2>
          <p>
            Du kan få fradrag for <strong>transport mellem hjem og arbejde</strong>, uanset om du kører bil, tager bus eller cykler. Fradraget gælder for den del af afstanden, der overstiger <strong>24 km dagligt</strong> (12 km hver vej). Satsen er <strong>2,28 kr./km</strong> for 25-120 km og 1,14 kr./km over 120 km.
          </p>

          <h2>Boligjobordningen (håndværkerfradrag og servicefradrag)</h2>
          <p>
            Du kan trække <strong>arbejdsløn</strong> fra i skat på to forskellige områder.
            <strong>Håndværkerfradraget</strong> giver op til {fmt(SKATTEFRADRAG_2026.haandvaerkerMax)} pr. person i 2026,
            men kun for <strong>grønne og energibesparende</strong> arbejder — isolering, energirigtige
            vinduer og døre, varmepumpe, solceller og ladestander. Almindeligt vedligeholdelsesarbejde
            som maling eller udskiftning af et køkken giver ikke længere fradrag.
          </p>
          <p>
            <strong>Servicefradraget</strong> har et særskilt loft på {fmt(SKATTEFRADRAG_2026.servicefradragMax)}
            pr. person og dækker private serviceydelser i og omkring hjemmet: rengøring, vinduespudsning,
            havearbejde, snerydning og børnepasning i hjemmet. Materialer kan ikke fradrages, og
            betalingen skal ske digitalt til en momsregistreret virksomhed.
          </p>

          <h2>Tips til fradrag</h2>
          <ul>
            <li><strong>Tjek din forskudsopgørelse:</strong> Sørg for at alle fradrag er registreret korrekt</li>
            <li><strong>Gem kvitteringer:</strong> Særligt for håndværkerydelser og donationer</li>
            <li><strong>Betal elektronisk:</strong> Håndværkerfradrag kræver elektronisk betaling</li>
            <li><strong>Tjek automatiske fradrag:</strong> Renter og fagforening indberettes normalt automatisk</li>
            <li><strong>Husk kørselsfradrag:</strong> Det er det mest oversete fradrag — mange glemmer det</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/skattefradrag" />
      </div>

      <Sidebar currentHref="/skattefradrag" adSlotId="skattefradrag-sidebar" />
    </div>
  );
}
