"use client";

import { useMemo } from "react";
import { InputField } from "./InputField";
import { AffiliateBox } from "./AffiliateBox";
import { ShareCalculation } from "./ShareCalculation";
import { PrintResult } from "./PrintResult";
import { useCalculationState } from "@/lib/calculation-state";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  cta: string;
  highlight?: boolean;
}

const billaanAffiliates: AffiliateLink[] = [
  {
    name: "Samlino Billån",
    description: "Sammenlign billån fra 20+ banker - find den laveste rente",
    url: "https://www.samlino.dk/billaan/?ref=minberegner",
    cta: "Sammenlign",
    highlight: true,
  },
  {
    name: "Bank Norwegian",
    description: "Billån uden udbetaling - nem ansøgning på 2 minutter",
    url: "https://www.banknorwegian.dk/privat/finansiering/billaan/?ref=minberegner",
    cta: "Søg nu",
  },
  {
    name: "Basisbank",
    description: "Fleksibelt billån med konkurrencedygtige renter",
    url: "https://www.basisbank.dk/privat/laan/billaan/?ref=minberegner",
    cta: "Få tilbud",
  },
  {
    name: "Santander Consumer Bank",
    description: "Billån med eller uden udbetaling - hurtig udbetaling",
    url: "https://www.santanderconsumer.dk/billaan/?ref=minberegner",
    cta: "Læs mere",
  },
];

const defaultInputs = {
  bilpris: 250000,
  udbetaling: 20000,
  loebetid: 72,
  rentesats: 6.5,
};

export default function BillaanBeregner() {
  const { inputs, updateInput, getShareableLink } = useCalculationState("billaan", defaultInputs);
  const bilpris = inputs.bilpris as number;
  const udbetaling = inputs.udbetaling as number;
  const loebetid = inputs.loebetid as number;
  const rentesats = inputs.rentesats as number;

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

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
            label="Bilens pris"
            min={50000}
            max={2000000}
            step={10000}
            unit="kr"
            helpText="Den samlede pris på bilen inkl. moms"
          />

          <InputField
            value={udbetaling}
            onChange={(v) => updateInput("udbetaling", v)}
            label="Udbetaling"
            min={0}
            max={bilpris * 0.5}
            step={5000}
            unit="kr"
            helpText="Typisk 10-20% af bilens pris anbefales"
          />

          <InputField
            value={loebetid}
            onChange={(v) => updateInput("loebetid", v)}
            label="Løbetid"
            min={12}
            max={120}
            step={12}
            unit="mdr."
            helpText="Typisk 24-84 måneder (2-7 år)"
          />

          <InputField
            value={rentesats}
            onChange={(v) => updateInput("rentesats", v)}
            label="Rentesats"
            min={0}
            max={20}
            step={0.1}
            unit="%"
            helpText="Aktuelle billån renter: 5-8% (2026)"
            customValidation={(value) => {
              if (value < 0) return "Renten kan ikke være negativ";
              if (value > 20) return "Indtast en realistisk rentesats";
              return null;
            }}
          />
        </div>

        {/* Resultat sektion */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Månedlig ydelse
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {maanedligYdelseFormatted}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">Lånebeløb</span>
                <span className="font-medium">{formatKr(result.laanebelob)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">Løbetid</span>
                <span className="font-medium">{loebetid} måneder ({Math.round(loebetid / 12)} år)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet rente</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatKr(result.samletRente)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-blue-200 dark:border-blue-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet beløb</span>
                <span className="font-bold">{samletBelobFormatted}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">ÅOP (Årlig Omkostning i Procent)</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{result.apr}%</span>
              </div>
            </div>
          </div>

          {/* Ekstra info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              💰 <strong>{result.prisPrKm} kr/km</strong> i gennemsnitlig omkostning
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-2">
              Baseret på 15.000 km/år over lånets løbetid
            </p>
          </div>
        </div>
      </div>

      {/* Del og udskriv */}
      <div className="flex flex-wrap gap-4 justify-center">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Billånsberegner"
          resultSummary={`Månedlig ydelse: ${maanedligYdelseFormatted}`}
        />
        <PrintResult
          calculatorName="Billånsberegner"
          resultSummary={`Månedlig ydelse: ${maanedligYdelseFormatted} | Samlet beløb: ${samletBelobFormatted}`}
        />
      </div>

      {/* Tips sektion */}
      <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-green-800 dark:text-green-200">
          💡 Sådan får du det bedste billån
        </h3>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
          <li>
            • <strong>Sammenlign flere banker</strong> - renter varierer op til 3% mellem
            udbydere
          </li>
          <li>
            • <strong>Overvej udbetalingens størrelse</strong> - større udbetaling = lavere
            månedlig ydelse
          </li>
          <li>
            • <strong>Kort løbetid = mindre rente</strong> - vælg kortest mulig løbetid du
            har råd til
          </li>
          <li>
            • <strong>Tjek ÅOP</strong> - den årlige omkostning i procent inkluderer alle
            gebyrer
          </li>
          <li>
            • <strong>Forhandl med din bank</strong> - ofte kan du få bedre vilkår hvis du
            har andre produkter der
          </li>
        </ul>
      </div>

      {/* Affiliate box */}
      <AffiliateBox
        title="🚗 Sammenlign billån"
        subtitle="Find den bedste rente til din næste bil"
        links={billaanAffiliates}
        className="mt-6"
      />

      {/* Ydelsestabel */}
      <div className="overflow-x-auto">
        <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">
          Ydelsestabel
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 text-left">Måned</th>
              <th className="px-4 py-2 text-right">Ydelse</th>
              <th className="px-4 py-2 text-right">Rente</th>
              <th className="px-4 py-2 text-right">Afdrag</th>
              <th className="px-4 py-2 text-right">Restgæld</th>
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
                          ... {loebetid - 24} flere måneder ...
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
