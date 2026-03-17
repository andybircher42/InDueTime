import { createContext, ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import type { CelebrationStyle } from "@/components/CelebrationOverlay";

import {
  Brightness,
  ColorTokens,
  Layout,
  palettes,
  Personality,
  radii,
  RadiiTokens,
} from "./colors";

/** The effective visual brightness after resolving system preference. */
export type ResolvedTheme = "light" | "dark";

/**
 * @deprecated Use `Brightness` for the brightness axis and `Personality` for
 * the style axis. Kept temporarily for migration; will be removed.
 */
export type ThemeMode = Brightness;

interface ThemeContextValue {
  colors: ColorTokens;
  rowColors: readonly string[];
  radii: RadiiTokens;
  resolvedTheme: ResolvedTheme;
  personality: Personality;
  brightness: Brightness;
  layout: Layout;
  celebrationStyle: CelebrationStyle;
  setPersonality: (p: Personality) => void;
  setBrightness: (b: Brightness) => void;
  setLayout: (l: Layout) => void;
  setCelebrationStyle: (s: CelebrationStyle) => void;
  /** @deprecated Use `brightness` + `personality` instead. */
  themeMode: Brightness;
  /** @deprecated Use `setBrightness` instead. */
  setThemeMode: (mode: Brightness) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  personality: Personality;
  brightness: Brightness;
  layout: Layout;
  celebrationStyle: CelebrationStyle;
  setPersonality: (p: Personality) => void;
  setBrightness: (b: Brightness) => void;
  setLayout: (l: Layout) => void;
  setCelebrationStyle: (s: CelebrationStyle) => void;
  children: ReactNode;
}

/** Provides resolved theme colors to the component tree. */
export function ThemeProvider({
  personality,
  brightness,
  layout,
  celebrationStyle,
  setPersonality,
  setBrightness,
  setLayout,
  setCelebrationStyle,
  children,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const resolvedTheme: ResolvedTheme =
    brightness === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : brightness;

  const value = useMemo<ThemeContextValue>(() => {
    const palette = palettes[personality];
    const variant = palette[resolvedTheme];
    return {
      colors: variant.colors,
      rowColors: variant.rowColors,
      radii: radii[personality],
      resolvedTheme,
      personality,
      brightness,
      layout,
      celebrationStyle,
      setPersonality,
      setBrightness,
      setLayout,
      setCelebrationStyle,
      // Legacy aliases
      themeMode: brightness,
      setThemeMode: setBrightness,
    };
  }, [
    resolvedTheme,
    personality,
    brightness,
    layout,
    celebrationStyle,
    setPersonality,
    setBrightness,
    setLayout,
    setCelebrationStyle,
  ]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/** Returns the current theme colors and mode. Must be used inside ThemeProvider. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
