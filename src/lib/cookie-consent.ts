export const CONSENT_STORAGE_KEY = "mb_cookie_consent_v1";
export const CONSENT_CHANGED_EVENT = "mb-consent-changed";
export const CONSENT_VERSION = 2;

export function readCookieConsent() {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) as { accepted?: boolean; version?: number } | null : null;
  } catch {
    return null;
  }
}

export function hasAdConsent() {
  const consent = readCookieConsent();
  return consent?.accepted === true && consent.version === CONSENT_VERSION;
}

export function saveCookieConsent(accepted: boolean) {
  try {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ date: Date.now(), accepted, version: CONSENT_VERSION }),
    );
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}

export function subscribeToCookieConsent(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === CONSENT_STORAGE_KEY || event.key === null) onChange();
  }
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}
