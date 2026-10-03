import Link from "next/link";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getPageData } from "@/lib/page-data";
import AfstandsBeregner from "@/components/AfstandsBeregner";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { ruteCacheSætning } from "@/lib/rute-cache";

const SLUG = "afstand-mellem-adresser";

export async function generateMetadata() {
  return generatePageMetadata(SLUG);
}

export default async function AfstandMellemAdresserPage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData(SLUG, locale) || getPageData(SLUG, "da")!;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/${SLUG}`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: `/${SLUG}` },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <AfstandsBeregner />
        </div>

        {locale === "da" && (
          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2>Sådan finder du afstanden mellem to adresser</h2>
            <ol>
              <li>
                <strong>Skriv vejadressen</strong> i feltet «Fra-adresse» og vælg den rigtige adresse
                på listen — husnummeret skal med, ellers ved værktøjet ikke hvilken bygning du
                mener.
              </li>
              <li>
                <strong>Gør det samme i «Til-adresse».</strong> Feltet tilbyder de samme adresser,
                uanset om du vil finde vej til arbejde, sommerhus, læge eller familien.
              </li>
              <li>
                <strong>Vi spørger en kortberegner</strong> om den korteste bilrute mellem de to
                punkter og viser afstanden i km — både én vej og tur/retur.
              </li>
            </ol>
            <p>
              Adresserne slås op hos <strong>Adressevælger fra Klimadatastyrelsen</strong>, og ruten
              hentes fra en OpenStreetMap-baseret ruteberegner. Vi gemmer hverken dine adresser.
              {ruteCacheSætning()} Der skal ikke logges ind for at bruge værktøjet.
            </p>

            <h2>Kørselsafstand er ikke luftlinje</h2>
            <p>
              Luftlinjen mellem to adresser er næsten altid kortere end vejen — den går gennem
              huse, skove og marker. <strong>Kørselsafstanden</strong> er den vej, bilen faktisk kan
              køre, og det er den, du skal bruge, når afstanden skal ind i et fradrag eller i et
              budget. Derfor spørger vi en kortberegner i stedet for at regne på to koordinater.
            </p>
            <p>
              Krydser ruten vand, får du to tal: den korte rute uden færge og den med. Vælg den med
              færge, hvis du faktisk skal med en færge — ellers får du et for lavt tal.
            </p>

            <h2>Hvad du kan bruge afstanden til</h2>
            <ul>
              <li>
                <Link href="/befordringsfradrag">Kørselsfradraget</Link> — beregneren bruger præcis
                samme afstand, så du kan lægge den videre ind i dit fradrag.
              </li>
              <li>
                <Link href="/bil">Bilens omkostninger</Link> — hold afstand mellem hverdag og
                ferietur ved at sammenligne dem med årets andre kørsel.
              </li>
              <li>
                <Link href="/rejsebudget">Rejsebudgettet</Link> — planlæg turen efter hvor langt der
                faktisk er.
              </li>
            </ul>
          </div>
        )}

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current={`/${SLUG}`} />
      </div>
      <Sidebar currentHref={`/${SLUG}`} adSlotId="afstand-mellem-adresser-sidebar" />
    </div>
  );
}