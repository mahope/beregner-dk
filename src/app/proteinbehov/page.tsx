import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ProteinbehovBeregner from "@/components/ProteinbehovBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("proteinbehov");
}

export default async function ProteinbehovPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("proteinbehov", locale) || getPageData("proteinbehov", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/proteinbehov`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/proteinbehov" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <ProteinbehovBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor meget protein har du brug for?</h2>
            <p>
              Protein er en af kroppens vigtigste byggesten — det er afgørende for muskler, enzymer,
              hormoner og immunforsvar. Det anbefalede daglige proteinindtag for en stillesiddende
              voksen er <strong>0,8 g pr. kg kropsvægt</strong>. En person på 75 kg har altså brug
              for mindst <strong>60 gram protein om dagen</strong>.
            </p>
            <p>
              Hvis du dyrker motion, stiger behovet. Styrketræning og udholdenhedssport øger
              musklernes behov for protein til genopbygning, og anbefalingerne ligger typisk på
              <strong>1,2–2,0 g/kg</strong> afhængigt af træningsmængde og -intensitet.
            </p>
            <h2>Gode proteinkilder</h2>
            <p>
              Animalske kilder som kød, fisk, æg og mejeriprodukter indeholder alle de essentielle
              aminosyrer. Plantebaserede kilder som bønner, linser, tofu, quinoa og nødder kan også
              dække behovet, men kræver ofte en varieret sammensætning. Et æg indeholder ca. 6-7 g
              protein, 100 g kylling ca. 25 g, og 100 g kogte linser ca. 9 g.
            </p>
            <h2>Timing og fordeling</h2>
            <p>
              Kroppen udnytter protein bedst, når det fordeles jævnt over dagens måltider — typisk
              20-40 g pr. måltid. Et proteinindtag lige efter træning kan understøtte musklernes
              genopbygning, men den samlede daglige mængde er vigtigere end præcis timing.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Vejledende:</strong> Beregneren giver et generelt estimat. Individuelle behov
              varierer med alder, køn, træningsform, genetik og helbred. Kontakt en læge eller
              klinisk diætist ved specifikke behov.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur mycket protein behöver du?</h2>
            <p>
              Protein är en av kroppens viktigaste byggstenar — avgörande för muskler, enzymer,
              hormoner och immunförsvar. Det rekommenderade dagliga proteinintaget för en
              stillasittande vuxen är <strong>0,8 g per kg kroppsvikt</strong>. En person på 75 kg
              behöver alltså minst <strong>60 gram protein om dagen</strong>.
            </p>
            <p>
              Om du motionerar ökar behovet. Styrketräning och uthållighetsidrott ökar musklernas
              behov av protein för återuppbyggnad, och rekommendationerna ligger vanligtvis på
              <strong>1,2–2,0 g/kg</strong> beroende på träningsmängd och -intensitet.
            </p>
            <h2>Bra proteinkällor</h2>
            <p>
              Animaliska källor som kött, fisk, ägg och mejeriprodukter innehåller alla essentiella
              aminosyror. Växtbaserade källor som bönor, linser, tofu, quinoa och nötter kan också
              täcka behovet men kräver ofta en varierad sammansättning.
            </p>
            <p className="text-sm text-gray-500">
              <strong>Vägledande:</strong> Kalkylatorn ger en generell uppskattning. Individuella
              behov varierar med ålder, kön, träningsform, genetik och hälsa. Kontakta läkare eller
              dietist vid specifika behov.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/proteinbehov" />
      </div>
      <Sidebar currentHref="/proteinbehov" adSlotId="proteinbehov-sidebar" />
    </div>
  );
}