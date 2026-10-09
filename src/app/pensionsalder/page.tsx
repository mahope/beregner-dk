import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import PensionsalderBeregner from "@/components/PensionsalderBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  PENSIONSALDER_KILDE,
  pensionsalderEksempel,
  pensionsalderRaekker,
} from "@/lib/pensionsalder";

export async function generateMetadata() {
  return generatePageMetadata("pensionsalder");
}

export default async function PensionsalderPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("pensionsalder", locale) || getPageData("pensionsalder", "da")!;

  const eksempel = pensionsalderEksempel();
  const raekker = pensionsalderRaekker();
  const eksempelDato = eksempel.foerstePensionsdag.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/pensionsalder`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/pensionsalder" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <PensionsalderBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan er folkepensionsalderen bygget op</h2>
          <p>
            Alderen følger fødselsåret. Folketingsflertallet har lagt den i fødselårgange
            — kaldet kohorter — og inden for hver kohort er alderen den samme, uanset på
            hvilken dag i året du er født. Skemaet nedenfor er det, Udbetaling Danmark
            viser på borger.dk, og beregneren læser netop de rækker:
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Født</th>
                  <th>Folkepensionsalder</th>
                </tr>
              </thead>
              <tbody>
                {raekker.map((raekke) => (
                  <tr key={raekke.foedselsdatoLabel}>
                    <td>{raekke.foedselsdatoLabel}</td>
                    <td>
                      <strong>{raekke.alderTekst}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            De to halve år, 65 ½ og 66 ½, gælder kun for årgangene 1954 og 1955. De to
            rækker findes, fordi alderen i overgangen blev sat op halvt år ad gangen —
            fra årgangen 1956 er der kun hele år.
                    </p>

          <h2>Hvornår kan du få udbetalt?</h2>
          <p>
            Du fylder din folkepensionsalder på din fødselsdag — med halvt år hvis din
            kohort har det. Men folkepension udbetales fra den <strong>første dag i den
            måned</strong>, hvor du fylder alderen, ikke på dagen selv. Har du fødselsdag
            den 15. marts, kan du altså få udbetalt allerede fra 1. marts i det år, du
            fylder.
          </p>
          <p>
            Beregnerens eksempel er født den 15. marts 1968, som ligger i kohorten
            1967-1970. Du fylder <strong>{eksempel.alderTekst}</strong> den 15. marts
            2037, og folkepensionen kan udbetales fra{" "}
            <strong>{eksempelDato}</strong>.
          </p>

          <h2>Hvad beregneren ikke tager med</h2>
          <p>
            Folkepensionsalderen er én ting; retten til at gå før er noget andet.
            Beregneren siger intet om <strong>tidlig pension</strong> — du kan gå op til
            3 år før, hvis du har været 42-44 år på arbejdsmarkedet — eller{" "}
            <strong>efterløn</strong>, som begge afhænger af, hvor længe du har været på
            arbejdsmarkedet. Den tager heller ikke højde for ældrecheck, seniorpension
            eller udskudt pension. Til det skal du bruge beregnerne for{" "}
            <a href="/pension">pension</a> og <a href="/efterloen">efterløn</a>.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene i skemaet er vejledende. Folkepensionsalderen kan løbende blive
              forhøjet, fordi den tilpasses den gennemsnitlige levealder — det gælder i
              særlig grad, hvis du er født i 1971 eller senere. Brug beregneren til at
              forstå, hvor du er henne; se den præcise alder på borger.dk.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 not-prose">
            Skema og halvårskohorter: {PENSIONSALDER_KILDE.skema}. Udbetaling fra første
            dag i måneden: {PENSIONSALDER_KILDE.udbetaling}. Tidlig pension:{" "}
            {PENSIONSALDER_KILDE.tidligPension}. Verificeret {PENSIONSALDER_KILDE.verifiedAt}.
          </p>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om folkepensionsalder" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/pensionsalder" />
        </section>
      </div>

      <Sidebar currentHref="/pensionsalder" adSlotId="pensionsalder-sidebar" />
    </div>
  );
}
