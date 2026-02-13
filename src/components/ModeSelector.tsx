'use client';

/**
 * Mode Selector Component
 * 
 * Accessible mode/tab selector with keyboard navigation.
 * Supports arrow keys to navigate between options.
 * 
 * @package Beregner.dk
 */

import { useCallback, useRef, KeyboardEvent } from 'react';

export interface ModeOption<T extends string> {
  id: T;
  label: string;
  desc?: string;
}

interface ModeSelectorProps<T extends string> {
  modes: ModeOption<T>[];
  currentMode: T;
  onChange: (mode: T) => void;
  name: string;
  columns?: 2 | 3 | 4;
}

export function ModeSelector<T extends string>({
  modes,
  currentMode,
  onChange,
  name,
  columns = 4,
}: ModeSelectorProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      let newIndex = index;
      const totalModes = modes.length;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          newIndex = (index + 1) % totalModes;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          newIndex = (index - 1 + totalModes) % totalModes;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = totalModes - 1;
          break;
        default:
          return;
      }

      if (newIndex !== index) {
        onChange(modes[newIndex].id);
        // Focus the new button
        const buttons = containerRef.current?.querySelectorAll<HTMLButtonElement>('button');
        buttons?.[newIndex]?.focus();
      }
    },
    [modes, onChange]
  );

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={name}
      className={`grid ${gridCols[columns]} gap-2`}
    >
      {modes.map((mode, index) => {
        const isSelected = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(mode.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <span className="font-medium block text-gray-900 dark:text-gray-100">
              {mode.label}
            </span>
            {mode.desc && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {mode.desc}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default ModeSelector;
