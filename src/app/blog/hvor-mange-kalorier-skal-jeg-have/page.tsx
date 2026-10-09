import type { Metadata } from "next";
import Link from "next/link";
import { FAQSchema } from "@/components/StructuredData";
import BlogArticleSchema from "@/components/BlogArticleSchema";
import { NaesteSkridt } from "@/components/BlogNaesteSkridt";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { formatNumber } from "@/lib/format";
import { OG_IMAGE } from "@/lib/page-helpers";
import {
  AKTIVITETS_FAKTORER,
  beregnBmr,
  beregnTdee,
  KALORIE_OVERSKUD,
  KALORIE_UNDERSKUD,
  kalorierForMaal,
  PROTEIN_G_PER_KG,
  type AktivitetsNiveau,
} from "@/lib/makroer";
import {
  KALORIER_EKSEMPEL,
  KALORIER_KG_PR_UGE,
  KALORIER_USIKKERHED_PCT,
  kalorierEksempelTal,
} from "@/lib/kalorier-eksempler";
import {
  VAEGTTAB_EKSEMPEL,
  VAEGTTAB_KCAL_PR_KG,
  VAEGTTAB_KG_PR_UGE,
  VAEGTTAB_MIN_KVINDER,
  VAEGTTAB_MIN_MAEND,
  vaegttabEksempelTal,
} from "@/lib/vaegttab-eksempler";

const SLUG = "hvor-mange-kalorier-skal-jeg-have";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const baseUrl = dc.baseUrl;
  const tal = kalorierEksempelTal();

  return {
    title: {
      absolute: `Hvor mange kalorier skal jeg have? ${da(tal.mandTdee)} kcal om dagen`,
    },
    description:
      `Dit behov er stofskifte ganget med aktivitet. Eksempel: ${da(KALORIER_EKSEMPEL.alder)} år, ` +
      `${da(KALORIER_EKSEMPEL.vaegtKg)} kg, moderat = ${da(tal.mandTdee)} kcal. Se regnestykket for at tabe dig.`,
    keywords: [
      "hvor mange kalorier skal jeg have",
      "kaloriebehov",
      "kalorier for at tabe mig",
      "hvor mange kalorier skal jeg spise for at tabe mig",
      "kalorieunderskud",
      "grundforbrænding",
      "Mifflin-St Jeor",
    ],
    openGraph: {
      images: OG_IMAGE,
      title: `Hvor mange kalorier skal jeg have? ${da(tal.mandTdee)} kcal om dagen`,
      description: `Dit kaloriebehov ud fra krop og aktivitet — med regnestykket bag tallet.`,
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

const da = (beloeb: number, decimaler = 0) =>
  formatNumber(beloeb, "da", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimaler,
  });

/** Eksemplet er det samme, /kalorier og /vaegttab citerer: mand, 80 kg. */
const eksempel = KALORIER_EKSEMPEL;
const tal = kalorierEksempelTal();
const vaegttab = vaegttabEksempelTal();

/**
 * Formlen bag tallet, skrevet med eksemplets egne værdier — så sætningen ikke
 * kan hænge sammen med én BMR, mens beregneren regner en anden.
 */
const formelBmr = beregnBmr("mand", eksempel.vaegtKg, eksempel.hoejdeCm, eksempel.alder);

/** 500 kcal rundt om dagen er 3.500 om ugen, og det delt i 7.700 kcal pr. kg. */
const kgPrUgeRegnet = ((KALORIE_UNDERSKUD * 7) / VAEGTTAB_KCAL_PR_KG).toFixed(2).replace(".", ",");

const aktivitetRaekker: { niveau: AktivitetsNiveau; label: string; forklaring: string }[] = [
  { niveau: "stillesiddende", label: "Stillesiddende", forklaring: "kontorarbejde, ingen planlagt træning" },
  { niveau: "let", label: "Let", forklaring: "let motion 1-3 dage om ugen" },
  { niveau: "moderat", label: "Moderat", forklaring: "motion 3-5 dage om ugen" },
  { niveau: "aktiv", label: "Aktiv", forklaring: "hård træning 6-7 dage om ugen" },
  { niveau: "meget_aktiv", label: "Meget aktiv", forklaring: "fysisk arbejde eller træning to gange dagligt" },
];

const proteinKg = eksempel.vaegtKg;
const proteinMin = Math.round(PROTEIN_G_PER_KG.tab.min * proteinKg);
const proteinMaks = Math.round(PROTEIN_G_PER_KG.tab.max * proteinKg);

const faqItems = [
  {
    question: "Hvor mange kalorier skal jeg have om dagen?",
    answer:
      `Det afhænger af din krop og din hverdag. En mand på ${da(eksempel.vaegtKg)} kg, ` +
      `${da(eksempel.hoejdeCm)} cm og ${da(eksempel.alder)} år har et stofskifte på ${da(tal.mandBmr)} kcal, ` +
      `og ved moderat aktivitet bliver det ${da(tal.mandTdee)} kcal om dagen. ` +
      `Samme krop som kvinde giver ${da(tal.kvindeTdee)} kcal, fordi formlen fratrægger mere ved kvinder. ` +
      `Læg dine egne tal ind i kalorieberegneren, og du har dit eget svar.`,
  },
  {
    question: "Hvor mange kalorier skal jeg spise for at tabe mig?",
    answer:
      `Start med dit forbrug og træk ${da(KALORIE_UNDERSKUD)} kcal fra. I eksemplet bliver det ` +
      `${da(tal.mandTdee)} − ${da(KALORIE_UNDERSKUD)} = ${da(tal.dagligtMaal)} kcal om dagen. ` +
      `Et underskud på ${da(KALORIE_UNDERSKUD)} kcal svarer til ${kgPrUgeRegnet} kg om ugen, ` +
      `og siden et kilo fedt svarer til ${da(VAEGTTAB_KCAL_PR_KG)} kcal, skal du samlet have et ` +
      `underskud på ${da(VAEGTTAB_KCAL_PR_KG)} kcal pr. kilo du vil tabe dig.`,
  },
  {
    question: "Hvor hurtigt kan jeg tabe mig?",
    answer:
      `En sund takt er ${da(VAEGTTAB_KG_PR_UGE.min)}-${da(VAEGTTAB_KG_PR_UGE.maks)} kg om ugen. ` +
      `Vil du tabe dig ${da(VAEGTTAB_EKSEMPEL.tabKg)} kg på ${da(VAEGTTAB_EKSEMPEL.uger)} uger, ` +
      `skal det samlede underskud være ${da(vaegttab.samletUnderskud)} kcal — altså ${da(vaegttab.dagligtDeficit)} kcal om dagen, ` +
      `og du lander på ${da(vaegttab.dagligtMaal)} kcal dagligt. Hurtigere end det går ofte ud over muskelmasse.`,
  },
  {
    question: "Kan jeg gå ned under mit stofskifte?",
    answer:
      `BeregnTallene sætter aldrig et mål under dit stofskifte på ${da(tal.mandBmr)} kcal, for kroppen ` +
      `bruger det alene for at holde dig i live. Som tommelfingerregel skal du holde dig over ` +
      `${da(VAEGTTAB_MIN_KVINDER)} kcal som kvinde og ${da(VAEGTTAB_MIN_MAEND)} kcal som mand, ` +
      `medmindre en læge har sat en kureplan op for dig.`,
  },
  {
    question: "Hvor meget protein skal jeg have, når jeg taber mig?",
    answer:
      `${da(PROTEIN_G_PER_KG.tab.min, 1)}-${da(PROTEIN_G_PER_KG.tab.max, 1)} g pr. kg kropsvægt holder musklerne ` +
      `i gang, når kalorierne falder. Ved ${da(proteinKg)} kg er det ${da(proteinMin)}-${da(proteinMaks)} g om dagen. ` +
      `Tilhører du den tunge ende, kan det svare til et måltid mere om dagen.`,
  },
  {
    question: "Er tallet præcist?",
    answer:
      `Nej, det er et skøn. Formlen her er Mifflin-St Jeor, som ligger ${da(KALORIER_USIKKERHED_PCT.min)}-${da(KALORIER_USIKKERHED_PCT.maks)} % ` +
      `ved siden af for den enkelte. Spis efter målet i to uger og vej dig ugentligt: ` +
      `går vægten som planlagt, ramte skønnet. Gør den ikke det, justerer du med 100-200 kcal.`,
  },
  {
    question: "Skal jeg tælle kalorier for altid?",
    answer:
      `Nej. Tallet er mest nyttigt som udgangspunkt, indtil du kender mængderne. ` +
      `Herefter er det nok at holde øje med vægten og justere, hvis den bevæger sig den forkerte vej. ` +
      `Blandingen af protein, kulhydrat og fedt kan du også læse af i kalorieberegneren.`,
  },
];

export default function KaloriebehovBlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <BlogArticleSchema
        slug="hvor-mange-kalorier-skal-jeg-have"
        title={`Hvor mange kalorier skal jeg have? ${da(tal.mandTdee)} kcal om dagen`}
        description="Dit kaloriebehov ud fra krop og aktivitet — med regnestykket bag tallet."
        category="Sundhed"
      />

      <nav className="text-sm mb-4 text-gray-600 dark:text-gray-400">
        <Link href="/" className="hover:underline">
          Forside
        </Link>
        {" / "}
        <Link href="/blog" className="hover:underline">
          Blog
        </Link>
        {" / "}
        <span>Hvor mange kalorier skal jeg have?</span>
      </nav>

      <article className="prose dark:prose-invert max-w-none">
        <h1>Hvor mange kalorier skal jeg have om dagen?</h1>
        <p className="lead">
          Dit kaloriebehov er to tal lagt sammen: hvad kroppen bruger i hvile, og
          hvad du lægger oveni ved at bevæge dig. Et konkret eksempel: en mand på{" "}
          {da(eksempel.vaegtKg)} kg, {da(eksempel.hoejdeCm)} cm og{" "}
          {da(eksempel.alder)} år, der er moderat aktiv, bruger{" "}
          <strong>{da(tal.mandTdee)} kcal om dagen</strong>. Skal du tabe dig,
          ligger målet på {da(tal.dagligtMaal)} kcal. Her er regnestykket bag
          begge tal.
        </p>

        <h2>Kort svar</h2>
        <ul>
          <li>
            Dit stofskifte i hvile (BMR) er{" "}
            <strong>{da(formelBmr)} kcal</strong> for eksemplets mand.
          </li>
          <li>
            Ganget med aktivitetsfaktoren {da(AKTIVITETS_FAKTORER[eksempel.aktivitet])}{" "}
            bliver det <strong>{da(tal.mandTdee)} kcal</strong> — det tal, du holder
            vægten på.
          </li>
          <li>
            For at tabe dig trækker du {da(KALORIE_UNDERSKUD)} kcal fra og lander
            på <strong>{da(tal.dagligtMaal)} kcal</strong>, hvilket giver ca.{" "}
            {kgPrUgeRegnet} kg om ugen.
          </li>
          <li>
            For at bygge muskler lægger du {da(KALORIE_OVERSKUD)} kcal oveni — et overskud, ikke
            en løfteskål.
          </li>
        </ul>

        <h2>De to tal, der bestemmer dit behov</h2>
        <p>
          Første tal er dit <strong>stofskifte i hvile</strong> — den energi,
          kroppen bruger på at være i live: puls, vejrtrækning, temperatur,
          reparering. Det regnes med Mifflin-St Jeor, som er den formel, de
          fleste danske sundhedsberegner og forskellige undersøgelser bygger på.
          For en mand ganger du vægten med 10, højden med 6,25, alderen med 5 og
          lægger 5 til:
        </p>
        <p>
          10 × {da(eksempel.vaegtKg)} + 6,25 × {da(eksempel.hoejdeCm)} − 5 ×{" "}
          {da(eksempel.alder)} + 5 = <strong>{da(formelBmr)} kcal</strong>
        </p>
        <p>
          For en kvinde er den sidste konstante −161 i stedet for +5, og derfor
          giver samme krop {da(tal.kvindeTdee)} kcal ved moderat aktivitet mod
          mandens {da(tal.mandTdee)} kcal. Det andet tal er din aktivitet: hvor
          meget du bevæger dig ud over at eksistere.
        </p>
        <table>
          <thead>
            <tr>
              <th>Aktivitetsniveau</th>
              <th>Faktor</th>
              <th>Typisk hverdag</th>
            </tr>
          </thead>
          <tbody>
            {aktivitetRaekker.map((raekke) => (
              <tr key={raekke.niveau}>
                <td>{raekke.label}</td>
                <td>{da(AKTIVITETS_FAKTORER[raekke.niveau])}</td>
                <td>{raekke.forklaring}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Vælg det niveau, du rent faktisk har i en almindelig uge — ikke det, du
          har i en god uge. Overvurderer du det, regner beregneren med en
          daglig ledighed på flere hundrede kalorier, og så taber du dig ikke.
        </p>

        <h2>Sådan regner du ud, hvad du skal spise for at tabe dig</h2>
        <p>
          Et kilo fedt svarer til omkring {da(VAEGTTAB_KCAL_PR_KG)} kcal. Den
          samlede omregning er derfor altid den samme: det underskud, du mangler
          at have spist, delt med {da(VAEGTTAB_KCAL_PR_KG)}. Et dagligt underskud
          på {da(KALORIE_UNDERSKUD)} kcal er {da(KALORIE_UNDERSKUD * 7)} kcal om
          ugen, hvilket giver {kgPrUgeRegnet} kg om ugen — rundet ned til de{" "}
          {da(KALORIER_KG_PR_UGE)} kg, artiklen og beregneren plejer at regne
          med.
        </p>
        <p>
          <strong>Eksempel:</strong> {da(eksempel.vaegtKg)} kg,{" "}
          {da(eksempel.hoejdeCm)} cm, {da(eksempel.alder)} år, moderat aktiv.
          Forbruget er {da(tal.mandTdee)} kcal. Målet ved vægttab bliver{" "}
          {da(tal.mandTdee)} − {da(KALORIE_UNDERSKUD)} = {da(tal.dagligtMaal)}{" "}
          kcal om dagen.
        </p>
        <p>
          Har du i stedet en frist — fx {da(VAEGTTAB_EKSEMPEL.tabKg)} kg før{" "}
          {da(VAEGTTAB_EKSEMPEL.uger)} uger — fordeler du det samlede underskud på
          dagene. {da(VAEGTTAB_EKSEMPEL.tabKg)} kg svarer til{" "}
          {da(vaegttab.samletUnderskud)}{" "}
          kcal, og det giver {da(vaegttab.dagligtDeficit)} kcal om dagen og et
          dagligt mål på {da(vaegttab.dagligtMaal)} kcal. Bemærk, at målet aldrig
          kommer under dit stofskifte i hvile.
        </p>

        <h2>Hvor langt ned må du gå?</h2>
        <p>
          Der er en fysisk grænse. Kroppen bruger {da(formelBmr)} kcal i eksemplet
          på at holde dig i live, og kommer du under det, skærer du i den
          vedligeholdelse, kroppen ikke kan undvære. Beregneren sætter derfor
          aldrig et mål under stofskiftet. Som tommelfingerregel skal du holde
          dig over {da(VAEGTTAB_MIN_KVINDER)} kcal som kvinde og{" "}
          {da(VAEGTTAB_MIN_MAEND)} kcal som mand, medmindre en læge har sat noget
          andet op for dig.
        </p>
        <p>
          En sund takt er {da(VAEGTTAB_KG_PR_UGE.min)}-{da(VAEGTTAB_KG_PR_UGE.maks)}{" "}
          kg om ugen. Taber du hurtigere, taber du både fedt og musler, og
          muskeltab sænker netop det forbrug, du gerne vil have højt, når du
          senere skal holde vægten.
        </p>

        <h2>Protein, når kalorierne falder</h2>
        <p>
          Et underskud på {da(KALORIE_UNDERSKUD)} kcal er kun halvdelen af
          arbejdet. Den anden halvdel er at holde muskulaturen:{" "}
          {da(PROTEIN_G_PER_KG.tab.min, 1)}-{da(PROTEIN_G_PER_KG.tab.max, 1)} g
          protein pr. kg kropsvægt om dagen, altså {da(proteinMin)}-
          {da(proteinMaks)} g for en person på {da(proteinKg)} kg. Det svarer
          groft til 25-35 g protein i hvert af tre måltider, og det er den
          ændring, folk oftest springer over — og så taber de muskler i stedet
          for fedt.
        </p>

        <h2>Hvad beregneren ikke ved</h2>
        <p>
          Formelen ligger typisk {da(KALORIER_USIKKERHED_PCT.min)}-
          {da(KALORIER_USIKKERHED_PCT.maks)} % ved siden af for den enkelte, og{" "}
          {da(AKTIVITETS_FAKTORER[eksempel.aktivitet])} er en
          gennemsnitsfaktor — ikke en måling af din krop. Derfor er tallene her
          vejledende. Den bedste kontrol er din egen vægtkurve: spis efter målet
          i to uger, vej dig ugentligt, og justér med 100-200 kcal, hvis vægten
          bevæger sig den forkerte vej.
        </p>

        <h2>Kilder</h2>
        <ul>
          <li>
            Formlen for stofskifte og aktivitetsfaktorerne er Mifflin-St Jeor og
            de sædvanlige PAL-faktorer — de samme værdier,{" "}
            <Link href="/kalorier">kalorieberegneren</Link> bruger.
          </li>
          <li>
            Et kilo fedt svarer til {da(VAEGTTAB_KCAL_PR_KG)} kcal, og
            vejledningen om {da(VAEGTTAB_KG_PR_UGE.min)}-
            {da(VAEGTTAB_KG_PR_UGE.maks)} kg om ugen er den anbefaling,{" "}
            <Link href="/vaegttab">vægttabsberegneren</Link> arbejder ud fra.
          </li>
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Alle tal i artiklen regnes af de samme funktioner, som beregnerne på
          /kalorier og /vaegttab kalder, så artiklen, tabellerne og værktøjerne
          ikke kan komme til at stå med forskellige beløb.
        </p>

        <h2>Ofte stillede spørgsmål</h2>
        {faqItems.map((item, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.question}</h3>
            <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
          </div>
        ))}
      </article>

      <FAQSchema items={faqItems} />

      <NaesteSkridt
        href="/kalorier"
        handling="Beregn dit kaloriebehov"
        beskrivelse={`Læg køn, alder, vægt, højde og aktivitet ind, og få BMR, TDEE og makroer for at tabe dig, holde vægten eller bygge.`}
        sekundaer={{ href: "/vaegttab", handling: "Læg en helt plan for vægttab" }}
      />

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede beregnere</h2>
        <div className="grid gap-4">
          <Link href="/kalorier" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Kalorieberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beregn BMR, TDEE og makroer for dit mål</p>
          </Link>
          <Link href="/vaegttab" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Vægttabsberegner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Se hvor mange kg du kan tabe dig på en given tid</p>
          </Link>
          <Link href="/bmi" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">BMI-beregner →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Find dit BMI og det vægtinterval, der hører til</p>
          </Link>
          <Link href="/proteinbehov" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Proteinbehov →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Så meget protein giver din træning og din vægt mening for</p>
          </Link>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Relaterede artikler</h2>
        <div className="grid gap-4">
          <Link href="/blog/bmi-voksen-saadan-tolk-er-du-tallet" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">BMI for voksne: sådan tolker du dit tal →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">WHO's grænser, og hvad BMI ikke kan fortælle dig</p>
          </Link>
          <Link href="/blog/maanedsbudget-2026-komplet-guide" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Månedsbudget 2026: komplet guide →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Læg madbudgettet ind i et budget, der holder</p>
          </Link>
          <Link href="/blog/spar-penge-paa-braendstof" className="block p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium text-gray-900 dark:text-white">Spis dig sundere og spar penge →</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sådan ændrer du vaner, der både koster sundhed og penge</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
