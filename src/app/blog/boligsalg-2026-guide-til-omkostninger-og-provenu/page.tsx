import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Boligsalg 2026: Guide til omkostninger og salgsprovenu | MinBeregner.dk",
    description:
      "Komplet guide til boligsalg i 2026: Hvad koster en ejendomsmægler? Hvor meget koster energimærke, tilstandsrapport og ejerskifteforsikring? Beregn dit nettoprovenu med vores gratis boligsalgsberegner.",
    keywords: [
      "boligsalg 2026",
      "omkostninger ved salg af bolig",
      "salgsprovenu beregner",
      "ejendomsmægler pris 2026",
      "energimærke pris 2026",
      "tilstandsrapport pris",
      "ejerskifteforsikring pris",
      "salgsomkostninger bolig",
      "nettoprovenu boligsalg",
    ],
    openGraph: {
      title: "Boligsalg 2026: Guide til omkostninger og salgsprovenu",
      description: "Komplet guide til omkostninger ved boligsalg. Beregn dit nettoprovenu — få overblik over mæglerhonorar, rapporter, istandsættelse og alle salgsomkostninger.",
      url: `${baseUrl}/blog/boligsalg-2026-guide-til-omkostninger-og-provenu`,
      type: "article",
    },
    alternates: {
      canonical: `${baseUrl}/blog/boligsalg-2026-guide-til-omkostninger-og-provenu`,
    },
  };
}

const faqItems = [
  {
    question: "Hvad koster det at sælge en bolig i 2026?",
    answer: "Salgsomkostningerne for en bolig til 3 mio. kr. er typisk 150.000-250.000 kr. De største poster er ejendomsmægler (3-6%), istandsættelse (20.000-50.000 kr) og energimærke (7.500-8.700 kr). Brug vores boligsalgsberegner til at se dit præcise nettoprovenu.",
  },
  {
    question: "Hvad er et typisk mæglersalær i 2026?",
    answer: "Ejendomsmæglere tager typisk 3-6% af salgsprisen for huse, eller et fast salær på 25.000-60.000 kr. Mange mæglere er villige til at forhandle salæret, især ved høje salgspriser. Indhent altid 3-4 tilbud før du vælger mægler.",
  },
  {
    question: "Skal jeg som sælger betale tinglysning?",
    answer: "Sælger betaler normalt ikke tinglysning af skøde og pantebrev — det er købers ansvar. Øst for Storebælt deles tinglysningsafgiften dog ofte mellem køber og sælger. Hvis du samtidig køber en ny bolig, skal du betale tinglysning dér.",
  },
  {
    question: "Hvilke rapporter kræves ved boligsalg?",
    answer: "Ved salg af ejerbolig kræves normalt: tilstandsrapport (5.000-8.000 kr), elinstallationsrapport (3.000-5.000 kr), energimærke (6.900-8.700 kr) og ejendomsdatarapport (ca. 105 kr). Disse skal være udarbejdet inden for de seneste 6-12 måneder.",
  },
  {
    question: "Hvordan optimerer jeg mit salgsprovenu?",
    answer: "Få mindst 3 mæglervurderinger og forhandl salæret. Gør istandsættelse selv når muligt. Overvej home staging (5.000-15.000 kr) — det kan øge salgsprisen. Sælg overskydende møbler i stedet for at flytte dem. Undersøg om du kan undgå store reparationer ved at sælge 'som beset'.",
  },
  {
    question: "Hvor lang tid tager et boligsalg?",
    answer: "Gennemsnitlig salgstid for en ejerbolig i Danmark er 3-6 måneder fra opmåling til underskrift. Efter købsaftalen er underskrevet, tager det typisk yderligere 1-2 måneder til overtagelse (flyttedag). I 2026 er salgstiden i de større byer kortere end på landet.",
  },
];

export default function Boligsalg2026GuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span>Boligsalg 2026</span>
      </nav>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <header className="not-prose mb-8">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Bolig & Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">Boligsalg 2026: Guide til omkostninger og salgsprovenu</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">24. august 2026 · 9 min læsetid</p>
        </header>

        <p className="lead">
          At sælge en bolig er en af de største økonomiske beslutninger du træffer.
          Ud over salgsprisen er der en række omkostninger, der kan løbe op i
          <strong> 150.000-250.000 kr.</strong> for en gennemsnitlig bolig. I denne
          guide får du et komplet overblik over alle omkostninger ved boligsalg i
          2026 — og en gratis beregner der viser dit nøjagtige nettoprovenu.
        </p>

        <h2>Hvad koster det at sælge bolig? Samlet overblik</h2>
        <p>
          Her er de typiske omkostninger for en bolig solgt for 3 mio. kr. i 2026.
          Beløbene er vejledende og varierer efter boligtype, stand og geografi.
        </p>

        <table>
          <thead>
            <tr>
              <th>Omkostning</th>
              <th>Typisk beløb</th>
              <th>Bemærkning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ejendomsmægler</td>
              <td>90.000-180.000 kr</td>
              <td>3-6% af salgsprisen</td>
            </tr>
            <tr>
              <td>Markedsføring</td>
              <td>5.000-15.000 kr</td>
              <td>Foto, video, annoncering</td>
            </tr>
            <tr>
              <td>Energimærke</td>
              <td>6.900-8.700 kr</td>
              <td>Afhænger af boligstørrelse</td>
            </tr>
            <tr>
              <td>Tilstandsrapport</td>
              <td>5.000-8.000 kr</td>
              <td>Kræves ved salg</td>
            </tr>
            <tr>
              <td>Elinstallationsrapport</td>
              <td>3.000-5.000 kr</td>
              <td>Kræves ved ældre boliger</td>
            </tr>
            <tr>
              <td>Ejerskifteforsikring</td>
              <td>3.000-8.000 kr</td>
              <td>Sælger betaler halvdelen</td>
            </tr>
            <tr>
              <td>Ejendomsdatarapport</td>
              <td>105 kr</td>
              <td>Fast pris</td>
            </tr>
            <tr>
              <td>Istandsættelse</td>
              <td>20.000-50.000 kr</td>
              <td>Varierer stort</td>
            </tr>
            <tr>
              <td>Advokat/berigtigelse</td>
              <td>5.000-15.000 kr</td>
              <td>Afhænger af kompleksitet</td>
            </tr>
            <tr>
              <td>Indfrielse af lån</td>
              <td>2.000-5.000 kr</td>
              <td>Gebyrer</td>
            </tr>
            <tr>
              <td>Flytning</td>
              <td>5.000-15.000 kr</td>
              <td>Gør-det-selv eller firma</td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Priserne er vejledende markedsestimater 2026. Tinglysningssatser fra Boligejer.dk (Erhvervsstyrelsen). Kilde: Boligejer.dk, MinBeregner.dk research.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores boligsalgsberegner</strong> til at se præcis hvad du får
            udbetalt efter alle omkostninger.{' '}
            <Link href="/boligsalg" className="text-blue-600 hover:underline font-medium">Gå til Boligsalgsberegner →</Link>
          </p>
        </div>

        <h2>Ejendomsmægler — den største omkostning</h2>
        <p>
          Ejendomsmæglerhonoraret er typisk den største enkeltpost ved boligsalg.
          <strong> Mægleren</strong> står for vurdering, fremvisning, markedsføring,
          forhandling og al den juridiske dokumentation. Honoraret kan opgøres på
          to måder:
        </p>

        <h3>Provisionssalær (procent)</h3>
        <p>
          <strong>3-6% af salgsprisen</strong> er det mest almindelige. De fleste
          mæglere ligger omkring 4-5% for huse og 3-4% for ejerlejligheder.
          Provisionssalæret inkluderer ofte markedsføring, men læs det med småt før
          du skriver under.
        </p>

        <h3>Fast salær</h3>
        <p>
          Flere discountmæglere og lokale mæglere tilbyder et <strong>fast salær</strong>
          på 25.000-60.000 kr uanset salgspris. Fast salær kan være en fordel ved
          dyre boliger, hvor procent-satsen ellers ville give et meget højt honorar.
          Ved billigere boliger (under ca. 1,5 mio. kr) er procent oftest billigst.
        </p>

        <p>
          <strong>Husk:</strong> Mæglersalæret er til forhandling. Især i områder
          med mange mæglere kan du presse prisen. Indhent altid 3-4 tilbud og
          sammenlign både salær og den service du får for pengene.
        </p>

        <h2>Obligatoriske rapporter og mærker</h2>
        <p>
          Ved salg af ejerbolig skal du som sælger sørge for flere rapporter og
          et energimærke. Disse skal være udarbejdet inden for de seneste 6-12
          måneder før salget.
        </p>

        <h3>Energimærke</h3>
        <p>
          Energimærket er en vurdering af boligens energiforbrug, fra A (meget
          energieffektiv) til G (dårlig). Prisen er reguleret af Energistyrelsen:
        </p>
        <ul>
          <li>Under 100 m²: maks. 6.931 kr (2026-estimat: ca. 7.200 kr)</li>
          <li>100-199 m²: maks. 7.626 kr (2026-estimat: ca. 7.900 kr)</li>
          <li>200-299 m²: maks. 8.319 kr (2026-estimat: ca. 8.600 kr)</li>
          <li>Over 299 m²: fri prisdannelse</li>
        </ul>
        <p>
          Mærket er gyldigt i 10 år. Har du allerede et energimærke (fra september
          2006 eller senere), kan du få en rabat på ca. 1.377 kr på det nye mærke.
          <br />
          <em>Kilde: Boligejer.dk (Erhvervsstyrelsen), opdateret august 2025.</em>
        </p>

        <h3>Tilstandsrapport</h3>
        <p>
          Tilstandsrapporten udarbejdes af en byggeskadetekniker og afdækker
          skjulte skader og vedligeholdelsesmangler. Rapporten koster typisk
          <strong> 5.000-8.000 kr</strong> og skal være udarbejdet inden for 6
          måneder før salget. Rapporten giver køber et samlet overblik og beskytter
          dig som sælger mod efterfølgende krav — med mindre du har fortiet kendte
          skader.
        </p>

        <h3>Elinstallationsrapport</h3>
        <p>
          En elinstallationsrapport kræves ved salg af boliger opført før 1980.
          Rapporten udarbejdes af en autoriseret elinstallatør og koster typisk
          <strong> 3.000-5.000 kr</strong>. Den vurderer om boligens elinstallationer
          lever op til gældende sikkerhedskrav.
        </p>

        <h3>Ejendomsdatarapport</h3>
        <p>
          Ejendomsdatarapporten er en kortfattet rapport (<strong>ca. 105 kr</strong>)
          der indeholder oplysninger om ejendommens areal, grundareal, offentlig
          vurdering og matrikulære forhold. Den udarbejdes af en opmålingsfirma.
        </p>

        <h3>Ejerskifteforsikring</h3>
        <p>
          Ejerskifteforsikringen dækker skjulte skader på boligen i en periode
          efter overtagelsen. Forsikringen koster typisk
          <strong> 6.000-16.000 kr</strong> for 5-10 års dækning. <strong>Sælger
          betaler traditionelt halvdelen</strong> — typisk 3.000-8.000 kr. Resten
          betaler køber efter overtagelsen.
        </p>

        <h2>Istandsættelse og forbedringer</h2>
        <p>
          De fleste boliger skal gøres klar inden salg. Omfanget afhænger meget af
          boligens stand og dine forventninger til salgsprisen. Typiske udgifter:
        </p>
        <ul>
          <li><strong>Maling:</strong> 10.000-30.000 kr for 2-3 rum inkl. materialer</li>
          <li><strong>Professionel rengøring:</strong> 3.000-8.000 kr</li>
          <li><strong>Mindre reparationer:</strong> 5.000-20.000 kr (lister, fuger, utætheder)</li>
          <li><strong>Home staging:</strong> 5.000-15.000 kr (professionel indretning og møblering)</li>
        </ul>
        <p>
          Home staging kan ofte betale sig. Boliger der fremstår indbydende og
          indflytningsklare sælger typisk <strong>hurtigere og til en højere pris</strong>.
          En investering på 10.000 kr i home staging kan give 30.000-50.000 kr i
          højere salgspris.
        </p>

        <h2>Tinglysning af ny bolig</h2>
        <p>
          Hvis du samtidig køber en ny bolig, skal du betale tinglysningsafgift
          for den nye bolig. Det er køber af DIN bolig der betaler tinglysning
          for den — så du skal kun betale tinglysning for den bolig du køber. Satserne
          i 2026 er:
        </p>
        <ul>
          <li><strong>Skøde:</strong> 0,6% af købesummen + ca. 1.850 kr i fast afgift</li>
          <li><strong>Pantebrev (nyt lån):</strong> 1,45% af lånebeløbet + ca. 1.825 kr i fast afgift</li>
        </ul>
        <p>
          For en ny bolig til 3,5 mio. kr med 80% realkreditlån er tinglysnings-
          omkostningerne ca. <strong>60.000-65.000 kr</strong>.
          <br />
          <em>Kilde: Boligejer.dk, Erhvervsstyrelsen. 2026-estimat.</em>
        </p>

        <h2>Samlet eksempel: Boligsalg for 3 mio. kr</h2>
        <p>
          Lad os regne på et konkret eksempel. Du sælger et hus til 3 mio. kr, køber
          en ny bolig til 3,5 mio. kr, og har en gennemsnitlig stand (lidt istandsættelse).
        </p>

        <table>
          <thead>
            <tr>
              <th>Post</th>
              <th>Beløb</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Salgspris</td>
              <td><strong>3.000.000 kr</strong></td>
            </tr>
            <tr>
              <td>Mæglerhonorar (4,5%)</td>
              <td>-135.000 kr</td>
            </tr>
            <tr>
              <td>Markedsføring</td>
              <td>-10.000 kr</td>
            </tr>
            <tr>
              <td>Energimærke</td>
              <td>-7.500 kr</td>
            </tr>
            <tr>
              <td>Tilstandsrapport</td>
              <td>-6.500 kr</td>
            </tr>
            <tr>
              <td>Elinstallationsrapport</td>
              <td>-4.000 kr</td>
            </tr>
            <tr>
              <td>Ejerskifteforsikring (sælgerandel)</td>
              <td>-4.000 kr</td>
            </tr>
            <tr>
              <td>Ejendomsdatarapport</td>
              <td>-105 kr</td>
            </tr>
            <tr>
              <td>Istandsættelse</td>
              <td>-25.000 kr</td>
            </tr>
            <tr>
              <td>Advokat/berigtigelse</td>
              <td>-10.000 kr</td>
            </tr>
            <tr>
              <td>Indfrielse af lån (gebyrer)</td>
              <td>-3.000 kr</td>
            </tr>
            <tr>
              <td>Flytning (gør-det-selv + trailer)</td>
              <td>-5.000 kr</td>
            </tr>
            <tr>
              <td><strong>Nettoprovenu</strong></td>
              <td><strong>2.789.895 kr</strong></td>
            </tr>
          </tbody>
        </table>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Eksemplet er vejledende. Brug vores beregner med dine egne tal.
        </p>

        <p>
          I eksemplet ovenfor ender sælgeren med <strong>ca. 2,79 mio. kr</strong> i
          nettoprovenu — ca. 210.000 kr går til salgsomkostninger. Hertil kommer
          tinglysning af ny bolig (hvis du køber samtidig) og evt. indfrielse af
          eksisterende lån (restgæld).
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 my-6 not-prose">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Brug vores boligsalgsberegner til at få dit præcise provenu:</strong>{' '}
            <Link href="/boligsalg" className="text-blue-600 hover:underline font-medium">Boligsalgsberegner →</Link>
            {' · '}
            <Link href="/boliglaan" className="text-blue-600 hover:underline">Boliglånberegner</Link>
            {' · '}
            <Link href="/ejendomsvaerdiskat" className="text-blue-600 hover:underline">Ejendomsværdiskat</Link>
            {' · '}
            <Link href="/andelsbolig" className="text-blue-600 hover:underline">Andelsboligberegner</Link>
            {' · '}
            <Link href="/flyttebudget" className="text-blue-600 hover:underline">Flyttebudget</Link>
          </p>
        </div>

        <h2>Hvordan optimerer du dit salgsprovenu?</h2>
        <p>
          Her er de vigtigste råd til at få mest muligt ud af dit boligsalg:
        </p>

        <h3>1. Forhandl mæglersalæret</h3>
        <p>
          De fleste mæglere opererer med vejledende priser, men giver rabat i
          konkurrencen. Indhent <strong>3-4 mæglervurderinger</strong> og brug det
          bedste tilbud som forhandlingskort. Fast salær kan være en fordel ved
          dyre boliger.
        </p>

        <h3>2. Gør istandsættelse selv</h3>
        <p>
          Maling og rengøring kan du ofte gøre selv for en brøkdel af prisen. En
          friskmalet bolig fremstår mere indbydende og kan give en højere salgspris.
          Sørg for at boligen er neutral og personlighedsfri — så kan køber lettere
          forestille sig selv i den.
        </p>

        <h3>3. Overvej home staging</h3>
        <p>
          Professionel home staging koster 5.000-15.000 kr, men kan ofte betale sig.
          Stagede boliger sælger <strong>hurtigere og til en højere pris</strong>
          — typisk 5-15% over tilsvarende ustagede boliger.
        </p>

        <h3>4. Sælg overskydende møbler</h3>
        <p>
          Jo færre ting du skal flytte, jo billigere bliver flytningen. Sælg
          overskydende møbler og indbo på DBA eller i genbrug. Færre møbler gør
          også boligen mere rummelig ved fremvisning.
        </p>

        <h3>5. Undersøg kurssikring</h3>
        <p>
          Har du et obligationslån, kan kursen svinge markant op til indfrielse.
          <strong>Kurssikring</strong> koster 0,1-0,5% af lånebeløbet, men
          fastlåser kursen så du kender dit præcise provenu. Det kan være en
          fordel i volatile markeder.
        </p>

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
          <Link href="/boligsalg" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boligsalgsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn dit nettoprovenu — se præcis hvad du får udbetalt</p>
          </Link>
          <Link href="/boliglaan" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boliglånberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn ydelse på dit nye boliglån</p>
          </Link>
          <Link href="/ejendomsvaerdiskat" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Ejendomsværdiskat →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn ejendomsværdiskat og grundskyld 2026</p>
          </Link>
          <Link href="/andelsbolig" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Andelsboligberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn økonomi ved køb af andelsbolig</p>
          </Link>
          <Link href="/flyttebudget" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Flyttebudget →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvad flytningen koster dig</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/koeb-af-bolig-2026-omkostninger" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Køb af bolig 2026: Guide til omkostninger →</span>
          </Link>
          <Link href="/blog/boliglaan-2026-renter-og-afdrag" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Boliglån 2026: Renter og afdrag →</span>
          </Link>
          <Link href="/blog/fradrag-2026-komplet-guide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Fradrag 2026: Komplet guide →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}