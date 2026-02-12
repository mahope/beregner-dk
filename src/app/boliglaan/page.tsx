import type { Metadata } from "next";
import BoliglaanBeregner from "@/components/BoliglaanBeregner";
import {
  CalculatorSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Boliglånsberegner - Beregn din månedlige ydelse | Beregner.dk",
  description:
    "Gratis boliglånsberegner. Beregn månedlig ydelse, samlet pris og skattefradrag på dit boliglån. Sammenlign fastforrentet, variabel og afdragsfrit.",
  keywords: "boliglån, beregner, månedlig ydelse, realkreditlån, huslån, boligkøb, rente, skattefradrag",
};

export default function BoliglaanPage() {
  return (
    <div>
      <CalculatorSchema
        name="Boliglånsberegner - Beregn din månedlige ydelse"
        description="Gratis boliglånsberegner. Beregn månedlig ydelse, samlet pris og skattefradrag på dit boliglån."
        url={`${baseUrl}/boliglaan`}
        category="FinanceApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Boliglånsberegner", url: `${baseUrl}/boliglaan` },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">Boliglånsberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvad dit boliglån vil koste om måneden, og se hvor meget du betaler i alt over lånets løbetid.
      </p>

      <BoliglaanBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan fungerer boliglån i Danmark</h2>
        <p>
          Når du køber bolig i Danmark, finansierer du typisk købet med en kombination af:
        </p>
        <ul>
          <li><strong>Udbetaling:</strong> Minimum 5% af boligens pris (anbefalet: 10-20%)</li>
          <li><strong>Realkreditlån:</strong> Op til 80% af boligens værdi</li>
          <li><strong>Banklån/tillægslån:</strong> De resterende 15% (mellem udbetaling og realkredit)</li>
        </ul>

        <h2>Fastforrentet vs. variabel rente</h2>
        
        <h3>Fastforrentet lån</h3>
        <p>
          Med et fastforrentet lån kender du din ydelse i hele lånets løbetid. Det giver tryghed og 
          budgetsikkerhed, men typisk til en lidt højere rente end variabel.
        </p>
        <ul>
          <li>✅ Fast ydelse hele perioden</li>
          <li>✅ Beskyttet mod rentestigninger</li>
          <li>✅ Nem at budgettere</li>
          <li>❌ Typisk højere startrente</li>
          <li>❌ Kan være dyrere at indfri</li>
        </ul>

        <h3>Variabel rente (F-kort, F1, F3, F5)</h3>
        <p>
          Med variabel rente justeres din rente løbende. Du kan ofte få lavere rente, men med risiko for stigninger.
        </p>
        <ul>
          <li>✅ Ofte lavere rente</li>
          <li>✅ Fleksibelt at indfri</li>
          <li>❌ Usikker fremtidig ydelse</li>
          <li>❌ Risiko ved rentestigninger</li>
        </ul>

        <h2>Hvad er bidragssatsen?</h2>
        <p>
          Bidragssatsen er det realkreditinstituttet tager for at administrere dit lån. 
          Den afhænger af:
        </p>
        <ul>
          <li><strong>Belåningsgrad:</strong> Jo højere belåning, jo højere bidrag</li>
          <li><strong>Boligtype:</strong> Ejerlejligheder har ofte højere bidrag</li>
          <li><strong>Låntype:</strong> Afdragsfrie lån har højere bidrag</li>
        </ul>
        <p>
          Typiske bidragssatser (2026):
        </p>
        <table>
          <thead>
            <tr>
              <th>Belåningsgrad</th>
              <th>Med afdrag</th>
              <th>Afdragsfrit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0-40%</td>
              <td>0.45-0.65%</td>
              <td>0.55-0.85%</td>
            </tr>
            <tr>
              <td>40-60%</td>
              <td>0.55-0.85%</td>
              <td>0.75-1.15%</td>
            </tr>
            <tr>
              <td>60-80%</td>
              <td>0.75-1.25%</td>
              <td>1.05-1.55%</td>
            </tr>
          </tbody>
        </table>

        <h2>Skattefradrag på renteudgifter</h2>
        <p>
          I Danmark kan du trække renteudgifter fra i skat. I 2024-2026 er fradragsværdien:
        </p>
        <ul>
          <li><strong>Op til ca. 50.000 kr:</strong> ca. 33% fradrag</li>
          <li><strong>Over 50.000 kr:</strong> ca. 25.6% fradrag</li>
        </ul>
        <p>
          Vores beregner bruger en gennemsnitlig fradragsværdi på 25.6% som et konservativt estimat.
        </p>

        <h2>Tips til boligkøb</h2>
        <ul>
          <li><strong>Spar op til mindst 5% udbetaling</strong> - gerne mere for bedre vilkår</li>
          <li><strong>Få flere tilbud</strong> - sammenlign realkredit og bank</li>
          <li><strong>Overvej din risikoprofil</strong> - fast rente = tryghed, variabel = risiko/gevinst</li>
          <li><strong>Regn på totaløkonomi</strong> - ikke kun den månedlige ydelse</li>
          <li><strong>Husk omkostninger</strong> - kursskæring, tinglysning, advokat, etc.</li>
        </ul>

        <h2>Hvad påvirker din ydelse mest?</h2>
        <p>
          I rækkefølge af betydning:
        </p>
        <ol>
          <li><strong>Lånebeløbet</strong> - jo mere du låner, jo mere betaler du</li>
          <li><strong>Renten</strong> - selv små renteændringer har stor effekt over 30 år</li>
          <li><strong>Løbetiden</strong> - kortere løbetid = højere ydelse, men færre renter totalt</li>
          <li><strong>Bidragssatsen</strong> - kan være næsten lige så dyr som selve renten</li>
        </ol>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Kontakt altid din bank eller 
            realkreditinstitut for præcise tilbud. Der kan være yderligere omkostninger som 
            kursskæring, stiftelsesomkostninger, tinglysningsafgift m.v.
          </p>
        </div>
      </div>
    </div>
  );
}
