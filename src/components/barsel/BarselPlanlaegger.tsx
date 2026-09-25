"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, Link2, Printer, RotateCcw, Save } from "lucide-react";
import { todayIso } from "@/lib/barsel/dato";
import { afkodPlan, hashMedPlan, kodPlan, planFraHash } from "@/lib/barsel/del-link";
import { analyserPlan } from "@/lib/barsel/motor";
import { beregnOekonomi } from "@/lib/barsel/oekonomi";
import { SKABELONER, anvendSkabelon, standardPlan, type SkabelonId } from "@/lib/barsel/skabeloner";
import { gemPlan, indlaesPlan, migrer, sletPlan } from "@/lib/barsel/storage";
import type { BarselsPlan } from "@/lib/barsel/types";
import { trackCalculation } from "@/lib/analytics";
import ArbejdsgiverPanel, { downloadIcs, icsFor } from "./ArbejdsgiverPanel";
import Kalender from "./Kalender";
import OekonomiVisning from "./OekonomiVisning";
import Opsaetning from "./Opsaetning";
import PeriodeEditor from "./PeriodeEditor";
import PrintOversigt from "./PrintOversigt";
import Status from "./Status";
import { kr, tal } from "./farver";
import "./barsel-print.css";

function Trin({ nr, titel, beskrivelse, children, id }: { nr: number; titel: string; beskrivelse?: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white" aria-hidden="true">
          {nr}
        </span>
        <div>
          <h2 id={id} className="text-xl font-bold text-gray-900 dark:text-white">
            {titel}
          </h2>
          {beskrivelse && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{beskrivelse}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Skelet() {
  return (
    <div aria-busy="true" aria-label="Indlæser barselsplanlæggeren" className="space-y-6">
      <div className="h-16 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-[46rem] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800 sm:h-[38rem]" />
      <div className="h-[40rem] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export default function BarselPlanlaegger() {
  const [plan, setPlan] = useState<BarselsPlan | null>(null);
  const [idag, setIdag] = useState("");
  const [gemt, setGemt] = useState<"gemt" | "fejl" | "">("");
  const [delStatus, setDelStatus] = useState("");
  const [bekraeftNulstil, setBekraeftNulstil] = useState(false);
  const [delt, setDelt] = useState<BarselsPlan | null>(null);
  const tracked = useRef(false);

  // Hydrate after mount: shared link > saved plan > default plan.
  useEffect(() => {
    let aktiv = true;
    const nu = todayIso();
    setIdag(nu);
    const standard = standardPlan(nu);
    const lokal = indlaesPlan(standard);
    const hash = typeof window !== "undefined" ? planFraHash(window.location.hash) : null;
    if (!hash) {
      setPlan(lokal ?? standard);
      return;
    }
    afkodPlan(hash).then((data) => {
      if (!aktiv) return;
      const fraLink = data ? migrer(data, standard) : null;
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      } catch {
        // ignore
      }
      if (fraLink && lokal && JSON.stringify(lokal) !== JSON.stringify(fraLink)) {
        setPlan(lokal);
        setDelt(fraLink);
      } else {
        setPlan(fraLink ?? lokal ?? standard);
      }
    });
    return () => {
      aktiv = false;
    };
  }, []);

  // Autosave (debounced). Nothing is ever sent to a server.
  useEffect(() => {
    if (!plan) return;
    const t = setTimeout(() => setGemt(gemPlan(plan) ? "gemt" : "fejl"), 300);
    if (!tracked.current) {
      tracked.current = true;
      trackCalculation("barselsplanlaegger");
    }
    return () => clearTimeout(t);
  }, [plan]);

  const opdater = useCallback((fn: (p: BarselsPlan) => BarselsPlan) => {
    setPlan((p) => (p ? fn(p) : p));
  }, []);

  const analyse = useMemo(() => (plan ? analyserPlan(plan, idag) : null), [plan, idag]);
  const oekonomi = useMemo(() => (plan && analyse ? beregnOekonomi(plan, analyse) : null), [plan, analyse]);

  if (!plan || !analyse || !oekonomi) return <Skelet />;

  const fejl = analyse.beskeder.filter((b) => b.niveau === "fejl").length;
  const advarsler = analyse.beskeder.filter((b) => b.niveau === "advarsel").length;
  const hjemme = new Set<number>();
  for (const a of analyse.foraeldre) for (const u of a.uger.values()) if (u.uge >= 0 && u.andel > 0) hjemme.add(u.uge);

  const delLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}${hashMedPlan(await kodPlan(plan))}`;
      await navigator.clipboard.writeText(url);
      setDelStatus("Linket er kopieret. Planen ligger kun i linket – ikke på vores server.");
    } catch {
      setDelStatus("Kunne ikke kopiere linket i denne browser.");
    }
    setTimeout(() => setDelStatus(""), 5000);
  };

  const nulstil = () => {
    sletPlan();
    setPlan(standardPlan(todayIso()));
    setBekraeftNulstil(false);
  };

  return (
    <div className="barsel-planlaegger">
      <PrintOversigt plan={plan} analyse={analyse} oekonomi={oekonomi} idag={idag} />

      <div className="space-y-6 print:hidden">
        {delt && (
          <div role="alert" className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-950 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
            <p className="font-semibold">Du har åbnet et delt link med en barselsplan.</p>
            <p className="mt-1 text-sm">Du har også din egen gemte plan. Hvilken vil du bruge? Den anden bliver overskrevet.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPlan(delt);
                  setDelt(null);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Brug planen fra linket
              </button>
              <button
                type="button"
                onClick={() => setDelt(null)}
                className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold hover:bg-white dark:border-blue-700 dark:hover:bg-blue-900/50"
              >
                Behold min egen plan
              </button>
            </div>
          </div>
        )}

        {/* Summary + toolbar */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-lg sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <div>
              <p className="text-sm text-blue-100">Forælder hjemme i</p>
              <p className="text-2xl font-bold tabular-nums sm:text-3xl">{hjemme.size} uger</p>
            </div>
            <div>
              <p className="text-sm text-blue-100">Indkomsttab efter skat*</p>
              <p className="text-2xl font-bold tabular-nums sm:text-3xl">{kr(Math.max(0, oekonomi.tabNetto))}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm text-blue-100">Tjek af reglerne</p>
              <p className="text-2xl font-bold sm:text-3xl">
                {fejl + advarsler === 0 ? "Alt ser fint ud" : `${fejl + advarsler} ${fejl + advarsler === 1 ? "punkt" : "punkter"}`}
              </p>
              {fejl + advarsler > 0 && (
                <a href="#trin-status" className="text-sm font-medium text-white underline underline-offset-2">
                  Se hvad der skal rettes
                </a>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/20 pt-4">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print / gem PDF
            </button>
            <button type="button" onClick={delLink} className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25">
              <Link2 className="h-4 w-4" aria-hidden="true" />
              Del-link
            </button>
            <button
              type="button"
              onClick={() => downloadIcs(icsFor(plan, analyse, plan.foraeldre.map((_, i) => i)), "barselsplan.ics")}
              className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25"
            >
              <CalendarPlus className="h-4 w-4" aria-hidden="true" />
              Til kalender
            </button>
            {bekraeftNulstil ? (
              <span className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-white/10 px-2 py-1 text-sm">
                Slet planen og start forfra?
                <button type="button" onClick={nulstil} className="rounded-md bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700">
                  Ja, nulstil
                </button>
                <button type="button" onClick={() => setBekraeftNulstil(false)} className="rounded-md bg-white/20 px-3 py-1.5 font-semibold hover:bg-white/30">
                  Annullér
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setBekraeftNulstil(true)} className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white hover:bg-white/25">
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Nulstil
              </button>
            )}
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-blue-100" role="status" aria-live="polite">
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {gemt === "fejl" ? "Kunne ikke gemme i denne browser" : "Gemmes automatisk i din browser"} · *vejledende
            </span>
          </div>
          {delStatus && (
            <p className="mt-2 text-sm text-white" role="status">
              {delStatus}
            </p>
          )}
        </div>

        <Trin nr={1} id="trin-situation" titel="Jeres situation" beskrivelse="Vælg familieform og dato. Løn bruges kun til økonomien og bliver i din browser.">
          <Opsaetning plan={plan} opdater={opdater} />
        </Trin>

        <Trin
          nr={2}
          id="trin-kalender"
          titel="Kalenderen"
          beskrivelse="Start fra en standardplan og tilpas uge for uge. Farverne viser, hvilke uger der bruges."
        >
          <div className="mb-5 grid gap-2 sm:grid-cols-3 print:hidden">
            {SKABELONER.filter((s) => plan.foraeldre.length > 1 && plan.konstellation !== "solo" ? true : s.id === "klassisk").map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => opdater((p) => anvendSkabelon(p, s.id as SkabelonId))}
                className="rounded-xl border-2 border-gray-200 p-3 text-left hover:border-blue-500 hover:bg-blue-50 focus-visible:border-blue-600 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
              >
                <span className="block font-semibold text-gray-900 dark:text-white">
                  {plan.foraeldre.length > 1 && plan.konstellation !== "solo" ? s.titel : "Standardplan"}
                </span>
                <span className="mt-0.5 block text-xs text-gray-600 dark:text-gray-300">
                  {plan.foraeldre.length > 1 && plan.konstellation !== "solo" ? s.beskrivelse : "Alle dine uger i ét stræk fra fødslen."}
                </span>
              </button>
            ))}
          </div>
          <Kalender plan={plan} analyse={analyse} opdater={opdater} />
        </Trin>

        <Trin nr={3} id="trin-status" titel="Tjek af planen" beskrivelse="Opdateres i realtid efter barselsloven.">
          <Status analyse={analyse} />
        </Trin>

        <Trin nr={4} id="trin-perioder" titel="Perioder og datoer" beskrivelse="Læg orlov, deltid og ferie ind med datoer – eller ret dem, du har malet i kalenderen.">
          <PeriodeEditor plan={plan} analyse={analyse} opdater={opdater} />
        </Trin>

        <Trin nr={5} id="trin-oekonomi" titel="Økonomien" beskrivelse="Løn, løn under barsel og barselsdagpenge måned for måned.">
          <OekonomiVisning plan={plan} analyse={analyse} oekonomi={oekonomi} />
        </Trin>

        <Trin nr={6} id="trin-arbejdsgiver" titel="Send til arbejdsgiveren" beskrivelse="En færdig besked med præcise datoer – og de frister, I skal huske.">
          <ArbejdsgiverPanel plan={plan} analyse={analyse} idag={idag} />
        </Trin>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          {tal(analyse.foraeldre.reduce((s, a) => s + a.brugtFoer + a.brugtEfter, 0), 1)} uger med barselsdagpenge er planlagt i alt. Planen gemmes kun lokalt i
          din browser (localStorage) og sendes aldrig til os.
        </p>
      </div>
    </div>
  );
}
