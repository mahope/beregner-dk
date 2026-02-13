"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  text,
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        role="status"
        aria-label="Indlæser"
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

interface CalculationLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  minHeight?: string;
}

export function CalculationLoading({
  isLoading,
  children,
  loadingText = "Beregner...",
  minHeight = "200px",
}: CalculationLoadingProps) {
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
        style={{ minHeight }}
      >
        <LoadingSpinner text={loadingText} />
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook til at tilføje loading state med debounce til beregnere.
 * Viser en kort loading animation når inputs ændres.
 */
export function useCalculationLoading(
  dependencies: unknown[],
  debounceMs: number = 150
) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Skip loading state ved initial render
    if (!hasInitialized) {
      setHasInitialized(true);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, debounceMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return isLoading;
}
