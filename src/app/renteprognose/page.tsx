import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import RenteprognoseBeregner from "@/components/RenteprognoseBeregner";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { generatePageMetadata } from "@/lib/page-helpers";
import { beregnRenteprognose } from "@/lib/renteprognose";
import Link from "next/link";

/**
 * Eksemplet i brødteksten læses fra samme modul som værktøjet, så det ikke kan
 * komme på afveje fra det (punkt 11 i `_kvalitet.md`).
 */
const FORUDSETNING = {
  laanebeloeb: 2_000_000,
  rente: 0.035,
  loebetidAar: 30,
  renteomlaegning: "aar5" as const,
  afdragsform: "afdrag" as const,
};

const EKSEMPEL = beregnRenteprognose({ ...FORUDSETNING, renteudvikling: 0 });

const EKSEMPEL_STIGENDE = beregnRenteprognose({ ...FORUDSETNING, renteudvikling: 0.01 });

const kr = (v: number) => `${Math.round(v).toLocaleString("da-DK")} kr.`;

export async function generateMetadata() {
  return generatePageMetadata("renteprognose");
}

export default async function RenteprognosePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("renteprognose", locale) || getPageData("renteprognose", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/renteprognose`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs
        items={[
          { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
          { name: pageData.title, href: "/renteprognose" },
        ]}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{pageData.title}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{pageData.description}</p>
          </header>

          <section className="mb-12">
            <RenteprognoseBeregner />
          </section>

          {locale === "da" && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Hvad en renteprognose kan — og ikke kan
              </h2>
              <div className="prose max-w-none text-gray-700">
                <p>
                  En renteprognose er en <strong>følsomhedsberegning</strong>. Den
                  svarer på spørgsmålet: <em>hvis</em> renterne ændrer sig, hvad
                  koster så lånet? Den er ikke en forudsigelse, fordi ingen offentlig
                  kilde forudsiger, hvad de danske realkreditrenter bliver om fem
                  eller ti år — bankerne fastsætter den nye rente, hver gang lånet
                  omlægges, ud fra markedet den dag. Derfor er{" "}
                  <strong>0 procentpoint</strong> standarden i værktøjet ovenfor,
                  og du kan selv vælge op til 3 procentpoint op eller ned.
                </p>
                <p>
                  Det er den forskel på en renteprognose og en renteberegning, der
                  er værd at kende. En{" "}
                  <Link href="/renteberegner" className="underline">renteberegner</Link>{" "}
                  forteller dig, hvad ét lån koster ved én rente. En
                  renteprognose forteller dig, hvad det{" "}
                  <em>kommer til at</em> koste, når rentesættet flytter sig.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Renten ændrer sig i trin, ikke hver måned
                </h3>
                <p>
                  En renteomlægning er det tidspunkt, hvor banken sætter en ny
                  rente. Derfor står rentesættet i værktøjets tabeller fast i
                  flere år ad gangen: en <strong>variabel rente</strong> og en{" "}
                  <strong>1-årig fastrente</strong> får begge ny rente hvert år, en{" "}
                  <strong>3-årig fastrente</strong> hvert tredje år og en{" "}
                  <strong>5-årig fastrente</strong> hvert femte år. Vælger du en
                  5-årig fastrente med +1 procentpoint om året, står rentesættet
                  derfor uændret de første fem år og springer først til 4,5 % i år
                  seks.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Eksempel: 2 mio. kr. i 30 år til 3,5 %
                </h3>
                <p>
                  Med afdrag og 5-årig fastrente bliver den månedlige ydelse{" "}
                  <strong>{kr(EKSEMPEL.aar[0]?.maanedYdelse ?? 0)}</strong>, og
                  gælden er betalt ud efter 30 år. I alt{" "}
                  <strong>{kr(EKSEMPEL.renterIAlt)}</strong> i renter — altså{" "}
                  {Math.round(EKSEMPEL.renterIAlt / 2_000_000 * 100)} % af det
                  lånte beløb.
                </p>
                <p>
                  Samme lån, men med renter der stiger 1 procentpoint om året,
                  ender på <strong>{kr(EKSEMPEL_STIGENDE.renterIAlt)}</strong> i
                  renter. Forskellen på de to tal er det, din egen økonomiske
                  robusthed skal tåle — ikke tallet fra bankens brochure.
                </p>

                <h3 className="text-xl font-semibold mt-6 mb-3">
                  Med afdrag eller afdragsfrit?
                </h3>
                <p>
                  Værktøjet regner begge dele. Ved <strong>afdrag</strong> er
                  ydelsen fast, den dækker både renter og afdrag, og gælden bliver
                  lavere hver måned. Ved <strong>afdragsfrit gæld</strong> betaler
                  du kun renterne, gælden står på hele beløbet hele løbetiden, og
                  de samlede renter bliver derfor markant større. Samme rente,
                  samme beløb, samme løbetid — to forskellige regninger.
                </p>
                <p className="mt-3">
                  Er du stadig i tvivl om, hvad renten på dit eget lån betyder for
                  skatten, så se vores{" "}
                  <Link href="/rentefradrag" className="underline">rentefradrag</Link>{" "}
                  — den del af renteudgiften, der bliver refunderet. Og vil du se
                  de forskellige lånetyper og afdragsformer fra siden, så er{" "}
                  <Link
                    href="/blog/guide-til-laan-og-renter"
                    className="underline"
                  >
                    guiden til lån og renter
                  </Link>{" "}
                  det næste skridt.
                </p>
              </div>
            </section>
          )}

          <section className="mb-12">
            <FAQ items={pageData.faqItems} />
          </section>

          <section>
            <RelatedCalculators current="/renteprognose" />
          </section>
        </article>
      </main>
    </div>
  );
}