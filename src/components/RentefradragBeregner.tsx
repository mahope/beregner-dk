'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';

// 2026 rates (approximate)
const LOW_THRESHOLD_SINGLE = 50000;
const LOW_THRESHOLD_COUPLE = 100000;
const FRADRAG_LOW = 0.336;    // ~33.6% under threshold
const FRADRAG_HIGH = 0.256;   // ~25.6% over threshold

type CivilStatus = 'single' | 'couple';

interface LoanEntry {
  id: number;
  name: string;
  annualInterest: string;
}

export default function RentefradragBeregner() {
  const [civilStatus, setCivilStatus] = useState<CivilStatus>('single');
  const [loans, setLoans] = useState<LoanEntry[]>([
    { id: 1, name: 'Boliglån', annualInterest: '' },
  ]);
  const [interestIncome, setInterestIncome] = useState<string>('');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'rentefradrag') {
      const inputs = urlState.inputs;
      if (inputs.civilStatus) setCivilStatus(inputs.civilStatus);
      if (inputs.loans) setLoans(inputs.loans);
      if (inputs.interestIncome !== undefined) setInterestIncome(inputs.interestIncome);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("rentefradrag");
    const timer = setTimeout(() => {
      trackCalculation("rentefradrag");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'rentefradrag',
      inputs: { civilStatus, loans, interestIncome },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [civilStatus, loans, interestIncome]);

  const addLoan = () => {
    const newId = Math.max(...loans.map(l => l.id), 0) + 1;
    setLoans([...loans, { id: newId, name: '', annualInterest: '' }]);
  };

  const removeLoan = (id: number) => {
    if (loans.length > 1) {
      setLoans(loans.filter(l => l.id !== id));
    }
  };

  const updateLoan = (id: number, field: 'name' | 'annualInterest', value: string) => {
    setLoans(loans.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleReset = useCallback(() => {
    setCivilStatus('single');
    setLoans([{ id: 1, name: 'Boliglån', annualInterest: '' }]);
    setInterestIncome('');
  }, []);

  const result = useMemo(() => {
    // Calculate total interest expenses
    const totalInterestExpense = loans.reduce((sum, loan) => {
      return sum + (parseFloat(loan.annualInterest) || 0);
    }, 0);

    // Calculate net capital income (usually negative for borrowers)
    const income = parseFloat(interestIncome) || 0;
    const netCapitalIncome = income - totalInterestExpense;

    if (netCapitalIncome >= 0) {
      return {
        totalInterestExpense,
        netCapitalIncome,
        hasDeduction: false,
        lowRateAmount: 0,
        highRateAmount: 0,
        lowRateDeduction: 0,
        highRateDeduction: 0,
        totalDeduction: 0,
        effectiveRate: 0,
        monthlyBenefit: 0,
      };
    }

    // Negative capital income = deductible
    const deductibleAmount = Math.abs(netCapitalIncome);
    const threshold = civilStatus === 'single' ? LOW_THRESHOLD_SINGLE : LOW_THRESHOLD_COUPLE;

    let lowRateAmount = 0;
    let highRateAmount = 0;

    if (deductibleAmount <= threshold) {
      lowRateAmount = deductibleAmount;
    } else {
      lowRateAmount = threshold;
      highRateAmount = deductibleAmount - threshold;
    }

    const lowRateDeduction = lowRateAmount * FRADRAG_LOW;
    const highRateDeduction = highRateAmount * FRADRAG_HIGH;
    const totalDeduction = lowRateDeduction + highRateDeduction;
    const effectiveRate = deductibleAmount > 0 ? (totalDeduction / deductibleAmount) * 100 : 0;
    const monthlyBenefit = totalDeduction / 12;

    return {
      totalInterestExpense,
      netCapitalIncome,
      hasDeduction: true,
      deductibleAmount,
      lowRateAmount,
      highRateAmount,
      lowRateDeduction: Math.round(lowRateDeduction),
      highRateDeduction: Math.round(highRateDeduction),
      totalDeduction: Math.round(totalDeduction),
      effectiveRate: Math.round(effectiveRate * 10) / 10,
      monthlyBenefit: Math.round(monthlyBenefit),
    };
  }, [loans, interestIncome, civilStatus]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Civil status
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setCivilStatus('single')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  civilStatus === 'single'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200'
                }`}
              >
                👤 Enlig
              </button>
              <button
                onClick={() => setCivilStatus('couple')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  civilStatus === 'couple'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200'
                }`}
              >
                👫 Par
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Dine lån og årlige renteudgifter
            </label>
            <div className="space-y-3">
              {loans.map((loan, index) => (
                <div key={loan.id} className="flex gap-2">
                  <input
                    type="text"
                    value={loan.name}
                    onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                    placeholder={`Lån ${index + 1} (navn)`}
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={loan.annualInterest}
                      onChange={(e) => updateLoan(loan.id, 'annualInterest', e.target.value)}
                      placeholder="Årlig rente (kr.)"
                      className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">kr</span>
                  </div>
                  {loans.length > 1 && (
                    <button
                      onClick={() => removeLoan(loan.id)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addLoan}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
              >
                + Tilføj lån
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Årlige renteindtægter (hvis nogen)
            </label>
            <div className="relative">
              <input
                type="number"
                value={interestIncome}
                onChange={(e) => setInterestIncome(e.target.value)}
                placeholder="F.eks. renter fra opsparing"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">kr</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Renter fra bankkonti, obligationer osv.
            </p>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result.totalInterestExpense > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Dit rentefradrag
              </h3>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">Samlede renteudgifter</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.totalInterestExpense.toLocaleString('da-DK')} kr./år
                </div>
              </div>

              {result.hasDeduction ? (
                <>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Årlig skattebesparelse</div>
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {result.totalDeduction.toLocaleString('da-DK')} kr.
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      = {result.monthlyBenefit.toLocaleString('da-DK')} kr./måned
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm text-sm">
                    <div className="space-y-2">
                      {result.lowRateAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Fradrag {FRADRAG_LOW * 100}% af {result.lowRateAmount.toLocaleString('da-DK')} kr.
                          </span>
                          <span className="font-medium dark:text-gray-200">{result.lowRateDeduction.toLocaleString('da-DK')} kr.</span>
                        </div>
                      )}
                      {result.highRateAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Fradrag {FRADRAG_HIGH * 100}% af {result.highRateAmount.toLocaleString('da-DK')} kr.
                          </span>
                          <span className="font-medium dark:text-gray-200">{result.highRateDeduction.toLocaleString('da-DK')} kr.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Effektiv fradragssats:</strong> {result.effectiveRate}%
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Staten betaler reelt {result.effectiveRate}% af dine renteudgifter
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Du har positiv kapitalindkomst (renteindtægter {'>'}  renteudgifter), 
                    så du får ikke rentefradrag.
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                * Beregningen er vejledende og baseret på gennemsnitlige 2026-satser.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="text-4xl mb-3">💰</div>
              <p>Indtast dine renteudgifter for at se besparelsen</p>
            </div>
          )}
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result.hasDeduction ? `Fradrag: ${result.totalDeduction.toLocaleString('da-DK')} kr./år (${result.monthlyBenefit.toLocaleString('da-DK')} kr./md)` : `Renteudgifter: ${result.totalInterestExpense.toLocaleString('da-DK')} kr./år`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Rentefradragberegner"
          resultSummary={result.hasDeduction ? `Fradrag: ${result.totalDeduction.toLocaleString('da-DK')} kr./år (${result.monthlyBenefit.toLocaleString('da-DK')} kr./md)` : `Renteudgifter: ${result.totalInterestExpense.toLocaleString('da-DK')} kr./år`}
        />
      </div>

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Bundfradrag 2026</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            De første {civilStatus === 'single' ? '50.000' : '100.000'} kr. i renteudgifter 
            giver højere fradragsværdi (33,6%) end beløb derover (25,6%).
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">✅ Automatisk indberetning</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            Din bank indberetter automatisk dine renteudgifter til SKAT. 
            Tjek at tallene stemmer i din forskudsopgørelse.
          </p>
        </div>
      </div>
    </div>
  );
}
