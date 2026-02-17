"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BoliglaanAffiliate } from "./AffiliateBox";
import { PrintResult } from "./PrintResult";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";

type LaanType = "fastforrentet" | "variabel" | "afdragsfrit";
type Visning = "beregner" | "raadtil";

interface AarsOversigt {
  aar: number;
  afdrag: number;
  renter: number;
  ydelse: number;
  restgaeld: number;
}

function genererAmortiseringsplan(
  laanBeloeb: number,
  maanedligRente: number,
  maanedligYdelse: number,
  antalBetalinger: number,
  laanType: LaanType
): AarsOversigt[] {
  const plan: AarsOversigt[] = [];
  let restgaeld = laanBeloeb;
  let aarAfdrag = 0;
  let aarRenter = 0;
  let aarYdelse = 0;

  for (let i = 1; i <= antalBetalinger; i++) {
    const renteBetaling = restgaeld * maanedligRente;
    let afdragBetaling: number;

    if (laanType === "afdragsfrit") {
      afdragBetaling = 0;
    } else {
      afdragBetaling = maanedligYdelse - renteBetaling;
    }

    restgaeld = Math.max(0, restgaeld - afdragBetaling);
    aarAfdrag += afdragBetaling;
    aarRenter += renteBetaling;
    aarYdelse += maanedligYdelse;

    if (i % 12 === 0) {
      plan.push({
        aar: i / 12,
        afdrag: Math.round(aarAfdrag),
        renter: Math.round(aarRenter),
        ydelse: Math.round(aarYdelse),
        restgaeld: Math.round(restgaeld),
      });
      aarAfdrag = 0;
      aarRenter = 0;
      aarYdelse = 0;
    }
  }

  return plan;
}

export default function BoliglaanBeregner() {
  const [visning, setVisning] = useState<Visning>("beregner");

  // Beregner-inputs
  const [boligpris, setBoligpris] = useState<number>(3000000);
  const [udbetaling, setUdbetaling] = useState<number>(150000);
  const [rente, setRente] = useState<number>(4.5);
  const [loebetid, setLoebetid] = useState<number>(30);
  const [laanType, setLaanType] = useState<LaanType>("fastforrentet");
  const [bidragssats, setBidragssats] = useState<number>(0.75);

  // Boligomkostninger
  const [ejendomsskat, setEjendomsskat] = useState<number>(1500);
  const [forsikring, setForsikring] = useState<number>(500);
  const [ejerforening, setEjerforening] = useState<number>(0);

  // Amortiseringsplan toggle
  const [visAmortisering, setVisAmortisering] = useState(false);

  // "Hvad har jeg råd til?" inputs
  const [maanedligtBudget, setMaanedligtBudget] = useState<number>(12000);
  const [raadRente, setRaadRente] = useState<number>(4.5);
  const [raadLoebetid, setRaadLoebetid] = useState<number>(30);
  const [raadBidrag, setRaadBidrag] = useState<number>(0.75);
  const [raadUdbetaling, setRaadUdbetaling] = useState<number>(200000);

  // Loading state
  const isLoading = useCalculationLoading([boligpris, udbetaling, rente, loebetid, laanType, bidragssats, ejendomsskat, forsikring, ejerforening]);

  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'boliglaan') {
      const inputs = urlState.inputs;
      if (inputs.visning) setVisning(inputs.visning);
      if (inputs.boligpris !== undefined) setBoligpris(inputs.boligpris);
      if (inputs.udbetaling !== undefined) setUdbetaling(inputs.udbetaling);
      if (inputs.rente !== undefined) setRente(inputs.rente);
      if (inputs.loebetid !== undefined) setLoebetid(inputs.loebetid);
      if (inputs.laanType) setLaanType(inputs.laanType);
      if (inputs.bidragssats !== undefined) setBidragssats(inputs.bidragssats);
      if (inputs.ejendomsskat !== undefined) setEjendomsskat(inputs.ejendomsskat);
      if (inputs.forsikring !== undefined) setForsikring(inputs.forsikring);
      if (inputs.ejerforening !== undefined) setEjerforening(inputs.ejerforening);
      if (inputs.maanedligtBudget !== undefined) setMaanedligtBudget(inputs.maanedligtBudget);
      if (inputs.raadRente !== undefined) setRaadRente(inputs.raadRente);
      if (inputs.raadLoebetid !== undefined) setRaadLoebetid(inputs.raadLoebetid);
      if (inputs.raadBidrag !== undefined) setRaadBidrag(inputs.raadBidrag);
      if (inputs.raadUdbetaling !== undefined) setRaadUdbetaling(inputs.raadUdbetaling);
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'boliglaan',
      inputs: {
        visning, boligpris, udbetaling, rente, loebetid, laanType, bidragssats,
        ejendomsskat, forsikring, ejerforening,
        maanedligtBudget, raadRente, raadLoebetid, raadBidrag, raadUdbetaling,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [visning, boligpris, udbetaling, rente, loebetid, laanType, bidragssats,
      ejendomsskat, forsikring, ejerforening,
      maanedligtBudget, raadRente, raadLoebetid, raadBidrag, raadUdbetaling]);

  const resultat = useMemo(() => {
    const laanBeloeb = boligpris - udbetaling;

    if (laanBeloeb <= 0 || rente <= 0 || loebetid <= 0) {
      return null;
    }

    const antalBetalinger = loebetid * 12;
    const samletRente = rente + bidragssats;
    const maanedligRente = samletRente / 100 / 12;

    let maanedligYdelse: number;
    if (laanType === "afdragsfrit") {
      maanedligYdelse = laanBeloeb * maanedligRente;
    } else {
      maanedligYdelse =
        (laanBeloeb * maanedligRente * Math.pow(1 + maanedligRente, antalBetalinger)) /
        (Math.pow(1 + maanedligRente, antalBetalinger) - 1);
    }

    const samletBetaling = maanedligYdelse * antalBetalinger;
    const samletRenter = samletBetaling - laanBeloeb;
    const aarligYdelse = maanedligYdelse * 12;

    const foersteAarsRenter = laanBeloeb * (samletRente / 100);
    const skattefradrag = foersteAarsRenter * 0.256;
    const aarligYdelseEfterSkat = aarligYdelse - skattefradrag;
    const maanedligYdelseEfterSkat = aarligYdelseEfterSkat / 12;

    const belaaningsgrad = (laanBeloeb / boligpris) * 100;

    let vurdering: { tekst: string; farve: string };
    if (belaaningsgrad > 95) {
      vurdering = {
        tekst: "Meget høj belåning - de fleste banker kræver mindst 5% udbetaling",
        farve: "text-red-600",
      };
    } else if (belaaningsgrad > 80) {
      vurdering = {
        tekst: "Over 80% belåning kræver bankgaranti eller tillægslån med højere rente",
        farve: "text-yellow-600",
      };
    } else if (belaaningsgrad > 60) {
      vurdering = {
        tekst: "Normal belåningsgrad - du får adgang til realkreditlån op til 80%",
        farve: "text-green-600",
      };
    } else {
      vurdering = {
        tekst: "Lav belåningsgrad - du får de bedste vilkår og laveste bidragssats",
        farve: "text-green-700",
      };
    }

    // Samlede boligomkostninger
    const maanedligeOmkostninger = Math.round(maanedligYdelse) + ejendomsskat + forsikring + ejerforening;
    const maanedligeOmkostningerEfterSkat = Math.round(maanedligYdelseEfterSkat) + ejendomsskat + forsikring + ejerforening;

    // Amortiseringsplan
    const amortisering = genererAmortiseringsplan(
      laanBeloeb, maanedligRente, maanedligYdelse, antalBetalinger, laanType
    );

    return {
      laanBeloeb,
      maanedligYdelse: Math.round(maanedligYdelse),
      maanedligYdelseEfterSkat: Math.round(maanedligYdelseEfterSkat),
      aarligYdelse: Math.round(aarligYdelse),
      samletBetaling: Math.round(samletBetaling),
      samletRenter: Math.round(samletRenter),
      skattefradrag: Math.round(skattefradrag),
      belaaningsgrad: belaaningsgrad.toFixed(1),
      vurdering,
      maanedligeOmkostninger,
      maanedligeOmkostningerEfterSkat,
      amortisering,
    };
  }, [boligpris, udbetaling, rente, loebetid, laanType, bidragssats, ejendomsskat, forsikring, ejerforening]);

  // Omvendt beregning: "Hvad har jeg råd til?"
  const raadTilResultat = useMemo(() => {
    if (maanedligtBudget <= 0 || raadRente <= 0 || raadLoebetid <= 0) return null;

    const samletRente = raadRente + raadBidrag;
    const maanedligRente = samletRente / 100 / 12;
    const antalBetalinger = raadLoebetid * 12;

    // Omvendt annuitetsberegning: lån = ydelse * ((1+r)^n - 1) / (r * (1+r)^n)
    const faktor = (Math.pow(1 + maanedligRente, antalBetalinger) - 1) /
      (maanedligRente * Math.pow(1 + maanedligRente, antalBetalinger));
    const maxLaan = maanedligtBudget * faktor;
    const maxBoligpris = maxLaan + raadUdbetaling;
    const samletBetaling = maanedligtBudget * antalBetalinger;

    return {
      maxLaan: Math.round(maxLaan),
      maxBoligpris: Math.round(maxBoligpris),
      samletBetaling: Math.round(samletBetaling),
      samletRenter: Math.round(samletBetaling - maxLaan),
    };
  }, [maanedligtBudget, raadRente, raadLoebetid, raadBidrag, raadUdbetaling]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 print-area">
      {/* Visning toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button
          onClick={() => setVisning("beregner")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "beregner"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Beregn ydelse
        </button>
        <button
          onClick={() => setVisning("raadtil")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "raadtil"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Hvad har jeg råd til?
        </button>
      </div>

      {visning === "beregner" ? (
        <>
          {/* Boliglån input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Boligpris"
                value={boligpris}
                onChange={setBoligpris}
                min={100000}
                max={50000000}
                step={50000}
                unit="kr"
                helpText={formatKr(boligpris)}
              />

              <InputField
                label="Udbetaling"
                value={udbetaling}
                onChange={setUdbetaling}
                min={0}
                max={boligpris}
                step={10000}
                unit="kr"
                helpText={`${formatKr(udbetaling)} (${((udbetaling / boligpris) * 100).toFixed(1)}%)`}
              />

              <InputField
                label="Rente (% p.a.)"
                value={rente}
                onChange={setRente}
                min={0}
                max={15}
                step={0.1}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Løbetid (år)</label>
                <select
                  value={loebetid}
                  onChange={(e) => setLoebetid(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="10">10 år</option>
                  <option value="15">15 år</option>
                  <option value="20">20 år</option>
                  <option value="25">25 år</option>
                  <option value="30">30 år</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Låntype</label>
                <div className="flex flex-col gap-2">
                  {([
                    { type: "fastforrentet" as LaanType, label: "Fastforrentet" },
                    { type: "variabel" as LaanType, label: "Variabel rente (F-kort)" },
                    { type: "afdragsfrit" as LaanType, label: "Afdragsfrit (10 år)" },
                  ]).map(({ type, label }) => (
                    <button
                      key={type}
                      onClick={() => setLaanType(type)}
                      className={`py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                        laanType === type
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                label="Bidragssats (% p.a.)"
                value={bidragssats}
                onChange={setBidragssats}
                min={0}
                max={3}
                step={0.05}
                helpText="Typisk 0.5-1.5% afhængigt af belåningsgrad"
              />
            </div>
          </div>

          {/* Boligomkostninger */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3 dark:text-white">Øvrige boligomkostninger (pr. måned)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Ejendomsskat"
                value={ejendomsskat}
                onChange={setEjendomsskat}
                min={0}
                max={20000}
                step={100}
                unit="kr"
              />
              <InputField
                label="Forsikring"
                value={forsikring}
                onChange={setForsikring}
                min={0}
                max={10000}
                step={100}
                unit="kr"
              />
              <InputField
                label="Ejerforening"
                value={ejerforening}
                onChange={setEjerforening}
                min={0}
                max={20000}
                step={100}
                unit="kr"
              />
            </div>
          </div>

          {/* Resultat */}
          <CalculationLoading
            isLoading={isLoading}
            loadingText="Beregner din boligydelse..."
            minHeight="300px"
          >
            {resultat && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Månedlig ydelse</p>
                  <p className="text-5xl font-bold text-blue-600">
                    {formatKr(resultat.maanedligYdelse)}
                  </p>
                  <p className="text-lg text-green-600 mt-2">
                    Ca. {formatKr(resultat.maanedligYdelseEfterSkat)} efter skattefradrag
                  </p>
                </div>

                {/* Samlede boligomkostninger */}
                {(ejendomsskat > 0 || forsikring > 0 || ejerforening > 0) && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-2">
                      Samlede månedlige boligomkostninger
                    </p>
                    <p className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400">
                      {formatKr(resultat.maanedligeOmkostninger)}
                    </p>
                    <p className="text-sm text-green-600 text-center mt-1">
                      Ca. {formatKr(resultat.maanedligeOmkostningerEfterSkat)} efter skattefradrag
                    </p>
                    <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Ydelse: {formatKr(resultat.maanedligYdelse)}</span>
                      {ejendomsskat > 0 && <span>Skat: {formatKr(ejendomsskat)}</span>}
                      {forsikring > 0 && <span>Forsikring: {formatKr(forsikring)}</span>}
                      {ejerforening > 0 && <span>Ejerforening: {formatKr(ejerforening)}</span>}
                    </div>
                  </div>
                )}

                <div className={`text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 mb-6 ${resultat.vurdering.farve}`}>
                  <p className="font-medium">{resultat.belaaningsgrad}% belåning</p>
                  <p className="text-sm mt-1">{resultat.vurdering.tekst}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lånebeløb</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(resultat.laanBeloeb)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Årlig ydelse</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(resultat.aarligYdelse)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Skattefradrag/år</p>
                    <p className="font-bold text-lg text-green-600">-{formatKr(resultat.skattefradrag)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Samlet betaling</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(resultat.samletBetaling)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Heraf renter</p>
                    <p className="font-bold text-lg text-red-600">{formatKr(resultat.samletRenter)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Samlet rente</p>
                    <p className="font-bold text-lg dark:text-white">{(rente + bidragssats).toFixed(2)}% p.a.</p>
                  </div>
                </div>

                {/* Afdrag vs rente fordeling (visuelt) */}
                {laanType !== "afdragsfrit" && resultat.amortisering.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 dark:text-gray-200">Afdrag vs. rente over tid</h4>
                    <div className="space-y-1.5">
                      {resultat.amortisering
                        .filter((_, i) => i % Math.max(1, Math.floor(resultat.amortisering.length / 10)) === 0 || i === resultat.amortisering.length - 1)
                        .map((aar) => {
                          const total = aar.afdrag + aar.renter;
                          const afdragPct = total > 0 ? (aar.afdrag / total) * 100 : 0;
                          return (
                            <div key={aar.aar} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">År {aar.aar}</span>
                              <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                                <div
                                  className="bg-blue-500 transition-all"
                                  style={{ width: `${afdragPct}%` }}
                                  title={`Afdrag: ${formatKr(aar.afdrag)}`}
                                />
                                <div
                                  className="bg-red-400 transition-all"
                                  style={{ width: `${100 - afdragPct}%` }}
                                  title={`Renter: ${formatKr(aar.renter)}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Afdrag
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Renter
                      </span>
                    </div>
                  </div>
                )}

                {/* Amortiseringsplan */}
                <div className="mt-6">
                  <button
                    onClick={() => setVisAmortisering(!visAmortisering)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {visAmortisering ? "Skjul amortiseringsplan" : "Vis amortiseringsplan (år for år)"}
                  </button>

                  {visAmortisering && resultat.amortisering.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b dark:border-gray-600">
                            <th className="text-left py-2 px-2 dark:text-gray-200">År</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">Ydelse</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">Afdrag</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">Renter</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">Restgæld</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultat.amortisering.map((aar) => (
                            <tr key={aar.aar} className="border-b dark:border-gray-700">
                              <td className="py-2 px-2 dark:text-gray-300">{aar.aar}</td>
                              <td className="text-right py-2 px-2 dark:text-gray-300">{formatKr(aar.ydelse)}</td>
                              <td className="text-right py-2 px-2 text-blue-600 dark:text-blue-400">{formatKr(aar.afdrag)}</td>
                              <td className="text-right py-2 px-2 text-red-600 dark:text-red-400">{formatKr(aar.renter)}</td>
                              <td className="text-right py-2 px-2 font-medium dark:text-gray-300">{formatKr(aar.restgaeld)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Share and Print buttons */}
                <div className="mt-6 flex justify-center gap-3">
                  <ShareCalculation
                    getShareableLink={getShareableLink}
                    calculatorName="Boliglån Beregner"
                    resultSummary={`Lån: ${formatKr(resultat.laanBeloeb)} • Ydelse: ${formatKr(resultat.maanedligYdelse)}/md`}
                  />
                  <PrintResult
                    calculatorName="Boliglån Beregner"
                    resultSummary={`Lån: ${formatKr(resultat.laanBeloeb)} • Ydelse: ${formatKr(resultat.maanedligYdelse)}/md`}
                  />
                </div>
              </div>
            )}
          </CalculationLoading>

          {/* Affiliate box */}
          {resultat && !isLoading && (
            <BoliglaanAffiliate className="mt-6" />
          )}
        </>
      ) : (
        <>
          {/* "Hvad har jeg råd til?" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Månedligt budget til ydelse"
                value={maanedligtBudget}
                onChange={setMaanedligtBudget}
                min={1000}
                max={100000}
                step={500}
                unit="kr"
              />

              <InputField
                label="Udbetaling du har"
                value={raadUdbetaling}
                onChange={setRaadUdbetaling}
                min={0}
                max={10000000}
                step={10000}
                unit="kr"
              />
            </div>

            <div className="space-y-4">
              <InputField
                label="Forventet rente (% p.a.)"
                value={raadRente}
                onChange={setRaadRente}
                min={0}
                max={15}
                step={0.1}
              />

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">Løbetid (år)</label>
                <select
                  value={raadLoebetid}
                  onChange={(e) => setRaadLoebetid(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="10">10 år</option>
                  <option value="15">15 år</option>
                  <option value="20">20 år</option>
                  <option value="25">25 år</option>
                  <option value="30">30 år</option>
                </select>
              </div>

              <InputField
                label="Bidragssats (% p.a.)"
                value={raadBidrag}
                onChange={setRaadBidrag}
                min={0}
                max={3}
                step={0.05}
              />
            </div>
          </div>

          {/* Råd til resultat */}
          {raadTilResultat && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Du har råd til en bolig op til</p>
                <p className="text-5xl font-bold text-blue-600">
                  {formatKr(raadTilResultat.maxBoligpris)}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  Med et lån på {formatKr(raadTilResultat.maxLaan)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Månedlig ydelse</p>
                  <p className="font-bold text-lg dark:text-white">{formatKr(maanedligtBudget)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Udbetaling</p>
                  <p className="font-bold text-lg dark:text-white">{formatKr(raadUdbetaling)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Samlet betaling</p>
                  <p className="font-bold text-lg dark:text-white">{formatKr(raadTilResultat.samletBetaling)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Heraf renter</p>
                  <p className="font-bold text-lg text-red-600">{formatKr(raadTilResultat.samletRenter)}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Beregningen er vejledende. Kontakt din bank for en præcis vurdering af din lånekapacitet.
              </p>
            </div>
          )}

          {raadTilResultat && (
            <div className="flex justify-center">
              <ShareCalculation
                getShareableLink={getShareableLink}
                calculatorName="Boliglån Beregner"
                resultSummary={`Råd til bolig op til ${formatKr(raadTilResultat.maxBoligpris)}`}
              />
            </div>
          )}
        </>
      )}

      {/* Aktuelle renter */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-blue-800 dark:text-blue-200">Typiske renter (februar 2026)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">4% fast (30 år)</span>
            <p className="dark:text-gray-300">ca. 3.5-4.0%</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">5% fast (30 år)</span>
            <p className="dark:text-gray-300">ca. 4.5-5.0%</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">F-kort</span>
            <p className="dark:text-gray-300">ca. 3.5-4.0%</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">Banklån</span>
            <p className="dark:text-gray-300">ca. 5.0-7.0%</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">Renterne er vejledende. Kontakt din bank for aktuelle tilbud.</p>
      </div>
    </div>
  );
}
