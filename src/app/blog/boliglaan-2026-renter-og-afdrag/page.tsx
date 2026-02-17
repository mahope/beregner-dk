import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Boliglån 2026: Renter, afdrag og hvad du har råd til | MinBeregner.dk",
  description:
    "Komplet guide til boliglån i 2026: Aktuelle renter, realkreditlån vs. banklån, fast vs. variabel rente og hvad du har råd til. Beregn din boliglånsydelse.",
  keywords: [
    "boliglån 2026",
    "realkreditlån rente 2026",
    "boliglån rente",
    "fast rente 2026",
    "variabel rente",
    "boliglån beregner",
    "hvad har jeg råd til bolig",
    "boliglån afdrag",
  ],
  openGraph: {
    title: "Boliglån 2026: Renter, afdrag og hvad du har råd til",
    description: "Alt om boliglån i 2026 — renter, låntyper og beregning.",
    url: `${baseUrl}/blog/boliglaan-2026-renter-og-afdrag`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/boliglaan-2026-renter-og-afdrag`,
  },
};

const faqItems = [
  {
    question: "Hvad er renten på et boliglån i 2026?",
    answer:
      "Renten på et 30-årigt fastforrentet realkreditlån med afdrag ligger i starten af 2026 på ca. 3,5-4,5% afhængigt af løbetid og lånetype. Variabelt forrentede lån ligger lavere, typisk 2-3%.",
  },
  {
    question: "Hvor meget kan jeg låne til bolig?",
    answer:
      "Som tommelfingerregel kan du låne ca. 3,5-4,5 gange din husstandsindkomst. Med en samlet årsindkomst på 800.000 kr kan du typisk låne 2,8-3,6 mio. kr. De præcise tal afhænger af din økonomi og banken.",
  },
  {
    question: "Hvad er forskellen på realkredit og banklån?",
    answer:
      "Realkreditlån finansierer op til 80% af boligens værdi til lavere rente. Banklån dækker de resterende 5-15% til højere rente. De 5% udbetaling skal du selv have.",
  },
];

export default function BoliglånGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Boliglån 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Bolig & Lån</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Boliglån 2026: Renter, afdrag og hvad du har råd til
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>9 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          At købe bolig er for de fleste den største økonomiske beslutning i livet. I 2026 er
          renteniveauet fortsat et centralt emne for boligkøbere. Her gennemgår vi alt om
          boliglån — fra låntyper og renter til hvad du har råd til.
        </p>

        <h2>Boliglånsrenter i 2026</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Låntype</th>
                <th>Typisk rente (2026)</th>
                <th>Egnet til</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Fastforrentet 30 år, m/afdrag</td>
                <td>3,5-4,5%</td>
                <td>Tryghed, stabil ydelse</td>
              </tr>
              <tr>
                <td>Fastforrentet 30 år, u/afdrag</td>
                <td>3,5-4,5%</td>
                <td>Lavere ydelse, kortvarigt</td>
              </tr>
              <tr>
                <td>Variabelt F-kort/F1</td>
                <td>2-3%</td>
                <td>Lavest ydelse, højere risiko</td>
              </tr>
              <tr>
                <td>Variabelt F3/F5</td>
                <td>2,5-3,5%</td>
                <td>Kompromis mellem fast og variabel</td>
              </tr>
              <tr>
                <td>Banklån (top-up)</td>
                <td>4-7%</td>
                <td>Finansierer over 80%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Sådan er et boliglån opbygget</h2>
        <p>
          Når du køber bolig, finansieres den typisk med tre dele:
        </p>
        <ul>
          <li><strong>Udbetaling (5%):</strong> Det beløb, du selv betaler kontant</li>
          <li><strong>Realkreditlån (op til 80%):</strong> Lån med sikkerhed i boligen til lav rente</li>
          <li><strong>Banklån (5-15%):</strong> Tillægslån til højere rente, der dækker gabet</li>
        </ul>
        <p>
          <strong>Eksempel:</strong> Ved en bolig til 3 mio. kr:
        </p>
        <ul>
          <li>Udbetaling: 150.000 kr (5%)</li>
          <li>Realkreditlån: 2.400.000 kr (80%)</li>
          <li>Banklån: 450.000 kr (15%)</li>
        </ul>

        <h2>Fast vs. variabel rente</h2>
        <h3>Fastforrentet lån</h3>
        <p>
          Med et fastforrentet lån kender du din ydelse i hele lånets løbetid. Det giver tryghed
          og forudsigelighed. Til gengæld er renten typisk højere end variable lån. Et fastforrentet
          lån kan desuden indfries til kurs 100, hvilket giver en fordel, hvis renten stiger.
        </p>

        <h3>Variabelt forrentet lån (F-lån)</h3>
        <p>
          Variabelt forrentede lån (F-kort, F1, F3, F5) har lavere startudgift, men din ydelse
          ændrer sig ved hver rentetilpasning. F-tallet angiver, hvor mange år der går mellem
          rentetilpasninger:
        </p>
        <ul>
          <li><strong>F-kort:</strong> Tilpasses hvert kvartal — lavest rente, højest risiko</li>
          <li><strong>F1:</strong> Tilpasses hvert år</li>
          <li><strong>F3:</strong> Tilpasses hvert 3. år</li>
          <li><strong>F5:</strong> Tilpasses hvert 5. år — mest forudsigelig af de variable</li>
        </ul>

        <h2>Hvad har du råd til?</h2>
        <p>
          En god tommelfingerregel er, at dine samlede boligudgifter (ydelse, ejendomsskat,
          forsikring, vedligeholdelse) ikke bør overstige <strong>30-33% af husstandens indkomst
          før skat</strong>.
        </p>
        <p>
          Brug vores{" "}
          <Link href="/boliglaan" className="text-blue-600 hover:underline">boliglånsberegner</Link> til at
          beregne din månedlige ydelse, eller{" "}
          <Link href="/husleje" className="text-blue-600 hover:underline">huslejeberegneren</Link> til at
          se dit samlede boligbudget.
        </p>

        <h2>Bidragssatser og ÅOP</h2>
        <p>
          Ud over renten betaler du et <strong>bidrag</strong> til realkreditinstituttet (typisk 0,5-1,2% af
          restgælden årligt). Bidraget afhænger af belåningsgrad, boligtype og låntype.
        </p>
        <p>
          <strong>ÅOP (Årlige Omkostninger i Procent)</strong> inkluderer alle omkostninger — rente, bidrag,
          kurtage og andre gebyrer — og giver det bedste sammenligningsgrundlag mellem lån. Læs mere
          i vores{" "}
          <Link href="/blog/guide-til-laan-og-renter" className="text-blue-600 hover:underline">
            guide til lån og renter
          </Link>.
        </p>

        <h2>Skattefradrag på boliglånsrenter</h2>
        <p>
          Du kan trække renter på dit boliglån fra i skat. I 2026 giver rentefradraget en
          skattebesparelse på ca. <strong>25-33%</strong> af dine renteudgifter (afhængigt af kommuneskat).
        </p>
        <p>
          <strong>Eksempel:</strong> Betaler du 100.000 kr i renter om året, sparer du ca. 25.000-33.000 kr
          i skat. Brug vores{" "}
          <Link href="/rentefradrag" className="text-blue-600 hover:underline">rentefradrag-beregner</Link> til
          at se din besparelse.
        </p>

        <h2>Tips til boligkøb i 2026</h2>
        <ul>
          <li><strong>Sammenlign tilbud:</strong> Indhent tilbud fra mindst 2-3 realkreditinstitutter og banker</li>
          <li><strong>Overvej lånmix:</strong> En kombination af fast og variabel rente kan balancere sikkerhed og pris</li>
          <li><strong>Regn med buffer:</strong> Sæt 2-3% af boligprisen af til uforudsete udgifter ved indflytning</li>
          <li><strong>Husk ejendomsværdiskat:</strong> Beregn den med vores{" "}
            <Link href="/ejendomsvaerdiskat" className="text-blue-600 hover:underline">ejendomsværdiskat-beregner</Link>
          </li>
          <li><strong>Tjek boligstøtte:</strong> Enlige med lav indkomst kan søge{" "}
            <Link href="/boligstoette" className="text-blue-600 hover:underline">boligstøtte</Link>
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dit boliglån</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/boliglaan" className="underline font-medium">boliglånsberegner</Link> til at
            se din ydelse. Se også <Link href="/renteberegner" className="underline font-medium">renteberegneren</Link> og{" "}
            <Link href="/laaneberegner" className="underline font-medium">den generelle låneberegner</Link>.
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
          <Link href="/blog/guide-til-laan-og-renter" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide til lån og renter →</span>
          </Link>
          <Link href="/blog/30-procent-reglen-husleje" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">30% reglen: Hvor meget bør du bruge på husleje? →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
