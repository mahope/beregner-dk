"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from '@/components/LocaleProvider';
import { getIntlLocale } from '@/lib/format';
import { Cake, CalendarDays, Sparkles } from "lucide-react";

export default function AlderBeregner() {
  const { locale } = useLocale();
  const intlLocale = getIntlLocale(locale);

  const labels = {
    da: {
      birthDate: "Fødselsdato",
      calcAgePerDate: "Beregn alder pr. dato",
      useToday: "Brug i dag",
      yourExactAge: "Din præcise alder",
      yearUnit: "år",
      monthsAndDays: (m: number, d: number) => `${m} måneder og ${d} dage`,
      nextBirthday: (days: number, age: number) => (
        <><Cake className="mr-1.5 inline h-4 w-4 align-text-bottom text-pink-500" strokeWidth={1.75} aria-hidden="true" focusable="false" />Der er <strong>{days} dage</strong> til din næste fødselsdag (du fylder {age} år)</>
      ),
      daysLived: "Dage levet",
      weeksLived: "Uger levet",
      monthsLived: "Måneder levet",
      hoursLived: "Timer levet",
      zodiacLabel: "Stjernetegn",
      bornOnA: "Født på en",
      detailedTitle: "Detaljeret aldersberegning",
      ageInYears: "Alder i år",
      ageInMonths: "Alder i måneder",
      ageInWeeks: "Alder i uger",
      ageInDays: "Alder i dage",
      ageInHours: "Alder i timer",
      ageInMinutes: "Alder i minutter",
      copySummary: (aar: number, mdr: number, dage: number) => `${aar} år, ${mdr} mdr, ${dage} dage`,
      calcName: "Aldersberegner",
      errorFutureBirth: "Fødselsdatoen kan ikke være efter beregningsdatoen.",
      emptyPrompt: "Indtast din fødselsdato for at se din præcise alder",
      weekdays: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"],
      zodiac: [
        { navn: "Vædder", periode: "21. mar - 19. apr" },
        { navn: "Tyr", periode: "20. apr - 20. maj" },
        { navn: "Tvilling", periode: "21. maj - 20. jun" },
        { navn: "Krebs", periode: "21. jun - 22. jul" },
        { navn: "Løve", periode: "23. jul - 22. aug" },
        { navn: "Jomfru", periode: "23. aug - 22. sep" },
        { navn: "Vægt", periode: "23. sep - 22. okt" },
        { navn: "Skorpion", periode: "23. okt - 21. nov" },
        { navn: "Skytte", periode: "22. nov - 21. dec" },
        { navn: "Stenbuk", periode: "22. dec - 19. jan" },
        { navn: "Vandmand", periode: "20. jan - 18. feb" },
        { navn: "Fisk", periode: "19. feb - 20. mar" },
      ],
    },
    se: {
      birthDate: "Födelsedatum",
      calcAgePerDate: "Beräkna ålder per datum",
      useToday: "Använd idag",
      yourExactAge: "Din exakta ålder",
      yearUnit: "år",
      monthsAndDays: (m: number, d: number) => `${m} månader och ${d} dagar`,
      nextBirthday: (days: number, age: number) => (
        <><Cake className="mr-1.5 inline h-4 w-4 align-text-bottom text-pink-500" strokeWidth={1.75} aria-hidden="true" focusable="false" />Det är <strong>{days} dagar</strong> till din nästa födelsedag (du fyller {age} år)</>
      ),
      daysLived: "Dagar levda",
      weeksLived: "Veckor levda",
      monthsLived: "Månader levda",
      hoursLived: "Timmar levda",
      zodiacLabel: "Stjärntecken",
      bornOnA: "Född på en",
      detailedTitle: "Detaljerad åldersberäkning",
      ageInYears: "Ålder i år",
      ageInMonths: "Ålder i månader",
      ageInWeeks: "Ålder i veckor",
      ageInDays: "Ålder i dagar",
      ageInHours: "Ålder i timmar",
      ageInMinutes: "Ålder i minuter",
      copySummary: (aar: number, mdr: number, dage: number) => `${aar} år, ${mdr} mån, ${dage} dagar`,
      calcName: "Ålderskalkylator",
      errorFutureBirth: "Födelsedatumet kan inte vara efter beräkningsdatumet.",
      emptyPrompt: "Ange ditt födelsedatum för att se din exakta ålder",
      weekdays: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"],
      zodiac: [
        { navn: "Väduren", periode: "21. mar - 19. apr" },
        { navn: "Oxen", periode: "20. apr - 20. maj" },
        { navn: "Tvillingarna", periode: "21. maj - 20. jun" },
        { navn: "Kräftan", periode: "21. jun - 22. jul" },
        { navn: "Lejonet", periode: "23. jul - 22. aug" },
        { navn: "Jungfrun", periode: "23. aug - 22. sep" },
        { navn: "Vågen", periode: "23. sep - 22. okt" },
        { navn: "Skorpionen", periode: "23. okt - 21. nov" },
        { navn: "Skytten", periode: "22. nov - 21. dec" },
        { navn: "Stenbocken", periode: "22. dec - 19. jan" },
        { navn: "Vattumannen", periode: "20. jan - 18. feb" },
        { navn: "Fiskarna", periode: "19. feb - 20. mar" },
      ],
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;
  const [foedselsdato, setFoedselsdato] = useState<string>("");
  const [beregningsDato, setBeregningsDato] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'alder') {
      const inputs = urlState.inputs;
      if (inputs.foedselsdato) setFoedselsdato(inputs.foedselsdato);
      if (inputs.beregningsDato) setBeregningsDato(inputs.beregningsDato);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("alder");
    const timer = setTimeout(() => {
      trackCalculation("alder");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'alder',
      inputs: { foedselsdato, beregningsDato },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [foedselsdato, beregningsDato]);

  const handleReset = useCallback(() => {
    setFoedselsdato("");
    setBeregningsDato(new Date().toISOString().split("T")[0]);
  }, []);

  const beregning = useMemo(() => {
    if (!foedselsdato) {
      return null;
    }

    const foedselsDate = new Date(foedselsdato);
    const beregningsDate = new Date(beregningsDato);

    if (foedselsDate > beregningsDate) {
      return null;
    }

    // Beregn præcis alder
    let aar = beregningsDate.getFullYear() - foedselsDate.getFullYear();
    let maaneder = beregningsDate.getMonth() - foedselsDate.getMonth();
    let dage = beregningsDate.getDate() - foedselsDate.getDate();

    // Juster for negative dage
    if (dage < 0) {
      maaneder--;
      const sidsteMaaned = new Date(beregningsDate.getFullYear(), beregningsDate.getMonth(), 0);
      dage += sidsteMaaned.getDate();
    }

    // Juster for negative måneder
    if (maaneder < 0) {
      aar--;
      maaneder += 12;
    }

    // Beregn totaler
    const diffTime = beregningsDate.getTime() - foedselsDate.getTime();
    const totalDage = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalUger = Math.floor(totalDage / 7);
    const totalMaaneder = aar * 12 + maaneder;
    const totalTimer = totalDage * 24;
    const totalMinutter = totalTimer * 60;

    // Find næste fødselsdag
    let naesteFoedselsdag = new Date(
      beregningsDate.getFullYear(),
      foedselsDate.getMonth(),
      foedselsDate.getDate()
    );
    if (naesteFoedselsdag <= beregningsDate) {
      naesteFoedselsdag = new Date(
        beregningsDate.getFullYear() + 1,
        foedselsDate.getMonth(),
        foedselsDate.getDate()
      );
    }
    const dageTilFoedselsdag = Math.ceil(
      (naesteFoedselsdag.getTime() - beregningsDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Stjernetegn
    const stjernetegnIndex = getStjernetegnIndex(foedselsDate);
    const stjernetegn = {
      navn: l.zodiac[stjernetegnIndex].navn,
      periode: l.zodiac[stjernetegnIndex].periode,
    };

    // Ugedag født
    const ugedagFoedt = l.weekdays[foedselsDate.getDay()];

    return {
      aar,
      maaneder,
      dage,
      totalDage,
      totalUger,
      totalMaaneder,
      totalTimer,
      totalMinutter,
      dageTilFoedselsdag,
      naesteFoedselsdagAlder: aar + (maaneder > 0 || dage > 0 ? 1 : 1),
      stjernetegn,
      ugedagFoedt,
    };
  }, [foedselsdato, beregningsDato]);

  function getStjernetegnIndex(dato: Date): number {
    const dag = dato.getDate();
    const maaned = dato.getMonth() + 1;

    if ((maaned === 3 && dag >= 21) || (maaned === 4 && dag <= 19)) {
      return 0;
    } else if ((maaned === 4 && dag >= 20) || (maaned === 5 && dag <= 20)) {
      return 1;
    } else if ((maaned === 5 && dag >= 21) || (maaned === 6 && dag <= 20)) {
      return 2;
    } else if ((maaned === 6 && dag >= 21) || (maaned === 7 && dag <= 22)) {
      return 3;
    } else if ((maaned === 7 && dag >= 23) || (maaned === 8 && dag <= 22)) {
      return 4;
    } else if ((maaned === 8 && dag >= 23) || (maaned === 9 && dag <= 22)) {
      return 5;
    } else if ((maaned === 9 && dag >= 23) || (maaned === 10 && dag <= 22)) {
      return 6;
    } else if ((maaned === 10 && dag >= 23) || (maaned === 11 && dag <= 21)) {
      return 7;
    } else if ((maaned === 11 && dag >= 22) || (maaned === 12 && dag <= 21)) {
      return 8;
    } else if ((maaned === 12 && dag >= 22) || (maaned === 1 && dag <= 19)) {
      return 9;
    } else if ((maaned === 1 && dag >= 20) || (maaned === 2 && dag <= 18)) {
      return 10;
    } else {
      return 11;
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(intlLocale).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.birthDate}</label>
          <input
            type="date"
            value={foedselsdato}
            onChange={(e) => setFoedselsdato(e.target.value)}
            max={beregningsDato}
            className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">{l.calcAgePerDate}</label>
          <input
            type="date"
            value={beregningsDato}
            onChange={(e) => setBeregningsDato(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg text-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button type="button"
            onClick={() => setBeregningsDato(new Date().toISOString().split("T")[0])}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mt-1"
          >
            {l.useToday}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {beregning && (
        <>
          {/* Hovedresultat */}
          <div className="p-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl text-center text-white">
            <p className="text-lg opacity-90 mb-2">{l.yourExactAge}</p>
            <p className="text-5xl md:text-6xl font-bold mb-2">
              {beregning.aar} {l.yearUnit}
            </p>
            <p className="text-xl opacity-90">
              {l.monthsAndDays(beregning.maaneder, beregning.dage)}
            </p>
          </div>

          {/* Næste fødselsdag */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-center">
            <p className="text-yellow-800 dark:text-yellow-300">
              {l.nextBirthday(beregning.dageTilFoedselsdag, beregning.naesteFoedselsdagAlder)}
            </p>
          </div>

          {/* Statistikker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalDage)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.daysLived}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalUger)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.weeksLived}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalMaaneder)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.monthsLived}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNumber(beregning.totalTimer)}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{l.hoursLived}</p>
            </div>
          </div>

          {/* Fun facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Sparkles className="h-10 w-10 text-purple-500 dark:text-purple-400 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />
                <div>
                  <p className="font-medium dark:text-gray-200">{l.zodiacLabel}: {beregning.stjernetegn.navn}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{beregning.stjernetegn.periode}</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-10 w-10 text-green-600 dark:text-green-400 shrink-0" strokeWidth={1.75} aria-hidden="true" focusable="false" />
                <div>
                  <p className="font-medium dark:text-gray-200">{l.bornOnA} {beregning.ugedagFoedt}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(foedselsdato).toLocaleDateString(intlLocale, {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detaljeret tabel */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
              <h3 className="font-medium dark:text-white">{l.detailedTitle}</h3>
            </div>
            <div className="p-4">
              <table className="w-full text-sm dark:text-gray-200">
                <tbody>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">{l.ageInYears}</td>
                    <td className="py-2 text-right font-mono">{beregning.aar}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">{l.ageInMonths}</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalMaaneder)}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">{l.ageInWeeks}</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalUger)}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">{l.ageInDays}</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalDage)}</td>
                  </tr>
                  <tr className="border-b dark:border-gray-700">
                    <td className="py-2">{l.ageInHours}</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalTimer)}</td>
                  </tr>
                  <tr>
                    <td className="py-2">{l.ageInMinutes}</td>
                    <td className="py-2 text-right font-mono">{formatNumber(beregning.totalMinutter)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center">
            <CopyResultButton text={l.copySummary(beregning.aar, beregning.maaneder, beregning.dage)} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName={l.calcName}
              resultSummary={beregning ? l.copySummary(beregning.aar, beregning.maaneder, beregning.dage) : undefined}
            />
          </div>
        </>
      )}

      {!beregning && foedselsdato && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-center text-red-700 dark:text-red-400">
          {l.errorFutureBirth}
        </div>
      )}

      {!foedselsdato && (
        <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl text-center text-gray-500 dark:text-gray-400">
          {l.emptyPrompt}
        </div>
      )}
    </div>
  );
}
