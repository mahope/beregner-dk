"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

import {
  CONSENT_SETTINGS_EVENT,
  readCookieConsent,
  saveCookieConsent,
  subscribeToCookieConsent,
} from "@/lib/cookie-consent";

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="text-left underline underline-offset-2 hover:text-white transition-colors"
      onClick={(event) => window.dispatchEvent(
        new CustomEvent(CONSENT_SETTINGS_EVENT, { detail: event.currentTarget }),
      )}
    >
      {label}
    </button>
  );
}

export default function CookieConsent() {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const [settingsTrigger, setSettingsTrigger] = useState<HTMLButtonElement | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const declineRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function syncVisibility() {
      const consent = readCookieConsent();
      setVisible(typeof consent?.accepted !== "boolean");
    }

    syncVisibility();
    const unsubscribe = subscribeToCookieConsent(syncVisibility);
    function openSettings(event: Event) {
      setSaveFailed(false);
      setSettingsTrigger((event as CustomEvent<HTMLButtonElement>).detail);
    }
    window.addEventListener(CONSENT_SETTINGS_EVENT, openSettings);
    return () => {
      unsubscribe();
      window.removeEventListener(CONSENT_SETTINGS_EVENT, openSettings);
    };
  }, []);

  useEffect(() => {
    if (settingsTrigger) declineRef.current?.focus();
  }, [settingsTrigger]);

  const choose = (accepted: boolean) => {
    if (!saveCookieConsent(accepted)) {
      setSaveFailed(true);
      return;
    }
    setSaveFailed(false);
    setVisible(false);
    settingsTrigger?.focus();
    setSettingsTrigger(null);
  };

  if (!visible && !settingsTrigger) return null;

  const l = locale as "da" | "no" | "se";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg p-4 md:p-5">
          <div className="md:flex md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p id="cookie-titel" className="font-medium text-gray-900 dark:text-white mb-1">{t(l, "ui.cookieTitle")}</p>
              <p>
                {t(l, "ui.cookieBody")}
                {" "}
                <Link className="text-blue-600 dark:text-blue-400 hover:underline" href="/cookiepolitik">{t(l, "ui.cookiePolicyLink")}</Link>
                {" "}
                {locale === "da" ? "og" : locale === "se" ? "och" : "og"}
                {" "}
                <Link className="text-blue-600 dark:text-blue-400 hover:underline" href="/privatlivspolitik">{t(l, "ui.privacyPolicyLink")}</Link>.
              </p>
              {saveFailed && <p role="alert">{t(l, "ui.cookieSaveError")}</p>}
            </div>
            <div role="group" aria-labelledby="cookie-titel" className="shrink-0 flex gap-2 mt-3 md:mt-0">
              <button type="button" ref={declineRef} onClick={() => choose(false)} className="px-3 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t(l, "ui.cookieDecline")}</button>
              <button type="button" onClick={() => choose(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{t(l, "ui.cookieAccept")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
