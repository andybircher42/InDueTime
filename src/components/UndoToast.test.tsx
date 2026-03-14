import { act, fireEvent, screen } from "@testing-library/react-native";

import { setupFakeTimers, teardownFakeTimers } from "@/test/fakeTimers";
import { mockEntry } from "@/test/mockData";
import renderWithTheme from "@/test/renderWithTheme";

import { mockInsets } from "../../jest.setup";
import UndoToast from "./UndoToast";

/** Renders UndoToast with defaults for onUndo/onDismiss. Returns the mocks. */
function renderToast(
  overrides: { onUndo?: jest.Mock; onDismiss?: jest.Mock } = {},
) {
  const onUndo = overrides.onUndo ?? jest.fn();
  const onDismiss = overrides.onDismiss ?? jest.fn();
  renderWithTheme(
    <UndoToast entry={mockEntry} onUndo={onUndo} onDismiss={onDismiss} />,
  );
  return { onUndo, onDismiss };
}

describe("UndoToast", () => {
  beforeEach(() => {
    setupFakeTimers();
  });

  afterEach(() => {
    teardownFakeTimers();
    mockInsets.bottom = 0;
  });

  it("displays the deleted entry details", () => {
    renderToast();
    expect(screen.getByText("Removed Sam (12w 3d)")).toBeTruthy();
  });

  it("is announced by screen readers as an alert", () => {
    renderToast();
    const toast = screen.getByTestId("undo-toast");
    expect(toast.props.accessibilityRole).toBe("alert");
    expect(toast.props.accessibilityLiveRegion).toBe("polite");
    expect(toast.props.accessibilityLabel).toBe("Removed Sam, 12 weeks 3 days");
  });

  it("shows an Undo button", () => {
    renderToast();
    expect(screen.getByText("Undo")).toBeTruthy();
  });

  it("calls onUndo when Undo is pressed", () => {
    const { onUndo } = renderToast();
    fireEvent.press(screen.getByText("Undo"));
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss after 5 seconds", () => {
    const { onDismiss } = renderToast();

    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not call onDismiss before 5 seconds", () => {
    const { onDismiss } = renderToast();

    act(() => {
      jest.advanceTimersByTime(4999);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("applies safe area bottom inset to positioning", () => {
    mockInsets.bottom = 34;
    renderToast();

    const toast = screen.getByTestId("undo-toast");
    const flatStyle = Array.isArray(toast.props.style)
      ? Object.assign({}, ...toast.props.style.flat())
      : toast.props.style;
    // max(34, 16) + 16 = 50
    expect(flatStyle.bottom).toBe(50);
  });
});
