"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Clock } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { minutterTilTimer, timerTilMinutter, TIDSENHED_EKSEMPLER } from "@/lib/tidsenhed";

/**
 * Værktøjet der svarer på «omregn minutter til timer» — og den anden vej,
 * «omregn timer til minutter». Se `src/lib/tidsenhed.ts` for målingen der
 * dømmer opgaven.
 */
const labels = {
  da: {
    overskrift: "Omregn minutter til timer",
    tilfoej: "Omregn minutter",
    minutter: "Minutter",
    timer: "Timer",
    timerOgMinutter: "Timer og minutter",
    minutterEnhed: "minutter",
    timerEnhed: "timer",
    decimalTimer: "Decimaltimer",
    sekunder: "Sekunder",
    heleDoegn: "Hele døgn",
    eksempel: "Fra søgningerne",
    tomtResultat: "Skriv et antal minutter, sådan som 145, for at se hvor mange timer det er.",
    ugyldigtResultat: "Skriv et tal, sådan som 145, for at se hvor mange timer det er.",
    hint: "Regnestykket er minutter ÷ 60 = timer, og den anden vej er timer × 60 = minutter.",
  },
  se: {
    overskrift: "Räkna om minuter till timmar",
    tilfoej: "Räkna om minuter",
    minutter: "Minuter",
    timer: "Timmar",
    timerOgMinutter: "Timmar och minuter",
    minutterEnhed: "minuter",
    timerEnhed: "timmar",
    decimalTimer: "Decimaltimmar",
    sekunder: "Sekunder",
    heleDoegn: "Hela dygn",
    eksempel: "Från sökningarna",
    tomtResultat: "Skriv ett antal minuter, till exempel 145, för att se hur många timmar det är.",
    ugyldigtResultat: "Skriv ett tal, till exempel 145, för att se hur många timmar det är.",
    hint: "Formeln är minuter ÷ 60 = timmar, och andra vägen är timmar × 60 = minuter.",
  },
} as const;

export default function MinutterTilTimerBeregner() {
  const { locale } = useLocale();
  const l = labels[locale === "se" ? "se" : "da"];
  const lang = locale === "se" ? "se" : "da";

  const [retning, setRetning] = useState<"til" | "fra">("til");
  const [minutter, setMinutter] = useState<string>("145");
  const [timer, setTimer] = useState<string>("1,5");

  const f2 = (n: number) =>
    formatNumber(n, lang as "da" | "se", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const resultat = useMemo(() => {
    const r = retning === "til" ? minutterTilTimer(tomtTal(minutter)) : timerTilMinutter(tomtTal(timer));
    return r;
  }, [retning, minutter, timer]);

  const erTomt = (retning === "til" ? minutter : timer).trim() === "";

  const feltCls =
    "w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white";

  return (
    <div className="rounded-xl border border-gray-200 p-6 dark:border-gray-700 dark:bg-gray-800/50">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 dark:text-white">
        <ArrowLeftRight className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        {l.overskrift}
      </h2>
      <p className="text-gray-600 mb-6 dark:text-gray-400">{l.hint}</p>

      <fieldset className="mb-6">
        <legend className="sr-only">{l.tilfoej}</legend>
        <div className="flex flex-wrap gap-4" role="radiogroup" aria-label={l.tilfoej}>
          <label
            htmlFor="tidsenhed-retning-til"
            className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300"
          >
            <input
              id="tidsenhed-retning-til"
              type="radio"
              name="tidsenhed-retning"
              className="w-5 h-5"
              checked={retning === "til"}
              onChange={() => setRetning("til")}
            />
            <span>
              {l.minutter} → {l.timer}
            </span>
          </label>
          <label
            htmlFor="tidsenhed-retning-fra"
            className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300"
          >
            <input
              id="tidsenhed-retning-fra"
              type="radio"
              name="tidsenhed-retning"
              className="w-5 h-5"
              checked={retning === "fra"}
              onChange={() => setRetning("fra")}
            />
            <span>
              {l.timer} → {l.minutter}
            </span>
          </label>
        </div>
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {retning === "til" ? (
          <div>
            <label htmlFor="tidsenhed-minutter" className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.minutter}
            </label>
            <input
              id="tidsenhed-minutter"
              type="text"
              inputMode="decimal"
              value={minutter}
              onChange={(e) => setMinutter(e.target.value)}
              className={feltCls}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="tidsenhed-timer" className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.timer}
            </label>
            <input
              id="tidsenhed-timer"
              type="text"
              inputMode="decimal"
              value={timer}
              onChange={(e) => setTimer(e.target.value)}
              className={feltCls}
            />
          </div>
        )}
      </div>

      <div className="mt-6" aria-live="polite">
        {resultat ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 bg-green-100 rounded-xl text-center dark:bg-green-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.timerOgMinutter}</p>
              <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                {resultat.timer}:
                {String(Math.abs(resultat.minutter)).padStart(2, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                {formatNumber(resultat.totalMinutter, lang)} {l.minutterEnhed}
              </p>
            </div>
            <div className="p-6 bg-purple-100 rounded-xl text-center dark:bg-purple-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.decimalTimer}</p>
              <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {f2(resultat.decimalTimer)}
              </p>
            </div>
            <div className="p-6 bg-blue-100 rounded-xl text-center dark:bg-blue-900/20">
              <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.sekunder}</p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                {formatNumber(resultat.sekunder, lang)}
              </p>
              <p className="text-xs text-gray-600 mt-1 dark:text-gray-400">
                {f2(resultat.heleDoegn)} {l.heleDoegn.toLowerCase()}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {erTomt ? l.tomtResultat : l.ugyldigtResultat}
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.eksempel}</p>
        <div className="flex flex-wrap gap-2">
          {TIDSENHED_EKSEMPLER.filter((e) => e.minutter > 0 || e.timer !== undefined).map((eksempel) => {
            const erTimerVeks = eksempel.timer !== undefined;
            // Decimaler skrives med komma på dansk og svensk — ikke med det
            // punktum `String(0.5)` giver, som ville stå som et engelsk tal på
            // en dansk knap.
            const timerVærdi = eksempel.timer !== undefined ? formatNumber(eksempel.timer, lang) : "";
            return (
              <button
                key={eksempel.id}
                type="button"
                onClick={() => {
                  if (erTimerVeks) {
                    setRetning("fra");
                    setTimer(timerVærdi);
                  } else {
                    setRetning("til");
                    setMinutter(String(eksempel.minutter));
                  }
                }}
                className="px-3 py-2 min-h-11 text-sm border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                {erTimerVeks ? `${timerVærdi} ${l.timerEnhed}` : `${eksempel.minutter} ${l.minutterEnhed}`}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 flex items-start gap-2">
        <Clock className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
        <span>
          {retning === "til"
            ? `${minutter || "0"} ${l.minutterEnhed} ÷ 60 = ${resultat ? f2(resultat.decimalTimer) : "0,00"} ${l.timerEnhed}`
            : `${timer || "0"} ${l.timerEnhed} × 60 = ${resultat ? formatNumber(resultat.totalMinutter, lang) : "0"} ${l.minutterEnhed}`}
        </span>
      </p>
    </div>
  );
}

/**
 * Læs et felt der læses med **komma på dansk og svensk**. Feltet er
 * `type="text"` og ikke `type="number"`, fordi Chrome og Safari afviser et
 * komma i et number-felt: brugeren skriver «1,5» — den normale danske
 * notation — og feltet læser det som **tomt**, så «1,5 time» aldrig nåede
 * beregningen. Det var målt, ikke antaget: `value` er den tomme streng, når
 * «1,5» står i et number-felt.
 *
 * Ét komma er tilladt (tal med decimal), og alt andet end tal, minus,
 * decimalkomma og mellemrum giver `NaN`, som UI'et viser som en
 * venlig fejltilstand i stedet for et tal.
 */
function tomtTal(felt: string): number {
  const trimmet = felt.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^[+-]?\d*\.?\d*$/.test(trimmet) || trimmet === "" || trimmet === "." || trimmet === "-") {
    return Number.NaN;
  }
  return Number(trimmet);
}