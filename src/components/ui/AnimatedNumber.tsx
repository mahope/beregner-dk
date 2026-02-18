"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatFn?: (n: number) => string;
  className?: string;
}

/**
 * Count-up animation for numeric results.
 * Animates from 0 (or previous value) to the target value.
 */
export function AnimatedNumber({
  value,
  duration = 600,
  formatFn = (n) => n.toLocaleString("da-DK"),
  className,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const prevValue = useRef(value);
  const rafId = useRef<number>(0);

  useEffect(() => {
    const from = prevValue.current;
    const to = value;
    prevValue.current = value;

    if (from === to) return;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (to - from) * eased);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setDisplayed(to);
      }
    }

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [value, duration]);

  return <span className={className}>{formatFn(displayed)}</span>;
}
