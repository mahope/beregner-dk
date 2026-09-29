import Link from "next/link";
import { alderLevet, formatDageLived, formatDageTal } from "@/lib/alder-levet";
import { tilIsoDato } from "@/lib/lokal-dato";
import type { Locale } from "@/lib/i18n";

/**
 * "Hvor mange dage har du levt?" — egen blok på /alder i begge sprog.
 *
 * Datagrund: søgningen står som nr. 3 blandt beraknare.se's /dato-søgninger
 * (385 visninger, pos. 10) og som autocomplete nr. 1 under "hvor mange dage har
 * jeg levet" (DA) og "hur många dagar har jag levt" (SE, med ti variationer
 * hvoraf fire spørger "hur många dagar har man levt om man är 10/12/13/14
 * år"). Målt på de to live-sider før denne blok: "hvor mange dage har jeg
 * levet" 0 forekomster, "hur många dagar har jag levt" 0, "været i live" 0 —
 * altså nul af hele klyngen, selv om værktøjet viser "Dage levet" i sin egen
 * resultattabel.
 *
 * Den ligger i sin egen fil, fordi den er det eneste afsnit på /alder der
 * findes i begge sprog med egen tekst — resten er `locale === "da"`-grene og
 * `AlderSeSvar`. Den får sit eget modul `alder-levet.ts`, så tallene kommer fra
 * `beregnAlder` og ikke fra en håndskreven tekst.
 */
export default function AlderLevetSvar({ locale }: { locale: Locale }) {
  if (locale === "no") return null;

  const se = locale === "se";
  const iDag = tilIsoDato(new Date());
  const levet = alderLevet(iDag);
  const dage = formatDageLived(levet, locale);
  const [aar, maaned, dag] = levet.foedselsdato.split("-").map(Number);
  const foedselsdato = new Intl.DateTimeFormat(se ? "sv-SE" : "da-DK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(aar, maaned - 1, dag));

  return (
    <div className="prose max-w-none mb-8">
      <h2>{se ? "Hur många dagar har du levt?" : "Hvor mange dage har du levet?"}</h2>
      {se ? (
        <>
          <p>
            <strong>{dage}</strong> — så många kalenderdagar har du levt sedan{" "}
            <strong>{foedselsdato}</strong>. Det motsvarar{" "}
            <strong>{formatDageTal(levet.totalUger, locale)}</strong> hela veckor och{" "}
            <strong>{formatDageTal(levet.totalMaaneder, locale)}</strong> månader. Räknar du också
            timmar blir det <strong>{formatDageTal(levet.totalTimer, locale)}</strong> timmar —
            exakt 24 per dygn, aldrig 23 eller 25, även när klockan ställs om.
          </p>
          <p>
            Talet räknas på kalenderdagar, inte på timmar. Ett dygn där klockan går fram en timme
            är ändå 1 dag. Därför kan dage-levet-tallet och timmarna aldrig ge olika svar på samma
            fråga.
          </p>
          <p>
            <strong>{dage}</strong> är alltså inte ett tal du ska slå upp någon annanstans. Fyll i
            födelsedatumet i verktyget ovan, så räknar det ut det på en sekund — och sätter du
            &quot;Beräkna ålder per datum&quot; till ett annat datum får du hur många dagar du hade
            levt då. Det är därför den här sidan och{" "}
            <Link href="/dato">datokalkylatorn</Link> är två olika saker: den här räknar din egen
            levetid, datokalkylatorn räknar mellan två valda datum.
          </p>
        </>
      ) : (
        <>
          <p>
            <strong>{dage}</strong> — så mange kalenderdage har du levet siden{" "}
            <strong>{foedselsdato}</strong>. Det svarer til{" "}
            <strong>{formatDageTal(levet.totalUger, locale)}</strong> hele uger og{" "}
            <strong>{formatDageTal(levet.totalMaaneder, locale)}</strong> måneder. Tæller du også
            timer, bliver det <strong>{formatDageTal(levet.totalTimer, locale)}</strong> timer,
            altså præcis 24 pr. døgn, aldrig 23 eller 25 selv om uret stilles.
          </p>
          <p>
            Tallet tælles i kalenderdage, ikke i timer. Et døgn, hvor uret stilles en time frem, er
            stadig 1 dag. Derfor kan dage-levet-tallet og timerne aldrig give to forskellige svar på
            det samme spørgsmål.
          </p>
          <p>
            <strong>{dage}</strong> er altså ikke et tal, du skal slå op et andet sted. Skriv
            fødselsdatoen i værktøjet ovenfor, så tæller det på et sekund — og sætter du{" "}
            &quot;Beregn alder pr. dato&quot; til en anden dato, får du, hvor mange dage du havde levet
            da. Det er derfor, den her side og <Link href="/dato">datoberegneren</Link> er to
            forskellige ting: den her tæller din egen levetid, datoberegneren tæller mellem to
            valgte datoer.
          </p>
        </>
      )}
      <p>
        {se
          ? "Har du bara fött år, gäller ett födelseår två åldrar — född 1 januari är du äldst i ditt år, född 31 december yngst. Tabellen ovan visar båda, och dagar-tallet för ett år spänner drygt 365 dagar."
          : "Har du kun dit fødselsår, gælder ét fødselsår to aldre — født 1. januar er du den ældste i dit år, født 31. december den yngste. Tabellen ovenfor viser begge, og dage-levet-tallet for ét år spænder lidt mere end 365 dage."}
      </p>
    </div>
  );
}
