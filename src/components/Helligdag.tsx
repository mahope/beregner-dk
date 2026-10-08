import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import { FAQSchema } from "@/components/StructuredData";
import {
  HELLIGDAG_PATH,
  helligdagAntal,
  helligdagRaekker,
  naesteHelligdage,
  type HelligdagLocale,
} from "@/lib/helligdage";
import { getDageTilHubPath, getDageTilPrefix } from "@/lib/dage-til";
import { getArbejdsdagePath } from "@/lib/arbejdsdage";
import { getDageIAaretPath } from "@/lib/dage-i-aaret";
import { getDomainConfigByLocale } from "@/lib/domain-config";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

function isHelligdagLocale(locale: string): locale is HelligdagLocale {
  return locale === "da" || locale === "se";
}

/**
 * Teksterne til `/helligdage` og `/helgdagar`. Alle tal kommer fra
 * `helligdage.ts`, så en dato eller et antal ikke kan stå i en sætning uden
 * at stå i beregningen (punkt 11) — særligt vigtigt her, fordi tallene skifter
 * med året og listen er opdelt i «faste» og «påskeafhængige».
 */
const COPY: Record<
  HelligdagLocale,
  {
    h1: string;
    lead: string;
    nesteOverskrift: string;
    nesteTom: string;
    dageTil: (n: number) => string;
    iDag: string;
    tabelOverskrift: (aar: number) => string;
    kolonneNavn: string;
    kolonneDato: string;
    kolonneUgedag: string;
    kolonneType: string;
    kolonneDageTil: string;
    kolonneFri: string;
    fast: string;
    flydende: string;
    friJa: string;
    friNej: string;
    sum: string;
    antalSetning: (aar: number, total: number, paaHverdag: number) => string;
    typeOverskrift: string;
    typeFastTekst: string;
    typeFlydendeTekst: string;
    linkDageTil: string;
    linkArbejdsdage: string;
    linkDageIAaret: string;
    faq: { question: string; answer: (aar: number, naeste: ReturnType<typeof naesteHelligdage>) => string }[];
  }
> = {
  da: {
    h1: "Helligdage i Danmark",
    lead: "Se alle helligdage med dato og ugedag — de faste datoer og de der følger påsken. Herunder også næste helligdag og hvor mange af dem du får fri for.",
    nesteOverskrift: "Næste helligdage",
    nesteTom: "Ingen kommende helligdage fundet.",
    dageTil: (n) => (n === 1 ? "om 1 dag" : `om ${n} dage`),
    iDag: "i dag",
    tabelOverskrift: (aar) => `Helligdage ${aar}`,
    kolonneNavn: "Helligdag",
    kolonneDato: "Dato",
    kolonneUgedag: "Ugedag",
    kolonneType: "Slags dato",
    kolonneDageTil: "Dage til",
    kolonneFri: "Ekstra fridag?",
    fast: "Fast dato",
    flydende: "Følger påsken",
    friJa: "Ja",
    friNej: "Nej, i weekenden",
    sum: "I alt",
    antalSetning: (aar, total, paaHverdag) =>
      `${aar} har ${total} helligdage. ${paaHverdag} af dem falder på en hverdag og giver en ekstra fri dag — de øvrige ligger i weekenden.`,
    typeOverskrift: "Faste og påskeafhængige helligdage",
    typeFastTekst:
      "De faste helligdage falder på samme dato hvert år: nytårsdag, grundlovsdag, juleaftensdag, juledag og 2. juledag.",
    typeFlydendeTekst:
      "De øvrige følger påsken, som bevæger sig mellem 22. marts og 25. april. Palmesøndag, skærtorsdag, langfredag, påskedag, 2. påskedag, kristi himmelfartsdag, pinsedag og 2. pinsedag ligger derfor på forskellige ugedage fra år til år.",
    linkDageTil: "Hvor mange dage er der til …?",
    linkArbejdsdage: "Hvor mange arbejdsdage er der på et år?",
    linkDageIAaret: "Hvor mange dage er der på et år?",
    faq: [
      {
        question: "Hvor mange helligdage er der i Danmark?",
        // `aar` er den samme som tabellen ovenfor viser, så svaret ikke kan
        // nævne et andet årstal end listen ved siden af.
        answer: (aar) => {
          const { total, paaHverdag } = helligdagAntal(aar, "da");
          return `Danmark har ${total} helligdage i år, men ${paaHverdag} af dem falder på en hverdag — de øvrige falder i weekenden og giver derfor ikke en ekstra dag fri. NB: palmesøndag, påskedag og pinsedag er altid søndage.`;
        },
      },
      {
        question: "Hvornår er påske, og hvad skyldes det?",
        answer: (_aar, naeste) => {
          const paskedag = naeste.find((r) => r.navn === "Påskedag");
          return `Påskedag er den første søndag efter den første fuldmåne efter forårsjævndøgn, så datoen bevæger sig mellem 22. marts og 25. april.${paskedag ? ` I år er påskedag ${paskedag.datoTekst.toLowerCase()}, og skærtorsdag er fire dage før.` : ""} Skærtorsdag, langfredag, 2. påskedag, kristi himmelfartsdag, pinsedag og 2. pinsedag følger alle samme regel og ligger faste dage fra påsken.`;
        },
      },
      {
        question: "Er der fri for en helligdag, der falder i weekenden?",
        answer: () =>
          "Nej. Falder en helligdag på en lørdag eller en søndag, får du ikke en ekstra fridag i stedet. Derimod er der færre arbejdsdage i år, når mange helligdage rammer hverdage.",
      },
      {
        question: "Hvad med store bededag?",
        answer: () =>
          "Store bededag var dansk helligdag frem til 2023, men blev afskaffet fra 2024 og er ikke længere en fridag. Grundlovsdag (5. juni) havde status af halvhelligdag frem til 2025, men er nu en fuld helligdag med fridag.",
      },
    ],
  },
  se: {
    h1: "Helgdagar i Sverige",
    lead: "Se alla helgdagar med datum och veckodag — de fasta datumen och de som fölger påsken. Här finns även nästa helgdag och hur många av dem du får ledigt.",
    nesteOverskrift: "Nästa helgdagar",
    nesteTom: "Inga kommande helgdagar hittades.",
    dageTil: (n) => (n === 1 ? "om 1 dag" : `om ${n} dagar`),
    iDag: "i dag",
    tabelOverskrift: (aar) => `Helgdagar ${aar}`,
    kolonneNavn: "Helgdag",
    kolonneDato: "Datum",
    kolonneUgedag: "Veckodag",
    kolonneType: "Sortens datum",
    kolonneDageTil: "Dagar kvar",
    kolonneFri: "Extra ledig dag?",
    fast: "Fast datum",
    flydende: "Följer påsken",
    friJa: "Ja",
    friNej: "Nej, i helgen",
    sum: "Totalt",
    antalSetning: (aar, total, paaHverdag) =>
      `${aar} har ${total} helgdagar. ${paaHverdag} av dem faller på en vardag och ger dig en extra ledig dag — de övriga ligger i helgen.`,
    typeOverskrift: "Fasta och påskberoende helgdagar",
    typeFastTekst:
      "De fasta helgdagarna faller på samma datum varje år: nyårsdagen, trettondedag jul, första maj, Sveriges nationaldag, midsommarafton, midsommardagen, alla helgons dag, julafton, juldagen, annandag jul och nyårsafton.",
    typeFlydendeTekst:
      "De övriga följer påsken, som rör sig mellan 22 mars och 25 april. Långfredagen, påskdagen, annandag påsk, kristi himmelsfärdsdag och pingstdagen ligger därför på olika veckodagar från år till år.",
    linkDageTil: "Hur många dagar är det kvar till …?",
    linkArbejdsdage: "Hur många arbetsdagar finns det på ett år?",
    linkDageIAaret: "Hur många dagar finns det på ett år?",
    faq: [
      {
        question: "Hur många helgdagar finns det i Sverige?",
        answer: (aar) => {
          const { total, paaHverdag } = helligdagAntal(aar, "se");
          return `Sverige har ${total} helgdagar i år, men ${paaHverdag} av dem faller på en vardag — de övriga faller i helgen och ger ingen extra ledig dag. Midsommarafton och midsommardagen är i grunden helgdagar, men faller alltid på lörård respektive söndag.`;
        },
      },
      {
        question: "När är påsk, och vad beror det på?",
        answer: (_aar, naeste) => {
          const paskdagen = naeste.find((r) => r.navn === "Påskdagen");
          return `Påskdagen är den första söndagen efter den första fullmånen efter vårdagjämningen, så datumet rör sig mellan 22 mars och 25 april.${paskdagen ? ` I år är påskdagen ${paskdagen.datoTekst.toLowerCase()}, och långfredagen är två dagar före.` : ""} Annandag påsk, kristi himmelsfärdsdag och pingstdagen följer samma regel.`;
        },
      },
      {
        question: "Blir det extra ledigt när en helgdag faller i helgen?",
        answer: () =>
          "Nej. Faller en helgdag på en lördag eller söndag får du ingen extra ledig dag i stället. Däremot blir det färre arbetsdagar på året när många helgdagar träffar vardagar.",
      },
      {
        question: "Gäller flaggning på helgdagar?",
        answer: () =>
          "Sveriges nationaldag (6 juni) och Konungens födelsedag (30 april) är officiella flaggdagar. Flaggning på privata hus sker frivilligt, och det finns bara ett fåtal obligatoriska flaggdagar för byggnader i Sverige.",
      },
    ],
  },
};

async function sideLocale(prefix: string) {
  const { notFound } = await import("next/navigation");
  const domainConfig = await getCurrentDomainConfig();
  const { locale } = domainConfig;
  if (!isHelligdagLocale(locale) || HELLIGDAG_PATH[locale] !== prefix) {
    // Se kommentaren i `Arbejdsdage.tsx`: en `notFound()` her er det, der
    // holder en svensk kopi af listen ude af det danske domænes indeks.
    notFound();
  }
  return { locale: locale as HelligdagLocale, domainConfig };
}

export async function buildHelligdagMetadata(
  prefix: string,
  today: Date
): Promise<Metadata> {
  const domainConfig = await getCurrentDomainConfig();
  const { baseUrl, siteName, ogLocale, locale } = domainConfig;
  if (!isHelligdagLocale(locale) || HELLIGDAG_PATH[locale] !== prefix) {
    return { robots: { index: false, follow: false } };
  }
  const c = COPY[locale];
  const ar = today.getFullYear();
  const { total } = helligdagAntal(ar, locale);
  const title =
    locale === "da"
      ? `Helligdage ${ar}: alle ${total} med dato og ugedag`
      : `Helgdagar ${ar}: alla ${total} med datum och veckodag`;
  const canonical = `${baseUrl}${HELLIGDAG_PATH[locale]}`;
  const languages: Record<string, string> = {
    [getDomainConfigByLocale("da").hreflangCode]: `${getDomainConfigByLocale("da").baseUrl}${HELLIGDAG_PATH.da}`,
    [getDomainConfigByLocale("se").hreflangCode]: `${getDomainConfigByLocale("se").baseUrl}${HELLIGDAG_PATH.se}`,
    "x-default": `${getDomainConfigByLocale("da").baseUrl}${HELLIGDAG_PATH.da}`,
  };

  return {
    title: { absolute: title },
    description: c.lead,
    openGraph: {
      title,
      description: c.lead,
      url: canonical,
      type: "website",
      siteName,
      locale: ogLocale,
      images: OG_IMAGE,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: c.lead,
      images: OG_IMAGE,
    },
    alternates: { canonical, languages },
  };
}

export async function HelligdagRoute({ prefix }: { prefix: string }) {
  const { locale } = await sideLocale(prefix);
  const today = new Date();
  const c = COPY[locale];
  const sti = HELLIGDAG_PATH[locale];
  const da = locale === "da";
  const aar = today.getFullYear();
  const raekker = helligdagRaekker(aar, locale);
  const { total, paaHverdag } = helligdagAntal(aar, locale);
  const naeste = naesteHelligdage(today, locale, 3);
  const dageTilPrefix = getDageTilPrefix(locale);
  const dageTilHub = dageTilPrefix ? dageTilPrefix.replace(/\/$/, "") : undefined;
  const arbejdsdageSti = getArbejdsdagePath(locale);
  const dageIAaretSti = getDageIAaretPath(locale);

  return (
    <div>
      <FAQSchema items={c.faq.map((f) => ({ question: f.question, answer: f.answer(aar, naeste) }))} />
      <Breadcrumbs
        items={[
          {
            name: da ? "Hverdag" : "Praktiskt",
            href: `/kategori/${da ? "hverdag" : "praktisk"}`,
          },
          { name: c.h1, href: sti },
        ]}
      />

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{c.h1}</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{c.lead}</p>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8 not-prose">
        <p className="text-lg text-blue-900 dark:text-blue-100">
          {c.antalSetning(aar, total, paaHverdag)}
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
          {da
            ? "De faste datoer står med dato og ugedag i listen nedenfor."
            : "De fasta datumen står med datum och veckodag i listan nedan."}
        </p>
      </div>

      <div className="mb-8 not-prose overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-3">
          {c.nesteOverskrift}
        </h2>
        {naeste.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">{c.nesteTom}</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th scope="col" className="text-left py-2 pr-3 font-semibold">
                  {c.kolonneNavn}
                </th>
                <th scope="col" className="text-left py-2 px-3 font-semibold">
                  {c.kolonneDato}
                </th>
                <th scope="col" className="text-left py-2 px-3 font-semibold">
                  {c.kolonneUgedag}
                </th>
                <th scope="col" className="text-right py-2 pl-3 font-semibold">
                  {c.kolonneDageTil}
                </th>
              </tr>
            </thead>
            <tbody>
              {naeste.map((r) => (
                <tr key={r.iso} className="border-b border-gray-200 dark:border-gray-700">
                  <th scope="row" className="text-left py-2 pr-3 font-normal">
                    {r.dageTilSlug && dageTilPrefix ? (
                      <Link href={`${dageTilPrefix}${r.dageTilSlug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {r.navn}
                      </Link>
                    ) : (
                      r.navn
                    )}
                  </th>
                  <td className="py-2 px-3 tabular-nums">{r.datoTekst}</td>
                  <td className="py-2 px-3">{r.ugedag}</td>
                  <td className="text-right py-2 pl-3 tabular-nums">
                    {r.dageTil === 0 ? c.iDag : c.dageTil(r.dageTil)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mb-8 not-prose overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-3">{c.tabelOverskrift(aar)}</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th scope="col" className="text-left py-2 pr-3 font-semibold">
                {c.kolonneNavn}
              </th>
              <th scope="col" className="text-left py-2 px-3 font-semibold">
                {c.kolonneDato}
              </th>
              <th scope="col" className="text-left py-2 px-3 font-semibold">
                {c.kolonneUgedag}
              </th>
              <th scope="col" className="text-left py-2 px-3 font-semibold">
                {c.kolonneType}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {c.kolonneFri}
              </th>
            </tr>
          </thead>
          <tbody>
            {raekker.map((r) => (
              <tr key={r.iso} className="border-b border-gray-200 dark:border-gray-700">
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {r.dageTilSlug && dageTilPrefix ? (
                    <Link href={`${dageTilPrefix}${r.dageTilSlug}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      {r.navn}
                    </Link>
                  ) : (
                    r.navn
                  )}
                </th>
                <td className="py-2 px-3 tabular-nums">{r.datoTekst}</td>
                <td className="py-2 px-3">{r.ugedag}</td>
                <td className="py-2 px-3">{r.fast ? c.fast : c.flydende}</td>
                <td className="text-right py-2 pl-3">{r.paaHverdag ? c.friJa : c.friNej}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <th scope="row" className="text-left py-2 pr-3">
                {c.sum}
              </th>
              <td className="py-2 px-3 tabular-nums" colSpan={2}>
                {total}
              </td>
              <td className="py-2 px-3">
                {raekker.filter((r) => r.fast).length} {c.fast.toLowerCase()}
              </td>
              <td className="text-right py-2 pl-3">{paaHverdag} {c.friJa.toLowerCase()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">{c.typeOverskrift}</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-3">{c.typeFastTekst}</p>
        <p className="text-gray-700 dark:text-gray-300">{c.typeFlydendeTekst}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {dageTilHub && (
          <Link
            href={dageTilHub}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            {c.linkDageTil}
          </Link>
        )}
        {arbejdsdageSti && (
          <Link
            href={arbejdsdageSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkArbejdsdage}
          </Link>
        )}
        {dageIAaretSti && (
          <Link
            href={dageIAaretSti}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium"
          >
            {c.linkDageIAaret}
          </Link>
        )}
      </div>

      <FAQ items={c.faq.map((f) => ({ question: f.question, answer: f.answer(aar, naeste) }))} />

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
        {da
          ? `Datoerne regnes af MinBeregners kalenderlogik og dækker ${aar}.`
          : `Datumen räknas av MinBeregners kalenderlogik och täcker ${aar}.`}
      </p>
    </div>
  );
}
