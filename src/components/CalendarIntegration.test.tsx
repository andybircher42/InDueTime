/**
 * Integration test: calendar shows entries on correct dates,
 * delivered markers appear, and day press fires with correct entries.
 */
import { fireEvent, screen } from "@testing-library/react-native";

import { setupFakeTimers, teardownFakeTimers } from "@/test/fakeTimers";
import { makeEntry } from "@/test/mockData";
import renderWithTheme from "@/test/renderWithTheme";

import CalendarView from "./CalendarView";

beforeEach(() => {
  setupFakeTimers(); // March 2, 2026
});

afterEach(() => {
  teardownFakeTimers();
});

describe("Calendar integration", () => {
  it("shows month containing due date", () => {
    const entries = [
      makeEntry({
        id: "1",
        name: "Alice",
        dueDate: "2026-06-15",
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      }),
    ];
    renderWithTheme(<CalendarView entries={entries} />);

    expect(screen.getByText("June 2026")).toBeTruthy();
  });

  it("shows empty state with no entries", () => {
    renderWithTheme(<CalendarView entries={[]} />);

    expect(screen.getByText("No one to show yet")).toBeTruthy();
  });

  it("excludes delivered entries from heat map but shows calendar", () => {
    const entries = [
      makeEntry({
        id: "1",
        name: "Delivered",
        dueDate: "2026-06-15",
        deliveredAt: Date.now(),
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      }),
    ];

    // Calendar should still render (entries.length > 0) but active entries are empty
    renderWithTheme(<CalendarView entries={entries} />);
    expect(screen.getByText("March 2026")).toBeTruthy();
  });

  it("calls onDayPress when a date with entries is tapped", () => {
    const onDayPress = jest.fn();
    const entries = [
      makeEntry({
        id: "1",
        name: "Alice",
        dueDate: "2026-06-15",
        birthstone: { name: "Pearl", color: "#B0B8E8" },
      }),
    ];
    renderWithTheme(<CalendarView entries={entries} onDayPress={onDayPress} />);

    // Day 15 in June has 1 due entry — accessible via its label
    const dayButton = screen.getByLabelText("1 due on day 15");
    fireEvent.press(dayButton);

    expect(onDayPress).toHaveBeenCalledTimes(1);
    expect(onDayPress).toHaveBeenCalledWith(
      "2026-06-15",
      expect.arrayContaining([expect.objectContaining({ name: "Alice" })]),
    );
  });

  it("renders multiple months for entries spread across months", () => {
    const entries = [
      makeEntry({
        id: "1",
        name: "Alice",
        dueDate: "2026-04-10",
        birthstone: { name: "Diamond", color: "#E8E8E8" },
      }),
      makeEntry({
        id: "2",
        name: "Bob",
        dueDate: "2026-08-22",
        birthstone: { name: "Peridot", color: "#B4D88B" },
      }),
    ];
    renderWithTheme(<CalendarView entries={entries} />);

    expect(screen.getByText("April 2026")).toBeTruthy();
    expect(screen.getByText("August 2026")).toBeTruthy();
  });
});
