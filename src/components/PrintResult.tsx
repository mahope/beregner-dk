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
    const printMeta = document.createElement("div");
    printMeta.id = "print-meta";

    const header = document.createElement("div");
    header.className = "print-header";

    const logo = document.createElement("div");
    logo.className = "print-logo";
    logo.textContent = domainConfig.siteName;

    const title = document.createElement("div");
    title.className = "print-title";
    title.textContent = calculatorName;

    const date = document.createElement("div");
    date.className = "print-date";
    date.textContent = `${locale === "se" ? "Utskrivet" : "Udskrevet"}: ${new Date().toLocaleDateString(intlLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;

    header.append(logo, title, date);
    printMeta.appendChild(header);

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
    <button type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors print:hidden"
      title="Udskriv resultat"
    >
      <Printer className="w-4 h-4" />
      <span>Udskriv</span>
    </button>
  );
}
