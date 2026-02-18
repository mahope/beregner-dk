"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { OpsparingAffiliate } from "./AffiliateBox";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Frekvens = "maanedlig" | "kvartal" | "aarlig";
type Visning = "beregner" | "maal";

interface AarData {
  aar: number;
  saldo: number;
  indskud: number;
  rente: number;
}

function simulerOpsparing(
  startBeloeb: number,
  maanedligIndbetaling: number,
  aarligRentePct: number,
  periodeAar: number,
  renteFrekvens: Frekvens
): { slutSaldo: number; samletIndskud: number; samletRente: number; aarligData: AarData[] } {
  let perioderPerAar: number;
  let maanederPerPeriode: number;

  switch (renteFrekvens) {
    case "maanedlig":
      perioderPerAar = 12;
      maanederPerPeriode = 1;
      break;
    case "kvartal":
      perioderPerAar = 4;
      maanederPerPeriode = 3;
      break;
    case "aarlig":
    default:
      perioderPerAar = 1;
      maanederPerPeriode = 12;
  }

  const periodiskRente = aarligRentePct / 100 / perioderPerAar;
  const antalMaaneder = periodeAar * 12;

  let saldo = startBeloeb;
  let samletIndskud = startBeloeb;
  let samletRente = 0;
  const aarligData: AarData[] = [];

  for (let maaned = 1; maaned <= antalMaaneder; maaned++) {
    saldo += maanedligIndbetaling;
    samletIndskud += maanedligIndbetaling;

    if (maaned % maanederPerPeriode === 0) {
      const renteBeloeb = saldo * periodiskRente;
      saldo += renteBeloeb;
      samletRente += renteBeloeb;
    }

    if (maaned % 12 === 0) {
      aarligData.push({
        aar: maaned / 12,
        saldo,
        indskud: samletIndskud,
        rente: samletRente,
      });
    }
  }

  return { slutSaldo: saldo, samletIndskud, samletRente, aarligData };
}

function VaekstGraf({ aarligData }: { aarligData: AarData[] }) {
  if (aarligData.length === 0) return null;
  const maxSaldo = Math.max(...aarligData.map((d) => d.saldo));
  if (maxSaldo === 0) return null;

  // Show max ~15 bars
  const step = Math.max(1, Math.floor(aarligData.length / 15));
  const data = aarligData.filter((_, i) => i % step === 0 || i === aarligData.length - 1);

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3 dark:text-gray-200">Opsparingens vækst</h4>
      <div className="flex items-end gap-1 h-40">
        {data.map((d) => {
          const totalHeight = (d.saldo / maxSaldo) * 100;
          const indskudHeight = (d.indskud / maxSaldo) * 100;
          const renteHeight = totalHeight - indskudHeight;
          return (
            <div key={d.aar} className="flex-1 flex flex-col justify-end items-center" title={`År ${d.aar}`}>
              <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                <div
                  className="bg-green-400 dark:bg-green-500 rounded-t-sm w-full"
                  style={{ height: `${renteHeight}%` }}
                  title={`Rente: ${Math.round(d.rente).toLocaleString("da-DK")} kr`}
                />
                <div
                  className="bg-blue-400 dark:bg-blue-500 w-full"
                  style={{ height: `${indskudHeight}%` }}
                  title={`Indskud: ${Math.round(d.indskud).toLocaleString("da-DK")} kr`}
                />
              </div>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{d.aar}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-500 inline-block" /> Indskud
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-500 inline-block" /> Rente
        </span>
      </div>
    </div>
  );
}

export default function OpsparingsBeregner() {
  const [visning, setVisning] = useState<Visning>("beregner");

  // Beregner-inputs
  const [startBeloeb, setStartBeloeb] = useState<number>(10000);
  const [maanedligIndbetaling, setMaanedligIndbetaling] = useState<number>(1000);
  const [aarligRente, setAarligRente] = useState<number>(5);
  const [periode, setPeriode] = useState<number>(10);
  const [renteFrekvens, setRenteFrekvens] = useState<Frekvens>("aarlig");
  const [visInflation, setVisInflation] = useState(false);
  const [inflation, setInflation] = useState<number>(2);

  // Mål-inputs
  const [maalBeloeb, setMaalBeloeb] = useState<number>(500000);
  const [maalStart, setMaalStart] = useState<number>(10000);
  const [maalMaanedlig, setMaalMaanedlig] = useState<number>(1000);
  const [maalRente, setMaalRente] = useState<number>(5);

  const isLoading = useCalculationLoading([startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'opsparing') {
      const inputs = urlState.inputs;
      if (inputs.visning) setVisning(inputs.visning);
      if (inputs.startBeloeb !== undefined) setStartBeloeb(inputs.startBeloeb);
      if (inputs.maanedligIndbetaling !== undefined) setMaanedligIndbetaling(inputs.maanedligIndbetaling);
      if (inputs.aarligRente !== undefined) setAarligRente(inputs.aarligRente);
      if (inputs.periode !== undefined) setPeriode(inputs.periode);
      if (inputs.renteFrekvens) setRenteFrekvens(inputs.renteFrekvens);
      if (inputs.maalBeloeb !== undefined) setMaalBeloeb(inputs.maalBeloeb);
      if (inputs.maalStart !== undefined) setMaalStart(inputs.maalStart);
      if (inputs.maalMaanedlig !== undefined) setMaalMaanedlig(inputs.maalMaanedlig);
      if (inputs.maalRente !== undefined) setMaalRente(inputs.maalRente);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("opsparing");
    const timer = setTimeout(() => {
      trackCalculation("opsparing");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'opsparing',
      inputs: {
        visning, startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens,
        maalBeloeb, maalStart, maalMaanedlig, maalRente,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [visning, startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens,
      maalBeloeb, maalStart, maalMaanedlig, maalRente]);

  const beregning = useMemo(() => {
    if (periode <= 0) return null;
    return simulerOpsparing(startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens);
  }, [startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  // Scenarie-sammenligning
  const scenarier = useMemo(() => {
    if (periode <= 0) return null;
    const satser = [aarligRente, aarligRente + 2, aarligRente + 5].filter(r => r > 0 && r <= 30);
    return satser.map((r) => {
      const sim = simulerOpsparing(startBeloeb, maanedligIndbetaling, r, periode, renteFrekvens);
      return { rente: r, slutSaldo: sim.slutSaldo, samletRente: sim.samletRente };
    });
  }, [startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  // Inflations-justeret
  const realAfkast = useMemo(() => {
    if (!beregning || !visInflation) return null;
    const realRente = ((1 + aarligRente / 100) / (1 + inflation / 100) - 1) * 100;
    if (realRente <= -100) return null;
    const sim = simulerOpsparing(startBeloeb, maanedligIndbetaling, realRente, periode, renteFrekvens);
    return { realSaldo: sim.slutSaldo, realRente: realRente.toFixed(2) };
  }, [beregning, visInflation, inflation, startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  // "Hvor lang tid til mål?"
  const maalResultat = useMemo(() => {
    if (maalBeloeb <= maalStart || maalRente <= 0 || maalMaanedlig <= 0) return null;

    const maanedligRente = maalRente / 100 / 12;
    let saldo = maalStart;
    let maaneder = 0;
    const maxMaaneder = 600; // 50 år maks

    while (saldo < maalBeloeb && maaneder < maxMaaneder) {
      saldo += maalMaanedlig;
      saldo += saldo * maanedligRente;
      maaneder++;
    }

    if (maaneder >= maxMaaneder) return null;

    const aar = Math.floor(maaneder / 12);
    const restMaaneder = maaneder % 12;
    const samletIndskud = maalStart + maalMaanedlig * maaneder;

    return { aar, maaneder: restMaaneder, samletIndskud, samletRente: saldo - samletIndskud };
  }, [maalBeloeb, maalStart, maalMaanedlig, maalRente]);

  const formatKr = (beloeb: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(beloeb);
  };

  return (
    <div className="space-y-8">
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
          Beregn opsparing
        </button>
        <button
          onClick={() => setVisning("maal")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "maal"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          Nå et mål
        </button>
      </div>

      {visning === "beregner" ? (
        <>
          {/* Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Startbeløb (kr)"
                value={startBeloeb}
                onChange={setStartBeloeb}
                min={0}
                step={1000}
                unit="kr"
              />
              <InputField
                label="Månedlig indbetaling (kr)"
                value={maanedligIndbetaling}
                onChange={setMaanedligIndbetaling}
                min={0}
                step={100}
                unit="kr"
              />
            </div>
            <div className="space-y-4">
              <InputField
                label="Årlig rente (%)"
                value={aarligRente}
                onChange={setAarligRente}
                min={0}
                max={50}
                step={0.1}
              />
              <InputField
                label="Opsparingsperiode (år)"
                value={periode}
                onChange={setPeriode}
                min={1}
                max={50}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">
              Rentetilskrivning
            </label>
            <div className="flex gap-4">
              {([
                { id: "maanedlig" as Frekvens, label: "Månedlig" },
                { id: "kvartal" as Frekvens, label: "Kvartalsvis" },
                { id: "aarlig" as Frekvens, label: "Årlig" },
              ]).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setRenteFrekvens(f.id)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                    renteFrekvens === f.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inflation toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visInflation}
                onChange={(e) => setVisInflation(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm dark:text-gray-300">Vis inflations-justeret (real værdi)</span>
            </label>
            {visInflation && (
              <div className="w-24">
                <InputField
                  ariaLabel="Inflation procent"
                  value={inflation}
                  onChange={setInflation}
                  min={0}
                  max={20}
                  step={0.1}
                  inline
                />
              </div>
            )}
            {visInflation && <span className="text-sm text-gray-500 dark:text-gray-400">% inflation</span>}
          </div>

          {/* Resultat */}
          <CalculationLoading
            isLoading={isLoading}
            loadingText="Beregner din opsparing..."
            minHeight="250px"
          >
            {beregning && (
              <>
                <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Din opsparing efter {periode} år
                  </p>
                  <p className="text-5xl font-bold text-green-700 dark:text-green-400">
                    {formatKr(beregning.slutSaldo)}
                  </p>
                  {realAfkast && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Real værdi (efter {inflation}% inflation): <strong className="text-green-600 dark:text-green-400">{formatKr(realAfkast.realSaldo)}</strong>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Samlet indskud</p>
                    <p className="text-xl font-bold dark:text-white">{formatKr(beregning.samletIndskud)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Samlet rente</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatKr(beregning.samletRente)}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gevinst</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      +{((beregning.samletRente / beregning.samletIndskud) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Vækstgraf */}
                <VaekstGraf aarligData={beregning.aarligData} />

                {/* Scenarie-sammenligning */}
                {scenarier && scenarier.length > 1 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 dark:text-gray-200">Sammenligning af afkast</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {scenarier.map((s, i) => (
                        <div
                          key={s.rente}
                          className={`p-3 rounded-lg ${
                            i === 0
                              ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700"
                              : "bg-white dark:bg-gray-700"
                          }`}
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.rente}% p.a.</p>
                          <p className={`text-lg font-bold ${i === 0 ? "text-blue-700 dark:text-blue-400" : "dark:text-white"}`}>
                            {formatKr(s.slutSaldo)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            +{formatKr(s.samletRente)} rente
                          </p>
                        </div>
                      ))}
                    </div>
                    {scenarier.length >= 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        +{(scenarier[scenarier.length - 1].rente - scenarier[0].rente).toFixed(0)} procentpoint ekstra giver{" "}
                        {formatKr(scenarier[scenarier.length - 1].slutSaldo - scenarier[0].slutSaldo)} mere
                      </p>
                    )}
                  </div>
                )}

                {/* Årlig oversigt */}
                <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <summary className="p-4 cursor-pointer font-medium dark:text-white">
                    Se årlig udvikling
                  </summary>
                  <div className="p-4 pt-0 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b dark:border-gray-600">
                          <th className="py-2 pr-4 dark:text-gray-200">År</th>
                          <th className="py-2 pr-4 text-right dark:text-gray-200">Indskud</th>
                          <th className="py-2 pr-4 text-right dark:text-gray-200">Rente</th>
                          <th className="py-2 text-right dark:text-gray-200">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beregning.aarligData.map((row) => (
                          <tr key={row.aar} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-2 pr-4 dark:text-gray-300">{row.aar}</td>
                            <td className="py-2 pr-4 text-right dark:text-gray-300">{formatKr(row.indskud)}</td>
                            <td className="py-2 pr-4 text-right text-blue-600 dark:text-blue-400">
                              {formatKr(row.rente)}
                            </td>
                            <td className="py-2 text-right font-medium dark:text-white">
                              {formatKr(row.saldo)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>

                {/* Info box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-blue-200">Renters rente-effekten</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Med renters rente tjener du ikke kun rente på dit indskud, men også
                    på den rente du allerede har tjent. Over {periode} år giver dette
                    en ekstra gevinst på {formatKr(beregning.samletRente)} i rente
                    oveni dine indbetalinger på {formatKr(beregning.samletIndskud)}.
                  </p>
                </div>
              </>
            )}
          </CalculationLoading>

          {beregning && !isLoading && (
            <div className="flex justify-center gap-3">
              <CopyResultButton text={`${formatKr(beregning.slutSaldo)} efter ${periode} år`} />
              <ShareCalculation
                getShareableLink={getShareableLink}
                calculatorName="Opsparingsberegner"
                resultSummary={`${formatKr(beregning.slutSaldo)} efter ${periode} år`}
              />
            </div>
          )}

          {beregning && !isLoading && (
            <OpsparingAffiliate className="mt-6" />
          )}
        </>
      ) : (
        <>
          {/* "Nå et mål" beregner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label="Mål-beløb"
                value={maalBeloeb}
                onChange={setMaalBeloeb}
                min={1000}
                step={10000}
                unit="kr"
              />
              <InputField
                label="Startbeløb"
                value={maalStart}
                onChange={setMaalStart}
                min={0}
                step={1000}
                unit="kr"
              />
            </div>
            <div className="space-y-4">
              <InputField
                label="Månedlig indbetaling"
                value={maalMaanedlig}
                onChange={setMaalMaanedlig}
                min={100}
                step={100}
                unit="kr"
              />
              <InputField
                label="Forventet årlig rente (%)"
                value={maalRente}
                onChange={setMaalRente}
                min={0}
                max={30}
                step={0.1}
              />
            </div>
          </div>

          {/* Mål resultat */}
          {maalResultat ? (
            <>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Du når {formatKr(maalBeloeb)} på
                  </p>
                  <p className="text-5xl font-bold text-green-700 dark:text-green-400">
                    {maalResultat.aar > 0 && `${maalResultat.aar} år`}
                    {maalResultat.aar > 0 && maalResultat.maaneder > 0 && " og "}
                    {maalResultat.maaneder > 0 && `${maalResultat.maaneder} md.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Samlet indskud</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(maalResultat.samletIndskud)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tjent i rente</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatKr(maalResultat.samletRente)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <CopyResultButton text={`Når ${formatKr(maalBeloeb)} på ${maalResultat.aar} år og ${maalResultat.maaneder} md.`} />
                <ShareCalculation
                  getShareableLink={getShareableLink}
                  calculatorName="Opsparingsberegner"
                  resultSummary={`Når ${formatKr(maalBeloeb)} på ${maalResultat.aar} år og ${maalResultat.maaneder} md.`}
                />
              </div>
            </>
          ) : maalBeloeb > 0 && maalMaanedlig > 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <p className="text-yellow-700 dark:text-yellow-400">
                Målet kan ikke nås inden for 50 år med de angivne værdier. Prøv at øge indbetalingen eller renten.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
