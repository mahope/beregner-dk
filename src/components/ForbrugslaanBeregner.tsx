"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import { InputField } from "./InputField";
import { AffiliateBox } from "./AffiliateBox";
import { ShareCalculation } from "./ShareCalculation";
import { PrintResult } from "./PrintResult";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { useCalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency, getCurrencySuffix } from "@/lib/format";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  cta: string;
  highlight?: boolean;
}

const forbrugslaanAffiliates: AffiliateLink[] = [
  {
    name: "Samlino Forbrugslån",
    description: "Sammenlign forbrugslån fra 20+ banker - find den laveste rente",
    url: "https://www.samlino.dk/forbrugslaan/?ref=minberegner",
    cta: "Sammenlign",
    highlight: true,
  },
  {
    name: "Bank Norwegian",
    description: "Forbrugslån uden gebyrer - nem ansøgning på 2 minutter",
    url: "https://www.banknorwegian.dk/privat/finansiering/forbrugslaan/?ref=minberegner",
    cta: "Søg nu",
  },
  {
    name: "Basisbank",
    description: "Fleksibelt forbrugslån med lav rente fra 7,5%",
    url: "https://www.basisbank.dk/privat/laan/forbrugslaan/?ref=minberegner",
    cta: "Få tilbud",
  },
  {
    name: "Lunar",
    description: "Forbrugslån med hurtig udbetaling - ansøg online",
    url: "https://www.lunar.app/dk/privat/loan/?ref=minberegner",
    cta: "Læs mere",
  },
  {
    name: "AK Nordic",
    description: "Tryghedslån med rimelige vilkår - til alle formål",
    url: "https://www.aknordic.dk/?ref=minberegner",
    cta: "Beregn rente",
  },
];

const defaultInputs = {
  laanebelob: 50000,
  loebetid: 60,
  rentesats: 10,
};

export default function ForbrugslaanBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      loanAmount: "Lånebeløb",
      loanAmountHelp: "Typisk forbrugslån: 10.000 - 350.000 kr",
      term: "Løbetid",
      termUnit: "mdr.",
      termHelp: "Typisk 12-120 måneder (1-10 år)",
      interestRate: "Rentesats",
      interestRateHelp: "Forbrugslån: typisk 7-20% (2026)",
      negativeRate: "Renten kan ikke være negativ",
      highRate: "Indtast en realistisk rentesats",
      monthlyPayment: "Månedlig ydelse",
      loanAmountLabel: "Lånebeløb",
      termLabel: "Løbetid",
      months: "måneder",
      years: "år",
      totalInterest: "Samlet rente",
      totalAmount: "Samlet beløb",
      aprLabel: "ÅOP (Årlig Omkostning i Procent)",
      interestInfo: (amount: string, years: string) => `Du betaler ${amount} i renter over ${years} år`,
      calcName: "Forbrugslånsberegner",
      monthlyPaymentSummary: (amount: string) => `Månedlig ydelse: ${amount}`,
      fullSummary: (payment: string, total: string) => `Månedlig ydelse: ${payment} | Samlet beløb: ${total}`,
      tipsTitle: "Vigtigt om forbrugslån",
      tip1Title: "Sammenlign ÅOP",
      tip1: "den årlige omkostning i procent inkluderer alle gebyrer",
      tip2Title: "Tjek gebyrer",
      tip2: "stiftelsesgebyr og administrationsgebyr kan gøre dyre lån dyre",
      tip3Title: "Kort løbetid = mindre rente",
      tip3: "vælg kortest mulig løbetid du har råd til",
      tip4Title: "Overvej andre muligheder",
      tip4: "boliglån er ofte billigere hvis du har sikkerhed",
      tip5Title: "Lån kun hvad du har råd til",
      tip5: "undgå at bruge mere end 30-40% af din rådighedsbeløb",
      affiliateTitle: "Sammenlign forbrugslån",
      affiliateSubtitle: "Find den bedste rente til dit behov",
      tableTitle: "Ydelsestabel",
      monthCol: "Måned",
      paymentCol: "Ydelse",
      interestCol: "Rente",
      amortCol: "Afdrag",
      remainingCol: "Restgæld",
      moreMonths: (count: number) => `... ${count} flere måneder ...`,
    },
    se: {
      loanAmount: "Lånebelopp",
      loanAmountHelp: "Typiskt konsumtionslån: 10 000 – 350 000 kr",
      term: "Löptid",
      termUnit: "mån",
      termHelp: "Typiskt 12–120 månader (1–10 år)",
      interestRate: "Räntesats",
      interestRateHelp: "Konsumtionslån: typiskt 7–20 % (2026)",
      negativeRate: "Räntan kan inte vara negativ",
      highRate: "Ange en realistisk räntesats",
      monthlyPayment: "Månatlig betalning",
      loanAmountLabel: "Lånebelopp",
      termLabel: "Löptid",
      months: "månader",
      years: "år",
      totalInterest: "Total ränta",
      totalAmount: "Totalt belopp",
      aprLabel: "Effektiv ränta",
      interestInfo: (amount: string, years: string) => `Du betalar ${amount} i ränta under ${years} år`,
      calcName: "Konsumtionslånekalkylator",
      monthlyPaymentSummary: (amount: string) => `Månatlig betalning: ${amount}`,
      fullSummary: (payment: string, total: string) => `Månatlig betalning: ${payment} | Totalt belopp: ${total}`,
      tipsTitle: "Viktigt om konsumtionslån",
      tip1Title: "Jämför effektiv ränta",
      tip1: "den effektiva räntan inkluderar alla avgifter",
      tip2Title: "Kontrollera avgifter",
      tip2: "uppläggningsavgift och administrationsavgift kan göra lånet dyrt",
      tip3Title: "Kort löptid = mindre ränta",
      tip3: "välj kortast möjliga löptid du har råd med",
      tip4Title: "Överväg andra alternativ",
      tip4: "bolån är ofta billigare om du har säkerhet",
      tip5Title: "Låna bara vad du har råd med",
      tip5: "undvik att använda mer än 30–40 % av ditt disponibla belopp",
      affiliateTitle: "Jämför konsumtionslån",
      affiliateSubtitle: "Hitta den bästa räntan för ditt behov",
      tableTitle: "Betalningsplan",
      monthCol: "Månad",
      paymentCol: "Betalning",
      interestCol: "Ränta",
      amortCol: "Amortering",
      remainingCol: "Återstående skuld",
      moreMonths: (count: number) => `... ${count} fler månader ...`,
    },
    no: {
      loanAmount: "Lånebeløp",
      loanAmountHelp: "Typisk forbrukslån: 10 000 – 350 000 kr",
      term: "Løpetid",
      termUnit: "mnd.",
      termHelp: "Typisk 12–120 måneder (1–10 år)",
      interestRate: "Rentesats",
      interestRateHelp: "Forbrukslån: typisk 7–20 % (2026)",
      negativeRate: "Renten kan ikke være negativ",
      highRate: "Angi en realistisk rentesats",
      monthlyPayment: "Månedlig betaling",
      loanAmountLabel: "Lånebeløp",
      termLabel: "Løpetid",
      months: "måneder",
      years: "år",
      totalInterest: "Total rente",
      totalAmount: "Totalt beløp",
      aprLabel: "Effektiv rente",
      interestInfo: (amount: string, years: string) => `Du betaler ${amount} i renter over ${years} år`,
      calcName: "Forbrukslånskalkulator",
      monthlyPaymentSummary: (amount: string) => `Månedlig betaling: ${amount}`,
      fullSummary: (payment: string, total: string) => `Månedlig betaling: ${payment} | Totalt beløp: ${total}`,
      tipsTitle: "Viktig om forbrukslån",
      tip1Title: "Sammenlign effektiv rente",
      tip1: "den effektive renten inkluderer alle gebyrer",
      tip2Title: "Sjekk gebyrer",
      tip2: "etableringsgebyr og administrasjonsgebyr kan gjøre lånet dyrt",
      tip3Title: "Kort løpetid = mindre rente",
      tip3: "velg kortest mulig løpetid du har råd til",
      tip4Title: "Vurder andre alternativer",
      tip4: "boliglån er ofte billigere hvis du har sikkerhet",
      tip5Title: "Lån bare det du har råd til",
      tip5: "unngå å bruke mer enn 30–40 % av ditt disponible beløp",
      affiliateTitle: "Sammenlign forbrukslån",
      affiliateSubtitle: "Finn den beste renten for ditt behov",
      tableTitle: "Betalingsplan",
      monthCol: "Måned",
      paymentCol: "Betaling",
      interestCol: "Rente",
      amortCol: "Avdrag",
      remainingCol: "Restgjeld",
      moreMonths: (count: number) => `... ${count} flere måneder ...`,
    },
  };

  const l = labels[locale as keyof typeof labels] || labels.da;

  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("forbrugslaan");
    const timer = setTimeout(() => {
      trackCalculation("forbrugslaan");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const { inputs, updateInput, getShareableLink, reset } = useCalculationState("forbrugslaan", defaultInputs);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);
  const laanebelob = inputs.laanebelob as number;
  const loebetid = inputs.loebetid as number;
  const rentesats = inputs.rentesats as number;

  const formatKr = useCallback((amount: number) => {
    return formatCurrency(amount, locale as "da" | "no" | "se", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  }, [locale]);

  const currSuffix = getCurrencySuffix(locale as "da" | "no" | "se");

  // Beregningsresultater
  const result = useMemo(() => {
    // Månedlig rente
    const maanedligRente = rentesats / 100 / 12;

    // Antal betalinger
    const antalBetalinger = loebetid;

    // Månedlig ydelse (annuitetsformlen)
    let maanedligYdelse: number;

    if (maanedligRente === 0) {
      maanedligYdelse = laanebelob / antalBetalinger;
    } else {
      maanedligYdelse =
        (laanebelob * maanedligRente * Math.pow(1 + maanedligRente, antalBetalinger)) /
        (Math.pow(1 + maanedligRente, antalBetalinger) - 1);
    }

    // Samlet beløb betalt
    const samletBelob = maanedligYdelse * antalBetalinger;

    // Samlet rente
    const samletRente = samletBelob - laanebelob;

    // ÅOP (Approximate Annual Percentage Rate) - forenklet
    const antalTerminerPrAar = 12;
    const samletGebyr = 0;
    const aprApprox = ((antalTerminerPrAar * samletRente) / (laanebelob * (antalBetalinger + 1))) * 100;
    const apr = aprApprox + (samletGebyr / (laanebelob / 2) * 100);

    // Samlet kredittid
    const samletAar = loebetid / 12;

    return {
      laanebelob,
      maanedligYdelse: Math.round(maanedligYdelse),
      samletBelob: Math.round(samletBelob),
      samletRente: Math.round(samletRente),
      apr: apr.toFixed(2),
      samletAar: samletAar.toFixed(1),
    };
  }, [laanebelob, loebetid, rentesats]);

  const maanedligYdelseFormatted = formatKr(result.maanedligYdelse);
  const samletBelobFormatted = formatKr(result.samletBelob);

  return (
    <div className="space-y-8">
      {/* Input sektion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            value={laanebelob}
            onChange={(v) => updateInput("laanebelob", v)}
            label={l.loanAmount}
            min={5000}
            max={500000}
            step={5000}
            unit={currSuffix}
            helpText={l.loanAmountHelp}
          />

          <InputField
            value={loebetid}
            onChange={(v) => updateInput("loebetid", v)}
            label={l.term}
            min={12}
            max={180}
            step={12}
            unit={l.termUnit}
            helpText={l.termHelp}
          />

          <InputField
            value={rentesats}
            onChange={(v) => updateInput("rentesats", v)}
            label={l.interestRate}
            min={0}
            max={30}
            step={0.1}
            unit="%"
            helpText={l.interestRateHelp}
            customValidation={(value) => {
              if (value < 0) return l.negativeRate;
              if (value > 30) return l.highRate;
              return null;
            }}
          />
        </div>

        {/* Resultat sektion */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {l.monthlyPayment}
              </p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {maanedligYdelseFormatted}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">{l.loanAmountLabel}</span>
                <span className="font-medium">{formatKr(result.laanebelob)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">{l.termLabel}</span>
                <span className="font-medium">{loebetid} {l.months} ({result.samletAar} {l.years})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">{l.totalInterest}</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatKr(result.samletRente)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">{l.totalAmount}</span>
                <span className="font-bold">{samletBelobFormatted}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">{l.aprLabel}</span>
                <span className="font-bold text-green-600 dark:text-green-400">{result.apr}%</span>
              </div>
            </div>
          </div>

          {/* Ekstra info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {l.interestInfo(formatKr(result.samletRente), result.samletAar)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <ResetButton onReset={handleReset} />
      </div>

      {/* Del og udskriv */}
      <div className="flex flex-wrap gap-4 justify-center">
        <CopyResultButton text={l.monthlyPaymentSummary(maanedligYdelseFormatted)} />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName={l.calcName}
          resultSummary={l.monthlyPaymentSummary(maanedligYdelseFormatted)}
        />
        <PrintResult
          calculatorName={l.calcName}
          resultSummary={l.fullSummary(maanedligYdelseFormatted, samletBelobFormatted)}
        />
      </div>

      {/* Tips sektion */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">
          {l.tipsTitle}
        </h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <li>
            • <strong>{l.tip1Title}</strong> - {l.tip1}
          </li>
          <li>
            • <strong>{l.tip2Title}</strong> - {l.tip2}
          </li>
          <li>
            • <strong>{l.tip3Title}</strong> - {l.tip3}
          </li>
          <li>
            • <strong>{l.tip4Title}</strong> - {l.tip4}
          </li>
          <li>
            • <strong>{l.tip5Title}</strong> - {l.tip5}
          </li>
        </ul>
      </div>

      {/* Affiliate box */}
      <AffiliateBox
        title={`${l.affiliateTitle}`}
        subtitle={l.affiliateSubtitle}
        links={forbrugslaanAffiliates}
        className="mt-6"
      />

      {/* Ydelsestabel */}
      <div className="overflow-x-auto">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
          {l.tableTitle}
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 text-left">{l.monthCol}</th>
              <th className="px-4 py-2 text-right">{l.paymentCol}</th>
              <th className="px-4 py-2 text-right">{l.interestCol}</th>
              <th className="px-4 py-2 text-right">{l.amortCol}</th>
              <th className="px-4 py-2 text-right">{l.remainingCol}</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let restgaeld = result.laanebelob;
              const maanedligRente = rentesats / 100 / 12;
              const rows = [];

              // Vis kun første 12 måneder og sidste måned
              const showAll = loebetid <= 24;

              for (let i = 1; i <= loebetid; i++) {
                if (!showAll && i > 12 && i < loebetid) {
                  if (i === 13) {
                    rows.push(
                      <tr key="ellipsis" className="bg-gray-50 dark:bg-gray-800/50">
                        <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                          {l.moreMonths(loebetid - 24)}
                        </td>
                      </tr>
                    );
                  }
                  continue;
                }

                const renteDel = restgaeld * maanedligRente;
                const afdragsDel = result.maanedligYdelse - renteDel;
                restgaeld = Math.max(0, restgaeld - afdragsDel);

                rows.push(
                  <tr
                    key={i}
                    className={i % 12 === 0 ? "bg-green-50 dark:bg-green-900/20" : ""}
                  >
                    <td className="px-4 py-2">{i}</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatKr(result.maanedligYdelse)}
                    </td>
                    <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">
                      {formatKr(renteDel)}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600 dark:text-green-400">
                      {formatKr(afdragsDel)}
                    </td>
                    <td className="px-4 py-2 text-right">{formatKr(restgaeld)}</td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
