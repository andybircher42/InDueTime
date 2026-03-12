import { ReactElement } from "react";
import { render } from "@testing-library/react-native";

import { Brightness, Personality, ThemeProvider } from "@/theme";

/**
 * Renders a component wrapped in ThemeProvider for testing.
 * Defaults to classic personality with light brightness.
 */
export default function renderWithTheme(
  ui: ReactElement,
  {
    personality = "classic",
    brightness = "light",
  }: { personality?: Personality; brightness?: Brightness } = {},
) {
  return render(
    <ThemeProvider
      personality={personality}
      brightness={brightness}
      setPersonality={jest.fn()}
      setBrightness={jest.fn()}
    >
      {ui}
    </ThemeProvider>,
  );
}
