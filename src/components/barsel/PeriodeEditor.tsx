"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { formatDato, isIsoDate, weekIndexOf, weekEnd, weekStart } from "@/lib/barsel/dato";
import { blokBeskrivelse, blokke, type Analyse } from "@/lib/barsel/motor";
import { MAX_UGE, MIN_UGE, saetUger, type UgeCelle } from "@/lib/barsel/perioder";
import { erAdoption } from "@/lib/barsel/regler";
import type { BarselsPlan } from "@/lib/barsel/types";
import { PERSON_DOT } from "./farver";
import { inputKlasse, labelKlasse } from "./Felter";
import InfoTip from "./InfoTip";

type Type = "orlov" | "deltid" | "ferie" | "arbejde";

interface Props {
  plan: BarselsPlan;
  analyse: Analyse;
  opdater: (fn: (p: BarselsPlan) => BarselsPlan) => void;
}

export default function PeriodeEditor({ plan, analyse, opdater }: Props) {
  const [person, setPerson] = useState(0);
  const [type, setType] = useState<Type>("orlov");
  const [procent, setProcent] = useState(50);
  const [fra, setFra] = useState(plan.dato);
  const [til, setTil] = useState(weekEnd(plan.dato, 1));
  const [besked, setBesked] = useState("");
  const adoption = erAdoption(plan.konstellation);

  useEffect(() => {
    if (person >= plan.foraeldre.length) setPerson(0);
  }, [person, plan.foraeldre.length]);

  const gyldig = isIsoDate(fra) && isIsoDate(til) && til >= fra;
  const startUge = gyldig ? Math.max(MIN_UGE, weekIndexOf(plan.dato, fra)) : 0;
  const slutUge = gyldig ? Math.min(MAX_UGE, weekIndexOf(plan.dato, til) + 1) : 0;

  const anvend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gyldig || slutUge <= startUge) {
      setBesked("Vælg en gyldig periode, hvor slutdatoen ligger efter startdatoen.");
      return;
    }
    const celle: UgeCelle | null =
      type === "arbejde" ? null : type === "deltid" ? { type: "deltid", arbejdsProcent: procent } : { type };
    opdater((p) => ({
      ...p,
      foraeldre: p.foraeldre.map((f, i) => (i === person ? { ...f, perioder: saetUger(f.perioder, startUge, slutUge, celle) } : f)),
    }));
    const navn = plan.foraeldre[person]?.navn || `Person ${person + 1}`;
    setBesked(
      `${navn}: ${formatDato(weekStart(plan.dato, startUge))} – ${formatDato(weekEnd(plan.dato, slutUge - 1))} er sat til ${
        type === "arbejde" ? "arbejde" : type === "deltid" ? `deltid (${procent} % arbejde)` : type
      }.`
    );
  };

  const fjern = (pi: number, start: number, slut: number) =>
    opdater((p) => ({
      ...p,
      foraeldre: p.foraeldre.map((f, i) => (i === pi ? { ...f, perioder: saetUger(f.perioder, start, slut, null) } : f)),
    }));

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${analyse.foraeldre.length > 1 ? "md:grid-cols-2" : ""}`}>
        {analyse.foraeldre.map((a, pi) => {
          const liste = blokke(plan, a);
          return (
            <section key={a.id} aria-label={`Perioder for ${a.navn}`}>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <span className={`h-3 w-3 rounded-full ${PERSON_DOT[pi]}`} aria-hidden="true" />
                {a.navn}
              </h4>
              {liste.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingen orlov planlagt endnu.</p>
              ) : (
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                  {liste.map((b) => (
                    <li key={`${b.start}-${b.type}`} className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm dark:bg-gray-800">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDato(b.fra)} – {formatDato(b.til)}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300">{blokBeskrivelse(b, adoption)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fjern(pi, b.start, b.slut)}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 print:hidden"
                        aria-label={`Fjern ${blokBeskrivelse(b, adoption).toLowerCase()} fra ${formatDato(b.fra)} for ${a.navn}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
      <details className="group rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40 print:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 font-medium text-gray-900 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-white dark:hover:bg-gray-800 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tilføj en periode med datoer
          </span>
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
          <form onSubmit={anvend} className="space-y-3 border-t border-gray-200 p-4 dark:border-gray-700" aria-label="Tilføj eller ret en periode med datoer">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="periode-person" className={labelKlasse}>
                  Person
                </label>
                <select id="periode-person" className={inputKlasse} value={person} onChange={(e) => setPerson(Number(e.target.value))}>
                  {plan.foraeldre.map((f, i) => (
                    <option key={f.id} value={i}>
                      {f.navn || `Person ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <label htmlFor="periode-type" className={labelKlasse}>
                    Type
                  </label>
                  <InfoTip begreb="deltid" className="mb-1" />
                </div>
                <select id="periode-type" className={inputKlasse} value={type} onChange={(e) => setType(e.target.value as Type)}>
                  <option value="orlov">Orlov</option>
                  <option value="deltid">Orlov på deltid</option>
                  <option value="ferie">Ferie</option>
                  <option value="arbejde">Arbejde (fjern orlov)</option>
                </select>
              </div>
              <div>
                <label htmlFor="periode-fra" className={labelKlasse}>
                  Fra
                </label>
                <input id="periode-fra" type="date" className={inputKlasse} value={fra} onChange={(e) => setFra(e.target.value)} />
              </div>
              <div>
                <label htmlFor="periode-til" className={labelKlasse}>
                  Til og med
                </label>
                <input id="periode-til" type="date" className={inputKlasse} value={til} onChange={(e) => setTil(e.target.value)} />
              </div>
              {type === "deltid" && (
                <div className="col-span-2">
                  <label htmlFor="periode-procent" className={labelKlasse}>
                    Arbejder (andel af normal tid)
                  </label>
                  <select id="periode-procent" className={inputKlasse} value={procent} onChange={(e) => setProcent(Number(e.target.value))}>
                    {[10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90].map((n) => (
                      <option key={n} value={n}>
                        {n} % arbejde, {100 - n} % orlov
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {gyldig && slutUge > startUge && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Rundes til hele orlovsuger: {formatDato(weekStart(plan.dato, startUge))} – {formatDato(weekEnd(plan.dato, slutUge - 1))} ({slutUge - startUge}{" "}
                {slutUge - startUge === 1 ? "uge" : "uger"}). Ugerne regnes fra {adoption ? "modtagelsesdatoen" : plan.datoType === "termin" ? "terminsdatoen" : "fødselsdatoen"}.
              </p>
            )}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Sæt periode
            </button>
            <p role="status" aria-live="polite" className="min-h-[1.25rem] text-sm text-gray-700 dark:text-gray-200">
              {besked}
            </p>
          </form>
      </details>
    </div>
  );
}
