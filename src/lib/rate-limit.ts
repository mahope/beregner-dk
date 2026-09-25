// Simple in-memory rate limit per key (typically IP). Applies per server process and resets on restart.
// Enough to slow down abuse of /api/bbr without an external dependency.

export function lavRateLimit(graense: number, vinduesMs = 60_000) {
  const kald = new Map<string, { start: number; antal: number }>();
  return {
    tilladt(noegle: string, nu = Date.now()): boolean {
      const k = kald.get(noegle);
      if (!k || nu - k.start >= vinduesMs) {
        if (kald.size > 5000) {
          for (const [key, v] of kald) if (nu - v.start >= vinduesMs) kald.delete(key);
        }
        kald.set(noegle, { start: nu, antal: 1 });
        return true;
      }
      k.antal++;
      return k.antal <= graense;
    },
    nulstil() {
      kald.clear();
    },
  };
}
