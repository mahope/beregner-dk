export const CALCULATION_STATE_HISTORY_KEY = "__minberegnerCalculationState";
export const CALCULATION_STATE_CLEAR_KEY = "__minberegnerCalculationStateClear";

export const calculationStatePrivacyScript = `
  (() => {
    const stateKey = "${CALCULATION_STATE_HISTORY_KEY}";
    const clearKey = "${CALCULATION_STATE_CLEAR_KEY}";
    const patchKey = "__minberegnerCalculationStatePrivacyPatched";
    const stateParam = "s";

    const withState = (state, encoded) => {
      const nextState =
        state && typeof state === "object" && !Array.isArray(state)
          ? { ...state }
          : {};
      nextState[stateKey] = encoded;
      return nextState;
    };

    const stripState = (url, state) => {
      const fragmentParams = new URLSearchParams(url.hash.slice(1));
      const encoded = fragmentParams.get(stateParam) || url.searchParams.get(stateParam);
      if (!encoded) return { encoded: null, state, url };

      url.searchParams.delete(stateParam);
      const nextHash = url.hash.slice(1).split("&").filter((part) => {
        try {
          return decodeURIComponent(part.split("=", 1)[0]) !== stateParam;
        } catch {
          return true;
        }
      }).join("&");

      return {
        encoded,
        state: withState(state, encoded),
        url: url.pathname + url.search + (nextHash ? "#" + nextHash : ""),
      };
    };

    const sanitizeTarget = (state, target) => {
      if (target === null || target === undefined) return { state, url: target };
      const url = new URL(String(target), window.location.href);
      const pathname = url.pathname.replace(/\\/+$/, "") || "/";
      if (pathname !== "/boligstoette") return { state, url: target };

      const callerWantsClear =
        state &&
        typeof state === "object" &&
        !Array.isArray(state) &&
        state[clearKey] === true;
      if (callerWantsClear) {
        const nextState =
          state && typeof state === "object" && !Array.isArray(state) ? { ...state } : {};
        delete nextState[clearKey];
        return { encoded: null, state: nextState, url: target };
      }

      const scrubbed = stripState(url, state);
      if (scrubbed.encoded) return scrubbed;

      const currentState = window.history.state;
      const hasStoredState =
        currentState &&
        typeof currentState === "object" &&
        !Array.isArray(currentState) &&
        Object.prototype.hasOwnProperty.call(currentState, stateKey);
      const callerHasState =
        state &&
        typeof state === "object" &&
        !Array.isArray(state) &&
        Object.prototype.hasOwnProperty.call(state, stateKey);
      if (hasStoredState && !callerHasState) {
        return {
          encoded: null,
          state: {
            ...(state && typeof state === "object" && !Array.isArray(state) ? state : {}),
            [stateKey]: currentState[stateKey],
          },
          url: target,
        };
      }

      return scrubbed;
    };

    const scrubCurrentUrl = () => {
      const currentUrl = new URL(window.location.href);
      const pathname = currentUrl.pathname.replace(/\\/+$/, "") || "/";
      if (pathname !== "/boligstoette") return;
      const scrubbed = stripState(currentUrl, window.history.state);
      if (scrubbed.encoded) {
        window.history.replaceState(scrubbed.state, "", scrubbed.url);
      }
    };

    if (!window[patchKey]) {
      const originalPushState = window.history.pushState.bind(window.history);
      const originalReplaceState = window.history.replaceState.bind(window.history);

      window.history.pushState = (state, unused, url) => {
        const scrubbed = sanitizeTarget(state, url);
        return originalPushState(scrubbed.state, unused, scrubbed.url);
      };
      window.history.replaceState = (state, unused, url) => {
        const scrubbed = sanitizeTarget(state, url);
        return originalReplaceState(scrubbed.state, unused, scrubbed.url);
      };
      window.addEventListener("popstate", scrubCurrentUrl, true);
      window.addEventListener("hashchange", scrubCurrentUrl, true);
      window[patchKey] = true;
    }

    scrubCurrentUrl();
  })();
`;
