import type { Metadata } from "next";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCurrentDomainConfig } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  return {
    title: `Privatlivspolitik - ${dc.siteName}`,
    description: `Læs om hvordan ${dc.siteName} håndterer dine data. Vi bruger privacy-fokuseret analytics uden cookies. Alle beregninger sker lokalt i din browser.`,
    openGraph: {
      title: `Privatlivspolitik - ${dc.siteName}`,
      description: `Sådan håndterer vi dine data på ${dc.siteName}.`,
      url: `${dc.baseUrl}/privatlivspolitik`,
      type: "website",
    },
    alternates: {
      canonical: `${dc.baseUrl}/privatlivspolitik`,
    },
  };
}

export default function PrivatlivspolitikPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ name: "Privatlivspolitik", href: "/privatlivspolitik" }]} />

      <h1 className="text-3xl font-bold mb-6">Privatlivspolitik</h1>

      <div className="prose max-w-none dark:prose-invert">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          <strong>TL;DR:</strong> Vi indsamler ingen personlige data. Alle
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
          <li>Sendes aldrig til vores servere</li>
          <li>Gemmes ikke i nogen database</li>
          <li>Forsvinder når du lukker fanen</li>
        </ul>
        <p>
          Hvis du bruger &quot;Del beregning&quot;-funktionen, kodes dine input-værdier i
          URL&apos;en (base64), så modtageren kan se den samme beregning. Dette sker
          i din browser og involverer ikke vores servere.
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
          <li>
            <strong>Ikke bruger cookies</strong> — ingen cookie-banner
            nødvendig for analytics
          </li>
          <li>
            <strong>Ikke tracker individuelle brugere</strong> — ingen
            personprofiler
          </li>
          <li>
            <strong>Ikke indsamler persondata</strong> — ingen IP-adresser,
            fingerprints eller device IDs
          </li>
          <li>
            <strong>Er GDPR-kompatibelt</strong> uden samtykke, da det ikke er
            personhenførbart
          </li>
          <li>
            <strong>Er self-hosted</strong> — data forlader ikke vores egen
            server
          </li>
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
          Vores website hostes hos Dokploy. Som standard logger webservere
          IP-adresser i serverlogfiler af sikkerhedsmæssige årsager. Disse
          logs slettes automatisk efter kort tid og bruges ikke til analyse
          eller tracking.
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
          Sidst opdateret: 17. februar 2026
        </p>
      </div>
    </div>
  );
}
