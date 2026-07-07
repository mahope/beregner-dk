"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { OpsparingAffiliate } from "./AffiliateBox";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type Frekvens = "maanedlig" | "kvartal" | "aarlig";
type Visning = "beregner" | "maal";

interface AarData {
  aar: number;
  saldo: number;
  indskud: number;
  rente: number;
}

function simulerOpsparing(
  startBeloeb: number,
  maanedligIndbetaling: number,
  aarligRentePct: number,
  periodeAar: number,
  renteFrekvens: Frekvens
): { slutSaldo: number; samletIndskud: number; samletRente: number; aarligData: AarData[] } {
  let perioderPerAar: number;
  let maanederPerPeriode: number;

  switch (renteFrekvens) {
    case "maanedlig":
      perioderPerAar = 12;
      maanederPerPeriode = 1;
      break;
    case "kvartal":
      perioderPerAar = 4;
      maanederPerPeriode = 3;
      break;
    case "aarlig":
    default:
      perioderPerAar = 1;
      maanederPerPeriode = 12;
  }

  const periodiskRente = aarligRentePct / 100 / perioderPerAar;
  const antalMaaneder = periodeAar * 12;

  let saldo = startBeloeb;
  let samletIndskud = startBeloeb;
  let samletRente = 0;
  const aarligData: AarData[] = [];

  for (let maaned = 1; maaned <= antalMaaneder; maaned++) {
    saldo += maanedligIndbetaling;
    samletIndskud += maanedligIndbetaling;

    if (maaned % maanederPerPeriode === 0) {
      const renteBeloeb = saldo * periodiskRente;
      saldo += renteBeloeb;
      samletRente += renteBeloeb;
    }

    if (maaned % 12 === 0) {
      aarligData.push({
        aar: maaned / 12,
        saldo,
        indskud: samletIndskud,
        rente: samletRente,
      });
    }
  }

  return { slutSaldo: saldo, samletIndskud, samletRente, aarligData };
}

const graphLabels = {
  da: { growth: "Opsparingens v\u00e6kst", deposit: "Indskud", interest: "Rente", yearLabel: "\u00c5r" },
  se: { growth: "Sparandets tillv\u00e4xt", deposit: "Ins\u00e4ttning", interest: "R\u00e4nta", yearLabel: "\u00c5r" },
  no: { growth: "Sparingens vekst", deposit: "Innskudd", interest: "Rente", yearLabel: "\u00c5r" },
};

function VaekstGraf({ aarligData }: { aarligData: AarData[] }) {
  const { locale } = useLocale();
  const gl = graphLabels[locale as keyof typeof graphLabels] || graphLabels.da;
  if (aarligData.length === 0) return null;
  const maxSaldo = Math.max(...aarligData.map((d) => d.saldo));
  if (maxSaldo === 0) return null;

  const step = Math.max(1, Math.floor(aarligData.length / 15));
  const data = aarligData.filter((_, i) => i % step === 0 || i === aarligData.length - 1);

  return (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-3 dark:text-gray-200">{gl.growth}</h4>
      <div className="flex items-end gap-1 h-40">
        {data.map((d) => {
          const totalHeight = (d.saldo / maxSaldo) * 100;
          const indskudHeight = (d.indskud / maxSaldo) * 100;
          const renteHeight = totalHeight - indskudHeight;
          return (
            <div key={d.aar} className="flex-1 flex flex-col justify-end items-center" title={`${gl.yearLabel} ${d.aar}`}>
              <div className="w-full flex flex-col justify-end" style={{ height: "160px" }}>
                <div
                  className="bg-green-400 dark:bg-green-500 rounded-t-sm w-full"
                  style={{ height: `${renteHeight}%` }}
                  title={`${gl.interest}: ${Math.round(d.rente).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK")} ${getCurrencySuffix(locale)}`}
                />
                <div
                  className="bg-blue-400 dark:bg-blue-500 w-full"
                  style={{ height: `${indskudHeight}%` }}
                  title={`${gl.deposit}: ${Math.round(d.indskud).toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK")} ${getCurrencySuffix(locale)}`}
                />
              </div>
              <span className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{d.aar}</span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-blue-400 dark:bg-blue-500 inline-block" /> {gl.deposit}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-500 inline-block" /> {gl.interest}
        </span>
      </div>
    </div>
  );
}

export default function OpsparingsBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      calcSavings: "Beregn opsparing",
      reachGoal: "N\u00e5 et m\u00e5l",
      startAmount: "Startbel\u00f8b (kr)",
      monthlyDeposit: "M\u00e5nedlig indbetaling (kr)",
      annualRate: "\u00c5rlig rente (%)",
      savingsPeriod: "Opsparingsperiode (\u00e5r)",
      compounding: "Rentetilskrivning",
      monthly: "M\u00e5nedlig",
      quarterly: "Kvartalsvis",
      yearly: "\u00c5rlig",
      showInflation: "Vis inflations-justeret (real v\u00e6rdi)",
      inflationLabel: "% inflation",
      calculating: "Beregner din opsparing...",
      savingsAfter: (years: number) => `Din opsparing efter ${years} \u00e5r`,
      realValue: (inflPct: number) => `Real v\u00e6rdi (efter ${inflPct}% inflation):`,
      totalDeposit: "Samlet indskud",
      totalInterest: "Samlet rente",
      gain: "Gevinst",
      compareReturns: "Sammenligning af afkast",
      extraPointsGive: (pts: string, amt: string) => `+${pts} procentpoint ekstra giver ${amt} mere`,
      interestLabel: "rente",
      seeYearlyDev: "Se \u00e5rlig udvikling",
      yearLabel: "\u00c5r",
      depositLabel: "Indskud",
      interestCol: "Rente",
      balanceLabel: "Saldo",
      compoundTitle: "Renters rente-effekten",
      compoundDesc: (yrs: number, intAmt: string, depAmt: string) =>
        `Med renters rente tjener du ikke kun rente p\u00e5 dit indskud, men ogs\u00e5 p\u00e5 den rente du allerede har tjent. Over ${yrs} \u00e5r giver dette en ekstra gevinst p\u00e5 ${intAmt} i rente oveni dine indbetalinger p\u00e5 ${depAmt}.`,
      afterYears: (amt: string, yrs: number) => `${amt} efter ${yrs} \u00e5r`,
      calcName: "Opsparingsberegner",
      goalAmount: "M\u00e5l-bel\u00f8b",
      startAmountGoal: "Startbel\u00f8b",
      monthlyPayment: "M\u00e5nedlig indbetaling",
      expectedRate: "Forventet \u00e5rlig rente (%)",
      youReach: (amt: string) => `Du n\u00e5r ${amt} p\u00e5`,
      yearUnit: "\u00e5r",
      monthUnit: "md.",
      andWord: "og",
      totalDepositGoal: "Samlet indskud",
      earnedInterest: "Tjent i rente",
      reachSummary: (amt: string, yrs: number, mos: number) => `N\u00e5r ${amt} p\u00e5 ${yrs} \u00e5r og ${mos} md.`,
      goalUnreachable: "M\u00e5let kan ikke n\u00e5s inden for 50 \u00e5r med de angivne v\u00e6rdier. Pr\u00f8v at \u00f8ge indbetalingen eller renten.",
    },
    se: {
      calcSavings: "Ber\u00e4kna sparande",
      reachGoal: "N\u00e5 ett m\u00e5l",
      startAmount: "Startbelopp (kr)",
      monthlyDeposit: "M\u00e5natlig ins\u00e4ttning (kr)",
      annualRate: "\u00c5rsr\u00e4nta (%)",
      savingsPeriod: "Sparperiod (\u00e5r)",
      compounding: "R\u00e4nteberäkning",
      monthly: "M\u00e5natlig",
      quarterly: "Kvartalsvis",
      yearly: "\u00c5rlig",
      showInflation: "Visa inflationsjusterat (realt v\u00e4rde)",
      inflationLabel: "% inflation",
      calculating: "Ber\u00e4knar ditt sparande...",
      savingsAfter: (years: number) => `Ditt sparande efter ${years} \u00e5r`,
      realValue: (inflPct: number) => `Realt v\u00e4rde (efter ${inflPct}% inflation):`,
      totalDeposit: "Totala ins\u00e4ttningar",
      totalInterest: "Total r\u00e4nta",
      gain: "Vinst",
      compareReturns: "J\u00e4mf\u00f6relse av avkastning",
      extraPointsGive: (pts: string, amt: string) => `+${pts} procentenheter extra ger ${amt} mer`,
      interestLabel: "r\u00e4nta",
      seeYearlyDev: "Se \u00e5rlig utveckling",
      yearLabel: "\u00c5r",
      depositLabel: "Ins\u00e4ttning",
      interestCol: "R\u00e4nta",
      balanceLabel: "Saldo",
      compoundTitle: "R\u00e4nta-p\u00e5-r\u00e4nta-effekten",
      compoundDesc: (yrs: number, intAmt: string, depAmt: string) =>
        `Med r\u00e4nta p\u00e5 r\u00e4nta tj\u00e4nar du inte bara r\u00e4nta p\u00e5 dina ins\u00e4ttningar, utan ocks\u00e5 p\u00e5 den r\u00e4nta du redan har tj\u00e4nat. Under ${yrs} \u00e5r ger detta en extra vinst p\u00e5 ${intAmt} i r\u00e4nta ut\u00f6ver dina ins\u00e4ttningar p\u00e5 ${depAmt}.`,
      afterYears: (amt: string, yrs: number) => `${amt} efter ${yrs} \u00e5r`,
      calcName: "Sparkalkylator",
      goalAmount: "M\u00e5lbelopp",
      startAmountGoal: "Startbelopp",
      monthlyPayment: "M\u00e5natlig ins\u00e4ttning",
      expectedRate: "F\u00f6rv\u00e4ntad \u00e5rsr\u00e4nta (%)",
      youReach: (amt: string) => `Du n\u00e5r ${amt} p\u00e5`,
      yearUnit: "\u00e5r",
      monthUnit: "m\u00e5n.",
      andWord: "och",
      totalDepositGoal: "Totala ins\u00e4ttningar",
      earnedInterest: "Intj\u00e4nad r\u00e4nta",
      reachSummary: (amt: string, yrs: number, mos: number) => `N\u00e5r ${amt} p\u00e5 ${yrs} \u00e5r och ${mos} m\u00e5n.`,
      goalUnreachable: "M\u00e5let kan inte n\u00e5s inom 50 \u00e5r med angivna v\u00e4rden. F\u00f6rs\u00f6k \u00f6ka ins\u00e4ttningen eller r\u00e4ntan.",
    },
    no: {
      calcSavings: "Beregn sparing",
      reachGoal: "N\u00e5 et m\u00e5l",
      startAmount: "Startbel\u00f8p (kr)",
      monthlyDeposit: "M\u00e5nedlig innskudd (kr)",
      annualRate: "\u00c5rlig rente (%)",
      savingsPeriod: "Spareperiode (\u00e5r)",
      compounding: "Renteberegning",
      monthly: "M\u00e5nedlig",
      quarterly: "Kvartalsvis",
      yearly: "\u00c5rlig",
      showInflation: "Vis inflasjonsjustert (reell verdi)",
      inflationLabel: "% inflasjon",
      calculating: "Beregner din sparing...",
      savingsAfter: (years: number) => `Din sparing etter ${years} \u00e5r`,
      realValue: (inflPct: number) => `Reell verdi (etter ${inflPct}% inflasjon):`,
      totalDeposit: "Samlet innskudd",
      totalInterest: "Samlet rente",
      gain: "Gevinst",
      compareReturns: "Sammenligning av avkastning",
      extraPointsGive: (pts: string, amt: string) => `+${pts} prosentpoeng ekstra gir ${amt} mer`,
      interestLabel: "rente",
      seeYearlyDev: "Se \u00e5rlig utvikling",
      yearLabel: "\u00c5r",
      depositLabel: "Innskudd",
      interestCol: "Rente",
      balanceLabel: "Saldo",
      compoundTitle: "Rentes rente-effekten",
      compoundDesc: (yrs: number, intAmt: string, depAmt: string) =>
        `Med rentes rente tjener du ikke bare rente p\u00e5 innskuddet ditt, men ogs\u00e5 p\u00e5 renten du allerede har tjent. Over ${yrs} \u00e5r gir dette en ekstra gevinst p\u00e5 ${intAmt} i rente i tillegg til dine innbetalinger p\u00e5 ${depAmt}.`,
      afterYears: (amt: string, yrs: number) => `${amt} etter ${yrs} \u00e5r`,
      calcName: "Sparekalkulator",
      goalAmount: "M\u00e5lbel\u00f8p",
      startAmountGoal: "Startbel\u00f8p",
      monthlyPayment: "M\u00e5nedlig innskudd",
      expectedRate: "Forventet \u00e5rlig rente (%)",
      youReach: (amt: string) => `Du n\u00e5r ${amt} p\u00e5`,
      yearUnit: "\u00e5r",
      monthUnit: "md.",
      andWord: "og",
      totalDepositGoal: "Samlet innskudd",
      earnedInterest: "Tjent i rente",
      reachSummary: (amt: string, yrs: number, mos: number) => `N\u00e5r ${amt} p\u00e5 ${yrs} \u00e5r og ${mos} md.`,
      goalUnreachable: "M\u00e5let kan ikke n\u00e5s innen 50 \u00e5r med de angitte verdiene. Pr\u00f8v \u00e5 \u00f8ke innbetalingen eller renten.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [visning, setVisning] = useState<Visning>("beregner");

  const [startBeloeb, setStartBeloeb] = useState<number>(10000);
  const [maanedligIndbetaling, setMaanedligIndbetaling] = useState<number>(1000);
  const [aarligRente, setAarligRente] = useState<number>(5);
  const [periode, setPeriode] = useState<number>(10);
  const [renteFrekvens, setRenteFrekvens] = useState<Frekvens>("aarlig");
  const [visInflation, setVisInflation] = useState(false);
  const [inflation, setInflation] = useState<number>(2);

  const [maalBeloeb, setMaalBeloeb] = useState<number>(500000);
  const [maalStart, setMaalStart] = useState<number>(10000);
  const [maalMaanedlig, setMaalMaanedlig] = useState<number>(1000);
  const [maalRente, setMaalRente] = useState<number>(5);

  const isLoading = useCalculationLoading([startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'opsparing') {
      const inputs = urlState.inputs;
      if (inputs.visning) setVisning(inputs.visning);
      if (inputs.startBeloeb !== undefined) setStartBeloeb(inputs.startBeloeb);
      if (inputs.maanedligIndbetaling !== undefined) setMaanedligIndbetaling(inputs.maanedligIndbetaling);
      if (inputs.aarligRente !== undefined) setAarligRente(inputs.aarligRente);
      if (inputs.periode !== undefined) setPeriode(inputs.periode);
      if (inputs.renteFrekvens) setRenteFrekvens(inputs.renteFrekvens);
      if (inputs.maalBeloeb !== undefined) setMaalBeloeb(inputs.maalBeloeb);
      if (inputs.maalStart !== undefined) setMaalStart(inputs.maalStart);
      if (inputs.maalMaanedlig !== undefined) setMaalMaanedlig(inputs.maalMaanedlig);
      if (inputs.maalRente !== undefined) setMaalRente(inputs.maalRente);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("opsparing");
    const timer = setTimeout(() => {
      trackCalculation("opsparing");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'opsparing',
      inputs: {
        visning, startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens,
        maalBeloeb, maalStart, maalMaanedlig, maalRente,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [visning, startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens,
      maalBeloeb, maalStart, maalMaanedlig, maalRente]);

  const handleReset = useCallback(() => {
    setVisning("beregner");
    setStartBeloeb(10000);
    setMaanedligIndbetaling(1000);
    setAarligRente(5);
    setPeriode(10);
    setRenteFrekvens("aarlig");
    setVisInflation(false);
    setInflation(2);
    setMaalBeloeb(500000);
    setMaalStart(10000);
    setMaalMaanedlig(1000);
    setMaalRente(5);
  }, []);

  const beregning = useMemo(() => {
    if (periode <= 0) return null;
    return simulerOpsparing(startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens);
  }, [startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  const scenarier = useMemo(() => {
    if (periode <= 0) return null;
    const satser = [aarligRente, aarligRente + 2, aarligRente + 5].filter(r => r > 0 && r <= 30);
    return satser.map((r) => {
      const sim = simulerOpsparing(startBeloeb, maanedligIndbetaling, r, periode, renteFrekvens);
      return { rente: r, slutSaldo: sim.slutSaldo, samletRente: sim.samletRente };
    });
  }, [startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  const realAfkast = useMemo(() => {
    if (!beregning || !visInflation) return null;
    const realRente = ((1 + aarligRente / 100) / (1 + inflation / 100) - 1) * 100;
    if (realRente <= -100) return null;
    const sim = simulerOpsparing(startBeloeb, maanedligIndbetaling, realRente, periode, renteFrekvens);
    return { realSaldo: sim.slutSaldo, realRente: realRente.toFixed(2) };
  }, [beregning, visInflation, inflation, startBeloeb, maanedligIndbetaling, aarligRente, periode, renteFrekvens]);

  const maalResultat = useMemo(() => {
    if (maalBeloeb <= maalStart || maalRente <= 0 || maalMaanedlig <= 0) return null;
    const maanedligRente = maalRente / 100 / 12;
    let saldo = maalStart;
    let maaneder = 0;
    const maxMaaneder = 600;
    while (saldo < maalBeloeb && maaneder < maxMaaneder) {
      saldo += maalMaanedlig;
      saldo += saldo * maanedligRente;
      maaneder++;
    }
    if (maaneder >= maxMaaneder) return null;
    const aar = Math.floor(maaneder / 12);
    const restMaaneder = maaneder % 12;
    const samletIndskud = maalStart + maalMaanedlig * maaneder;
    return { aar, maaneder: restMaaneder, samletIndskud, samletRente: saldo - samletIndskud };
  }, [maalBeloeb, maalStart, maalMaanedlig, maalRente]);

  const formatKr = (beloeb: number) => formatCurrency(beloeb, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button type="button"
          onClick={() => setVisning("beregner")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "beregner"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {l.calcSavings}
        </button>
        <button type="button"
          onClick={() => setVisning("maal")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "maal"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {l.reachGoal}
        </button>
      </div>

      {visning === "beregner" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField label={l.startAmount} value={startBeloeb} onChange={setStartBeloeb} min={0} step={1000} unit="kr" />
              <InputField label={l.monthlyDeposit} value={maanedligIndbetaling} onChange={setMaanedligIndbetaling} min={0} step={100} unit="kr" />
            </div>
            <div className="space-y-4">
              <InputField label={l.annualRate} value={aarligRente} onChange={setAarligRente} min={0} max={50} step={0.1} />
              <InputField label={l.savingsPeriod} value={periode} onChange={setPeriode} min={1} max={50} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.compounding}</label>
            <div className="flex gap-4">
              {([
                { id: "maanedlig" as Frekvens, label: l.monthly },
                { id: "kvartal" as Frekvens, label: l.quarterly },
                { id: "aarlig" as Frekvens, label: l.yearly },
              ]).map((f) => (
                <button type="button"
                  key={f.id}
                  onClick={() => setRenteFrekvens(f.id)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-colors ${
                    renteFrekvens === f.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visInflation}
                onChange={(e) => setVisInflation(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm dark:text-gray-300">{l.showInflation}</span>
            </label>
            {visInflation && (
              <div className="w-24">
                <InputField ariaLabel="Inflation procent" value={inflation} onChange={setInflation} min={0} max={20} step={0.1} inline />
              </div>
            )}
            {visInflation && <span className="text-sm text-gray-500 dark:text-gray-400">{l.inflationLabel}</span>}
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>

          <CalculationLoading isLoading={isLoading} loadingText={l.calculating} minHeight="250px">
            {beregning && (
              <>
                <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-xl text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.savingsAfter(periode)}</p>
                  <p className="text-5xl font-bold text-green-700 dark:text-green-400">{formatKr(beregning.slutSaldo)}</p>
                  {realAfkast && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {l.realValue(inflation)} <strong className="text-green-600 dark:text-green-400">{formatKr(realAfkast.realSaldo)}</strong>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.totalDeposit}</p>
                    <p className="text-xl font-bold dark:text-white">{formatKr(beregning.samletIndskud)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.totalInterest}</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatKr(beregning.samletRente)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.gain}</p>
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">
                      +{beregning.samletIndskud > 0 ? ((beregning.samletRente / beregning.samletIndskud) * 100).toFixed(1) : "0.0"}%
                    </p>
                  </div>
                </div>

                <VaekstGraf aarligData={beregning.aarligData} />

                {scenarier && scenarier.length > 1 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="text-sm font-medium mb-3 dark:text-gray-200">{l.compareReturns}</h4>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {scenarier.map((s, i) => (
                        <div
                          key={s.rente}
                          className={`p-3 rounded-lg ${
                            i === 0
                              ? "bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700"
                              : "bg-white dark:bg-gray-700"
                          }`}
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">{s.rente}% p.a.</p>
                          <p className={`text-lg font-bold ${i === 0 ? "text-blue-700 dark:text-blue-400" : "dark:text-white"}`}>
                            {formatKr(s.slutSaldo)}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            +{formatKr(s.samletRente)} {l.interestLabel}
                          </p>
                        </div>
                      ))}
                    </div>
                    {scenarier.length >= 2 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        {l.extraPointsGive(
                          (scenarier[scenarier.length - 1].rente - scenarier[0].rente).toFixed(0),
                          formatKr(scenarier[scenarier.length - 1].slutSaldo - scenarier[0].slutSaldo)
                        )}
                      </p>
                    )}
                  </div>
                )}

                <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <summary className="p-4 cursor-pointer font-medium dark:text-white">{l.seeYearlyDev}</summary>
                  <div className="p-4 pt-0 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b dark:border-gray-600">
                          <th className="py-2 pr-4 dark:text-gray-200">{l.yearLabel}</th>
                          <th className="py-2 pr-4 text-right dark:text-gray-200">{l.depositLabel}</th>
                          <th className="py-2 pr-4 text-right dark:text-gray-200">{l.interestCol}</th>
                          <th className="py-2 text-right dark:text-gray-200">{l.balanceLabel}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beregning.aarligData.map((row) => (
                          <tr key={row.aar} className="border-b border-gray-200 dark:border-gray-700">
                            <td className="py-2 pr-4 dark:text-gray-300">{row.aar}</td>
                            <td className="py-2 pr-4 text-right dark:text-gray-300">{formatKr(row.indskud)}</td>
                            <td className="py-2 pr-4 text-right text-blue-600 dark:text-blue-400">{formatKr(row.rente)}</td>
                            <td className="py-2 text-right font-medium dark:text-white">{formatKr(row.saldo)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="font-medium mb-2 dark:text-blue-200">{l.compoundTitle}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {l.compoundDesc(periode, formatKr(beregning.samletRente), formatKr(beregning.samletIndskud))}
                  </p>
                </div>
              </>
            )}
          </CalculationLoading>

          {beregning && !isLoading && (
            <div className="flex justify-center gap-3">
              <CopyResultButton text={l.afterYears(formatKr(beregning.slutSaldo), periode)} />
              <ShareCalculation
                getShareableLink={getShareableLink}
                calculatorName={l.calcName}
                resultSummary={l.afterYears(formatKr(beregning.slutSaldo), periode)}
              />
            </div>
          )}

          {beregning && !isLoading && (
            <OpsparingAffiliate className="mt-6" />
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField label={l.goalAmount} value={maalBeloeb} onChange={setMaalBeloeb} min={1000} step={10000} unit="kr" />
              <InputField label={l.startAmountGoal} value={maalStart} onChange={setMaalStart} min={0} step={1000} unit="kr" />
            </div>
            <div className="space-y-4">
              <InputField label={l.monthlyPayment} value={maalMaanedlig} onChange={setMaalMaanedlig} min={100} step={100} unit="kr" />
              <InputField label={l.expectedRate} value={maalRente} onChange={setMaalRente} min={0} max={30} step={0.1} />
            </div>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>

          {maalResultat ? (
            <>
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{l.youReach(formatKr(maalBeloeb))}</p>
                  <p className="text-5xl font-bold text-green-700 dark:text-green-400">
                    {maalResultat.aar > 0 && `${maalResultat.aar} ${l.yearUnit}`}
                    {maalResultat.aar > 0 && maalResultat.maaneder > 0 && ` ${l.andWord} `}
                    {maalResultat.maaneder > 0 && `${maalResultat.maaneder} ${l.monthUnit}`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalDepositGoal}</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(maalResultat.samletIndskud)}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.earnedInterest}</p>
                    <p className="font-bold text-lg text-green-600 dark:text-green-400">{formatKr(maalResultat.samletRente)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <CopyResultButton text={l.reachSummary(formatKr(maalBeloeb), maalResultat.aar, maalResultat.maaneder)} />
                <ShareCalculation
                  getShareableLink={getShareableLink}
                  calculatorName={l.calcName}
                  resultSummary={l.reachSummary(formatKr(maalBeloeb), maalResultat.aar, maalResultat.maaneder)}
                />
              </div>
            </>
          ) : maalBeloeb > 0 && maalMaanedlig > 0 ? (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
              <p className="text-yellow-700 dark:text-yellow-400">{l.goalUnreachable}</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
