import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbSchema } from "@/components/StructuredData";

const baseUrl = "https://minberegner.dk";

export const metadata: Metadata = {
  title: "Om MinBeregner.dk - Gratis danske beregnere",
  description:
    "Læs om MinBeregner.dk - Danmarks samling af gratis online beregnere til økonomi, sundhed og hverdag. 100% gratis, ingen login, ingen data gemmes.",
  openGraph: {
    title: "Om MinBeregner.dk",
    description: "Danmarks samling af gratis online beregnere.",
    url: `${baseUrl}/om`,
    type: "website",
  },
  alternates: {
    canonical: `${baseUrl}/om`,
  },
};

export default function OmPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <BreadcrumbSchema
        items={[
          { name: "Forside", url: baseUrl },
          { name: "Om MinBeregner.dk", url: `${baseUrl}/om` },
        ]}
      />

      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-blue-600">
          Forside
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Om os</span>
      </nav>

      <h1 className="text-3xl font-bold mb-6">Om MinBeregner.dk</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          MinBeregner.dk er Danmarks samling af gratis online beregnere til
          økonomi, sundhed og hverdag. Vi gør det nemt at få overblik over alt
          fra din løn efter skat til dit elforbrug.
        </p>

        <h2>Vores mission</h2>
        <p>
          Vi tror på, at alle skal have adgang til nyttige værktøjer uden at
          betale eller opgive personlige data. Derfor er alle vores beregnere:
        </p>
        <ul>
          <li>
            <strong>100% gratis</strong> - ingen premium-funktioner eller skjulte
            gebyrer
          </li>
          <li>
            <strong>Uden login</strong> - du behøver ikke oprette en konto
          </li>
          <li>
            <strong>Privat</strong> - alle beregninger sker lokalt i din browser
          </li>
          <li>
            <strong>Opdateret</strong> - med de nyeste danske satser og regler
          </li>
        </ul>

        <h2>Vores beregnere</h2>
        <p>Vi tilbyder i øjeblikket følgende beregnere:</p>
        <ul>
          <li>
            <Link href="/loen-efter-skat">Løn efter skat</Link> - beregn din
            nettoløn
          </li>
          <li>
            <Link href="/bmi">BMI Beregner</Link> - tjek dit Body Mass Index
          </li>
          <li>
            <Link href="/elberegner">Elberegner</Link> - se hvad dine apparater
            koster
          </li>
          <li>
            <Link href="/feriepenge">Feriepenge</Link> - beregn dine feriepenge
          </li>
          <li>
            <Link href="/boernepenge">Børnepenge</Link> - se børne- og
            ungeydelse
          </li>
          <li>
            <Link href="/su">SU Beregner</Link> - beregn din SU og fribeløb
          </li>
        </ul>

        <h2>Præcision og ansvarsfraskrivelse</h2>
        <p>
          Vores beregnere giver gode estimater baseret på officielle satser og
          formler. Dog kan dine faktiske beløb variere afhængigt af din
          specifikke situation.
        </p>
        <p>
          <strong>Vigtigt:</strong> Beregnerne er kun til informationsformål og
          erstatter ikke professionel rådgivning fra revisorer, læger eller
          andre eksperter. Ved tvivl bør du altid konsultere de officielle
          kilder:
        </p>
        <ul>
          <li>
            <a
              href="https://skat.dk"
              target="_blank"
              rel="noopener noreferrer"
            >
              skat.dk
            </a>{" "}
            - for skatteoplysninger
          </li>
          <li>
            <a
              href="https://borger.dk"
              target="_blank"
              rel="noopener noreferrer"
            >
              borger.dk
            </a>{" "}
            - for offentlige ydelser
          </li>
          <li>
            <a href="https://su.dk" target="_blank" rel="noopener noreferrer">
              su.dk
            </a>{" "}
            - for SU-oplysninger
          </li>
        </ul>

        <h2>Kontakt</h2>
        <p>
          Har du feedback, forslag til nye beregnere, eller har du fundet en
          fejl? Vi vil meget gerne høre fra dig!
        </p>
        <p>
          Du kan kontakte os på:{" "}
          <a href="mailto:kontakt@minberegner.dk">kontakt@minberegner.dk</a>
        </p>

        <h2>Teknisk information</h2>
        <p>
          MinBeregner.dk er bygget med moderne teknologier for at sikre hurtig
          indlæsning og god brugeroplevelse:
        </p>
        <ul>
          <li>Next.js 15 med React 19</li>
          <li>TypeScript for bedre kodekvalitet</li>
          <li>Tailwind CSS for responsivt design</li>
          <li>Ingen cookies eller tracking</li>
        </ul>
      </div>
    </div>
  );
}
