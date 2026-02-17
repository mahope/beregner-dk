import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Guide til lån og renter: Forstå hvad du betaler | MinBeregner.dk",
  description:
    "Alt om lån i Danmark 2026: Annuitetslån vs. serielån, fast vs. variabel rente, ÅOP forklaret. Lær at sammenligne lån og find det billigste.",
  keywords: [
    "lån guide",
    "rente forklaring",
    "annuitetslån",
    "serielån",
    "ÅOP",
    "fast rente",
    "variabel rente",
    "sammenlign lån",
    "låneberegner",
  ],
  openGraph: {
    title: "Guide til lån og renter: Forstå hvad du betaler",
    description:
      "Lær alt om lån, renter og ÅOP. Forstå forskellen på lånetyper og find det billigste lån.",
    url: `${baseUrl}/blog/guide-til-laan-og-renter`,
    type: "article",
  },
  alternates: {
    canonical: `${baseUrl}/blog/guide-til-laan-og-renter`,
  },
};

const faqItems = [
  {
    question: "Hvad er forskellen på annuitetslån og serielån?",
    answer:
      "Ved annuitetslån er den samlede ydelse (rente + afdrag) ens hver måned. Ved serielån er afdraget ens, men ydelsen falder over tid fordi renteandelen mindskes. Annuitetslån er det mest almindelige i Danmark.",
  },
  {
    question: "Hvad er ÅOP?",
    answer:
      "ÅOP (Årlige Omkostninger i Procent) er den samlede pris for et lån udtrykt som en årlig procentsats. Den inkluderer rente, gebyrer og andre omkostninger. Brug altid ÅOP til at sammenligne lån.",
  },
  {
    question: "Er fast eller variabel rente bedst?",
    answer:
      "Fast rente giver tryghed — du kender ydelsen i hele lånets løbetid. Variabel rente er ofte lavere, men kan stige. Variabel rente er bedst hvis du kan tåle udsving, fast rente hvis du vil have forudsigelighed.",
  },
];

export default function LaanOgRenterGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Forside</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-white">Guide til lån og renter</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Økonomi</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            Guide til lån og renter: Forstå hvad du betaler
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-4">
            <time dateTime="2026-02-07">7. februar 2026</time>
            <span>•</span>
            <span>7 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          Når du låner penge, betaler du mere end bare det lånte beløb tilbage. Renter, gebyrer og
          lånetypen påvirker, hvad du ender med at betale. Denne guide forklarer de vigtigste
          begreber, så du kan træffe informerede valg og finde det billigste lån.
        </p>

        <h2>Hvad er rente?</h2>
        <p>
          Rente er den pris, du betaler for at låne penge. Den udtrykkes som en procentsats af det
          lånte beløb per år. Når du låner 100.000 kr til 5% i rente, betaler du 5.000 kr i rente
          det første år (forudsat at du ikke afdrager). Renterne falder over tid, efterhånden som du
          afdrager på lånet.
        </p>
        <p>
          <strong>Nominel rente</strong> er selve rentesatsen. <strong>Effektiv rente</strong> inkluderer
          også renters rente-effekten. Og <strong>ÅOP</strong> (Årlige Omkostninger i Procent) medtager
          også gebyrer og andre omkostninger — det er den mest retvisende måde at sammenligne lån.
        </p>

        <h2>Annuitetslån vs. serielån</h2>
        <p>
          De to mest almindelige lånetyper i Danmark er annuitetslån og serielån:
        </p>

        <h3>Annuitetslån</h3>
        <p>
          Ved et annuitetslån er din samlede ydelse (rente + afdrag) den samme hver måned i hele
          lånets løbetid. I starten går størstedelen af ydelsen til renter, og mod slutningen går
          det meste til afdrag. Det er den mest udbredte lånetype til boliglån og forbrugslån.
        </p>
        <ul>
          <li>Fast månedlig ydelse — let at budgettere</li>
          <li>Højere samlede renteomkostninger end serielån</li>
          <li>Lavere startydelse end serielån</li>
        </ul>

        <h3>Serielån</h3>
        <p>
          Ved et serielån er afdraget det samme hver måned, men renten falder løbende. Det betyder
          at ydelsen er højest i starten og falder over tid. Du betaler mindre i samlet rente, men
          skal kunne håndtere en højere ydelse i begyndelsen.
        </p>
        <ul>
          <li>Lavere samlede renteomkostninger</li>
          <li>Højere startydelse</li>
          <li>Ydelsen falder over tid</li>
        </ul>

        <h3>Eksempel: 1.000.000 kr over 20 år til 4% rente</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Annuitetslån</th>
                <th>Serielån</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Startydelse/md</td>
                <td>ca. 6.060 kr</td>
                <td>ca. 7.500 kr</td>
              </tr>
              <tr>
                <td>Slutydelse/md</td>
                <td>ca. 6.060 kr</td>
                <td>ca. 4.300 kr</td>
              </tr>
              <tr>
                <td>Samlet rente</td>
                <td>ca. 454.000 kr</td>
                <td>ca. 403.000 kr</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Fast vs. variabel rente</h2>
        <p>
          Et af de vigtigste valg ved låntagning er, om du vælger fast eller variabel rente.
        </p>

        <h3>Fast rente</h3>
        <p>
          Med fast rente kender du din ydelse i hele lånets løbetid. Det giver tryghed, men prisen
          er typisk en højere rente end variabel. Fast rente er populært til boliglån i Danmark,
          særligt realkreditlån med fast rente i 30 år.
        </p>
        <ul>
          <li>Fuld forudsigelighed</li>
          <li>Beskyttelse mod rentestigninger</li>
          <li>Typisk 0,5-1,5% højere end variabel</li>
          <li>Mulighed for konvertering ved renteskift</li>
        </ul>

        <h3>Variabel rente</h3>
        <p>
          Variabel rente følger markedsrenten og justeres typisk hvert kvartal, halvår eller år.
          Den er ofte lavere end fast rente, men kan stige markant i perioder med stigende renter.
        </p>
        <ul>
          <li>Lavere startrente</li>
          <li>Risiko for rentestigninger</li>
          <li>Velegnet til kortere lån eller hvis du kan tåle udsving</li>
        </ul>

        <h2>Forstå ÅOP — den vigtigste sammenligning</h2>
        <p>
          ÅOP (Årlige Omkostninger i Procent) er det vigtigste tal, når du sammenligner lån. Mens
          renten kun viser prisen for selve lånet, inkluderer ÅOP alle omkostninger:
        </p>
        <ul>
          <li>Renten</li>
          <li>Oprettelsesgebyr</li>
          <li>Administrationsgebyr</li>
          <li>Løbende gebyrer</li>
          <li>Kursregulering (ved obligationslån)</li>
        </ul>
        <p>
          <strong>Tommelfingerregel:</strong> Jo tættere ÅOP er på den nominelle rente, jo færre
          skjulte gebyrer har lånet. Et lån med 5% rente og 5,3% ÅOP er billigere end et lån med
          4,8% rente og 7% ÅOP.
        </p>

        <h2>Typer af lån i Danmark</h2>

        <h3>Realkreditlån</h3>
        <p>
          Til boligkøb. Op til 80% af boligens værdi. Laveste rente af alle låntyper.
          Kræver tinglyst pant i ejendommen.
        </p>

        <h3>Banklån</h3>
        <p>
          Kan bruges til alt. Typisk dyrere end realkredit men mere fleksibelt.
          Bruges ofte som supplement til realkreditlån (de sidste 15% af boligkøb).
        </p>

        <h3>Forbrugslån</h3>
        <p>
          Til forbrug (elektronik, rejser, bil). Ingen sikkerhed kræves. Højest ÅOP
          af alle låntyper — typisk 5-20%. Sammenlign altid flere udbydere.
        </p>

        <h3>Billån</h3>
        <p>
          Specifikt til bilkøb. Bilen bruges som sikkerhed. Renten er typisk lavere end
          forbrugslån men højere end boliglån.
        </p>

        <h2>Tips til at finde det bedste lån</h2>
        <ol>
          <li><strong>Sammenlign ÅOP</strong> — ikke bare renten</li>
          <li><strong>Overvej løbetiden</strong> — kortere løbetid = færre renter, men højere ydelse</li>
          <li><strong>Tjek mulighed for ekstra indbetaling</strong> — kan spare tusindvis i renter</li>
          <li><strong>Undgå afdragsfrihed</strong> på forbrugslån — du betaler kun renter og gælden forbliver</li>
          <li><strong>Brug en låneberegner</strong> til at se den samlede pris over hele løbetiden</li>
        </ol>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800 dark:text-blue-300">Brug vores beregnere</p>
          <p className="text-blue-700 dark:text-blue-400">
            Beregn din ydelse med vores gratis <Link href="/laaneberegner" className="underline font-medium">låneberegner</Link>,{" "}
            <Link href="/boliglaan" className="underline font-medium">boliglåns-beregner</Link>,{" "}
            <Link href="/billaan" className="underline font-medium">billåns-beregner</Link> eller{" "}
            <Link href="/forbrugslaan" className="underline font-medium">forbrugslåns-beregner</Link>.
            Se også din besparelse med <Link href="/rentefradrag" className="underline font-medium">rentefradrag-beregneren</Link>.
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
