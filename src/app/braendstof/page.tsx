import dynamic from "next/dynamic";
const BraendstofBeregner = dynamic(() => import("@/components/BraendstofBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("braendstof");
}

export default async function BraendstofPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("braendstof", locale) || getPageData("braendstof", "da")!;

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/braendstof`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/braendstof" }]} />

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
        <BraendstofBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om brændstofforbrug</h2>
        <p>
          At forstå dit <strong>brændstofforbrug</strong> hjælper dig med at <strong>budgettere bilkørsel</strong>
          og vælge den rigtige bil. Forbruget varierer betydeligt mellem <strong>biltyper</strong>,
          <strong>kørestil</strong> og <strong>kørselsforhold</strong>.
        </p>

        <h3>Typiske forbrug</h3>
        <ul>
          <li><strong>Benzin:</strong> 12-18 km/l (5,5-8,3 l/100km)</li>
          <li><strong>Diesel:</strong> 15-22 km/l (4,5-6,7 l/100km)</li>
          <li><strong>El:</strong> 15-20 kWh/100km (svarer til ca. 5-7 km/kWh)</li>
          <li><strong>Hybrid:</strong> 18-25 km/l (benzin-ækvivalent)</li>
        </ul>

        <h3>Sådan reducerer du forbruget</h3>
        <ul>
          <li>Kør jævnt - undgå hård acceleration og opbremsning</li>
          <li>Hold jævn hastighed på motorvejen (optimal 80-100 km/t)</li>
          <li>Tjek dæktryk regelmæssigt (for lavt tryk øger forbrug)</li>
          <li>Fjern unødvendig vægt og tagboks</li>
          <li>Brug klimaanlæg med måde</li>
          <li>Planlæg ruter for at undgå kø</li>
        </ul>

        <h3>Benzin vs. Diesel vs. El</h3>
        <p>
          Ved valg af <strong>brændstoftype</strong> bør du overveje:
        </p>
        <ul>
          <li><strong>Benzin:</strong> Lavere indkøbspris, højere km-pris</li>
          <li><strong>Diesel:</strong> Bedre for lange afstande, højere afgifter</li>
          <li><strong>El:</strong> Lavest km-pris, men højere indkøbspris og behov for ladeinfrastruktur</li>
        </ul>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om bränsleförbrukning</h2>
        <p>
          Att förstå din <strong>bränsleförbrukning</strong> hjälper dig att <strong>budgetera för bilkörning</strong>
          och välja rätt bil. Förbrukningen varierar betydligt mellan <strong>biltyper</strong>,
          <strong>körstil</strong> och <strong>körförhållanden</strong>.
        </p>

        <h3>Typisk förbrukning</h3>
        <ul>
          <li><strong>Bensin:</strong> 0,55-0,83 l/mil (5,5-8,3 l/100 km)</li>
          <li><strong>Diesel:</strong> 0,45-0,67 l/mil (4,5-6,7 l/100 km)</li>
          <li><strong>El:</strong> 1,5-2,0 kWh/mil (15-20 kWh/100 km)</li>
          <li><strong>Hybrid:</strong> lägre förbrukning än ren bensin, särskilt i stadstrafik</li>
        </ul>

        <h3>Så minskar du förbrukningen</h3>
        <ul>
          <li>Kör jämnt - undvik hård acceleration och inbromsning</li>
          <li>Håll jämn hastighet på motorvägen (optimalt 80-100 km/tim)</li>
          <li>Kontrollera däcktrycket regelbundet (för lågt tryck ökar förbrukningen)</li>
          <li>Ta bort onödig vikt och takbox</li>
          <li>Använd luftkonditioneringen med måtta</li>
          <li>Planera rutter för att undvika köer</li>
        </ul>

        <h3>Bensin vs. diesel vs. el</h3>
        <p>
          När du väljer <strong>drivmedel</strong> bör du tänka på:
        </p>
        <ul>
          <li><strong>Bensin:</strong> Lägre inköpspris, högre kostnad per mil</li>
          <li><strong>Diesel:</strong> Bra för långa sträckor, ofta högre pris per liter</li>
          <li><strong>El:</strong> Lägst kostnad per mil, men högre inköpspris och behov av laddinfrastruktur</li>
        </ul>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/braendstof" />
    </div>
  );
}
