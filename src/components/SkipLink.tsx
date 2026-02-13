'use client';

/**
 * Skip Link Component
 * 
 * Allows keyboard users to skip directly to main content.
 * Visible only when focused (via tab).
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg focus:outline-none"
    >
      Gå til hovedindhold
    </a>
  );
}

export default SkipLink;
