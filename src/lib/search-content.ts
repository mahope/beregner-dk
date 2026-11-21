import type { Locale } from "./i18n";

export interface SearchContent {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords?: string[];
  matchTerms?: string[];
}

const contentByLocale: Record<Locale, readonly SearchContent[]> = {
  da: [
    {
      title: "BMI for børn – percentil og alder",
      description: "BMI for mit barn forklaret med alder, køn og percentil.",
      href: "/blog/bmi-for-boern-saadan-tjekker-du",
      category: "Sundhed & Børn",
      keywords: [
        "bmi for mit barn",
        "bmi for barn",
        "bmi for børn",
        "bmi barn",
        "bmi børn",
        "percentil",
      ],
      matchTerms: ["barn", "børn", "percentil"],
    },
  ],
  no: [],
  se: [],
};

export function getSearchContent(locale: Locale): readonly SearchContent[] {
  return contentByLocale[locale];
}
