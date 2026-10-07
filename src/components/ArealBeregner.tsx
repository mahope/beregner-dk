"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Shapes } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import {
  AREAL_EKSEMPEL,
  AREAL_FELT,
  AREAL_FORMEL,
  MAX_MAAL_M,
  MIN_MAAL_M,
  arealSvar,
  type ArealFigur,
  type ArealInput,
} from "@/lib/areal";

const FIGURER = [
  "cirkel",
  "trekant",
  "rektangel",
  "kvadrat",
  "trapez",
  "parallelogram",
  "rombe",
] as const;

const labels = {
  da: {
    calcName: "Arealberegner",
    figureLabel: "Figur",
    resultLabel: "Areal",
    cirkel: "Cirkel",
    trekant: "Trekant",
    rektangel: "Rektangel",
    kvadrat: "Kvadrat",
    trapez: "Trapez",
    parallelogram: "Parallelogram",
    rombe: "Rombe",
    formel: "Formel",
    kvadratcentimeter: "Samme areal i cm²",
    kvadratmeter: "i m²",
    shareSummary: "Areal",
    intro: "Vælg en figur, skriv målene i meter, og få arealet i m² og cm².",
  },
  se: {
    calcName: "Areaberäknare",
    figureLabel: "Form",
    resultLabel: "Area",
    cirkel: "Cirkel",
    trekant: "Triangel",
    rektangel: "Rektangel",
    kvadrat: "Kvadrat",
    trapez: "Trapets",
    parallelogram: "Parallellogram",
    rombe: "Romb",
    formel: "Formel",
    kvadratcentimeter: "Samma area i cm²",
    kvadratmeter: "i m²",
    shareSummary: "Area",
    intro: "Välj en form, skriv måtten i meter, och få arean i m² och cm².",
  },
} as const;

/** Målene pr. figur i meter. `0` betyder «ikke udfyldt», så feltet viser en tom streng. */
const START: Record<ArealFigur, Record<string, number>> = {
  cirkel: { diameter: 1 },
  trekant: { grundlinje: 2, hoejde: 3 },
  rektangel: { laengde: 2, bredde: 3 },
  kvadrat: { side: 2 },
  trapez: { sideA: 2, sideB: 4, hoejde: 3 },
  parallelogram: { grundlinje: 2, hoejde: 3 },
  rombe: { diagonal1: 2, diagonal2: 3 },
};

function toInput(figur: ArealFigur, maal: Record<string, number>): ArealInput {
  const hent = (nogle: string) =>
    maal[nogle] >= MIN_MAAL_M && maal[nogle] <= MAX_MAAL_M ? maal[nogle] : undefined;
  switch (figur) {
    case "cirkel":
      return { cirkel: { diameter: hent("diameter")! } };
    case "trekant":
      return { trekant: { grundlinje: hent("grundlinje")!, hoejde: hent("hoejde")! } };
    case "rektangel":
      return { rektangel: { laengde: hent("laengde")!, bredde: hent("bredde")! } };
    case "kvadrat":
      return { kvadrat: { side: hent("side")! } };
    case "trapez":
      return { trapez: { sideA: hent("sideA")!, sideB: hent("sideB")!, hoejde: hent("hoejde")! } };
    case "parallelogram":
      return { parallelogram: { grundlinje: hent("grundlinje")!, hoejde: hent("hoejde")! } };
    case "rombe":
      return { rombe: { diagonal1: hent("diagonal1")!, diagonal2: hent("diagonal2")! } };
  }
}

export default function ArealBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const fmt = (n: number, decimals: number) =>
    formatNumber(n, locale, { minimumFractionDigits: 0, maximumFractionDigits: decimals });

  const [figur, setFigur] = useState<ArealFigur>("cirkel");
  const [maal, setMaal] = useState<Record<string, number>>(() => ({ ...START.cirkel }));

  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("areal");
    const timer = setTimeout(() => trackCalculation("areal"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const valgFigur = useCallback((ny: ArealFigur) => {
    setFigur(ny);
    setMaal({ ...START[ny] });
  }, []);

  const svar = useMemo(() => {
    try {
      return arealSvar(figur, toInput(figur, maal));
    } catch {
      // `areal` kaster på et mål uden for grænsen. Værktøjet skal vise «skriv
      // et tal» og ikke en fejl fra modulet (punkt 8: 5xx er forbigående).
      return undefined;
    }
  }, [figur, maal]);

  const felter = AREAL_FELT[figur];
  const kvm = svar ? fmt(svar.kvadratmeter, svar.kvadratmeter < 1 ? 4 : 2) : "–";
  const kcm = svar ? fmt(svar.kvadratcentimeter, 0) : "–";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-xs text-gray-600 dark:text-gray-400">{l.figureLabel}</span>
            <div className="flex flex-wrap gap-2">
              {FIGURER.map((f) => (
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
            const id = `areal-${figur}-${felt.nogle}`;
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
              <Shapes className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" focusable="false" />
              <span>
                {kvm} <span className="text-xl font-semibold">{l.kvadratmeter}</span>
              </span>
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {l.formel}: {AREAL_FORMEL[figur]}
            </p>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-3 rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-gray-800">
            <span className="text-sm text-gray-700 dark:text-gray-200">{l.kvadratcentimeter}</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{kcm} cm²</span>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            {lang === "da"
              ? `Eksempel: ${AREAL_EKSEMPEL[figur].beskrivelseDa} giver ${fmt(AREAL_EKSEMPEL[figur].svar.kvadratmeter, 2)} m².`
              : `Exempel: ${AREAL_EKSEMPEL[figur].beskrivelseSe} ger ${fmt(AREAL_EKSEMPEL[figur].svar.kvadratmeter, 2)} m².`}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${l.resultLabel}: ${kvm} ${l.kvadratmeter} (${kcm} cm²)`} />
      </div>
    </div>
  );
}
