import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://minberegner.dk";
  const lastModified = new Date();

  const beregnere = [
    // Økonomi og skat (højest prioritet)
    { url: "/loen-efter-skat", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/moms", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/dagpenge", priority: 0.9, changeFrequency: "yearly" as const },
    { url: "/pension", priority: 0.9, changeFrequency: "yearly" as const },
    { url: "/feriepenge", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/boernepenge", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/su", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/efterloen", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/barselsdagpenge", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/arveafgift", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/rentefradrag", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/procent", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/valuta", priority: 0.9, changeFrequency: "daily" as const },

    // Bolig og lån
    { url: "/boliglaan", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/laaneberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/renteberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/billaan", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/forbrugslaan", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/opsparing", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/ejendomsvaerdiskat", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/boligstoette", priority: 0.9, changeFrequency: "yearly" as const },
    { url: "/husleje", priority: 0.8, changeFrequency: "monthly" as const },

    // Sundhed
    { url: "/bmi", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/kalorier", priority: 0.9, changeFrequency: "monthly" as const },

    // Hverdag og praktisk
    { url: "/elberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/braendstof", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/bil", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/timepris", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/kvadratmeter", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/dato", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/alder", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/tidsberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/tidszone", priority: 0.8, changeFrequency: "monthly" as const },

    // Blog
    { url: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/blog/pension-hvor-meget-skal-du-spare-op", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/boligstoette-2026-nye-regler", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/bmi-for-boern-saadan-tjekker-du", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/guide-feriepenge-hvornaar-og-hvor-meget", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/saadan-beregner-du-din-reelle-timeloen", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/hvordan-beregner-man-moms", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/30-procent-reglen-husleje", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/saadan-finder-du-din-timepris-som-freelancer", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/guide-til-laan-og-renter", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/spar-penge-paa-braendstof", priority: 0.6, changeFrequency: "monthly" as const },

    // Info-sider
    { url: "/om", priority: 0.5, changeFrequency: "yearly" as const },
    { url: "/privatlivspolitik", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/cookiepolitik", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...beregnere.map((beregner) => ({
      url: `${baseUrl}${beregner.url}`,
      lastModified,
      changeFrequency: beregner.changeFrequency,
      priority: beregner.priority,
    })),
  ];
}
