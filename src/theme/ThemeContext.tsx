import { createContext, ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";

import {
  ColorTokens,
  darkColors,
  darkRowColors,
  lightColors,
  lightRowColors,
  monoColors,
  monoRowColors,
} from "./colors";

/** User-selected theme mode. */
export type ThemeMode = "system" | "light" | "dark" | "mono";

/** The effective visual theme after resolving system preference. */
export type ResolvedTheme = "light" | "dark" | "mono";

interface ThemeContextValue {
  colors: ColorTokens;
  rowColors: readonly string[];
  resolvedTheme: ResolvedTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  children: ReactNode;
}

/** Provides resolved theme colors to the component tree. */
export function ThemeProvider({
  themeMode,
  setThemeMode,
  children,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const resolvedTheme: ResolvedTheme =
    themeMode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;

  const value = useMemo<ThemeContextValue>(() => {
    const palettes: Record<
      ResolvedTheme,
      { colors: ColorTokens; rowColors: readonly string[] }
    > = {
      light: { colors: lightColors, rowColors: lightRowColors },
      dark: { colors: darkColors, rowColors: darkRowColors },
      mono: { colors: monoColors, rowColors: monoRowColors },
    };
    const { colors, rowColors } = palettes[resolvedTheme];
    return { colors, rowColors, resolvedTheme, themeMode, setThemeMode };
  }, [resolvedTheme, themeMode, setThemeMode]);

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
