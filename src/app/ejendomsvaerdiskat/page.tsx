import type { Metadata } from "next";
import EjendomsvaerdiskatBeregner from "@/components/EjendomsvaerdiskatBeregner";
import {
  CalculatorSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Ejendomsværdiskat beregner - Beregn din ejendomsskat 2024/2025 | MinBeregner.dk",
  description:
    "Beregn nemt din ejendomsværdiskat og grundskyld. Se hvor meget du skal betale i ejendomsskat baseret på ejendomsværdi, grundværdi og kommune. Gratis beregner med 2024/2025 satser.",
  keywords: "ejendomsværdiskat beregner, ejendomsskat, grundskyld, boligskat, kommuneskat",
};

export default function EjendomsvaerdiskatPage() {
  return (
    <div>
      <CalculatorSchema
        name="Ejendomsværdiskat beregner"
        description="Beregn din ejendomsværdiskat og grundskyld baseret på ejendomsværdi, grundværdi og kommune. Opdateret med 2024/2025 satser."
        url={`${baseUrl}/ejendomsvaerdiskat`}
        category="FinanceApplication"
      />
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Bolig", url: `${baseUrl}/bolig` },
          { name: "Ejendomsværdiskat beregner", url: `${baseUrl}/ejendomsvaerdiskat` },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">Ejendomsværdiskat beregner</h1>
      <p className="text-gray-600 mb-8">
        Beregn hvor meget du skal betale i ejendomsværdiskat og grundskyld. 
        Beregneren bruger de officielle 2024/2025 satser og kommuneprocenter.
      </p>

      <EjendomsvaerdiskatBeregner />

      <div className="mt-12 prose max-w-none">
        <h2>Sådan beregnes ejendomsskat</h2>
        <p>
          Ejendomsskatten i Danmark består af to dele: ejendomsværdiskat og grundskyld. 
          Begge dele beregnes på baggrund af vurderinger fra ejendomsvurderingssystemet.
        </p>

        <h3>Ejendomsværdiskat</h3>
        <p>
          Ejendomsværdiskatten beregnes som en procentdel af ejendomsværdien med følgende satser:
        </p>
        <ul>
          <li><strong>0,92%</strong> af ejendomsværdien op til bundfradraget på {formatKr(3040000)}</li>
          <li><strong>3%</strong> af ejendomsværdien over bundfradraget</li>
        </ul>
        <p>
          <strong>Bundfradrag:</strong> Der er et bundfradrag på {formatKr(3040000)} for 2024/2025. 
          Det betyder, at ejendomme under denne værdi kun betaler 0,92% af den fulde værdi.
        </p>

        <h3>Grundskyld</h3>
        <p>
          Grundskylden beregnes som en procentdel af grundværdien. Procentsatsen (kommuneprocenten) 
          varierer fra kommune til kommune og fastsættes årligt af de enkelte kommunalbestyrelser.
        </p>
        <table>
          <thead>
            <tr>
              <th>Kommune</th>
              <th>Kommuneprocent (ca.)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>København</td>
              <td>23,0%</td>
            </tr>
            <tr>
              <td>Aarhus</td>
              <td>24,9%</td>
            </tr>
            <tr>
              <td>Aalborg</td>
              <td>23,4%</td>
            </tr>
            <tr>
              <td>Odense</td>
              <td>24,6%</td>
            </tr>
            <tr>
              <td>Frederiksberg</td>
              <td>25,5%</td>
            </tr>
          </tbody>
        </table>

        <h2>Hvornår betales ejendomsskat?</h2>
        <p>
          Ejendomsskatten betales via din ejendomsskattebillet, som du modtager fra din kommune. 
          Betalingen sker typisk i to rater:
        </p>
        <ul>
          <li><strong>1. rate:</strong> 1. marts - forfaldsdato typisk 1. april</li>
          <li><strong>2. rate:</strong> 1. september - forfaldsdato typisk 1. oktober</li>
        </ul>

        <h2>Ejendomsvurdering</h2>
        <p>
          Din ejendomsværdi og grundværdi fastsættes af Vurderingsstyrelsen. Vurderingen 
          sker typisk hvert andet år, men der kan anmodes om en ny vurdering ved visse ændringer 
          af ejendommen (f.eks. større ombygninger, tilbygninger eller nedrivning).
        </p>

        <h2>Ændringer til ejendomsskatten</h2>
        <p>
          Der har været politisk debat om ændringer til ejendomsbeskatningen. Nogle af de 
          foreslåede eller implementerede ændringer inkluderer:
        </p>
        <ul>
          <li>Midlertidige indefrysningsordninger for stigninger i ejendomsværdi</li>
          <li>Nye vurderingssystemer med hyppigere vurderinger</li>
          <li>Justering af bundfradrag og procentnatsatser</li>
        </ul>
        <p>
          <strong>Tip:</strong> Hold dig opdateret med din kommunes hjemmeside for de 
          gældende satser for dit område.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat baseret på de officielle 2024/2025 satser. 
            Den faktiske ejendomsskat kan afvige, hvis din ejendomsvurdering er anderledes, 
            eller hvis der er sket ændringer i kommuneprocenten. Brug altid din officielle 
            ejendomsskattebillet som grundlag for den endelige betaling.
          </p>
        </div>

        <h2>Relaterede beregnere</h2>
        <ul>
          <li><a href="/boliglaan">Boliglån beregner</a> - Beregn din boliggæld og ydelser</li>
          <li><a href="/husleje">Husleje beregner</a> - Beregn huslejeudgifter</li>
          <li><a href="/boligstoette">Boligstøtte beregner</a> - Tjek din ret til boligstøtte</li>
          <li><a href="/rentefradrag">Rentefradrag beregner</a> - Beregn dit rentefradrag</li>
        </ul>
      </div>
    </div>
  );
}

function formatKr(amount: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
}
