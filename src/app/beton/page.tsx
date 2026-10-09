import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BetonBeregner from "@/components/BetonBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  BETON_EKSEMPEL,
  BETON_ELEMENTER,
  BETON_KILDE,
  BETON_STANDARD_SPILD_PCT,
  STOEBEMIX_POSE_KG,
  beregnBeton,
  betonEksempel,
  omregnBeton,
} from "@/lib/beton";

export async function generateMetadata() {
  return generatePageMetadata("beton");
}

const fmt = (n: number, maks = 1) =>
  n.toLocaleString("da-DK", { maximumFractionDigits: maks });

/** De mængder tabellen «fra m³ til poser» regner på. */
const TABEL_M3 = [0.25, 0.5, 1, 2, 5] as const;

export default async function BetonPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("beton", locale) || getPageData("beton", "da")!;

  // Brødteksten læser værktøjets egne tal, så de to ikke kan glide fra hinanden.
  const eksempel = betonEksempel();
  const plade = BETON_ELEMENTER.find((e) => e.id === "plade")!;
  const fundament = BETON_ELEMENTER.find((e) => e.id === "fundament")!;
  const soejle = BETON_ELEMENTER.find((e) => e.id === "soejle")!;

  // Typiske støbninger, regnet med værktøjets egen funktion.
  const terrasse = beregnBeton({
    elementId: "plade",
    laengdeM: 4,
    breddeM: 4,
    tykkelseCm: 10,
    spildPct: BETON_STANDARD_SPILD_PCT,
  });
  const garageplade = beregnBeton({
    elementId: "plade",
    laengdeM: 6,
    breddeM: 3,
    tykkelseCm: 12,
    spildPct: BETON_STANDARD_SPILD_PCT,
  });
  const carportFundament = beregnBeton({
    elementId: "soejle",
    antal: 4,
    soejleBreddeCm: 20,
    soejleDybdeCm: 20,
    soejleHoejdeCm: 50,
    spildPct: BETON_STANDARD_SPILD_PCT,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/beton`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/beton" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <BetonBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Sådan regner du mængden ud</h2>
          <p>
            Du finder betonmængden i to trin: regn elementets <strong>volumen</strong> ud ud fra
            målene, og læg derefter <strong>spild</strong> til:
          </p>
          <p>
            <strong>
              volumen (m³) = længde × bredde × tykkelse × (1 + spild)
            </strong>
          </p>
          <p>
            En plade på {fmt(BETON_EKSEMPEL.laengdeM ?? 0, 1)} × {fmt(BETON_EKSEMPEL.breddeM ?? 0, 1)}{" "}
            m i {fmt(BETON_EKSEMPEL.tykkelseCm ?? 0, 0)} cm er{" "}
            <strong>{fmt(eksempel.volumenM3Uden, 2)} m³</strong> uden spild. Med{" "}
            {BETON_STANDARD_SPILD_PCT} % til spild bliver det{" "}
            <strong>{fmt(eksempel.volumenM3, 2)} m³</strong> —{" "}
            {fmt(eksempel.liter, 0)} liter, eller omkring {fmt(eksempel.poser20kg, 0)} poser
            støbemix à {STOEBEMIX_POSE_KG} kg. Randfundamentet regnes med omkredsen{" "}
            <strong>2 × (længde + bredde)</strong>, og søjler med tværsnittet gange højden pr.
            søjle.
          </p>

          <h2>Fra kubikmeter til poser og vægt</h2>
          <p>
            En {STOEBEMIX_POSE_KG} kg-pose færdigblandet støbemix giver ca. 10 liter færdigblandet
            beton, så 1 m³ svarer til 100 poser. Tabellen ganger mængderne direkte frem:
          </p>
          <table>
            <thead>
              <tr>
                <th>Beton (m³)</th>
                <th>Liter</th>
                <th>Poser à {STOEBEMIX_POSE_KG} kg</th>
                <th>Vægt</th>
              </tr>
            </thead>
            <tbody>
              {TABEL_M3.map((m3) => {
                const r = omregnBeton(m3);
                return (
                  <tr key={m3}>
                    <td>{fmt(m3, 2)}</td>
                    <td>{fmt(r.liter, 0)}</td>
                    <td>
                      <strong>{fmt(r.poser20kg, 0)}</strong>
                    </td>
                    <td>
                      {fmt(r.tonMin, 1)}–{fmt(r.tonMaks, 1)} ton
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h2>Hvor meget beton skal du bruge?</h2>
          <p>
            Tallet afhænger af elementet. Her er tre typiske støbninger, regnet med{" "}
            {BETON_STANDARD_SPILD_PCT} % spild:
          </p>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Mål</th>
                <th>Beton</th>
                <th>Poser à {STOEBEMIX_POSE_KG} kg</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{plade.navn}</td>
                <td>4 × 4 m i 10 cm (terrasse)</td>
                <td>
                  <strong>{fmt(terrasse.volumenM3, 2)} m³</strong> ({fmt(terrasse.liter, 0)} l)
                </td>
                <td>{fmt(terrasse.poser20kg, 0)}</td>
              </tr>
              <tr>
                <td>{plade.navn}</td>
                <td>6 × 3 m i 12 cm (garageplade)</td>
                <td>
                  <strong>{fmt(garageplade.volumenM3, 2)} m³</strong> ({fmt(garageplade.liter, 0)} l)
                </td>
                <td>{fmt(garageplade.poser20kg, 0)}</td>
              </tr>
              <tr>
                <td>{fundament.navn}</td>
                <td>8 × 6 m grund, 20 × 50 cm tværsnit</td>
                <td>
                  <strong>
                    {fmt(
                      beregnBeton({
                        elementId: "fundament",
                        laengdeM: 8,
                        breddeM: 6,
                        fundamentBreddeCm: 20,
                        fundamentDybdeCm: 50,
                        spildPct: BETON_STANDARD_SPILD_PCT,
                      }).volumenM3,
                      2,
                    )}{" "}
                    m³
                  </strong>
                </td>
                <td>
                  {fmt(
                    beregnBeton({
                      elementId: "fundament",
                      laengdeM: 8,
                      breddeM: 6,
                      fundamentBreddeCm: 20,
                      fundamentDybdeCm: 50,
                      spildPct: BETON_STANDARD_SPILD_PCT,
                    }).poser20kg,
                    0,
                  )}
                </td>
              </tr>
              <tr>
                <td>{soejle.navn}</td>
                <td>a 20 × 20 × 50 cm (carport)</td>
                <td>
                  <strong>{fmt(carportFundament.volumenM3, 3)} m³</strong> (
                  {fmt(carportFundament.liter, 0)} l)
                </td>
                <td>{fmt(carportFundament.poser20kg, 0)}</td>
              </tr>
            </tbody>
          </table>

          <h2>Skal du bruge poser eller en betonbil?</h2>
          <p>
            Færdigblandet støbemix i sække kan købes i de mængder, et mindre projekt bruger, og den
            er praktisk, fordi du selv kun skal tilsætte vand. Men poserne er dyre pr. m³: når
            mængden nærmer sig 1 m³ eller mere, betaler det sig at bestille færdigblandet beton af
            en bil. Regner beregneren mere end 1 m³ ud, siger den det, og så bør du bede et
            entreprise om et tilbud på betonen i stedet for at slæbe hundrede poser hjem.
          </p>

          <h2>Støbes der gulvvarme i pladen?</h2>
          <p>
            Lægges gulvvarmeslanger i pladen, skal de have beton over sig: minimum 3 cm efter
            leverandørens anvisning, og gælder typisk 3–9 cm, før dæklaget bliver for tungt og
            langsomt at varme op. Pladetykkelsen skal dække slangerne, armeringsnettet og laget
            under — derfor er en plade med gulvvarme sjældent tyndere end 7–8 cm. Skal du også regne
            på, hvad huset koster at varme, kan du bruge{" "}
            <Link href="/elberegner" className="underline font-medium">
              elberegneren
            </Link>{" "}
            bagefter.
          </p>

          <h2>Husk afskalling og hærdning</h2>
          <p>
            Beton skal have skalling mod udtørring og hærder bedst mellem 5 og 25 grader — derfor
            skal du ikke støbe i lav frost. Et tyndt lag under 5 cm revner let uden armeringsnet.
            Er fundamentet til et hus eller en bærende konstruktion, skal det beregnes af en
            ingeniør: denne beregner regner mængderne, men siger ikke, om konstruktionen er stærk
            nok.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende beregning</p>
            <p className="text-blue-700 dark:text-blue-400">
              Mængden er et skøn. Formerne er sjældent helt rektangulære, spildet afhænger af
              arbejdet, og vægten afhænger af betonens tæthed. Bestil hellere lidt for meget
              end for lidt — restbeton er nemmere at få end en tom form. Skal du også bruge sand
              eller fliser, har vi{" "}
              <Link href="/sand-og-grus" className="underline font-medium">
                sand- og grusberegneren
              </Link>{" "}
              og{" "}
              <Link href="/fliser" className="underline font-medium">
                fliseberegneren
              </Link>
              .
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 not-prose">
            Posederekfolging: {BETON_KILDE.poser}. Vægt og råd: {BETON_KILDE.raad}. Beton over
            gulvvarmeslanger: {BETON_KILDE.gulvvarme}. Verificeret {BETON_KILDE.verifiedAt}.
          </p>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om beton" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/beton" />
        </section>
      </div>

      <Sidebar currentHref="/beton" adSlotId="beton-sidebar" />
    </div>
  );
}
