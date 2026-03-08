"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type FormType = "rektangel" | "cirkel" | "trekant" | "trapez";

export default function KvadratmeterBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      vaelgForm: "V\u00e6lg form",
      rektangel: "Rektangel",
      cirkel: "Cirkel",
      trekant: "Trekant",
      trapez: "Trapez",
      laengde: "L\u00e6ngde (meter)",
      bredde: "Bredde (meter)",
      radius: "Radius (meter)",
      radiusHint: "Radius = halvdelen af diameteren",
      grundlinje: "Grundlinje (meter)",
      hoejde: "H\u00f8jde (meter)",
      hoejdeHint: "Vinkelret afstand til grundlinjen",
      oeversteSide: "\u00d8verste side (meter)",
      nedersteSide: "Nederste side (meter)",
      areal: "Areal",
      omkreds: "Omkreds:",
      beregnPris: "Beregn pris",
      prisPrM2: "Pris pr. m\u00b2 (valgfrit)",
      samletPris: "Samlet pris",
      omregnAreal: "Omregn dit areal",
      kvadratmeter: "Kvadratmeter",
      kvadratcentimeter: "Kvadratcentimeter",
      hektar: "Hektar",
      kvadratfod: "Kvadratfod",
      seFormler: "Se formler for arealberegning",
      rektangelFormel: "Rektangel:",
      rektangelFormula: "Areal = L\u00e6ngde \u00d7 Bredde",
      cirkelFormel: "Cirkel:",
      cirkelFormula: "Areal = \u03c0 \u00d7 r\u00b2 (hvor r = radius)",
      trekantFormel: "Trekant:",
      trekantFormula: "Areal = (Grundlinje \u00d7 H\u00f8jde) / 2",
      trapezFormel: "Trapez:",
      trapezFormula: "Areal = ((Side 1 + Side 2) / 2) \u00d7 H\u00f8jde",
    },
    se: {
      vaelgForm: "V\u00e4lj form",
      rektangel: "Rektangel",
      cirkel: "Cirkel",
      trekant: "Triangel",
      trapez: "Trapets",
      laengde: "L\u00e4ngd (meter)",
      bredde: "Bredd (meter)",
      radius: "Radie (meter)",
      radiusHint: "Radie = halva diametern",
      grundlinje: "Baslinje (meter)",
      hoejde: "H\u00f6jd (meter)",
      hoejdeHint: "Vinkelr\u00e4tt avst\u00e5nd till baslinjen",
      oeversteSide: "\u00d6vre sida (meter)",
      nedersteSide: "Undre sida (meter)",
      areal: "Area",
      omkreds: "Omkrets:",
      beregnPris: "Ber\u00e4kna pris",
      prisPrM2: "Pris per m\u00b2 (valfritt)",
      samletPris: "Totalpris",
      omregnAreal: "Omvandla din area",
      kvadratmeter: "Kvadratmeter",
      kvadratcentimeter: "Kvadratcentimeter",
      hektar: "Hektar",
      kvadratfod: "Kvadratfot",
      seFormler: "Visa formler f\u00f6r areaber\u00e4kning",
      rektangelFormel: "Rektangel:",
      rektangelFormula: "Area = L\u00e4ngd \u00d7 Bredd",
      cirkelFormel: "Cirkel:",
      cirkelFormula: "Area = \u03c0 \u00d7 r\u00b2 (d\u00e4r r = radie)",
      trekantFormel: "Triangel:",
      trekantFormula: "Area = (Baslinje \u00d7 H\u00f6jd) / 2",
      trapezFormel: "Trapets:",
      trapezFormula: "Area = ((Sida 1 + Sida 2) / 2) \u00d7 H\u00f6jd",
    },
    no: {
      vaelgForm: "Velg form",
      rektangel: "Rektangel",
      cirkel: "Sirkel",
      trekant: "Trekant",
      trapez: "Trapes",
      laengde: "Lengde (meter)",
      bredde: "Bredde (meter)",
      radius: "Radius (meter)",
      radiusHint: "Radius = halvparten av diameteren",
      grundlinje: "Grunnlinje (meter)",
      hoejde: "H\u00f8yde (meter)",
      hoejdeHint: "Vinkelrett avstand til grunnlinjen",
      oeversteSide: "\u00d8verste side (meter)",
      nedersteSide: "Nederste side (meter)",
      areal: "Areal",
      omkreds: "Omkrets:",
      beregnPris: "Beregn pris",
      prisPrM2: "Pris per m\u00b2 (valgfritt)",
      samletPris: "Totalpris",
      omregnAreal: "Omregn arealet ditt",
      kvadratmeter: "Kvadratmeter",
      kvadratcentimeter: "Kvadratcentimeter",
      hektar: "Hektar",
      kvadratfod: "Kvadratfot",
      seFormler: "Se formler for arealberegning",
      rektangelFormel: "Rektangel:",
      rektangelFormula: "Areal = Lengde \u00d7 Bredde",
      cirkelFormel: "Sirkel:",
      cirkelFormula: "Areal = \u03c0 \u00d7 r\u00b2 (der r = radius)",
      trekantFormel: "Trekant:",
      trekantFormula: "Areal = (Grunnlinje \u00d7 H\u00f8yde) / 2",
      trapezFormel: "Trapes:",
      trapezFormula: "Areal = ((Side 1 + Side 2) / 2) \u00d7 H\u00f8yde",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [formType, setFormType] = useState<FormType>("rektangel");

  // Rektangel
  const [laengde, setLaengde] = useState<number>(10);
  const [bredde, setBredde] = useState<number>(8);

  // Cirkel
  const [radius, setRadius] = useState<number>(5);

  // Trekant
  const [grundlinje, setGrundlinje] = useState<number>(10);
  const [hoejde, setHoejde] = useState<number>(6);

  // Trapez
  const [side1, setSide1] = useState<number>(8);
  const [side2, setSide2] = useState<number>(12);
  const [trapezHoejde, setTrapezHoejde] = useState<number>(5);

  // Ekstra beregninger
  const [prisPerKvm, setPrisPerKvm] = useState<number>(0);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'kvadratmeter') {
      const inputs = urlState.inputs;
      if (inputs.formType) setFormType(inputs.formType);
      if (inputs.laengde !== undefined) setLaengde(inputs.laengde);
      if (inputs.bredde !== undefined) setBredde(inputs.bredde);
      if (inputs.radius !== undefined) setRadius(inputs.radius);
      if (inputs.grundlinje !== undefined) setGrundlinje(inputs.grundlinje);
      if (inputs.hoejde !== undefined) setHoejde(inputs.hoejde);
      if (inputs.side1 !== undefined) setSide1(inputs.side1);
      if (inputs.side2 !== undefined) setSide2(inputs.side2);
      if (inputs.trapezHoejde !== undefined) setTrapezHoejde(inputs.trapezHoejde);
      if (inputs.prisPerKvm !== undefined) setPrisPerKvm(inputs.prisPerKvm);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("kvadratmeter");
    const timer = setTimeout(() => {
      trackCalculation("kvadratmeter");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'kvadratmeter',
      inputs: { formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm]);

  const handleReset = useCallback(() => {
    setFormType("rektangel");
    setLaengde(10);
    setBredde(8);
    setRadius(5);
    setGrundlinje(10);
    setHoejde(6);
    setSide1(8);
    setSide2(12);
    setTrapezHoejde(5);
    setPrisPerKvm(0);
  }, []);

  const beregning = useMemo(() => {
    let areal = 0;
    let omkreds = 0;
    let formel = "";

    switch (formType) {
      case "rektangel":
        areal = laengde * bredde;
        omkreds = 2 * (laengde + bredde);
        formel = `${laengde} \u00d7 ${bredde} = ${areal} m\u00b2`;
        break;
      case "cirkel":
        areal = Math.PI * radius * radius;
        omkreds = 2 * Math.PI * radius;
        formel = `\u03c0 \u00d7 ${radius}\u00b2 = ${areal.toFixed(2)} m\u00b2`;
        break;
      case "trekant":
        areal = (grundlinje * hoejde) / 2;
        omkreds = 0;
        formel = `(${grundlinje} \u00d7 ${hoejde}) / 2 = ${areal} m\u00b2`;
        break;
      case "trapez":
        areal = ((side1 + side2) / 2) * trapezHoejde;
        omkreds = 0;
        formel = `((${side1} + ${side2}) / 2) \u00d7 ${trapezHoejde} = ${areal} m\u00b2`;
        break;
    }

    const totalPris = prisPerKvm > 0 ? areal * prisPerKvm : 0;

    return { areal, omkreds, formel, totalPris };
  }, [formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatKr = (amount: number) => formatCurrency(amount, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Form valg */}
      <div>
        <label className="block text-sm font-medium mb-3 dark:text-gray-200">{l.vaelgForm}</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setFormType("rektangel")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "rektangel"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">&#9645;</div>
            <div className="font-medium text-sm dark:text-gray-200">{l.rektangel}</div>
          </button>
          <button
            onClick={() => setFormType("cirkel")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "cirkel"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">&#9711;</div>
            <div className="font-medium text-sm dark:text-gray-200">{l.cirkel}</div>
          </button>
          <button
            onClick={() => setFormType("trekant")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "trekant"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">&#9651;</div>
            <div className="font-medium text-sm dark:text-gray-200">{l.trekant}</div>
          </button>
          <button
            onClick={() => setFormType("trapez")}
            className={`p-4 rounded-lg border-2 transition-all ${
              formType === "trapez"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
            }`}
          >
            <div className="text-3xl mb-2">&#9186;</div>
            <div className="font-medium text-sm dark:text-gray-200">{l.trapez}</div>
          </button>
        </div>
      </div>

      {/* Input baseret p\u00e5 form */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        {formType === "rektangel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.laengde}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={laengde}
                  onChange={(e) => setLaengde(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.bredde}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={bredde}
                  onChange={(e) => setBredde(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </div>
          </div>
        )}

        {formType === "cirkel" && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.radius}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.1"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.radiusHint}</p>
          </div>
        )}

        {formType === "trekant" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.grundlinje}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={grundlinje}
                  onChange={(e) => setGrundlinje(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.hoejde}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={hoejde}
                  onChange={(e) => setHoejde(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.hoejdeHint}</p>
            </div>
          </div>
        )}

        {formType === "trapez" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.oeversteSide}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={side1}
                  onChange={(e) => setSide1(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.nedersteSide}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={side2}
                  onChange={(e) => setSide2(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.hoejde}</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={trapezHoejde}
                  onChange={(e) => setTrapezHoejde(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 pr-12 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">m</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="p-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-center text-white">
        <p className="text-lg opacity-90 mb-2">{l.areal}</p>
        <p className="text-5xl md:text-6xl font-bold">
          {formatNumber(beregning.areal)} m&#178;
        </p>
        <p className="text-sm opacity-75 mt-2">{beregning.formel}</p>
      </div>

      {beregning.omkreds > 0 && (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {l.omkreds} <strong className="dark:text-gray-200">{formatNumber(beregning.omkreds)} meter</strong>
          </p>
        </div>
      )}

      {/* Prisberegning */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-medium mb-4 dark:text-white">{l.beregnPris}</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.prisPrM2}</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="10"
                value={prisPerKvm || ""}
                placeholder="0"
                onChange={(e) => setPrisPerKvm(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-16 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">{getCurrencySuffix(locale)}/m&#178;</span>
            </div>
          </div>
          {beregning.totalPris > 0 && (
            <div className="flex-1 p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">{l.samletPris}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatKr(beregning.totalPris)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Omregningsliste */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
          <h3 className="font-medium dark:text-white">{l.omregnAreal}</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-lg font-semibold dark:text-gray-200">{formatNumber(beregning.areal)} m&#178;</div>
              <div className="text-gray-500 dark:text-gray-400">{l.kvadratmeter}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-lg font-semibold dark:text-gray-200">{formatNumber(beregning.areal * 10000)} cm&#178;</div>
              <div className="text-gray-500 dark:text-gray-400">{l.kvadratcentimeter}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-lg font-semibold dark:text-gray-200">{formatNumber(beregning.areal / 10000, 6)} ha</div>
              <div className="text-gray-500 dark:text-gray-400">{l.hektar}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="text-lg font-semibold dark:text-gray-200">{formatNumber(beregning.areal * 10.764)} sq ft</div>
              <div className="text-gray-500 dark:text-gray-400">{l.kvadratfod}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <CopyResultButton text={`${formatNumber(beregning.areal)} m\u00b2 (${formType})`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Kvadratmeterberegner"
          resultSummary={`${formatNumber(beregning.areal)} m\u00b2 (${formType})`}
        />
      </div>

      {/* Formler */}
      <details className="bg-gray-50 dark:bg-gray-800 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium dark:text-gray-200">
          {l.seFormler}
        </summary>
        <div className="p-4 pt-0 space-y-4 text-sm dark:text-gray-300">
          <div>
            <h4 className="font-medium mb-1 dark:text-white">{l.rektangelFormel}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">{l.rektangelFormula}</code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-white">{l.cirkelFormel}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">{l.cirkelFormula}</code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-white">{l.trekantFormel}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">{l.trekantFormula}</code>
          </div>
          <div>
            <h4 className="font-medium mb-1 dark:text-white">{l.trapezFormel}</h4>
            <code className="block bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600 dark:text-gray-200">{l.trapezFormula}</code>
          </div>
        </div>
      </details>
    </div>
  );
}
