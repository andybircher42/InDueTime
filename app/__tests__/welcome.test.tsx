import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
  Slot: () => null,
}));

import renderWithTheme from "../../src/test/renderWithTheme";
import WelcomeScreen from "../welcome";

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

describe("WelcomeScreen", () => {
  it("shows HIPAA agreement on first launch", async () => {
    renderWithTheme(<WelcomeScreen />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getAllByText(/HIPAA/).length).toBeGreaterThan(0);
    });
  });

  it("shows onboarding after HIPAA acceptance", async () => {
    renderWithTheme(<WelcomeScreen />);
    await act(async () => {});

    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));

    await act(async () => {});

    // The onboarding text is in the DOM (animated opacity), so it's findable
    await waitFor(() => {
      expect(
        screen.getByText("You'll support dozens of families this year."),
      ).toBeTruthy();
    });
  });

  it("completes onboarding and routes to home", async () => {
    renderWithTheme(<WelcomeScreen />);
    await act(async () => {});

    // Accept HIPAA
    await waitFor(() => {
      expect(screen.getByText("I Agree")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("I Agree"));
    await act(async () => {});

    // Wait for "Get Started" button (appears after all lines: (4+1)*1200 = 6000ms)
    act(() => {
      jest.advanceTimersByTime(7000);
    });

    await waitFor(() => {
      expect(screen.getByText("Get Started")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("Get Started"));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });

  it("skips to onboarding when agreement already accepted", async () => {
    await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
    renderWithTheme(<WelcomeScreen />);
    await act(async () => {});

    await waitFor(() => {
      expect(
        screen.getByText("You'll support dozens of families this year."),
      ).toBeTruthy();
    });
  });

  it("routes to home when both already complete", async () => {
    await AsyncStorage.setItem("@hipaa_agreement_accepted", "true");
    await AsyncStorage.setItem("@onboarding_complete", "true");
    renderWithTheme(<WelcomeScreen />);
    await act(async () => {});

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/");
    });
  });
});
