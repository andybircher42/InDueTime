import { Text } from "react-native";
import * as RN from "react-native";
import { render, screen } from "@testing-library/react-native";

import { Brightness, Personality } from "./colors";
import { palettes } from "./colors";
import { ThemeProvider, useTheme } from "./ThemeContext";

function TestConsumer() {
  const { colors, resolvedTheme, personality, brightness } = useTheme();
  return (
    <>
      <Text testID="bg">{colors.background}</Text>
      <Text testID="theme">{resolvedTheme}</Text>
      <Text testID="personality">{personality}</Text>
      <Text testID="brightness">{brightness}</Text>
    </>
  );
}

const noopSet = jest.fn();

/** Renders TestConsumer in a ThemeProvider with given personality + brightness. */
function renderTheme(personality: Personality, brightness: Brightness) {
  return render(
    <ThemeProvider
      personality={personality}
      brightness={brightness}
      layout="compact"
      setPersonality={noopSet}
      setBrightness={noopSet}
      setLayout={noopSet}
    >
      <TestConsumer />
    </ThemeProvider>,
  );
}

describe("ThemeContext", () => {
  it("provides classic light colors when classic+light", () => {
    renderTheme("classic", "light");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.classic.light.colors.background,
    );
    expect(screen.getByTestId("theme").props.children).toBe("light");
    expect(screen.getByTestId("personality").props.children).toBe("classic");
  });

  it("provides classic dark colors when classic+dark", () => {
    renderTheme("classic", "dark");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.classic.dark.colors.background,
    );
    expect(screen.getByTestId("theme").props.children).toBe("dark");
  });

  it("provides warm light colors when warm+light", () => {
    renderTheme("warm", "light");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.warm.light.colors.background,
    );
    expect(screen.getByTestId("personality").props.children).toBe("warm");
  });

  it("provides warm dark colors when warm+dark", () => {
    renderTheme("warm", "dark");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.warm.dark.colors.background,
    );
  });

  it("provides elegant light colors when elegant+light", () => {
    renderTheme("elegant", "light");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.elegant.light.colors.background,
    );
    expect(screen.getByTestId("personality").props.children).toBe("elegant");
  });

  it("provides playful dark colors when playful+dark", () => {
    renderTheme("playful", "dark");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.playful.dark.colors.background,
    );
    expect(screen.getByTestId("personality").props.children).toBe("playful");
  });

  it("provides modern light colors when modern+light", () => {
    renderTheme("modern", "light");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.modern.light.colors.background,
    );
    expect(screen.getByTestId("personality").props.children).toBe("modern");
  });

  it("provides mono colors when mono+light", () => {
    renderTheme("mono", "light");

    expect(screen.getByTestId("bg").props.children).toBe(
      palettes.mono.light.colors.background,
    );
  });

  it("resolves system brightness using useColorScheme", () => {
    jest.spyOn(RN, "useColorScheme").mockReturnValue("dark");

    renderTheme("classic", "system");

    expect(screen.getByTestId("theme").props.children).toBe("dark");

    jest.restoreAllMocks();
  });

  it("defaults to light when system returns null", () => {
    jest.spyOn(RN, "useColorScheme").mockReturnValue(null);

    renderTheme("classic", "system");

    expect(screen.getByTestId("theme").props.children).toBe("light");

    jest.restoreAllMocks();
  });

  it("useTheme throws outside ThemeProvider", () => {
    // Suppress console.error for expected error
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      "useTheme must be used within a ThemeProvider",
    );

    spy.mockRestore();
  });
});
