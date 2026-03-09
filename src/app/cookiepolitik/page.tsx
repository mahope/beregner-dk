import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const locale = await getLocale();
  const title = locale === "se" ? "Cookiepolicy" : "Cookiepolitik";
  const desc =
    locale === "se"
      ? `Läs om vår användning av cookies och localStorage på ${dc.siteName}. Vi använder Plausible Analytics (cookiefritt) och Google AdSense (annonscookies efter samtycke).`
      : `Læs om vores brug af cookies og localStorage på ${dc.siteName}. Vi bruger Plausible Analytics (cookiefrit) og Google AdSense (annoncecookies efter samtykke).`;
  return {
    title: `${title} | ${dc.siteName}`,
    description: desc,
    robots: { index: true, follow: true },
  };
}

function DaContent() {
  return (
    <div className="prose dark:prose-invert max-w-3xl">
      <h1>Cookiepolitik</h1>
      <p>
        Denne side forklarer, hvordan MinBeregner.dk bruger cookies,
        localStorage og lignende teknologier. Vi værner om dit privatliv og
        bestræber os på at indsamle så lidt data som muligt.
      </p>
      <p>
        <strong>Sidst opdateret:</strong> marts 2026
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
          <strong>Cookie-samtykke</strong> (<code>cookie-consent</code>) — gemmer
          om du har accepteret eller afvist cookies, så du ikke bliver spurgt igen.
        </li>
      </ul>
      <p>
        Disse data forbliver i din browser og sendes ikke til vores servere.
      </p>

      <h2>2. Analyse (Plausible Analytics)</h2>
      <p>
        Vi bruger <strong>Plausible Analytics</strong> til anonym trafikmåling.
        Plausible er et privacy-fokuseret analyseværktøj, der:
      </p>
      <ul>
        <li>Ikke bruger cookies</li>
        <li>Ikke indsamler personhenførbare oplysninger</li>
        <li>Ikke tracker brugere på tværs af sider</li>
        <li>Er hostet på vores egen server (ingen tredjepartsdata)</li>
      </ul>
      <p>
        Da Plausible er cookiefrit, kræver det ikke samtykke under
        ePrivacy-direktivet. Data er aggregerede og bruges udelukkende til at
        forbedre siden.
      </p>

      <h2>3. Annoncecookies (Google AdSense)</h2>
      <p>
        Vi bruger <strong>Google AdSense</strong> til at vise annoncer på
        siden. Google kan sætte cookies til følgende formål:
      </p>
      <ul>
        <li>Vise relevante annoncer baseret på dit besøg</li>
        <li>Begrænse antallet af gange du ser en annonce</li>
        <li>Måle annoncers effektivitet</li>
      </ul>
      <p>
        Disse cookies aktiveres, når du interagerer med siden. Du kan til enhver
        tid administrere dine annoncepræferencer via{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Googles annonceindstillinger
        </a>
        .
      </p>

      <h2>4. Beregninger og brugerdata</h2>
      <p>
        Alle beregninger på MinBeregner.dk sker <strong>lokalt i din
        browser</strong>. De tal du indtaster i vores beregnere sendes ikke til
        vores servere og gemmes ikke af os.
      </p>

      <h2>5. Sådan styrer du cookies</h2>
      <p>
        Du kan til enhver tid:
      </p>
      <ul>
        <li>Blokere eller slette cookies via dine browserindstillinger</li>
        <li>Rydde localStorage via browserens udviklerværktøjer</li>
        <li>
          Fravælge personaliserede annoncer via{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Googles annonceindstillinger
          </a>
        </li>
      </ul>

      <h2>6. Kontakt</h2>
      <p>
        Har du spørgsmål til vores cookiepolitik, er du velkommen til at
        kontakte os via siden <a href="/om">Om MinBeregner.dk</a>.
      </p>

      <h2>7. Opdateringer</h2>
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
        <strong>Senast uppdaterad:</strong> mars 2026
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
          <strong>Cookie-samtycke</strong> (<code>cookie-consent</code>) — sparar
          om du har godkänt eller avvisat cookies, så att du inte tillfrågas igen.
        </li>
      </ul>
      <p>
        Dessa data stannar i din webbläsare och skickas inte till våra servrar.
      </p>

      <h2>2. Analys (Plausible Analytics)</h2>
      <p>
        Vi använder <strong>Plausible Analytics</strong> för anonym trafikmätning.
        Plausible är ett integritetsanpassat analysverktyg som:
      </p>
      <ul>
        <li>Inte använder cookies</li>
        <li>Inte samlar in personidentifierbar information</li>
        <li>Inte spårar användare mellan webbplatser</li>
        <li>Hostas på vår egen server (ingen tredjepartsdata)</li>
      </ul>
      <p>
        Eftersom Plausible är cookiefritt kräver det inte samtycke enligt
        ePrivacy-direktivet. Data är aggregerade och används uteslutande för att
        förbättra webbplatsen.
      </p>

      <h2>3. Annonscookies (Google AdSense)</h2>
      <p>
        Vi använder <strong>Google AdSense</strong> för att visa annonser på
        webbplatsen. Google kan sätta cookies för följande ändamål:
      </p>
      <ul>
        <li>Visa relevanta annonser baserat på ditt besök</li>
        <li>Begränsa antalet gånger du ser en annons</li>
        <li>Mäta annonsers effektivitet</li>
      </ul>
      <p>
        Dessa cookies aktiveras när du interagerar med webbplatsen. Du kan när som helst
        hantera dina annonsinställningar via{" "}
        <a
          href="https://adssettings.google.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Googles annonsinställningar
        </a>
        .
      </p>

      <h2>4. Beräkningar och användardata</h2>
      <p>
        Alla beräkningar på Beräknare.se sker <strong>lokalt i din
        webbläsare</strong>. De siffror du anger i våra beräkningsverktyg skickas inte till
        våra servrar och sparas inte av oss.
      </p>

      <h2>5. Så hanterar du cookies</h2>
      <p>
        Du kan när som helst:
      </p>
      <ul>
        <li>Blockera eller radera cookies via dina webbläsarinställningar</li>
        <li>Rensa localStorage via webbläsarens utvecklarverktyg</li>
        <li>
          Välja bort personanpassade annonser via{" "}
          <a
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Googles annonsinställningar
          </a>
        </li>
      </ul>

      <h2>6. Kontakt</h2>
      <p>
        Har du frågor om vår cookiepolicy är du välkommen att
        kontakta oss via sidan <a href="/om">Om Beräknare.se</a>.
      </p>

      <h2>7. Uppdateringar</h2>
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
      {locale === "se" ? <SeContent /> : <DaContent />}
    </div>
  );
}
