'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { useLocale } from "@/components/LocaleProvider";

interface GaeldsPost {
  id: number;
  navn: string;
  gaeld: string;
  rente: string;
  minAfdrag: string;
}

type Metode = 'lavine' | 'snebold';

export default function GaeldsfriBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      dineGaeldsposter: "Dine g\u00e6ldsposter",
      navn: "Navn",
      gaeld: "G\u00e6ld (kr.)",
      rente: "Rente",
      minAfdragMd: "Min. afdrag/md",
      placeholder: "F.eks. Forbrugsl\u00e5n",
      tilfoejGaeldspost: "+ Tilf\u00f8j g\u00e6ldspost",
      ekstraAfdragLabel: "Ekstra afdrag pr. m\u00e5ned",
      ekstraAfdragHint: "Bel\u00f8b ud over minimum der g\u00e5r til g\u00e6ldsafvikling",
      afviklingsmetode: "Afviklingsmetode",
      lavine: "Lavine",
      snebold: "Snebold",
      dinGaeldsafvikling: "Din g\u00e6ldsafvikling",
      samletGaeld: "Samlet g\u00e6ld",
      gaeldsfriOm: "G\u00e6ldsfri om",
      samletRente: "Samlet rente",
      totalBetalt: "Total betalt",
      effektEkstra: "Effekt af ekstra afdrag",
      duSparer: "Du sparer",
      iRenterOgBliver: "i renter og bliver g\u00e6ldsfri",
      maanederTidligere: "m\u00e5neder tidligere.",
      lavineVsSnebold: "Lavine vs. Snebold",
      lavineHoejeste: "Lavine (h\u00f8jeste rente f\u00f8rst)",
      sneboldLaveste: "Snebold (laveste saldo f\u00f8rst)",
      renteLabel: "Rente:",
      indtastGaeld: "Indtast din g\u00e6ld for at se afviklingsplanen",
      lavineMetoden: "Lavine-metoden",
      lavineDesc: "Betal ekstra afdrag p\u00e5 g\u00e6lden med den h\u00f8jeste rente f\u00f8rst. Matematisk den billigste metode \u2014 du sparer mest i renter.",
      sneboldMetoden: "Snebold-metoden",
      sneboldDesc: "Betal ekstra afdrag p\u00e5 den mindste g\u00e6ld f\u00f8rst. Giver hurtigere \"sejre\" og kan motivere dig til at holde fast i planen.",
      aar: "\u00e5r",
      mdr: "mdr",
    },
    se: {
      dineGaeldsposter: "Dina skuldposter",
      navn: "Namn",
      gaeld: "Skuld (kr)",
      rente: "R\u00e4nta",
      minAfdragMd: "Min. avbetalning/m\u00e5n",
      placeholder: "T.ex. Konsumtionsl\u00e5n",
      tilfoejGaeldspost: "+ L\u00e4gg till skuldpost",
      ekstraAfdragLabel: "Extra avbetalning per m\u00e5nad",
      ekstraAfdragHint: "Belopp ut\u00f6ver minimum som g\u00e5r till skuldavveckling",
      afviklingsmetode: "Avvecklingsmetod",
      lavine: "Lavin",
      snebold: "Sn\u00f6boll",
      dinGaeldsafvikling: "Din skuldavveckling",
      samletGaeld: "Total skuld",
      gaeldsfriOm: "Skuldfri om",
      samletRente: "Total r\u00e4nta",
      totalBetalt: "Totalt betalt",
      effektEkstra: "Effekt av extra avbetalning",
      duSparer: "Du sparar",
      iRenterOgBliver: "i r\u00e4nta och blir skuldfri",
      maanederTidligere: "m\u00e5nader tidigare.",
      lavineVsSnebold: "Lavin vs. Sn\u00f6boll",
      lavineHoejeste: "Lavin (h\u00f6gsta r\u00e4nta f\u00f6rst)",
      sneboldLaveste: "Sn\u00f6boll (l\u00e4gsta saldo f\u00f6rst)",
      renteLabel: "R\u00e4nta:",
      indtastGaeld: "Ange din skuld f\u00f6r att se avvecklingsplanen",
      lavineMetoden: "Lavinmetoden",
      lavineDesc: "Betala extra avbetalningar p\u00e5 skulden med h\u00f6gst r\u00e4nta f\u00f6rst. Matematiskt billigaste metoden \u2014 du sparar mest i r\u00e4nta.",
      sneboldMetoden: "Sn\u00f6bollsmetoden",
      sneboldDesc: "Betala extra avbetalningar p\u00e5 den minsta skulden f\u00f6rst. Ger snabbare \"vinster\" och kan motivera dig att h\u00e5lla fast vid planen.",
      aar: "\u00e5r",
      mdr: "m\u00e5n",
    },
    no: {
      dineGaeldsposter: "Dine gjeldsposter",
      navn: "Navn",
      gaeld: "Gjeld (kr)",
      rente: "Rente",
      minAfdragMd: "Min. avdrag/mnd",
      placeholder: "F.eks. Forbruksl\u00e5n",
      tilfoejGaeldspost: "+ Legg til gjeldspost",
      ekstraAfdragLabel: "Ekstra avdrag per m\u00e5ned",
      ekstraAfdragHint: "Bel\u00f8p utover minimum som g\u00e5r til gjeldsavvikling",
      afviklingsmetode: "Avviklingsmetode",
      lavine: "Lavine",
      snebold: "Sn\u00f8ball",
      dinGaeldsafvikling: "Din gjeldsavvikling",
      samletGaeld: "Samlet gjeld",
      gaeldsfriOm: "Gjeldfri om",
      samletRente: "Samlet rente",
      totalBetalt: "Totalt betalt",
      effektEkstra: "Effekt av ekstra avdrag",
      duSparer: "Du sparer",
      iRenterOgBliver: "i renter og blir gjeldfri",
      maanederTidligere: "m\u00e5neder tidligere.",
      lavineVsSnebold: "Lavine vs. Sn\u00f8ball",
      lavineHoejeste: "Lavine (h\u00f8yeste rente f\u00f8rst)",
      sneboldLaveste: "Sn\u00f8ball (laveste saldo f\u00f8rst)",
      renteLabel: "Rente:",
      indtastGaeld: "Oppgi gjelden din for \u00e5 se avviklingsplanen",
      lavineMetoden: "Lavinemetoden",
      lavineDesc: "Betal ekstra avdrag p\u00e5 gjelden med h\u00f8yest rente f\u00f8rst. Matematisk den billigste metoden \u2014 du sparer mest i renter.",
      sneboldMetoden: "Sn\u00f8ballmetoden",
      sneboldDesc: "Betal ekstra avdrag p\u00e5 den minste gjelden f\u00f8rst. Gir raskere \"seire\" og kan motivere deg til \u00e5 holde fast i planen.",
      aar: "\u00e5r",
      mdr: "mnd",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [poster, setPoster] = useState<GaeldsPost[]>([
    { id: 1, navn: 'Forbrugsl\u00e5n', gaeld: '', rente: '', minAfdrag: '' },
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
    setPoster([{ id: 1, navn: 'Forbrugsl\u00e5n', gaeld: '', rente: '', minAfdrag: '' }]);
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
        navn: p.navn || `G\u00e6ld ${p.id}`,
        gaeld: parseFloat(p.gaeld) || 0,
        rente: (parseFloat(p.rente) || 0) / 100 / 12,
        minAfdrag: parseFloat(p.minAfdrag) || 0,
      }))
      .filter(p => p.gaeld > 0 && p.minAfdrag > 0);

    if (aktive.length === 0) return null;

    const samletGaeld = aktive.reduce((s, p) => s + p.gaeld, 0);
    const samletMinAfdrag = aktive.reduce((s, p) => s + p.minAfdrag, 0);
    const ekstra = parseFloat(ekstraAfdrag) || 0;

    function simuler(sortFn: (a: typeof aktive[0], b: typeof aktive[0]) => number) {
      const balancer = aktive.map(p => ({ ...p, balance: p.gaeld }));
      let totalRente = 0;
      let maaneder = 0;
      const maxMaaneder = 600;

      while (balancer.some(b => b.balance > 0) && maaneder < maxMaaneder) {
        maaneder++;

        for (const b of balancer) {
          if (b.balance > 0) {
            const renteBeloeb = b.balance * b.rente;
            b.balance += renteBeloeb;
            totalRente += renteBeloeb;
          }
        }

        for (const b of balancer) {
          if (b.balance > 0) {
            const betaling = Math.min(b.balance, b.minAfdrag);
            b.balance -= betaling;
          }
        }

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

    const lavine = simuler((a, b) => b.rente - a.rente);
    const snebold = simuler((a, b) => a.gaeld - b.gaeld);

    const valgt = metode === 'lavine' ? lavine : snebold;
    const aar = Math.floor(valgt.maaneder / 12);
    const mdr = valgt.maaneder % 12;

    const udenEkstra = ekstra > 0 ? simuler(() => 0) : null;
    const besparelseRente = udenEkstra ? udenEkstra.totalRente - valgt.totalRente : 0;
    const besparelseMdr = udenEkstra ? udenEkstra.maaneder - valgt.maaneder : 0;

    // suppress unused var
    void samletMinAfdrag;

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

  const formatKr = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      {/* Input */}
      <div className="space-y-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {l.dineGaeldsposter}
        </label>
        <div className="space-y-3">
          {poster.map((post, idx) => (
            <div key={post.id} className="flex flex-wrap gap-2 items-end">
              <div className="w-full sm:w-auto sm:flex-1">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">{l.navn}</span>}
                <input
                  type="text"
                  value={post.navn}
                  onChange={(e) => updatePost(post.id, 'navn', e.target.value)}
                  placeholder={l.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1 min-w-[100px]">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">{l.gaeld}</span>}
                <div className="relative">
                  <input type="number" value={post.gaeld} onChange={(e) => updatePost(post.id, 'gaeld', e.target.value)} placeholder="50.000" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
                </div>
              </div>
              <div className="w-20">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">{l.rente}</span>}
                <div className="relative">
                  <input type="number" step="0.1" value={post.rente} onChange={(e) => updatePost(post.id, 'rente', e.target.value)} placeholder="8" className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                </div>
              </div>
              <div className="flex-1 min-w-[100px]">
                {idx === 0 && <span className="text-xs text-gray-500 dark:text-gray-400">{l.minAfdragMd}</span>}
                <div className="relative">
                  <input type="number" value={post.minAfdrag} onChange={(e) => updatePost(post.id, 'minAfdrag', e.target.value)} placeholder="1.500" className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">kr</span>
                </div>
              </div>
              {poster.length > 1 && (
                <button type="button" onClick={() => removePost(post.id)} className="px-2 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm">
                  &#10005;
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addPost} className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">
            {l.tilfoejGaeldspost}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.ekstraAfdragLabel}</label>
            <div className="relative">
              <input type="number" value={ekstraAfdrag} onChange={(e) => setEkstraAfdrag(e.target.value)} placeholder="0" className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.ekstraAfdragHint}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.afviklingsmetode}</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMetode('lavine')} className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${metode === 'lavine' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
                {l.lavine}
              </button>
              <button type="button" onClick={() => setMetode('snebold')} className={`flex-1 py-3 rounded-lg border-2 text-sm font-medium transition-all ${metode === 'snebold' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
                {l.snebold}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{l.dinGaeldsafvikling}</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.samletGaeld}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{formatKr(result.samletGaeld)} kr.</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.gaeldsfriOm}</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {result.aar > 0 ? `${result.aar} ${l.aar}` : ''}{result.aar > 0 && result.mdr > 0 ? ' ' : ''}{result.mdr > 0 ? `${result.mdr} ${l.mdr}` : ''}
                {result.aar === 0 && result.mdr === 0 ? `0 ${l.mdr}` : ''}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.samletRente}</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatKr(result.valgt.totalRente)} kr.</div>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400">{l.totalBetalt}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{formatKr(result.valgt.samletBetalt)} kr.</div>
            </div>
          </div>

          {result.ekstra > 0 && result.besparelseMdr > 0 && (
            <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4">
              <div className="text-sm text-green-800 dark:text-green-300">
                <strong>{l.effektEkstra} ({formatKr(result.ekstra)} kr./md):</strong>
              </div>
              <div className="text-sm text-green-700 dark:text-green-400 mt-1">
                {l.duSparer} {formatKr(result.besparelseRente)} kr. {l.iRenterOgBliver} {result.besparelseMdr} {l.maanederTidligere}
              </div>
            </div>
          )}

          {/* Metode sammenligning */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm">
            <div className="font-medium mb-2 dark:text-gray-200">{l.lavineVsSnebold}</div>
            <div className="grid grid-cols-2 gap-4">
              <div className={metode === 'lavine' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}>
                <div className="text-blue-600 dark:text-blue-400">{l.lavineHoejeste}</div>
                <div className="dark:text-gray-200">{Math.floor(result.lavine.maaneder / 12)} {l.aar} {result.lavine.maaneder % 12} {l.mdr}</div>
                <div className="text-red-500">{l.renteLabel} {formatKr(result.lavine.totalRente)} kr.</div>
              </div>
              <div className={metode === 'snebold' ? 'font-medium' : 'text-gray-500 dark:text-gray-400'}>
                <div className="text-purple-600 dark:text-purple-400">{l.sneboldLaveste}</div>
                <div className="dark:text-gray-200">{Math.floor(result.snebold.maaneder / 12)} {l.aar} {result.snebold.maaneder % 12} {l.mdr}</div>
                <div className="text-red-500">{l.renteLabel} {formatKr(result.snebold.totalRente)} kr.</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <div className="text-4xl mb-3">&#127919;</div>
          <p>{l.indtastGaeld}</p>
        </div>
      )}

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `${l.gaeldsfriOm} ${result.aar} ${l.aar} ${result.mdr} ${l.mdr} \u2014 ${l.samletRente}: ${formatKr(result.valgt.totalRente)} kr.` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="G\u00e6ldsfri Beregner"
          resultSummary={result ? `${l.gaeldsfriOm} ${result.aar} ${l.aar} ${result.mdr} ${l.mdr}` : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{l.lavineMetoden}</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {l.lavineDesc}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">{l.sneboldMetoden}</h4>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            {l.sneboldDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
