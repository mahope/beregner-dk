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
import { adtractionLink } from "@/lib/adtraction";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  cta: string;
  highlight?: boolean;
}

// Real Adtraction tracking links (channel "Min Beregner" 2056156501).
// Programs applied for 2026-06-27 — go live the moment each is approved.
const billaanAffiliates: AffiliateLink[] = [
  {
    name: "Lendo",
    description: "Sammenlign billån fra 20+ banker med én ansøgning - find den laveste rente",
    url: adtractionLink("1562731450", "https://www.lendo.dk/billaan"),
    cta: "Sammenlign billån",
    highlight: true,
  },
  {
    name: "Mybanker",
    description: "Uvildig sammenligning af billån - se hvad du kan spare",
    url: adtractionLink("1740042344", "https://www.mybanker.dk"),
    cta: "Sammenlign",
  },
  {
    name: "Bank Norwegian",
    description: "Billån uden udbetaling - nem ansøgning på 2 minutter",
    url: adtractionLink("1888483286", "https://www.banknorwegian.dk"),
    cta: "Søg nu",
  },
  {
    name: "Facit Bank",
    description: "Billån med konkurrencedygtig rente og hurtigt svar",
    url: adtractionLink("1820677672", "https://facitbank.dk"),
    cta: "Få tilbud",
  },
];

const defaultInputs = {
  bilpris: 250000,
  udbetaling: 20000,
  loebetid: 72,
  rentesats: 6.5,
};

export default function BillaanBeregner() {
  const { locale } = useLocale();

  const labels = {
    da: {
      carPrice: "Bilens pris",
      carPriceHelp: "Den samlede pris på bilen inkl. moms",
      downPayment: "Udbetaling",
      downPaymentHelp: "Typisk 10-20% af bilens pris anbefales",
      term: "Løbetid",
      termUnit: "mdr.",
      termHelp: "Typisk 24-84 måneder (2-7 år)",
      interestRate: "Rentesats",
      interestRateHelp: "Aktuelle billån renter: 5-8% (2026)",
      negativeRate: "Renten kan ikke være negativ",
      highRate: "Indtast en realistisk rentesats",
      monthlyPayment: "Månedlig ydelse",
      loanAmount: "Lånebeløb",
      termLabel: "Løbetid",
      months: "måneder",
      years: "år",
      totalInterest: "Samlet rente",
      totalAmount: "Samlet beløb",
      aprLabel: "ÅOP (Årlig Omkostning i Procent)",
      costPerKm: (cost: string) => `${cost}/km i gennemsnitlig omkostning`,
      costPerKmBasis: "Baseret på 15.000 km/år over lånets løbetid",
      calcName: "Billånsberegner",
      monthlyPaymentSummary: (amount: string) => `Månedlig ydelse: ${amount}`,
      fullSummary: (payment: string, total: string) => `Månedlig ydelse: ${payment} | Samlet beløb: ${total}`,
      tipsTitle: "Sådan får du det bedste billån",
      tip1Title: "Sammenlign flere banker",
      tip1: "renter varierer op til 3% mellem udbydere",
      tip2Title: "Overvej udbetalingens størrelse",
      tip2: "større udbetaling = lavere månedlig ydelse",
      tip3Title: "Kort løbetid = mindre rente",
      tip3: "vælg kortest mulig løbetid du har råd til",
      tip4Title: "Tjek ÅOP",
      tip4: "den årlige omkostning i procent inkluderer alle gebyrer",
      tip5Title: "Forhandl med din bank",
      tip5: "ofte kan du få bedre vilkår hvis du har andre produkter der",
      affiliateTitle: "Sammenlign billån",
      affiliateSubtitle: "Find den bedste rente til din næste bil",
      tableTitle: "Ydelsestabel",
      monthCol: "Måned",
      paymentCol: "Ydelse",
      interestCol: "Rente",
      amortCol: "Afdrag",
      remainingCol: "Restgæld",
      moreMonths: (count: number) => `... ${count} flere måneder ...`,
    },
    se: {
      carPrice: "Bilens pris",
      carPriceHelp: "Det totala priset på bilen inkl. moms",
      downPayment: "Kontantinsats",
      downPaymentHelp: "Typiskt 10–20 % av bilens pris rekommenderas",
      term: "Löptid",
      termUnit: "mån",
      termHelp: "Typiskt 24–84 månader (2–7 år)",
      interestRate: "Räntesats",
      interestRateHelp: "Aktuella billåneräntor: 5–8 % (2026)",
      negativeRate: "Räntan kan inte vara negativ",
      highRate: "Ange en realistisk räntesats",
      monthlyPayment: "Månatlig betalning",
      loanAmount: "Lånebelopp",
      termLabel: "Löptid",
      months: "månader",
      years: "år",
      totalInterest: "Total ränta",
      totalAmount: "Totalt belopp",
      aprLabel: "Effektiv ränta",
      costPerKm: (cost: string) => `${cost}/km i genomsnittlig kostnad`,
      costPerKmBasis: "Baserat på 15 000 km/år under lånets löptid",
      calcName: "Billånekalkylator",
      monthlyPaymentSummary: (amount: string) => `Månatlig betalning: ${amount}`,
      fullSummary: (payment: string, total: string) => `Månatlig betalning: ${payment} | Totalt belopp: ${total}`,
      tipsTitle: "Så får du det bästa billånet",
      tip1Title: "Jämför flera banker",
      tip1: "räntor varierar upp till 3 % mellan långivare",
      tip2Title: "Överväg kontantinsatsens storlek",
      tip2: "större kontantinsats = lägre månatlig betalning",
      tip3Title: "Kort löptid = mindre ränta",
      tip3: "välj kortast möjliga löptid du har råd med",
      tip4Title: "Kontrollera effektiv ränta",
      tip4: "den effektiva räntan inkluderar alla avgifter",
      tip5Title: "Förhandla med din bank",
      tip5: "ofta kan du få bättre villkor om du har andra produkter där",
      affiliateTitle: "Jämför billån",
      affiliateSubtitle: "Hitta den bästa räntan för din nästa bil",
      tableTitle: "Betalningsplan",
      monthCol: "Månad",
      paymentCol: "Betalning",
      interestCol: "Ränta",
      amortCol: "Amortering",
      remainingCol: "Återstående skuld",
      moreMonths: (count: number) => `... ${count} fler månader ...`,
    },
    no: {
      carPrice: "Bilens pris",
      carPriceHelp: "Den totale prisen på bilen inkl. mva",
      downPayment: "Egenkapital",
      downPaymentHelp: "Typisk 10–20 % av bilens pris anbefales",
      term: "Løpetid",
      termUnit: "mnd.",
      termHelp: "Typisk 24–84 måneder (2–7 år)",
      interestRate: "Rentesats",
      interestRateHelp: "Aktuelle billånrenter: 5–8 % (2026)",
      negativeRate: "Renten kan ikke være negativ",
      highRate: "Angi en realistisk rentesats",
      monthlyPayment: "Månedlig betaling",
      loanAmount: "Lånebeløp",
      termLabel: "Løpetid",
      months: "måneder",
      years: "år",
      totalInterest: "Total rente",
      totalAmount: "Totalt beløp",
      aprLabel: "Effektiv rente",
      costPerKm: (cost: string) => `${cost}/km i gjennomsnittlig kostnad`,
      costPerKmBasis: "Basert på 15 000 km/år over lånets løpetid",
      calcName: "Billånskalkulator",
      monthlyPaymentSummary: (amount: string) => `Månedlig betaling: ${amount}`,
      fullSummary: (payment: string, total: string) => `Månedlig betaling: ${payment} | Totalt beløp: ${total}`,
      tipsTitle: "Slik får du det beste billånet",
      tip1Title: "Sammenlign flere banker",
      tip1: "renter varierer opp til 3 % mellom tilbydere",
      tip2Title: "Vurder egenkapitalens størrelse",
      tip2: "større egenkapital = lavere månedlig betaling",
      tip3Title: "Kort løpetid = mindre rente",
      tip3: "velg kortest mulig løpetid du har råd til",
      tip4Title: "Sjekk effektiv rente",
      tip4: "den effektive renten inkluderer alle gebyrer",
      tip5Title: "Forhandle med banken din",
      tip5: "ofte kan du få bedre vilkår hvis du har andre produkter der",
      affiliateTitle: "Sammenlign billån",
      affiliateSubtitle: "Finn den beste renten for din neste bil",
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
    const cleanupScroll = initScrollDepthTracking("billaan");
    const timer = setTimeout(() => {
      trackCalculation("billaan");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const { inputs, updateInput, getShareableLink, reset } = useCalculationState("billaan", defaultInputs);
  const bilpris = inputs.bilpris as number;
  const udbetaling = inputs.udbetaling as number;
  const loebetid = inputs.loebetid as number;
  const rentesats = inputs.rentesats as number;

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const formatKr = useCallback((amount: number) => {
    return formatCurrency(amount, locale as "da" | "no" | "se", { maximumFractionDigits: 0, minimumFractionDigits: 0 });
  }, [locale]);

  const currSuffix = getCurrencySuffix(locale as "da" | "no" | "se");

  // Beregningsresultater
  const result = useMemo(() => {
    const laanebelob = bilpris - udbetaling;

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

    // APR (Approximate Annual Percentage Rate)
    const antalTerminerPrAar = 12;
    const samletGebyr = 0;
    const aprApprox = ((antalTerminerPrAar * samletRente) / (laanebelob * (antalBetalinger + 1))) * 100;
    const apr = aprApprox + (samletGebyr / (laanebelob / 2) * 100);

    // Omkostninger pr. km
    const kmPrAar = 15000;
    const samletKm = (antalBetalinger / 12) * kmPrAar;
    const prisPrKm = samletBelob / samletKm;

    return {
      laanebelob: Math.round(laanebelob),
      maanedligYdelse: Math.round(maanedligYdelse),
      samletBelob: Math.round(samletBelob),
      samletRente: Math.round(samletRente),
      apr: apr.toFixed(2),
      prisPrKm: prisPrKm.toFixed(2),
    };
  }, [bilpris, udbetaling, loebetid, rentesats]);

  const maanedligYdelseFormatted = formatKr(result.maanedligYdelse);
  const samletBelobFormatted = formatKr(result.samletBelob);

  return (
    <div className="space-y-8">
      {/* Input sektion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <InputField
            value={bilpris}
            onChange={(v) => updateInput("bilpris", v)}
            label={l.carPrice}
            min={50000}
            max={2000000}
            step={10000}
            unit={currSuffix}
            helpText={l.carPriceHelp}
          />

          <InputField
            value={udbetaling}
            onChange={(v) => updateInput("udbetaling", v)}
            label={l.downPayment}
            min={0}
            max={bilpris * 0.5}
            step={5000}
            unit={currSuffix}
            helpText={l.downPaymentHelp}
          />

          <InputField
            value={loebetid}
            onChange={(v) => updateInput("loebetid", v)}
            label={l.term}
            min={12}
            max={120}
            step={12}
            unit={l.termUnit}
            helpText={l.termHelp}
          />

          <InputField
            value={rentesats}
            onChange={(v) => updateInput("rentesats", v)}
            label={l.interestRate}
            min={0}
            max={20}
            step={0.1}
            unit="%"
            helpText={l.interestRateHelp}
            customValidation={(value) => {
              if (value < 0) return l.negativeRate;
              if (value > 20) return l.highRate;
              return null;
            }}
          />
        </div>

        {/* Resultat sektion */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {l.monthlyPayment}
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {maanedligYdelseFormatted}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">{l.loanAmount}</span>
                <span className="font-medium">{formatKr(result.laanebelob)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">{l.termLabel}</span>
                <span className="font-medium">{loebetid} {l.months} ({Math.round(loebetid / 12)} {l.years})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">{l.totalInterest}</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatKr(result.samletRente)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">{l.totalAmount}</span>
                <span className="font-bold">{samletBelobFormatted}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">{l.aprLabel}</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{result.apr}%</span>
              </div>
            </div>
          </div>

          {/* Ekstra info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              <strong>{l.costPerKm(`${result.prisPrKm} ${currSuffix}`)}</strong>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
              {l.costPerKmBasis}
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
      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-green-800 dark:text-green-200">
          {l.tipsTitle}
        </h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
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
        links={billaanAffiliates}
        className="mt-6"
      />

      <AffiliateBox
        title="Forsikring & lån til din bil"
        subtitle="Spar på bilforsikringen og se dine lånemuligheder"
        links={[
          { name: "Cover Forsikring", description: "Skift bilforsikring på 2 minutter og se din pris — ofte markant billigere end din nuværende.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=110013&uid=minberegner", cta: "Beregn din bilforsikring", highlight: true },
          { name: "Pantsat.dk", description: "Lån med pant i værdigenstande — hurtigt svar uden kreditvurdering.", url: "https://www.partner-ads.com/dk/klikbanner.php?partnerid=42553&bannerid=78126&uid=minberegner", cta: "Se pantelån" },
        ]}
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
                    className={i % 12 === 0 ? "bg-blue-50 dark:bg-blue-900/20" : ""}
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
