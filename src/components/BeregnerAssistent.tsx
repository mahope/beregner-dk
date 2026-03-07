"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Match {
  title: string;
  href: string;
  icon: string;
  description: string;
  score: number;
}

const beregnere = [
  { title: "Løn efter skat", href: "/loen-efter-skat", icon: "💰", keywords: ["løn", "skat", "netto", "brutto", "udbetalt", "indkomst", "skattetryk", "am-bidrag", "hvad får jeg udbetalt", "månedsløn"] },
  { title: "Momsberegner", href: "/moms", icon: "🧾", keywords: ["moms", "25%", "ex moms", "inkl moms", "momsfri", "moms af", "hvad er momsen"] },
  { title: "BMI Beregner", href: "/bmi", icon: "⚖️", keywords: ["bmi", "vægt", "overvægt", "body mass", "højde", "normalvægt", "fed", "tynd"] },
  { title: "Boliglån", href: "/boliglaan", icon: "🏡", keywords: ["boliglån", "huslån", "ydelse", "rente", "afdrag", "bolig", "realkreditlån", "hus"] },
  { title: "Låneberegner", href: "/laaneberegner", icon: "🏦", keywords: ["lån", "låne", "afdrag", "ydelse", "tilbagebetaling"] },
  { title: "Dagpenge", href: "/dagpenge", icon: "📋", keywords: ["dagpenge", "ledig", "arbejdsløs", "a-kasse", "understøttelse"] },
  { title: "Feriepenge", href: "/feriepenge", icon: "🏖️", keywords: ["feriepenge", "ferie", "feriedage", "feriepengene"] },
  { title: "Pension", href: "/pension", icon: "🧓", keywords: ["pension", "folkepension", "pensionsalder", "opsparing", "alderspension"] },
  { title: "SU Beregner", href: "/su", icon: "🎓", keywords: ["su", "studerende", "uddannelsesstøtte", "fribeløb", "su-lån"] },
  { title: "Børnepenge", href: "/boernepenge", icon: "👶", keywords: ["børnepenge", "børneydelse", "ungeydelse", "børn", "børnefamilieydelse"] },
  { title: "Barselsdagpenge", href: "/barselsdagpenge", icon: "👶", keywords: ["barsel", "barselsdagpenge", "orlov", "mor", "far", "fødsel", "gravid"] },
  { title: "Rentefradrag", href: "/rentefradrag", icon: "🏦", keywords: ["rentefradrag", "rente", "fradrag", "skattefradrag", "renteudgifter"] },
  { title: "Skattefradrag", href: "/skattefradrag", icon: "📋", keywords: ["skattefradrag", "fradrag", "kørselsfradrag", "håndværkerfradrag", "fagforening", "a-kasse fradrag"] },
  { title: "Topskat", href: "/topskat", icon: "📊", keywords: ["topskat", "mellemskat", "høj indkomst", "skatteprocent"] },
  { title: "Brutto/Netto", href: "/brutto-netto", icon: "💸", keywords: ["brutto", "netto", "bruttoløn", "nettoløn", "lønforhandling"] },
  { title: "Boligstøtte", href: "/boligstoette", icon: "🏘️", keywords: ["boligstøtte", "husleje", "tilskud", "lejer"] },
  { title: "Ejendomsskat", href: "/ejendomsvaerdiskat", icon: "🏠", keywords: ["ejendomsskat", "grundskyld", "ejendomsværdiskat", "boligskat"] },
  { title: "Elberegner", href: "/elberegner", icon: "⚡", keywords: ["el", "strøm", "elforbrug", "kwh", "elpris", "elregning"] },
  { title: "Kalorieberegner", href: "/kalorier", icon: "🍎", keywords: ["kalorier", "kalorie", "kcal", "mad", "kost", "diæt", "kaloriebehov"] },
  { title: "Vægttab", href: "/vaegttab", icon: "📉", keywords: ["vægttab", "tabe sig", "slankekur", "tab vægt", "kalorieunderskud"] },
  { title: "Valutaberegner", href: "/valuta", icon: "💱", keywords: ["valuta", "dollar", "euro", "krone", "veksle", "omregn"] },
  { title: "Procentberegner", href: "/procent", icon: "➗", keywords: ["procent", "procentregning", "udregn procent", "rabat"] },
  { title: "Billån", href: "/billaan", icon: "🚗", keywords: ["billån", "bil", "bilfinansiering", "bilkøb"] },
  { title: "Brændstof", href: "/braendstof", icon: "⛽", keywords: ["brændstof", "benzin", "diesel", "km/l", "tankforbrug", "benzinpris"] },
  { title: "Terminsdato", href: "/termin", icon: "🤰", keywords: ["termin", "terminsdato", "gravid", "graviditet", "fødsel", "uge"] },
  { title: "Efterløn", href: "/efterloen", icon: "🏖️", keywords: ["efterløn", "tidlig pension", "efterlønsalder"] },
  { title: "Aktieskat", href: "/aktieskat", icon: "📈", keywords: ["aktie", "aktieskat", "aktieindkomst", "investering", "depot"] },
  { title: "Leasing", href: "/leasing", icon: "🚗", keywords: ["leasing", "leasingydelse", "privat leasing", "billeasing"] },
  { title: "Solceller", href: "/solceller", icon: "☀️", keywords: ["solceller", "solenergi", "solpanel", "tilbagebetalingstid"] },
  { title: "Arveafgift", href: "/arveafgift", icon: "📜", keywords: ["arv", "arveafgift", "boafgift", "gave", "testament"] },
  { title: "Opsparing", href: "/opsparing", icon: "📈", keywords: ["opsparing", "spare", "renters rente", "opsparingsberegner"] },
  { title: "Timepris", href: "/timepris", icon: "⏱️", keywords: ["timepris", "timeløn", "freelance", "selvstændig", "konsulent"] },
  { title: "Gældsfri", href: "/gaeldsfri", icon: "🎯", keywords: ["gæld", "gældsfri", "afdrag", "snebold", "lavine"] },
];

const quickSuggestions = [
  "Hvad får jeg udbetalt i løn?",
  "Beregn moms af 5000 kr",
  "Hvad er mit BMI?",
  "Hvad koster mit boliglån?",
  "Hvor meget kan jeg få i dagpenge?",
];

function findMatches(query: string): Match[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const words = q.split(/\s+/);

  return beregnere
    .map((b) => {
      let score = 0;
      const titleLower = b.title.toLowerCase();

      // Title match
      if (titleLower.includes(q)) score += 10;
      for (const w of words) {
        if (titleLower.includes(w)) score += 3;
      }

      // Keyword match
      for (const kw of b.keywords) {
        if (kw.includes(q)) score += 8;
        for (const w of words) {
          if (w.length >= 3 && kw.includes(w)) score += 2;
        }
      }

      return { title: b.title, href: b.href, icon: b.icon, description: b.keywords.slice(0, 3).join(", "), score };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

export default function BeregnerAssistent() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMatches(findMatches(query));
  }, [query]);

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 100); }}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-105"
        aria-label="Åbn beregner-assistent"
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
        <span className="font-semibold text-sm">Spørg om din økonomi</span>
        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded p-1" aria-label="Luk">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Beskriv hvad du vil beregne, så finder jeg den rette beregner til dig.
        </p>

        {query === "" && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Prøv fx:</p>
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
              {matches.length === 1 ? "Bedste match:" : `${matches.length} relevante beregnere:`}
            </p>
            {matches.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="text-2xl">{m.icon}</span>
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
            Ingen match. Prøv andre ord, eller se <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline" onClick={() => setIsOpen(false)}>alle beregnere</Link>.
          </p>
        )}
      </div>

      {/* Input */}
      <div className="border-t dark:border-gray-700 p-3">
        <label htmlFor="assistent-input" className="sr-only">Skriv dit spørgsmål</label>
        <input
          ref={inputRef}
          id="assistent-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hvad vil du beregne?"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
