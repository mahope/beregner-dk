import type { Metadata } from "next";
import FeriepengeBeregner from "@/components/FeriepengeBeregner";

export const metadata: Metadata = {
  title: "Feriepenge Beregner - Se hvad du får udbetalt | Beregner.dk",
  description:
    "Gratis feriepenge beregner. Beregn hvor meget du får udbetalt i feriepenge baseret på din løn. Se både brutto og netto feriepenge.",
};

export default function FeriepengePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Feriepenge Beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvor meget du får udbetalt i feriepenge baseret på din løn.
      </p>

      <FeriepengeBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan beregnes feriepenge</h2>
        <p>
          I Danmark optjener du <strong>12,5% af din ferieberettigede løn</strong> i 
          feriepenge. Dette svarer til 2,08 feriedag per måned eller 25 dage om året 
          (5 ugers ferie).
        </p>

        <h3>Ferieåret vs. optjeningsåret</h3>
        <p>
          Med den nye ferielov (fra 2020) optjener og afholder du ferie samtidigt:
        </p>
        <ul>
          <li>
            <strong>Optjeningsperiode:</strong> 1. september til 31. august
          </li>
          <li>
            <strong>Ferieår:</strong> 1. september til 31. december året efter
          </li>
          <li>
            Du kan afholde ferie løbende, efterhånden som du optjener den
          </li>
        </ul>

        <h2>Hvad er ferieberettiget løn?</h2>
        <p>
          Din ferieberettigede løn inkluderer typisk:
        </p>
        <ul>
          <li>Fast løn</li>
          <li>Bonus og provision</li>
          <li>Overtidsbetaling</li>
          <li>Tillæg (aften, weekend, etc.)</li>
          <li>Værdi af fri bil, telefon, etc.</li>
        </ul>
        <p>
          <strong>Ikke inkluderet:</strong> Arbejdsgiverbetalt pension, 
          godtgørelser (kørsel, rejse), og andre skattefrie ydelser.
        </p>

        <h2>Feriepenge vs. ferie med løn</h2>
        <table>
          <thead>
            <tr>
              <th>Feriepenge</th>
              <th>Ferie med løn</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Timelønnede / løsarbejdere</td>
              <td>Månedslønnede / funktionærer</td>
            </tr>
            <tr>
              <td>12,5% af lønnen opspares</td>
              <td>Normal løn + ferietillæg (1%)</td>
            </tr>
            <tr>
              <td>Udbetales via FerieKonto</td>
              <td>Udbetales direkte af arbejdsgiver</td>
            </tr>
          </tbody>
        </table>

        <h2>Hvornår kan jeg få feriepenge udbetalt?</h2>
        <ul>
          <li>
            <strong>Ved afholdelse af ferie:</strong> Du anmoder om udbetaling 
            fra feriekonto.dk tidligst 1 måned før feriens start
          </li>
          <li>
            <strong>Ved jobskifte:</strong> Ikke-afholdt ferie kan overføres 
            eller udbetales
          </li>
          <li>
            <strong>5. ferieuge:</strong> Kan udbetales uden at afholde ferie 
            (efter ferieåret)
          </li>
        </ul>

        <h2>Skat af feriepenge</h2>
        <p>
          Feriepenge beskattes som almindelig indkomst:
        </p>
        <ol>
          <li>AM-bidrag (8%) trækkes først</li>
          <li>Derefter beregnes A-skat efter dit skattekort</li>
          <li>Feriepengene indberettes automatisk til SKAT</li>
        </ol>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
          <p className="font-medium text-blue-800">Tip: Tjek din ferieopsparing</p>
          <p className="text-blue-700">
            Log ind på <a href="https://www.feriekonto.dk" target="_blank" 
            rel="noopener noreferrer" className="underline">feriekonto.dk</a> med 
            MitID for at se din præcise feriepengeopsparing og anmode om udbetaling.
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat. Din faktiske udbetaling afhænger af 
            dit skattekort og præcise lønforhold. For eksakt beløb, se feriekonto.dk.
          </p>
        </div>
      </div>
    </div>
  );
}
