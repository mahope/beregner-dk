import { generatePageMetadata } from "@/lib/page-helpers";
import GaeldsfriBeregner from "@/components/GaeldsfriBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("gaeldsfri");
}

export default async function GaeldsfriPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("gaeldsfri", locale) || getPageData("gaeldsfri", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/gaeldsfri`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/gaeldsfri" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <GaeldsfriBeregner />

        {locale === "da" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan bliver du gældsfri hurtigere</h2>
          <p>
            At blive <strong>gældsfri</strong> kræver en plan. Det vigtigste skridt er at betale mere end <strong>minimumsafdraget</strong> — selv små ekstra beløb gør en enorm forskel over tid takket være <strong>renters rente-effekten</strong>.
          </p>

          <h2>Lavine vs. snebold — hvilken metode er bedst?</h2>
          <p>
            <strong>Lavine-metoden</strong> er matematisk optimal. Du retter ekstra afdrag mod gælden med den højeste rente, hvilket minimerer dine samlede renteomkostninger.
          </p>
          <p>
            <strong>Snebold-metoden</strong> retter ekstra afdrag mod den mindste gæld. Når den er betalt ud, går alle penge videre til den næstmindste. De hyppige &quot;sejre&quot; kan motivere dig til at holde fast — og den bedste metode er den du faktisk følger.
          </p>

          <h2>Tips til gældsafvikling</h2>
          <ul>
            <li><strong>Lav et budget:</strong> Find ud af hvad du kan afsætte ekstra til gældsafvikling</li>
            <li><strong>Forhandl renten:</strong> Kontakt din bank — du kan ofte få lavere rente</li>
            <li><strong>Undgå ny gæld:</strong> Brug kontanter eller debit i stedet for kredit</li>
            <li><strong>Automatiser:</strong> Sæt automatiske overførsler til gældsafvikling</li>
            <li><strong>Nødfond først:</strong> Hav 1-2 måneders udgifter som buffer, så du ikke optager ny gæld ved uventede udgifter</li>
          </ul>
        </div>
        )}

        {locale === "se" && (
        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Så blir du skuldfri snabbare</h2>
          <p>
            Att bli <strong>skuldfri</strong> kräver en plan. Det viktigaste steget är att betala mer än <strong>minimibeloppet</strong> — även små extra belopp gör enorm skillnad över tid tack vare <strong>ränta på ränta-effekten</strong>.
          </p>

          <h2>Lavin- vs. snöbollsmetoden — vilken är bäst?</h2>
          <p>
            <strong>Lavinmetoden</strong> är matematiskt optimal. Du riktar extra <strong>amortering</strong> mot den <strong>skuld</strong> med högst ränta, vilket minimerar dina totala räntekostnader — du betalar helt enkelt av den dyraste skulden först.
          </p>
          <p>
            <strong>Snöbollsmetoden</strong> riktar extra amortering mot den minsta skulden. När den är avbetald går alla pengar vidare till den näst minsta. De täta &quot;segrarna&quot; kan motivera dig att hålla ut — och den bästa metoden är den du faktiskt följer.
          </p>

          <h2>Tips för att betala av skulder</h2>
          <ul>
            <li><strong>Gör en budget:</strong> Ta reda på hur mycket du kan avsätta extra till avbetalning</li>
            <li><strong>Förhandla räntan:</strong> Kontakta din bank — du kan ofta få lägre ränta</li>
            <li><strong>Undvik ny skuld:</strong> Använd kontanter eller betalkort i stället för kredit</li>
            <li><strong>Automatisera:</strong> Ställ in automatiska överföringar till amortering</li>
            <li><strong>Buffert först:</strong> Ha 1-2 månaders utgifter som buffert, så du inte tar ny skuld vid oväntade utgifter</li>
          </ul>
        </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/gaeldsfri" />
      </div>

      <Sidebar currentHref="/gaeldsfri" adSlotId="gaeldsfri-sidebar" />
    </div>
  );
}
