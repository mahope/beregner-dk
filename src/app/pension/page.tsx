import type { Metadata } from "next";
import PensionBeregner from "@/components/PensionBeregner";
import FAQ from "@/components/FAQ";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Pensionsberegner - Beregn din fremtidige pension | Beregner.dk",
  description:
    "Beregn din pension 2026. Folkepension: ca. 13.000-15.000 kr/md. Se hvad du får med arbejdsmarkedspension (12-17% af løn), ATP og egen opsparing. Gratis pensionsberegner.",
  keywords: "pension, beregner, pensionsopsparing, folkepension, ATP, alderspension, ratepension",
};

export default function PensionPage() {
  return (
    <div>
      <CalculatorSchema
        name="Pensionsberegner - Beregn din pension"
        description="Gratis pensionsberegner. Beregn hvad du kan få udbetalt som pensionist baseret på din opsparing, afkast og folkepension."
        url={`${baseUrl}/pension`}
        category="FinanceApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Pensionsberegner", url: `${baseUrl}/pension` },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">Pensionsberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvad du kan forvente at få udbetalt som pensionist baseret på din opsparing og de forventede afkast.
      </p>

      <PensionBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Pension i Danmark - et overblik</h2>
        <p>
          Det danske pensionssystem består af tre søjler:
        </p>
        <ol>
          <li><strong>Folkepension + ATP:</strong> Staten betaler til alle (ca. 13.000-15.000 kr/måned)</li>
          <li><strong>Arbejdsmarkedspension:</strong> Indbetalt via din arbejdsgiver (typisk 12-17% af løn)</li>
          <li><strong>Privat pension:</strong> Din egen opsparing (ratepension, aldersopsparing, frie midler)</li>
        </ol>

        <h2>Folkepension (2026)</h2>
        <p>
          Alle danske statsborgere med bopæl i Danmark har ret til folkepension fra folkepensionsalderen (pt. 68 år).
        </p>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Beløb/måned (ca.)</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Grundbeløb</td>
              <td>6.900 kr</td>
              <td>Afhænger af ophold i DK</td>
            </tr>
            <tr>
              <td>Pensionstillæg (enlig)</td>
              <td>8.200 kr</td>
              <td>Modregnes i anden indkomst</td>
            </tr>
            <tr>
              <td>Pensionstillæg (samboende)</td>
              <td>4.100 kr</td>
              <td>Modregnes i anden indkomst</td>
            </tr>
            <tr>
              <td>ATP livslang</td>
              <td>2.000-3.000 kr</td>
              <td>Afhænger af indbetalinger</td>
            </tr>
          </tbody>
        </table>

        <h2>Arbejdsmarkedspension</h2>
        <p>
          De fleste danskere har arbejdsmarkedspension via deres ansættelse. Typiske satser:
        </p>
        <ul>
          <li><strong>Arbejdsgiver:</strong> 8-12% af din løn</li>
          <li><strong>Din egen andel:</strong> 4-5% af din løn</li>
          <li><strong>Total:</strong> 12-17% af din bruttoløn</li>
        </ul>
        <p>
          Eksempel: Med 40.000 kr/måned i løn og 15% pension indbetales 6.000 kr/måned.
        </p>

        <h2>Pensionstyper</h2>

        <h3>Ratepension</h3>
        <ul>
          <li>Udbetales over 10-30 år</li>
          <li>Beskattes som almindelig indkomst ved udbetaling</li>
          <li>Fradrag for indbetalinger (op til 63.100 kr/år i 2026)</li>
        </ul>

        <h3>Aldersopsparing</h3>
        <ul>
          <li>Udbetales skattefrit</li>
          <li>Ingen fradrag for indbetalinger</li>
          <li>Max 5.900 kr/år (2026)</li>
        </ul>

        <h3>Livrente</h3>
        <ul>
          <li>Livslang udbetaling</li>
          <li>Beskytter mod at "løbe tør"</li>
          <li>Beskattes som almindelig indkomst</li>
        </ul>

        <h2>Hvornår kan du gå på pension?</h2>
        <table>
          <thead>
            <tr>
              <th>Født</th>
              <th>Folkepensionsalder</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Før 1963</td>
              <td>65-67 år</td>
            </tr>
            <tr>
              <td>1963-1966</td>
              <td>68 år</td>
            </tr>
            <tr>
              <td>1967-1970</td>
              <td>69 år</td>
            </tr>
            <tr>
              <td>Efter 1970</td>
              <td>70+ år (forventes)</td>
            </tr>
          </tbody>
        </table>
        <p>
          Du kan typisk gå på <strong>tidlig pension</strong> (opsparingsbaseret) fra 5 år før folkepensionsalderen,
          men folkepensionen starter først ved den officielle alder.
        </p>

        <h2>Tips til pensionsplanlægning</h2>
        <ul>
          <li><strong>Start tidligt:</strong> Renters rente virker bedst over mange år</li>
          <li><strong>Udnyt fradrag:</strong> Ratepension giver skattefradrag nu</li>
          <li><strong>Diversificer:</strong> Bland aktier og obligationer efter alder</li>
          <li><strong>Tjek dine pensioner:</strong> <a href="https://www.pensionsinfo.dk" target="_blank" rel="noopener">PensionsInfo.dk</a></li>
          <li><strong>Overvej tidlig pension:</strong> Kræver ekstra opsparing</li>
        </ul>

        <h2>Tommelfingerregler</h2>
        <ul>
          <li><strong>Hvor meget skal du spare?</strong> Ca. 12-17% af din løn</li>
          <li><strong>Hvad kan du leve af?</strong> De fleste har brug for 60-80% af deres arbejdsindkomst</li>
          <li><strong>Aktieandel:</strong> 100 minus din alder (30-årig = 70% aktier)</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Pensionsregler ændres løbende, og 
            individuelle forhold varierer. Kontakt din pensionskasse eller en rådgiver for 
            personlig vejledning.
          </p>
        </div>

        <h2>Nyttige links</h2>
        <ul>
          <li><a href="https://www.pensionsinfo.dk" target="_blank" rel="noopener">PensionsInfo.dk</a> - Se alle dine pensioner samlet</li>
          <li><a href="https://www.borger.dk/pension-og-efterloen" target="_blank" rel="noopener">Borger.dk</a> - Officiel info om pension</li>
          <li><a href="https://www.atp.dk" target="_blank" rel="noopener">ATP.dk</a> - Din ATP-pension</li>
        </ul>
      </div>
    </div>
  );
}
