"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

type Retning = "syd" | "sydvest" | "sydoest" | "vest" | "oest";

const RETNINGSFAKTORER: Record<Retning, { faktor: number; labelDa: string; labelSe: string; labelNo: string }> = {
  syd: { faktor: 1.0, labelDa: "Syd (optimalt)", labelSe: "Söder (optimalt)", labelNo: "Sør (optimalt)" },
  sydvest: { faktor: 0.95, labelDa: "Sydvest", labelSe: "Sydväst", labelNo: "Sørvest" },
  sydoest: { faktor: 0.95, labelDa: "Sydøst", labelSe: "Sydöst", labelNo: "Sørøst" },
  vest: { faktor: 0.8, labelDa: "Vest", labelSe: "Väst", labelNo: "Vest" },
  oest: { faktor: 0.8, labelDa: "Øst", labelSe: "Öst", labelNo: "Øst" },
};

const KWH_PR_KWP = 950;

export default function SolcelleBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      solcelleAnlaeg: "Solcelleanlæg",
      anlaegStorrelse: "Anlæg størrelse",
      aarligtElforbrug: "Årligt elforbrug",
      tagretning: "Tagretning",
      elprisInkl: "Elpris (inkl. afgifter)",
      prisPrKwp: "Pris pr. kWp",
      samletAnlaegspris: "Samlet anlægspris (valgfrit — beregnes ellers fra kWp-pris)",
      beregnet: "Beregnet",
      dinSolcellebesparelse: "Din solcellebesparelse",
      aarligBesparelse: "Årlig besparelse",
      tilbagebetalingstid: "Tilbagebetalingstid",
      aar: "år",
      aarligProduktion: "Årlig produktion",
      oekonomiOver25: "Økonomi over 25 år",
      anlaegspris: "Anlægspris",
      besparelseEgetforbrug: "Besparelse egetforbrug",
      salgOverskud: "Salg af overskud",
      totalBesparelse25: "Total besparelse (25 år)",
      nettoGevinst25: "Nettogevinst (25 år)",
      co2Reduktion: "CO₂-reduktion pr. år",
      selvforsyningsgrad: "Selvforsyningsgrad",
      disclaimer: "Beregningen er vejledende. Faktisk produktion afhænger af tagvinkel, skyggeforhold og vejr. Nettoafregningspris varierer. Kontakt en installatør for præcist tilbud.",
    },
    se: {
      solcelleAnlaeg: "Solcellsanläggning",
      anlaegStorrelse: "Anläggningsstorlek",
      aarligtElforbrug: "Årlig elförbrukning",
      tagretning: "Takriktning",
      elprisInkl: "Elpris (inkl. avgifter)",
      prisPrKwp: "Pris per kWp",
      samletAnlaegspris: "Total anläggningspris (valfritt — beräknas annars från kWp-pris)",
      beregnet: "Beräknat",
      dinSolcellebesparelse: "Din solcellsbesparing",
      aarligBesparelse: "Årlig besparing",
      tilbagebetalingstid: "Återbetalningstid",
      aar: "år",
      aarligProduktion: "Årlig produktion",
      oekonomiOver25: "Ekonomi över 25 år",
      anlaegspris: "Anläggningspris",
      besparelseEgetforbrug: "Besparing egenförbrukning",
      salgOverskud: "Försäljning av överskott",
      totalBesparelse25: "Total besparing (25 år)",
      nettoGevinst25: "Nettovinst (25 år)",
      co2Reduktion: "CO₂-reduktion per år",
      selvforsyningsgrad: "Självförsörjningsgrad",
      disclaimer: "Beräkningen är vägledande. Faktisk produktion beror på takvinkel, skuggförhållanden och väder. Nettodebitering varierar. Kontakta en installatör för exakt offert.",
    },
    no: {
      solcelleAnlaeg: "Solcelleanlegg",
      anlaegStorrelse: "Anleggsstørrelse",
      aarligtElforbrug: "Årlig strømforbruk",
      tagretning: "Takretning",
      elprisInkl: "Strømpris (inkl. avgifter)",
      prisPrKwp: "Pris per kWp",
      samletAnlaegspris: "Total anleggspris (valgfritt — beregnes ellers fra kWp-pris)",
      beregnet: "Beregnet",
      dinSolcellebesparelse: "Din solcellebesparelse",
      aarligBesparelse: "Årlig besparelse",
      tilbagebetalingstid: "Tilbakebetalingstid",
      aar: "år",
      aarligProduktion: "Årlig produksjon",
      oekonomiOver25: "Økonomi over 25 år",
      anlaegspris: "Anleggspris",
      besparelseEgetforbrug: "Besparelse egetforbruk",
      salgOverskud: "Salg av overskudd",
      totalBesparelse25: "Total besparelse (25 år)",
      nettoGevinst25: "Nettogevinst (25 år)",
      co2Reduktion: "CO₂-reduksjon per år",
      selvforsyningsgrad: "Selvforsyningsgrad",
      disclaimer: "Beregningen er veiledende. Faktisk produksjon avhenger av takvinkel, skyggeforhold og vær. Nettoavregningspris varierer. Kontakt en installatør for nøyaktig tilbud.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const getRetningLabel = (key: Retning) => {
    const val = RETNINGSFAKTORER[key];
    if (locale === "se") return val.labelSe;
    if (locale === "no") return val.labelNo;
    return val.labelDa;
  };

  const [anlaegStr, setAnlaegStr] = useState<string>("6");
  const [retning, setRetning] = useState<Retning>("syd");
  const [aarligtForbrug, setAarligtForbrug] = useState<string>("4000");
  const [elPris, setElPris] = useState<string>("2.5");
  const [anlaegPris, setAnlaegPris] = useState<string>("");
  const [prisPrKwp, setPrisPrKwp] = useState<string>("12000");

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "solceller") {
      const i = urlState.inputs;
      if (i.anlaegStr !== undefined) setAnlaegStr(String(i.anlaegStr));
      if (i.retning !== undefined) setRetning(i.retning as Retning);
      if (i.aarligtForbrug !== undefined) setAarligtForbrug(String(i.aarligtForbrug));
      if (i.elPris !== undefined) setElPris(String(i.elPris));
      if (i.anlaegPris !== undefined) setAnlaegPris(String(i.anlaegPris));
      if (i.prisPrKwp !== undefined) setPrisPrKwp(String(i.prisPrKwp));
    }
  }, []);

  const getShareableLink = useCallback((): ShareableLink => {
    return generateShareableLink({
      type: "solceller", timestamp: Date.now(),
      inputs: { anlaegStr: Number(anlaegStr), retning, aarligtForbrug: Number(aarligtForbrug), elPris: Number(elPris), anlaegPris: Number(anlaegPris), prisPrKwp: Number(prisPrKwp) },
    });
  }, [anlaegStr, retning, aarligtForbrug, elPris, anlaegPris, prisPrKwp]);

  useEffect(() => initScrollDepthTracking("solceller"), []);

  const effektivAnlaegPris = useMemo(() => {
    const manuel = Number(anlaegPris);
    if (manuel > 0) return manuel;
    return Number(anlaegStr) * Number(prisPrKwp);
  }, [anlaegPris, anlaegStr, prisPrKwp]);

  const resultat = useMemo(() => {
    const kwp = Number(anlaegStr);
    const forbrug = Number(aarligtForbrug);
    const pris = Number(elPris);

    if (!kwp || kwp <= 0 || !forbrug || forbrug <= 0 || !pris || pris <= 0 || effektivAnlaegPris <= 0) return null;

    const retningsFaktor = RETNINGSFAKTORER[retning].faktor;
    const aarligProduktion = Math.round(kwp * KWH_PR_KWP * retningsFaktor);

    const egetForbrugPct = 0.30;
    const egetForbrug = Math.round(Math.min(aarligProduktion * egetForbrugPct, forbrug));
    const overskud = aarligProduktion - egetForbrug;

    const nettoPris = 0.80;
    const besparelseEget = egetForbrug * pris;
    const besparelseOverskud = overskud * nettoPris;
    const aarligBesparelse = besparelseEget + besparelseOverskud;

    const tilbagebetalingsAar = effektivAnlaegPris / aarligBesparelse;

    const levetid = 25;
    const totalBesparelse = aarligBesparelse * levetid;
    const nettoGevinst = totalBesparelse - effektivAnlaegPris;

    const co2PrKwh = 0.14;
    const aarligCO2 = Math.round(aarligProduktion * co2PrKwh);

    const selvforsyning = Math.round((egetForbrug / forbrug) * 100);

    if (!hasTracked.current) {
      hasTracked.current = true;
      trackCalculation("solceller");
    }

    return {
      aarligProduktion,
      egetForbrug,
      overskud,
      besparelseEget: Math.round(besparelseEget),
      besparelseOverskud: Math.round(besparelseOverskud),
      aarligBesparelse: Math.round(aarligBesparelse),
      tilbagebetalingsAar: Math.round(tilbagebetalingsAar * 10) / 10,
      totalBesparelse: Math.round(totalBesparelse),
      nettoGevinst: Math.round(nettoGevinst),
      aarligCO2,
      selvforsyning: Math.min(selvforsyning, 100),
      anlaegPrisEffektiv: effektivAnlaegPris,
    };
  }, [anlaegStr, retning, aarligtForbrug, elPris, effektivAnlaegPris]);

  const handleReset = useCallback(() => {
    setAnlaegStr("6");
    setRetning("syd");
    setAarligtForbrug("4000");
    setElPris("2.5");
    setAnlaegPris("");
    setPrisPrKwp("12000");
    hasTracked.current = false;
  }, []);

  const formatKr = (n: number) => formatCurrency(n, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });

  const formatLocaleNumber = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold dark:text-white">{l.solcelleAnlaeg}</h2>
          <ResetButton onReset={handleReset} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="anlaegStr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {l.anlaegStorrelse}
            </label>
            <div className="relative">
              <input id="anlaegStr" type="number" value={anlaegStr} onChange={(e) => setAnlaegStr(e.target.value)}
                step="0.5" min="1" max="30"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWp</span>
            </div>
          </div>
          <div>
            <label htmlFor="aarligtForbrug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {l.aarligtElforbrug}
            </label>
            <div className="relative">
              <input id="aarligtForbrug" type="number" value={aarligtForbrug} onChange={(e) => setAarligtForbrug(e.target.value)}
                min="100"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kWh</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.tagretning}</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(Object.keys(RETNINGSFAKTORER) as Retning[]).map((key) => (
              <button key={key} onClick={() => setRetning(key)}
                className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  retning === key ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}>
                {getRetningLabel(key)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="elPris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {l.elprisInkl}
            </label>
            <div className="relative">
              <input id="elPris" type="number" value={elPris} onChange={(e) => setElPris(e.target.value)}
                step="0.1" min="0.5"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-20 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}/kWh</span>
            </div>
          </div>
          <div>
            <label htmlFor="prisPrKwp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {l.prisPrKwp}
            </label>
            <div className="relative">
              <input id="prisPrKwp" type="number" value={prisPrKwp} onChange={(e) => { setPrisPrKwp(e.target.value); setAnlaegPris(""); }}
                min="5000"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-16 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}/kWp</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="anlaegPris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {l.samletAnlaegspris}
          </label>
          <div className="relative">
            <input id="anlaegPris" type="number" value={anlaegPris} onChange={(e) => setAnlaegPris(e.target.value)}
              placeholder={`${l.beregnet}: ${formatLocaleNumber(effektivAnlaegPris)}`} min="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getCurrencySuffix(locale)}</span>
          </div>
        </div>
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">{l.dinSolcellebesparelse}</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`Solceller ${anlaegStr} kWp: ${formatLocaleNumber(resultat.aarligProduktion)} kWh/år, besparelse ${formatKr(resultat.aarligBesparelse)}/år, tilbagebetalt på ${resultat.tilbagebetalingsAar} år.`} />
                <ShareCalculation getShareableLink={getShareableLink} calculatorName="Solceller" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">{l.aarligBesparelse}</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatKr(resultat.aarligBesparelse)}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">{l.tilbagebetalingstid}</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{resultat.tilbagebetalingsAar} {l.aar}</p>
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300">{l.aarligProduktion}</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatLocaleNumber(resultat.aarligProduktion)} kWh</p>
              </div>
            </div>
          </div>

          {/* Detaljer */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold dark:text-white mb-4">{l.oekonomiOver25}</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{l.anlaegspris}</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.anlaegPrisEffektiv)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{l.besparelseEgetforbrug} ({formatLocaleNumber(resultat.egetForbrug)} kWh/{l.aar})</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.besparelseEget)}/{l.aar}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{l.salgOverskud} ({formatLocaleNumber(resultat.overskud)} kWh/{l.aar})</span>
                <span className="font-medium dark:text-white">{formatKr(resultat.besparelseOverskud)}/{l.aar}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">{l.totalBesparelse25}</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{formatKr(resultat.totalBesparelse)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 dark:text-gray-400">{l.nettoGevinst25}</span>
                <span className={`font-bold text-lg ${resultat.nettoGevinst >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatKr(resultat.nettoGevinst)}
                </span>
              </div>
            </div>
          </div>

          {/* Miljø */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 text-center">
              <p className="text-sm text-green-700 dark:text-green-400">{l.co2Reduktion}</p>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{resultat.aarligCO2} kg</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 text-center">
              <p className="text-sm text-blue-700 dark:text-blue-400">{l.selvforsyningsgrad}</p>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{resultat.selvforsyning}%</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {l.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
