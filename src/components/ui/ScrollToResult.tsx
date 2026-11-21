"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ScrollToResultProps {
  targetId: string;
  label?: string;
  show?: boolean;
}

/**
 * Sticky bottom button on mobile that scrolls to the result section.
 * Only visible on small screens when the result is below the viewport.
 */
export function ScrollToResult({
  targetId,
  label = "Se resultat",
  show = true,
}: ScrollToResultProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }

    function check() {
      const el = document.getElementById(targetId);
      if (!el) {
        setVisible(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      // Show button when result is below viewport and we're on a small screen
      setVisible(rect.top > window.innerHeight && window.innerWidth < 640);
    }

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [targetId, show]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition-colors sm:hidden"
    >
      {label}
      <ChevronDown className="w-4 h-4" />
    </button>
  );
}
