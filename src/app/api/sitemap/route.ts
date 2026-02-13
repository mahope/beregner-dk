import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = "https://minberegner.dk";
  const lastModified = new Date().toISOString().split("T")[0];

  const beregnere = [
    { url: "/bmi", priority: 0.9, changeFrequency: "monthly" },
    { url: "/loen-efter-skat", priority: 0.9, changeFrequency: "monthly" },
    { url: "/renteberegner", priority: 0.9, changeFrequency: "monthly" },
    { url: "/laaneberegner", priority: 0.9, changeFrequency: "monthly" },
    { url: "/moms", priority: 0.9, changeFrequency: "monthly" },
    { url: "/valuta", priority: 0.9, changeFrequency: "daily" },
    { url: "/procent", priority: 0.9, changeFrequency: "monthly" },
    { url: "/opsparing", priority: 0.9, changeFrequency: "monthly" },
    { url: "/elberegner", priority: 0.9, changeFrequency: "monthly" },
    { url: "/braendstof", priority: 0.9, changeFrequency: "monthly" },
    { url: "/kalorier", priority: 0.9, changeFrequency: "monthly" },
    { url: "/dato", priority: 0.9, changeFrequency: "monthly" },
    { url: "/feriepenge", priority: 0.8, changeFrequency: "monthly" },
    { url: "/boernepenge", priority: 0.8, changeFrequency: "yearly" },
    { url: "/su", priority: 0.8, changeFrequency: "yearly" },
    { url: "/dagpenge", priority: 0.9, changeFrequency: "yearly" },
    { url: "/boligstoette", priority: 0.9, changeFrequency: "yearly" },
    { url: "/alder", priority: 0.8, changeFrequency: "monthly" },
    { url: "/timepris", priority: 0.8, changeFrequency: "monthly" },
    { url: "/kvadratmeter", priority: 0.8, changeFrequency: "monthly" },
    { url: "/husleje", priority: 0.8, changeFrequency: "monthly" },
    { url: "/tidszone", priority: 0.8, changeFrequency: "monthly" },
    { url: "/tidsberegner", priority: 0.9, changeFrequency: "monthly" },
    { url: "/pension", priority: 0.8, changeFrequency: "yearly" },
    { url: "/barselsdagpenge", priority: 0.8, changeFrequency: "yearly" },
    { url: "/efterloen", priority: 0.8, changeFrequency: "yearly" },
    { url: "/rentefradrag", priority: 0.8, changeFrequency: "yearly" },
    { url: "/boliglaan", priority: 0.9, changeFrequency: "monthly" },
    { url: "/bil", priority: 0.8, changeFrequency: "monthly" },
    { url: "/blog", priority: 0.7, changeFrequency: "weekly" },
    { url: "/blog/hvordan-beregner-man-moms", priority: 0.6, changeFrequency: "monthly" },
    { url: "/blog/30-procent-reglen-husleje", priority: 0.6, changeFrequency: "monthly" },
    { url: "/blog/saadan-finder-du-din-timepris-som-freelancer", priority: 0.6, changeFrequency: "monthly" },
    { url: "/om", priority: 0.5, changeFrequency: "yearly" },
    { url: "/privatlivspolitik", priority: 0.3, changeFrequency: "yearly" },
    { url: "/cookiepolitik", priority: 0.3, changeFrequency: "yearly" },
  ];

  const urls = [
    {
      loc: baseUrl,
      lastmod: lastModified,
      changefreq: "weekly",
      priority: "1.0",
    },
    ...beregnere.map((b) => ({
      loc: `${baseUrl}${b.url}`,
      lastmod: lastModified,
      changefreq: b.changeFrequency,
      priority: b.priority.toFixed(1),
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
