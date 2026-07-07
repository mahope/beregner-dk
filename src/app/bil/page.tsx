import BilBeregner from "@/components/BilBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";

export async function generateMetadata() {
  return generatePageMetadata("bil");
}

export default async function BilPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("bil", locale) || getPageData("bil", "da")!;

  return (
    <div>
      <FAQSchema items={pageData.faqItems} />
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/bil`}
        category={pageData.schemaCategory}
      />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/bil" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <BilBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>De reelle omkostninger ved at eje bil</h2>
        <p>
          Mange bilister fokuserer kun på benzinprisen, men de <strong>samlede omkostninger</strong> ved at eje bil
          er meget højere. Denne beregner hjælper dig med at se det <strong>fulde billede</strong>.
        </p>

        <h2>Hvad koster en bil at eje?</h2>

        <h3>1. Brændstof/strøm</h3>
        <p>
          Den mest synlige udgift. Afhænger af <strong>kørselsomfang</strong>, bilens forbrug og <strong>brændstofpriser</strong>.
        </p>
        <ul>
          <li><strong>Benzin:</strong> Ca. 13-14 kr/liter (2026)</li>
          <li><strong>Diesel:</strong> Ca. 12-13 kr/liter</li>
          <li><strong>El (hjemme):</strong> Ca. 2-3 kr/kWh</li>
          <li><strong>El (offentlig):</strong> Ca. 3-5 kr/kWh</li>
        </ul>

        <h3>2. Værditab (den skjulte kæmpe)</h3>
        <p>
          Værditab er ofte den <strong>største enkeltudgift</strong> ved at eje bil - og den mest oversete.
        </p>
        <table>
          <thead>
            <tr>
              <th>Bil alder</th>
              <th>Årligt værditab</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ny bil (år 1)</td>
              <td>20-25%</td>
            </tr>
            <tr>
              <td>1-3 år</td>
              <td>15-20%</td>
            </tr>
            <tr>
              <td>3-5 år</td>
              <td>10-15%</td>
            </tr>
            <tr>
              <td>5+ år</td>
              <td>8-12%</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Tip:</strong> Køb 2-3 år gamle biler for at undgå det største værditab.
        </p>

        <h3>3. Forsikring</h3>
        <p>
          <strong>Forsikringsprisen</strong> varierer meget baseret på:
        </p>
        <ul>
          <li>Din alder og erfaring</li>
          <li>Bopæl (by vs. land)</li>
          <li>Bilens model og værdi</li>
          <li>Kørselsbehov</li>
          <li>Selvrisiko</li>
        </ul>
        <p>
          <strong>Tip:</strong> Sammenlign altid forsikringer. Prisforskellen kan være flere tusinde kroner.
        </p>

        <h3>4. Vægtafgift / grøn ejerafgift</h3>
        <p>
          Afgiften afhænger af bilens <strong>brændstofforbrug</strong> og <strong>udledning</strong>:
        </p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Årlig afgift (ca.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Elbil</td>
              <td>0 kr (til 2026)</td>
            </tr>
            <tr>
              <td>Hybrid</td>
              <td>2.000-4.000 kr</td>
            </tr>
            <tr>
              <td>Benzin (gennemsnit)</td>
              <td>3.000-5.000 kr</td>
            </tr>
            <tr>
              <td>Diesel</td>
              <td>4.000-7.000 kr</td>
            </tr>
          </tbody>
        </table>

        <h3>5. Service og reparationer</h3>
        <p>
          Regn med ca. <strong>3% af bilens værdi</strong> årligt til service, olie, bremser osv.
        </p>
        <ul>
          <li><strong>Serviceeftersyn:</strong> 1.500-4.000 kr</li>
          <li><strong>Bremser:</strong> 2.000-5.000 kr pr. aksel</li>
          <li><strong>Tandrem:</strong> 4.000-8.000 kr</li>
        </ul>
        <p>
          <strong>Elbiler</strong> har markant lavere serviceomkostninger (færre sliddele).
        </p>

        <h3>6. Dæk</h3>
        <p>
          Dæk holder typisk <strong>30.000-50.000 km</strong>. Regn med ca. <strong>3.000 kr/år</strong> inkl. skift.
        </p>

        <h2>Benzin vs. Diesel vs. Elbil</h2>

        <h3>Benzin</h3>
        <ul>
          <li>Billigst at købe</li>
          <li>Lav vægtafgift</li>
          <li>Højere brændstofforbrug</li>
          <li>Højere CO2-udledning</li>
        </ul>

        <h3>Diesel</h3>
        <ul>
          <li>Lavere forbrug (km/l)</li>
          <li>God til lange ture</li>
          <li>Højere afgifter</li>
          <li>Dyrere service (partikelfilter mm.)</li>
        </ul>

        <h3>Elbil</h3>
        <ul>
          <li>Laveste driftsomkostninger</li>
          <li>Ingen afgift (endnu)</li>
          <li>Minimal service</li>
          <li>Højere købspris</li>
          <li>Rækkevidde-begrænsning</li>
          <li>Afgifter kommer (2026+)</li>
        </ul>

        <h2>Pris pr. kilometer</h2>
        <p>
          En typisk dansk bil koster <strong>2,50-4,50 kr/km</strong> i samlede omkostninger:
        </p>
        <table>
          <thead>
            <tr>
              <th>Biltype</th>
              <th>Pris/km (ca.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Lille benzinbil, brugt</td>
              <td>2,00-2,50 kr</td>
            </tr>
            <tr>
              <td>Mellemstor benzin, brugt</td>
              <td>2,50-3,50 kr</td>
            </tr>
            <tr>
              <td>Ny familiebil</td>
              <td>3,50-5,00 kr</td>
            </tr>
            <tr>
              <td>Elbil (efter køb)</td>
              <td>1,50-2,50 kr</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på typiske værdier. De faktiske omkostninger
            afhænger af din specifikke bil, kørselsmønster og lokale priser. Brug den som udgangspunkt
            for at sammenligne forskellige biler.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>De verkliga kostnaderna för att äga bil</h2>
        <p>
          Många bilister fokuserar bara på bränslepriset, men de <strong>totala kostnaderna</strong> för att äga bil
          är mycket högre. Den här räknaren hjälper dig att se <strong>hela bilden</strong>.
        </p>

        <h2>Vad kostar en bil att äga?</h2>

        <h3>1. Bränsle/el</h3>
        <p>
          Den mest synliga utgiften. Beror på <strong>körsträcka</strong>, bilens förbrukning och <strong>bränslepriser</strong>.
        </p>
        <ul>
          <li><strong>Bensin:</strong> Ca 18-20 kr/liter (2026)</li>
          <li><strong>Diesel:</strong> Ca 19-21 kr/liter</li>
          <li><strong>El (hemma):</strong> Ca 1,5-3 kr/kWh</li>
          <li><strong>El (publik laddning):</strong> Ca 4-7 kr/kWh</li>
        </ul>

        <h3>2. Värdeminskning (den dolda jätten)</h3>
        <p>
          Värdeminskning är ofta den <strong>största enskilda utgiften</strong> för att äga bil - och den mest förbisedda.
        </p>
        <table>
          <thead>
            <tr>
              <th>Bilens ålder</th>
              <th>Årlig värdeminskning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ny bil (år 1)</td>
              <td>20-25%</td>
            </tr>
            <tr>
              <td>1-3 år</td>
              <td>15-20%</td>
            </tr>
            <tr>
              <td>3-5 år</td>
              <td>10-15%</td>
            </tr>
            <tr>
              <td>5+ år</td>
              <td>8-12%</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Tips:</strong> Köp 2-3 år gamla bilar för att undvika den största värdeminskningen.
        </p>

        <h3>3. Försäkring</h3>
        <p>
          <strong>Försäkringspriset</strong> varierar mycket beroende på:
        </p>
        <ul>
          <li>Din ålder och erfarenhet</li>
          <li>Bostadsort (stad vs. landsbygd)</li>
          <li>Bilens modell och värde</li>
          <li>Körbehov</li>
          <li>Självrisk</li>
        </ul>
        <p>
          <strong>Tips:</strong> Jämför alltid försäkringar. Prisskillnaden kan vara flera tusen kronor. Kom ihåg att bilen även behöver minst trafikförsäkring enligt lag.
        </p>

        <h3>4. Fordonsskatt</h3>
        <p>
          <strong>Fordonsskatten</strong> i Sverige är i huvudsak <strong>CO2-baserad</strong> - ju högre koldioxidutsläpp, desto högre skatt.
          För nya bilar med höga utsläpp tillkommer en förhöjd skatt, <strong>malus</strong>, under de tre första åren.
        </p>
        <table>
          <thead>
            <tr>
              <th>Typ</th>
              <th>Årlig fordonsskatt (ca.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Elbil</td>
              <td>360 kr (lägsta nivå)</td>
            </tr>
            <tr>
              <td>Laddhybrid</td>
              <td>Ca 400-3 000 kr</td>
            </tr>
            <tr>
              <td>Bensin (genomsnitt)</td>
              <td>Ca 1 500-5 000 kr</td>
            </tr>
            <tr>
              <td>Ny bil med höga utsläpp (malus, år 1-3)</td>
              <td>Upp till 15 000+ kr</td>
            </tr>
          </tbody>
        </table>
        <p>
          Kör du <strong>tjänstebil</strong> beskattas du dessutom för <strong>förmånsvärdet</strong>, som beror på bilens nybilspris, utrustning och utsläpp.
        </p>

        <h3>5. Service och reparationer</h3>
        <p>
          Räkna med ca <strong>3% av bilens värde</strong> per år för service, olja, bromsar osv.
        </p>
        <ul>
          <li><strong>Serviceöversyn:</strong> 2 000-5 000 kr</li>
          <li><strong>Bromsar:</strong> 2 500-6 000 kr per axel</li>
          <li><strong>Kamrem:</strong> 5 000-10 000 kr</li>
        </ul>
        <p>
          <strong>Elbilar</strong> har markant lägre servicekostnader (färre slitdelar).
        </p>

        <h3>6. Däck</h3>
        <p>
          Däck håller vanligtvis <strong>30 000-50 000 km</strong>. Räkna med ca <strong>3 000-4 000 kr/år</strong> inkl. skifte. Kom ihåg att vinterdäck är lagkrav i Sverige under vinterväglag.
        </p>

        <h2>Bensin vs. Diesel vs. Elbil</h2>

        <h3>Bensin</h3>
        <ul>
          <li>Billigast att köpa</li>
          <li>Lägre fordonsskatt vid låga utsläpp</li>
          <li>Högre bränsleförbrukning</li>
          <li>Högre CO2-utsläpp (risk för malus på nya bilar)</li>
        </ul>

        <h3>Diesel</h3>
        <ul>
          <li>Lägre förbrukning (mil/liter)</li>
          <li>Bra för långkörning</li>
          <li>Högre fordonsskatt</li>
          <li>Dyrare service (partikelfilter m.m.)</li>
        </ul>

        <h3>Elbil</h3>
        <ul>
          <li>Lägsta driftskostnaderna</li>
          <li>Lägsta fordonsskatt</li>
          <li>Minimal service</li>
          <li>Högre inköpspris</li>
          <li>Räckviddsbegränsning</li>
          <li>Lägre förmånsvärde för tjänstebil</li>
        </ul>

        <h2>Pris per kilometer</h2>
        <p>
          En typisk svensk bil kostar <strong>3,00-5,00 kr/km</strong> i totala kostnader:
        </p>
        <table>
          <thead>
            <tr>
              <th>Biltyp</th>
              <th>Pris/km (ca.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Liten bensinbil, begagnad</td>
              <td>2,50-3,00 kr</td>
            </tr>
            <tr>
              <td>Mellanstor bensin, begagnad</td>
              <td>3,00-4,00 kr</td>
            </tr>
            <tr>
              <td>Ny familjebil</td>
              <td>4,00-5,50 kr</td>
            </tr>
            <tr>
              <td>Elbil (efter inköp)</td>
              <td>2,00-3,00 kr</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Viktigt</p>
          <p className="text-yellow-700">
            Den här räknaren ger en uppskattning baserad på typiska värden. De faktiska kostnaderna
            beror på din specifika bil, ditt körmönster och lokala priser. Använd den som utgångspunkt
            för att jämföra olika bilar.
          </p>
        </div>
      </div>
      )}

      <section className="mt-12">
        <FAQ items={pageData.faqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/bil" />
      </section>
    </div>
  );
}
