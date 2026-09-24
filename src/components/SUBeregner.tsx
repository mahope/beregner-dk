"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";
import {
  beregnSu,
  normaliserSuInputs,
  type SuDisabilityType,
  type SuEducation,
  type SuHomewardScheme,
  type SuHousing,
  type SuNonSuStatus,
  type SuYouthAgeGroup,
} from "@/lib/su";
import { SU_2026 } from "@/lib/satser-2026";
import { AffiliateBox } from "./AffiliateBox";

type Boligstatus = SuHousing;
type Uddannelsestype = SuEducation;

export default function SUBeregner() {
  const { locale } = useLocale();
  const [uddannelse, setUddannelse] = useState<Uddannelsestype>("videregaaende");
  const [youthAgeGroup, setYouthAgeGroup] = useState<SuYouthAgeGroup>("20plus");
  const [boligstatus, setBoligstatus] = useState<Boligstatus>("udeboende");
  const [homewardScheme, setHomewardScheme] = useState<SuHomewardScheme>("current");
  const [youthAwayApproved, setYouthAwayApproved] = useState(false);
  const [arbejdsindkomst, setArbejdsindkomst] = useState(5000);
  const [antalMaaneder, setAntalMaaneder] = useState(12);
  const [nonSuStatus, setNonSuStatus] = useState<SuNonSuStatus>("enrolled");
  const [disabilityType, setDisabilityType] = useState<SuDisabilityType>("none");
  const [harBarnUnder18, setHarBarnUnder18] = useState(false);
  const [erEnligForsorger, setErEnligForsorger] = useState(false);
  const [hasLoadedUrlState, setHasLoadedUrlState] = useState(false);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "su") {
      const parsed = normaliserSuInputs(urlState.inputs);
      setUddannelse(parsed.education);
      setYouthAgeGroup(parsed.youthAgeGroup);
      setBoligstatus(parsed.housing);
      setHomewardScheme(parsed.homewardScheme);
      setYouthAwayApproved(parsed.youthAwayApproved);
      setArbejdsindkomst(parsed.monthlyWorkIncome);
      setAntalMaaneder(parsed.suMonths);
      setNonSuStatus(parsed.nonSuStatus);
      setDisabilityType(parsed.disabilityType);
      setHarBarnUnder18(parsed.hasChildUnder18);
      setErEnligForsorger(parsed.singleParentEligible);
    }
    setHasLoadedUrlState(true);
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("su");
    const timer = setTimeout(() => {
      trackCalculation("su");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "su",
      inputs: {
        uddannelse,
        youthAgeGroup,
        boligstatus,
        homewardScheme,
        youthAwayApproved,
        arbejdsindkomst,
        antalMaaneder,
        nonSuStatus,
        harHandicap: disabilityType !== "none",
        handicapType: disabilityType,
        harBarnUnder18,
        erEnligForsorger,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [
    uddannelse,
    youthAgeGroup,
    boligstatus,
    homewardScheme,
    youthAwayApproved,
    arbejdsindkomst,
    antalMaaneder,
    nonSuStatus,
    disabilityType,
    harBarnUnder18,
    erEnligForsorger,
  ]);

  const handleReset = useCallback(() => {
    setUddannelse("videregaaende");
    setYouthAgeGroup("20plus");
    setBoligstatus("udeboende");
    setHomewardScheme("current");
    setYouthAwayApproved(false);
    setArbejdsindkomst(5000);
    setAntalMaaneder(12);
    setNonSuStatus("enrolled");
    setDisabilityType("none");
    setHarBarnUnder18(false);
    setErEnligForsorger(false);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("s");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const beregning = useMemo(
    () =>
      beregnSu({
        education: uddannelse,
        youthAgeGroup,
        housing: boligstatus,
        homewardScheme,
        youthAwayApproved,
        monthlyWorkIncome: arbejdsindkomst,
        suMonths: antalMaaneder,
        nonSuStatus,
        disabilityType,
        hasChildUnder18: harBarnUnder18,
        singleParentEligible: erEnligForsorger,
      }),
    [
      uddannelse,
      youthAgeGroup,
      boligstatus,
      homewardScheme,
      youthAwayApproved,
      arbejdsindkomst,
      antalMaaneder,
      nonSuStatus,
      disabilityType,
      harBarnUnder18,
      erEnligForsorger,
    ],
  );

  const formatKr = (beloeb: number) =>
    formatCurrency(beloeb, locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  const resultStatus = !hasLoadedUrlState || !beregning
    ? ""
    : antalMaaneder > 0
      ? `Månedlig SU før skat ${formatKr(beregning.monthlyGross)}. Årlig SU ${formatKr(beregning.annualGross)}. Maksimalt SU-lån ${formatKr(beregning.studyLoan)}.`
      : "Ingen SU valgt i år.";

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultStatus}
      </p>
      {!hasLoadedUrlState ? (
        <div className="rounded-xl bg-gray-50 p-6 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <span aria-hidden="true">Indlæser SU-beregning …</span>
        </div>
      ) : !beregning ? null : (
        <div className="space-y-8">
      <fieldset>
        <legend className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
          Uddannelsestype
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={uddannelse === "videregaaende"}
            onClick={() => {
              setUddannelse("videregaaende");
              if (disabilityType === "erhverv") setDisabilityType("none");
            }}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              uddannelse === "videregaaende"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Videregående uddannelse</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Universitet, professionsbachelor og erhvervsakademi
            </div>
          </button>
          <button
            type="button"
            aria-pressed={uddannelse === "ungdom"}
            onClick={() => {
              setUddannelse("ungdom");
              if (disabilityType === "videregaaende") setDisabilityType("none");
            }}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              uddannelse === "ungdom"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Ungdomsuddannelse</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Gymnasium, HF, EUX og erhvervsuddannelse
            </div>
          </button>
        </div>
      </fieldset>

      {uddannelse === "ungdom" && (
        <fieldset>
          <legend className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Alder
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={youthAgeGroup === "18to19"}
              onClick={() => {
                setYouthAgeGroup("18to19");
                setYouthAwayApproved(false);
              }}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                youthAgeGroup === "18to19"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">18-19 år</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Udeboendesats kræver som udgangspunkt godkendelse</div>
            </button>
            <button
              type="button"
              aria-pressed={youthAgeGroup === "20plus"}
              onClick={() => setYouthAgeGroup("20plus")}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                youthAgeGroup === "20plus"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">20+ år</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Fuld udeboendesats ved godkendt bopæl</div>
            </button>
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
          Boligsituation
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            aria-pressed={boligstatus === "udeboende"}
            onClick={() => setBoligstatus("udeboende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "udeboende"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Udeboende</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bor ikke hos forældre</div>
          </button>
          <button
            type="button"
            aria-pressed={boligstatus === "hjemmeboende"}
            onClick={() => setBoligstatus("hjemmeboende")}
            className={`p-4 rounded-lg border-2 text-left transition-colors ${
              boligstatus === "hjemmeboende"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            }`}
          >
            <div className="font-medium text-gray-900 dark:text-white">Hjemmeboende</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Bor hos forældre</div>
          </button>
        </div>
      </fieldset>

      {boligstatus === "hjemmeboende" && (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="legacy-homeward"
            checked={homewardScheme === "legacy"}
            onChange={(event) =>
              setHomewardScheme(event.target.checked ? "legacy" : "current")
            }
            className="mt-1 w-4 h-4"
          />
          <label htmlFor="legacy-homeward" className="text-sm text-gray-700 dark:text-gray-300">
            Jeg er omfattet af en ordning, der startede før {SU_2026.currentHomewardSchemeStart}
          </label>
        </div>
      )}

      {uddannelse === "ungdom" &&
        youthAgeGroup === "18to19" &&
        boligstatus === "udeboende" &&
        !harBarnUnder18 && (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="youth-away-approved"
              checked={youthAwayApproved}
              onChange={(event) => setYouthAwayApproved(event.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <label htmlFor="youth-away-approved" className="text-sm text-gray-700 dark:text-gray-300">
              Jeg har godkendelse til udeboendesats
            </label>
          </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="monthly-work-income"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Forventet arbejdsindkomst (pr. måned, før skat og AM-bidrag)
          </label>
          <div className="relative">
            <input
              id="monthly-work-income"
              type="number"
              min="0"
              step="500"
              value={arbejdsindkomst}
              onChange={(event) => {
                const value = parseFloat(event.target.value);
                setArbejdsindkomst(Number.isFinite(value) ? Math.max(0, value) : 0);
              }}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              aria-describedby="monthly-work-income-help"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {getCurrencySuffix(locale)}
            </span>
          </div>
          <p id="monthly-work-income-help" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Fribeløbet sammenlignes med indkomsten efter AM-bidrag.
          </p>
        </div>
        <div>
          <label
            htmlFor="su-months"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Antal SU-måneder i år
          </label>
          <div className="relative">
            <input
              id="su-months"
              type="number"
              min="0"
              max="12"
              value={antalMaaneder}
              onChange={(event) =>
                setAntalMaaneder(
                  Math.min(12, Math.max(0, parseInt(event.target.value) || 0)),
                )
              }
              className="w-full px-4 py-3 pr-14 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              mdr
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="non-su-enrolled"
          checked={nonSuStatus === "enrolled"}
          onChange={(event) =>
            setNonSuStatus(event.target.checked ? "enrolled" : "notStudying")
          }
          className="mt-1 w-4 h-4"
        />
        <label htmlFor="non-su-enrolled" className="text-sm text-gray-700 dark:text-gray-300">
          Jeg er fortsat indskrevet i de øvrige måneder
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="disability-type"
            className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Handicaptillæg
          </label>
          <select
            id="disability-type"
            value={disabilityType}
            onChange={(event) =>
              setDisabilityType(event.target.value as SuDisabilityType)
            }
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="none">Ingen</option>
            {uddannelse === "videregaaende" ? (
              <option value="videregaaende">Videregående uddannelse</option>
            ) : (
              <option value="erhverv">Dansk erhvervsuddannelse</option>
            )}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Vælg kun det tillæg, der passer til din uddannelse.
          </p>
        </div>
        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="child-under-18"
              checked={harBarnUnder18}
              onChange={(event) => {
                const checked = event.target.checked;
                setHarBarnUnder18(checked);
                if (!checked) setErEnligForsorger(false);
              }}
              className="mt-1 w-4 h-4"
            />
            <label htmlFor="child-under-18" className="text-sm text-gray-700 dark:text-gray-300">
              Jeg har ét barn under 18 år
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="single-parent"
              checked={erEnligForsorger}
              disabled={!harBarnUnder18}
              onChange={(event) => setErEnligForsorger(event.target.checked)}
              className="mt-1 w-4 h-4 disabled:opacity-50"
            />
            <label htmlFor="single-parent" className="text-sm text-gray-700 dark:text-gray-300">
              Forsørgertillæg til enlige forsørgere
            </label>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Et barn under 18 år giver automatisk det maksimale indkomstafhængige SU-tillæg og hæver årsfribeløbet med {formatKr(SU_2026.freeAllowance.childUnder18Annual)}. Forsørgertillægget på {formatKr(SU_2026.singleParentSupplement)} pr. måned før skat er et separat tillæg til berettigede enlige forsørgere.{" "}
        <a href={SU_2026.sources.singleParentEligibility} target="_blank" rel="noopener noreferrer" className="underline">Se betingelserne på su.dk</a>.
      </p>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {antalMaaneder > 0 ? "Månedlig SU (før skat)" : "Ingen SU valgt i år"}
          </p>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">
            {antalMaaneder > 0 ? formatKr(beregning.monthlyGross) : "0 kr."}
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Årlig SU før skat ({antalMaaneder} mdr)
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatKr(beregning.annualGross)}
          </p>
        </div>
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">            Maks. SU-lån</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {formatKr(beregning.studyLoan)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {harBarnUnder18
              ? `Inkl. ${formatKr(SU_2026.loan.parentMonthly)} kr. forældrelån`
              : `pr. måned fra ${SU_2026.rules.minimumLoanAge} år`}
          </p>
        </div>
      </div>

      {beregning.youthAwayApprovalMissing && (
        <div
          role="note"
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-lg"
        >
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Udeboendesats kræver godkendelse
          </p>
          <p className="text-amber-800 dark:text-amber-300">
            En 18-19-årig får normalt hjemmeboende SU uden godkendelse. Beregningen bruger derfor den aktuelle hjemmeboende grundsats på {formatKr(SU_2026.homewardBase)}. Med godkendelse vises den godkendte ungdomssats på {formatKr(SU_2026.youthAway18To19Base)} kr. før skat.
          </p>
        </div>
      )}

      {beregning.isParentalIncomeEstimate && !beregning.youthAwayApprovalMissing && (
        <div
          role="note"
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-lg"
        >
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Forældreindkomst påvirker satsen
          </p>
          <p className="text-amber-800 dark:text-amber-300">
            Den valgte sats er et grundbeløb før skat. Det samlede beløb afhænger af forældrenes indkomstgrundlag i {SU_2026.parentalIncomeYear} og ligger mellem {formatKr(beregning.basisSU)} og {formatKr(beregning.maximumParentalIncomeSU ?? beregning.basisSU)} kr. pr. måned. Beregningen bruger grundbeløbet og tilhørende fribeløbsscenario.
          </p>
        </div>
      )}

      {beregning.isLegacyEstimate && (
        <div
          role="note"
          className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-lg"
        >
          <p className="font-medium text-amber-900 dark:text-amber-200">
            Sats fra den ældre ordning
          </p>
          <p className="text-amber-800 dark:text-amber-300">
            {uddannelse === "ungdom" && youthAgeGroup === "18to19" && !harBarnUnder18
              ? `18-19-årige i den gamle ordning har en grundsats på ${formatKr(SU_2026.youthLegacy18To19Base)} kr. og kan få et indkomstafhængigt tillæg op til ${formatKr(SU_2026.homewardLegacy)} kr. før skat.`
              : `Visse studerende, hvis uddannelse startede før ${SU_2026.currentHomewardSchemeStart}, beholder den faste sats på ${formatKr(SU_2026.homewardLegacy)} kr. Fribeløbet følger den normale status, fordi den faste sats ikke er en indkomstreduktion.`}
          </p>
        </div>
      )}

      {harBarnUnder18 && (
        <div
          role="note"
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-lg"
        >
          <p className="font-medium text-blue-900 dark:text-blue-200">
            Barnets påvirkning på SU og fribeløb
          </p>
          <p className="text-blue-800 dark:text-blue-300">
            Et barn under 18 år giver i den aktuelle ordning automatisk det maksimale indkomstafhængige SU-tillæg. I en ordning fra før {SU_2026.currentHomewardSchemeStart} bevares den ældre faste sats. Barnet hæver også årsfribeløbet med {formatKr(SU_2026.freeAllowance.childUnder18Annual)}. Det er ikke det samme som forsørgertillægget.
          </p>
        </div>
      )}

      {erEnligForsorger && (
        <div
          role="note"
          className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-lg"
        >
          <p className="font-medium text-blue-900 dark:text-blue-200">
            Forsørgertillæg
          </p>
          <p className="text-blue-800 dark:text-blue-300">
            Det separate forsørgertillæg er {formatKr(SU_2026.singleParentSupplement)} kr. pr. måned før skat, når du er berettiget. Det er en beregnet sum sammen med den valgte SU og ikke én enkelt offentlig sats.
          </p>
        </div>
      )}

      <div aria-live="polite" aria-atomic="true">
        {beregning.excess > 0 ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded-lg">
            <p className="font-medium text-red-800 dark:text-red-300">
              Dit beregnede fribeløb er overskredet
            </p>
            <p className="text-red-700 dark:text-red-400">
              Din bruttoarbejdsindkomst svarer til {formatKr(beregning.annualWorkIncomeAfterAM)} efter AM-bidrag for året. Det overstiger det beregnede årlige fribeløb på {formatKr(beregning.annualFreeAllowance)} med {formatKr(beregning.excess)}.
            </p>
            <p className="text-red-700 dark:text-red-400 mt-1">
              Overskridelsen kan føre til nedsættelse eller tilbagebetaling af SU og SU-lån. Udbetaling Danmark beregner det endelige beløb ud fra den enkelte situation.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-300">
              Du er under det beregnede fribeløb. Resterende efter AM-bidrag: {formatKr(beregning.annualFreeAllowance - beregning.annualWorkIncomeAfterAM)}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${formatKr(beregning.monthlyGross)}/md før skat`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="SU-beregner"
          resultSummary={`${formatKr(beregning.monthlyGross)}/md før skat`}
        />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">
          Officielle SU-satser 2026
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Videregående</p>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Udeboende</span>
              <span>{formatKr(SU_2026.udeboende)}/md</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Hjemmeboende, samlet sats</span>
              <span>
                {formatKr(SU_2026.homewardBase)}-{formatKr(SU_2026.homewardMaximum)}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Fribeløb med SU</span>
              <span>{formatKr(SU_2026.freeAllowance.videregaaendeWithSu)}/md</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Handicaptillæg</span>
              <span>{formatKr(SU_2026.disabilitySupplement.videregaaende)}/md</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ungdomsuddannelse og fælles satser
            </p>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Udeboende (20+)</span>
              <span>{formatKr(SU_2026.udeboende)}/md</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Udeboende (18-19, godkendt)</span>
              <span>{formatKr(SU_2026.youthAway18To19Base)} + tillæg</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Fribeløb med handicaptillæg</span>
              <span>{formatKr(SU_2026.freeAllowance.disabilityMonth)}/md</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>Forsørgertillæg</span>
              <span>{formatKr(SU_2026.singleParentSupplement)}/md</span>
            </div>
            <div className="flex justify-between gap-4 text-gray-700 dark:text-gray-300">
              <span>SU-lån</span>
              <span>{formatKr(SU_2026.loan.ordinaryMonthly)}/md</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Visse uddannelser, der startede før {SU_2026.currentHomewardSchemeStart}, kan følge en ældre ordning. På ungdomsuddannelse er 18-19-åriges grundsats {formatKr(SU_2026.youthLegacy18To19Base)} kr., mens den faste sats fra 20 år er {formatKr(SU_2026.homewardLegacy)} kr.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Kilder:{" "}
          <a href={SU_2026.sources.homewardVideregaaende} target="_blank" rel="noopener noreferrer" className="underline">hjemmeboende VU</a>,{" "}
          <a href={SU_2026.sources.homewardUngdomsuddannelse} target="_blank" rel="noopener noreferrer" className="underline">hjemmeboende ungdom</a>,{" "}
          <a href={SU_2026.sources.udeboendeVideregaaende} target="_blank" rel="noopener noreferrer" className="underline">udeboende VU</a>,{" "}
          <a href={SU_2026.sources.udeboendeUngdomsuddannelse} target="_blank" rel="noopener noreferrer" className="underline">ungdom</a>,{" "}
          <a href={SU_2026.sources.freeAllowance} target="_blank" rel="noopener noreferrer" className="underline">fribeløb</a>,{" "}
          <a href={SU_2026.sources.parents} target="_blank" rel="noopener noreferrer" className="underline">forsørgertillæg</a>,{" "}
          <a href={SU_2026.sources.disability} target="_blank" rel="noopener noreferrer" className="underline">handicaptillæg</a> og{" "}
          <a href={SU_2026.sources.loan} target="_blank" rel="noopener noreferrer" className="underline">SU-lån</a>. Alle beløb er verificeret {SU_2026.verifiedAt}.
        </p>
      </div>
      <AffiliateBox
        title="Spar på studiebøgerne"
        subtitle="Køb dit pensum billigere"
        links={[{ name: "Plusbog", description: "Stort udvalg af fag- og studiebøger til skarpe priser og hurtig levering.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=100622&uid=minberegner", cta: "Se studiebøger hos Plusbog", highlight: true }]}
        className="mt-6"
      />
        </div>
      )}
    </>
  );
}
