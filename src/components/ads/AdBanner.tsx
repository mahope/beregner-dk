"use client";

import { useEffect, useRef } from "react";

const AD_CLIENT = "ca-pub-1902871361369866";

interface AdBannerProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

export default function AdBanner({
  slotId,
  format = "auto",
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded or blocked
    }
  }, []);

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      aria-label="Annonce"
    >
      <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">Annonce</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function SidebarAd({ slotId = "sidebar" }: { slotId?: string }) {
  return (
    <aside className="w-full sticky top-4" aria-label="Reklame">
      <AdBanner slotId={slotId} format="rectangle" />
    </aside>
  );
}

export function InlineAd({ slotId = "inline" }: { slotId?: string }) {
  return (
    <div className="my-8" aria-label="Reklame">
      <AdBanner slotId={slotId} format="auto" />
    </div>
  );
}

export function FooterAd({ slotId = "footer" }: { slotId?: string }) {
  return (
    <div className="w-full py-6 mt-8 border-t border-gray-200 dark:border-gray-700" aria-label="Reklame">
      <div className="max-w-[728px] mx-auto">
        <AdBanner slotId={slotId} format="horizontal" />
      </div>
    </div>
  );
}

export function HorizontalAd({ slotId = "horizontal" }: { slotId?: string }) {
  return (
    <div className="my-6" aria-label="Reklame">
      <AdBanner slotId={slotId} format="horizontal" />
    </div>
  );
}
