import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";

import useThemePreference from "./useThemePreference";

beforeEach(() => {
  void AsyncStorage.clear();
});

/** Stores a value, renders the hook, loads preference, and returns result. */
async function setupWithStored(value: string) {
  await AsyncStorage.setItem("@theme_mode", value);
  const { result } = renderHook(() => useThemePreference());
  await act(async () => {
    await result.current.loadThemePreference();
  });
  return result;
}

describe("useThemePreference", () => {
  it("defaults to system mode", () => {
    const { result } = renderHook(() => useThemePreference());
    expect(result.current.themeMode).toBe("system");
  });

  it("hydrates stored theme mode", async () => {
    const result = await setupWithStored("dark");
    expect(result.current.themeMode).toBe("dark");
  });

  it("hydrates mono theme mode", async () => {
    const result = await setupWithStored("mono");
    expect(result.current.themeMode).toBe("mono");
  });

  it("persists theme mode when set", async () => {
    const { result } = renderHook(() => useThemePreference());

    act(() => {
      result.current.setThemeMode("light");
    });

    expect(result.current.themeMode).toBe("light");

    const stored = await AsyncStorage.getItem("@theme_mode");
    expect(stored).toBe("light");
  });

  it("falls back to system on invalid stored value", async () => {
    const result = await setupWithStored("invalid");
    expect(result.current.themeMode).toBe("system");
  });
});
