import * as Sentry from "@sentry/nextjs";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import ErrorPage from "./error";

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("root error page", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("renders Danish fallback text without LocaleProvider", async () => {
    const error = new Error("boom");

    render(<ErrorPage error={error} reset={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Noget gik galt" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("Der opstod en uventet fejl. Prøv at genindlæse siden.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Prøv igen" })).toBeInTheDocument();
    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledWith(error));
  });
});
