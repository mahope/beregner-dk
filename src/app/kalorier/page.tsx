import KalorieBeregner from "@/components/KalorieBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("kalorier");
}

export default async function KalorierPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("kalorier", locale) || getPageData("kalorier", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/kalorier`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/kalorier" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <KalorieBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Forstå dit kaloriebehov</h2>
        <p>
          Dit <strong>kaloriebehov</strong> afhænger af flere faktorer: alder, køn, vægt, højde
          og hvor aktiv du er. Denne beregner bruger{" "}
          <strong>Mifflin-St Jeor formlen</strong>, som er den mest præcise
          metode til at estimere dit basalstofskifte.
        </p>

        <h2>BMR vs. TDEE</h2>

        <h3>BMR (Basal Metabolic Rate)</h3>
        <p>
          Dit <strong>basalstofskifte</strong> er antallet af kalorier din krop brænder bare for
          at holde dig i live — hjertet pumper, lungerne trækker vejret,
          cellerne fornyer sig. Selv hvis du lå stille i sengen hele dagen,
          ville du brænde disse kalorier.
        </p>

        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <p>
          <strong>TDEE</strong> er dit <strong>totale daglige kalorieforbrug</strong> — BMR plus alle de kalorier
          du brænder gennem aktivitet: gåture, træning, arbejde, selv at tænke
          bruger kalorier.
        </p>

        <h2>Vægttab og kalorieunderskud</h2>
        <p>
          For at tabe vægt skal du spise <strong>færre kalorier end du forbrænder</strong>. En
          god tommelfingerregel:
        </p>
        <ul>
          <li>
            <strong>500 kcal underskud/dag</strong> = ca. 0.5 kg tab/uge
          </li>
          <li>
            <strong>1000 kcal underskud/dag</strong> = ca. 1 kg tab/uge (ikke
            anbefalet længe)
          </li>
        </ul>

        <h2>Makronæringsstoffer</h2>

        <h3>Protein</h3>
        <p>
          <strong>Protein</strong> er essentielt for muskler, hår, hud og hundredvis af
          kropsprocesser.
        </p>
        <ul>
          <li>
            <strong>Vedligehold:</strong> 0.8-1.2g per kg kropsvægt
          </li>
          <li>
            <strong>Vægttab:</strong> 1.2-1.6g per kg (bevarer muskler)
          </li>
          <li>
            <strong>Muskelopbygning:</strong> 1.6-2.2g per kg
          </li>
        </ul>
        <p>1g protein = 4 kalorier</p>

        <h3>Fedt</h3>
        <p>
          <strong>Fedt</strong> er vigtigt for hormoner, vitaminoptagelse og cellestruktur.
          Minimum <strong>20-25% af kalorier</strong> bør komme fra fedt.
        </p>
        <p>1g fedt = 9 kalorier</p>

        <h3>Kulhydrater</h3>
        <p>
          <strong>Kulhydrater</strong> er kroppens <strong>foretrukne energikilde</strong>, især under træning.
          Mængden kan variere meget baseret på dine mål og præferencer.
        </p>
        <p>1g kulhydrat = 4 kalorier</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gennemsnitsværdier.
            Individuelle variationer kan være betydelige. Ved større
            vægtændringer eller helbredsproblemer, konsulter altid en læge eller
            diætist.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/kalorier" />
    </div>
  );
}
