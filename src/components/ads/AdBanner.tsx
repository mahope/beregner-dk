"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocaleOptional } from "@/components/LocaleProvider";
import {
  ADSENSE_CLIENT,
  ADSENSE_PAGES,
  ADSENSE_SCRIPT_URL,
  isAdSenseEnabled,
  reloadAfterAdConsentWithdrawal,
} from "@/lib/ads";
import { hasAdConsent, subscribeToCookieConsent } from "@/lib/cookie-consent";

type AdQueue = {
  requestNonPersonalizedAds?: 1;
  push: (request: Record<string, never>) => unknown;
};

declare global {
  interface Window {
    adsbygoogle?: AdQueue;
  }
}

let scriptLoaded = false;
let stopWatchingConsent: (() => void) | undefined;
const pendingScripts = new Set<symbol>();

function stopConsentWatcher() {
  stopWatchingConsent?.();
  stopWatchingConsent = undefined;
}

function watchConsentAfterScriptInsertion() {
  stopWatchingConsent ??= subscribeToCookieConsent(() => {
    if (hasAdConsent()) return;

    stopConsentWatcher();
    scriptLoaded = false;
    pendingScripts.clear();
    // Removing the script element cannot stop Google code that has already executed.
    reloadAfterAdConsentWithdrawal();
  });
}

function nonPersonalizedQueue() {
  const queue: AdQueue = window.adsbygoogle ?? ([] as Record<string, never>[]);
  window.adsbygoogle = queue;
  queue.requestNonPersonalizedAds = 1;
  return queue;
}

function AdUnit({ slot }: { slot: string }) {
  const accepted = useSyncExternalStore(subscribeToCookieConsent, hasAdConsent, () => false);
  const adRef = useRef<HTMLModElement>(null);
  const requestedAd = useRef<HTMLModElement>(null);

  useEffect(() => {
    const ad = adRef.current;
    if (!accepted || !ad || requestedAd.current === ad || !hasAdConsent()) return;

    const requestAd = () => {
      if (!hasAdConsent()) return;
      const queue = nonPersonalizedQueue();
      try {
        queue.push({});
        requestedAd.current = ad;
      } catch {
        // En blokeret eller afvist annonce må ikke påvirke beregneren.
      }
    };

    if (scriptLoaded) {
      requestAd();
      return;
    }

    nonPersonalizedQueue();
    const script = document.createElement("script");
    script.src = ADSENSE_SCRIPT_URL;
    script.async = true;
    script.crossOrigin = "anonymous";
    const pendingScript = Symbol();
    pendingScripts.add(pendingScript);
    script.onload = () => {
      if (!pendingScripts.delete(pendingScript)) return;
      scriptLoaded = true;
      if (script.isConnected) requestAd();
    };
    script.onerror = () => {
      pendingScripts.delete(pendingScript);
      script.remove();
      if (!scriptLoaded && pendingScripts.size === 0) stopConsentWatcher();
    };
    watchConsentAfterScriptInsertion();
    document.head.append(script);

    return () => {
      // Removal may leave a pending script running. Keep its load and error handlers.
      script.remove();
    };
  }, [accepted]);

  if (!accepted) return null;

  return (
    <div className="mx-auto my-8 min-h-[280px] w-fit text-center md:min-h-[270px]">
      <p className="mb-1 text-xs text-gray-600 dark:text-gray-300">Annonce</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", marginInline: "auto", width: 250, height: 250 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
      />
    </div>
  );
}

export function ResultAd({ page }: { page: string }) {
  const locale = useLocaleOptional()?.locale;
  const slot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULT;
  if (locale !== "da" || !ADSENSE_PAGES.has(page)) return null;
  if (!isAdSenseEnabled() || !slot || !/^\d+$/.test(slot)) return null;
  return <AdUnit key={slot} slot={slot} />;
}
