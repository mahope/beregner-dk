import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  return {
    title: `Cookiepolitik | ${dc.siteName}`,
    description: `Læs om vores brug af cookies og localStorage på ${dc.siteName}. Vi bruger Plausible Analytics (cookiefrit) og Google AdSense (annoncecookies efter samtykke).`,
    robots: { index: true, follow: true },
  };
}

export default function CookiePolitikPage() {
  return (
    <div className="prose dark:prose-invert max-w-3xl">
      <Breadcrumbs items={[{ name: "Cookiepolitik", href: "/cookiepolitik" }]} />

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
        <li>
          Blokere eller slette cookies via dine browserindstillinger
        </li>
        <li>
          Rydde localStorage via browserens udviklerværktøjer
        </li>
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
