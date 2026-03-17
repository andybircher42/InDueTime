import { Entry } from "@/storage";

/** Creates a test entry with sensible defaults. Override any field. */
export function makeEntry(
  fields: Omit<Entry, "dueDate" | "createdAt"> & {
    dueDate?: string;
    createdAt?: number;
  },
): Entry {
  return {
    dueDate: "2026-06-15",
    createdAt: 1000,
    birthstone: { name: "Pearl", color: "#B0B8E8" },
    birthFlower: { name: "Rose", color: "#C8465C" },
    symbolType: "gem",
    ...fields,
  };
}

/** Shared mock entry used across toast tests. dueDate 2026-09-11 → 12w3d when today is 2026-03-02. */
export const mockEntry: Entry = {
  id: "1",
  name: "Sam",
  dueDate: "2026-09-11",
  createdAt: 1000,
  birthstone: { name: "Sapphire", color: "#1565C0" },
  birthFlower: { name: "Aster", color: "#9B72B0" },
  symbolType: "gem",
};
