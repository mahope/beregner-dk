"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState, ShareableLink } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";
import {
  formatKlokkeslaet,
  KILDER,
  MOMS_SATS,
  type PriceArea,
  prisomraadeForPostnummer,
  STANDARD_TARIFFER,
} from "@/lib/energi/elpriser";
import { HAELDNINGER, solOekonomi } from "@/lib/energi/solceller";
import type { SpotGennemsnit } from "@/lib/energi/server";
import { OMRAADE_NAVN } from "@/components/energi/PrisomraadeVaelger";

type Retning = "syd" | "sydvest" | "sydoest" | "vest" | "oest";

const RETNINGSFAKTORER: Record<Retning, { faktor: number; labelDa: string; labelSe: string; labelNo: string }> = {
  syd: { faktor: 1.0, labelDa: "Syd (optimalt)", labelSe: "Söder (optimalt)", labelNo: "Sør (optimalt)" },
  sydvest: { faktor: 0.95, labelDa: "Sydvest", labelSe: "Sydväst", labelNo: "Sørvest" },
  sydoest: { faktor: 0.95, labelDa: "Sydøst", labelSe: "Sydöst", labelNo: "Sørøst" },
  vest: { faktor: 0.8, labelDa: "Vest", labelSe: "Väst", labelNo: "Vest" },
  oest: { faktor: 0.8, labelDa: "Øst", labelSe: "Öst", labelNo: "Øst" },
};

const KWH_PR_KWP = 950;
const STANDARD_EGETFORBRUG_PCT = 30;
const STANDARD_SALGSPRIS = 0.8;

type PvgisSvar = {
  postnr: string;
  navn: string;
  prisomraade: PriceArea | null;
  kwhPrKwp: number;
  hentet: string;
  retning: Retning;
  haeldning: number;
};

type Props = {
  /** 12-month average spot price; only used on the Danish locale. */
  spotGennemsnit?: SpotGennemsnit | null;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Default purchase and sale prices for a price area from the 12-month average spot price. */
function standardPriser(spot: SpotGennemsnit | null, area: PriceArea) {
  const s = spot?.omraader[area];
  if (s === undefined) return null;
  const t = STANDARD_TARIFFER;
  return {
    spot: s,
    koeb: round2((s + t.nettarif + t.transmission + t.system + t.elafgift) * (1 + MOMS_SATS)),
    salg: round2(s),
  };
}

export default function SolcelleBeregner({ spotGennemsnit = null }: Props = {}) {
  const { locale } = useLocale();
  const erDa = locale === "da";
  const spot12 = erDa ? spotGennemsnit : null;

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
  const startPriser = standardPriser(spot12, "DK2");
  const [elPris, setElPris] = useState<string>(startPriser ? String(startPriser.koeb) : "2.5");
  const [anlaegPris, setAnlaegPris] = useState<string>("");
  const [prisPrKwp, setPrisPrKwp] = useState<string>("12000");
  const [postnr, setPostnr] = useState<string>("");
  const [haeldning, setHaeldning] = useState<number>(35);
  const [egetforbrugPct, setEgetforbrugPct] = useState<string>(String(STANDARD_EGETFORBRUG_PCT));
  const [salgspris, setSalgspris] = useState<string>(String(startPriser ? startPriser.salg : STANDARD_SALGSPRIS));
  const [prisRettet, setPrisRettet] = useState(false);
  const [pvgis, setPvgis] = useState<PvgisSvar | null>(null);
  const [pvgisStatus, setPvgisStatus] = useState<"idle" | "henter" | "fejl" | "ukendt">("idle");

  const omraade: PriceArea = prisomraadeForPostnummer(postnr) ?? "DK2";
  const aktuellePriser = standardPriser(spot12, omraade);

  // Follow the postcode's price area until the user edits a price.
  useEffect(() => {
    if (prisRettet || !aktuellePriser) return;
    setElPris(String(aktuellePriser.koeb));
    setSalgspris(String(aktuellePriser.salg));
  }, [omraade]);

  // Look up PVGIS production for the postcode (Danish locale only).
  useEffect(() => {
    if (!erDa || !/^\d{4}$/.test(postnr)) {
      setPvgisStatus("idle");
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setPvgisStatus("henter");
      try {
        const q = new URLSearchParams({ postnr, retning, haeldning: String(haeldning) });
        const res = await fetch(`/api/energi/solproduktion?${q}`, { signal: ctrl.signal });
        if (res.status === 404) {
          setPvgisStatus("ukendt");
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setPvgis({ ...data, retning, haeldning });
        setPvgisStatus("idle");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setPvgisStatus("fejl");
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [erDa, postnr, retning, haeldning]);

  const pvgisAktiv =
    erDa && pvgis && pvgis.postnr === postnr && pvgis.retning === retning && pvgis.haeldning === haeldning ? pvgis : null;

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "solceller") {
      const i = urlState.inputs;
      if (i.postnr !== undefined) setPostnr(String(i.postnr));
      if (i.haeldning !== undefined && (HAELDNINGER as readonly number[]).includes(Number(i.haeldning))) setHaeldning(Number(i.haeldning));
      if (i.egetforbrugPct !== undefined) setEgetforbrugPct(String(i.egetforbrugPct));
      if (i.salgspris !== undefined) setSalgspris(String(i.salgspris));
      if (i.elPris !== undefined || i.salgspris !== undefined) setPrisRettet(true);
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
      inputs: {
        anlaegStr: Number(anlaegStr), retning, aarligtForbrug: Number(aarligtForbrug), elPris: Number(elPris), anlaegPris: Number(anlaegPris), prisPrKwp: Number(prisPrKwp),
        ...(erDa ? { postnr, haeldning, egetforbrugPct: Number(egetforbrugPct), salgspris: Number(salgspris) } : {}),
      },
    });
  }, [anlaegStr, retning, aarligtForbrug, elPris, anlaegPris, prisPrKwp, erDa, postnr, haeldning, egetforbrugPct, salgspris]);

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
    const aarligProduktion = Math.round(pvgisAktiv ? kwp * pvgisAktiv.kwhPrKwp : kwp * KWH_PR_KWP * retningsFaktor);

    const andel = erDa ? Math.min(100, Math.max(0, Number(egetforbrugPct) || 0)) / 100 : STANDARD_EGETFORBRUG_PCT / 100;
    const salg = erDa ? Math.max(0, Number(salgspris) || 0) : STANDARD_SALGSPRIS;
    const egetForbrug = Math.round(
      solOekonomi({ produktion: aarligProduktion, forbrug, egetforbrugAndel: andel, koebspris: pris, salgspris: salg, anlaegspris: effektivAnlaegPris }).egetforbrug,
    );
    const overskud = aarligProduktion - egetForbrug;

    const besparelseEget = egetForbrug * pris;
    const besparelseOverskud = overskud * salg;
    const aarligBesparelse = besparelseEget + besparelseOverskud;

    const tilbagebetalingsAar = aarligBesparelse > 0 ? effektivAnlaegPris / aarligBesparelse : Number.POSITIVE_INFINITY;

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
      tilbagebetalingsAar: Number.isFinite(tilbagebetalingsAar) ? Math.round(tilbagebetalingsAar * 10) / 10 : null,
      totalBesparelse: Math.round(totalBesparelse),
      nettoGevinst: Math.round(nettoGevinst),
      aarligCO2,
      selvforsyning: Math.min(selvforsyning, 100),
      anlaegPrisEffektiv: effektivAnlaegPris,
    };
  }, [anlaegStr, retning, aarligtForbrug, elPris, effektivAnlaegPris, pvgisAktiv, erDa, egetforbrugPct, salgspris]);

  const handleReset = useCallback(() => {
    setAnlaegStr("6");
    setRetning("syd");
    setAarligtForbrug("4000");
    setElPris(aktuellePriser ? String(aktuellePriser.koeb) : "2.5");
    setAnlaegPris("");
    setPrisPrKwp("12000");
    setPostnr("");
    setHaeldning(35);
    setEgetforbrugPct(String(STANDARD_EGETFORBRUG_PCT));
    setSalgspris(String(aktuellePriser ? aktuellePriser.salg : STANDARD_SALGSPRIS));
    setPrisRettet(false);
    hasTracked.current = false;
  }, [aktuellePriser?.koeb, aktuellePriser?.salg]);

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

        {erDa && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="postnr" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Postnummer
                </label>
                <input id="postnr" type="text" inputMode="numeric" autoComplete="postal-code" maxLength={4} placeholder="fx 8000"
                  value={postnr} onChange={(e) => setPostnr(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label htmlFor="haeldning" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Taghældning
                </label>
                <select id="haeldning" value={haeldning} onChange={(e) => setHaeldning(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {HAELDNINGER.map((h) => (
                    <option key={h} value={h}>
                      {h}°{h === 0 ? " (fladt)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 min-h-[2rem]" aria-live="polite">
              {pvgisAktiv
                ? `PVGIS: ${formatLocaleNumber(Math.round(pvgisAktiv.kwhPrKwp))} kWh pr. kWp om året i ${pvgisAktiv.postnr} ${pvgisAktiv.navn}, prisområde ${omraade}.`
                : pvgisStatus === "henter"
                  ? "Henter soldata fra PVGIS …"
                  : pvgisStatus === "ukendt"
                    ? "Postnummeret findes ikke. Beregningen bruger et estimat på 950 kWh pr. kWp."
                    : pvgisStatus === "fejl"
                      ? "PVGIS svarer ikke lige nu. Beregningen bruger et estimat på 950 kWh pr. kWp."
                      : "Indtast postnummer for at hente soldata fra PVGIS. Indtil da bruges et estimat på 950 kWh pr. kWp."}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{l.tagretning}</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(Object.keys(RETNINGSFAKTORER) as Retning[]).map((key) => (
              <button type="button" key={key} onClick={() => setRetning(key)}
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
              <input id="elPris" type="number" value={elPris} onChange={(e) => { setElPris(e.target.value); setPrisRettet(true); }}
                step="0.01" min="0.5"
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

        {erDa && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="egetforbrug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Egetforbrug
                </label>
                <div className="relative">
                  <input id="egetforbrug" type="number" value={egetforbrugPct} onChange={(e) => setEgetforbrugPct(e.target.value)}
                    min="0" max="100" step="5"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-10 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label htmlFor="salgspris" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salgspris (kr/kWh)
                </label>
                <div className="relative">
                  <input id="salgspris" type="number" value={salgspris} onChange={(e) => { setSalgspris(e.target.value); setPrisRettet(true); }}
                    step="0.01" min="0"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg py-3 px-4 pr-12 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Egetforbrug er den del af produktionen, du selv bruger (typisk 25-40 % uden batteri). Den værdisættes til din elpris,
              mens overskuddet sælges til spotpris.{" "}
              {aktuellePriser
                ? `Standardpriserne bygger på gennemsnitlig spotpris de seneste 12 måneder i ${OMRAADE_NAVN[omraade]}: ${aktuellePriser.spot.toLocaleString("da-DK", { maximumFractionDigits: 2 })} kr/kWh. Elprisen lægger nettarif (ca. ${STANDARD_TARIFFER.nettarif.toLocaleString("da-DK")} kr), Energinets tariffer, elafgift og moms oveni.`
                : `Salgsprisen er en standardværdi på ${STANDARD_SALGSPRIS.toLocaleString("da-DK", { minimumFractionDigits: 2 })} kr/kWh, fordi spotpriserne ikke kunne hentes.`}
            </p>
          </div>
        )}
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="animate-fade-in space-y-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:to-amber-800/30 rounded-2xl p-6">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200">{l.dinSolcellebesparelse}</h3>
              <div className="flex gap-2">
                <CopyResultButton text={`Solceller ${anlaegStr} kWp: ${formatLocaleNumber(resultat.aarligProduktion)} kWh/år, besparelse ${formatKr(resultat.aarligBesparelse)}/år, tilbagebetalt på ${resultat.tilbagebetalingsAar ?? "–"} år.`} />
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
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {resultat.tilbagebetalingsAar === null ? "–" : `${resultat.tilbagebetalingsAar.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK")} ${l.aar}`}
                </p>
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
          {erDa && (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Kilder: produktion fra{" "}
              <a href={KILDER.pvgis} className="underline hover:text-blue-700 dark:hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                PVGIS 5.3 (EU JRC)
              </a>
              {pvgisAktiv ? `, hentet kl. ${formatKlokkeslaet(pvgisAktiv.hentet)}` : " (når postnummer er angivet)"}
              {spot12 && (
                <>
                  ; spotpriser fra{" "}
                  <a href={KILDER.energidataservice} className="underline hover:text-blue-700 dark:hover:text-blue-400" target="_blank" rel="noopener noreferrer">
                    Energi Data Service (Energinet)
                  </a>
                  , priser hentet kl. {formatKlokkeslaet(spot12.hentet)}
                </>
              )}
              . Postnumrenes midtpunkter er fra GeoNames (CC BY 4.0).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
