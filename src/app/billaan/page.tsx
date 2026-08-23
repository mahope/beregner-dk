import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import BillaanBeregner from "@/components/BillaanBeregner";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import {
  CalculatorSchema,
  FAQSchema,
} from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CheckCircle, XCircle } from "lucide-react";

export async function generateMetadata() {
  return generatePageMetadata("billaan");
}

export default async function BillaanPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("billaan", locale) || getPageData("billaan", "da")!;

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/billaan`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/billaan" }]} />
      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <BillaanBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan fungerer billån i Danmark</h2>
        <p>
          Når du køber bil i Danmark, kan du finansiere købet på flere måder. Et <strong>billån</strong> er ofte
          den mest fordelagtige løsning, da du kan bruge bilen som <strong>sikkerhed</strong> og derved få en
          <strong>lavere rente</strong> end ved et usikret forbrugslån.
        </p>

        <h2>Typer af billån</h2>

        <h3>Billån med pant i bilen</h3>
        <p>
          Det traditionelle billån hvor banken har <strong>pant i bilen</strong> som sikkerhed. Dette giver
          typisk den <strong>laveste rente (5-8%)</strong>, men banken kan i værste fald tage bilen tilbage
          ved betalingsproblemer.
        </p>
        <ul>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Lav rente (5-8%)</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Mulighed for større lånebeløb</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Bilen kan bruges som udbetaling ved ny bil</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Pant i bilen</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Kort løbetid (typisk max 7 år)</li>
        </ul>

        <h3>FlexBillån / Variabelt billån</h3>
        <p>
          Et billån med <strong>variabel rente</strong>, der løbende tilpasses markedet. Renten kan både <strong>stige
          og falde</strong> i lånets løbetid.
        </p>
        <ul>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Lavere startrente end fastforrentet</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Mulighed for at konvertere til fast rente</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Usikkerhed om fremtidige ydelser</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Kan blive dyrere ved rentestigninger</li>
        </ul>

        <h3>Forbrugslån til bil</h3>
        <p>
          Et <strong>usikret lån</strong> uden pant i bilen. Kan bruges til enhver bil, men har <strong>højere rente</strong>
          end traditionelt billån.
        </p>
        <ul>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Ingen pant i bilen</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Fleksibel brug af pengene</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Ingen krav til bilens alder</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Højere rente (8-15%)</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Typisk lavere lånebeløb</li>
        </ul>

        <h2>Hvad påvirker din rente?</h2>
        <p>
          Den <strong>rente</strong> du tilbydes afhænger af flere faktorer:
        </p>
        <ul>
          <li><strong>Din økonomi:</strong> Indkomst, gældsfrihed og betalingshistorik</li>
          <li><strong>Udbetaling:</strong> Større udbetaling = lavere rente</li>
          <li><strong>Løbetid:</strong> Kortere løbetid = lavere rente</li>
          <li><strong>Bilens værdi:</strong> Nyere/billigere biler giver bedre vilkår</li>
          <li><strong>Bankens politik:</strong> Forskellige banker har forskellige satser</li>
        </ul>

        <h2>Typiske billån satser (2026)</h2>
        <table>
          <thead>
            <tr>
              <th>Bank</th>
              <th>Rente fra</th>
              <th>ÅOP fra</th>
              <th>Udbetaling</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nordea</td>
              <td>5,95%</td>
              <td>6,5%</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Bank Norwegian</td>
              <td>5,49%</td>
              <td>6,0%</td>
              <td>0%</td>
            </tr>
            <tr>
              <td>Basisbank</td>
              <td>6,25%</td>
              <td>7,0%</td>
              <td>10%</td>
            </tr>
            <tr>
              <td>Santander</td>
              <td>6,50%</td>
              <td>7,2%</td>
              <td>10%</td>
            </tr>
          </tbody>
        </table>

        <h2>Sådan får du det bedste tilbud</h2>
        <ol>
          <li>
            <strong>Sammenlign minimum 3 banker</strong> - brug en sammenligningstjeneste
            som Samlino eller Mybanker
          </li>
          <li>
            <strong>Forhandl med din nuværende bank</strong> - de kan ofte matche eller
            slå konkurrenternes tilbud
          </li>
          <li>
            <strong>Overvej totalomkostninger</strong> - ikke kun den månedlige ydelse,
            men også ÅOP og gebyrer
          </li>
          <li>
            <strong>Tjek din kreditvurdering</strong> - jo bedre score, jo bedre rente
          </li>
          <li>
            <strong>Undgå unødvendige tillægsprodukter</strong> - betal kun for det du
            reelt har brug for
          </li>
        </ol>

        <h2>Hvad koster et billån typisk?</h2>
        <p>
          Eksempel på billån (2026):
        </p>
        <table>
          <thead>
            <tr>
              <th>Lånebeløb</th>
              <th>Udbetaling</th>
              <th>Løbetid</th>
              <th>Rente</th>
              <th>Månedlig ydelse</th>
              <th>Samlet omkostning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>100.000 kr</td>
              <td>10.000 kr</td>
              <td>5 år</td>
              <td>6%</td>
              <td>1.933 kr</td>
              <td>116.000 kr</td>
            </tr>
            <tr>
              <td>200.000 kr</td>
              <td>20.000 kr</td>
              <td>7 år</td>
              <td>6%</td>
              <td>3.017 kr</td>
              <td>253.000 kr</td>
            </tr>
            <tr>
              <td>300.000 kr</td>
              <td>30.000 kr</td>
              <td>7 år</td>
              <td>6%</td>
              <td>4.525 kr</td>
              <td>380.000 kr</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6">
          <p className="font-medium text-yellow-800">Vigtigt</p>
          <p className="text-yellow-700">
            Denne beregner giver et estimat til orientering. Kontakt altid din bank for
            et præcist lånetilbud med din individuelle rente. Rentesatser varierer
            afhængigt af din økonomi og kreditvurdering.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så fungerar billån i Sverige</h2>
        <p>
          När du köper bil i Sverige kan du finansiera köpet på flera sätt. Ett <strong>billån</strong> är
          ofta det förmånligaste alternativet, eftersom bilen kan användas som <strong>säkerhet</strong> och
          du därmed får en <strong>lägre ränta</strong> än vid ett blancolån utan säkerhet.
        </p>

        <h2>Typer av bilfinansiering</h2>

        <h3>Billån med bilen som säkerhet</h3>
        <p>
          Det klassiska billånet där långivaren har <strong>säkerhet i bilen</strong>. Det ger vanligtvis
          den <strong>lägsta räntan</strong>, men i värsta fall kan bilen återtas vid utebliven betalning.
          Ett vanligt krav är en <strong>kontantinsats på minst 20%</strong> av bilens pris.
        </p>
        <ul>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Lägre ränta tack vare säkerheten</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Möjlighet till större lånebelopp</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Inbytesbilen kan användas som kontantinsats</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Bilen står som säkerhet</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Krav på kontantinsats (ofta 20%)</li>
        </ul>

        <h3>Billeasing (privatleasing)</h3>
        <p>
          Med <strong>privatleasing</strong> hyr du bilen under en bestämd period mot en fast månadsavgift.
          Du äger inte bilen, utan lämnar tillbaka den när avtalet löper ut. Ett <strong>restvärde</strong> avgör
          en stor del av kostnaden.
        </p>
        <ul>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Fast och förutsägbar månadskostnad</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Ingen stor kontantinsats krävs</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Du äger aldrig bilen</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Begränsat körsträcka enligt avtalet</li>
        </ul>

        <h3>Blancolån till bil</h3>
        <p>
          Ett <strong>lån utan säkerhet</strong> i bilen. Kan användas till vilken bil som helst, men har
          en <strong>högre effektiv ränta</strong> än ett vanligt billån.
        </p>
        <ul>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Ingen säkerhet i bilen</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Fri användning av pengarna</li>
          <li><CheckCircle className="h-5 w-5 text-green-600 inline mr-1" aria-hidden="true" /> Inga krav på bilens ålder</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Högre effektiv ränta</li>
          <li><XCircle className="h-5 w-5 text-red-600 inline mr-1" aria-hidden="true" /> Ofta lägre lånebelopp</li>
        </ul>

        <h2>Vad påverkar din ränta?</h2>
        <p>
          Den <strong>ränta</strong> du erbjuds beror på flera faktorer:
        </p>
        <ul>
          <li><strong>Din ekonomi:</strong> Inkomst, skuldsättning och betalningshistorik</li>
          <li><strong>Kontantinsats:</strong> Större insats ger lägre ränta</li>
          <li><strong>Löptid:</strong> Kortare löptid ger ofta lägre ränta</li>
          <li><strong>Bilens värde:</strong> Nyare bilar ger bättre villkor</li>
          <li><strong>Långivarens policy:</strong> Olika banker har olika räntor</li>
        </ul>

        <h2>Jämför alltid effektiv ränta</h2>
        <p>
          Den <strong>effektiva räntan</strong> inkluderar alla avgifter, som uppläggningsavgift och
          aviavgift, och ger den verkliga kostnaden för lånet. Titta aldrig bara på den nominella räntan –
          jämför alltid <strong>effektiv ränta</strong> mellan olika erbjudanden.
        </p>

        <h2>Så får du det bästa erbjudandet</h2>
        <ol>
          <li>
            <strong>Jämför minst tre långivare</strong> – använd en jämförelsetjänst
          </li>
          <li>
            <strong>Förhandla med din nuvarande bank</strong> – de kan ofta matcha konkurrenternas
            erbjudande
          </li>
          <li>
            <strong>Se till totalkostnaden</strong> – inte bara månadskostnaden, utan även effektiv
            ränta och avgifter
          </li>
          <li>
            <strong>Betala en större kontantinsats</strong> – ju mer, desto lägre ränta</li>
          <li>
            <strong>Undvik onödiga tilläggsprodukter</strong> – betala bara för det du verkligen behöver
          </li>
        </ol>

        <h2>Vad kostar ett billån typiskt?</h2>
        <p>
          Exempel på billån (2026):
        </p>
        <table>
          <thead>
            <tr>
              <th>Lånebelopp</th>
              <th>Kontantinsats</th>
              <th>Löptid</th>
              <th>Ränta</th>
              <th>Månadskostnad</th>
              <th>Total kostnad</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>150 000 kr</td>
              <td>30 000 kr</td>
              <td>5 år</td>
              <td>7%</td>
              <td>2 376 kr</td>
              <td>172 600 kr</td>
            </tr>
            <tr>
              <td>250 000 kr</td>
              <td>50 000 kr</td>
              <td>7 år</td>
              <td>7%</td>
              <td>3 020 kr</td>
              <td>303 700 kr</td>
            </tr>
            <tr>
              <td>350 000 kr</td>
              <td>70 000 kr</td>
              <td>7 år</td>
              <td>7%</td>
              <td>4 228 kr</td>
              <td>425 200 kr</td>
            </tr>
          </tbody>
        </table>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 my-6">
          <p className="font-medium text-yellow-800">Viktigt</p>
          <p className="text-yellow-700">
            Den här kalkylatorn ger en uppskattning som vägledning. Kontakta alltid din bank för ett
            exakt låneerbjudande med din individuella ränta. Räntesatserna varierar beroende på din
            ekonomi och kreditvärdighet.
          </p>
        </div>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/billaan" />
    </div>
  );
}
