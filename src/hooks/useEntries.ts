import { useCallback, useState } from "react";

import { Entry, loadEntries, saveEntries } from "@/storage";

/**
 * Manages entry CRUD operations, persistence, and undo state.
 * Call `load()` during app init to hydrate entries from storage.
 */
export default function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [deletedEntry, setDeletedEntry] = useState<{
    entry: Entry;
    previousEntries: Entry[];
  } | null>(null);

  /** Hydrates entries from AsyncStorage. Call once during app initialization. */
  const load = useCallback(async () => {
    const stored = await loadEntries();
    setEntries(stored);
  }, []);

  const add = ({ name, dueDate }: { name: string; dueDate: string }) => {
    const entry: Entry = {
      id: Date.now().toString(),
      name,
      dueDate,
    };
    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error("Failed to save entries", e),
    );
  };

  const remove = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error("Failed to save entries", e),
    );
    if (entry) {
      setDeletedEntry({ entry, previousEntries: entries });
    }
  };

  const removeAll = () => {
    setEntries([]);
    saveEntries([]).catch((e) => console.error("Failed to clear entries", e));
  };

  const seed = (seeded: Entry[]) => {
    const newEntries = [...seeded, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries).catch((e) =>
      console.error("Failed to save seeded entries", e),
    );
  };

  const undo = useCallback(() => {
    if (deletedEntry) {
      setEntries(deletedEntry.previousEntries);
      saveEntries(deletedEntry.previousEntries).catch((e) =>
        console.error("Failed to restore entries", e),
      );
      setDeletedEntry(null);
    }
  }, [deletedEntry]);

  const dismissUndo = useCallback(() => {
    setDeletedEntry(null);
  }, []);

  return {
    entries,
    deletedEntry,
    load,
    add,
    remove,
    removeAll,
    seed,
    undo,
    dismissUndo,
  };
}
