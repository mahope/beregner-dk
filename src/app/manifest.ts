import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MinBeregner.dk - Gratis online beregnere",
    short_name: "MinBeregner",
    description:
      "33+ gratis online beregnere til danskere. Løn, skat, moms, BMI, lån og meget mere.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
