import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import ElbilLadingBeregner from "@/components/ElbilLadingBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { formatBelob } from "@/lib/format";
import {
  beregnElbilLading,
  elbilLadingStandard,
} from "@/lib/elbil-lading";

export async function generateMetadata() {
  return generatePageMetadata("elbil-lading");
}

/**
 * Brødtekstens tal. Siden findes på både minberegner.dk og beraknare.se, så
 * formateringen følger sidens egen locale — ellers fik en svensk læser
 * «1.250 km» med dansk tusindtalsseparator. `formatBelob` gør også
 * non-breaking-mellemrum til almindeligt mellemrum, som brødteksten bruger.
 */
const fmt = (n: number, locale: Locale, maks = 0) =>
  formatBelob(n, locale, maks);

export default async function ElbilLadingPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("elbil-lading", locale) || getPageData("elbil-lading", "da")!;

  // Brødteksten læser værktøjets egne tal, så de ikke kan glide fra hinanden.
  const standard = elbilLadingStandard(locale);
  const eksempel = beregnElbilLading(standard)!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/elbil-lading`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/elbil-lading" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <ElbilLadingBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          {locale === "se" ? (
            <>
              <h2>Så räknar du ut laddkostnaden</h2>
              <p>
                Räkningen är ren energi ekonomi: en elbil har ett batteri på{" "}
                <strong>{fmt(standard.batteriKwh, locale)} kWh</strong>, och varje kWh kostar
                det du betalar för strömmen. Ska bilen fyllas från{" "}
                <strong>{fmt(standard.ladningNuPct, locale)} %</strong> till{" "}
                <strong>{fmt(standard.ladningTilPct, locale)} %</strong> behöver den laddas med
              </p>
              <p>
                <strong>
                  {fmt(standard.batteriKwh, locale)} kWh × ({fmt(standard.ladningTilPct, locale)} −{" "}
                  {fmt(standard.ladningNuPct, locale)}) ÷ 100 ={" "}
                  {fmt(eksempel.kwhTilOpladning, locale, 1)} kWh
                </strong>
              </p>
              <p>
                Till ett elpris på{" "}
                <strong>{fmt(standard.elpris, locale, 2)} kr/kWh</strong> kostar det{" "}
                <strong>{fmt(eksempel.prisForOpladning, locale)} kr.</strong> att ladda bilen.
              </p>

              <h2>Vad kostar det att köra 100 km?</h2>
              <p>
                Bilens förbrukning är{" "}
                <strong>{fmt(standard.forbrugKwh100km, locale, 1)} kWh/100 km</strong>, så
                körningen kostar{" "}
                <strong>{fmt(eksempel.prisPr100km, locale)} kr. per 100 km</strong> — alltså{" "}
                {fmt(eksempel.prisPrKm, locale, 2)} kr. per km. Det är talet du kan jämföra med
                en bensinbil, där literpriset och förbrukningen gör samma sak.
              </p>
              <p>
                Kör du <strong>{fmt(standard.kmPrMaaned, locale)} km per månad</strong> använder
                det <strong>{fmt(eksempel.kwhPrMaaned, locale)} kWh</strong> och kostar det{" "}
                <strong>{fmt(eksempel.maanedligPris, locale)} kr. per månad</strong> att ladda
                bilen hemma.
              </p>

              <h2>Är räkningen exakt?</h2>
              <p>
                Beräkningen visar energin bilen använder. En hemladdare är typisk cirka 85-90 %
                effektiv, så den verkliga räkningen från vägguttaget kan vara lite högre än
                beräknat — särskilt vid snabbladdare, där förlusten är större. Elpriset kan också
                variera under dagen, så ett natt- eller spotprisavtal kan halvera kostnaden.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
                <p className="font-medium text-blue-800 dark:text-blue-300">Jämför med bensin</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Se vad en elbil sparar i drift jämfört med en bensinbil på{" "}
                  <Link href="/elbil" className="underline font-medium">
                    elbil vs. bensin-sidan
                  </Link>
                  , eller beräkna vad dina apparater kostar i el på{" "}
                  <Link href="/elberegner" className="underline font-medium">
                    elkalkylatorn
                  </Link>
                  .
                </p>
              </div>
            </>
          ) : (
            <>
              <h2>Sådan regner du ladeomkostningen ud</h2>
              <p>
                Regningen er ren energiøkonomi: en elbil har et batteri på{" "}
                <strong>{fmt(standard.batteriKwh, locale)} kWh</strong>, og hver kWh koster det
                du betaler for strøm. Skal bilen fyldes fra{" "}
                <strong>{fmt(standard.ladningNuPct, locale)} %</strong> til{" "}
                <strong>{fmt(standard.ladningTilPct, locale)} %</strong>, skal der lades
              </p>
              <p>
                <strong>
                  {fmt(standard.batteriKwh, locale)} kWh × ({fmt(standard.ladningTilPct, locale)} −{" "}
                  {fmt(standard.ladningNuPct, locale)}) ÷ 100 ={" "}
                  {fmt(eksempel.kwhTilOpladning, locale, 1)} kWh
                </strong>
              </p>
              <p>
                Til en elpris på <strong>{fmt(standard.elpris, locale, 2)} kr/kWh</strong> koster
                det <strong>{fmt(eksempel.prisForOpladning, locale)} kr.</strong> at lade bilen op.
              </p>

              <h2>Hvad koster det at køre 100 km?</h2>
              <p>
                Bilens forbrug er{" "}
                <strong>{fmt(standard.forbrugKwh100km, locale, 1)} kWh/100 km</strong>, så
                kørselen koster{" "}
                <strong>{fmt(eksempel.prisPr100km, locale)} kr. pr. 100 km</strong> — altså{" "}
                {fmt(eksempel.prisPrKm, locale, 2)} kr. pr. km. Det er tallet du kan sammenligne
                med en benzinbil, hvor literprisen og forbruget gør det samme.
              </p>
              <p>
                Kører du <strong>{fmt(standard.kmPrMaaned, locale)} km pr. måned</strong>, bruger
                det <strong>{fmt(eksempel.kwhPrMaaned, locale)} kWh</strong> og koster det{" "}
                <strong>{fmt(eksempel.maanedligPris, locale)} kr. pr. måned</strong> at lade bilen
                hjemme.
              </p>

              <h2>Er regningen præcis?</h2>
              <p>
                Beregningen viser energien bilen bruger. En hjemmeoplader er typisk omkring 85-90 %
                effektiv, så den reelle regning fra stikkontakten kan være lidt højere end
                beregnet — især ved hurtigladere, hvor tabet er større. Elprisen kan også svinge
                gennem dagen, så en spotpris- eller nattimeaftale kan halvere regningen.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
                <p className="font-medium text-blue-800 dark:text-blue-300">Sammenlign med benzin</p>
                <p className="text-blue-700 dark:text-blue-400">
                  Se hvad en elbil sparer på drift i forhold til en benzinbil på{" "}
                  <Link href="/elbil" className="underline font-medium">
                    elbil vs. benzinbil-siden
                  </Link>
                  , eller beregn hvad dine apparater koster i strøm på{" "}
                  <Link href="/elberegner" className="underline font-medium">
                    elberegneren
                  </Link>
                  .
                </p>
              </div>
            </>
          )}
        </div>

        <section className="mt-12">
          <FAQ
            items={pageData.faqItems}
            title={locale === "se" ? "Vanliga frågor om laddkostnad elbil" : "Ofte stillede spørgsmål om elbil-lading"}
          />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/elbil-lading" />
        </section>
      </div>

      <Sidebar currentHref="/elbil-lading" adSlotId="elbil-lading-sidebar" />
    </div>
  );
}
