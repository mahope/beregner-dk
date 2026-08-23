import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Leasing af bil 2026: Pris, fordele, ulemper og guide | MinBeregner.dk",
    description:
      "Komplet guide til leasing af bil i 2026: Privat leasing vs. billån, typiske priser, fordele og ulemper, km-grænser og hvordan du finder det bedste tilbud.",
    keywords: [
      "leasing af bil",
      "privatleasing 2026",
      "leasing beregner",
      "leasing pris",
      "billån vs leasing",
      "erhvervsleasing",
      "bil uden udbetaling",
      "leasingguide",
    ],
    openGraph: {
      title: "Leasing af bil 2026: Pris, fordele, ulemper og guide",
      description: "Komplet guide til leasing i 2026: Sammenlign med billån, se typiske priser, og find ud af om leasing er billigst for dig.",
      url: `${baseUrl}/blog/leasing-af-bil-2026-pris-og-guide`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/leasing-af-bil-2026-pris-og-guide`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad koster privatleasing af en bil i 2026?",
    answer: "Prisen afhænger af bilens værdi, løbetid og km-grænse. En lille bil (f.eks. VW Up, Toyota Aygo) koster typisk 1.500-2.500 kr/måned. En mellemklassebil (f.eks. VW Golf, Skoda Octavia) koster 2.500-4.500 kr/måned. En premiumbil (f.eks. Tesla Model 3, Audi A4) koster 4.500-8.000+ kr/måned. Prisen inkluderer ofte service og vejhjælp, men sjældent forsikring.",
  },
  {
    question: "Hvad er forskellen på privatleasing og erhvervsleasing?",
    answer: "Ved privatleasing betaler du en fast ydelse inkl. moms og kan ikke fradrage udgiften i skat. Ved erhvervsleasing kan virksomheden fradrage leasingydelsen som driftsomkostning og trække momsen fra. Erhvervsleasing kan også omfatte service og forsikring som en del af den samlede ydelse.",
  },
  {
    question: "Er leasing eller billån billigst?",
    answer: "Billån er typisk billigst hvis du kører over 15.000 km/år og beholder bilen i flere år. Privatleasing har en lavere månedlig ydelse og kræver ingen udbetaling, men du opbygger ikke egenkapital og har en km-begrænsning. Regnestykket afhænger af bilens værditab. For elbiler, der har et højere værditab, kan leasing ofte være en fordel, fordi du kun betaler for værditabet i leasingperioden.",
  },
  {
    question: "Hvor mange km må jeg køre ved privatleasing?",
    answer: "Typiske km-grænser er 10.000, 15.000 eller 20.000 km/år. Vælger du en for lav grænse, betaler du en overpris på ca. 1-5 kr pr. ekstra km ved periodens udløb. Vælg en grænse der passer til dit faktiske kørselsbehov — det er ofte billigere at betale en højere fast ydelse end at betale for overkørsel bagefter.",
  },
  {
    question: "Kan jeg lease en elbil?",
    answer: "Ja, elbiler er meget populære at lease. Flere mærker som Tesla, Volkswagen (ID.4/ID.5), Skoda (Enyaq), Hyundai (Ioniq 5, Kona EV) og Kia (EV6, Niro EV) tilbyder attraktive leasingaftaler. Elbiler har typisk en lidt højere leasingydelse end tilsvarende benzinbiler, men lavere driftsomkostninger (strøm, service, grøn ejerafgift) kan opveje forskellen.",
  },
  {
    question: "Hvad sker der når leasingperioden udløber?",
    answer: "Ved periodens udløb afleverer du bilen til leasingselskabet. De vurderer om der er skader ud over normal slidtage, og du betaler for eventuelle skader og overkørte km. Herefter kan du indgå en ny leasingaftale (evt. på en ny bil), købe bilen til den aftalte restværdi, eller vælge en anden løsning.",
  },
];

export default function LeasingAfBilPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span>Leasing af bil 2026</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="not-prose mb-8">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Transport & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">Leasing af bil 2026: Pris, fordele, ulemper og guide</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">23. august 2026 · 9 min læsetid</p>
        </header>

        <p className="lead">
          Leasing er blevet en af de mest populære måder at få bil på i Danmark. Over 133.000 private biler er i dag leasede, og antallet vokser år for år. I denne guide får du alt hvad du skal vide om leasing af bil i 2026 — priser, fordele og ulemper, sammenligning med billån, og de vigtigste faldgruber du skal undgå.
        </p>

        <h2>Hvad er leasing?</h2>
        <p>
          Leasing er i al sin enkelhed en langtidsleje af en bil. Du betaler en <strong>fast månedlig ydelse</strong> for at bruge bilen i en aftalt periode — typisk <strong>12-48 måneder</strong>. Når perioden udløber, afleverer du bilen. Du ejer den aldrig.
        </p>
        <p>
          Fordi du kun betaler for værditabet i den periode du bruger bilen (plus rente og administrationsomkostninger), er den månedlige ydelse ofte lavere end ved et billån. Til gengæld har du ingen restværdi eller egenkapital når aftalen udløber.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores leasingberegner</strong> til at se den præcise månedlige ydelse for netop den bil du overvejer.{' '}
            <Link href="/leasing" className="text-blue-600 hover:underline font-medium">Gå til Leasingberegner →</Link>
          </p>
        </div>

        <h2>Privatleasing vs. erhvervsleasing</h2>

        <h3>Privatleasing</h3>
        <p>
          Privatleasing er målrettet dig som privatperson. Du betaler en fast månedlig ydelse inkl. moms, og aftalen er typisk binder dig i 12-36 måneder med en km-grænse på 10.000-20.000 km/år. De fleste aftaler inkluderer service, dækhotel og vejhjælp, men du skal selv tegne en <strong>kaskoforsikring</strong>.
        </p>

        <h3>Erhvervsleasing</h3>
        <p>
          Erhvervsleasing er for virksomheder og selvstændige. Virksomheden kan <strong>fradrage leasingydelsen som driftsomkostning</strong> og trække momsen fra (50% momsfradrag ved privat anvendelse). Det gør erhvervsleasing væsentligt billigere efter skat for virksomheder. Aftalerne er ofte mere fleksible med skræddersyede km-grænser og løbetider.
        </p>

        <h2>Hvad koster leasing af bil i 2026?</h2>
        <p>
          Prisen varierer meget efter bilmodel, men her er typiske månedlige leasingydelser for populære bilklasser i 2026:
        </p>

        <table>
          <thead>
            <tr>
              <th>Bilklasse</th>
              <th>Eksempler</th>
              <th>Ca. ydelse/måned</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Minibil</td>
              <td>Toyota Aygo, VW Up, Hyundai i10</td>
              <td>1.500-2.500 kr</td>
            </tr>
            <tr>
              <td>Mikro/SUV</td>
              <td>VW T-Cross, Renault Captur, Peugeot 2008</td>
              <td>2.000-3.000 kr</td>
            </tr>
            <tr>
              <td>Mellemklasse</td>
              <td>VW Golf, Skoda Octavia, Toyota Corolla</td>
              <td>2.500-4.000 kr</td>
            </tr>
            <tr>
              <td>Mellem SUV</td>
              <td>VW Tiguan, Skoda Kodiaq, Toyota RAV4</td>
              <td>3.000-5.000 kr</td>
            </tr>
            <tr>
              <td>Elbil</td>
              <td>Tesla Model 3, VW ID.4, Skoda Enyaq</td>
              <td>3.500-6.000 kr</td>
            </tr>
            <tr>
              <td>Premium</td>
              <td>Audi A4/A6, BMW 3-serie, Mercedes C-klasse</td>
              <td>5.000-8.000 kr</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Priserne er vejledende og baseret på 12-måneders leasing med 15.000 km/år, ingen udbetaling. Indhent altid aktuelle tilbud fra flere leasingselskaber.
        </p>

        <h2>Hvad påvirker leasingydelsen?</h2>
        <ul>
          <li><strong>Bilens nypris:</strong> Jo dyrere bil, jo højere ydelse — du betaler for en større værdi</li>
          <li><strong>Restværdi:</strong> Bilens forventede værdi efter leasingperioden. En høj restværdi giver lavere ydelse, fordi du kun betaler for værditabet</li>
          <li><strong>Løbetid:</strong> Længere løbetid giver lavere månedlig ydelse, men du betaler mere i renter totalt</li>
          <li><strong>Km-grænse:</strong> Flere km/år giver lavere restværdi og dermed højere ydelse</li>
          <li><strong>Udbetaling:</strong> En større udbetaling (f.eks. 20-40% af bilens pris) sænker den månedlige ydelse</li>
          <li><strong>Rente:</strong> Leasingselskabets finansieringsomkostning — typisk 4-8% ÅOP i 2026</li>
        </ul>

        <h2>Fordele og ulemper ved leasing</h2>

        <h3>Fordele</h3>
        <ul>
          <li><strong>Lavere månedlig ydelse</strong> end billån — især for nye biler</li>
          <li><strong>Ingen udbetaling</strong> — de fleste leasingaftaler kræver 0 kr i udbetaling</li>
          <li><strong>Forudsigelige udgifter</strong> — service, dæk og vejhjælp er ofte inkluderet</li>
          <li><strong>Altid ny bil</strong> — du skifter til en ny bil hvert 2-3 år med garanti</li>
          <li><strong>Ingen bekymring om værditab</strong> — det er leasingselskabets risiko</li>
          <li><strong>Nem administration</strong> — alt er samlet i én månedlig regning</li>
        </ul>

        <h3>Ulemper</h3>
        <ul>
          <li><strong>Du ejer ikke bilen</strong> — ingen restværdi eller egenkapital</li>
          <li><strong>Km-begrænsning</strong> — betaler dyrt for overkørte km (typisk 1-5 kr/km)</li>
          <li><strong>Bindingsperiode</strong> — kan være dyr at komme ud af i utide</li>
          <li><strong>Krav om kaskoforsikring</strong> — ofte dyrere end ansvarsforsikring</li>
          <li><strong>Skader ved aflevering</strong> — almindelig slidtage er ok, men skader kan blive dyre</li>
          <li><strong>Dyrere i længden</strong> — over 4-6 år er billån ofte billigere totalt</li>
        </ul>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores beregnere til at sammenligne:</strong>{' '}
            <Link href="/leasing" className="text-blue-600 hover:underline">Leasingberegner</Link>
            {' · '}
            <Link href="/billaan" className="text-blue-600 hover:underline">Billånsberegner</Link>
            {' · '}
            <Link href="/laaneberegner" className="text-blue-600 hover:underline">Låneberegner</Link>
          </p>
        </div>

        <h2>Leasing vs. billån — hvad skal du vælge?</h2>
        <p>
          Det klassiske spørgsmål: er det billigst at lease eller købe på billån? Svaret afhænger af dine præferencer og kørselsbehov.
        </p>

        <p><strong>Leasing er bedst hvis:</strong></p>
        <ul>
          <li>Du kører under 15.000 km/år</li>
          <li>Du skifter bil ofte (hvert 2-3 år)</li>
          <li>Du vil have forudsigelige faste udgifter</li>
          <li>Du ikke har en stor opsparing til udbetaling</li>
          <li>Du vil undgå bekymringer om værditab og reperationer</li>
        </ul>

        <p><strong>Billån er bedst hvis:</strong></p>
        <ul>
          <li>Du kører over 15.000 km/år</li>
          <li>Du beholder bilen i 4-6 år eller mere</li>
          <li>Du vil opbygge egenkapital (bilens restværdi)</li>
          <li>Du har en opsparing til udbetaling (typisk 20%)</li>
          <li>Du vil kunne sælge bilen når det passer dig</li>
        </ul>

        <p>
          Som tommelfingerregel: kører du over 15.000 km/år og beholder bilen i 4+ år, er et billån typisk billigere. Leasing er derimod en fordel hvis du vil have en ny bil hvert 2-3 år og kører et typisk dansk km-forbrug.
        </p>

        <h2>Leasing af elbil i 2026</h2>
        <p>
          Elbiler er særligt interessante at lease, fordi <strong>værditabet på elbiler</strong> er højere end på benzinbiler i de første år. Det betyder at leasingydelsen tager højde for dette værditab, så du som leaser ikke hæfter for usikkerheden. Flere mærker tilbyder konkurrencedygtige leasingaftaler på elbiler.
        </p>
        <p>
          En elbil koster typisk 3.500-6.000 kr/måned i leasing og har lavere driftsomkostninger end en benzinbil. Besparelsen på brændstof og grøn ejerafgift kan være 1.000-2.000 kr/måned, så den reelle omkostning for en elbil på leasing kan være sammenlignelig med en benzinbil i mellemklassen.
        </p>
        <p>
          <em>Kilde: Baseret på generelle danske leasingpriser 2026. Indhent altid specifikke tilbud.</em>
        </p>

        <h2>Faldgruber du skal undgå</h2>
        <ul>
          <li><strong>Overkørte km:</strong> Vælg en km-grænse der matcher dit faktiske kørselsbehov — overkørsel koster typisk 1-5 kr/km</li>
          <li><strong>Skader ved aflevering:</strong> Tag billeder af bilen ved levering, så du kan dokumentere eksisterende skader</li>
          <li><strong>Skjulte gebyrer:</strong> Læs det med småt — nogle selskaber opkræver etableringsgebyr, administrationsgebyr eller opsigelsesgebyr</li>
          <li><strong>Garanti vs. leasing:</strong> Garantien følger bilen, men leasingaftalen kan have særlige vilkår for reperationer</li>
          <li><strong>Forlængelse:</strong> Nogle aftaler forlænges automatisk hvis du ikke siger op i rettidig — sæt en påmindelse</li>
        </ul>

        <div className="not-prose my-8">
          <Link
            href="/leasing"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Gå til Leasingberegner →
          </Link>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.question}</h3>
            <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
          </div>
        ))}
      </article>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4">
          <Link href="/billaan" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Billånsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn din månedlige ydelse på et billån</p>
          </Link>
          <Link href="/bil" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Bilberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se de samlede ejeromkostninger for din bil</p>
          </Link>
          <Link href="/braendstof" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Brændstofberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn brændstofforbrug og -omkostninger</p>
          </Link>
          <Link href="/elbil" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Elbil vs. benzinbil →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sammenlign elbil og benzinbil med 2026-tal</p>
          </Link>
          <Link href="/laaneberegner" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Låneberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sammenlign lån og se den samlede omkostning</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/biloekonomi-2026-hvad-koster-det-at-eje-bil" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Biløkonomi 2026: Hvad koster det at eje bil? →</span>
          </Link>
          <Link href="/blog/spar-penge-paa-braendstof" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Spar penge på brændstof →</span>
          </Link>
          <Link href="/blog/elpriser-2026-beregn-dit-forbrug" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Elpriser 2026: Beregn dit forbrug →</span>
          </Link>
          <Link href="/blog/guide-til-laan-og-renter" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Guide til lån og renter →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}