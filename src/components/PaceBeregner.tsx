"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { beregnPace, formaterLobetid, PaceModus } from "@/lib/pace";
import { formatSekunder } from "@/lib/tidsberegner";
import { formatNumber } from "@/lib/format";

const labels = {
  da: {
    name: "Løbetidsberegner",
    retning: "Hvad vil du beregne",
    fraTid: "Tempo fra løbetid",
    fraTempo: "Løbetid fra tempo",
    distance: "Distance",
    tid: "Løbetid",
    minutter: "Minutter",
    sekunder: "Sekunder",
    tempo: "Tempo",
    resultat: "Resultat",
    totalTid: "Løbetid",
    prKm: "pr. kilometer",
    splits: "Holdtider pr. kilometer",
    splitsForklaring: "Sidste kilometer er kortere, når distancen ikke er et helt antal kilometer.",
    km: "km",
    note: "Tempoet er den gennemsnitlige tid pr. kilometer. Holdtiderne summerer til den samme løbetid som resultatet.",
    ingen: "—",
    forLille: "Indtast en distance over 0 km og en tid over 0.",
  },
  se: {
    name: "Löptidsberäknare",
    retning: "Vad vill du beräkna",
    fraTid: "Pace från löptid",
    fraTempo: "Löptid från pace",
    distance: "Sträcka",
    tid: "Löptid",
    minutter: "Minuter",
    sekunder: "Sekunder",
    tempo: "Pace",
    resultat: "Resultat",
    totalTid: "Löptid",
    prKm: "per kilometer",
    splits: "Deltider per kilometer",
    splitsForklaring: "Sista kilometern är kortare när sträckan inte är ett helt antal kilometer.",
    km: "km",
    note: "Pacen är den genomsnittliga tiden per kilometer. Deltiderna summerar till samma löptid som resultatet.",
    ingen: "—",
    forLille: "Ange en sträcka över 0 km och en tid över 0.",
  },
} as const;

export default function PaceBeregner() {
  const { locale } = useLocale();
  const l = labels[locale === "se" ? "se" : "da"];

  const [modus, setModus] = useState<PaceModus>("tid");
  const [distance, setDistance] = useState<number>(5);
  const [minutter, setMinutter] = useState<number>(25);
  const [sekunder, setSekunder] = useState<number>(0);
  const [tempoMinutter, setTempoMinutter] = useState<number>(5);
  const [tempoSekunder, setTempoSekunder] = useState<number>(0);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "pace") {
      const i = urlState.inputs;
      if (i.modus === "tid" || i.modus === "tempo") setModus(i.modus);
      if (i.distance !== undefined) setDistance(Number(i.distance));
      if (i.minutter !== undefined) setMinutter(Number(i.minutter));
      if (i.sekunder !== undefined) setSekunder(Number(i.sekunder));
      if (i.tempoMinutter !== undefined) setTempoMinutter(Number(i.tempoMinutter));
      if (i.tempoSekunder !== undefined) setTempoSekunder(Number(i.tempoSekunder));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("pace");
    const timer = setTimeout(() => {
      trackCalculation("pace");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const handleReset = useCallback(() => {
    setModus("tid");
    setDistance(5);
    setMinutter(25);
    setSekunder(0);
    setTempoMinutter(5);
    setTempoSekunder(0);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "pace",
      inputs: { modus, distance, minutter, sekunder, tempoMinutter, tempoSekunder },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [modus, distance, minutter, sekunder, tempoMinutter, tempoSekunder]);

  const tidSek = minutter * 60 + sekunder;
  const tempoSek = tempoMinutter * 60 + tempoSekunder;

  const r = useMemo(
    () => beregnPace(modus, distance, tidSek, tempoSek),
    [modus, distance, tidSek, tempoSek]
  );

  const num = (n: number) => formatNumber(n, "da", { maximumFractionDigits: 2 });

  const numField = (id: string, label: string, value: number, onChange: (n: number) => void, unit: string) => (
    <div>
      <label htmlFor={id} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="number"
          min="0"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 pr-14 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{unit}</span>
      </div>
    </div>
  );

  const modeBtn = (m: PaceModus, text: string) => (
    <button
      key={m}
      type="button"
      onClick={() => setModus(m)}
      aria-pressed={modus === m}
      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        modus === m
          ? "bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
      }`}
    >
      {text}
    </button>
  );

  const totalTid = r ? formaterLobetid(r.totalSek) : l.ingen;
  const pace = r ? formatSekunder(r.sekunderPerKm) : l.ingen;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 id="pace-retning-gruppe" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              {l.retning}
            </h2>
            <div role="group" aria-labelledby="pace-retning-gruppe" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {modeBtn("tid", l.fraTid)}
              {modeBtn("tempo", l.fraTempo)}
            </div>
          </div>

          {numField("pace-distance", l.distance, distance, setDistance, l.km)}

          {modus === "tid" ? (
            <div className="grid grid-cols-2 gap-3">
              {numField("pace-minutter", l.minutter, minutter, setMinutter, "min")}
              {numField("pace-sekunder", l.sekunder, sekunder, setSekunder, "sek")}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {numField("pace-tempo-minutter", `${l.tempo} ${l.minutter.toLowerCase()}`, tempoMinutter, setTempoMinutter, "min")}
              {numField("pace-tempo-sekunder", `${l.tempo} ${l.sekunder.toLowerCase()}`, tempoSekunder, setTempoSekunder, "sek")}
            </div>
          )}

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{l.totalTid}</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalTid}</div>
            </div>

            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {l.tempo} ({l.prKm})
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{pace}</div>
            </div>

            {!r && <p className="text-sm text-gray-600 dark:text-gray-400">{l.forLille}</p>}

            {r && r.splits.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.splits}</h3>
                <div className="max-h-56 overflow-y-auto rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-600">
                        <th scope="col" className="text-left font-medium px-3 py-2 text-gray-500 dark:text-gray-400">
                          {l.km}
                        </th>
                        <th scope="col" className="text-right font-medium px-3 py-2 text-gray-500 dark:text-gray-400">
                          {l.splits}
                        </th>
                        <th scope="col" className="text-right font-medium px-3 py-2 text-gray-500 dark:text-gray-400">
                          {l.totalTid}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.splits.map((split, i) => {
                        const foer = r.splits.slice(0, i).reduce((a, b) => a + b, 0);
                        return (
                          <tr key={i} className="border-b last:border-0 dark:border-gray-600">
                            <td className="px-3 py-1.5 text-gray-700 dark:text-gray-200">{num(i + 1)}</td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-900 dark:text-white">
                              {formatSekunder(split)}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono text-gray-500 dark:text-gray-400">
                              {formaterLobetid(foer + split)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{l.splitsForklaring}</p>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={`${l.totalTid}: ${totalTid} · ${l.tempo}: ${pace}`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.name}
          resultSummary={`${l.totalTid}: ${totalTid} · ${l.tempo}: ${pace}`}
        />
      </div>
    </div>
  );
}