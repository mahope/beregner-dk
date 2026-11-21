"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { formatDato, monthKey, monthLabel, parseIso, weekEnd, weekStart } from "@/lib/barsel/dato";
import type { Analyse, UgeAnalyse } from "@/lib/barsel/motor";
import { MAX_UGE, MIN_UGE, saetUger, type UgeCelle } from "@/lib/barsel/perioder";
import type { BarselsPlan, Kategori } from "@/lib/barsel/types";
import { FERIE_BG, KATEGORI_TEKST, PERSON_DOT, stortForbogstav, ugeFarve } from "./farver";
import InfoTip from "./InfoTip";
import { Forklaring } from "./Tidslinje";

type Pensel = "orlov" | "deltid" | "ferie" | "arbejde";

interface Props {
  plan: BarselsPlan;
  analyse: Analyse;
  opdater: (fn: (p: BarselsPlan) => BarselsPlan) => void;
}

const PENSLER: { id: Pensel; label: string; bg: string }[] = [
  { id: "orlov", label: "Orlov", bg: "bg-gray-700 dark:bg-gray-300" },
  { id: "deltid", label: "Orlov på deltid", bg: "bg-gradient-to-t from-gray-700 from-50% to-gray-200 to-50% dark:from-gray-300 dark:to-gray-600" },
  { id: "ferie", label: "Ferie", bg: FERIE_BG },
  { id: "arbejde", label: "Arbejde", bg: "border border-gray-400 bg-white dark:bg-gray-800" },
];

function kortDato(iso: string): string {
  const d = parseIso(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

export function ugeLabel(w: number): string {
  return w < 0 ? `−${-w}` : String(w + 1);
}

function statusTekst(u: UgeAnalyse | undefined): string {
  if (!u || !u.celle) return "arbejde";
  if (u.celle.type === "ferie") return "ferie";
  const kategorier = (Object.entries(u.fordeling) as [Kategori, number][])
    .filter(([, v]) => v > 0)
    .map(([k]) => KATEGORI_TEKST[k].toLowerCase())
    .join(" og ");
  const type = u.celle.type === "deltid" ? `orlov på deltid (arbejder ${u.celle.arbejdsProcent} %)` : "orlov";
  return `${type}${kategorier ? `, ${kategorier}` : ""}`;
}

export default function Kalender({ plan, analyse, opdater }: Props) {
  const [pensel, setPensel] = useState<Pensel>("orlov");
  const [procent, setProcent] = useState(50);
  const [fokus, setFokus] = useState<string>(`0:0`);
  const sidstKlikket = useRef<{ person: number; uge: number } | null>(null);
  const cellRefs = useRef(new Map<string, HTMLButtonElement>());

  const fra = Math.max(MIN_UGE, Math.min(-4, analyse.foersteUge));
  const til = Math.min(MAX_UGE, Math.max(analyse.sidsteUge + 4, 56));
  const uger = useMemo(() => Array.from({ length: til - fra }, (_, i) => fra + i), [fra, til]);

  const grupper = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const w of uger) {
      const key = monthKey(weekStart(plan.dato, w));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    return [...map.entries()];
  }, [uger, plan.dato]);

  const mal = useCallback(
    (person: number, start: number, slut: number) => {
      const celle: UgeCelle | null =
        pensel === "arbejde" ? null : pensel === "deltid" ? { type: "deltid", arbejdsProcent: procent } : { type: pensel };
      opdater((p) => ({
        ...p,
        foraeldre: p.foraeldre.map((f, i) => (i === person ? { ...f, perioder: saetUger(f.perioder, start, slut, celle) } : f)),
      }));
    },
    [opdater, pensel, procent]
  );

  const klik = (person: number, uge: number, shift: boolean) => {
    const sidst = sidstKlikket.current;
    if (shift && sidst && sidst.person === person) {
      mal(person, Math.min(sidst.uge, uge), Math.max(sidst.uge, uge) + 1);
    } else {
      mal(person, uge, uge + 1);
    }
    sidstKlikket.current = { person, uge };
    setFokus(`${person}:${uge}`);
  };

  const flyt = (person: number, uge: number) => {
    const p = Math.max(0, Math.min(plan.foraeldre.length - 1, person));
    const w = Math.max(fra, Math.min(til - 1, uge));
    const key = `${p}:${w}`;
    setFokus(key);
    cellRefs.current.get(key)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, person: number, uge: number) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        flyt(person, uge + 1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        flyt(person, uge - 1);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (person < plan.foraeldre.length - 1) flyt(person + 1, uge);
        else flyt(0, uge + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (person > 0) flyt(person - 1, uge);
        else flyt(plan.foraeldre.length - 1, uge - 1);
        break;
      case "Home":
        e.preventDefault();
        flyt(person, fra);
        break;
      case "End":
        e.preventDefault();
        flyt(person, til - 1);
        break;
    }
  };

  const fokusGyldig = (() => {
    const [p, w] = fokus.split(":").map(Number);
    return p < plan.foraeldre.length && w >= fra && w < til ? fokus : `0:${Math.max(fra, 0)}`;
  })();

  return (
    <div>
      <>
          <fieldset className="mb-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 print:hidden">
            <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Vælg type og klik på ugerne</legend>
            <div className="flex flex-wrap items-center gap-2">
              {PENSLER.map((p) => (
                <label
                  key={p.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-blue-600 ${
                    pensel === p.id
                      ? "border-blue-600 bg-blue-50 text-blue-950 ring-1 ring-blue-600 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-50 dark:ring-blue-400"
                      : "border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:text-gray-200"
                  }`}
                >
                  <input type="radio" name="barsel-pensel" className="sr-only" checked={pensel === p.id} onChange={() => setPensel(p.id)} />
                  <span className={`h-3 w-3 rounded-sm ${p.bg}`} aria-hidden="true" />
                  {p.label}
                </label>
              ))}
              <InfoTip begreb="deltid" />
              {pensel === "deltid" && (
                <label className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
                  Arbejder
                  <select
                    value={procent}
                    onChange={(e) => setProcent(Number(e.target.value))}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1 dark:border-gray-600 dark:bg-gray-700"
                  >
                    {[10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90].map((n) => (
                      <option key={n} value={n}>
                        {n} %
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Klik på en uge for at sætte den. Hold Shift nede for at sætte alle uger fra den sidste, du klikkede på. Med tastaturet: piletasterne flytter, Enter sætter ugen.
            </p>
          </fieldset>

          <div className="mb-3 space-y-1.5">
          <div className="flex flex-wrap gap-3 text-xs text-gray-700 dark:text-gray-300" aria-hidden="true">
            {plan.foraeldre.map((f, i) => (
              <span key={f.id} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${PERSON_DOT[i]}`} />
                {i === 0 ? "Øverst" : "Nederst"}: {f.navn || `Person ${i + 1}`}
              </span>
            ))}
          </div>
          <Forklaring />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
            {grupper.map(([maaned, ugerIMaaned]) => (
              <section
                key={maaned}
                aria-label={stortForbogstav(monthLabel(maaned))}
                className="rounded-lg border border-gray-200 p-1.5 dark:border-gray-700 sm:p-2"
              >
                <h4 className="mb-1 text-xs font-semibold text-gray-800 dark:text-gray-200 sm:text-sm">{stortForbogstav(monthLabel(maaned))}</h4>
                <div className="grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}>
                  {ugerIMaaned.map((w) => (
                    <div key={w} className="text-center">
                      <div
                        className={`rounded px-0.5 text-[11px] font-semibold leading-tight ${
                          w === 0
                            ? "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100"
                            : w === 52
                              ? "bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                        title={w === 0 ? "Fødsel / modtagelse" : w === 52 ? "Barnet fylder 1 år" : undefined}
                      >
                        {ugeLabel(w)}
                      </div>
                      <div className="text-[9px] leading-tight text-gray-500 dark:text-gray-400 sm:text-[10px]">
                        {kortDato(weekStart(plan.dato, w))}
                      </div>
                      <div className="mt-0.5 space-y-1">
                        {analyse.foraeldre.map((a, pi) => {
                          const u = a.uger.get(w);
                          const key = `${pi}:${w}`;
                          const kat: Kategori = u ? u.kategori : "arbejde";
                          const fyld = u?.celle?.type === "deltid" ? Math.round(u.andel * 100) : 100;
                          const efterFrist = u && w >= a.frist && u.andel > 0;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              ref={(el) => {
                                if (el) cellRefs.current.set(key, el);
                                else cellRefs.current.delete(key);
                              }}
                              tabIndex={key === fokusGyldig ? 0 : -1}
                              style={{ minHeight: 0 }}
                              onClick={(e) => klik(pi, w, e.shiftKey)}
                              onKeyDown={(e) => onKeyDown(e, pi, w)}
                              onFocus={() => setFokus(key)}
                              aria-label={`${a.navn}, uge ${ugeLabel(w)} (${formatDato(weekStart(plan.dato, w))} til ${formatDato(weekEnd(plan.dato, w))}): ${statusTekst(u)}`}
                              className={`relative block h-7 min-h-0 w-full overflow-hidden rounded-sm bg-gray-100 hover:outline-2 hover:outline-gray-400 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 dark:bg-gray-700 ${
                                efterFrist ? "ring-2 ring-red-600" : ""
                              }`}
                            >
                              <span
                                className={`absolute inset-x-0 bottom-0 ${ugeFarve(kat, pi)}`}
                                style={{ height: `${fyld}%` }}
                                aria-hidden="true"
                              />
                              {kat === "uden-ret" && (
                                <span className="relative text-xs font-bold text-gray-950" aria-hidden="true">
                                  !
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
      </>
    </div>
  );
}

