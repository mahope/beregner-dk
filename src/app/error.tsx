"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <h2 className="text-2xl font-bold mb-4 dark:text-white">
        Noget gik galt
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Der opstod en uventet fejl. Prøv at genindlæse siden.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Prøv igen
      </button>
    </div>
  );
}
