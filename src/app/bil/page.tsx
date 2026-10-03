import BilBeregner from "@/components/BilBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import { formatNumber } from "@/lib/format";
import {
  bilDaekHoldelighed,
  bilBelob,
  bilDriftsomkostninger,
  bilEnhedspris,
  bilKrPrKm,
  bilPrisPrKmSpaendTekst,
  bilProcent,
  bilRaekker,
  bilServiceomkostning,
  bilStandardindgange,
} from "@/lib/bil-omkostninger";

export async function generateMetadata() {
  return generatePageMetadata("bil");
}

export default async function BilPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("bil", locale) || getPageData("bil", "da")!;

  /**
   * Artiklen læser hvert beløb fra `bil-omkostninger`, som er den samme kilde
   * `BilBeregner` regner med. Før 2/10 skrev siden 16 beløb håndskrevet, og
   * de sagde noget andet end værktøjet: artiklen lovede 2,50-4,50 kr pr. km,
   * mens beregneren viste 4,90 kr for de samme standardindgange.
   */
  const sprog = locale === "se" ? "se" : "da";
  const standard = bilStandardindgange(sprog);
  const drift = bilDriftsomkostninger(sprog);
  const rækker = bilRaekker(sprog);

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
          <li>
            <strong>Brændstofpris:</strong> {bilEnhedspris(standard.braendstofpris, locale, "liter")} — feltet bruges til benzin, diesel og hybrid
          </li>
          <li>
            <strong>Elpris:</strong> {bilEnhedspris(standard.elpris, locale, "kWh")} ved {standard.kwh100km} kWh/100 km
          </li>
          <li><strong>Offentlig opladning</strong> er dyrere end hjemmeladning. Sæt elprisen højere, hvis du hovedsageligt lader ude</li>
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
              <td>20-25 %</td>
            </tr>
            <tr>
              <td>1-3 år</td>
              <td>15-20 %</td>
            </tr>
            <tr>
              <td>3-5 år</td>
              <td>10-15 %</td>
            </tr>
            <tr>
              <td>5+ år</td>
              <td>8-12 %</td>
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
          Afgiften afhænger af bilens <strong>brændstofforbrug</strong> og <strong>udledning</strong>. Beregneren bruger
          følgende gennemsnit, fordi den ellers skulle kende hver bil:
        </p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Årlig afgift i beregneren</th>
            </tr>
          </thead>
          <tbody>
            {rækker.map((række) => (
              <tr key={række.type}>
                <td>{række.navn}</td>
                <td>{bilBelob(locale, række.vaegt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Elbiler</strong> regnes uden vægtafgift, så beregnerens årlige omkostning for en elbil er lavere, end
          den bliver med en afgift.
        </p>

        <h3>5. Service og reparationer</h3>
        <p>
          For en bil på {bilBelob(locale, standard.bilpris)} bruger beregneren{" "}
          <strong>{bilProcent(drift.serviceProcent, locale)} af bilens pris</strong> til service og reparationer, altså{" "}
          {bilBelob(locale, bilServiceomkostning(standard.bilpris, sprog))} om året. Det dækker serviceeftersyn,
          olieskift og mindre reparationer.
        </p>
        <p>
          <strong>Ikke medregnet:</strong> tandemrem, større reparationer og syn af bilen. De kommer for sjældent til at
          være værd at regne på.
        </p>
        <p>
          <strong>Elbiler</strong> har markant lavere serviceomkostninger (færre sliddele).
        </p>

        <h3>6. Dæk</h3>
        <p>
          Dæk holder typisk <strong>{bilDaekHoldelighed(locale)}</strong>. Beregneren bruger{" "}
          <strong>{bilBelob(locale, drift.daek)} om året</strong> inkl. skift.
        </p>

        <h2>Benzin vs. Diesel vs. Elbil</h2>

        <h3>Benzin</h3>
        <ul>
          <li>Billigst at købe</li>
          <li>Højere brændstofforbrug end el</li>
          <li>Højere CO2-udledning</li>
          <li>Vægtafgift i beregneren: {bilBelob(locale, drift.vaegt.benzin)}</li>
        </ul>

        <h3>Diesel</h3>
        <ul>
          <li>God til lange ture</li>
          <li>Dyrere service (partikelfilter mm.)</li>
          <li>Højere vægtafgift end benzin</li>
          <li>Vægtafgift i beregneren: {bilBelob(locale, drift.vaegt.diesel)}</li>
        </ul>

        <h3>Elbil</h3>
        <ul>
          <li>Lavere brændstofomkostning</li>
          <li>Minimal service</li>
          <li>Højere købspris</li>
          <li>Rækkevidde-begrænsning</li>
          <li>Vægtafgift i beregneren: {bilBelob(locale, drift.vaegt.el)}</li>
        </ul>

        <h2>Pris pr. kilometer</h2>
        <p>
          Med beregnerens standardindgange — en bil på {bilBelob(locale, standard.bilpris)},{" "}
          {formatNumber(standard.kmPrAar, locale)} km om året og{" "}
          {bilProcent(standard.vaerditabProcent, locale)} i årligt værditab — er den samlede pris pr. kilometer{" "}
          <strong>{bilPrisPrKmSpaendTekst(sprog, locale)}</strong> pr. brændstoftype:
        </p>
        <table>
          <thead>
            <tr>
              <th>Brændstof</th>
              <th>Brændstof om året</th>
              <th>Pris pr. kilometer</th>
            </tr>
          </thead>
          <tbody>
            {rækker.map((række) => (
              <tr key={række.type}>
                <td>{række.navn}</td>
                <td>{bilBelob(locale, række.braendstof)}</td>
                <td>{bilKrPrKm(række.prKm, locale)}</td>
              </tr>
            ))}
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
          <li>
            <strong>Bränslepris:</strong> {bilEnhedspris(standard.braendstofpris, locale, "liter")} — fältet används för bensin, diesel och laddhybrid
          </li>
          <li>
            <strong>Elpris:</strong> {bilEnhedspris(standard.elpris, locale, "kWh")} vid {standard.kwh100km} kWh/100 km
          </li>
          <li><strong>Publik laddning</strong> kostar mer än laddning hemma. Sätt elpriset högre om du laddar ute</li>
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
              <td>20-25 %</td>
            </tr>
            <tr>
              <td>1-3 år</td>
              <td>15-20 %</td>
            </tr>
            <tr>
              <td>3-5 år</td>
              <td>10-15 %</td>
            </tr>
            <tr>
              <td>5+ år</td>
              <td>8-12 %</td>
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
          Fordonsskatten i Sverige är i huvudsak <strong>CO2-baserad</strong> - ju högre koldioxidutsläpp, desto högre skatt.
          För nya bilar med höga utsläpp tillkommer en förhöjd skatt, <strong>malus</strong>, under de tre första åren.
          Räknaren använder dessa genomsnitt:
        </p>
        <table>
          <thead>
            <tr>
              <th>Typ</th>
              <th>Årlig fordonsskatt i räknaren</th>
            </tr>
          </thead>
          <tbody>
            {rækker.map((række) => (
              <tr key={række.type}>
                <td>{række.navn}</td>
                <td>{bilBelob(locale, række.vaegt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Kör du <strong>tjänstebil</strong> beskattas du dessutom för <strong>förmånsvärdet</strong>, som beror på bilens nybilspris, utrustning och utsläpp.
        </p>

        <h3>5. Service och reparationer</h3>
        <p>
          För en bil på {bilBelob(locale, standard.bilpris)} använder räknaren{" "}
          <strong>{bilProcent(drift.serviceProcent, locale)} av bilens värde</strong> till service och reparationer,
          alltså {bilBelob(locale, bilServiceomkostning(standard.bilpris, sprog))} per år. Det täcker
          serviceöversyn, oljebyte och mindre reparationer.
        </p>
        <p>
          <strong>Inte medräknat:</strong> kambandet, större reparationer och besiktning. De kommer för sällan till att
          vara värda att räkna på.
        </p>
        <p>
          <strong>Elbilar</strong> har markant lägre servicekostnader (färre slitdelar).
        </p>

        <h3>6. Däck</h3>
        <p>
          Däck håller vanligtvis <strong>{bilDaekHoldelighed(locale)}</strong>. Räknaren använder{" "}
          <strong>{bilBelob(locale, drift.daek)} per år</strong> inkl. skifte. Kom ihåg att vinterdäck är lagkrav i Sverige under vinterväglag.
        </p>

        <h2>Bensin vs. Diesel vs. Elbil</h2>

        <h3>Bensin</h3>
        <ul>
          <li>Billigast att köpa</li>
          <li>Högre bränsleförbrukning än el</li>
          <li>Högre CO2-utsläpp (risk för malus på nya bilar)</li>
          <li>Fordonsskatt i räknaren: {bilBelob(locale, drift.vaegt.benzin)}.</li>
        </ul>

        <h3>Diesel</h3>
        <ul>
          <li>Bra för långkörning</li>
          <li>Dyrare service (partikelfilter m.m.)</li>
          <li>Högre fordonsskatt än bensin</li>
          <li>Fordonsskatt i räknaren: {bilBelob(locale, drift.vaegt.diesel)}.</li>
        </ul>

        <h3>Elbil</h3>
        <ul>
          <li>Lägre bränslekostnad</li>
          <li>Minimal service</li>
          <li>Högre inköpspris</li>
          <li>Räckviddsbegränsning</li>
          <li>Fordonsskatt i räknaren: {bilBelob(locale, drift.vaegt.el)}.</li>
        </ul>

        <h2>Pris per kilometer</h2>
        <p>
          Med räknarens standardvärden — en bil på {bilBelob(locale, standard.bilpris)},{" "}
          {formatNumber(standard.kmPrAar, locale)} km per år och{" "}
          {bilProcent(standard.vaerditabProcent, locale)} i årlig värdeminskning — blir den totala prisen per kilometer{" "}
          <strong>{bilPrisPrKmSpaendTekst(sprog, locale)}</strong> per drivmedel:
        </p>
        <table>
          <thead>
            <tr>
              <th>Drivmedel</th>
              <th>Bränsle per år</th>
              <th>Pris per kilometer</th>
            </tr>
          </thead>
          <tbody>
            {rækker.map((række) => (
              <tr key={række.type}>
                <td>{række.navn}</td>
                <td>{bilBelob(locale, række.braendstof)}</td>
                <td>{bilKrPrKm(række.prKm, locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Viktigt</p>
          <p className="text-yellow-700">
            Den här räknaren ger en uppskattning baserat på typiska värden. De faktiska kostnaderna
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
