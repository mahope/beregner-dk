"use client";

import { useState } from "react";
import Link from "next/link";
import { RuteAfstand } from "@/components/RuteAfstand";
import { aarstal } from "@/lib/dato-eksempler";
import { formatNumber } from "@/lib/format";

/**
 * Arbejdsdage i 2026, talt af `aarstal` — det er mandag til fredag minus
 * helligdagene, så tallet ikke er en antagelse i teksten.
 */
const ARBEJDSDAGE_2026 = aarstal(2026, "da").arbejdsdage;

/** Samme afrunding som RuteAfstand bruger, så de to steder ikke viser 12 og 12,4. */
function km(tal: number): string {
  return formatNumber(tal, "da", { maximumFractionDigits: tal < 10 ? 1 : 0 });
}

export default function AfstandsBeregner() {
  const [kmEnVej, setKmEnVej] = useState<number | null>(null);

  return (
    <div>
      <RuteAfstand onAfstand={setKmEnVej} fraLabel="Fra-adresse" tilLabel="Til-adresse" />
      {kmEnVej !== null && (
        <div className="rounded-xl bg-blue-50 p-4 text-sm dark:bg-blue-950 dark:text-blue-100">
          <p>
            <strong>Tur/retur:</strong> {km(kmEnVej * 2)} km. Hvis du kører tur/retur hver
            arbejdsdag, bliver det {km(kmEnVej * 2 * ARBEJDSDAGE_2026)} km om året — 2026 har{" "}
            {ARBEJDSDAGE_2026} arbejdsdage.
          </p>
          <p className="mt-2">
            <Link href="/befordringsfradrag" className="font-medium underline">
              Læg afstanden ind i dit kørselsfradrag
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}