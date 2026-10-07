"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Baby, Gift, HeartHandshake, Users, type LucideIcon } from "lucide-react";
import { ShareCalculation } from "@/components/ShareCalculation";
import { CopyResultButton, ResetButton } from "@/components/ui";
import { generateShareableLink, getStateFromUrl, CalculationState } from "@/lib/calculation-state";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import { GAVE_RELATIONER, beregnGaveafgift, type GaveRelation } from "@/lib/gaveafgift";
import { useLocale } from "@/components/LocaleProvider";
import { formatCurrency } from "@/lib/format";

interface RelationOption {
  value: GaveRelation;
  label: string;
  description: string;
  icon: LucideIcon;
}

const relationOptions: RelationOption[] = [
  {
    value: "naer",
    label: "Nær familie",
    description: "Børn, forældre, samlever m.fl. — 15 %",
    icon: Baby,
  },
  {
    value: "bedsteforaeldre",
    label: "Bedsteforældre / stedforældre",
    description: "36,25 % af beløbet over grænsen",
    icon: Users,
  },
  {
    value: "svigerboern",
    label: "Svigerbarn",
    description: "Lavere grænse — 15 %",
    icon: HeartHandshake,
  },
];

export default function GaveafgiftBeregner() {
  const { locale } = useLocale();
  const formatKr = (amount: number) =>
    formatCurrency(amount, locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const [gavebeloeb, setGavebeloeb] = useState<string>("");
  const [relation, setRelation] = useState<GaveRelation>("naer");
  const hasLoadedUrl = useRef(false);
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasLoadedUrl.current) return;
    hasLoadedUrl.current = true;
    const urlState = getStateFromUrl();
    if (urlState && urlState.type === "gaveafgift") {
      const inputs = urlState.inputs;
      if (inputs.gavebeloeb !== undefined) setGavebeloeb(String(inputs.gavebeloeb));
      if (inputs.relation) setRelation(inputs.relation);
    }
  }, []);

  useEffect(() => {
    if (hasTracked.current) return;
    const cleanupScroll = initScrollDepthTracking("gaveafgift");
    const timer = setTimeout(() => {
      trackCalculation("gaveafgift");
      hasTracked.current = true;
    }, 2000);
    return () => {
      clearTimeout(timer);
      cleanupScroll();
    };
  }, []);

  const getShareableLink = useCallback(() => {
    const state: CalculationState = {
      type: "gaveafgift",
      inputs: { gavebeloeb, relation },
      timestamp: Date.now(),
    };
    return generateShareableLink(state);
  }, [gavebeloeb, relation]);

  const handleReset = useCallback(() => {
    setGavebeloeb("");
    setRelation("naer");
  }, []);

  const resultat = useMemo(() => {
    const beloeb = parseFloat(gavebeloeb.replace(/\./g, "").replace(",", "."));
    return beregnGaveafgift(beloeb, relation);
  }, [gavebeloeb, relation]);

  const bundfradrag = GAVE_RELATIONER[relation].bundfradrag;
  const satsPct = (GAVE_RELATIONER[relation].sats * 100).toLocaleString("da-DK", {
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="gaveafgift-beloeb"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Gavens størrelse (kr.)
            </label>
            <div className="relative">
              <input
                id="gaveafgift-beloeb"
                type="text"
                inputMode="numeric"
                placeholder="Indtast et beløb"
                value={gavebeloeb}
                onChange={(e) => setGavebeloeb(e.target.value)}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-800"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kr.</span>
            </div>
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hvem giver du til?
            </legend>
            <div className="space-y-2">
              {relationOptions.map((option) => {
                const Icon = option.icon;
                const valgt = relation === option.value;
                const id = `gaveafgift-relation-${option.value}`;
                return (
                  <label
                    key={option.value}
                    htmlFor={id}
                    className={`flex items-start gap-3 p-3 min-h-[44px] rounded-lg border-2 cursor-pointer transition-colors ${
                      valgt
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name="gaveafgift-relation"
                      value={option.value}
                      checked={valgt}
                      onChange={() => setRelation(option.value)}
                      className="mt-1 h-4 w-4 text-blue-600"
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="flex justify-end">
            <ResetButton onReset={handleReset} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 md:sticky md:top-24 self-start">
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-lg p-4 text-center bg-blue-100 dark:bg-blue-900/30">
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">Gaveafgift</div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {resultat ? formatKr(resultat.afgift) : "—"} kr.
              </div>
            </div>

            {resultat ? (
              <>
                <p className="text-sm text-center text-gray-700 dark:text-gray-300">
                  Du kan give <strong>{formatKr(bundfradrag)} kr.</strong> til denne modtager uden afgift.
                  Resten af gaven — {formatKr(resultat.grundlag)} kr. — beskattes med {satsPct} %.
                </p>
                <dl className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm text-sm divide-y divide-gray-100 dark:divide-gray-600">
                  <div className="flex justify-between py-1.5">
                    <dt className="text-gray-500 dark:text-gray-400">Gave</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{formatKr(resultat.beloeb)} kr.</dd>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <dt className="text-gray-500 dark:text-gray-400">Afgiftsfrit beløb</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{formatKr(resultat.bundfradrag)} kr.</dd>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <dt className="text-gray-500 dark:text-gray-400">Afgift</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{formatKr(resultat.afgift)} kr.</dd>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <dt className="text-gray-500 dark:text-gray-400">Modtager står tilbage med</dt>
                    <dd className="font-semibold text-blue-600 dark:text-blue-400">{formatKr(resultat.modtager)} kr.</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                Skriv et beløb for at se, hvor meget der skal betales i gaveafgift.
              </p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Kilde: Skattestyrelsen, «Gaver: Så meget må du give i 2026». Beløbene gælder pr.
              gavemodtager pr. kalenderår og forudsætter, at der ikke er givet andre gaver til samme
              modtager i året. Gaver til ægtefæller er som udgangspunkt afgiftsfrie.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 gap-3">
        <CopyResultButton
          text={
            resultat
              ? `En gave på ${formatKr(resultat.beloeb)} kr. udløser ${formatKr(resultat.afgift)} kr. i gaveafgift.`
              : "Gaveafgift"
          }
        />
        <ShareCalculation
          getShareableLink={getShareableLink}
          calculatorName="Gaveafgift"
          resultSummary={
            resultat
              ? `${formatKr(resultat.beloeb)} kr. = ${formatKr(resultat.afgift)} kr. i gaveafgift`
              : "Gaveafgift"
          }
        />
      </div>
    </div>
  );
}
