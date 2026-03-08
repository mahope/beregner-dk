"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { BilforsikringAffiliate } from "./AffiliateBox";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type Braendstoftype = "benzin" | "diesel" | "el" | "hybrid";

export default function BilBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      bilensPris: "Bilens pris",
      braendstoftype: "Br\u00e6ndstoftype",
      benzin: "\u26fd Benzin",
      diesel: "\ud83d\udee2\ufe0f Diesel",
      elbil: "\u26a1 Elbil",
      hybrid: "\ud83d\udd0b Hybrid",
      koerselPrAar: "K\u00f8rsel pr. \u00e5r (km)",
      koerselGennemsnit: "Gennemsnitligt: 15.000 km/\u00e5r",
      forsikringLabel: "Forsikring (kr/\u00e5r)",
      forbrugKwh: "Forbrug (kWh/100 km)",
      typiskKwh: "Typisk: 15-20 kWh/100 km",
      elprisLabel: "Elpris (kr/kWh)",
      elprisHint: "Hjemme: 2-3 kr, Offentlig: 3-5 kr",
      forbrugKmL: "Forbrug (km/liter)",
      typiskDiesel: "Typisk diesel: 18-25 km/l",
      typiskBenzin: "Typisk benzin: 12-18 km/l",
      braendstofprisLabel: "Br\u00e6ndstofpris (kr/liter)",
      aarligtVaerditab: "\u00c5rligt v\u00e6rditab (%)",
      vaerditabHint: "Nye biler: 15-20%, \u00e6ldre: 8-12%",
      samletMaanedlig: "Samlet m\u00e5nedlig omkostning",
      braendstofStroem: "Br\u00e6ndstof/str\u00f8m",
      vaerditabLabel: "V\u00e6rditab",
      forsikringResultat: "Forsikring",
      vaegtafgift: "V\u00e6gtafgift",
      service: "Service",
      daek: "D\u00e6k",
      samletAarlig: "Samlet \u00e5rlig omkostning:",
      tipsTitle: "\ud83d\udca1 S\u00e5dan sparer du p\u00e5 bilomkostninger",
      tipForsikring: "Sammenlign forsikringer",
      tipForsikringText: " - priser varierer op til 50%",
      tipKoer: "K\u00f8r j\u00e6vnt",
      tipKoerText: " - op til 20% bedre br\u00e6ndstof\u00f8konomi",
      tipDaek: "Tjek d\u00e6ktryk",
      tipDaekText: " - korrekt tryk sparer br\u00e6ndstof",
      tipElbil: "Overvej elbil",
      tipElbilText: " - lavere driftsomkostninger trods h\u00f8jere pris",
      tipBrugt: "K\u00f8b brugt",
      tipBrugtText: " - undg\u00e5 det st\u00f8rste v\u00e6rditab (\u00e5r 1-3)",
    },
    se: {
      bilensPris: "Bilens pris",
      braendstoftype: "Br\u00e4nsletyp",
      benzin: "\u26fd Bensin",
      diesel: "\ud83d\udee2\ufe0f Diesel",
      elbil: "\u26a1 Elbil",
      hybrid: "\ud83d\udd0b Hybrid",
      koerselPrAar: "K\u00f6rning per \u00e5r (km)",
      koerselGennemsnit: "Genomsnitt: 15 000 km/\u00e5r",
      forsikringLabel: "F\u00f6rs\u00e4kring (kr/\u00e5r)",
      forbrugKwh: "F\u00f6rbrukning (kWh/100 km)",
      typiskKwh: "Typiskt: 15\u201320 kWh/100 km",
      elprisLabel: "Elpris (kr/kWh)",
      elprisHint: "Hemma: 1\u20132 kr, Offentlig: 3\u20135 kr",
      forbrugKmL: "F\u00f6rbrukning (km/liter)",
      typiskDiesel: "Typisk diesel: 18\u201325 km/l",
      typiskBenzin: "Typisk bensin: 12\u201318 km/l",
      braendstofprisLabel: "Br\u00e4nslepris (kr/liter)",
      aarligtVaerditab: "\u00c5rligt v\u00e4rdefall (%)",
      vaerditabHint: "Nya bilar: 15\u201320 %, \u00e4ldre: 8\u201312 %",
      samletMaanedlig: "Total m\u00e5nadskostnad",
      braendstofStroem: "Br\u00e4nsle/el",
      vaerditabLabel: "V\u00e4rdefall",
      forsikringResultat: "F\u00f6rs\u00e4kring",
      vaegtafgift: "Fordonsskatt",
      service: "Service",
      daek: "D\u00e4ck",
      samletAarlig: "Total \u00e5rlig kostnad:",
      tipsTitle: "\ud83d\udca1 S\u00e5 sparar du p\u00e5 bilkostnader",
      tipForsikring: "J\u00e4mf\u00f6r f\u00f6rs\u00e4kringar",
      tipForsikringText: " \u2013 priserna varierar upp till 50 %",
      tipKoer: "K\u00f6r j\u00e4mnt",
      tipKoerText: " \u2013 upp till 20 % b\u00e4ttre br\u00e4nsleekonomi",
      tipDaek: "Kontrollera d\u00e4cktrycket",
      tipDaekText: " \u2013 r\u00e4tt tryck sparar br\u00e4nsle",
      tipElbil: "\u00d6verv\u00e4g elbil",
      tipElbilText: " \u2013 l\u00e4gre driftskostnader trots h\u00f6gre pris",
      tipBrugt: "K\u00f6p begagnat",
      tipBrugtText: " \u2013 undvik det st\u00f6rsta v\u00e4rdefallet (\u00e5r 1\u20133)",
    },
    no: {
      bilensPris: "Bilens pris",
      braendstoftype: "Drivstofftype",
      benzin: "\u26fd Bensin",
      diesel: "\ud83d\udee2\ufe0f Diesel",
      elbil: "\u26a1 Elbil",
      hybrid: "\ud83d\udd0b Hybrid",
      koerselPrAar: "Kj\u00f8ring per \u00e5r (km)",
      koerselGennemsnit: "Gjennomsnittlig: 15 000 km/\u00e5r",
      forsikringLabel: "Forsikring (kr/\u00e5r)",
      forbrugKwh: "Forbruk (kWh/100 km)",
      typiskKwh: "Typisk: 15\u201320 kWh/100 km",
      elprisLabel: "Str\u00f8mpris (kr/kWh)",
      elprisHint: "Hjemme: 1\u20132 kr, Offentlig: 3\u20135 kr",
      forbrugKmL: "Forbruk (km/liter)",
      typiskDiesel: "Typisk diesel: 18\u201325 km/l",
      typiskBenzin: "Typisk bensin: 12\u201318 km/l",
      braendstofprisLabel: "Drivstoffpris (kr/liter)",
      aarligtVaerditab: "\u00c5rlig verditap (%)",
      vaerditabHint: "Nye biler: 15\u201320 %, eldre: 8\u201312 %",
      samletMaanedlig: "Total m\u00e5nedlig kostnad",
      braendstofStroem: "Drivstoff/str\u00f8m",
      vaerditabLabel: "Verditap",
      forsikringResultat: "Forsikring",
      vaegtafgift: "Veiavgift",
      service: "Service",
      daek: "Dekk",
      samletAarlig: "Total \u00e5rlig kostnad:",
      tipsTitle: "\ud83d\udca1 Slik sparer du p\u00e5 bilkostnader",
      tipForsikring: "Sammenlign forsikringer",
      tipForsikringText: " \u2013 prisene varierer opptil 50 %",
      tipKoer: "Kj\u00f8r jevnt",
      tipKoerText: " \u2013 opptil 20 % bedre drivstoff\u00f8konomi",
      tipDaek: "Sjekk dekktrykket",
      tipDaekText: " \u2013 riktig trykk sparer drivstoff",
      tipElbil: "Vurder elbil",
      tipElbilText: " \u2013 lavere driftskostnader tross h\u00f8yere pris",
      tipBrugt: "Kj\u00f8p brukt",
      tipBrugtText: " \u2013 unng\u00e5 det st\u00f8rste verditapet (\u00e5r 1\u20133)",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [bilpris, setBilpris] = useState<number>(250000);
  const [braendstof, setBraendstof] = useState<Braendstoftype>("benzin");
  const [kmPrLiter, setKmPrLiter] = useState<number>(15);
  const [kmPrAar, setKmPrAar] = useState<number>(15000);
  const [braendstofpris, setBraendstofpris] = useState<number>(13.5);
  const [forsikring, setForsikring] = useState<number>(8000);
  const [vaerditab, setVaerditab] = useState<number>(15);

  // El-bil specifikt
  const [kwh100km, setKwh100km] = useState<number>(17);
  const [elpris, setElpris] = useState<number>(2.5);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'bil') {
      const inputs = urlState.inputs;
      if (inputs.bilpris !== undefined) setBilpris(inputs.bilpris);
      if (inputs.braendstof) setBraendstof(inputs.braendstof);
      if (inputs.kmPrLiter !== undefined) setKmPrLiter(inputs.kmPrLiter);
      if (inputs.kmPrAar !== undefined) setKmPrAar(inputs.kmPrAar);
      if (inputs.braendstofpris !== undefined) setBraendstofpris(inputs.braendstofpris);
      if (inputs.forsikring !== undefined) setForsikring(inputs.forsikring);
      if (inputs.vaerditab !== undefined) setVaerditab(inputs.vaerditab);
      if (inputs.kwh100km !== undefined) setKwh100km(inputs.kwh100km);
      if (inputs.elpris !== undefined) setElpris(inputs.elpris);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("bil");
    const timer = setTimeout(() => {
      trackCalculation("bil");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'bil',
      inputs: { bilpris, braendstof, kmPrLiter, kmPrAar, braendstofpris, forsikring, vaerditab, kwh100km, elpris },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bilpris, braendstof, kmPrLiter, kmPrAar, braendstofpris, forsikring, vaerditab, kwh100km, elpris]);

  const handleReset = useCallback(() => {
    setBilpris(250000);
    setBraendstof("benzin");
    setKmPrLiter(15);
    setKmPrAar(15000);
    setBraendstofpris(13.5);
    setForsikring(8000);
    setVaerditab(15);
    setKwh100km(17);
    setElpris(2.5);
  }, []);

  const resultat = useMemo(() => {
    let braendstofOmkostning: number;

    if (braendstof === "el") {
      braendstofOmkostning = (kwh100km / 100) * kmPrAar * elpris;
    } else {
      braendstofOmkostning = (kmPrAar / kmPrLiter) * braendstofpris;
    }

    let vaegt: number;
    if (braendstof === "el") {
      vaegt = 0;
    } else if (braendstof === "benzin") {
      vaegt = 4000;
    } else if (braendstof === "diesel") {
      vaegt = 5500;
    } else {
      vaegt = 3000;
    }

    const aarligtVaerditab = bilpris * (vaerditab / 100);
    const service = bilpris * 0.03;
    const daek = 3000;
    const aarligtTotal = braendstofOmkostning + forsikring + vaegt + aarligtVaerditab + service + daek;
    const maanedligtTotal = aarligtTotal / 12;
    const prKm = aarligtTotal / kmPrAar;

    return {
      braendstof: Math.round(braendstofOmkostning),
      forsikring: Math.round(forsikring),
      vaegt: Math.round(vaegt),
      vaerditab: Math.round(aarligtVaerditab),
      service: Math.round(service),
      daek: Math.round(daek),
      aarligt: Math.round(aarligtTotal),
      maanedligt: Math.round(maanedligtTotal),
      prKm: prKm.toFixed(2),
    };
  }, [bilpris, braendstof, kmPrLiter, kmPrAar, braendstofpris, forsikring, vaerditab, kwh100km, elpris]);

  const formatKr = (amount: number) => formatCurrency(amount, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="bilPris" className="block text-sm font-medium mb-2">{l.bilensPris}</label>
            <div className="relative">
              <input
                id="bilPris"
                type="number"
                min="10000"
                max="5000000"
                step="10000"
                value={bilpris}
                onChange={(e) => setBilpris(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySuffix(locale)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{formatKr(bilpris)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{l.braendstoftype}</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "benzin", label: l.benzin },
                { key: "diesel", label: l.diesel },
                { key: "el", label: l.elbil },
                { key: "hybrid", label: l.hybrid },
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setBraendstof(type.key as Braendstoftype)}
                  className={`py-2 px-4 rounded-lg border-2 transition-colors text-sm ${
                    braendstof === type.key
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="koerselPrAar" className="block text-sm font-medium mb-2">{l.koerselPrAar}</label>
            <div className="relative">
              <input
                id="koerselPrAar"
                type="number"
                min="1000"
                max="100000"
                step="1000"
                value={kmPrAar}
                onChange={(e) => setKmPrAar(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{l.koerselGennemsnit}</p>
          </div>

          <div>
            <label htmlFor="forsikring" className="block text-sm font-medium mb-2">{l.forsikringLabel}</label>
            <div className="relative">
              <input
                id="forsikring"
                type="number"
                min="0"
                max="50000"
                step="500"
                value={forsikring}
                onChange={(e) => setForsikring(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-16 border rounded-lg text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySuffix(locale)}/&#229;r</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {braendstof === "el" ? (
            <>
              <div>
                <label htmlFor="forbrugKwh" className="block text-sm font-medium mb-2">{l.forbrugKwh}</label>
                <div className="relative">
                  <input
                    id="forbrugKwh"
                    type="number"
                    min="10"
                    max="40"
                    step="0.5"
                    value={kwh100km}
                    onChange={(e) => setKwh100km(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-16 border rounded-lg text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh/100km</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{l.typiskKwh}</p>
              </div>

              <div>
                <label htmlFor="elpris" className="block text-sm font-medium mb-2">{l.elprisLabel}</label>
                <div className="relative">
                  <input
                    id="elpris"
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.1"
                    value={elpris}
                    onChange={(e) => setElpris(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-16 border rounded-lg text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySuffix(locale)}/kWh</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{l.elprisHint}</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="forbrugKmLiter" className="block text-sm font-medium mb-2">{l.forbrugKmL}</label>
                <div className="relative">
                  <input
                    id="forbrugKmLiter"
                    type="number"
                    min="5"
                    max="40"
                    step="0.5"
                    value={kmPrLiter}
                    onChange={(e) => setKmPrLiter(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-16 border rounded-lg text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">km/l</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {braendstof === "diesel" ? l.typiskDiesel : l.typiskBenzin}
                </p>
              </div>

              <div>
                <label htmlFor="braendstofpris" className="block text-sm font-medium mb-2">{l.braendstofprisLabel}</label>
                <div className="relative">
                  <input
                    id="braendstofpris"
                    type="number"
                    min="5"
                    max="25"
                    step="0.1"
                    value={braendstofpris}
                    onChange={(e) => setBraendstofpris(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg text-lg"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{getCurrencySuffix(locale)}/l</span>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="vaerditab" className="block text-sm font-medium mb-2">{l.aarligtVaerditab}</label>
            <div className="relative">
              <input
                id="vaerditab"
                type="number"
                min="5"
                max="30"
                step="1"
                value={vaerditab}
                onChange={(e) => setVaerditab(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 pr-12 border rounded-lg text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {l.vaerditabHint}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Resultat */}
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">{l.samletMaanedlig}</p>
          <p className="text-5xl font-bold text-blue-600">
            {formatKr(resultat.maanedligt)}
          </p>
          <p className="text-xl text-gray-500 mt-2">
            {resultat.prKm} kr/km
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <p className="text-sm text-red-600">{l.braendstofStroem}</p>
            <p className="font-bold text-lg">{formatKr(resultat.braendstof)}/&#229;r</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center">
            <p className="text-sm text-orange-600">{l.vaerditabLabel}</p>
            <p className="font-bold text-lg">{formatKr(resultat.vaerditab)}/&#229;r</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-blue-600">{l.forsikringResultat}</p>
            <p className="font-bold text-lg">{formatKr(resultat.forsikring)}/&#229;r</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-purple-600">{l.vaegtafgift}</p>
            <p className="font-bold text-lg">{formatKr(resultat.vaegt)}/&#229;r</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-600">{l.service}</p>
            <p className="font-bold text-lg">{formatKr(resultat.service)}/&#229;r</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">{l.daek}</p>
            <p className="font-bold text-lg">{formatKr(resultat.daek)}/&#229;r</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-lg font-semibold text-blue-800 text-center">
            {l.samletAarlig} {formatKr(resultat.aarligt)}
          </p>
        </div>
      </div>

      {/* Share button */}
      <div className="flex justify-center gap-3">
        <CopyResultButton text={`${formatKr(resultat.maanedligt)}/md - ${resultat.prKm} kr/km (${formatKr(resultat.aarligt)}/\u00e5r)`} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Bilberegner"
          resultSummary={`${formatKr(resultat.maanedligt)}/md - ${resultat.prKm} kr/km (${formatKr(resultat.aarligt)}/\u00e5r)`}
        />
      </div>

      {/* Tips */}
      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-green-800 dark:text-green-200">{l.tipsTitle}</h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
          <li>&#8226; <strong>{l.tipForsikring}</strong>{l.tipForsikringText}</li>
          <li>&#8226; <strong>{l.tipKoer}</strong>{l.tipKoerText}</li>
          <li>&#8226; <strong>{l.tipDaek}</strong>{l.tipDaekText}</li>
          <li>&#8226; <strong>{l.tipElbil}</strong>{l.tipElbilText}</li>
          <li>&#8226; <strong>{l.tipBrugt}</strong>{l.tipBrugtText}</li>
        </ul>
      </div>

      {/* Affiliate box - sammenlign bilforsikringer */}
      <BilforsikringAffiliate className="mt-6" />
    </div>
  );
}
