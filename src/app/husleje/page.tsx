import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import HuslejeBudgetBeregner from "@/components/HuslejeBudgetBeregner";
import HuslejePrKvm from "@/components/HuslejePrKvm";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import { ForsikringAffiliate } from "@/components/AffiliateBox";
import { HUSLEJE_EKSEMPEL, HUSLEJE_EKSEMPEL_FORBRUG, HUSLEJE_EKSEMPEL_MED_FORBRUG, HUSLEJE_STANDARD } from "@/lib/husleje";
import { formatCurrency } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("husleje");
}

export default async function HuslejePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("husleje", locale) || getPageData("husleje", "da")!;

  // Eksemplet er det samme som værktøjets starttilstand, så tallet på siden er
  // altid det, læseren ser da han/hun åbner beregneren.
  const kr = (value: number) => formatCurrency(value, "da", { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/husleje`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/husleje" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <HuslejeBudgetBeregner />
        <ForsikringAffiliate className="mt-8" />
      </div>

      {locale === "da" && <HuslejePrKvm />}

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Hvor meget bør du bruge på husleje?</h2>
        <p>
          At finde den <strong>rigtige balance mellem husleje og andre udgifter</strong> er afgørende for
          en sund økonomi. Bruger du for meget på bolig, kan det gå ud over din <strong>livskvalitet</strong>
          og mulighed for <strong>opsparing</strong>.
        </p>

        <h3>30% reglen forklaret</h3>
        <p>
          Den mest udbredte tommelfingerregel siger, at din husleje (inkl. forbrugsudgifter)
          ikke bør overstige <strong>30% af din nettoindkomst</strong>. Nogle kilder siger 33%, men 30%
          giver mere <strong>buffer til uforudsete udgifter</strong>.
        </p>
        <p>
          <strong>Eksempel:</strong> Med en nettoløn på {kr(HUSLEJE_STANDARD.maanedligNettoLoen)} er
          dit loft for boligudgifter {kr(HUSLEJE_EKSEMPEL.maxBoligudgifter)} — og det er både husleje,
          el, vand og varme, der skal dele det. Har du {kr(HUSLEJE_EKSEMPEL_FORBRUG)} i el og varme
          om måneden, er der {kr(HUSLEJE_EKSEMPEL_MED_FORBRUG.anbefaletHusleje)} til huslejen.
          Beregneren ovenfor starter med præcis det samme eksempel, så du kan se reglen regne det ud.
        </p>

        <h3>Hvad inkluderer "husleje"?</h3>
        <p>
          Når du beregner dit <strong>boligbudget</strong>, skal du huske alle <strong>boligrelaterede udgifter</strong>.
          El, vand og varme har deres eget felt i beregneren, fordi de ofte ikke er en del af lejen:
        </p>
        <ul>
          <li>Grundleje/husleje</li>
          <li>A conto varme og vand</li>
          <li>Elektricitet</li>
          <li>Internet og TV</li>
          <li>Indboforsikring</li>
        </ul>

        <h3>Sammenlign husleje pr. m²</h3>
        <p>
          Husleje pr. kvadratmeter gør det lettere at sammenligne boliger af forskellig størrelse.
          Regn den ud ovenfor, og hent arealet fra BBR, hvis du ikke kender det.
        </p>

        <h3>Tips til at finde billigere bolig</h3>
        <ul>
          <li>Overvej delelejlighed eller roommate</li>
          <li>Kig udenfor de dyreste områder</li>
          <li>Vær fleksibel med størrelse og stand</li>
          <li>Tjek almene boliger (boligforeninger)</li>
<li>Brug flere boligportaler og sociale medier</li>
    </ul>
    <p>
      Læs vores <Link href="/blog/maanedsbudget-2026-komplet-guide" className="text-blue-600 hover:underline">komplette guide til månedsbudget 2026</Link> for at se hvordan husleje passer ind i det samlede budget.
    </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/husleje" />
    </div>
  );
}
