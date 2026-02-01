import type { Metadata } from "next";
import BMIBeregner from "@/components/BMIBeregner";

export const metadata: Metadata = {
  title: "BMI Beregner - Beregn dit Body Mass Index | Beregner.dk",
  description:
    "Gratis BMI beregner. Beregn dit Body Mass Index og se om din vægt er sund. Få din idealvægt og personlige anbefalinger.",
};

export default function BMIPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">BMI Beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn dit Body Mass Index (BMI) og se om din vægt er inden for det sunde område.
      </p>

      <BMIBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Hvad er BMI?</h2>
        <p>
          BMI står for <strong>Body Mass Index</strong> og er et tal, der bruges til at vurdere, 
          om din vægt er passende i forhold til din højde. BMI beregnes ved at dividere 
          din vægt i kilogram med din højde i meter i anden potens.
        </p>
        <p>
          <strong>Formlen er:</strong> BMI = vægt (kg) / højde² (m)
        </p>

        <h2>Er BMI en pålidelig måling?</h2>
        <p>
          BMI er et nyttigt screeningsværktøj, men det har begrænsninger:
        </p>
        <ul>
          <li>
            <strong>Muskelmasse:</strong> Meget muskuløse personer kan have højt BMI uden at være overvægtige
          </li>
          <li>
            <strong>Alder:</strong> Ældre voksne kan have lavere muskelmasse, hvilket påvirker BMI
          </li>
          <li>
            <strong>Fedtfordeling:</strong> BMI fortæller ikke hvor fedtet sidder (mavefedme er mere risikabelt)
          </li>
          <li>
            <strong>Køn:</strong> Kvinder har naturligt mere fedtvæv end mænd
          </li>
        </ul>

        <h2>BMI for børn og unge</h2>
        <p>
          Denne beregner er beregnet til voksne (18+). For børn og unge bruges 
          alders- og kønsspecifikke BMI-percentiler, da kroppen ændrer sig under vækst.
        </p>

        <h2>Hvad kan jeg gøre ved mit BMI?</h2>
        
        <h3>Ved undervægt (BMI under 18,5)</h3>
        <ul>
          <li>Tal med din læge for at udelukke underliggende årsager</li>
          <li>Spis hyppige, næringsrige måltider</li>
          <li>Inkluder styrketræning for at opbygge muskelmasse</li>
        </ul>

        <h3>Ved overvægt (BMI over 25)</h3>
        <ul>
          <li>Fokuser på varige livsstilsændringer frem for hurtige diæter</li>
          <li>Øg dit daglige aktivitetsniveau gradvist</li>
          <li>Reducer sukker og forarbejdede fødevarer</li>
          <li>Overvej at tale med en diætist eller læge</li>
        </ul>

        <h2>Andre vigtige sundhedsmål</h2>
        <p>
          Ud over BMI kan disse målinger give et bedre billede af din sundhed:
        </p>
        <ul>
          <li><strong>Taljemål:</strong> Under 94 cm for mænd, under 80 cm for kvinder</li>
          <li><strong>Talje-hofte-ratio:</strong> Under 0,9 for mænd, under 0,85 for kvinder</li>
          <li><strong>Fedtprocent:</strong> Måles med specialudstyr</li>
          <li><strong>Blodtryk og kolesterol:</strong> Vigtige for hjertesundhed</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner er kun til informationsformål og erstatter ikke professionel 
            medicinsk rådgivning. Konsulter altid en læge ved bekymringer om din vægt eller sundhed.
          </p>
        </div>
      </div>
    </div>
  );
}
