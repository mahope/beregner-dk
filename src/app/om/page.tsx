import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";

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
      <Breadcrumbs items={[{ name: "Om MinBeregner.dk", href: "/om" }]} />

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

        <h2>Vores 33+ beregnere</h2>
        <p>Vi tilbyder i øjeblikket beregnere inden for følgende kategorier:</p>

        <h3>Økonomi og skat</h3>
        <ul>
          <li><Link href="/loen-efter-skat">Løn efter skat</Link> - beregn din nettoløn med 2026-satser</li>
          <li><Link href="/moms">Momsberegner</Link> - tillæg og fratræk 25% moms</li>
          <li><Link href="/dagpenge">Dagpengeberegner</Link> - beregn din dagpengesats</li>
          <li><Link href="/feriepenge">Feriepenge</Link> - beregn dine feriepenge</li>
          <li><Link href="/pension">Pensionsberegner</Link> - beregn din fremtidige pension</li>
          <li><Link href="/efterloen">Efterløn</Link> - beregn efterløn og se betingelser</li>
          <li><Link href="/su">SU Beregner</Link> - beregn din SU og fribeløb</li>
          <li><Link href="/boernepenge">Børnepenge</Link> - se børne- og ungeydelse</li>
          <li><Link href="/barselsdagpenge">Barselsdagpenge</Link> - beregn barselsdagpenge</li>
          <li><Link href="/arveafgift">Arveafgift</Link> - beregn boafgift og tillægsafgift</li>
          <li><Link href="/rentefradrag">Rentefradrag</Link> - beregn din skattebesparelse</li>
          <li><Link href="/procent">Procentberegner</Link> - beregn procenter</li>
          <li><Link href="/valuta">Valutaberegner</Link> - omregn mellem valutaer</li>
        </ul>

        <h3>Bolig og lån</h3>
        <ul>
          <li><Link href="/boliglaan">Boliglån</Link> - beregn boliglånsydelse</li>
          <li><Link href="/laaneberegner">Låneberegner</Link> - generel låneberegner</li>
          <li><Link href="/billaan">Billån</Link> - beregn billånsydelse</li>
          <li><Link href="/forbrugslaan">Forbrugslån</Link> - beregn forbrugslånsydelse</li>
          <li><Link href="/renteberegner">Renteberegner</Link> - beregn renter og afdrag</li>
          <li><Link href="/opsparing">Opsparingsberegner</Link> - se renters rente-effekt</li>
          <li><Link href="/ejendomsvaerdiskat">Ejendomsværdiskat</Link> - beregn boligskat 2026</li>
          <li><Link href="/boligstoette">Boligstøtte</Link> - beregn boligstøtte</li>
          <li><Link href="/husleje">Huslejebudget</Link> - hvad har du råd til?</li>
        </ul>

        <h3>Sundhed</h3>
        <ul>
          <li><Link href="/bmi">BMI Beregner</Link> - tjek dit Body Mass Index</li>
          <li><Link href="/kalorier">Kalorieberegner</Link> - beregn dit daglige kaloriebehov</li>
        </ul>

        <h3>Hverdag og praktisk</h3>
        <ul>
          <li><Link href="/elberegner">Elberegner</Link> - se hvad dine apparater koster</li>
          <li><Link href="/braendstof">Brændstof</Link> - beregn transportomkostninger</li>
          <li><Link href="/bil">Bil værdtab</Link> - beregn bilens samlede omkostninger</li>
          <li><Link href="/timepris">Timeprisberegner</Link> - find din freelance-timepris</li>
          <li><Link href="/kvadratmeter">Kvadratmeter</Link> - beregn arealer</li>
          <li><Link href="/dato">Datoberegner</Link> - beregn dage mellem datoer</li>
          <li><Link href="/alder">Aldersberegner</Link> - beregn din præcise alder</li>
          <li><Link href="/tidsberegner">Tidsberegner</Link> - beregn tid mellem tidspunkter</li>
          <li><Link href="/tidszone">Tidszoneberegner</Link> - se klokken i andre lande</li>
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

        <h2>Sådan sikrer vi korrekte tal</h2>
        <p>
          Alle beregnere opdateres løbende med de nyeste satser og regler fra
          officielle kilder som skat.dk, borger.dk, su.dk og skm.dk. Vi
          verificerer satserne ved hvert årsskifte og når lovændringer træder i
          kraft. Seneste opdatering: februar 2026.
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
          <li>Privacy-fokuseret analytics (Plausible — ingen persondata, ingen cookies)</li>
          <li>Alle beregninger sker lokalt i din browser</li>
        </ul>
      </div>
    </div>
  );
}
