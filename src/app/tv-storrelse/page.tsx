import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SkaermstorrelseBeregner from "@/components/SkaermstorrelseBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  SEERAFSTAND_FJERN_GRAD,
  SEERAFSTAND_NAER_GRAD,
  SKARM_TABEL_TOMMER,
  TOMME_I_CM,
  beregnSeerafstand,
  beregnSkarmMaal,
} from "@/lib/skaermstorrelse";

export async function generateMetadata() {
  return generatePageMetadata("tv-storrelse");
}

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

export default async function TvStorrelsePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("tv-storrelse", locale) || getPageData("tv-storrelse", "da")!;

  // Brødteksten læser værktøjets egne tal, så de ikke kan glide fra hinanden.
  const eksempel = beregnSkarmMaal(55, "16:9")!;
  const eksempelAfstand = beregnSeerafstand(eksempel.breddeCm);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/tv-storrelse`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/tv-storrelse" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <SkaermstorrelseBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan regner du tommer om til centimeter</h2>
          <p>
            Et tv opgives med sin <strong>diagonale</strong> i tommer — det er den længste afstand
            fra hjørne til hjørne, ikke bredden. Én tomme er præcis{" "}
            <strong>{fmt(TOMME_I_CM, 2)} cm</strong>, så et 55-tommers tv har en diagonal på{" "}
            <strong>{fmt(eksempel.diagonalCm)} cm</strong>.
          </p>
          <p>
            Bredden og højden finder du ud fra skærmformatet. Et almindeligt tv er <strong>16:9</strong>,
            så bredde og højde forholder sig som 16 til 9. Bredden er derfor{" "}
            <strong>
              diagonal × 16 ÷ √(16² + 9²)
            </strong>
            , og højden er den samme regning med 9 i stedet for 16:
          </p>
          <p>
            <strong>bredde = {fmt(eksempel.diagonalCm)} × 16 ÷ √337 = {fmt(eksempel.breddeCm)} cm</strong>
            <br />
            <strong>højde = {fmt(eksempel.diagonalCm)} × 9 ÷ √337 = {fmt(eksempel.hoejdeCm)} cm</strong>
          </p>
          <p>
            Det er de mål, der afgør, om tv&apos;et passer på væggen eller i møblet — ikke
            diagonalen alene.
          </p>

          <h2>Størrelser fra 32 til 85 tommer i centimeter</h2>
          <p>
            Tabellen er regnet med 16:9, som næsten alle tv i dag bruger. Bredden er den vigtigste
            for et møbel eller et vægbeslag; højden bestemmer seerafstanden.
          </p>
          <table>
            <thead>
              <tr>
                <th>Tommer</th>
                <th>Diagonal</th>
                <th>Bredde</th>
                <th>Højde</th>
                <th>Anbefalet afstand</th>
              </tr>
            </thead>
            <tbody>
              {SKARM_TABEL_TOMMER.map((tommer) => {
                const m = beregnSkarmMaal(tommer, "16:9")!;
                const a = beregnSeerafstand(m.breddeCm);
                return (
                  <tr key={tommer}>
                    <td>{tommer}&quot;</td>
                    <td>{fmt(m.diagonalCm)} cm</td>
                    <td>
                      <strong>{fmt(m.breddeCm)} cm</strong>
                    </td>
                    <td>{fmt(m.hoejdeCm)} cm</td>
                    <td>
                      {fmt(a.naerCm / 100)}–{fmt(a.fjernCm / 100)} m
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Hvor langt væk skal man sidde?</h2>
          <p>
            Der findes ikke ét rigtigt svar, men branchen anbefaler en <strong>vandret synsvinkel</strong>{" "}
            på mellem {SEERAFSTAND_NAER_GRAD} og {SEERAFSTAND_FJERN_GRAD} grader. Afstanden følger
            formlen <strong>afstand = bredde ÷ 2 ÷ tan(vinkel ÷ 2)</strong>. For et 55-tommers tv,
            der er {fmt(eksempel.breddeCm)} cm bredt, giver det en seerafstand på mellem{" "}
            <strong>{fmt(eksempelAfstand.naerCm / 100)}</strong> og{" "}
            <strong>{fmt(eksempelAfstand.fjernCm / 100)} meter</strong>.
          </p>
          <p>
            Sidder du tættere på end det, fylder skærmen mere af synsfeltet. Det føles mere
            biografagtigt, og med 4K-indhold kan man sagtens sidde tæt på — men til almindeligt
            tv og sport bliver det hurtigt trættende, fordi øjnene skal bevæge sig for meget.
          </p>

          <h2>Tommer er diagonalen, ikke bredden</h2>
          <p>
            Den mest almindelige misforståelse er at tro, at et 55-tommers tv er 55 tommer bredt.
            Det er diagonalen: bredden er kun omkring{" "}
            {Math.round((eksempel.breddeCm / eksempel.diagonalCm) * 100)} % af diagonalen. Et
            ultrawide-tv i 21:9 er for eksempel bredere og lavere end et 16:9-tv med samme
            diagonal — prøv de to formater i beregneren og se forskellen.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Fra tommer til centimeter</p>
            <p className="text-blue-700 dark:text-blue-400">
              Skal du omregne andre længder — fod, mil eller tommer til cm — kan du bruge{" "}
              <Link href="/enheder" className="underline font-medium">
                enhedsberegneren
              </Link>
              . Skal du finde arealet af en væg eller et gulv, så brug{" "}
              <Link href="/kvadratmeter" className="underline font-medium">
                kvadratmeterberegneren
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om tv-størrelser" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/tv-storrelse" />
        </section>
      </div>

      <Sidebar currentHref="/tv-storrelse" adSlotId="tv-storrelse-sidebar" />
    </div>
  );
}
