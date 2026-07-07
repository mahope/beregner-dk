"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BoliglaanAffiliate } from "./AffiliateBox";
import { PrintResult } from "./PrintResult";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type LaanType = "fastforrentet" | "variabel" | "afdragsfrit";
type Visning = "beregner" | "raadtil";

interface AarsOversigt {
  aar: number;
  afdrag: number;
  renter: number;
  ydelse: number;
  restgaeld: number;
}

function genererAmortiseringsplan(
  laanBeloeb: number,
  maanedligRente: number,
  maanedligYdelse: number,
  antalBetalinger: number,
  laanType: LaanType
): AarsOversigt[] {
  const plan: AarsOversigt[] = [];
  let restgaeld = laanBeloeb;
  let aarAfdrag = 0;
  let aarRenter = 0;
  let aarYdelse = 0;

  for (let i = 1; i <= antalBetalinger; i++) {
    const renteBetaling = restgaeld * maanedligRente;
    let afdragBetaling: number;

    if (laanType === "afdragsfrit") {
      afdragBetaling = 0;
    } else {
      afdragBetaling = maanedligYdelse - renteBetaling;
    }

    restgaeld = Math.max(0, restgaeld - afdragBetaling);
    aarAfdrag += afdragBetaling;
    aarRenter += renteBetaling;
    aarYdelse += maanedligYdelse;

    if (i % 12 === 0) {
      plan.push({
        aar: i / 12,
        afdrag: Math.round(aarAfdrag),
        renter: Math.round(aarRenter),
        ydelse: Math.round(aarYdelse),
        restgaeld: Math.round(restgaeld),
      });
      aarAfdrag = 0;
      aarRenter = 0;
      aarYdelse = 0;
    }
  }

  return plan;
}

export default function BoliglaanBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      calcPayment: "Beregn ydelse",
      whatCanIAfford: "Hvad har jeg råd til?",
      propertyPrice: "Boligpris",
      downPayment: "Udbetaling",
      interestRate: "Rente (% p.a.)",
      termLabel: "Løbetid (år)",
      loanType: "Låntype",
      fixedRate: "Fastforrentet",
      variableRate: "Variabel rente (F-kort)",
      interestOnly: "Afdragsfrit (10 år)",
      contributionRate: "Bidragssats (% p.a.)",
      contributionHelp: "Typisk 0.5-1.5% afhængigt af belåningsgrad",
      otherCostsTitle: "Øvrige boligomkostninger (pr. måned)",
      propertyTax: "Ejendomsskat",
      insurance: "Forsikring",
      hoa: "Ejerforening",
      loadingText: "Beregner din boligydelse...",
      monthlyPayment: "Månedlig ydelse",
      afterTaxDeduction: (amount: string) => `Ca. ${amount} efter skattefradrag`,
      totalMonthlyCosts: "Samlede månedlige boligomkostninger",
      paymentLabel: "Ydelse",
      taxLabel: "Skat",
      insuranceLabel: "Forsikring",
      hoaLabel: "Ejerforening",
      ltvLabel: "belåning",
      ltvVeryHigh: "Meget høj belåning - de fleste banker kræver mindst 5% udbetaling",
      ltvHigh: "Over 80% belåning kræver bankgaranti eller tillægslån med højere rente",
      ltvNormal: "Normal belåningsgrad - du får adgang til realkreditlån op til 80%",
      ltvLow: "Lav belåningsgrad - du får de bedste vilkår og laveste bidragssats",
      loanAmount: "Lånebeløb",
      annualPayment: "Årlig ydelse",
      taxDeductionPerYear: "Skattefradrag/år",
      totalPayment: "Samlet betaling",
      ofWhichInterest: "Heraf renter",
      totalRate: "Samlet rente",
      amortVsInterest: "Afdrag vs. rente over tid",
      yearLabel: "År",
      amortLabel: "Afdrag",
      interestLabel: "Renter",
      remainingDebt: "Restgæld",
      hideAmort: "Skjul amortiseringsplan",
      showAmort: "Vis amortiseringsplan (år for år)",
      calcName: "Boliglån Beregner",
      loanSummary: (loanAmt: string, payment: string) => `Lån: ${loanAmt} • Ydelse: ${payment}/md`,
      monthlyBudget: "Månedligt budget til ydelse",
      downPaymentYouHave: "Udbetaling du har",
      expectedRate: "Forventet rente (% p.a.)",
      affordTitle: "Du har råd til en bolig op til",
      withLoan: (amount: string) => `Med et lån på ${amount}`,
      affordResult: (amount: string) => `Råd til bolig op til ${amount}`,
      affordDisclaimer: "Beregningen er vejledende. Kontakt din bank for en præcis vurdering af din lånekapacitet.",
      ratesTitle: "Typiske renter (februar 2026)",
      fixed4: "4% fast (30 år)",
      fixed5: "5% fast (30 år)",
      fShort: "F-kort",
      bankLoan: "Banklån",
      ratesDisclaimer: "Renterne er vejledende. Kontakt din bank for aktuelle tilbud.",
      year10: "10 år",
      year15: "15 år",
      year20: "20 år",
      year25: "25 år",
      year30: "30 år",
    },
    se: {
      calcPayment: "Beräkna betalning",
      whatCanIAfford: "Vad har jag råd med?",
      propertyPrice: "Bostadens pris",
      downPayment: "Kontantinsats",
      interestRate: "Ränta (% p.a.)",
      termLabel: "Löptid (år)",
      loanType: "Låntyp",
      fixedRate: "Fast ränta",
      variableRate: "Rörlig ränta",
      interestOnly: "Amorteringsfritt (10 år)",
      contributionRate: "Avgiftssats (% p.a.)",
      contributionHelp: "Typiskt 0,5–1,5 % beroende på belåningsgrad",
      otherCostsTitle: "Övriga boendekostnader (per månad)",
      propertyTax: "Fastighetsskatt",
      insurance: "Försäkring",
      hoa: "Bostadsrättsförening",
      loadingText: "Beräknar din bostadsbetalning...",
      monthlyPayment: "Månatlig betalning",
      afterTaxDeduction: (amount: string) => `Ca. ${amount} efter ränteavdrag`,
      totalMonthlyCosts: "Totala månatliga boendekostnader",
      paymentLabel: "Betalning",
      taxLabel: "Skatt",
      insuranceLabel: "Försäkring",
      hoaLabel: "Förening",
      ltvLabel: "belåning",
      ltvVeryHigh: "Mycket hög belåning - de flesta banker kräver minst 5 % kontantinsats",
      ltvHigh: "Över 80 % belåning kräver bankgaranti eller tilläggslån med högre ränta",
      ltvNormal: "Normal belåningsgrad - du får tillgång till bolån upp till 80 %",
      ltvLow: "Låg belåningsgrad - du får de bästa villkoren och lägsta avgifterna",
      loanAmount: "Lånebelopp",
      annualPayment: "Årlig betalning",
      taxDeductionPerYear: "Ränteavdrag/år",
      totalPayment: "Total betalning",
      ofWhichInterest: "Varav ränta",
      totalRate: "Total ränta",
      amortVsInterest: "Amortering vs. ränta över tid",
      yearLabel: "År",
      amortLabel: "Amortering",
      interestLabel: "Ränta",
      remainingDebt: "Återstående skuld",
      hideAmort: "Dölj amorteringsplan",
      showAmort: "Visa amorteringsplan (år för år)",
      calcName: "Bolånekalkylator",
      loanSummary: (loanAmt: string, payment: string) => `Lån: ${loanAmt} • Betalning: ${payment}/mån`,
      monthlyBudget: "Månatlig budget för betalning",
      downPaymentYouHave: "Kontantinsats du har",
      expectedRate: "Förväntad ränta (% p.a.)",
      affordTitle: "Du har råd med en bostad upp till",
      withLoan: (amount: string) => `Med ett lån på ${amount}`,
      affordResult: (amount: string) => `Råd med bostad upp till ${amount}`,
      affordDisclaimer: "Beräkningen är vägledande. Kontakta din bank för en exakt bedömning av din lånekapacitet.",
      ratesTitle: "Typiska räntor (februari 2026)",
      fixed4: "4 % fast (30 år)",
      fixed5: "5 % fast (30 år)",
      fShort: "Rörlig",
      bankLoan: "Banklån",
      ratesDisclaimer: "Räntorna är vägledande. Kontakta din bank för aktuella erbjudanden.",
      year10: "10 år",
      year15: "15 år",
      year20: "20 år",
      year25: "25 år",
      year30: "30 år",
    },
    no: {
      calcPayment: "Beregn betaling",
      whatCanIAfford: "Hva har jeg råd til?",
      propertyPrice: "Boligpris",
      downPayment: "Egenkapital",
      interestRate: "Rente (% p.a.)",
      termLabel: "Løpetid (år)",
      loanType: "Lånetype",
      fixedRate: "Fastrente",
      variableRate: "Flytende rente",
      interestOnly: "Avdragsfritt (10 år)",
      contributionRate: "Avgiftssats (% p.a.)",
      contributionHelp: "Typisk 0,5–1,5 % avhengig av belåningsgrad",
      otherCostsTitle: "Øvrige boligkostnader (per måned)",
      propertyTax: "Eiendomsskatt",
      insurance: "Forsikring",
      hoa: "Fellesutgifter",
      loadingText: "Beregner din boligbetaling...",
      monthlyPayment: "Månedlig betaling",
      afterTaxDeduction: (amount: string) => `Ca. ${amount} etter rentefradrag`,
      totalMonthlyCosts: "Totale månedlige boligkostnader",
      paymentLabel: "Betaling",
      taxLabel: "Skatt",
      insuranceLabel: "Forsikring",
      hoaLabel: "Fellesutg.",
      ltvLabel: "belåning",
      ltvVeryHigh: "Svært høy belåning - de fleste banker krever minst 5 % egenkapital",
      ltvHigh: "Over 80 % belåning krever bankgaranti eller tilleggslån med høyere rente",
      ltvNormal: "Normal belåningsgrad - du får tilgang til boliglån opp til 80 %",
      ltvLow: "Lav belåningsgrad - du får de beste vilkårene og laveste avgiftene",
      loanAmount: "Lånebeløp",
      annualPayment: "Årlig betaling",
      taxDeductionPerYear: "Rentefradrag/år",
      totalPayment: "Total betaling",
      ofWhichInterest: "Herav renter",
      totalRate: "Total rente",
      amortVsInterest: "Avdrag vs. rente over tid",
      yearLabel: "År",
      amortLabel: "Avdrag",
      interestLabel: "Renter",
      remainingDebt: "Restgjeld",
      hideAmort: "Skjul nedbetalingsplan",
      showAmort: "Vis nedbetalingsplan (år for år)",
      calcName: "Boliglånskalkulator",
      loanSummary: (loanAmt: string, payment: string) => `Lån: ${loanAmt} • Betaling: ${payment}/md`,
      monthlyBudget: "Månedlig budsjett til betaling",
      downPaymentYouHave: "Egenkapital du har",
      expectedRate: "Forventet rente (% p.a.)",
      affordTitle: "Du har råd til en bolig opp til",
      withLoan: (amount: string) => `Med et lån på ${amount}`,
      affordResult: (amount: string) => `Råd til bolig opp til ${amount}`,
      affordDisclaimer: "Beregningen er veiledende. Kontakt banken din for en nøyaktig vurdering av din lånekapasitet.",
      ratesTitle: "Typiske renter (februar 2026)",
      fixed4: "4 % fast (30 år)",
      fixed5: "5 % fast (30 år)",
      fShort: "Flytende",
      bankLoan: "Banklån",
      ratesDisclaimer: "Rentene er veiledende. Kontakt banken din for aktuelle tilbud.",
      year10: "10 år",
      year15: "15 år",
      year20: "20 år",
      year25: "25 år",
      year30: "30 år",
    },
  };

  const l = labels[locale as keyof typeof labels] || labels.da;

  const [visning, setVisning] = useState<Visning>("beregner");

  // Beregner-inputs
  const [boligpris, setBoligpris] = useState<number>(3000000);
  const [udbetaling, setUdbetaling] = useState<number>(150000);
  const [rente, setRente] = useState<number>(4.5);
  const [loebetid, setLoebetid] = useState<number>(30);
  const [laanType, setLaanType] = useState<LaanType>("fastforrentet");
  const [bidragssats, setBidragssats] = useState<number>(0.75);

  // Boligomkostninger
  const [ejendomsskat, setEjendomsskat] = useState<number>(1500);
  const [forsikring, setForsikring] = useState<number>(500);
  const [ejerforening, setEjerforening] = useState<number>(0);

  // Amortiseringsplan toggle
  const [visAmortisering, setVisAmortisering] = useState(false);

  // "Hvad har jeg råd til?" inputs
  const [maanedligtBudget, setMaanedligtBudget] = useState<number>(12000);
  const [raadRente, setRaadRente] = useState<number>(4.5);
  const [raadLoebetid, setRaadLoebetid] = useState<number>(30);
  const [raadBidrag, setRaadBidrag] = useState<number>(0.75);
  const [raadUdbetaling, setRaadUdbetaling] = useState<number>(200000);

  // Loading state
  const isLoading = useCalculationLoading([boligpris, udbetaling, rente, loebetid, laanType, bidragssats, ejendomsskat, forsikring, ejerforening]);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'boliglaan') {
      const inputs = urlState.inputs;
      if (inputs.visning) setVisning(inputs.visning);
      if (inputs.boligpris !== undefined) setBoligpris(inputs.boligpris);
      if (inputs.udbetaling !== undefined) setUdbetaling(inputs.udbetaling);
      if (inputs.rente !== undefined) setRente(inputs.rente);
      if (inputs.loebetid !== undefined) setLoebetid(inputs.loebetid);
      if (inputs.laanType) setLaanType(inputs.laanType);
      if (inputs.bidragssats !== undefined) setBidragssats(inputs.bidragssats);
      if (inputs.ejendomsskat !== undefined) setEjendomsskat(inputs.ejendomsskat);
      if (inputs.forsikring !== undefined) setForsikring(inputs.forsikring);
      if (inputs.ejerforening !== undefined) setEjerforening(inputs.ejerforening);
      if (inputs.maanedligtBudget !== undefined) setMaanedligtBudget(inputs.maanedligtBudget);
      if (inputs.raadRente !== undefined) setRaadRente(inputs.raadRente);
      if (inputs.raadLoebetid !== undefined) setRaadLoebetid(inputs.raadLoebetid);
      if (inputs.raadBidrag !== undefined) setRaadBidrag(inputs.raadBidrag);
      if (inputs.raadUdbetaling !== undefined) setRaadUdbetaling(inputs.raadUdbetaling);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("boliglaan");
    const timer = setTimeout(() => {
      trackCalculation("boliglaan");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'boliglaan',
      inputs: {
        visning, boligpris, udbetaling, rente, loebetid, laanType, bidragssats,
        ejendomsskat, forsikring, ejerforening,
        maanedligtBudget, raadRente, raadLoebetid, raadBidrag, raadUdbetaling,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [visning, boligpris, udbetaling, rente, loebetid, laanType, bidragssats,
      ejendomsskat, forsikring, ejerforening,
      maanedligtBudget, raadRente, raadLoebetid, raadBidrag, raadUdbetaling]);

  const handleReset = useCallback(() => {
    setVisning("beregner");
    setBoligpris(3000000);
    setUdbetaling(150000);
    setRente(4.5);
    setLoebetid(30);
    setLaanType("fastforrentet");
    setBidragssats(0.75);
    setEjendomsskat(1500);
    setForsikring(500);
    setEjerforening(0);
    setVisAmortisering(false);
    setMaanedligtBudget(12000);
    setRaadRente(4.5);
    setRaadLoebetid(30);
    setRaadBidrag(0.75);
    setRaadUdbetaling(200000);
  }, []);

  const formatKr = useCallback((amount: number) => {
    return formatCurrency(amount, locale as "da" | "no" | "se", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  }, [locale]);

  const currSuffix = getCurrencySuffix(locale as "da" | "no" | "se");

  const resultat = useMemo(() => {
    const laanBeloeb = boligpris - udbetaling;

    if (laanBeloeb <= 0 || rente <= 0 || loebetid <= 0) {
      return null;
    }

    const antalBetalinger = loebetid * 12;
    const samletRente = rente + bidragssats;
    const maanedligRente = samletRente / 100 / 12;

    let maanedligYdelse: number;
    if (laanType === "afdragsfrit") {
      maanedligYdelse = laanBeloeb * maanedligRente;
    } else {
      maanedligYdelse =
        (laanBeloeb * maanedligRente * Math.pow(1 + maanedligRente, antalBetalinger)) /
        (Math.pow(1 + maanedligRente, antalBetalinger) - 1);
    }

    const samletBetaling = maanedligYdelse * antalBetalinger;
    const samletRenter = samletBetaling - laanBeloeb;
    const aarligYdelse = maanedligYdelse * 12;

    const foersteAarsRenter = laanBeloeb * (samletRente / 100);
    const skattefradrag = foersteAarsRenter * 0.256;
    const aarligYdelseEfterSkat = aarligYdelse - skattefradrag;
    const maanedligYdelseEfterSkat = aarligYdelseEfterSkat / 12;

    const belaaningsgrad = (laanBeloeb / boligpris) * 100;

    let vurdering: { tekst: string; farve: string };
    if (belaaningsgrad > 95) {
      vurdering = {
        tekst: l.ltvVeryHigh,
        farve: "text-red-600",
      };
    } else if (belaaningsgrad > 80) {
      vurdering = {
        tekst: l.ltvHigh,
        farve: "text-yellow-600",
      };
    } else if (belaaningsgrad > 60) {
      vurdering = {
        tekst: l.ltvNormal,
        farve: "text-green-600",
      };
    } else {
      vurdering = {
        tekst: l.ltvLow,
        farve: "text-green-700",
      };
    }

    // Samlede boligomkostninger
    const maanedligeOmkostninger = Math.round(maanedligYdelse) + ejendomsskat + forsikring + ejerforening;
    const maanedligeOmkostningerEfterSkat = Math.round(maanedligYdelseEfterSkat) + ejendomsskat + forsikring + ejerforening;

    // Amortiseringsplan
    const amortisering = genererAmortiseringsplan(
      laanBeloeb, maanedligRente, maanedligYdelse, antalBetalinger, laanType
    );

    return {
      laanBeloeb,
      maanedligYdelse: Math.round(maanedligYdelse),
      maanedligYdelseEfterSkat: Math.round(maanedligYdelseEfterSkat),
      aarligYdelse: Math.round(aarligYdelse),
      samletBetaling: Math.round(samletBetaling),
      samletRenter: Math.round(samletRenter),
      skattefradrag: Math.round(skattefradrag),
      belaaningsgrad: belaaningsgrad.toFixed(1),
      vurdering,
      maanedligeOmkostninger,
      maanedligeOmkostningerEfterSkat,
      amortisering,
    };
  }, [boligpris, udbetaling, rente, loebetid, laanType, bidragssats, ejendomsskat, forsikring, ejerforening, l]);

  // Omvendt beregning: "Hvad har jeg råd til?"
  const raadTilResultat = useMemo(() => {
    if (maanedligtBudget <= 0 || raadRente <= 0 || raadLoebetid <= 0) return null;

    const samletRente = raadRente + raadBidrag;
    const maanedligRente = samletRente / 100 / 12;
    const antalBetalinger = raadLoebetid * 12;

    // Omvendt annuitetsberegning: lån = ydelse * ((1+r)^n - 1) / (r * (1+r)^n)
    const faktor = (Math.pow(1 + maanedligRente, antalBetalinger) - 1) /
      (maanedligRente * Math.pow(1 + maanedligRente, antalBetalinger));
    const maxLaan = maanedligtBudget * faktor;
    const maxBoligpris = maxLaan + raadUdbetaling;
    const samletBetaling = maanedligtBudget * antalBetalinger;

    return {
      maxLaan: Math.round(maxLaan),
      maxBoligpris: Math.round(maxBoligpris),
      samletBetaling: Math.round(samletBetaling),
      samletRenter: Math.round(samletBetaling - maxLaan),
    };
  }, [maanedligtBudget, raadRente, raadLoebetid, raadBidrag, raadUdbetaling]);

  return (
    <div className="space-y-8 print-area">
      {/* Visning toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button type="button"
          onClick={() => setVisning("beregner")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "beregner"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {l.calcPayment}
        </button>
        <button type="button"
          onClick={() => setVisning("raadtil")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            visning === "raadtil"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {l.whatCanIAfford}
        </button>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {visning === "beregner" ? (
        <>
          {/* Boliglån input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label={l.propertyPrice}
                value={boligpris}
                onChange={setBoligpris}
                min={100000}
                max={50000000}
                step={50000}
                unit={currSuffix}
                helpText={formatKr(boligpris)}
              />

              <InputField
                label={l.downPayment}
                value={udbetaling}
                onChange={setUdbetaling}
                min={0}
                max={boligpris}
                step={10000}
                unit={currSuffix}
                helpText={`${formatKr(udbetaling)} (${((udbetaling / boligpris) * 100).toFixed(1)}%)`}
              />

              <InputField
                label={l.interestRate}
                value={rente}
                onChange={setRente}
                min={0}
                max={15}
                step={0.1}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.termLabel}</label>
                <select
                  value={loebetid}
                  onChange={(e) => setLoebetid(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="10">{l.year10}</option>
                  <option value="15">{l.year15}</option>
                  <option value="20">{l.year20}</option>
                  <option value="25">{l.year25}</option>
                  <option value="30">{l.year30}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.loanType}</label>
                <div className="flex flex-col gap-2">
                  {([
                    { type: "fastforrentet" as LaanType, label: l.fixedRate },
                    { type: "variabel" as LaanType, label: l.variableRate },
                    { type: "afdragsfrit" as LaanType, label: l.interestOnly },
                  ]).map(({ type, label }) => (
                    <button type="button"
                      key={type}
                      onClick={() => setLaanType(type)}
                      className={`py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                        laanType === type
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 dark:text-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <InputField
                label={l.contributionRate}
                value={bidragssats}
                onChange={setBidragssats}
                min={0}
                max={3}
                step={0.05}
                helpText={l.contributionHelp}
              />
            </div>
          </div>

          {/* Boligomkostninger */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-3 dark:text-white">{l.otherCostsTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label={l.propertyTax}
                value={ejendomsskat}
                onChange={setEjendomsskat}
                min={0}
                max={20000}
                step={100}
                unit={currSuffix}
              />
              <InputField
                label={l.insurance}
                value={forsikring}
                onChange={setForsikring}
                min={0}
                max={10000}
                step={100}
                unit={currSuffix}
              />
              <InputField
                label={l.hoa}
                value={ejerforening}
                onChange={setEjerforening}
                min={0}
                max={20000}
                step={100}
                unit={currSuffix}
              />
            </div>
          </div>

          {/* Resultat */}
          <CalculationLoading
            isLoading={isLoading}
            loadingText={l.loadingText}
            minHeight="300px"
          >
            {resultat && (
              <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{l.monthlyPayment}</p>
                  <p className="text-5xl font-bold text-blue-600">
                    {formatKr(resultat.maanedligYdelse)}
                  </p>
                  <p className="text-lg text-green-600 mt-2">
                    {l.afterTaxDeduction(formatKr(resultat.maanedligYdelseEfterSkat))}
                  </p>
                </div>

                {/* Samlede boligomkostninger */}
                {(ejendomsskat > 0 || forsikring > 0 || ejerforening > 0) && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-2">
                      {l.totalMonthlyCosts}
                    </p>
                    <p className="text-3xl font-bold text-center text-blue-700 dark:text-blue-400">
                      {formatKr(resultat.maanedligeOmkostninger)}
                    </p>
                    <p className="text-sm text-green-600 text-center mt-1">
                      {l.afterTaxDeduction(formatKr(resultat.maanedligeOmkostningerEfterSkat))}
                    </p>
                    <div className="mt-3 flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{l.paymentLabel}: {formatKr(resultat.maanedligYdelse)}</span>
                      {ejendomsskat > 0 && <span>{l.taxLabel}: {formatKr(ejendomsskat)}</span>}
                      {forsikring > 0 && <span>{l.insuranceLabel}: {formatKr(forsikring)}</span>}
                      {ejerforening > 0 && <span>{l.hoaLabel}: {formatKr(ejerforening)}</span>}
                    </div>
                  </div>
                )}

                <div className={`text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700 mb-6 ${resultat.vurdering.farve}`}>
                  <p className="font-medium">{resultat.belaaningsgrad}% {l.ltvLabel}</p>
                  <p className="text-sm mt-1">{resultat.vurdering.tekst}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.loanAmount}</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(resultat.laanBeloeb)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.annualPayment}</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(resultat.aarligYdelse)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.taxDeductionPerYear}</p>
                    <p className="font-bold text-lg text-green-600">-{formatKr(resultat.skattefradrag)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalPayment}</p>
                    <p className="font-bold text-lg dark:text-white">{formatKr(resultat.samletBetaling)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.ofWhichInterest}</p>
                    <p className="font-bold text-lg text-red-600">{formatKr(resultat.samletRenter)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalRate}</p>
                    <p className="font-bold text-lg dark:text-white">{(rente + bidragssats).toFixed(2)}% p.a.</p>
                  </div>
                </div>

                {/* Afdrag vs rente fordeling (visuelt) */}
                {laanType !== "afdragsfrit" && resultat.amortisering.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-3 dark:text-gray-200">{l.amortVsInterest}</h4>
                    <div className="space-y-1.5">
                      {resultat.amortisering
                        .filter((_, i) => i % Math.max(1, Math.floor(resultat.amortisering.length / 10)) === 0 || i === resultat.amortisering.length - 1)
                        .map((aar) => {
                          const total = aar.afdrag + aar.renter;
                          const afdragPct = total > 0 ? (aar.afdrag / total) * 100 : 0;
                          return (
                            <div key={aar.aar} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{l.yearLabel} {aar.aar}</span>
                              <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
                                <div
                                  className="bg-blue-500 transition-all"
                                  style={{ width: `${afdragPct}%` }}
                                  title={`${l.amortLabel}: ${formatKr(aar.afdrag)}`}
                                />
                                <div
                                  className="bg-red-400 transition-all"
                                  style={{ width: `${100 - afdragPct}%` }}
                                  title={`${l.interestLabel}: ${formatKr(aar.renter)}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> {l.amortLabel}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> {l.interestLabel}
                      </span>
                    </div>
                  </div>
                )}

                {/* Amortiseringsplan */}
                <div className="mt-6">
                  <button type="button"
                    onClick={() => setVisAmortisering(!visAmortisering)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {visAmortisering ? l.hideAmort : l.showAmort}
                  </button>

                  {visAmortisering && resultat.amortisering.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b dark:border-gray-600">
                            <th className="text-left py-2 px-2 dark:text-gray-200">{l.yearLabel}</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">{l.paymentLabel}</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">{l.amortLabel}</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">{l.interestLabel}</th>
                            <th className="text-right py-2 px-2 dark:text-gray-200">{l.remainingDebt}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultat.amortisering.map((aar) => (
                            <tr key={aar.aar} className="border-b dark:border-gray-700">
                              <td className="py-2 px-2 dark:text-gray-300">{aar.aar}</td>
                              <td className="text-right py-2 px-2 dark:text-gray-300">{formatKr(aar.ydelse)}</td>
                              <td className="text-right py-2 px-2 text-blue-600 dark:text-blue-400">{formatKr(aar.afdrag)}</td>
                              <td className="text-right py-2 px-2 text-red-600 dark:text-red-400">{formatKr(aar.renter)}</td>
                              <td className="text-right py-2 px-2 font-medium dark:text-gray-300">{formatKr(aar.restgaeld)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Share and Print buttons */}
                <div className="mt-6 flex justify-center gap-3">
                  <CopyResultButton text={l.loanSummary(formatKr(resultat.laanBeloeb), formatKr(resultat.maanedligYdelse))} />
                  <ShareCalculation
                    getShareableLink={getShareableLink}
                    calculatorName={l.calcName}
                    resultSummary={l.loanSummary(formatKr(resultat.laanBeloeb), formatKr(resultat.maanedligYdelse))}
                  />
                  <PrintResult
                    calculatorName={l.calcName}
                    resultSummary={l.loanSummary(formatKr(resultat.laanBeloeb), formatKr(resultat.maanedligYdelse))}
                  />
                </div>
              </div>
            )}
          </CalculationLoading>

          {/* Affiliate box */}
          {resultat && !isLoading && (
            <BoliglaanAffiliate className="mt-6" />
          )}
        </>
      ) : (
        <>
          {/* "Hvad har jeg råd til?" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label={l.monthlyBudget}
                value={maanedligtBudget}
                onChange={setMaanedligtBudget}
                min={1000}
                max={100000}
                step={500}
                unit={currSuffix}
              />

              <InputField
                label={l.downPaymentYouHave}
                value={raadUdbetaling}
                onChange={setRaadUdbetaling}
                min={0}
                max={10000000}
                step={10000}
                unit={currSuffix}
              />
            </div>

            <div className="space-y-4">
              <InputField
                label={l.expectedRate}
                value={raadRente}
                onChange={setRaadRente}
                min={0}
                max={15}
                step={0.1}
              />

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.termLabel}</label>
                <select
                  value={raadLoebetid}
                  onChange={(e) => setRaadLoebetid(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-lg bg-white dark:bg-gray-800 dark:text-white"
                >
                  <option value="10">{l.year10}</option>
                  <option value="15">{l.year15}</option>
                  <option value="20">{l.year20}</option>
                  <option value="25">{l.year25}</option>
                  <option value="30">{l.year30}</option>
                </select>
              </div>

              <InputField
                label={l.contributionRate}
                value={raadBidrag}
                onChange={setRaadBidrag}
                min={0}
                max={3}
                step={0.05}
              />
            </div>
          </div>

          {/* Råd til resultat */}
          {raadTilResultat && (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{l.affordTitle}</p>
                <p className="text-5xl font-bold text-blue-600">
                  {formatKr(raadTilResultat.maxBoligpris)}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                  {l.withLoan(formatKr(raadTilResultat.maxLaan))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{l.monthlyPayment}</p>
                  <p className="font-bold text-lg dark:text-white">{formatKr(maanedligtBudget)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{l.downPayment}</p>
                  <p className="font-bold text-lg dark:text-white">{formatKr(raadUdbetaling)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{l.totalPayment}</p>
                  <p className="font-bold text-lg dark:text-white">{formatKr(raadTilResultat.samletBetaling)}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{l.ofWhichInterest}</p>
                  <p className="font-bold text-lg text-red-600">{formatKr(raadTilResultat.samletRenter)}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                {l.affordDisclaimer}
              </p>
            </div>
          )}

          {raadTilResultat && (
            <div className="flex justify-center gap-3">
              <CopyResultButton text={l.affordResult(formatKr(raadTilResultat.maxBoligpris))} />
              <ShareCalculation
                getShareableLink={getShareableLink}
                calculatorName={l.calcName}
                resultSummary={l.affordResult(formatKr(raadTilResultat.maxBoligpris))}
              />
            </div>
          )}
        </>
      )}

      {/* Aktuelle renter */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-blue-800 dark:text-blue-200">{l.ratesTitle}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{l.fixed4}</span>
            <p className="dark:text-gray-300">ca. 3.5-4.0%</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{l.fixed5}</span>
            <p className="dark:text-gray-300">ca. 4.5-5.0%</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{l.fShort}</span>
            <p className="dark:text-gray-300">ca. 3.5-4.0%</p>
          </div>
          <div>
            <span className="text-blue-600 dark:text-blue-400 font-medium">{l.bankLoan}</span>
            <p className="dark:text-gray-300">ca. 5.0-7.0%</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">{l.ratesDisclaimer}</p>
      </div>
    </div>
  );
}
