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

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Förstå ditt kaloriebehov</h2>
        <p>
          Ditt <strong>kaloriebehov</strong> beror på flera faktorer: ålder, kön, vikt, längd
          och hur aktiv du är. Denna kalkylator använder{" "}
          <strong>Mifflin-St Jeor-formeln</strong>, som är den mest exakta
          metoden för att uppskatta din basalämnesomsättning.
        </p>

        <h2>BMR vs. TDEE</h2>

        <h3>BMR (Basal Metabolic Rate)</h3>
        <p>
          Din <strong>basalämnesomsättning</strong> är antalet kalorier din kropp förbränner bara för
          att hålla dig vid liv — hjärtat pumpar, lungorna andas,
          cellerna förnyas. Även om du låg stilla i sängen hela dagen
          skulle du förbränna dessa kalorier.
        </p>

        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <p>
          <strong>TDEE</strong> är din <strong>totala dagliga kaloriförbrukning</strong> — BMR plus alla kalorier
          du förbränner genom aktivitet: promenader, träning, arbete, till och med att tänka
          förbrukar kalorier.
        </p>

        <h2>Viktnedgång och kaloriunderskott</h2>
        <p>
          För att gå ner i vikt måste du äta <strong>färre kalorier än du förbränner</strong>. En
          bra tumregel:
        </p>
        <ul>
          <li>
            <strong>500 kcal underskott/dag</strong> = ca 0,5 kg viktnedgång/vecka
          </li>
          <li>
            <strong>1000 kcal underskott/dag</strong> = ca 1 kg viktnedgång/vecka (inte
            rekommenderat under längre tid)
          </li>
        </ul>

        <h2>Makronäringsämnen</h2>

        <h3>Protein</h3>
        <p>
          <strong>Protein</strong> är essentiellt för muskler, hår, hud och hundratals
          kroppsprocesser.
        </p>
        <ul>
          <li>
            <strong>Underhåll:</strong> 0,8-1,2 g per kg kroppsvikt
          </li>
          <li>
            <strong>Viktnedgång:</strong> 1,2-1,6 g per kg (bevarar muskler)
          </li>
          <li>
            <strong>Muskeluppbyggnad:</strong> 1,6-2,2 g per kg
          </li>
        </ul>
        <p>1 g protein = 4 kalorier</p>

        <h3>Fett</h3>
        <p>
          <strong>Fett</strong> är viktigt för hormoner, vitaminupptag och cellstruktur.
          Minst <strong>20-25 % av kalorierna</strong> bör komma från fett.
        </p>
        <p>1 g fett = 9 kalorier</p>

        <h3>Kolhydrater</h3>
        <p>
          <strong>Kolhydrater</strong> är kroppens <strong>föredragna energikälla</strong>, särskilt under träning.
          Mängden kan variera mycket beroende på dina mål och preferenser.
        </p>
        <p>1 g kolhydrat = 4 kalorier</p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Viktigt</p>
          <p className="text-yellow-700">
            Denna kalkylator ger en uppskattning baserad på genomsnittsvärden.
            Individuella variationer kan vara betydande. Vid större
            viktförändringar eller hälsoproblem, rådgör alltid med en läkare eller
            dietist.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/kalorier" />
    </div>
  );
}
