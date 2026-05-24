"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";
import { getCalculatorsByLocale } from "@/lib/calculator-list";

interface Match {
  title: string;
  href: string;
  icon?: string;
  description: string;
  score: number;
}

const quickSuggestionsMap = {
  da: [
    "Hvad får jeg udbetalt i løn?",
    "Beregn moms af 5000 kr",
    "Hvad er mit BMI?",
    "Hvad koster mit boliglån?",
    "Hvor meget kan jeg få i dagpenge?",
  ],
  se: [
    "Vad får jag i lön efter skatt?",
    "Beräkna moms på 5000 kr",
    "Vad är mitt BMI?",
    "Vad kostar mitt bolån?",
    "Hur mycket kan jag spara?",
  ],
  no: [
    "Hva får jeg utbetalt i lønn?",
    "Beregn moms av 5000 kr",
    "Hva er min BMI?",
    "Hva koster boliglånet mitt?",
    "Hvor mye kan jeg spare?",
  ],
};

const keywordsMap: Record<string, Record<string, string[]>> = {
  da: {
    "/loen-efter-skat": ["løn", "skat", "netto", "brutto", "udbetalt", "indkomst", "skattetryk", "am-bidrag", "hvad får jeg udbetalt", "månedsløn"],
    "/moms": ["moms", "25%", "ex moms", "inkl moms", "momsfri", "moms af", "hvad er momsen"],
    "/bmi": ["bmi", "vægt", "overvægt", "body mass", "højde", "normalvægt"],
    "/boliglaan": ["boliglån", "huslån", "ydelse", "rente", "afdrag", "bolig", "realkreditlån"],
    "/laaneberegner": ["lån", "låne", "afdrag", "ydelse", "tilbagebetaling"],
    "/dagpenge": ["dagpenge", "ledig", "arbejdsløs", "a-kasse"],
    "/feriepenge": ["feriepenge", "ferie", "feriedage"],
    "/pension": ["pension", "folkepension", "pensionsalder", "opsparing"],
    "/su": ["su", "studerende", "uddannelsesstøtte", "fribeløb"],
    "/boernepenge": ["børnepenge", "børneydelse", "ungeydelse", "børn"],
    "/barselsdagpenge": ["barsel", "barselsdagpenge", "orlov", "fødsel"],
    "/rentefradrag": ["rentefradrag", "rente", "fradrag", "renteudgifter"],
    "/skattefradrag": ["skattefradrag", "fradrag", "kørselsfradrag", "håndværkerfradrag"],
    "/topskat": ["topskat", "mellemskat", "høj indkomst", "skatteprocent"],
    "/brutto-netto": ["brutto", "netto", "bruttoløn", "nettoløn", "lønforhandling"],
    "/boligstoette": ["boligstøtte", "husleje", "tilskud"],
    "/ejendomsvaerdiskat": ["ejendomsskat", "grundskyld", "ejendomsværdiskat", "boligskat"],
    "/elberegner": ["el", "strøm", "elforbrug", "kwh", "elpris"],
    "/kalorier": ["kalorier", "kalorie", "kcal", "mad", "kost", "diæt"],
    "/vaegttab": ["vægttab", "tabe sig", "slankekur", "kalorieunderskud"],
    "/valuta": ["valuta", "dollar", "euro", "krone", "veksle"],
    "/procent": ["procent", "procentregning", "udregn procent", "rabat"],
    "/billaan": ["billån", "bil", "bilfinansiering"],
    "/braendstof": ["brændstof", "benzin", "diesel", "km/l"],
    "/termin": ["termin", "terminsdato", "gravid", "graviditet"],
    "/efterloen": ["efterløn", "tidlig pension"],
    "/aktieskat": ["aktie", "aktieskat", "investering"],
    "/leasing": ["leasing", "leasingydelse", "billeasing"],
    "/solceller": ["solceller", "solenergi", "solpanel"],
    "/arveafgift": ["arv", "arveafgift", "boafgift"],
    "/opsparing": ["opsparing", "spare", "renters rente"],
    "/timepris": ["timepris", "timeløn", "freelance"],
    "/gaeldsfri": ["gæld", "gældsfri", "afdrag"],
  },
};

export default function BeregnerAssistent() {
  const { locale } = useLocale();

  // Only show on DA locale
  if (locale !== "da") return null;

  return <AssistentInner locale={locale} />;
}

function AssistentInner({ locale }: { locale: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCalcs = useMemo(() => getCalculatorsByLocale(locale as "da" | "no" | "se"), [locale]);
  const keywords = keywordsMap[locale] || keywordsMap.da;
  const quickSuggestions = quickSuggestionsMap[locale as keyof typeof quickSuggestionsMap] || quickSuggestionsMap.da;

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) { setMatches([]); return; }

    const words = q.split(/\s+/);

    const results: Match[] = allCalcs
      .map((calc) => {
        let score = 0;
        const titleLower = calc.title.toLowerCase();

        if (titleLower.includes(q)) score += 10;
        for (const w of words) {
          if (titleLower.includes(w)) score += 3;
        }

        const kws = keywords[calc.href] || [];
        for (const kw of kws) {
          if (kw.includes(q)) score += 8;
          for (const w of words) {
            if (w.length >= 3 && kw.includes(w)) score += 2;
          }
        }

        return { title: calc.title, href: calc.href, icon: calc.icon, description: calc.description, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setMatches(results);
  }, [query, allCalcs, keywords]);

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105"
        aria-label={t(locale as "da" | "no" | "se", "ui.assistantTitle")}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white">
        <span className="font-semibold text-sm">{t(locale as "da" | "no" | "se", "ui.assistantTitle")}</span>
        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded p-1" aria-label="Luk">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {t(locale as "da" | "no" | "se", "ui.assistantDescription")}
        </p>

        {query === "" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{t(locale as "da" | "no" | "se", "ui.assistantTryLabel")}</p>
            {quickSuggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="block w-full text-left text-sm px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {matches.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              {matches.length === 1 ? t(locale as "da" | "no" | "se", "ui.assistantBestMatch") : `${matches.length} ${t(locale as "da" | "no" | "se", "ui.assistantRelevant")}`}
            </p>
            {matches.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
              >
                {m.icon && <span className="text-2xl">{m.icon}</span>}
                <div>
                  <span className="font-medium text-sm text-gray-900 dark:text-white">{m.title}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{m.description}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {query.length > 0 && matches.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t(locale as "da" | "no" | "se", "ui.assistantNoMatch")} <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setIsOpen(false)}>{t(locale as "da" | "no" | "se", "ui.assistantAllCalc")}</Link>.
          </p>
        )}
      </div>

      {/* Input */}
      <div className="border-t dark:border-gray-700 p-3">
        <label htmlFor="assistent-input" className="sr-only">{t(locale as "da" | "no" | "se", "ui.assistantPlaceholder")}</label>
        <input
          ref={inputRef}
          id="assistent-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(locale as "da" | "no" | "se", "ui.assistantPlaceholder")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
