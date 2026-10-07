"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sunrise } from "lucide-react";
import { CopyResultButton } from "@/components/ui";
import { useLocale } from "@/components/LocaleProvider";
import { trackCalculation, initScrollDepthTracking } from "@/lib/analytics";
import {
  MAX_ALDER,
  soevnbehov,
  soevnInterval,
  sengetider,
  type SoevnbehovSvar,
} from "@/lib/soevnbehov";

const labels = {
  da: {
    calcName: "Søvnbehovsberegner",
    alder: "Alder (år)",
    maaneder: "Måneder",
    resultat: "Anbefalet søvn",
    timerEnhed: "timer i døgnet",
    lurNote: "inkl. lur",
    vaekketid: "Jeg skal stå op kl.",
    sengetider: "Så bør du gå i seng",
    cyklusser: "søvncyklusser",
    cyklusNote:
      "Tiderne regner med søvncyklusser på 90 minutter og ca. 15 minutter til at falde i søvn.",
    intro:
      "Vælg din alder, og se hvor meget søvn du har brug for. Børn og unge har brug for mere søvn end voksne.",
    shareSummary: "Søvnbehov",
  },
  se: {
    calcName: "Sömnbehovsberäknare",
    alder: "Ålder (år)",
    maaneder: "Månader",
    resultat: "Rekommenderad sömn",
    timerEnhed: "timmar per dygn",
    lurNote: "inkl. tupplur",
    vaekketid: "Jag ska upp kl.",
    sengetider: "Då bör du gå och lägga dig",
    cyklusser: "sömncykler",
    cyklusNote:
      "Tiderna räknar med sömncykler på 90 minuter och cirka 15 minuter för att somna.",
    intro:
      "Välj din ålder och se hur mycket sömn du behöver. Barn och unga behöver mer sömn än vuxna.",
    shareSummary: "Sömnbehov",
  },
} as const;

export default function SoevnbehovBeregner() {
  const { locale } = useLocale();
  const lang = (locale === "se" ? "se" : "da") as "da" | "se";
  const l = labels[lang];

  const [aar, setAar] = useState(30);
  const [maaneder, setMaaneder] = useState(0);
  const [vaekketid, setVaekketid] = useState("07:00");

  const harRegistreret = useRef(false);

  useEffect(() => {
    if (harRegistreret.current) return;
    harRegistreret.current = true;
    const oprydningScroll = initScrollDepthTracking("soevnbehov");
    const timer = setTimeout(() => trackCalculation("soevnbehov"), 2000);
    return () => {
      clearTimeout(timer);
      oprydningScroll();
    };
  }, []);

  const alder = aar + maaneder / 12;

  const svar: SoevnbehovSvar | undefined = useMemo(() => {
    try {
      return soevnbehov(alder);
    } catch {
      // `soevnbehov` kaster på en alder uden for grænsen. Værktøjet skal vise
      // «–» og ikke en fejl fra modulet (punkt 8).
      return undefined;
    }
  }, [alder]);

  const tider = useMemo(() => {
    try {
      return sengetider(vaekketid);
    } catch {
      return [];
    }
  }, [vaekketid]);

  const interval = svar ? soevnInterval(svar) : "–";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="soevn-alder"
                className="mb-1 block text-xs text-gray-600 dark:text-gray-400"
              >
                {l.alder}
              </label>
              <input
                id="soevn-alder"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_ALDER}
                step="1"
                value={aar}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setAar(
                    Number.isFinite(v)
                      ? Math.max(0, Math.min(MAX_ALDER, Math.floor(v)))
                      : 0
                  );
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="soevn-maaneder"
                className="mb-1 block text-xs text-gray-600 dark:text-gray-400"
              >
                {l.maaneder}
              </label>
              <input
                id="soevn-maaneder"
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                step="1"
                value={maaneder}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setMaaneder(
                    Number.isFinite(v)
                      ? Math.max(0, Math.min(11, Math.floor(v)))
                      : 0
                  );
                }}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">{l.intro}</p>
        </div>

        <div className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20">
          <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">{l.resultat}</p>
            <p className="flex items-baseline gap-2 text-3xl font-bold text-gray-900 dark:text-white">
              <Moon
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
                focusable="false"
              />
              <span>
                {interval}{" "}
                <span className="text-xl font-semibold">{l.timerEnhed}</span>
              </span>
            </p>
            {svar ? (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-200">
                {svar.gruppe[lang]}
                {svar.gruppe.lur ? ` · ${l.lurNote}` : ""}
              </p>
            ) : null}
          </div>

          <div className="mt-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <label
              htmlFor="soevn-vaekketid"
              className="mb-1 block text-xs text-gray-600 dark:text-gray-400"
            >
              {l.vaekketid}
            </label>
            <div className="flex items-center gap-2">
              <Sunrise
                className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
                focusable="false"
              />
              <input
                id="soevn-vaekketid"
                type="time"
                value={vaekketid}
                onChange={(e) => setVaekketid(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            {tider.length > 0 ? (
              <>
                <p className="mt-3 text-xs font-medium text-gray-700 dark:text-gray-200">
                  {l.sengetider}
                </p>
                <ul className="mt-1 space-y-1">
                  {tider.map((t) => (
                    <li
                      key={t.cyklusser}
                      className="flex items-baseline justify-between text-sm text-gray-700 dark:text-gray-200"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {t.tid}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t.cyklusser} {l.cyklusser}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {l.cyklusNote}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <CopyResultButton text={`${l.shareSummary}: ${interval} ${l.timerEnhed}`} />
      </div>
    </div>
  );
}
