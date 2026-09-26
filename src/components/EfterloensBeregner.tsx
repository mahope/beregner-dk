'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Lightbulb, Sparkles, TriangleAlert, Trophy } from 'lucide-react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { AffiliateBox } from "./AffiliateBox";
import { adtractionLink } from "@/lib/adtraction";
import {
  efterloenAlder,
  praemieManglerForudsætning,
  praemiePortioner,
  SKATTEFRI_PRAEMIE_2026,
} from "@/lib/efterloen";

// 2026 satser (kilde: bm.dk, borger.dk)
const MAX_EFTERLOEN_91 = 20057;  // 91% af max dagpenge (22.041 × 0,91)
const MAX_EFTERLOEN_100 = 22041; // 100% for 2 års udskydelse

export default function EfterloensBeregner() {
  const [birthYear, setBirthYear] = useState<string>('1963');
  const [insurance, setInsurance] = useState<'full' | 'part'>('full');
  const [yearsContributed, setYearsContributed] = useState<string>('30');
  const [postpone2Years, setPostpone2Years] = useState(false);
  const [workWhileOnEfterloen, setWorkWhileOnEfterloen] = useState(false);
  const [hoursPerYear, setHoursPerYear] = useState<string>('1560');
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

  const handleReset = useCallback(() => {
    setBirthYear('1963');
    setInsurance('full');
    setYearsContributed('30');
    setPostpone2Years(false);
    setWorkWhileOnEfterloen(false);
    setHoursPerYear('1560');
  }, []);

  const result = useMemo(() => {
    const year = parseInt(birthYear) || 1963;
    const years = parseInt(yearsContributed) || 0;
    const hours = parseInt(hoursPerYear) || 0;

    // Check eligibility
    if (years < 30) {
      return { eligible: false, reason: 'Du skal have indbetalt efterlønsbidrag i mindst 30 år.' };
    }

    // Efterløns- og folkepensionsalder fra borger.dk's skema (se src/lib/efterloen.ts)
    const alder = efterloenAlder(year);

    if (alder.udenForTabel) {
      return {
        eligible: false,
        reason:
          'Fødselsåret er nyere end den offentliggjorte tabel. Efterlønsalderen stiger løbende, så spørg din a-kasse.',
      };
    }

    const efterloenAge = alder.efterloensalder;
    const folkepensionAge = alder.folkepensionsalder!;
    const maxAarEfterloen = alder.maxAarPaaEfterloen!;

    // Calculate monthly amount
    let monthlyAmount: number;
    if (postpone2Years) {
      monthlyAmount = insurance === 'full' ? MAX_EFTERLOEN_100 : MAX_EFTERLOEN_100 * 0.67;
    } else {
      monthlyAmount = insurance === 'full' ? MAX_EFTERLOEN_91 : MAX_EFTERLOEN_91 * 0.67;
    }

    // Calculate efterløn period
    const efterloenYears = maxAarEfterloen - (postpone2Years ? 2 : 0);

    // Tax estimate (~38% average)
    const taxRate = 0.38;
    const monthlyAfterTax = Math.round(monthlyAmount * (1 - taxRate));

    // Skattefri præmie: 481 timer pr. portion, maks 12 portioner. Kræver at
    // efterlønnen er udskudt 2 år (borger.dk, se src/lib/efterloen.ts).
    const portioner = workWhileOnEfterloen
      ? praemiePortioner(hours, postpone2Years)
      : 0;
    const praemieMangler = workWhileOnEfterloen && praemieManglerForudsætning(hours, postpone2Years);
    const totalPraemie = portioner * SKATTEFRI_PRAEMIE_2026.portion[insurance];

    return {
      eligible: true,
      efterloenAge,
      folkepensionAge,
      alderPraecis: alder.praecis,
      efterloenYears,
      monthlyAmount: Math.round(monthlyAmount),
      monthlyAfterTax,
      yearlyAmount: Math.round(monthlyAmount * 12),
      totalAmount: Math.round(monthlyAmount * 12 * efterloenYears),
      praemiePortioner: portioner,
      praemieMangler,
      totalPraemie,
      postponeBonus: postpone2Years,
    };
  }, [birthYear, insurance, yearsContributed, postpone2Years, workWhileOnEfterloen, hoursPerYear]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Fødselsår
            </label>
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              min="1956"
              max="1970"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tabel med efterlønsalder er offentliggjort for fødte 1956-1970
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Forsikringsstatus
            </label>
            <div className="flex gap-4">
              <button type="button"
                onClick={() => setInsurance('full')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  insurance === 'full'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200'
                }`}
              >
                Fuldtid
              </button>
              <button type="button"
                onClick={() => setInsurance('part')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  insurance === 'part'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200'
                }`}
              >
                Deltid
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              År med efterlønsbidrag
            </label>
            <div className="relative">
              <input
                type="number"
                value={yearsContributed}
                onChange={(e) => setYearsContributed(e.target.value)}
                min="0"
                max="40"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">år</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={postpone2Years}
                onChange={(e) => setPostpone2Years(e.target.checked)}
                className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Jeg udskyder efterløn 2 år (højere sats)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={workWhileOnEfterloen}
                onChange={(e) => setWorkWhileOnEfterloen(e.target.checked)}
                className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Jeg vil arbejde ved siden af
              </span>
            </label>
          </div>

          {workWhileOnEfterloen && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Forventede arbejdstimer pr. år
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={hoursPerYear}
                  onChange={(e) => setHoursPerYear(e.target.value)}
                  min="0"
                  max="5772"
                  className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-400"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">timer</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Hver 481 timer giver én skattefri præmieportion på 15.870 kr.
                (10.580 kr. for deltidsforsikrede). Maks 12 portioner. Forudfyldt
                er 1.560 timer, som er de 3.120 timer borger.dk kræver i de to års
                udskydelse
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
          {result.eligible ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Din efterløn
              </h3>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">Efterlønsalder</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.efterloenAge} år
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Folkepension: {result.folkepensionAge} år
                </div>
                {result.alderPraecis === false && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Født i 1959 er fødselsdatoen afgørende: 63½ år til 30. juni,
                    ellers 64 år
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-500 dark:text-gray-400">Månedlig efterløn</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.monthlyAmount?.toLocaleString('da-DK')} kr.
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  ~{result.monthlyAfterTax?.toLocaleString('da-DK')} kr. efter skat
                </div>
                {result.postponeBonus && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    <span className="inline-flex items-center gap-1"><Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />Forhøjet sats (100%) pga. 2 års udskydelse</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Efterlønsperiode</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.efterloenYears} år
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Samlet efterløn</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {((result.totalAmount || 0) / 1000).toFixed(0)}k kr.
                  </div>
                </div>
              </div>

              {workWhileOnEfterloen && result.praemieMangler && (
                <p className="text-xs text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  For at optjene skattefri præmie fra efterløn skal du have ventet
                  2 år med at gå på efterløn. Sæt flueben for 2-års reglen
                  ovenfor, eller optjén præmien via dit efterlønsbevis, inden du
                  går på efterløn.
                </p>
              )}

              {workWhileOnEfterloen && result.praemiePortioner && result.praemiePortioner > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <div className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong className="inline-flex items-center gap-1.5"><Trophy className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />Skattefri præmie</strong>
                  </div>
                  <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mt-1">
                    {result.praemiePortioner} portioner = {result.totalPraemie?.toLocaleString('da-DK')} kr.
                  </div>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                    Udbetales skattefrit ved folkepensionsalderen
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                * Beregningen er vejledende. Kontakt din a-kasse for præcise tal.
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-3 flex justify-center">
                <TriangleAlert className="h-10 w-10 text-red-500" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              </div>
              <p className="text-red-600 font-medium">{result.reason}</p>
            </div>
          )}
        </div>
      </div>

      {result.eligible && (
        <div className="flex justify-center gap-3 mt-6">
          <CopyResultButton text={`${result.monthlyAmount?.toLocaleString('da-DK')} kr/md (alder ${result.efterloenAge})`} />
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Efterlønsberegner"
            resultSummary={`${result.monthlyAmount?.toLocaleString('da-DK')} kr/md (alder ${result.efterloenAge})`}
          />
        </div>
      )}

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />2-års reglen</h4>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Udskyder du efterlønnen i mindst 2 år efter efterlønsalderen, 
            får du fuld dagpengesats (100%) i stedet for 91%.
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2"><Trophy className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />Præmieordningen</h4>
          <p className="text-sm text-green-700 dark:text-green-400">
            Som udgangspunkt udløser 481 arbejdstimer én skattefri præmieportion på
            15.870 kr. for fuldtidsforsikrede (10.580 kr. for deltidsforsikrede), og
            du kan højst optjene 12 portioner. Kilde: borger.dk, verificeret 26/9 2026.
          </p>
        </div>
      </div>
      <AffiliateBox
        title="Find den rette a-kasse"
        subtitle="Sammenlign a-kasser og sikre din indkomst ved ledighed"
        links={[
          { name: "Det Faglige Hus", description: "Danmarks billigste a-kasse og fagforening - bliv medlem online", url: adtractionLink("1873805030", "https://www.detfagligehus.dk"), cta: "Bliv medlem", highlight: true },
          { name: "ASE", description: "A-kasse for alle - uanset job. Hurtig tilmelding", url: adtractionLink("1666137874", "https://www.ase.dk"), cta: "Se priser" },
          { name: "Min A-kasse", description: "Tværfaglig a-kasse med fokus på god service", url: adtractionLink("1667704482", "https://min-a-kasse.dk"), cta: "Bliv medlem" },
        ]}
        className="mt-6"
      />
    </div>
  );
}
