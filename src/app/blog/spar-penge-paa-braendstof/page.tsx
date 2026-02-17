import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Spar penge på brændstof: Tips til billigere kørsel | MinBeregner.dk",
  description:
    "Praktiske tips til at spare på benzin, diesel og el. Kør 10-20% billigere med køreteknik, ruteplanlægning og vedligeholdelse. Priser 2026.",
  keywords: [
    "spar brændstof",
    "billigere benzin",
    "brændstofbesparelse",
    "køreteknik",
    "spare benzin",
    "elbil opladning",
    "brændstof priser 2026",
    "km/l forbedring",
  ],
  openGraph: {
    title: "Spar penge på brændstof: Tips til billigere kørsel",
    description:
      "Praktiske tips til at reducere dit brændstofforbrug og spare penge på benzin, diesel eller el.",
    url: `${baseUrl}/blog/spar-penge-paa-braendstof`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/spar-penge-paa-braendstof`,
  },
};

const faqItems = [
  {
    question: "Hvor meget kan man spare med økonomisk kørsel?",
    answer:
      "Med bevidst køreteknik kan du typisk spare 10-20% på brændstof. Det svarer til 2.000-5.000 kr om året for en gennemsnitlig bilist der kører 15.000 km/år.",
  },
  {
    question: "Er det billigere at køre på el?",
    answer:
      "Ja, markant. Opladning hjemme koster ca. 2-3 kr/kWh, mens benzin koster 13-14 kr/liter. En elbil bruger ca. 15-20 kWh/100 km, mens en benzinbil bruger ca. 6-8 liter/100 km. Det giver en besparelse på 40-60%.",
  },
  {
    question: "Hvad koster benzin i 2026?",
    answer:
      "Benzin koster ca. 13-14 kr/liter i starten af 2026. Diesel ligger på ca. 12-13 kr/liter. Priserne svinger dog dagligt afhængigt af oliepris og afgifter.",
  },
];

export default function SparBraendstofGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Spar penge på brændstof</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Transport</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Spar penge på brændstof: Tips til billigere kørsel
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-07">7. februar 2026</time>
            <span>•</span>
            <span>5 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Med benzinpriser på over 13 kr/liter i 2026 er det værd at tænke over, hvordan du kan
          reducere dit brændstofforbrug. Med de rigtige vaner kan du spare 10-20% på brændstof —
          det er potentielt flere tusinde kroner om året.
        </p>

        <h2>1. Køreteknik: Den gratis besparelse</h2>
        <p>
          Din kørestil er den enkeltfaktor, der har størst indflydelse på forbruget. Her er de
          vigtigste teknikker:
        </p>

        <h3>Kør jævnt og forudseende</h3>
        <p>
          Hård acceleration og hård opbremsning er brændstofets værste fjender. Ved at kigge langt
          frem og tilpasse farten gradvist kan du undgå unødvendig acceleration og opbremsning. Slip
          speederen i god tid inden rødt lys eller et sving.
        </p>

        <h3>Hold den rigtige hastighed</h3>
        <p>
          Luftmodstanden stiger eksponentielt med hastigheden. At køre 110 km/t i stedet for 130
          km/t på motorvejen kan spare 15-20% brændstof. Brug fartpiloten for at holde en jævn
          hastighed.
        </p>
        <ul>
          <li><strong>50 km/t i byen:</strong> Optimal for de fleste biler</li>
          <li><strong>80 km/t på landevej:</strong> Oftest det mest økonomiske</li>
          <li><strong>110 km/t på motorvej:</strong> Markant billigere end 130 km/t</li>
        </ul>

        <h3>Gear rigtigt</h3>
        <p>
          Kør på højest mulige gear ved lavt omdrejningstal (1.500-2.500 RPM for benzin,
          1.200-2.000 RPM for diesel). Undgå at lade motoren ture op i lavere gear. Mange
          moderne biler har en gearskiftindikator — brug den.
        </p>

        <h2>2. Vedligeholdelse: Den oversete besparelse</h2>

        <h3>Dæktryk</h3>
        <p>
          For lavt dæktryk øger rullemodstanden og dermed forbruget. Tjek dæktrykkket mindst
          én gang om måneden. Kør med det dæktryk, producenten anbefaler (står typisk i
          dørkanten eller tanklågen). Bare 0,5 bar for lidt øger forbruget med 2-3%.
        </p>

        <h3>Service og olieskift</h3>
        <p>
          En velserviceret motor kører mere effektivt. Udskift luftfilter, olie og tændrør
          efter producentens anbefalinger. Et tilstoppet luftfilter alene kan øge forbruget
          med op til 10%.
        </p>

        <h3>Fjern unødig vægt</h3>
        <p>
          Hver 50 kg ekstra vægt øger forbruget med ca. 1-2%. Fjern tagboks, cykelholder og
          andre tunge genstande, når du ikke bruger dem. En tagboks øger luftmodstanden og kan
          koste 5-10% ekstra brændstof ved motorvejskørsel.
        </p>

        <h2>3. Ruteplanlægning</h2>
        <ul>
          <li><strong>Brug GPS/navigation:</strong> Moderne GPS-apps viser den mest brændstof&shy;effektive rute, ikke bare den hurtigste</li>
          <li><strong>Undgå myldretid:</strong> Stop-and-go kørsel i kø forbruger markant mere brændstof</li>
          <li><strong>Saml ærinder:</strong> Flere korte ture med kold motor bruger mere end én lang tur</li>
          <li><strong>Overvej alternativer:</strong> Cykel, offentlig transport eller samkørsel</li>
        </ul>

        <h2>4. Tank smart</h2>
        <ul>
          <li><strong>Sammenlign priser:</strong> Apps som FDM Benzinpriser viser billigste tankstationer i dit område</li>
          <li><strong>Tank om morgenen:</strong> Brændstof er tættere (og du får lidt mere for pengene) når det er koldt</li>
          <li><strong>Brug loyalitetsprogrammer:</strong> Mange tankstationer tilbyder rabat ved gentagne besøg</li>
          <li><strong>Undgå premium-brændstof</strong> medmindre din bil kræver det — de fleste biler kører fint på 95 oktan</li>
        </ul>

        <h2>5. Brændstofpriser i 2026</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Brændstoftype</th>
                <th>Pris (ca.)</th>
                <th>Pris per 100 km</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Benzin 95</td>
                <td>13-14 kr/l</td>
                <td>ca. 91 kr (7 l/100 km)</td>
              </tr>
              <tr>
                <td>Diesel</td>
                <td>12-13 kr/l</td>
                <td>ca. 72 kr (6 l/100 km)</td>
              </tr>
              <tr>
                <td>El (hjemme)</td>
                <td>2-3 kr/kWh</td>
                <td>ca. 45 kr (18 kWh/100 km)</td>
              </tr>
              <tr>
                <td>El (offentlig lader)</td>
                <td>3-5 kr/kWh</td>
                <td>ca. 72 kr (18 kWh/100 km)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>6. Elbil: Det billigste alternativ</h2>
        <p>
          Hvis du kører mange kilometer, er en elbil den mest økonomiske løsning for brændstof.
          Opladning hjemme koster under halvdelen af benzin per kilometer. Dog er købsprisen
          højere, så den samlede økonomi afhænger af dit kørselsbehov.
        </p>
        <p>
          <strong>Break-even:</strong> De fleste elbiler begynder at spare penge efter ca.
          60.000-80.000 km sammenlignet med en tilsvarende benzinbil, afhængig af model og
          brændstofpriser.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dine omkostninger</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/braendstof" className="underline font-medium">brændstofberegner</Link> til
            at se hvad din kørsel koster, eller <Link href="/bil" className="underline font-medium">bilomkostnings-beregneren</Link> for
            det fulde billede inkl. forsikring, værditab og afgifter.
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
    </div>
  );
}
