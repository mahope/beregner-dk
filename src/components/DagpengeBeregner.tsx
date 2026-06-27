"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { CalculationLoading, useCalculationLoading } from "./LoadingSpinner";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { getCurrencySuffix } from "@/lib/format";
import { AffiliateBox } from "./AffiliateBox";
import { adtractionLink } from "@/lib/adtraction";

// Officielle 2026 dagpenge-satser
// Kilde: bm.dk/satser/satser-for-2026, a-kasser.dk
const SATSER_2026 = {
  maxDagpenge: 22041, // Max dagpengesats kr/måned (2026)
  beskaeftigelsesTillaeg: 26198, // Med beskæftigelsestillæg, de første 3 mdr
  dagpengeProcent: 90, // % af beregningsgrundlag
  amBidragProcent: 8, // AM-bidrag fratrækkes først
  dimittendsats: 15174, // Dimittend-sats (ikke-forsørgere, 2026 estimat)
  dimittendsatsForsorger: 22041, // Dimittend-sats forsørgere = max sats
};

interface DagpengeResultat {
  maanedligDagpenge: number;
  medBeskaeftigelsesTillaeg: number;
  ugentligDagpenge: number;
  dagligSats: number;
  procentAfLoen: number;
  erMaxSats: boolean;
  beregningsgrundlag: number;
}

export default function DagpengeBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      monthlyPreTax: "Månedlig løn før skat",
      placeholder: "F.eks. 35000",
      perMonth: "/md",
      avgLast12: "Din gennemsnitlige månedsløn de seneste 12 måneder",
      weeklyHours: "Ugentlige arbejdstimer",
      fulltime: "37 timer (fuldtid)",
      hours30: "30 timer",
      hours25: "25 timer",
      hours20: "20 timer",
      hours15: "15 timer",
      calculating: "Beregner dagpenge...",
      estimatedBenefits: "Dine estimerede dagpenge",
      monthly: "Månedligt",
      weekly: "Ugentligt",
      daily: "Dagligt (ca.)",
      employmentSupplement: "Beskæftigelsestillæg:",
      employmentSupplementDesc: "De første 3 måneder kan du få op til",
      employmentSupplementSuffix: "kr/md hvis du opfylder kravene.",
      maxRateHit: "Du rammer maxsatsen på",
      calcBasis: "Din løn giver et beregningsgrundlag på",
      afterAM: "(efter 8% AM-bidrag).",
      benefitsEqual: "Dagpengene svarer til",
      ofGross: "af din bruttoløn.",
      calcExplain: "Beregning:",
      salaryAfterAM: "(løn efter AM-bidrag) × 90% =",
      infoTitle: "Officielle dagpenge-satser 2026",
      info1: "Dagpenge = 90% af løn efter AM-bidrag (8%)",
      info2: "Max dagpengesats:",
      info3: "Med beskæftigelsestillæg (første 3 mdr): op til",
      info4: "Dagpengeperioden er normalt 2 år (3.848 timer)",
      info5: "Du skal være medlem af en A-kasse og opfylde indkomstkravet",
      source: "Kilde: bm.dk/satser/satser-for-2026 — Kontakt din A-kasse for præcis beregning.",
    },
    se: {
      monthlyPreTax: "Månadslön före skatt",
      placeholder: "T.ex. 35000",
      perMonth: "/mån",
      avgLast12: "Din genomsnittliga månadslön de senaste 12 månaderna",
      weeklyHours: "Veckoarbetstimmar",
      fulltime: "37 timmar (heltid)",
      hours30: "30 timmar",
      hours25: "25 timmar",
      hours20: "20 timmar",
      hours15: "15 timmar",
      calculating: "Beräknar dagpenning...",
      estimatedBenefits: "Din uppskattade dagpenning",
      monthly: "Månadsvis",
      weekly: "Veckovis",
      daily: "Dagligen (ca.)",
      employmentSupplement: "Sysselsättningstillägg:",
      employmentSupplementDesc: "De första 3 månaderna kan du få upp till",
      employmentSupplementSuffix: "kr/mån om du uppfyller kraven.",
      maxRateHit: "Du når maxbeloppet på",
      calcBasis: "Din lön ger ett beräkningsunderlag på",
      afterAM: "(efter 8% AM-bidrag).",
      benefitsEqual: "Dagpenningen motsvarar",
      ofGross: "av din bruttolön.",
      calcExplain: "Beräkning:",
      salaryAfterAM: "(lön efter AM-bidrag) × 90% =",
      infoTitle: "Officiella dagpenningsatser 2026",
      info1: "Dagpenning = 90% av lön efter AM-bidrag (8%)",
      info2: "Max dagpenningsats:",
      info3: "Med sysselsättningstillägg (första 3 mån): upp till",
      info4: "Dagpenningperioden är normalt 2 år (3 848 timmar)",
      info5: "Du måste vara medlem i en A-kassa och uppfylla inkomstkravet",
      source: "Källa: bm.dk/satser/satser-for-2026 — Kontakta din A-kassa för exakt beräkning.",
    },
    no: {
      monthlyPreTax: "Månedlig lønn før skatt",
      placeholder: "F.eks. 35000",
      perMonth: "/md",
      avgLast12: "Din gjennomsnittlige månedslønn de siste 12 månedene",
      weeklyHours: "Ukentlige arbeidstimer",
      fulltime: "37 timer (fulltid)",
      hours30: "30 timer",
      hours25: "25 timer",
      hours20: "20 timer",
      hours15: "15 timer",
      calculating: "Beregner dagpenger...",
      estimatedBenefits: "Dine estimerte dagpenger",
      monthly: "Månedlig",
      weekly: "Ukentlig",
      daily: "Daglig (ca.)",
      employmentSupplement: "Sysselsettingstillegg:",
      employmentSupplementDesc: "De første 3 månedene kan du få opptil",
      employmentSupplementSuffix: "kr/md hvis du oppfyller kravene.",
      maxRateHit: "Du treffer makssatsen på",
      calcBasis: "Lønnen din gir et beregningsgrunnlag på",
      afterAM: "(etter 8% AM-bidrag).",
      benefitsEqual: "Dagpengene tilsvarer",
      ofGross: "av bruttolønnen din.",
      calcExplain: "Beregning:",
      salaryAfterAM: "(lønn etter AM-bidrag) × 90% =",
      infoTitle: "Offisielle dagpengesatser 2026",
      info1: "Dagpenger = 90% av lønn etter AM-bidrag (8%)",
      info2: "Maks dagpengesats:",
      info3: "Med sysselsettingstillegg (første 3 mnd): opptil",
      info4: "Dagpengeperioden er normalt 2 år (3 848 timer)",
      info5: "Du må være medlem av en A-kasse og oppfylle inntektskravet",
      source: "Kilde: bm.dk/satser/satser-for-2026 — Kontakt A-kassen din for nøyaktig beregning.",
    },
  };
  const l = labels[locale as keyof typeof labels] || labels.da;

  const [maanedsloen, setMaanedsloen] = useState<string>("");
  const [arbejdstimer, setArbejdstimer] = useState<string>("37");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'dagpenge') {
      const inputs = urlState.inputs;
      if (inputs.maanedsloen !== undefined) setMaanedsloen(String(inputs.maanedsloen));
      if (inputs.arbejdstimer !== undefined) setArbejdstimer(String(inputs.arbejdstimer));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("dagpenge");
    const timer = setTimeout(() => {
      trackCalculation("dagpenge");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'dagpenge',
      inputs: { maanedsloen, arbejdstimer },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [maanedsloen, arbejdstimer]);

  const handleReset = useCallback(() => {
    setMaanedsloen("");
    setArbejdstimer("37");
  }, []);

  const isLoading = useCalculationLoading([maanedsloen, arbejdstimer]);

  const resultat = useMemo<DagpengeResultat | null>(() => {
    const loen = parseFloat(maanedsloen);
    const timer = parseFloat(arbejdstimer);

    if (!loen || loen <= 0 || !timer || timer <= 0) return null;

    const beregningsgrundlag = loen * (1 - SATSER_2026.amBidragProcent / 100);
    const beregnetDagpenge = beregningsgrundlag * (SATSER_2026.dagpengeProcent / 100);
    const deltidsFaktor = timer / 37;
    const maxDagpengeJusteret = SATSER_2026.maxDagpenge * deltidsFaktor;
    const maxMedTillaeg = SATSER_2026.beskaeftigelsesTillaeg * deltidsFaktor;
    const erMaxSats = beregnetDagpenge >= maxDagpengeJusteret;
    const maanedligDagpenge = erMaxSats ? maxDagpengeJusteret : beregnetDagpenge;
    const medBeskaeftigelsesTillaeg = erMaxSats ? maxMedTillaeg : beregnetDagpenge;

    return {
      maanedligDagpenge: Math.round(maanedligDagpenge),
      medBeskaeftigelsesTillaeg: Math.round(medBeskaeftigelsesTillaeg),
      ugentligDagpenge: Math.round(maanedligDagpenge / 4.33),
      dagligSats: Math.round(maanedligDagpenge / 22),
      procentAfLoen: Math.round((maanedligDagpenge / loen) * 100),
      erMaxSats,
      beregningsgrundlag: Math.round(beregningsgrundlag),
    };
  }, [maanedsloen, arbejdstimer]);

  const fmtNum = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      <div className="space-y-6">
        {/* Input: Månedlig løn */}
        <div>
          <label
            htmlFor="maanedsloen"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {l.monthlyPreTax}
          </label>
          <div className="relative">
            <input
              type="number"
              id="maanedsloen"
              value={maanedsloen}
              onChange={(e) => setMaanedsloen(e.target.value)}
              placeholder={l.placeholder}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {getCurrencySuffix(locale)}{l.perMonth}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {l.avgLast12}
          </p>
        </div>

        {/* Input: Arbejdstimer */}
        <div>
          <label
            htmlFor="arbejdstimer"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {l.weeklyHours}
          </label>
          <select
            id="arbejdstimer"
            value={arbejdstimer}
            onChange={(e) => setArbejdstimer(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="37">{l.fulltime}</option>
            <option value="30">{l.hours30}</option>
            <option value="25">{l.hours25}</option>
            <option value="20">{l.hours20}</option>
            <option value="15">{l.hours15}</option>
          </select>
        </div>

        <div className="flex justify-end">
          <ResetButton onReset={handleReset} />
        </div>

        {/* Resultat */}
        <CalculationLoading
          isLoading={isLoading}
          loadingText={l.calculating}
          minHeight="200px"
        >
        {resultat && (
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {l.estimatedBenefits}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">{l.monthly}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {fmtNum(resultat.maanedligDagpenge)} kr
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">{l.weekly}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {fmtNum(resultat.ugentligDagpenge)} kr
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600 dark:text-gray-400">{l.daily}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {fmtNum(resultat.dagligSats)} kr
                </p>
              </div>
            </div>

            {resultat.erMaxSats && resultat.medBeskaeftigelsesTillaeg > resultat.maanedligDagpenge && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>{l.employmentSupplement}</strong> {l.employmentSupplementDesc} {fmtNum(resultat.medBeskaeftigelsesTillaeg)} {l.employmentSupplementSuffix}
                </p>
              </div>
            )}

            {resultat.erMaxSats && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {l.maxRateHit} {fmtNum(SATSER_2026.maxDagpenge)} kr/md. {l.calcBasis} {fmtNum(resultat.beregningsgrundlag)} kr {l.afterAM}
                </p>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                {l.benefitsEqual} <strong>{resultat.procentAfLoen}%</strong> {l.ofGross}{" "}
                {l.calcExplain} {fmtNum(resultat.beregningsgrundlag)} kr {l.salaryAfterAM} {fmtNum(Math.round(resultat.beregningsgrundlag * 0.9))} kr
              </p>
            </div>
          </div>
        )}
        </CalculationLoading>

        {resultat && (
          <div className="flex justify-center mt-6">
            <CopyResultButton text={`${fmtNum(resultat.maanedligDagpenge)} kr/md`} />
            <ShareCalculation
              getShareableLink={getShareableLink}
              calculatorName="Dagpengeberegner"
              resultSummary={`${fmtNum(resultat.maanedligDagpenge)} kr/md`}
            />
          </div>
        )}

        {/* Info boks */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300">
          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">{l.infoTitle}</h4>
          <ul className="space-y-1 list-disc list-inside">
            <li>{l.info1}</li>
            <li>{l.info2} {fmtNum(SATSER_2026.maxDagpenge)} kr/md</li>
            <li>{l.info3} {fmtNum(SATSER_2026.beskaeftigelsesTillaeg)} kr/md</li>
            <li>{l.info4}</li>
            <li>{l.info5}</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {l.source}
          </p>
        </div>
      </div>
      <AffiliateBox
        title="Find den rette a-kasse"
        subtitle="Sammenlign a-kasser og sikre din indkomst ved ledighed"
        links={[
          { name: "Det Faglige Hus", description: "Danmarks billigste a-kasse og fagforening - bliv medlem online", url: adtractionLink("1873805030", "https://www.detfagligehus.dk"), cta: "Bliv medlem", highlight: true },
          { name: "ASE", description: "A-kasse for alle - uanset job. Hurtig tilmelding", url: adtractionLink("1666137874", "https://www.ase.dk"), cta: "Se priser" },
          { name: "Min A-kasse", description: "Tværfaglig a-kasse med fokus på god service", url: adtractionLink("1667704482", "https://min-a-kasse.dk"), cta: "Bliv medlem" },
        ]}
        className="mt-6"
      />
    </div>
  );
}
