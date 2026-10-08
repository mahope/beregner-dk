import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import SkridtBeregner from "@/components/SkridtBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { beregnSkridt, skridtFraKm } from "@/lib/skridt";

export async function generateMetadata() {
  return generatePageMetadata("skridt");
}

export default async function SkridtPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("skridt", locale) || getPageData("skridt", "da")!;
  // Hvert tal i brødteksten regnes fra samme kilde som værktøjet (kvalitetsregel
  // 11), så tekst og beregning aldrig kan glide fra hinanden.
  const tal = (n: number) =>
    n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");
  const min10k = beregnSkridt(10_000, "kvinde")!.minutter;
  const kcal10k = beregnSkridt(10_000, "kvinde", 70)!.kcal!;
  const skridt1kmKvinde = skridtFraKm(1, "kvinde")!;
  const skridt1kmMand = skridtFraKm(1, "mand")!;
  const raekker = [1_000, 5_000, 10_000, 15_000].map((s) => ({
    skridt: s,
    kvinde: beregnSkridt(s, "kvinde")!.km,
    mand: beregnSkridt(s, "mand")!.km,
  }));
  const kmRaekker = Array.from({ length: 10 }, (_, i) => i + 1).map((km) => ({
    km,
    kvinde: skridtFraKm(km, "kvinde")!,
    mand: skridtFraKm(km, "mand")!,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/skridt`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/skridt" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <SkridtBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan omregner du skridt til km</h2>
            <p>
              Afstanden er <strong>antal skridt × skridtlængde</strong>. Beregneren bruger de
              klassiske gang-målinger: i gennemsnit <strong>66 cm pr. skridt for kvinder</strong> og{" "}
              <strong>79 cm for mænd</strong> (Murray 1964/1970). Det giver:
            </p>
            <ul>
              {raekker.map((r) => (
                <li key={r.skridt}>
                  <strong>{tal(r.skridt)} skridt</strong> = ca. {tal(r.kvinde)} km (kvinde) / {tal(r.mand)} km (mand)
                </li>
              ))}
            </ul>
            <h2>Hvor mange skridt er der på X km?</h2>
            <p>
              Det omvendte spørgsmål — <strong>hvor mange skridt er der på en kilometer</strong> —
              kommer ofte i søgningerne. Her er svaret for 1-10 km:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-semibold">Kilometer</th>
                    <th className="text-right py-2 pr-4 font-semibold">Kvinder</th>
                    <th className="text-right py-2 font-semibold">Mænd</th>
                  </tr>
                </thead>
                <tbody>
                  {kmRaekker.map((r) => (
                    <tr key={r.km} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4">{r.km} km</td>
                      <td className="py-2 pr-4 text-right">{tal(r.kvinde)}</td>
                      <td className="py-2 text-right">{tal(r.mand)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Kvinder tager ca. <strong>{tal(skridt1kmKvinde)} skridt pr. kilometer</strong> og
              mænd ca. <strong>{tal(skridt1kmMand)}</strong> med de gennemsnitlige skridtlængder
              på 66 og 79 cm.
            </p>
            <h2>Hvor lang tid tager {tal(10_000)} skridt?</h2>
            <p>
              Ved en normal kadence på <strong>117 skridt i minuttet</strong> tager {tal(10_000)} skridt
              cirka <strong>{min10k} minutter</strong> — knap halvanden time. Du behøver ikke gå dem i én
              tur: skridt fra hverdagen (indkøb, trapper, hundeluftning) tæller med i det samlede
              antal.
            </p>
            <h2>Kalorier ved gang</h2>
            <p>
              Forbrændingen regnes med <strong>MET 3,5</strong> for normal gang: {tal(10_000)} skridt er
              cirka <strong>{tal(kcal10k)} kcal for en person på 70 kg</strong>. Vægten betyder noget, fordi det
              koster mere energi at flytte en tungere krop. Talene er vejledende — højde, tempo og
              terræn flytter både skridtlængde og forbrænding.
            </p>
          </div>
        )}

        {locale === "se" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Så räknar du om steg till km</h2>
            <p>
              Sträckan är <strong>antal steg × steglängd</strong>. Kalkylatorn använder de klassiska
              gångmätningarna: i genomsnitt <strong>66 cm per steg för kvinnor</strong> och{" "}
              <strong>79 cm för män</strong> (Murray 1964/1970). Det ger:
            </p>
            <ul>
              {raekker.map((r) => (
                <li key={r.skridt}>
                  <strong>{tal(r.skridt)} steg</strong> = ca {tal(r.kvinde)} km (kvinna) / {tal(r.mand)} km (man)
                </li>
              ))}
            </ul>
            <h2>Hur många steg är det på X km?</h2>
            <p>
              Den omvända frågan — <strong>hur många steg är det på en kilometer</strong> — kommer
              ofta i sökningarna. Här är svaret för 1-10 km:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-semibold">Kilometer</th>
                    <th className="text-right py-2 pr-4 font-semibold">Kvinnor</th>
                    <th className="text-right py-2 font-semibold">Män</th>
                  </tr>
                </thead>
                <tbody>
                  {kmRaekker.map((r) => (
                    <tr key={r.km} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4">{r.km} km</td>
                      <td className="py-2 pr-4 text-right">{tal(r.kvinde)}</td>
                      <td className="py-2 text-right">{tal(r.mand)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Kvinnor tar ca <strong>{tal(skridt1kmKvinde)} steg per kilometer</strong> och män
              ca <strong>{tal(skridt1kmMand)}</strong> med de genomsnittliga steglängderna 66
              och 79 cm.
            </p>
            <h2>Hur lång tid tar {tal(10_000)} steg?</h2>
            <p>
              Vid en normal kadens på <strong>117 steg i minuten</strong> tar {tal(10_000)} steg cirka{" "}
              <strong>{min10k} minuter</strong> — knappt en och en halv timme. Du behöver inte gå dem på
              en gång: steg från vardagen (inköp, trappor, hundrastning) räknas med i det totala
              antalet.
            </p>
            <h2>Kalorier vid gång</h2>
            <p>
              Förbränningen räknas med <strong>MET 3,5</strong> för normal gång: {tal(10_000)} steg är
              cirka <strong>{tal(kcal10k)} kcal för en person på 70 kg</strong>. Vikten spelar roll, eftersom
              det kostar mer energi att flytta en tyngre kropp. Siffrorna är vägledande — längd,
              tempo och terräng flyttar både steglängd och förbränning.
            </p>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/skridt" />
      </div>
      <Sidebar currentHref="/skridt" adSlotId="skridt-sidebar" />
    </div>
  );
}
