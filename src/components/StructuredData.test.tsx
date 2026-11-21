import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CalculatorSchema } from "./StructuredData";

function getSchema(markup: string) {
  const content = markup.match(/<script[^>]*>(.*?)<\/script>/s)?.[1];
  expect(content).toBeTruthy();
  return JSON.parse(content || "{}");
}

describe("CalculatorSchema", () => {
  test("derives Swedish provider and currency from the page URL", () => {
    const markup = renderToStaticMarkup(
      <CalculatorSchema
        name="Tidskalkylator"
        description="Beräkna tid"
        url="https://beraknare.se/tidsberegner"
      />
    );
    const schema = getSchema(markup);

    expect(schema).toMatchObject({
      inLanguage: "sv",
      offers: { priceCurrency: "SEK" },
      provider: { name: "Beräknare.se", url: "https://beraknare.se" },
    });
  });

  test("normalizes www hosts for Danish structured data", () => {
    const markup = renderToStaticMarkup(
      <CalculatorSchema
        name="BMI"
        description="BMI for voksne"
        url="https://www.minberegner.dk/bmi"
      />
    );
    const schema = getSchema(markup);

    expect(schema).toMatchObject({
      inLanguage: "da",
      offers: { priceCurrency: "DKK" },
      provider: { name: "MinBeregner.dk", url: "https://minberegner.dk" },
    });
  });

  test("preserves an explicit compatible override", () => {
    const markup = renderToStaticMarkup(
      <CalculatorSchema
        name="Test"
        description="Test"
        url="https://beraknare.se/test"
        siteName="Testkalkylator"
        currency="NOK"
      />
    );
    const schema = getSchema(markup);

    expect(schema.offers.priceCurrency).toBe("NOK");
    expect(schema.provider.name).toBe("Testkalkylator");
  });
});
