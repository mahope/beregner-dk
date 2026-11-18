import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CONSENT_STORAGE_KEY } from "@/lib/cookie-consent";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";
import { OG_IMAGE } from "@/lib/page-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const locale = await getLocale();
  const title = locale === "se" ? "Cookiepolicy" : "Cookiepolitik";
  const desc =
    locale === "se"
      ? `Läs om vår användning av cookies och localStorage på ${dc.siteName}. Vi använder Plausible och Umami (cookiefritt).`
      : locale === "da"
        ? `Læs om cookies og localStorage på ${dc.siteName}. Google AdSense bruges på udvalgte beregnersider efter samtykke.`
        : `Læs om vores brug af cookies og localStorage på ${dc.siteName}.`;
  const canonicalUrl = `${dc.baseUrl}/cookiepolitik`;
  return {
    title,
    description: desc,
    openGraph: {
      images: OG_IMAGE,
      title: `${title} | ${dc.siteName}`,
      description: desc,
      url: canonicalUrl,
      type: "website",
      siteName: dc.siteName,
      locale: dc.ogLocale,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: { index: true, follow: true },
  };
}

function DaContent({ showAdPolicy }: { showAdPolicy: boolean }) {
  return (
    <div className="prose dark:prose-invert max-w-3xl">
      <h1>Cookiepolitik</h1>
      <p>
        Denne side forklarer, hvordan MinBeregner.dk bruger cookies,
        localStorage og lignende teknologier. Vi værner om dit privatliv og
        bestræber os på at indsamle så lidt data som muligt.
      </p>
      <p>
        <strong>Sidst opdateret:</strong> 17. november 2026
      </p>

      <h2>1. Nødvendige cookies og localStorage</h2>
      <p>
        Vi bruger <strong>localStorage</strong> (ikke cookies) til følgende
        formål, som er nødvendige for sidens funktionalitet:
      </p>
      <ul>
        <li>
          <strong>Tema-præference</strong> (<code>theme</code>) — gemmer dit
          valg af lyst/mørkt tema, så det huskes mellem besøg.
        </li>
        <li>
          <strong>Cookie-samtykke</strong> (<code>{CONSENT_STORAGE_KEY}</code>) — gemmer
          om du har accepteret eller afvist cookies, så du ikke bliver spurgt igen.
        </li>
      </ul>
      <p>
        Disse data forbliver i din browser og sendes ikke til vores servere.
      </p>

      <h2>2. Analyse (Plausible Analytics og Umami)</h2>
      <p>
        Vi bruger <strong>Plausible Analytics</strong> og <strong>Umami</strong> til
        anonym trafikmåling. Begge er privacy-fokuserede analyseværktøjer, der:
      </p>
      <ul>
        <li>Ikke bruger cookies</li>
        <li>Ikke indsamler personhenførbare oplysninger</li>
        <li>Ikke tracker brugere på tværs af sider</li>
        <li>Er hostet på vores egne servere i EU (ingen tredjepartsdata)</li>
      </ul>
      <p>
        Da Plausible og Umami er cookiefrie, kræver de ikke samtykke under
        ePrivacy-direktivet. Data er aggregerede og bruges udelukkende til at
        forbedre siden.
      </p>

      {showAdPolicy && (
        <>
          <h2>3. Annoncecookies (Google AdSense)</h2>
          <p>
            Når annoncer er slået til på MinBeregner.dk, kan Google AdSense vise
            én annonce under resultatet på udvalgte beregnersider. Vi indlæser
            først Google AdSense, når du har accepteret annoncecookies i
            cookiebanneret. Vi beder kun Google om ikke-personaliserede annoncer.
            Google kan bruge cookies til blandt andet at begrænse, hvor ofte du
            ser en annonce, og til at måle annoncer.
          </p>
        </>
      )}

      <h2>{showAdPolicy ? 4 : 3}. Beregninger og brugerdata</h2>
      <p>
        Når du ikke bruger &quot;Del beregning&quot;, sker alle beregninger på
        MinBeregner.dk lokalt i din browser, og de tal, du indtaster, sendes ikke i
        selve beregningen. Delelinks er en undtagelse. Nye boligstøtte-links bruger
        URL-fragmentet, som browseren ikke sender med sideanmodningen. Delelinks fra
        andre beregnere og ældre boligstøtte-links bruger query-parametre, som kan sendes,
        når linket åbnes. Linket kan indeholde oplysninger, som alle med linket kan afkode.
        Vælg derfor kun at dele links med data, du har tilladelse til at videregive.
      </p>

      <h2>{showAdPolicy ? 5 : 4}. Sådan styrer du cookies</h2>
      <p>
        Du kan til enhver tid:
      </p>
      <ul>
        <li>Blokere eller slette cookies via dine browserindstillinger</li>
        <li>
          Trække dit samtykke tilbage ved at rydde sidens gemte data i
          browseren, genindlæse siden og vælge Afvis i cookiebanneret.
        </li>
      </ul>

      <h2>{showAdPolicy ? 6 : 5}. Kontakt</h2>
      <p>
        Har du spørgsmål til vores cookiepolitik, er du velkommen til at
        kontakte os via siden <a href="/om">Om MinBeregner.dk</a>.
      </p>

      <h2>{showAdPolicy ? 7 : 6}. Opdateringer</h2>
      <p>
        Denne cookiepolitik kan blive opdateret ved ændringer i vores brug af
        cookies eller teknologier. Den seneste version vil altid være
        tilgængelig på denne side.
      </p>
    </div>
  );
}

function SeContent() {
  return (
    <div className="prose dark:prose-invert max-w-3xl">
      <h1>Cookiepolicy</h1>
      <p>
        Denna sida förklarar hur Beräknare.se använder cookies,
        localStorage och liknande teknologier. Vi värnar om din integritet och
        strävar efter att samla in så lite data som möjligt.
      </p>
      <p>
        <strong>Senast uppdaterad:</strong> 24 september 2026
      </p>

      <h2>1. Nödvändiga cookies och localStorage</h2>
      <p>
        Vi använder <strong>localStorage</strong> (inte cookies) för följande
        ändamål, som är nödvändiga för webbplatsens funktionalitet:
      </p>
      <ul>
        <li>
          <strong>Temainställning</strong> (<code>theme</code>) — sparar ditt
          val av ljust/mörkt tema, så att inställningen behålls mellan besök.
        </li>
        <li>
          <strong>Cookie-samtycke</strong> (<code>{CONSENT_STORAGE_KEY}</code>) — sparar
          om du har godkänt eller avvisat cookies, så att du inte tillfrågas igen.
        </li>
      </ul>
      <p>
        Dessa data stannar i din webbläsare och skickas inte till våra servrar.
      </p>

      <h2>2. Analys (Plausible Analytics och Umami)</h2>
      <p>
        Vi använder <strong>Plausible Analytics</strong> och <strong>Umami</strong> för
        anonym trafikmätning. Båda är integritetsanpassade analysverktyg som:
      </p>
      <ul>
        <li>Inte använder cookies</li>
        <li>Inte samlar in personidentifierbar information</li>
        <li>Inte spårar användare mellan webbplatser</li>
        <li>Hostas på våra egna servrar i EU (ingen tredjepartsdata)</li>
      </ul>
      <p>
        Eftersom Plausible och Umami är cookiefria kräver de inte samtycke enligt
        ePrivacy-direktivet. Data är aggregerade och används uteslutande för att
        förbättra webbplatsen.
      </p>

      <h2>3. Beräkningar och användardata</h2>
      <p>
        När du inte använder &quot;Dela beräkning&quot; sker beräkningarna lokalt i din
        webbläsare, och siffrorna du anger skickas inte i beräkningsprocessen. Delelänkar
        är ett undantag. Beroende på kalkylator använder de antingen URL:ens fragment,
        som webbläsaren inte skickar med sidans förfrågan, eller en query-parameter, som
        kan skickas när länken öppnas. Länken kan alsoå innehålla uppgifter som alla som
        får den kan avkoda. Dela därför bara länkar med data som du har tillåtit att
        vidarebefordra.
      </p>

      <h2>4. Så hanterar du cookies</h2>
      <p>
        Du kan när som helst:
      </p>
      <ul>
        <li>Blockera eller radera cookies via dina webbläsarinställningar</li>
        <li>Rensa localStorage via webbläsarens utvecklarverktyg</li>
      </ul>

      <h2>5. Kontakt</h2>
      <p>
        Har du frågor om vår cookiepolicy är du välkommen att
        kontakta oss via sidan <a href="/om">Om Beräknare.se</a>.
      </p>

      <h2>6. Uppdateringar</h2>
      <p>
        Denna cookiepolicy kan uppdateras vid ändringar i vår användning av
        cookies eller teknologier. Den senaste versionen finns alltid
        tillgänglig på denna sida.
      </p>
    </div>
  );
}

export default async function CookiePolitikPage() {
  const locale = await getLocale();
  const breadcrumbName = locale === "se" ? "Cookiepolicy" : "Cookiepolitik";

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ name: breadcrumbName, href: "/cookiepolitik" }]} />
      {locale === "se" ? <SeContent /> : <DaContent showAdPolicy={locale === "da"} />}
    </div>
  );
}
