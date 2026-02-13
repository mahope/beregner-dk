"use client";

import React from "react";

/**
 * AdBanner Component - Placeholder for Google AdSense ads
 * 
 * Following AdSense content policies:
 * - Clear "Annonce" label for transparency
 * - Not placed in deceptive locations
 * - Responsive sizing
 * 
 * TODO: Replace placeholder with real AdSense code when approved:
 * - Get Publisher ID from AdSense dashboard
 * - Replace client ID in layout.tsx script
 * - Configure ad slots for each placement
 */
interface AdBannerProps {
  /** Ad placement slot ID for tracking */
  slotId?: string;
  /** Ad format (defaults to responsive) */
  format?: "responsive" | "rectangle" | "horizontal" | "vertical" | "leaderboard";
  /** Additional CSS classes */
  className?: string;
}

export default function AdBanner({
  slotId = "default",
  format = "responsive",
  className = "",
}: AdBannerProps) {
  // Generate height based on format
  const getHeight = () => {
    switch (format) {
      case "rectangle":
        return "h-[250px]";
      case "horizontal":
        return "h-[90px]";
      case "vertical":
        return "h-[600px]";
      case "leaderboard":
        return "h-[90px]";
      case "responsive":
      default:
        return "h-[250px] md:h-[300px]";
    }
  };

  // Placeholder for actual AdSense ad
  // When approved, replace with:
  /*
  <ins
    className="adsbygoogle"
    style={{ display: "block" }}
    data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
    data-ad-slot={slotId}
    data-ad-format={format}
    data-full-width-responsive="true"
  />
  <script>
    (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
  */

  return (
    <div
      className={`w-full ${getHeight()} bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}
      data-testid={`ad-banner-${slotId}`}
      aria-label="Annonce"
    >
      {/* AdSense label - Required by policy */}
      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide flex items-center gap-1">
        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
        Annonce
      </div>
      
      {/* Placeholder content */}
      <div className="flex flex-col items-center justify-center h-full px-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-1">
            {/* Placeholder ad icon */}
            <svg
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Google AdSense
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-600">
            (Venter på godkendelse / Waiting for approval)
          </p>
        </div>
      </div>
      
      {/* Privacy-friendly disclosure */}
      <div className="bg-gray-50 dark:bg-gray-950 px-3 py-2 text-[10px] text-gray-400 dark:text-gray-500 text-center">
        Denne annonce vises af Google og bruger cookies til personlig annoncering.
      </div>
    </div>
  );
}

/**
 * Sidebar Ad Container - For calculator pages
 * Places ad in right column sidebar
 */
export function SidebarAd({ slotId = "sidebar" }: { slotId?: string }) {
  return (
    <aside className="w-full sticky top-4" aria-label="Reklame">
      <AdBanner slotId={slotId} format="rectangle" />
    </aside>
  );
}

/**
 * Inline Ad Container - Between sections
 * For blog posts and calculator sections
 */
export function InlineAd({ slotId = "inline" }: { slotId?: string }) {
  return (
    <div className="my-8" aria-label="Reklame">
      <AdBanner slotId={slotId} format="responsive" />
    </div>
  );
}

/**
 * Footer Ad Container - Bottom of pages
 */
export function FooterAd({ slotId = "footer" }: { slotId?: string }) {
  return (
    <footer className="w-full py-6 mt-8 border-t border-gray-200 dark:border-gray-700" aria-label="Reklame">
      <div className="max-w-[728px] mx-auto">
        <AdBanner slotId={slotId} format="leaderboard" />
      </div>
    </footer>
  );
}

/**
 * Horizontal Ad Container - Between paragraphs or calculator inputs
 */
export function HorizontalAd({ slotId = "horizontal" }: { slotId?: string }) {
  return (
    <div className="my-6" aria-label="Reklame">
      <AdBanner slotId={slotId} format="horizontal" />
    </div>
  );
}
