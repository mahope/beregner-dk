import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDomainConfig } from "@/lib/domain-config";
import { LocaleProvider } from "./LocaleProvider";
import MomsCvrPanel from "./MomsCvrPanel";

const CVR = "39413892";

function renderPanel(locale: "da" | "se" = "da") {
  return render(
    <LocaleProvider locale={locale} domainConfig={getDomainConfig(locale === "da" ? "localhost" : "beraknare.se")}>
      <MomsCvrPanel />
    </LocaleProvider>,
  );
}

const cvrFelt = () => screen.getByLabelText("CVR-nummer");
const samtykkeFelt = () => screen.queryByRole("checkbox");
const sendt = () => JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));

function svar(body: unknown, status = 200) {
  vi.mocked(fetch).mockImplementation(async () => new Response(JSON.stringify(body), { status }));
}

const FUNDET = {
  tilgaengelig: true,
  fundet: true,
  cvr: CVR,
  navn: "Mahope",
  momsregistreret: true,
  momsperiode: "kvartal",
  momsperiodeKilde: "omsaetning",
  omsaetning: 6_000_000,
  laert: false,
};

describe("MomsCvrPanel", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "1");
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("renders nothing with the flag off", () => {
    vi.stubEnv("NEXT_PUBLIC_MOMS_CVR", "0");
    const { container } = renderPanel();
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing outside the Danish locale", () => {
    const { container } = renderPanel("se");
    expect(container).toBeEmptyDOMElement();
  });

  it("does not call the API without a CVR and points to the error", () => {
    renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    expect(fetch).not.toHaveBeenCalled();
    expect(cvrFelt()).toHaveAttribute("aria-invalid", "true");
    expect(cvrFelt()).toHaveAccessibleDescription(/Skriv et CVR-nummer/);
    expect(cvrFelt()).toHaveFocus();
  });

  it("does not call the API with an invalid CVR", () => {
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: "39413893" } });
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/skal være 8 cifre og gyldigt/)).toBeInTheDocument();
  });

  it("shows the unticked consent box only once a CVR is entered", () => {
    renderPanel();
    expect(samtykkeFelt()).toBeNull();
    fireEvent.change(cvrFelt(), { target: { value: "3941" } });
    expect(samtykkeFelt()).toBeNull();
    fireEvent.change(cvrFelt(), { target: { value: "3941 3892" } });
    expect(samtykkeFelt()).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Det er min virksomhed/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Læs mere" })).toHaveAttribute("href", "/privatlivspolitik#cvr");
  });

  it("sends samtykke false when the box is not ticked and shows the result", async () => {
    svar(FUNDET);
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: CVR } });
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    await screen.findByText("Momsregistreret");
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/cvr");
    expect(sendt()).toEqual({ cvr: CVR, samtykke: false });
    expect(screen.getByText("Kvartalsvis")).toBeInTheDocument();
    expect(screen.getByText(/mellem 5 og 50 mio\. kr\./)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Næste momsfrister/ })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByRole("button", { name: /Hent fristerne til din kalender/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Slet vores virksomheds netværk" })).toBeNull();
    await waitFor(() => expect(screen.getByRole("heading", { name: /Mahope/ })).toHaveFocus());
  });

  it("sends samtykke true when ticked and offers withdrawal when learned", async () => {
    svar({ ...FUNDET, laert: true });
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: CVR } });
    fireEvent.click(samtykkeFelt()!);
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    await screen.findByText("Momsregistreret");
    expect(sendt()).toEqual({ cvr: CVR, samtykke: true });
    expect(screen.getByRole("link", { name: "Slet vores virksomheds netværk" })).toHaveAttribute(
      "href",
      "https://cvrradar.dk/slet-netvaerk",
    );
  });

  it("unticks consent when the CVR changes", () => {
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: CVR } });
    fireEvent.click(samtykkeFelt()!);
    expect(samtykkeFelt()).toBeChecked();
    fireEvent.change(cvrFelt(), { target: { value: "10150817" } });
    expect(samtykkeFelt()).not.toBeChecked();
  });

  it("shows no deadlines for a company that is not VAT registered", async () => {
    svar({ ...FUNDET, momsregistreret: false });
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: CVR } });
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    await screen.findByText("Ikke momsregistreret");
    expect(screen.queryByRole("button", { name: /kalender/ })).toBeNull();
  });

  it("keeps working when cvrradar is unavailable", async () => {
    svar({ tilgaengelig: false });
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: CVR } });
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    expect(await screen.findByText(/Momsberegneren virker stadig/)).toBeInTheDocument();
  });

  it("sets no cookies and stores nothing locally", async () => {
    svar({ ...FUNDET, laert: true });
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    renderPanel();
    fireEvent.change(cvrFelt(), { target: { value: CVR } });
    fireEvent.click(samtykkeFelt()!);
    fireEvent.click(screen.getByRole("button", { name: "Vis momsstatus" }));
    await screen.findByText("Momsregistreret");
    expect(document.cookie).toBe("");
    expect(setItem).not.toHaveBeenCalled();
    expect(vi.mocked(fetch).mock.calls[0][1]?.credentials).toBe("omit");
  });
});
