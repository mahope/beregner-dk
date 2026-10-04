import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import IdealvaegtBeregner from "@/components/IdealvaegtBeregner";
import Link from "next/link";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("idealvaegt");
}

export default async function IdealvaegtPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("idealvaegt", locale) || getPageData("idealvaegt", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/idealvaegt`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/idealvaegt" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <IdealvaegtBeregner />
        </div>

        {locale === "da" ? (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvad er idealvægt, og hvem kommer den fra?</h2>
            <p>
              Idealvægt (IBW) er et estimat af den vægt, der i forsikringsdata var forbundet med
              lavest dødelighed for en given højde. Den er <strong>ikke</strong> et slankemål. De to
              formler, der bruges i dag, blev lavet i 1964 og 1974 til at dosere medicin efter
              kroppens størrelse, fordi lægemidler fordeles efter hvor stor kroppen er.
            </p>
            <p>
              Derfor tager ingen af dem højde for muskulatur, kropsbygning eller alder. To mennesker
              med samme højde kan have vidt forskellige sunde vægte, og formlerne ser ikke forskel.
              <strong> Se dem derfor som et interval</strong> — og sammenlign med BMI, som fortæller
              dig noget helt andet: hvor din nuværende vægt ligger i forhold til din højde.
            </p>
            <h2>Hvorfor viser siden to tal?</h2>
            <p>
              <strong>Devines formel (1974)</strong> er den mest brugte. Den bygger på
              dokumentationen over relativ dødelighed for mænd og kvinder ved forskellige
              højde-vægt-kombinationer. <strong>Hamwis formel (1964)</strong> er en lidt ældre
              model fra en håndbog i geriatrisk ernæring.
            </p>
            <p>
              Begge er lineære: de bruger en grundvægt ved 152 cm og lægger så et fast antal kilo
              til for hver centimeter. Det gør dem nemme at regne med, men også til at løber fra
              hinanden jo længere fra 152 cm du er. Ved 180 cm er de 3,6 kilo fra hinanden, og
              ved 165 cm er de næsten lige. Derfor viser værktøjet begge tal og deres gennemsnit i
              stedet for at udpege ét tal som det rigtige.
            </p>
            <h2>Formel og BMI sammen</h2>
            <p>
              WHO regner BMI 18,5-24,9 som normalvægt for voksne. For din højde svarer det til det
              interval, værktøjet viser under de to formler — og det er samme tabel,
              <Link href="/bmi">BMI-beregneren</Link> bruger, så de to sider ikke kan sige hver sit om, hvad
              normalvægt er. Vil du se, hvor din nuværende vægt ligger i forhold til din højde, er{" "}
              <Link href="/kropsfedt">kropsfedtprocenten</Link> det mere nuancerede mål.
            </p>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Vad är idealvikt, och varifrån kommer den?</h2>
            <p>
              Idealvikt (IBW) är en uppskattning av den vikt som i försäkringsdata var kopplad till
              lägst dödlighet för en given längd. Den är <strong>inte</strong> ett bantmål. De två
              formler som används i dag skapades 1964 och 1974 för att dosera medicin utifrån
              kroppens storlek, eftersom läkemedel fördelas efter hur stor kroppen är.
            </p>
            <p>
              Därför tar ingen av dem hänsyn till muskulatur, kroppsbyggnad eller ålder. Två personer
              med samma längd kan ha mycket olika friska vikter, och formlerna ser ikke skillnaden.
              <strong> Se dem därför som ett intervall</strong> — och jämför med BMI, som berättar
              något helt annat: var din nuvarande vikt ligger i förhållande till din längd.
            </p>
            <h2>Varför visar sidan två tal?</h2>
            <p>
              <strong>Devines formel (1974)</strong> är den mest använda. Den bygger på
              dokumentationen av relativ dödlighet för män och kvinn vid olika
              längd-vikt-kombinationer. <strong>Hamwis formel (1964)</strong> är en något äldre
              modell ur en handbok i geriatrisk nutrition.
            </p>
            <p>
              Båda är linjära: de använder en grundvikt vid 152 cm och lägger sedan ett fast antal
              kilo till för varje centimeter. Det gör dem lätta att räkna med, men också till att
              avvika från varandra ju längre från 152 cm du är. Vid 180 cm ligger de 3,6 kilo
              ifrån varandra, och vid 165 cm ligger de nästan lika. Därför visar kalkylatorn båda
              talen och deras medelvärde i stället för att peka ut ett enda tal som det rätta.
            </p>
            <h2>Formel och BMI ihop</h2>
            <p>
              WHO räknar BMI 18,5-24,9 som normalvikt för vuxna. För din längd motsvarar det det
              intervall som kalkylatorn visar under de två formlerna — och det är samma tabell som{" "}
              <Link href="/bmi">BMI-kalkylatorn</Link> använder, så de två sidorna inte kan säga var sin
              uppfattning om vad normalvikt är. Vill du se var din nuvarande vikt ligger i
              förhållande till din längd, är{" "}
              <Link href="/kropsfedt">kroppsfettprocenten</Link> det mer nyanserade måttet.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/idealvaegt" />
      </div>
      <Sidebar currentHref="/idealvaegt" adSlotId="idealvaegt-sidebar" />
    </div>
  );
}