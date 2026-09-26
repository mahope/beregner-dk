import AlderBeregner from "@/components/AlderBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ALDER_EKSEEMPLER, formatAlder } from "@/lib/alder-eksempler";
import { getIntlLocale } from "@/lib/format";

function formatDato(iso: string, locale: "da" | "no" | "se"): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(aar, maaned - 1, dag));
}

export async function generateMetadata() {
  return generatePageMetadata("alder");
}

export default async function AlderPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("alder", locale) || getPageData("alder", "da")!;
  const intlLocale = getIntlLocale(locale);

  return (
    <div className="max-w-4xl mx-auto">
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/alder`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/alder" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {pageData.title}
        </h1>
        <p className="text-lg text-gray-600">
          {pageData.description}
        </p>
      </div>

      {/* Svar-først: Google autocomplete (2026-09-26) har "beregn alder mellem
          to datoer" som tredje forslag til "beregn alder", og GSC viser
          6.013 visninger på pos. 7,8 med 0,6 % CTR. Værktøjet har haft feltet
          "Beregn alder pr. dato" hele tiden, men siden nævnte det aldrig:
          "mellem to datoer" stod nul gange. Tallene nedenfor kommer fra
          `beregnAlder` — samme modul som værktøjet bruger. */}
      {(locale === "da" || locale === "se") && (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-3 dark:text-white">
          {locale === "se"
            ? "Svar på de vanligaste åldersfrågorna"
            : "Svar på de oftest stillede aldersspørgsmål"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {locale === "se"
            ? "Båda fälten kan fyllas i: födelsedatum och det datum du vill räkna fram till. Då räknar vårktöjet hela år, månader och dagar."
            : "Begge felter kan udfyldes: fødselsdato og den dato, du vil regne frem til. Så tæller værktøjet hele år, måneder og dage."}
        </p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{locale === "se" ? "Född" : "Født"}</th>
                <th>{locale === "se" ? "Räknar till" : "Regner til"}</th>
                <th>{locale === "se" ? "Alder" : "Alder"}</th>
                <th>{locale === "se" ? "Dagar levda" : "Dage levet"}</th>
              </tr>
            </thead>
            <tbody>
              {ALDER_EKSEEMPLER.map((eksempel) => (
                <tr key={`${eksempel.foedselsdato}-${eksempel.beregningsdato}`}>
                  <td>{formatDato(eksempel.foedselsdato, locale)}</td>
                  <td>{formatDato(eksempel.beregningsdato, locale)}</td>
                  <td>
                    <strong>{formatAlder(eksempel, locale)}</strong>
                  </td>
                  <td>
                    {new Intl.NumberFormat(intlLocale).format(eksempel.totalDage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {locale === "se"
            ? `Född ${formatDato(ALDER_EKSEEMPLER[0].foedselsdato, locale)} var du alltså ${formatAlder(ALDER_EKSEEMPLER[1], locale)} ${formatDato(ALDER_EKSEEMPLER[1].beregningsdato, locale)} — og ${formatAlder(ALDER_EKSEEMPLER[0], locale)} ${formatDato(ALDER_EKSEEMPLER[0].beregningsdato, locale)}.`
            : `Født ${formatDato(ALDER_EKSEEMPLER[0].foedselsdato, locale)} var du altså ${formatAlder(ALDER_EKSEEMPLER[1], locale)} ${formatDato(ALDER_EKSEEMPLER[1].beregningsdato, locale)} — og ${formatAlder(ALDER_EKSEEMPLER[0], locale)} ${formatDato(ALDER_EKSEEMPLER[0].beregningsdato, locale)}.`}
        </p>
        <ul className="mt-4 space-y-2">
          {ALDER_EKSEEMPLER.map((eksempel) => (
            <li key={`bem-${eksempel.foedselsdato}-${eksempel.beregningsdato}`} className="text-sm text-gray-600 dark:text-gray-400">
              {eksempel.bemaerkning[locale === "se" ? "se" : "da"]}
            </li>
          ))}
        </ul>
      </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
        <AlderBeregner />
      </div>

      {/* Informativ tekst - SEO */}
      {locale === "da" && (
      <div className="prose max-w-none mb-8">
        <h2>Om aldersberegning</h2>
        <p>
          At kende sin <strong>præcise alder</strong> kan være nyttigt i mange sammenhænge - fra <strong>juridiske dokumenter</strong>
          {" "}til <strong>sundhedsberegninger</strong>. Vores aldersberegner giver dig et detaljeret overblik over din alder
          i forskellige <strong>tidsenheder</strong>.
        </p>

        <h3>Alder i forskellige enheder</h3>
        <p>
          Din alder kan måles i mange enheder:
        </p>
        <ul>
          <li><strong>År</strong> - Den mest almindelige måde at angive alder</li>
          <li><strong>Måneder</strong> - Bruges ofte for småbørn</li>
          <li><strong>Uger</strong> - Bruges ved graviditet og for nyfødte</li>
          <li><strong>Dage</strong> - For præcise beregninger</li>
          <li><strong>Timer/Minutter</strong> - For sjov og kuriositet</li>
        </ul>

        <h3>Juridisk alder i Danmark</h3>
        <p>
          I Danmark har alder juridisk betydning ved flere milepæle:
        </p>
        <ul>
          <li>15 år - Seksuel lavalder</li>
          <li>18 år - Myndighedsalder, stemmeret, kørekort til bil</li>
          <li>21 år - Kan adoptere (med undtagelser)</li>
          <li>Pensionsalder - Afhænger af fødselsår (ca. 67-68 år)</li>
        </ul>

        <h3>Stjernetegn</h3>
        <p>
          <strong>Stjernetegnene</strong> er baseret på den <strong>vestlige astrologi</strong> og følger <strong>solens position</strong>
          {" "}i zodiakken på fødselstidspunktet. Der er <strong>12 tegn</strong>, hver med unikke karaktertræk
          ifølge astrologisk tradition.
        </p>
      </div>
      )}

      {locale === "se" && (
      <div className="prose max-w-none mb-8">
        <h2>Om åldersberäkning</h2>
        <p>
          Att känna till sin <strong>exakta ålder</strong> kan vara användbart i många sammanhang - från <strong>juridiska dokument</strong>
          {" "}till <strong>hälsoberäkningar</strong>. Vår åldersberäknare ger dig en detaljerad överblick över din ålder
          i olika <strong>tidsenheter</strong>.
        </p>

        <h3>Ålder i olika enheter</h3>
        <p>
          Din ålder kan mätas i många enheter:
        </p>
        <ul>
          <li><strong>År</strong> - Det vanligaste sättet att ange ålder</li>
          <li><strong>Månader</strong> - Används ofta för små barn</li>
          <li><strong>Veckor</strong> - Används vid graviditet och för nyfödda</li>
          <li><strong>Dagar</strong> - För exakta beräkningar</li>
          <li><strong>Timmar/Minuter</strong> - För skoj och nyfikenhet</li>
        </ul>

        <h3>Åldersgränser</h3>
        <p>
          Åldern har juridisk betydelse vid flera milstolpar:
        </p>
        <ul>
          <li>15 år - Sexuell lågålder i många länder</li>
          <li>18 år - Myndighetsålder, rösträtt, körkort för bil</li>
          <li>21 år - Åldersgräns för vissa rättigheter (med undantag)</li>
          <li>Pensionsålder - Beror på födelseår (ca 65-68 år)</li>
        </ul>

        <h3>Stjärntecken</h3>
        <p>
          <strong>Stjärntecknen</strong> baseras på den <strong>västerländska astrologin</strong> och följer <strong>solens position</strong>
          {" "}i zodiaken vid födelsetillfället. Det finns <strong>12 tecken</strong>, vart och ett med unika karaktärsdrag
          enligt astrologisk tradition.
        </p>
      </div>
      )}

      {/* FAQ */}
      <div className="mb-8">
        <FAQ items={pageData.faqItems} />
      </div>

      {/* Related Calculators */}
      <RelatedCalculators current="/alder" />

      <RelateredeArtikler current="/alder" locale={locale} />
    </div>
  );
}
