import Link from "next/link";
import { generatePageMetadata } from "@/lib/page-helpers";
import { getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import LaantypeBeregner from "@/components/LaantypeBeregner";
import FAQ from "@/components/FAQ";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import RelatedCalculators from "@/components/RelatedCalculators";
import Sidebar from "@/components/Sidebar";
import {
  LAANETYPE_EKSEMPEL_AARSRENTE,
  LAANETYPE_EKSEMPEL_HOVEDSTOL,
  LAANETYPE_EKSEMPEL_LOEBETID,
  laanetypeEksempelFor,
} from "@/lib/laantype";
import { formatNumber, formatSvenskText } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("laantype");
}

export default async function LaantypePage() {
  const domainConfig = await getCurrentDomainConfig();
  const locale = domainConfig.locale;
  const pageData = getPageData("laantype", locale) || getPageData("laantype", "da")!;
  const se = locale === "se";

  // Alle tal i brødteksten læser `laantype.ts`, altså de samme funktioner
  // værktøjet bruger. Skriver brødteksten dem i hånden, kan den og værktøjet
  // komme til at sige hver sit — og de står i Googles svar via FAQSchema.
  const annuitet = laanetypeEksempelFor("annuitet");
  const serielaan = laanetypeEksempelFor("serielaan");
  const staende = laanetypeEksempelFor("staende");
  const krDa = (n: number, d = 0) => formatNumber(n, "da", { maximumFractionDigits: d });
  const krSe = (n: number, d = 0) => formatSvenskText(n, d);
  const belob = se
    ? krSe(LAANETYPE_EKSEMPEL_HOVEDSTOL)
    : krDa(LAANETYPE_EKSEMPEL_HOVEDSTOL);
  const forskelFoerste = se
    ? krSe(serielaan.foersteYdelse - annuitet.foersteYdelse)
    : krDa(serielaan.foersteYdelse - annuitet.foersteYdelse);
  const renteBesparelse = se
    ? krSe(annuitet.samletRente - serielaan.samletRente)
    : krDa(annuitet.samletRente - serielaan.samletRente);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 min-w-0">
        <CalculatorSchema
          name={pageData.schemaName}
          description={pageData.schemaDescription}
          url={`${domainConfig.baseUrl}/laantype`}
          category={pageData.schemaCategory}
        />
        <FAQSchema items={pageData.faqItems} />
        <Breadcrumbs
          items={[
            { name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref },
            { name: pageData.title, href: "/laantype" },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{pageData.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">{pageData.description}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8">
          <LaantypeBeregner />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h2>
            {se
              ? "Vad är skillnaden mellan de tre lånetyperna?"
              : "Hvad er forskellen på de tre lånetyper?"}
          </h2>
          <p>
            {se
              ? `Alla tre betalar tillbaka samma belopp, men de gör det på olika sätt. På ${belob} kr. med ${LAANETYPE_EKSEMPEL_AARSRENTE} % ränta och ${LAANETYPE_EKSEMPEL_LOEBETID} års löptid ger det här vad varje typ kostar.`
              : `Alle tre betaler tilbage det samme beløb, men på forskellige måder. På ${belob} kr. med ${LAANETYPE_EKSEMPEL_AARSRENTE} % rente og ${LAANETYPE_EKSEMPEL_LOEBETID} års løbetid koster det her, hvad hver type giver.`}
          </p>
          <ul>
            <li>
              {se ? "Annuitetslån: " : "Annuitetslån: "}
              {se
                ? `fast betalning på ${krSe(annuitet.foersteYdelse)} kr. varje månad. I början går nästan allt till ränta, mot slutet nästan allt till amortering.`
                : `fast ydelse på ${krDa(annuitet.foersteYdelse)} kr. hver måned. I starten går næsten alt til renter, i slutningen næsten alt til afdrag.`}
            </li>
            <li>
              {se
                ? `Serielån: fast amortering, så betalningen faller fra ${krSe(serielaan.foersteYdelse)} kr. i månad 1 till ${krSe(serielaan.sidsteYdelse)} kr. i den sista.`
                : `Serielån: fast afdrag, så ydelsen falder fra ${krDa(serielaan.foersteYdelse)} kr. i måned 1 til ${krDa(serielaan.sidsteYdelse)} kr. i den sidste.`}
            </li>
            <li>
              {se
                ? `Stående lån: bara ränta på hela beloppet, ${krSe(staende.foersteYdelse)} kr. varje månad, och hela kapitalet löses på sista dagen.`
                : `Stående lån: kun rente på hele beløbet, ${krDa(staende.foersteYdelse)} kr. hver måned, og hele hovedstolen indfrieres på sidste dag.`}
            </li>
          </ul>

          <h2>
            {se
              ? "Annuitetslån vs serielån: hvad er forskjellen?"
              : "Annuitetslån vs serielån: hvad er forskellen?"}
          </h2>
          <p>
            {se
              ? `Serielånet koster ${forskelFoerste} kr. mer i månad 1, men sparar ${renteBesparelse} kr. i ränta över hela löptiden. Anledningen är att skulden amorteras lika fort hela tiden, så mindre kapital räntar.`
              : `Serielånet koster ${forskelFoerste} kr. mere i måned 1, men sparer ${renteBesparelse} kr. i rente over hele løbetiden. Årsagen er, at gælden afdrages lige hurtigt hele vejen, så der løber mindre rente på restgælden.`}
          </p>
          <p>
            {se
              ? `Det avgörande är vad du prioriterar. Banken bedömer din betalningsförmåga på startbetalningen, så ett serielån med hög start är svårare att få. Samtidigt amorterar det snabbare, svararar mer i ränteavdrag de första åren och höjer bostadens värdi snabbare.`
              : `Det afgørende er, hvad du prioriterer. Banken vurderer din betalningsevne på startydelsen, så et serielån med høj start er sværere at få. Samtidig afdrager det hurtigere, giver større rentefradrag de første år og hæver boligens værdi hurtigere.`}
          </p>

          <h2>
            {se ? "Reglerna bak ett stående lån" : "Reglerne bag et stående lån"}
          </h2>
          <p>
            {se
              ? "Ett stående lån är ett amorteringsfritt lån: du betalar bara ränta, och kapitalet står oförändrat tills du löser det. I Danmark är det grundlaget för afdragsfrihed i realkreditlån, eftersom Realkreditlagen inte tillåter lån till ägarbostäder och fritidshus att amorteras långsammare än ett 30-årigt annuitetslån."
              : "Et stående lån er et afdragsfrit lån: du betaler kun rente, og hovedstolen står uændret, indtil du indfrier den. I Danmark er det grundlaget for afdragsfrihed i realkreditlån, fordi realkreditloven ikke tillader lån til ejerboliger og fritidshuse at blive afdraget langsommere end et 30-årigt annuitetslån."}
          </p>
          <p>
            {se
              ? "Det är den avgörande skillnaden mot serielånet, som amorterar varje månad och därför aldrig kan ligga under 30-årsnivånen."
              : "Det er den afgørende forskel til serielånet, der afdrager hver måned og derfor aldrig kan ligge under 30-årsniveauet."}{" "}
            {se ? "Se " : "Se "}
            <Link href="/boliglaan">{se ? "bolånkalkylatorn" : "boliglånsberegneren"}</Link>
            {se
              ? " for, hvad et bolån stiller til afdrag, og "
              : " for, hvad et boliglån stiller til afdrag, og "}
            <Link href="/rentefradrag">{se ? "ränteavdraget" : "rentefradraget"}</Link>
            {se ? " for, hvad lånetypen betyder för skatten." : " for, hvad lånetypen betyder for skatten."}
          </p>

          <h2>
            {se
              ? "Räkna på dina egna tal i stället för på exemplet"
              : "Regn på dine egne tal i stedet for på eksemplet"}
          </h2>
          <p>
            {se
              ? `Exemplet ovan använder ${belob} kr., ${LAANETYPE_EKSEMPEL_AARSRENTE} % och ${LAANETYPE_EKSEMPEL_LOEBETID} år, vilket är själva beloppen som är vanligast i lånekalkylatorer. Räntan är ett räkneexempel och inte en marknadsnivå. Skriver du in din egen ränta och löptid visar verktyget de tre typerna på dina siffror. Vill du se vad lånet betyder for boligudgiften, står det i `
              : `Eksemplet ovenfor bruger ${belob} kr., ${LAANETYPE_EKSEMPEL_AARSRENTE} % og ${LAANETYPE_EKSEMPEL_LOEBETID} år, som er de beløb, lånekalkylatorer oftest regner på. Renten er et regneeksempel og ikke et markedstal. Skriver du din egen rente og løbetid ind, viser værktøjet de tre typer på dine tal. Vil du se, hvad lånet betyder for boligudgiften, står det i `}
            <Link href="/renteberegner">{se ? "ränteberäknaren" : "renteberegneren"}</Link>
            {se ? ", som räknar på både annuitetslån och serielån." : ", som regner på både annuitetslån og serielån."}
          </p>
        </div>

        <div className="mb-8">
          <FAQ items={pageData.faqItems} />
        </div>

        <RelatedCalculators current="/laantype" />
      </div>
      <Sidebar currentHref="/laantype" adSlotId="laantype-sidebar" />
    </div>
  );
}
