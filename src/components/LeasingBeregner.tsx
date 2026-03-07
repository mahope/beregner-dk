'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

type VisningsType = 'leasing' | 'sammenlign';

export default function LeasingBeregner() {
  const [bilpris, setBilpris] = useState<string>('300000');
  const [restvaerdi, setRestvaerdi] = useState<string>('150000');
  const [loebetid, setLoebetid] = useState<string>('36');
  const [rente, setRente] = useState<string>('4.5');
  const [udbetaling, setUdbetaling] = useState<string>('30000');
  const [visning, setVisning] = useState<VisningsType>('leasing');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'leasing') {
      const inputs = urlState.inputs;
      if (inputs.bilpris !== undefined) setBilpris(inputs.bilpris);
      if (inputs.restvaerdi !== undefined) setRestvaerdi(inputs.restvaerdi);
      if (inputs.loebetid !== undefined) setLoebetid(inputs.loebetid);
      if (inputs.rente !== undefined) setRente(inputs.rente);
      if (inputs.udbetaling !== undefined) setUdbetaling(inputs.udbetaling);
      if (inputs.visning) setVisning(inputs.visning);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('leasing');
    const timer = setTimeout(() => {
      trackCalculation('leasing');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'leasing',
      inputs: { bilpris, restvaerdi, loebetid, rente, udbetaling, visning },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bilpris, restvaerdi, loebetid, rente, udbetaling, visning]);

  const handleReset = useCallback(() => {
    setBilpris('300000');
    setRestvaerdi('150000');
    setLoebetid('36');
    setRente('4.5');
    setUdbetaling('30000');
    setVisning('leasing');
  }, []);

  const result = useMemo(() => {
    const pris = parseFloat(bilpris) || 0;
    const rest = parseFloat(restvaerdi) || 0;
    const mdr = parseInt(loebetid) || 0;
    const r = (parseFloat(rente) || 0) / 100 / 12;
    const udb = parseFloat(udbetaling) || 0;

    if (pris <= 0 || mdr <= 0) return null;

    // Leasing: ydelse = ((pris - udb - rest) / mdr) + ((pris - udb + rest) / 2) * r
    const afskrivning = (pris - udb - rest) / mdr;
    const gennemsnitsGaeld = (pris - udb + rest) / 2;
    const renteBeloeb = gennemsnitsGaeld * r;
    const maanedligYdelse = afskrivning + renteBeloeb;
    const totalLeasing = udb + (maanedligYdelse * mdr);
    const totalRente = renteBeloeb * mdr;

    // Lån-sammenligning (annuitetslån for hele bilprisen minus udbetaling)
    const laanBeloeb = pris - udb;
    let maanedligLaan = 0;
    if (r > 0) {
      maanedligLaan = (laanBeloeb * r * Math.pow(1 + r, mdr)) / (Math.pow(1 + r, mdr) - 1);
    } else {
      maanedligLaan = laanBeloeb / mdr;
    }
    const totalLaan = udb + (maanedligLaan * mdr);

    // Kontantkøb: bilpris nu, men bil er rest-værd efter løbetiden
    const vaerdtab = pris - rest;
    const kontantMaanedlig = vaerdtab / mdr;

    return {
      maanedligYdelse: Math.round(maanedligYdelse),
      totalLeasing: Math.round(totalLeasing),
      totalRente: Math.round(totalRente),
      maanedligLaan: Math.round(maanedligLaan),
      totalLaan: Math.round(totalLaan),
      kontantMaanedlig: Math.round(kontantMaanedlig),
      vaerdtab: Math.round(vaerdtab),
      bilpris: pris,
      restvaerdiNum: rest,
    };
  }, [bilpris, restvaerdi, loebetid, rente, udbetaling]);

  const formatKr = (n: number) => n.toLocaleString('da-DK');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Bilpris</label>
            <div className="relative">
              <input type="number" value={bilpris} onChange={(e) => setBilpris(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Restværdi (ved leasingperiodens udløb)</label>
            <div className="relative">
              <input type="number" value={restvaerdi} onChange={(e) => setRestvaerdi(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Løbetid</label>
              <div className="relative">
                <input type="number" value={loebetid} onChange={(e) => setLoebetid(e.target.value)} className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">mdr</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Rente (ÅOP)</label>
              <div className="relative">
                <input type="number" step="0.1" value={rente} onChange={(e) => setRente(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Udbetaling</label>
            <div className="relative">
              <input type="number" value={udbetaling} onChange={(e) => setUdbetaling(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
          </div>

          <div>
            <div className="flex gap-4">
              <button onClick={() => setVisning('leasing')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${visning === 'leasing' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:text-gray-200'}`}>
                Leasingberegning
              </button>
              <button onClick={() => setVisning('sammenlign')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${visning === 'sammenlign' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:text-gray-200'}`}>
                Sammenlign
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {visning === 'leasing' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leasingberegning</h3>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Månedlig leasingydelse</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatKr(result.maanedligYdelse)} kr.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Samlet leasingudgift</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{formatKr(result.totalLeasing)} kr.</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Heraf renter</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatKr(result.totalRente)} kr.</div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Bilpris</span><span className="dark:text-gray-200">{formatKr(result.bilpris)} kr.</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Restværdi</span><span className="dark:text-gray-200">{formatKr(result.restvaerdiNum)} kr.</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Værditab (du betaler for)</span><span className="font-medium dark:text-gray-200">{formatKr(result.vaerdtab)} kr.</span></div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Leasing vs. Lån vs. Kontant</h3>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Leasing</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatKr(result.maanedligYdelse)} kr./md</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total: {formatKr(result.totalLeasing)} kr. (du ejer ikke bilen)</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">Billån</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatKr(result.maanedligLaan)} kr./md</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total: {formatKr(result.totalLaan)} kr. (du ejer bilen)</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Kontantkøb</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatKr(result.kontantMaanedlig)} kr./md*</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">*Værditab fordelt over perioden. Ingen renter.</div>
                    </div>
                  </div>
                </>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                * Vejledende beregning. Faktisk leasingydelse kan variere med gebyrer og vilkår.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">🚗</div>
              <p>Indtast bilpris og vilkår for at se beregningen</p>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `Leasing: ${formatKr(result.maanedligYdelse)} kr./md — Lån: ${formatKr(result.maanedligLaan)} kr./md` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Leasing Beregner"
          resultSummary={result ? `Leasing: ${formatKr(result.maanedligYdelse)} kr./md` : ''}
        />
      </div>

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Privat leasing</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Ved privat leasing lejer du bilen i en fast periode. Du betaler for bilens værditab plus renter, men ejer ikke bilen. Ved periodens udløb afleverer du bilen.
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Erhvervsleasing</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            Ved erhvervsleasing kan leasingydelsen fradrages som driftsudgift. Momsen på ydelsen kan også fradrages. Det gør leasing ofte fordelagtigt for virksomheder.
          </p>
        </div>
      </div>
    </div>
  );
}
