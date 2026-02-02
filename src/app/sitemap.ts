import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://minberegner.dk";
  const lastModified = new Date();

  const beregnere = [
    { url: "/bmi", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/loen-efter-skat", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/renteberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/laaneberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/moms", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/valuta", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/procent", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/opsparing", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/elberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/braendstof", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/kalorier", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/dato", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/feriepenge", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/boernepenge", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/su", priority: 0.8, changeFrequency: "yearly" as const },
    { url: "/dagpenge", priority: 0.9, changeFrequency: "yearly" as const },
    { url: "/boligstoette", priority: 0.9, changeFrequency: "yearly" as const },
    { url: "/alder", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/timepris", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/kvadratmeter", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/husleje", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/tidszone", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/tidsberegner", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/blog", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/blog/hvordan-beregner-man-moms", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/30-procent-reglen-husleje", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog/saadan-finder-du-din-timepris-som-freelancer", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/om", priority: 0.5, changeFrequency: "yearly" as const },
    { url: "/privatlivspolitik", priority: 0.3, changeFrequency: "yearly" as const },
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
