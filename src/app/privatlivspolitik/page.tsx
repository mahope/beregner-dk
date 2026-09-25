import Breadcrumbs from "@/components/Breadcrumbs";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const locale = await getLocale();
  const title = locale === "se" ? "Integritetspolicy" : "Privatlivspolitik";
  const desc =
    locale === "se"
      ? `Läs om hur ${dc.siteName} hanterar dina data. Vi använder integritetsanpassad analys utan cookies. Alla beräkningar sker lokalt i din webbläsare.`
      : `Læs om hvordan ${dc.siteName} håndterer dine data. Vi bruger privacy-fokuseret analytics uden cookies. Alle beregninger sker lokalt i din browser.`;
  return {
    title: `${title} - ${dc.siteName}`,
    description: desc,
    openGraph: {
      title: `${title} - ${dc.siteName}`,
      description: desc,
      url: `${dc.baseUrl}/privatlivspolitik`,
      type: "website",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: `${dc.baseUrl}/privatlivspolitik`,
    },
  };
}

function DaContent() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Privatlivspolitik</h1>
      <div className="prose max-w-none dark:prose-invert">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          <strong>TL;DR:</strong> Vi lagrer ikke dine personlige input i nogen database. Alle
          beregninger sker lokalt i din browser. Vi bruger privacy-fokuseret
          analytics uden cookies og uden persondata.
        </p>

        <h2>Dine beregningsdata</h2>
        <p>
          Når du bruger vores beregnere, indtaster du oplysninger som vægt,
          højde, løn osv. Disse data:
        </p>
        <ul>
          <li>Behandles kun lokalt i din browser (JavaScript)</li>
          <li>Sendes ikke i selve beregningsprocessen</li>
          <li>Gemmes ikke i nogen database</li>
          <li>Forsvinder fra formularen, når du lukker fanen</li>
        </ul>
        <p>
          Hvis du bruger &quot;Del beregning&quot;-funktionen, kodes dine input-værdier i
          URL&apos;en, så modtageren kan se den samme beregning. I
           boligstøtte-siden ligger de nye data i URL&apos;ens fragment (efter #), som
          browseren ikke sender med sideanmodningen. Værdierne kan stå i
          browserhistorikken, og enhver, der modtager linket, kan dekode dem. Delelinks fra
          andre beregnere ligger i URL-parametrene og kan sendes, når linket åbnes. Før
          analytics registrerer en sidevisning, flyttes den kodede boligstøtte-state fra
          URL-fragmentet til sidens lokale history-buffer og fjernes fra den synlige URL;
          den bruges kun lokalt til at genskabe beregningen. Gamle boligstøtte-links kan
          stadig bruge en query-parameter, som kan sendes med sideanmodningen.
          Service workeren gemmer ikke gamle query-links med delestat i sin cache. Brug
          derfor kun nye fragmentlinks til følsomme oplysninger.
        </p>

        <h2>Adresseopslag, BBR og køreafstand</h2>
        <p>
          På enkelte boligberegnere (fx boligstøtte, husleje og kvadratmeter) kan du slå en
          adresse op og få boligens areal udfyldt. På befordringsfradrag kan du skrive hjem- og
          arbejdsadresse og få køreafstanden udfyldt. Det er frivilligt, og du kan altid udfylde
          felterne selv.
        </p>
        <ul>
          <li>
            <strong>Adressesøgning:</strong> Mens du skriver, sender din browser teksten direkte
            til Adressevælger (adressevaelger.dk), Klimadatastyrelsens offentlige adresseservice.
            Den går ikke via vores server.
          </li>
          <li>
            <strong>BBR-opslag:</strong> Når du vælger en adresse, sender din browser adressens
            id til vores server, som slår boligen op i BBR og matriklen hos Datafordeleren og
            sender arealet, antal værelser og byggeår tilbage. Id&apos;et sendes i selve
            anmodningen og ikke i URL&apos;en.
          </li>
          <li>
            <strong>Køreafstand:</strong> Når du har valgt begge adresser, henter din browser
            deres koordinater hos Adressevælger og sender kun de to koordinatsæt – ikke
            adresserne – til vores server i selve anmodningen. Serveren sender koordinaterne
            videre til en ruteberegningstjeneste baseret på OpenStreetMap (FOSSGIS e.V.s
            routing-servere i Tyskland), som returnerer køreafstanden. FOSSGIS ser vores
            servers IP-adresse, ikke din, og kan logge forespørgslen efter sin egen
            privatlivspolitik.
          </li>
          <li>
            <strong>Intet gemmes:</strong> Vi gemmer hverken adresser, koordinater eller svaret
            fra BBR, og de står ikke i vores logfiler. Køreafstanden holdes kun kortvarigt i
            serverens hukommelse, så samme opslag ikke skal beregnes igen. Analytics registrerer kun, at et opslag er
            foretaget, og om det lykkedes, aldrig selve adressen.
          </li>
        </ul>
        <p>
          Vælger du at dele via QR-kode, sociale medier eller e-mail, sender din browser
          linket til den valgte tjeneste. QR-tjenesten modtager hele URL&apos;en. Del kun
          beregninger med personer, du har tilladelse til at give oplysningerne til.
        </p>

        <h2>Cookies og lokal lagring</h2>
        <p>
          MinBeregner.dk bruger <strong>ingen tracking-cookies</strong>. Vi
          bruger dog browserens <strong>localStorage</strong> til to formål:
        </p>
        <ul>
          <li>
            <strong>Tema-præference:</strong> Gemmer om du foretrækker lys,
            mørk eller system-tema, så indstillingen huskes ved næste besøg.
          </li>
          <li>
            <strong>Cookie-samtykke:</strong> Gemmer at du har set og accepteret
            vores cookie-banner, så den ikke vises igen.
          </li>
        </ul>
        <p>
          localStorage er lokal lagring i din browser. Dataene sendes ikke til
          vores server og kan slettes ved at rydde browserdata.
        </p>

        <h2>Analytics</h2>
        <p>
          Vi bruger <strong>Plausible Analytics</strong> (self-hosted) til at
          forstå hvilke beregnere der er populære og hvordan vi kan forbedre
          sitet. Plausible er valgt fordi det:
        </p>
        <ul>
          <li><strong>Ikke bruger cookies</strong> — ingen cookie-banner nødvendig for analytics</li>
          <li><strong>Ikke tracker individuelle brugere</strong> — ingen personprofiler</li>
          <li><strong>Ikke indsamler persondata</strong> — ingen IP-adresser, fingerprints eller device IDs</li>
          <li><strong>Er GDPR-kompatibelt</strong> uden samtykke, da det ikke er personhenførbart</li>
          <li><strong>Er self-hosted</strong> — data forlader ikke vores egen server</li>
        </ul>
        <p>
          Vi måler aggregerede tal som sidevisninger, mest besøgte beregnere,
          og antal beregninger. Vi kan ikke identificere individuelle brugere.
        </p>

        <h2>Annonce- og affiliate-links</h2>
        <p>
          Visse beregnere indeholder affiliate-links til finansielle partnere
          (fx banker, låneudbydere). Disse er altid tydeligt markeret med
          &quot;Annonce&quot; i henhold til dansk markedsføringslov.
        </p>
        <p>
          Når du klikker på et affiliate-link, sendes du til partnerens
          website, som har sin egen privatlivspolitik. Vi deler ingen
          persondata med vores affiliate-partnere.
        </p>

        <h2>Hosting og serverlogfiler</h2>
        <p>
          Vores website hostes på en server, der drives med Dokploy. Serveren
          fører af sikkerhedsmæssige årsager en teknisk adgangslog med
          tidspunkt, IP-adresse og hvilken side der blev hentet. Loggen slettes
          automatisk hver nat og bruges ikke til analyse eller tracking.
          Adresser og koordinater fra adresseopslag, BBR og køreafstand står ikke i
          loggen, fordi de sendes i selve anmodningen og ikke i URL&apos;en.
        </p>

        <h2>Eksterne links</h2>
        <p>
          Vores sider indeholder links til offentlige websites som skat.dk,
          borger.dk, su.dk og a-kasser. Disse sites har deres egne
          privatlivspolitikker, som vi ikke kontrollerer.
        </p>

        <h2>Børn</h2>
        <p>
          Vores tjeneste er ikke rettet mod børn under 13 år, og vi indsamler
          ikke bevidst oplysninger fra børn.
        </p>

        <h2>Ændringer til denne politik</h2>
        <p>
          Hvis vi ændrer vores privatlivspolitik, opdaterer vi denne side med
          dato for seneste ændring.
        </p>

        <h2>Kontakt</h2>
        <p>
          Har du spørgsmål om vores privatlivspolitik, er du velkommen til at
          kontakte os på:{" "}
          <a href="mailto:kontakt@minberegner.dk">kontakt@minberegner.dk</a>
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Vores løfte</p>
          <p className="text-green-700 dark:text-green-400">
            Vi tror på privatliv by design. Alle beregninger sker i din browser.
            Vi bruger privacy-fokuseret analytics uden cookies. Vi sælger ikke
            data og tracker ikke individuelle brugere.
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Sidst opdateret: 25. september 2026
        </p>
      </div>
    </>
  );
}

function SeContent() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Integritetspolicy</h1>
      <div className="prose max-w-none dark:prose-invert">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          <strong>Sammanfattning:</strong> Vi lagrar inte dina personliga inmatningar i någon databas. Alla
          beräkningar sker lokalt i din webbläsare. Vi använder integritetsanpassad
          analys utan cookies och utan persondata.
        </p>

        <h2>Dina beräkningsdata</h2>
        <p>
          När du använder våra beräkningsverktyg anger du uppgifter som vikt,
          längd, lön osv. Dessa data:
        </p>
        <ul>
          <li>Behandlas enbart lokalt i din webbläsare (JavaScript)</li>
          <li>Skickas inte i själva beräkningsprocessen</li>
          <li>Lagras inte i någon databas</li>
          <li>Försvinner från formuläret när du stänger fliken</li>
        </ul>
        <p>
          Om du använder funktionen &quot;Dela beräkning&quot; kodas dina inmatade värden i
          URL:en, så att mottagaren kan se samma beräkning. Beroende på kalkylator ligger
          uppgifterna i URL:ens fragment, som webbläsaren inte skickar i sidans förfrågan,
          eller i en query-parameter, som kan skickas när länken öppnas. Värdena kan
          finnas i webbläsarens historik, och alla som får länken kan avkoda dem. Dela
          endast beräkningar med personer som du har tillåtit att ta del av uppgifterna.
        </p>
        <p>
          Väljer du att dela via QR-kod, sociala medier eller e-post skickar din webbläsare
          länken till den valda tjänsten. Dela endast beräkningar med personer som du har
          tillåtit att ta del av uppgifterna.
        </p>

        <h2>Cookies och lokal lagring</h2>
        <p>
          Beräknare.se använder <strong>inga spårningscookies</strong>. Vi
          använder dock webbläsarens <strong>localStorage</strong> för två ändamål:
        </p>
        <ul>
          <li>
            <strong>Temainställning:</strong> Sparar om du föredrar ljust,
            mörkt eller systemtema, så att inställningen behålls vid nästa besök.
          </li>
          <li>
            <strong>Cookie-samtycke:</strong> Sparar att du har sett och godkänt
            vår cookie-banner, så att den inte visas igen.
          </li>
        </ul>
        <p>
          localStorage är lokal lagring i din webbläsare. Data skickas inte till
          vår server och kan raderas genom att rensa webbläsardata.
        </p>

        <h2>Analys</h2>
        <p>
          Vi använder <strong>Plausible Analytics</strong> (self-hosted) för att
          förstå vilka beräkningsverktyg som är populära och hur vi kan förbättra
          webbplatsen. Plausible är valt eftersom det:
        </p>
        <ul>
          <li><strong>Inte använder cookies</strong> — ingen cookie-banner krävs för analys</li>
          <li><strong>Inte spårar enskilda användare</strong> — inga personprofiler</li>
          <li><strong>Inte samlar in persondata</strong> — inga IP-adresser, fingeravtryck eller enhets-ID:n</li>
          <li><strong>Är GDPR-kompatibelt</strong> utan samtycke, eftersom det inte är personidentifierbart</li>
          <li><strong>Är self-hosted</strong> — data lämnar inte vår egen server</li>
        </ul>
        <p>
          Vi mäter aggregerade tal som sidvisningar, mest besökta beräkningsverktyg
          och antal beräkningar. Vi kan inte identifiera enskilda användare.
        </p>

        <h2>Annons- och affiliatelänkar</h2>
        <p>
          Vissa beräkningsverktyg innehåller affiliatelänkar till finansiella partners
          (t.ex. banker, långivare). Dessa är alltid tydligt markerade med
          &quot;Annons&quot; i enlighet med svensk marknadsföringslag.
        </p>
        <p>
          När du klickar på en affiliatelänk skickas du till partnerns
          webbplats, som har sin egen integritetspolicy. Vi delar inga
          personuppgifter med våra affiliatepartners.
        </p>

        <h2>Hosting och serverloggar</h2>
        <p>
          Vår webbplats hostas hos Dokploy. Som standard loggar webbservrar
          IP-adresser i serverloggar av säkerhetsskäl. Dessa
          loggar raderas automatiskt efter kort tid och används inte för analys
          eller spårning.
        </p>

        <h2>Externa länkar</h2>
        <p>
          Våra sidor innehåller länkar till offentliga webbplatser som skatteverket.se
          och andra myndigheter. Dessa webbplatser har sina egna
          integritetspolicyer som vi inte kontrollerar.
        </p>

        <h2>Barn</h2>
        <p>
          Vår tjänst riktar sig inte till barn under 13 år, och vi samlar
          inte medvetet in uppgifter från barn.
        </p>

        <h2>Ändringar av denna policy</h2>
        <p>
          Om vi ändrar vår integritetspolicy uppdaterar vi denna sida med
          datum för senaste ändring.
        </p>

        <h2>Kontakt</h2>
        <p>
          Har du frågor om vår integritetspolicy är du välkommen att
          kontakta oss på:{" "}
          <a href="mailto:kontakt@minberegner.dk">kontakt@minberegner.dk</a>
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 dark:border-green-500 p-4 my-6 not-prose">
          <p className="font-medium text-green-800 dark:text-green-300">Vårt löfte</p>
          <p className="text-green-700 dark:text-green-400">
            Vi tror på integritet by design. Alla beräkningar sker i din webbläsare.
            Vi använder integritetsanpassad analys utan cookies. Vi säljer inte
            data och spårar inte enskilda användare.
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Senast uppdaterad: 24 september 2026
        </p>
      </div>
    </>
  );
}

export default async function PrivatlivspolitikPage() {
  const locale = await getLocale();
  const breadcrumbName = locale === "se" ? "Integritetspolicy" : "Privatlivspolitik";

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ name: breadcrumbName, href: "/privatlivspolitik" }]} />
      {locale === "se" ? <SeContent /> : <DaContent />}
    </div>
  );
}
