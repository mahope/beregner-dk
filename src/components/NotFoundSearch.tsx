"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { beregnere } from "@/lib/categories";

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;

  // Simple character-by-character fuzzy match
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function getUrlSuggestion(): string | null {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.replace(/^\//, "").replace(/-/g, " ");
  return path.length > 1 ? path : null;
}

export default function NotFoundSearch() {
  const [query, setQuery] = useState("");
  const [urlHint, setUrlHint] = useState<string | null>(null);

  useEffect(() => {
    const hint = getUrlSuggestion();
    if (hint) {
      setUrlHint(hint);
      setQuery(hint);
    }
    // Log 404 to Plausible
    if (typeof window !== "undefined" && window.plausible) {
      window.plausible("404", { props: { path: window.location.pathname } });
    }
  }, []);

  const results = query.length > 1
    ? beregnere
        .filter(
          (b) =>
            fuzzyMatch(query, b.title) ||
            fuzzyMatch(query, b.description) ||
            fuzzyMatch(query, b.category)
        )
        .slice(0, 6)
    : [];

  return (
    <div className="space-y-4">
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søg efter en beregner..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400"
          autoFocus
        />
      </div>

      {urlHint && results.length > 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Mente du en af disse?
        </p>
      )}

      {results.length > 0 && (
        <div className="max-w-md mx-auto space-y-2">
          {results.map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm transition-all text-left"
            >
              <span className="text-2xl flex-shrink-0">{b.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {b.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {b.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {query.length > 1 && results.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingen beregnere matchede din søgning. Prøv et andet søgeord.
        </p>
      )}
    </div>
  );
}
