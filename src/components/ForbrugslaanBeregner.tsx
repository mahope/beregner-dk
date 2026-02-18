"use client";

import { useMemo, useEffect, useRef } from "react";
import { InputField } from "./InputField";
import { AffiliateBox } from "./AffiliateBox";
import { ShareCalculation } from "./ShareCalculation";
import { PrintResult } from "./PrintResult";
import { useCalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

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

  const { inputs, updateInput, getShareableLink } = useCalculationState("forbrugslaan", defaultInputs);
  const laanebelob = inputs.laanebelob as number;
  const loebetid = inputs.loebetid as number;
  const rentesats = inputs.rentesats as number;

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
            value={laanebelob}
            onChange={(v) => updateInput("laanebelob", v)}
            label="Lånebeløb"
            min={5000}
            max={500000}
            step={5000}
            unit="kr"
            helpText="Typisk forbrugslån: 10.000 - 350.000 kr"
          />

          <InputField
            value={loebetid}
            onChange={(v) => updateInput("loebetid", v)}
            label="Løbetid"
            min={12}
            max={180}
            step={12}
            unit="mdr."
            helpText="Typisk 12-120 måneder (1-10 år)"
          />

          <InputField
            value={rentesats}
            onChange={(v) => updateInput("rentesats", v)}
            label="Rentesats"
            min={0}
            max={30}
            step={0.1}
            unit="%"
            helpText="Forbrugslån: typisk 7-20% (2026)"
            customValidation={(value) => {
              if (value < 0) return "Renten kan ikke være negativ";
              if (value > 30) return "Indtast en realistik rentesats";
              return null;
            }}
          />
        </div>

        {/* Resultat sektion */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border border-green-200 dark:border-green-700">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Månedlig ydelse
              </p>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                {maanedligYdelseFormatted}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">Lånebeløb</span>
                <span className="font-medium">{formatKr(result.laanebelob)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">Løbetid</span>
                <span className="font-medium">{loebetid} måneder ({result.samletAar} år)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet rente</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatKr(result.samletRente)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-green-200 dark:border-green-700">
                <span className="text-gray-600 dark:text-gray-400">Samlet beløb</span>
                <span className="font-bold">{samletBelobFormatted}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">ÅOP (Årlig Omkostning i Procent)</span>
                <span className="font-bold text-green-600 dark:text-green-400">{result.apr}%</span>
              </div>
            </div>
          </div>

          {/* Ekstra info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              💡 Du betaler <strong>{formatKr(result.samletRente)}</strong> i renter over {result.samletAar} år
            </p>
          </div>
        </div>
      </div>

      {/* Del og udskriv */}
      <div className="flex flex-wrap gap-4 justify-center">
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Forbrugslånsberegner"
          resultSummary={`Månedlig ydelse: ${maanedligYdelseFormatted}`}
        />
        <PrintResult
          calculatorName="Forbrugslånsberegner"
          resultSummary={`Månedlig ydelse: ${maanedligYdelseFormatted} | Samlet beløb: ${samletBelobFormatted}`}
        />
      </div>

      {/* Tips sektion */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
        <h3 className="font-medium mb-3 text-yellow-800 dark:text-yellow-200">
          ⚠️ Vigtigt om forbrugslån
        </h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
          <li>
            • <strong>Sammenlign ÅOP</strong> - den årlige omkostning i procent inkluderer alle gebyrer
          </li>
          <li>
            • <strong>Tjek gebyrer</strong> - stiftelsesgebyr og administrationsgebyr kan gøre dyre lån dyre
          </li>
          <li>
            • <strong>Kort løbetid = mindre rente</strong> - vælg kortest mulig løbetid du har råd til
          </li>
          <li>
            • <strong>Overvej andre muligheder</strong> - boliglån er ofte billigere hvis du har sikkerhed
          </li>
          <li>
            • <strong>Lån kun hvad du har råd til</strong> - undgå at bruge mere end 30-40% af din rådighedsbeløb
          </li>
        </ul>
      </div>

      {/* Affiliate box */}
      <AffiliateBox
        title="💳 Sammenlign forbrugslån"
        subtitle="Find den bedste rente til dit behov"
        links={forbrugslaanAffiliates}
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
