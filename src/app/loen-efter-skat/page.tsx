import type { Metadata } from "next";
import LoenBeregner from "@/components/LoenBeregner";

export const metadata: Metadata = {
  title: "Løn efter skat - Beregn din nettoløn | Beregner.dk",
  description:
    "Gratis lønberegner. Se hvad du får udbetalt efter skat, AM-bidrag og pension. Beregn din nettoløn med aktuelle danske skattesatser for 2026.",
};

export default function LoenPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Løn efter skat</h1>
      <p className="text-gray-600 mb-8">
        Beregn din nettoløn og se hvad du får udbetalt efter skat, AM-bidrag og pension.
      </p>

      <LoenBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan beregnes din skat</h2>
        <p>
          I Danmark betaler vi skat af vores indkomst i flere lag. Her er en oversigt over 
          hvordan din løn beskattes:
        </p>

        <h3>1. AM-bidrag (8%)</h3>
        <p>
          Først trækkes <strong>arbejdsmarkedsbidraget</strong> på 8% fra din bruttoløn. 
          Dette bidrag går til dagpenge, efterløn og andre arbejdsmarkedsordninger.
        </p>

        <h3>2. Personfradrag</h3>
        <p>
          Alle har ret til et <strong>personfradrag</strong> på {new Intl.NumberFormat("da-DK").format(49700)} kr 
          i 2026. Du betaler ikke skat af dette beløb.
        </p>

        <h3>3. Beskæftigelsesfradrag</h3>
        <p>
          Som lønmodtager får du et ekstra fradrag på 10,65% af din lønindkomst (efter AM-bidrag), 
          dog maks. ca. 45.100 kr i 2026.
        </p>

        <h3>4. Bundskat (12,22%)</h3>
        <p>
          Alle betaler <strong>bundskat</strong> af den skattepligtige indkomst (efter fradrag).
        </p>

        <h3>5. Kommuneskat (varierer)</h3>
        <p>
          <strong>Kommuneskatten</strong> varierer fra kommune til kommune. 
          Landsgennemsnittet er ca. 24,94% i 2026. De billigste kommuner ligger omkring 22%, 
          mens de dyreste er over 27%.
        </p>

        <h3>6. Kirkeskat (valgfri)</h3>
        <p>
          Medlemmer af folkekirken betaler <strong>kirkeskat</strong> på ca. 0,6-1% 
          (gennemsnit 0,68%).
        </p>

        <h3>7. Topskat (15%)</h3>
        <p>
          Tjener du over ca. 588.900 kr årligt (efter AM-bidrag), betaler du 
          <strong>topskat</strong> på 15% af beløbet over grænsen.
        </p>

        <h2>Kommuner med lavest/højest skat (2026)</h2>
        <table>
          <thead>
            <tr>
              <th>Laveste skatteprocent</th>
              <th>Højeste skatteprocent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rudersdal (22,5%)</td>
              <td>Langeland (27,8%)</td>
            </tr>
            <tr>
              <td>Gentofte (22,8%)</td>
              <td>Ishøj (27,2%)</td>
            </tr>
            <tr>
              <td>Allerød (23,3%)</td>
              <td>Brøndby (27,1%)</td>
            </tr>
          </tbody>
        </table>

        <h2>Tips til at optimere din skat</h2>
        <ul>
          <li>
            <strong>Kørselsfradrag:</strong> Bor du langt fra arbejde, kan du få fradrag 
            for transport over 24 km hver vej.
          </li>
          <li>
            <strong>Håndværkerfradrag:</strong> Få fradrag for serviceydelser i hjemmet.
          </li>
          <li>
            <strong>Pensionsindbetalinger:</strong> Ratepension og livrente giver fradrag.
          </li>
          <li>
            <strong>Fagforeningskontingent:</strong> Op til 7.000 kr kan fratrækkes (2026).
          </li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gennemsnitlige satser. 
            Din faktiske skat afhænger af din specifikke situation, fradrag og kommune. 
            For præcis beregning, brug SKAT's officielle værktøjer eller tal med en revisor.
          </p>
        </div>

        <h2>Hvad er forskellen på brutto og netto?</h2>
        <ul>
          <li>
            <strong>Bruttoløn:</strong> Din løn før skat og bidrag trækkes fra
          </li>
          <li>
            <strong>Nettoløn:</strong> Det beløb du faktisk får udbetalt på kontoen
          </li>
          <li>
            <strong>A-indkomst:</strong> Løn hvor arbejdsgiver indberetter og betaler skat
          </li>
          <li>
            <strong>B-indkomst:</strong> Indkomst hvor du selv betaler skat (fx freelance)
          </li>
        </ul>
      </div>
    </div>
  );
}
