"use client";

import { useState, useMemo } from "react";
import { Heart } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { beregnHjerterytme } from "@/lib/hjerterytme";

const labels = {
  da: {
    title: "Hjerterytme beregner",
    alder: "Din alder",
    alderUnit: "år",
    hvilepuls: "Hvilepuls (valgfri)",
    hvilepulsUnit: "slag/min",
    hvilepulsHint: "Måles om morgenen, før du står op",
    maxPuls: "Maksimal puls",
    maxPulsTanaka: "Tanaka-formlen (208 − 0,7 × alder)",
    maxPulsSimpel: "Simpel formel (220 − alder)",
    zone: "Zone",
    pulsInterval: "Pulsinterval",
    hrrInterval: "HRR-interval",
    hrrHint: "Karvonen-formlen: tager højde for din hvilepuls",
    zoner: "Dine træningszoner",
    zone1: "Genoptræning",
    zone2: "Fedtforbrænding",
    zone3: "Aerob",
    zone4: "Anaerob",
    zone5: "VO2-max",
  },
  se: {
    title: "Hjärtfrekvens kalkylator",
    alder: "Din ålder",
    alderUnit: "år",
    hvilepuls: "Vilopuls (valfri)",
    hvilepulsUnit: "slag/min",
    hvilepulsHint: "Mätt på morgonen, innan du stiger upp",
    maxPuls: "Maxpuls",
    maxPulsTanaka: "Tanaka-formeln (208 − 0,7 × ålder)",
    maxPulsSimpel: "Enkel formel (220 − ålder)",
    zone: "Zon",
    pulsInterval: "Pulsintervall",
    hrrInterval: "HRR-intervall",
    hrrHint: "Karvonen-formeln: tar hänsyn till din vilopuls",
    zoner: "Dina träningszoner",
    zone1: "Återhämtning",
    zone2: "Fettförbränning",
    zone3: "Aerob",
    zone4: "Anaerob",
    zone5: "VO2-max",
  },
} as const;

export default function HjerterytmeBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [alder, setAlder] = useState<number>(40);
  const [hvilepuls, setHvilepuls] = useState<string>("");

  const resultat = useMemo(() => {
    const hv = hvilepuls ? Number(hvilepuls) : undefined;
    return beregnHjerterytme(alder, hv);
  }, [alder, hvilepuls]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="alder" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {l.alder}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="alder"
              type="number"
              min={1}
              max={120}
              value={alder}
              onChange={(e) => setAlder(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{l.alderUnit}</span>
          </div>
        </div>
        <div>
          <label htmlFor="hvilepuls" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {l.hvilepuls}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="hvilepuls"
              type="number"
              min={30}
              max={120}
              value={hvilepuls}
              onChange={(e) => setHvilepuls(e.target.value)}
              placeholder="60"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">{l.hvilepulsUnit}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{l.hvilepulsHint}</p>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-red-50 to-pink-50 p-6 dark:from-red-950/30 dark:to-pink-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{l.maxPuls}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {resultat.maxPuls} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">slag/min</span>
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
          <p>{l.maxPulsTanaka}: <strong className="text-gray-900 dark:text-gray-100">{resultat.maxPuls}</strong></p>
          <p>{l.maxPulsSimpel}: <strong className="text-gray-900 dark:text-gray-100">{resultat.maxPulsSimpel}</strong></p>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">{l.zoner}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">{l.zone}</th>
                <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400"></th>
                <th className="pb-2 pr-4 font-medium text-gray-600 dark:text-gray-400">{l.pulsInterval}</th>
                {resultat.hvilepuls !== undefined && (
                  <th className="pb-2 font-medium text-gray-600 dark:text-gray-400">{l.hrrInterval}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {resultat.zones.map((z) => (
                <tr key={z.zone} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 pr-4">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900/50 dark:text-red-300">
                      {z.zone}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{z.navn}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{z.beskrivelse}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">
                    {z.pulsMin}–{z.pulsMax} <span className="text-xs text-gray-500 dark:text-gray-400">slag/min</span>
                  </td>
                  {resultat.hvilepuls !== undefined && z.hrrMin !== undefined && z.hrrMax !== undefined && (
                    <td className="py-3 text-gray-700 dark:text-gray-300">
                      {z.hrrMin}–{z.hrrMax} <span className="text-xs text-gray-500 dark:text-gray-400">slag/min</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {resultat.hvilepuls !== undefined && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{l.hrrHint}</p>
        )}
      </div>
    </div>
  );
}
