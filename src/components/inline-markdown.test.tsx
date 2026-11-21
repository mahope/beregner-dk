import { describe, expect, test } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderInlineMarkdown, stripInlineMarkdown } from "./inline-markdown";

describe("renderInlineMarkdown", () => {
  test("løfter **fed** til <strong> og lader resten stå", () => {
    expect(
      renderToStaticMarkup(<p>{renderInlineMarkdown("til den **første skoledag** i august")}</p>)
    ).toBe("<p>til den <strong>første skoledag</strong> i august</p>");
  });

  test("fjerner ikke et ensomt stjernepar", () => {
    expect(
      renderToStaticMarkup(<p>{renderInlineMarkdown("2 * 3 = 6 og 4 ** 2 = 16")}</p>)
    ).toBe("<p>2 * 3 = 6 og 4 ** 2 = 16</p>");
  });
});

describe("stripInlineMarkdown", () => {
  test("efterlader ordene uden markøren", () => {
    expect(stripInlineMarkdown("den **sidste lørdag i juni** (loven)")).toBe(
      "den sidste lørdag i juni (loven)"
    );
  });
});
