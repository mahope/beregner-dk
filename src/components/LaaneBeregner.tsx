"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type LaaneType = "annuitet" | "serie" | "sammenlign";

export default function LaaneBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      calcType: "Beregningstype",
      annuitet: "Annuitetsl\u00e5n",
      annuitetDesc: "Fast m\u00e5nedlig ydelse",
      serie: "Seriel\u00e5n",
      serieDesc: "Faldende ydelse",
      sammenlign: "Sammenlign l\u00e5n",
      sammenlignDesc: "To l\u00e5n side om side",
      loanAmount: "L\u00e5nebel\u00f8b",
      annualRate: "\u00c5rlig rente (%)",
      term: "L\u00f8betid (\u00e5r)",
      termUnit: "\u00e5r",
      setupFee: "Stiftelsesgebyr",
      loan2Title: "L\u00e5n 2 (til sammenligning)",
      monthlyPayment: "M\u00e5nedlig ydelse",
      totalInterest: "Samlede renter",
      totalRepayment: "Samlet tilbagebetaling",
      aprApprox: "\u00c5OP (ca.)",
      firstPayment: "F\u00f8rste ydelse",
      lastPayment: "Sidste ydelse",
      fixedInstallment: "Fast afdrag/md",
      avgPayment: "Gennemsnit ydelse",
      loan1Label: "L\u00e5n 1",
      loan2Label: "L\u00e5n 2",
      total: "Total",
      cheaperTotal: (loanLabel: string, amount: string) => `${loanLabel} er ${amount} billigere totalt`,
      amortTitle: "Afdragsplan (f\u00f8rste 12 m\u00e5neder)",
      monthShort: "Md.",
      payment: "Ydelse",
      interest: "Rente",
      installment: "Afdrag",
      remainingDebt: "Restg\u00e6ld",
      loanSummary: (amount: string, years: number, rate: number, payment: string) =>
        `L\u00e5n ${amount} i ${years} \u00e5r til ${rate}% - ydelse ${payment}/md`,
      calcName: "L\u00e5neberegner",
      importantTitle: "Vigtigt om l\u00e5n",
      importantItems: [
        "Sammenlign altid \u00c5OP (\u00e5rlig omkostning i procent), ikke kun renten",
        "Tjek alle gebyrer: stiftelse, administration, indfrielse",
        "Kortere l\u00f8betid = h\u00f8jere ydelse, men f\u00e6rre renteudgifter",
        "Overvej om du kan klare uforudsete udgifter ved siden af l\u00e5net",
      ],
    },
    se: {
      calcType: "Ber\u00e4kningstyp",
      annuitet: "Annuitetsl\u00e5n",
      annuitetDesc: "Fast m\u00e5natlig betalning",
      serie: "Seriel\u00e5n",
      serieDesc: "Sjunkande betalning",
      sammenlign: "J\u00e4mf\u00f6r l\u00e5n",
      sammenlignDesc: "Tv\u00e5 l\u00e5n sida vid sida",
      loanAmount: "L\u00e5nebelopp",
      annualRate: "\u00c5rsr\u00e4nta (%)",
      term: "L\u00f6ptid (\u00e5r)",
      termUnit: "\u00e5r",
      setupFee: "Uppl\u00e4ggningsavgift",
      loan2Title: "L\u00e5n 2 (f\u00f6r j\u00e4mf\u00f6relse)",
      monthlyPayment: "M\u00e5natlig betalning",
      totalInterest: "Total r\u00e4nta",
      totalRepayment: "Total \u00e5terbetalning",
      aprApprox: "Effektiv r\u00e4nta (ca.)",
      firstPayment: "F\u00f6rsta betalning",
      lastPayment: "Sista betalning",
      fixedInstallment: "Fast amortering/m\u00e5n",
      avgPayment: "Genomsnittlig betalning",
      loan1Label: "L\u00e5n 1",
      loan2Label: "L\u00e5n 2",
      total: "Totalt",
      cheaperTotal: (loanLabel: string, amount: string) => `${loanLabel} \u00e4r ${amount} billigare totalt`,
      amortTitle: "Amorteringsplan (f\u00f6rsta 12 m\u00e5naderna)",
      monthShort: "M\u00e5n.",
      payment: "Betalning",
      interest: "R\u00e4nta",
      installment: "Amortering",
      remainingDebt: "\u00c5terst\u00e5ende skuld",
      loanSummary: (amount: string, years: number, rate: number, payment: string) =>
        `L\u00e5n ${amount} i ${years} \u00e5r till ${rate}% - betalning ${payment}/m\u00e5n`,
      calcName: "L\u00e5nekalkylator",
      importantTitle: "Viktigt om l\u00e5n",
      importantItems: [
        "J\u00e4mf\u00f6r alltid effektiv r\u00e4nta, inte bara nominell r\u00e4nta",
        "Kontrollera alla avgifter: uppl\u00e4ggning, administration, inl\u00f6sen",
        "Kortare l\u00f6ptid = h\u00f6gre betalning, men l\u00e4gre r\u00e4ntekostnader",
        "Fundera p\u00e5 om du klarar of\u00f6rutsedda utgifter vid sidan av l\u00e5net",
      ],
    },
    no: {
      calcType: "Beregningstype",
      annuitet: "Annuitetsl\u00e5n",
      annuitetDesc: "Fast m\u00e5nedlig betaling",
      serie: "Seriel\u00e5n",
      serieDesc: "Synkende betaling",
      sammenlign: "Sammenlign l\u00e5n",
      sammenlignDesc: "To l\u00e5n side om side",
      loanAmount: "L\u00e5nebel\u00f8p",
      annualRate: "\u00c5rlig rente (%)",
      term: "L\u00f8petid (\u00e5r)",
      termUnit: "\u00e5r",
      setupFee: "Etableringsgebyr",
      loan2Title: "L\u00e5n 2 (til sammenligning)",
      monthlyPayment: "M\u00e5nedlig betaling",
      totalInterest: "Samlede renter",
      totalRepayment: "Samlet tilbakebetaling",
      aprApprox: "Eff. rente (ca.)",
      firstPayment: "F\u00f8rste betaling",
      lastPayment: "Siste betaling",
      fixedInstallment: "Fast avdrag/md",
      avgPayment: "Gjennomsnitt betaling",
      loan1Label: "L\u00e5n 1",
      loan2Label: "L\u00e5n 2",
      total: "Totalt",
      cheaperTotal: (loanLabel: string, amount: string) => `${loanLabel} er ${amount} billigere totalt`,
      amortTitle: "Nedbetalingsplan (f\u00f8rste 12 m\u00e5neder)",
      monthShort: "Md.",
      payment: "Betaling",
      interest: "Rente",
      installment: "Avdrag",
      remainingDebt: "Restgjeld",
      loanSummary: (amount: string, years: number, rate: number, payment: string) =>
        `L\u00e5n ${amount} i ${years} \u00e5r til ${rate}% - betaling ${payment}/md`,
      calcName: "L\u00e5nekalkulator",
      importantTitle: "Viktig om l\u00e5n",
      importantItems: [
        "Sammenlign alltid effektiv rente, ikke bare nominell rente",
        "Sjekk alle gebyrer: etablering, administrasjon, innfrielse",
        "Kortere l\u00f8petid = h\u00f8yere betaling, men lavere rentekostnader",
        "Vurder om du klarer uforutsette utgifter ved siden av l\u00e5net",
      ],
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [laaneType, setLaaneType] = useState<LaaneType>("annuitet");
  const [hovedstol, setHovedstol] = useState<number>(100000);
  const [loebetidAar, setLoebetidAar] = useState<number>(5);
  const [renteSats, setRenteSats] = useState<number>(8);
  const [stiftelsesgebyr, setStiftelsesgebyr] = useState<number>(0);

  // Til sammenligning
  const [rente2, setRente2] = useState<number>(12);
  const [loebetid2, setLoebetid2] = useState<number>(3);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'laaneberegner') {
      const inputs = urlState.inputs;
      if (inputs.laaneType) setLaaneType(inputs.laaneType);
      if (inputs.hovedstol !== undefined) setHovedstol(inputs.hovedstol);
      if (inputs.loebetidAar !== undefined) setLoebetidAar(inputs.loebetidAar);
      if (inputs.renteSats !== undefined) setRenteSats(inputs.renteSats);
      if (inputs.stiftelsesgebyr !== undefined) setStiftelsesgebyr(inputs.stiftelsesgebyr);
      if (inputs.rente2 !== undefined) setRente2(inputs.rente2);
      if (inputs.loebetid2 !== undefined) setLoebetid2(inputs.loebetid2);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("laaneberegner");
    const timer = setTimeout(() => {
      trackCalculation("laaneberegner");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => {
    setLaaneType("annuitet");
    setHovedstol(100000);
    setLoebetidAar(5);
    setRenteSats(8);
    setStiftelsesgebyr(0);
    setRente2(12);
    setLoebetid2(3);
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'laaneberegner',
      inputs: { laaneType, hovedstol, loebetidAar, renteSats, stiftelsesgebyr, rente2, loebetid2 },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [laaneType, hovedstol, loebetidAar, renteSats, stiftelsesgebyr, rente2, loebetid2]);

  const beregning = useMemo(() => {
    const r = renteSats / 100 / 12;
    const n = loebetidAar * 12;

    let annuitetYdelse = 0;
    let annuitetTotal = 0;
    let annuitetRenter = 0;

    if (n > 0) {
      annuitetYdelse = r > 0
        ? hovedstol * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
        : hovedstol / n;
      annuitetTotal = annuitetYdelse * n + stiftelsesgebyr;
      annuitetRenter = annuitetTotal - hovedstol - stiftelsesgebyr;
    }

    const serieAfdrag = hovedstol / n;
    const serieForsteYdelse = serieAfdrag + (hovedstol * r);
    const serieSidsteYdelse = serieAfdrag + (serieAfdrag * r);
    const serieGennemsnitYdelse = (serieForsteYdelse + serieSidsteYdelse) / 2;
    const serieRenter = hovedstol * r * (n + 1) / 2;
    const serieTotal = hovedstol + serieRenter + stiftelsesgebyr;

    const aopAnnuitet = annuitetRenter > 0
      ? ((annuitetRenter + stiftelsesgebyr) / hovedstol) / loebetidAar * 100
      : 0;

    const r2 = rente2 / 100 / 12;
    const n2 = loebetid2 * 12;
    let laan2Ydelse = 0;
    let laan2Total = 0;
    let laan2Renter = 0;

    if (n2 > 0) {
      laan2Ydelse = r2 > 0
        ? hovedstol * (r2 * Math.pow(1 + r2, n2)) / (Math.pow(1 + r2, n2) - 1)
        : hovedstol / n2;
      laan2Total = laan2Ydelse * n2;
      laan2Renter = laan2Total - hovedstol;
    }

    const afdragsplan = [];
    let restgaeld = hovedstol;
    for (let i = 1; i <= Math.min(12, n); i++) {
      const renteBeloeb = restgaeld * r;
      const afdrag = annuitetYdelse - renteBeloeb;
      restgaeld -= afdrag;
      afdragsplan.push({
        maaned: i,
        ydelse: annuitetYdelse,
        rente: renteBeloeb,
        afdrag: afdrag,
        restgaeld: Math.max(0, restgaeld),
      });
    }

    return {
      annuitetYdelse, annuitetTotal, annuitetRenter, aopAnnuitet,
      serieAfdrag, serieForsteYdelse, serieSidsteYdelse, serieGennemsnitYdelse, serieRenter, serieTotal,
      laan2Ydelse, laan2Total, laan2Renter,
      forskelTotal: annuitetTotal - laan2Total,
      afdragsplan,
    };
  }, [hovedstol, loebetidAar, renteSats, stiftelsesgebyr, rente2, loebetid2]);

  const formatKr = (amount: number) => formatCurrency(amount, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Lånetype valg */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-gray-200">{l.calcType}</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button type="button"
            onClick={() => setLaaneType("annuitet")}
            className={`p-4 rounded-lg border-2 text-left ${
              laaneType === "annuitet"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
            }`}
          >
            <div className="font-medium dark:text-inherit">{l.annuitet}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{l.annuitetDesc}</div>
          </button>
          <button type="button"
            onClick={() => setLaaneType("serie")}
            className={`p-4 rounded-lg border-2 text-left ${
              laaneType === "serie"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
            }`}
          >
            <div className="font-medium dark:text-inherit">{l.serie}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{l.serieDesc}</div>
          </button>
          <button type="button"
            onClick={() => setLaaneType("sammenlign")}
            className={`p-4 rounded-lg border-2 text-left ${
              laaneType === "sammenlign"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
            }`}
          >
            <div className="font-medium dark:text-inherit">{l.sammenlign}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{l.sammenlignDesc}</div>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-gray-50 rounded-lg p-6 dark:bg-gray-800 dark:border dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.loanAmount}</label>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="1000"
                value={hovedstol}
                onChange={(e) => setHovedstol(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.annualRate}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={renteSats}
                onChange={(e) => setRenteSats(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.term}</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="30"
                step="1"
                value={loebetidAar}
                onChange={(e) => setLoebetidAar(parseFloat(e.target.value) || 1)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">{l.termUnit}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.setupFee}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={stiftelsesgebyr}
                onChange={(e) => setStiftelsesgebyr(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
        </div>

        {laaneType === "sammenlign" && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h4 className="font-medium mb-3 dark:text-white">{l.loan2Title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.annualRate}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={rente2}
                    onChange={(e) => setRente2(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.term}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="1"
                    value={loebetid2}
                    onChange={(e) => setLoebetid2(parseFloat(e.target.value) || 1)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-400">{l.termUnit}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultater */}
      {laaneType === "annuitet" && (
        <>
          <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">{l.monthlyPayment}</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregning.annuitetYdelse)}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(hovedstol)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.loanAmount}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatKr(beregning.annuitetRenter)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalInterest}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.annuitetTotal)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalRepayment}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{beregning.aopAnnuitet.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.aprApprox}</p>
            </div>
          </div>
        </>
      )}

      {laaneType === "serie" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
              <p className="text-sm opacity-90 mb-1">{l.firstPayment}</p>
              <p className="text-3xl font-bold">{formatKr(beregning.serieForsteYdelse)}</p>
            </div>
            <div className="p-6 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl text-center text-white">
              <p className="text-sm opacity-90 mb-1">{l.lastPayment}</p>
              <p className="text-3xl font-bold">{formatKr(beregning.serieSidsteYdelse)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.serieAfdrag)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.fixedInstallment}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.serieGennemsnitYdelse)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.avgPayment}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatKr(beregning.serieRenter)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalInterest}</p>
            </div>
            <div className="p-4 bg-white border rounded-lg text-center dark:bg-gray-800 dark:border-gray-700">
              <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.serieTotal)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalRepayment}</p>
            </div>
          </div>
        </>
      )}

      {laaneType === "sammenlign" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-white border-2 border-blue-500 rounded-xl dark:bg-gray-800">
              <h4 className="font-medium text-blue-600 mb-4 dark:text-blue-400">{l.loan1Label}: {renteSats}% i {loebetidAar} {l.termUnit}</h4>
              <div className="space-y-2 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>{l.monthlyPayment}</span>
                  <span className="font-bold">{formatKr(beregning.annuitetYdelse)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{l.totalInterest}</span>
                  <span className="text-red-600 dark:text-red-400">{formatKr(beregning.annuitetRenter)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                  <span>{l.total}</span>
                  <span className="font-bold">{formatKr(beregning.annuitetTotal)}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white border-2 border-green-500 rounded-xl dark:bg-gray-800">
              <h4 className="font-medium text-green-600 mb-4 dark:text-green-400">{l.loan2Label}: {rente2}% i {loebetid2} {l.termUnit}</h4>
              <div className="space-y-2 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>{l.monthlyPayment}</span>
                  <span className="font-bold">{formatKr(beregning.laan2Ydelse)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{l.totalInterest}</span>
                  <span className="text-red-600 dark:text-red-400">{formatKr(beregning.laan2Renter)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 dark:border-gray-700">
                  <span>{l.total}</span>
                  <span className="font-bold">{formatKr(beregning.laan2Total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg text-center ${beregning.forskelTotal > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            <p className={beregning.forskelTotal > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
              {beregning.forskelTotal > 0
                ? l.cheaperTotal(l.loan2Label, formatKr(Math.abs(beregning.forskelTotal)))
                : l.cheaperTotal(l.loan1Label, formatKr(Math.abs(beregning.forskelTotal)))
              }
            </p>
          </div>
        </>
      )}

      {/* Afdragsplan */}
      {laaneType === "annuitet" && (
        <div className="bg-white border rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700">
          <div className="p-4 bg-gray-50 border-b dark:bg-gray-900/50 dark:border-gray-700">
            <h3 className="font-medium dark:text-white">{l.amortTitle}</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-sm dark:text-gray-300">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 dark:text-gray-300">{l.monthShort}</th>
                  <th className="text-right py-2 dark:text-gray-300">{l.payment}</th>
                  <th className="text-right py-2 dark:text-gray-300">{l.interest}</th>
                  <th className="text-right py-2 dark:text-gray-300">{l.installment}</th>
                  <th className="text-right py-2 dark:text-gray-300">{l.remainingDebt}</th>
                </tr>
              </thead>
              <tbody>
                {beregning.afdragsplan.map((row) => (
                  <tr key={row.maaned} className="border-b last:border-b-0 dark:border-gray-700">
                    <td className="py-2 dark:text-gray-300">{row.maaned}</td>
                    <td className="py-2 text-right dark:text-gray-300">{formatKr(row.ydelse)}</td>
                    <td className="py-2 text-right text-red-600 dark:text-red-400">{formatKr(row.rente)}</td>
                    <td className="py-2 text-right text-green-600 dark:text-green-400">{formatKr(row.afdrag)}</td>
                    <td className="py-2 text-right font-mono dark:text-gray-300">{formatKr(row.restgaeld)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Share button */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={l.loanSummary(formatKr(hovedstol), loebetidAar, renteSats, formatKr(beregning.annuitetYdelse))} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calcName}
          resultSummary={l.loanSummary(formatKr(hovedstol), loebetidAar, renteSats, formatKr(beregning.annuitetYdelse))}
        />
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
        <h3 className="font-medium text-yellow-800 mb-2 dark:text-yellow-300">{l.importantTitle}</h3>
        <ul className="text-sm text-yellow-700 space-y-1 dark:text-yellow-400">
          {l.importantItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
