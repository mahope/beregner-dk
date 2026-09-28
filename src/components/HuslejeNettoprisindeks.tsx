import Link from "next/link";
import {
  FORBRUGERPRISINDEKS_2026M08,
  NETTOPRISINDEKS_2026M08,
  FAKTISK_HUSLEJE_2026M08,
  NETTOPRISINDELS_MAANED,
  NETTOPRISINDELS_KILDE,
  senesteKompletteKvartal,
  udregnNettoprisindeks,
  beregnHuslejestigning,
} from "@/lib/nettoprisindeks";
import { formatCurrency } from "@/lib/format";

/**
 * The nettoprisindeks block on /husleje.
 *
 * Danish rent has two price indices and they are not interchangeable:
 * pristalsregulering follows *forbrugerprisindekset* (which includes indirect
 * taxes, so it also moves when a tax rate changes), while the figure quoted in
 * the news — and used by huslejenævnet for voluntary increases — is
 * *nettoprisindekset*, which excludes them. Confusing the two is the most
 * common question on the page, so both are shown side by side.
 *
 * Every number below comes from `@/lib/nettoprisindeks`, which holds Danmarks
 * Statistik's published figures plus the derivation for the quarterly one, so
 * the prose and the module cannot drift apart. Danish only: beraknare.se has
 * its own rent page and must not receive these strings.
 */

const kr = (value: number) =>
  formatCurrency(value, "da", { maximumFractionDigits: 0, minimumFractionDigits: 0 });

/** Danish quarter names, for the one place a quarter is printed. */
const KVARTAL_NAVN: Record<string, string> = {
  K1: "1. kvartal",
  K2: "2. kvartal",
  K3: "3. kvartal",
  K4: "4. kvartal",
};

function kvartalTekst(kvartal: string): string {
  const [aar, k] = kvartal.split("K");
  return `${KVARTAL_NAVN[`K${k}`]} ${aar}`;
}

export default function HuslejeNettoprisindeks() {
  const senesteKvartal = senesteKompletteKvartal();
  const kvartalPct = senesteKvartal ? udregnNettoprisindeks(senesteKvartal) : null;
  const maanedsPct = NETTOPRISINDEKS_2026M08.aarsVaeksningPct;
  const pristalPct = FORBRUGERPRISINDEKS_2026M08.aarsVaeksningPct;
  const faktiskHuslejePct = FAKTISK_HUSLEJE_2026M08.aarsVaeksningPct;

  // 8.000 kr er et rundt huslejebeløb, så læseren kan efterprøve hvert led.
  const eksempelHusleje = 8000;
  const medNettopris = beregnHuslejestigning(eksempelHusleje, maanedsPct);
  const medPristal = beregnHuslejestigning(eksempelHusleje, pristalPct);
  const medFaktiskHusleje = beregnHuslejestigning(eksempelHusleje, faktiskHuslejePct);

  return (
    <div className="prose max-w-none mb-8">
      <h2 id="nettoprisindeks-husleje">Hvor meget stiger huslejen efter nettoprisindekset?</h2>
      <p>
        Har du fået en huslejestigning, er den næsten altid sat efter <strong>nettoprisindekset</strong>:
        det er forbrugerprisindekset <em>minus</em> moms, told og afgifter. I{" "}
        {NETTOPRISINDELS_MAANED} steg nettoprisindekset{" "}
        <strong>{maanedsPct.toLocaleString("da-DK")} %</strong> over 12 måneder, så en husleje på{" "}
        {kr(eksempelHusleje)} stiger med {kr(medNettopris.stigning)} til{" "}
        <strong>{kr(medNettopris.efter)}</strong> om måneden.
      </p>
      <p>
        <strong>Regnestykket:</strong> {kr(eksempelHusleje)} × {maanedsPct.toLocaleString("da-DK")} % ={" "}
        {kr(medNettopris.stigning)} → {kr(eksempelHusleje)} + {kr(medNettopris.stigning)} ={" "}
        {kr(medNettopris.efter)}
      </p>

      <h3>Pristalsregulering og nettoprisindeks er ikke det samme</h3>
      <p>
        Det er herfor de fleste bliver forvirret: der er <strong>to</strong> indekser i spil, og de
        giver to forskellige tal for den samme husleje.
      </p>
      <table className="w-full border-collapse my-4 text-sm">
        <thead>
          <tr>
            <th className="border border-gray-300 px-3 py-2 text-left">Indeks</th>
            <th className="border border-gray-300 px-3 py-2 text-left">Hvad det er</th>
            <th className="border border-gray-300 px-3 py-2 text-right">
              {NETTOPRISINDELS_MAANED}
            </th>
            <th className="border border-gray-300 px-3 py-2 text-right">
              {kr(eksempelHusleje)} bliver
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 px-3 py-2 font-medium">Nettoprisindeks</td>
            <td className="border border-gray-300 px-3 py-2">
              Forbrugerprisindekset uden moms, told og afgifter. Det er tallet i aviserne.
            </td>
            <td className="border border-gray-300 px-3 py-2 text-right">
              {maanedsPct.toLocaleString("da-DK")} %
            </td>
            <td className="border border-gray-300 px-3 py-2 text-right whitespace-nowrap">
              {kr(medNettopris.efter)}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-2 font-medium">Forbrugerprisindeks</td>
            <td className="border border-gray-300 px-3 py-2">
              Indekset <em>med</em> indirekte afgifter. Det er pristalsreguleringens grundlag.
            </td>
            <td className="border border-gray-300 px-3 py-2 text-right">
              {pristalPct.toLocaleString("da-DK")} %
            </td>
            <td className="border border-gray-300 px-3 py-2 text-right whitespace-nowrap">
              {kr(medPristal.efter)}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-2 font-medium">Faktisk husleje</td>
            <td className="border border-gray-300 px-3 py-2">
              Danmarks Statistiks egen gruppe for husleje betalt af lejere. Den er lavere end
              hovedtallet.
            </td>
            <td className="border border-gray-300 px-3 py-2 text-right">
              {faktiskHuslejePct.toLocaleString("da-DK")} %
            </td>
            <td className="border border-gray-300 px-3 py-2 text-right whitespace-nowrap">
              {kr(medFaktiskHusleje.efter)}
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Forskellen mellem {maanedsPct.toLocaleString("da-DK")} % og{" "}
        {pristalPct.toLocaleString("da-DK")} % er altså{" "}
        {kr(Math.abs(medNettopris.stigning - medPristal.stigning))} om måneden på en husleje på{" "}
        {kr(eksempelHusleje)} — ikke en fejl, men netop forskellen på de to indekser.
      </p>

      <h3>Nettoprisindekset for kvartalet — den huslejenævnet bruger</h3>
      {senesteKvartal && kvartalPct !== null ? (
        <>
          <p>
            Huslejenævnet ser på <strong>kvartalsgennemsnittet</strong> af nettoprisindekset, ikke på
            én måned. Det seneste fulde kvartal er <strong>{kvartalTekst(senesteKvartal)}</strong>,
            som ligger {kvartalPct.toLocaleString("da-DK", { maximumFractionDigits: 1 })} % over{" "}
            {kvartalTekst(senesteKvartal.replace(/^(\d{4})/, (a) => `${Number(a) - 1}`))}. På{" "}
            {kr(eksempelHusleje)} bliver det {kr(beregnHuslejestigning(eksempelHusleje, kvartalPct).stigning)} mere om måneden end ved månedsstigningen.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            3. kvartal 2026 er endnu ikke færdigt — DST udgiver september i oktober — så kvartalsgennemsnittet
            først kan regnes, når alle tre måneder er publiceret. Derfor viser siden det seneste
            <em> fulde</em> kvartal og ikke det igangværende.
          </p>
        </>
      ) : (
        <p>
          Kvartalsgennemsnittet kan ikke regnes lige nu, fordi der endnu ikke er offentliggjort tre
          fulde måneder i træk. Brug månedsstigningen ovenfor i mellemtiden.
        </p>
      )}

      <h3>Huslejenævnet og pristallet</h3>
      <p>
        En huslejestigning skal som udgangspunkt aftales med udlejeren, og det er{" "}
        <strong>huslejenævnet</strong> — ikke en beregner — der fastsætter den endelige sats for dit
        område. To ting er derfor værd at skelne: <strong>pristalsregulering</strong> er den
        lovpligtige årlige justering, din lejeaftale typisk indeholder, og den følger
        forbrugerprisindekset. <strong>Huslejenævnets vedtagelser</strong> er de frivillige
        forhøjelser ud over pristallet, som hvert år aftales med de store udlejere og som følger
        nettoprisindekset. Har du stået i en lejeaftale, der blot siger at huslejen reguleres efter
        pristallet, så er det pristallet — {pristalPct.toLocaleString("da-DK")} % — der gælder, ikke{" "}
        {maanedsPct.toLocaleString("da-DK")} %.
      </p>
      <p>
        Er din husleje steget mere end det, din aftale tillader, er det en forskel du kan gøre ind på.
        Beregneren ovenfor hjælper dig ikke med det, men den viser hvad du har til rådighed, hvis
        du vil finde en billigere bolig. Sammenlign husleje pr. m², eller se hvad 30 %-reglen
        egentlig giver.
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Kilder: Danmarks Statistik, tabel{" "}
        <a
          href="https://www.statistikbanken.dk/PRIS04"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          {NETTOPRISINDELS_KILDE.nettoprisindeks}
        </a>{" "}
        (nettoprisindeks) og{" "}
        <a
          href="https://www.statistikbanken.dk/PRIS01"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-200"
        >
          {NETTOPRISINDELS_KILDE.forbrugerprisindeks}
        </a>{" "}
        (forbrugerprisindeks), begge offentliggjort 10. september 2026. Tal for {NETTOPRISINDELS_MAANED}.
        Den konkrete sats for din by fastsætter huslejenævnet — læs med andre ord det, der står i din
        huslejestigning.
      </p>
    </div>
  );
}
