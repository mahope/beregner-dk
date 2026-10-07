import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { KIRKESKAT_EKSEMPLER, KIRKESKAT_SATS_EKSEMPLER, KIRKESKAT_SNIT, KIRKESKAT_EKSEMPEL_INDKOMST, beregnKirkeskat, kirkeskatSats } from "@/lib/kirkeskat";
import KirkeskatBeregner from "@/components/KirkeskatBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";

const kr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });

export async function generateMetadata() {
  return generatePageMetadata("kirkeskat");
}

export default async function KirkeskatPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("kirkeskat", locale) || getPageData("kirkeskat", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kirkeskat`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/kirkeskat" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <KirkeskatBeregner />

        {locale === "da" && (
          <div className="mt-12 prose max-w-none">
            <h2>Hvad er kirkeskat?</h2>
            <p>
              Kirkeskat er en skat til den danske folkekirke, som betales af medlemmer af kirken.
              Satsen varierer kommune til kommune og ligger mellem <strong>0,42 % og 1,10 %</strong> i
              2026. Grundlaget er din skattepligtige indkomst efter fradrag.
            </p>
            <p>
              Kirkeskat indregnes automatisk i din forskudsopgørelse, så du behøver ikke at gøre
              noget aktivt for at betale den. Beløbet kan du se på din forskudsopgørelse eller i
              din lønseddel.
            </p>

            <h2>Hvor meget sparer jeg ved at melde mig ud?</h2>
            <p>
              Hvis du melder dig ud af folkekirken, sparer du hele kirkeskatten. For en person med
              en skattepligtig indkomst på <strong>{kr(KIRKESKAT_EKSEMPEL_INDKOMST)} kr.</strong> i
              København (sats:{" "}
              {kirkeskatSats("København").toLocaleString("da-DK", { minimumFractionDigits: 2 })} %)
              er det <strong>{kr(beregnKirkeskat(KIRKESKAT_EKSEMPEL_INDKOMST, "København")!.kirkeskat)} kr.</strong> pr. år.
            </p>
            <p>
              Du kan melde dig ud af folkekirken når som helst via{" "}
              <a href="https://www.skat.dk" target="_blank" rel="noopener noreferrer">
                skat.dk
              </a>{" "}
              eller ved at kontakte din sognepræst. Det er gratis, og du kan altid melde dig ind igen.
            </p>

            <h2>Regneeksempler</h2>
            <table>
              <thead>
                <tr>
                  <th>Skattepligtig indkomst</th>
                  <th>Kommune</th>
                  <th>Kirkeskat pr. år</th>
                </tr>
              </thead>
              <tbody>
                {KIRKESKAT_EKSEMPLER.map((e) => (
                  <tr key={`${e.skattepligtig}-${e.kommune}`}>
                    <td>{kr(e.skattepligtig)} kr.</td>
                    <td>{e.kommune}</td>
                    <td>
                      <strong>{kr(e.resultat.kirkeskat)} kr.</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Kirkeskattesatser i 2026</h2>
            <p>
              Satsen varierer kommune til kommune. Her er nogle eksempler:
            </p>
            <ul>
              {KIRKESKAT_SATS_EKSEMPLER.map((k) => (
                <li key={k}>
                  <strong>{k}:</strong> {kirkeskatSats(k).toLocaleString("da-DK", { minimumFractionDigits: 2 })} %
                </li>
              ))}
            </ul>
            <p>
              Den gennemsnitlige kirkeskattesats i Danmark er ca. <strong>{KIRKESKAT_SNIT.toLocaleString("da-DK", { minimumFractionDigits: 2 })} %</strong>.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
              <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
              <p className="text-blue-700 dark:text-blue-400">
                Beregneren giver et estimat med 2026-satserne. Den præcise kirkeskat afhænger af din
                skattepligtige indkomst og din kommune. Læs mere på{" "}
                <a
                  href="https://www.skm.dk/satser/statistik/kommuneskatter"
                  className="underline"
                  rel="noopener noreferrer"
                >
                  skm.dk
                </a>
                .
              </p>
            </div>
          </div>
        )}

        <section className="mt-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Relaterede beregninger</p>
            <p className="text-blue-700 dark:text-blue-400">
              Kirkeskat er en del af din samlede skat. Se også{" "}
              <Link href="/brutto-netto" className="underline font-medium">
                brutto-netto-beregneren
              </Link>{" "}
              og{" "}
              <Link href="/loen-efter-skat" className="underline font-medium">
                løn-efter-skat-beregneren
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om kirkeskat" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/kirkeskat" />
        </section>
      </div>

      <Sidebar currentHref="/kirkeskat" adSlotId="kirkeskat-sidebar" />
    </div>
  );
}
