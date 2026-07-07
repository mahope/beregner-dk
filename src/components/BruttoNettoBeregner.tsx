'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { SATSER_2026 } from "@/lib/satser-2026";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrencySuffix } from "@/lib/format";

// 2026-satser fra den fælles kilde (src/lib/satser-2026.ts)
const AM = SATSER_2026.amBidrag;
const BUNDSKAT = SATSER_2026.bundskat;
const KOMMUNE_SNIT = SATSER_2026.kommuneskatSnit;
const KIRKESKAT_SNIT = SATSER_2026.kirkeskatSnit;
const MELLEMSKAT_GRAENSE = SATSER_2026.mellemskatGraense;
const MELLEMSKAT = SATSER_2026.mellemskat;
const TOPSKAT_GRAENSE = SATSER_2026.topskatGraense;
const TOPSKAT_SATS = SATSER_2026.topskat;
const TOP_TOPSKAT_GRAENSE = SATSER_2026.topTopskatGraense;
const TOP_TOPSKAT = SATSER_2026.topTopskat;
const PERSONFRADRAG = SATSER_2026.personfradrag;
const BESK_FRADRAG_PCT = SATSER_2026.beskaeftigelsesfradragPct;
const BESK_FRADRAG_MAX = SATSER_2026.beskaeftigelsesfradragMax;

function beregnNetto(bruttoAar: number, komPct: number, kirPct: number): number {
  const amBidrag = bruttoAar * AM;
  const indkomstEfterAm = bruttoAar - amBidrag;
  const beskFradrag = Math.min(indkomstEfterAm * BESK_FRADRAG_PCT, BESK_FRADRAG_MAX);
  const skattepligtig = Math.max(0, indkomstEfterAm - PERSONFRADRAG - beskFradrag);
  const bundSkat = skattepligtig * BUNDSKAT;
  const kommuneSkat = skattepligtig * komPct;
  const kirkeSkat = skattepligtig * kirPct;
  const mellemSkat = Math.max(0, indkomstEfterAm - MELLEMSKAT_GRAENSE) * MELLEMSKAT;
  const topSkat = Math.max(0, indkomstEfterAm - TOPSKAT_GRAENSE) * TOPSKAT_SATS;
  const topTopSkat = Math.max(0, indkomstEfterAm - TOP_TOPSKAT_GRAENSE) * TOP_TOPSKAT;
  const samletSkat = amBidrag + bundSkat + kommuneSkat + kirkeSkat + mellemSkat + topSkat + topTopSkat;
  return bruttoAar - samletSkat;
}

function findBruttoFraNetto(oensketNettoAar: number, komPct: number, kirPct: number): number {
  let low = oensketNettoAar;
  let high = oensketNettoAar * 3;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const netto = beregnNetto(mid, komPct, kirPct);
    if (Math.abs(netto - oensketNettoAar) < 1) return mid;
    if (netto < oensketNettoAar) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

export default function BruttoNettoBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      desiredPayout: "Ønsket udbetaling (netto)",
      perMonth: "Pr. måned",
      perYear: "Pr. år",
      municipalTax: "Kommuneskat (%)",
      paysChurchTax: "Betaler kirkeskat",
      youNeedToEarn: "Du skal tjene",
      requiredGross: "Nødvendig bruttoløn",
      desiredPayoutResult: "Ønsket udbetaling",
      amContribution: "AM-bidrag (8%)",
      baseTax: "Bundskat",
      municipalTaxLabel: "Kommuneskat",
      churchTax: "Kirkeskat",
      middleTax: "Mellemskat",
      topTax: "Topskat",
      totalTax: "Samlet skat",
      effectiveTax: "Effektiv skat",
      effectiveTaxDesc: "For hver 100 kr. du tjener, betaler du",
      enterDesiredPayout: "Indtast din ønskede udbetaling",
      forNegotiation: "Til lønforhandling",
      forNegotiationDesc: "Brug beregneren til at finde ud af hvilken bruttoløn du skal forhandle dig til for at nå din ønskede udbetaling. Husk at pension og fradrag også påvirker resultatet.",
      reverseCalc: "Den omvendte beregning",
      reverseCalcDesc: "Kender du din bruttoløn og vil vide hvad du får udbetalt? Brug vores",
      reverseCalcLink: "løn efter skat beregner",
      reverseCalcSuffix: "i stedet.",
    },
    se: {
      desiredPayout: "Önskad utbetalning (netto)",
      perMonth: "Per månad",
      perYear: "Per år",
      municipalTax: "Kommunalskatt (%)",
      paysChurchTax: "Betalar kyrkoskatt",
      youNeedToEarn: "Du behöver tjäna",
      requiredGross: "Nödvändig bruttolön",
      desiredPayoutResult: "Önskad utbetalning",
      amContribution: "AM-bidrag (8%)",
      baseTax: "Grundskatt",
      municipalTaxLabel: "Kommunalskatt",
      churchTax: "Kyrkoskatt",
      middleTax: "Mellanskatt",
      topTax: "Toppskatt",
      totalTax: "Total skatt",
      effectiveTax: "Effektiv skatt",
      effectiveTaxDesc: "För varje 100 kr du tjänar, betalar du",
      enterDesiredPayout: "Ange din önskade utbetalning",
      forNegotiation: "För löneförhandling",
      forNegotiationDesc: "Använd kalkylatorn för att ta reda på vilken bruttolön du behöver förhandla dig till för att nå din önskade utbetalning. Kom ihåg att pension och avdrag också påverkar resultatet.",
      reverseCalc: "Den omvända beräkningen",
      reverseCalcDesc: "Vet du din bruttolön och vill veta vad du får utbetalt? Använd vår",
      reverseCalcLink: "lön efter skatt-kalkylator",
      reverseCalcSuffix: "istället.",
    },
    no: {
      desiredPayout: "Ønsket utbetaling (netto)",
      perMonth: "Per måned",
      perYear: "Per år",
      municipalTax: "Kommuneskatt (%)",
      paysChurchTax: "Betaler kirkeskatt",
      youNeedToEarn: "Du må tjene",
      requiredGross: "Nødvendig bruttolønn",
      desiredPayoutResult: "Ønsket utbetaling",
      amContribution: "AM-bidrag (8%)",
      baseTax: "Bunnsskatt",
      municipalTaxLabel: "Kommuneskatt",
      churchTax: "Kirkeskatt",
      middleTax: "Mellomskatt",
      topTax: "Toppskatt",
      totalTax: "Samlet skatt",
      effectiveTax: "Effektiv skatt",
      effectiveTaxDesc: "For hver 100 kr du tjener, betaler du",
      enterDesiredPayout: "Skriv inn ønsket utbetaling",
      forNegotiation: "Til lønnsforhandling",
      forNegotiationDesc: "Bruk kalkulatoren til å finne ut hvilken bruttolønn du må forhandle deg til for å nå ønsket utbetaling. Husk at pensjon og fradrag også påvirker resultatet.",
      reverseCalc: "Den omvendte beregningen",
      reverseCalcDesc: "Vet du bruttolønnen din og vil vite hva du får utbetalt? Bruk vår",
      reverseCalcLink: "lønn etter skatt-kalkulator",
      reverseCalcSuffix: "i stedet.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [oensketNetto, setOensketNetto] = useState<string>('25000');
  const [periode, setPeriode] = useState<'maaned' | 'aar'>('maaned');
  const [kommuneSkat, setKommuneSkat] = useState<string>('25.07');
  const [medKirkeskat, setMedKirkeskat] = useState(false);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'brutto-netto') {
      const inputs = urlState.inputs;
      if (inputs.oensketNetto !== undefined) setOensketNetto(inputs.oensketNetto);
      if (inputs.periode) setPeriode(inputs.periode);
      if (inputs.kommuneSkat !== undefined) setKommuneSkat(inputs.kommuneSkat);
      if (inputs.medKirkeskat !== undefined) setMedKirkeskat(inputs.medKirkeskat);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('brutto-netto');
    const timer = setTimeout(() => {
      trackCalculation('brutto-netto');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'brutto-netto',
      inputs: { oensketNetto, periode, kommuneSkat, medKirkeskat },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [oensketNetto, periode, kommuneSkat, medKirkeskat]);

  const handleReset = useCallback(() => {
    setOensketNetto('25000');
    setPeriode('maaned');
    setKommuneSkat('25.07');
    setMedKirkeskat(false);
  }, []);

  const result = useMemo(() => {
    const nettoInput = parseFloat(oensketNetto) || 0;
    if (nettoInput <= 0) return null;

    const nettoAar = periode === 'maaned' ? nettoInput * 12 : nettoInput;
    const komPct = (parseFloat(kommuneSkat) || 25.07) / 100;
    const kirPct = medKirkeskat ? KIRKESKAT_SNIT : 0;

    const bruttoAar = findBruttoFraNetto(nettoAar, komPct, kirPct);
    const bruttoMd = bruttoAar / 12;

    const amBidrag = bruttoAar * AM;
    const indkomstEfterAm = bruttoAar - amBidrag;
    const beskFradrag = Math.min(indkomstEfterAm * BESK_FRADRAG_PCT, BESK_FRADRAG_MAX);
    const skattepligtig = Math.max(0, indkomstEfterAm - PERSONFRADRAG - beskFradrag);
    const bundSkat = skattepligtig * BUNDSKAT;
    const kommuneSkatBeloeb = skattepligtig * komPct;
    const kirkeSkatBeloeb = skattepligtig * kirPct;
    const mellemSkat = Math.max(0, indkomstEfterAm - MELLEMSKAT_GRAENSE) * MELLEMSKAT;
    const topSkat = Math.max(0, indkomstEfterAm - TOPSKAT_GRAENSE) * TOPSKAT_SATS;
    const topTopSkat = Math.max(0, indkomstEfterAm - TOP_TOPSKAT_GRAENSE) * TOP_TOPSKAT;
    const samletSkat = amBidrag + bundSkat + kommuneSkatBeloeb + kirkeSkatBeloeb + mellemSkat + topSkat + topTopSkat;
    const effektivSkat = bruttoAar > 0 ? (samletSkat / bruttoAar) * 100 : 0;

    return {
      bruttoAar: Math.round(bruttoAar),
      bruttoMd: Math.round(bruttoMd),
      nettoAar: Math.round(nettoAar),
      nettoMd: Math.round(nettoAar / 12),
      amBidrag: Math.round(amBidrag),
      bundSkat: Math.round(bundSkat),
      kommuneSkatBeloeb: Math.round(kommuneSkatBeloeb),
      kirkeSkatBeloeb: Math.round(kirkeSkatBeloeb),
      mellemSkat: Math.round(mellemSkat),
      topSkat: Math.round(topSkat),
      samletSkat: Math.round(samletSkat),
      effektivSkat: Math.round(effektivSkat * 10) / 10,
      betalerMellemskat: indkomstEfterAm > MELLEMSKAT_GRAENSE,
      betalerTopskat: indkomstEfterAm > TOPSKAT_GRAENSE,
    };
  }, [oensketNetto, periode, kommuneSkat, medKirkeskat]);

  const formatKr = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {l.desiredPayout}
            </label>
            <div className="relative">
              <input type="number" value={oensketNetto} onChange={(e) => setOensketNetto(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => setPeriode('maaned')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${periode === 'maaned' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
              {l.perMonth}
            </button>
            <button type="button" onClick={() => setPeriode('aar')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${periode === 'aar' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-200'}`}>
              {l.perYear}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.municipalTax}</label>
            <div className="relative">
              <input type="number" step="0.01" value={kommuneSkat} onChange={(e) => setKommuneSkat(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="kirke-bn" checked={medKirkeskat} onChange={(e) => setMedKirkeskat(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="kirke-bn" className="text-sm text-gray-700 dark:text-gray-200">{l.paysChurchTax}</label>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{l.youNeedToEarn}</h3>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{l.requiredGross}</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {formatKr(result.bruttoMd)} kr./md
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  = {formatKr(result.bruttoAar)} kr./år
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">{l.desiredPayoutResult}</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatKr(result.nettoMd)} kr./md
                </div>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.amContribution}</span><span className="dark:text-gray-200">{formatKr(Math.round(result.amBidrag / 12))} kr./md</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.baseTax}</span><span className="dark:text-gray-200">{formatKr(Math.round(result.bundSkat / 12))} kr./md</span></div>
                <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.municipalTaxLabel}</span><span className="dark:text-gray-200">{formatKr(Math.round(result.kommuneSkatBeloeb / 12))} kr./md</span></div>
                {result.kirkeSkatBeloeb > 0 && (
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.churchTax}</span><span className="dark:text-gray-200">{formatKr(Math.round(result.kirkeSkatBeloeb / 12))} kr./md</span></div>
                )}
                {result.betalerMellemskat && (
                  <div className="flex justify-between text-yellow-600 dark:text-yellow-400"><span>{l.middleTax}</span><span>{formatKr(Math.round(result.mellemSkat / 12))} kr./md</span></div>
                )}
                {result.betalerTopskat && (
                  <div className="flex justify-between text-red-600 dark:text-red-400"><span>{l.topTax}</span><span>{formatKr(Math.round(result.topSkat / 12))} kr./md</span></div>
                )}
                <div className="flex justify-between font-medium border-t pt-2 dark:border-gray-600">
                  <span className="dark:text-gray-200">{l.totalTax}</span>
                  <span className="dark:text-gray-200">{formatKr(Math.round(result.samletSkat / 12))} kr./md</span>
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-400">
                <strong>{l.effectiveTax}:</strong> {result.effektivSkat}% — {l.effectiveTaxDesc} {result.effektivSkat} kr.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">💸</div>
              <p>{l.enterDesiredPayout}</p>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `For ${formatKr(result.nettoMd)} kr. netto skal du tjene ${formatKr(result.bruttoMd)} kr. brutto` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Brutto/Netto Beregner"
          resultSummary={result ? `Netto ${formatKr(result.nettoMd)} kr. = Brutto ${formatKr(result.bruttoMd)} kr.` : ''}
        />
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{l.forNegotiation}</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {l.forNegotiationDesc}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">{l.reverseCalc}</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            {l.reverseCalcDesc} <a href="/loen-efter-skat" className="underline">{l.reverseCalcLink}</a> {l.reverseCalcSuffix}
          </p>
        </div>
      </div>
    </div>
  );
}
