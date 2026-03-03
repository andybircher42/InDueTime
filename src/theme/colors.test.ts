import {
  darkColors,
  darkRowColors,
  lightColors,
  lightRowColors,
  monoColors,
  monoRowColors,
} from "./colors";

describe("color palettes", () => {
  it("all palettes have the same keys", () => {
    const lightKeys = Object.keys(lightColors).sort();
    const darkKeys = Object.keys(darkColors).sort();
    const monoKeys = Object.keys(monoColors).sort();
    expect(lightKeys).toEqual(darkKeys);
    expect(lightKeys).toEqual(monoKeys);
  });

  it("lightRowColors has 7 entries", () => {
    expect(lightRowColors).toHaveLength(7);
  });

  it("darkRowColors has 7 entries", () => {
    expect(darkRowColors).toHaveLength(7);
  });

  it("monoRowColors has 7 entries", () => {
    expect(monoRowColors).toHaveLength(7);
  });

  it("all row color arrays have the same length", () => {
    expect(lightRowColors.length).toBe(darkRowColors.length);
    expect(lightRowColors.length).toBe(monoRowColors.length);
  });
});
