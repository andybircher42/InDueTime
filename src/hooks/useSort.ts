import { useCallback, useMemo, useState } from "react";

import { Entry } from "@/storage";

import {
  DEFAULT_DIR,
  SORT_FIELDS,
  type SortBy,
  type SortDir,
} from "../components/SortPickerModal";

interface UseSortOptions {
  defaultField?: SortBy;
}

/** Shared sort state and logic for entry lists. */
export default function useSort(
  entries: Entry[],
  { defaultField = "dueDate" }: UseSortOptions = {},
) {
  const [sortBy, setSortBy] = useState<SortBy>(defaultField);
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_DIR[defaultField]);

  const cycleSortField = useCallback(() => {
    setSortBy((prev) => {
      const idx = SORT_FIELDS.findIndex((f) => f.field === prev);
      const next = SORT_FIELDS[(idx + 1) % SORT_FIELDS.length];
      setSortDir(DEFAULT_DIR[next.field]);
      return next.field;
    });
  }, []);

  const toggleSortDir = useCallback(() => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  const activeEntries = useMemo(
    () => entries.filter((e) => !e.deliveredAt),
    [entries],
  );

  const sorted = useMemo(() => {
    if (sortBy === "none") {
      const copy = [...activeEntries];
      copy.sort((a, b) => b.createdAt - a.createdAt);
      return copy;
    }
    const copy = [...activeEntries];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "dueDate") {
      copy.sort((a, b) => {
        const dateDiff = b.dueDate.localeCompare(a.dueDate);
        if (dateDiff !== 0) {
          return dir * dateDiff;
        }
        return a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      });
    } else {
      copy.sort((a, b) => {
        const nameDiff = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
        if (nameDiff !== 0) {
          return dir * nameDiff;
        }
        return a.dueDate.localeCompare(b.dueDate);
      });
    }
    return copy;
  }, [activeEntries, sortBy, sortDir]);

  return { sortBy, sortDir, sorted, cycleSortField, toggleSortDir };
}
