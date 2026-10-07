import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { GAVE_EKSEMPLER, GAVE_RELATIONER } from "@/lib/gaveafgift";
import GaveafgiftBeregner from "@/components/GaveafgiftBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Sidebar from "@/components/Sidebar";

const kr = (n: number) => n.toLocaleString("da-DK", { maximumFractionDigits: 0 });
const pct = (n: number) => (n * 100).toLocaleString("da-DK", { maximumFractionDigits: 2 });

const relationNavn: Record<string, string> = {
  naer: "Nær familie",
  bedsteforaeldre: "Bedsteforældre/stedforældre",
  svigerboern: "Svigerbarn",
};

export async function generateMetadata() {
  return generatePageMetadata("gaveafgift");
}

export default async function GaveafgiftPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("gaveafgift", locale) || getPageData("gaveafgift", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/gaveafgift`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/gaveafgift" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <GaveafgiftBeregner />

        {locale === "da" && (
          <div className="mt-12 prose max-w-none">
            <h2>Gaveafgift i 2026</h2>
            <p>
              Du kan hvert år give <strong>afgiftsfrie gaver</strong> til din nærmeste familie.
              Grænsen er <strong>{kr(GAVE_RELATIONER.naer.bundfradrag)} kr.</strong> pr. gavemodtager
              pr. kalenderår i 2026. Giver du mere end det, skal der betales{" "}
              <strong>{pct(GAVE_RELATIONER.naer.sats)} % i gaveafgift</strong> af det overskydende
              beløb. Det er modtageren, der hæfter for afgiften, men i praksis betaler giveren den ofte.
            </p>

            <h2>Så meget må du give (2026)</h2>
            <table>
              <thead>
                <tr>
                  <th>Gavemodtager</th>
                  <th>Afgiftsfrit beløb</th>
                  <th>Gaveafgift</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Børn, stedbørn og deres børn, forældre, samlever, plejebørn</td>
                  <td>{kr(GAVE_RELATIONER.naer.bundfradrag)} kr.</td>
                  <td>{pct(GAVE_RELATIONER.naer.sats)} %</td>
                </tr>
                <tr>
                  <td>Bedsteforældre og stedforældre</td>
                  <td>{kr(GAVE_RELATIONER.bedsteforaeldre.bundfradrag)} kr.</td>
                  <td>{pct(GAVE_RELATIONER.bedsteforaeldre.sats)} %</td>
                </tr>
                <tr>
                  <td>Svigerbørn</td>
                  <td>{kr(GAVE_RELATIONER.svigerboern.bundfradrag)} kr.</td>
                  <td>{pct(GAVE_RELATIONER.svigerboern.sats)} %</td>
                </tr>
              </tbody>
            </table>
            <p>
              Grænsen er pr. <strong>gavemodtager</strong> og pr. <strong>giver</strong>. Et barn kan
              altså i 2026 modtage op til {kr(GAVE_RELATIONER.naer.bundfradrag)} kr. fra hver af sine
              forældre uden afgift — i alt {kr(2 * GAVE_RELATIONER.naer.bundfradrag)} kr.
            </p>

            <h2>Regneeksempler</h2>
            <p>
              Tallene nedenfor er de samme, som beregneren ovenfor regner, og følger Skattestyrelsens
              egne eksempler. De forudsætter, at der ikke er givet andre gaver til samme modtager i
              samme kalenderår.
            </p>
            <table>
              <thead>
                <tr>
                  <th>Gave</th>
                  <th>Gavemodtager</th>
                  <th>Afgiftsfrit</th>
                  <th>Afgift</th>
                </tr>
              </thead>
              <tbody>
                {GAVE_EKSEMPLER.map((e) => (
                  <tr key={`${e.beloeb}-${e.relation}`}>
                    <td>{kr(e.beloeb)} kr.</td>
                    <td>{relationNavn[e.relation]}</td>
                    <td>{kr(e.resultat.bundfradrag)} kr.</td>
                    <td>
                      <strong>{kr(e.resultat.afgift)} kr.</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2>Hvornår skal gaven anmeldes?</h2>
            <p>
              Gaver over det afgiftsfrie beløb skal anmeldes til Skattestyrelsen senest{" "}
              <strong>1. maj året efter</strong>, at gaven er modtaget, og gaveafgiften skal betales
              samme dag, som anmeldelsen sendes. Gaver under grænsen skal ikke anmeldes.
            </p>
            <p>
              Almindelige lejlighedsgaver til jul, fødselsdag, konfirmation og bryllup af beskeden
              værdi er skattefrie, og gaver mellem ægtefæller er som udgangspunkt afgiftsfrie.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
              <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
              <p className="text-blue-700 dark:text-blue-400">
                Beregneren giver et estimat med 2026-satserne. Reglerne afhænger af din konkrete
                relation og af, om der er givet andre gaver i året. Læs mere på{" "}
                <a
                  href="https://skat.dk/borger/gaver-gevinster-og-legater/gaver-saa-meget-maa-du-give"
                  className="underline"
                  rel="noopener noreferrer"
                >
                  skat.dk
                </a>{" "}
                eller spørg en rådgiver.
              </p>
            </div>
          </div>
        )}

        <section className="mt-12">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Gælder både gave og arv</p>
            <p className="text-blue-700 dark:text-blue-400">
              Gaveafgift og arveafgift hører til samme regelsæt (boafgiftsloven). Skal du beregne
              afgiften af en arv i stedet, kan du bruge{" "}
              <Link href="/arveafgift" className="underline font-medium">
                arveafgift-beregneren
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om gaveafgift" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/gaveafgift" />
        </section>
      </div>

      <Sidebar currentHref="/gaveafgift" adSlotId="gaveafgift-sidebar" />
    </div>
  );
}
