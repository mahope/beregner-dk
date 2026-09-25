"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CalendarDays, Rows3 } from "lucide-react";
import {
  MAANEDER,
  addDays,
  diffDays,
  formatDato,
  monthKey,
  monthLabel,
  parseIso,
  weekEnd,
  weekStart,
} from "@/lib/barsel/dato";
import type { Analyse, UgeAnalyse } from "@/lib/barsel/motor";
import { MAX_UGE, MIN_UGE, saetUger, type UgeCelle } from "@/lib/barsel/perioder";
import type { BarselsPlan, Kategori } from "@/lib/barsel/types";
import { KATEGORI_BG, KATEGORI_TEKST, LEGEND, PERSON_DOT } from "./farver";

type Pensel = "orlov" | "deltid" | "ferie" | "arbejde";

interface Props {
  plan: BarselsPlan;
  analyse: Analyse;
  opdater: (fn: (p: BarselsPlan) => BarselsPlan) => void;
}

const PENSLER: { id: Pensel; label: string; bg: string }[] = [
  { id: "orlov", label: "Orlov", bg: "bg-sky-500" },
  { id: "deltid", label: "Deltid", bg: "bg-sky-300" },
  { id: "ferie", label: "Ferie", bg: "bg-emerald-400" },
  { id: "arbejde", label: "Arbejde (fjern)", bg: "bg-gray-200" },
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
  const [visning, setVisning] = useState<"uger" | "maaneder">("uger");
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1 dark:border-gray-700 dark:bg-gray-800" role="group" aria-label="Visning">
          {(
            [
              ["uger", "Uger", Rows3],
              ["maaneder", "Måneder", CalendarDays],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={visning === id}
              onClick={() => setVisning(id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                visning === id
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <Forklaring />
      </div>

      {visning === "uger" ? (
        <>
          <fieldset className="mb-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700 print:hidden">
            <legend className="px-1 text-sm font-semibold text-gray-900 dark:text-white">Klik på en uge for at male den</legend>
            <div className="flex flex-wrap items-center gap-2">
              {PENSLER.map((p) => (
                <label
                  key={p.id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-medium focus-within:ring-2 focus-within:ring-blue-500 ${
                    pensel === p.id
                      ? "border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-100"
                      : "border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-200"
                  }`}
                >
                  <input type="radio" name="barsel-pensel" className="sr-only" checked={pensel === p.id} onChange={() => setPensel(p.id)} />
                  <span className={`h-3 w-3 rounded-sm ${p.bg}`} aria-hidden="true" />
                  {p.label}
                </label>
              ))}
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
              Tip: Hold Shift nede for at male fra den sidst klikkede uge. Piletasterne flytter mellem uger og personer; Enter eller mellemrum maler.
            </p>
          </fieldset>

          <div className="mb-2 flex flex-wrap gap-3 text-xs text-gray-700 dark:text-gray-300" aria-hidden="true">
            {plan.foraeldre.map((f, i) => (
              <span key={f.id} className="inline-flex items-center gap-1.5">
                <span className={`h-2.5 w-2.5 rounded-full ${PERSON_DOT[i]}`} />
                Række {i + 1}: {f.navn || `Person ${i + 1}`}
              </span>
            ))}
          </div>

          <div className="grid gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grupper.map(([maaned, ugerIMaaned]) => (
              <section
                key={maaned}
                aria-label={monthLabel(maaned)}
                className="rounded-lg border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  {monthLabel(maaned)}
                </h4>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${ugerIMaaned.length}, minmax(0, 1fr))` }}>
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
                      <div className="text-[10px] leading-tight text-gray-500 dark:text-gray-400">
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
                              onClick={(e) => klik(pi, w, e.shiftKey)}
                              onKeyDown={(e) => onKeyDown(e, pi, w)}
                              onFocus={() => setFokus(key)}
                              aria-label={`${a.navn}, uge ${ugeLabel(w)} (${formatDato(weekStart(plan.dato, w))} til ${formatDato(weekEnd(plan.dato, w))}): ${statusTekst(u)}`}
                              className={`relative block h-8 w-full overflow-hidden rounded border-l-4 ${
                                pi === 0 ? "border-l-rose-500" : "border-l-blue-600"
                              } bg-gray-100 transition-transform hover:scale-105 focus-visible:z-10 dark:bg-gray-700 ${
                                efterFrist ? "ring-2 ring-red-500" : ""
                              }`}
                            >
                              <span
                                className={`absolute inset-x-0 bottom-0 ${kat === "arbejde" ? "" : KATEGORI_BG[kat]}`}
                                style={{ height: `${fyld}%` }}
                                aria-hidden="true"
                              />
                              {kat === "uden-ret" && (
                                <span className="relative text-xs font-bold text-white" aria-hidden="true">
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
      ) : (
        <MaanedVisning plan={plan} analyse={analyse} fra={fra} til={til} />
      )}
    </div>
  );
}

export function Forklaring({ kompakt = false }: { kompakt?: boolean }) {
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 ${kompakt ? "text-[10px]" : "text-xs"} text-gray-700 dark:text-gray-300`} aria-label="Farveforklaring">
      {LEGEND.map((k) => (
        <li key={k} className="inline-flex items-center gap-1">
          <span className={`inline-block h-3 w-3 rounded-sm border border-gray-300 dark:border-gray-600 ${KATEGORI_BG[k]}`} aria-hidden="true" />
          {KATEGORI_TEKST[k]}
        </li>
      ))}
    </ul>
  );
}

const DAGE = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

function MaanedVisning({ plan, analyse, fra, til }: { plan: BarselsPlan; analyse: Analyse; fra: number; til: number }) {
  const start = weekStart(plan.dato, fra);
  const slut = weekEnd(plan.dato, til - 1);
  const maaneder = useMemo(() => {
    const keys: string[] = [];
    let d = `${start.slice(0, 7)}-01`;
    while (d <= slut) {
      keys.push(d.slice(0, 7));
      const dt = parseIso(d);
      d = `${dt.getUTCMonth() === 11 ? dt.getUTCFullYear() + 1 : dt.getUTCFullYear()}-${String(((dt.getUTCMonth() + 1) % 12) + 1).padStart(2, "0")}-01`;
    }
    return keys;
  }, [start, slut]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {maaneder.map((key) => {
        const [y, m] = key.split("-").map(Number);
        const foerste = `${key}-01`;
        const offset = (parseIso(foerste).getUTCDay() + 6) % 7;
        const antalDage = new Date(Date.UTC(y, m, 0)).getUTCDate();
        const celler: (string | null)[] = [
          ...Array.from({ length: offset }, () => null),
          ...Array.from({ length: antalDage }, (_, i) => addDays(foerste, i)),
        ];
        return (
          <section key={key} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800" aria-label={`${MAANEDER[m - 1]} ${y}`}>
            <h4 className="mb-2 text-sm font-semibold capitalize text-gray-900 dark:text-white">{`${MAANEDER[m - 1]} ${y}`}</h4>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-gray-500 dark:text-gray-400" aria-hidden="true">
              {DAGE.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-0.5 grid grid-cols-7 gap-0.5">
              {celler.map((iso, i) => {
                if (!iso) return <div key={`t${i}`} />;
                const uge = Math.floor(diffDays(plan.dato, iso) / 7);
                const erFoedsel = iso === plan.dato;
                const beskrivelse = analyse.foraeldre
                  .map((a) => `${a.navn}: ${statusTekst(a.uger.get(uge))}`)
                  .join("; ");
                return (
                  <div
                    key={iso}
                    title={`${formatDato(iso)} – ${beskrivelse}`}
                    className={`relative flex h-8 flex-col overflow-hidden rounded-sm ${erFoedsel ? "ring-2 ring-rose-600" : ""}`}
                  >
                    {analyse.foraeldre.map((a) => {
                      const u = a.uger.get(uge);
                      const kat: Kategori = u ? u.kategori : "arbejde";
                      return <span key={a.id} className={`flex-1 ${KATEGORI_BG[kat]}`} />;
                    })}
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-gray-900 mix-blend-normal dark:text-white">
                      <span className="rounded bg-white/70 px-0.5 dark:bg-gray-900/60">{Number(iso.slice(8))}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-gray-600 dark:text-gray-400 sm:col-span-2 lg:col-span-3">
        Hver dag er delt i {analyse.foraeldre.length === 2 ? "to: øverst " + analyse.foraeldre[0].navn + ", nederst " + analyse.foraeldre[1].navn : "én række"}. Fødselsdagen er markeret med en ring.
      </p>
    </div>
  );
}
