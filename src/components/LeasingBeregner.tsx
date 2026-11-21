'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Car } from 'lucide-react';
import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";
import { LEASING_EKSEMPEL, beregnLeasingSammenlign, leasingSammenlignSætning } from "@/lib/leasing";

type VisningsType = 'leasing' | 'sammenlign';

export default function LeasingBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      bilpris: "Bilpris",
      restvaerdi: "Restv\u00e6rdi (ved leasingperiodens udl\u00f8b)",
      loebetid: "L\u00f8betid",
      months: "mdr",
      renteAOP: "Rente (\u00c5OP)",
      udbetaling: "Udbetaling",
      vaelgVisning: "V\u00e6lg visning",
      leasingberegning: "Leasingberegning",
      sammenlign: "Sammenlign",
      maanedligLeasingydelse: "M\u00e5nedlig leasingydelse",
      samletLeasingudgift: "Samlet leasingudgift",
      herafRenter: "Heraf renter",
      bilprisLabel: "Bilpris",
      restvaerdiLabel: "Restv\u00e6rdi",
      vaerdtab: "V\u00e6rditab (du betaler for)",
      leasingVsLaan: "Leasing vs. L\u00e5n vs. Kontant",
      leasing: "Leasing",
      billaan: "Bill\u00e5n",
      kontantkoeb: "Kontantk\u00f8b",
      vaerdtabNote: "*V\u00e6rditab fordelt over perioden. Ingen renter.",
      disclaimer: "* Vejledende beregning. Faktisk leasingydelse kan variere med gebyrer og vilk\u00e5r.",
      emptyState: "Indtast bilpris og vilk\u00e5r for at se beregningen",
      privatLeasing: "Privat leasing",
      privatLeasingDesc: "Ved privat leasing lejer du bilen i en fast periode. Du betaler for bilens v\u00e6rditab plus renter, men ejer ikke bilen. Ved periodens udl\u00f8b afleverer du bilen.",
      erhvervsleasing: "Erhvervsleasing",
      erhvervsleasingDesc: "Ved erhvervsleasing kan leasingydelsen fradrages som driftsudgift. Momsen p\u00e5 ydelsen kan ogs\u00e5 fradrages. Det g\u00f8r leasing ofte fordelagtigt for virksomheder.",
      maanedlig: "M\u00e5nedligt",
      iaalt: "I alt",
      efterPerioden: "Efter perioden",
      nettoOmkostning: "Netto omkostning",
      nettoForklaering: "Netto omkostning er alt, du betaler, minus bilens v\u00e6rdi, n\u00e5r perioden er slut. Det er det eneste tal de tre kan sammenlignes p\u00e5.",
    },
    se: {
      bilpris: "Bilpris",
      restvaerdi: "Restv\u00e4rde (vid leasingperiodens slut)",
      loebetid: "L\u00f6ptid",
      months: "m\u00e5n",
      renteAOP: "R\u00e4nta (eff.)",
      udbetaling: "Kontantinsats",
      vaelgVisning: "V\u00e4lj vy",
      leasingberegning: "Leasingber\u00e4kning",
      sammenlign: "J\u00e4mf\u00f6r",
      maanedligLeasingydelse: "M\u00e5natlig leasingkostnad",
      samletLeasingudgift: "Total leasingkostnad",
      herafRenter: "Varav r\u00e4nta",
      bilprisLabel: "Bilpris",
      restvaerdiLabel: "Restv\u00e4rde",
      vaerdtab: "V\u00e4rdeminskning (du betalar f\u00f6r)",
      leasingVsLaan: "Leasing vs. L\u00e5n vs. Kontant",
      leasing: "Leasing",
      billaan: "Bill\u00e5n",
      kontantkoeb: "Kontantk\u00f6p",
      vaerdtabNote: "*V\u00e4rdeminskning f\u00f6rdelad \u00f6ver perioden. Inga r\u00e4ntor.",
      disclaimer: "* V\u00e4gledande ber\u00e4kning. Faktisk leasingkostnad kan variera med avgifter och villkor.",
      emptyState: "Ange bilpris och villkor f\u00f6r att se ber\u00e4kningen",
      privatLeasing: "Privatleasing",
      privatLeasingDesc: "Vid privatleasing hyr du bilen under en fast period. Du betalar f\u00f6r bilens v\u00e4rdeminskning plus r\u00e4nta, men \u00e4ger inte bilen. Vid periodens slut l\u00e4mnar du tillbaka bilen.",
      erhvervsleasing: "F\u00f6retagsleasing",
      erhvervsleasingDesc: "Vid f\u00f6retagsleasing kan leasingkostnaden dras av som driftskostnad. Momsen p\u00e5 avgiften kan ocks\u00e5 dras av. Det g\u00f6r leasing ofta f\u00f6rdelaktigt f\u00f6r f\u00f6retag.",
      maanedlig: "M\u00e5nadsvis",
      iaalt: "Totalt",
      efterPerioden: "Efter perioden",
      nettoOmkostning: "Netto kostnad",
      nettoForklaering: "Netto kostnad \u00e4r allt du betalar minus bilens v\u00e4rde n\u00e4r perioden \u00e4r slut. Det \u00e4r det enda talet de tre g\u00e5r att j\u00e4mf\u00f6ra p\u00e5.",
    },
    no: {
      bilpris: "Bilpris",
      restvaerdi: "Restverdi (ved leasingperiodens utl\u00f8p)",
      loebetid: "L\u00f8petid",
      months: "mnd",
      renteAOP: "Rente (eff.)",
      udbetaling: "Egenkapital",
      vaelgVisning: "Velg visning",
      leasingberegning: "Leasingberegning",
      sammenlign: "Sammenlign",
      maanedligLeasingydelse: "M\u00e5nedlig leasingkostnad",
      samletLeasingudgift: "Total leasingkostnad",
      herafRenter: "Herav renter",
      bilprisLabel: "Bilpris",
      restvaerdiLabel: "Restverdi",
      vaerdtab: "Verditap (du betaler for)",
      leasingVsLaan: "Leasing vs. L\u00e5n vs. Kontant",
      leasing: "Leasing",
      billaan: "Bill\u00e5n",
      kontantkoeb: "Kontantkj\u00f8p",
      vaerdtabNote: "*Verditap fordelt over perioden. Ingen renter.",
      disclaimer: "* Veiledende beregning. Faktisk leasingkostnad kan variere med gebyrer og vilk\u00e5r.",
      emptyState: "Oppgi bilpris og vilk\u00e5r for \u00e5 se beregningen",
      privatLeasing: "Privat leasing",
      privatLeasingDesc: "Ved privat leasing leier du bilen i en fast periode. Du betaler for bilens verditap pluss renter, men eier ikke bilen. Ved periodens utl\u00f8p leverer du tilbake bilen.",
      erhvervsleasing: "N\u00e6ringsleasing",
      erhvervsleasingDesc: "Ved n\u00e6ringsleasing kan leasingkostnaden trekkes fra som driftskostnad. Momsen p\u00e5 ytelsen kan ogs\u00e5 trekkes fra. Det gj\u00f8r leasing ofte fordelaktig for bedrifter.",
      maanedlig: "M\u00e5nedlig",
      iaalt: "Totalt",
      efterPerioden: "Etter perioden",
      nettoOmkostning: "Netto kostnad",
      nettoForklaering: "Netto kostnad er alt du betaler minus bilens verdi n\u00e5r perioden er slutt. Det er det eneste tallet de tre kan sammenlignes p\u00e5.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [bilpris, setBilpris] = useState<string>(String(LEASING_EKSEMPEL.bilpris));
  const [restvaerdi, setRestvaerdi] = useState<string>(String(LEASING_EKSEMPEL.restvaerdi));
  const [loebetid, setLoebetid] = useState<string>(String(LEASING_EKSEMPEL.loebetid));
  const [rente, setRente] = useState<string>(String(LEASING_EKSEMPEL.rentesats));
  const [udbetaling, setUdbetaling] = useState<string>(String(LEASING_EKSEMPEL.udbetaling));
  const [visning, setVisning] = useState<VisningsType>('leasing');

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'leasing') {
      const inputs = urlState.inputs;
      if (inputs.bilpris !== undefined) setBilpris(inputs.bilpris);
      if (inputs.restvaerdi !== undefined) setRestvaerdi(inputs.restvaerdi);
      if (inputs.loebetid !== undefined) setLoebetid(inputs.loebetid);
      if (inputs.rente !== undefined) setRente(inputs.rente);
      if (inputs.udbetaling !== undefined) setUdbetaling(inputs.udbetaling);
      if (inputs.visning) setVisning(inputs.visning);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('leasing');
    const timer = setTimeout(() => {
      trackCalculation('leasing');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'leasing',
      inputs: { bilpris, restvaerdi, loebetid, rente, udbetaling, visning },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [bilpris, restvaerdi, loebetid, rente, udbetaling, visning]);

  const handleReset = useCallback(() => {
    setBilpris(String(LEASING_EKSEMPEL.bilpris));
    setRestvaerdi(String(LEASING_EKSEMPEL.restvaerdi));
    setLoebetid(String(LEASING_EKSEMPEL.loebetid));
    setRente(String(LEASING_EKSEMPEL.rentesats));
    setUdbetaling(String(LEASING_EKSEMPEL.udbetaling));
    setVisning('leasing');
  }, []);

  const result = useMemo(
    () =>
      beregnLeasingSammenlign({
        bilpris: parseFloat(bilpris) || 0,
        restvaerdi: parseFloat(restvaerdi) || 0,
        loebetid: parseInt(loebetid) || 0,
        rentesats: parseFloat(rente) || 0,
        udbetaling: parseFloat(udbetaling) || 0,
      }),
    [bilpris, restvaerdi, loebetid, rente, udbetaling],
  );

  const formatKr = (amount: number) => formatCurrency(amount, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  const bilprisNum = parseFloat(bilpris) || 0;
  const restvaerdiNum = parseFloat(restvaerdi) || 0;
  const loebetidNum = parseInt(loebetid) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div>
            <label htmlFor="leasing-bilpris" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.bilpris}</label>
            <div className="relative">
              <input id="leasing-bilpris" type="number" value={bilpris} onChange={(e) => setBilpris(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>

          <div>
            <label htmlFor="leasing-restvaerdi" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.restvaerdi}</label>
            <div className="relative">
              <input id="leasing-restvaerdi" type="number" value={restvaerdi} onChange={(e) => setRestvaerdi(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="leasing-loebetid" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.loebetid}</label>
              <div className="relative">
                <input id="leasing-loebetid" type="number" value={loebetid} onChange={(e) => setLoebetid(e.target.value)} className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm">{l.months}</span>
              </div>
            </div>
            <div>
              <label htmlFor="leasing-rente" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.renteAOP}</label>
              <div className="relative">
                <input id="leasing-rente" type="number" step="0.1" value={rente} onChange={(e) => setRente(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">%</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="leasing-udbetaling" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{l.udbetaling}</label>
            <div className="relative">
              <input id="leasing-udbetaling" type="number" value={udbetaling} onChange={(e) => setUdbetaling(e.target.value)} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{getCurrencySuffix(locale)}</span>
            </div>
          </div>

          <div>
            <div role="group" aria-label={l.vaelgVisning} className="flex gap-4">
              <button type="button" onClick={() => setVisning('leasing')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${visning === 'leasing' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:text-gray-200'}`}>
                {l.leasingberegning}
              </button>
              <button type="button" onClick={() => setVisning('sammenlign')} className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${visning === 'sammenlign' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:text-gray-200'}`}>
                {l.sammenlign}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        {/* Results */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
          {result ? (
            <div className="space-y-4 animate-fade-in">
              {visning === 'leasing' ? (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{l.leasingberegning}</h2>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{l.maanedligLeasingydelse}</div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatKr(result.maanedligYdelse)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{l.samletLeasingudgift}</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{formatKr(result.totalLeasing)}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{l.herafRenter}</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{formatKr(result.totalRente)}</div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-sm">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.bilprisLabel}</span><span className="dark:text-gray-200">{formatKr(bilprisNum)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.restvaerdiLabel}</span><span className="dark:text-gray-200">{formatKr(restvaerdiNum)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">{l.vaerdtab}</span><span className="font-medium dark:text-gray-200">{formatKr(result.vaerdtab)}</span></div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{l.leasingVsLaan}</h2>
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{l.leasing}</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatKr(result.leasing.maanedlig)}/{l.months}</div>
                      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.iaalt}</dt><dd className="dark:text-gray-200">{formatKr(result.leasing.total)}</dd></div>
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.efterPerioden}</dt><dd className="dark:text-gray-200">{formatKr(result.leasing.ejerVedUdlob)}</dd></div>
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.nettoOmkostning}</dt><dd className="font-semibold dark:text-gray-200">{formatKr(result.leasing.nettoOmkostning)}</dd></div>
                      </dl>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">{l.billaan}</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatKr(result.billaan.maanedlig)}/{l.months}</div>
                      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.iaalt}</dt><dd className="dark:text-gray-200">{formatKr(result.billaan.total)}</dd></div>
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.efterPerioden}</dt><dd className="dark:text-gray-200">{formatKr(result.billaan.ejerVedUdlob)}</dd></div>
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.nettoOmkostning}</dt><dd className="font-semibold dark:text-gray-200">{formatKr(result.billaan.nettoOmkostning)}</dd></div>
                      </dl>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">{l.kontantkoeb}</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{formatKr(result.kontant.maanedlig)}/{l.months}*</div>
                      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.iaalt}</dt><dd className="dark:text-gray-200">{formatKr(result.kontant.total)}</dd></div>
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.efterPerioden}</dt><dd className="dark:text-gray-200">{formatKr(result.kontant.ejerVedUdlob)}</dd></div>
                        <div><dt className="text-gray-500 dark:text-gray-400">{l.nettoOmkostning}</dt><dd className="font-semibold dark:text-gray-200">{formatKr(result.kontant.nettoOmkostning)}</dd></div>
                      </dl>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{l.vaerdtabNote}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{l.nettoForklaering}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                    {leasingSammenlignSætning(result, loebetidNum, locale)}
                  </p>
                </>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                {l.disclaimer}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <div className="mb-3 flex justify-center">
                <Car className="h-10 w-10 text-gray-300 dark:text-gray-600" strokeWidth={1.75} aria-hidden="true" focusable="false" />
              </div>
              <p>{l.emptyState}</p>
            </div>
          )}
        </div>
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={result ? `Leasing: ${formatKr(result.leasing.maanedlig)}/{l.months} — Lån: ${formatKr(result.billaan.maanedlig)}/{l.months}` : ''} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Leasing Beregner"
          resultSummary={result ? `Leasing: ${formatKr(result.leasing.maanedlig)}/{l.months}` : ''}
        />
      </div>

      {/* Info boxes */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{l.privatLeasing}</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            {l.privatLeasingDesc}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">{l.erhvervsleasing}</h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            {l.erhvervsleasingDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
