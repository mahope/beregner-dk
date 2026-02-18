"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";

interface CopyResultButtonProps {
  text: string;
  className?: string;
}

/**
 * Inline "Kopiér resultat" button that copies formatted result text.
 */
export function CopyResultButton({ text, className = "" }: CopyResultButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
        copied
          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      } ${className}`}
      aria-label={copied ? "Kopieret" : "Kopiér resultat"}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Kopieret!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          Kopiér
        </>
      )}
    </button>
  );
}
