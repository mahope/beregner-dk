import type { Metadata } from "next";
import SUBeregner from "@/components/SUBeregner";

export const metadata: Metadata = {
  title: "SU Beregner - Beregn din SU 2026 | Beregner.dk",
  description:
    "Gratis SU beregner. Beregn din SU (Statens Uddannelsesstøtte) og fribeløb for 2026. Se hvad du får som udeboende, hjemmeboende eller forsørger.",
};

export default function SUPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">SU Beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn din SU og se om du holder dig under fribeløbet.
      </p>

      <SUBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Om SU (Statens Uddannelsesstøtte)</h2>
        <p>
          SU er en støtte fra staten til studerende på videregående uddannelser, 
          ungdomsuddannelser og visse andre uddannelser. Du kan modtage SU fra 
          du er 18 år.
        </p>

        <h3>Hvem kan få SU?</h3>
        <ul>
          <li>Du skal være dansk statsborger eller have ret til SU som EU-borger</li>
          <li>Du skal være indskrevet på en SU-berettigende uddannelse</li>
          <li>Du skal være studieaktiv</li>
          <li>Du må ikke have opbrugt dine SU-klip</li>
        </ul>

        <h2>SU-klip</h2>
        <p>
          Du får tildelt et antal SU-klip (måneder med SU) baseret på din uddannelses normerede varighed:
        </p>
        <ul>
          <li><strong>Videregående:</strong> 70 klip total (kan bruges til flere uddannelser)</li>
          <li><strong>Ungdomsuddannelse:</strong> Klip svarende til uddannelsens længde</li>
          <li><strong>Bonus-klip:</strong> Ekstra klip hvis du bliver færdig på normeret tid</li>
        </ul>

        <h2>Fribeløb</h2>
        <p>
          Fribeløbet er det beløb, du må tjene ved siden af din SU uden at skulle 
          tilbagebetale. I 2026 er det ca. <strong>14.943 kr/md</strong> (før AM-bidrag).
        </p>
        <p>
          Vigtigt: Fribeløbet gælder <strong>årligt</strong>. Så du kan tjene mere 
          nogle måneder og mindre andre, så længe din samlede årsindkomst ikke 
          overstiger det samlede fribeløb.
        </p>

        <h3>Forhøjet fribeløb</h3>
        <p>
          I måneder hvor du starter eller slutter din uddannelse, samt i måneder 
          uden SU, får du et forhøjet fribeløb (ca. 20.810 kr/md i 2026).
        </p>

        <h2>Tillæg til SU</h2>
        
        <h3>Handicaptillæg</h3>
        <p>
          Studerende med funktionsnedsættelse kan søge om <strong>handicaptillæg</strong>. 
          Det er skattefrit og gives oveni den normale SU.
        </p>

        <h3>Forsørgertillæg</h3>
        <p>
          Enlige forsørgere kan få ekstra tillæg. Derudover findes der:
        </p>
        <ul>
          <li>Forældreydelse (hvis du er forælder)</li>
          <li>Børnetilskud (som supplement)</li>
        </ul>

        <h2>SU-lån</h2>
        <p>
          Du kan optage SU-lån som supplement til din SU:
        </p>
        <ul>
          <li><strong>Slutlån:</strong> Op til 8.782 kr/md de sidste 12 måneder</li>
          <li><strong>Studielån:</strong> Op til 3.594 kr/md under hele uddannelsen</li>
        </ul>
        <p>
          Lånet skal tilbagebetales efter afsluttet uddannelse med renter.
        </p>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-6">
          <p className="font-medium text-blue-800">Administrer din SU</p>
          <p className="text-blue-700">
            Du kan søge SU, se din klipsaldo og tjekke dit fribeløb på{" "}
            <a 
              href="https://www.su.dk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline"
            >
              su.dk
            </a>
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Satserne er estimater for 2026 og kan afvige fra de officielle satser.
            Tjek altid su.dk for de aktuelle satser.
          </p>
        </div>
      </div>
    </div>
  );
}
