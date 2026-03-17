import { fireEvent, screen } from "@testing-library/react-native";

import { setupFakeTimers, teardownFakeTimers } from "@/test/fakeTimers";
import { makeEntry } from "@/test/mockData";
import renderWithTheme from "@/test/renderWithTheme";

import EntryCard from "./EntryCard";

const defaultEntry = makeEntry({ id: "1", name: "Alice" });

describe("EntryCard", () => {
  beforeEach(() => setupFakeTimers());
  afterEach(() => teardownFakeTimers());

  it("renders entry name", () => {
    renderWithTheme(<EntryCard entry={defaultEntry} />);
    expect(screen.getByText("Alice")).toBeTruthy();
  });

  it("shows gestational age in weeks and days", () => {
    // dueDate 2026-06-15, today 2026-03-02 → 105 days until due → GA = 280-105 = 175 = 25w 0d
    renderWithTheme(<EntryCard entry={defaultEntry} />);
    expect(screen.getByText(/25w 0d/)).toBeTruthy();
  });

  it("shows formatted due date", () => {
    renderWithTheme(<EntryCard entry={defaultEntry} />);
    expect(screen.getByText(/Jun 15/)).toBeTruthy();
  });

  it("has correct accessibility label", () => {
    renderWithTheme(<EntryCard entry={defaultEntry} />);
    const card = screen.getByTestId("entry-card");
    expect(card.props.accessibilityLabel).toContain("Alice");
    expect(card.props.accessibilityLabel).toContain("25 weeks 0 days");
  });

  it("calls onPress with entry when pressed", () => {
    const onPress = jest.fn();
    renderWithTheme(<EntryCard entry={defaultEntry} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("entry-card"));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(defaultEntry);
  });

  it("calls onLongPress with entry on long press", () => {
    const onLongPress = jest.fn();
    renderWithTheme(
      <EntryCard entry={defaultEntry} onLongPress={onLongPress} />,
    );
    fireEvent(screen.getByTestId("entry-card"), "longPress");
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledWith(defaultEntry);
  });

  it("renders without crashing when onPress and onLongPress are omitted", () => {
    renderWithTheme(<EntryCard entry={defaultEntry} />);
    const card = screen.getByTestId("entry-card");
    // Should not throw when pressed without handlers
    fireEvent.press(card);
    fireEvent(card, "longPress");
    expect(card).toBeTruthy();
  });

  it("uses custom birthstone color when entry.birthstone is set", () => {
    const customEntry = makeEntry({
      id: "2",
      name: "Bob",
      birthstone: { name: "Ruby", color: "#E53935" },
    });
    renderWithTheme(<EntryCard entry={customEntry} />);
    const card = screen.getByTestId("entry-card");
    // The card style array should include the custom birthstone color
    const styles = Array.isArray(card.props.style)
      ? card.props.style
      : [card.props.style];
    const bgColors = styles
      .filter(Boolean)
      .map((s: Record<string, unknown>) => s.backgroundColor)
      .filter(Boolean);
    expect(bgColors).toContain("#E53935");
  });
});
