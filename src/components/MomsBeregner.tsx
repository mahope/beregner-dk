"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { ShareCalculation } from "@/components/ShareCalculation";
import { PrintResult } from "@/components/PrintResult";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { AnimatedNumber, CopyResultButton, ResetButton } from "@/components/ui";
import { useLocale } from '@/components/LocaleProvider';
import { formatCurrency, formatNumber, getCurrencySuffix } from '@/lib/format';
import {
  beregnMoms,
  momsAndel,
  momsFaktor,
  MOMS_SATS_VALG_SE,
  normalizeMomssats,
  opsummering,
  referenceRaekker,
  type MomsBeregningstype,
} from '@/lib/moms';

const labels = {
  da: {
    hvadBeregne: "Hvad vil du beregne?",
    tillaegTitle: "Læg moms til",
    tillaegDesc: "Beløb uden moms → inkl. moms",
    fratraekTitle: "Træk moms fra",
    fratraekDesc: "Beløb inkl. moms → uden moms",
    findTitle: "Find moms",
    findDesc: "Se momsandelen i et beløb",
    beloebUdenMoms: "Beløb uden moms",
    beloebInklMoms: "Beløb inkl. moms",
    prisUdenMoms: "Pris uden moms",
    prisInklMoms: "Pris inkl. moms",
    calculatorName: "Momsberegner",
    hurtigReference: "Hurtig reference",
    tblUdenMoms: "Uden moms",
    tblMoms: "Moms",
    tblInklMoms: "Inkl. moms",
    infoTitle: "Om dansk moms",
    loading: "Indlæser moms …",
    info1a: "Den danske momssats er ",
    info1b: (rate: string) => `${rate} %`,
    info2: (factor: string) => `For at beregne pris inkl. moms: Beløb × ${factor}`,
    info3: (factor: string) => `For at finde pris uden moms: Beløb ÷ ${factor}`,
    info4: (share: string) => `Momsandelen af en pris inkl. moms er ${share} %`,
    seFormler: "Se formler og beregningsmetoder",
    formTillaegTitle: (rate: string) => `Læg moms til (${rate} %):`,
    formTillaeg: (factor: string) => `Pris inkl. moms = Pris uden moms × ${factor}`,
    formFratraekTitle: "Fratræk moms:",
    formFratraek: (factor: string) => `Pris uden moms = Pris inkl. moms ÷ ${factor}`,
    formFindTitle: "Find momsbeløbet:",
    formFind: (factor: string) => `Moms = Pris inkl. moms - (Pris inkl. moms ÷ ${factor})`,
  },
  se: {
    hvadBeregne: "Vad vill du beräkna?",
    tillaegTitle: "Lägg till moms",
    tillaegDesc: "Belopp utan moms → inkl. moms",
    fratraekTitle: "Dra av moms",
    fratraekDesc: "Belopp inkl. moms → utan moms",
    findTitle: "Hitta moms",
    findDesc: "Se momsandelen i ett belopp",
    beloebUdenMoms: "Belopp utan moms",
    beloebInklMoms: "Belopp inkl. moms",
    prisUdenMoms: "Pris utan moms",
    prisInklMoms: "Pris inkl. moms",
    calculatorName: "Momsräknare",
    hurtigReference: "Snabbreferens",
    tblUdenMoms: "Utan moms",
    tblMoms: "Moms",
    tblInklMoms: "Inkl. moms",
    infoTitle: "Om svensk moms",
    loading: "Läser in moms …",
    info1a: "Den valda momssatsen är ",
    info1b: (rate: string) => `${rate} %`,
    info2: (factor: string) => `För att beräkna pris inkl. moms: Belopp × ${factor}`,
    info3: (factor: string) => `För att hitta pris utan moms: Belopp ÷ ${factor}`,
    info4: (share: string) => `Momsandelen av ett pris inkl. moms är ${share} %`,
    seFormler: "Se formler och beräkningsmetoder",
    formTillaegTitle: (rate: string) => `Lägg till moms (${rate} %):`,
    formTillaeg: (factor: string) => `Pris inkl. moms = Pris utan moms × ${factor}`,
    formFratraekTitle: "Dra av moms:",
    formFratraek: (factor: string) => `Pris utan moms = Pris inkl. moms ÷ ${factor}`,
    formFindTitle: "Hitta momsbeloppet:",
    formFind: (factor: string) => `Moms = Pris inkl. moms - (Pris inkl. moms ÷ ${factor})`,
  },
} as const;

export default function MomsBeregner() {
  const { locale } = useLocale();
  const l = labels[locale as keyof typeof labels] || labels.da;
  const [beloeb, setBeloeb] = useState<number>(1000);
  const [beregningsType, setBeregningsType] = useState<MomsBeregningstype>("tillaegMoms");
  const [momssats, setMomssats] = useState<number>(25);
  const [urlStateKontrolleret, setUrlStateKontrolleret] = useState(false);
  const effectiveMomssats = normalizeMomssats(momssats, locale);
  const rateCopy = {
    rate: formatNumber(effectiveMomssats, locale),
    factor: formatNumber(momsFaktor(effectiveMomssats), locale, { maximumFractionDigits: 2 }),
    share: formatNumber(momsAndel(effectiveMomssats) * 100, locale, { maximumFractionDigits: 2 }),
  };
  const hasTracked = useRef(false);
  const hasLoadedUrl = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'moms') {
      const inputs = urlState.inputs;
      if (inputs.beloeb !== undefined) setBeloeb(inputs.beloeb);
      if (inputs.beregningsType) setBeregningsType(inputs.beregningsType);
      if (inputs.momssats !== undefined) setMomssats(normalizeMomssats(inputs.momssats, locale));
    }
    setUrlStateKontrolleret(true);
  }, [locale]);

  const handleReset = useCallback(() => {
    setBeloeb(1000);
    setBeregningsType("tillaegMoms");
    setMomssats(25);
  }, []);

  // Get shareable link for current calculation
  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'moms',
      inputs: { beloeb, beregningsType, momssats: effectiveMomssats },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [beloeb, beregningsType, effectiveMomssats]);

  const beregning = useMemo(
    () => beregnMoms(beloeb, beregningsType, effectiveMomssats),
    [beloeb, beregningsType, effectiveMomssats]
  );
  const referenceRaekke = useMemo(() => referenceRaekker(effectiveMomssats), [effectiveMomssats]);

  // Track calculation once per session
  useEffect(() => {
    if (urlStateKontrolleret && beregning && !hasTracked.current) {
      const cleanupScroll = initScrollDepthTracking("moms");
    const timer = setTimeout(() => {
        trackCalculation("moms");
        hasTracked.current = true;
      }, 2000);
      return () => { clearTimeout(timer); cleanupScroll(); };
    }
  }, [beregning, urlStateKontrolleret]);

  const formatKr = (amount: number) => formatCurrency(amount, locale);

  const resultatTekst = useMemo(
    () =>
      opsummering(
        beregningsType,
        beregning,
        effectiveMomssats,
        {
          pris: (tal) => formatCurrency(tal, locale),
          procent: (tal) => formatNumber(tal, locale, { maximumFractionDigits: 2 }),
        },
        locale === "se" ? "se" : "da"
      ),
    [beregningsType, beregning, effectiveMomssats, locale]
  );

  const getInputLabel = () => {
    switch (beregningsType) {
      case "tillaegMoms":
        return l.beloebUdenMoms;
      case "fratraekMoms":
      case "findMoms":
        return l.beloebInklMoms;
    }
  };

  return (
    <div className="space-y-8 print-area">
      {/* Beregningstype valg */}
      <div>
        <label id="moms-beregning-gruppe" className="block text-sm font-medium mb-3">{l.hvadBeregne}</label>
        <div role="group" aria-labelledby="moms-beregning-gruppe" className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button type="button"
            aria-pressed={beregningsType === "tillaegMoms"}
            onClick={() => setBeregningsType("tillaegMoms")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              beregningsType === "tillaegMoms"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{l.tillaegTitle}</div>
            <div className="text-sm text-gray-500">{l.tillaegDesc}</div>
          </button>
          <button type="button"
            aria-pressed={beregningsType === "fratraekMoms"}
            onClick={() => setBeregningsType("fratraekMoms")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              beregningsType === "fratraekMoms"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{l.fratraekTitle}</div>
            <div className="text-sm text-gray-500">{l.fratraekDesc}</div>
          </button>
          <button type="button"
            aria-pressed={beregningsType === "findMoms"}
            onClick={() => setBeregningsType("findMoms")}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              beregningsType === "findMoms"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="font-medium">{l.findTitle}</div>
            <div className="text-sm text-gray-500">{l.findDesc}</div>
          </button>
        </div>
      </div>

      {/* Momssats (svenska reducerade satser) */}
      {locale === "se" && (
        <div className="max-w-md">
          <label id="moms-sats-gruppe" className="block text-sm font-medium mb-2">Momssats</label>
          <div role="group" aria-labelledby="moms-sats-gruppe" className="grid grid-cols-3 gap-2">
            {MOMS_SATS_VALG_SE.map((o) => (
              <button
                key={o.sats}
                type="button"
                aria-pressed={effectiveMomssats === o.sats}
                onClick={() => setMomssats(o.sats)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  effectiveMomssats === o.sats
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-gray-200 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                <div className="font-semibold">{o.sats}%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{o.navn}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="max-w-md">
        <label htmlFor="momsBeloeb" className="block text-sm font-medium mb-2">{getInputLabel()}</label>
        <div className="relative">
          <input
            id="momsBeloeb"
            type="number"
            min="0"
            step="0.01"
            value={beloeb}
            onChange={(e) => setBeloeb(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border rounded-lg text-lg pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySuffix(locale)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {!urlStateKontrolleret && (
        <p role="status" aria-live="polite" className="rounded-lg bg-gray-50 p-4 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {l.loading}
        </p>
      )}

      {/* Resultat */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 animate-stagger ${urlStateKontrolleret ? "" : "hidden"}`}>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.prisUdenMoms}</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
            <AnimatedNumber value={beregning.prisUdenMoms} formatFn={formatKr} />
          </p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{`${l.tblMoms} (${effectiveMomssats}%)`}</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            <AnimatedNumber value={beregning.momsBeloeb} formatFn={formatKr} />
          </p>
        </div>
        <div className="p-6 bg-green-100 dark:bg-green-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{l.prisInklMoms}</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">
            <AnimatedNumber value={beregning.prisInklMoms} formatFn={formatKr} />
          </p>
        </div>
      </div>

      {/* Share, Copy and Print buttons */}
      <div className={`flex justify-center gap-3 ${urlStateKontrolleret ? "" : "hidden"}`}>
        <CopyResultButton text={resultatTekst} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calculatorName}
          resultSummary={resultatTekst}
        />
        <PrintResult
          calculatorName={l.calculatorName}
          resultSummary={resultatTekst}
        />
      </div>

      {/* Hurtig reference tabel */}
      <div className={`bg-white border rounded-lg overflow-hidden ${urlStateKontrolleret ? "" : "hidden"}`}>
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-medium">{l.hurtigReference}</h3>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{l.tblUdenMoms}</th>
                <th className="text-left py-2">{l.tblMoms}</th>
                <th className="text-left py-2">{l.tblInklMoms}</th>
              </tr>
            </thead>
            <tbody>
              {referenceRaekke.map((r) => (
                <tr key={r.prisUdenMoms} className="border-b last:border-b-0">
                  <td className="py-2">{formatKr(r.prisUdenMoms)}</td>
                  <td className="py-2">{formatKr(r.momsBeloeb)}</td>
                  <td className="py-2 font-medium">{formatKr(r.prisInklMoms)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info boks */}
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 ${urlStateKontrolleret ? "" : "hidden"}`}>
        <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />{l.infoTitle}</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• {l.info1a}<strong>{l.info1b(rateCopy.rate)}</strong></li>
          <li>• {l.info2(rateCopy.factor)}</li>
          <li>• {l.info3(rateCopy.factor)}</li>
          <li>• {l.info4(rateCopy.share)}</li>
        </ul>
      </div>

      {/* Formler */}
      <details className={`bg-gray-50 dark:bg-gray-800 rounded-lg ${urlStateKontrolleret ? "" : "hidden"}`}>
        <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
          {l.seFormler}
        </summary>
        <div className="p-4 pt-0 space-y-4 text-sm dark:text-gray-300">
          <div>
            <h4 className="font-medium mb-1 dark:text-gray-200">{l.formTillaegTitle(rateCopy.rate)}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">
              {l.formTillaeg(rateCopy.factor)}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-gray-200">{l.formFratraekTitle}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">
              {l.formFratraek(rateCopy.factor)}
            </code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-gray-200">{l.formFindTitle}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">
              {l.formFind(rateCopy.factor)}
            </code>
          </div>
        </div>
      </details>
    </div>
  );
}
