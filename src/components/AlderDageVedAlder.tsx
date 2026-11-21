import {
  BARN_ALDRER,
  dagForAlderTabel,
  formatDageTal,
  levetVedAlder,
  type LevetVedAlder,
  VOKSNE_ALDRER,
} from "@/lib/alder-levet";
import { formaterDato } from "@/lib/alder-side-tekst";
import type { Locale } from "@/lib/i18n";
import { iDagISidensTidszone } from "@/lib/lokal-dato";

/**
 * "Så mange dage har du levet som 10-årig?" — tabellen over aldersbestemt
 * levetid.
 *
 * Datagrund: otte af de ti svenske søgninger under "hur många dagar har man
 * levet" spørger om en bestemt alder (8, 10, 12, 13, 14, 15 år og "när man
 * fyller 50 år"), målt på Googles egen autocomplete 3/10 16:4x. Den danske
 * autocomplete giver kun de to upersonlige varianter, så tabellen er på dansk
 * fordi spørgsmålet er det samme — ikke fordi en dansk søgning er målt.
 *
 * Hver celle kommer fra `levetVedAlder`, som regner med `beregnAlder` — samme
 * modul som værktøjet ovenfor bruger — så tabellen ikke kan vise et dage-tal,
 * der modsiger værktøjets. Derfor står der i teksten, at rækkerne er den, der
 * *fylder* alderen i dag: en fødselsdato en dag tidligere på året giver et helt
 * år færre dage, og det ville være en skjult løgn at skrive «en 10-årig har
 * levet så mange dage». Den ene undtagelse er den 29. februar, hvor tabellen
 * må regnes fra 28. februar — og der skriver teksten den dag, den faktisk er
 * regnet fra, i stedet for «i dag».
 */

function dageRækker(aldre: readonly number[], referenceIso: string): LevetVedAlder[] {
  return aldre
    .map((alder) => levetVedAlder(alder, referenceIso))
    .filter((r): r is LevetVedAlder => r !== null);
}

function DageTabel({ locale, raekker }: { locale: Locale; raekker: LevetVedAlder[] }) {
  const se = locale === "se";
  return (
    <div className="overflow-x-auto mb-4">
      <table>
        <thead>
          <tr>
            <th>{se ? "Ålder" : "Alder"}</th>
            <th>{se ? "Dagar levda" : "Dage levet"}</th>
            <th>{se ? "Veckor" : "Uger"}</th>
            <th>{se ? "Månader" : "Måneder"}</th>
          </tr>
        </thead>
        <tbody>
          {raekker.map((r) => (
            <tr key={r.aar}>
              <td>{`${r.aar} år`}</td>
              <td>
                <strong>{formatDageTal(r.totalDage, locale)}</strong>
              </td>
              <td>{formatDageTal(r.totalUger, locale)}</td>
              <td>{formatDageTal(r.totalMaaneder, locale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AlderDageVedAlder({ locale }: { locale: Locale }) {
  if (locale === "no") return null;

  const se = locale === "se";
  const iDag = iDagISidensTidszone(new Date(), se ? "se" : "da");
  const referenceIso = dagForAlderTabel(iDag);
  const barn = dageRækker(BARN_ALDRER, referenceIso);
  const voksne = dageRækker(VOKSNE_ALDRER, referenceIso);

  // Den 29. februar regnes tabellen fra 28. februar, fordi 18 af 26 rækker ellers
  // forsvinder (se `dagForAlderTabel`). Så skriver den sidste sætning den dag,
  // tallene faktisk er regnet fra, i stedet for at love "i dag".
  const rækkeDag = formaterDato(referenceIso, locale);

  return (
    <div className="prose max-w-none mb-8">
      <h2>
        {se ? "Hur många dagar har du levat som 10-åring?" : "Så mange dage har du levet som 10-årig?"}
      </h2>
      <p>
        {se
          ? "Verktyget ovan räknar dina egna dagar. Men «hur många dagar har man levat om man är 12 år» är en gemensam fråga, och svaret beror på vilken dag på året man fyller år: 12 år är 12 × 365 dagar plus de skottdagar man varit med om."
          : "Værktøjet ovenfor tæller dine egne dage. Men «hvor mange dage har man levet som 12-årig» er et fælles spørgsmål, og svaret afhænger af, hvilken dag på året man fylder år: 12 år er 12 × 365 dage plus de skuddage, man har været igennem."}
      </p>
      <DageTabel locale={locale} raekker={barn} />
      <h3>{se ? "Vuxenålder" : "Voksnealdre"}</h3>
      <DageTabel locale={locale} raekker={voksne} />
      <p>
        {se
          ? referenceIso === iDag
            ? "Varje rad är den som fyller åldern i dag — alltså född exakt så många år före i dag. Är din egen födelsedag en dag tidigare eller senare på året blir ditt eget dagar-tal ett helt år lägre eller högre. Fyll i födelsedatumet i verktyget ovan, så får du ditt."
            : `Varje rad är den som fyller åldern ${rækkeDag} — alltså född exakt så många år före det datumet. Det är 29 februari, som bara finns vart fjärde år, och dagen före är den enda som ger svar på alla åldersrader. Fyll i födelsedatumet i verktyget ovan, så får du ditt.`
          : referenceIso === iDag
            ? "Hver række er den, der fylder alderen i dag — altså født præcis så mange år før i dag. Er din egen fødselsdag en dag tidligere eller senere på året, er dit eget dage-tal et helt år lavere eller højere. Skriv fødselsdatoen i værktøjet ovenfor, så får du dit."
            : `Hver række er den, der fylder alderen ${rækkeDag} — altså født præcis så mange år før den dag. Det er 29. februar, som kun findes hvert fjerde år, og dagen før er den eneste, der giver svar på alle aldersrækker. Skriv fødselsdatoen i værktøjet ovenfor, så får du dit.`}
      </p>
    </div>
  );
}