import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MomsBeregner = dynamic(() => import("@/components/MomsBeregner"));

export const metadata: Metadata = {
  title: "Momsberegner Widget",
  robots: { index: false, follow: false },
};

export default function EmbedMomsPage() {
  return (
    <div className="max-w-lg mx-auto p-4">
      <MomsBeregner />
      <p className="text-center text-xs text-gray-400 mt-4">
        <a href="https://minberegner.dk/moms" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500">
          Powered by MinBeregner.dk
        </a>
      </p>
    </div>
  );
}
