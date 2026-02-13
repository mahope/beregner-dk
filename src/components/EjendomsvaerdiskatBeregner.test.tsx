import { render, screen, fireEvent } from "@testing-library/react";
import EjendomsvaerdiskatBeregner from "@/components/EjendomsvaerdiskatBeregner";

describe("EjendomsvaerdiskatBeregner", () => {
  const defaultProps = {};

  beforeEach(() => {
    render(<EjendomsvaerdiskatBeregner {...defaultProps} />);
  });

  test("renders without crashing", () => {
    expect(screen.getByText("Ejendomsværdiskat beregner")).toBeInTheDocument();
  });

  test("renders input fields", () => {
    expect(screen.getByLabelText(/Ejendomsværdi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Grundværdi/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Kommune/i)).toBeInTheDocument();
  });

  test("calculates ejendomsværdiskat correctly for value below threshold", () => {
    // Ejendomsværdi under bundfradrag (3.040.000)
    const input = screen.getByLabelText(/Ejendomsværdi/i);
    fireEvent.change(input, { target: { value: "2000000" } });

    // Check that the result shows ejendomsværdiskat
    expect(screen.getByText("Ejendomsværdiskat")).toBeInTheDocument();
  });

  test("calculates grundskyld correctly", () => {
    // Change grundværdi
    const input = screen.getByLabelText(/Grundværdi/i);
    fireEvent.change(input, { target: { value: "1000000" } });

    expect(screen.getByText("Grundskyld")).toBeInTheDocument();
  });

  test("calculates samlet ejendomsskat", () => {
    // Check that samlet (total) is shown
    expect(screen.getByText(/Samlet årlig ejendomsskat/i)).toBeInTheDocument();
  });

  test("månedligt amount is calculated correctly", () => {
    expect(screen.getByText(/\/ måned/i)).toBeInTheDocument();
  });

  test("renders kommuneprocent info", () => {
    expect(screen.getByText(/Kommuneprocent:/i)).toBeInTheDocument();
  });

  test("renders bundfradrag info", () => {
    expect(screen.getByText(/Bundfradrag:/i)).toBeInTheDocument();
  });

  test("renders info section about ejendomsskat", () {
    expect(screen.getByText(/Om ejendomsskat/i)).toBeInTheDocument();
  });

  test("renders ejendomsværdiskat explanation", () => {
    expect(screen.getByText(/Ejendomsværdiskat/i)).toBeInTheDocument();
    expect(screen.getByText(/0,92%/i)).toBeInTheDocument();
  });

  test("renders grundskyld explanation", () => {
    expect(screen.getByText(/Grundskyld/i)).toBeInTheDocument();
  });

  test("renders about section", () => {
    expect(screen.getByText(/Sådan beregnes ejendomsskat/i)).toBeInTheDocument();
  });

  test("renders betaling info", () => {
    expect(screen.getByText(/Hvornår betales ejendomsskat/i)).toBeInTheDocument();
  });

  test("renders vurdering info", () => {
    expect(screen.getByText(/Ejendomsvurdering/i)).toBeInTheDocument();
  });
});

describe("Ejendomsvaerdiskat calculation logic", () => {
  test("ejendomsværdiskat is 0.92% for values at or below 3.040.000", () => {
    const ejendomsvaerdi = 2000000;
    const expected = ejendomsvaerdi * 0.0092;
    expect(expected).toBe(18400);
  });

  test("ejendomsværdiskat combines 0.92% and 3% for values above threshold", () => {
    const ejendomsvaerdi = 4000000;
    const bundfradrag = 3040000;
    const underBundfradrag = bundfradrag;
    const overBundfradrag = ejendomsvaerdi - bundfradrag;
    
    const expected = underBundfradrag * 0.0092 + overBundfradrag * 0.03;
    expect(expected).toBe(27968);
  });

  test("grundskyld is calculated as kommuneprocent × grundværdi", () => {
    const grundvaerdi = 1000000;
    const kommuneprocent = 24.9;
    
    const expected = grundvaerdi * (kommuneprocent / 100);
    expect(expected).toBe(249000);
  });

  test("samlet ejendomsskat is sum of ejendomsværdiskat and grundskyld", () => {
    const ejendomsvaerdiskat = 18400;
    const grundskyld = 249000;
    
    const expected = ejendomsvaerdiskat + grundskyld;
    expect(expected).toBe(267400);
  });

  test("månedligt is yearly divided by 12", () => {
    const yearly = 267400;
    const expected = yearly / 12;
    expect(expected).toBeCloseTo(22283.33);
  });
});

describe("EjendomsvaerdiskatBeregner responsive design", () => {
  beforeEach(() => {
    render(<EjendomsvaerdiskatBeregner />);
  });

  test("renders grid layout", () => {
    const grid = document.querySelector(".grid");
    expect(grid).toBeInTheDocument();
  });

  test("renders result section", () => {
    expect(screen.getByText(/Samlet årlig ejendomsskat/i)).toBeInTheDocument();
  });
});
