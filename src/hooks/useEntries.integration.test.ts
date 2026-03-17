/**
 * Integration tests for useEntries: add→deliver flow, TTL cleanup,
 * removeAll scoping, and deliver undo.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";

import useEntries from "./useEntries";

beforeEach(() => {
  void AsyncStorage.clear();
  jest.useFakeTimers({ now: new Date(2026, 2, 2) });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

/** Renders the hook and returns the result ref. */
function setup() {
  return renderHook(() => useEntries()).result;
}

describe("useEntries integration: add-to-deliver flow", () => {
  it("add → verify → deliver → verify delivered → undo", () => {
    const result = setup();

    // Add an entry
    act(() => {
      result.current.add({ name: "Jordan", dueDate: "2026-06-15" });
    });

    expect(result.current.entries).toHaveLength(1);
    const id = result.current.entries[0].id;
    expect(result.current.entries[0].deliveredAt).toBeUndefined();

    // Deliver the entry
    act(() => {
      result.current.deliver(id);
    });

    expect(result.current.entries[0].deliveredAt).toBeDefined();
    expect(result.current.deliveredEntry).not.toBeNull();
    expect(result.current.deliveredEntry!.entry.name).toBe("Jordan");

    // Undo delivery
    act(() => {
      result.current.undoDeliver();
    });

    expect(result.current.entries[0].deliveredAt).toBeUndefined();
    expect(result.current.deliveredEntry).toBeNull();
  });

  it("dismissDelivered clears delivered state without undoing", () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "Alex", dueDate: "2026-06-15" });
    });

    const id = result.current.entries[0].id;

    act(() => {
      result.current.deliver(id);
    });

    expect(result.current.deliveredEntry).not.toBeNull();

    act(() => {
      result.current.dismissDelivered();
    });

    // Entry is still delivered
    expect(result.current.entries[0].deliveredAt).toBeDefined();
    // But the undo state is cleared
    expect(result.current.deliveredEntry).toBeNull();
  });

  it("deliver persists to AsyncStorage", async () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "Sam", dueDate: "2026-06-15" });
    });

    const id = result.current.entries[0].id;

    act(() => {
      result.current.deliver(id);
    });

    await waitFor(async () => {
      const stored = await AsyncStorage.getItem("@gestation_entries");
      const entries = JSON.parse(stored!);
      expect(entries[0].deliveredAt).toBeDefined();
    });
  });
});

describe("useEntries integration: removeAll scoping", () => {
  it("removeAll('expecting') keeps delivered entries", () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "Expecting1", dueDate: "2026-06-15" });
      result.current.add({ name: "Expecting2", dueDate: "2026-07-20" });
    });

    // Deliver one
    const id = result.current.entries.find((e) => e.name === "Expecting1")!.id;
    act(() => {
      result.current.deliver(id);
    });

    // Remove all expecting
    act(() => {
      result.current.removeAll("expecting");
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("Expecting1");
    expect(result.current.entries[0].deliveredAt).toBeDefined();
  });

  it("removeAll('delivered') keeps expecting entries", () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "Keep", dueDate: "2026-06-15" });
      result.current.add({ name: "Remove", dueDate: "2026-07-20" });
    });

    const id = result.current.entries.find((e) => e.name === "Remove")!.id;
    act(() => {
      result.current.deliver(id);
    });

    act(() => {
      result.current.removeAll("delivered");
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("Keep");
    expect(result.current.entries[0].deliveredAt).toBeUndefined();
  });
});

describe("useEntries integration: delivered TTL cleanup", () => {
  it("updateDeliveredTTL does NOT immediately remove delivered entries", () => {
    const result = setup();

    act(() => {
      result.current.add({ name: "Recent", dueDate: "2026-06-15" });
    });

    const id = result.current.entries[0].id;
    act(() => {
      result.current.deliver(id);
    });

    // Change TTL — should not immediately purge
    act(() => {
      result.current.updateDeliveredTTL(0);
    });

    // Entry should still be there
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].deliveredAt).toBeDefined();
  });

  it("TTL cleanup happens on load, not on TTL change", async () => {
    // Pre-populate with a delivered entry that's 5 days old
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    const data = [
      {
        id: "1",
        name: "Old",
        dueDate: "2026-06-15",
        createdAt: 1000,
        deliveredAt: fiveDaysAgo,
      },
      {
        id: "2",
        name: "Active",
        dueDate: "2026-07-20",
        createdAt: 2000,
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    await AsyncStorage.setItem("@delivered_ttl_days", "3");

    const result = setup();

    await act(async () => {
      await result.current.load();
    });

    // Old entry (5 days) should be purged with 3-day TTL
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("Active");
  });

  it("TTL=0 (never) keeps all delivered entries on load", async () => {
    const veryOld = Date.now() - 100 * 24 * 60 * 60 * 1000;
    const data = [
      {
        id: "1",
        name: "Ancient",
        dueDate: "2026-06-15",
        createdAt: 1000,
        deliveredAt: veryOld,
      },
    ];
    await AsyncStorage.setItem("@gestation_entries", JSON.stringify(data));
    await AsyncStorage.setItem("@delivered_ttl_days", "0");

    const result = setup();

    await act(async () => {
      await result.current.load();
    });

    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].name).toBe("Ancient");
  });
});
