"use client";

import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, formatNumber } from "@/lib/format";
import { laaneBeloebRaekker, type Laanetype } from "@/lib/laanebeloeb";

/**
 * «Hvad koster det at låne X kr.?» som en tabel over otte beløb, regnet med
 * **læserens egen rente og løbetid** — de samme to tal, der står i felterne
 * ovenfor.
 *
 * Autocomplete målt 4/10 02:2x (hl=da&gl=dk) svarer på «hvor meget koster det
 * at låne» med seks konkrete beløb. Værktøjet besvarer spørgsmålet, når man
 * indtaster beløbet selv, men den, der googler «hvor meget koster det at låne
 * 1 million», skal kunne læse svaret uden at røre et felt. Derfor står
 * beløbene som rækker, og derfor følger tabellen rente og løbetid med, så de
 * otte tal og de tre tal ovenfor aldrig kan sige hver sit.
 */
export default function LaanebeloebTabel({
  aarligRente,
  loebetid,
  type,
}: {
  aarligRente: number;
  loebetid: number;
  type: Laanetype;
}) {
  const { locale } = useLocale();

  const labels = {
    da: {
      overskrift: "Hvor meget koster det at låne?",
      intro:
        "Samme rente og løbetid som ovenfor, regnet på otte beløb. Find dit i tabellen — eller tast det i feltet, hvis du vil se et andet beløb.",
      kolonneBeloeb: "Lånebeløb",
      kolonneYdelse: "Månedlig ydelse",
      kolonneRente: "Samlet rente",
      kolonneBetaling: "At betale i alt",
      kolonneAndel: "Renteandel",
      under: "Månedsydelsen er ved et serielån den første måneds — den falder hver måned, fordi afdraget er fast mens gælden krymper.",
      andelNote: "Renteandelen er rentens andel af det, du betaler i alt.",
      ingetBeloeb: "Indtast en rente og en løbetid for at se tabellen.",
    },
    se: {
      overskrift: "Vad kostar det att låna?",
      intro:
        "Samma ränta och löptid som ovan, räknat på åtta belopp. Hitta ditt i tabellen — eller skriv in ett annat belopp i fältet.",
      kolonneBeloeb: "Lånebelopp",
      kolonneYdelse: "Månatlig betalning",
      kolonneRente: "Total ränta",
      kolonneBetaling: "Att betala totalt",
      kolonneAndel: "Ränteandel",
      under:
        "Månadsbetalningen är vid ett annuitetslån den första månadens — den sjunker varje månad, eftersom amorteringen är fast medan skulden krymper.",
      andelNote: "Ränteandelen är räntans andel av det du betalar totalt.",
      ingetBeloeb: "Ange en ränta och en löptid för att se tabellen.",
    },
  } as const;
  const l = labels[locale === "se" ? "se" : "da"];

  // Uden en gyldig rente og løbetid er hver ydelse 0, og otte rækker med
  // 0 i alle felter er værre end ingen tabel. `laanKostning` finder tal frem
  // for NaN, så her er det en visningsbeslutning og ikke en fejlrettelse.
  if (!loebetid || loebetid <= 0) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-2 dark:text-white">
          {l.overskrift}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{l.ingetBeloeb}</p>
      </section>
    );
  }

  const raekker = laaneBeloebRaekker(aarligRente, loebetid, type);
  const kr = (vaerdi: number) =>
    formatCurrency(vaerdi, locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-2 dark:text-white">{l.overskrift}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {l.intro}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">{l.overskrift}</caption>
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-600">
              <th scope="col" className="text-left py-2 pr-3 font-semibold">
                {l.kolonneBeloeb}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {l.kolonneYdelse}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {l.kolonneRente}
              </th>
              <th scope="col" className="text-right py-2 px-3 font-semibold">
                {l.kolonneBetaling}
              </th>
              <th scope="col" className="text-right py-2 pl-3 font-semibold">
                {l.kolonneAndel}
              </th>
            </tr>
          </thead>
          <tbody>
            {raekker.map((raekke) => (
              <tr
                key={raekke.hovedstol}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <th scope="row" className="text-left py-2 pr-3 font-normal">
                  {kr(raekke.hovedstol)}
                </th>
                <td className="text-right py-2 px-3 tabular-nums">
                  {kr(raekke.kostning.maanedligYdelse)}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">
                  {kr(raekke.kostning.samletRente)}
                </td>
                <td className="text-right py-2 px-3 tabular-nums">
                  {kr(raekke.kostning.samletBetaling)}
                </td>
                <td className="text-right py-2 pl-3 tabular-nums">
                  {formatNumber(raekke.renteAndel, locale, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                  {" %"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {type === "serielaan" && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          {l.under}
        </p>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {l.andelNote}
      </p>
    </section>
  );
}