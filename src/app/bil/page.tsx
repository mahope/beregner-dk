import type { Metadata } from "next";
import BilBeregner from "@/components/BilBeregner";

export const metadata: Metadata = {
  title: "Bilomkostningsberegner - Se hvad din bil koster | Beregner.dk",
  description:
    "Gratis bilberegner. Beregn de reelle omkostninger ved at eje bil: brændstof, forsikring, værditab, afgifter og service. Sammenlign benzin, diesel og elbil.",
  keywords: "bil beregner, bilomkostninger, biludgifter, elbil vs benzin, bil pris pr km, værditab bil",
};

export default function BilPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Bilomkostningsberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvad det reelt koster at eje og køre bil. Inkluderer brændstof, forsikring, værditab, afgifter og service.
      </p>

      <BilBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>De reelle omkostninger ved at eje bil</h2>
        <p>
          Mange bilister fokuserer kun på benzinprisen, men de samlede omkostninger ved at eje bil 
          er meget højere. Denne beregner hjælper dig med at se det fulde billede.
        </p>

        <h2>Hvad koster en bil at eje?</h2>
        
        <h3>1. Brændstof/strøm</h3>
        <p>
          Den mest synlige udgift. Afhænger af kørselsomfang, bilens forbrug og brændstofpriser.
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
          Forsikringsprisen varierer meget baseret på:
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
          Afgiften afhænger af bilens brændstofforbrug og udledning:
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
          Regn med ca. 3% af bilens værdi årligt til service, olie, bremser osv.
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
          Dæk holder typisk 30.000-50.000 km. Regn med ca. 3.000 kr/år inkl. skift.
        </p>

        <h2>Benzin vs. Diesel vs. Elbil</h2>
        
        <h3>Benzin</h3>
        <ul>
          <li>✅ Billigst at købe</li>
          <li>✅ Lav vægtafgift</li>
          <li>❌ Højere brændstofforbrug</li>
          <li>❌ Højere CO2-udledning</li>
        </ul>

        <h3>Diesel</h3>
        <ul>
          <li>✅ Lavere forbrug (km/l)</li>
          <li>✅ God til lange ture</li>
          <li>❌ Højere afgifter</li>
          <li>❌ Dyrere service (partikelfilter mm.)</li>
        </ul>

        <h3>Elbil</h3>
        <ul>
          <li>✅ Laveste driftsomkostninger</li>
          <li>✅ Ingen afgift (endnu)</li>
          <li>✅ Minimal service</li>
          <li>❌ Højere købspris</li>
          <li>❌ Rækkevidde-begrænsning</li>
          <li>❌ Afgifter kommer (2026+)</li>
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

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på typiske værdier. De faktiske omkostninger 
            afhænger af din specifikke bil, kørselsmønster og lokale priser. Brug den som udgangspunkt 
            for at sammenligne forskellige biler.
          </p>
        </div>
      </div>
    </div>
  );
}
