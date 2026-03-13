import { fireEvent, screen } from "@testing-library/react-native";

import renderWithTheme from "@/test/renderWithTheme";

import DevToolbar, { generateSeedEntries } from "./DevToolbar";

describe("generateSeedEntries", () => {
  it("returns 10 entries", () => {
    const entries = generateSeedEntries();
    expect(entries).toHaveLength(10);
  });

  it("assigns unique ids to each entry", () => {
    const entries = generateSeedEntries();
    const ids = entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(10);
  });

  it("assigns distinct names to each entry", () => {
    const entries = generateSeedEntries();
    const names = entries.map((e) => e.name);
    expect(new Set(names).size).toBe(10);
  });

  it("each entry has a valid ISO date string", () => {
    const entries = generateSeedEntries();
    for (const entry of entries) {
      expect(entry.dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("produces different names across calls", () => {
    const names1 = generateSeedEntries().map((e) => e.name);
    let foundDifference = false;
    for (let i = 0; i < 20; i++) {
      const names2 = generateSeedEntries().map((e) => e.name);
      if (JSON.stringify(names1) !== JSON.stringify(names2)) {
        foundDifference = true;
        break;
      }
    }
    expect(foundDifference).toBe(true);
  });

  it("produces different due dates across calls", () => {
    const dates1 = generateSeedEntries().map((e) => e.dueDate);
    let foundDifference = false;
    for (let i = 0; i < 20; i++) {
      const dates2 = generateSeedEntries().map((e) => e.dueDate);
      if (JSON.stringify(dates1) !== JSON.stringify(dates2)) {
        foundDifference = true;
        break;
      }
    }
    expect(foundDifference).toBe(true);
  });
});

describe("DevToolbar", () => {
  const defaultProps = {
    visible: true,
    onSeedData: jest.fn(),
    onResetAgreement: jest.fn(),
    onClose: jest.fn(),
  };

  it("renders Seed Data and Reset HIPAA buttons when visible", () => {
    renderWithTheme(<DevToolbar {...defaultProps} />);

    expect(screen.getByText("Seed Data")).toBeTruthy();
    expect(screen.getByText("Reset HIPAA")).toBeTruthy();
  });

  it("calls onSeedData with entries and closes when Seed Data is pressed", () => {
    const onSeedData = jest.fn();
    const onClose = jest.fn();
    renderWithTheme(
      <DevToolbar
        {...defaultProps}
        onSeedData={onSeedData}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText("Seed Data"));

    expect(onSeedData).toHaveBeenCalledTimes(1);
    const entries = onSeedData.mock.calls[0][0];
    expect(entries).toHaveLength(10);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onResetAgreement and closes when Reset HIPAA is pressed", () => {
    const onResetAgreement = jest.fn();
    const onClose = jest.fn();
    renderWithTheme(
      <DevToolbar
        {...defaultProps}
        onResetAgreement={onResetAgreement}
        onClose={onClose}
      />,
    );

    fireEvent.press(screen.getByText("Reset HIPAA"));

    expect(onResetAgreement).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
