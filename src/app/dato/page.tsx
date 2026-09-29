import dynamic from "next/dynamic";
const DatoBeregner = dynamic(() => import("@/components/DatoBeregner"));
import { generatePageMetadata } from "@/lib/page-helpers";
import { getLocale, getCurrentDomainConfig } from "@/lib/get-locale";
import { getPageData } from "@/lib/page-data";
import FAQ from "@/components/FAQ";
import RelatedCalculators from "@/components/RelatedCalculators";
import RelateredeArtikler from "@/components/RelateredeArtikler";
import { CalculatorSchema, FAQSchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import { dageTilbageIAaret, getDageTilEvents, getDageTilPrefix, isDageTilLocale, dageTilArm,
} from "@/lib/dage-til";
import { maanedEksempel } from "@/lib/dato-eksempler";
import { formatNumber } from "@/lib/format";

export async function generateMetadata() {
  return generatePageMetadata("dato");
}

export default async function DatoPage() {
  const locale = await getLocale();
  const domainConfig = await getCurrentDomainConfig();
  const pageData = getPageData("dato", locale) || getPageData("dato", "da")!;
  // Search Console (2026-08-27→09-24) har "hvor mange dage er der til 1 december"
  // (996 visninger, pos. 5) og "hvor mange dage er der tilbage af 2026" (223, pos. 5)
  // som to af sidens fire søgninger. `/dage-til/*`-siderne svarer på begge, men
  // `/dato` linkede til ingen af dem: hele kæden lå kun den anden vej.
  const dageTilLinks = isDageTilLocale(locale)
    ? getDageTilEvents(locale).map((event) => ({
        href: `${getDageTilPrefix(locale)}${dageTilArm(event, locale).slug}`,
        question: dageTilArm(event, locale).copy.question,
      }))
    : [];
  // "hvor mange dage er der tilbage af 2026?" (227 visninger, pos. 5 i dansk
  // GSC) og "dagar till 31 dec" (367 visninger i svensk) er to søgninger om
  // årets sidste dag — ikke om nytårsdag. Siden havde nul forekomster af
  // "tilbage af", så taleren faldt hele vejen. Tallet regnes fra dagens dato,
  // altså er den samme server-renderede side svar på dagens spørgsmål.
  const tilbage = dageTilbageIAaret(new Date());
  // "antal dage i en måned" er dansk autocompletes nr. 1 under både "antal dage
  // i en måned" (nr. 2 er Excel) og "hvor mange dage i en måned" (nr. 2 er
  // "uden weekender"), og svensk autocomplete spørger det samme med "antal
  // dagar i en månad" og "hur många arbetsdagar i en månad". Siden svarede på
  // året ("1 år = 365 dage") men aldrig på måneden: 0 forekomster af "i en
  // måned" i begge sprog. Eksemplet følger det kalenderår siden ligger i, så
  // skudårsflaget kan ikke blive stående fra et tidligere år.
  const maaned = maanedEksempel(tilbage.year, 2, locale === "se" ? "se" : "da");

  return (
    <div>
      <CalculatorSchema
        name={pageData.schemaName}
        description={pageData.schemaDescription}
        url={`${domainConfig.baseUrl}/dato`}
        category={pageData.schemaCategory}
      />
      <FAQSchema items={pageData.faqItems} />
      <Breadcrumbs items={[{ name: pageData.breadcrumbCategory, href: pageData.breadcrumbCategoryHref }, { name: pageData.title, href: "/dato" }]} />

      <h1 className="text-3xl font-bold mb-2">{pageData.title}</h1>
      <p className="text-gray-600 mb-8">
        {pageData.description}
      </p>

      <DatoBeregner />

      {locale === "da" && (
      <div className="mt-12 prose max-w-none">
        <h2>Sådan bruger du datoberegneren</h2>
        <p>Datoberegneren har <strong>fire forskellige funktioner</strong>:</p>

        <h3>1. Dage mellem datoer</h3>
        <p>
          Beregn hvor mange <strong>dage der er mellem to datoer</strong>. Du får også antal
          uger, ca. måneder, arbejdsdage og weekenddage.
        </p>
        <ul>
          <li>Vælg startdato og slutdato</li>
          <li>Resultatet vises automatisk</li>
          <li>
            Negativt tal betyder at slutdato er før startdato
          </li>
        </ul>

        <h3>2. Tilføj dage</h3>
        <p>
          Find ud af hvilken dato det bliver om <strong>X dage</strong>, eller hvilken dato det
          var for X dage siden.
        </p>
        <ul>
          <li>Vælg en udgangsdato</li>
          <li>Indtast antal dage (brug minus for at gå tilbage)</li>
          <li>Se resultatet med ugedag og dato</li>
        </ul>

        <h3>3. Arbejdsdage</h3>
        <p>
          Beregn en dato baseret på antal <strong>arbejdsdage</strong>. Perfekt til
          {" "}<strong>projektplanlægning</strong> og deadline-beregning.
        </p>
        <ul>
          <li>Vælg startdato</li>
          <li>Indtast antal arbejdsdage</li>
          <li>Weekender, helligdage og nytårsaften springes over</li>
        </ul>

        <h3>4. Alder</h3>
        <p>
          Beregn din <strong>præcise alder</strong> i år, måneder og dage. Se også hvor mange
          dage du har levet, og hvornår du fylder år. Vil du finde ud af, hvor gammel du
          var på en bestemt dato, kan du bruge{" "}
          <Link href="/alder">aldersberegneren</Link>.
        </p>

        <h2>Sådan tæller du dage mellem to datoer i Excel</h2>
        <p>
          Læg startdatoen i <strong>A1</strong> og slutdatoen i{" "}
          <strong>B1</strong>, så er den korte formel{" "}
          <code>=B1-A1</code>. Den tæller forskellen i hele døgn: 1. januar
          2026 til 1. januar 2027 er <strong>365 dage</strong>.
        </p>
        <p>
          <code>=DATEDIF(A1;B1;&quot;d&quot;)</code> giver præcis det samme tal,
          men kan også tælle i måneder og år:{" "}
          <code>=DATEDIF(A1;B1;&quot;m&quot;)</code> giver hele måneder og{" "}
          <code>=DATEDIF(A1;B1;&quot;y&quot;)</code> hele år. 15. marts 2026 til
          25. september 2026 er <strong>194 dage</strong> — altså 6 hele måneder.
        </p>
        <p>
          Dansk Excel bruger <strong>semikolon</strong> som skilletegn, fordi
          komma er decimaltegn. <code>DATEDIF</code> er et skjult navn: det
          står ikke i formelassistenten, men virker i alle Excel-versioner.
        </p>
        <p>
          Skal du tælle <strong>arbejdsdage</strong> eller se hvilke
          helligdage der ligger imellem, gør datoberegneren det samme uden at
          du skal skrive en eneste formel.
        </p>

        <h2>Hvor mange dage er der tilbage af {tilbage.year}?</h2>
        <p>
          Der er <strong>{tilbage.dage} dage tilbage af {tilbage.year}</strong> —{" "}
          altså {tilbage.uger} uger og {tilbage.dageEfterUger} dage. Det er den
          officielle kalender, ikke kalorier: årets sidste dag er 31. december,
          så tællingen står på 0 nytårsaften og begynder forfra 1. januar.
        </p>
        <p>
          Er du mere interesseret i datoen end i årstiden, så tæller{" "}
          <a href="/dage-til/1-december">dagene til 1. december</a> og{" "}
          <a href="/dage-til/nytaarsaften">nytårsaften</a> — de er forskellige
          spørgsmål med forskellige tal.
        </p>

        <h2>Hvor mange dage er der i en måned?</h2>
        <p>
          En måned har <strong>28 til 31 dage</strong> — den korteste er februar
          med 28 dage (29 i skudår), og den længste er de syv måneder med 31
          dage. I gennemsnit er en måned{" "}
          <strong>{formatNumber(maaned.gennemsnit, "da", { maximumFractionDigits: 2 })} dage</strong>,
          fordi et gregorianisk år gennemsnitligt har 365,2425 dage fordelt på 12
          måneder. Det gennemsnit er altså et regnestykke, ikke en virkelig
          måned.
        </p>
        <p>
          Her er alle tolv måneder i {maaned.year}, med dage, arbejdsdage og
          weekenddage. Tallene er de samme som værktøjet ovenfor regner, så du
          kan efterprøve hver enkelt række.
        </p>
        <table>
          <thead>
            <tr>
              <th>Måned</th>
              <th>Dage</th>
              <th>Arbejdsdage</th>
              <th>Weekenddage</th>
            </tr>
          </thead>
          <tbody>
            {maaned.raekker.map((r) => (
              <tr key={r.month}>
                <th scope="row">
                  {r.name}
                  {r.skudaar ? " (skudår)" : ""}
                </th>
                <td>{r.dage}</td>
                <td>{r.arbejdsdage}</td>
                <td>{r.weekenddage}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Vil du have antallet uden weekender, står det i kolonnen{" "}
          <strong>Arbejdsdage</strong> — den tæller mandag til fredag og springer
          helligdagene over. Hele året giver de tolv rækker{" "}
          <strong>{formatNumber(maaned.aarArbejdsdage, "da")} arbejdsdage</strong>{" "}
          i {maaned.year}.
        </p>

        <h3>Sådan tæller du dage i en måned i Excel</h3>
        <p>
          Sæt den <strong>første dag i måneden i A1</strong> og den første dag i
          næste måned i <strong>B1</strong>, så giver{" "}
          <code>=B1-A1</code> månedens længde direkte. Med A1 ={" "}
          <code>{maaned.start}</code> og B1 = <code>{maaned.sluttOgKoeb}</code> er
          svaret <strong>{maaned.formelResultat} dage</strong> — samme tal som
          formlen i tabellen ovenfor.
        </p>
        <p>
          <code>=DATEDIF(A1;B1;&quot;d&quot;)</code> giver præcis det samme tal.
          Fælden er, at du ikke må skrive månedens <em>sidste</em> dag: giver du
          B1 = 28. februar, får du 27, fordi Excel tæller forskellen i hele
          døgn. Skriv dagen <em>efter</em> månedens sidste dag, så slipper du
          også for at skulle vide om året er et skudår.
        </p>

        <h2>Hvor mange dage er der i et år?</h2>
        <p>
          Et år har <strong>{formatNumber(maaned.aarDage, "da")} dage</strong> —{" "}
          {maaned.aarDage === 366
            ? `${maaned.year} er et skudår, fordi det er deleligt med 4.`
            : "366 dage, hvis året er et skudår."}{" "}
          Det svarer til {formatNumber(maaned.aarDage / 7, "da", { maximumFractionDigits: 1 })}{" "}
          uger, så et kalenderår er altid lidt mere end 52 uger. Den
          gennemsnitlige arbejdsuge er 5 dage, hvilket giver omkring 260
          hverdage om året.
        </p>

        <h2>Nyttige datofakta</h2>
        <ul>
          <li>
            1 år = {formatNumber(maaned.aarDage, "da")} dage (366 i skudår)
          </li>
          <li>
            1 måned = ca.{" "}
            {formatNumber(maaned.gennemsnit, "da", { maximumFractionDigits: 2 })} dage
            i gennemsnit
          </li>
          <li>1 uge = 7 dage</li>
          <li>1 arbejdsuge = typisk 5 dage</li>
          <li>1 år &asymp; 52 uger</li>
          <li>1 år &asymp; 260 hverdage (uden helligdage)</li>
          <li>{maaned.year} har {formatNumber(maaned.aarArbejdsdage, "da")} arbejdsdage</li>
        </ul>

        <h2>Skudår</h2>
        <p>Et år er et <strong>skudår</strong> hvis:</p>
        <ul>
          <li>Året er deleligt med 4, OG</li>
          <li>Året er IKKE deleligt med 100, MED MINDRE</li>
          <li>Året er deleligt med 400</li>
        </ul>
        <p>
          Eksempel: 2024 er skudår (deleligt med 4). 2100 er ikke skudår
          (deleligt med 100). 2000 var skudår (deleligt med 400).
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tip</p>
          <p className="text-blue-700">
            Arbejdsdage tælles mandag til fredag og springer de offentlige
            helligdage over: nytårsdag, skærtorsdag, langfredag, påskedag,
            2. påskedag, grundlovsdag, juleaftensdag, juledag og 2. juledag.
            Nytårsaften er ikke en helligdag, men er heller ikke en
            arbejdsdag, så den springes også over. Store bededag var
            afskaffet som helligdag i 2024.
          </p>
        </div>
      </div>
      )}

      {locale === "se" && (
      <div className="mt-12 prose max-w-none">
        <h2>Så här använder du datumräknaren</h2>
        <p>Datumräknaren har <strong>fyra olika funktioner</strong>:</p>

        <h3>1. Dagar mellan datum</h3>
        <p>
          Beräkna hur många <strong>dagar det är mellan två datum</strong>. Du får också antal
          hela veckor, ungefärligt antal månader, arbetsdagar och helgdagar.
        </p>
        <ul>
          <li>Välj startdatum och slutdatum</li>
          <li>Resultatet visas automatiskt</li>
          <li>
            Negativt tal betyder att slutdatumet är före startdatumet
          </li>
        </ul>

        <h3>2. Lägg till dagar</h3>
        <p>
          Ta reda på vilket datum det blir om <strong>X dagar</strong>, eller vilket datum det
          var för X dagar sedan.
        </p>
        <ul>
          <li>Välj ett utgångsdatum</li>
          <li>Ange antal dagar (använd minus för att gå bakåt)</li>
          <li>Se resultatet med veckodag och datum</li>
        </ul>

        <h3>3. Arbetsdagar</h3>
        <p>
          Beräkna ett datum baserat på antal <strong>arbetsdagar</strong>. Perfekt för
          {" "}<strong>projektplanering</strong> och deadline-beräkning.
        </p>
        <ul>
          <li>Välj startdatum</li>
          <li>Ange antal arbetsdagar</li>
          <li>Helger och röda dagar hoppas över</li>
        </ul>

        <h3>4. Ålder</h3>
        <p>
          Beräkna din <strong>exakta ålder</strong> i år, månader och dagar. Se också hur många
          dagar du har levt, och när du fyller år.
        </p>

        <h2>Så räknar du ut dagar mellan två datum i Excel</h2>
        <p>
          Lägg startdatumet i <strong>A1</strong> och slutdatumet i{" "}
          <strong>B1</strong>, så är den korta formeln <code>=B1-A1</code>. Den
          räknar skillnaden i hela dygn: 1 januari 2026 till 1 januari 2027 är{" "}
          <strong>365 dagar</strong>.
        </p>
        <p>
          <code>=DATEDIF(A1;B1;&quot;d&quot;)</code> ger exakt samma tal, men kan
          även räkna i månader och år:{" "}
          <code>=DATEDIF(A1;B1;&quot;m&quot;)</code> ger hela månader och{" "}
          <code>=DATEDIF(A1;B1;&quot;y&quot;)</code> hela år. 15 mars 2026 till
          25 september 2026 är <strong>194 dagar</strong> — alltså 6 hela
          månader.
        </p>
        <p>
          Svensk Excel använder <strong>semikolon</strong> som avgränsare,
          eftersom komma är decimaltecken. <code>DATEDIF</code> är ett dolt
          namn: det syns inte i formelassistenten, men fungerar i alla
          Excel-versioner.
        </p>
        <p>
          Vill du räkna <strong>arbetsdagar</strong> eller se vilka helgdagar
          som ligger emellan gör datokalkylatorn samma sak utan att du skriver
          en enda formel.
        </p>

        <h2>Hur många dagar är det kvar av {tilbage.year}?</h2>
        <p>
          Det är <strong>{tilbage.dage} dagar kvar av {tilbage.year}</strong> —
          alltså {tilbage.uger} veckor och {tilbage.dageEfterUger} dagar. Det
          gäller kalenderåret, inte räkenskapsåret: årets sista dag är 31
          december, så räknaren står på 0 nyårsafton och börjar om 1 januari.
        </p>
        <p>
          Vill du räkna till ett bestämt datum i stället för till årsskiftet
          finns <a href="/dagar-till/1-december">dagarna till 1 december</a> och{" "}
          <a href="/dagar-till/nyarsafton">nyårsafton</a> — olika frågor med
          olika siffror.
        </p>

        <h2>Hur många dagar är det i en månad?</h2>
        <p>
          En månad har <strong>28 till 31 dagar</strong> — den kortaste är februari
          med 28 dagar (29 under skottår), och den längsta är de sju månader som
          har 31 dagar. I genomsnitt är en månad{" "}
          <strong>
            {formatNumber(maaned.gennemsnit, "se", { maximumFractionDigits: 2 })} dagar
          </strong>
          , eftersom ett gregoriskt år i genomsnitt har 365,2425 dagar fördelade
          på 12 månader. Genomsnittet är alltså en uträkning, inte en verklig
          månad.
        </p>
        <p>
          Här är alla tolv månader i {maaned.year}, med dagar,
          arbetsdagar och veckoslut. Talen är desamma som verktyget ovan
          räknar, så du kan kontrollera varje rad.
        </p>
        <table>
          <thead>
            <tr>
              <th>Månad</th>
              <th>Dagar</th>
              <th>Arbetsdagar</th>
              <th>Veckoslut</th>
            </tr>
          </thead>
          <tbody>
            {maaned.raekker.map((r) => (
              <tr key={r.month}>
                <th scope="row">
                  {r.name}
                  {r.skudaar ? " (skottår)" : ""}
                </th>
                <td>{r.dage}</td>
                <td>{r.arbejdsdage}</td>
                <td>{r.weekenddage}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Vill du ha antalet utan veckoslut står det i kolumnen{" "}
          <strong>Arbetsdagar</strong> — den räknar måndag till fredag och hoppar
          över helgdagerna. Hela året ger de tolv raderna{" "}
          <strong>
            {formatNumber(maaned.aarArbejdsdage, "se")} arbetsdagar
          </strong>{" "}
          i {maaned.year}.
        </p>

        <h3>Så räknar du ut dagar i en månad i Excel</h3>
        <p>
          Sätt månadens <strong>första dag i A1</strong> och första dagen i
          nästa månad i <strong>B1</strong>, så ger <code>=B1-A1</code> månadens
          längd direkt. Med A1 = <code>{maaned.start}</code> och B1 ={" "}
          <code>{maaned.sluttOgKoeb}</code> blir svaret{" "}
          <strong>{maaned.formelResultat} dagar</strong> — samma tal som i
          tabellen ovan.
        </p>
        <p>
          <code>=DATEDIF(A1;B1;&quot;d&quot;)</code> ger exakt samma tal. Fällan är
          att du inte får skriva månadens <em>sista</em> dag: sätter du B1 = 28
          februari får du 27, eftersom Excel räknar skillnaden i hela dygn. Skriv
          dagen <em>efter</em> månadens sista dag, så slipper du också behöva
          veta om året är ett skottår.
        </p>

        <h2>Hur många dagar är det i ett år?</h2>
        <p>
          Ett år har <strong>{formatNumber(maaned.aarDage, "se")} dagar</strong> —{" "}
          {maaned.aarDage === 366
            ? `${maaned.year} är ett skottår, eftersom det är delbart med 4.`
            : "366 dagar om året är ett skottår."}{" "}
          Det motsvarar{" "}
          {formatNumber(maaned.aarDage / 7, "se", { maximumFractionDigits: 1 })} veckor,
          så ett kalenderår alltid är något mer än 52 veckor. Den genomsnittliga
          arbetsveckan är 5 dagar, vilket blir omkring 260 vardagar per år.
        </p>

        <h2>Nyttiga datumfakta</h2>
        <ul>
          <li>
            1 år = {formatNumber(maaned.aarDage, "se")} dagar (366 under skottår)
          </li>
          <li>
            1 månad = ca{" "}
            {formatNumber(maaned.gennemsnit, "se", { maximumFractionDigits: 2 })} dagar
            i genomsnitt
          </li>
          <li>1 vecka = 7 dagar</li>
          <li>1 arbetsvecka = vanligtvis 5 dagar</li>
          <li>1 år &asymp; 52 veckor</li>
          <li>1 år &asymp; 260 vardagar (utan helgdagar)</li>
        </ul>

        <h2>Skottår</h2>
        <p>Ett år är ett <strong>skottår</strong> om:</p>
        <ul>
          <li>Året är delbart med 4, OCH</li>
          <li>Året är INTE delbart med 100, OM INTE</li>
          <li>Året är delbart med 400</li>
        </ul>
        <p>
          Exempel: 2024 är skottår (delbart med 4). 2100 är inte skottår
          (delbart med 100). 2000 var skottår (delbart med 400).
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 my-6 not-prose">
          <p className="font-medium text-blue-800">Tips</p>
          <p className="text-blue-700">
            Arbetsdagar räknas måndag till fredag och hoppar över Sveriges
            rödagar: nyårsdagen, trettondedag jul, långfredagen, påskdagen,
            annandag påsk, första maj, kristi himmelsfärdsdag, nationaldagen,
            midsommarafton och midsommardagen, alla helgons dag, julafton,
            juldagen, annandag jul och nyårsafton.
          </p>
        </div>
      </div>
      )}

      {dageTilLinks.length > 0 && (
      <div className="prose dark:prose-invert max-w-none mt-12">
        <h2>
          {locale === "se"
            ? "Datum folk oftast räknar ner till"
            : "Datoer folk oftest tæller ned til"}
        </h2>
        <p>
          {locale === "se"
            ? "Vill du veta exakt hur många dagar som är kvar till ett bestämt datum? Sidan för varje datum räknar om sig själv varje dag, så talet är alltid aktuellt."
            : "Vil du se det præcise antal dage til en bestemt dato? Siden for hver dato tæller sig selv frem hver dag, så tallet er altid aktuelt."}
        </p>
        <ul>
          {dageTilLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.question}</Link>
            </li>
          ))}
        </ul>
        <p>
          {locale === "se" ? (
            <>
              Vill du bara räkna ner till ett datum och se det som veckor och dagar kan du
              använda <Link href="/nedtaelling">nedräkningen</Link>.
            </>
          ) : (
            <>
              Vil du bare tælle ned til én dato og se det som uger og dage, kan du bruge{" "}
              <Link href="/nedtaelling">nedtællingen</Link>.
            </>
          )}
        </p>
      </div>
      )}

      <FAQ items={pageData.faqItems} />

      <RelatedCalculators current="/dato" />

      {/* Returlink til indlægget om emnet (kun danske domæner) */}
      <RelateredeArtikler current="/dato" locale={locale} />
    </div>
  );
}
