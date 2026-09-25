"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, CircleAlert, CircleCheck, Link2, MoreHorizontal, PencilLine, Printer, RotateCcw, TriangleAlert } from "lucide-react";
import { todayIso } from "@/lib/barsel/dato";
import { afkodPlan, hashMedPlan, kodPlan, planFraHash } from "@/lib/barsel/del-link";
import { analyserPlan } from "@/lib/barsel/motor";
import { beregnOekonomi } from "@/lib/barsel/oekonomi";
import { SKABELONER, anvendSkabelon, standardPlan, type SkabelonId } from "@/lib/barsel/skabeloner";
import { gemPlan, indlaesPlan, migrer, sletPlan } from "@/lib/barsel/storage";
import type { BarselsPlan } from "@/lib/barsel/types";
import { trackCalculation } from "@/lib/analytics";
import ArbejdsgiverPanel, { downloadIcs, icsFor } from "./ArbejdsgiverPanel";
import InfoTip from "./InfoTip";
import Kalender from "./Kalender";
import OekonomiVisning from "./OekonomiVisning";
import Opsaetning from "./Opsaetning";
import PeriodeEditor from "./PeriodeEditor";
import PrintOversigt from "./PrintOversigt";
import Status from "./Status";
import Tidslinje from "./Tidslinje";
import { harEksempelLoen, kr, tal } from "./farver";
import "./barsel-print.css";

function Trin({ nr, titel, beskrivelse, children, id }: { nr: number; titel: React.ReactNode; beskrivelse?: string; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20 p-4 sm:p-6 lg:scroll-mt-40 lg:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-blue-700 text-sm font-bold text-blue-700 dark:border-blue-300 dark:text-blue-300"
          aria-hidden="true"
        >
          {nr}
        </span>
        <div>
          <h2 id={id} className="flex items-center gap-1 text-xl font-bold text-gray-900 dark:text-white">
            {titel}
          </h2>
          {beskrivelse && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{beskrivelse}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

const underoverskriftKlasse = "text-base font-semibold text-gray-900 dark:text-white";

const SKABELON_TITEL: Record<SkabelonId, string> = {
  klassisk: "Klassisk",
  lige: "Lige deling",
  sammen: "Mest tid sammen",
};

const SKABELON_KORT: Record<SkabelonId, string> = {
  klassisk: "Den ene tager det meste",
  lige: "I deler ugerne lige",
  sammen: "I er hjemme samtidig",
};

const knapLet =
  "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium sm:px-2.5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white";

/** "More" menu holding the destructive reset, so it does not sit next to the everyday actions. */
function MereMenu({ onNulstil }: { onNulstil: () => void }) {
  const [aaben, setAaben] = useState(false);
  const [bekraeft, setBekraeft] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const knapRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aaben) return;
    const luk = (e: Event) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAaben(false);
        setBekraeft(false);
      }
    };
    const tast = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAaben(false);
        setBekraeft(false);
        knapRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", luk);
    document.addEventListener("focusin", luk);
    document.addEventListener("keydown", tast);
    return () => {
      document.removeEventListener("pointerdown", luk);
      document.removeEventListener("focusin", luk);
      document.removeEventListener("keydown", tast);
    };
  }, [aaben]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={knapRef}
        type="button"
        aria-expanded={aaben}
        aria-controls="barsel-mere"
        aria-label="Flere handlinger"
        onClick={() => {
          setAaben((a) => !a);
          setBekraeft(false);
        }}
        className={knapLet}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      <div
        id="barsel-mere"
        hidden={!aaben}
        className="absolute right-0 top-full z-40 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-2 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800"
      >
        {bekraeft ? (
          <div className="p-1">
            <p className="mb-2 text-gray-800 dark:text-gray-100">Slet planen og start forfra? Det kan ikke fortrydes.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onNulstil();
                  setAaben(false);
                  setBekraeft(false);
                  knapRef.current?.focus();
                }}
                className="rounded-md bg-red-700 px-3 py-1.5 font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                Ja, slet planen
              </button>
              <button
                type="button"
                onClick={() => setBekraeft(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 font-semibold text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Annullér
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setBekraeft(true)} className={`${knapLet} w-full`}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Start forfra
          </button>
        )}
      </div>
    </div>
  );
}

function fjernHash() {
  try {
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
  } catch {
    // ignore
  }
}

function Skelet() {
  return (
    <div aria-busy="true" aria-label="Indlæser barselsplanlæggeren" className="space-y-6">
      <div className="h-32 animate-pulse rounded-xl bg-gray-200 motion-reduce:animate-none dark:bg-gray-800 sm:h-16" />
      <div className="h-[46rem] animate-pulse rounded-2xl bg-gray-200 motion-reduce:animate-none dark:bg-gray-800 sm:h-[38rem]" />
    </div>
  );
}

export default function BarselPlanlaegger() {
  const [plan, setPlan] = useState<BarselsPlan | null>(null);
  const [idag, setIdag] = useState("");
  const [gemt, setGemt] = useState<"gemt" | "fejl" | "">("");
  const [delStatus, setDelStatus] = useState("");
  const [visKalender, setVisKalender] = useState(false);
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
      if (fraLink && lokal && JSON.stringify(lokal) !== JSON.stringify(fraLink)) {
        // Keep the hash until the user decides: the page may remount before that.
        setPlan(lokal);
        setDelt(fraLink);
        return;
      }
      const valgt = fraLink ?? lokal ?? standard;
      if (fraLink) gemPlan(fraLink);
      fjernHash();
      setPlan(valgt);
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
  const toForaeldre = plan.foraeldre.length > 1 && plan.konstellation !== "solo";
  const eksempelLoen = plan.foraeldre.some(harEksempelLoen);
  const hjemme = new Set<number>();
  for (const a of analyse.foraeldre) for (const u of a.uger.values()) if (u.uge >= 0 && u.andel > 0) hjemme.add(u.uge);

  const delLink = async () => {
    try {
      const url = `${window.location.origin}${window.location.pathname}${hashMedPlan(await kodPlan(plan))}`;
      await navigator.clipboard.writeText(url);
      setDelStatus("Linket er kopieret. Planen ligger kun i linket, ikke på vores server.");
    } catch {
      setDelStatus("Kunne ikke kopiere linket i denne browser.");
    }
    setTimeout(() => setDelStatus(""), 6000);
  };

  const nulstil = () => {
    sletPlan();
    setPlan(standardPlan(todayIso()));
  };

  return (
    <div className="barsel-planlaegger">
      <PrintOversigt plan={plan} analyse={analyse} oekonomi={oekonomi} idag={idag} />

      <div className="space-y-4 print:hidden">
        {delt && (
          <div role="alert" className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-950 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-100">
            <p className="font-semibold">Du har åbnet et delt link med en barselsplan.</p>
            <p className="mt-1 text-sm">Du har også din egen gemte plan. Hvilken vil du bruge? Den anden bliver overskrevet.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  gemPlan(delt);
                  fjernHash();
                  setPlan(delt);
                  setDelt(null);
                }}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Brug planen fra linket
              </button>
              <button
                type="button"
                onClick={() => {
                  fjernHash();
                  setDelt(null);
                }}
                className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold hover:bg-white dark:border-blue-700 dark:hover:bg-blue-900/50"
              >
                Behold min egen plan
              </button>
            </div>
          </div>
        )}

        {/* Calm summary that follows along on desktop while the plan is edited */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 lg:sticky lg:top-16 lg:z-30 lg:shadow-sm">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap sm:items-end sm:gap-x-8">
              <div>
                <dt className="text-xs text-gray-600 dark:text-gray-300">Hjemme med barnet</dt>
                <dd className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white">{hjemme.size} uger</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-600 dark:text-gray-300">
                  Indkomsttab efter skat
                  {eksempelLoen && (
                    <a href="#trin-oekonomi" className="ml-1 underline underline-offset-2">
                      (eksempel)
                    </a>
                  )}
                </dt>
                <dd className="text-lg font-semibold tabular-nums text-gray-900 dark:text-white">{kr(Math.max(0, oekonomi.tabNetto))}</dd>
              </div>
              <div className="col-span-2">
                <dt className="sr-only">Tjek af reglerne</dt>
                <dd>
                  <a
                    href="#tjek"
                    className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                      fejl > 0 ? "text-red-700 dark:text-red-300" : advarsler > 0 ? "text-amber-800 dark:text-amber-300" : "text-green-800 dark:text-green-300"
                    }`}
                  >
                    {fejl > 0 ? (
                      <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : advarsler > 0 ? (
                      <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                    ) : (
                      <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                    {fejl > 0 ? `${fejl + advarsler} ting skal rettes` : advarsler > 0 ? `${advarsler} ting at være opmærksom på` : "Planen følger reglerne"}
                  </a>
                </dd>
              </div>
            </dl>
            <div className="-mx-2 flex items-center gap-0 sm:gap-0.5 lg:mx-0">
              <button type="button" onClick={() => window.print()} className={knapLet}>
                <Printer className="h-4 w-4" aria-hidden="true" />
                Print
              </button>
              <button type="button" onClick={delLink} className={knapLet}>
                <Link2 className="h-4 w-4" aria-hidden="true" />
                Del link
              </button>
              <button
                type="button"
                onClick={() => downloadIcs(icsFor(plan, analyse, plan.foraeldre.map((_, i) => i)), "barselsplan.ics")}
                className={knapLet}
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                <span className="sm:hidden">Kalender</span>
                <span className="hidden sm:inline">Til kalender</span>
              </button>
              <MereMenu onNulstil={nulstil} />
            </div>
          </div>
          {gemt === "fejl" && (
            <p className="mt-2 text-xs text-red-700 dark:text-red-300" role="status">
              Planen kunne ikke gemmes i denne browser. Brug Del link eller Print for at gemme den.
            </p>
          )}
        </div>

        {/* Toast: floats, so it never pushes content around. */}
        <p
          role="status"
          aria-live="polite"
          className={
            delStatus
              ? "fixed bottom-4 left-1/2 z-50 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-gray-100 dark:text-gray-900"
              : "sr-only"
          }
        >
          {delStatus}
        </p>

        <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
          <Trin nr={1} id="trin-situation" titel="Jeres situation" beskrivelse="Vælg familie og dato. Planen står klar med det samme.">
            <Opsaetning plan={plan} opdater={opdater} />
          </Trin>

          <Trin nr={2} id="trin-plan" titel="Jeres plan" beskrivelse="Uge for uge. Vælg et udgangspunkt, og ret ugerne til.">
            <div className="space-y-10">
              <div>
                {toForaeldre && (
                  <fieldset className="mb-6">
                    <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Start fra en standardplan</legend>
                    <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
                      {SKABELONER.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          title={s.beskrivelse}
                          onClick={() => opdater((p) => anvendSkabelon(p, s.id))}
                          className="rounded-lg border border-gray-300 px-2 py-2 text-center text-sm leading-snug sm:text-left hover:border-blue-600 sm:px-3 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20"
                        >
                          <span className="block font-semibold text-gray-900 dark:text-white">{SKABELON_TITEL[s.id]}</span>
                          <span className="hidden text-xs text-gray-600 dark:text-gray-300 sm:block">{SKABELON_KORT[s.id]}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                <Tidslinje plan={plan} analyse={analyse} />
              </div>

              <div>
                <h3 id="tjek" className={`mb-3 scroll-mt-20 lg:scroll-mt-40 ${underoverskriftKlasse}`}>
                  Tjek af planen
                </h3>
                <Status analyse={analyse} />
              </div>

              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className={underoverskriftKlasse}>Ret ugerne i kalenderen</h3>
                  <button
                    type="button"
                    aria-expanded={visKalender}
                    aria-controls="barsel-kalender"
                    onClick={() => setVisKalender((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 md:hidden"
                  >
                    <PencilLine className="h-4 w-4" aria-hidden="true" />
                    {visKalender ? "Skjul kalenderen" : "Redigér i kalender"}
                  </button>
                </div>
                <div id="barsel-kalender" className={visKalender ? "block" : "hidden md:block"}>
                  <Kalender plan={plan} analyse={analyse} opdater={opdater} />
                  {!toForaeldre && (
                    <button
                      type="button"
                      onClick={() => opdater((p) => anvendSkabelon(p, "klassisk"))}
                      className="mt-3 text-sm font-medium text-blue-700 underline underline-offset-2 hover:text-blue-900 dark:text-blue-300"
                    >
                      Gå tilbage til standardplanen
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className={`mb-3 ${underoverskriftKlasse}`}>Perioder og datoer</h3>
                <PeriodeEditor plan={plan} analyse={analyse} opdater={opdater} />
              </div>
            </div>
          </Trin>

          <Trin nr={3} id="trin-oekonomi" titel="Økonomien" beskrivelse="Løn, løn under barsel og barselsdagpenge måned for måned.">
            <OekonomiVisning plan={plan} analyse={analyse} oekonomi={oekonomi} />
          </Trin>

          <Trin
            nr={4}
            id="trin-arbejdsgiver"
            titel={
              <>
                Besked til arbejdsgiveren
                <InfoTip begreb="varsling" />
              </>
            }
            beskrivelse="En færdig besked med datoer og de frister, I skal huske."
          >
            <ArbejdsgiverPanel plan={plan} analyse={analyse} idag={idag} />
          </Trin>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400">
          {tal(analyse.foraeldre.reduce((s, a) => s + a.brugtFoer + a.brugtEfter, 0), 1)} uger med barselsdagpenge er planlagt i alt. Planen gemmes automatisk i
          din browser og sendes aldrig til os.
        </p>
      </div>
    </div>
  );
}
