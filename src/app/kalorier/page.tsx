import type { Metadata } from "next";
import KalorieBeregner from "@/components/KalorieBeregner";

export const metadata: Metadata = {
  title: "Kalorieberegner - Beregn dit daglige kaloriebehov | Beregner.dk",
  description:
    "Gratis kalorieberegner. Beregn dit daglige kaloriebehov baseret på alder, køn, vægt og aktivitetsniveau. Få forslag til makrofordeling for vægttab eller muskelopbygning.",
  keywords: "kalorier, kalorieberegner, BMR, TDEE, vægttab, makroer, protein, dagligt kaloriebehov",
};

export default function KalorierPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Kalorieberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn dit daglige kaloriebehov baseret på din krop og aktivitetsniveau. Få personlige anbefalinger til vægttab, vedligehold eller muskelopbygning.
      </p>

      <KalorieBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Forstå dit kaloriebehov</h2>
        <p>
          Dit kaloriebehov afhænger af flere faktorer: alder, køn, vægt, højde og hvor aktiv du er.
          Denne beregner bruger <strong>Mifflin-St Jeor formlen</strong>, som er den mest præcise metode
          til at estimere dit basalstofskifte.
        </p>

        <h2>BMR vs. TDEE</h2>
        
        <h3>BMR (Basal Metabolic Rate)</h3>
        <p>
          Dit basalstofskifte er antallet af kalorier din krop brænder bare for at holde dig i live
          - hjertet pumper, lungerne trækker vejret, cellerne fornyer sig. Selv hvis du lå stille
          i sengen hele dagen, ville du brænde disse kalorier.
        </p>

        <h3>TDEE (Total Daily Energy Expenditure)</h3>
        <p>
          TDEE er dit totale daglige kalorieforbrug - BMR plus alle de kalorier du brænder gennem
          aktivitet: gåture, træning, arbejde, selv at tænke bruger kalorier.
        </p>

        <h2>Aktivitetsniveauer forklaret</h2>
        <table>
          <thead>
            <tr>
              <th>Niveau</th>
              <th>Beskrivelse</th>
              <th>Eksempel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stillesiddende</td>
              <td>Meget lidt bevægelse</td>
              <td>Kontorarbejde, ingen motion</td>
            </tr>
            <tr>
              <td>Let aktivitet</td>
              <td>Let motion 1-3 dage/uge</td>
              <td>Gåture, let yoga</td>
            </tr>
            <tr>
              <td>Moderat</td>
              <td>Moderat motion 3-5 dage/uge</td>
              <td>Fitness, løb, cykling</td>
            </tr>
            <tr>
              <td>Aktiv</td>
              <td>Hård træning 6-7 dage/uge</td>
              <td>Daglig sport, fysisk arbejde</td>
            </tr>
            <tr>
              <td>Meget aktiv</td>
              <td>Atletisk træning</td>
              <td>Professionel sport, 2x daglig træning</td>
            </tr>
          </tbody>
        </table>

        <h2>Vægttab og kalorieunderskud</h2>
        <p>
          For at tabe vægt skal du spise færre kalorier end du forbrænder. En god tommelfingerregel:
        </p>
        <ul>
          <li><strong>500 kcal underskud/dag</strong> = ca. 0.5 kg tab/uge</li>
          <li><strong>1000 kcal underskud/dag</strong> = ca. 1 kg tab/uge (ikke anbefalet længe)</li>
        </ul>
        <p>
          Et moderat underskud på 500 kcal er mere bæredygtigt og hjælper dig med at bevare muskelmasse.
        </p>

        <h2>Muskelopbygning og kalorieoverskud</h2>
        <p>
          For at opbygge muskler har du brug for et lille kalorieoverskud (typisk 200-500 kcal)
          kombineret med styrketræning og tilstrækkeligt protein.
        </p>

        <h2>Makronæringsstoffer</h2>
        
        <h3>Protein</h3>
        <p>
          Protein er essentielt for muskler, hår, hud og hundredvis af kropsprocesser.
        </p>
        <ul>
          <li><strong>Vedligehold:</strong> 0.8-1.2g per kg kropsvægt</li>
          <li><strong>Vægttab:</strong> 1.2-1.6g per kg (bevarer muskler)</li>
          <li><strong>Muskelopbygning:</strong> 1.6-2.2g per kg</li>
        </ul>
        <p>1g protein = 4 kalorier</p>

        <h3>Fedt</h3>
        <p>
          Fedt er vigtigt for hormoner, vitaminoptagelse og cellestruktur. Minimum 20-25% af kalorier
          bør komme fra fedt.
        </p>
        <p>1g fedt = 9 kalorier</p>

        <h3>Kulhydrater</h3>
        <p>
          Kulhydrater er kroppens foretrukne energikilde, især under træning. Mængden kan variere
          meget baseret på dine mål og præferencer.
        </p>
        <p>1g kulhydrat = 4 kalorier</p>

        <h2>Tips til at nå dine mål</h2>
        <ul>
          <li><strong>Følg med:</strong> Brug en app til at tracke mad de første uger</li>
          <li><strong>Vej dig konsistent:</strong> Samme tidspunkt, samme forhold</li>
          <li><strong>Vær tålmodig:</strong> Bæredygtig forandring tager tid</li>
          <li><strong>Justér løbende:</strong> Din krop tilpasser sig - justér kalorierne efter behov</li>
          <li><strong>Prioritér protein:</strong> Holder dig mæt og bevarer muskler</li>
        </ul>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på gennemsnitsværdier. Individuelle 
            variationer kan være betydelige. Ved større vægtændringer eller helbredsproblemer, 
            konsulter altid en læge eller diætist.
          </p>
        </div>
      </div>
    </div>
  );
}
