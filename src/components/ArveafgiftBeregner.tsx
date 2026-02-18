"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Users, Calculator, Percent, Heart } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";

type Relation =
  | "aegtefaelle"
  | "barn"
  | "barnebarn"
  | "foraeldre"
  | "soeskende"
  | "andre";

interface RelationOption {
  value: Relation;
  label: string;
  description: string;
  icon: string;
}

const BUNDFRADRAG = 392300;
const BOAFGIFT_PROCENT = 0.15;
const TILLAEG_PROCENT = 0.25;

const relationOptions: RelationOption[] = [
  {
    value: "aegtefaelle",
    label: "Ægtefælle",
    description: "Fritaget for arveafgift",
    icon: "💍",
  },
  {
    value: "barn",
    label: "Barn",
    description: "15% boafgift",
    icon: "👶",
  },
  {
    value: "barnebarn",
    label: "Barnebarn",
    description: "15% boafgift",
    icon: "👦",
  },
  {
    value: "foraeldre",
    label: "Forældre",
    description: "15% boafgift",
    icon: "👨‍👩‍👧",
  },
  {
    value: "soeskende",
    label: "Søskende",
    description: "15% boafgift + 25% tillægsafgift (op til 36,25%)",
    icon: "👫",
  },
  {
    value: "andre",
    label: "Andre (ven, fjern familie mv.)",
    description: "15% boafgift + 25% tillægsafgift (op til 36,25%)",
    icon: "👥",
  },
];

function erNaermesteFamily(relation: Relation): boolean {
  return ["barn", "barnebarn", "foraeldre"].includes(relation);
}

function harTillaeg(relation: Relation): boolean {
  return ["soeskende", "andre"].includes(relation);
}

function formatKr(amount: number): string {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ArveafgiftBeregner() {
  const [arvebeloeb, setArvebeloeb] = useState<string>("");
  const [relation, setRelation] = useState<Relation>("barn");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  // Load state from URL on mount
  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;

    const urlState = getStateFromUrl();
    if (urlState && urlState.type === 'arveafgift') {
      const inputs = urlState.inputs;
      if (inputs.arvebeloeb !== undefined) setArvebeloeb(String(inputs.arvebeloeb));
      if (inputs.relation) setRelation(inputs.relation);
    }
  }, []);

  // Get shareable link for current calculation
  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("arveafgift");
    const timer = setTimeout(() => {
      trackCalculation("arveafgift");
      hasTracked.current = true;
    }, 2000);
    return () => { clearTimeout(timer); cleanupScroll(); };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: 'arveafgift',
      inputs: { arvebeloeb, relation },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [arvebeloeb, relation]);

  const resultat = useMemo(() => {
    const beloeb = parseFloat(arvebeloeb.replace(/\./g, "").replace(",", "."));
    if (!beloeb || beloeb <= 0) return null;

    if (relation === "aegtefaelle") {
      return {
        arvebeloeb: beloeb,
        bundfradrag: 0,
        afgiftsgrundlag: 0,
        boafgift: 0,
        tillaegAfgift: 0,
        samletAfgift: 0,
        arvEfterAfgift: beloeb,
        effektivSats: 0,
      };
    }

    const afgiftsgrundlag = Math.max(0, beloeb - BUNDFRADRAG);
    const boafgift = afgiftsgrundlag * BOAFGIFT_PROCENT;
    const tillaegAfgift = harTillaeg(relation)
      ? (beloeb - boafgift) * TILLAEG_PROCENT
      : 0;
    const samletAfgift = boafgift + tillaegAfgift;
    const arvEfterAfgift = beloeb - samletAfgift;
    const effektivSats = beloeb > 0 ? (samletAfgift / beloeb) * 100 : 0;

    return {
      arvebeloeb: beloeb,
      bundfradrag: Math.min(beloeb, BUNDFRADRAG),
      afgiftsgrundlag,
      boafgift,
      tillaegAfgift,
      samletAfgift,
      arvEfterAfgift,
      effektivSats,
    };
  }, [arvebeloeb, relation]);

  return (
    <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
          <Calculator className="w-5 h-5 text-blue-600" />
          Indtast oplysninger
        </h2>

        <div className="space-y-6">
          {/* Arvebeløb */}
          <div>
            <label
              htmlFor="arvebeloeb"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Arvebeløb (kr.)
            </label>
            <div className="relative">
              <input
                id="arvebeloeb"
                type="text"
                inputMode="numeric"
                placeholder="f.eks. 1.000.000"
                value={arvebeloeb}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.,]/g, "");
                  setArvebeloeb(v);
                }}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                kr.
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Din andel af arven (efter evt. deling mellem arvinger)
            </p>
          </div>

          {/* Relation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Din relation til afdøde
            </label>
            <div className="space-y-2">
              {relationOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    relation === opt.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  }`}
                >
                  <input
                    type="radio"
                    name="relation"
                    value={opt.value}
                    checked={relation === opt.value}
                    onChange={() => setRelation(opt.value)}
                    className="sr-only"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <div className="font-medium dark:text-white">
                      {opt.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {opt.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 dark:text-white">
          <Percent className="w-5 h-5 text-green-600" />
          Beregning af arveafgift
        </h2>

        {!resultat ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Indtast et arvebeløb for at se beregningen</p>
          </div>
        ) : relation === "aegtefaelle" ? (
          <div className="text-center py-8">
            <Heart className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
              Ingen arveafgift
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Som ægtefælle er du <strong>helt fritaget</strong> for
              arveafgift i Danmark.
            </p>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                Du modtager hele arven:
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {formatKr(resultat.arvebeloeb)}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trin-for-trin */}
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Arvebeløb
                </span>
                <span className="font-medium dark:text-white">
                  {formatKr(resultat.arvebeloeb)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Bundfradrag (2026)
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  − {formatKr(resultat.bundfradrag)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Afgiftsgrundlag
                </span>
                <span className="font-medium dark:text-white">
                  {formatKr(resultat.afgiftsgrundlag)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">
                  Boafgift (15%)
                </span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {formatKr(resultat.boafgift)}
                </span>
              </div>

              {harTillaeg(relation) && (
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">
                    Tillægsafgift (25% af arv efter boafgift)
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatKr(resultat.tillaegAfgift)}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-3 bg-red-50 dark:bg-red-900/30 rounded-lg px-4">
                <span className="font-semibold text-red-700 dark:text-red-300">
                  Samlet afgift
                </span>
                <span className="font-bold text-red-700 dark:text-red-300 text-lg">
                  {formatKr(resultat.samletAfgift)}
                </span>
              </div>

              <div className="flex justify-between py-3 bg-green-50 dark:bg-green-900/30 rounded-lg px-4">
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Arv efter afgift
                </span>
                <span className="font-bold text-green-700 dark:text-green-300 text-lg">
                  {formatKr(resultat.arvEfterAfgift)}
                </span>
              </div>
            </div>

            {/* Effektiv sats */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Effektiv afgiftssats
              </p>
              <p className="text-2xl font-bold dark:text-white">
                {resultat.effektivSats.toFixed(1)}%
              </p>
            </div>

            {/* Forklaring */}
            {harTillaeg(relation) && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Bemærk:</strong> Som{" "}
                  {relation === "soeskende" ? "søskende" : "fjernere arving"}{" "}
                  betales der både 15% boafgift og yderligere 25%
                  tillægsafgift. Tillægsafgiften beregnes af arven efter fradrag
                  af boafgiften (ikke af selve boafgiften). Der er intet
                  bundfradrag for tillægsafgiften.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {resultat && (
        <div className="flex justify-center gap-3">
          <CopyResultButton text={relation === "aegtefaelle"
            ? `Ingen afgift - ${formatKr(resultat.arvebeloeb)} arves afgiftsfrit`
            : `Afgift: ${formatKr(resultat.samletAfgift)} (${resultat.effektivSats.toFixed(1)}%) - Arv efter afgift: ${formatKr(resultat.arvEfterAfgift)}`} />
          <ShareCalculation
            getShareableLink={getShareableLink}
            calculatorName="Arveafgiftberegner"
            resultSummary={relation === "aegtefaelle"
              ? `Ingen afgift - ${formatKr(resultat.arvebeloeb)} arves afgiftsfrit`
              : `Afgift: ${formatKr(resultat.samletAfgift)} (${resultat.effektivSats.toFixed(1)}%) - Arv efter afgift: ${formatKr(resultat.arvEfterAfgift)}`}
          />
        </div>
      )}
    </div>
  );
}
