/**
 * Calculation State Management
 * 
 * URL state encoding/decoding for shareable calculation results.
 * Uses base64 + optional shortlink generation.
 * 
 * @package Beregner.dk
 * @since 1.1.0
 */

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
  shortUrl?: string;
  shortCode?: string;
}

// Constants
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
  
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get(STATE_PARAM);
  
  if (!encoded) return null;
  
  return decodeCalculationState(encoded);
}

/**
 * Update URL with calculation state (without page reload)
 */
export function updateUrlWithState(state: CalculationState): string {
  const encoded = encodeCalculationState(state);
  if (!encoded) return window.location.href;
  
  const url = new URL(window.location.href);
  url.searchParams.set(STATE_PARAM, encoded);
  
  // Update URL without reload
  window.history.replaceState({}, '', url.toString());
  
  return url.toString();
}

/**
 * Generate shareable link with calculation state
 */
export function generateShareableLink(state: CalculationState): ShareableLink {
  const encoded = encodeCalculationState(state);
  
  // Build full URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : '';
  
  const fullUrl = `${baseUrl}?${STATE_PARAM}=${encoded}`;
  
  return {
    fullUrl,
    shortCode: undefined, // Will be set by API if shortlink is generated
  };
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
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

/**
 * Create shortlink via API
 */
export async function createShortlink(fullUrl: string): Promise<ShareableLink> {
  try {
    const response = await fetch('/api/shortlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: fullUrl }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create shortlink');
    }
    
    const data = await response.json();
    
    return {
      fullUrl,
      shortUrl: data.shortUrl,
      shortCode: data.code,
    };
  } catch (e) {
    console.error('Failed to create shortlink:', e);
    return { fullUrl };
  }
}

/**
 * Resolve shortlink to full URL
 */
export async function resolveShortlink(code: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/shortlink/${code}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.url;
  } catch (e) {
    console.error('Failed to resolve shortlink:', e);
    return null;
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
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete(STATE_PARAM);
      window.history.replaceState({}, '', url.toString());
    }
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
