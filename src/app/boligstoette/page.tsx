import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BoligstoetteBeregner from "@/components/BoligstoetteBeregner";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";

export async function generateMetadata() {
  return generatePageMetadata("boligstoette");
}

export default async function BoligstoettePage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boligstoette", locale) || getPageData("boligstoette", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/boligstoette`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/boligstoette" }]} />

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {pageData.description}
        </p>
      </div>

      {/* Calculator */}
      <BoligstoetteBeregner />

      {/* Info sektion */}
      {locale === "da" && (
      <section className="mt-12 prose prose-blue max-w-none">
        <h2>Hvad er boligstøtte?</h2>
        <p>
          <strong>Boligstøtte</strong> er et <strong>skattefrit tilskud</strong> fra staten til din husleje.
          Formålet er at hjælpe lejere med lave og mellemstore indkomster
          med at kunne betale deres bolig. Boligstøtte administreres af
          <strong>Udbetaling Danmark</strong> og udbetales månedligt.
        </p>

        <h2>Boligstøtte-satser 2026</h2>
        <p>
          I 2026 gælder følgende <strong>nøgletal for boligstøtte</strong> (boligsikring):
        </p>
        <ul>
          <li><strong>Max boligudgift:</strong> 113.000 kr/år (ca. 9.417 kr/md) — den del af huslejen der overstiger dette, indgår ikke i beregningen</li>
          <li><strong>Indkomstgrænse:</strong> 171.500 kr/år for 1 person, plus 53.100 kr for hver yderligere person i husstanden</li>
          <li><strong>Minimumsbeløb:</strong> 304 kr/md — støtte under dette beløb udbetales ikke</li>
          <li><strong>Formuegrænse:</strong> Ca. 800.000 kr for enlige, 1.600.000 kr for par</li>
        </ul>

        <h3>Hvad tæller med i beregningen?</h3>
        <ul>
          <li><strong>Husstandens indkomst:</strong> Al indkomst for alle over 18 år tæller med</li>
          <li><strong>Huslejens størrelse:</strong> Der er et loft over, hvor meget husleje der indgår (113.000 kr/år i 2026)</li>
          <li><strong>Boligens størrelse:</strong> Max 65 m² for 1 person, plus 20 m² per ekstra person. Overskydende areal reducerer støtten</li>
          <li><strong>Antal personer:</strong> Flere personer giver højere indkomstgrænse og arealgrænse</li>
          <li><strong>Formue:</strong> Høj formue reducerer eller fjerner støtten</li>
        </ul>

        <h3>Boligstøtte vs. boligydelse</h3>
        <p>
          <strong>Boligstøtte</strong> (boligsikring) er for almindelige lejere under folkepensionsalderen.
          <strong>Boligydelse</strong> er en særlig ordning for folkepensionister og førtidspensionister,
          som typisk giver et højere beløb og har mere <strong>gunstige indkomstgrænser</strong>.
        </p>

        <h3>Sådan søger du boligstøtte</h3>
        <ol>
          <li>Log ind på <a href="https://www.borger.dk" target="_blank" rel="noopener">borger.dk</a> med MitID</li>
          <li>Find &quot;Boligstøtte&quot; under Bolig og flytning</li>
          <li>Udfyld oplysninger om husleje, indkomst og husstand</li>
          <li>Udbetaling Danmark beregner beløbet og udbetaler til din NemKonto</li>
        </ol>

        <h3>Tips til at maksimere din boligstøtte</h3>
        <ul>
          <li>Søg tidligt — du kan kun få støtte fra ansøgningsdatoen</li>
          <li>Opdater dine oplysninger løbende for at undgå efterregulering</li>
          <li>Tjek om din varmeudgift kan medregnes i huslejen</li>
          <li>Ved flytning: Søg igen — beløbet kan ændre sig med ny husleje</li>
        </ul>
      </section>
      )}

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om boligstøtte
        </h2>
        <FAQ items={pageData.faqItems} />
      </section>

      {/* Related */}
      <section className="mt-12">
        <RelatedCalculators current="/boligstoette" />
      </section>
    </div>
  );
}
