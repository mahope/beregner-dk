import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BMIBeregner = dynamic(() => import("@/components/BMIBeregner"));

export const metadata: Metadata = {
  title: "BMI Beregner Widget",
  robots: { index: false, follow: false },
};

export default function EmbedBMIPage() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <BMIBeregner />
      <p className="text-center text-xs text-gray-400 mt-4">
        <a href="https://minberegner.dk/bmi" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
          Powered by MinBeregner.dk
        </a>
      </p>
    </div>
  );
}
