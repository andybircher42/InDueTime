import { Entry } from "@/storage";

/** Creates a test entry with sensible defaults. Override any field. */
export function makeEntry(
  fields: Omit<Entry, "dueDate" | "createdAt"> & {
    dueDate?: string;
    createdAt?: number;
  },
): Entry {
  return { dueDate: "2026-06-15", createdAt: 1000, ...fields };
}

/** Shared mock entry used across toast tests. dueDate 2026-09-11 → 12w3d when today is 2026-03-02. */
export const mockEntry: Entry = {
  id: "1",
  name: "Sam",
  dueDate: "2026-09-11",
  createdAt: 1000,
};
