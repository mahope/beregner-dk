'use client';

import { ShareCalculation } from '@/components/ShareCalculation';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { initScrollDepthTracking, trackCalculation } from '@/lib/analytics';
import { CalculationState, generateShareableLink, getStateFromUrl } from '@/lib/calculation-state';
import {
  beregnRenteprognose,
  procentScenarier,
  RENTEOMLAEGNINGER,
  RENTEUDVIKLINGER,
  type Afdragsform,
  type Renteomlaegning,
} from '@/lib/renteprognose';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const FORUDSETNINGER = {
  laanebeloeb: 2_000_000,
  rente: 3.5,
  loebetidAar: 30,
  renteomlaegning: 'aar5' as Renteomlaegning,
  renteudvikling: 0,
  afdragsform: 'afdrag' as Afdragsform,
  aar: 10,
};

const kr = (v: number) => `${Math.round(v).toLocaleString('da-DK')} kr.`;
const pct = (v: number) => `${(v * 100).toFixed(2).replace('.', ',')} %`;

export default function RenteprognoseBeregner() {
  const [laanebeloeb, setLaanebeloeb] = useState(String(FORUDSETNINGER.laanebeloeb));
  const [rente, setRente] = useState(String(FORUDSETNINGER.rente));
  const [loebetidAar, setLoebetidAar] = useState(String(FORUDSETNINGER.loebetidAar));
  const [omlaegning, setOmlaegning] = useState<Renteomlaegning>(FORUDSETNINGER.renteomlaegning);
  const [udvikling, setUdvikling] = useState(String(FORUDSETNINGER.renteudvikling));
  const [afdragsform, setAfdragsform] = useState<Afdragsform>(FORUDSETNINGER.afdragsform);
  const [valgtAar, setValgtAar] = useState(FORUDSETNINGER.aar);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'renteprognose') {
      const i = urlState.inputs;
      if (i.laanebeloeb) setLaanebeloeb(String(i.laanebeloeb));
      if (i.rente) setRente(String(i.rente));
      if (i.loebetidAar) setLoebetidAar(String(i.loebetidAar));
      if (i.renteomlaegning) setOmlaegning(i.renteomlaegning);
      if (i.renteudvikling !== undefined) setUdvikling(String(i.renteudvikling));
      if (i.afdragsform) setAfdragsform(i.afdragsform);
      if (i.valgtAar) setValgtAar(i.valgtAar);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('renteprognose');
    const timer = setTimeout(() => {
      trackCalculation('renteprognose');
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'renteprognose',
      inputs: {
        laanebeloeb: parseFloat(laanebeloeb) || 0,
        rente: parseFloat(rente) || 0,
        loebetidAar: parseInt(loebetidAar, 10) || 0,
        renteomlaegning: omlaegning,
        renteudvikling: parseFloat(udvikling) || 0,
        afdragsform,
        valgtAar,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [laanebeloeb, rente, loebetidAar, omlaegning, udvikling, afdragsform, valgtAar]);

  const handleReset = useCallback(() => {
    setLaanebeloeb(String(FORUDSETNINGER.laanebeloeb));
    setRente(String(FORUDSETNINGER.rente));
    setLoebetidAar(String(FORUDSETNINGER.loebetidAar));
    setOmlaegning(FORUDSETNINGER.renteomlaegning);
    setUdvikling(String(FORUDSETNINGER.renteudvikling));
    setAfdragsform(FORUDSETNINGER.afdragsform);
    setValgtAar(FORUDSETNINGER.aar);
  }, []);

  const result = useMemo(() => {
    const input = {
      laanebeloeb: parseFloat(laanebeloeb) || 0,
      rente: (parseFloat(rente) || 0) / 100,
      loebetidAar: parseInt(loebetidAar, 10) || 0,
      renteomlaegning: omlaegning,
      renteudvikling: parseFloat(udvikling) || 0,
      afdragsform,
    };
    return { input, res: beregnRenteprognose(input) };
  }, [laanebeloeb, rente, loebetidAar, omlaegning, udvikling, afdragsform]);

  const scenarier = useMemo(() => procentScenarier(result.input), [result.input]);

  const aaret = result.res.aar.find((a) => a.aar === valgtAar) ?? result.res.aar[0];
  const laanebeloebNumer = parseFloat(laanebeloeb) || 0;
  const ingenRenter = result.res.renterIAlt <= 0;

  const felt = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';
  const label = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rp-beloeb" className={label}>Lånebeløb (kr.)</label>
          <input id="rp-beloeb" type="number" inputMode="numeric" min={0} step={1000}
            className={felt} value={laanebeloeb}
            onChange={(e) => setLaanebeloeb(e.target.value)} />
        </div>
        <div>
          <label htmlFor="rp-rente" className={label}>Nuværende rente (% p.a.)</label>
          <input id="rp-rente" type="number" inputMode="decimal" min={0} step={0.1}
            className={felt} value={rente}
            onChange={(e) => setRente(e.target.value)} />
        </div>
        <div>
          <label htmlFor="rp-loebetid" className={label}>Løbetid (år)</label>
          <input id="rp-loebetid" type="number" inputMode="numeric" min={1} max={50} step={1}
            className={felt} value={loebetidAar}
            onChange={(e) => setLoebetidAar(e.target.value)} />
        </div>
        <div>
          <label htmlFor="rp-omlaegning" className={label}>Renteomlægning</label>
          <select id="rp-omlaegning" className={felt} value={omlaegning}
            onChange={(e) => setOmlaegning(e.target.value as Renteomlaegning)}>
            {RENTEOMLAEGNINGER.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rp-udvikling" className={label}>Renteudvikling om året</label>
          <select id="rp-udvikling" className={felt} value={udvikling}
            onChange={(e) => setUdvikling(e.target.value)}>
            {RENTEUDVIKLINGER.map((u) => (
              <option key={u.værdi} value={u.værdi}>{u.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rp-afdrag" className={label}>Afdragsform</label>
          <select id="rp-afdrag" className={felt} value={afdragsform}
            onChange={(e) => setAfdragsform(e.target.value as Afdragsform)}>
            <option value="afdrag">Med afdrag (annuitet)</option>
            <option value="afdragsfrit">Afdragsfrit gæld</option>
          </select>
        </div>
      </div>

      {ingenRenter ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-gray-800">
          Indtast et lånebeløb større end 0 kr. for at se prognosen.
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              År {aaret?.aar ?? 0} — {pct(aaret?.rente ?? 0)}
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-600">Månedlig ydelse</dt>
                <dd className="text-2xl font-bold text-gray-900">{kr(aaret?.maanedYdelse ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Renter til og med år {aaret?.aar ?? 0}</dt>
                <dd className="text-2xl font-bold text-gray-900">{kr(aaret?.renterAngaaende ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Renter i hele løbetiden</dt>
                <dd className="text-xl font-semibold text-gray-900">{kr(result.res.renterIAlt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-600">Restgæld til sidst</dt>
                <dd className="text-xl font-semibold text-gray-900">{kr(result.res.gaeldSlut)}</dd>
              </div>
            </dl>
            <p className="text-sm text-gray-600 mt-4">
              Til sammenligning: du betaler {kr(laanebeloebNumer)} tilbage i renter og afdrag over
              {' '}{loebetidAar} år.
            </p>
          </div>

          <div>
            <label htmlFor="rp-aar" className={label}>Se prognosen for år</label>
            <select id="rp-aar" className={`${felt} sm:max-w-xs`} value={valgtAar}
              onChange={(e) => setValgtAar(parseInt(e.target.value, 10))}>
              {result.res.aar.map((a) => (
                <option key={a.aar} value={a.aar}>År {a.aar} — rente {pct(a.rente)}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hvad koster det, hvis rentesvingningen er en anden?
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Her er det samme lån, men rentesættet ligger{' '}
              {RENTEUDVIKLINGER.find((u) => u.værdi === result.input.renteudvikling)?.label.toLowerCase() ??
                'uændret'}. De to yderste linjer er det samme lån med ét procentpoint
              hhv. lavere og højere renteudvikling — det er den forskel, du bør
              holde tilbage, når du læser en renteprognose.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th scope="col" className="border p-3 text-left">Rentesætning</th>
                    <th scope="col" className="border p-3 text-right">Renter i alt</th>
                    <th scope="col" className="border p-3 text-right">Sidste ydelse</th>
                    <th scope="col" className="border p-3 text-right">Restgæld</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarier.map((s) => (
                    <tr key={s.id} className={s.renteudvikling === result.input.renteudvikling ? 'bg-blue-50' : ''}>
                      <th scope="row" className="border p-3 text-left font-medium text-gray-900">
                        {s.renteudvikling === 0
                          ? 'Uændret rente'
                          : `${s.renteudvikling > 0 ? '+' : ''}${(s.renteudvikling * 100).toFixed(0)} procentpoint pr. år`}
                      </th>
                      <td className="border p-3 text-right text-gray-900">{kr(s.renterIAlt)}</td>
                      <td className="border p-3 text-right text-gray-900">{kr(s.maanedSlut)}</td>
                      <td className="border p-3 text-right text-gray-900">{kr(s.gaeldSlut)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Renteprognose"
          resultSummary={ingenRenter
            ? `Ingen beregning endnu`
            : `Renter i alt: ${kr(result.res.renterIAlt)} over ${loebetidAar} år til ${rente} %`}
        />
        <CopyResultButton text={ingenRenter ? '' : `Renteprognose: ${kr(result.res.renterIAlt)} i renter over ${loebetidAar} år til ${rente} %`} />
        <ResetButton onReset={handleReset} />
      </div>
    </div>
  );
}