import BoligsalgBeregner from "@/components/BoligsalgBeregner";
import { generatePageMetadata } from "@/lib/page-helpers";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import {
  DEFAULT_VALUES,
  TINGLYSNING_PANTEBREVLAANEDEL,
  TINGLYSNING_PANTEBREVPROCENT,
  TINGLYSNING_PANTEBREVBELOB,
  TINGLYSNING_SKOEDEBELOB,
  TINGLYSNING_SKOEDEPROCENT,
  beregnBoligsalg,
  beregnMaegler,
} from "@/lib/boligsalg";
import { formatNumber } from "@/lib/format";
import Link from "next/link";

/**
 * Alle beløb i brødteksten kommer fra `src/lib/boligsalg.ts`.
 *
 * Siden skrev otte prisintervaller i hånden («3-6 %», «25.000-60.000 kr.»)
 * og kaldte dem «baseret på Boligejer.dk, opdateret august 2025» — en kilde
 * ingen i repoet kan læse, og et år gammel på en side der siger 2026. De
 * intervaller lå desuden uden for den beregning, læseren faktisk kan se:
 * beregneren har én pris pr. post, og den er dens egen standardindstilling.
 * Teksten siger nu den pris, og den er samme tal som `DEFAULT_VALUES`, så de
 * to ikke kan glide fra hinanden.
 */
const kr = (tal: number) => formatNumber(tal, "da", { maximumFractionDigits: 0 });
const pct = (andel: number) => formatNumber(andel * 100, "da", { maximumFractionDigits: 2 });

export async function generateMetadata() {
  return generatePageMetadata("boligsalg");
}

export default async function BoligsalgPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("boligsalg", locale) || getPageData("boligsalg", "da")!;

  // Samme kørsel som det værktøj, læseren ser ovenfor: standardindstillingerne
  // ved standardprisen. `samledeOmkostninger` og `nettoProvenu` er derfor de
  // tal brødteksten citerer, ikke tal der er skrevet ved siden af.
  const standard = beregnBoligsalg(DEFAULT_VALUES)!;
  const [storst, naeststorst, tredjestorst] = standard.fordelinger;
  const topTreProcent =
    storst.procent + naeststorst.procent + tredjestorst.procent;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/boligsalg`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/boligsalg" }]} />

        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageData.title}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          {pageData.description}
        </p>

        <BoligsalgBeregner />

        {locale === "da" && (
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>Hvad koster det at sælge en bolig i Danmark?</h2>
            <p>
              At sælge en bolig indebærer en række omkostninger. Sætter du
              ingen af beløbene til i sig selv, ender beregneren på{" "}
              <strong>{kr(standard.samledeOmkostninger)}</strong> i omkostninger
              for en bolig til {formatNumber(DEFAULT_VALUES.salgspris / 1000000, "da", { maximumFractionDigits: 1 })} mio. kr.
              — altså et nettoprovenu på <strong>{kr(standard.nettoProvenu)}</strong>.
              Din største post er <strong>{storst.navn}</strong> med {kr(storst.beloeb)},
              og de tre største poster udgør {formatNumber(topTreProcent, "da", { maximumFractionDigits: 0 })} % af omkostningerne.
              De er standardindstillinger, ikke markedspriser — ret dem, når du kender dine egne tal.
            </p>

            <h2>Hvilke udgifter skal du regne med?</h2>
            <ul>
              <li><strong>Ejendomsmægler:</strong> beregneren regner med {pct(DEFAULT_VALUES.maeglerProcent / 100)} % af salgsprisen, altså {kr(beregnMaegler(DEFAULT_VALUES))} ved den viste pris. Du kan vælge et fast salær i stedet.</li>
              <li><strong>Energimærke:</strong> beregneren starter ved {kr(DEFAULT_VALUES.energimaerke)}. Mærket er gyldigt i 10 år.</li>
              <li><strong>Tilstandsrapport:</strong> beregneren starter ved {kr(DEFAULT_VALUES.tilstandsrapport)}. Den skal udarbejdes af en autoriseret byggeskadetekniker.</li>
              <li><strong>Elinstallationsrapport:</strong> beregneren starter ved {kr(DEFAULT_VALUES.elRapport)}. Den kræves ved salg af ældre boliger.</li>
              <li><strong>Ejerskifteforsikring:</strong> beregneren regner med sælgerens andel, {kr(DEFAULT_VALUES.ejerskifteforsikring)}.</li>
              <li><strong>Istandsættelse:</strong> beregneren regner med {kr(DEFAULT_VALUES.istaendsaettelse)} til maling, reparationer og rengøring.</li>
              <li><strong>Salgsrapporterne:</strong> tjek at rapporten er fra et nyligt besøg, inden du lægger boligen til salg.</li>
            </ul>

            <h2>Sådan optimerer du dit salgsprovenu</h2>
            <ul>
              <li><strong>Forhandl mæglersalæret:</strong> De fleste mæglere giver rabat, især ved høj salgspris</li>
              <li><strong>Gør klar selv:</strong> Mal og rengør frem for at betale håndværkere</li>
              <li><strong>Få flere tilbud:</strong> Indhent mindst 3 mæglervurderinger og vælg den bedste kombination af salær og service</li>
              <li><strong>Sælg løsøre:</strong> Overskydende møbler og indbo kan sælges på DBA eller i genbrug — færre ting at flytte og ekstra penge</li>
              <li><strong>Home staging:</strong> Professionel styling kan nogle gange hæve salgsprisen, men prisen afhænger af boligens størrelse og stand</li>
            </ul>

            <p className="mt-8">
              Læs vores komplette guide:{' '}
              <Link href="/blog/boligsalg-2026-guide-til-omkostninger-og-provenu" className="text-blue-600 hover:underline font-medium">
                Boligsalg 2026 — omkostninger og salgsprovenu →
              </Link>
            </p>

            <h2>Kilder og forbehold</h2>
            <p className="text-sm text-gray-500">
              Beløbene ovenfor er <strong>beregnerens egne standardindstillinger</strong>,
              ikke et markedsprisindeks: de er sat så du kan se regnestykket og ændre
              det, så snart du ved hvad din egen mægler, dit energimærke og dit håndværk
              koster. Tinglysningen er et 2026-estimat på{" "}
              {pct(TINGLYSNING_SKOEDEPROCENT)} % af købesummen plus {kr(TINGLYSNING_SKOEDEBELOB)}{" "}
              for skødet, og {pct(TINGLYSNING_PANTEBREVPROCENT)} % af{" "}
              {pct(TINGLYSNING_PANTEBREVLAANEDEL)} % af vurderingssummen plus{" "}
              {kr(TINGLYSNING_PANTEBREVBELOB)} for pantebrev — ikke en lavest læst sats
              fra et offentligt register.
            </p>
          </div>
        )}

        <FAQ items={pageData.faqItems} />
        <RelatedCalculators current="/boligsalg" />
      </div>

      <Sidebar currentHref="/boligsalg" adSlotId="boligsalg-sidebar" />
    </div>
  );
}