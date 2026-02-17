import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Elpriser 2026: Sådan beregner du dit elforbrug | MinBeregner.dk",
  description:
    "Guide til elpriser i 2026: Hvad koster strøm, hvordan læser du din elregning, og hvordan sparer du penge? Se gennemsnitligt forbrug og beregn dine udgifter.",
  keywords: [
    "elpriser 2026",
    "strømpris 2026",
    "elforbrug beregner",
    "hvad koster strøm",
    "elregning forstå",
    "spare på strøm",
    "gennemsnitligt elforbrug",
    "kWh pris 2026",
  ],
  openGraph: {
    title: "Elpriser 2026: Sådan beregner du dit elforbrug",
    description: "Alt om elpriser i 2026 — priser, forbrug og sparetips.",
    url: `${baseUrl}/blog/elpriser-2026-beregn-dit-forbrug`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/elpriser-2026-beregn-dit-forbrug`,
  },
};

const faqItems = [
  {
    question: "Hvad koster 1 kWh strøm i 2026?",
    answer:
      "Den samlede pris for 1 kWh strøm i 2026 er ca. 2,50-4,00 kr inkl. alle afgifter, nettarif og moms. Den rene spotpris svinger time for time.",
  },
  {
    question: "Hvad er det gennemsnitlige elforbrug for en husstand?",
    answer:
      "En gennemsnitlig dansk husstand bruger ca. 3.500-4.000 kWh/år. En lejlighed bruger typisk 2.000-2.500 kWh, mens et parcelhus bruger 4.000-6.000 kWh.",
  },
  {
    question: "Hvordan sparer man mest på strøm?",
    answer:
      "De største besparelser ligger i varmepumpe fremfor elvarme, LED-pærer, A+++-hvidevarer, og at flytte forbrug til timer med lav spotpris (typisk nat og weekend).",
  },
];

export default function ElpriserGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Elpriser 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Energi & Forbrug</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Elpriser 2026: Sådan beregner du dit elforbrug
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>7 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Elregningen er en af de store faste udgifter for danske husstande. Men hvad betaler
          du egentlig for strøm, og hvordan kan du reducere dit forbrug? I denne guide
          gennemgår vi elpriser i 2026 og giver konkrete sparetips.
        </p>

        <h2>Hvad koster strøm i 2026?</h2>
        <p>
          Prisen på strøm i Danmark består af flere dele:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Komponent</th>
                <th>Ca. pris (2026)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Spotpris (elpris)</td>
                <td>0,50-1,50 kr/kWh (varierer)</td>
              </tr>
              <tr>
                <td>Nettarif (transport)</td>
                <td>0,30-0,80 kr/kWh</td>
              </tr>
              <tr>
                <td>Elafgift</td>
                <td>0,76 kr/kWh</td>
              </tr>
              <tr>
                <td>Moms (25%)</td>
                <td>Ca. 0,40-0,75 kr/kWh</td>
              </tr>
              <tr>
                <td><strong>Samlet pris</strong></td>
                <td><strong>2,50-4,00 kr/kWh</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Gennemsnitligt elforbrug i Danmark</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Boligtype</th>
                <th>Typisk forbrug (kWh/år)</th>
                <th>Ca. årlig pris</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lejlighed (1-2 pers.)</td>
                <td>2.000-2.500</td>
                <td>6.000-8.000 kr</td>
              </tr>
              <tr>
                <td>Rækkehus (2-3 pers.)</td>
                <td>3.000-4.000</td>
                <td>9.000-12.000 kr</td>
              </tr>
              <tr>
                <td>Parcelhus (3-4 pers.)</td>
                <td>4.000-6.000</td>
                <td>12.000-18.000 kr</td>
              </tr>
              <tr>
                <td>Parcelhus m/varmepumpe</td>
                <td>6.000-10.000</td>
                <td>18.000-30.000 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Forstå din elregning</h2>
        <p>
          Din elregning indeholder flere poster, som kan virke forvirrende. Her er de vigtigste:
        </p>
        <ul>
          <li><strong>Spotpris:</strong> Den rene markedspris for strøm, varierer time for time</li>
          <li><strong>Elhandelsabonnement:</strong> Fast månedligt gebyr til din elhandler (0-50 kr/md)</li>
          <li><strong>Nettarif:</strong> Betaling for transport af strøm via elnettet</li>
          <li><strong>Elafgift:</strong> Statslig afgift per kWh</li>
          <li><strong>Moms:</strong> 25% af alle ovenstående poster</li>
        </ul>

        <h2>Hvad bruger mest strøm?</h2>
        <p>
          De største strømsyndere i en typisk husstand:
        </p>
        <ol>
          <li><strong>Opvarmning (varmepumpe):</strong> 3.000-6.000 kWh/år</li>
          <li><strong>Varmtvandsbeholder:</strong> 1.500-2.500 kWh/år</li>
          <li><strong>Tørretumbler:</strong> 300-600 kWh/år</li>
          <li><strong>Vaskemaskine:</strong> 200-400 kWh/år</li>
          <li><strong>Opvaskemaskine:</strong> 200-350 kWh/år</li>
          <li><strong>Køleskab/fryser:</strong> 200-400 kWh/år</li>
          <li><strong>Belysning:</strong> 200-500 kWh/år</li>
          <li><strong>Elektronik (TV, PC):</strong> 200-500 kWh/år</li>
        </ol>

        <h2>10 tips til at spare på strømmen</h2>
        <ol>
          <li><strong>Skift til LED:</strong> Sparer 80% strøm sammenlignet med glødelamper</li>
          <li><strong>Brug timeren:</strong> Kør vaskemaskine og opvaskemaskine om natten, når strømmen er billigst</li>
          <li><strong>Tørrestativ:</strong> Erstat tørretumbleren med et tørrestativ (sparer 300-600 kWh/år)</li>
          <li><strong>Sluk standby:</strong> Brug stikdåser med kontakt til elektronik</li>
          <li><strong>Sænk temperaturen:</strong> 1 grad lavere rumtemperatur = 5% besparelse på opvarmning</li>
          <li><strong>Kort bruser:</strong> Reducer badetiden med 2 minutter</li>
          <li><strong>A+++-hvidevarer:</strong> Ved udskiftning, vælg mest energieffektive</li>
          <li><strong>Tjek spotpriser:</strong> Flyt forbruget til timer med lav pris</li>
          <li><strong>Isoler boligen:</strong> Bedre isolering reducerer varmebehov markant</li>
          <li><strong>Overvej solceller:</strong> Producér selv billig strøm</li>
        </ol>

        <h2>Spotpriser: Tænk smart</h2>
        <p>
          Med variabel elpris kan du spare penge ved at flytte dit strømforbrug til billige timer.
          Typisk er strømmen billigst:
        </p>
        <ul>
          <li>Om natten (kl. 00-06)</li>
          <li>Midt på dagen (kl. 10-15, især ved solskin)</li>
          <li>I weekenden</li>
        </ul>
        <p>
          Strømmen er dyrest i morgen- og aftenspidserne (kl. 06-09 og 17-20).
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dit elforbrug</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/elberegner" className="underline font-medium">elberegner</Link> til at
            se hvad dine apparater koster i strøm. Se også{" "}
            <Link href="/braendstof" className="underline font-medium">brændstofberegneren</Link> for transportomkostninger og{" "}
            <Link href="/husleje" className="underline font-medium">huslejeberegneren</Link> for dit samlede boligbudget.
          </p>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/spar-penge-paa-braendstof" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Spar penge på brændstof →</span>
          </Link>
          <Link href="/blog/30-procent-reglen-husleje" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">30% reglen: Hvor meget bør du bruge på husleje? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
