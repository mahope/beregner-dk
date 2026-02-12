import type { Metadata } from "next";
import BoliglaanBeregner from "@/components/BoliglaanBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
  BreadcrumbSchema,
} from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

const faqItems = [
  {
    question: "Hvor meget kan jeg låne til bolig?",
    answer:
      "Som hovedregel kan du låne op til 80% af boligens værdi i realkreditlån. Dertil kan du typisk låne 15% i banklån og skal selv have 5% i udbetaling. Din indkomst og gæld påvirker også, hvor meget banken vil låne dig.",
  },
  {
    question: "Hvad er forskellen på fast og variabel rente?",
    answer:
      "Med fast rente kender du din ydelse i hele lånets løbetid - typisk 30 år. Med variabel rente (F-kort, F1, F3, F5) justeres renten løbende, ofte hver 1-5 år. Variabel rente er ofte lavere, men kan stige.",
  },
  {
    question: "Hvad er bidragssatsen?",
    answer:
      "Bidragssatsen er det realkreditinstituttet tager for at administrere dit lån. Den varierer fra ca. 0,45% til 1,55% afhængigt af belåningsgrad, boligtype og om du har afdrag. Jo højere belåning, jo højere bidrag.",
  },
  {
    question: "Kan jeg få fradrag for renter på boliglån?",
    answer:
      "Ja, renteudgifter er fradragsberettigede. I 2026 er fradragsværdien ca. 25,6% for de fleste. Det betyder, at for hver 100 kr du betaler i rente, får du ca. 25,6 kr tilbage via lavere skat.",
  },
  {
    question: "Hvad er afdragsfrihed?",
    answer:
      "Med afdragsfrihed betaler du kun renter - ikke afdrag på selve lånet. Det giver lavere ydelse, men du skylder stadig det samme. Afdragsfrihed kan typisk bevilges i op til 10 år ad gangen.",
  },
  {
    question: "Hvor lang løbetid skal jeg vælge?",
    answer:
      "De fleste vælger 30 år. Kortere løbetid betyder højere ydelse, men du betaler mindre i renter totalt. Med 20 år i stedet for 30 kan du spare 20-30% på de samlede renteomkostninger.",
  },
  {
    question: "Hvad koster det at købe bolig udover lånet?",
    answer:
      "Udover selve boliglånet skal du betale tinglysningsafgift (ca. 1,45% + 1.850 kr), kursskæring på realkreditlån, advokat/mægler, og evt. stiftelsesomkostninger. Regn med ca. 3-5% af købesummen i omkostninger.",
  },
  {
    question: "Skal jeg vælge realkredit eller banklån?",
    answer:
      "Realkreditlån har normalt lavere rente og er at foretrække. Banklån bruges typisk kun til de 15% over realkreditgrænsen (80%) og op til udbetalingen (95%). Banklån har højere rente men er mere fleksible.",
  },
];

export const metadata: Metadata = {
  title: "Boliglånsberegner - Beregn din månedlige ydelse | Beregner.dk",
  description:
    "Beregn dit boliglån 2026. Eksempel: 2 mio. kr lån med 4% rente = ca. 10.500 kr/md. Se månedlig ydelse, skattefradrag (25,6%) og sammenlign fast vs. variabel rente.",
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
      <FAQSchema items={faqItems} />
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

      <FAQ items={faqItems} />

      <RelatedCalculators current="/boliglaan" />
    </div>
  );
}
