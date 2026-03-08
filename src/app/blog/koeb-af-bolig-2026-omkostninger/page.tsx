import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Køb af bolig 2026: Alle omkostninger du skal kende | MinBeregner.dk",
    description:
      "Komplet guide til boligkøb i 2026: Tinglysningsafgift, advokat, udbetaling, ejendomsværdiskat og alle skjulte omkostninger. Se det fulde billede.",
    keywords: [
      "køb af bolig 2026",
      "boligkøb omkostninger",
      "tinglysningsafgift",
      "udbetaling bolig",
      "ejendomsværdiskat 2026",
      "advokat boligkøb",
      "købers omkostninger",
    ],
    openGraph: {
      title: "Køb af bolig 2026: Alle omkostninger du skal kende",
      description: "Alle omkostninger ved boligkøb i 2026 — fra udbetaling til tinglysning.",
      url: `${baseUrl}/blog/koeb-af-bolig-2026-omkostninger`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/koeb-af-bolig-2026-omkostninger`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad koster det at købe bolig ud over købsprisen?",
    answer:
      "Udover købsprisen skal du typisk betale 3-5% af boligens pris i omkostninger: tinglysningsafgift (skøde + pant), advokat/rådgiver, bankgebyrer, ejerskifteforsikring og evt. tilstandsrapport.",
  },
  {
    question: "Hvor meget skal man have i udbetaling?",
    answer:
      "Du skal have minimum 5% af boligens pris i udbetaling. Ved en bolig til 3 mio. kr er det 150.000 kr. Derudover skal du have penge til tinglysning og andre handelsomkostninger.",
  },
  {
    question: "Hvad er ejendomsværdiskatten i 2026?",
    answer:
      "Ejendomsværdiskatten i 2026 er 0,92% af boligens vurderede værdi op til ca. 9,2 mio. kr og 3% af værdien derover. Der gives et forsigtighedsfradrag på 20% af vurderingen.",
  },
];

export default function BoligkoebGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Køb af bolig 2026</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Bolig & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Køb af bolig 2026: Alle omkostninger du skal kende
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-17">17. februar 2026</time>
            <span>•</span>
            <span>9 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          At købe bolig handler om mere end bare købsprisen. Der er en lang række omkostninger,
          som mange førstegangskøbere overser. I denne guide gennemgår vi alle udgifter, du
          skal kende, når du køber bolig i 2026.
        </p>

        <h2>Oversigt: Omkostninger ved boligkøb</h2>
        <p>
          Her er en typisk omkostningsoversigt for køb af en bolig til 3.000.000 kr:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Omkostning</th>
                <th>Beløb (ca.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Udbetaling (5%)</td>
                <td>150.000 kr</td>
              </tr>
              <tr>
                <td>Tinglysning skøde (0,6% + 1.850 kr)</td>
                <td>19.850 kr</td>
              </tr>
              <tr>
                <td>Tinglysning pant (1,45% + 1.825 kr)</td>
                <td>ca. 43.000 kr</td>
              </tr>
              <tr>
                <td>Advokat/køberrådgiver</td>
                <td>5.000-15.000 kr</td>
              </tr>
              <tr>
                <td>Ejerskifteforsikring</td>
                <td>5.000-15.000 kr</td>
              </tr>
              <tr>
                <td>Bankgebyr (kurtage, etablering)</td>
                <td>5.000-20.000 kr</td>
              </tr>
              <tr>
                <td><strong>Samlet ekstra omkostning</strong></td>
                <td><strong>ca. 80.000-115.000 kr</strong></td>
              </tr>
              <tr>
                <td><strong>Total kontant behov</strong></td>
                <td><strong>ca. 230.000-265.000 kr</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>1. Udbetalingen</h2>
        <p>
          Du skal have minimum <strong>5% af boligens pris</strong> som udbetaling. Det er
          et krav fra realkreditinstitutterne. Beløbet kan ikke lånes — det skal komme fra
          din opsparing, gaver eller salg af eksisterende bolig.
        </p>
        <p>
          Jo mere du lægger i udbetaling, desto billigere bliver dit banklån (da du låner
          mindre til den høje rente over 80% belåning).
        </p>

        <h2>2. Tinglysningsafgift</h2>
        <p>
          Tinglysningsafgiften er en statslig afgift, der betales når dit skøde og pantebrev
          registreres:
        </p>
        <ul>
          <li><strong>Skøde:</strong> 0,6% af købsprisen + fast afgift 1.850 kr</li>
          <li><strong>Pantebrev:</strong> 1,45% af lånebeløbet + fast afgift 1.825 kr</li>
        </ul>
        <p>
          <strong>Tip:</strong> Har du et eksisterende pantebrev, kan du overføre stempel
          fra det gamle til det nye og spare tinglysningsafgift.
        </p>

        <h2>3. Advokat og køberrådgiver</h2>
        <p>
          En advokat eller køberrådgiver sikrer, at handlen forløber korrekt. Prisen er
          typisk <strong>5.000-15.000 kr</strong> afhængigt af handliens kompleksitet.
          En advokat kan hjælpe med:
        </p>
        <ul>
          <li>Gennemgang af købsaftalen</li>
          <li>Forbehold (finansiering, tilstandsrapport)</li>
          <li>Tinglysning af skøde</li>
          <li>Refusionsopgørelse (fordeling af udgifter)</li>
        </ul>

        <h2>4. Forsikringer</h2>
        <p>
          Ved boligkøb er der to vigtige forsikringer:
        </p>
        <ul>
          <li><strong>Ejerskifteforsikring:</strong> Dækker skjulte fejl og mangler. Prisen
            deles typisk 50/50 med sælger. Ca. 5.000-15.000 kr for købers andel.</li>
          <li><strong>Husforsikring:</strong> Obligatorisk for de fleste lån. Ca. 5.000-15.000 kr/år
            afhængigt af boligtype og størrelse.</li>
        </ul>

        <h2>5. Løbende boligudgifter</h2>
        <p>
          Udover låneydelsen har du flere faste udgifter som boligejer:
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Udgift</th>
                <th>Typisk beløb/år</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ejendomsværdiskat</td>
                <td>12.000-35.000 kr</td>
              </tr>
              <tr>
                <td>Grundskyld</td>
                <td>5.000-25.000 kr</td>
              </tr>
              <tr>
                <td>Husforsikring</td>
                <td>5.000-15.000 kr</td>
              </tr>
              <tr>
                <td>Vedligeholdelse (1% af værdi)</td>
                <td>20.000-40.000 kr</td>
              </tr>
              <tr>
                <td>Varme/el/vand</td>
                <td>15.000-40.000 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Ejendomsværdiskat 2026</h2>
        <p>
          Som boligejer betaler du ejendomsværdiskat. I 2026 er satserne:
        </p>
        <ul>
          <li><strong>0,92%</strong> af vurderingen op til ca. 9,2 mio. kr</li>
          <li><strong>3%</strong> af vurderingen over ca. 9,2 mio. kr</li>
          <li>Der gives et <strong>forsigtighedsfradrag på 20%</strong> af vurderingen</li>
        </ul>
        <p>
          Beregn din ejendomsværdiskat med vores{" "}
          <Link href="/ejendomsvaerdiskat" className="text-blue-600 hover:underline">
            ejendomsværdiskat-beregner
          </Link>.
        </p>

        <h2>Tjekliste for boligkøbere</h2>
        <ol>
          <li><strong>Spar op:</strong> Minimum 5% + handelsomkostninger (8-10% total)</li>
          <li><strong>Få forhåndsgodkendelse:</strong> Bank/realkredit fortæller hvad du kan låne</li>
          <li><strong>Find advokat:</strong> Gerne inden du finder bolig</li>
          <li><strong>Beregn din ydelse:</strong> Brug{" "}
            <Link href="/boliglaan" className="text-blue-600 hover:underline">boliglånsberegneren</Link>
          </li>
          <li><strong>Tjek dit budget:</strong> Kan du betale ydelse + alle faste udgifter?</li>
          <li><strong>Læs tilstandsrapport:</strong> Grundigt! Spørg om alt uklart</li>
          <li><strong>Forhandl pris:</strong> De fleste boliger sælges under udbudspris</li>
          <li><strong>Beregn rentefradrag:</strong> Brug{" "}
            <Link href="/rentefradrag" className="text-blue-600 hover:underline">rentefradrag-beregneren</Link>
          </li>
        </ol>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Beregn dine boligomkostninger</p>
          <p className="text-blue-700 dark:text-blue-400">
            Brug vores <Link href="/boliglaan" className="underline font-medium">boliglånsberegner</Link> til
            din ydelse, <Link href="/ejendomsvaerdiskat" className="underline font-medium">ejendomsværdiskat-beregner</Link> til
            boligskat, og <Link href="/rentefradrag" className="underline font-medium">rentefradrag-beregner</Link> til
            din skattebesparelse.
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
          <Link href="/blog/boliglaan-2026-renter-og-afdrag" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Boliglån 2026: Renter og afdrag →</span>
          </Link>
          <Link href="/blog/guide-til-laan-og-renter" className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Guide til lån og renter →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
