import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Biløkonomi 2026: Hvad koster det at eje bil? | MinBeregner.dk",
    description:
      "Komplet guide til biløkonomi i 2026: Registreringsafgift, grøn ejerafgift, forsikring, brændstof, værditab og finansiering. Få det fulde overblik over, hvad din bil koster om året.",
    keywords: [
      "biløkonomi",
      "hvad koster det at eje bil",
      "ejeromkostninger bil",
      "registreringsafgift 2026",
      "grøn ejerafgift 2026",
      "bil budget",
      "bilomkostninger",
      "billån 2026",
    ],
    openGraph: {
      title: "Biløkonomi 2026: Hvad koster det at eje bil?",
      description: "Komplet guide til biløkonomi: Afgifter, brændstof, forsikring, værditab og finansiering. Se de samlede ejeromkostninger.",
      url: `${baseUrl}/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad koster det at eje bil i Danmark om måneden?",
    answer: "En gennemsnitlig dansk bil koster 4.000-7.000 kr om måneden alt inklusive. For en ny bil i mellemklassen kan det være 6.000-10.000 kr/måned, mens en lille brugt bil kan holdes til 2.500-4.000 kr/måned. Den præcise pris afhænger af bilens værdi, kørselsbehov, finansiering og dit forsikringsselskab.",
  },
  {
    question: "Hvor meget koster registreringsafgiften i 2026?",
    answer: "Registreringsafgiften er progressiv: 0% af de første ca. 71.500 kr, ca. 20% af værdien fra 71.500-221.200 kr, og ca. 150% af værdien over 221.200 kr. Elbiler betaler en reduceret afgift, der gradvist stiger mod 100% i 2030. Benzindrevne biler med høj km/l kan få nedslag.",
  },
  {
    question: "Hvad er den grønne ejerafgift i 2026?",
    answer: "Den grønne ejerafgift (vægtafgift) afhænger af bilens brændstoftype og km/l. For en gennemsnitlig benzinbil er den 2.000-5.000 kr/år. Dieselbiler betaler typisk 4.000-7.000 kr/år inkl. NOx-tillæg. Elbiler betaler i 2026 en reduceret afgift på ca. 400-1.500 kr/år, hvilket er langt mindre end benzin- og dieselbiler.",
  },
  {
    question: "Hvad koster en elbil vs. benzinbil om året?",
    answer: "En elbil er typisk 5.000-12.000 kr billigere om året i drift end en tilsvarende benzinbil. Besparelsen kommer primært fra lavere brændstofpris (el vs. benzin) og lavere grøn ejerafgift. Til gengæld er elbiler ofte dyrere at købe, så tilbagebetalingstiden er typisk 3-6 år afhængigt af kørselsbehov.",
  },
  {
    question: "Er billån eller leasing billigst?",
    answer: "Billån er typisk billigst hvis du kører over 15.000 km/år og beholder bilen i flere år. Privatleasing har en lavere månedlig ydelse (ingen udbetaling) og inkluderer service/garanti, men du ejer ikke bilen og har typisk et km-begrænsning. Leasing er oftest bedst hvis du skifter bil ofte og kører under 15.000 km/år.",
  },
];

export default function BiloekonomiPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      {/* Breadcrumb */}
      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">Biløkonomi 2026</span>
      </nav>

      {/* Article header */}
      <article className="prose prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 font-medium">Transport & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Biløkonomi 2026: Hvad koster det at eje bil?
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>23. august 2026</span>
            <span>•</span>
            <span>10 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          En bil er for de fleste den næststørste udgift efter boligen. Men hvad koster en bil egentlig, når du lægger alle omkostninger sammen — afgifter, brændstof, forsikring, service, værditab og finansiering? I denne guide får du det komplette overblik over biløkonomi i 2026.
        </p>

        <h2>De samlede ejeromkostninger for en bil</h2>
        <p>
          Før du køber bil, er det vigtigt at kende de <strong>samlede månedlige omkostninger</strong> — ikke bare brændstof og forsikring. Her er de store poster:
        </p>

        <table>
          <thead>
            <tr>
              <th>Omkostning</th>
              <th>Ca. årligt (lille brugt bil)</th>
              <th>Ca. årligt (mellemklasse, ny)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Værditab (afskrivning)</td>
              <td>3.000-8.000 kr</td>
              <td>25.000-60.000 kr</td>
            </tr>
            <tr>
              <td>Brændstof/el (15.000 km/år)</td>
              <td>12.000-18.000 kr</td>
              <td>14.000-22.000 kr</td>
            </tr>
            <tr>
              <td>Forsikring (ansvar + kasko)</td>
              <td>4.000-6.000 kr</td>
              <td>7.000-12.000 kr</td>
            </tr>
            <tr>
              <td>Grøn ejerafgift</td>
              <td>1.500-3.500 kr</td>
              <td>2.500-5.500 kr</td>
            </tr>
            <tr>
              <td>Service og reparationer</td>
              <td>3.000-6.000 kr</td>
              <td>5.000-10.000 kr</td>
            </tr>
            <tr>
              <td>Dæk (inkl. skift/opbevaring)</td>
              <td>2.000-3.000 kr</td>
              <td>3.000-5.000 kr</td>
            </tr>
            <tr>
              <td><strong>I alt pr. år</strong></td>
              <td><strong>25.500-44.500 kr</strong></td>
              <td><strong>56.500-114.500 kr</strong></td>
            </tr>
            <tr>
              <td><strong>I alt pr. måned</strong></td>
              <td><strong>2.125-3.708 kr</strong></td>
              <td><strong>4.708-9.542 kr</strong></td>
            </tr>
          </tbody>
        </table>

        <p>
          Tallene er vejledende og afhænger af bilmodel, alder, kørselsmønster, bopæl og dit forsikringsselskab. Brug vores <Link href="/bil" className="text-blue-600 hover:underline">bilberegner</Link> til at få et præcist estimat for netop din situation.
        </p>

        <div className="not-prose my-8">
          <Link
            href="/bil"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til bilberegneren →
          </Link>
        </div>

        <h2>Registreringsafgift — den store engangsudgift</h2>
        <p>
          Når du køber en ny bil i Danmark, skal du betale registreringsafgift. Den er progressiv, hvilket betyder at jo dyrere bilen er, jo højere er afgiftsprocenten. I 2026 er satserne <strong>(vejledende, baseret på gældende lovgivning)</strong>:
        </p>
        <ul>
          <li><strong>0%</strong> af de første ca. 71.500 kr af bilens værdi (bundfradrag)</li>
          <li><strong>Ca. 20%</strong> af værdien fra ca. 71.500 kr til ca. 221.200 kr</li>
          <li><strong>Ca. 150%</strong> af værdien over ca. 221.200 kr</li>
        </ul>
        <p>
          Det betyder, at en bil til 300.000 kr har en registreringsafgift på cirka 140.000-170.000 kr afhængigt af brændstoftype og energieffektivitet. Elbiler og brændstoføkonomiske biler har gunstigere afgiftsberegning.
        </p>
        <p>
          <em>Kilde: skat.dk — registreringsafgift (satser kan ændre sig ved finanslov).</em>
        </p>

        <h2>Grøn ejerafgift — den løbende afgift</h2>
        <p>
          Den grønne ejerafgift (tidligere kaldt vægtafgift) betales hvert år og afhænger af bilens brændstoftype og km/l. Den opkræves halvårligt af SKAT. Cirka satser i 2026:
        </p>
        <ul>
          <li><strong>Benzinbil</strong> (14-20 km/l): 2.000-5.000 kr/år</li>
          <li><strong>Dieselbil</strong> (16-22 km/l): 4.000-7.000 kr/år (inkl. NOx-tillæg)</li>
          <li><strong>Elbil</strong>: ca. 400-1.500 kr/år (reduceret afgift, stiger gradvist)</li>
          <li><strong>Plug-in hybrid</strong>: 1.000-4.000 kr/år</li>
        </ul>
        <p>
          Elbiler har en markant fordel på den grønne ejerafgift. Til gengæld indfases en særlig vægtafgift for elbiler frem mod 2030. Vil du sammenligne elbil med benzinbil? Brug vores <Link href="/elbil" className="text-blue-600 hover:underline">elbil vs. benzinbil-beregner</Link>.
        </p>

        <h2>Brændstof og strøm — hvad kører bilen på?</h2>
        <p>
          Brændstof er den største løbende udgift for de fleste bilejere. Priserne i 2026 ligger cirka på:
        </p>
        <ul>
          <li><strong>Benzin</strong>: ca. 14-15 kr/liter</li>
          <li><strong>Diesel</strong>: ca. 13-14 kr/liter</li>
          <li><strong>El (hjemmeladning)</strong>: ca. 2-3 kr/kWh</li>
          <li><strong>El (offentlig lynlader)</strong>: ca. 4-6 kr/kWh</li>
        </ul>
        <p>
          Kører du 15.000 km om året i en benzinbil der går 16 km/l, bruger du ca. 938 liter til ca. 13.500 kr. En elbil der bruger 18 kWh/100 km, koster ca. 5.400 kr i strøm ved hjemmeladning — en besparelse på over 8.000 kr/år.
        </p>
        <p>
          Brug vores <Link href="/braendstof" className="text-blue-600 hover:underline">brændstofberegner</Link> til at se, hvad dit kørselsbehov koster, eller <Link href="/elbil" className="text-blue-600 hover:underline">sammenlign elbil med benzinbil</Link>.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <p className="font-medium text-yellow-800">Spar på brændstoffet</p>
          <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
            Se vores guide med <Link href="/blog/spar-penge-paa-braendstof" className="text-blue-600 hover:underline">10 tips til at spare på brændstoffet</Link> og få vores beregner til at finde de billigste brændstoftyper.
          </p>
        </div>

        <h2>Forsikring — beskyt dig selv og bilen</h2>
        <p>
          Bilforsikring er obligatorisk i Danmark (ansvarsforsikring), men de fleste vælger også kasko. Prisen afhænger af:
        </p>
        <ul>
          <li><strong>Bilens værdi og model</strong> — dyrere biler koster mere at forsikre</li>
          <li><strong>Din alder og erfaring</strong> — unge under 25 betaler typisk mere</li>
          <li><strong>Bopæl</strong> — bilforsikring er dyrere i store byer end på landet</li>
          <li><strong>Selvrisiko</strong> — højere selvrisiko giver lavere præmie</li>
          <li><strong>Kørselsbehov</strong> — flere km = flere risiko</li>
        </ul>
        <p>
          For en typisk dansk familie i en mellemklassebil koster en kombineret ansvar + kasko-forsikring ca. 6.000-10.000 kr om året i 2026. Indhent altid flere tilbud, da priserne varierer meget mellem selskaberne.
        </p>

        <h2>Værditab — den skjulte store omkostning</h2>
        <p>
          Værditab (afskrivning) er ofte den <strong>største enkeltomkostning</strong> — især på nye biler. En ny bil mister typisk:
        </p>
        <ul>
          <li><strong>År 1:</strong> 20-25% af værdien</li>
          <li><strong>År 2-3:</strong> 15-20% pr. år</li>
          <li><strong>År 4-5:</strong> 10-15% pr. år</li>
          <li><strong>Efter 5+ år:</strong> 8-12% pr. år</li>
        </ul>
        <p>
          Køber du en ny bil til 350.000 kr, har den tabt omkring 175.000-200.000 kr i værdi efter 5 år — svarende til 2.900-3.300 kr om måneden alene i værditab. Køber du i stedet en 3-4 år gammel brugt bil, er det største værditab allerede taget, og dine faste omkostninger falder markant.
        </p>

        <h2>Finansiering — billån eller leasing?</h2>
        <p>
          De færreste betaler en bil kontant. De typiske finansieringsformer i 2026:
        </p>
        <h3>Billån (køb med pant i bilen)</h3>
        <p>
          Renterne på billån ligger i 2026 på ca. 5-8% afhængigt af bank og din økonomi. Løbetiden er typisk 3-7 år, og du betaler ofte en udbetaling på 10-20%. Lån en bil til 250.000 kr over 6 år til 6%: ca. 4.100 kr/måned (total 297.000 kr).
        </p>
        <p>
          Brug vores <Link href="/billaan" className="text-blue-600 hover:underline">billånsberegner</Link> eller <Link href="/laaneberegner" className="text-blue-600 hover:underline">låneberegner</Link> til at regne på finansieringen.
        </p>
        <h3>Privatleasing</h3>
        <p>
          Privatleasing er blevet populært i Danmark. Du betaler en fast månedlig ydelse (typisk 2.500-5.000 kr/måned for en mindre bil) og slipper for bekymringer om værditab og større reparationer. Ulempen: du ejer ikke bilen, har et km-loft og betaler en strafafgift ved overkørsel.
        </p>
        <p>
          Leasing kan være en fordel hvis du skifter bil ofte, kører under 15.000 km/år og vil have faste forudsigelige omkostninger. Brug vores <Link href="/leasing" className="text-blue-600 hover:underline">leasingberegner</Link> til at sammenligne.
        </p>

        <div className="not-prose my-8">
          <Link
            href="/billaan"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Beregn dit billån →
          </Link>
        </div>

        <h2>Service, dæk og uforudsete udgifter</h2>
        <p>
          En bil koster mere end bare afgifter og brændstof. Regn med:
        </p>
        <ul>
          <li><strong>Serviceeftersyn:</strong> 1.500-4.000 kr/år (typisk hvert 15.000-30.000 km)</li>
          <li><strong>Dæk:</strong> 2.000-4.000 kr pr. sæt + 500-1.000 kr/år til skift og opbevaring</li>
          <li><strong>Bremser, kobling, udstødning:</strong> 0-10.000 kr/år afhængigt af alder</li>
          <li><strong>Syn:</strong> biler over 4 år skal til syn hvert 2. år (ca. 600 kr)</li>
        </ul>
        <p>
          For en ældre bil kan uforudsete reparationer løbe op. Sæt 1.500-3.000 kr/år til side til uforudsete udgifter. Har du styr på dit budget? Brug vores <Link href="/budget" className="text-blue-600 hover:underline">budgetberegner</Link> til at få overblikket.
        </p>

        <h2>Eksempel: 3 biltyper sammenlignet</h2>
        <p>
          Her er tre scenarier for en familie der kører 15.000 km/år (2026-estimater):
        </p>
        <table>
          <thead>
            <tr>
              <th>Omkostning pr. måned</th>
              <th>Lille brugt benzinbil (80.000 kr)</th>
              <th>Mellemklasse elbil (350.000 kr)</th>
              <th>Mellemklasse benzinbil (350.000 kr)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Finansiering/afskrivning</td>
              <td>1.000 kr</td>
              <td>4.500 kr</td>
              <td>4.500 kr</td>
            </tr>
            <tr>
              <td>Brændstof/strøm</td>
              <td>1.125 kr</td>
              <td>450 kr</td>
              <td>1.125 kr</td>
            </tr>
            <tr>
              <td>Forsikring</td>
              <td>400 kr</td>
              <td>750 kr</td>
              <td>700 kr</td>
            </tr>
            <tr>
              <td>Grøn ejerafgift</td>
              <td>200 kr</td>
              <td>80 kr</td>
              <td>300 kr</td>
            </tr>
            <tr>
              <td>Service og dæk</td>
              <td>400 kr</td>
              <td>350 kr</td>
              <td>500 kr</td>
            </tr>
            <tr>
              <td><strong>I alt pr. måned</strong></td>
              <td><strong>3.125 kr</strong></td>
              <td><strong>6.130 kr</strong></td>
              <td><strong>7.125 kr</strong></td>
            </tr>
          </tbody>
        </table>
        <p>
          Elbilen er ca. 1.000 kr billigere om måneden end en tilsvarende benzinbil. Den lille brugte bil er markant billigere — men til gengæld ældre, mindre og typisk mindre sikker.
        </p>

        <h2>Sådan får du det samlede overblik</h2>
        <p>
          Vil du regne præcist på dine egne bilomkostninger? Vores beregnere giver dig et detaljeret overblik:
        </p>
        <ul>
          <li><Link href="/bil" className="text-blue-600 hover:underline">Bilberegner</Link> — samlede ejeromkostninger for alle biltyper</li>
          <li><Link href="/braendstof" className="text-blue-600 hover:underline">Brændstofberegner</Link> — hvad koster din kørsel?</li>
          <li><Link href="/elbil" className="text-blue-600 hover:underline">Elbil vs. benzinbil</Link> — sammenligning af driftsomkostninger</li>
          <li><Link href="/billaan" className="text-blue-600 hover:underline">Billånsberegner</Link> — finansiering af bilkøb</li>
          <li><Link href="/leasing" className="text-blue-600 hover:underline">Leasingberegner</Link> — leasing vs. køb</li>
          <li><Link href="/budget" className="text-blue-600 hover:underline">Budgetberegner</Link> — rådighedsbeløb og samlet økonomi</li>
          <li><Link href="/loen-efter-skat" className="text-blue-600 hover:underline">Løn efter skat</Link> — se hvad du har til bilen</li>
        </ul>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      {/* Related links */}
      <div className="mt-12 pt-8 border-t">
        <h2 className="text-xl font-bold mb-4">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link
            href="/blog/spar-penge-paa-braendstof"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Spar penge på brændstof →</span>
          </Link>
          <Link
            href="/blog/elpriser-2026-beregn-dit-forbrug"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Elpriser 2026: Beregn dit forbrug →</span>
          </Link>
          <Link
            href="/blog/boliglaan-2026-renter-og-afdrag"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium">Boliglån 2026: Renter og afdrag →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}