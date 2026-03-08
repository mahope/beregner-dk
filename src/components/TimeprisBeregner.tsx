"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { InputField } from "./InputField";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency } from "@/lib/format";

export default function TimeprisBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      findTimepris: "Find din timepris",
      seIndtjening: "Se din indtjening",
      oensketNettoLoen: "\u00d8nsket nettol\u00f8n pr. m\u00e5ned",
      oensketNettoLoenHelp: "Hvad vil du have udbetalt?",
      arbejdstimerUge: "Arbejdstimer pr. uge",
      ferieUger: "Ferie (uger pr. \u00e5r)",
      sygdomsBuffer: "Buffer for sygdom/stille perioder (%)",
      administrativTid: "Administrativ tid (%)",
      administrativTidHelp: "Salg, mails, bogf\u00f8ring, etc.",
      transportTid: "Transport/forberedelse (%)",
      transportTidHelp: "Tid brugt p\u00e5 transport og forberedelse",
      driftsomkostninger: "Driftsomkostninger pr. m\u00e5ned",
      driftsomkostningerHelp: "Software, kontor, forsikring, etc.",
      anbefaletTimepris: "Din anbefalede timepris",
      exklMoms: "ekskl. moms ({amount} inkl. moms)",
      timerMaaned: "Timer/m\u00e5ned",
      timerAar: "Timer/\u00e5r",
      aarligOmsaetning: "\u00c5rlig oms\u00e6tning",
      bruttoLoenMaaned: "Bruttol\u00f8n/m\u00e5ned",
      timeprisEkskl: "Timepris (ekskl. moms)",
      fakturerbareTimerMaaned: "Fakturerbare timer/m\u00e5ned",
      driftsomkostningerMaaned: "Driftsomkostninger/m\u00e5ned",
      estimeretNettoLoen: "Estimeret nettol\u00f8n pr. m\u00e5ned",
      efterSkat: "efter skat",
      omsaetningFordeling: "Oms\u00e6tning fordeling",
      netto: "Netto",
      skat: "Skat",
      drift: "Drift",
      omsaetningMaaned: "Oms\u00e6tning/m\u00e5ned",
      foerSkat: "F\u00f8r skat",
      skatCa45: "Skat (ca. 45%)",
      omsaetningAar: "Oms\u00e6tning/\u00e5r",
      tipsTitle: "Tips til at s\u00e6tte din timepris",
      tip1: "Unders\u00f8g markedspriser for din branche og kompetencer",
      tip2: "Husk at inkludere buffer for sygdom og stille perioder",
      tip3: "Som freelancer har du ikke betalt ferie, s\u00e5 indregn dette",
      tip4: "Overvej dine driftsomkostninger: software, udstyr, forsikring",
      tip5: "Start ikke for lavt - det er sv\u00e6rt at h\u00e6ve prisen bagefter",
      typiskePriser: "Typiske timepriser i Danmark (2026)",
      itUdvikling: "IT & Udvikling",
      juniorUdvikler: "Junior udvikler: 500-700 kr",
      seniorUdvikler: "Senior udvikler: 800-1.200 kr",
      itKonsulent: "IT-konsulent: 900-1.500 kr",
      kreativMarketing: "Kreativ & Marketing",
      grafiskDesigner: "Grafisk designer: 500-800 kr",
      tekstforfatter: "Tekstforfatter: 600-1.000 kr",
      marketingKonsulent: "Marketing konsulent: 700-1.200 kr",
      raadgivning: "R\u00e5dgivning",
      konsulent: "Konsulent: 800-1.500 kr",
      advokat: "Advokat: 1.500-3.500 kr",
      revisor: "Revisor: 900-1.800 kr",
      haandvaerkService: "H\u00e5ndv\u00e6rk & Service",
      haandvaerker: "H\u00e5ndv\u00e6rker: 400-600 kr",
      fotograf: "Fotograf: 500-1.500 kr",
      underviser: "Underviser: 500-1.000 kr",
      priserVejledende: "Priserne er vejledende og ekskl. moms. Faktiske priser afh\u00e6nger af erfaring, speciale og geografi.",
    },
    se: {
      findTimepris: "Hitta ditt timpris",
      seIndtjening: "Se din inkomst",
      oensketNettoLoen: "\u00d6nskad nettol\u00f6n per m\u00e5nad",
      oensketNettoLoenHelp: "Vad vill du ha utbetalt?",
      arbejdstimerUge: "Arbetstimmar per vecka",
      ferieUger: "Semester (veckor per \u00e5r)",
      sygdomsBuffer: "Buffert f\u00f6r sjukdom/stilla perioder (%)",
      administrativTid: "Administrativ tid (%)",
      administrativTidHelp: "F\u00f6rs\u00e4ljning, mejl, bokf\u00f6ring, etc.",
      transportTid: "Transport/f\u00f6rberedelse (%)",
      transportTidHelp: "Tid f\u00f6r transport och f\u00f6rberedelse",
      driftsomkostninger: "Driftskostnader per m\u00e5nad",
      driftsomkostningerHelp: "Programvara, kontor, f\u00f6rs\u00e4kring, etc.",
      anbefaletTimepris: "Ditt rekommenderade timpris",
      exklMoms: "exkl. moms ({amount} inkl. moms)",
      timerMaaned: "Timmar/m\u00e5nad",
      timerAar: "Timmar/\u00e5r",
      aarligOmsaetning: "\u00c5rlig oms\u00e4ttning",
      bruttoLoenMaaned: "Bruttol\u00f6n/m\u00e5nad",
      timeprisEkskl: "Timpris (exkl. moms)",
      fakturerbareTimerMaaned: "Fakturerbara timmar/m\u00e5nad",
      driftsomkostningerMaaned: "Driftskostnader/m\u00e5nad",
      estimeretNettoLoen: "Ber\u00e4knad nettol\u00f6n per m\u00e5nad",
      efterSkat: "efter skatt",
      omsaetningFordeling: "Oms\u00e4ttningsf\u00f6rdelning",
      netto: "Netto",
      skat: "Skatt",
      drift: "Drift",
      omsaetningMaaned: "Oms\u00e4ttning/m\u00e5nad",
      foerSkat: "F\u00f6re skatt",
      skatCa45: "Skatt (ca. 45%)",
      omsaetningAar: "Oms\u00e4ttning/\u00e5r",
      tipsTitle: "Tips f\u00f6r att s\u00e4tta ditt timpris",
      tip1: "Unders\u00f6k marknadspriser f\u00f6r din bransch och kompetens",
      tip2: "Kom ih\u00e5g att inkludera buffert f\u00f6r sjukdom och stilla perioder",
      tip3: "Som frilansare har du ingen betald semester, s\u00e5 r\u00e4kna in det",
      tip4: "T\u00e4nk p\u00e5 dina driftskostnader: programvara, utrustning, f\u00f6rs\u00e4kring",
      tip5: "B\u00f6rja inte f\u00f6r l\u00e5gt \u2014 det \u00e4r sv\u00e5rt att h\u00f6ja priset efter\u00e5t",
      typiskePriser: "Typiska timpriser i Sverige (2026)",
      itUdvikling: "IT & Utveckling",
      juniorUdvikler: "Juniorutvecklare: 500\u2013700 kr",
      seniorUdvikler: "Seniorutvecklare: 800\u20131 200 kr",
      itKonsulent: "IT-konsult: 900\u20131 500 kr",
      kreativMarketing: "Kreativt & Marknadsf\u00f6ring",
      grafiskDesigner: "Grafisk designer: 500\u2013800 kr",
      tekstforfatter: "Copywriter: 600\u20131 000 kr",
      marketingKonsulent: "Marknadsf\u00f6ringskonsult: 700\u20131 200 kr",
      raadgivning: "R\u00e5dgivning",
      konsulent: "Konsult: 800\u20131 500 kr",
      advokat: "Advokat: 1 500\u20133 500 kr",
      revisor: "Revisor: 900\u20131 800 kr",
      haandvaerkService: "Hantverk & Service",
      haandvaerker: "Hantverkare: 400\u2013600 kr",
      fotograf: "Fotograf: 500\u20131 500 kr",
      underviser: "L\u00e4rare: 500\u20131 000 kr",
      priserVejledende: "Priserna \u00e4r v\u00e4gledande och exkl. moms. Faktiska priser beror p\u00e5 erfarenhet, specialisering och geografi.",
    },
    no: {
      findTimepris: "Finn din timepris",
      seIndtjening: "Se din inntekt",
      oensketNettoLoen: "\u00d8nsket nettol\u00f8nn per m\u00e5ned",
      oensketNettoLoenHelp: "Hva vil du ha utbetalt?",
      arbejdstimerUge: "Arbeidstimer per uke",
      ferieUger: "Ferie (uker per \u00e5r)",
      sygdomsBuffer: "Buffer for sykdom/stille perioder (%)",
      administrativTid: "Administrativ tid (%)",
      administrativTidHelp: "Salg, e-post, regnskap, etc.",
      transportTid: "Transport/forberedelse (%)",
      transportTidHelp: "Tid brukt p\u00e5 transport og forberedelse",
      driftsomkostninger: "Driftskostnader per m\u00e5ned",
      driftsomkostningerHelp: "Programvare, kontor, forsikring, etc.",
      anbefaletTimepris: "Din anbefalte timepris",
      exklMoms: "ekskl. mva ({amount} inkl. mva)",
      timerMaaned: "Timer/m\u00e5ned",
      timerAar: "Timer/\u00e5r",
      aarligOmsaetning: "\u00c5rlig omsetning",
      bruttoLoenMaaned: "Bruttol\u00f8nn/m\u00e5ned",
      timeprisEkskl: "Timepris (ekskl. mva)",
      fakturerbareTimerMaaned: "Fakturerbare timer/m\u00e5ned",
      driftsomkostningerMaaned: "Driftskostnader/m\u00e5ned",
      estimeretNettoLoen: "Estimert nettol\u00f8nn per m\u00e5ned",
      efterSkat: "etter skatt",
      omsaetningFordeling: "Omsetningsfordeling",
      netto: "Netto",
      skat: "Skatt",
      drift: "Drift",
      omsaetningMaaned: "Omsetning/m\u00e5ned",
      foerSkat: "F\u00f8r skatt",
      skatCa45: "Skatt (ca. 45%)",
      omsaetningAar: "Omsetning/\u00e5r",
      tipsTitle: "Tips for \u00e5 sette timeprisen din",
      tip1: "Unders\u00f8k markedspriser for din bransje og kompetanse",
      tip2: "Husk \u00e5 inkludere buffer for sykdom og stille perioder",
      tip3: "Som frilanser har du ikke betalt ferie, s\u00e5 regn med dette",
      tip4: "Vurder dine driftskostnader: programvare, utstyr, forsikring",
      tip5: "Start ikke for lavt \u2014 det er vanskelig \u00e5 \u00f8ke prisen etterp\u00e5",
      typiskePriser: "Typiske timepriser i Norge (2026)",
      itUdvikling: "IT & Utvikling",
      juniorUdvikler: "Juniorutvikler: 500\u2013700 kr",
      seniorUdvikler: "Seniorutvikler: 800\u20131 200 kr",
      itKonsulent: "IT-konsulent: 900\u20131 500 kr",
      kreativMarketing: "Kreativt & Markedsf\u00f8ring",
      grafiskDesigner: "Grafisk designer: 500\u2013800 kr",
      tekstforfatter: "Tekstforfatter: 600\u20131 000 kr",
      marketingKonsulent: "Markedsf\u00f8ringskonsulent: 700\u20131 200 kr",
      raadgivning: "R\u00e5dgivning",
      konsulent: "Konsulent: 800\u20131 500 kr",
      advokat: "Advokat: 1 500\u20133 500 kr",
      revisor: "Revisor: 900\u20131 800 kr",
      haandvaerkService: "H\u00e5ndverk & Service",
      haandvaerker: "H\u00e5ndverker: 400\u2013600 kr",
      fotograf: "Fotograf: 500\u20131 500 kr",
      underviser: "Underviser: 500\u20131 000 kr",
      priserVejledende: "Prisene er veiledende og ekskl. mva. Faktiske priser avhenger av erfaring, spesialisering og geografi.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [beregningsType, setBeregningsType] = useState<"fraLoen" | "fraTimepris">("fraLoen");

  // Fra \u00f8nsket l\u00f8n
  const [oensketNettoLoen, setOensketNettoLoen] = useState<number>(35000);
  const [arbejdstimerUge, setArbejdstimerUge] = useState<number>(37);
  const [ferieUger, setFerieUger] = useState<number>(5);
  const [sygdomsBuffer, setSygdomsBuffer] = useState<number>(5);
  const [administrativTid, setAdministrativTid] = useState<number>(20);
  const [transportTid, setTransportTid] = useState<number>(0);
  const [driftsomkostninger, setDriftsomkostninger] = useState<number>(3000);

  // Fra timepris
  const [timepris, setTimepris] = useState<number>(600);
  const [fakturerbareTimer, setFakturerbareTimer] = useState<number>(120);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'timepris') {
      const inputs = urlState.inputs;
      if (inputs.beregningsType) setBeregningsType(inputs.beregningsType);
      if (inputs.oensketNettoLoen !== undefined) setOensketNettoLoen(inputs.oensketNettoLoen);
      if (inputs.arbejdstimerUge !== undefined) setArbejdstimerUge(inputs.arbejdstimerUge);
      if (inputs.ferieUger !== undefined) setFerieUger(inputs.ferieUger);
      if (inputs.sygdomsBuffer !== undefined) setSygdomsBuffer(inputs.sygdomsBuffer);
      if (inputs.administrativTid !== undefined) setAdministrativTid(inputs.administrativTid);
      if (inputs.transportTid !== undefined) setTransportTid(inputs.transportTid);
      if (inputs.driftsomkostninger !== undefined) setDriftsomkostninger(inputs.driftsomkostninger);
      if (inputs.timepris !== undefined) setTimepris(inputs.timepris);
      if (inputs.fakturerbareTimer !== undefined) setFakturerbareTimer(inputs.fakturerbareTimer);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("timepris");
    const timer = setTimeout(() => {
      trackCalculation("timepris");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'timepris',
      inputs: {
        beregningsType, oensketNettoLoen, arbejdstimerUge, ferieUger,
        sygdomsBuffer, administrativTid, transportTid, driftsomkostninger,
        timepris, fakturerbareTimer,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beregningsType, oensketNettoLoen, arbejdstimerUge, ferieUger,
      sygdomsBuffer, administrativTid, transportTid, driftsomkostninger,
      timepris, fakturerbareTimer]);

  const handleReset = useCallback(() => {
    setBeregningsType("fraLoen");
    setOensketNettoLoen(35000);
    setArbejdstimerUge(37);
    setFerieUger(5);
    setSygdomsBuffer(5);
    setAdministrativTid(20);
    setTransportTid(0);
    setDriftsomkostninger(3000);
    setTimepris(600);
    setFakturerbareTimer(120);
  }, []);

  const beregningFraLoen = useMemo(() => {
    const skatProcent = 0.45;
    const oensketBruttoLoen = oensketNettoLoen / (1 - skatProcent);

    const arbejdsugerAar = 52 - ferieUger;
    const effektiveUger = arbejdsugerAar * (1 - sygdomsBuffer / 100);

    const spildtTidPct = administrativTid + transportTid;
    const timerUgeEfterSpild = arbejdstimerUge * (1 - spildtTidPct / 100);
    const fakturerbareTimerAar = effektiveUger * timerUgeEfterSpild;
    const fakturerbareTimerMaaned = fakturerbareTimerAar / 12;

    const aarligLoen = oensketBruttoLoen * 12;
    const aarligeDriftsomkostninger = driftsomkostninger * 12;
    const noedvendigOmsaetning = aarligLoen + aarligeDriftsomkostninger;

    const beregnetTimepris = fakturerbareTimerAar > 0 ? noedvendigOmsaetning / fakturerbareTimerAar : 0;
    const timeprismMoms = beregnetTimepris * 1.25;

    return {
      oensketBruttoLoen,
      effektiveUger,
      fakturerbareTimerAar,
      fakturerbareTimerMaaned,
      aarligLoen,
      aarligeDriftsomkostninger,
      noedvendigOmsaetning,
      beregnetTimepris,
      timeprismMoms,
    };
  }, [oensketNettoLoen, arbejdstimerUge, ferieUger, sygdomsBuffer, administrativTid, transportTid, driftsomkostninger]);

  const beregningFraTimepris = useMemo(() => {
    const maanedligOmsaetning = timepris * fakturerbareTimer;
    const aarligOmsaetning = maanedligOmsaetning * 12;

    const skatProcent = 0.45;
    const bruttoLoenMaaned = maanedligOmsaetning - driftsomkostninger;
    const skatBeloeb = bruttoLoenMaaned * skatProcent;
    const nettoLoenMaaned = bruttoLoenMaaned - skatBeloeb;

    const total = maanedligOmsaetning;
    const driftPct = total > 0 ? (driftsomkostninger / total) * 100 : 0;
    const skatPct = total > 0 ? (skatBeloeb / total) * 100 : 0;
    const nettoPct = total > 0 ? (Math.max(0, nettoLoenMaaned) / total) * 100 : 0;

    return {
      maanedligOmsaetning,
      aarligOmsaetning,
      bruttoLoenMaaned,
      nettoLoenMaaned,
      skatBeloeb,
      driftPct, skatPct, nettoPct,
    };
  }, [timepris, fakturerbareTimer, driftsomkostninger]);

  const formatKr = (amount: number) => formatCurrency(amount, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Valg af beregningstype */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button
          onClick={() => setBeregningsType("fraLoen")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            beregningsType === "fraLoen"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {l.findTimepris}
        </button>
        <button
          onClick={() => setBeregningsType("fraTimepris")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            beregningsType === "fraTimepris"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          {l.seIndtjening}
        </button>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {beregningsType === "fraLoen" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField
                label={l.oensketNettoLoen}
                value={oensketNettoLoen}
                onChange={setOensketNettoLoen}
                min={0}
                step={1000}
                unit="kr"
                helpText={l.oensketNettoLoenHelp}
              />
              <InputField
                label={l.arbejdstimerUge}
                value={arbejdstimerUge}
                onChange={setArbejdstimerUge}
                min={1}
                max={80}
              />
              <InputField
                label={l.ferieUger}
                value={ferieUger}
                onChange={setFerieUger}
                min={0}
                max={12}
              />
            </div>

            <div className="space-y-4">
              <InputField
                label={l.sygdomsBuffer}
                value={sygdomsBuffer}
                onChange={setSygdomsBuffer}
                min={0}
                max={30}
              />
              <InputField
                label={l.administrativTid}
                value={administrativTid}
                onChange={setAdministrativTid}
                min={0}
                max={50}
                helpText={l.administrativTidHelp}
              />
              <InputField
                label={l.transportTid}
                value={transportTid}
                onChange={setTransportTid}
                min={0}
                max={30}
                helpText={l.transportTidHelp}
              />
              <InputField
                label={l.driftsomkostninger}
                value={driftsomkostninger}
                onChange={setDriftsomkostninger}
                min={0}
                step={500}
                unit="kr"
                helpText={l.driftsomkostningerHelp}
              />
            </div>
          </div>

          {/* Resultat */}
          <div className="p-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">{l.anbefaletTimepris}</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregningFraLoen.beregnetTimepris)}
            </p>
            <p className="text-sm opacity-75 mt-2">
              {l.exklMoms.replace("{amount}", formatKr(beregningFraLoen.timeprismMoms))}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {beregningFraLoen.fakturerbareTimerMaaned.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.timerMaaned}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {beregningFraLoen.fakturerbareTimerAar.toFixed(0)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.timerAar}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraLoen.noedvendigOmsaetning)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.aarligOmsaetning}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraLoen.oensketBruttoLoen)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.bruttoLoenMaaned}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <CopyResultButton text={`Anbefalet timepris: ${formatKr(beregningFraLoen.beregnetTimepris)} ekskl. moms`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Timeprisberegner"
              resultSummary={`Anbefalet timepris: ${formatKr(beregningFraLoen.beregnetTimepris)} ekskl. moms`}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField
              label={l.timeprisEkskl}
              value={timepris}
              onChange={setTimepris}
              min={0}
              step={50}
              unit="kr"
            />
            <InputField
              label={l.fakturerbareTimerMaaned}
              value={fakturerbareTimer}
              onChange={setFakturerbareTimer}
              min={0}
              max={200}
            />
            <InputField
              label={l.driftsomkostningerMaaned}
              value={driftsomkostninger}
              onChange={setDriftsomkostninger}
              min={0}
              step={500}
              unit="kr"
            />
          </div>

          {/* Resultat */}
          <div className="p-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">{l.estimeretNettoLoen}</p>
            <p className="text-5xl md:text-6xl font-bold">
              {formatKr(beregningFraTimepris.nettoLoenMaaned)}
            </p>
            <p className="text-sm opacity-75 mt-2">{l.efterSkat}</p>
          </div>

          {/* Visuel breakdown */}
          <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
            <h4 className="text-sm font-medium mb-3 dark:text-gray-200">{l.omsaetningFordeling}</h4>
            <div className="flex h-8 rounded-full overflow-hidden mb-3">
              <div className="bg-green-500" style={{ width: `${beregningFraTimepris.nettoPct}%` }} title={l.netto} />
              <div className="bg-red-400" style={{ width: `${beregningFraTimepris.skatPct}%` }} title={l.skat} />
              <div className="bg-gray-400" style={{ width: `${beregningFraTimepris.driftPct}%` }} title={l.drift} />
            </div>
            <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> {l.netto} ({formatKr(beregningFraTimepris.nettoLoenMaaned)})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> {l.skat} ({formatKr(beregningFraTimepris.skatBeloeb)})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-gray-400 inline-block" /> {l.drift} ({formatKr(driftsomkostninger)})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraTimepris.maanedligOmsaetning)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.omsaetningMaaned}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraTimepris.bruttoLoenMaaned)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.foerSkat}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {formatKr(beregningFraTimepris.skatBeloeb)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.skatCa45}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-xl font-bold text-gray-700 dark:text-white">
                {formatKr(beregningFraTimepris.aarligOmsaetning)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.omsaetningAar}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <CopyResultButton text={`Nettoløn: ${formatKr(beregningFraTimepris.nettoLoenMaaned)}/md ved ${formatKr(timepris)}/time`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Timeprisberegner"
              resultSummary={`Nettoløn: ${formatKr(beregningFraTimepris.nettoLoenMaaned)}/md ved ${formatKr(timepris)}/time`}
            />
          </div>
        </>
      )}

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">{l.tipsTitle}</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>{l.tip1}</li>
          <li>{l.tip2}</li>
          <li>{l.tip3}</li>
          <li>{l.tip4}</li>
          <li>{l.tip5}</li>
        </ul>
      </div>

      {/* Typiske timepriser */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <h3 className="font-medium dark:text-white">{l.typiskePriser}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">{l.itUdvikling}</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>{l.juniorUdvikler}</li>
                <li>{l.seniorUdvikler}</li>
                <li>{l.itKonsulent}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">{l.kreativMarketing}</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>{l.grafiskDesigner}</li>
                <li>{l.tekstforfatter}</li>
                <li>{l.marketingKonsulent}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">{l.raadgivning}</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>{l.konsulent}</li>
                <li>{l.advokat}</li>
                <li>{l.revisor}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-200">{l.haandvaerkService}</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>{l.haandvaerker}</li>
                <li>{l.fotograf}</li>
                <li>{l.underviser}</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            {l.priserVejledende}
          </p>
        </div>
      </div>
    </div>
  );
}
