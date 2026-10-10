"use client";

import { useEffect, useState } from "react";
import { dageTilTimerOgMinutter } from "@/lib/dage-til";

/**
 * Antal timer og minutter til en dato, tællende ned på den besøgendes eget ur.
 *
 * Dagstallet på siden er server-regnede, så det ikke afhænger af, at der er
 * JavaScript. Denne linje tilføjer den finere opløsning: «hvor mange timer er
 * der til jul» er en af de ti hyppigste autocomplete-forslag under både
 * «hvor mange timer er der til jul» og «…til juleaften», og før denne linje
 * besvarede sitet kun dage. Fordi tallet skifter hvert minut, kan det ikke
 * stå i den server-tegnede HTML — derfor rendres det kun efter mount, så
 * serveren aldrig leverer et froset tal.
 *
 * Der er ingen `aria-live`: et live-område ville læse hvert minut op igen i
 * skærmlæseren. Teksten læses én gang, når læseren når den.
 */
export default function DageTilTimer({
  targetDate,
  short,
  locale,
}: {
  targetDate: Date;
  /** Kort navn på datoen, fx "juleaften" / "julafton". */
  short: string;
  locale: "da" | "se";
}) {
  const [nu, setNu] = useState<Date | null>(null);

  useEffect(() => {
    setNu(new Date());
    // Minutopløsning er nok, og det holder skærmen stille: én opdatering i
    // sekundet ville flytte teksten konstant uden at ændre indholdet.
    const id = window.setInterval(() => setNu(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (!nu) return null;

  const { timer, minutter } = dageTilTimerOgMinutter(targetDate, nu);
  const t = timer === 1 ? "time" : "timer";
  const m = minutter === 1 ? "minut" : "minutter";
  const tt = timer === 1 ? "timme" : "timmar";
  const mm = minutter === 1 ? "minut" : "minuter";

  return (
    <p className="text-lg text-blue-800 dark:text-blue-200 mt-2">
      {locale === "da"
        ? `Det er ${timer} ${t} og ${minutter} ${m} til ${short}.`
        : `Det är ${timer} ${tt} och ${minutter} ${mm} till ${short}.`}
    </p>
  );
}
