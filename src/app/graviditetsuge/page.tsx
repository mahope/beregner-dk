import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getPageData } from "@/lib/page-data";
import GraviditetsugeBeregner from "@/components/GraviditetsugeBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("graviditetsuge");
}

export default function GraviditetsugePage() {
  const pageData = getPageData("graviditetsuge", "da");
  if (!pageData) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { name: "Familie", href: "/kategori/familie" },
          { name: pageData.title, href: "/graviditetsuge" },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{pageData.title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{pageData.description}</p>
          <div className="mt-6">
            <GraviditetsugeBeregner />
          </div>

          <div className="prose mt-12 max-w-none dark:prose-invert">
            <h2>Sådan regnes graviditetsuger ud</h2>
            <p>
              En graviditet regnes fra <strong>første dag i sidste menstruation</strong>, ikke fra
              undfangelsen. Det lyder bagvendt, men er den måde læger og jordemødre regner på, fordi
              den sidste menstruation er nem at datere. Graviditeten varer <strong>280 dage</strong> —
              40 uger — fra den dag (Naegeles regel).
            </p>
            <p>
              Fordi ægløsningen først sker omkring <strong>dag 14</strong>, er du altså omkring to uger
              «henne», før du overhovedet er blevet gravid. Det er ikke en fejl: det er derfor, en
              fødsel i uge 40 svarer til 38 uger fra undfangelsen.
            </p>
            <p>
              Kender du i stedet din <strong>terminsdato</strong>, kan du regne tilbage: træk 280 dage
              fra. Kender du <strong>ægløsningsdagen</strong>, lægger du 14 dage til, før du tæller uger.
              Vælger du «beregn på en anden dato» i værktøjet, kan du se, hvor langt du var henne — eller
              hvor langt du er — på en bestemt dag.
            </p>

            <h2>De tre trimestre</h2>
            <ul>
              <li>
                <strong>1. trimester (til og med uge 12):</strong> alle organer dannes. Nakkefoldscanning
                tilbydes i uge 11-14.
              </li>
              <li>
                <strong>2. trimester (uge 13-26):</strong> barnet vokser hurtigt, og de fleste kan mærke
                bevægelser. Misdannelsesscanning tilbydes omkring uge 20.
              </li>
              <li>
                <strong>3. trimester (fra uge 27):</strong> barnet modnes. Fra uge 37 regnes det som
                fuldbårent.
              </li>
            </ul>

            <h2>Er ugen præcis?</h2>
            <p>
              Beregningen antager en regelmæssig cyklus på 28 dage. Er din cyklus længere eller kortere,
              eller er du blevet gravid med IVF, retter <strong>ultralydsscanningen i uge 12</strong>
              terminsdatoen, og herefter er det den dato, lægen regner efter. Brug resultatet her som et
              vejledende svar, og spørg din jordemoder, hvis du er i tvivl.
            </p>
            <p>
              Vil du regne den anden vej — fra sidste menstruation til terminsdatoen? Brug{" "}
              <Link href="/termin">terminsdato-beregneren</Link>. Skal du planlægge barslen, kan du se
              beløbene i <Link href="/barselsdagpenge">barselsdagpenge-beregneren</Link>.
            </p>
          </div>

          <div className="mt-8">
            <FAQ items={pageData.faqItems} />
          </div>
          <CalculatorSchema
            name={pageData.schemaName}
            description={pageData.schemaDescription}
            url="https://minberegner.dk/graviditetsuge"
            category={pageData.schemaCategory}
          />
          <FAQSchema items={pageData.faqItems} />
        </main>
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
      </div>
      <RelatedCalculators current="/graviditetsuge" />
    </div>
  );
}
