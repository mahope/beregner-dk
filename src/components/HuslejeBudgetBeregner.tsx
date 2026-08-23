"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { CircleCheck, ClipboardList, Lightbulb, Siren, TriangleAlert, Wallet } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

export default function HuslejeBudgetBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      dinIndkomst: "Din indkomst",
      dinNettoLoen: "Din nettoløn pr. måned",
      partnerRoommate: "Partner/roommate (valgfrit)",
      andreIndkomster: "Andre indkomster",
      andreIndkomsterHelp: "SU, børnepenge, etc.",
      fasteUdgifter: "Dine faste udgifter (ekskl. husleje)",
      madDagligvarer: "Mad & dagligvarer",
      transport: "Transport",
      transportHelp: "Bil, bus, tog",
      forsikringer: "Forsikringer",
      mobilInternet: "Mobil & internet",
      abonnementer: "Abonnementer",
      abonnementerHelp: "Streaming, fitness, etc.",
      andreUdgifter: "Andre udgifter",
      andreUdgifterHelp: "Tøj, hobby, etc.",
      oensketOpsparing: "Ønsket opsparing",
      maaned: "måned",
      anbefaletMin: "10% (anbefalet min.)",
      duKanBruge: "Du kan bruge på husleje",
      prMaanedInkl: "pr. måned inkl. el, vand og varme",
      godOekonomi: "God økonomi",
      acceptabelOekonomi: "Acceptabel økonomi",
      stramOekonomi: "Stram økonomi",
      vurderingGod: "Din økonomi tillader en god husleje med plads til opsparing og uforudsete udgifter.",
      vurderingOk: "Du kan godt betale huslejen, men overvej at reducere andre udgifter for mere buffer.",
      vurderingRisikabel: "Din økonomi er stram. Overvej billigere bolig eller højere indkomst/lavere udgifter.",
      samletIndkomst: "Samlet indkomst",
      fasteUdgifterLabel: "Faste udgifter",
      opsparing: "Opsparing",
      regel30: "30% reglen",
      ditBudget: "Dit budget",
      samletMaanedlig: "Samlet månedlig indkomst",
      tilgaengeligtHusleje: "Tilgængeligt til husleje",
      tipsTitle: "Tommelfingerregler for husleje",
      tip30: "Husleje bør max være 30% af din nettoindkomst",
      tipInkluder: "Husleje + el + vand + varme + evt. internet",
      tipBuffer: "Hav altid 3-6 måneders udgifter i opsparing",
      tipDepositum: "Husk at spare op til 3 måneders husleje i depositum",
    },
    se: {
      dinIndkomst: "Din inkomst",
      dinNettoLoen: "Din nettolön per månad",
      partnerRoommate: "Partner/rumskamrat (valfritt)",
      andreIndkomster: "Övriga inkomster",
      andreIndkomsterHelp: "CSN, barnbidrag, etc.",
      fasteUdgifter: "Dina fasta utgifter (exkl. hyra)",
      madDagligvarer: "Mat & dagligvaror",
      transport: "Transport",
      transportHelp: "Bil, buss, tåg",
      forsikringer: "Försäkringar",
      mobilInternet: "Mobil & internet",
      abonnementer: "Abonnemang",
      abonnementerHelp: "Streaming, gym, etc.",
      andreUdgifter: "Övriga utgifter",
      andreUdgifterHelp: "Kläder, hobby, etc.",
      oensketOpsparing: "Önskat sparande",
      maaned: "månad",
      anbefaletMin: "10% (rekommenderat min.)",
      duKanBruge: "Du kan lägga på hyra",
      prMaanedInkl: "per månad inkl. el, vatten och värme",
      godOekonomi: "God ekonomi",
      acceptabelOekonomi: "Acceptabel ekonomi",
      stramOekonomi: "Stram ekonomi",
      vurderingGod: "Din ekonomi tillåter en bra hyra med utrymme för sparande och oförutsedda utgifter.",
      vurderingOk: "Du kan betala hyran, men överväg att minska andra utgifter för mer buffert.",
      vurderingRisikabel: "Din ekonomi är stram. Överväg billigare boende eller högre inkomst/lägre utgifter.",
      samletIndkomst: "Total inkomst",
      fasteUdgifterLabel: "Fasta utgifter",
      opsparing: "Sparande",
      regel30: "30%-regeln",
      ditBudget: "Din budget",
      samletMaanedlig: "Total månadsinkomst",
      tilgaengeligtHusleje: "Tillgängligt för hyra",
      tipsTitle: "Tumregler för hyra",
      tip30: "Hyran bör max vara 30% av din nettoinkomst",
      tipInkluder: "Hyra + el + vatten + värme + ev. internet",
      tipBuffer: "Ha alltid 3–6 månaders utgifter i sparande",
      tipDepositum: "Kom ihåg att spara upp till 3 månaders hyra i deposition",
    },
    no: {
      dinIndkomst: "Din inntekt",
      dinNettoLoen: "Din nettolønn per måned",
      partnerRoommate: "Partner/romkamerat (valgfritt)",
      andreIndkomster: "Andre inntekter",
      andreIndkomsterHelp: "Studiestøtte, barnetrygd, etc.",
      fasteUdgifter: "Dine faste utgifter (ekskl. husleie)",
      madDagligvarer: "Mat & dagligvarer",
      transport: "Transport",
      transportHelp: "Bil, buss, tog",
      forsikringer: "Forsikringer",
      mobilInternet: "Mobil & internett",
      abonnementer: "Abonnementer",
      abonnementerHelp: "Streaming, trening, etc.",
      andreUdgifter: "Andre utgifter",
      andreUdgifterHelp: "Klær, hobby, etc.",
      oensketOpsparing: "Ønsket sparing",
      maaned: "måned",
      anbefaletMin: "10% (anbefalt min.)",
      duKanBruge: "Du kan bruke på husleie",
      prMaanedInkl: "per måned inkl. strøm, vann og varme",
      godOekonomi: "God økonomi",
      acceptabelOekonomi: "Akseptabel økonomi",
      stramOekonomi: "Stram økonomi",
      vurderingGod: "Økonomien din tillater en god husleie med plass til sparing og uforutsette utgifter.",
      vurderingOk: "Du kan betale husleien, men vurder å redusere andre utgifter for mer buffer.",
      vurderingRisikabel: "Økonomien din er stram. Vurder rimeligere bolig eller høyere inntekt/lavere utgifter.",
      samletIndkomst: "Samlet inntekt",
      fasteUdgifterLabel: "Faste utgifter",
      opsparing: "Sparing",
      regel30: "30%-regelen",
      ditBudget: "Ditt budsjett",
      samletMaanedlig: "Samlet månedlig inntekt",
      tilgaengeligtHusleje: "Tilgjengelig for husleie",
      tipsTitle: "Tommelfingerregler for husleie",
      tip30: "Husleien bør maks være 30% av nettoinntekten din",
      tipInkluder: "Husleie + strøm + vann + varme + evt. internett",
      tipBuffer: "Ha alltid 3–6 måneders utgifter i sparing",
      tipDepositum: "Husk å spare opp til 3 måneders husleie i depositum",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  // Indkomst
  const [maanedligNettoLoen, setMaanedligNettoLoen] = useState<number>(28000);
  const [partnerLoen, setPartnerLoen] = useState<number>(0);
  const [andreIndkomster, setAndreIndkomster] = useState<number>(0);

  // Faste udgifter
  const [madOgDagligvarer, setMadOgDagligvarer] = useState<number>(4000);
  const [transport, setTransport] = useState<number>(2000);
  const [forsikringer, setForsikringer] = useState<number>(1000);
  const [mobilOgInternet, setMobilOgInternet] = useState<number>(500);
  const [abonnementer, setAbonnementer] = useState<number>(500);
  const [andreUdgifter, setAndreUdgifter] = useState<number>(1000);

  // Opsparing
  const [opsparingProcent, setOpsparingProcent] = useState<number>(10);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'husleje-budget') {
      const inputs = urlState.inputs;
      if (inputs.maanedligNettoLoen !== undefined) setMaanedligNettoLoen(inputs.maanedligNettoLoen);
      if (inputs.partnerLoen !== undefined) setPartnerLoen(inputs.partnerLoen);
      if (inputs.andreIndkomster !== undefined) setAndreIndkomster(inputs.andreIndkomster);
      if (inputs.madOgDagligvarer !== undefined) setMadOgDagligvarer(inputs.madOgDagligvarer);
      if (inputs.transport !== undefined) setTransport(inputs.transport);
      if (inputs.forsikringer !== undefined) setForsikringer(inputs.forsikringer);
      if (inputs.mobilOgInternet !== undefined) setMobilOgInternet(inputs.mobilOgInternet);
      if (inputs.abonnementer !== undefined) setAbonnementer(inputs.abonnementer);
      if (inputs.andreUdgifter !== undefined) setAndreUdgifter(inputs.andreUdgifter);
      if (inputs.opsparingProcent !== undefined) setOpsparingProcent(inputs.opsparingProcent);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("husleje");
    const timer = setTimeout(() => {
      trackCalculation("husleje");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'husleje-budget',
      inputs: { maanedligNettoLoen, partnerLoen, andreIndkomster, madOgDagligvarer, transport, forsikringer, mobilOgInternet, abonnementer, andreUdgifter, opsparingProcent },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maanedligNettoLoen, partnerLoen, andreIndkomster, madOgDagligvarer, transport, forsikringer, mobilOgInternet, abonnementer, andreUdgifter, opsparingProcent]);

  const handleReset = useCallback(() => {
    setMaanedligNettoLoen(28000);
    setPartnerLoen(0);
    setAndreIndkomster(0);
    setMadOgDagligvarer(4000);
    setTransport(2000);
    setForsikringer(1000);
    setMobilOgInternet(500);
    setAbonnementer(500);
    setAndreUdgifter(1000);
    setOpsparingProcent(10);
  }, []);

  const beregning = useMemo(() => {
    const samletIndkomst = maanedligNettoLoen + partnerLoen + andreIndkomster;
    const fasteUdgifter = madOgDagligvarer + transport + forsikringer +
                          mobilOgInternet + abonnementer + andreUdgifter;
    const opsparingBeloeb = samletIndkomst * (opsparingProcent / 100);
    const tilHusleje = samletIndkomst - fasteUdgifter - opsparingBeloeb;
    const maxHusleje30Pct = samletIndkomst * 0.30;
    const maxHusleje33Pct = samletIndkomst * 0.33;
    const anbefalet = Math.min(tilHusleje, maxHusleje30Pct);

    let vurdering: "god" | "ok" | "risikabel" = "god";
    let vurderingTekst = "";

    if (tilHusleje >= maxHusleje30Pct) {
      vurdering = "god";
      vurderingTekst = l.vurderingGod;
    } else if (tilHusleje >= maxHusleje30Pct * 0.8) {
      vurdering = "ok";
      vurderingTekst = l.vurderingOk;
    } else {
      vurdering = "risikabel";
      vurderingTekst = l.vurderingRisikabel;
    }

    return {
      samletIndkomst,
      fasteUdgifter,
      opsparingBeloeb,
      tilHusleje,
      maxHusleje30Pct,
      maxHusleje33Pct,
      anbefalet,
      vurdering,
      vurderingTekst,
      resterendeEfterHusleje: tilHusleje - anbefalet,
    };
  }, [maanedligNettoLoen, partnerLoen, andreIndkomster, madOgDagligvarer,
      transport, forsikringer, mobilOgInternet, abonnementer, andreUdgifter, opsparingProcent, l]);

  const formatKr = (amount: number) => formatCurrency(amount, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  const getVurderingFarve = () => {
    switch (beregning.vurdering) {
      case "god": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700";
      case "ok": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700";
      case "risikabel": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700";
    }
  };

  return (
    <div className="space-y-8">
      {/* Indkomst */}
      <div>
        <h3 className="text-lg font-medium mb-4 dark:text-white flex items-center gap-2"><Wallet className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.dinIndkomst}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.dinNettoLoen}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="500"
                value={maanedligNettoLoen}
                onChange={(e) => setMaanedligNettoLoen(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.partnerRoommate}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="500"
                value={partnerLoen}
                onChange={(e) => setPartnerLoen(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.andreIndkomster}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="100"
                value={andreIndkomster}
                onChange={(e) => setAndreIndkomster(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.andreIndkomsterHelp}</p>
          </div>
        </div>
      </div>

      {/* Faste udgifter */}
      <div>
        <h3 className="text-lg font-medium mb-4 dark:text-white flex items-center gap-2"><ClipboardList className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.fasteUdgifter}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.madDagligvarer}</label>
            <div className="relative">
              <input type="number" min="0" step="100" value={madOgDagligvarer} onChange={(e) => setMadOgDagligvarer(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.transport}</label>
            <div className="relative">
              <input type="number" min="0" step="100" value={transport} onChange={(e) => setTransport(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.transportHelp}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.forsikringer}</label>
            <div className="relative">
              <input type="number" min="0" step="100" value={forsikringer} onChange={(e) => setForsikringer(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.mobilInternet}</label>
            <div className="relative">
              <input type="number" min="0" step="50" value={mobilOgInternet} onChange={(e) => setMobilOgInternet(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.abonnementer}</label>
            <div className="relative">
              <input type="number" min="0" step="50" value={abonnementer} onChange={(e) => setAbonnementer(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.abonnementerHelp}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.andreUdgifter}</label>
            <div className="relative">
              <input type="number" min="0" step="100" value={andreUdgifter} onChange={(e) => setAndreUdgifter(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.andreUdgifterHelp}</p>
          </div>
        </div>
      </div>

      {/* Opsparing */}
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-gray-200">
          {l.oensketOpsparing}: {opsparingProcent}% ({formatKr(beregning.opsparingBeloeb)}/{l.maaned})
        </label>
        <input
          type="range"
          min="0"
          max="30"
          value={opsparingProcent}
          onChange={(e) => setOpsparingProcent(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>0%</span>
          <span>{l.anbefaletMin}</span>
          <span>30%</span>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-center text-white">
        <p className="text-lg opacity-90 mb-2">{l.duKanBruge}</p>
        <p className="text-5xl md:text-6xl font-bold">
          {formatKr(Math.max(0, beregning.anbefalet))}
        </p>
        <p className="text-sm opacity-75 mt-2">{l.prMaanedInkl}</p>
      </div>

      {/* Vurdering */}
      <div className={`p-4 rounded-lg border ${getVurderingFarve()}`}>
        <p className="font-medium mb-1">
          {beregning.vurdering === "god" && (
            <span className="inline-flex items-center gap-1.5"><CircleCheck className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.godOekonomi}</span>
          )}
          {beregning.vurdering === "ok" && (
            <span className="inline-flex items-center gap-1.5"><TriangleAlert className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.acceptabelOekonomi}</span>
          )}
          {beregning.vurdering === "risikabel" && (
            <span className="inline-flex items-center gap-1.5"><Siren className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.stramOekonomi}</span>
          )}
        </p>
        <p className="text-sm">{beregning.vurderingTekst}</p>
      </div>

      {/* Detaljeret oversigt */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{formatKr(beregning.samletIndkomst)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.samletIndkomst}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatKr(beregning.fasteUdgifter)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.fasteUdgifterLabel}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatKr(beregning.opsparingBeloeb)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.opsparing}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatKr(beregning.maxHusleje30Pct)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{l.regel30}</p>
        </div>
      </div>

      {/* Budget oversigt */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white">{l.ditBudget}</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between dark:text-gray-200">
              <span>{l.samletMaanedlig}</span>
              <span className="font-bold text-green-600 dark:text-green-400">+{formatKr(beregning.samletIndkomst)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l.madDagligvarer}</span>
              <span>-{formatKr(madOgDagligvarer)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l.transport}</span>
              <span>-{formatKr(transport)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l.forsikringer}</span>
              <span>-{formatKr(forsikringer)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l.mobilInternet}</span>
              <span>-{formatKr(mobilOgInternet)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l.abonnementer}</span>
              <span>-{formatKr(abonnementer)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>{l.andreUdgifter}</span>
              <span>-{formatKr(andreUdgifter)}</span>
            </div>
            <div className="flex justify-between text-blue-600 dark:text-blue-400">
              <span>{l.opsparing} ({opsparingProcent}%)</span>
              <span>-{formatKr(beregning.opsparingBeloeb)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t dark:border-gray-700 pt-3 dark:text-gray-200">
              <span>{l.tilgaengeligtHusleje}</span>
              <span className={beregning.tilHusleje >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {formatKr(beregning.tilHusleje)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`Max husleje: ${formatKr(Math.max(0, beregning.anbefalet))}/måned`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Huslejebudget-beregner"
          resultSummary={`Max husleje: ${formatKr(Math.max(0, beregning.anbefalet))}/måned`}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.tipsTitle}</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• <strong>{l.regel30}:</strong> {l.tip30}</li>
          <li>• <strong>{locale === "se" ? "Inkludera allt" : locale === "no" ? "Inkluder alt" : "Inkluder alt"}:</strong> {l.tipInkluder}</li>
          <li>• <strong>Buffer:</strong> {l.tipBuffer}</li>
          <li>• <strong>{locale === "se" ? "Deposition" : "Depositum"}:</strong> {l.tipDepositum}</li>
        </ul>
      </div>
    </div>
  );
}
