"use client";

import { useState } from "react";
import { CalendarPlus, Check, Copy, Share2 } from "lucide-react";
import { arbejdsgiverBesked } from "@/lib/barsel/arbejdsgiver";
import { formatDato } from "@/lib/barsel/dato";
import { buildIcs } from "@/lib/barsel/ics";
import { blokBeskrivelse, blokke, type Analyse } from "@/lib/barsel/motor";
import { erAdoption, erSolo } from "@/lib/barsel/regler";
import type { BarselsPlan } from "@/lib/barsel/types";
import { PERSON_DOT } from "./farver";

interface Props {
  plan: BarselsPlan;
  analyse: Analyse;
  idag: string;
}

async function kopier(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = tekst;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function beskedFor(plan: BarselsPlan, analyse: Analyse, index: number): string {
  const f = plan.foraeldre[index];
  const a = analyse.foraeldre[index];
  const adoption = erAdoption(plan.konstellation);
  return arbejdsgiverBesked({
    navn: f.navn,
    datoType: plan.datoType,
    dato: plan.dato,
    adoption,
    solo: erSolo(plan.konstellation),
    naertstaaende: a.rettigheder.rolle === "naertstaaende",
    udskudteUger: f.udskudteUger,
    perioder: blokke(plan, a).map((b) => ({ fra: b.fra, til: b.til, beskrivelse: blokBeskrivelse(b, adoption) })),
  });
}

export function icsFor(plan: BarselsPlan, analyse: Analyse, indices: number[]): string {
  const adoption = erAdoption(plan.konstellation);
  const events = indices.flatMap((i) => {
    const a = analyse.foraeldre[i];
    return blokke(plan, a).map((b) => ({
      id: `barsel-${a.id}-${b.start}-${b.type}`,
      title: `${a.navn}: ${blokBeskrivelse(b, adoption)}`,
      start: b.fra,
      end: b.til,
      description: "Planlagt med barselsplanlæggeren på MinBeregner.dk. Vejledende – tjek altid med borger.dk og din arbejdsgiver.",
    }));
  });
  return buildIcs(events, "Barselsplan");
}

export function downloadIcs(indhold: string, filnavn: string) {
  try {
    const blob = new Blob([indhold], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filnavn;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // Ignore – the button simply does nothing in very old browsers.
  }
}

export default function ArbejdsgiverPanel({ plan, analyse, idag }: Props) {
  const [status, setStatus] = useState<Record<string, string>>({});
  const kanDele = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const saet = (id: string, tekst: string) => {
    setStatus((s) => ({ ...s, [id]: tekst }));
    setTimeout(() => setStatus((s) => ({ ...s, [id]: "" })), 3000);
  };

  return (
    <div className={`grid gap-4 ${plan.foraeldre.length > 1 ? "lg:grid-cols-2" : ""}`}>
      {plan.foraeldre.map((f, i) => {
        const a = analyse.foraeldre[i];
        const tekst = beskedFor(plan, analyse, i);
        const varsler = analyse.varsler.filter((v) => v.foraelder === f.id);
        return (
          <article key={f.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <span className={`h-3 w-3 rounded-full ${PERSON_DOT[i]}`} aria-hidden="true" />
              Besked fra {a.navn}
            </h4>
            <label htmlFor={`besked-${f.id}`} className="sr-only">
              Besked til arbejdsgiveren fra {a.navn}
            </label>
            <textarea
              id={`besked-${f.id}`}
              readOnly
              value={tekst}
              rows={14}
              className="w-full flex-1 resize-y rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={async () => saet(`k${f.id}`, (await kopier(tekst)) ? "Kopieret!" : "Kunne ikke kopiere – markér teksten og kopiér selv.")}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {status[`k${f.id}`] === "Kopieret!" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                Kopiér til arbejdsgiver
              </button>
              {kanDele && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.share({ title: "Varsling af barselsorlov", text: tekst });
                    } catch {
                      // The user cancelled the share sheet.
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Del
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  downloadIcs(icsFor(plan, analyse, [i]), `barsel-${(a.navn || f.id).toLowerCase().replace(/[^a-z0-9æøå]+/gi, "-")}.ics`);
                  saet(`i${f.id}`, "Kalenderfilen er hentet.");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                Til kalender (.ics)
              </button>
            </div>
            <p role="status" aria-live="polite" className="mt-1 min-h-[1.25rem] text-sm text-green-800 dark:text-green-300">
              {status[`k${f.id}`] || status[`i${f.id}`]}
            </p>

            {varsler.length > 0 && (
              <div className="mt-2">
                <h5 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Frister for {a.navn}</h5>
                <ol className="space-y-1.5 text-sm">
                  {varsler.map((v) => {
                    const overskredet = v.dato < idag;
                    return (
                      <li key={v.titel} className="flex gap-3">
                        <time
                          dateTime={v.dato}
                          className={`w-28 shrink-0 font-semibold tabular-nums ${overskredet ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-white"}`}
                        >
                          {formatDato(v.dato)}
                        </time>
                        <span className="text-gray-700 dark:text-gray-200">
                          <strong className="font-medium">{v.titel}.</strong> {v.tekst}
                          {overskredet && <span className="font-medium text-red-700 dark:text-red-300"> Fristen er overskredet – tag fat i arbejdsgiveren hurtigst muligt.</span>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
