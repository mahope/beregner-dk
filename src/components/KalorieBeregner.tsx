"use client";

import { useState, useMemo } from "react";

type Koen = "mand" | "kvinde";
type AktivitetsNiveau = "stillesiddende" | "let" | "moderat" | "aktiv" | "meget_aktiv";

export default function KalorieBeregner() {
  const [alder, setAlder] = useState<number>(30);
  const [koen, setKoen] = useState<Koen>("mand");
  const [vaegt, setVaegt] = useState<number>(75);
  const [hoejde, setHoejde] = useState<number>(175);
  const [aktivitet, setAktivitet] = useState<AktivitetsNiveau>("moderat");
  const [maal, setMaal] = useState<"vedligehold" | "tab" | "opbyg">("vedligehold");

  const aktivitetsFaktorer: Record<AktivitetsNiveau, { faktor: number; label: string; beskrivelse: string }> = {
    stillesiddende: { faktor: 1.2, label: "Stillesiddende", beskrivelse: "Kontorarbejde, ingen motion" },
    let: { faktor: 1.375, label: "Let aktivitet", beskrivelse: "Let motion 1-3 dage/uge" },
    moderat: { faktor: 1.55, label: "Moderat aktivitet", beskrivelse: "Moderat motion 3-5 dage/uge" },
    aktiv: { faktor: 1.725, label: "Aktiv", beskrivelse: "Hård træning 6-7 dage/uge" },
    meget_aktiv: { faktor: 1.9, label: "Meget aktiv", beskrivelse: "Atletisk træning 2x dagligt" },
  };

  const resultat = useMemo(() => {
    // Mifflin-St Jeor formel for BMR (mest præcis)
    let bmr: number;
    if (koen === "mand") {
      bmr = 10 * vaegt + 6.25 * hoejde - 5 * alder + 5;
    } else {
      bmr = 10 * vaegt + 6.25 * hoejde - 5 * alder - 161;
    }

    // TDEE (Total Daily Energy Expenditure)
    const aktivitetsFaktor = aktivitetsFaktorer[aktivitet].faktor;
    const tdee = bmr * aktivitetsFaktor;

    // Juster baseret på mål
    let anbefaletKalorier: number;
    let maalBeskrivelse: string;

    switch (maal) {
      case "tab":
        anbefaletKalorier = tdee - 500; // 500 kcal deficit = ca. 0.5 kg/uge
        maalBeskrivelse = "For at tabe ca. 0.5 kg pr. uge";
        break;
      case "opbyg":
        anbefaletKalorier = tdee + 300; // Overskud til muskelopbygning
        maalBeskrivelse = "For at opbygge muskelmasse";
        break;
      default:
        anbefaletKalorier = tdee;
        maalBeskrivelse = "For at vedligeholde din vægt";
    }

    // Makronæringsstoffer (standard fordeling)
    const protein = vaegt * 1.8; // 1.8g pr. kg for aktive
    const fedt = (anbefaletKalorier * 0.25) / 9; // 25% af kalorier fra fedt
    const kulhydrater = (anbefaletKalorier - (protein * 4) - (fedt * 9)) / 4;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      anbefalet: Math.round(anbefaletKalorier),
      maalBeskrivelse,
      protein: Math.round(protein),
      fedt: Math.round(fedt),
      kulhydrater: Math.round(kulhydrater),
    };
  }, [alder, koen, vaegt, hoejde, aktivitet, maal]);

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Køn</label>
            <div className="flex gap-4">
              <button
                onClick={() => setKoen("mand")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "mand"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                👨 Mand
              </button>
              <button
                onClick={() => setKoen("kvinde")}
                className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                  koen === "kvinde"
                    ? "border-pink-500 bg-pink-50 text-pink-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                👩 Kvinde
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Alder</label>
            <input
              type="number"
              min="15"
              max="100"
              value={alder}
              onChange={(e) => setAlder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vægt (kg)</label>
            <input
              type="number"
              min="30"
              max="300"
              value={vaegt}
              onChange={(e) => setVaegt(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Højde (cm)</label>
            <input
              type="number"
              min="100"
              max="250"
              value={hoejde}
              onChange={(e) => setHoejde(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Aktivitetsniveau</label>
            <div className="space-y-2">
              {Object.entries(aktivitetsFaktorer).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setAktivitet(key as AktivitetsNiveau)}
                  className={`w-full py-2 px-4 rounded-lg border-2 transition-colors text-left ${
                    aktivitet === key
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium">{value.label}</span>
                  <span className="text-sm text-gray-500 ml-2">({value.beskrivelse})</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dit mål</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMaal("tab")}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                  maal === "tab"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                📉 Tab vægt
              </button>
              <button
                onClick={() => setMaal("vedligehold")}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                  maal === "vedligehold"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                ⚖️ Vedligehold
              </button>
              <button
                onClick={() => setMaal("opbyg")}
                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-colors text-sm ${
                  maal === "opbyg"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                💪 Opbyg
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Dagligt kaloriebehov</p>
          <p className="text-5xl font-bold text-green-600">
            {resultat.anbefalet} kcal
          </p>
          <p className="text-gray-500 mt-2">{resultat.maalBeskrivelse}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Basalstofskifte (BMR)</p>
            <p className="font-bold text-lg">{resultat.bmr} kcal</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500">Vedligehold (TDEE)</p>
            <p className="font-bold text-lg">{resultat.tdee} kcal</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-600">Anbefalet</p>
            <p className="font-bold text-lg text-green-700">{resultat.anbefalet} kcal</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4 text-center">Foreslået makrofordeling</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">Protein</p>
              <p className="font-bold text-xl">{resultat.protein}g</p>
              <p className="text-xs text-gray-500">{resultat.protein * 4} kcal</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-600">Fedt</p>
              <p className="font-bold text-xl">{resultat.fedt}g</p>
              <p className="text-xs text-gray-500">{resultat.fedt * 9} kcal</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">Kulhydrater</p>
              <p className="font-bold text-xl">{resultat.kulhydrater}g</p>
              <p className="text-xs text-gray-500">{resultat.kulhydrater * 4} kcal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium mb-2 text-blue-800">📊 Hvad betyder tallene?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li><strong>BMR:</strong> Kalorier din krop brænder i hvile (bare for at leve)</li>
          <li><strong>TDEE:</strong> Totalt dagligt forbrug inkl. aktivitet</li>
          <li><strong>-500 kcal:</strong> Giver ca. 0.5 kg vægttab pr. uge</li>
          <li><strong>+300 kcal:</strong> Giver overskud til muskelopbygning</li>
        </ul>
      </div>
    </div>
  );
}
