import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "BMI for Børn - Sådan Tjekker Du (Komplet Guide 2026) | MinBeregner.dk",
    description:
      "BMI for børn beregnes anderledes end voksne. Lær om percentiler, ISO BMI, og hvordan du tjekker dit barns vægt sundt. Inkluderer aldersbaserede tabeller og eksempler.",
    keywords: [
      "bmi børn",
      "bmi for børn",
      "bmi beregner børn",
      "børn overvægt",
      "børn undervægt",
      "iso bmi",
      "bmi percentil",
      "barnets vægt",
      "sund vægt børn",
      "vækstkurve",
    ],
    openGraph: {
      title: "BMI for Børn - Sådan Tjekker Du (Komplet Guide)",
      description: "BMI for børn beregnes med percentiler, ikke faste grænser. Se hvordan du tjekker dit barns vægt korrekt.",
      url: `${baseUrl}/blog/bmi-for-boern-saadan-tjekker-du`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/bmi-for-boern-saadan-tjekker-du`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad er en normal BMI for børn?",
    answer: "For børn bruges percentiler i stedet for faste BMI-grænser. En 'normal' vægt ligger typisk mellem 5. og 85. percentil for barnets alder og køn. Over 85. percentil indikerer overvægt, og over 95. percentil indikerer fedme. Sundhedsplejersken bruger vækstkurver til at følge dit barns udvikling.",
  },
  {
    question: "Kan jeg bruge en almindelig BMI beregner til mit barn?",
    answer: "Den almindelige BMI-beregning (vægt/højde²) giver et tal, men du kan ikke bruge voksen-grænserne (18,5-24,9) til børn. Børns BMI skal sammenlignes med percentilkurver for deres alder og køn. Et BMI på 18 kan være helt normalt for et barn, men undervægt for en voksen.",
  },
  {
    question: "Hvad er ISO BMI?",
    answer: "ISO BMI (også kaldet 'BMI-for-age') er en metode, der omsætter et barns BMI til hvad det ville svare til som voksen. Fx kan et barn med ISO BMI 25 forventes at have BMI omkring 25 som voksen, hvis de følger samme vækstmønster. Det gør det lettere at sammenligne på tværs af aldre.",
  },
  {
    question: "Hvornår skal jeg være bekymret for mit barns vægt?",
    answer: "Vær opmærksom hvis dit barn ligger vedvarende over 85. percentil eller under 5. percentil, eller hvis kurven ændrer sig markant (fx springer fra 50. til 85. percentil på kort tid). Snak altid med lægen eller sundhedsplejersken - de kender dit barns historik og kan vurdere helhedsbilledet.",
  },
  {
    question: "Hvordan måler jeg mit barns BMI korrekt?",
    answer: "Vej barnet om morgenen, efter toiletbesøg, i let tøj. Mål højden uden sko, med barnet stående lige op med hælene mod væggen. Beregn BMI (vægt i kg / højde i meter²) og sammenlign med percentilkurver for barnets præcise alder og køn.",
  },
  {
    question: "Passer BMI til alle børn?",
    answer: "BMI er et screeningsværktøj, ikke en diagnose. Meget aktive børn eller børn der dyrker sport kan have mere muskelmasse og dermed højere BMI uden at være overvægtige. Børn i puberteten ændrer sig hurtigt. Sundhedsplejersken ser på hele billedet, inkl. hvordan barnet trives og bevæger sig.",
  },
];

export default function BMIBoernGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">BMI for børn</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Sundhed & Børn</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
            BMI for Børn - Sådan Tjekker Du
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>13. februar 2026</span>
            <span>•</span>
            <span>9 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          At tjekke et barns BMI er ikke så enkelt som for voksne. Børn vokser, og deres 
          kropssammensætning ændrer sig konstant. Derfor kan du ikke bare bruge de 
          almindelige BMI-grænser. I denne guide forklarer vi, hvordan BMI for børn 
          faktisk fungerer - og hvordan du tolker det korrekt.
        </p>

        <h2>Hvorfor er BMI for børn anderledes?</h2>
        <p>
          Når vi beregner BMI for voksne, bruger vi faste grænser: under 18,5 er undervægt, 
          18,5-24,9 er normalvægt, og over 25 er overvægt. Men disse tal giver ikke mening 
          for børn.
        </p>
        <p>
          Årsagen er simpel: <strong>børns kropssammensætning ændrer sig med alderen</strong>. 
          En 5-årig har naturligt en anden fedtfordeling end en 12-årig, og teenagere i 
          puberteten ændrer sig markant fra år til år.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg not-prose my-6">
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Eksempel: Samme BMI, forskellig betydning</h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>👧 <strong>8-årig pige med BMI 17:</strong> Helt normalt (50. percentil)</li>
            <li>👩 <strong>30-årig kvinde med BMI 17:</strong> Undervægtig (under 18,5)</li>
          </ul>
        </div>

        <h2>Percentiler: Sådan tolkes børns BMI</h2>
        <p>
          I stedet for faste grænser bruger vi <strong>percentiler</strong>. En percentil 
          fortæller dig, hvor dit barn ligger sammenlignet med andre børn af samme alder og køn.
        </p>

        <h3>Hvad betyder percentilerne?</h3>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Percentil</th>
                <th className="text-left py-2">Betydning</th>
                <th className="text-left py-2">Kategori</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">Under 5.</td>
                <td>Lavere end 95% af jævnaldrende</td>
                <td className="text-yellow-600 dark:text-yellow-400">Undervægt</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">5. - 85.</td>
                <td>Inden for normalområdet</td>
                <td className="text-green-600 dark:text-green-400">Normal vægt</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">85. - 95.</td>
                <td>Højere end 85% af jævnaldrende</td>
                <td className="text-orange-600 dark:text-orange-400">Overvægt</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 font-medium">Over 95.</td>
                <td>Højere end 95% af jævnaldrende</td>
                <td className="text-red-600 dark:text-red-400">Fedme</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Percentilerne er baseret på store undersøgelser af børns vækst - primært 
          WHO&apos;s vækstkurver, som også bruges af danske sundhedsplejersker.
        </p>

        <h2>Sådan beregner du dit barns BMI</h2>
        <p>
          Selve BMI-beregningen er den samme som for voksne:
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg not-prose my-6 text-center">
          <p className="text-lg font-mono text-gray-900 dark:text-white">
            BMI = vægt (kg) ÷ højde (m)²
          </p>
        </div>

        <h3>Step-by-step: Tjek dit barns BMI</h3>
        <ol>
          <li>
            <strong>Vej barnet korrekt:</strong> Om morgenen, efter toiletbesøg, i let 
            tøj (eller uden tøj for små børn)
          </li>
          <li>
            <strong>Mål højden:</strong> Uden sko, stående lige op mod en væg med hælene 
            mod væggen og blikket lige frem
          </li>
          <li>
            <strong>Beregn BMI:</strong> Brug vores <Link href="/bmi">BMI-beregner</Link> eller 
            regn selv: fx 25 kg ÷ 1,20² = BMI 17,4
          </li>
          <li>
            <strong>Find percentilen:</strong> Slå op i vækstkurverne for barnets alder og 
            køn (se tabeller nedenfor)
          </li>
        </ol>

        <h2>BMI-percentiler efter alder</h2>
        <p>
          Her er typiske BMI-værdier for 50. percentil (gennemsnittet) for drenge og piger 
          i forskellige aldre:
        </p>

        <h3>Drenge</h3>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Alder</th>
                <th className="text-right py-2">5. percentil</th>
                <th className="text-right py-2">50. percentil</th>
                <th className="text-right py-2">85. percentil</th>
                <th className="text-right py-2">95. percentil</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">2 år</td>
                <td className="text-right">14,7</td>
                <td className="text-right">16,4</td>
                <td className="text-right">17,7</td>
                <td className="text-right">18,4</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">4 år</td>
                <td className="text-right">13,8</td>
                <td className="text-right">15,3</td>
                <td className="text-right">16,6</td>
                <td className="text-right">17,5</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">6 år</td>
                <td className="text-right">13,5</td>
                <td className="text-right">15,3</td>
                <td className="text-right">17,0</td>
                <td className="text-right">18,2</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">8 år</td>
                <td className="text-right">13,7</td>
                <td className="text-right">15,8</td>
                <td className="text-right">18,0</td>
                <td className="text-right">19,6</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">10 år</td>
                <td className="text-right">14,2</td>
                <td className="text-right">16,6</td>
                <td className="text-right">19,4</td>
                <td className="text-right">21,4</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">12 år</td>
                <td className="text-right">15,0</td>
                <td className="text-right">17,8</td>
                <td className="text-right">21,2</td>
                <td className="text-right">23,6</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">14 år</td>
                <td className="text-right">16,0</td>
                <td className="text-right">19,2</td>
                <td className="text-right">23,0</td>
                <td className="text-right">25,5</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">16 år</td>
                <td className="text-right">17,1</td>
                <td className="text-right">20,5</td>
                <td className="text-right">24,2</td>
                <td className="text-right">26,8</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Piger</h3>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Alder</th>
                <th className="text-right py-2">5. percentil</th>
                <th className="text-right py-2">50. percentil</th>
                <th className="text-right py-2">85. percentil</th>
                <th className="text-right py-2">95. percentil</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">2 år</td>
                <td className="text-right">14,4</td>
                <td className="text-right">16,0</td>
                <td className="text-right">17,3</td>
                <td className="text-right">18,0</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">4 år</td>
                <td className="text-right">13,5</td>
                <td className="text-right">15,0</td>
                <td className="text-right">16,3</td>
                <td className="text-right">17,2</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">6 år</td>
                <td className="text-right">13,1</td>
                <td className="text-right">15,0</td>
                <td className="text-right">16,8</td>
                <td className="text-right">18,0</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">8 år</td>
                <td className="text-right">13,3</td>
                <td className="text-right">15,6</td>
                <td className="text-right">18,0</td>
                <td className="text-right">19,7</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">10 år</td>
                <td className="text-right">13,9</td>
                <td className="text-right">16,6</td>
                <td className="text-right">19,7</td>
                <td className="text-right">21,8</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">12 år</td>
                <td className="text-right">14,8</td>
                <td className="text-right">18,0</td>
                <td className="text-right">21,5</td>
                <td className="text-right">24,0</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">14 år</td>
                <td className="text-right">15,8</td>
                <td className="text-right">19,4</td>
                <td className="text-right">23,3</td>
                <td className="text-right">26,0</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">16 år</td>
                <td className="text-right">16,6</td>
                <td className="text-right">20,4</td>
                <td className="text-right">24,5</td>
                <td className="text-right">27,2</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Kilde: Baseret på WHO vækstkurver og CDC referencedata
        </p>

        <h2>Hvad er ISO BMI?</h2>
        <p>
          <strong>ISO BMI</strong> (International Obesity Task Force standard) er en smart 
          måde at udtrykke et barns BMI på. I stedet for at sige &quot;dit barn er på 75. 
          percentil&quot;, omsætter ISO BMI tallet til, hvad det ville svare til som voksen.
        </p>

        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-gray-900 dark:text-white">💡 Eksempel på ISO BMI</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            En 10-årig dreng med BMI 19 har ISO BMI ≈ 25. Det betyder, at hvis han fortsætter 
            det samme vækstmønster, vil han sandsynligvis have BMI omkring 25 som voksen 
            (grænsen til overvægt).
          </p>
        </div>

        <p>
          ISO BMI gør det lettere for forældre at forstå, fordi vi kender de voksne BMI-grænser. 
          Mange læger og sundhedsplejersker bruger denne metode i deres kommunikation.
        </p>

        <h2>Hvornår skal du reagere?</h2>
        <p>
          BMI er et <strong>screeningsværktøj</strong>, ikke en diagnose. Men der er nogle 
          tegn, du bør være opmærksom på:
        </p>

        <h3>🚩 Vær opmærksom hvis:</h3>
        <ul>
          <li>Barnets BMI er <strong>vedvarende</strong> over 85. eller under 5. percentil</li>
          <li>Kurven <strong>ændrer sig markant</strong> - fx springer fra 50. til 85. percentil på kort tid</li>
          <li>Barnet har <strong>symptomer</strong> som træthed, manglende energi, eller undgår fysisk aktivitet</li>
          <li>Der er <strong>pludselige ændringer</strong> i spisevaner</li>
        </ul>

        <h3>✅ Husk også:</h3>
        <ul>
          <li>Børn vokser i &quot;spring&quot; - udsving er normale</li>
          <li>Puberteten medfører store ændringer i kort tid</li>
          <li>Aktive børn kan have højere BMI pga. muskelmasse</li>
          <li>En enkelt måling siger mindre end trenden over tid</li>
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-gray-900 dark:text-white">⚠️ Vigtigt at huske</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            Tal aldrig negativt om vægt foran barnet. Fokuser på sundhed, energi og trivsel 
            - ikke på tal eller udseende. Hvis du er bekymret, tal med lægen eller 
            sundhedsplejersken uden barnets tilstedeværelse først.
          </p>
        </div>

        <h2>Sunde vaner for børn</h2>
        <p>
          Uanset hvor dit barn ligger på kurven, handler det om at opbygge sunde vaner 
          for livet - ikke at tælle kalorier eller sætte børn på &quot;kur&quot;.
        </p>

        <h3>Bevægelse</h3>
        <ul>
          <li>Mindst 60 minutters fysisk aktivitet om dagen</li>
          <li>Varieret leg: løb, hop, klatre, cykle, svømme</li>
          <li>Begræns stillesiddende skærmtid</li>
          <li>Gør det sjovt - leg, sport, ture i naturen</li>
        </ul>

        <h3>Kost</h3>
        <ul>
          <li>Faste måltider med familien</li>
          <li>Frugt og grønt som snacks</li>
          <li>Vand som primær tørstedrik</li>
          <li>Undgå sukkerholdige drikkevarer og for meget slik</li>
        </ul>

        <h3>Søvn</h3>
        <ul>
          <li>Små børn (3-5 år): 10-13 timer</li>
          <li>Skolebørn (6-12 år): 9-12 timer</li>
          <li>Teenagere (13-18 år): 8-10 timer</li>
        </ul>

        <h2>Brug vores BMI-beregner</h2>
        <p>
          Start med at beregne dit barns aktuelle BMI. Derefter kan du sammenligne med 
          tabellerne ovenfor for at finde percentilen.
        </p>

        <div className="not-prose my-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/bmi"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Beregn BMI →
          </Link>
          <Link 
            href="/kalorier"
            className="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Kalorie-beregner →
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
            href="/bmi"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">BMI-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn Body Mass Index for voksne og børn</p>
          </Link>
          <Link 
            href="/kalorier"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Kalorie-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn dagligt kaloriebehov</p>
          </Link>
          <Link 
            href="/alder"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Aldersberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn præcis alder i år, måneder og dage</p>
          </Link>
          <Link 
            href="/boernepenge"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Børnepenge-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvor meget du får i børne- og ungeydelse</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link 
            href="/blog/saadan-beregner-du-din-reelle-timeloen"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Sådan beregner du din reelle timeløn →</span>
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
