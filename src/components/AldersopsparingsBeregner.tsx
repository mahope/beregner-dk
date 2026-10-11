'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Info, TriangleAlert, Wallet } from 'lucide-react';
import { CopyResultButton, ResetButton } from '@/components/ui';
import { ShareCalculation } from '@/components/ShareCalculation';
import { generateShareableLink, getStateFromUrl, CalculationState } from '@/lib/calculation-state';
import { trackCalculation, initScrollDepthTracking } from '@/lib/analytics';
import { formatBelob } from '@/lib/format';
import { beregnPensionsalder } from '@/lib/pensionsalder';
import {
  ALDERSOPSPARING_2026,
  aarTilFolkepension as aarTilFolkepensionFraDato,
  beregnAldersopsparing,
  sammenlignFriOpsparing,
} from '@/lib/aldersopsparing';
import type { AldersopsparingResultat } from '@/lib/aldersopsparing';

const DA = "da" as const;
const kr = (vaerdi: number) => `${formatBelob(vaerdi, DA)} kr.`;
const pct = (vaerdi: number) => `${formatBelob(vaerdi * 100, DA)} %`;

/** Året beregneren står på. Alt her regnes i indkomstår, ikke på fødselsdage. */
const I_DAG = () => new Date();

/** Antal år indbetalingen kan løbe, hvis den bare kører til folkepensionen. */
const STANDARD_AAR = 30;
/** Forventet årligt afkast før skat. En vejledende normal markedsafkast. */
const STANDARD_AFKAST = 6;
/** Marginalskatten på afkast i fri opsparing — den typiske tillægsprocent. */
const STANDARD_MARGINALSKAT = 42;

export default function AldersopsparingsBeregner() {
  const [foedselAar, setFoedselAar] = useState<string>('1970');
  const [aarligIndbetaling, setAarligIndbetaling] = useState<string>('9900');
  const [antalAar, setAntalAar] = useState<string>(String(STANDARD_AAR));
  const [afkastPct, setAfkastPct] = useState<string>(String(STANDARD_AFKAST));
  const [marginalskatPct, setMarginalskatPct] = useState<string>(String(STANDARD_MARGINALSKAT));
  const [viserSammenligning, setViserSammenligning] = useState<boolean>(true);
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'aldersopsparing') {
      const inputs = urlState.inputs;
      if (inputs.foedselAar !== undefined) setFoedselAar(String(inputs.foedselAar));
      if (inputs.aarligIndbetaling !== undefined) setAarligIndbetaling(String(inputs.aarligIndbetaling));
      if (inputs.antalAar !== undefined) setAntalAar(String(inputs.antalAar));
      if (inputs.afkastPct !== undefined) setAfkastPct(String(inputs.afkastPct));
      if (inputs.marginalskatPct !== undefined) setMarginalskatPct(String(inputs.marginalskatPct));
      if (inputs.viserSammenligning !== undefined) setViserSammenligning(Boolean(inputs.viserSammenligning));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking('aldersopsparing');
    const timer = setTimeout(() => {
      trackCalculation('aldersopsparing');
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'aldersopsparing',
      inputs: { foedselAar, aarligIndbetaling, antalAar, afkastPct, marginalskatPct, viserSammenligning },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [foedselAar, aarligIndbetaling, antalAar, afkastPct, marginalskatPct, viserSammenligning]);

  const resultat = useMemo(() => {
    const aar = Number.parseInt(foedselAar, 10);
    if (!Number.isFinite(aar) || aar < 1900 || aar > 2100) return null;

    // Fødselsdatoen sættes til 15. juni, så årstallet er det eneste der spiller.
    const folkepension = beregnPensionsalder(new Date(aar, 5, 15), I_DAG());
    const aarTil = aarTilFolkepensionFraDato(folkepension.alderFyldesDato, I_DAG());

    const indbetaling = Number.parseInt(aarligIndbetaling, 10);
    const aarLobende = Number.parseInt(antalAar, 10);
    const afkast = Number.parseFloat(afkastPct);
    const marginalskat = Number.parseFloat(marginalskatPct);

    if (!Number.isFinite(indbetaling) || !Number.isFinite(aarLobende)) return null;
    if (!Number.isFinite(afkast) || !Number.isFinite(marginalskat)) return null;

    // Indbetaling kan højst løbe til folkepensionsalderen, og højst 20 år over.
    const maksAar = aarTil + ALDERSOPSPARING_2026.senesteUdbetalingEfterAlderAar;
    const perioder = Math.max(0, Math.min(aarLobende, maksAar));

    const beregnet = beregnAldersopsparing({
      aarTilFolkepension: aarTil,
      aarligIndbetaling: Math.max(0, indbetaling),
      antalAar: perioder,
      afkastPct: Math.max(0, afkast),
    });

    const fri = sammenlignFriOpsparing(
      beregnet.saldo,
      Math.max(0, indbetaling),
      Math.max(0, afkast),
      perioder,
      Math.max(0, marginalskat),
    );

    return { ...beregnet, aarTil, folkepension, fri, perioder, forLangt: aarLobende > maksAar };
  }, [foedselAar, aarligIndbetaling, antalAar, afkastPct, marginalskatPct]);

  const feltKlasse =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900';
  const labelKlasse = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-900">Beregn din aldersopsparing</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelKlasse} htmlFor="foedsel-aar">
              Dit fødselsår
            </label>
            <input
              id="foedsel-aar"
              type="number"
              inputMode="numeric"
              min={1900}
              max={2100}
              step={1}
              value={foedselAar}
              onChange={(e) => setFoedselAar(e.target.value)}
              className={feltKlasse}
            />
            <p className="text-xs text-gray-500 mt-1">
              Beløbsgrænsen følger dit fødselsår, fordi den afhænger af årstallet for din folkepensionsalder.
            </p>
          </div>

          <div>
            <label className={labelKlasse} htmlFor="aarlig-indbetaling">
              Årlig indbetaling
            </label>
            <div className="relative">
              <input
                id="aarlig-indbetaling"
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                value={aarligIndbetaling}
                onChange={(e) => setAarligIndbetaling(e.target.value)}
                className={feltKlasse}
              />
              <span className="absolute right-3 top-2 text-gray-500">kr.</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Hvad du eller din arbejdsgiver tilsammen planlægger at indbetale pr. år.
            </p>
          </div>

          <div>
            <label className={labelKlasse} htmlFor="antal-aar">
              Antal år du indbetaler
            </label>
            <input
              id="antal-aar"
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              step={1}
              value={antalAar}
              onChange={(e) => setAntalAar(e.target.value)}
              className={feltKlasse}
            />
            <p className="text-xs text-gray-500 mt-1">
              {resultat && resultat.forLangt
                ? `Beregneren bruger ${resultat.perioder} år — udbetaling skal være påbegyndt ${ALDERSOPSPARING_2026.senesteUdbetalingEfterAlderAar} år efter din pensionsudbetalingsalder.`
                : 'Ofte antal år til folkepensionsalderen.'}
            </p>
          </div>

          <div>
            <label className={labelKlasse} htmlFor="afkast">
              Forventet afkast pr. år
            </label>
            <div className="relative">
              <input
                id="afkast"
                type="number"
                inputMode="decimal"
                min={0}
                max={30}
                step={0.5}
                value={afkastPct}
                onChange={(e) => setAfkastPct(e.target.value)}
                className={feltKlasse}
              />
              <span className="absolute right-3 top-2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Afkastet beskattes med {pct(ALDERSOPSPARING_2026.palSats)} i PAL-skat, mens det optjenes.
            </p>
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-gray-700" htmlFor="sammenlign-frie-midler">
              <input
                id="sammenlign-frie-midler"
                type="checkbox"
                checked={viserSammenligning}
                onChange={(e) => setViserSammenligning(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Sammenlign med den samme opsparing i frie midler
            </label>
          </div>

          {viserSammenligning && (
            <div className="sm:col-span-2">
              <label className={labelKlasse} htmlFor="marginalskat">
                Din marginalskat på afkast i frie midler
              </label>
              <div className="relative sm:max-w-xs">
                <input
                  id="marginalskat"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={60}
                  step={1}
                  value={marginalskatPct}
                  onChange={(e) => setMarginalskatPct(e.target.value)}
                  className={feltKlasse}
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Find din marginalskat på <a href="/topskat" className="text-blue-600 underline">topskat-beregneren</a>.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Aldersopsparing beregner"
            resultSummary={resultat ? `${formatBelob(resultat.udbetalingSkattefri, DA)} kr. skattefri udbetaling` : undefined}
          />
          <CopyResultButton text={resultat ? resultatTekst(resultat) : ""} />
          <ResetButton
            onReset={() => {
              setFoedselAar('1970');
              setAarligIndbetaling('9900');
              setAntalAar(String(STANDARD_AAR));
              setAfkastPct(String(STANDARD_AFKAST));
              setMarginalskatPct(String(STANDARD_MARGINALSKAT));
              setViserSammenligning(true);
            }}
          />
        </div>
      </div>

      {resultat && (
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Hvad du må indbetale i år
            </h3>
            <dl className="space-y-2 text-gray-900">
              <Rad label="Din beløbsgrænse" vaerdi={`${kr(resultat.beloebsGraense)} pr. år`} fremhaevet />
              <Rad
                label="Din planlagte indbetaling"
                vaerdi={`${kr(resultat.indenforGraense)} inden for grænsen`}
              />
              {resultat.overGraense > 0 && (
                <Rad
                  label={`Afgift af indbetalingen over grænsen`}
                  vaerdi={`${kr(resultat.afgift)} (${pct(resultat.hoejtBeloeb ? ALDERSOPSPARING_2026.afgiftOverHoejtBeloeb : ALDERSOPSPARING_2026.afgiftOverGrundbeloeb)} af ${kr(resultat.overGraense)})`}
                  advarsel
                />
              )}
              <Rad
                label="Året det høje beløb slår til"
                vaerdi={
                  resultat.hoejtBeloeb
                    ? 'Du er allerede inden for de sidste 7 år'
                    : `Om ${resultat.aarTilHoejtBeloeb} år — så bliver det ${kr(ALDERSOPSPARING_2026.hoejtBeloeb)} pr. år`
                }
              />
            </dl>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-4 sm:p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Hvad du får ud efter {resultat.perioder} {resultat.perioder === 1 ? 'år' : 'år'}
            </h3>
            <dl className="space-y-2 text-gray-900">
              <Rad label="Du har selv indbetalt" vaerdi={kr(resultat.samletIndbetaling)} />
              <Rad label="Afkast før PAL-skat" vaerdi={kr(resultat.samletAfkastFoerSkat)} />
              <Rad label={`PAL-skat, ${pct(ALDERSOPSPARING_2026.palSats)} af afkastet`} vaerdi={`- ${kr(resultat.samletPalSkat)}`} />
              <Rad label="Afkast efter skat" vaerdi={kr(resultat.samletAfkastEfterSkat)} />
              <Rad
                label="Hvad Skattestyrelsen udbetaler til dig"
                vaerdi={kr(resultat.udbetalingSkattefri)}
                fremhaevet
              />
            </dl>
            <p className="text-sm text-gray-700 mt-3">
              Udbetalingen er skatte- og afgiftsfri, når den sker efter reglerne i ordningen. Den tæller
              ikke som personlig indkomst og påvirker derfor hverken trækprocent, mellemskat eller topskat.
            </p>
          </div>

          {viserSammenligning && (
            <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Sammenlignet med frie midler
              </h3>
              <dl className="space-y-2 text-gray-900">
                <Rad label={`Din aldersopsparing`} vaerdi={kr(resultat.saldo)} />
                <Rad label={`Samme indbetaling og afkast i frie midler`} vaerdi={kr(resultat.fri.saldoFri)} />
                <Rad
                  label="Forskel"
                  vaerdi={`${resultat.fri.forskel >= 0 ? '+' : '-'} ${kr(Math.abs(resultat.fri.forskel))}`}
                  fremhaevet
                />
              </dl>
              <p className="text-sm text-gray-700 mt-3">
                I frie midler beskattes afkastet med din marginalskat på {formatBelob(Number.parseFloat(marginalskatPct) || 0, DA)} %,
                mens aldersopsparing beskattes med {pct(ALDERSOPSPARING_2026.palSats)}. Jo højere marginalskat du har, jo større
                bliver forskellen.
              </p>
            </div>
          )}

          <p className="flex items-start gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <Info className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Der er <strong>intet fradrag</strong> ved indbetaling til aldersopsparing. Du indbetaler penge, du
              allerede har betalt skat for. Skattefordelen kommer først ved udbetalingen, der er skattefri.
            </span>
          </p>

          {resultat.overGraense > 0 && (
            <p className="flex items-start gap-2 text-sm text-red-900 bg-red-50 border border-red-200 rounded-lg p-3">
              <TriangleAlert className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Skattestyrelsen opkræver afgift af indbetalingen over din beløbsgrænse. Sænk beløbet til{' '}
                {kr(resultat.beloebsGraense)} om året for at undgå afgiften.
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Rad({
  label,
  vaerdi,
  fremhaevet,
  advarsel,
}: {
  label: string;
  vaerdi: string;
  fremhaevet?: boolean;
  advarsel?: boolean;
}) {
  const farve = advarsel ? 'text-red-700' : fremhaevet ? 'text-green-800' : 'text-gray-800';
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
      <dt className="text-sm text-gray-600">{label}</dt>
      <dd className={`text-sm sm:text-base ${fremhaevet ? 'font-bold' : 'font-medium'} ${farve}`}>{vaerdi}</dd>
    </div>
  );
}

/** Teksten Kopier-knappen lægger på udklipsholderen. */
function resultatTekst(resultat: AldersopsparingResultat & { perioder: number }): string {
  const linjer = [
    `Aldersopsparing ${ALDERSOPSPARING_2026.verifiedAt.slice(0, 4)}`,
    `Beløbsgrænse: ${kr(resultat.beloebsGraense)} pr. år`,
    `Perioder: ${resultat.perioder} år`,
    `Indbetalt: ${kr(resultat.samletIndbetaling)}`,
    `Afkast efter ${pct(ALDERSOPSPARING_2026.palSats)} PAL-skat: ${kr(resultat.samletAfkastEfterSkat)}`,
    `Skattefri udbetaling: ${kr(resultat.udbetalingSkattefri)}`,
  ];
  if (resultat.overGraense > 0) {
    linjer.splice(2, 0, `Afgift af indbetaling over grænsen: ${kr(resultat.afgift)}`);
  }
  return linjer.join('\n');
}
