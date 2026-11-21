'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info, TriangleAlert, Wallet } from 'lucide-react';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { ShareCalculation } from '@/components/ShareCalculation';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { formatBelob } from '@/lib/format';
import {
  BOLIGSIKRING_2026,
  beregnBoligsikring,
} from '@/lib/boligsikring';

const DA = "da" as const;
const kr = (vaerdi: number) => `${formatBelob(vaerdi, DA)} kr.`;
const pct = (vaerdi: number) => `${formatBelob(vaerdi * 100, DA)} %`;

const STANDARDER = {
  huslejeMaanedlig: 7500,
  antalVoksne: 1,
  antalBoernUnder18: 1,
  husstandsindkomst: 250000,
  formue: 0,
  arealKvm: 85,
  undtagetFraLoftUdenBoern: false,
};

export default function BoligsikringBeregner() {
  const [husleje, setHusleje] = useState<string>(String(STANDARDER.huslejeMaanedlig));
  const [voksne, setVoksne] = useState<string>(String(STANDARDER.antalVoksne));
  const [boern, setBoern] = useState<string>(String(STANDARDER.antalBoernUnder18));
  const [indkomst, setIndkomst] = useState<string>(String(STANDARDER.husstandsindkomst));
  const [formue, setFormue] = useState<string>('0');
  const [areal, setAreal] = useState<string>(String(STANDARDER.arealKvm));
  const [undtaget, setUndtaget] = useState<boolean>(STANDARDER.undtagetFraLoftUdenBoern);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'boligsikring') {
      const inputs = urlState.inputs;
      if (inputs.husleje !== undefined) setHusleje(String(inputs.husleje));
      if (inputs.voksne !== undefined) setVoksne(String(inputs.voksne));
      if (inputs.boern !== undefined) setBoern(String(inputs.boern));
      if (inputs.indkomst !== undefined) setIndkomst(String(inputs.indkomst));
      if (inputs.formue !== undefined) setFormue(String(inputs.formue));
      if (inputs.areal !== undefined) setAreal(String(inputs.areal));
      if (inputs.undtaget !== undefined) setUndtaget(Boolean(inputs.undtaget));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('boligsikring');
    const timer = setTimeout(() => {
      trackCalculation('boligsikring');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'boligsikring',
      inputs: {
        husleje, voksne, boern, indkomst, formue, areal, undtaget,
      },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [husleje, voksne, boern, indkomst, formue, areal, undtaget]);

  const resultat = useMemo(() => {
    const huslejeTal = Number.parseFloat(husleje);
    const voksneTal = Number.parseInt(voksne, 10);
    const boernTal = Number.parseInt(boern, 10);
    const indkomstTal = Number.parseFloat(indkomst);
    const formueTal = Number.parseFloat(formue);
    const arealTal = Number.parseFloat(areal);

    if (!Number.isFinite(huslejeTal) || huslejeTal < 0) return null;
    if (!Number.isFinite(voksneTal) || voksneTal < 1) return null;
    if (!Number.isFinite(indkomstTal) || indkomstTal < 0) return null;
    if (!Number.isFinite(formueTal) || formueTal < 0) return null;
    if (!Number.isFinite(arealTal) || arealTal < 0) return null;

    return beregnBoligsikring({
      huslejeMaanedlig: huslejeTal,
      antalVoksne: voksneTal,
      antalBoernUnder18: Number.isFinite(boernTal) ? boernTal : 0,
      husstandsindkomst: indkomstTal,
      formue: formueTal,
      arealKvm: arealTal,
      undtagetFraLoftUdenBoern: undtaget,
    });
  }, [husleje, voksne, boern, indkomst, formue, areal, undtaget]);

  const nulstil = useCallback(() => {
    setHusleje(String(STANDARDER.huslejeMaanedlig));
    setVoksne(String(STANDARDER.antalVoksne));
    setBoern(String(STANDARDER.antalBoernUnder18));
    setIndkomst(String(STANDARDER.husstandsindkomst));
    setFormue('0');
    setAreal(String(STANDARDER.arealKvm));
    setUndtaget(STANDARDER.undtagetFraLoftUdenBoern);
  }, []);

  const feltKlasse =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900';
  const labelKlasse = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Beregn din boligsikring</h2>
      <p className="text-sm text-gray-600 mb-6">
        Udfyld husstanden, og beregneren regner 60 pct. af huslejen minus 18 pct. af
        indkomsten over indkomstgrænsen.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="husleje" className={labelKlasse}>Husleje pr. måned</label>
          <input id="husleje" type="number" min={0} value={husleje}
            onChange={(e) => setHusleje(e.target.value)} className={feltKlasse} />
          <p className="text-xs text-gray-500 mt-1">
            Kun huslejen tæller — varme og antennebidrag gør ikke.
          </p>
        </div>
        <div>
          <label htmlFor="husstandsindkomst" className={labelKlasse}>Husstandens indkomst pr. år</label>
          <input id="husstandsindkomst" type="number" min={0} value={indkomst}
            onChange={(e) => setIndkomst(e.target.value)} className={feltKlasse} />
          <p className="text-xs text-gray-500 mt-1">
            Alle voksne i husstanden. Børns indkomst tæller ikke med.
          </p>
        </div>
        <div>
          <label htmlFor="voksne" className={labelKlasse}>Voksne i husstanden</label>
          <input id="voksne" type="number" min={1} max={12} value={voksne}
            onChange={(e) => setVoksne(e.target.value)} className={feltKlasse} />
        </div>
        <div>
          <label htmlFor="boern" className={labelKlasse}>Børn under 18 år</label>
          <input id="boern" type="number" min={0} max={9} value={boern}
            onChange={(e) => setBoern(e.target.value)} className={feltKlasse} />
          <p className="text-xs text-gray-500 mt-1">
            Fra det 2. til det 4. barn stiger indkomstgrænsen med {kr(BOLIGSIKRING_2026.indkomstGraensePrBarn)}.
          </p>
        </div>
        <div>
          <label htmlFor="areal" className={labelKlasse}>Boligens areal (m²)</label>
          <input id="areal" type="number" min={0} value={areal}
            onChange={(e) => setAreal(e.target.value)} className={feltKlasse} />
          <p className="text-xs text-gray-500 mt-1">
            65 m² til den første beboer og 20 m² til hver af de øvrige medtælles.
          </p>
        </div>
        <div>
          <label htmlFor="formue" className={labelKlasse}>Husstandens formue</label>
          <input id="formue" type="number" min={0} value={formue}
            onChange={(e) => setFormue(e.target.value)} className={feltKlasse} />
          <p className="text-xs text-gray-500 mt-1">
            Over {kr(BOLIGSIKRING_2026.formueGraenseLav)} tæller en del af formuen som indkomst.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-700 mt-4">
        <input id="undtaget" type="checkbox" checked={undtaget}
          onChange={(e) => setUndtaget(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <label htmlFor="undtaget">
          Husstanden er undtaget fra 15 pct.-loftet: et medlem har førtidspension eller
          seniorpension, et medlem er stærkt bevægelseshæmmet og bor i en egnet bolig, eller
          et medlem modtager døgnhjælp.
        </label>
      </div>

      <div className="flex gap-3 mt-6">
        <ResetButton onReset={nulstil} />
        {resultat && <CopyResultButton text={resultatTekst(resultat.aarlig, resultat.maanedlig)} />}
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="boligsikring"
          resultSummary={`${kr(resultat?.aarlig ?? 0)} pr. år`}
        />
      </div>

      {resultat && (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-gray-600 mb-1">Din boligsikring</p>
            <p className="text-3xl font-bold text-gray-900">
              {kr(resultat.aarlig)}
              <span className="text-lg font-normal text-gray-600"> pr. år</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              svarende til {kr(resultat.maanedlig)} pr. måned. Du betaler selv{" "}
              {kr(resultat.egenbetaling)} af boligudgiften.
            </p>
          </div>

          <table className="w-full border-collapse text-sm">
            <caption className="text-left text-sm font-semibold text-gray-900 pb-2">
              Sådan er tallet regnet ud
            </caption>
            <tbody>
              <tr>
                <td className="border p-3">Husleje, der indgår i beregningen</td>
                <td className="border p-3 text-right">{kr(resultat.boligudgift)}</td>
              </tr>
              <tr>
                <td className="border p-3">{pct(BOLIGSIKRING_2026.huslejeandelPct)} af huslejen</td>
                <td className="border p-3 text-right">{kr(resultat.huslejeandel)}</td>
              </tr>
              <tr>
                <td className="border p-3">
                  minus {pct(BOLIGSIKRING_2026.indkomstandelPct)} af indkomsten over{" "}
                  {kr(resultat.indkomstGraense)}
                </td>
                <td className="border p-3 text-right">−{kr(resultat.indkomstandel)}</td>
              </tr>
              <tr className="font-semibold">
                <td className="border p-3">Boligsikring</td>
                <td className="border p-3 text-right">{kr(resultat.aarlig)}</td>
              </tr>
            </tbody>
          </table>

          {resultat.formueTillaeg > 0 && (
            <p className="text-sm text-gray-600">
              Formuen på {kr(Number.parseFloat(formue) || 0)} regnes med som et
              formuetillæg på {kr(resultat.formueTillaeg)}, så husstandsindkomsten i
              beregningen er {kr(resultat.indkomstMedFormue)}.
            </p>
          )}

          {resultat.arealFaktor < 1 && (
            <p className="text-sm text-gray-600">
              Boligen er {formatBelob(Number.parseFloat(areal) || 0, DA)} m², mens der kun
              regnes med {formatBelob(resultat.tilladtAreal, DA)} m² for husstanden. Derfor
              indgår {kr(resultat.boligudgift)} af huslejen.
            </p>
          )}

          {resultat.huslejeErBegraenset && (
            <p className="text-sm text-gray-600">
              Huslejen er over det maksimum, der kan gives boligsikring til, så beregningen
              bruger {kr(resultat.boligudgift)} af huslejen.
            </p>
          )}

          {resultat.aarlig === 0 ? (
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
              <span>
                Husstanden får ikke boligsikring med disse tal. Boligsikringen bliver først
                positiv, når indkomsten falder eller huslejen stiger.
              </span>
            </p>
          ) : resultat.begraensetAf === "loft-uden-boern" ? (
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
              <span>
                Der er ikke børn under 18 år i husstanden, så boligsikringen er holdt under
                15 pct. af huslejen. Sæt krydset i ovenfor, hvis husstanden er undtaget.
              </span>
            </p>
          ) : resultat.begraensetAf === "maksimum" ? (
            <p className="text-sm text-gray-700 flex items-start gap-2">
              <Wallet className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
              <span>
                Beløbet er nået op på det maksimale årlige beløb i 2026:{" "}
                {kr(BOLIGSIKRING_2026.maksBoligsikring)}
                {Number.parseInt(boern, 10) >= 4 ? ", forhøjet med 25 pct. ved fire eller flere børn" : ""}.
              </span>
            </p>
          ) : (
            resultat.aarlig > 0 && (
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
                <span>
                  Tallet er vejledende. Udbetaling Danmark fastsætter det endelige beløb ud
                  fra din boligudgift, din husstandsindkomst og din formue.
                </span>
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

function resultatTekst(aarlig: number, maanedlig: number) {
  return `Boligsikring: ${formatBelob(aarlig, DA)} kr. pr. år, svarende til ${formatBelob(maanedlig, DA)} kr. pr. måned.`;
}
