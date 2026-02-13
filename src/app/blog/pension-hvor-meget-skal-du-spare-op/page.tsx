import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Pension: Hvor Meget Skal Du Spare Op? Komplet Guide 2026 | MinBeregner.dk",
  description:
    "Hvor meget skal du spare op til pension? Lær om tommelfingerregler, beregn dit behov, og forstå de tre pensionssøjler. Gratis pensionsberegner inkluderet.",
  keywords: [
    "pension opsparing",
    "hvor meget pension",
    "pensionsopsparing",
    "hvor meget skal jeg spare op",
    "pension guide",
    "pension 2026",
    "pensionsplanlægning",
    "folkepension",
    "arbejdsmarkedspension",
    "ratepension",
    "aldersopsparing",
  ],
  openGraph: {
    title: "Pension: Hvor Meget Skal Du Spare Op?",
    description: "Komplet guide til pensionsopsparing i 2026: Tommelfingerregler, beregninger og de tre pensionssøjler.",
    url: `${baseUrl}/blog/pension-hvor-meget-skal-du-spare-op`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/pension-hvor-meget-skal-du-spare-op`,
  },
};

const faqItems = [
  {
    question: "Hvor meget skal jeg spare op til pension?",
    answer: "En tommelfingerregel er at spare 12-17% af din bruttoløn til pension. Med arbejdsgiverbidrag på 8-12% og dit eget bidrag på 4-5% når de fleste dette. Jo tidligere du starter, jo mindre behøver du at spare procentuelt.",
  },
  {
    question: "Hvornår er det for sent at starte pensionsopsparing?",
    answer: "Det er aldrig for sent, men jo senere du starter, jo mere skal du spare. En 50-årig skal spare ca. dobbelt så meget procentuelt som en 25-årig for at nå samme mål. Start i dag - selv små beløb gør en forskel over 15-20 år.",
  },
  {
    question: "Kan jeg leve af folkepension alene?",
    answer: "Folkepension og pensionstillæg giver ca. 13.000-15.000 kr/måned før skat for enlige, og mindre for samboende. De fleste har svært ved at opretholde deres levestandard kun på folkepension, så supplerende opsparing er vigtig.",
  },
  {
    question: "Hvad er forskellen på ratepension og aldersopsparing?",
    answer: "Ratepension giver fradrag nu og beskattes ved udbetaling. Aldersopsparing giver ingen fradrag, men udbetales skattefrit. Max aldersopsparing er 5.900 kr/år (2026), mens ratepension kan være op til 63.100 kr/år.",
  },
  {
    question: "Hvad sker der med min pension hvis jeg dør før pensionsalderen?",
    answer: "Det afhænger af pensionstypen. Mange arbejdsmarkedspensioner har gruppelivsordninger, der udbetaler til efterladte. ATP har efterladteydelse. Privat opsparing går typisk til arvinger. Tjek dine vilkår hos din pensionskasse.",
  },
  {
    question: "Hvor kan jeg se mine samlede pensioner?",
    answer: "På PensionsInfo.dk kan du se alle dine danske pensionsordninger samlet: arbejdsmarkedspension, privat pension, ATP og forventet folkepension. Log ind med MitID for et komplet overblik.",
  },
];

export default function PensionGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">Pension: Hvor meget skal du spare op?</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Pension & Opsparing</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">
            Pension: Hvor Meget Skal Du Spare Op?
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>13. februar 2026</span>
            <span>•</span>
            <span>10 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          &quot;Sparer jeg nok op til pension?&quot; Det er et spørgsmål, de fleste danskere stiller sig 
          selv på et tidspunkt. I denne guide giver vi dig konkrete tal, tommelfingerregler og 
          en forståelse af det danske pensionssystem, så du kan planlægge din økonomiske fremtid.
        </p>

        <h2>Den korte version: Hvor meget skal du spare?</h2>
        <p>
          Lad os starte med det vigtigste spørgsmål. De fleste eksperter anbefaler, at du 
          sparer <strong>12-17% af din bruttoløn</strong> til pension. For de fleste danskere 
          opnås dette automatisk via arbejdsmarkedspension:
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg not-prose my-6">
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">Typisk pensionsindbetaling</h3>
          <table className="w-full text-sm">
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-blue-200 dark:border-blue-700">
                <td className="py-2">Arbejdsgivers bidrag</td>
                <td className="text-right">8-12%</td>
              </tr>
              <tr className="border-b border-blue-200 dark:border-blue-700">
                <td className="py-2">Dit bidrag</td>
                <td className="text-right">4-5%</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Total indbetaling</td>
                <td className="text-right text-blue-700 dark:text-blue-400">12-17%</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            Eksempel: Med 40.000 kr/md i løn og 15% pension = 6.000 kr/md til pension
          </p>
        </div>

        <p>
          Men &quot;nok&quot; afhænger af din alder, dine ambitioner og hvornår du vil gå på pension. 
          Lad os dykke ned i detaljerne.
        </p>

        <h2>De tre pensionssøjler i Danmark</h2>
        <p>
          Det danske pensionssystem bygger på tre søjler, der tilsammen skal sikre din 
          økonomi som pensionist:
        </p>

        <h3>Søjle 1: Folkepension og ATP</h3>
        <p>
          Alle danske statsborgere med bopæl i Danmark får <strong>folkepension</strong> fra 
          folkepensionsalderen. Derudover får de fleste <strong>ATP</strong> (Arbejdsmarkedets 
          Tillægspension), som du har indbetalt til gennem dit arbejdsliv.
        </p>

        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 p-4 rounded-lg not-prose my-6">
          <h4 className="font-bold mb-2 text-gray-900 dark:text-white">Folkepension + ATP (2026 satser)</h4>
          <table className="w-full text-sm">
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Grundbeløb</td>
                <td className="text-right">~6.900 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Pensionstillæg (enlig)</td>
                <td className="text-right">~8.200 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">Pensionstillæg (par)</td>
                <td className="text-right">~4.100 kr/md</td>
              </tr>
              <tr className="border-b border-green-200 dark:border-green-700">
                <td className="py-2">ATP (typisk)</td>
                <td className="text-right">2.000-3.000 kr/md</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">I alt (enlig, max)</td>
                <td className="text-right text-green-700 dark:text-green-400">~17.000-18.000 kr/md</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            ⚠️ Pensionstillægget modregnes i anden indkomst (arbejdsmarkedspension, etc.)
          </p>
        </div>

        <h3>Søjle 2: Arbejdsmarkedspension</h3>
        <p>
          De fleste danskere har en <strong>arbejdsmarkedspension</strong> via deres 
          ansættelse. Arbejdsgiver og du indbetaler tilsammen 12-17% af din løn til 
          en pensionskasse (PFA, Danica, Velliv, etc.).
        </p>
        <p>
          Denne pension er ofte din vigtigste pensionskilde, da beløbene bliver store 
          over et helt arbejdsliv. Med 6.000 kr/md i indbetaling og 4% afkast har du 
          over 2 millioner kr efter 25 år.
        </p>

        <h3>Søjle 3: Privat opsparing</h3>
        <p>
          Ud over de obligatoriske ordninger kan du selv spare op via:
        </p>
        <ul>
          <li><strong>Ratepension:</strong> Fradrag nu, skat ved udbetaling (max ~63.000 kr/år)</li>
          <li><strong>Aldersopsparing:</strong> Ingen fradrag, skattefri udbetaling (max 5.900 kr/år)</li>
          <li><strong>Frie midler:</strong> Aktier, obligationer, ejendom (lagerbeskatning)</li>
        </ul>

        <h2>Hvor meget har du brug for som pensionist?</h2>
        <p>
          Det store spørgsmål: Hvad skal du egentlig bruge som pensionist? Tommelfingerreglen er, 
          at de fleste har brug for <strong>60-80% af deres arbejdsindkomst</strong> som pensionist.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg not-prose my-6">
          <h4 className="font-bold mb-2 text-gray-900 dark:text-white">Eksempel: Hvad har du brug for?</h4>
          <table className="w-full text-sm">
            <tbody className="text-gray-700 dark:text-gray-300">
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Nuværende løn</td>
                <td className="text-right">45.000 kr/md</td>
              </tr>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Netto efter skat (~38%)</td>
                <td className="text-right">~28.000 kr/md</td>
              </tr>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Behov som pensionist (70%)</td>
                <td className="text-right">~19.500 kr/md</td>
              </tr>
              <tr className="border-b border-yellow-200 dark:border-yellow-700">
                <td className="py-2">Folkepension + ATP</td>
                <td className="text-right">~13.000 kr/md</td>
              </tr>
              <tr className="font-bold">
                <td className="py-2">Behov fra egen opsparing</td>
                <td className="text-right text-yellow-700 dark:text-yellow-400">~6.500 kr/md</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Med 6.500 kr/md i 20-25 år kræver det en opsparing på ca. 1,5-2 mio. kr 
          (afhængigt af afkast og udbetaling). Brug vores{" "}
          <Link href="/pension">pensionsberegner</Link> til at beregne dit personlige behov.
        </p>

        <h2>Tommelfingerregler for pensionsopsparing</h2>
        <p>
          Her er nogle praktiske tommelfingerregler, du kan bruge til at tjekke om du 
          sparer nok:
        </p>

        <h3>1. Hvor meget skal du spare? (Procent af løn)</h3>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Alder du starter</th>
                <th className="text-left py-2">Anbefalet opsparing</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">25 år</td>
                <td>10-12% af løn</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">30 år</td>
                <td>12-15% af løn</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">35 år</td>
                <td>15-18% af løn</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">40 år</td>
                <td>18-22% af løn</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">50 år</td>
                <td>22-30% af løn</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Pointen er klar: Jo tidligere du starter, jo mindre behøver du at spare 
          procentuelt. Det skyldes renters rente.
        </p>

        <h3>2. Hvor meget skal du have samlet?</h3>
        <p>
          En populær tommelfingerregel er at have <strong>25 gange dine årlige udgifter</strong> 
          opsparet. Med 20.000 kr/md i behov (240.000 kr/år) svarer det til 6 mio. kr.
        </p>
        <p>
          Dette er baseret på &quot;4%-reglen&quot; - at du kan hæve 4% af din opsparing årligt 
          uden at løbe tør (over 25-30 år med afkast).
        </p>

        <h3>3. Aktier vs. obligationer efter alder</h3>
        <p>
          En klassisk tommelfingerregel for din investeringssammensætning:
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-center text-lg text-gray-800 dark:text-gray-200">
            Aktieandel = 100 - din alder
          </p>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400 mt-2">
            30-årig = 70% aktier, 30% obligationer<br />
            50-årig = 50% aktier, 50% obligationer
          </p>
        </div>

        <h2>Renters rente - din bedste ven</h2>
        <p>
          Det kraftfulde ved pensionsopsparing er renters rente. Lad os se et eksempel:
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left py-2 px-2">Scenarie</th>
                <th className="text-right py-2 px-2">Indbetalt</th>
                <th className="text-right py-2 px-2">Samlet værdi</th>
                <th className="text-right py-2 px-2">Afkast</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 px-2">Start som 25-årig, 3.000 kr/md, 40 år</td>
                <td className="text-right px-2">1.440.000 kr</td>
                <td className="text-right px-2 font-bold text-green-600 dark:text-green-400">~3.500.000 kr</td>
                <td className="text-right px-2">+2.060.000 kr</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 px-2">Start som 35-årig, 3.000 kr/md, 30 år</td>
                <td className="text-right px-2">1.080.000 kr</td>
                <td className="text-right px-2 font-bold">~2.000.000 kr</td>
                <td className="text-right px-2">+920.000 kr</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2 px-2">Start som 45-årig, 3.000 kr/md, 20 år</td>
                <td className="text-right px-2">720.000 kr</td>
                <td className="text-right px-2">~1.050.000 kr</td>
                <td className="text-right px-2">+330.000 kr</td>
              </tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">*Med 5% årligt afkast</p>
        </div>

        <p>
          Ved at starte 10 år tidligere (25 vs 35) får du næsten det dobbelte - 
          selvom du kun indbetaler 360.000 kr mere. Brug vores{" "}
          <Link href="/opsparing">opsparingsberegner</Link> til at se effekten af 
          renters rente på din egen opsparing.
        </p>

        <h2>Hvornår kan du gå på pension?</h2>
        <p>
          Folkepensionsalderen stiger gradvist:
        </p>

        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-2">Fødselsår</th>
                <th className="text-left py-2">Folkepensionsalder</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Før 1963</td>
                <td>65-67 år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">1963-1966</td>
                <td>68 år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">1967-1970</td>
                <td>69 år</td>
              </tr>
              <tr className="border-b dark:border-gray-700">
                <td className="py-2">Efter 1970</td>
                <td>70+ år (forventet)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Du kan dog gå på <strong>tidlig pension</strong> (fra din egen opsparing) 
          op til 5 år før folkepensionsalderen. Men det kræver tilstrækkelig opsparing, 
          da folkepensionen først starter ved den officielle alder.
        </p>

        <p>
          Planlægger du tidlig pension? Brug vores{" "}
          <Link href="/efterloen">efterlønsberegner</Link> for at beregne dit behov.
        </p>

        <h2>Tjek dine pensioner i dag</h2>
        <p>
          Det vigtigste skridt er at få overblik over, hvad du allerede har:
        </p>

        <ol>
          <li>
            <strong>Log ind på <a href="https://www.pensionsinfo.dk" target="_blank" rel="noopener noreferrer">PensionsInfo.dk</a></strong> 
            {" "}med MitID for at se alle dine pensioner samlet
          </li>
          <li>
            <strong>Tjek din forventede folkepension</strong> baseret på din bopælstid i Danmark
          </li>
          <li>
            <strong>Se din ATP-saldo</strong> på <a href="https://www.atp.dk" target="_blank" rel="noopener noreferrer">ATP.dk</a>
          </li>
          <li>
            <strong>Brug vores beregner</strong> til at estimere, om du når dit mål
          </li>
        </ol>

        <h2>5 tips til at forbedre din pension</h2>

        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg not-prose my-6">
          <ol className="space-y-3 text-gray-700 dark:text-gray-300">
            <li>
              <strong>1. Start i dag</strong> - Selv 500 kr/md gør en forskel over 20-30 år
            </li>
            <li>
              <strong>2. Udnyt arbejdsgiverbidrag</strong> - Forhandl højere pensionsbidrag i stedet for løn
            </li>
            <li>
              <strong>3. Max ratepension først</strong> - Få skattefradrag nu (op til ~63.000 kr/år)
            </li>
            <li>
              <strong>4. Tilføj aldersopsparing</strong> - 5.900 kr/år skattefrit ved udbetaling
            </li>
            <li>
              <strong>5. Tjek omkostninger</strong> - Høje administrationsgebyrer spiser dit afkast
            </li>
          </ol>
        </div>

        <h2>Beregn din pension nu</h2>
        <p>
          Vil du vide præcis, hvor meget du får som pensionist? Brug vores gratis pensionsberegner:
        </p>

        <div className="not-prose my-8 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/pension"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Beregn din pension →
          </Link>
          <Link 
            href="/opsparing"
            className="inline-block px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-center"
          >
            Opsparingsberegner →
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
            href="/pension"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Pensionsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn din forventede pension</p>
          </Link>
          <Link 
            href="/opsparing"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Opsparingsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se effekten af renters rente</p>
          </Link>
          <Link 
            href="/efterloen"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Efterlønsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Planlæg tidlig tilbagetrækning</p>
          </Link>
          <Link 
            href="/loen-efter-skat"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Løn efter skat →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvad du får udbetalt</p>
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
            <span className="font-medium text-gray-900 dark:text-white">Guide: Feriepenge - Hvornår og Hvor Meget? →</span>
          </Link>
          <Link 
            href="/blog/boligstoette-2026-nye-regler"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium text-gray-900 dark:text-white">Boligstøtte 2026 - Nye Regler →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
