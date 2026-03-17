import { contrastText } from "./contrastText";

describe("contrastText", () => {
  it("returns white for dark backgrounds", () => {
    expect(contrastText("#000000")).toBe("#ffffff");
    expect(contrastText("#1565C0")).toBe("#ffffff"); // Sapphire
    expect(contrastText("#8B2252")).toBe("#ffffff"); // Scorpio
    expect(contrastText("#5A6E4E")).toBe("#ffffff"); // Capricorn
  });

  it("returns dark for light backgrounds", () => {
    expect(contrastText("#ffffff")).toBe("#1a1a1a");
    expect(contrastText("#F5F5F0")).toBe("#1a1a1a"); // Daisy
    expect(contrastText("#F8F0E8")).toBe("#1a1a1a"); // Lily
    expect(contrastText("#F5D547")).toBe("#1a1a1a"); // Daffodil
    expect(contrastText("#F0E060")).toBe("#1a1a1a"); // Narcissus
  });

  it("returns white for medium-dark colors", () => {
    expect(contrastText("#7B68AE")).toBe("#ffffff"); // Violet
    expect(contrastText("#C8465C")).toBe("#ffffff"); // Rose
    expect(contrastText("#D14B4B")).toBe("#ffffff"); // Aries
  });

  it("handles colors without hash", () => {
    expect(contrastText("000000")).toBe("#ffffff");
    expect(contrastText("ffffff")).toBe("#1a1a1a");
  });

  it("handles mid-gray correctly", () => {
    expect(contrastText("#808080")).toBe("#ffffff");
    expect(contrastText("#B0B0B0")).toBe("#1a1a1a");
  });

  it("handles every symbol color without crashing", () => {
    // All birthstone, flower, and zodiac colors
    const colors = [
      "#D81B7A",
      "#8B44CC",
      "#00D4D4",
      "#29B6F6",
      "#3A9A6A",
      "#B0B8E8",
      "#E53935",
      "#6EE635",
      "#1565C0",
      "#F5C48A",
      "#FFA000",
      "#1E88E5",
      "#E8A0B0",
      "#7B68AE",
      "#F5D547",
      "#F5F5F0",
      "#F8F0E8",
      "#C8465C",
      "#6A8EC7",
      "#E06060",
      "#9B72B0",
      "#E8A030",
      "#D4A040",
      "#F0E060",
      "#5A6E4E",
      "#4A90D9",
      "#7BAED4",
      "#D14B4B",
      "#6B8E5A",
      "#E8C547",
      "#B0B8D8",
      "#8B7355",
      "#D4A0C0",
      "#8B2252",
      "#7B4DAA",
    ];
    for (const c of colors) {
      const result = contrastText(c);
      expect(result === "#ffffff" || result === "#1a1a1a").toBe(true);
    }
  });
});
