'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';

// 2026 satser (kilde: bm.dk, borger.dk)
const MAX_WEEKLY_RATE = 5085; // Max barselsdagpenge per uge 2026
const WORK_HOURS_FULL = 37;   // Full time hours

type Employment = 'fulltime' | 'parttime' | 'selfemployed' | 'unemployed';
type Parent = 'mor' | 'far';

export default function BarselBeregner() {
  const [monthlyIncome, setMonthlyIncome] = useState<string>('');
  const [employment, setEmployment] = useState<Employment>('fulltime');
  const [weeklyHours, setWeeklyHours] = useState<string>('37');
  const [parent, setParent] = useState<Parent>('mor');
  const [weeksPlanned, setWeeksPlanned] = useState<string>('24');
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'barsel') {
      const inputs = urlState.inputs;
      if (inputs.monthlyIncome !== undefined) setMonthlyIncome(String(inputs.monthlyIncome));
      if (inputs.employment) setEmployment(inputs.employment);
      if (inputs.weeklyHours !== undefined) setWeeklyHours(String(inputs.weeklyHours));
      if (inputs.parent) setParent(inputs.parent);
      if (inputs.weeksPlanned !== undefined) setWeeksPlanned(String(inputs.weeksPlanned));
    }
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'barsel',
      inputs: { monthlyIncome, employment, weeklyHours, parent, weeksPlanned },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [monthlyIncome, employment, weeklyHours, parent, weeksPlanned]);

  const result = useMemo(() => {
    const income = parseFloat(monthlyIncome) || 0;
    const hours = parseFloat(weeklyHours) || 37;
    const weeks = parseInt(weeksPlanned) || 24;

    if (income <= 0) return null;

    // Calculate hourly rate
    const monthlyHours = hours * 4.33;
    const hourlyRate = income / monthlyHours;

    // Calculate weekly dagpenge (capped at max rate)
    const calculatedWeeklyRate = hourlyRate * hours;
    const weeklyRate = Math.min(calculatedWeeklyRate, MAX_WEEKLY_RATE);

    // Calculate coverage percentage
    const coveragePercent = Math.min(100, (weeklyRate / calculatedWeeklyRate) * 100);

    // Monthly and total amounts
    const monthlyAmount = weeklyRate * 4.33;
    const totalAmount = weeklyRate * weeks;

    // Tax estimate (rough: ~38% average)
    const taxRate = 0.38;
    const monthlyAfterTax = monthlyAmount * (1 - taxRate);
    const totalAfterTax = totalAmount * (1 - taxRate);

    // Income loss
    const monthlyLoss = income - monthlyAfterTax;

    return {
      weeklyRate: Math.round(weeklyRate),
      monthlyAmount: Math.round(monthlyAmount),
      monthlyAfterTax: Math.round(monthlyAfterTax),
      totalAmount: Math.round(totalAmount),
      totalAfterTax: Math.round(totalAfterTax),
      coveragePercent: Math.round(coveragePercent),
      monthlyLoss: Math.round(monthlyLoss),
      isMaxed: weeklyRate >= MAX_WEEKLY_RATE,
    };
  }, [monthlyIncome, weeklyHours, weeksPlanned]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Månedlig bruttoløn (kr.)
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="F.eks. 35000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ansættelsestype
            </label>
            <select
              value={employment}
              onChange={(e) => setEmployment(e.target.value as Employment)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="fulltime">Fuldtid (37 timer)</option>
              <option value="parttime">Deltid</option>
              <option value="selfemployed">Selvstændig</option>
              <option value="unemployed">Ledig</option>
            </select>
          </div>

          {employment === 'parttime' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ugentlige timer
              </label>
              <input
                type="number"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(e.target.value)}
                min="1"
                max="37"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Du er
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setParent('mor')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  parent === 'mor'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                👩 Mor
              </button>
              <button
                onClick={() => setParent('far')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  parent === 'far'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                👨 Far/medmor
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Planlagte ugers orlov: <span className="font-bold">{weeksPlanned} uger</span>
            </label>
            <input
              type="range"
              min="1"
              max="52"
              value={weeksPlanned}
              onChange={(e) => setWeeksPlanned(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 uge</span>
              <span>26 uger</span>
              <span>52 uger</span>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          {result ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Estimeret barselsdagpenge
              </h3>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Ugentlig sats (før skat)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.weeklyRate.toLocaleString('da-DK')} kr.
                </div>
                {result.isMaxed && (
                  <div className="text-xs text-amber-600 mt-1">
                    ⚠️ Maksimumssats nået
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500">Månedligt (før skat)</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {result.monthlyAmount.toLocaleString('da-DK')} kr.
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500">Månedligt (efter skat)</div>
                  <div className="text-lg font-semibold text-green-600">
                    ~{result.monthlyAfterTax.toLocaleString('da-DK')} kr.
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">
                  I alt for {weeksPlanned} uger (efter skat)
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ~{result.totalAfterTax.toLocaleString('da-DK')} kr.
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-sm text-amber-800">
                  <strong>Indkomstnedgang:</strong> ~{result.monthlyLoss.toLocaleString('da-DK')} kr./md
                </div>
                <div className="text-xs text-amber-600 mt-1">
                  Dagpenge dækker ca. {result.coveragePercent}% af din løn
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                * Beregningen er vejledende og baseret på 2026-satser. 
                Den faktiske udbetaling kan variere baseret på din situation.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-3">👶</div>
              <p>Indtast din månedsløn for at se beregningen</p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="flex justify-center mt-6">
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Barselsberegner"
            resultSummary={`${result.weeklyRate.toLocaleString('da-DK')} kr/uge (${weeksPlanned} uger)`}
          />
        </div>
      )}

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            {parent === 'mor' ? '👩 Mors orlov' : '👨 Fars/medmors orlov'}
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {parent === 'mor' ? (
              <>
                <li>• 4 uger før termin</li>
                <li>• 10 uger efter fødsel (øremærket)</li>
                <li>• 9 uger yderligere (øremærket)</li>
                <li>• Op til 13 uger til deling</li>
              </>
            ) : (
              <>
                <li>• 2 uger lige efter fødsel</li>
                <li>• 9 uger yderligere (øremærket)</li>
                <li>• Op til 13 uger til deling</li>
              </>
            )}
          </ul>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">💡 Tip</h4>
          <p className="text-sm text-green-700">
            Tjek din overenskomst eller ansættelseskontrakt. 
            Mange arbejdsgivere supplerer barselsdagpenge med løn, 
            så du får fuld eller delvis løn under barslen.
          </p>
        </div>
      </div>
    </div>
  );
}
