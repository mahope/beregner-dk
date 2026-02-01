"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  responsive?: boolean;
  className?: string;
}

/**
 * AdSense Banner Component
 * 
 * Usage:
 * <AdBanner slot="1234567890" format="auto" />
 * 
 * Slots skal oprettes i AdSense dashboard efter godkendelse.
 * Indtil da vises en placeholder.
 */
export function AdBanner({ 
  slot, 
  format = "auto", 
  responsive = true,
  className = "" 
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // AdSense script loader
    try {
      // @ts-expect-error - adsbygoogle is injected by Google
      if (typeof window !== "undefined" && window.adsbygoogle) {
        // @ts-expect-error - push ads
        window.adsbygoogle.push({});
      }
    } catch (error) {
      console.log("AdSense not loaded");
    }
  }, []);

  // Vis placeholder hvis AdSense ikke er aktiveret endnu
  const isAdSenseEnabled = false; // Skift til true når AdSense er godkendt

  if (!isAdSenseEnabled) {
    return (
      <div 
        className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm ${className}`}
      >
        <p>📢 Annonceplads</p>
        <p className="text-xs">(AdSense afventer godkendelse)</p>
      </div>
    );
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Erstat med rigtigt Publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

/**
 * In-article Ad for mellem indhold
 */
export function InArticleAd({ className = "" }: { className?: string }) {
  return <AdBanner slot="placeholder-in-article" format="auto" className={`my-8 ${className}`} />;
}

/**
 * Sidebar Ad
 */
export function SidebarAd({ className = "" }: { className?: string }) {
  return <AdBanner slot="placeholder-sidebar" format="vertical" className={className} />;
}
