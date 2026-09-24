"use client";

import { useLocale } from "@/components/LocaleProvider";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { initScrollDepthTracking, trackCalculation } from "@/lib/analytics";
import {
  type BoligstoetteInput,
  type BoligstoettePensionStatus,
  beregnBoligstoette,
  isBoligstoettePensionStatus,
  normaliserBoligstoetteInputs,
  parseBoligstoetteNumber,
} from "@/lib/boligstoette";
import {
  type CalculationState,
  clearStateFromUrl,
  generateShareableLink,
  getStateFromUrl,
} from "@/lib/calculation-state";
import { formatNumber } from "@/lib/format";
import { BOLIGSTOETTE_2026 } from "@/lib/satser-2026";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AffiliateBox } from "./AffiliateBox";

function numberOrZero(value: string): number {
  return parseBoligstoetteNumber(value) ?? 0;
}

function isValidSharedNumber(value: unknown, minimum: number, inclusive: boolean): boolean {
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) {
    return false;
  }

  const parsed = parseBoligstoetteNumber(value);
  return parsed !== null && (inclusive ? parsed >= minimum : parsed > minimum);
}

function isValidSharedInteger(value: unknown, minimum: number, maximum: number): boolean {
  if (typeof value !== "number" && typeof value !== "string") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  const parsed = parseBoligstoetteNumber(value);
  return (
    parsed !== null &&
    Number.isSafeInteger(parsed) &&
    parsed >= minimum &&
    parsed <= maximum
  );
}

function hasSharedInput(value: unknown, key: string): boolean {
  return Boolean(
    value &&
      typeof value === "object" &&
      Object.prototype.hasOwnProperty.call(value, key),
  );
}

export default function BoligstoetteBeregner() {
  const { locale } = useLocale();
  const tenPercentLabel = formatNumber(
    BOLIGSTOETTE_2026.wealth.considerationRates.tenPercent * 100,
    locale,
  );
  const twentyPercentLabel = formatNumber(
    BOLIGSTOETTE_2026.wealth.considerationRates.twentyPercent * 100,
    locale,
  );
  const [maanedligHusleje, setMaanedligHusleje] = useState("");
  const [husstandsindkomst, setHusstandsindkomst] = useState("");
  const [antalPersoner, setAntalPersoner] = useState("1");
  const [antalBorn, setAntalBorn] = useState("0");
  const [formue, setFormue] = useState("");
  const [areal, setAreal] = useState("65");
  const [pensionStatus, setPensionStatus] =
    useState<BoligstoettePensionStatus | "">("ingen");
  const [invalidSharedFields, setInvalidSharedFields] = useState<string[]>([]);
  const hasInvalidSharedState = invalidSharedFields.length > 0;
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "boligstoette") {
      const rawInputs = urlState.inputs;
      const hasValidInputObject =
        rawInputs !== null && typeof rawInputs === "object" && !Array.isArray(rawInputs);
      const inputs = normaliserBoligstoetteInputs(rawInputs);
      const hasSharedRent = hasSharedInput(rawInputs, "maanedligHusleje");
      const hasSharedIncome = hasSharedInput(rawInputs, "husstandsindkomst");
      const hasSharedWealth = hasSharedInput(rawInputs, "formue");
      const hasSharedArea = hasSharedInput(rawInputs, "areal");
      const hasSharedHousehold = hasSharedInput(rawInputs, "antalPersoner");
      const hasSharedChildren = hasSharedInput(rawInputs, "antalBorn");
      const hasSharedPensionStatus = hasSharedInput(rawInputs, "pensionStatus");
      const hasValidSharedRent =
        !hasSharedRent || isValidSharedNumber(rawInputs?.maanedligHusleje, 0, false);
      const hasValidSharedIncome =
        !hasSharedIncome || isValidSharedNumber(rawInputs?.husstandsindkomst, 0, true);
      const hasValidSharedWealth =
        !hasSharedWealth ||
        rawInputs?.formue === null ||
        isValidSharedNumber(rawInputs?.formue, 0, true);
      const hasValidSharedArea =
        !hasSharedArea || isValidSharedNumber(rawInputs?.areal, 0, false);
      const hasValidSharedHousehold =
        !hasSharedHousehold ||
        isValidSharedInteger(rawInputs?.antalPersoner, 1, Number.MAX_SAFE_INTEGER);
      const householdSizeForChildren = hasValidSharedHousehold
        ? parseBoligstoetteNumber(rawInputs?.antalPersoner) ?? inputs.householdSize
        : inputs.householdSize;
      const maxSharedChildren =
        householdSizeForChildren >= 5 ? 4 : Math.max(0, householdSizeForChildren - 1);
      const hasValidSharedChildren =
        hasSharedChildren && isValidSharedInteger(rawInputs?.antalBorn, 0, maxSharedChildren);
      const hasValidSharedPensionStatus =
        hasSharedPensionStatus && isBoligstoettePensionStatus(rawInputs?.pensionStatus);
      const invalidSharedFields = !hasValidInputObject
        ? [
            "maanedligHusleje",
            "husstandsindkomst",
            "antalPersoner",
            "antalBorn",
            "formue",
            "areal",
            "pensionStatus",
          ]
        : [
            ...(!hasValidSharedRent ? ["maanedligHusleje"] : []),
            ...(!hasValidSharedIncome ? ["husstandsindkomst"] : []),
            ...(!hasValidSharedWealth ? ["formue"] : []),
            ...(!hasValidSharedArea ? ["areal"] : []),
            ...(!hasValidSharedHousehold ? ["antalPersoner"] : []),
            ...(!hasValidSharedChildren ? ["antalBorn"] : []),
            ...(!hasValidSharedPensionStatus ? ["pensionStatus"] : []),
          ];
      setInvalidSharedFields(invalidSharedFields);
      setMaanedligHusleje(
        hasValidInputObject && hasValidSharedRent && inputs.monthlyRent > 0
          ? String(inputs.monthlyRent)
          : "",
      );
      setHusstandsindkomst(
        hasValidInputObject && hasSharedIncome && hasValidSharedIncome
          ? String(inputs.annualIncome)
          : "",
      );
      setAntalPersoner(
        hasValidInputObject && hasValidSharedHousehold ? String(inputs.householdSize) : "",
      );
      setAntalBorn(
        hasValidInputObject && hasValidSharedChildren ? String(inputs.children) : "",
      );
      setFormue(
        hasValidInputObject && hasSharedWealth && hasValidSharedWealth && inputs.wealth !== null
          ? String(inputs.wealth)
          : "",
      );
      setAreal(
        hasValidInputObject && (!hasSharedArea || hasValidSharedArea) ? String(inputs.area) : "",
      );
      setPensionStatus(
        hasValidInputObject && hasValidSharedPensionStatus ? inputs.pensionStatus : "",
      );
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("boligstoette");
    const timer = setTimeout(() => {
      trackCalculation("boligstoette");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const clearInvalidSharedField = useCallback((field: string) => {
    setInvalidSharedFields((current) => current.filter((item) => item !== field));
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "boligstoette",
      inputs: {
        maanedligHusleje: numberOrZero(maanedligHusleje),
        husstandsindkomst: numberOrZero(husstandsindkomst),
        antalPersoner: parseBoligstoetteNumber(antalPersoner) ?? 0,
        antalBorn: parseBoligstoetteNumber(antalBorn) ?? 0,
        ...(formue.trim() === "" ? {} : { formue: numberOrZero(formue) }),
        areal: numberOrZero(areal),
        pensionStatus: pensionStatus as BoligstoettePensionStatus,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state, { useFragment: true });
  }, [antalBorn, antalPersoner, areal, formue, husstandsindkomst, maanedligHusleje, pensionStatus]);

  const handleReset = useCallback(() => {
    setMaanedligHusleje("");
    setHusstandsindkomst("");
    setAntalPersoner("1");
    setAntalBorn("0");
    setFormue("");
    setAreal("65");
    setPensionStatus("ingen");
    setInvalidSharedFields([]);
    clearStateFromUrl();
  }, []);

  const householdSize = parseBoligstoetteNumber(antalPersoner);
  const children = parseBoligstoetteNumber(antalBorn);
  const parsedRent = parseBoligstoetteNumber(maanedligHusleje);
  const parsedIncome = parseBoligstoetteNumber(husstandsindkomst);
  const parsedWealth = parseBoligstoetteNumber(formue);
  const parsedArea = parseBoligstoetteNumber(areal);
  const hasValidHousehold =
    householdSize !== null && Number.isSafeInteger(householdSize) && householdSize >= 1 && householdSize <= 7;
  const maxChildren = hasValidHousehold
    ? householdSize >= 5
      ? 4
      : householdSize - 1
    : 0;
  const householdError = !hasValidHousehold
    ? "Vælg et gyldigt antal personer."
    : null;
  const childrenError =
    children === null || !Number.isSafeInteger(children) || children < 0 || children > maxChildren
      ? "Vælg et gyldigt antal børn for husstanden."
      : null;
  const rentError =
    maanedligHusleje.trim() !== "" && (parsedRent === null || parsedRent <= 0)
      ? "Indtast en husleje større end 0 kr."
      : null;
  const incomeError =
    husstandsindkomst.trim() !== "" && (parsedIncome === null || parsedIncome < 0)
      ? "Indtast en indkomst på 0 kr. eller mere."
      : null;
  const wealthError =
    formue.trim() !== "" && (parsedWealth === null || parsedWealth < 0)
      ? "Indtast en formue på 0 kr. eller mere."
      : null;
  const areaError = parsedArea === null || parsedArea <= 0
    ? "Indtast et areal større end 0 m²."
    : null;
  const pensionStatusError = isBoligstoettePensionStatus(pensionStatus)
    ? null
    : "Vælg en gyldig pensionstatus.";
  const validationMessage = [
    hasInvalidSharedState
      ? "Nogle oplysninger i delelinket er ugyldige. Indtast dem igen."
      : null,
    householdError,
    childrenError,
    rentError,
    incomeError,
    wealthError,
    areal.trim() === "" ? null : areaError,
    pensionStatusError,
  ].find((message): message is string => Boolean(message));
  const missingStatus =
    maanedligHusleje.trim() === "" && husstandsindkomst.trim() === ""
      ? "Udfyld husleje og husstandsindkomst for at se et screeningestimat."
      : maanedligHusleje.trim() === ""
        ? "Udfyld husleje for at se et screeningestimat."
        : husstandsindkomst.trim() === ""
          ? "Udfyld husstandsindkomst for at se et screeningestimat."
          : areal.trim() === ""
            ? "Udfyld areal for at se et screeningestimat."
            : antalPersoner.trim() === ""
              ? "Vælg husstandens størrelse for at se et screeningestimat."
              : antalBorn.trim() === ""
                ? "Vælg antal børn for at se et screeningestimat."
                : !isBoligstoettePensionStatus(pensionStatus)
                  ? "Vælg pensionstatus for at se et screeningestimat."
                  : null;

  const handlePersonerChange = (value: string) => {
    clearInvalidSharedField("antalPersoner");
    setAntalPersoner(value);
    const nextHouseholdSize = parseBoligstoetteNumber(value);
    if (nextHouseholdSize === null) return;
    const nextMaxChildren = nextHouseholdSize >= 5 ? 4 : Math.max(0, nextHouseholdSize - 1);
    const currentChildren = parseBoligstoetteNumber(antalBorn);
    if (currentChildren !== null && currentChildren > nextMaxChildren) {
      setAntalBorn(String(nextMaxChildren));
    }
  };

  const handleBornChange = (value: string) => {
    clearInvalidSharedField("antalBorn");
    const nextChildren = parseBoligstoetteNumber(value);
    if (nextChildren !== null && Number.isSafeInteger(nextChildren)) {
      setAntalBorn(String(Math.min(maxChildren, Math.max(0, nextChildren))));
    }
  };

  const resultat = useMemo(() => {
    if (
      validationMessage ||
      maanedligHusleje.trim() === "" ||
      husstandsindkomst.trim() === "" ||
      areal.trim() === ""
    ) {
      return null;
    }

    const input: BoligstoetteInput = {
      monthlyRent: parsedRent ?? 0,
      annualIncome: parsedIncome ?? 0,
      householdSize: householdSize ?? 0,
      children: children ?? 0,
      wealth: formue.trim() === "" ? null : parsedWealth,
      area: parsedArea ?? 0,
      pensionStatus: pensionStatus as BoligstoettePensionStatus,
    };
    return beregnBoligstoette(input);
  }, [
    antalBorn,
    antalPersoner,
    areal,
    children,
    formue,
    householdSize,
    husstandsindkomst,
    maanedligHusleje,
    parsedArea,
    parsedIncome,
    parsedRent,
    parsedWealth,
    pensionStatus,
    validationMessage,
  ]);

  const calculationError =
    !validationMessage && !missingStatus && !resultat
      ? "Indtast mindre ekstreme beløb for at se et screeningestimat."
      : null;
  const wealthMessage =
    resultat?.wealthConsideration === "10-procent"
      ? `${tenPercentLabel} % af formuen (${formatNumber(resultat.wealthIncomeEquivalent ?? 0, locale)} kr.) regnes som indkomst i den officielle vurdering.`
      : resultat?.wealthConsideration === "20-procent"
        ? `${twentyPercentLabel} % af formuen (${formatNumber(resultat.wealthIncomeEquivalent ?? 0, locale)} kr.) regnes som indkomst i den officielle vurdering.`
        : null;
  const isPensionProfile = isBoligstoettePensionStatus(pensionStatus) && pensionStatus !== "ingen";
  const resultHeading = isPensionProfile
    ? "Vejledende ordningsinterval"
    : "Vejledende månedsinterval";
  const maximumLabel = isPensionProfile
    ? "Relevant standardmaksimum 2026"
    : "Standardmaksimum 2026";
  const resultStatus = resultat
    ? `Screeninginterval: 0 til ${formatNumber(resultat.screeningHighMonthly, locale)} kr. pr. måned.${wealthMessage ? ` ${wealthMessage}` : ""}`
    : validationMessage
      ? "Ret de ugyldige oplysninger, før du kan se et screeningestimat."
      : calculationError ?? missingStatus ?? "";

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg md:p-8">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {resultStatus}
      </p>
      <div className="space-y-6">
        <p id="boligstoette-paakravede" className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          Påkrævede felter: husleje, husstandsindkomst, husstandsprofil og areal. Formue er valgfri.
        </p>
        <div>
          <label htmlFor="husleje" className="mb-2 block text-sm font-medium text-gray-700">
            Månedlig husleje (kr./md, uden forbrugsudgifter)
          </label>
          <div className="relative">
            <input
              type="number"
               id="husleje"
               required
               step="any"
              value={maanedligHusleje}
               onChange={(event) => {
                 clearInvalidSharedField("maanedligHusleje");
                 setMaanedligHusleje(event.target.value);
               }}
              placeholder="F.eks. 6.000"
              aria-invalid={Boolean(rentError)}
               aria-describedby={rentError ? "husleje-error boligstoette-paakravede" : "husleje-help boligstoette-paakravede"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">kr/md</span>
          </div>
          {rentError ? (
            <p id="husleje-error" role="alert" className="mt-2 text-xs text-red-600">
              {rentError}
            </p>
          ) : (
            <p id="husleje-help" className="mt-2 text-xs text-gray-500">
              Træk følgende fra huslejen: {BOLIGSTOETTE_2026.rentExcludes.join(", ")}. Betaler du særskilt for forbedringer som nyt køkken eller bad, lægger du beløbet til huslejen.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="indkomst" className="mb-2 block text-sm font-medium text-gray-700">
            Årlig husstandsindkomst før skat (kr./år)
          </label>
          <div className="relative">
            <input
              type="number"
              id="indkomst"
              required
              min="0"
              step="any"
              value={husstandsindkomst}
              onChange={(event) => {
                clearInvalidSharedField("husstandsindkomst");
                setHusstandsindkomst(event.target.value);
              }}
              placeholder="F.eks. 300.000"
              aria-invalid={Boolean(incomeError)}
               aria-describedby={incomeError ? "indkomst-error boligstoette-paakravede" : "boligstoette-paakravede"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">kr/år</span>
          </div>
          {incomeError && (
            <p id="indkomst-error" role="alert" className="mt-2 text-xs text-red-600">
              {incomeError}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="personer" className="mb-2 block text-sm font-medium text-gray-700">
              Personer i husstanden
            </label>
            <select
              id="personer"
              required
              value={antalPersoner}
              onChange={(event) => handlePersonerChange(event.target.value)}
              aria-invalid={Boolean(householdError)}
              aria-describedby={householdError ? "personer-error boligstoette-kontekst" : "boligstoette-kontekst"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
               <option value="">Vælg antal personer</option>
               <option value="1">1 person</option>
               <option value="2">2 personer</option>
               <option value="3">3 personer</option>
               <option value="4">4 personer</option>
               <option value="5">5 personer</option>
               <option value="6">6 personer</option>
               <option value="7">7+ personer</option>
            </select>
            {householdError && (
              <p id="personer-error" role="alert" className="mt-2 text-xs text-red-600">
                {householdError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="born" className="mb-2 block text-sm font-medium text-gray-700">
              Børn under 18 år
            </label>
            <select
              id="born"
              required
              value={antalBorn}
              onChange={(event) => handleBornChange(event.target.value)}
              aria-invalid={Boolean(childrenError)}
              aria-describedby={childrenError ? "born-error boligstoette-kontekst" : "boligstoette-kontekst"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
             >
               {antalBorn === "" && <option value="">Vælg antal børn</option>}
               {Array.from({ length: maxChildren + 1 }, (_, childCount) => (
                <option key={childCount} value={childCount}>
                  {childCount === 0 ? "0 børn" : childCount === 1 ? "1 barn" : childCount === 4 ? "4+ børn" : `${childCount} børn`}
                </option>
              ))}
            </select>
            {childrenError && (
              <p id="born-error" role="alert" className="mt-2 text-xs text-red-600">
                {childrenError}
              </p>
            )}
          </div>
        </div>
        <p id="boligstoette-kontekst" className="-mt-4 text-xs text-gray-500">
          Husstandens størrelse og boligens areal indgår i den officielle beregning, men ændrer ikke det lokale screeninginterval alene.
        </p>

        <div>
          <label htmlFor="pensionstatus" className="mb-2 block text-sm font-medium text-gray-700">
            Søgerens pensionstatus
          </label>
          <select
            id="pensionstatus"
            required
            value={pensionStatus}
            onChange={(event) => {
              clearInvalidSharedField("pensionStatus");
              const nextStatus = event.target.value;
              setPensionStatus(
                isBoligstoettePensionStatus(nextStatus) ? nextStatus : "",
              );
            }}
            aria-invalid={Boolean(pensionStatusError)}
            aria-describedby={pensionStatusError ? "pensionstatus-error pensionstatus-help" : "pensionstatus-help"}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Vælg pensionstatus</option>
            <option value="ingen">Ikke pensionist</option>
            <option value="foertidspension">Førtidspension efter nye regler</option>
            <option value="folkepension">Folkepension eller førtidspension før 2003</option>
          </select>
            {pensionStatusError && (
              <p id="pensionstatus-error" role="alert" className="mt-2 text-xs text-red-600">
                {pensionStatusError}
              </p>
            )}
            <p id="pensionstatus-help" className="mt-2 text-xs text-gray-500">
            Vælg den status, der gælder for den person, der søger boligstøtte.
          </p>
        </div>

        <div>
          <label htmlFor="formue" className="mb-2 block text-sm font-medium text-gray-700">
            Husstandens formue, som Udbetaling Danmark regner med (valgfri)
          </label>
          <div className="relative">
            <input
              type="number"
              id="formue"
              min="0"
              step="any"
              value={formue}
              onChange={(event) => {
                clearInvalidSharedField("formue");
                setFormue(event.target.value);
              }}
              placeholder="F.eks. 500.000"
              aria-invalid={Boolean(wealthError)}
              aria-describedby={wealthError ? "formue-error" : "formue-help"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">kr</span>
          </div>
          {wealthError ? (
            <p id="formue-error" role="alert" className="mt-2 text-xs text-red-600">
              {wealthError}
            </p>
          ) : (
            <p id="formue-help" className="mt-2 text-xs text-gray-500">
              Angiv kun den formue, der indgår i Udbetaling Danmarks vurdering. Førtidspension efter nye regler bruger ikke-pensionisternes grænser; folkepension og førtidspension før 2003 bruger pensionisternes grænser.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="areal" className="mb-2 block text-sm font-medium text-gray-700">
            Boligens areal (m²)
          </label>
          <div className="relative">
            <input
              type="number"
               id="areal"
               required
               step="any"
              value={areal}
               onChange={(event) => {
                 clearInvalidSharedField("areal");
                 setAreal(event.target.value);
               }}
              placeholder="F.eks. 65"
              aria-invalid={Boolean(areaError)}
               aria-describedby={areaError ? "areal-error boligstoette-paakravede" : "areal-kontekst boligstoette-paakravede"}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">m²</span>
          </div>
          {areaError ? (
            <p id="areal-error" role="alert" className="mt-2 text-xs text-red-600">
              {areaError}
            </p>
          ) : (
            <p id="areal-kontekst" className="mt-2 text-xs text-gray-500">
              Arealet indgår i den officielle beregning, men ikke i det lokale interval.
            </p>
          )}
        </div>

        {missingStatus && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            {missingStatus}
          </p>
        )}

        {hasInvalidSharedState && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Nogle oplysninger i delelinket er ugyldige. Indtast dem igen.
          </p>
        )}

        {calculationError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {calculationError}
          </p>
        )}

        <div className="flex justify-end">
          <ResetButton onReset={handleReset} />
        </div>

        {resultat && (
          <div className="mt-8 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <p className="mb-2 text-sm font-medium text-emerald-800">Screeningestimat — ikke en ansøgningsberegning</p>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">{resultHeading}</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-600">Screeninginterval</p>
                <p className="text-3xl font-bold text-green-600">
                  0 – {formatNumber(resultat.screeningHighMonthly, locale)} kr/md
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                 <p className="text-sm text-gray-600">{maximumLabel}</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(resultat.maximumMonthly, locale)} kr/md
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-700">
              {resultat.wealthAdjustedIncome !== null ? (
                <p>
                  Screeningens formuejusterede indkomstsignal: {formatNumber(resultat.wealthAdjustedIncome, locale)} kr./år. Det er en forenklet sum, ikke Udbetaling Danmarks fulde beregning.
                </p>
              ) : (
                <p>
                  Formuen er ikke oplyst, så der vises ikke et formuejusteret indkomstsignal. Angiv kun den formue, der indgår i Udbetaling Danmarks vurdering.
                </p>
              )}
              <p>
                Det øvre interval svarer til {resultat.maximumShareOfRent === 0 ? "under 1 %" : `${resultat.maximumShareOfRent} %`} af huslejen, men er ikke et krav på støtte.
              </p>
              {isPensionProfile && (
                <p>
                  Pensionsbeløbet afgør først, hvilken ordning der kan være relevant. Du kan
                  være berettiget til boligydelse i stedet for boligstøtte; den officielle
                  beregner afgør ordningen og det endelige beløb.
                </p>
              )}
              {wealthMessage && <p>{wealthMessage}</p>}
              <p>
                 Arealet på {formatNumber(resultat.area, locale)} m², husstandens sammensætning og indkomsten skal indgå i den officielle beregning. De indgår ikke i det lokale interval alene. Særlige ordninger og enkelte boligforhold kan give højere satser end standardmaksimum.
              </p>
            </div>
          </div>
        )}

        {resultat && resultat.screeningHighMonthly > 0 && (
          <div className="flex justify-center">
            <CopyResultButton
              text={`Screeningestimat: 0–${formatNumber(resultat.screeningHighMonthly, locale)} kr/md — ikke en ansøgningsberegning`}
            />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Boligstøtte-screening"
              resultSummary={`Screeningestimat: 0–${formatNumber(resultat.screeningHighMonthly, locale)} kr/md — ikke en ansøgningsberegning`}
              privacyWarning="Linket kan indeholde husleje, årlig indkomst, formue, husstandsstørrelse, antal børn, pensionstatus og areal. Del det kun med personer, du har tilladelse til at give oplysningerne til."
              allowExternalSharing={false}
            />
          </div>
        )}

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <h3 className="mb-2 font-semibold text-gray-900">Sådan tolker du resultatet</h3>
          <ul className="list-inside list-disc space-y-1">
            <li>Resultatet er et groft interval, ikke en beregning af din ret til boligstøtte.</li>
            <li>Den officielle beregning bruger blandt andet husstandsindkomst, formue, husleje, beboere og areal.</li>
            <li>Der er ingen øvre formuegrænse for retten, men formue over de officielle grænser kan sænke støtten.</li>
          </ul>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-medium text-blue-900">Få den officielle beregning</p>
            <p className="mt-1 text-blue-800">
              <a
                href={BOLIGSTOETTE_2026.sources.officialCalculator}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Åbn Udbetaling Danmarks beregner
              </a>{" "}
              og fortsæt uden at være logget ind, hvis du vil se en vejledende vurdering.
            </p>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Kilde: Udbetaling Danmark, verificeret {BOLIGSTOETTE_2026.verifiedAt}. Viste maksimumsbeløb og formuegrænser er hentet fra den officielle søgning.
          </p>
        </div>

        <AffiliateBox
          title="Forsikring til din bolig"
          subtitle="Sammenlign og find den billigste indbo- og husforsikring"
          links={[
            {
              name: "Findforsikring.dk",
              description: "Danmarks største forsikringsportal — sammenlign indbo-, hus- og familieforsikring og spar penge på din police.",
              url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=60068&uid=minberegner",
              cta: "Sammenlign forsikringer",
              highlight: true,
            },
          ]}
          className="mt-6"
        />
      </div>
    </div>
  );
}
