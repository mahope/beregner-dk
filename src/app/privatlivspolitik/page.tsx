import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Privatlivspolitik - MinBeregner.dk",
  description:
    "Læs om hvordan MinBeregner.dk håndterer dine data. Kort sagt: Vi gemmer ingenting. Alle beregninger sker lokalt i din browser.",
  openGraph: {
    title: "Privatlivspolitik - MinBeregner.dk",
    description: "Sådan håndterer vi dine data (spoiler: vi gemmer dem ikke).",
    url: `${baseUrl}/privatlivspolitik`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/privatlivspolitik`,
  },
};

export default function PrivatlivspolitikPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Privatlivspolitik", url: `${baseUrl}/privatlivspolitik` },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">
          Forside
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Privatlivspolitik</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">Privatlivspolitik</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          <strong>TL;DR:</strong> Vi gemmer ingen personlige data. Alle
          beregninger sker lokalt i din browser, og dine oplysninger forlader
          aldrig din computer.
        </p>

        <h2>Hvilke data indsamler vi?</h2>
        <p>
          <strong>Kort sagt: Ingen personlige data.</strong>
        </p>
        <p>
          Når du bruger vores beregnere, indtaster du oplysninger som vægt,
          højde, løn osv. Disse data:
        </p>
        <ul>
          <li>Behandles kun lokalt i din browser</li>
          <li>Sendes aldrig til vores servere</li>
          <li>Gemmes ikke nogen steder</li>
          <li>Forsvinder når du lukker fanen</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          MinBeregner.dk bruger <strong>ingen cookies</strong> til tracking
          eller analyse. Vi har ingen tredjepartsscripts der indsamler data.
        </p>

        <h2>Analyse og tracking</h2>
        <p>
          Vi bruger <strong>ingen analyseværktøjer</strong> som Google
          Analytics, Facebook Pixel eller lignende. Vi tracker ikke:
        </p>
        <ul>
          <li>Hvilke sider du besøger</li>
          <li>Hvor lang tid du bruger på siden</li>
          <li>Hvor du kommer fra</li>
          <li>Hvilken enhed du bruger</li>
        </ul>

        <h2>Tredjeparter</h2>
        <p>
          Vi deler ingen data med tredjeparter, fordi vi ikke har nogen data at
          dele. Så enkelt er det.
        </p>

        <h2>Hosting</h2>
        <p>
          Vores website hostes hos Dokploy/Coolify. Som standard logger
          webservere IP-adresser i serverlogfiler af sikkerhedsmæssige årsager.
          Disse logs slettes automatisk efter kort tid og bruges ikke til
          analyse eller tracking.
        </p>

        <h2>Eksterne links</h2>
        <p>
          Vores sider kan indeholde links til eksterne websites som skat.dk,
          borger.dk, og su.dk. Disse sites har deres egne privatlivspolitikker,
          som vi ikke kontrollerer.
        </p>

        <h2>Børn</h2>
        <p>
          Vores tjeneste er ikke rettet mod børn under 13 år, og vi indsamler
          ikke bevidst oplysninger fra børn.
        </p>

        <h2>Ændringer til denne politik</h2>
        <p>
          Hvis vi ændrer vores privatlivspolitik, opdaterer vi denne side. Vi
          lover at holde den enkel: Vi gemmer ikke dine data.
        </p>

        <h2>Kontakt</h2>
        <p>
          Har du spørgsmål om vores privatlivspolitik, er du velkommen til at
          kontakte os på:{" "}
          <a href="mailto:kontakt@minberegner.dk">kontakt@minberegner.dk</a>
        </p>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6 not-prose">
          <p className="font-medium text-green-800">Vores løfte</p>
          <p className="text-green-700">
            Vi tror på privatliv by design. Derfor har vi bygget MinBeregner.dk
            så alle beregninger sker i din browser. Vi kan ikke se dine data,
            selv hvis vi ville - de forlader simpelthen aldrig din computer.
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Sidst opdateret: Februar 2026
        </p>
      </div>
    </div>
  );
}
