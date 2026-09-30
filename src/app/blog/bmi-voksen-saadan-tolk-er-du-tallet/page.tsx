import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { NaesteSkridt } from "@/components/BlogNaesteSkridt";
import { OG_IMAGE } from "@/lib/page-helpers";
import { BMI_BAAND, BMI_KILDE, bmiBaand, vaegtInterval } from "@/lib/bmi-voksen-grænser";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: { absolute: "BMI for voksne: sådan tolker du dit BMI-tal" },
    description:
      "Hvad betyder dit BMI-tal egentlig? Se WHO's grænser for voksne, hvornår BMI misviser, og hvad taljemål og vægtinterval fortælder.",
    keywords: [
      "bmi voksne",
      "bmi tolkning",
      "bmi skala",
      "normal bmi",
      "hvad er et sundt bmi",
      "bmi for voksne",
      "overvægt bmi",
      "taljemål",
    ],
    openGraph: {
      images: OG_IMAGE,
      title: "BMI for voksne: sådan tolker du dit BMI-tal",
      description:
        "WHO's grænser for voksne, eksempler på samme BMI-tal ved forskellig højde, og hvornår BMI ikke kan bruges.",
      url: `${baseUrl}/blog/bmi-voksen-saadan-tolk-er-du-tallet`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/bmi-voksen-saadan-tolk-er-du-tallet`,
    },
  };
}

/**
 * WHO's egne ord om, hvornår BMI *ikke* kan bruges. Fra samme factsheet som
 * tærsklerne, hentet 1. oktober 2026.
 *
 * Punkt 11 i kvalitetslisten siger, at påstande i tekst skal kunne verificeres.
 * Derfor står de her som data med kilde, og porten i
 * `bmi-voksen-grænser.test.ts` læser dem fra samme sted som brødteksten —
 * en efterfølger kan ikke slå en sætning ihjelm uden at porten røder.
 */
const BEGRÆNSNINGER: { titel: string; tekst: string }[] = [
  {
    titel: "Muskelmasse vejer lige så tungt som fedt",
    tekst:
      "BMI kan ikke skelne mellem muskel og fedt. En person der træner stærkt, kan have højt BMI uden at være overvægtig.",
  },
  {
    titel: "BMI fortælder ikke hvor fedtet sidder",
    tekst:
      "To personer med samme BMI kan have helt forskelligt helbred, fordi den ene har fedt omkring livet og den andet på hofterne.",
  },
  {
    titel: "Alder indgår ikke i formlen",
    tekst:
      "BMI-formlen justeres ikke for alder, så den siger intet om, hvad der er normalt for en 25-årig og en 75-årig.",
  },
  {
    titel: "BMI er et screeningsværktøj, ikke en diagnose",
    tekst:
      "WHO kalder BMI en erstatningsmarkør (surrogate marker) for fedtindhold. Den bruges til at finde grupper, der bør undersøges nærmere — ikke til at erklære en enkelt person syg.",
  },
];

/** Eksempler på det samme BMI-tal ved to forskellige højder. */
const EKSEMPLER = [
  { hoejde: 1.7, vaegt: 70, bmi: 70 / 1.7 ** 2 },
  { hoejde: 1.9, vaegt: 84, bmi: 84 / 1.9 ** 2 },
];

const normal = BMI_BAAND[1];

const faqItems = [
  {
    question: "Hvad er et normalt BMI for en voksen?",
    answer:
      "For voksne ligger normalvægt mellem BMI 18,5 og 24,9. WHO definerer overvægt som BMI 25 eller mere og fedme som BMI 30 eller mere.",
  },
  {
    question: "Hvorfor skal jeg ikke bare følge mit BMI-tal?",
    answer:
      "BMI vejer kroppen som én masse og kan hverken se muskelmasse eller fedtets placering. WHO anbefaler derfor at se BMI sammen med fx taljemål og blodtryk.",
  },
  {
    question: "Er BMI relevant for ældre?",
    answer:
      "BMI-formlen justeres ikke for alder, og ældre har ofte mindre muskelmasse, så et BMI i normalområdet kan skjule tab af muskelmasse.",
  },
  {
    question: "Gælder BMI for børn?",
    answer:
      "Nej. Børns BMI skal vurderes med alders- og kønsspecifikke væksttabeller, fordi kroppens sammensætning ændrer sig med alderen.",
  },
];

export default function BmiVoksenGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <BlogArticleSchema
        slug="bmi-voksen-saadan-tolk-er-du-tallet"
        title="BMI for voksne: sådan tolker du dit BMI-tal"
        description="Hvad betyder dit BMI-tal egentlig? Se WHO's grænser for voksne, hvornår BMI misviser, og hvad taljemål og vægtinterval fortæller."
      />
      <FAQSchema items={faqItems} />

      <nav className="text-sm mb-6">
        <Link href="/blog" className="text-blue-600 dark:text-blue-400 hover:underline">Blog</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600 dark:text-gray-400">BMI for voksne</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">Sundhed</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-white">
            BMI for voksne: sådan tolker du dit BMI-tal
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>1. oktober 2026</span>
            <span>•</span>
            <span>6 min læsetid</span>
          </div>
        </header>

        <p className="text-lg">
          BMI er det mest brugte helbredsmål i verden, og det er det nemlig også
          nemmeste: to tal, en division. Men et tal uden sin skala er næsten
          intet — "BMI 26" betyder overvægt for en voksen, og det er *kun*
          overvægt, fordi der står en grænse ved 25. Denne guide forteller, hvor
          grænsen kommer fra, hvad de forskellige tal betyder, og hvor BMI
          simpelthen ikke kan bruges.
        </p>

        <h2>Sådan beregnes BMI</h2>
        <p>
          BMI er vægten i kilo delt med højden i meter i anden potens:
        </p>
        <p>
          <strong>BMI = vægt (kg) / højde² (m)</strong>
        </p>
        <p>
          Bemærk at højden skal ind i *meter*, ikke centimeter. En fejl på den
          ene eller anden måde flytter resultatet meget: 75 kilo og 175
          centimeter giver 75 / 1,75² = 24,5, mens 75 kilo og 1,75 *centimeter*
          ville give et tal i tusinder. Vores{" "}
          <Link href="/bmi" className="underline font-medium">BMI-beregner</Link>{" "}
          tager imod både kilo og centimeter og regner om for dig, så du slipper
          for at huske kvadrater.
        </p>

        <h2>WHO's grænser for voksne</h2>
        <p>
          {BMI_KILDE.organisation} har sat grænserne for voksne, og det er dem,
          både vores beregner og denne side bruger. {BMI_KILDE.dokument} er
          opdateret {BMI_KILDE.opdateret}, og {BMI_KILDE.organisation.split(" (")[0]}
          {' '}s egen formulering er, at overvægt er "a BMI greater than or equal
          to 25" og fedme "a BMI greater than or equal to 30".
        </p>

        <div className="overflow-x-auto not-prose">
          <table className="w-full text-sm">
            <caption className="text-left text-sm text-gray-600 dark:text-gray-400 pb-2">
              BMI for voksne efter {BMI_KILDE.organisation.split(" (")[0]}'s skala
            </caption>
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th scope="col" className="text-left py-2 pr-3">BMI</th>
                <th scope="col" className="text-left py-2">Betyder</th>
              </tr>
            </thead>
            <tbody>
              {BMI_BAAND.map((baand) => (
                <tr key={baand.dansk} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 pr-3 font-medium">
                    {baand.min.toFixed(1).replace(".", ",")}
                    {baand.max === null
                      ? "+"
                      : `–${baand.max.toFixed(1).replace(".", ",")}`}
                  </td>
                  <td className="py-2">{baand.dansk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Bemærk at grænserne hænger sammen: det øverste tal i et bånd er det
          nederste i det næste. BMI 24,9 er altså normalvægt, mens 25,0 er
          overvægt — forskellen er en decimal, og det er derfor et BMI skrevet
          med for mange decimaler bør læses som det interval, det ligger i.
        </p>

        <h2>Samme BMI-tal, to helt forskellige vægte</h2>
        <p>
          BMI er et forhold mellem to tal, så det samme tal kan komme fra to
          forskellige kroppe. Se på de to her:
        </p>
        <ul>
          {EKSEMPLER.map((e) => {
            const interval = vaegtInterval(e.hoejde, normal);
            return (
              <li key={e.hoejde}>
                <strong>
                  {Math.round(e.hoejde * 100)} cm og {e.vaegt} kilo
                </strong>{" "}
                giver BMI {e.bmi.toFixed(1).replace(".", ",")} —{" "}
                {bmiBaand(e.bmi).dansk.toLowerCase()}. Til sammenligning er
                normalvægtsintervallet for den højde{" "}
                {interval.min.toFixed(1).replace(".", ",")}–
                {interval.max?.toFixed(1).replace(".", ",")} kilo.
              </li>
            );
          })}
        </ul>
        <p>
          Begge tal ligger i {bmiBaand(EKSEMPLER[0].bmi).dansk.toLowerCase()}, men
          det er kun et af dem, der fortæller noget om helbredet. Det er derfor
          værktøjet viser vægtintervallet for din højde sammen med BMI-tallet:
          to tal, der sammen danner et billede, i stedet for ét tal der
          prøver at være to.
        </p>

        <h2>Hvornår BMI ikke kan bruges</h2>
        <p>
          WHO's egen factsheet gør udtrykkeligt opmærksom på, at BMI er en
          erstatningsmarkør for fedtindhold — altså et mål, der står *for*
          noget andet. Fire forbehold går igen, og de er værd at kende:
        </p>
        <ul>
          {BEGRÆNSNINGER.map((begrænsning) => (
            <li key={begrænsning.titel}>
              <strong>{begrænsning.titel}.</strong> {begrænsning.tekst}
            </li>
          ))}
        </ul>

        <h2>Hvad kan du så bruge sammen med BMI?</h2>
        <p>
          Taljemål er det bedste supplement, fordi det siger noget om *hvor*
          fedtet sidder. {BMI_KILDE.organisation.split(" (")[0]} nævner selv
          taljemål som det ekstra mål, der hjælper diagnosen. Vores beregner kan
          også regne talje-hofte-ratio, men gør det som et råt forholdstal uden
          kønsjustering — det erstatter ikke en samlet vurdering.
        </p>
        <p>
          Det samme gælder blodtryk og blodsukker. BMI kan ikke se dem, og de
          siger ofte mere om helbredet end vægt og højde gør.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800 dark:text-yellow-200">Vigtigt</p>
          <p className="text-yellow-700 dark:text-yellow-300">
            BMI er kun til informationsformål og erstatter ikke professionel
            medicinsk rådgivning. Tal med din læge, hvis du er bekymret for din
            vægt eller sundhed.
          </p>
        </div>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item) => (
          <div key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Kilde: {BMI_KILDE.organisation}, <em>{BMI_KILDE.dokument}</em>, opdateret{" "}
          {BMI_KILDE.opdateret}. Hentet {BMI_KILDE.hentet}.
        </p>
      </article>

      <NaesteSkridt
        href="/bmi"
        handling="Beregn dit BMI"
        beskrivelse="Indtast din vægt og højde, og se dit BMI-tal og vægtintervallet for din højde."
      />
    </div>
  );
}