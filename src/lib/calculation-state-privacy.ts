export const CALCULATION_STATE_HISTORY_KEY = "__minberegnerCalculationState";

export const calculationStatePrivacyScript = `
  (() => {
    const pathname = window.location.pathname.endsWith("/")
      ? window.location.pathname.slice(0, -1)
      : window.location.pathname;
    if (pathname !== "/boligstoette") return;
    const url = new URL(window.location.href);
    const fragmentParams = new URLSearchParams(url.hash.slice(1));
    const state = fragmentParams.get("s") || url.searchParams.get("s");
    if (!state) return;
    url.searchParams.delete("s");
    const nextHash = url.hash.slice(1).split("&").filter((part) => {
      try {
        return decodeURIComponent(part.split("=", 1)[0]) !== "s";
      } catch {
        return true;
      }
    }).join("&");
    const currentHistoryState = window.history.state;
    const nextHistoryState =
      currentHistoryState && typeof currentHistoryState === "object" && !Array.isArray(currentHistoryState)
        ? { ...currentHistoryState }
        : {};
    nextHistoryState.${CALCULATION_STATE_HISTORY_KEY} = state;
    window.history.replaceState(
      nextHistoryState,
      "",
      url.pathname + url.search + (nextHash ? "#" + nextHash : ""),
    );
  })();
`;
