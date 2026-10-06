"use client";

import { useMemo, useState } from "react";
import { Clock, Minus, Plus, Timer } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { formatNumber } from "@/lib/format";
import { PLUS_TID_EKSEMPLER, plusTid, summerTidsrum, type Tidsrum } from "@/lib/plus-tid";
import { formatTidsvar } from "@/lib/tids-eksempler";

const labels = {
  da: {
    overskrift: "Hvad er klokken om X timer?",
    verktoejOverskrift: "Læg tid til et klokkeslæt",
    tilfoej: "Læg tid til klokkeslæt",
    summer: "Læg tidsrum sammen",
    klokkeslaet: "Hvad er klokken?",
    retning: "Retning",
    plus: "Læg til",
    minus: "Træk fra",
    timer: "Timer",
    minutter: "Minutter",
    resultat: "Klokkeslættet bliver",
    timerOgMinutter: "Timer og minutter",
    timerEnhed: "timer",
    minutterEnhed: "minutter",
    dageEfter: "dage efter",
    dageFor: "dage før",
    dagenEfter: "dagen efter",
    dagenFor: "dagen før",
    sammeDag: "samme dags klokkeslæt",
    decimalTimer: "Tilsat tid i decimaltimer",
    tomtResultat: "Udfyld klokkeslættet for at se, hvad klokken bliver.",
    ugyldigtResultat:
      "Skriv et gyldigt klokkeslæt, sådan som 09:30, for at se hvad klokken bliver.",
    sumOverskrift: "Læg flere tidsrum sammen",
    sumHint:
      "Hvert rum regnes fra start til slut, og pausen trækkes fra, før rummene lægges sammen.",
    start: "Start",
    slut: "Slut",
    pause: "Pause",
    sumIAlt: "I alt",
    sumDage: "Hele døgn",
    sumSpringetOver: "rum uden gyldigt klokkeslæt blev sprunget over",
    sumTom:
      "Udfyld mindst ét tidsrum med to gyldige klokkeslæt, så summerer jeg dem for dig.",
    presetHint: "Hurtige eksempler",
  },
  se: {
    overskrift: "Vad är klockan om X timmar?",
    verktoejOverskrift: "Lägg till tid till ett klockslag",
    tilfoej: "Lägg till tid på klockslag",
    summer: "Lägg ihop tidsintervall",
    klokkeslaet: "Vad är klockan?",
    retning: "Riktning",
    plus: "Lägg till",
    minus: "Dra av",
    timer: "Timmar",
    minutter: "Minuter",
    resultat: "Klockan blir",
    timerOgMinutter: "Timmar och minuter",
    timerEnhed: "timmar",
    minutterEnhed: "minuter",
    dageEfter: "dagar efter",
    dageFor: "dagar innan",
    dagenEfter: "dagen efter",
    dagenFor: "dagen innan",
    sammeDag: "samma klockslag som innan",
    decimalTimer: "Tillagd tid i decimaltimmar",
    tomtResultat: "Fyll i klockslaget för att se vad klockan blir.",
    ugyldigtResultat:
      "Skriv ett giltigt klockslag, till exempel 09:30, för att se vad klockan blir.",
    sumOverskrift: "Lägg ihop flera tidsintervall",
    sumHint:
      "Varje intervall räknas från start till slut, och rasten dras av innan intervallene läggs ihop.",
    start: "Start",
    slut: "Slut",
    pause: "Rast",
    sumIAlt: "Totalt",
    sumDage: "Hela dygn",
    sumSpringetOver: "intervall utan giltigt klockslag hoppades över",
    sumTom:
      "Fyll i minst ett tidsintervall med två giltiga klockslag, så lägger jag ihop dem.",
    presetHint: "Snabbexempel",
  },
} as const;

type Modus = "foej" | "sum";

const feltCls =
  "w-full px-4 py-3 border border-gray-300 rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function PlusTidBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [modus, setModus] = useState<Modus>("foej");
  const [klokkeslaet, setKlokkeslaet] = useState<string>("09:00");
  const [retning, setRetning] = useState<"plus" | "minus">("plus");
  const [timer, setTimer] = useState<string>("8");
  const [minutter, setMinutter] = useState<string>("0");
  const [rum, setRum] = useState<Tidsrum[]>([
    { startTid: "08:00", slutTid: "16:00", fratraekPause: 0 },
    { startTid: "16:00", slutTid: "18:30", fratraekPause: 0 },
    { startTid: "", slutTid: "", fratraekPause: 0 },
  ]);

  const f2 = (n: number) =>
    formatNumber(n, lang, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  const foejResultat = useMemo(() => {
    const t = Number(timer);
    const m = Number(minutter);
    if (!Number.isFinite(t) || !Number.isFinite(m)) return null;
    return plusTid({
      klokkeslaet,
      timer: retning === "minus" ? -t : t,
      minutter: retning === "minus" ? -m : m,
    });
  }, [klokkeslaet, retning, timer, minutter]);

  const sumResultat = useMemo(() => summerTidsrum(rum), [rum]);

  const dag = (heleDage: number) => {
    if (heleDage === 0) return l.sammeDag;
    if (heleDage === 1) return l.dagenEfter;
    if (heleDage === -1) return l.dagenFor;
    return `${Math.abs(heleDage)} ${heleDage > 0 ? l.dageEfter : l.dageFor}`;
  };

  const setRumFelt = (i: number, felt: keyof Tidsrum, vaerdi: string) =>
    setRum((forrige) =>
      forrige.map((r, index) => {
        if (index !== i) return r;
        if (felt === "fratraekPause") return { ...r, fratraekPause: Number(vaerdi) || 0 };
        return { ...r, [felt]: vaerdi };
      }),
    );

  const modeKnap = (id: Modus, tekst: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setModus(id)}
      aria-pressed={modus === id}
      className={`min-h-[44px] px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
        modus === id
          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:text-white"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
      }`}
    >
      {tekst}
    </button>
  );

  return (
    <section
      aria-labelledby="plus-tid-overskrift"
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 md:p-8 mb-8"
    >
      <h2 id="plus-tid-overskrift" className="text-xl font-bold mb-4 dark:text-white">
        {l.overskrift}
      </h2>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label={l.tilfoej}>
        {modeKnap("foej", l.tilfoej)}
        {modeKnap("sum", l.summer)}
      </div>

      {modus === "foej" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="plus-tid-klokkeslaet"
                className="block text-sm font-medium mb-2 dark:text-gray-200"
              >
                {l.klokkeslaet}
              </label>
              <input
                id="plus-tid-klokkeslaet"
                type="time"
                value={klokkeslaet}
                onChange={(e) => setKlokkeslaet(e.target.value)}
                className={feltCls}
              />
            </div>
            <div>
              <span className="block text-sm font-medium mb-2 dark:text-gray-200" id="plus-tid-retning-label">
                {l.retning}
              </span>
              <div
                className="flex gap-2"
                role="group"
                aria-labelledby="plus-tid-retning-label"
              >
                {(["plus", "minus"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRetning(r)}
                    aria-pressed={retning === r}
                    className={`flex-1 min-h-[44px] px-4 py-3 rounded-lg border text-base font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                      retning === r
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                  >
                    {r === "plus" ? (
                      <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />
                    ) : (
                      <Minus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" focusable="false" />
                    )}
                    {r === "plus" ? l.plus : l.minus}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="plus-tid-timer"
                className="block text-sm font-medium mb-2 dark:text-gray-200"
              >
                {l.timer}
              </label>
              <input
                id="plus-tid-timer"
                type="number"
                min="0"
                max="9999"
                step="1"
                inputMode="numeric"
                value={timer}
                onChange={(e) => setTimer(e.target.value)}
                className={feltCls}
              />
            </div>
            <div>
              <label
                htmlFor="plus-tid-minutter"
                className="block text-sm font-medium mb-2 dark:text-gray-200"
              >
                {l.minutter}
              </label>
              <input
                id="plus-tid-minutter"
                type="number"
                min="0"
                max="59"
                step="1"
                inputMode="numeric"
                value={minutter}
                onChange={(e) => setMinutter(e.target.value)}
                className={feltCls}
              />
            </div>
          </div>

          <div className="mt-6" aria-live="polite">
            {foejResultat ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 bg-blue-100 rounded-xl text-center dark:bg-blue-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                    {l.resultat}
                  </p>
                  <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                    {foejResultat.klokkeslaet}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 dark:text-gray-400">
                    {dag(foejResultat.heleDage)}
                  </p>
                </div>
                <div className="p-6 bg-green-100 rounded-xl text-center dark:bg-green-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                    {l.timerOgMinutter}
                  </p>
                  <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                    {foejResultat.timer}:{String(foejResultat.minutter).padStart(2, "0")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatNumber(foejResultat.totalMinutter, lang)}{" "}
                    {l.minutterEnhed}
                  </p>
                </div>
                <div className="p-6 bg-purple-100 rounded-xl text-center dark:bg-purple-900/20">
                  <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">
                    {l.decimalTimer}
                  </p>
                  <p className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                    {f2(foejResultat.decimalTimer)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {klokkeslaet.trim() === "" ? l.tomtResultat : l.ugyldigtResultat}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="space-y-4">
            {rum.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/40"
              >
                <div>
                  <label
                    htmlFor={`plus-tid-sum-start-${i}`}
                    className="block text-sm font-medium mb-2 dark:text-gray-200"
                  >
                    {l.start}
                  </label>
                  <input
                    id={`plus-tid-sum-start-${i}`}
                    type="time"
                    value={r.startTid}
                    onChange={(e) => setRumFelt(i, "startTid", e.target.value)}
                    className={feltCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`plus-tid-sum-slut-${i}`}
                    className="block text-sm font-medium mb-2 dark:text-gray-200"
                  >
                    {l.slut}
                  </label>
                  <input
                    id={`plus-tid-sum-slut-${i}`}
                    type="time"
                    value={r.slutTid}
                    onChange={(e) => setRumFelt(i, "slutTid", e.target.value)}
                    className={feltCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`plus-tid-sum-pause-${i}`}
                    className="block text-sm font-medium mb-2 dark:text-gray-200"
                  >
                    {l.pause} (min)
                  </label>
                  <input
                    id={`plus-tid-sum-pause-${i}`}
                    type="number"
                    min="0"
                    max="480"
                    step="5"
                    inputMode="numeric"
                    value={r.fratraekPause ?? 0}
                    onChange={(e) => setRumFelt(i, "fratraekPause", e.target.value)}
                    className={feltCls}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6" aria-live="polite">
            {sumResultat ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-blue-100 rounded-xl text-center dark:bg-blue-900/20">
                    <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.sumIAlt}</p>
                    <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">
                      {sumResultat.timer}:{String(sumResultat.minutter).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {f2(sumResultat.decimalTimer)} {l.timerEnhed}
                    </p>
                  </div>
                  <div className="p-6 bg-green-100 rounded-xl text-center dark:bg-green-900/20">
                    <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{l.sumDage}</p>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400">
                      {f2(sumResultat.heleDoegn)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {l.timerEnhed}
                    </p>
                  </div>
                </div>
                {sumResultat.springteOver > 0 && (
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                    {sumResultat.springteOver} {l.sumSpringetOver}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.sumTom}</p>
            )}
          </div>
        </>
      )}

      {modus === "foej" && (
        <div className="mt-6">
          <p className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2">
            <Clock className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />
            {l.presetHint}
          </p>
          <div className="flex flex-wrap gap-2">
            {PLUS_TID_EKSEMPLER.map((eksempel) => {
              const r = plusTid(eksempel)!;
              const fortegn =
                eksempel.timer < 0 || eksempel.minutter < 0 ? "\u2212" : "+";
              const tekst = `${eksempel.klokkeslaet} ${fortegn} ${formatTidsvar(
                {
                  timer: Math.abs(eksempel.timer),
                  minutter: Math.abs(eksempel.minutter),
                },
                lang,
              )} = ${r.klokkeslaet}`;
              return (
                <button
                  key={eksempel.id}
                  type="button"
                  onClick={() => {
                    const fortegn = eksempel.timer < 0 || eksempel.minutter < 0 ? -1 : 1;
                    setKlokkeslaet(eksempel.klokkeslaet);
                    setRetning(fortegn < 0 ? "minus" : "plus");
                    setTimer(String(Math.abs(eksempel.timer)));
                    setMinutter(String(Math.abs(eksempel.minutter)));
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 tabular-nums"
                >
                  {tekst}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {modus === "sum" && (
        <p className="mt-6 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <Timer className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />
          {l.sumHint}
        </p>
      )}
    </section>
  );
}