'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';

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
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Civil status
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setCivilStatus('single')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  civilStatus === 'single'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                👤 Enlig
              </button>
              <button
                onClick={() => setCivilStatus('couple')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  civilStatus === 'couple'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                👫 Par
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={loan.annualInterest}
                    onChange={(e) => updateLoan(loan.id, 'annualInterest', e.target.value)}
                    placeholder="Årlig rente (kr.)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {loans.length > 1 && (
                    <button
                      onClick={() => removeLoan(loan.id)}
                      className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addLoan}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                + Tilføj lån
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Årlige renteindtægter (hvis nogen)
            </label>
            <input
              type="number"
              value={interestIncome}
              onChange={(e) => setInterestIncome(e.target.value)}
              placeholder="F.eks. renter fra opsparing"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Renter fra bankkonti, obligationer osv.
            </p>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
          {result.totalInterestExpense > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dit rentefradrag
              </h3>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500">Samlede renteudgifter</div>
                <div className="text-2xl font-bold text-gray-900">
                  {result.totalInterestExpense.toLocaleString('da-DK')} kr./år
                </div>
              </div>

              {result.hasDeduction ? (
                <>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500">Årlig skattebesparelse</div>
                    <div className="text-3xl font-bold text-green-600">
                      {result.totalDeduction.toLocaleString('da-DK')} kr.
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      = {result.monthlyBenefit.toLocaleString('da-DK')} kr./måned
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm text-sm">
                    <div className="space-y-2">
                      {result.lowRateAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Fradrag {FRADRAG_LOW * 100}% af {result.lowRateAmount.toLocaleString('da-DK')} kr.
                          </span>
                          <span className="font-medium">{result.lowRateDeduction.toLocaleString('da-DK')} kr.</span>
                        </div>
                      )}
                      {result.highRateAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Fradrag {FRADRAG_HIGH * 100}% af {result.highRateAmount.toLocaleString('da-DK')} kr.
                          </span>
                          <span className="font-medium">{result.highRateDeduction.toLocaleString('da-DK')} kr.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-100 rounded-lg p-4">
                    <div className="text-sm text-blue-800">
                      <strong>Effektiv fradragssats:</strong> {result.effectiveRate}%
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Staten betaler reelt {result.effectiveRate}% af dine renteudgifter
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm text-yellow-700">
                    Du har positiv kapitalindkomst (renteindtægter {'>'}  renteudgifter), 
                    så du får ikke rentefradrag.
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4">
                * Beregningen er vejledende og baseret på gennemsnitlige 2026-satser.
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-4xl mb-3">💰</div>
              <p>Indtast dine renteudgifter for at se besparelsen</p>
            </div>
          )}
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center mt-6">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Rentefradragberegner"
          resultSummary={result.hasDeduction ? `Fradrag: ${result.totalDeduction.toLocaleString('da-DK')} kr./år (${result.monthlyBenefit.toLocaleString('da-DK')} kr./md)` : `Renteudgifter: ${result.totalInterestExpense.toLocaleString('da-DK')} kr./år`}
        />
      </div>

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">💡 Bundfradrag 2026</h4>
          <p className="text-sm text-blue-700">
            De første {civilStatus === 'single' ? '50.000' : '100.000'} kr. i renteudgifter 
            giver højere fradragsværdi (33,6%) end beløb derover (25,6%).
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">✅ Automatisk indberetning</h4>
          <p className="text-sm text-green-700">
            Din bank indberetter automatisk dine renteudgifter til SKAT. 
            Tjek at tallene stemmer i din forskudsopgørelse.
          </p>
        </div>
      </div>
    </div>
  );
}
