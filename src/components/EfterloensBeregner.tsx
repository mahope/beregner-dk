'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

// 2026 satser (kilde: bm.dk, borger.dk)
const MAX_EFTERLOEN_91 = 20057;  // 91% af max dagpenge (22.041 × 0,91)
const MAX_EFTERLOEN_100 = 22041; // 100% for 2 års udskydelse
const PRAEMIE_PER_PORTION = 15500;

export default function EfterloensBeregner() {
  const [birthYear, setBirthYear] = useState<string>('1963');
  const [insurance, setInsurance] = useState<'full' | 'part'>('full');
  const [yearsContributed, setYearsContributed] = useState<string>('30');
  const [postpone2Years, setPostpone2Years] = useState(false);
  const [workWhileOnEfterloen, setWorkWhileOnEfterloen] = useState(false);
  const [hoursPerYear, setHoursPerYear] = useState<string>('962');
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'efterloen') {
      const inputs = urlState.inputs;
      if (inputs.birthYear !== undefined) setBirthYear(String(inputs.birthYear));
      if (inputs.insurance) setInsurance(inputs.insurance);
      if (inputs.yearsContributed !== undefined) setYearsContributed(String(inputs.yearsContributed));
      if (inputs.postpone2Years !== undefined) setPostpone2Years(inputs.postpone2Years);
      if (inputs.workWhileOnEfterloen !== undefined) setWorkWhileOnEfterloen(inputs.workWhileOnEfterloen);
      if (inputs.hoursPerYear !== undefined) setHoursPerYear(String(inputs.hoursPerYear));
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("efterloen");
    const timer = setTimeout(() => {
      trackCalculation("efterloen");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'efterloen',
      inputs: { birthYear, insurance, yearsContributed, postpone2Years, workWhileOnEfterloen, hoursPerYear },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [birthYear, insurance, yearsContributed, postpone2Years, workWhileOnEfterloen, hoursPerYear]);

  const result = useMemo(() => {
    const year = parseInt(birthYear) || 1963;
    const years = parseInt(yearsContributed) || 0;
    const hours = parseInt(hoursPerYear) || 0;

    // Check eligibility
    if (years < 30) {
      return { eligible: false, reason: 'Du skal have indbetalt efterlønsbidrag i mindst 30 år.' };
    }

    // Calculate efterløn age based on birth year
    let efterloenAge: number;
    let folkepensionAge: number;
    if (year <= 1960) {
      efterloenAge = 62;
      folkepensionAge = 67;
    } else if (year === 1961) {
      efterloenAge = 63;
      folkepensionAge = 68;
    } else if (year === 1962) {
      efterloenAge = 63.5;
      folkepensionAge = 68;
    } else if (year === 1963) {
      efterloenAge = 64;
      folkepensionAge = 69;
    } else if (year === 1964) {
      efterloenAge = 64.5;
      folkepensionAge = 69;
    } else {
      efterloenAge = 65;
      folkepensionAge = 69 + Math.floor((year - 1965) / 5);
    }

    // Calculate monthly amount
    let monthlyAmount: number;
    if (postpone2Years) {
      monthlyAmount = insurance === 'full' ? MAX_EFTERLOEN_100 : MAX_EFTERLOEN_100 * 0.67;
    } else {
      monthlyAmount = insurance === 'full' ? MAX_EFTERLOEN_91 : MAX_EFTERLOEN_91 * 0.67;
    }

    // Calculate efterløn period
    const efterloenYears = folkepensionAge - efterloenAge - (postpone2Years ? 2 : 0);

    // Tax estimate (~38% average)
    const taxRate = 0.38;
    const monthlyAfterTax = Math.round(monthlyAmount * (1 - taxRate));

    // Calculate premium portions if working
    let praemiePortioner = 0;
    if (workWhileOnEfterloen && hours >= 962) {
      praemiePortioner = Math.min(12, Math.floor((hours / 481))); // ~481 hours per portion
    }
    const totalPraemie = praemiePortioner * PRAEMIE_PER_PORTION;

    return {
      eligible: true,
      efterloenAge,
      folkepensionAge,
      efterloenYears,
      monthlyAmount: Math.round(monthlyAmount),
      monthlyAfterTax,
      yearlyAmount: Math.round(monthlyAmount * 12),
      totalAmount: Math.round(monthlyAmount * 12 * efterloenYears),
      praemiePortioner,
      totalPraemie,
      postponeBonus: postpone2Years,
    };
  }, [birthYear, insurance, yearsContributed, postpone2Years, workWhileOnEfterloen, hoursPerYear]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fødselsår
            </label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min="1955"
              max="1990"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forsikringsstatus
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setInsurance('full')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  insurance === 'full'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Fuldtid
              </button>
              <button
                onClick={() => setInsurance('part')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  insurance === 'part'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Deltid
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              År med efterlønsbidrag
            </label>
            <input
              type="number"
              value={yearsContributed}
              onChange={(e) => setYearsContributed(e.target.value)}
              min="0"
              max="40"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={postpone2Years}
                onChange={(e) => setPostpone2Years(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Jeg udskyder efterløn 2 år (højere sats)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={workWhileOnEfterloen}
                onChange={(e) => setWorkWhileOnEfterloen(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Jeg vil arbejde ved siden af
              </span>
            </label>
          </div>

          {workWhileOnEfterloen && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forventede arbejdstimer pr. år
              </label>
              <input
                type="number"
                value={hoursPerYear}
                onChange={(e) => setHoursPerYear(e.target.value)}
                min="0"
                max="1924"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ved mindst 962 timer/år kan du optjene skattefri præmie
              </p>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
          {result.eligible ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Din efterløn
              </h3>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Efterlønsalder</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.efterloenAge} år
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Folkepension: {result.folkepensionAge} år
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Månedlig efterløn</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.monthlyAmount?.toLocaleString('da-DK')} kr.
                </div>
                <div className="text-sm text-green-600">
                  ~{result.monthlyAfterTax?.toLocaleString('da-DK')} kr. efter skat
                </div>
                {result.postponeBonus && (
                  <div className="text-xs text-blue-600 mt-1">
                    ✨ Forhøjet sats (100%) pga. 2 års udskydelse
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500">Efterlønsperiode</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {result.efterloenYears} år
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500">Samlet efterløn</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {((result.totalAmount || 0) / 1000).toFixed(0)}k kr.
                  </div>
                </div>
              </div>

              {workWhileOnEfterloen && result.praemiePortioner && result.praemiePortioner > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-800">
                    <strong>🏆 Skattefri præmie</strong>
                  </div>
                  <div className="text-lg font-semibold text-yellow-700 mt-1">
                    {result.praemiePortioner} portioner = {result.totalPraemie?.toLocaleString('da-DK')} kr.
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    Udbetales skattefrit ved folkepensionsalderen
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                * Beregningen er vejledende. Kontakt din a-kasse for præcise tal.
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-600 font-medium">{result.reason}</p>
            </div>
          )}
        </div>
      </div>

      {result.eligible && (
        <div className="flex justify-center mt-6">
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Efterlønsberegner"
            resultSummary={`${result.monthlyAmount?.toLocaleString('da-DK')} kr/md (alder ${result.efterloenAge})`}
          />
        </div>
      )}

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 2-års reglen</h4>
          <p className="text-sm text-blue-700">
            Udskyder du efterlønnen i mindst 2 år efter efterlønsalderen, 
            får du fuld dagpengesats (100%) i stedet for 91%.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">🏆 Præmieordningen</h4>
          <p className="text-sm text-green-700">
            Arbejder du mindst 962 timer/år mens du er på efterløn, 
            kan du optjene skattefri præmieportioner på ca. 15.500 kr. hver.
          </p>
        </div>
      </div>
    </div>
  );
}
