export const CONSENT_STORAGE_KEY = "mb_cookie_consent_v2";
export const CONSENT_CHANGED_EVENT = "mb-consent-changed";
export const CONSENT_SETTINGS_EVENT = "mb-consent-settings";
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
  const choice = { accepted, version: CONSENT_VERSION };
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ date: Date.now(), ...choice }));
  } catch {
    if (accepted) return false;
    try {
      // A refusal can exceed a full quota by one byte. Leave out the optional timestamp.
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(choice));
    } catch {
      try {
        localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        return false;
      }
    }
  }
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
  return true;
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
