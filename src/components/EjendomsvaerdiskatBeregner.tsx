"use client";

import { useState, useMemo } from "react";
import { Home, Percent, Calculator } from "lucide-react";

// Kommuneprocenter for de største kommuner (2024/2025 satser)
const KOMMUNE_PROcenter: Record<string, number> = {
  "101": 23.0, // København
  "147": 25.5, // Frederiksberg
  "151": 23.8, // Dragør
  "153": 23.3, // Tårnby
  "155": 24.1, // Albertslund
  "157": 22.8, // Glostrup
  "159": 23.5, // Herlev
  "161": 23.3, // Hvidovre
  "163": 24.2, // Lyngby-Taarbæk
  "165": 22.9, // Rødovre
  "167": 23.5, // Brøndby
  "169": 24.6, // Ishøj
  "170": 24.3, // Vallensbæk
  "175": 23.1, // Gladsaxe
  "183": 22.6, // Gentofte
  "185": 23.9, // Allerød
  "187": 23.0, // Furesø
  "190": 23.5, // Gribskov
  "201": 24.5, // Helsingør
  "210": 23.1, // Fredensborg
  "217": 23.5, // Hørsholm
  "223": 24.9, // Randers
  "230": 25.5, // Silkeborg
  "240": 25.8, // Skanderborg
  "250": 24.9, // Aarhus
  "260": 23.4, // Aalborg
  "265": 24.6, // Odense
  "269": 24.9, // Esbjerg
  "270": 23.9, // Kolding
  "280": 25.3, // Vejle
  "306": 25.0, // Svendborg
  "316": 24.2, // Holbæk
  "320": 24.7, // Næstved
  "326": 24.9, // Slagelse
  "329": 25.3, // Korsør
  "330": 25.1, // Holstebro
  "335": 24.8, // Struer
  "340": 25.5, // Thisted
  "350": 24.6, // Hjørring
  "360": 25.0, // Brønderslev
  "370": 25.2, // Frederikshavn
  "376": 25.4, // Læsø
  "400": 25.0, // Roskilde
  "410": 24.7, // Greve
  "420": 23.9, // Køge
  "430": 24.3, // Kalundborg
  "440": 25.2, // Ringsted
  "450": 24.5, // Sorø
  "461": 24.8, // Slagelse
  "480": 25.1, // Nakskov
  "490": 24.9, // Nykøbing F.
  "530": 24.2, // Vordingborg
  "561": 25.1, // Faaborg-Midtfyn
  "563": 24.8, // Kerteminde
  "573": 24.5, // Middelfart
  "575": 24.7, // Assens
  "579": 24.6, // Nordfyns
  "580": 25.2, // Odense
  "582": 24.4, // Svendborg
  "607": 24.3, // Haderslev
  "616": 24.8, // Sønderborg
  "621": 25.3, // Aabenraa
  "630": 24.9, // Tønder
  "657": 24.7, // Frederikssund
  "665": 24.2, // Halsnæs
  "671": 24.5, // Gribskov
  "680": 24.1, // Ebeltoft
  "700": 24.3, // Skive
  "710": 24.8, // Viborg
  "727": 25.0, // Morsø
  "730": 25.2, // Lemvig
  "740": 24.6, // Skive
  "741": 24.5, // Herning
  "742": 25.1, // Ikast-Brande
  "746": 25.3, // Ringkøbing-Skjern
  "751": 24.4, // Aarhus
  "756": 24.2, // Horsens
  "760": 24.8, // Randers
  "766": 25.1, // Grenaa
  "773": 24.6, // Samsø
  "779": 24.3, // Odder
  "787": 24.9, // Hasselager
  "791": 24.5, // Favrskov
  "793": 24.2, // Hinnerup
  "794": 24.0, // Galten
  "796": 24.4, // Ry
  "797": 24.7, // Grenaa
  "801": 23.5, // Ballerup
  "803": 23.1, // Egedal
  "806": 23.3, // Stevns
  "807": 23.6, // Solrød
  "808": 23.8, // Lejre
  "809": 23.4, // Odsherred
  "810": 23.9, // Faxe
  "811": 23.5, // Næstved
  "812": 23.8, // Vordingborg
  "813": 24.1, // Lolland
  "814": 23.6, // Guldborgsund
  "815": 24.2, // Varde
  "816": 24.0, // Billund
  "817": 24.4, // Vejen
  "818": 23.9, // Esbjerg
  "820": 24.3, // Hedensted
  "821": 24.5, // Kolding
  "822": 24.1, // Fredericia
  "823": 24.6, // Middelfart
  "824": 24.2, // Sønderborg
  "825": 24.7, // Aabenraa
  "826": 24.4, // Haderslev
  "827": 24.8, // Tønder
  "840": 25.0, // Bornholm
};

const defaultKommune = "250"; // Aarhus som standard

export default function EjendomsvaerdiskatBeregner() {
  const [ejendomsvaerdi, setEjendomsvaerdi] = useState<number>(3000000);
  const [grundvaerdi, setGrundvaerdi] = useState<number>(1000000);
  const [kommunekode, setKommunekode] = useState<string>(defaultKommune);
  const [kommuneprocent, setKommuneprocent] = useState<number>(KOMMUNE_PROcenter[defaultKommune] || 24.9);

  const handleKommuneChange = (kode: string) => {
    setKommunekode(kode);
    setKommuneprocent(KOMMUNE_PROcenter[kode] || 24.9);
  };

  const resultat = useMemo(() => {
    // Bundfradrag for ejendomsværdiskat (2024 satser)
    const bundfradrag = 3040000; // 3.040.000 kr
    
    // Ejendomsværdiskat beregning
    // 0,92% af ejendomsværdi op til 3.040.000 kr
    // 3% af ejendomsværdi over 3.040.000 kr
    let ejendomsvaerdiskat = 0;
    
    if (ejendomsvaerdi <= bundfradrag) {
      ejendomsvaerdiskat = ejendomsvaerdi * 0.0092; // 0,92%
    } else {
      // Del under bundfradraget
      const underBundfradrag = bundfradrag;
      const overBundfradrag = ejendomsvaerdi - bundfradrag;
      
      ejendomsvaerdiskat = underBundfradrag * 0.0092 + overBundfradrag * 0.03;
    }
    
    // Grundskyld beregning (kommuneprocent × grundværdi)
    const grundskyld = grundvaerdi * (kommuneprocent / 100);
    
    // Samlet ejendomsskat
    const samletEjendomsskat = ejendomsvaerdiskat + grundskyld;
    
    // Månedligt beløb
    const maanedligt = samletEjendomsskat / 12;
    
    return {
      ejendomsvaerdiskat: Math.round(ejendomsvaerdiskat),
      grundskyld: Math.round(grundskyld),
      samlet: Math.round(samletEjendomsskat),
      maanedligt: Math.round(maanedligt),
    };
  }, [ejendomsvaerdi, grundvaerdi, kommuneprocent]);

  const formatKr = (amount: number) => {
    return new Intl.NumberFormat("da-DK", {
      style: "currency",
      currency: "DKK",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Home className="inline w-4 h-4 mr-1" />
              Ejendomsværdi (kr)
            </label>
            <input
              type="number"
              min="0"
              max="50000000"
              step="50000"
              value={ejendomsvaerdi}
              onChange={(e) => setEjendomsvaerdi(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formatKr(ejendomsvaerdi)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Percent className="inline w-4 h-4 mr-1" />
              Grundværdi (kr)
            </label>
            <input
              type="number"
              min="0"
              max="20000000"
              step="25000"
              value={grundvaerdi}
              onChange={(e) => setGrundvaerdi(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formatKr(grundvaerdi)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Calculator className="inline w-4 h-4 mr-1" />
              Kommune
            </label>
            <select
              value={kommunekode}
              onChange={(e) => handleKommuneChange(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg text-lg"
            >
              <option value="101">101 - København ({KOMMUNE_PROcenter["101"]}%)</option>
              <option value="250">250 - Aarhus ({KOMMUNE_PROcenter["250"]}%)</option>
              <option value="260">260 - Aalborg ({KOMMUNE_PROcenter["260"]}%)</option>
              <option value="265">265 - Odense ({KOMMUNE_PROcenter["265"]}%)</option>
              <option value="147">147 - Frederiksberg ({KOMMUNE_PROcenter["147"]}%)</option>
              <option value="230">230 - Silkeborg ({KOMMUNE_PROcenter["230"]}%)</option>
              <option value="240">240 - Skanderborg ({KOMMUNE_PROcenter["240"]}%)</option>
              <option value="223">223 - Randers ({KOMMUNE_PROcenter["223"]}%)</option>
              <option value="270">270 - Kolding ({KOMMUNE_PROcenter["270"]}%)</option>
              <option value="280">280 - Vejle ({KOMMUNE_PROcenter["280"]}%)</option>
              <option value="201">201 - Helsingør ({KOMMUNE_PROcenter["201"]}%)</option>
              <option value="400">400 - Roskilde ({KOMMUNE_PROcenter["400"]}%)</option>
              <option value="316">316 - Holbæk ({KOMMUNE_PROcenter["316"]}%)</option>
              <option value="320">320 - Næstved ({KOMMUNE_PROcenter["320"]}%)</option>
              <option value="326">326 - Slagelse ({KOMMUNE_PROcenter["326"]}%)</option>
              <option value="210">210 - Fredensborg ({KOMMUNE_PROcenter["210"]}%)</option>
              <option value="183">183 - Gentofte ({KOMMUNE_PROcenter["183"]}%)</option>
              <option value="175">175 - Gladsaxe ({KOMMUNE_PROcenter["175"]}%)</option>
              <option value="151">151 - Dragør ({KOMMUNE_PROcenter["151"]}%)</option>
              <option value="155">155 - Albertslund ({KOMMUNE_PROcenter["155"]}%)</option>
              <option value="161">161 - Hvidovre ({KOMMUNE_PROcenter["161"]}%)</option>
              <option value="159">159 - Herlev ({KOMMUNE_PROcenter["159"]}%)</option>
              <option value="165">165 - Rødovre ({KOMMUNE_PROcenter["165"]}%)</option>
              <option value="169">169 - Ishøj ({KOMMUNE_PROcenter["169"]}%)</option>
              <option value="185">185 - Allerød ({KOMMUNE_PROcenter["185"]}%)</option>
              <option value="376">376 - Læsø ({KOMMUNE_PROcenter["376"]}%)</option>
              <option value="840">840 - Bornholm ({KOMMUNE_PROcenter["840"]}%)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Kommuneprocent: {kommuneprocent}%
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Bundfradrag:</strong> {formatKr(3040000)} for ejendomsværdiskat
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Under bundfradrag: 0,92% | Over bundfradrag: 3%
            </p>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="p-6 bg-white rounded-xl shadow-sm border">
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-1">Samlet årlig ejendomsskat</p>
          <p className="text-5xl font-bold text-blue-600">
            {formatKr(resultat.samlet)}
          </p>
          <p className="text-xl text-gray-500 mt-2">
            {formatKr(resultat.maanedligt)} / måned
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-center">
            <p className="text-sm text-purple-600 dark:text-purple-400">
              <Home className="inline w-4 h-4 mr-1" />
              Ejendomsværdiskat
            </p>
            <p className="font-bold text-2xl text-purple-700 dark:text-purple-300">
              {formatKr(resultat.ejendomsvaerdiskat)}/år
            </p>
            <p className="text-xs text-purple-500 mt-1">
              0,92% op til 3.040.000 kr, 3% over
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-center">
            <p className="text-sm text-orange-600 dark:text-orange-400">
              <Percent className="inline w-4 h-4 mr-1" />
              Grundskyld
            </p>
            <p className="font-bold text-2xl text-orange-700 dark:text-orange-300">
              {formatKr(resultat.grundskyld)}/år
            </p>
            <p className="text-xs text-orange-500 mt-1">
              {kommuneprocent}% × grundværdi
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
            <strong>Bemærk:</strong> Disse tal er estimater baseret på 2024/2025 satser. 
            Ejendomsskatten beregnes og betales via din ejendomsskattebillet fra kommunen.
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">📚 Om ejendomsskat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Ejendomsværdiskat</h4>
            <ul className="mt-2 space-y-1">
              <li>• Beregnes af ejendomsværdien</li>
              <li>• 0,92% op til bundfradraget ({formatKr(3040000)})</li>
              <li>• 3% af beløb over bundfradraget</li>
              <li>• Procentvis faldende sats for høje værdier</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300">Grundskyld</h4>
            <ul className="mt-2 space-y-1">
              <li>• Beregnes af grundværdien</li>
              <li>• Satsen varierer efter kommune</li>
              <li>• {formatKr(3040000)} i bundfradrag for 2024</li>
              <li>• Betales til din kommune</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
