import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import PortionerBeregner from "@/components/PortionerBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import {
  PORTIONER_KATEGORIER,
  PORTIONER_VARER,
  formatPortion,
  vareVedId,
} from "@/lib/portioner";

export async function generateMetadata() {
  return generatePageMetadata("portioner");
}

export default async function PortionerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("portioner", locale) || getPageData("portioner", "da")!;

  const pasta = vareVedId("pasta-toerret")!;
  const kartofler = vareVedId("kartofler")!;
  const ris = vareVedId("ris")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/portioner`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/portioner" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <PortionerBeregner />

        <div className="mt-12 prose dark:prose-invert max-w-none">
          <h2>Hvor meget mad skal der beregnes pr. person?</h2>
          <p>
            Det korte svar er, at det afhænger af retten. Når pastaen er hovedret, regner man med{" "}
            <strong>
              {pasta.min}-{pasta.max} g tørret pasta
            </strong>{" "}
            pr. voksen, og når kartoflerne er tilbehør, med{" "}
            <strong>
              {kartofler.min}-{kartofler.max} g uskrællede kartofler
            </strong>
            . Ris angives i kilden som{" "}
            <strong>
              {ris.min} dl
            </strong>{" "}
            pr. person — omkring 70-100 g tørrede ris.
          </p>
          <p>
            Tabellen nedenfor er kilden: den viser den anbefalede mængde pr. voksen. Skriv antallet
            af gæster i beregneren ovenfor, så ganger den mængden op for dig.
          </p>

          {PORTIONER_KATEGORIER.map((kategori) => (
            <div key={kategori}>
              <h3>{kategori}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Vare</th>
                    <th>Pr. person</th>
                  </tr>
                </thead>
                <tbody>
                  {PORTIONER_VARER.filter((v) => v.kategori === kategori).map((v) => (
                    <tr key={v.id}>
                      <td>{v.navn}</td>
                      <td>
                        {v.min === v.max
                          ? formatPortion(v.min, v.enhed)
                          : `${formatPortion(v.min, v.enhed)}–${formatPortion(v.max, v.enhed)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <h2>Hvad betyder intervallet?</h2>
          <p>
            Mængderne er vejledende, fordi appetit, antallet af retter og tilbehøret ved siden af
            flytter tallet. Er retten en hovedret med lidt tilbehør, så gå efter den høje ende af
            intervallet; er den et tilbehør til noget andet, så brug den lave. Børn spiser typisk
            omkring halvt så meget som en voksen.
          </p>

          <h2>Skal du veje eller måle?</h2>
          <p>
            Tørre varer som pasta, ris og kartofler er lettest at veje, mens sauce og væske måles i
            deciliter. Skal du omregne mellem gram og deciliter for en ingrediens, kan du bruge{" "}
            <Link href="/gram-til-dl" className="underline font-medium">
              gram-til-dl-beregneren
            </Link>
            . Vil du regne kalorierne for portionen med, så brug{" "}
            <Link href="/kalorier" className="underline font-medium">
              kalorieberegneren
            </Link>
            .
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 my-6 not-prose rounded">
            <p className="font-medium text-blue-800 dark:text-blue-300">Vejledende mængder</p>
            <p className="text-blue-700 dark:text-blue-400">
              Tallene er de anbefalede mængder pr. voksen fra kildens tabel og er et udgangspunkt —
              ikke et facit. Kender du dine gæsters appetit, så justér efter den. Skal regningen
              deles bagefter, kan du bruge{" "}
              <Link href="/del-regning" className="underline font-medium">
                del regningen
              </Link>
              .
            </p>
          </div>
        </div>

        <section className="mt-12">
          <FAQ items={pageData.faqItems} title="Ofte stillede spørgsmål om portioner" />
        </section>

        <section className="mt-12">
          <RelatedCalculators current="/portioner" />
        </section>
      </div>

      <Sidebar currentHref="/portioner" adSlotId="portioner-sidebar" />
    </div>
  );
}
