import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getCurrentDomainConfig, getLocale } from "@/lib/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const dc = await getCurrentDomainConfig();
  const locale = await getLocale();
  const title = locale === "se" ? `Om ${dc.siteName}` : `Om ${dc.siteName}`;
  const desc =
    locale === "se"
      ? `Läs om ${dc.siteName} - gratis beräkningsverktyg online för ekonomi, hälsa och vardag. 100% gratis, ingen inloggning, ingen data sparas.`
      : `Læs om ${dc.siteName} - gratis online beregnere til økonomi, sundhed og hverdag. 100% gratis, ingen login, ingen data gemmes.`;
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description:
        locale === "se"
          ? `Gratis beräkningsverktyg online från ${dc.siteName}.`
          : `Gratis online beregnere fra ${dc.siteName}.`,
      url: `${dc.baseUrl}/om`,
      type: "website",
    },
    alternates: {
      canonical: `${dc.baseUrl}/om`,
    },
  };
}

function DaContent() {
  return (
    <>
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
          <li><strong>100% gratis</strong> - ingen premium-funktioner eller skjulte gebyrer</li>
          <li><strong>Uden login</strong> - du behøver ikke oprette en konto</li>
          <li><strong>Privat</strong> - alle beregninger sker lokalt i din browser</li>
          <li><strong>Opdateret</strong> - med de nyeste danske satser og regler</li>
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
          Vores beregnere giver <strong>gode estimater</strong> baseret på officielle satser og
          formler. Dine faktiske beløb kan variere afhængigt af din specifikke situation.
        </p>
        <p>
          Beregnerne er kun til <strong>informationsformål</strong> og erstatter ikke
          professionel rådgivning. Ved tvivl bør du altid konsultere de officielle kilder:
        </p>
        <ul>
          <li><a href="https://skat.dk" target="_blank" rel="noopener noreferrer">skat.dk</a> - for skatteoplysninger</li>
          <li><a href="https://borger.dk" target="_blank" rel="noopener noreferrer">borger.dk</a> - for offentlige ydelser</li>
          <li><a href="https://su.dk" target="_blank" rel="noopener noreferrer">su.dk</a> - for SU-oplysninger</li>
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
          Alle beregnere opdateres løbende med de nyeste satser og regler fra officielle kilder:
        </p>
        <ul>
          <li><strong>Skatteministeriet</strong> (skm.dk) — skattesatser og fradrag</li>
          <li><strong>Skattestyrelsen</strong> (skat.dk) — personfradrag, AM-bidrag, kommuneskat</li>
          <li><strong>Borger.dk</strong> — offentlige ydelser og satser</li>
          <li><strong>SU-styrelsen</strong> (su.dk) — SU-satser og fribeløb</li>
        </ul>
        <p>
          Vi verificerer satserne ved hvert årsskifte og når lovændringer træder i kraft.
          <strong> Seneste opdatering:</strong> februar 2026.
        </p>

        <h2>Teknisk information</h2>
        <p>
          MinBeregner.dk er bygget med <strong>moderne teknologier</strong> for at sikre hurtig
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
    </>
  );
}

function SeContent() {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6">Om Beräknare.se</h1>

      <div className="prose max-w-none">
        <p className="text-lg text-gray-600 mb-8">
          Beräknare.se är Sveriges samling av gratis beräkningsverktyg online för
          ekonomi, hälsa och vardag. Vi gör det enkelt att få överblick över allt
          från din lön till dina elkostnader.
        </p>

        <h2>Vårt uppdrag</h2>
        <p>
          Vi tror att alla ska ha tillgång till användbara verktyg utan att
          behöva betala eller lämna ut personuppgifter. Därför är alla våra beräkningsverktyg:
        </p>
        <ul>
          <li><strong>100% gratis</strong> - inga premiumfunktioner eller dolda avgifter</li>
          <li><strong>Utan inloggning</strong> - du behöver inte skapa ett konto</li>
          <li><strong>Privat</strong> - alla beräkningar sker lokalt i din webbläsare</li>
          <li><strong>Uppdaterade</strong> - med de senaste svenska satserna och reglerna</li>
        </ul>

        <h2>Våra beräkningsverktyg</h2>
        <p>Vi erbjuder beräkningsverktyg inom följande kategorier:</p>

        <h3>Ekonomi</h3>
        <ul>
          <li><Link href="/moms">Momsberäknare</Link> - lägg till och dra av 25% moms</li>
          <li><Link href="/procent">Procentberäknare</Link> - beräkna procent</li>
          <li><Link href="/valuta">Valutaomvandlare</Link> - omvandla mellan valutor</li>
        </ul>

        <h3>Bostad och lån</h3>
        <ul>
          <li><Link href="/boliglaan">Bolån</Link> - beräkna bolånekostnad</li>
          <li><Link href="/laaneberegner">Lånekalkylator</Link> - generell lånekalkylator</li>
          <li><Link href="/billaan">Billån</Link> - beräkna billånekostnad</li>
          <li><Link href="/forbrugslaan">Konsumtionslån</Link> - beräkna lånekostnad</li>
          <li><Link href="/renteberegner">Ränteberäknare</Link> - beräkna ränta och amortering</li>
          <li><Link href="/opsparing">Sparande</Link> - se ränta-på-ränta-effekten</li>
        </ul>

        <h3>Hälsa</h3>
        <ul>
          <li><Link href="/bmi">BMI-beräknare</Link> - kontrollera ditt Body Mass Index</li>
          <li><Link href="/kalorier">Kaloriräknare</Link> - beräkna ditt dagliga kaloribehov</li>
        </ul>

        <h3>Vardag och praktiskt</h3>
        <ul>
          <li><Link href="/elberegner">Elberäknare</Link> - se vad dina apparater kostar</li>
          <li><Link href="/braendstof">Bränsle</Link> - beräkna transportkostnader</li>
          <li><Link href="/bil">Bil</Link> - beräkna bilens totala kostnader</li>
          <li><Link href="/timepris">Timprisberäknare</Link> - hitta din frilans-timpris</li>
          <li><Link href="/kvadratmeter">Kvadratmeter</Link> - beräkna ytor</li>
          <li><Link href="/dato">Datumberäknare</Link> - beräkna dagar mellan datum</li>
          <li><Link href="/alder">Åldersberäknare</Link> - beräkna din exakta ålder</li>
          <li><Link href="/tidsberegner">Tidsberäknare</Link> - beräkna tid mellan tidpunkter</li>
          <li><Link href="/tidszone">Tidszonsberäknare</Link> - se klockan i andra länder</li>
        </ul>

        <h2>Noggrannhet och ansvarsfriskrivning</h2>
        <p>
          Våra beräkningsverktyg ger <strong>goda uppskattningar</strong> baserade på officiella
          satser och formler. Dina faktiska belopp kan variera beroende på din specifika situation.
        </p>
        <p>
          Beräkningsverktygen är enbart för <strong>informationsändamål</strong> och ersätter inte
          professionell rådgivning. Vid tveksamheter bör du alltid konsultera de officiella källorna:
        </p>
        <ul>
          <li><a href="https://skatteverket.se" target="_blank" rel="noopener noreferrer">skatteverket.se</a> - för skatteinformation</li>
          <li><a href="https://forsakringskassan.se" target="_blank" rel="noopener noreferrer">forsakringskassan.se</a> - för socialförsäkring</li>
        </ul>

        <h2>Kontakt</h2>
        <p>
          Har du feedback, förslag på nya beräkningsverktyg, eller har du hittat ett
          fel? Vi vill gärna höra från dig!
        </p>
        <p>
          Du kan kontakta oss på:{" "}
          <a href="mailto:kontakt@minberegner.dk">kontakt@minberegner.dk</a>
        </p>

        <h2>Teknisk information</h2>
        <p>
          Beräknare.se är byggt med <strong>modern teknologi</strong> för att säkerställa snabb
          laddning och bra användarupplevelse:
        </p>
        <ul>
          <li>Next.js 15 med React 19</li>
          <li>TypeScript för bättre kodkvalitet</li>
          <li>Tailwind CSS för responsiv design</li>
          <li>Integritetsanpassad analys (Plausible — inga personuppgifter, inga cookies)</li>
          <li>Alla beräkningar sker lokalt i din webbläsare</li>
        </ul>
      </div>
    </>
  );
}

export default async function OmPage() {
  const locale = await getLocale();
  const dc = await getCurrentDomainConfig();
  const breadcrumbName = `Om ${dc.siteName}`;

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs items={[{ name: breadcrumbName, href: "/om" }]} />
      {locale === "se" ? <SeContent /> : <DaContent />}
    </div>
  );
}
