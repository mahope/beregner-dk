'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

interface GaeldsPost {
  id: number;
  navn: string;
  gaeld: string;
  rente: string;
  minAfdrag: string;
}

type Metode = 'lavine' | 'snebold';

export default function GaeldsfriBeregner() {
  const [poster, setPoster] = useState<GaeldsPost[]>([
    { id: 1, navn: 'Forbrugslån', gaeld: '', rente: '', minAfdrag: '' },
  ]);
  const [ekstraAfdrag, setEkstraAfdrag] = useState<string>('');
  const [metode, setMetode] = useState<Metode>('lavine');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'gaeldsfri') {
      const inputs = urlState.inputs;
      if (inputs.poster) setPoster(inputs.poster);
      if (inputs.ekstraAfdrag !== undefined) setEkstraAfdrag(inputs.ekstraAfdrag);
      if (inputs.metode) setMetode(inputs.metode);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('gaeldsfri');
    const timer = setTimeout(() => {
      trackCalculation('gaeldsfri');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'gaeldsfri',
      inputs: { poster, ekstraAfdrag, metode },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [poster, ekstraAfdrag, metode]);

  const handleReset = useCallback(() => {
    setPoster([{ id: 1, navn: 'Forbrugslån', gaeld: '', rente: '', minAfdrag: '' }]);
    setEkstraAfdrag('');
    setMetode('lavine');
  }, []);

  const addPost = () => {
    const newId = Math.max(...poster.map(p => p.id), 0) + 1;
    setPoster([...poster, { id: newId, navn: '', gaeld: '', rente: '', minAfdrag: '' }]);
  };

  const removePost = (id: number) => {
    if (poster.length > 1) setPoster(poster.filter(p => p.id !== id));
  };

  const updatePost = (id: number, field: keyof Omit<GaeldsPost, 'id'>, value: string) => {
    setPoster(poster.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const result = useMemo(() => {
    const aktive = poster
      .map(p => ({
        navn: p.navn || `Gæld ${p.id}`,
        gaeld: parseFloat(p.gaeld) || 0,
        rente: (parseFloat(p.rente) || 0) / 100 / 12,
        minAfdrag: parseFloat(p.minAfdrag) || 0,
      }))
      .filter(p => p.gaeld > 0 && p.minAfdrag > 0);

    if (aktive.length === 0) return null;

    const samletGaeld = aktive.reduce((s, p) => s + p.gaeld, 0);
    const samletMinAfdrag = aktive.reduce((s, p) => s + p.minAfdrag, 0);
    const ekstra = parseFloat(ekstraAfdrag) || 0;

    // Simuler afbetaling
    function simuler(sortFn: (a: typeof aktive[0], b: typeof aktive[0]) => number) {
      const balancer = aktive.map(p => ({ ...p, balance: p.gaeld }));
      let totalRente = 0;
      let maaneder = 0;
      const maxMaaneder = 600; // 50 år safety

      while (balancer.some(b => b.balance > 0) && maaneder < maxMaaneder) {
        maaneder++;

        // Tilskriv renter
        for (const b of balancer) {
          if (b.balance > 0) {
            const renteBeloeb = b.balance * b.rente;
            b.balance += renteBeloeb;
            totalRente += renteBeloeb;
          }
        }

        // Betal minimum på alle
        for (const b of balancer) {
          if (b.balance > 0) {
            const betaling = Math.min(b.balance, b.minAfdrag);
            b.balance -= betaling;
          }
        }

        // Fordel ekstra afdrag efter valgt metode
        let restEkstra = ekstra;
        const sorteret = [...balancer].filter(b => b.balance > 0).sort(sortFn);
        for (const b of sorteret) {
          if (restEkstra <= 0 || b.balance <= 0) continue;
          const betaling = Math.min(b.balance, restEkstra);
          b.balance -= betaling;
          restEkstra -= betaling;
        }
      }

      return { maaneder, totalRente: Math.round(totalRente), samletBetalt: Math.round(samletGaeld + totalRente) };
    }

    // Lavine: højeste rente først
    const lavine = simuler((a, b) => b.rente - a.rente);
    // Snebold: laveste saldo først
    const snebold = simuler((a, b) => a.gaeld - b.gaeld);

    const valgt = metode === 'lavine' ? lavine : snebold;
    const aar = Math.floor(valgt.maaneder / 12);
    const mdr = valgt.maaneder % 12;

    // Uden ekstra afdrag
    const udenEkstra = ekstra > 0 ? simuler(() => 0) : null;
    // Med ekstra beregnet separat for at vise forskel
    const besparelseRente = udenEkstra ? udenEkstra.totalRente - valgt.totalRente : 0;
    const besparelseMdr = udenEkstra ? udenEkstra.maaneder - valgt.maaneder : 0;

    return {
      samletGaeld,
      samletMinAfdrag,
      ekstra,
      lavine,
      snebold,
      valgt,
      aar,
      mdr,
      besparelseRente,
      besparelseMdr,
    };
  }, [poster, ekstraAfdrag, metode]);

  const formatKr = (n: number) => n.toLocaleString('da-DK');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      {/* Input */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Dine gældsposter
        </label>
        <div className="space-y-3">
          {poster.map((post, idx) => (
            <div key={post.id} className="flex flex-wrap gap-2 items-end">
              <div className="w-full sm:w-auto sm:flex-1">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">Navn</span>}
                <input
                  type="text"
                  value={post.navn}
                  onChange={(e) => updatePost(post.id, 'navn', e.target.value)}
                  placeholder="F.eks. Forbrugslån"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">Gæld (kr.)</span>}
                <div className="relative">
                  <input type="number" value={post.gaeld} onChange={(e) => updatePost(post.id, 'gaeld', e.target.value)} placeholder="50.000" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
                </div>
              </div>
              <div className="w-20">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">Rente</span>}
                <div className="relative">
                  <input type="number" step="0.1" value={post.rente} onChange={(e) => updatePost(post.id, 'rente', e.target.value)} placeholder="8" className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                </div>
              </div>
              <div className="flex-1 min-w-[100px]">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">Min. afdrag/md</span>}
                <div className="relative">
                  <input type="number" value={post.minAfdrag} onChange={(e) => updatePost(post.id, 'minAfdrag', e.target.value)} placeholder="1.500" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
                </div>
              </div>
              {poster.length > 1 && (
                <button onClick={() => removePost(post.id)} className="px-2 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">
                  ✕
                </button>
              )}
            </div>
          ))}
          <button onClick={addPost} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            + Tilføj gældspost
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Ekstra afdrag pr. måned</label>
            <div className="relative">
              <input type="number" value={ekstraAfdrag} onChange={(e) => setEkstraAfdrag(e.target.value)} placeholder="0" className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Beløb ud over minimum der går til gældsafvikling</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Afviklingsmetode</label>
            <div className="flex gap-3">
              <button onClick={() => setMetode('lavine')} className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${metode === 'lavine' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
                Lavine
              </button>
              <button onClick={() => setMetode('snebold')} className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${metode === 'snebold' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
                Snebold
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <ResetButton onReset={handleReset} />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 animate-fade-in space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Din gældsafvikling</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Samlet gæld</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{formatKr(result.samletGaeld)} kr.</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Gældsfri om</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {result.aar > 0 ? `${result.aar} år` : ''}{result.aar > 0 && result.mdr > 0 ? ' ' : ''}{result.mdr > 0 ? `${result.mdr} mdr` : ''}
                {result.aar === 0 && result.mdr === 0 ? '0 mdr' : ''}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Samlet rente</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatKr(result.valgt.totalRente)} kr.</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total betalt</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{formatKr(result.valgt.samletBetalt)} kr.</div>
            </div>
          </div>

          {result.ekstra > 0 && result.besparelseMdr > 0 && (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
              <div className="text-sm text-green-800 dark:text-green-300">
                <strong>Effekt af ekstra afdrag ({formatKr(result.ekstra)} kr./md):</strong>
              </div>
              <div className="text-sm text-green-700 dark:text-green-400 mt-1">
                Du sparer {formatKr(result.besparelseRente)} kr. i renter og bliver gældsfri {result.besparelseMdr} måneder tidligere.
              </div>
            </div>
          )}

          {/* Metode sammenligning */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm">
            <div className="font-medium mb-2 dark:text-gray-200">Lavine vs. Snebold</div>
            <div className="grid grid-cols-2 gap-4">
              <div className={metode === 'lavine' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}>
                <div className="text-blue-600 dark:text-blue-400">Lavine (højeste rente først)</div>
                <div className="dark:text-gray-200">{Math.floor(result.lavine.maaneder / 12)} år {result.lavine.maaneder % 12} mdr</div>
                <div className="text-red-500">Rente: {formatKr(result.lavine.totalRente)} kr.</div>
              </div>
              <div className={metode === 'snebold' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}>
                <div className="text-purple-600 dark:text-purple-400">Snebold (laveste saldo først)</div>
                <div className="dark:text-gray-200">{Math.floor(result.snebold.maaneder / 12)} år {result.snebold.maaneder % 12} mdr</div>
                <div className="text-red-500">Rente: {formatKr(result.snebold.totalRente)} kr.</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <div className="text-4xl mb-3">🎯</div>
          <p>Indtast din gæld for at se afviklingsplanen</p>
        </div>
      )}

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `Gældsfri om ${result.aar} år ${result.mdr} mdr — samlet rente: ${formatKr(result.valgt.totalRente)} kr.` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Gældsfri Beregner"
          resultSummary={result ? `Gældsfri om ${result.aar} år ${result.mdr} mdr` : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Lavine-metoden</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Betal ekstra afdrag på gælden med den højeste rente først. Matematisk den billigste metode — du sparer mest i renter.
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Snebold-metoden</h4>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            Betal ekstra afdrag på den mindste gæld først. Giver hurtigere &quot;sejre&quot; og kan motivere dig til at holde fast i planen.
          </p>
        </div>
      </div>
    </div>
  );
}
