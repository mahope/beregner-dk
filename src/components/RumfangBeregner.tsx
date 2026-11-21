"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  MAX_MAAL_M,
  MIN_MAAL_M,
  RUMFANG_EKSEMPEL,
  RUMFANG_FELT,
  RUMFANG_FORMEL,
  rumfangSvar,
  type RumfangInput,
  type Rummelig,
} from "@/lib/rumfang";

const labels = {
  da: {
    calcName: "Rumfangsberegner",
    figureLabel: "Figur",
    resultLabel: "Rumfang",
    kasse: "Kasse",
    cylinder: "Cylinder",
    kugle: "Kugle",
    kegle: "Kegle",
    pyramide: "Pyramide",
    formel: "Formel",
    liter: "Samme rumfang i liter",
    kubikmeter: "i m³",
    shareSummary: "Rumfang",
    intro: "Vælg en figur, skriv målene i meter, og få rumfanget i m³ og liter.",
  },
  se: {
    calcName: "Volymberäknare",
    figureLabel: "Form",
    resultLabel: "Volym",
    kasse: "Låda",
    cylinder: "Cylinder",
    kugle: "Sfär",
    kegle: "Kon",
    pyramide: "Pyramid",
    formel: "Formel",
    liter: "Samma volym i liter",
    kubikmeter: "i m³",
    shareSummary: "Volym",
    intro: "Välj en form, skriv måtten i meter, och få volymen i m³ och liter.",
  },
} as const;

/** Målene pr. figur i meter. `0` betyder «ikke udfyldt», så feltet viser en tom streng. */
const START: Record<Rummelig, Record<string, number>> = {
  kasse: { laengde: 2, bredde: 1, hoejde: 0.5 },
  cylinder: { diameter: 1, hoejde: 2 },
  kugle: { diameter: 1 },
  kegle: { diameter: 1, hoejde: 2 },
  pyramide: { grundside: 2, hoejde: 3 },
};

function toInput(figur: Rummelig, maal: Record<string, number>): RumfangInput {
  const hent = (nogle: string) =>
    maal[nogle] >= MIN_MAAL_M && maal[nogle] <= MAX_MAAL_M ? maal[nogle] : undefined;
  switch (figur) {
    case "kasse":
      return { kasse: { laengde: hent("laengde")!, bredde: hent("bredde")!, hoejde: hent("hoejde")! } };
    case "cylinder":
      return { cylinder: { diameter: hent("diameter")!, hoejde: hent("hoejde")! } };
    case "kugle":
      return { kugle: { diameter: hent("diameter")! } };
    case "kegle":
      return { kegle: { diameter: hent("diameter")!, hoejde: hent("hoejde")! } };
    case "pyramide":
      return { pyramide: { grundside: hent("grundside")!, hoejde: hent("hoejde")! } };
  }
}

export default function RumfangBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const fmt = (n: number, decimals: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const [figur, setFigur] = useState<Rummelig>("kasse");
  const [maal, setMaal] = useState<Record<string, number>>(() => ({ ...START.kasse }));

  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("rumfang");
    const timer = setTimeout(() => trackCalculation("rumfang"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const valgFigur = useCallback((ny: Rummelig) => {
    setFigur(ny);
    setMaal({ ...START[ny] });
  }, []);

  const svar = useMemo(() => {
    try {
      return rumfangSvar(figur, toInput(figur, maal));
    } catch {
      // `rumfang` kaster på et mål uden for grænsen. Værktøjet skal vise
      // «skriv et tal» og ikke en fejl fra modulet (punkt 8: 5xx er forbigående).
      return undefined;
    }
  }, [figur, maal]);

  const felter = RUMFANG_FELT[figur];
  const kubi = svar ? fmt(svar.kubikmeter, svar.kubikmeter < 1 ? 4 : 2) : "–";
  const liter = svar ? fmt(svar.liter, svar.liter < 10 ? 2 : 1) : "–";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">{l.figureLabel}</span>
            <div className="flex flex-wrap gap-2">
              {(["kasse", "cylinder", "kugle", "kegle", "pyramide"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={figur === f}
                  onClick={() => valgFigur(f)}
                  className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    figur === f
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {l[f]}
                </button>
              ))}
            </div>
          </div>

          {felter.map((felt) => {
            const id = `rumfang-${figur}-${felt.nogle}`;
            const raar = maal[felt.nogle] > 0 && maal[felt.nogle] < MIN_MAAL_M;
            return (
              <div key={felt.nogle}>
                <label htmlFor={id} className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
                  {felt[lang]}
                </label>
                <div className="relative">
                  <input
                    id={id}
                    type="number"
                    inputMode="decimal"
                    min={MIN_MAAL_M}
                    max={MAX_MAAL_M}
                    step="0.01"
                    value={maal[felt.nogle] === 0 ? "" : maal[felt.nogle]}
                    aria-invalid={raar || undefined}
                    aria-describedby={raar ? `${id}-fejl` : undefined}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMaal((m) => ({ ...m, [felt.nogle]: Number.isFinite(v) ? v : 0 }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-14 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">m</span>
                </div>
                {raar ? (
                  <p id={`${id}-fejl`} className="mt-1 text-sm text-red-700 dark:text-red-300">
                    Skriv mindst {String(MIN_MAAL_M).replace(".", ",")} m.
                  </p>
                ) : null}
              </div>
            );
          })}

          <p className="text-xs text-gray-500 dark:text-gray-400">{l.intro}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">{l.resultLabel}</p>
            <p className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
              <Box className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" focusable="false" />
              <span>
                {kubi} <span className="text-xl font-semibold">{l.kubikmeter}</span>
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{l.formel}: {RUMFANG_FORMEL[figur]}</p>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-200">{l.liter}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{liter} l</span>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {lang === "da"
              ? `Eksempel: ${RUMFANG_EKSEMPEL[figur].beskrivelseDa} giver ${fmt(RUMFANG_EKSEMPEL[figur].svar.kubikmeter, 2)} m³.`
              : `Exempel: ${RUMFANG_EKSEMPEL[figur].beskrivelseSe} ger ${fmt(RUMFANG_EKSEMPEL[figur].svar.kubikmeter, 2)} m³.`}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${l.resultLabel}: ${kubi} ${l.kubikmeter} (${liter} l)`} />
      </div>
    </div>
  );
}