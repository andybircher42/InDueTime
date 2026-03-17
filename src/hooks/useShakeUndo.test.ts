import { Platform } from "react-native";
import { act, renderHook } from "@testing-library/react-native";
import { Accelerometer } from "expo-sensors";

import useShakeUndo from "./useShakeUndo";

jest.mock("expo-sensors", () => ({
  Accelerometer: {
    setUpdateInterval: jest.fn(),
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  },
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  NotificationFeedbackType: { Success: "success" },
}));

/** Flush the dynamic import("expo-sensors") promise. */
async function flushImport() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useShakeUndo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not subscribe when disabled", async () => {
    renderHook(() => useShakeUndo(jest.fn(), false));
    await flushImport();

    expect(Accelerometer.addListener).not.toHaveBeenCalled();
  });

  it("subscribes when enabled", async () => {
    renderHook(() => useShakeUndo(jest.fn(), true));
    await flushImport();

    expect(Accelerometer.setUpdateInterval).toHaveBeenCalledWith(100);
    expect(Accelerometer.addListener).toHaveBeenCalledTimes(1);
  });

  it("removes subscription on unmount", async () => {
    const removeFn = jest.fn();
    (Accelerometer.addListener as jest.Mock).mockReturnValue({
      remove: removeFn,
    });

    const { unmount } = renderHook(() => useShakeUndo(jest.fn(), true));
    await flushImport();
    unmount();

    expect(removeFn).toHaveBeenCalledTimes(1);
  });

  it("calls onShake when acceleration exceeds threshold", async () => {
    const onShake = jest.fn();
    let listener: (data: { x: number; y: number; z: number }) => void;
    (Accelerometer.addListener as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return { remove: jest.fn() };
    });

    renderHook(() => useShakeUndo(onShake, true));
    await flushImport();

    act(() => {
      // magnitude = sqrt(2^2 + 0^2 + 0^2) = 2.0, above 1.8 threshold
      listener!({ x: 2, y: 0, z: 0 });
    });

    expect(onShake).toHaveBeenCalledTimes(1);
  });

  it("does not call onShake for gentle movement", async () => {
    const onShake = jest.fn();
    let listener: (data: { x: number; y: number; z: number }) => void;
    (Accelerometer.addListener as jest.Mock).mockImplementation((cb) => {
      listener = cb;
      return { remove: jest.fn() };
    });

    renderHook(() => useShakeUndo(onShake, true));
    await flushImport();

    act(() => {
      // magnitude = sqrt(0.5^2 + 0.5^2 + 0.5^2) ≈ 0.87, below threshold
      listener!({ x: 0.5, y: 0.5, z: 0.5 });
    });

    expect(onShake).not.toHaveBeenCalled();
  });

  it("does not subscribe on web", async () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, "OS", { value: "web", writable: true });

    renderHook(() => useShakeUndo(jest.fn(), true));
    await flushImport();

    expect(Accelerometer.addListener).not.toHaveBeenCalled();

    Object.defineProperty(Platform, "OS", {
      value: originalOS,
      writable: true,
    });
  });
});
