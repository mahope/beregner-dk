"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

import {
  CONSENT_VERSION,
  readCookieConsent,
  saveCookieConsent,
  subscribeToCookieConsent,
} from "@/lib/cookie-consent";

export default function CookieConsent() {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function syncVisibility() {
      const consent = readCookieConsent();
      setVisible(
        consent?.accepted !== false &&
        (consent?.accepted !== true || (locale === "da" && consent.version !== CONSENT_VERSION)),
      );
    }

    syncVisibility();
    return subscribeToCookieConsent(syncVisibility);
  }, [locale]);

  const choose = (accepted: boolean) => {
    saveCookieConsent(accepted);
    setVisible(false);
  };

  if (!visible) return null;

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
            </div>
            <div role="group" aria-labelledby="cookie-titel" className="shrink-0 flex gap-2 mt-3 md:mt-0">
              <button type="button" onClick={() => choose(false)} className="px-3 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">{t(l, "ui.cookieDecline")}</button>
              <button type="button" onClick={() => choose(true)} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">{t(l, "ui.cookieAccept")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
