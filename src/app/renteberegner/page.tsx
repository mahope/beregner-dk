import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import RenteBeregner from "@/components/RenteBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export async function generateMetadata() {
  return generatePageMetadata("renteberegner");
}

export default async function RenteberegnerPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("renteberegner", locale) || getPageData("renteberegner", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/renteberegner`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/renteberegner" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <RenteBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du renteberegneren</h2>
        <p>
          Med vores <strong>renteberegner</strong> kan du hurtigt beregne, hvad et lån vil koste
          dig:
        </p>
        <ol>
          <li>
            <strong>Indtast lånebeløbet</strong> - hvor meget vil du låne?
          </li>
          <li>
            <strong>Angiv renten</strong> - den årlige rentesats (ÅOP eller
            debitorrente)
          </li>
          <li>
            <strong>Vælg løbetid</strong> - hvor mange år skal lånet løbe?
          </li>
          <li>
            <strong>Vælg låntype</strong> - annuitetslån eller serielån
          </li>
        </ol>

        <h2>Annuitetslån vs. serielån</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Egenskab</th>
                <th>Annuitetslån</th>
                <th>Serielån</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Månedlig ydelse</td>
                <td>Fast</td>
                <td>Faldende over tid</td>
              </tr>
              <tr>
                <td>Afdrag</td>
                <td>Stigende over tid</td>
                <td>Fast</td>
              </tr>
              <tr>
                <td>Rente</td>
                <td>Faldende over tid</td>
                <td>Faldende over tid</td>
              </tr>
              <tr>
                <td>Samlet rente</td>
                <td>Højere</td>
                <td>Lavere</td>
              </tr>
              <tr>
                <td>Startydelse</td>
                <td>Lavere</td>
                <td>Højere</td>
              </tr>
              <tr>
                <td>Populær til</td>
                <td>Boliglån, billån</td>
                <td>Erhvervslån</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips til at få et godt lån</h2>
        <ul>
          <li>
            <strong>Sammenlign ÅOP</strong> - ikke kun renten, men alle
            omkostninger
          </li>
          <li>
            <strong>Overvej løbetiden</strong> - kort løbetid = mindre rente i
            alt
          </li>
          <li>
            <strong>Tjek din kreditvurdering</strong> - påvirker den rente du
            kan få
          </li>
          <li>
            <strong>Undgå overtræk</strong> - kassekredit har ofte 15-20% i
            rente
          </li>
          <li>
            <strong>Prioriter dyre lån</strong> - afbetal lån med høj rente
            først
          </li>
        </ul>

        <h2>Skattefradrag for renter</h2>
        <p>
          I Danmark kan du få <strong>fradrag for renteudgifter</strong> på private lån.
          Fradraget er ca. <strong>33% af renteudgiften</strong>, hvilket reducerer din
          skattebetaling. Det betyder, at et lån med 5% rente reelt kun koster
          dig ca. <strong>3,35% efter skat</strong>.
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip: Brug beregneren til at sammenligne</p>
          <p className="text-blue-700">
            Prøv at indtaste det samme lån med forskellig løbetid eller låntype
            for at se, hvordan det påvirker din samlede betaling.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Bemærk</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat. Faktiske lånetilbud kan afvige på
            grund af gebyrer, bidragssatser og din kreditvurdering. Kontakt
            altid din bank eller realkreditinstitut for præcise tilbud.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så använder du räntekalkylatorn</h2>
        <p>
          Med vår <strong>räntekalkylator</strong> räknar du snabbt ut vad ett lån kostar
          dig:
        </p>
        <ol>
          <li>
            <strong>Ange lånebeloppet</strong> - hur mycket vill du låna?
          </li>
          <li>
            <strong>Ange räntan</strong> - den årliga räntesatsen (nominell
            eller effektiv ränta)
          </li>
          <li>
            <strong>Välj löptid</strong> - över hur många år ska lånet betalas?
          </li>
          <li>
            <strong>Välj amorteringstyp</strong> - annuitetslån eller rak
            amortering
          </li>
        </ol>

        <h2>Nominell kontra effektiv ränta</h2>
        <p>
          Den <strong>nominella räntan</strong> är den räntesats banken anger på själva lånet.
          Den <strong>effektiva räntan</strong> räknar även in <strong>avgifter</strong>, uppläggningskostnader
          och hur ofta räntan läggs på, och ger därför den mest rättvisande bilden av vad lånet
          faktiskt kostar. Jämför alltid lån på den <strong>effektiva räntan</strong>.
        </p>

        <h2>Annuitetslån kontra rak amortering</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Egenskap</th>
                <th>Annuitetslån</th>
                <th>Rak amortering</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Månadskostnad</td>
                <td>Fast</td>
                <td>Sjunker över tid</td>
              </tr>
              <tr>
                <td>Amortering</td>
                <td>Ökar över tid</td>
                <td>Fast</td>
              </tr>
              <tr>
                <td>Ränta</td>
                <td>Sjunker över tid</td>
                <td>Sjunker över tid</td>
              </tr>
              <tr>
                <td>Total räntekostnad</td>
                <td>Högre</td>
                <td>Lägre</td>
              </tr>
              <tr>
                <td>Kostnad i början</td>
                <td>Lägre</td>
                <td>Högre</td>
              </tr>
              <tr>
                <td>Vanlig för</td>
                <td>Privatlån, billån</td>
                <td>Bolån</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Tips för att få ett bra lån</h2>
        <ul>
          <li>
            <strong>Jämför effektiv ränta</strong> - inte bara räntan, utan alla
            kostnader
          </li>
          <li>
            <strong>Tänk på löptiden</strong> - kort löptid = lägre räntekostnad
            totalt
          </li>
          <li>
            <strong>Se över din kreditvärdighet</strong> - den påverkar vilken
            ränta du kan få
          </li>
          <li>
            <strong>Undvik dyra krediter</strong> - kontokrediter och
            snabblån har ofta mycket hög ränta
          </li>
          <li>
            <strong>Prioritera dyra lån</strong> - betala av lån med hög ränta
            först
          </li>
        </ul>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips: använd kalkylatorn för att jämföra</p>
          <p className="text-blue-700">
            Prova att mata in samma lån med olika löptid eller amorteringstyp
            för att se hur det påverkar din totala kostnad.
          </p>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6 not-prose">
          <p className="font-medium text-yellow-800">Observera</p>
          <p className="text-yellow-700">
            Kalkylatorn ger en uppskattning. Faktiska låneerbjudanden kan avvika
            på grund av avgifter och din kreditvärdighet. Kontakta alltid din
            bank eller långivare för exakta villkor.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/renteberegner" />
    </div>
  );
}
