"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type BeregningsMode = "dage-mellem" | "tilfoej-dage" | "arbejdsdage" | "alder";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("da-DK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function DatoBeregner() {
  const [mode, setMode] = useState<BeregningsMode>("dage-mellem");

  // Dage mellem mode
  const today = new Date().toISOString().split("T")[0];
  const [startDato, setStartDato] = useState<string>(today);
  const [slutDato, setSlutDato] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });

  // Tilføj dage mode
  const [baseDato, setBaseDato] = useState<string>(today);
  const [antalDage, setAntalDage] = useState<number>(30);

  // Alder mode
  const [foedselsdato, setFoedselsdato] = useState<string>("1990-01-01");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'dato') {
      const inputs = urlState.inputs;
      if (inputs.mode) setMode(inputs.mode);
      if (inputs.startDato) setStartDato(inputs.startDato);
      if (inputs.slutDato) setSlutDato(inputs.slutDato);
      if (inputs.baseDato) setBaseDato(inputs.baseDato);
      if (inputs.antalDage !== undefined) setAntalDage(inputs.antalDage);
      if (inputs.foedselsdato) setFoedselsdato(inputs.foedselsdato);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("dato");
    const timer = setTimeout(() => {
      trackCalculation("dato");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'dato',
      inputs: { mode, startDato, slutDato, baseDato, antalDage, foedselsdato },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [mode, startDato, slutDato, baseDato, antalDage, foedselsdato]);

  const handleReset = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setMode("dage-mellem");
    setStartDato(today);
    setSlutDato(nextMonth.toISOString().split("T")[0]);
    setBaseDato(today);
    setAntalDage(30);
    setFoedselsdato("1990-01-01");
  }, []);

  const resultat = useMemo(() => {
    switch (mode) {
      case "dage-mellem": {
        const start = new Date(startDato);
        const slut = new Date(slutDato);
        const diffTime = slut.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(Math.abs(diffDays) / 7);
        const diffMonths = Math.round(Math.abs(diffDays) / 30.44);

        // Tæl arbejdsdage
        let arbejdsdage = 0;
        const current = new Date(start);
        while (current <= slut) {
          if (!isWeekend(current)) {
            arbejdsdage++;
          }
          current.setDate(current.getDate() + 1);
        }

        return {
          type: "dage-mellem" as const,
          dage: diffDays,
          uger: diffWeeks,
          maaneder: diffMonths,
          arbejdsdage,
          weekenddage: Math.abs(diffDays) - arbejdsdage,
        };
      }

      case "tilfoej-dage": {
        const base = new Date(baseDato);
        const resultatDato = new Date(base);
        resultatDato.setDate(resultatDato.getDate() + antalDage);

        return {
          type: "tilfoej-dage" as const,
          resultatDato,
          formatteret: formatDate(resultatDato),
        };
      }

      case "arbejdsdage": {
        const base = new Date(baseDato);
        let dageAtTilfoeje = antalDage;
        const resultatDato = new Date(base);

        while (dageAtTilfoeje > 0) {
          resultatDato.setDate(resultatDato.getDate() + 1);
          if (!isWeekend(resultatDato)) {
            dageAtTilfoeje--;
          }
        }

        // Tæl samlede dage inkl. weekender
        const diffTime = resultatDato.getTime() - base.getTime();
        const samledeDage = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          type: "arbejdsdage" as const,
          resultatDato,
          formatteret: formatDate(resultatDato),
          samledeDage,
          weekenddage: samledeDage - antalDage,
        };
      }

      case "alder": {
        const foedt = new Date(foedselsdato);
        const nu = new Date();

        let aar = nu.getFullYear() - foedt.getFullYear();
        let maaneder = nu.getMonth() - foedt.getMonth();
        let dage = nu.getDate() - foedt.getDate();

        if (dage < 0) {
          maaneder--;
          dage += getDaysInMonth(nu.getFullYear(), nu.getMonth() - 1);
        }
        if (maaneder < 0) {
          aar--;
          maaneder += 12;
        }

        const totalDage = Math.floor(
          (nu.getTime() - foedt.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalUger = Math.floor(totalDage / 7);

        // Næste fødselsdag
        const naesteFoedselsdag = new Date(
          nu.getFullYear(),
          foedt.getMonth(),
          foedt.getDate()
        );
        if (naesteFoedselsdag <= nu) {
          naesteFoedselsdag.setFullYear(naesteFoedselsdag.getFullYear() + 1);
        }
        const dageTilFoedselsdag = Math.ceil(
          (naesteFoedselsdag.getTime() - nu.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          type: "alder" as const,
          aar,
          maaneder,
          dage,
          totalDage,
          totalUger,
          dageTilFoedselsdag,
          naesteFoedselsdag: formatDate(naesteFoedselsdag),
        };
      }

      default:
        return null;
    }
  }, [mode, startDato, slutDato, baseDato, antalDage, foedselsdato]);

  const modes = [
    {
      id: "dage-mellem" as BeregningsMode,
      label: "Dage mellem",
      desc: "Beregn dage mellem to datoer",
    },
    {
      id: "tilfoej-dage" as BeregningsMode,
      label: "Tilføj dage",
      desc: "Tilføj/træk dage fra en dato",
    },
    {
      id: "arbejdsdage" as BeregningsMode,
      label: "Arbejdsdage",
      desc: "Beregn arbejdsdage fremad",
    },
    {
      id: "alder" as BeregningsMode,
      label: "Alder",
      desc: "Beregn præcis alder",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Mode selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              mode === m.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <span className="font-medium block dark:text-gray-200">{m.label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        {mode === "dage-mellem" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Fra dato</label>
              <input
                type="date"
                value={startDato}
                onChange={(e) => setStartDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">Til dato</label>
              <input
                type="date"
                value={slutDato}
                onChange={(e) => setSlutDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {(mode === "tilfoej-dage" || mode === "arbejdsdage") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Udgangsdato
              </label>
              <input
                type="date"
                value={baseDato}
                onChange={(e) => setBaseDato(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Antal {mode === "arbejdsdage" ? "arbejdsdage" : "dage"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={antalDage}
                  onChange={(e) => setAntalDage(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-16 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">dage</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Brug negativ værdi for at trække fra
              </p>
            </div>
          </div>
        )}

        {mode === "alder" && (
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Fødselsdato
            </label>
            <input
              type="date"
              value={foedselsdato}
              onChange={(e) => setFoedselsdato(e.target.value)}
              className="w-full md:w-1/2 px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      {resultat && (
        <>
          {resultat.type === "dage-mellem" && (
            <div className="space-y-4">
              <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Antal dage</p>
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">
                  {resultat.dage}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {resultat.uger} uger og {Math.abs(resultat.dage) % 7} dage
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Uger</p>
                  <p className="text-2xl font-bold dark:text-gray-200">{resultat.uger}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ca. måneder</p>
                  <p className="text-2xl font-bold dark:text-gray-200">{resultat.maaneder}</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Arbejdsdage</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {resultat.arbejdsdage}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekenddage</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {resultat.weekenddage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {resultat.type === "tilfoej-dage" && (
            <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resultat</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 capitalize">
                {resultat.formatteret}
              </p>
            </div>
          )}

          {resultat.type === "arbejdsdage" && (
            <div className="space-y-4">
              <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {antalDage} arbejdsdage fra nu
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 capitalize">
                  {resultat.formatteret}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kalenderdage i alt</p>
                  <p className="text-2xl font-bold dark:text-gray-200">{resultat.samledeDage}</p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Weekenddage sprunget</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {resultat.weekenddage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {resultat.type === "alder" && (
            <div className="space-y-4">
              <div className="p-6 bg-blue-100 dark:bg-blue-900/20 rounded-xl text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Din alder</p>
                <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">
                  {resultat.aar} år
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {resultat.maaneder} måneder og {resultat.dage} dage
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total dage</p>
                  <p className="text-xl font-bold dark:text-gray-200">
                    {resultat.totalDage.toLocaleString("da-DK")}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total uger</p>
                  <p className="text-xl font-bold dark:text-gray-200">
                    {resultat.totalUger.toLocaleString("da-DK")}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Næste fødselsdag</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    Om {resultat.dageTilFoedselsdag} dage
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {resultat.naesteFoedselsdag}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex justify-center">
        <CopyResultButton text={
          resultat?.type === "dage-mellem" ? `${resultat.dage} dage mellem datoer` :
          resultat?.type === "tilfoej-dage" ? `${antalDage} dage tilføjet` :
          resultat?.type === "arbejdsdage" ? `${antalDage} arbejdsdage` :
          resultat?.type === "alder" ? `${resultat.aar} år, ${resultat.maaneder} mdr, ${resultat.dage} dage` :
          ""
        } />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Datoberegner"
          resultSummary={
            resultat?.type === "dage-mellem" ? `${resultat.dage} dage mellem datoer` :
            resultat?.type === "tilfoej-dage" ? `${antalDage} dage tilføjet` :
            resultat?.type === "arbejdsdage" ? `${antalDage} arbejdsdage` :
            resultat?.type === "alder" ? `${resultat.aar} år, ${resultat.maaneder} mdr, ${resultat.dage} dage` :
            undefined
          }
        />
      </div>
    </div>
  );
}
