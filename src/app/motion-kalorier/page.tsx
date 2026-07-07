import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import MotionKalorierBeregner from "@/components/MotionKalorierBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("motion-kalorier");
}

export default async function MotionKalorierPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("motion-kalorier", locale) || getPageData("motion-kalorier", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/motion-kalorier`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/motion-kalorier" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <MotionKalorierBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hvor mange kalorier forbrænder du?</h2>
            <p>
              Kalorieforbruget ved motion afhænger af tre ting: <strong>hvilken aktivitet</strong> du
              laver, <strong>hvor meget du vejer</strong>, og <strong>hvor længe</strong> du er i gang.
              Vælg en aktivitet, indtast din vægt og varigheden, så anslår beregneren, hvor mange
              kalorier du har brændt af.
            </p>
            <h2>Hvad er MET?</h2>
            <p>
              Beregningen bygger på <strong>MET-værdier</strong> (metabolic equivalent of task), som
              angiver, hvor energikrævende en aktivitet er sammenlignet med hvile. Formlen er{" "}
              <em>kalorier = MET × vægt i kg × timer</em>. Løb har fx en høj MET-værdi, mens en rolig
              gåtur ligger lavere. Tallene er <strong>estimater</strong> — din reelle forbrænding
              afhænger af intensitet og form.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Hur många kalorier förbränner du?</h2>
            <p>
              Kaloriförbrukningen vid motion beror på tre saker: <strong>vilken aktivitet</strong> du
              gör, <strong>hur mycket du väger</strong> och <strong>hur länge</strong> du håller på.
              Välj en aktivitet, ange din vikt och längden, så uppskattar kalkylatorn hur många
              kalorier du har bränt.
            </p>
            <h2>Vad är MET?</h2>
            <p>
              Beräkningen bygger på <strong>MET-värden</strong> (metabolic equivalent of task), som
              anger hur energikrävande en aktivitet är jämfört med vila. Formeln är{" "}
              <em>kalorier = MET × vikt i kg × timmar</em>. Löpning har t.ex. ett högt MET-värde, medan
              en lugn promenad ligger lägre. Siffrorna är <strong>uppskattningar</strong> — din
              verkliga förbränning beror på intensitet och form.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/motion-kalorier" />
      </div>
      <Sidebar currentHref="/motion-kalorier" adSlotId="motion-kalorier-sidebar" />
    </div>
  );
}
