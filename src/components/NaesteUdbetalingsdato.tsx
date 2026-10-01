import {
  BOERNE_SATSER_2026,
  MAANEDER_DA,
  UGEDAGE_DA,
  naesteUdbetalingsdato,
  udbetalingsdatoerAar,
} from "@/lib/borneungeydelse";
import { parseIsoDato } from "@/lib/lokal-dato";

/**
 * Næste børnepenge-udbetaling, regnet fra dagens dato.
 *
 * Autocomplete 1/10 (dansk, `suggestqueries.google.com`) gav ti træffere under
 * «børnepenge hvornår» og ti under «børnepenge juli» — «børnepenge juli 2026
 * udbetaling», «børnepenge 20 juli», «børnepenge juli dato». Spørgsmålet er altså
 * ikke «hvad er reglen», men «hvornår kommer de». Reglen lå tidligere kun i
 * blogindlægget, og GSC viser at blogindlægget vandt placeringen: 6.126
 * visninger på «børnepenge 2026» med 1.031 visninger på pos. 9 — altså
 * kalenderafsnittet slog kalkulatoren, fordi det var det eneste svar på spørgsmålet.
 *
 * Derfor står svaret her, på den kalkulator der folk lander på, og det læses
 * fra `borneungeydelse.ts` — samme modul som satsen og samme
 * `udbetalingsdatoerAar`, så dato og sats ikke kan komme fra to kalendre.
 *
 * Dagens dato kommer **ind som en parameter**, læst af kaldende side med
 * `iDagPaSiden` — aldrig fra `new Date()` i komponenten. Det er samme mønster som
 * `getDageTilAnswer` og `buildDageTilMetadata`, og det er ikke valgfrit: byggeserveren
 * står i UTC, så mellem kl. 00:00 og 02:00 dansk tid ville et UTC-kald svare på
 * *i går* — altså en udbetaling, der allerede er sket. Som parameter kan porten
 * desuden give komponenten en bestemt dag og måle, om svaret følger den.
 *
 * Komponenten er bevidst **ikke** async: en async server-komponent suspenderer
 * inde i `renderToStaticMarkup`, som er hele sidens og bloggens testgrund. Datoen
 * er allerede læst af den async side, der kalder den, så der er intet at vente på.
 */

interface Props {
  /** Dagens kalenderdato i dansk tid, som `iDagPaSiden(new Date(), "da")`. */
  iDag: string;
}

/** "torsdag 20. november 2026" — den dato, folk skal skrive i kalenderen. */
function formatDato(dato: Date): string {
  return `${UGEDAGE_DA[dato.getDay()]} ${dato.getDate()}. ${
    MAANEDER_DA[dato.getMonth()]
  } ${dato.getFullYear()}`;
}

/** ISO-dato til `<time dateTime>`, bygget af kalenderdelene og ikke `toISOString`. */
function isoDato(dato: Date): string {
  return `${dato.getFullYear()}-${String(dato.getMonth() + 1).padStart(2, "0")}-${String(
    dato.getDate()
  ).padStart(2, "0")}`;
}

/** "i dag" / "om 12 dage" / "om 1 dag" — sidens egen pluralisering. */
function naarTekst(dage: number): string {
  if (dage === 0) return "i dag";
  return `om ${dage} ${dage === 1 ? "dag" : "dage"}`;
}

/**
 * Aldersgrupperne for et interval, som ét spænd — «0-14 år» for kvartalet og
 * «15-17 år» for måneden.
 *
 * Der stod først «Til et barn fra 0-2 år» over kvartalsblokken, fordi koden
 * greb den *første* sats med det interval. Men 0-2 år er kun den laveste sats —
 * kvartalet udbetales til alle under 15 år, så overskriften ville sendt en
 * læser med et tiårigt barn ud i den forkerte sats. Spændet bygges af alle
 * grupperne med samme interval, så det ikke kan blive den første af dem.
 */
function aldersomraade(interval: "kvartal" | "maaned"): string {
  const grupper = BOERNE_SATSER_2026.filter((s) => s.interval === interval);
  const tal = grupper.map((s) =>
    s.alder.match(/^(\d+)-(\d+)/)?.slice(1, 3).map(Number)
  );
  const gyldige = tal.filter((t): t is number[] => t !== undefined && t.length === 2);
  if (gyldige.length !== grupper.length || gyldige.length === 0) {
    throw new Error(`Uforventet aldersgruppe for intervalet ${interval}`);
  }
  const fra = Math.min(...gyldige.map(([n]) => n));
  const til = Math.max(...gyldige.map(([, n]) => n));
  return fra === til ? `${fra} år` : `${fra}-${til} år`;
}

export default function NaesteUdbetalingsdato({ iDag: iDagIso }: Props) {
  // Dagens kalenderdato i dansk tid. `parseIsoDato` giver et lokalt tidspunkt
  // kl. 00.00, så det kan sammenlignes med `betalingsdato` uden at tidszonen
  // kan skubbe en dag.
  const iDag = parseIsoDato(iDagIso);
  if (!iDag) throw new Error(`Ugyldig dato: ${iDagIso}`);

  const boerne = naesteUdbetalingsdato(iDag, "kvartal");
  const unge = naesteUdbetalingsdato(iDag, "maaned");
  const boerneAlder = aldersomraade("kvartal");
  const ungeAlder = aldersomraade("maaned");

  // De fire kvartalsdatoer for det år, hvor den næste udbetaling falder. Tabellen
  // viser hele året, så «hvornår kommer de» ikke kun besvares for næste gang.
  const aar = boerne.betalingsdato.getFullYear();
  const kvartaler = udbetalingsdatoerAar(aar, "kvartal");
  const flyttedeKvartaler = kvartaler.filter((u) => u.forskudt);

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        Hvornår kommer børnepengen ud?
      </h2>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-6">
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
          Til et barn fra {boerneAlder}
        </p>
        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
          {naarTekst(boerne.dage)}
        </p>
        <p className="text-lg text-blue-800 dark:text-blue-200 mt-2">
          <time dateTime={isoDato(boerne.betalingsdato)}>
            {formatDato(boerne.betalingsdato)}
          </time>
        </p>
        <p className="text-sm text-blue-700 dark:text-blue-300 mt-3">
          {boerne.betalingsdato.getTime() !== boerne.nominell.getTime()
            ? `Den nominelle dato er ${boerne.nominell.getDate()}. ${
                MAANEDER_DA[boerne.nominell.getMonth()]
              }, men den falder på en weekend eller helligdag, så pengene står på konto hverdagen inden.`
            : `Børneydelsen udbetales kvartalsvis forud, så beløbet dækker hele ${
                MAANEDER_DA[boerne.nominell.getMonth()]
              } og de to måneder efter.`}
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-6">
        <p className="text-sm text-green-700 dark:text-green-300 mb-2">
          Til et barn fra {ungeAlder}
        </p>
        <p className="text-3xl font-bold text-green-900 dark:text-green-100">
          {naarTekst(unge.dage)}
        </p>
        <p className="text-lg text-green-800 dark:text-green-200 mt-2">
          <time dateTime={isoDato(unge.betalingsdato)}>
            {formatDato(unge.betalingsdato)}
          </time>
        </p>
        <p className="text-sm text-green-700 dark:text-green-300 mt-3">
          {unge.betalingsdato.getTime() !== unge.nominell.getTime()
            ? `Den nominelle dato er ${unge.nominell.getDate()}. ${
                MAANEDER_DA[unge.nominell.getMonth()]
              }, men den falder på en weekend eller helligdag, så pengene står på konto hverdagen inden.`
            : `Ungeydelsen udbetales månedligt den 20. og beløbet er for den ene måned.`}
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-3 dark:text-white">
        Alle udbetalingsdatoer i {aar}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th scope="col" className="text-left py-2 pr-4 font-semibold">
                Dato
              </th>
              <th scope="col" className="text-left py-2 pr-4 font-semibold">
                Ugedag
              </th>
              <th scope="col" className="text-left py-2 font-semibold">
                Står på konto
              </th>
            </tr>
          </thead>
          <tbody>
            {kvartaler.map((u) => (
              <tr
                key={u.maaned}
                className="border-b border-gray-100 dark:border-gray-800"
              >
                <td className="py-2 pr-4">
                  <time dateTime={isoDato(u.dato)}>
                    {u.dato.getDate()}. {MAANEDER_DA[u.dato.getMonth()]}
                  </time>
                </td>
                <td className="py-2 pr-4">{u.ugedag}</td>
                <td className="py-2">
                  {u.betalingsdato.getDate()}.{" "}
                  {MAANEDER_DA[u.betalingsdato.getMonth()]}
                  {u.forskudt && " (forskudt)"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
        {flyttedeKvartaler.length === 0
          ? `Alle fire datoer er almindelige hverdage i ${aar}, så pengene står på konto på dem præcis som de står her.`
          : `Der er flyttet ${flyttedeKvartaler.length} af de fire datoer i ${aar}, fordi den 20. falder på en weekend eller helligdag. Svarer du på hvilke, står det i kolonnen «Står på konto».`}{" "}
        Hver betaling dækker de tre måneder fra sin egen måned:{" "}
        {kvartaler
          .map((u) => {
            const sidste = new Date(
              u.dato.getFullYear(),
              u.dato.getMonth() + 2,
              1
            ).getMonth();
            return `${MAANEDER_DA[u.dato.getMonth()]}–${MAANEDER_DA[sidste]}`;
          })
          .join(", ")}
        . Pengene udbetales automatisk — du skal ikke ansøge om noget. Har I
        fælles forældremyndighed, står halvdelen på hver forælders konto.
      </p>
    </div>
  );
}
