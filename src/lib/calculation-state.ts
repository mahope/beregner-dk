/**
 * Calculation State Management
 * 
 * URL state encoding/decoding for shareable calculation results.
 * Uses base64 + optional shortlink generation.
 * 
 * @package Beregner.dk
 * @since 1.1.0
 */

import {
  CALCULATION_STATE_CLEAR_KEY,
  CALCULATION_STATE_HISTORY_KEY,
} from './calculation-state-privacy';

// Types
export interface CalculationState {
  type: string;           // Calculator type (e.g., 'loenberegner', 'bmi')
  inputs: Record<string, any>;  // Input values
  results?: Record<string, any>; // Calculated results (optional, can be recalculated)
  timestamp: number;      // When calculation was performed
  version?: string;       // Calculator version for compatibility
}

export interface ShareableLink {
  fullUrl: string;
}

export interface ShareableLinkOptions {
  useFragment?: boolean;
}

const STATE_PARAM = 's';
const VERSION = '1';

/**
 * Encode calculation state to URL-safe string
 */
export function encodeCalculationState(state: CalculationState): string {
  try {
    const json = JSON.stringify({
      v: VERSION,
      t: state.type,
      i: state.inputs,
      ts: state.timestamp,
    });
    
    // Base64 encode and make URL-safe
    const base64 = btoa(json);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
    console.error('Failed to encode calculation state:', e);
    return '';
  }
}

/**
 * Decode calculation state from URL string
 */
export function decodeCalculationState(encoded: string): CalculationState | null {
  try {
    // Restore standard base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const json = atob(base64);
    const data = JSON.parse(json);
    
    return {
      type: data.t,
      inputs: data.i,
      timestamp: data.ts,
      version: data.v,
    };
  } catch (e) {
    console.error('Failed to decode calculation state:', e);
    return null;
  }
}

/**
 * Get calculation state from URL
 */
export function getStateFromUrl(): CalculationState | null {
  if (typeof window === 'undefined') return null;

  const historyState = window.history.state;
  if (
    historyState &&
    typeof historyState === 'object' &&
    !Array.isArray(historyState) &&
    Object.prototype.hasOwnProperty.call(historyState, CALCULATION_STATE_HISTORY_KEY)
  ) {
    const storedState = historyState[CALCULATION_STATE_HISTORY_KEY];
    if (typeof storedState === 'string') {
      const nextHistoryState = { ...historyState };
      delete nextHistoryState[CALCULATION_STATE_HISTORY_KEY];
      window.history.replaceState(
        { ...nextHistoryState, [CALCULATION_STATE_CLEAR_KEY]: true },
        '',
        window.location.href,
      );
      return decodeCalculationState(storedState);
    }
  }

  const fragmentParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const queryParams = new URLSearchParams(window.location.search);
  const encoded = fragmentParams.get(STATE_PARAM) ?? queryParams.get(STATE_PARAM);

  if (!encoded) return null;

  return decodeCalculationState(encoded);
}

function removeFragmentState(url: URL): void {
  if (!url.hash) return;
  const fragmentParams = new URLSearchParams(url.hash.slice(1));
  if (!fragmentParams.has(STATE_PARAM)) return;
  const remainingParts = url.hash.slice(1).split('&').filter((part) => {
    try {
      return decodeURIComponent(part.split('=', 1)[0]) !== STATE_PARAM;
    } catch {
      return true;
    }
  });
  url.hash = remainingParts.length ? `#${remainingParts.join('&')}` : '';
}

/**
 * Update URL with calculation state (without page reload)
 */
export function updateUrlWithState(state: CalculationState): string {
  const encoded = encodeCalculationState(state);
  if (!encoded) return window.location.href;
  
  const url = new URL(window.location.href);
  url.searchParams.set(STATE_PARAM, encoded);
  removeFragmentState(url);
  
  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
  
  return window.location.href;
}

/**
 * Generate shareable link with calculation state
 */
export function generateShareableLink(
  state: CalculationState,
  options: ShareableLinkOptions = {},
): ShareableLink {
  const encoded = encodeCalculationState(state);
  
  // Build full URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  
  const fullUrl = options.useFragment
    ? `${baseUrl}#${STATE_PARAM}=${encoded}`
    : `${baseUrl}?${STATE_PARAM}=${encoded}`;
  
  return { fullUrl };
}

export function clearStateFromUrl(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete(STATE_PARAM);
  removeFragmentState(url);
  const currentHistoryState = window.history.state;
  const nextHistoryState =
    currentHistoryState && typeof currentHistoryState === 'object' && !Array.isArray(currentHistoryState)
      ? { ...currentHistoryState }
      : {};
  delete nextHistoryState[CALCULATION_STATE_HISTORY_KEY];
  window.history.replaceState(
    { ...nextHistoryState, [CALCULATION_STATE_CLEAR_KEY]: true },
    '',
    url.toString(),
  );
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    try {
      textArea.select();
      return document.execCommand('copy');
    } finally {
      document.body.removeChild(textArea);
    }
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

// React Hook for calculation state
import { useState, useEffect, useCallback } from 'react';

export function useCalculationState<T extends Record<string, any>>(
  calculatorType: string,
  defaultInputs: T
) {
  const [inputs, setInputs] = useState<T>(defaultInputs);
  const [isFromUrl, setIsFromUrl] = useState(false);
  
  // Load state from URL on mount
  useEffect(() => {
    const urlState = getStateFromUrl();
    
    if (urlState && urlState.type === calculatorType) {
      setInputs({ ...defaultInputs, ...urlState.inputs } as T);
      setIsFromUrl(true);
    }
  }, [calculatorType]);
  
  // Update a single input
  const updateInput = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    setIsFromUrl(false);
  }, []);
  
  // Update multiple inputs
  const updateInputs = useCallback((updates: Partial<T>) => {
    setInputs(prev => ({ ...prev, ...updates }));
    setIsFromUrl(false);
  }, []);
  
  // Generate shareable link
  const getShareableLink = useCallback((): ShareableLink => {
    const state: CalculationState = {
      type: calculatorType,
      inputs,
      timestamp: Date.now(),
    };
    
    return generateShareableLink(state);
  }, [calculatorType, inputs]);
  
  // Save to URL
  const saveToUrl = useCallback(() => {
    const state: CalculationState = {
      type: calculatorType,
      inputs,
      timestamp: Date.now(),
    };
    
    return updateUrlWithState(state);
  }, [calculatorType, inputs]);
  
  // Reset to defaults
  const reset = useCallback(() => {
    setInputs(defaultInputs);
    setIsFromUrl(false);
    
    // Clear URL state
    clearStateFromUrl();
  }, [defaultInputs]);
  
  return {
    inputs,
    setInputs,
    updateInput,
    updateInputs,
    isFromUrl,
    getShareableLink,
    saveToUrl,
    reset,
  };
}
