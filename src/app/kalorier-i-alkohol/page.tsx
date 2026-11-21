import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import KalorierIAlkoholBeregner from "@/components/KalorierIAlkoholBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  ALKOHOL_DRIKKE,
  ALKOHOL_KILDE,
  beregnAlkoholKalorier,
  drikMedNavn,
  kcalIServering,
  alkoholGramIServering,
} from "@/lib/kalorier-i-alkohol";

export async function generateMetadata() {
  return generatePageMetadata("kalorier-i-alkohol");
}

export default async function KalorierIAlkoholPage() {
  const domainConfig = await getCurrentDomainConfig();
  const pageData =
    getPageData("kalorier-i-alkohol", domainConfig.locale) ||
    getPageData("kalorier-i-alkohol", "da")!;

  // Alle tal i teksten er værktøjets egne resultater for samme servering
  // (punkt 11), så en sætning ikke kan love noget tabellen ikke viser.
  const oel = drikMedNavn("Øl, almindelig")!;
  const roedvin = drikMedNavn("Vin, rød")!;
  const spirit = drikMedNavn("Spirit, 40 % (vodka, gin, rom)")!;
  const alkoholfri = drikMedNavn("Alkoholfri øl")!;
  const toOelEnVin = beregnAlkoholKalorier({ oel: 2, roedvin: 1 });
  const tal = (n: number, decimaler = 0) =>
    n.toLocaleString("da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimaler,
    });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/kalorier-i-alkohol`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/kalorier-i-alkohol" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <KalorierIAlkoholBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Sådan regner du kalorier i alkohol ud</h2>
          <p>
            Alkohol er ingen kulhydrat, men det har alligevel kalorier: ét gram ren
            ethanol giver cirka <strong>7 kcal</strong>. Derfor er det alkoholen, der
            fylder mest i en stærk drik, mens kulhydraterne betyder mest i øl, cider og
            sodvin. En øl på {tal(oel.ml)} ml indeholder {tal(kcalIServering(oel))} kcal,
            heraf {tal(alkoholGramIServering(oel) * 6.93)} kcal fra alkoholen.
          </p>
          <p>
            Tallene herunder er pr. servering, og serveringen er den, man faktisk får:
            {tal(oel.ml)} ml øl, {tal(roedvin.ml)} ml vin, {tal(spirit.ml)} ml sprits. Fordi
            næringsstoffet er angivet pr. 100 g, vejes serveringen — {tal(spirit.ml)} ml
            sprits er {tal((spirit.ml * spirit.gramPr100ml) / 100, 1)} g, ikke 40 g. Uden
            det ville et shot pludselig være 6 % for stort.
          </p>
          <p>
            Vil du vide, hvor meget du har drukket, og ikke blot hvad du har spist, så
            regner <Link href="/alkoholenheder">alkoholenhedsberegneren</Link> om til
            genstande, og <Link href="/promille">promilleberegneren</Link> siger, hvornår du
            er over grænsen. Sammenlignet med{" "}
            <Link href="/kalorier">kalorierne i madvarer</Link> kan du se, hvad en aften
            svarer til i fødevarer.
          </p>

          <h2>Kalorier i øl, vin og sprits</h2>
          <p>
            Almindelig øl giver {tal(kcalIServering(oel))} kcal pr. {tal(oel.ml)} ml, rødvin{" "}
            {tal(kcalIServering(roedvin))} kcal pr. {tal(roedvin.ml)} ml og et shot á{" "}
            {tal(spirit.ml)} ml giver {tal(kcalIServering(spirit))} kcal. Alkoholfri øl har{" "}
             {tal(alkoholGramIServering(alkoholfri), 1)} g alkohol, men stadig {tal(kcalIServering(alkoholfri))} kcal — kulhydraterne sidder
             stadig i.
           </p>
           <p>
             To øl og et glas rødvin udgør tilsammen {tal(toOelEnVin.kcal)} kcal,{" "}
             {tal(toOelEnVin.alkoholGram, 1)} g ren alkohol og {tal(toOelEnVin.genstande, 2)}{" "}
             genstande. Det svarer til et solidt måltid mad.
           </p>

          <h2>Kilden</h2>
          <p>
            Alle {ALKOHOL_DRIKKE.length} rækker kommer fra {ALKOHOL_KILDE.database},
            datasættet {ALKOHOL_KILDE.datasæt} ({ALKOHOL_KILDE.url}). Hver række bærer sit
            fdc-id, så du kan slå den op selv. Kcal pr. 100 g er energiværdien i kilden;
            vægten pr. servering er kildens egen portionvægt. Værdierne er gennemsnit for
            druetypen eller øltypen, ikke for et bestemt mærke — en dansk pilsner på{" "}
            {tal(oel.ml)} ml kan ligge et sted mellem de øl-rækker tabellen viser.
          </p>
        </div>

        <FAQ items={pageData.faqItems} />

        <RelatedCalculators current="/kalorier-i-alkohol" />
      </div>

      <Sidebar currentHref="/kalorier-i-alkohol" />
    </div>
  );
}
