/** Shape of the color token object. */
export type ColorTokens = {
  primary: string;
  primaryDisabled: string;
  primaryLightBg: string;
  destructive: string;
  devButton: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textLabel: string;
  textModal: string;
  textEntryRow: string;
  white: string;
  background: string;
  splashBackground: string;
  inputBackground: string;
  border: string;
  inputBorder: string;
  deleteButtonBg: string;
  modalOverlay: string;
  contentBackground: string;
  shadow: string;
  toastBackground: string;
  toastText: string;
};

/** A personality palette contains light and dark variants. */
export interface PersonalityPalette {
  light: { colors: ColorTokens; rowColors: readonly string[] };
  dark: { colors: ColorTokens; rowColors: readonly string[] };
}

/** Available theme personality styles. */
export type Personality = "classic" | "warm" | "mono";

/** Available brightness modes. */
export type Brightness = "system" | "light" | "dark";

// ---------------------------------------------------------------------------
// Classic (the original blue theme)
// ---------------------------------------------------------------------------

const classicLightColors: ColorTokens = {
  primary: "#2e78c2",
  primaryDisabled: "#7cadd4",
  primaryLightBg: "#e8f0fe",
  destructive: "#dc2626",
  devButton: "#ff6b6b",
  textPrimary: "#333",
  textSecondary: "#666",
  textTertiary: "#6b6b6b",
  textLabel: "#555",
  textModal: "#444",
  textEntryRow: "#333",
  white: "#fff",
  background: "#f5f5f5",
  splashBackground: "#f3f3f1",
  inputBackground: "#fafafa",
  border: "#e0e0e0",
  inputBorder: "#ddd",
  deleteButtonBg: "#f0f0f0",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  contentBackground: "#fff",
  shadow: "#000",
  toastBackground: "#333",
  toastText: "#fff",
};

const classicDarkColors: ColorTokens = {
  primary: "#3a84cc",
  primaryDisabled: "#2d5a88",
  primaryLightBg: "#213f60",
  destructive: "#ef4444",
  devButton: "#ff6b6b",
  textPrimary: "#e0e0e0",
  textSecondary: "#b0b0b0",
  textTertiary: "#8f8f8f",
  textLabel: "#c0c0c0",
  textModal: "#d0d0d0",
  textEntryRow: "#e0e0e0",
  white: "#fff",
  background: "#121212",
  splashBackground: "#121212",
  inputBackground: "#2a2a2a",
  border: "#333",
  inputBorder: "#444",
  deleteButtonBg: "#333",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#1e1e1e",
  shadow: "#000",
  toastBackground: "#e0e0e0",
  toastText: "#1a1a1a",
};

const classicLightRowColors = [
  "#FFF176",
  "#A5D6A7",
  "#90CAF9",
  "#B39DDB",
  "#CE93D8",
  "#EF9A9A",
  "#FFCC80",
] as const;

const classicDarkRowColors = [
  "#6B5010",
  "#1E4D23",
  "#1B4272",
  "#352063",
  "#4A1E62",
  "#6B1C1C",
  "#6E3410",
] as const;

// ---------------------------------------------------------------------------
// Warm & Confident (terracotta/amber with cream backgrounds)
// ---------------------------------------------------------------------------

const warmLightColors: ColorTokens = {
  primary: "#C06020",
  primaryDisabled: "#D4A07A",
  primaryLightBg: "#FDF0E6",
  destructive: "#C43333",
  devButton: "#ff6b6b",
  textPrimary: "#3D2E22",
  textSecondary: "#6B5744",
  textTertiary: "#8B7A6B",
  textLabel: "#5A4A3A",
  textModal: "#4A3A2A",
  textEntryRow: "#3D2E22",
  white: "#fff",
  background: "#FAF5EF",
  splashBackground: "#FAF5EF",
  inputBackground: "#FFF9F3",
  border: "#E8DDD1",
  inputBorder: "#DDD0C2",
  deleteButtonBg: "#F0E8DE",
  modalOverlay: "rgba(30, 20, 10, 0.5)",
  contentBackground: "#FFFCF8",
  shadow: "#3D2E22",
  toastBackground: "#3D2E22",
  toastText: "#FAF5EF",
};

const warmDarkColors: ColorTokens = {
  primary: "#E8864A",
  primaryDisabled: "#8B5A30",
  primaryLightBg: "#3D2A1A",
  destructive: "#EF5555",
  devButton: "#ff6b6b",
  textPrimary: "#E8DDD1",
  textSecondary: "#B5A594",
  textTertiary: "#8B7A6B",
  textLabel: "#C8B8A6",
  textModal: "#D5C8B8",
  textEntryRow: "#E8DDD1",
  white: "#fff",
  background: "#1A1410",
  splashBackground: "#1A1410",
  inputBackground: "#2E241C",
  border: "#3D3028",
  inputBorder: "#4D3F34",
  deleteButtonBg: "#3D3028",
  modalOverlay: "rgba(0, 0, 0, 0.7)",
  contentBackground: "#241C16",
  shadow: "#000",
  toastBackground: "#E8DDD1",
  toastText: "#1A1410",
};

const warmLightRowColors = [
  "#FFE0A0",
  "#C8E6B0",
  "#A8D4E8",
  "#C8B8E0",
  "#E0B0D0",
  "#E8B0A8",
  "#F0C898",
] as const;

const warmDarkRowColors = [
  "#6B4810",
  "#2A4D1E",
  "#1A3A5A",
  "#3A2858",
  "#4A1E48",
  "#5A1C1C",
  "#5A3010",
] as const;

// ---------------------------------------------------------------------------
// Mono (B&W — same palette for light and dark)
// ---------------------------------------------------------------------------

const monoColors: ColorTokens = {
  primary: "#555",
  primaryDisabled: "#aaa",
  primaryLightBg: "#e8e8e8",
  destructive: "#222",
  devButton: "#777",
  textPrimary: "#111",
  textSecondary: "#444",
  textTertiary: "#6b6b6b",
  textLabel: "#333",
  textModal: "#222",
  textEntryRow: "#111",
  white: "#fff",
  background: "#f0f0f0",
  splashBackground: "#f0f0f0",
  inputBackground: "#fafafa",
  border: "#ccc",
  inputBorder: "#bbb",
  deleteButtonBg: "#e0e0e0",
  modalOverlay: "rgba(0, 0, 0, 0.5)",
  contentBackground: "#fff",
  shadow: "#000",
  toastBackground: "#222",
  toastText: "#eee",
};

const monoRowColors = ["#f5f5f5", "#e0e0e0", "#cccccc", "#b8b8b8"] as const;

// ---------------------------------------------------------------------------
// Palettes record
// ---------------------------------------------------------------------------

/** All personality palettes indexed by personality key. */
export const palettes: Record<Personality, PersonalityPalette> = {
  classic: {
    light: { colors: classicLightColors, rowColors: classicLightRowColors },
    dark: { colors: classicDarkColors, rowColors: classicDarkRowColors },
  },
  warm: {
    light: { colors: warmLightColors, rowColors: warmLightRowColors },
    dark: { colors: warmDarkColors, rowColors: warmDarkRowColors },
  },
  mono: {
    light: { colors: monoColors, rowColors: monoRowColors },
    dark: { colors: monoColors, rowColors: monoRowColors },
  },
};

// ---------------------------------------------------------------------------
// Legacy aliases (kept for existing test imports)
// ---------------------------------------------------------------------------

export {
  classicDarkColors as darkColors,
  classicDarkRowColors as darkRowColors,
  classicLightColors as lightColors,
  classicLightRowColors as lightRowColors,
  monoColors,
  monoRowColors,
};
