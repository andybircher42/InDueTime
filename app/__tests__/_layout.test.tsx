import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, render, screen, waitFor } from "@testing-library/react-native";

const mockReplace = jest.fn();

jest.mock("expo-router", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    useRouter: () => ({
      replace: mockReplace,
      push: jest.fn(),
      back: jest.fn(),
    }),
    Slot: () => <Text testID="slot-content">Slot</Text>,
  };
});

import * as storage from "@/storage";

import splashBgDark from "../../assets/splash-bg-dark.png";
import splashBgLight from "../../assets/splash-bg-light.png";
import splashLogoLight from "../../assets/splash-icon.png";
import splashLogoDark from "../../assets/splash-icon-dark.png";
import RootLayout from "../_layout";

const Updates = jest.requireMock<{
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
}>("expo-updates");

const originalConsoleError = console.error;

beforeEach(() => {
  void AsyncStorage.clear();
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
  mockReplace.mockClear();
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].includes("not wrapped in act")) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  console.error = originalConsoleError;
});

/** Pre-accept HIPAA + onboarding so the app goes straight to main UI. */
async function skipToMainUI() {
  await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
  await AsyncStorage.setItem("@onboarding_complete", "true");
}

describe("RootLayout", () => {
  // First render pays module-compilation cost; needs extended timeout.
  it("shows splash then renders slot after loading", async () => {
    await skipToMainUI();
    render(<RootLayout />);
    expect(screen.getByTestId("splash-logo")).toBeTruthy();
    expect(screen.queryByTestId("slot-content")).toBeNull();

    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.getByTestId("slot-content")).toBeTruthy();
    });
  }, 20_000);

  it("routes to /welcome when agreement not accepted", async () => {
    render(<RootLayout />);

    await act(async () => {});

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/welcome");
    });
  });

  it("routes to /welcome when onboarding not complete", async () => {
    await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
    render(<RootLayout />);

    await act(async () => {});

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/welcome");
    });
  });

  it("does not update state after unmount", async () => {
    let resolveAgreement: (v: boolean) => void;
    jest.spyOn(storage, "checkAgreement").mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAgreement = resolve;
        }),
    );

    const errorSpy = jest.spyOn(console, "error");

    const { unmount } = render(<RootLayout />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    unmount();

    await act(async () => {
      resolveAgreement!(false);
    });

    const stateUpdateErrors = errorSpy.mock.calls.filter(
      (args) => typeof args[0] === "string" && args[0].includes("unmounted"),
    );
    expect(stateUpdateErrors).toHaveLength(0);
  });

  it("uses dark splash logo in dark mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "dark");
    render(<RootLayout />);
    // Flush init so theme loads while splash is still visible
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-logo").props.source).toBe(
        splashLogoDark,
      );
    });
  });

  it("uses light splash logo in light mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "light");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-logo").props.source).toBe(
        splashLogoLight,
      );
    });
  });

  it("uses dark splash background in dark mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "dark");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgDark);
    });
  });

  it("uses light splash background in light mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_brightness", "light");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgLight);
    });
  });

  it("uses light splash background in mono mode", async () => {
    await skipToMainUI();
    await AsyncStorage.setItem("@theme_personality", "mono");
    await AsyncStorage.setItem("@theme_brightness", "light");
    render(<RootLayout />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByTestId("splash-bg").props.source).toBe(splashBgLight);
    });
  });

  describe("OTA update during splash", () => {
    beforeEach(() => {
      (globalThis as unknown as Record<string, boolean>).__DEV__ = false;
      Updates.checkForUpdateAsync.mockReset();
      Updates.fetchUpdateAsync.mockReset();
      Updates.reloadAsync.mockReset();
    });

    afterEach(() => {
      (globalThis as unknown as Record<string, boolean>).__DEV__ = true;
    });

    it("reloads if update is fetched while still on splash screen", async () => {
      await skipToMainUI();
      Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
      Updates.fetchUpdateAsync.mockResolvedValue({});
      Updates.reloadAsync.mockResolvedValue(undefined);

      render(<RootLayout />);

      await waitFor(() => {
        expect(Updates.reloadAsync).toHaveBeenCalled();
      });
    });

    it("does not reload if update finishes after splash screen ends", async () => {
      await skipToMainUI();
      let resolveFetch!: () => void;
      Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
      Updates.fetchUpdateAsync.mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveFetch = resolve;
          }),
      );

      render(<RootLayout />);

      await waitFor(() => {
        expect(Updates.fetchUpdateAsync).toHaveBeenCalled();
      });

      // Advance past splash screen before resolving the fetch
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await act(async () => {
        resolveFetch();
      });

      expect(Updates.reloadAsync).not.toHaveBeenCalled();
    });

    it("does not fetch or reload when no update is available", async () => {
      await skipToMainUI();
      Updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });

      render(<RootLayout />);

      await waitFor(() => {
        expect(Updates.checkForUpdateAsync).toHaveBeenCalled();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
      expect(Updates.reloadAsync).not.toHaveBeenCalled();
    });
  });
});
