import dynamic from "next/dynamic";
const BMIBeregner = dynamic(() => import("@/components/BMIBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { InlineAd } from "@/components/ads/AdBanner";
import Sidebar from "@/components/Sidebar";

export async function generateMetadata() {
  return generatePageMetadata("bmi");
}

export default async function BMIPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("bmi", locale) || getPageData("bmi", "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content - Left Column */}
      <div className="flex-1 min-w-0">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/bmi`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/bmi" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <BMIBeregner />

      {/* Inline Ad - Between calculator and content */}
      <InlineAd slotId="bmi-after-calculator" />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Hvad er BMI?</h2>
        <p>
          BMI står for <strong>Body Mass Index</strong> og er et tal, der bruges
          til at vurdere, om din vægt er passende i forhold til din højde. BMI
          beregnes ved at dividere din <strong>vægt i kilogram</strong> med din <strong>højde i meter</strong> i
          anden potens.
        </p>
        <p>
          <strong>Formlen er:</strong> BMI = vægt (kg) / højde² (m)
        </p>

        <h2>BMI kategorier ifølge WHO</h2>
        <p>
          Verdenssundhedsorganisationen (WHO) har defineret følgende BMI
          kategorier for voksne:
        </p>
        <ul>
          <li>
            <strong>Under 18,5:</strong> Undervægt
          </li>
          <li>
            <strong>18,5 - 24,9:</strong> Normalvægt
          </li>
          <li>
            <strong>25,0 - 29,9:</strong> Overvægt
          </li>
          <li>
            <strong>30,0 - 34,9:</strong> Fedme klasse I
          </li>
          <li>
            <strong>35,0 - 39,9:</strong> Fedme klasse II
          </li>
          <li>
            <strong>40+:</strong> Fedme klasse III (svær fedme)
          </li>
        </ul>

        <h2>Er BMI en pålidelig måling?</h2>
        <p>BMI er et nyttigt screeningsværktøj, men det har begrænsninger:</p>
        <ul>
          <li>
            <strong>Muskelmasse:</strong> Meget muskuløse personer kan have højt
            BMI uden at være overvægtige
          </li>
          <li>
            <strong>Alder:</strong> Ældre voksne kan have lavere muskelmasse,
            hvilket påvirker BMI
          </li>
          <li>
            <strong>Fedtfordeling:</strong> BMI fortæller ikke hvor fedtet
            sidder (mavefedme er mere risikabelt)
          </li>
          <li>
            <strong>Køn:</strong> Kvinder har naturligt mere fedtvæv end mænd
          </li>
        </ul>

        <h2>Andre vigtige sundhedsmål</h2>
        <p>
          Ud over BMI kan disse målinger give et <strong>bedre billede af din sundhed</strong>:
        </p>
        <ul>
          <li>
            <strong>Taljemål:</strong> Under 94 cm for mænd, under 80 cm for
            kvinder
          </li>
          <li>
            <strong>Talje-hofte-ratio:</strong> Under 0,9 for mænd, under 0,85
            for kvinder
          </li>
          <li>
            <strong>Fedtprocent:</strong> Måles med specialudstyr
          </li>
          <li>
            <strong>Blodtryk og kolesterol:</strong> Vigtige for hjertesundhed
          </li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner er kun til informationsformål og erstatter ikke
            professionel medicinsk rådgivning. Konsulter altid en læge ved
            bekymringer om din vægt eller sundhed.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Vad är BMI?</h2>
        <p>
          BMI står för <strong>Body Mass Index</strong> och är ett tal som används
          för att bedöma om din vikt är rimlig i förhållande till din längd. BMI
          beräknas genom att dividera din <strong>vikt i kilogram</strong> med din <strong>längd i meter</strong> i
          kvadrat.
        </p>
        <p>
          <strong>Formeln är:</strong> BMI = vikt (kg) / längd² (m)
        </p>

        <h2>BMI-kategorier enligt WHO</h2>
        <p>
          Världshälsoorganisationen (WHO) har definierat följande BMI-kategorier
          för vuxna:
        </p>
        <ul>
          <li>
            <strong>Under 18,5:</strong> Undervikt
          </li>
          <li>
            <strong>18,5 - 24,9:</strong> Normalvikt
          </li>
          <li>
            <strong>25,0 - 29,9:</strong> Övervikt
          </li>
          <li>
            <strong>30,0 - 34,9:</strong> Fetma klass I
          </li>
          <li>
            <strong>35,0 - 39,9:</strong> Fetma klass II
          </li>
          <li>
            <strong>40+:</strong> Fetma klass III (svår fetma)
          </li>
        </ul>

        <h2>Är BMI ett tillförlitligt mått?</h2>
        <p>BMI är ett användbart screeningverktyg, men det har begränsningar:</p>
        <ul>
          <li>
            <strong>Muskelmassa:</strong> Mycket muskulösa personer kan ha högt
            BMI utan att vara överviktiga
          </li>
          <li>
            <strong>Ålder:</strong> Äldre vuxna kan ha lägre muskelmassa,
            vilket påverkar BMI
          </li>
          <li>
            <strong>Fettfördelning:</strong> BMI säger inte var fettet
            sitter (bukfetma är farligare)
          </li>
          <li>
            <strong>Kön:</strong> Kvinnor har naturligt mer fettvävnad än män
          </li>
        </ul>

        <h2>Andra viktiga hälsomått</h2>
        <p>
          Utöver BMI kan dessa mått ge en <strong>bättre bild av din hälsa</strong>:
        </p>
        <ul>
          <li>
            <strong>Midjemått:</strong> Under 94 cm för män, under 80 cm för
            kvinnor
          </li>
          <li>
            <strong>Midja-höft-kvot:</strong> Under 0,9 för män, under 0,85
            för kvinnor
          </li>
          <li>
            <strong>Fettprocent:</strong> Mäts med specialutrustning
          </li>
          <li>
            <strong>Blodtryck och kolesterol:</strong> Viktiga för hjärthälsan
          </li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Viktigt</p>
          <p className="text-yellow-700">
            Denna kalkylator är endast avsedd för informationsändamål och ersätter
            inte professionell medicinsk rådgivning. Rådgör alltid med en läkare vid
            oro för din vikt eller hälsa.
          </p>
        </div>
      </div>
      )}

      <InlineAd slotId="bmi-before-faq" />

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/bmi" />
      </div>

      {/* Sidebar - Right Column (Desktop only) */}
      <Sidebar currentHref="/bmi" adSlotId="bmi-sidebar" />
    </div>
  );
}
