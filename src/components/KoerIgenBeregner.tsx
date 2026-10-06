"use client";

import { useState, useMemo, useCallback } from "react";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { koerIgenTidspunkt } from "@/lib/koer-igen";
import { graenseForLocale } from "@/lib/promille";

/**
 * «Hvornår kan jeg køre bil igen?» — et klokkeslæt, ikke et antal timer.
 *
 * Søgningen er målt, ikke antaget: dansk autocomplete (hl=da) under «hvornår
 * kan jeg køre» og «hvornår må jeg køre» har 20 af 20 træffere i denne
 * form, og svensk under «när kan jag köra bil» 10 af 10. Se docblocken i
 * `src/lib/koer-igen.ts`.
 *
 * Forudindstillet på **fire øl, 80 kg, mand, kl. 23:30** — det er det
 * søgningen «hvornår må jeg køre bil i morgen» spørger om, og det er det
 * eneste input, hvor døgnskiftet er det interessante svar. Der er ingen
 * "nu"-knap: klokkeslættet er brugerens, ikke sidens, så der er ingen tid at
 * hente under render og intet der kan prærenderes (punkt 1).
 */

const labels = {
  da: {
    title: "Hvornår kan jeg køre bil igen?",
    lastDrink: "Sidste genstand var kl.",
    drinks: "Antal genstande",
    weight: "Kropsvægt",
    sex: "Køn",
    man: "Mand",
    woman: "Kvinde",
    bacThen: "Promille ved det klokkeslæt",
    driveAt: "Du må køre bil igen kl.",
    soberAt: "Du er helt ædru kl.",
    sameDay: "samme døgn",
    nextDay: "næste døgn",
    over: "mere end et døgn senere",
    before: "døgnet før",
    alreadyOk: "Du er allerede under grænsen",
    hoursNote: "Det er de samme tal som promilleberegneren ovenfor bruger",
    noResult: "Udfyld klokkeslæt, antal genstande og kropsvægt — uden dem kan tidspunktet ikke regnes.",
    copy: (senest: string, drive: string, driveDag: string, sober: string, soberDag: string) =>
      `Sidste genstand var kl. ${senest}. Du må køre bil igen kl. ${drive} (${driveDag}), og er helt ædru kl. ${sober} (${soberDag}).`,
    name: "Hvornår må jeg køre igen",
  },
  se: {
    title: "När kan jag köra bil igen?",
    lastDrink: "Sista glaset var kl.",
    drinks: "Antal standardglas",
    weight: "Kroppsvikt",
    sex: "Kön",
    man: "Man",
    woman: "Kvinna",
    bacThen: "Promille vid det klockslaget",
    driveAt: "Du får köra bil igen kl.",
    soberAt: "Du är helt nykter kl.",
    sameDay: "samma dygn",
    nextDay: "nästa dygn",
    over: "mer än ett dygn senare",
    before: "dygnet innan",
    alreadyOk: "Du är redan under gränsen",
    hoursNote: "Det är samma tal som promillekalkylatorn ovan använder",
    noResult: "Fyll i klockslag, antal standardglas och kroppsvikt — utan dem går tidpunkten inte att beräkna.",
    copy: (senast: string, drive: string, driveDag: string, sober: string, soberDag: string) =>
      `Sista glaset var kl. ${senast}. Du får köra bil igen kl. ${drive} (${driveDag}), och är helt nykter kl. ${sober} (${soberDag}).`,
    name: "När får jag köra igen",
  },
} as const;

/**
 * Døgn-forskydningen som læsertekst. `heleDage` kommer fra `plusTid` og er
 * talt i døgn fra det **indtastede** klokkeslæt, ikke fra i dag — derfor er
 * en morgen-forespørgsel på 06:00 ikke automatisk «i morgen».
 */
type DagsTekst = Pick<
  (typeof labels)["da"] | (typeof labels)["se"],
  "sameDay" | "nextDay" | "over" | "before"
>;

function dagsTekst(l: DagsTekst, heleDage: number): string {
  if (heleDage === 0) return l.sameDay;
  if (heleDage === 1) return l.nextDay;
  if (heleDage === -1) return l.before;
  return heleDage > 0 ? `${heleDage} ${l.over}` : `${Math.abs(heleDage)} ${l.before}`;
}

export default function KoerIgenBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const limit = graenseForLocale(locale);

  const [klokkeslaet, setKlokkeslaet] = useState("23:30");
  const [drinks, setDrinks] = useState(4);
  const [weight, setWeight] = useState(80);
  const [sex, setSex] = useState<"mand" | "kvinde">("mand");

  const r = useMemo(
    () => koerIgenTidspunkt({ antalGenstande: drinks, vaegtKg: weight, koen: sex, klokkeslaet, graense: limit }),
    [drinks, weight, sex, klokkeslaet, limit]
  );

  const handleReset = useCallback(() => {
    setKlokkeslaet("23:30");
    setDrinks(4);
    setWeight(80);
    setSex("mand");
  }, []);

  const copyTekst = r
    ? l.copy(klokkeslaet, r.underGraenseKlokkeslaet, dagsTekst(l, r.underGraenseHeleDage), r.heltAedruKlokkeslaet, dagsTekst(l, r.heltAedruHeleDage))
    : "";

  const numberField = (id: string, label: string, value: number, onChange: (n: number) => void, step: string, unit: string) => (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <input id={id} type="number" step={step} min="0" inputMode="numeric" value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      {/* `h2`, ikke `h3`: værktøjet er monteret som søskende til sidens
          afsnit, ikke inde i et. Se heading-outline.test.tsx — det er samme
          brudte overskriftsstruktur, porten blev skrevet for. */}
      <h2 className="text-lg font-bold mb-4 dark:text-white">{l.title}</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="koerigen-klokkeslaet" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              {l.lastDrink}
            </label>
            <input id="koerigen-klokkeslaet" type="time" value={klokkeslaet}
              onChange={(e) => setKlokkeslaet(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          {numberField("koerigen-genstande", l.drinks, drinks, setDrinks, "1", "")}
          {numberField("koerigen-vaegt", l.weight, weight, setWeight, "1", "kg")}

          <div role="group" aria-labelledby="koerigen-koen">
            <label id="koerigen-koen" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.sex}</label>
            <div className="grid grid-cols-2 gap-2">
              {(["mand", "kvinde"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSex(s)}
                  aria-pressed={sex === s}
                  className={`min-h-11 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    sex === s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}>
                  {s === "mand" ? l.man : l.woman}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          {r ? (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-lg p-4 text-center bg-white dark:bg-gray-700">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{l.driveAt}</div>
                <div className="text-4xl font-bold text-green-600 dark:text-green-400">{r.underGraenseKlokkeslaet}</div>
                <div className="text-xs mt-1 font-medium text-green-700 dark:text-green-400">
                  {dagsTekst(l, r.underGraenseHeleDage)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.bacThen}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {r.promille.toFixed(2).replace(".", locale === "se" ? "," : ".")} ‰
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{l.soberAt}</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{r.heltAedruKlokkeslaet}</div>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">{l.hoursNote}</p>
            </div>
          ) : (
            /* Uden gyldige felter må værktøjet ikke svare med et klokkeslæt:
               det er en tilladelse til at køre bil, og den må ikke komme fra
               et felt læseren endnu ikke har tastet. */
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">{l.noResult}</p>
          )}
        </div>
      </div>

      {r && (
        <div className="flex justify-center mt-6">
          <CopyResultButton text={copyTekst} />
        </div>
      )}
    </div>
  );
}