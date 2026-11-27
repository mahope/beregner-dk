import { isAdSenseEnabled } from "@/lib/ads";
import { CVRRADAR_TILBAGETRAEK_URL, isMomsCvrEnabled } from "@/lib/moms-cvr";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/page-helpers";
import { ruteCacheSætning } from "@/lib/rute-cache";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const locale = await getLocale();
  const title = locale === "se" ? "Integritetspolicy" : "Privatlivspolitik";
  const desc =
    locale === "se"
      ? `Läs om hur ${dc.siteName} hanterar dina data. Vi använder integritetsanpassad analys utan cookies. Alla beräkningar sker lokalt i din webbläsare.`
      : `Læs om hvordan ${dc.siteName} håndterer dine data. Vi bruger privacy-fokuseret analytics uden cookies. Alle beregninger sker lokalt i din browser.`;
  return {
    title,
    description: desc,
    openGraph: {
      images: OG_IMAGE,
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

/** The optional CVR field on /moms. Shown only while NEXT_PUBLIC_MOMS_CVR is on. */
function CvrAfsnit() {
  return (
    <>
      <h2 id="cvr" className="scroll-mt-24">
        CVR-nummer på momsberegneren
      </h2>
      <p>
        På momsberegneren kan du skrive din virksomheds CVR-nummer og se momsstatus, momsperiode og de næste
        momsfrister. Det er frivilligt, og beregneren virker fuldt ud uden.
      </p>
      <ul>
        <li>
          <strong>Uden samtykke:</strong> Din browser sender CVR-nummeret til vores server i selve anmodningen (ikke i
          URL&apos;en). Serveren slår virksomheden op hos cvrradar.dk, som også drives af Mahope, og sender kun
          CVR-nummeret videre. Din IP-adresse sendes ikke videre, og vi gemmer intet om dit opslag.
        </li>
        <li>
          <strong>Med samtykke:</strong> Sætter du flueben i &quot;Det er min virksomhed …&quot;, gemmer Mahope (CVR
          39413892), som driver minberegner.dk og cvrradar.dk, at virksomhedens internetforbindelse hører til
          CVR-nummeret. Vi gemmer kun netværksdelen af IP-adressen: de første tre dele af en IPv4-adresse (fx
          192.0.2.x) eller de første tre grupper af en IPv6-adresse. Vores server skærer adressen til, før den sendes
          til cvrradar.dk, så den fulde adresse aldrig gemmes eller logges. Sammen med netværket gemmes CVR-nummeret,
          datoen for besøget og hvad du har givet samtykke til. Netværket bliver først genkendt, når det er bekræftet
          en gang til, fx ved endnu et besøg en anden dag. Det gælder kun selskaber (ApS, A/S og lignende); for
          enkeltmandsvirksomheder gemmes intet.
        </li>
        <li>
          <strong>Formål:</strong> At genkende besøg fra virksomhedens netværk på vores egne sites og i cvrradar.dk&apos;s
          tjenester til virksomheder.
        </li>
        <li>
          <strong>Hvad vi ikke gemmer:</strong> Din fulde IP-adresse, dit navn, din e-mail og din beregning. Vi sætter
          ingen cookies. Vi henter heller ingen oplysninger om ejere eller direktører.
        </li>
        <li>
          <strong>Opbevaring:</strong> Oplysningen slettes 30 dage efter sidste besøg fra netværket.
        </li>
        <li>
          <strong>Grundlag og tilbagetrækning:</strong> Behandlingen sker på grundlag af dit samtykke
          (databeskyttelsesforordningens artikel 6, stk. 1, litra a). Du kan trække samtykket tilbage når som helst på
          siden{" "}
          <a href={CVRRADAR_TILBAGETRAEK_URL} target="_blank" rel="noopener noreferrer">
            Slet vores virksomheds netværk
          </a>{" "}
          på cvrradar.dk eller ved at skrive til os. Tilbagetrækning påvirker ikke det, der er sket før.
        </li>
      </ul>
      <p>
        Dette er det eneste sted, hvor vi gemmer noget, der stammer fra en IP-adresse, og kun når du selv har givet
        samtykke. Vores analytics (se nedenfor) indsamler stadig ingen IP-adresser.
      </p>
    </>
  );
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
          {isMomsCvrEnabled() && (
            <>
              {" "}
              Eneste undtagelse er CVR-feltet på momsberegneren: giver du samtykke dér, gemmer vi, hvilket netværk
              din virksomhed bruger. Se <a href="#cvr">CVR-nummer på momsberegneren</a>.
            </>
          )}
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
            <strong>Ingen adresser gemmes:</strong> Vi gemmer hverken dine adresser eller svaret
            fra BBR, og de står ikke i vores logfiler. {ruteCacheSætning()} Analytics registrerer
            kun, at et opslag er foretaget, og om det lykkedes, aldrig selve adressen.
          </li>
        </ul>
        <p>
          Vælger du at dele via QR-kode, sociale medier eller e-mail, sender din browser
          linket til den valgte tjeneste. QR-tjenesten modtager hele URL&apos;en. Del kun
          beregninger med personer, du har tilladelse til at give oplysningerne til.
        </p>

        {isMomsCvrEnabled() && <CvrAfsnit />}

        <h2>Cookies og lokal lagring</h2>
        <p>
          Vores trafikmåling bruger ingen cookies. Vi bruger browserens
          <strong> localStorage</strong> til følgende indstillinger:
        </p>
        <ul>
          <li>
            <strong>Tema-præference:</strong> Gemmer om du foretrækker lys,
            mørk eller system-tema, så indstillingen huskes ved næste besøg.
          </li>
          <li>
            <strong>Cookievalg:</strong> Gemmer, om og hvornår du valgte Accepter
            eller Afvis. Du kan ændre valget under <strong>Cookieindstillinger</strong> i footeren.
          </li>
        </ul>
        <p>
          localStorage er lokal lagring i din browser. Dataene sendes ikke til
          vores server og kan slettes ved at rydde browserdata.
        </p>

        <h2>Analytics</h2>
        <p>
          Vi bruger <strong>Plausible Analytics</strong> og <strong>Umami</strong>{" "}
          (begge self-hosted på vores egne servere i EU) til at
          forstå hvilke beregnere der er populære og hvordan vi kan forbedre
          sitet. Vi har valgt dem fordi de:
        </p>
        <ul>
          <li><strong>Ikke bruger cookies</strong> — ingen cookie-banner nødvendig for analytics</li>
          <li><strong>Ikke tracker individuelle brugere</strong> — ingen personprofiler</li>
          <li>
            <strong>Ikke indsamler persondata</strong> — ingen IP-adresser, fingerprints eller device IDs
            {isMomsCvrEnabled() && " (det samtykkebaserede CVR-felt ovenfor er adskilt fra vores analytics)"}
          </li>
          <li><strong>Er GDPR-kompatible</strong> uden samtykke, da de ikke er personhenførbare</li>
          <li><strong>Er self-hosted</strong> — data forlader ikke vores egne servere</li>
        </ul>
        <p>
          Vi måler aggregerede tal som sidevisninger, mest besøgte beregnere,
          og antal beregninger. Vi kan ikke identificere individuelle brugere.
        </p>

        {isAdSenseEnabled() && (
          <>
            <h2>Google AdSense</h2>
            <p>
              MinBeregner.dk kan vise en annonce fra Google AdSense på udvalgte
              beregnersider. Efter dit samtykke indlæser din browser Googles
              annoncescript, og vi anmoder om ikke-personaliserede annoncer.
              Google modtager blandt andet din IP-adresse og den side, du besøger.
              Google kan bruge cookies til at begrænse, hvor ofte du ser en annonce,
              måle annoncevisninger og bekæmpe misbrug.
              Se <a href="https://policies.google.com/technologies/partner-sites?hl=da">hvordan Google bruger oplysninger fra partnersider</a>.
            </p>
            <p>
              Du kan til enhver tid trække samtykket tilbage. Vælg
              {" "}<strong>Cookieindstillinger</strong> i footeren og derefter Afvis.
              Siden kan genindlæses for at stoppe det annoncescript, der allerede
              er startet. Du kan slette tidligere gemte cookies i din browser.
            </p>
            <p>
              Du kan kontakte os på adressen nedenfor om dine rettigheder,
              fx indsigt, rettelse eller sletning af personoplysninger.
            </p>
          </>
        )}

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
            Vi bruger privacy-fokuseret analytics uden cookies. Vores trafikmåling
            følger ikke individuelle brugere.
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Sidst opdateret: 18. november 2026
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
          Vår trafikanalys använder inga kakor. Vi använder webbläsarens
          <strong> localStorage</strong> för följande inställningar:
        </p>
        <ul>
          <li>
            <strong>Temainställning:</strong> Sparar om du föredrar ljust,
            mörkt eller systemtema, så att inställningen behålls vid nästa besök.
          </li>
          <li>
            <strong>Cookieval:</strong> Sparar om och när du valde Acceptera
            eller Avvisa. Du kan ändra valet under <strong>Cookieinställningar</strong> i sidfoten.
          </li>
        </ul>
        <p>
          localStorage är lokal lagring i din webbläsare. Data skickas inte till
          vår server och kan raderas genom att rensa webbläsardata.
        </p>

        <h2>Analys</h2>
        <p>
          Vi använder <strong>Plausible Analytics</strong> och <strong>Umami</strong>{" "}
          (båda self-hosted på våra egna servrar i EU) för att
          förstå vilka beräkningsverktyg som är populära och hur vi kan förbättra
          webbplatsen. Vi har valt dem eftersom de:
        </p>
        <ul>
          <li><strong>Inte använder cookies</strong> — ingen cookie-banner krävs för analys</li>
          <li><strong>Inte spårar enskilda användare</strong> — inga personprofiler</li>
          <li><strong>Inte samlar in persondata</strong> — inga IP-adresser, fingeravtryck eller enhets-ID:n</li>
          <li><strong>Är GDPR-kompatibla</strong> utan samtycke, eftersom de inte är personidentifierbara</li>
          <li><strong>Är self-hosted</strong> — data lämnar inte våra egna servrar</li>
        </ul>
        <p>
          Vi mäter aggregerade tal som sidvisningar, mest besökta beräkningsverktyg
          och antal beräkningar. Vi kan inte identifiera enskilda användare.
        </p>

        {isAdSenseEnabled() && (
          <>
            <h2>Google AdSense</h2>
            <p>
              Vår danska webbplats MinBeregner.dk kan visa annonser från Google
              AdSense på utvalda sidor efter samtycke. Beräknare.se laddar aldrig
              Googles annonsskript. På den danska webbplatsen begär vi
              icke-personanpassade annonser. Google tar då bland annat emot
              besökarens IP-adress och uppgift om vilken sida som besöks. Google
              kan använda kakor för att begränsa antalet annonsvisningar, mäta
              annonser och motverka missbruk.
              Se <a href="https://policies.google.com/technologies/partner-sites?hl=sv">hur Google använder uppgifter från partnersidor</a>.
            </p>
            <p>
              På den danska webbplatsen kan du när som helst återkalla ditt samtycke.
              Välj Cookieindstillinger i sidfoten och sedan Afvis. Här på Beräknare.se
              kan du ändra ditt lokala val under <strong>Cookieinställningar</strong>.
              Du kan kontakta oss på adressen nedan om dina rättigheter, till
              exempel tillgång till, rättelse eller radering av personuppgifter.
            </p>
          </>
        )}

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
            Vi använder integritetsanpassad analys utan cookies. Vår trafikanalys
            spårar inte enskilda användare.
          </p>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          Senast uppdaterad: 18 november 2026
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
