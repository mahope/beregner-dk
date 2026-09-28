import { ALDER_EKSEEMPLER, formatAlder, formatAlderRaekke, foedselsaarRaekker } from "@/lib/alder-eksempler";
import { tilIsoDato } from "@/lib/lokal-dato";

/**
 * Svensk halvdel af /alder's svar-pakke: fødselsårs-tabellen, Excel-formlerne
 * og personnummer-afsnittet. ligger i sin egen fil, fordi det er et helt nyt
 * sprog-gren og ikke en oversættelse af den danske — og fordi page.tsx så
 * bliver ulæselig af to halvdels sprog-tre i samme blok.
 *
 * Kilderne er Skatteverkets sider om personnummer og samordningsnummer: de
 * seks første cifre er fødelsestidspunktet (deres eksempel: 640823 = 23.
 * august 1964), bindestreken bliver et plustegn det år man fyller 100, og i et
 * samordningsnummer er dagen 60 højere (deres eksempel: 701063-2391 = 3.
 * oktober 1970). Tallene om alderen kommer fra `beregnAlder` gennem
 * `ALDER_EKSEEMPLER` — samme modul som værktøjet bruger.
 */

const EXCEL_FORMLER = [
  {
    formel: '=DATEDIF(A1;B1;"Y")',
    resultat: "Hela år, som åldern skrivs i dag: 36",
  },
  {
    formel: '=DATEDIF(A1;B1;"M")',
    resultat: "Sammanlagt antal månader sedan födelsen: 438",
  },
  {
    formel: '=DATEDIF(A1;B1;"D")',
    resultat: "Sammanlagt antal dagar: 13.343",
  },
  {
    formel:
      '=DATEDIF(A1;B1;"Y")&" år, "&DATEDIF(A1;B1;"YM")&" månader och "&DATEDIF(A1;B1;"YD")&" dagar"',
    resultat: "Hela åldern i en cell: 36 år, 6 månader och 10 dagar",
  },
];

function formatDato(iso: string): string {
  const [aar, maaned, dag] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(aar, maaned - 1, dag));
}

export default function AlderSeSvar() {
  const iDag = tilIsoDato(new Date());
  const foedselsaar = foedselsaarRaekker(iDag);
  const senesteFoedselsaar = foedselsaar[foedselsaar.length - 1].aar;
  const eksempel = ALDER_EKSEEMPLER[0];
  const dageLevda = new Intl.NumberFormat("sv-SE").format(eksempel.totalDage);

  return (
    <div className="prose max-w-none mb-8">
      <h2>Hur gammal är jag om jag är född i {senesteFoedselsaar}?</h2>
      <p>
        Ett födelseår ger inte en ålder, utan två: födelsedagen har ju inte alltid inträffat. Därför
        står det en ålder <strong>från</strong> och en ålder <strong>till</strong> för varje år — född
        1 januari är du äldst i ditt år, född 31 december yngst. Alla tal här är räknade till{" "}
        <strong>{formatDato(iDag)}</strong>.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Född år</th>
              <th>Ålder {formatDato(iDag)}</th>
              <th>Dagar levda</th>
            </tr>
          </thead>
          <tbody>
            {foedselsaar.map((raekke) => (
              <tr key={raekke.aar}>
                <td>{raekke.aar}</td>
                <td>
                  <strong>{formatAlderRaekke(raekke)}</strong>
                </td>
                <td>
                  {new Intl.NumberFormat("sv-SE").format(raekke.minDage)}
                  {"–"}
                  {new Intl.NumberFormat("sv-SE").format(raekke.maxDage)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Finns ditt födelseår inte i tabellen, eller vill du ha dag, månad och år: fyll i ditt
        födelsedatum i verktyget ovan. Då får du också hur många dagar det är till din nästa
        födelsedag.
      </p>

      <h3>Så beräknar du ålder i Excel</h3>
      <p>
        Har du födelsedatumet i <strong>A1</strong> och det datum du vill räkna till i{" "}
        <strong>B1</strong>, är det fyra formler. Svensk Excel använder semikolon mellan argumenten.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Formel</th>
              <th>Resultat</th>
            </tr>
          </thead>
          <tbody>
            {EXCEL_FORMLER.map((r) => (
              <tr key={r.formel}>
                <td>
                  <code>{r.formel}</code>
                </td>
                <td>{r.resultat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Vill du räkna åldern till idag sätter du B1 till <code>=IDAG()</code> — då uppdaterar Excel
        sig själv varje dag. Har du bara ditt personnummer, står svaret i avsnittet nedan.
      </p>

      <h2>Räkna ut ålder från personnummer</h2>
      <p>
        Ett svenskt personnummer innehåller födelsedatumet, så du behöver inte leta upp det någon annanstans.
        De sex första siffrorna är födelsetiden i ordningen år, månad och dag — Skatteverkets eget exempel
        är <code>640823</code>, som betyder född <strong>23 augusti 1964</strong>. Hela numret skrivs{" "}
        <code>YYYYMMDD-NNNC</code>, där bindestreken byts mot ett plustegn det år du fyller 100 år.{" "}
        <a
          href="https://www.skatteverket.se/privat/folkbokforing/personnummer/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Källa: Skatteverket om personnummer
        </a>
        .
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Del</th>
              <th>Vad det betyder</th>
              <th>Född 15 mars 1990</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>19900315</code>
              </td>
              <td>De åtta första siffrorna: födelseår, månad och dag</td>
              <td>15 mars 1990</td>
            </tr>
            <tr>
              <td>
                <code>-</code> eller <code>+</code>
              </td>
              <td>Bindestreken byts mot ett plustecken det år personen fyller 100 år</td>
              <td>-</td>
            </tr>
            <tr>
              <td>
                <code>NNN</code>
              </td>
              <td>Individnumret. Sista siffran är udda för män och jämn för kvinnor</td>
              <td>—</td>
            </tr>
            <tr>
              <td>
                <code>C</code>
              </td>
              <td>Kontrollsiffran, som räknas ut maskinellt</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Fyll du in <strong>15 mars 1990</strong> i verktyget ovan får du{" "}
        <strong>{formatAlder(eksempel, "se")}</strong> per {formatDato(eksempel.beregningsdato)} — och{" "}
        {dageLevda} dagar har det gått. Det är samma födelsedatum som används i exemplen på den här
        sidan.
      </p>

      <h3>Har du ett samordningsnummer?</h3>
      <p>
        Då är dagsiffran 60 högre. Skatteverkets exempel är en man född 3 oktober 1970, som får
        individnumret 239 och kontrollsiffran 1: hela numret blir <code>701063-2391</code> — där{" "}
        <code>03</code> är födelsedagen och <code>63</code> är samma dag plus 60. Skriver du ut dagen
        själv är det alltså 63 minus 60 = 3 oktober 1970.{" "}
        <a
          href="https://www.skatteverket.se/privat/folkbokforing/samordningsnummer/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Källa: Skatteverket om samordningsnummer
        </a>
        .
      </p>

      <h3>Så gör du det i Excel</h3>
      <p>
        Har du de sex siffrorna som text i <strong>A1</strong>, blir födelsedatumet en formel — och
        här är hundratalet något du väljer själv, eftersom personnumret bara har två årssiffror:{" "}
        <code>=DATUM(1900+VÄRDE(VÄNSTER(A1;2));VÄRDE(MITTER(A1;3;2));VÄRDE(MITTER(A1;5;2)))</code> ger
        15 mars 1990 för <code>900315</code>. Är dagsiffran över 60, som i ett samordningsnummer,
        subtraherar du 60 först. Sätter du B1 till <code>=IDAG()</code> räknar Excel åldern till
        dagens datum, och uppdaterar sig själv varje dag.
      </p>
    </div>
  );
}
