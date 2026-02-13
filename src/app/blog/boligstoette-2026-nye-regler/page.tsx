import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Boligstøtte 2026 - Nye Regler og Satser | MinBeregner.dk",
  description:
    "Komplet guide til boligstøtte i 2026: Nye satser, ændrede regler, hvem kan få støtte og hvor meget. Se de opdaterede grænser og beregn din boligstøtte.",
  keywords: [
    "boligstøtte 2026",
    "boligstøtte nye regler",
    "boligstøtte satser 2026",
    "boligsikring 2026",
    "boligydelse 2026",
    "udbetaling danmark boligstøtte",
    "husleje tilskud 2026",
    "boligstøtte beregning",
    "boligstøtte indkomstgrænse",
  ],
  openGraph: {
    title: "Boligstøtte 2026 - Nye Regler og Satser",
    description: "Alt du skal vide om boligstøtte i 2026: satser, regler og hvad du kan få.",
    url: `${baseUrl}/blog/boligstoette-2026-nye-regler`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/boligstoette-2026-nye-regler`,
  },
};

const faqItems = [
  {
    question: "Hvad er de nye boligstøtte-satser i 2026?",
    answer: "I 2026 er satserne reguleret med ca. 3,5% på grund af inflationen. Det maksimale huslejeloft er steget til ca. 73.000 kr/år, og indkomstgrænserne er hævet tilsvarende. Minstebeløbet for udbetaling er fortsat ca. 300 kr/måned.",
  },
  {
    question: "Hvem kan få boligstøtte i 2026?",
    answer: "Du kan få boligstøtte hvis du er 18+ år, bor til leje i en helårsbolig, og har en husstandsindkomst under ca. 250.000-350.000 kr/år (afhængig af husstandens størrelse). Både enlige, par og familier med børn kan søge.",
  },
  {
    question: "Hvor meget kan jeg få i boligstøtte 2026?",
    answer: "Det afhænger af din husleje, indkomst og husstandens størrelse. Typisk 15-30% af huslejen. Ved husleje på 6.000 kr/md og indkomst på 18.000 kr/md kan du forvente 1.500-2.500 kr/md. Pensionister (boligydelse) kan få mere.",
  },
  {
    question: "Er der ændringer i formuegrænsen for boligstøtte 2026?",
    answer: "Ja, formuegrænserne er også reguleret. For enlige er fribeløbet ca. 850.000 kr, og for par ca. 1.700.000 kr. Formue derover reducerer støtten. Pensionsopsparinger i pensionsselskaber tæller ikke med.",
  },
  {
    question: "Hvordan påvirker husstandens størrelse boligstøtten?",
    answer: "Flere personer giver højere indkomstgrænse. Et ekstra barn betyder typisk at du kan tjene ca. 45.000 kr mere årligt og stadig få boligstøtte. Samtidig stiger arealkravet - 1-2 personer: max 65 m², 3+ personer: +20 m² per person.",
  },
  {
    question: "Hvad er forskellen på boligstøtte og boligydelse i 2026?",
    answer: "Boligstøtte er for almindelige lejere. Boligydelse er for folkepensionister og førtidspensionister og giver typisk 20-40% mere. Pensionister skal søge boligydelse i stedet for boligstøtte.",
  },
];

export default function Boligstoette2026Page() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">Boligstøtte 2026</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Bolig & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
            Boligstøtte 2026 - Nye Regler og Satser
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>13. februar 2026</span>
            <span>•</span>
            <span>9 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Boligstøtte hjælper tusindvis af danskere med at få huslejen til at hænge sammen. 
          I 2026 er satserne reguleret, og der er enkelte justeringer i reglerne. Her får 
          du det fulde overblik over hvad der gælder - og hvad du kan få.
        </p>

        <h2>Hvad er nyt i 2026?</h2>
        <p>
          De vigtigste ændringer i boligstøttereglerne for 2026 handler primært om 
          <strong> satsregulering</strong>. Alle beløbsgrænser er justeret med ca. 3,5% 
          for at følge med prisudviklingen.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg not-prose my-6">
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Nøgletal boligstøtte 2026</h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>📊 <strong>Satsregulering:</strong> +3,5% ift. 2025</li>
            <li>🏠 <strong>Max huslejeloft:</strong> Ca. 73.000 kr/år (6.083 kr/md)</li>
            <li>💰 <strong>Min. udbetaling:</strong> Ca. 300 kr/md</li>
            <li>🏦 <strong>Formuefribeløb (enlig):</strong> Ca. 850.000 kr</li>
            <li>👫 <strong>Formuefribeløb (par):</strong> Ca. 1.700.000 kr</li>
          </ul>
        </div>

        <h3>Satsregulering</h3>
        <p>
          Hvert år reguleres boligstøttesatserne efter den såkaldte satsreguleringsprocent. 
          I 2026 er reguleringen på ca. 3,5%, hvilket betyder at du kan få lidt mere i støtte 
          - og at indkomstgrænserne er hævet tilsvarende.
        </p>

        <h3>Huslejeloft</h3>
        <p>
          Der er et loft over, hvor meget husleje der indgår i beregningen. I 2026 er dette 
          loft ca. <strong>73.000 kr/år</strong> (godt 6.000 kr/md). Betaler du mere i husleje, 
          indgår kun beløbet op til loftet.
        </p>

        <h2>Hvem kan få boligstøtte?</h2>
        <p>
          For at få boligstøtte skal du opfylde disse grundlæggende krav:
        </p>

        <ul>
          <li><strong>Alder:</strong> Du skal være fyldt 18 år</li>
          <li><strong>Boligtype:</strong> Du skal bo til leje i en helårsbolig</li>
          <li><strong>Indkomst:</strong> Din husstandsindkomst skal være under visse grænser</li>
          <li><strong>Ophold:</strong> Du skal have lovligt ophold i Danmark</li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-gray-900 dark:text-white">💡 Tip: Boligydelse for pensionister</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Er du folkepensionist eller førtidspensionist? Så skal du søge <strong>boligydelse</strong> 
            i stedet for boligstøtte. Boligydelse giver typisk et højere beløb.
          </p>
        </div>

        <h2>Hvor meget kan du få i 2026?</h2>
        <p>
          Boligstøtten beregnes ud fra en formel der tager højde for din husleje, indkomst 
          og husstandens størrelse. Som tommelfingerregel kan du forvente at få dækket 
          <strong> 15-30% af huslejen</strong> - men det varierer meget.
        </p>

        <h3>Eksempel: Enlig med lav indkomst</h3>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg not-prose my-6">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Husleje</td>
                <td className="text-right">5.500 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Indkomst før skat</td>
                <td className="text-right">16.000 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Husstandsstørrelse</td>
                <td className="text-right">1 person</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Estimeret boligstøtte</td>
                <td className="text-right text-green-700 dark:text-green-400">ca. 2.100 kr/md</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Eksempel: Familie med børn</h3>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg not-prose my-6">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Husleje</td>
                <td className="text-right">8.000 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Samlet husstandsindkomst</td>
                <td className="text-right">32.000 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Husstandsstørrelse</td>
                <td className="text-right">2 voksne + 2 børn</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Estimeret boligstøtte</td>
                <td className="text-right text-green-700 dark:text-green-400">ca. 1.800 kr/md</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Vil du have et præcist estimat? Brug vores{" "}
          <Link href="/boligstoette">boligstøtte-beregner</Link> - den tager højde for 
          de aktuelle 2026-satser.
        </p>

        <h2>Indkomstgrænserne i 2026</h2>
        <p>
          Der er ingen fast indkomstgrænse - boligstøtten aftrappes gradvist når indkomsten 
          stiger. Men som udgangspunkt kan du forvente disse tommelfingerregler:
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Husstand</th>
                <th className="text-left py-2">Typisk indkomstgrænse</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">1 voksen, ingen børn</td>
                <td>Ca. 170.000 - 220.000 kr/år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">1 voksen + 1 barn</td>
                <td>Ca. 215.000 - 265.000 kr/år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">1 voksen + 2 børn</td>
                <td>Ca. 260.000 - 310.000 kr/år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">2 voksne, ingen børn</td>
                <td>Ca. 250.000 - 300.000 kr/år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">2 voksne + 2 børn</td>
                <td>Ca. 340.000 - 400.000 kr/år</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            *Grænserne er vejledende og afhænger af huslejen og andre faktorer.
          </p>
        </div>

        <h2>Arealkrav og boligstørrelse</h2>
        <p>
          Der er også krav til boligens størrelse i forhold til antal beboere. Bor du i 
          en bolig der er "for stor" til din husstand, kan støtten reduceres.
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Antal personer</th>
                <th className="text-left py-2">Max areal (uden reduktion)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">1-2 personer</td>
                <td>65 m²</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">3 personer</td>
                <td>85 m²</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">4 personer</td>
                <td>105 m²</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">5+ personer</td>
                <td>+20 m² per ekstra person</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Formue og boligstøtte</h2>
        <p>
          Din formue kan påvirke boligstøtten. Overstiger formuen fribeløbet, reduceres 
          støtten. I 2026 er fribeløbene:
        </p>

        <ul>
          <li><strong>Enlig:</strong> Ca. 850.000 kr</li>
          <li><strong>Par:</strong> Ca. 1.700.000 kr</li>
        </ul>

        <h3>Hvad tæller som formue?</h3>
        <ul>
          <li>Bankindestående og kontanter</li>
          <li>Aktier, obligationer, investeringsforeninger</li>
          <li>Ejendom (udover din lejebolig)</li>
          <li>Bil (over en vis værdi)</li>
        </ul>

        <h3>Hvad tæller IKKE med?</h3>
        <ul>
          <li>Pensionsopsparinger i pensionsselskaber</li>
          <li>Indestående i ratepension og livrente</li>
          <li>Aldersopsparing (den nye ordning)</li>
        </ul>

        <h2>Sådan søger du boligstøtte</h2>
        <p>
          Du søger boligstøtte digitalt på <a href="https://www.borger.dk" target="_blank" rel="noopener noreferrer">borger.dk</a> 
          med MitID. Processen er:
        </p>

        <ol>
          <li><strong>Log ind</strong> på borger.dk med MitID</li>
          <li><strong>Find ansøgningen</strong> under "Boligstøtte"</li>
          <li><strong>Udfyld oplysninger</strong> om bolig, indkomst og husstand</li>
          <li><strong>Send ansøgningen</strong> - du får svar inden for få uger</li>
        </ol>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Vigtigt:</strong> Du kan få boligstøtte fra ansøgningsdatoen - med op til 
            2 måneders tilbagevirkende kraft. Søg derfor så hurtigt som muligt!
          </p>
        </div>

        <h2>Udbetaling og efterregulering</h2>
        <p>
          Boligstøtte udbetales månedsvist <strong>forud</strong> - typisk omkring den 1. i måneden. 
          Pengene går direkte til din NemKonto.
        </p>

        <h3>Efterregulering</h3>
        <p>
          Efter hvert kalenderår sammenligner Udbetaling Danmark din faktiske indkomst med 
          den forventede indkomst der lå til grund for beregningen:
        </p>

        <ul>
          <li><strong>Tjent for lidt:</strong> Du får penge tilbage (efterbetaling)</li>
          <li><strong>Tjent for meget:</strong> Du skal betale penge tilbage (tilbagebetaling)</li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-gray-900 dark:text-white">💡 Undgå tilbagebetaling</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Giv besked til Udbetaling Danmark hvis din indkomst ændrer sig markant i løbet 
            af året. Så justeres støtten løbende, og du undgår store tilbagebetalingskrav.
          </p>
        </div>

        <h2>Boligstøtte vs. boligydelse</h2>
        <p>
          Der er to ordninger - og forskellen er vigtig:
        </p>

        <h3>Boligstøtte</h3>
        <p>
          For alle lejere under pensionsalderen. Beregnes efter husleje, indkomst og 
          husstandsstørrelse.
        </p>

        <h3>Boligydelse</h3>
        <p>
          Kun for folkepensionister og førtidspensionister. Giver typisk <strong>20-40% mere</strong> 
          end almindelig boligstøtte, fordi der er andre beregningsregler.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Eksempel:</strong> En folkepensionist med samme husleje og indkomst som 
            en ikke-pensionist kan typisk få 1.500-2.000 kr/md mere via boligydelse end via boligstøtte.
          </p>
        </div>

        <h2>Hvad påvirker beløbet?</h2>
        <p>
          Disse faktorer har størst indflydelse på din boligstøtte:
        </p>

        <ol>
          <li>
            <strong>Husleje:</strong> Højere husleje = højere støtte (op til loftet)
          </li>
          <li>
            <strong>Indkomst:</strong> Lavere indkomst = højere støtte
          </li>
          <li>
            <strong>Børn:</strong> Flere børn = højere indkomstgrænse
          </li>
          <li>
            <strong>Formue:</strong> Høj formue = lavere eller ingen støtte
          </li>
          <li>
            <strong>Boligstørrelse:</strong> For stor bolig kan reducere støtten
          </li>
        </ol>

        <h2>Beregn din boligstøtte</h2>
        <p>
          Vil du vide præcis hvad du kan få i 2026? Brug vores gratis beregner:
        </p>

        <div className="not-prose my-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/boligstoette"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Beregn boligstøtte →
          </Link>
          <Link 
            href="/husleje"
            className="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Husleje budget →
          </Link>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Link 
            href="/boligstoette"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Boligstøtte-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn din boligstøtte med 2026-satser</p>
          </Link>
          <Link 
            href="/husleje"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Husleje budget →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find ud af hvad du har råd til i husleje</p>
          </Link>
          <Link 
            href="/loen-efter-skat"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Løn efter skat →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvad du får udbetalt af din løn</p>
          </Link>
          <Link 
            href="/boernepenge"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Børnepenge →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn børne- og ungeydelse</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link 
            href="/blog/30-procent-reglen-husleje"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">30% reglen for husleje - hvad er realistisk? →</span>
          </Link>
          <Link 
            href="/blog/guide-feriepenge-hvornaar-og-hvor-meget"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Guide: Feriepenge - hvornår og hvor meget? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
