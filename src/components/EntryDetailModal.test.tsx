import { fireEvent, screen } from "@testing-library/react-native";

import { setupFakeTimers, teardownFakeTimers } from "@/test/fakeTimers";
import { makeEntry } from "@/test/mockData";
import renderWithTheme from "@/test/renderWithTheme";
import { getBirthstone } from "@/util";

import EntryDetailModal from "./EntryDetailModal";

const onClose = jest.fn();

const baseEntry = makeEntry({ id: "1", name: "Sam", dueDate: "2026-06-15" });

const entryWithBirthstone = makeEntry({
  id: "2",
  name: "Sam",
  dueDate: "2026-06-15",
  birthstone: getBirthstone(6),
});

const deliveredEntry = makeEntry({
  id: "3",
  name: "Sam",
  dueDate: "2026-06-15",
  deliveredAt: new Date(2026, 5, 13).getTime(), // Jun 13 → 2d early
  birthstone: getBirthstone(6),
});

describe("EntryDetailModal", () => {
  beforeEach(() => {
    setupFakeTimers();
    onClose.mockClear();
  });

  afterEach(() => {
    teardownFakeTimers();
  });

  it("returns null for null entry", () => {
    const { toJSON } = renderWithTheme(
      <EntryDetailModal entry={null} onClose={onClose} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("shows entry name", () => {
    renderWithTheme(<EntryDetailModal entry={baseEntry} onClose={onClose} />);
    expect(screen.getByText("Sam")).toBeTruthy();
  });

  it("shows due date", () => {
    renderWithTheme(<EntryDetailModal entry={baseEntry} onClose={onClose} />);
    expect(screen.getByText("Jun 15")).toBeTruthy();
  });

  it("shows gestational age for non-delivered entry", () => {
    renderWithTheme(<EntryDetailModal entry={baseEntry} onClose={onClose} />);
    expect(screen.getByText("Gestational age")).toBeTruthy();
    expect(screen.getByText("25w 0d")).toBeTruthy();
  });

  it("shows birthstone name when birthstone is set", () => {
    renderWithTheme(
      <EntryDetailModal entry={entryWithBirthstone} onClose={onClose} />,
    );
    expect(screen.getByText("Birthstone")).toBeTruthy();
    expect(screen.getByText("Pearl")).toBeTruthy();
  });

  it("close button calls onClose", () => {
    renderWithTheme(<EntryDetailModal entry={baseEntry} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("backdrop press calls onClose", () => {
    renderWithTheme(<EntryDetailModal entry={baseEntry} onClose={onClose} />);
    fireEvent.press(screen.getByLabelText("Close details"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("delivered entry shows baby emoji", () => {
    renderWithTheme(
      <EntryDetailModal entry={deliveredEntry} onClose={onClose} />,
    );
    expect(screen.getByText("👶")).toBeTruthy();
  });

  it("delivered entry shows timing label", () => {
    renderWithTheme(
      <EntryDetailModal entry={deliveredEntry} onClose={onClose} />,
    );
    expect(screen.getByText("Timing")).toBeTruthy();
    expect(screen.getByText("2d early")).toBeTruthy();
  });

  it("delivered entry hides gestational age", () => {
    renderWithTheme(
      <EntryDetailModal entry={deliveredEntry} onClose={onClose} />,
    );
    expect(screen.queryByText("Gestational age")).toBeNull();
  });

  it("delivered entry shows delivered date", () => {
    renderWithTheme(
      <EntryDetailModal entry={deliveredEntry} onClose={onClose} />,
    );
    expect(screen.getByText("Delivered")).toBeTruthy();
    expect(screen.getByText("Jun 13, 2026")).toBeTruthy();
  });
});
