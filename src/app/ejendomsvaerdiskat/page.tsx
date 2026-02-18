import type { Metadata } from "next";
import EjendomsvaerdiskatBeregner from "@/components/EjendomsvaerdiskatBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Ejendomsværdiskat beregner 2026 - Beregn din ejendomsskat | MinBeregner.dk",
  description:
    "Beregn ejendomsværdiskat og grundskyld med det nye boligskattesystem fra 2024. 5,1‰ / 14‰ satser, 80% forsigtighedsfradrag, kommunale grundskyldspromiller. Gratis beregner med 2026 satser.",
  keywords: "ejendomsværdiskat beregner, ejendomsskat 2026, grundskyld, boligskat, grundskyldspromille, boligskattereform",
};

const ejendomsFaqItems = [
  {
    question: "Hvad er ejendomsværdiskatten i 2026?",
    answer:
      "Ejendomsværdiskatten beregnes som 5,1‰ (0,51%) af 80% af ejendomsværdien op til progressionsgrænsen på 9.007.000 kr, og 14‰ (1,4%) af beløbet derover. De 80% skyldes forsigtighedsfradraget på 20%.",
  },
  {
    question: "Hvad er forsigtighedsfradraget?",
    answer:
      "Forsigtighedsfradraget er 20% af den offentlige vurdering. Du betaler kun skat af 80% af den vurderede ejendomsværdi og grundværdi. Fradraget kompenserer for usikkerheden i de nye vurderinger.",
  },
  {
    question: "Hvad er grundskyld?",
    answer:
      "Grundskyld er en skat på din grunds værdi (ikke bygningen). Den beregnes som kommunens grundskyldspromille ganget med 80% af grundværdien. Promillen varierer fra 3,1‰ (Frederiksberg) til 17,7‰ (Varde).",
  },
  {
    question: "Hvad er progressionsgrænsen for ejendomsværdiskat?",
    answer:
      "Progressionsgrænsen er 9.007.000 kr for 2026-2027 (beskatningsgrundlag efter forsigtighedsfradrag). Det svarer til en ejendomsværdi på ca. 11,3 mio. kr. Beløbet over grænsen beskattes med 14‰ i stedet for 5,1‰.",
  },
  {
    question: "Hvornår betaler man ejendomsskat?",
    answer:
      "Ejendomsskatten betales via din ejendomsskattebillet fra kommunen. Betalingen sker typisk i to rater — marts og september. Ejendomsværdiskatten opkræves via årsopgørelsen.",
  },
  {
    question: "Hvad er overgangsordningen?",
    answer:
      "For at beskytte boligejere mod pludselige skattestigninger er der en overgangsordning. Hvis din skat stiger med det nye system, indfases stigningen gradvist over flere år via en skatterabat.",
  },
  {
    question: "Gælder de nye regler for sommerhuse?",
    answer:
      "Ja, de nye ejendomsværdiskattesatser (5,1‰ / 14‰) og forsigtighedsfradraget gælder også for sommerhuse. Grundskyldspromillen afhænger af den kommune, sommerhuset ligger i.",
  },
  {
    question: "Hvor finder jeg min ejendomsvurdering?",
    answer:
      "Du kan se din ejendomsvurdering på vurderingsportalen.dk. Her finder du både ejendomsværdi og grundværdi, som bruges til at beregne din ejendomsskat.",
  },
];

export default function EjendomsvaerdiskatPage() {
  return (
    <div>
      <FAQSchema items={ejendomsFaqItems} />
      <CalculatorSchema
        name="Ejendomsværdiskat beregner 2026"
        description="Beregn din ejendomsværdiskat og grundskyld med det nye boligskattesystem. 5,1‰ / 14‰ satser og kommunale grundskyldspromiller."
        url={`${baseUrl}/ejendomsvaerdiskat`}
        category="FinanceApplication"
      />
      <Breadcrumbs items={[{ name: "Bolig", href: "/kategori/bolig" }, { name: "Ejendomsværdiskat beregner", href: "/ejendomsvaerdiskat" }]} />
      <h1 className="text-3xl font-bold mb-2">Ejendomsværdiskat beregner 2026</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Beregn hvor meget du skal betale i ejendomsværdiskat og grundskyld med det
        nye boligskattesystem. Opdateret med 2026-satser og kommunale grundskyldspromiller.
      </p>

      <EjendomsvaerdiskatBeregner />

      <div className="mt-12 prose max-w-none dark:prose-invert">
        <h2>Det nye boligskattesystem (fra 2024)</h2>
        <p>
          Fra 1. januar 2024 trådte et nyt boligskattesystem i kraft i Danmark.
          Ejendomsskatten består fortsat af to dele — ejendomsværdiskat og grundskyld —
          men begge beregnes nu på nye måder med nye satser.
        </p>

        <h3>Ejendomsværdiskat</h3>
        <p>
          Ejendomsværdiskatten beregnes af <strong>80% af ejendomsværdien</strong>
          {" "}(et såkaldt forsigtighedsfradrag på 20%). Satserne er:
        </p>
        <ul>
          <li><strong>5,1‰ (0,51%)</strong> af beskatningsgrundlaget op til progressionsgrænsen</li>
          <li><strong>14‰ (1,4%)</strong> af beskatningsgrundlaget over progressionsgrænsen</li>
        </ul>
        <p>
          <strong>Progressionsgrænsen</strong> er 9.007.000 kr for 2026-2027 (beskatningsgrundlag).
          Det svarer til en ejendomsværdi på ca. 11,3 mio. kr før forsigtighedsfradraget.
        </p>

        <h3>Grundskyld</h3>
        <p>
          Grundskylden beregnes som kommunens grundskyldspromille ganget med <strong>80%
          af grundværdien</strong> (samme forsigtighedsfradrag som ejendomsværdiskatten).
          Grundskyldspromillen varierer fra kommune til kommune:
        </p>
        <table>
          <thead>
            <tr>
              <th>Kommune</th>
              <th>Grundskyldspromille (‰)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Frederiksberg (lavest)</td>
              <td>3,1‰</td>
            </tr>
            <tr>
              <td>København</td>
              <td>5,1‰</td>
            </tr>
            <tr>
              <td>Odense</td>
              <td>5,7‰</td>
            </tr>
            <tr>
              <td>Aarhus</td>
              <td>6,0‰</td>
            </tr>
            <tr>
              <td>Aalborg</td>
              <td>7,4‰</td>
            </tr>
            <tr>
              <td>Varde (højest)</td>
              <td>17,7‰</td>
            </tr>
          </tbody>
        </table>

        <h2>Eksempel: Beregning af ejendomsskat</h2>
        <p>
          En bolig i København med ejendomsværdi 3.000.000 kr og grundværdi 1.000.000 kr:
        </p>
        <ul>
          <li><strong>Ejendomsværdiskat:</strong> 3.000.000 × 80% × 5,1‰ = 12.240 kr/år</li>
          <li><strong>Grundskyld:</strong> 1.000.000 × 80% × 5,1‰ = 4.080 kr/år</li>
          <li><strong>Samlet:</strong> 16.320 kr/år (1.360 kr/måned)</li>
        </ul>

        <h2>Forsigtighedsfradraget (20%)</h2>
        <p>
          De nye ejendomsvurderinger er forbundet med en vis usikkerhed. Derfor er der
          indført et forsigtighedsfradrag på 20%, så du kun betaler skat af 80% af den
          vurderede værdi. Fradraget gælder for både ejendomsværdiskat og grundskyld.
        </p>

        <h2>Overgangsordning</h2>
        <p>
          For at beskytte boligejere mod pludselige skattestigninger er der indført en
          overgangsordning (skatterabat). Hvis din skat stiger med det nye system,
          indfases stigningen gradvist. Beregneren viser den fulde skat uden
          overgangsrabat.
        </p>

        <h2>Hvornår betales ejendomsskat?</h2>
        <p>
          Ejendomsskatten betales via din ejendomsskattebillet, som du modtager fra
          din kommune. Betalingen sker typisk i to rater i marts og september.
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Opdateret med nyt boligskattesystem</p>
          <p className="text-green-700 dark:text-green-400">
            Denne beregner bruger det nye ejendomsskattesystem fra 2024 med
            5,1‰ / 14‰ satser og 80% forsigtighedsfradrag. Progressionsgrænse
            for 2026-2027: 9.007.000 kr. Kilde: skm.dk, info.skat.dk.
          </p>
        </div>

      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Ofte stillede spørgsmål om ejendomsskat
        </h2>
        <FAQ items={ejendomsFaqItems} />
      </section>

      <section className="mt-12">
        <RelatedCalculators current="/ejendomsvaerdiskat" />
      </section>
    </div>
  );
}
