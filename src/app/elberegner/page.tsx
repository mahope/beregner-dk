import type { Metadata } from "next";
import Elberegner from "@/components/Elberegner";

export const metadata: Metadata = {
  title: "Elberegner - Beregn dit elforbrug | Beregner.dk",
  description:
    "Gratis elberegner til at beregne dit elforbrug. Se hvad dine apparater koster i strøm per dag, måned og år. Inkluderer liste over typiske apparaters watt-forbrug.",
};

export default function ElberegnerPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Elberegner</h1>
      <p className="text-gray-600 mb-8">
        Beregn dit elforbrug og se hvad dine apparater koster i strøm per dag, måned og år.
      </p>

      <Elberegner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du elberegneren</h2>
        <p>
          Med vores elberegner kan du nemt beregne, hvad dine elektriske apparater
          koster i strøm. Sådan gør du:
        </p>
        <ol>
          <li>
            <strong>Vælg et apparat</strong> fra dropdown-listen, eller skriv navnet selv
          </li>
          <li>
            <strong>Angiv watt</strong> - du kan finde det på apparatets mærkeplade
          </li>
          <li>
            <strong>Angiv timer per dag</strong> - hvor længe bruger du apparatet?
          </li>
          <li>
            <strong>Tilføj flere apparater</strong> for at se dit samlede forbrug
          </li>
        </ol>

        <h2>Hvor finder jeg watt-tallet?</h2>
        <p>
          Du kan finde apparatets effekt i watt på følgende måder:
        </p>
        <ul>
          <li>
            <strong>Mærkepladen</strong> - ofte bag på eller under apparatet
          </li>
          <li>
            <strong>Brugsanvisningen</strong> - se under tekniske specifikationer
          </li>
          <li>
            <strong>Online</strong> - søg efter modelnummeret + "watt" eller "specifications"
          </li>
        </ul>

        <h2>Typiske apparaters elforbrug</h2>
        <table>
          <thead>
            <tr>
              <th>Apparat</th>
              <th>Typisk watt</th>
              <th>Årlig pris (ved 4t/dag)*</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Køleskab</td>
              <td>40W (kører 24/7)</td>
              <td>~875 kr</td>
            </tr>
            <tr>
              <td>Computer</td>
              <td>150W</td>
              <td>~550 kr</td>
            </tr>
            <tr>
              <td>TV</td>
              <td>100W</td>
              <td>~365 kr</td>
            </tr>
            <tr>
              <td>Tørretumbler</td>
              <td>3000W</td>
              <td>~1095 kr (1t/dag)</td>
            </tr>
            <tr>
              <td>Gaming PC</td>
              <td>500W</td>
              <td>~1825 kr</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-500">
          *Beregnet med en elpris på 2,5 kr/kWh
        </p>

        <h2>Tips til at spare på strømmen</h2>
        <ul>
          <li>
            <strong>Sluk for standby</strong> - apparater på standby bruger stadig strøm
          </li>
          <li>
            <strong>Vælg energieffektive apparater</strong> - kig efter A+++ mærkning
          </li>
          <li>
            <strong>LED-pærer</strong> - bruger op til 80% mindre strøm end glødepærer
          </li>
          <li>
            <strong>Vask på 30°</strong> - de fleste tøjtyper bliver rene ved lavere temperaturer
          </li>
          <li>
            <strong>Fyld maskinen</strong> - kør opvaskemaskine og vaskemaskine kun når de er fulde
          </li>
        </ul>

        <h2>Om elpriser i Danmark</h2>
        <p>
          Elpriser i Danmark varierer afhængigt af tidspunkt, årstid og din elaftale.
          Den samlede pris du betaler inkluderer:
        </p>
        <ul>
          <li>Spotpris (varierer time for time)</li>
          <li>Nettarif (transport af strøm)</li>
          <li>Elafgift</li>
          <li>Moms (25%)</li>
          <li>Elselskabets tillæg</li>
        </ul>
        <p>
          I 2026 ligger den gennemsnitlige elpris typisk mellem 2-3 kr/kWh inkl. alle afgifter.
          Tjek din seneste elregning for din præcise pris.
        </p>
      </div>
    </div>
  );
}
