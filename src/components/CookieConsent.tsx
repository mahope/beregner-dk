"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "mb_cookie_consent_v1";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if (!val) setVisible(true);
    } catch (_) {}
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: Date.now(), ads: false }));
    } catch (_) {}
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: Date.now(), ads: false }));
    } catch (_) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pb-4">
        <div className="bg-white border rounded-xl shadow-lg p-4 md:p-5">
          <div className="md:flex md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-700">
              <p className="font-medium text-gray-900 mb-1">Cookies og privatliv</p>
              <p>
                Vi bruger som udgangspunkt ikke cookies. Hvis vi senere viser annoncer (efter AdSense-godkendelse),
                aktiveres eventuelle annonce-cookies først efter dit samtykke. Læs mere i
                {" "}
                <Link className="text-blue-600 hover:underline" href="/cookiepolitik">cookiepolitikken</Link>
                {" "}
                og
                {" "}
                <Link className="text-blue-600 hover:underline" href="/privatlivspolitik">privatlivspolitikken</Link>.
              </p>
            </div>
            <div className="shrink-0 flex gap-2 mt-3 md:mt-0">
              <button onClick={decline} className="px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Afvis</button>
              <button onClick={accept} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Accepter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
