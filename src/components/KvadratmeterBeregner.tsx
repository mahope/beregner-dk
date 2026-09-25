"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";
import {
  MATERIALER,
  STANDARD_SPILD_PCT,
  beregnMaterialbehov,
  beregnMaterialpris,
  materialeEnhedNavn,
  materialeNavn,
  materialeVedId,
  type MaterialeId,
} from "@/lib/kvadratmeter-materialer";

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
      materialer: "Beregn materialer",
      vaelgMateriale: "V\u00e6lg materiale",
      antalFelter: "Antal ens felter (fx rum med samme st\u00f8rrelse)",
      spildPct: "Spild i procent",
      daekningPrEnhed: "D\u00e6kning pr. enhed",
      daekningPrM2: "Materialet s\u00e6lges pr. m\u00b2",
      prisPrMaterialeM2: "Pris pr. m\u00b2 (valgfrit)",
      prisPrMaterialeEnhed: "Pris pr. enhed (valgfrit)",
      skalKobe: "Du skal k\u00f8be",
      medSpild: "inkl. spild",
      spildM2: "spild",
      daekningsKilde: "D\u00e6kningen st\u00e5r p\u00e5 produktets datablad \u2014 t\u00e6nk altid produktets egen v\u00e6rdi.",
      spildKilde: "Tommelfingerreglen er 5-10 % spild; danske gulvleverand\u00f8rer anbefaler 10 %.",
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
      materialer: "Ber\u00e4kna material",
      vaelgMateriale: "V\u00e4lj material",
      antalFelter: "Antal lika ytor (t.ex. rum med samma storlek)",
      spildPct: "Spill i procent",
      daekningPrEnhed: "T\u00e4ckning per enhet",
      daekningPrM2: "Materialet s\u00e4ljs per m\u00b2",
      prisPrMaterialeM2: "Pris per m\u00b2 (valfritt)",
      prisPrMaterialeEnhed: "Pris per enhet (valfritt)",
      skalKobe: "Du beh\u00f6ver k\u00f6pa",
      medSpild: "inkl. spill",
      spildM2: "spill",
      daekningsKilde: "T\u00e4ckningen st\u00e5r p\u00e5 produktens datablad \u2014 anv\u00e4nd alltid produktets eget v\u00e4rde.",
      spildKilde: "Tumregeln \u00e4r 5-10 % spill; svenska golvleverant\u00f6rer rekommenderar 10 %.",
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
      materialer: "Beregn materialer",
      vaelgMateriale: "Velg materiale",
      antalFelter: "Antall like flater (f.eks. rom med samme st\u00f8rrelse)",
      spildPct: "Svinn i prosent",
      daekningPrEnhed: "Dekning per enhet",
      daekningPrM2: "Materialet selges per m\u00b2",
      prisPrMaterialeM2: "Pris per m\u00b2 (valgfritt)",
      prisPrMaterialeEnhed: "Pris per enhet (valgfritt)",
      skalKobe: "Du m\u00e5 kj\u00f8pe",
      medSpild: "inkl. svinn",
      spildM2: "svinn",
      daekningsKilde: "Dekningen st\u00e5r p\u00e5 produktets datablad \u2014 bruk alltid produktets egen verdi.",
      spildKilde: "Tommelfingerregelen er 5-10 % svinn; norske gulvleverand\u00f8rer anbefaler 10 %.",
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

  // Materialeberegning
  const [materialeId, setMaterialeId] = useState<MaterialeId>("gulv");
  const [antalFelter, setAntalFelter] = useState<number>(1);
  const [spildPct, setSpildPct] = useState<number>(STANDARD_SPILD_PCT);
  const [daekningPrEnhed, setDaekningPrEnhed] = useState<number>(materialeVedId("gulv").daekningPrEnhedM2);
  const [prisPrMateriale, setPrisPrMateriale] = useState<number>(0);

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
      if (inputs.materialeId !== undefined) {
        const kategori = materialeVedId(inputs.materialeId);
        setMaterialeId(kategori.id);
        setSpildPct(kategori.spildPct);
        setDaekningPrEnhed(kategori.daekningPrEnhedM2);
      }
      if (inputs.antalFelter !== undefined) setAntalFelter(inputs.antalFelter);
      if (inputs.spildPct !== undefined) setSpildPct(inputs.spildPct);
      if (inputs.daekningPrEnhed !== undefined) setDaekningPrEnhed(inputs.daekningPrEnhed);
      if (inputs.prisPrMateriale !== undefined) setPrisPrMateriale(inputs.prisPrMateriale);
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
      inputs: {
        formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm,
        materialeId, antalFelter, spildPct, daekningPrEnhed, prisPrMateriale,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [formType, laengde, bredde, radius, grundlinje, hoejde, side1, side2, trapezHoejde, prisPerKvm, materialeId, antalFelter, spildPct, daekningPrEnhed, prisPrMateriale]);

  const vaelgMateriale = useCallback((id: MaterialeId) => {
    const kategori = materialeVedId(id);
    setMaterialeId(kategori.id);
    setSpildPct(kategori.spildPct);
    setDaekningPrEnhed(kategori.daekningPrEnhedM2);
  }, []);

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
    vaelgMateriale("gulv");
    setAntalFelter(1);
    setPrisPrMateriale(0);
  }, [vaelgMateriale]);

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

  const materiale = useMemo(() => materialeVedId(materialeId), [materialeId]);

  const materialebehov = useMemo(
    () => beregnMaterialbehov(beregning.areal, materiale, { antalFelter, spildPct, daekningPrEnhedM2: daekningPrEnhed }),
    [beregning.areal, materiale, antalFelter, spildPct, daekningPrEnhed],
  );

  const materialetsSamletPris = useMemo(
    () => beregnMaterialpris(materialebehov, prisPrMateriale),
    [materialebehov, prisPrMateriale],
  );

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
          <button type="button"
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
          <button type="button"
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
          <button type="button"
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
          <button type="button"
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

      {/* Materialeberegning */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-medium mb-1 dark:text-white">{l.materialer}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{l.spildKilde}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {MATERIALER.map((kategori) => (
            <button
              key={kategori.id}
              type="button"
              aria-pressed={materialeId === kategori.id}
              onClick={() => vaelgMateriale(kategori.id)}
              className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                materialeId === kategori.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
              }`}
            >
              {materialeNavn(kategori, locale)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="kvadratmeter-antal-felter" className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.antalFelter}
            </label>
            <input
              id="kvadratmeter-antal-felter"
              type="number"
              min="1"
              step="1"
              value={antalFelter}
              onChange={(e) => setAntalFelter(parseInt(e.target.value, 10) || 1)}
              className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="kvadratmeter-spild" className="block text-sm font-medium mb-2 dark:text-gray-200">
              {l.spildPct}
            </label>
            <div className="relative">
              <input
                id="kvadratmeter-spild"
                type="number"
                min="0"
                step="1"
                value={spildPct}
                onChange={(e) => setSpildPct(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-10 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
          {materialebehov.enheder !== null ? (
            <div>
              <label htmlFor="kvadratmeter-daekning" className="block text-sm font-medium mb-2 dark:text-gray-200">
                {l.daekningPrEnhed} (m&#178;)
              </label>
              <input
                id="kvadratmeter-daekning"
                type="number"
                min="0"
                step="0.5"
                value={daekningPrEnhed || ""}
                placeholder="0"
                onChange={(e) => setDaekningPrEnhed(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.daekningsKilde}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium mb-2 dark:text-gray-200">{l.daekningPrEnhed}</p>
              <p className="px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-sm text-gray-600 dark:text-gray-400">
                {l.daekningPrM2}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="kvadratmeter-pris-materiale" className="block text-sm font-medium mb-2 dark:text-gray-200">
            {materialebehov.enheder !== null ? l.prisPrMaterialeEnhed : l.prisPrMaterialeM2}
          </label>
          <div className="relative max-w-xs">
            <input
              id="kvadratmeter-pris-materiale"
              type="number"
              min="0"
              step="10"
              value={prisPrMateriale || ""}
              placeholder="0"
              onChange={(e) => setPrisPrMateriale(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 pr-24 border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {materialebehov.enheder !== null
                ? `${getCurrencySuffix(locale)}/${materialeEnhedNavn(materiale, locale)}`
                : `${getCurrencySuffix(locale)}/m²`}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">{l.skalKobe}</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              {materialebehov.enheder !== null
                ? `${materialebehov.enheder} ${materialeEnhedNavn(materiale, locale)}`
                : `${formatNumber(materialebehov.arealMedSpildM2)} m²`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatNumber(materialebehov.arealMedSpildM2)} m² {l.medSpild} ({formatNumber(materialebehov.spildM2)} m² {l.spildM2})
            </p>
          </div>
          {materialetsSamletPris > 0 && (
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">{l.samletPris}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatKr(materialetsSamletPris)}</p>
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
