"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Circle, CircleDot, Droplets, Eclipse, Globe, Mars, Moon, Orbit, Sun, Venus, type LucideIcon } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { useLocale } from "@/components/LocaleProvider";
import { alleVaegte } from "@/lib/planetvaegt";

const NAVN: Record<string, { da: string; se: string; icon: LucideIcon }> = {
  merkur: { da: "Merkur", se: "Merkurius", icon: CircleDot },
  venus: { da: "Venus", se: "Venus", icon: Venus },
  maane: { da: "Månen", se: "Månen", icon: Moon },
  mars: { da: "Mars", se: "Mars", icon: Mars },
  jupiter: { da: "Jupiter", se: "Jupiter", icon: Orbit },
  saturn: { da: "Saturn", se: "Saturnus", icon: Eclipse },
  uranus: { da: "Uranus", se: "Uranus", icon: Globe },
  neptun: { da: "Neptun", se: "Neptunus", icon: Droplets },
  pluto: { da: "Pluto", se: "Pluto", icon: Circle },
  sol: { da: "Solen", se: "Solen", icon: Sun },
};

function PlanetIcon({ id }: { id: string }) {
  const Icon = NAVN[id].icon;
  return (
    <Icon
      className="mr-1.5 inline h-4 w-4 align-text-bottom text-indigo-500 dark:text-indigo-400"
      strokeWidth={1.75}
      aria-hidden="true"
      focusable="false"
    />
  );
}

const labels = {
  da: {
    weight: "Din vægt på Jorden",
    name: "Din vægt på planeterne",
    note: "Din vægt afhænger af tyngdekraften, som er forskellig på hver planet. Din masse er den samme overalt — det er kun vægten (kraften), der ændrer sig.",
  },
  se: {
    weight: "Din vikt på Jorden",
    name: "Din vikt på planeterna",
    note: "Din vikt beror på gravitationen, som är olika på varje planet. Din massa är densamma överallt — det är bara vikten (kraften) som ändras.",
  },
} as const;

export default function PlanetVaegtBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];
  const fmt = (n: number) => n.toLocaleString(locale === "se" ? "sv-SE" : locale === "no" ? "nb-NO" : "da-DK", { maximumFractionDigits: 1 });

  const [weight, setWeight] = useState<number>(75);

  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "planetvaegt" && urlState.inputs.weight !== undefined) {
      setWeight(Number(urlState.inputs.weight));
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("planetvaegt");
    const timer = setTimeout(() => {
      trackCalculation("planetvaegt");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const handleReset = useCallback(() => setWeight(75), []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "planetvaegt",
      inputs: { weight },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [weight]);

  const r = useMemo(() => alleVaegte(weight), [weight]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{l.weight}</label>
            <div className="relative">
              <input type="number" min="0" step="0.5" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{l.note}</p>
          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-1.5 animate-fade-in">
            {r?.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-white dark:bg-gray-700 rounded-lg px-3 py-2 shadow-sm">
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  <PlanetIcon id={item.id} />{NAVN[item.id][lang]}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">{fmt(item.vaegt)} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton text={r ? r.map((x) => `${NAVN[x.id][lang]}: ${fmt(x.vaegt)} kg`).join(" · ") : l.name} />
        <ShareCalculation getShareableLink={getShareableLink} calculatorName={l.name}
          resultSummary={r ? `${NAVN.maane[lang]}: ${fmt(r.find((x) => x.id === "maane")!.vaegt)} kg` : l.name} />
      </div>
    </div>
  );
}
