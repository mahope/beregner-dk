import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import { getCurrentDomainConfig } from "@/lib/get-locale";

const SLUG = "kvadratmeter-saadan-regner-du-ud";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;

  return {
    title: "Hvordan regner man kvadratmeter ud? Guide med eksempler",
    description:
      "Areal = længde × bredde. Sådan regner du kvadratmeter ud på vægge, gulv og i rum — med eksempler, materialespild og BBR-areal.",
    keywords: [
      "hvordan regner man kvadratmeter ud",
      "kvadratmeter udregning",
      "kvadratmeter beregner",
      "beregn kvadratmeter",
      "areal beregning",
      "m2 beregner",
    ],
    openGraph: {
      title: "Hvordan regner man kvadratmeter ud? Guide med eksempler",
      description:
        "Areal = længde × bredde. Sådan regner du kvadratmeter ud på vægge, gulv og i rum.",
      url: `${baseUrl}/blog/${SLUG}`,
      type: "article",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${SLUG}`,
    },
  };
}

const faqItems = [
  {
    question: "Hvordan regner man kvadratmeter ud?",
    answer:
      "Gang længden med bredden i meter. Et rum på 4 m × 5 m er 4 × 5 = 20 m². Begge mål skal være i meter — 1 m² svarer til 10.000 cm².",
  },
  {
    question: "Hvad er forskel på kvadratmeter og kubikmeter?",
    answer:
      "Kvadratmeter (m²) er et fladeareal — det bruges til gulv, vægge og grund. Kubikmeter (m³) er et rumfang, altså længde × bredde × højde. Maling og fliser måles i m², mens du flytter sand eller isolerer i m³.",
  },
  {
    question: "Hvor meget maling skal jeg bruge?",
    answer:
      "Mål væggene, træk vinduer og døre fra, og del med dækningen pr. liter. 1 liter maling dækker typisk 10-12 m², så et rum på 39,8 m² kræver 3,3-4,0 liter til ét lag og 6,6-8,0 liter til to lag.",
  },
  {
    question: "Hvor meget spild skal jeg lægge til?",
    answer:
      "Læg 10 % til ved gulvarbejde, fordi der altid går noget til i tilskæring. Et gulv på 20 m² kræver derfor materiale til 22 m². Tommelfingerreglen for alt materiale er 5-10 %.",
  },
  {
    question: "Hvorfor er mit areal mindre end det, der står i BBR?",
    answer:
      "BBR-registret er bygningens registrerede oplysninger, og det følger boliglovens definition af arealer — ikke din egen måling af gulvet. BBR kræver, at alle bygninger over 10 m² er registreret, og at du som køber gennemgår BBR-meddelelsen, fordi du efter overtagelsen er ansvarlig for, at oplysningerne er korrekte.",
  },
];

export default function KvadratmeterGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <FAQSchema items={faqItems} />

      {/* Breadcrumb */}
      <nav className="text-sm mb-6" aria-label="Brødkrumme">
        <Link href="/blog" className="text-blue-600 hover:underline">
          Blog
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">Hvordan regner man kvadratmeter ud?</span>
      </nav>

      <article className="prose prose-lg max-w-none">
        <header className="mb-8 not-prose">
          <span className="text-sm text-blue-600 font-medium">Bolig &amp; Hverdag</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
            Hvordan regner man kvadratmeter ud? Guide med eksempler
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>26. september 2026</span>
            <span>•</span>
            <span>7 min læsetid</span>
          </div>
        </header>

        <p className="lead">
          Det korte svar: <strong>areal = længde × bredde</strong>, og begge mål skal
          være i meter. Et rum der er 4 meter langt og 5 meter bredt er 4 × 5 ={" "}
          <strong>20 m²</strong>. Det er hele teknikken — resten af denne guide er
          de steder, hvor det bliver tricky: vægge med vinduer, materialer med spild,
          andre figurer end firkanten og forskellen mellem dit mål og det, der står i
          BBR.
        </p>

        <h2>Sådan måler du rigtigt</h2>
        <ul>
          <li>
            <strong>Mål i meter.</strong> 1 m² svarer til 10.000 cm², så hvis du
            måler i centimeter skal du dividere med 100, før du ganger.
          </li>
          <li>
            <strong>Mål to gange</strong> og sammenlign. Vægge er sjældent helt
            lige, især i ældre boliger.
          </li>
          <li>
            <strong>Skriv målene ned pr. rum</strong> og læg dem sammen til sidst.
            Det er den eneste måde at få et troværdigt samlet boligareal på.
          </li>
        </ul>
        <p>
          En fod er 30,48 cm, så 12 fod er 3,66 m. Gamle plantegninger og
          ejendomsbogen bruger ofte fod, og det er den mest almindelige kilde til en
          fejl på et par procent.{" "}
          <a
            href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/"
            rel="noreferrer nofollow noopener"
            target="_blank"
          >
            hjemmeland.dk
          </a>{" "}
          (verificeret 26. september 2026).
        </p>

        <h2>De fire figurer du skal kende</h2>
        <p>
          Langt de fleste rum er firkantede, men ikke alle. Værktøjet på{" "}
          <Link href="/kvadratmeter" className="text-blue-600 hover:underline">
            kvadratmeter-siden
          </Link>{" "}
          regner alle fire, og her er reglerne med tal du kan efterprøve.
        </p>

        <h3>1. Rektangel (det er 90 % af alle rum)</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Areal = Længde × Bredde</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: et soveværelse på 4,2 m × 3,6 m = 15,12 m²
          </p>
        </div>

        <h3>2. Cirkel (fx en rund bordplade)</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Areal = π × radius²</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: en rund terrasse med radius 2 m er 3,14 × 4 = 12,6 m²
          </p>
        </div>
        <p>
          Mål diameteren og halver den, så har du radius. En terrasse er næsten
          aldrig helt cirkulær — brug den bredeste og den smalleste måling som en
          god tilnærmelse.
        </p>

        <h3>3. Trekant (fx et skråt vægstykke)</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Areal = (Grundlinje × Højde) / 2</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: en grundlinje på 6 m og en højde på 4 m er (6 × 4) / 2 = 12 m²
          </p>
        </div>

        <h3>4. Trapez (fx et hjørne der er skrået)</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">
            Areal = ((Side 1 + Side 2) / 2) × Højde
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: parallelle sider på 3 m og 5 m med højden 4 m er ((3 + 5) / 2) ×
            4 = 16 m²
          </p>
        </div>

        <h2>Sådan regner du vægge til maling</h2>
        <p>
          Vægge kan ikke ganges med længde × bredde, fordi de går hele vejen rundt.
          Gang <strong>omkredsen</strong> med højden i stedet — og træk så vinduer og
          døre fra.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Vægareal = Omkreds × Højde</p>
          <p className="text-sm text-gray-600 mt-2">
            Rum 4 m × 5 m med 2,40 m høje vægge: omkreds = 2 × (4 + 5) = 18 m, så
            18 × 2,40 = 43,2 m²
          </p>
        </div>
        <ul>
          <li>
            <strong>En standarddør er ca. 1,8-1,9 m²</strong> (0,9 m × 2,1 m) ifølge{" "}
            <a
              href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              hjemmeland.dk
            </a>{" "}
            (verificeret 26. september 2026).
          </li>
          <li>
            Et vindue på 1,2 m × 1,3 m er 1,56 m². Mål dine egne — vinduesformat
            varierer meget.
          </li>
          <li>
            I eksemplet er der én dør og ét vindue: 43,2 − 1,89 − 1,56 ={" "}
            <strong>39,8 m²</strong> at male.
          </li>
        </ul>

        <h2>Så meget maling skal du have</h2>
        <p>
          1 liter maling dækker typisk{" "}
          <strong>10-12 m²</strong> afhængigt af underlag og kvalitet, og to lag er
          standard, når du maler et helt rum.{" "}
          <a
            href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/"
            rel="noreferrer nofollow noopener"
            target="_blank"
          >
            hjemmeland.dk
          </a>{" "}
            angiver 10-12 m² pr. liter (verificeret 26. september 2026). Dækningen
            står på produktets eget datablad, og den afhænger af om underlaget er
            nyt eller farvet.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">
            Liter = (Vægareal × antal lag) / dækning pr. liter
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Ét lag: 39,8 / 12 = 3,3 liter til 39,8 / 10 = 4,0 liter. To lag: 6,6-8,0
            liter, altså to 4-liters dunke.
          </p>
        </div>

        <h2>Sådan regner du materialer til gulv</h2>
        <p>
          Her skal du lægge spild til, fordi der altid går noget til i tilskæring og
          endestød. Tommelfingerreglen er{" "}
          <strong>5-10 % spild</strong>, og danske gulvleverandører anbefaler de 10
          % — det er derfor værktøjet bruger 10 % som standard.{" "}
          <a
            href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/"
            rel="noreferrer nofollow noopener"
            target="_blank"
          >
            hjemmeland.dk
          </a>{" "}
          (verificeret 26. september 2026).
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg not-prose mb-4">
          <p className="font-mono text-lg">Købsareal = Gulvareal × 1,10</p>
          <p className="text-sm text-gray-600 mt-2">
            Eksempel: 20 m² gulv = 22 m² materiale. Det er 4,4 m² mere end den
            viste våde.
          </p>
        </div>
        <p>
          Samme regel gælder fliser (+5-10 %), gulvbrædder (især i forskudte
          mønstre) og tapet. Skal du købe pakker eller ruller, skal du rundt op til
          det næste hele antal — det kan regnes ud fra det samme tal.
        </p>

        <h2>Dit mål mod BBR-arealet</h2>
        <p>
          Ved køb og salg er der to tal i spil: det <em>egentlige</em> boligareal,
          der står i BBR, og det du selv måler med tape. De er ikke nødvendigvis
          ens. BBR er bygningens registrerede oplysninger — opført efter
          boliglovens definition af arealer — og det er et andet tal end det
          opholdsareal, du kan træde på i det rum, du står i.
        </p>
        <p>
          To ting er værd at vide fra det offentlige BBR-register: alle bygninger over
          10 m² skal være registreret, og du skal som køber gennemgå
          BBR-meddelelsen, fordi du efter overtagelsen er ansvarlig for, at
          oplysningerne er korrekte — fejl kan rettes hos kommunen via bbr.dk.{" "}
          <a href="https://bbr.dk/" rel="noreferrer nofollow noopener" target="_blank">
            bbr.dk
          </a>{" "}
          (verificeret 26. september 2026).
        </p>
        <p>
          Vil du slå din egen bolig op og sammenligne de registrerede tal med dine mål,
          står der et BBR-opslag på{" "}
          <Link href="/kvadratmeter" className="text-blue-600 hover:underline">
            kvadratmeter-siden
          </Link>
          . Skal du bruge tallet i en prissætning, er det boligarealet fra BBR der
          bruges — ikke dit eget mål.
        </p>

        <h2>Enhedstabel</h2>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600 text-left">
                <th className="py-2 pr-4">Enhed</th>
                <th className="py-2 pr-4">Svarer til</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">1 m²</td>
                <td className="py-2 pr-4">10.000 cm²</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">1 hektar</td>
                <td className="py-2 pr-4">10.000 m²</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-2 pr-4">1 km²</td>
                <td className="py-2 pr-4">1.000.000 m² = 100 hektar</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Bemærk forskellen på m² og m³: m² er flade (gulv, væg, grund), m³ er
          rumfang (længde × bredde × højde) og bruges fx til sand, isolering og
          flyttesager. De må ikke blandes.
        </p>

        <h2>Regn det ud med værktøjet</h2>
        <p>
          <Link href="/kvadratmeter" className="text-blue-600 hover:underline">
            Kvadratmeter-beregneren
          </Link>{" "}
          regner rektangel, cirkel, trekant og trapez, omregner mellem m², cm² og
          hektar, lægger spild på materialer og regner prisen ud. Den har også
          BBR-opslaget, så du kan tjekke et registreret areal mod dit eget mål.
        </p>

        <div className="not-prose my-8">
          <Link
            href="/kvadratmeter"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Åbn kvadratmeter-beregneren →
          </Link>
        </div>

        <h2>Kilder</h2>
        <ul>
          <li>
            <a
              href="https://bbr.dk/"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              bbr.dk
            </a>{" "}
            — Bygnings- og Boligregistret: registreringspligt over 10 m² og
            BBR-meddelelsen ved køb. Verificeret 26. september 2026.
          </li>
          <li>
            <a
              href="https://hjemmeland.dk/beregner/kvadratmeter-m2-beregner/"
              rel="noreferrer nofollow noopener"
              target="_blank"
            >
              hjemmeland.dk
            </a>{" "}
            — arealformler, 1 m² = 10.000 cm², standarddør 1,8-1,9 m², maling
            10-12 m² pr. liter, 10 % spild ved gulv. Verificeret 26. september
            2026.
          </li>
        </ul>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4 not-prose">
            <h3 className="text-lg">{item.question}</h3>
            <p>{item.answer}</p>
          </div>
        ))}
      </article>

      {/* Related links */}
      <div className="mt-12 pt-8 border-t dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link
            href="/blog/koeb-af-bolig-2026-omkostninger"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium dark:text-white">
              Køb af bolig 2026: omkostninger →
            </span>
          </Link>
          <Link
            href="/blog/boligsalg-2026-guide-til-omkostninger-og-provenu"
            className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="font-medium dark:text-white">
              Boligsalg 2026: omkostninger og provenu →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
