import { ReactElement } from "react";
import { render } from "@testing-library/react-native";

import { ThemeMode, ThemeProvider } from "@/theme";

/**
 * Renders a component wrapped in ThemeProvider for testing.
 * Defaults to light mode.
 */
export default function renderWithTheme(
  ui: ReactElement,
  themeMode: ThemeMode = "light",
) {
  return render(
    <ThemeProvider themeMode={themeMode} setThemeMode={jest.fn()}>
      {ui}
    </ThemeProvider>,
  );
}
