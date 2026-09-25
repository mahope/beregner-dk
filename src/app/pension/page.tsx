import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import dynamic from "next/dynamic";
const PensionBeregner = dynamic(() => import("@/components/PensionBeregner"));
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { FOLKEPENSION_2026, folkepensionsalderRækker } from "@/lib/folkepension";
import RelatedCalculators from "@/components/RelatedCalculators";

export async function generateMetadata() {
  return generatePageMetadata("pension");
}

export default async function PensionPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("pension", locale) || getPageData("pension", "da")!;
  const folk = FOLKEPENSION_2026;
  const alderRaekker = folkepensionsalderRækker();

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/pension`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/pension" }]} />
      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <PensionBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Pension i Danmark - et overblik</h2>
        <p>
          Det danske <strong>pensionssystem</strong> består af <strong>tre søjler</strong>:
        </p>
        <ol>
          <li><strong>Folkepension + ATP:</strong> Staten betaler til alle ({folk.iAlt.samlevende.toLocaleString("da-DK")} kr til {folk.iAlt.enlig.toLocaleString("da-DK")} kr pr. måned før skat, før ATP)</li>
          <li><strong>Arbejdsmarkedspension:</strong> Indbetalt via din arbejdsgiver (typisk 12-17% af løn)</li>
          <li><strong>Privat pension:</strong> Din egen opsparing (ratepension, aldersopsparing, frie midler)</li>
        </ol>

        <h2 id="folkepension-2026">Folkepension 2026</h2>
        <p>
          Alle danske statsborgere med fast bopæl i Danmark har ret til <strong>folkepension</strong> fra
          folkepensionsalderen, hvis de har boet i Danmark i mindst tre år fra de fyldte 15 år.
          Folkepensionen består for de fleste af et <strong>grundbeløb</strong> og et
          <strong>pensionstillæg</strong>. Beløbene er pr. måned før skat:
        </p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Enlige</th>
              <th>Gifte/samlevende</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Grundbeløb</td>
              <td>{folk.grundbeloeb.toLocaleString("da-DK")} kr</td>
              <td>{folk.grundbeloeb.toLocaleString("da-DK")} kr</td>
            </tr>
            <tr>
              <td>Pensionstillæg</td>
              <td>{folk.tillaeg.enlig.toLocaleString("da-DK")} kr</td>
              <td>{folk.tillaeg.samlevende.toLocaleString("da-DK")} kr</td>
            </tr>
            <tr>
              <td><strong>I alt</strong></td>
              <td><strong>{folk.iAlt.enlig.toLocaleString("da-DK")} kr</strong></td>
              <td><strong>{folk.iAlt.samlevende.toLocaleString("da-DK")} kr</strong></td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Grundbeløbet påvirkes ikke af andre indkomster</strong> — du kan arbejde så meget,
          du vil, uden at det påvirker grundbeløbet. <strong>Pensionstillægget sættes derimod ned</strong>,
          hvis du eller din samlever har indkomster ud over arbejdsindkomst, fx arbejdsmarkedspension,
          ATP, rateudbetalinger, nettokapitalindkomst og aktieindkomst. Grænserne for 2026:
        </p>
        <table>
          <thead>
            <tr>
              <th>Situation</th>
              <th>Sættes ned over</th>
              <th>Bortfalder over</th>
              <th>Nedsættelse</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Enlig</td>
              <td>{folk.indkomstgraenser.enlig.nedsaetningOver.toLocaleString("da-DK")} kr</td>
              <td>{folk.indkomstgraenser.enlig.bortfaldOver.toLocaleString("da-DK")} kr</td>
              <td>{folk.indkomstgraenser.enlig.pct * 100}%</td>
            </tr>
            <tr>
              <td>Samlevende med pensionist</td>
              <td>{folk.indkomstgraenser.samlevendeMedPensionist.nedsaetningOver.toLocaleString("da-DK")} kr</td>
              <td>{folk.indkomstgraenser.samlevendeMedPensionist.bortfaldOver.toLocaleString("da-DK")} kr</td>
              <td>{folk.indkomstgraenser.samlevendeMedPensionist.pct * 100}%</td>
            </tr>
            <tr>
              <td>Samlevende uden pensionist</td>
              <td>{folk.indkomstgraenser.samlevendeUdenPensionist.nedsaetningOver.toLocaleString("da-DK")} kr</td>
              <td>{folk.indkomstgraenser.samlevendeUdenPensionist.bortfaldOver.toLocaleString("da-DK")} kr</td>
              <td>{folk.indkomstgraenser.samlevendeUdenPensionist.pct * 100}%</td>
            </tr>
          </tbody>
        </table>
        <p>
          Er din samlever ikke pensionist, ser Udbetaling Danmark bort fra de første
          54 % af samleverens indkomst — kun 46 % tæller med. Beregneren ovenfor bruger
          præcis disse grænser: vælg om du er enlig eller gift/samlevende, markér om din
          samlever er pensionist, og opgiv indkomsten ud over arbejdsindkomsten — så regner
          den pensionstillægget ned og viser, hvor meget du får. Ligesom grundbeløbet betales
          folkepensionen bagud og udbetales på NemKonto den sidste bankdag i måneden. Se
          grænserne og din egen beregning i
          {" "}<a href="https://www.borger.dk/pension-og-efterloen/folkepension/foer-du-gaar-paa-folkepension" target="_blank" rel="noreferrer noopener">Udbetaling Danmarks folkepensionsside</a>
          {" "}eller se alle dine ordninger samlet på
          {" "}<a href="https://www.pensionsinfo.dk" target="_blank" rel="noreferrer noopener">PensionsInfo.dk</a>.
        </p>
        <p className="text-sm text-gray-500">
          Kilde: borger.dk, verificeret 25. september 2026. Folkepensionsalderen kan hæves,
          fordi den løbende tilpasses den gennemsnitlige levealder.
        </p>

        <h2 id="folkepensionsalder">Hvornår kan du gå på folkepension?</h2>
        <p>
          Folkepensionsalderen afhænger af dit fødselsår. Du kan søge om folkepension
          6 måneder inden, du har ret til den, og du skal selv søge — den udbetales ikke automatisk.
        </p>
        <table>
          <thead>
            <tr>
              <th>Født</th>
              <th>Folkepensionsalder</th>
            </tr>
          </thead>
          <tbody>
            {alderRaekker.map((raekke) => (
              <tr key={raekke.foedselsdato}>
                <td>{raekke.foedselsdato}</td>
                <td>{raekke.alderTekst}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Arbejdsmarkedspension</h2>
        <p>
          De fleste danskere har <strong>arbejdsmarkedspension</strong> via deres ansættelse. Typiske satser:
        </p>
        <ul>
          <li><strong>Arbejdsgiver:</strong> 8-12% af din løn</li>
          <li><strong>Din egen andel:</strong> 4-5% af din løn</li>
          <li><strong>Total:</strong> 12-17% af din bruttoløn</li>
        </ul>
        <p>
          <strong>Eksempel:</strong> Med <strong>40.000 kr/måned</strong> i løn og <strong>15% pension</strong> indbetales <strong>6.000 kr/måned</strong>.
        </p>

        <h2>Pensionstyper</h2>

        <h3>Ratepension</h3>
        <ul>
          <li>Udbetales over 10-30 år</li>
          <li>Beskattes som almindelig indkomst ved udbetaling</li>
          <li>Fradrag for indbetalinger (op til 68.700 kr/år i 2026)</li>
        </ul>

        <h3>Aldersopsparing</h3>
        <ul>
          <li>Udbetales skattefrit</li>
          <li>Ingen fradrag for indbetalinger</li>
          <li>Max 9.900 kr/år (2026)</li>
        </ul>

        <h3>Livrente</h3>
        <ul>
          <li>Livslang udbetaling</li>
          <li>Beskytter mod at &quot;løbe tør&quot;</li>
          <li>Beskattes som almindelig indkomst</li>
        </ul>

        <h2>Hvornår kan du gå på pension?</h2>
        <p>
          <strong>Tidlig pension</strong> (opsparingsbaseret) kan typisk købes fra
          5 år før folkepensionsalderen, men <strong>folkepensionen</strong> starter først ved den
          officielle alder. Se <a href="#folkepensionsalder">folkepensionsalderen ovenfor</a> og
          vores <a href="/efterloen">efterlønberegner</a>.
        </p>

        <h2>Tips til pensionsplanlægning</h2>
        <ul>
          <li><strong>Start tidligt:</strong> Renters rente virker bedst over mange år</li>
          <li><strong>Udnyt fradrag:</strong> Ratepension giver skattefradrag nu</li>
          <li><strong>Diversificer:</strong> Bland aktier og obligationer efter alder</li>
          <li><strong>Tjek dine pensioner:</strong> <a href="https://www.pensionsinfo.dk" target="_blank" rel="noreferrer noopener">PensionsInfo.dk</a></li>
          <li><strong>Overvej tidlig pension:</strong> Kræver ekstra opsparing</li>
        </ul>

        <h2>Tommelfingerregler</h2>
        <ul>
          <li><strong>Hvor meget skal du spare?</strong> Ca. 12-17% af din løn</li>
          <li><strong>Hvad kan du leve af?</strong> De fleste har brug for 60-80% af deres arbejdsindkomst</li>
          <li><strong>Aktieandel:</strong> 100 minus din alder (30-årig = 70% aktier)</li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Pensionsregler ændres løbende, og
            individuelle forhold varierer. Kontakt din pensionskasse eller en rådgiver for
            personlig vejledning.
          </p>
        </div>

        <h2>Nyttige links</h2>
        <ul>
          <li><a href="https://www.pensionsinfo.dk" target="_blank" rel="noreferrer noopener">PensionsInfo.dk</a> - Se alle dine pensioner samlet</li>
          <li><a href="https://www.borger.dk/pension-og-efterloen" target="_blank" rel="noreferrer noopener">Borger.dk</a> - Officiel info om pension</li>
          <li><a href="https://www.atp.dk" target="_blank" rel="noreferrer noopener">ATP.dk</a> - Din ATP-pension</li>
        </ul>
      </div>
      )}

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Ofte stillede spørgsmål om pension
        </h2>
        <FAQ items={pageData.faqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/pension" />
      </section>
    </div>
  );
}
