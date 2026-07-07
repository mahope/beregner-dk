import { generatePageMetadata } from "@/lib/page-helpers";
import Elberegner from "@/components/Elberegner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("elberegner");
}

export default async function ElberegnerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("elberegner", locale) || getPageData("elberegner", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/elberegner`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/elberegner" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <Elberegner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du elberegneren</h2>
        <p>
          Med vores <strong>elberegner</strong> kan du nemt beregne, hvad dine elektriske
          apparater <strong>koster i strøm</strong>. Sådan gør du:
        </p>
        <ol>
          <li>
            <strong>Vælg et apparat</strong> fra dropdown-listen, eller skriv
            navnet selv
          </li>
          <li>
            <strong>Angiv watt</strong> - du kan finde det på apparatets
            mærkeplade
          </li>
          <li>
            <strong>Angiv timer per dag</strong> - hvor længe bruger du
            apparatet?
          </li>
          <li>
            <strong>Tilføj flere apparater</strong> for at se dit samlede
            forbrug
          </li>
        </ol>

        <h2>Typiske apparaters elforbrug</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Apparat</th>
                <th>Typisk watt</th>
                <th>Årlig pris*</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Køleskab</td>
                <td>40W (kører 24/7)</td>
                <td>~875 kr</td>
              </tr>
              <tr>
                <td>Computer</td>
                <td>150W</td>
                <td>~550 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>TV</td>
                <td>100W</td>
                <td>~365 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>Tørretumbler</td>
                <td>3000W</td>
                <td>~10.950 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>Gaming PC</td>
                <td>500W</td>
                <td>~1825 kr (4t/dag)</td>
              </tr>
              <tr>
                <td>LED lampe</td>
                <td>10W</td>
                <td>~45 kr (5t/dag)</td>
              </tr>
              <tr>
                <td>Glødepære</td>
                <td>60W</td>
                <td>~275 kr (5t/dag)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500">
          *Beregnet med en elpris på 2,5 kr/kWh
        </p>

        <h2>Tips til at spare på strømmen</h2>
        <ul>
          <li>
            <strong>Sluk for standby</strong> - apparater på standby bruger
            stadig strøm (typisk 5-15W)
          </li>
          <li>
            <strong>Vælg energieffektive apparater</strong> - kig efter en god
            energiklasse på EU&apos;s A-G-mærkning
          </li>
          <li>
            <strong>LED-pærer</strong> - bruger op til 80% mindre strøm end
            glødepærer
          </li>
          <li>
            <strong>Vask på 30°</strong> - de fleste tøjtyper bliver rene ved
            lavere temperaturer
          </li>
          <li>
            <strong>Fyld maskinen</strong> - kør opvaskemaskine og vaskemaskine
            kun når de er fulde
          </li>
          <li>
            <strong>Brug timer</strong> - kør apparater når strømmen er billigst
            (typisk nat)
          </li>
        </ul>

        <h2>Om elpriser i Danmark</h2>
        <p>
          <strong>Elpriser i Danmark</strong> varierer afhængigt af tidspunkt, årstid og din
          elaftale. Den <strong>samlede pris</strong> du betaler inkluderer:
        </p>
        <ul>
          <li>
            <strong>Spotpris</strong> - varierer time for time baseret på udbud
            og efterspørgsel
          </li>
          <li>
            <strong>Nettarif</strong> - betaling for transport af strøm
          </li>
          <li>
            <strong>Elafgift</strong> - statsafgift på elektricitet
          </li>
          <li>
            <strong>Moms</strong> - 25% af den samlede pris
          </li>
          <li>
            <strong>Elselskabets tillæg</strong> - varierer mellem selskaber
          </li>
        </ul>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Tip til lavere elregning</p>
          <p className="text-green-700">
            Overvej en variabel elaftale og brug strøm når spotprisen er lav.
            Apps som Watts og Barry viser realtidspriser og kan hjælpe dig med
            at spare.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/elberegner" />
    </div>
  );
}
