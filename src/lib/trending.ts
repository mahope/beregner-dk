/**
 * Returns 3 trending calculator hrefs based on the current month.
 * Seasonal relevance drives which calculators are highlighted.
 */
export function getTrendingHrefs(): string[] {
  const month = new Date().getMonth(); // 0-indexed

  if (month <= 2) {
    // Jan–Mar: årsopgørelse season
    return ["/loen-efter-skat", "/rentefradrag", "/pension"];
  }
  if (month <= 6) {
    // Apr–Jul: summer/vacation
    return ["/feriepenge", "/valuta", "/bmi"];
  }
  if (month <= 8) {
    // Aug–Sep: studiestart
    return ["/su", "/boligstoette", "/husleje"];
  }
  // Oct–Dec: year-end planning
  return ["/pension", "/opsparing", "/arveafgift"];
}
