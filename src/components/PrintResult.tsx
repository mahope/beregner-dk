"use client";

import { Printer } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { getIntlLocale } from "@/lib/format";

interface PrintResultProps {
  /** Beregner navn til print header */
  calculatorName: string;
  /** Kort resultat-opsummering til print */
  resultSummary?: string;
  /** Custom print-area selector (default: nærmeste .print-area parent) */
  printAreaSelector?: string;
}

export function PrintResult({
  calculatorName,
  resultSummary,
  printAreaSelector,
}: PrintResultProps) {
  const { locale, domainConfig } = useLocale();
  const intlLocale = getIntlLocale(locale);
  const handlePrint = () => {
    // Tilføj print-meta data til document for styling
    const printMeta = document.createElement("div");
    printMeta.id = "print-meta";
    printMeta.innerHTML = `
      <div class="print-header">
        <div class="print-logo">📊 ${domainConfig.siteName}</div>
        <div class="print-title">${calculatorName}</div>
        <div class="print-date">${locale === "se" ? "Utskrivet" : "Udskrevet"}: ${new Date().toLocaleDateString(intlLocale, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
      </div>
    `;

    // Find print area
    const printArea = printAreaSelector
      ? document.querySelector(printAreaSelector)
      : document.querySelector(".print-area");

    if (printArea) {
      printArea.insertBefore(printMeta, printArea.firstChild);
    } else {
      document.body.insertBefore(printMeta, document.body.firstChild);
    }

    // Trigger print
    window.print();

    // Clean up
    setTimeout(() => {
      printMeta.remove();
    }, 100);
  };

  return (
    <button
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors print:hidden"
      title="Udskriv resultat"
    >
      <Printer className="w-4 h-4" />
      <span>Udskriv</span>
    </button>
  );
}
