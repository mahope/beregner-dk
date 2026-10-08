import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import GramTilDlBeregner from "@/components/GramTilDlBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  GRAM_TIL_DL_EKSEMPEL,
  GRAM_TIL_DL_KATEGORIER,
  GRAM_TIL_DL_VARER,
  dlTilGram,
  formatGramTilDl,
  gramTilDl,
  gramTilDlEksempel,
  vareVedId,
} from "@/lib/gram-til-dl";

export async function generateMetadata() {
  return generatePageMetadata("gram-til-dl");
}

export default async function GramTilDlPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("gram-til-dl", locale) || getPageData("gram-til-dl", "da")!;

  // Brødteksten læser værktøjets egne tal, så de to ikke kan glide fra hinanden.
  const eksempel = gramTilDlEksempel();
  const eksempelVare = vareVedId(GRAM_TIL_DL_EKSEMPEL.vareId)!;
  const eksempelMaengde = formatGramTilDl(GRAM_TIL_DL_EKSEMPEL.maengde, 0);
  const eksempelSvar = formatGramTilDl(eksempel.svar, 2);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/gram-til-dl`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/gram-til-dl" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <GramTilDlBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan omregner du gram til dl</h2>
          <p>
            Gram måler <strong>vægt</strong>, og deciliter måler <strong>rumfang</strong>. Derfor
            kan man ikke bruge ét fast tal for alle varer: en deciliter mel vejer mindre end en
            deciliter sukker. Du skal kende ingrediensens vægt pr. deciliter og regne:
          </p>
          <p>
            <strong>dl = gram ÷ (gram pr. dl)</strong> &nbsp;og&nbsp;{" "}
            <strong>gram = dl × (gram pr. dl)</strong>
          </p>
          <p>
            Et eksempel fra tabellen: 1 dl {eksempelVare.navn.toLowerCase()} vejer{" "}
            {eksempelVare.gramPrDl} g. Derfor er {eksempelMaengde} g{" "}
            {eksempelMaengde} ÷ {eksempelVare.gramPrDl} ={" "}
            <strong>{eksempelSvar} dl</strong>. Vendt om giver{" "}
            {dlTilGram(2, eksempelVare.gramPrDl)} g for 2 dl.
          </p>

          <h2>Hvor meget vejer 1 dl?</h2>
          <p>
            Tabellen viser de almindelige ingredienser i dansk bagning og madlavning. Den midterste
            kolonne er kilden: hvor mange gram 1 dl vejer. Den sidste kolonne er regnet af samme
            tal, så 100 g svarer til 100 ÷ vægten pr. dl.
          </p>
          {GRAM_TIL_DL_KATEGORIER.map((kategori) => (
            <div key={kategori}>
              <h3>{kategori}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ingrediens</th>
                    <th>1 dl</th>
                    <th>100 g</th>
                  </tr>
                </thead>
                <tbody>
                  {GRAM_TIL_DL_VARER.filter((v) => v.kategori === kategori).map((v) => (
                    <tr key={v.id}>
                      <td>{v.navn}</td>
                      <td>{v.gramPrDl} g</td>
                      <td>
                        <strong>{formatGramTilDl(gramTilDl(100, v.gramPrDl), 2)} dl</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <h2>Vægt eller rumfang — hvad skal du bruge?</h2>
          <p>
            Til bagning er vægt mest præcist, fordi mel kan være løst eller sammenpresset i
            målebægeret. En opskrift, der skriver «2 dl mel», kan derfor give et lidt andet resultat
            end en, der skriver «120 g». Har du en køkkenvægt, så vej de tørre varer, og brug
            dl-målet til væske, hvor 1 dl næsten altid er 100 g. Skal du omregne andre enheder som
            tommer, grader eller hektar, kan du bruge{" "}
            <Link href="/enheder" className="underline font-medium">
              enhedsomregneren
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende tal</p>
            <p className="text-blue-700 dark:text-blue-400">
              Vægten pr. deciliter er et køkkenmål og varierer med varens finhed og hvor fast, den
              fyldes i målet. Tallene er derfor vejledende — skal opskriften ramme præcist, så brug
              en vægt. Skal du regne kalorier for en portion, kan du bruge{" "}
              <Link href="/kalorier" className="underline font-medium">
                kalorieberegneren
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om gram og dl" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/gram-til-dl" />
        </section>
      </div>

      <Sidebar currentHref="/gram-til-dl" adSlotId="gram-til-dl-sidebar" />
    </div>
  );
}
